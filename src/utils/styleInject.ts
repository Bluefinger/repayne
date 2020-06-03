export const injectCss = (css: string, style?: HTMLStyleElement) => {
  if (!css || typeof window === "undefined") {
    throw new Error("Can't inject");
  }
  if (!style) {
    style = document.createElement("style");
    style.setAttribute("type", "text/css");
    document.head.appendChild(style);
  }
  style.innerText = css;
  return style;
};

export const importCss = ({ css }: typeof import("*.scss")) => injectCss(css);
