import { fromDOMEvent, map, merge, filter } from "rythe";
import type { Component } from "../Supervisor";
import type {
  GalleryState,
  GalleryActions,
  GallerySlide,
} from "./GalleryTypes";

const empty = {};

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
      const elements = document.querySelectorAll(`a[data-${id}]`);
      const slides: GallerySlide[] = [];
      elements.forEach((element) => {
        const src = element.getAttribute("href");
        const description = element.getAttribute(`data-${id}-description`);
        if (src) {
          slides.push({
            element,
            src,
            description,
          });
        }
      });
      return {
        state: {
          [id]: {
            initialised: true,
            slides,
          },
        },
        next: slides.length
          ? ({ actions }) => {
              const enterKey = (event: KeyboardEvent) => event.key === "Enter";
              const slideEvents = slides.map(({ element, src }) =>
                merge(
                  fromDOMEvent<MouseEvent>(element, "click"),
                  fromDOMEvent<KeyboardEvent>(element, "keypress").pipe(
                    filter(enterKey)
                  )
                ).pipe(
                  map((event) => {
                    event.preventDefault();
                    return src;
                  })
                )
              );
              merge(...slideEvents).pipe(map(actions.show));
            }
          : undefined,
      };
    }
    return empty;
  },
});
