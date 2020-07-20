import type { Component } from "../Supervisor";
import type { SwatchState, Themes, SwatchActions } from "./SwatchTypes";
import { getScopedStorage, StorageType } from "../ScopedStorage";

const themes: Themes = {
  light: () => Promise.resolve(),
  dark: () => Promise.resolve(),
};

const empty = Object.freeze({});

const switchClasses = (next: string | number, prev?: string | number) => {
  const body = document.body;
  if (prev) body.classList.remove(prev as string);
  body.classList.add(next as string);
};

const validateSelectedTheme = (
  themeKeys: (keyof Themes)[],
  key?: keyof Themes
) => {
  if (key && themeKeys.includes(key)) {
    return key;
  } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
};

export const SwatchComponent = (
  id = "swatch"
): Component<SwatchState, SwatchActions> => {
  const store = getScopedStorage<keyof Themes>(StorageType.LOCAL, id);
  return {
    id,
    initial: (): SwatchState => {
      const themeKeys = Object.keys(themes);
      const preloaded: (keyof Themes)[] = ["light", "dark"];
      const key = validateSelectedTheme(themeKeys, store.get());
      if (preloaded.includes(key)) {
        switchClasses(key);
      }
      return {
        [id]: {
          themes: themeKeys,
          selected: key,
          loading: false,
          loaded: preloaded,
        },
      };
    },
    actions: (updater) => ({
      pickTheme: (key: keyof Themes, force?: boolean) => {
        updater({
          [id]: (state) => {
            if (force || !state.loading) {
              return {
                ...state,
                loading: false,
                selected: key,
              };
            }
            return state;
          },
        });
      },
      stopSwatchLoading: (key?: keyof Themes) => {
        updater({
          [id]: {
            loading: false,
            loaded: (loaded) => (!key ? loaded : [...loaded, key]),
          },
        });
      },
    }),
    service: (context) => {
      const { prevState, state } = context;
      const prevSelected = prevState[id].selected;
      const nextSelected = state[id].selected;
      if (prevSelected !== nextSelected || !state[id].loaded.length) {
        if (!state[id].loaded.includes(nextSelected)) {
          const fetchingStyles = themes[nextSelected]();
          return {
            state: {
              [id]: {
                loading: true,
              },
            },
            next: ({ actions }) =>
              fetchingStyles
                .then(() => {
                  switchClasses(nextSelected, prevSelected);
                  store.set(nextSelected);
                  actions.stopSwatchLoading(nextSelected);
                })
                .catch(() => {
                  actions.pickTheme(prevSelected, true);
                }),
          };
        } else {
          switchClasses(nextSelected, prevSelected);
          return {
            state: {
              [id]: {
                selected: nextSelected,
              },
            },
            next: ({ state }) => store.set(state[id].selected),
          };
        }
      }
      return empty;
    },
  };
};
