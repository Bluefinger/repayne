import "./base.scss";
import "@fortawesome/fontawesome-free/svgs/brands/github.svg";
import "@fortawesome/fontawesome-free/svgs/brands/linkedin.svg";
import "@fortawesome/fontawesome-free/svgs/regular/times-circle.svg";
import "@fortawesome/fontawesome-free/svgs/solid/chevron-left.svg";
import "@fortawesome/fontawesome-free/svgs/solid/chevron-right.svg";
import "./icons/javascript.svg";
import "./icons/typescript.svg";
import "./icons/rust.svg";
import "./icons/css3.svg";
import { lazyHandler } from "./LazyLoader";
import { importCss, injectCss } from "./utils/styleInject";
import type { GalleryState, GalleryActions } from "./Gallery";
import type { FilterState, FilterActions } from "./FilterBar";

const findClass = <T extends Element>(classname: string) =>
  document.getElementsByClassName(classname) as HTMLCollectionOf<T>;

const dynContent = findClass("app");

type AppState = GalleryState & FilterState;
type AppActions = GalleryActions & FilterActions;

if (dynContent.length) {
  const app = import("./App").then(({ createAppContainer }) =>
    createAppContainer<AppState, AppActions>()
  );

  const galleryApp = dynContent.namedItem("gallery-div");
  if (galleryApp) {
    const gallery = import("./Gallery");
    void app.then(({ render, register }) =>
      gallery.then(({ GalleryComponent, GalleryView, GalleryCss }) => {
        injectCss(GalleryCss);
        register(GalleryComponent());
        render(GalleryView(), galleryApp);
      })
    );
  }

  const filterApp = dynContent.namedItem("filter-bar");
  if (filterApp) {
    const filter = import("./FilterBar");
    const filterable = document.querySelectorAll(".filterable-item");
    void app.then(({ render, register }) =>
      filter.then(({ FilterComponent, FilterView, FilterCss }) => {
        injectCss(FilterCss);
        register(FilterComponent(filterable));
        render(FilterView(), filterApp);
      })
    );
  }
}

const LAZY_CLASS = "lazyload";
const lazyImages = findClass<HTMLImageElement>(LAZY_CLASS);
if (lazyImages.length) {
  lazyHandler(lazyImages, (element, options) => {
    const lazyImage = element;
    if (lazyImage.dataset.src) {
      lazyImage.src = lazyImage.dataset.src;
      lazyImage.addEventListener(
        "load",
        () => lazyImage.classList.remove(LAZY_CLASS),
        options
      );
    }
    if (lazyImage.dataset.srcset) lazyImage.srcset = lazyImage.dataset.srcset;
  });
}

const syntax = document.querySelectorAll<HTMLElement>("pre > code");
if (syntax.length) {
  const highlight = import("./Syntax");
  void import("highlight.js/styles/vs2015.css").then(importCss);
  void highlight.then(({ initHighlighting }) => {
    initHighlighting(syntax, lazyHandler);
  });
}

if (findClass("spinny-container").length) {
  void import("./spinny.scss").then(importCss);
}
