import type { ViewFn } from "../App";
import { html, TemplateResult } from "lit-html";
import { classMap } from "lit-html/directives/class-map";
import { SwatchState, SwatchActions } from "./SwatchTypes";
import "./swatch.scss";

export const SwatchView = (): ViewFn<SwatchState, SwatchActions> => (
  { swatch }: SwatchState,
  actions: SwatchActions
): TemplateResult =>
  html`<div class="swatch-picker">
    ${swatch.themes.map(
      (theme) =>
        html`<div
          class=${classMap({
            "swatch-theme": true,
            active: theme === swatch.selected,
            loading: theme === swatch.loading,
            [theme]: true,
          })}
          @click=${theme !== swatch.selected
            ? () => actions.pickTheme(theme)
            : null}
        ></div>`
    )}
  </div>`;
