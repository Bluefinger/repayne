import { html } from "lit-html";
import { FilterState, FilterActions } from "./FilterTypes";
import { ViewFn } from "../Supervisor";
import { classMap } from "lit-html/directives/class-map";

const listeners = Object.create(null) as Record<
  string,
  (ev: MouseEvent) => void
>;

const getClickHandler = (
  type: string,
  action: (ev: MouseEvent, type: string) => void
) => listeners[type] || (listeners[type] = (ev) => action(ev, type));

const filterButton = (
  actions: FilterActions,
  type: string,
  active: boolean,
  disable?: boolean,
  label?: string
) => {
  return html`<button
    class=${classMap({
      filter: true,
      active,
    })}
    @click=${getClickHandler(type, actions.filterBy)}
    data-filter="${type}"
    aria-pressed="${active}"
    type="button"
    ?disabled=${disable}
  >
    ${label || type}
  </button>`;
};

export const FilterView = (
  id = "filterbar"
): ViewFn<FilterState, FilterActions> => (state, actions) => {
  const filterState = state[id];
  const active = filterState.selected;
  return html`
    ${filterButton(
      actions,
      "none",
      !active,
      active == null,
      "Show all"
    )}${filterState.filters.map((filter) =>
      filterButton(actions, filter, filter === active)
    )}
  `;
};
