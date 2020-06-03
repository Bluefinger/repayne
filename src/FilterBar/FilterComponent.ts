import type { Component } from "../Supervisor";
import type { FilterState, FilterActions } from "./FilterTypes";

const empty = Object.freeze({});

const toggleClick = (value: 0 | 1) => (value ? 0 : 1);

export const FilterComponent = (
  filterable: NodeListOf<Element>,
  id = "filterbar"
): Component<FilterState, FilterActions> => ({
  id,
  initial: () => {
    const filters = new Set<string>();
    filterable.forEach((item) => {
      for (const filter of item.classList.values()) {
        if (filter.startsWith("type-")) {
          filters.add(filter.slice(5));
        }
      }
    });
    return {
      [id]: {
        filters: [...filters],
        selected: null,
        clicked: 0,
      },
    };
  },
  actions: (updater) => ({
    filterBy: (ev, type) => {
      ev.preventDefault();
      updater({
        [id]: {
          selected: (current) =>
            current === type || type === "none" ? null : type,
          clicked: toggleClick,
        },
      });
    },
  }),
  service: ({ state, prevState }) => {
    const filter = state[id];
    const prevFilter = prevState[id];
    if (filter.clicked !== prevFilter.clicked) {
      filterable.forEach((item) => {
        item.classList.remove("hiding", "active");
        item.setAttribute("aria-hidden", "false");
        if (filter.selected) {
          if (item.classList.contains(`type-${filter.selected}`)) {
            item.classList.add("active");
          } else {
            item.classList.add("hiding");
            item.setAttribute("aria-hidden", "true");
          }
        }
      });
    }
    return empty;
  },
});
