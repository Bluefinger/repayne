import type { GalleryActions } from "./GalleryTypes";
import { fromDOMEvent, filter, map, Stream } from "rythe";

const galleryControlKeys = /^(Tab|Arrow(?:Left|Right)|Escape)$/;
const galleryControlFilter = (ev: KeyboardEvent) =>
  galleryControlKeys.test(ev.key);
export const enterKey = (event: KeyboardEvent): boolean =>
  event.key === "Enter";

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
