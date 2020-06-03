import "./base.scss";
import "./Swatch/swatch.scss";
import "@fortawesome/fontawesome-free/svgs/brands/github.svg";
import "@fortawesome/fontawesome-free/svgs/brands/linkedin.svg";
import "@fortawesome/fontawesome-free/svgs/regular/times-circle.svg";
import "@fortawesome/fontawesome-free/svgs/solid/chevron-left.svg";
import "@fortawesome/fontawesome-free/svgs/solid/chevron-right.svg";
import "./icons/javascript.svg";
import "./icons/typescript.svg";
import "./icons/rust.svg";
import "./icons/css3.svg";
import { importCss, injectCss } from "./utils/styleInject";

const findClass = (classname: string) =>
  document.getElementsByClassName(classname);

const dynContent = findClass("app");

if (dynContent.length) {
  const app = import("./Supervisor").then(({ Supervisor }) => new Supervisor());

  const swatchApp = dynContent.namedItem("swatch-app");
  if (swatchApp) {
    const swatch = import("./Swatch");
    app.then((container) =>
      swatch.then(({ SwatchComponent, SwatchView }) => {
        container.register(SwatchComponent());
        container.render(SwatchView(), swatchApp);
      })
    );
  }

  const galleryApp = dynContent.namedItem("gallery-div");
  if (galleryApp) {
    const gallery = import("./Gallery");
    app.then((container) =>
      gallery.then(({ GalleryComponent, GalleryView, GalleryCss }) => {
        injectCss(GalleryCss);
        container.register(GalleryComponent());
        container.render(GalleryView(), galleryApp);
      })
    );
  }

  const filterApp = dynContent.namedItem("filter-bar");
  if (filterApp) {
    const filter = import("./FilterBar");
    const filterable = document.querySelectorAll(".filterable-item");
    app.then((container) => {
      filter.then(({ FilterComponent, FilterView, FilterCss }) => {
        injectCss(FilterCss);
        container.register(FilterComponent(filterable));
        container.render(FilterView(), filterApp);
      });
    });
  }
}

if (findClass("highlight").length) {
  import("./chroma.scss").then(importCss);
}

if (findClass("spinny-container").length) {
  import("./spinny.scss").then(importCss);
}
