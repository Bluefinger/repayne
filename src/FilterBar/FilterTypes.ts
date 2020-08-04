export type FilterState = {
  [filterbar: string]: {
    filters: string[];
    selected: string | null;
  };
};

export type FilterActions = {
  filterBy: <E extends Event>(event: E, src: string) => void;
};
