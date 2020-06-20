export const lazyHandler = (classname: string, lazyImages: Element[]): void => {
  const loadingOptions: AddEventListenerOptions = { once: true, passive: true };
  const entryIntersect = (entry: IntersectionObserverEntry): void => {
    if (entry.isIntersecting) {
      const lazyImage = entry.target as HTMLImageElement;
      if (lazyImage.dataset.src) {
        lazyImage.src = lazyImage.dataset.src;
        lazyImage.addEventListener(
          "load",
          () => lazyImage.classList.remove(classname),
          loadingOptions
        );
      }
      if (lazyImage.dataset.srcset) lazyImage.srcset = lazyImage.dataset.srcset;
      lazyImageObserver.unobserve(lazyImage);
    }
  };

  const lazyImageObserver = lazyImages.reduce((observer, image) => {
    observer.observe(image);
    return observer;
  }, new IntersectionObserver((entries) => entries.forEach(entryIntersect)));
};
