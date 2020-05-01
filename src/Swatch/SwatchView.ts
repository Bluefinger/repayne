import type { ViewFn } from "../Supervisor";
import { html } from "lit-html";
import { classMap } from "lit-html/directives/class-map";
import { SwatchState, SwatchActions } from "./SwatchTypes";
import styles from "./swatch.scss";
import { injectCss } from "../utils/styleInject";

injectCss(styles);

export const SwatchView = (
  id = "swatch"
): ViewFn<SwatchState, SwatchActions> => (state, actions) => {
  const swatch = state[id];
  return html`<div class="swatch-picker">
    ${swatch.themes.map(
      (theme) =>
        html`<div
          class=${classMap({
            "swatch-theme": true,
            active: theme === swatch.selected,
            loading: theme === swatch.selected && swatch.loading,
            [theme]: true,
          })}
          @click=${theme !== swatch.selected
            ? () => actions.pickTheme(theme)
            : null}
        ></div>`
    )}
  </div>`;
};
