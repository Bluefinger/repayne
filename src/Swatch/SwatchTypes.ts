export type Themes = {
  [key: string]: () => Promise<any>;
};

export type SwatchState = {
  swatch: {
    themes: (keyof Themes)[];
    selected: keyof Themes;
    loading: keyof Themes | null;
  };
};

export type SwatchActions = {
  pickTheme: (theme: keyof Themes) => void;
};
