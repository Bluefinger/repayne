import type { Component } from "../App";
import type {
  GalleryState,
  GalleryActions,
  GallerySlide,
} from "./GalleryTypes";
import { enterKey, makeCaptureStream } from "./GalleryUtils";
import { merge, fromDOMEvent, filter, map, Stream } from "rythe";

export const GalleryComponent = (
  id = "gallery"
): Component<GalleryState, GalleryActions> => {
  let capture: Stream<KeyboardEvent> | null;
  let lastFocusedElement: HTMLElement | null;
  let events: Stream<void> | undefined;
  return {
    id,
    initial: (): GalleryState => {
      const elements = document.querySelectorAll(`a[data-${id}]`);
      const slides: GallerySlide[] = [];
      for (const element of elements) {
        const src = element.getAttribute("href");
        const description = element.getAttribute(`data-gallery-description`);
        if (src) {
          slides.push({
            element,
            src,
            description,
          });
        }
      }
      return {
        [id]: {
          slides,
          showing: null,
        },
      };
    },
    actions: (updater) => ({
      show: (src: string) => {
        updater({
          [id]: ({ slides }) => {
            const showing = slides.findIndex((slide) => slide.src === src);
            return {
              slides,
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
          [id]: ({ slides, showing }) => {
            if (showing != null) {
              showing = ++showing === slides.length ? 0 : showing;
            }
            return {
              slides,
              showing,
            };
          },
        });
      },
      prev: () => {
        updater({
          [id]: ({ slides, showing }) => {
            if (showing != null) {
              showing = --showing < 0 ? slides.length - 1 : showing;
            }
            return {
              slides,
              showing,
            };
          },
        });
      },
    }),
    effects: (_, actions) => (state) => {
      const { slides, showing } = state[id];
      if (!events && slides.length) {
        const slideEvents = slides.map(({ element, src }) =>
          merge(
            fromDOMEvent<MouseEvent>(element, "click"),
            fromDOMEvent<KeyboardEvent>(element, "keydown").pipe(
              filter(enterKey)
            )
          ).pipe(
            map((event) => {
              event.preventDefault();
              return src;
            })
          )
        );
        events = merge(...slideEvents).pipe(map(actions.show));
      } else if (events) {
        if (!capture && showing != null) {
          lastFocusedElement = document.querySelector<HTMLElement>(":focus");
          lastFocusedElement?.blur();
          capture = makeCaptureStream(actions);
        } else if (capture && showing == null) {
          capture.end(true);
          capture = null;
          if (lastFocusedElement) {
            lastFocusedElement.focus();
            lastFocusedElement = null;
          }
        }
      }
    },
  };
};
