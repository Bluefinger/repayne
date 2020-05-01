import { html } from "lit-html";
import type { ViewFn } from "../Supervisor";
import type { GalleryState, GalleryActions } from "./GalleryTypes";
import { classMap } from "lit-html/directives/class-map";
import { until } from "lit-html/directives/until";

const cachedImages: {
  [img: string]: string;
} = Object.create(null);

const blobify = (r: Response) => r.blob();

const cacheImage = (src: string) => (blob: Blob) =>
  (cachedImages[src] = URL.createObjectURL(blob));

const resolveImage = (src: string) =>
  cachedImages[src] || fetch(src).then(blobify).then(cacheImage(src));

const renderImage = (src: string) =>
  html`<img class="gallery-image" alt="" src=${src} />`;

const getImage = (src: string) =>
  Promise.resolve(src).then(resolveImage).then(renderImage);

export const GalleryView = (
  id = "gallery"
): ViewFn<GalleryState, GalleryActions> => (state, actions) => {
  const gallery = state[id];
  return html`<div
    class=${classMap({
      gallery: true,
      hidden: gallery.showing == null,
    })}
  >
    ${gallery.showing != null
      ? html`<div class="gallery-slide">
          ${until(
            getImage(gallery.slides[gallery.showing].src),
            html`<div class="gallery-loading">Loading...</div>`
          )}
          <div class="gallery-img-description">
            ${gallery.slides[gallery.showing].description}
          </div>
        </div>`
      : null}
    <button class="gallery-prev" @click=${actions.prev}>Prev</button>
    <button class="gallery-next" @click=${actions.next}>Next</button>
    <button class="gallery-close" @click=${actions.close}>Close</button>
  </div>`;
};
