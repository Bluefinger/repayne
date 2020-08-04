import type { Component } from "../App";
import type { FilterState, FilterActions } from "./FilterTypes";
import { alphabetical, applyFilter } from "./FilterFns";
import { map, uniqueMap, filter, flatten } from "../utils/iterables";

const defer = <T extends unknown, R extends unknown = T>(
  cb: (value: T) => R,
  value: T
) => {
  void Promise.resolve(value).then(cb);
};

export const FilterComponent = (
  filterable: NodeListOf<Element>,
  id = "filterbar"
): Component<FilterState, FilterActions> => {
  const applyState = (state: { filters: string[]; selected: string | null }) =>
    filterable.forEach(applyFilter, state);
  return {
    id,
    initial: (): FilterState => {
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
        },
      };
    },
    actions: (updater) => ({
      filterBy: (ev, type) => {
        ev.preventDefault();
        updater({
          [id]: ({ filters, selected }) => {
            const newState = {
              filters,
              selected: selected === type || type === "none" ? null : type,
            };
            defer(applyState, newState);
            return newState;
          },
        });
      },
    }),
  };
};
