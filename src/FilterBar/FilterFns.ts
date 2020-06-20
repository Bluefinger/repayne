export const toggleClick = (value: 0 | 1): 0 | 1 => (value ? 0 : 1);

export const alphabetical = (a: string, b: string): number =>
  a < b ? -1 : a > b ? 1 : 0;

export function applyFilter(
  this: { selected: string | null },
  item: Element
): void {
  item.classList.remove("hiding", "active");
  item.setAttribute("aria-hidden", "false");
  if (this.selected) {
    if (item.classList.contains(`type-${this.selected}`)) {
      item.classList.add("active");
    } else {
      item.classList.add("hiding");
      item.setAttribute("aria-hidden", "true");
    }
  }
}
