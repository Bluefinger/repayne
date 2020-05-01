import style from "./base.scss";
import { Supervisor } from "./Supervisor";
import { SwatchComponent, SwatchView } from "./Swatch";
import { injectCss } from "./utils/styleInject";
injectCss(style);
const dynContent = document.getElementsByClassName("app");

if (dynContent.length) {
  const container = new Supervisor();
  const swatchApp = dynContent.namedItem("swatch-app");
  if (swatchApp) {
    container.register(SwatchComponent());
    container.render(SwatchView(), swatchApp);
  }
  const galleryApp = dynContent.namedItem("gallery-div");
  if (galleryApp) {
    import("./Gallery").then(({ GalleryComponent, GalleryView }) => {
      container.register(GalleryComponent());
      container.render(GalleryView(), galleryApp);
    });
  }
}
