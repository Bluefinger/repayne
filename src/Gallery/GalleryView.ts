import { html } from "lit-html";
import type { ViewFn } from "../Supervisor";
import type { GalleryState, GalleryActions } from "./GalleryTypes";
import { classMap } from "lit-html/directives/class-map";
import { until } from "lit-html/directives/until";
import { cache } from "lit-html/directives/cache.js";

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
  const hidden = gallery.showing == null;
  return html`<div
    class=${classMap({
      gallery: true,
      hidden,
    })}
    aria-label="Image Gallery"
    aria-modal="true"
    role="dialog"
  >
    ${cache(
      gallery.showing != null
        ? html`<div class="gallery-slide">
              ${until(
                getImage(gallery.slides[gallery.showing].src),
                html`<div class="gallery-loading">Loading...</div>`
              )}
              <div class="gallery-img-description">
                ${gallery.slides[gallery.showing].description}
              </div>
            </div>
            <button class="gallery-prev" @click=${actions.prev}>
              <svg
                class="icon medium"
                aria-labelledby="gallery-icon-prev"
                role="img"
              >
                <title id="gallery-icon-prev">Previous</title>
                <use xlink:href="/js/sprites.svg#chevron-left"></use>
              </svg>
            </button>
            <button class="gallery-next" @click=${actions.next}>
              <svg
                class="icon medium"
                aria-labelledby="gallery-icon-next"
                role="img"
              >
                <title id="gallery-icon-next">Next</title>
                <use xlink:href="/js/sprites.svg#chevron-right"></use>
              </svg>
            </button>
            <button class="gallery-close" @click=${actions.close}>
              <svg
                class="icon medium"
                aria-labelledby="gallery-icon-close"
                role="img"
              >
                <title id="gallery-icon-close">Close</title>
                <use xlink:href="/js/sprites.svg#times-circle"></use>
              </svg>
            </button>`
        : null
    )}
  </div>`;
};
