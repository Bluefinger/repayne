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
const autoprefixer = require("autoprefixer");
const del = require("del");
const browserSync = require("browser-sync").create("dev");
const { exec } = require("child_process");
const { networkInterfaces } = require("os");
const finish = Date.now();

console.log(`Start up took ${finish - start}ms`);

const extractable = /^(entry)\.css$/;
const dynamicModules = /(Supervisor|Gallery|Swatch|Filter|ScopedStorage)/;
const dynamicStyling = /(chroma|spinny)/;

let cached;

const getLocalExternalIP = () => {
  const interface = Object.values(networkInterfaces())
    .flat()
    .find(({ family, internal }) => family === "IPv4" && !internal);
  return interface ? interface.address : "interface";
};

const inputOptions = () => ({
  input: ["./src/entry.ts"],
  preserveEntrySignatures: "allow-extension",
  manualChunks(id) {
    if (id.includes("node_modules") || dynamicModules.test(id)) {
      return "dynamic";
    }
    if (dynamicStyling.test(id)) {
      return "extra-styles";
    }
  },
  plugins: [
    progress(),
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
    assetFileNames: "assets/[name]-[ext][extname]",
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
  opts.cache = cached;
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
  watchOpts.cache = cached;
  const bundle = rollupWatch(watchOpts);
  const startSync = (event) => {
    if (event.code === "END") {
      browserSync.init({
        server: "./public",
        notify: false,
        open: false,
      });
      bundle.off("event", startSync);
    }
  };
  bundle.on("event", startSync);
  bundle.on("event", (event) => {
    if (event.code === "BUNDLE_END") {
      console.log(`Bundle generated in ${event.duration} ms`);
      cached = event.result.cache;
      saveCache(cached).catch(console.error);
    }
  });
  watch(
    ["static/**/*", "themes/**/*", "content/**/*"],
    generate(`-b http://${getLocalExternalIP()}:3000/`)
  );
  browserSync.watch("public/**/*", browserSync.reload);
};

exports.build = series(parallel(loadCache, cleanup), bundle, generate());
exports.watch = series(parallel(loadCache, cleanup), serveFiles);

process.on("exit", () => {
  if (browserSync.active) {
    console.log("Cleaning up...");
    browserSync.exit();
  }
});
