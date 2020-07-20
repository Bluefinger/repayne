import type { Component } from "../Supervisor";
import type { FilterState, FilterActions } from "./FilterTypes";
import { alphabetical, toggleClick, applyFilter } from "./FilterFns";
import { map, uniqueMap, filter, flatten } from "../utils/iterables";

const empty = Object.freeze({});

export const FilterComponent = (
  filterable: NodeListOf<Element>,
  id = "filterbar"
): Component<FilterState, FilterActions> => ({
  id,
  initial: () => {
    const collectFilters = uniqueMap(
      filter(
        flatten(map(filterable, (item) => item.classList.values())),
        (item) => item.startsWith("type-")
      ),
      (n) => n.slice(5)
    );
    return {
      [id]: {
        filters: [...collectFilters].sort(alphabetical),
        selected: null,
        clicked: 0,
      },
    };
  },
  actions: (updater) => ({
    filterBy: (ev, type) => {
      ev.preventDefault();
      updater({
        [id]: ({ filters, selected, clicked }) => ({
          filters,
          selected: selected === type || type === "none" ? null : type,
          clicked: toggleClick(clicked),
        }),
      });
    },
  }),
  service: ({ state, prevState }) => {
    const filter = state[id];
    const prevFilter = prevState[id];
    if (filter.clicked !== prevFilter.clicked) {
      filterable.forEach(applyFilter, filter);
    }
    return empty;
  },
});
