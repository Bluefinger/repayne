import { registerLanguage, highlight } from "highlight.js/lib/core";
import type { LazyHandler } from "../LazyLoader";
import { map, uniqueMap } from "../utils/iterables";

const syntaxes: Record<string, () => Promise<void>> = {
  css: () =>
    import("highlight.js/lib/languages/css").then((mod) =>
      registerLanguage("css", mod.default)
    ),
  scss: () =>
    import("highlight.js/lib/languages/scss").then((mod) =>
      registerLanguage("scss", mod.default)
    ),
  rust: () =>
    import("highlight.js/lib/languages/rust").then((mod) =>
      registerLanguage("rust", mod.default)
    ),
  html: () =>
    import("highlight.js/lib/languages/xml").then((mod) => {
      registerLanguage("html", mod.default);
    }),
  javascript: () =>
    import("highlight.js/lib/languages/javascript").then((mod) =>
      registerLanguage("javascript", mod.default)
    ),
  typescript: () =>
    import("highlight.js/lib/languages/typescript").then((mod) =>
      registerLanguage("typescript", mod.default)
    ),
  nohighlight: () => Promise.resolve(),
};

interface HighlightJob {
  lang: string;
  code: string;
}

const langTest = /lang(?:uage)?-(\w+)/;
const jobs = new WeakMap<Element, HighlightJob>();

const styleBlock = <T extends Element>(
  block: T,
  { lang, code }: HighlightJob
): void => {
  block.innerHTML = highlight(lang, code).value;
  jobs.delete(block);
};

const importHighlighters = <T extends Element>(
  elements: Iterable<T>
): Promise<void[]> =>
  Promise.all(
    map(
      uniqueMap(elements, (block) => {
        const matchLang = langTest.exec(block.className);
        const lang = matchLang ? matchLang[1] : "nohighlight";
        jobs.set(block, {
          lang,
          code: block.textContent ?? "",
        });
        return lang;
      }),
      (lang) => syntaxes[lang]()
    )
  );

export const initHighlighting = <T extends Element>(
  elements: Iterable<T>,
  lazyLoader: LazyHandler<T>
): void => {
  const loadedHighlights = importHighlighters(elements);
  lazyLoader(elements, (codeblock) => {
    void loadedHighlights.then(() => {
      const job = jobs.get(codeblock);
      if (job) {
        styleBlock(codeblock, job);
      }
    });
  });
};
