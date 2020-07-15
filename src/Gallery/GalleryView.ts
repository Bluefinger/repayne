import { html, TemplateResult } from "lit-html";
import type { ViewFn } from "../Supervisor";
import type { GalleryState, GalleryActions } from "./GalleryTypes";
import { classMap } from "lit-html/directives/class-map";
import { live } from "lit-html/directives/live.js";

const loadedImages = new Set<string>();

const load = function (this: HTMLImageElement) {
  this.classList.remove("loading");
  this.parentElement?.classList.remove("changing");
  loadedImages.add(this.src);
};

const renderImage = (src: string, hasLoaded: boolean) =>
  html`<img
    class=${live(hasLoaded ? "gallery-image" : "gallery-image loading")}
    alt=""
    src=${src}
    @load=${load}
  />`;

export const GalleryView = (
  id = "gallery"
): ViewFn<GalleryState, GalleryActions> => (
  state: GalleryState,
  actions: GalleryActions
): TemplateResult => {
  const gallery = state[id];
  const hidden = gallery.showing == null;
  const src =
    (gallery.showing != null && gallery.slides[gallery.showing].src) || "";
  const hasLoaded = loadedImages.has(src);
  return html`<div
    class=${classMap({
      gallery: true,
      hidden,
    })}
    aria-label="Image Gallery"
    aria-modal="true"
    role="dialog"
  >
    ${gallery.showing != null
      ? html`<div
            class=${live(
              hasLoaded ? "gallery-slide" : "gallery-slide changing"
            )}
          >
            ${renderImage(src, hasLoaded)}
            <div class="gallery-img-description">
              ${gallery.slides[gallery.showing].description}
            </div>
          </div>
          <button
            class="gallery-prev"
            @click=${actions.prev}
            aria-labelledby="gallery-icon-prev"
          >
            <svg
              class="icon medium"
              role="img"
              aria-labelledby="gallery-icon-prev"
            >
              <title id="gallery-icon-prev">Previous</title>
              <use xlink:href="/js/sprites.svg#chevron-left"></use>
            </svg>
          </button>
          <button
            class="gallery-next"
            @click=${actions.next}
            aria-labelledby="gallery-icon-next"
          >
            <svg
              class="icon medium"
              role="img"
              aria-labelledby="gallery-icon-next"
            >
              <title id="gallery-icon-next">Next</title>
              <use xlink:href="/js/sprites.svg#chevron-right"></use>
            </svg>
          </button>
          <button
            class="gallery-close"
            @click=${actions.close}
            aria-labelledby="gallery-icon-close"
          >
            <svg
              class="icon medium"
              role="img"
              aria-labelledby="gallery-icon-close"
            >
              <title id="gallery-icon-close">Close</title>
              <use xlink:href="/js/sprites.svg#times-circle"></use>
            </svg>
          </button>`
      : null}
  </div>`;
};
