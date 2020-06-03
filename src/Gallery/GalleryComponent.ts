import type { Stream } from "rythe";
import type { Component } from "../Supervisor";
import type { GalleryState, GalleryActions } from "./GalleryTypes";
import { galleryInit, makeCaptureStream } from "./GalleryUtils";

const empty = {};

let capture: Stream<KeyboardEvent> | null;
let lastFocusedElement: HTMLElement | null;

export const GalleryComponent = (
  id = "gallery"
): Component<GalleryState, GalleryActions> => ({
  id,
  initial: () => ({
    [id]: {
      initialised: false,
      slides: [],
      showing: null,
      loading: false,
      loaded: [],
    },
  }),
  actions: (updater) => ({
    show: (src: string) => {
      updater({
        [id]: (state) => {
          const showing = state.slides.findIndex((slide) => slide.src === src);
          return {
            ...state,
            showing: showing >= 0 ? showing : null,
          };
        },
      });
    },
    close: () => {
      updater({
        [id]: {
          showing: null,
        },
      });
    },
    next: () => {
      updater({
        [id]: (state) => {
          const slides = state.slides;
          let showing = state.showing;
          if (showing != null) {
            showing = slides.length === ++showing ? 0 : showing;
          }
          return {
            ...state,
            showing,
          };
        },
      });
    },
    prev: () => {
      updater({
        [id]: (state) => {
          const slides = state.slides;
          let showing = state.showing;
          if (showing != null) {
            showing = --showing < 0 ? slides.length - 1 : showing;
          }
          return {
            ...state,
            showing,
          };
        },
      });
    },
  }),
  service: ({ state }) => {
    const gallery = state[id];
    if (!gallery.initialised) {
      return galleryInit(id);
    } else if (gallery.showing !== null) {
      if (!capture) {
        lastFocusedElement = document.querySelector<HTMLElement>(":focus");
        lastFocusedElement?.blur();
        return {
          next: ({ actions }) => {
            capture = makeCaptureStream(actions);
          },
        };
      }
    } else if (capture) {
      capture.end(true);
      capture = null;
      if (lastFocusedElement) {
        lastFocusedElement.focus();
        lastFocusedElement = null;
      }
    }
    return empty;
  },
});
