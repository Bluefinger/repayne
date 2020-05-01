export type Themes = {
  [key: string]: () => Promise<typeof import("*.scss")>;
};

export type SwatchState = {
  [swatch: string]: {
    themes: (keyof Themes)[];
    selected: keyof Themes;
    loading: boolean;
    loaded: (keyof Themes)[];
  };
};

export type SwatchActions = {
  pickTheme: (theme: keyof Themes, force?: boolean) => void;
  stopSwatchLoading: (key?: keyof Themes) => void;
};
