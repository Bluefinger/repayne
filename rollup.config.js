import ts from "@wessberg/rollup-plugin-ts";
import cjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import sass from "rollup-plugin-sass";
import minifyhtml from "rollup-plugin-minify-html-literals";
import { terser } from "rollup-plugin-terser";

export default {
  input: ["./src/entry.ts"],
  preserveEntrySignatures: "allow-extension",
  plugins: [
    resolve({
      mainFields: ["module", "main"],
    }),
    cjs({
      include: "./node_modules/**",
    }),
    ts({
      tsconfig: "./tsconfig.json",
    }),
    sass(),
    minifyhtml(),
  ],
  output: {
    dir: "./static/js/",
    format: "esm",
    sourcemap: true,
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
};
