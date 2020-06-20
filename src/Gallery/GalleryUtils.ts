import type {
  GallerySlide,
  GalleryState,
  GalleryActions,
} from "./GalleryTypes";
import { merge, fromDOMEvent, filter, map, Stream } from "rythe";
import type { NextContext, ServiceResult } from "../Supervisor";

const galleryControlKeys = /^(Tab|Arrow(?:Left|Right)|Escape)$/;
const galleryControlFilter = (ev: KeyboardEvent) =>
  galleryControlKeys.test(ev.key);
const enterKey = (event: KeyboardEvent) => event.key === "Enter";

export const galleryInit = (
  id: string
): ServiceResult<GalleryState, GalleryActions> => {
  const elements = document.querySelectorAll(`a[data-${id}]`);
  const slides: GallerySlide[] = [];
  elements.forEach((element) => {
    const src = element.getAttribute("href");
    const description = element.getAttribute(`data-gallery-description`);
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
      ? ({ actions }: NextContext<GalleryState, GalleryActions>) => {
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
          merge(...slideEvents).pipe(map(actions.show));
        }
      : undefined,
  };
};

export const makeCaptureStream = (
  actions: GalleryActions
): Stream<KeyboardEvent> => {
  const capture = fromDOMEvent<KeyboardEvent>(document, "keydown");
  capture.pipe(
    filter(galleryControlFilter),
    map((event) => {
      event.preventDefault();
      switch (event.key) {
        case "Tab":
          if (event.shiftKey) {
            actions.prev();
          } else {
            actions.next();
          }
          break;
        case "ArrowLeft":
          actions.prev();
          break;
        case "ArrowRight":
          actions.next();
          break;
        case "Escape":
          actions.close();
          break;
      }
    })
  );
  return capture;
};
