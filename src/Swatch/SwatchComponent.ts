import type { Component } from "../App";
import type { SwatchState, Themes, SwatchActions } from "./SwatchTypes";
import { getScopedStorage, StorageType } from "../ScopedStorage";

const themes: Themes = {
  light: () => Promise.resolve(),
  dark: () => Promise.resolve(),
};

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

const ID = "swatch";

export const SwatchComponent = (): Component<SwatchState, SwatchActions> => {
  const store = getScopedStorage<keyof Themes>(StorageType.LOCAL, ID);
  return {
    id: ID,
    initial: (): SwatchState => {
      const themeKeys = Object.keys(themes);
      const preloaded: (keyof Themes)[] = [];
      const key = validateSelectedTheme(themeKeys, store.get());
      if (preloaded.includes(key)) {
        switchClasses(key);
      }
      return {
        swatch: {
          themes: themeKeys,
          selected: key,
          loading: null,
        },
      };
    },
    actions: (updater) => ({
      pickTheme: (key: keyof Themes) => {
        themes[key]()
          .then(() => {
            updater({
              swatch: {
                loading: null,
                selected: (selected) => {
                  switchClasses(key, selected);
                  store.set(key);
                  return key;
                },
              },
            });
          })
          .catch(() => {
            updater({
              swatch: {
                loading: null,
              },
            });
          });
        updater({
          swatch: {
            loading: key,
          },
        });
      },
    }),
  };
};
