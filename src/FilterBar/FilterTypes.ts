export type FilterState = {
  [filterbar: string]: {
    filters: string[];
    selected: string | null;
    clicked: 0 | 1;
  };
};

export type FilterActions = {
  filterBy: (event: MouseEvent, src: string) => void;
};
