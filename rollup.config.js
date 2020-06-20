import ts from "@wessberg/rollup-plugin-ts";
import cjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import minifyhtml from "rollup-plugin-minify-html-literals";
import { terser } from "rollup-plugin-terser";
import autoprefixer from "autoprefixer";
import styles from "rollup-plugin-styles";
import svgSprite from "rollup-plugin-svg-sprite";
import progress from "rollup-plugin-progress";

const extractable = /^(entry)\.css$/;
const dynamicModules = /(Supervisor|Gallery|Swatch|Filter|ScopedStorage)/;
const dynamicStyling = /(chroma|spinny)/;

export default {
  input: ["./src/entry.ts"],
  preserveEntrySignatures: "allow-extension",
  manualChunks(id) {
    if (id.includes("node_modules")) {
      return "vendor";
    }
    if (dynamicModules.test(id)) {
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
      onExtract: ({ name }) => {
        console.log("style", name);
        return extractable.test(name);
      },
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
  output: [
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
  ],
};
