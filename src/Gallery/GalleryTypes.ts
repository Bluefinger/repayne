export type GalleryState = {
  [gallery: string]: {
    slides: GallerySlide[];
    showing: number | null;
    initialised: boolean;
    loading: boolean;
    loaded: number[];
  };
};

export type GalleryActions = {
  show: (src: string) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
};

export interface GallerySlide {
  readonly element: Element;
  readonly src: string;
  readonly description: string | null;
}
