type LazyCallback<T extends Element> = (
  element: T,
  eventOptions: Readonly<AddEventListenerOptions>
) => void;

export type LazyHandler<T extends Element> = (
  lazyElements: Iterable<T>,
  lazyCallback: LazyCallback<T>
) => void;

const loadingOptions: Readonly<AddEventListenerOptions> = Object.freeze({
  once: true,
  passive: true,
});

export const lazyHandler = <T extends Element>(
  lazyElements: Iterable<T>,
  lazyCallback: LazyCallback<T>,
  lazyOptions?: IntersectionObserverInit
): void => {
  const entryIntersect = function (
    this: IntersectionObserver,
    entry: IntersectionObserverEntry
  ): void {
    if (entry.isIntersecting) {
      const lazyElement = entry.target as T;
      lazyCallback(lazyElement, loadingOptions);
      this.unobserve(lazyElement);
    }
  };
  const observer = new IntersectionObserver(
    (entries, observer) => entries.forEach(entryIntersect, observer),
    lazyOptions
  );
  for (const element of lazyElements) {
    observer.observe(element);
  }
};
