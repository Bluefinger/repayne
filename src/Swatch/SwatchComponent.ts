import type { Component } from "../Supervisor";
import { injectCss } from "../utils/styleInject";
import type { SwatchState, Themes, SwatchActions } from "./SwatchTypes";
import { getScopedStorage, StorageType } from "../ScopedStorage";

const themes: Themes = {
  light: () => import("./light.scss"),
  dark: () => import("./dark.scss"),
  ergot: () => Promise.reject(),
};

const empty = Object.freeze({});

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
      return {
        [id]: {
          themes: themeKeys,
          selected: validateSelectedTheme(themeKeys, store.get()),
          loading: false,
          loaded: [],
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
      const body = document.body;
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
                .then((styles) => {
                  injectCss(styles.default);
                  body.classList.remove(prevSelected);
                  body.classList.add(nextSelected);
                  store.set(nextSelected);
                  actions.stopSwatchLoading(nextSelected);
                })
                .catch(() => {
                  actions.pickTheme(prevSelected, true);
                }),
          };
        } else {
          body.classList.replace(prevSelected, nextSelected);
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
