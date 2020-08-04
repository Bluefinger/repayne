const start = Date.now();
const { series, parallel, watch } = require("gulp");
const { existsSync, promises } = require("fs");
const { readFile, writeFile, mkdir } = promises;
const { parse, stringify } = require("buffer-json");
const { rollup, watch: rollupWatch } = require("rollup");
const progress = require("rollup-plugin-progress");
const minifyhtml = require("rollup-plugin-minify-html-literals").default;
const resolve = require("@rollup/plugin-node-resolve").default;
const cjs = require("@rollup/plugin-commonjs");
const ts = require("@wessberg/rollup-plugin-ts");
const styles = require("rollup-plugin-styles");
const svgSprite = require("rollup-plugin-svg-sprite");
const { terser } = require("rollup-plugin-terser");
const virtual = require("@rollup/plugin-virtual");
const { promise: matched } = require("matched");
const autoprefixer = require("autoprefixer");
const del = require("del");
const browserSync = require("browser-sync").create("dev");
const { exec } = require("child_process");
const { networkInterfaces } = require("os");
const finish = Date.now();

console.log(`Start up took ${finish - start}ms`);

const DEFAULT_OUTPUT = "multi-entry.js";
const AS_IMPORT = "import";
const AS_EXPORT = "export * from";

const multiEntry = (conf = {}) => {
  const config = {
    include: [],
    exclude: [],
    entryFileName: DEFAULT_OUTPUT,
    exports: true,
    ...conf,
  };

  let prefix = config.exports === false ? AS_IMPORT : AS_EXPORT;
  const exporter = (path) => `${prefix} ${JSON.stringify(path)}`;

  const configure = (input) => {
    if (typeof input === "string") {
      config.include = [input];
    } else if (Array.isArray(input)) {
      config.include = input;
    } else {
      const {
        include = [],
        exclude = [],
        entryFileName = DEFAULT_OUTPUT,
        exports,
      } = input;
      config.include = include;
      config.exclude = exclude;
      config.entryFileName = entryFileName;
      if (exports === false) {
        prefix = AS_IMPORT;
      }
    }
  };

  let virtualisedEntry;

  return {
    name: "multi-entry",

    options(options) {
      if (options.input !== config.entryFileName) {
        configure(options.input);
      }
      return {
        ...options,
        input: config.entryFileName,
      };
    },

    outputOptions(options) {
      return {
        ...options,
        entryFileNames: config.entryFileName,
      };
    },

    buildStart(options) {
      const patterns = config.include.concat(
        config.exclude.map((pattern) => `!${pattern}`)
      );
      const entries = patterns.length
        ? matched(patterns, { realpath: true }).then((paths) =>
            paths.map(exporter).join("\n")
          )
        : Promise.resolve("");

      virtualisedEntry = virtual({ [options.input]: entries });
    },

    resolveId(id, importer) {
      return virtualisedEntry && virtualisedEntry.resolveId(id, importer);
    },

    load(id) {
      return virtualisedEntry && virtualisedEntry.load(id);
    },
  };
};

const extractable = /(entry)\.css$/;
const dynamicModules = /(App|Supervisor|Gallery|Swatch|Filter|ScopedStorage)/;
const dynamicStyling = /(chroma|spinny|highlight\.js\/styles)/;

let cached;

const getLocalExternalIP = () => {
  const interface = Object.values(networkInterfaces())
    .flat()
    .find(({ family, internal }) => family === "IPv4" && !internal);
  return interface ? interface.address : "interface";
};

const inputOptions = () => ({
  input: ["./src/entry.ts", "./src/utils/iterables.ts"],
  preserveEntrySignatures: false,
  manualChunks(moduleId, { getModuleInfo }) {
    const { isEntry, importers } = getModuleInfo(moduleId);
    if (isEntry) {
      return "entry-chunk";
    } else {
      const importing = importers.map((id) => getModuleInfo(id));
      const entried = importing.find((module) => module.isEntry);
      if (entried) {
        return "entry-chunk";
      }
    }
    if (moduleId.includes("base.scss")) {
      return null;
    }
    if (moduleId.includes("languages")) {
      return moduleId
        .split(/(?:\/|\\)/)
        .pop()
        .slice(0, -3);
    }
    if (moduleId.includes("highlight.js") || moduleId.includes("Syntax")) {
      return "syntax";
    }
    if (dynamicStyling.test(moduleId)) {
      return "extra-styles";
    }
    if (moduleId.includes("node_modules") || dynamicModules.test(moduleId)) {
      return "dynamic";
    }
  },
  plugins: [
    progress(),
    multiEntry(),
    resolve({
      mainFields: ["module", "main"],
    }),
    cjs({
      include: "./node_modules/**",
    }),
    ts({
      browserslist: false,
      tsconfig: "./tsconfig.json",
    }),
    styles({
      autoModules: true,
      mode: "extract",
      extensions: [".scss", ".css"],
      plugins: [autoprefixer],
      minimize: false,
      onExtract: ({ name }) => extractable.test(name),
      sass: {
        impl: "sass",
        // fibers: true,
        outputStyle: "compressed",
      },
    }),
    minifyhtml(),
    svgSprite({
      outputFolder: "static/js",
    }),
  ],
});

const outputOptions = () => [
  {
    dir: "./static/js/",
    format: "esm",
    sourcemap: true,
    chunkFileNames: "[name]-[format].js",
    assetFileNames: (asset) => {
      if (asset.name.includes("_virtual:")) {
        return `assets/${asset.name.split("_virtual:").pop()}`;
      }
      return `assets/${asset.name}`;
    },
    //entryFileNames: "entry.js",
    plugins: [
      terser({
        mangle: {
          properties: {
            regex: /^(_|\$\$)/,
          },
        },
        nameCache: {},
        compress: {
          passes: 3,
        },
        output: {
          ecma: 8,
        },
        module: true,
      }),
    ],
  },
];

const watchOptions = () => ({
  ...inputOptions(),
  output: outputOptions(),
  watch: {
    buildDelay: 100,
    exclude: "node_modules/**",
  },
});

const linkChildOutput = (childProcess) => {
  childProcess.stdout.pipe(process.stdout);
  childProcess.stderr.pipe(process.stderr);
  return childProcess;
};

const createChildTask = (cmd) => linkChildOutput(exec(cmd));

const loadCache = async () => {
  try {
    const file = await readFile("./.cache/.rollup.cache.json", "utf-8");
    cached = parse(file);
  } catch (e) {
    if (!existsSync("./.cache")) return await mkdir("./.cache");
  }
};

const cleanup = () => del(["./static/js/**/*", "./public/**/*"]);

const saveCache = (cache) =>
  writeFile("./.cache/.rollup.cache.json", stringify(cache));

const bundle = async () => {
  const opts = inputOptions();
  //opts.cache = cached;
  const bundle = await rollup(opts);
  await Promise.all([
    ...outputOptions().map(bundle.write),
    saveCache(bundle.cache),
  ]);
};

const generate = (args) => {
  const generateWithArgs = () =>
    createChildTask(args ? `hugo ${args}` : "hugo");
  return generateWithArgs;
};

const serveFiles = () => {
  const watchOpts = watchOptions();
  const bundle = rollupWatch(watchOpts);
  let started;
  bundle.on("event", (event) => {
    switch (event.code) {
      case "END":
        if (!started) {
          started = true;
          browserSync.init({
            server: "./public",
            notify: false,
            open: false,
          });
          browserSync.watch("public/**/*", browserSync.reload);
        }
        break;
      case "ERROR":
        console.error(event.error);
        //done(event.error);
        break;
      case "BUNDLE_END":
        console.log(`Bundle generated in ${event.duration} ms`);
        cached = event.result.cache;
        saveCache(cached).catch(console.error);
    }
  });
  watch(
    ["static/**/*", "themes/**/*", "content/**/*", "config.toml"],
    generate(`-b http://${getLocalExternalIP()}:3000/`)
  );
};

exports.build = series(parallel(loadCache, cleanup), bundle, generate());
exports.watch = series(parallel(loadCache, cleanup), serveFiles);

process.on("exit", () => {
  if (browserSync.active) {
    console.log("Cleaning up...");
    browserSync.exit();
  }
});
