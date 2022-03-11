import { terser } from "rollup-plugin-terser";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import json from "@rollup/plugin-json";
import replace from "@rollup/plugin-replace";
import analyze from "rollup-plugin-analyzer";
import pkg from "./package.json";
import { sizeSnapshot } from "rollup-plugin-size-snapshot";
import autoExternal from "rollup-plugin-auto-external";
import postcss from "rollup-plugin-postcss";
import simplevars from "postcss-simple-vars";
import nested from "postcss-nested";
import cssnext from "postcss-cssnext";
import cssnano from "cssnano";
import path from "path";

const config = [
  {
    input: "src/index.js",
    output: [
      {
        file: pkg.main,
        format: "cjs",
        exports: "named",
        // sourcemap: true,
      },
      {
        file: pkg.module,
        format: "es",
        exports: "named",
        // sourcemap: true,
      },
    ],
    plugins: [
      replace({
        "process.env.NODE_ENV": JSON.stringify("production"),
      }),
      postcss({
        plugins: [
          simplevars(),
          nested(),
          cssnext({ warnForDuplicates: false }),
          cssnano(),
        ],
        extensions: [".css"],
        extract: path.resolve("dist/editor.css"),
      }),
      json(),
      resolve(),
      commonjs({
        exclude: ["src/**"],
        include: ["node_modules/**"],
      }),
      babel({
        babelHelpers: "runtime",
        exclude: "node_modules/**",
        plugins: [
          [
            "@babel/plugin-proposal-decorators",
            {
              legacy: true,
            },
          ],
          "@babel/plugin-proposal-function-sent",
          "@babel/plugin-proposal-export-namespace-from",
          "@babel/plugin-proposal-numeric-separator",
          "@babel/plugin-proposal-throw-expressions",
          "@babel/plugin-transform-runtime",
          [
            "transform-react-remove-prop-types",
            {
              removeImport: true,
            },
          ],
        ],
        presets: ["@babel/react", "@babel/env"],
        comments: false,
      }),
      analyze({ summaryOnly: true, limit: 10 }),
      sizeSnapshot(),
      terser(),
      autoExternal(),
    ],
    external: [/lodash/, /@mui\//, "clsx", /@babel\/runtime/],
  },
  {
    input: "src/index.js",
    output: [
      {
        file: `dist/${pkg.name}.min.js`,
        format: "umd",
        name: "Editor",
        exports: "named",
        // sourcemap: true,
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    ],
    plugins: [
      replace({
        "process.env.NODE_ENV": JSON.stringify("production"),
      }),
      postcss({
        plugins: [
          simplevars(),
          nested(),
          cssnext({ warnForDuplicates: false }),
          cssnano(),
        ],
        extensions: [".css"],
      }),
      json(),
      resolve(),
      commonjs({
        exclude: ["src/**"],
        include: ["node_modules/**"],
      }),
      babel({
        babelHelpers: "bundled",
        exclude: "node_modules/**",
        plugins: [
          [
            "@babel/plugin-proposal-decorators",
            {
              legacy: true,
            },
          ],
          "@babel/plugin-proposal-function-sent",
          "@babel/plugin-proposal-export-namespace-from",
          "@babel/plugin-proposal-numeric-separator",
          "@babel/plugin-proposal-throw-expressions",
          [
            "transform-react-remove-prop-types",
            {
              removeImport: true,
            },
          ],
          "babel-plugin-lodash",
          [
            "babel-plugin-import",
            {
              libraryName: "@mui/core",
              libraryDirectory: "esm",
              camel2DashComponentName: false,
            },
            "core",
          ],
          [
            "babel-plugin-import",
            {
              libraryName: "@mui/icons-material",
              libraryDirectory: "esm",
              camel2DashComponentName: false,
            },
            "icons",
          ],
        ],
        presets: ["@babel/react", "@babel/env"],
        comments: false,
      }),
      analyze({ summaryOnly: true, limit: 10 }),
      sizeSnapshot(),
      terser(),
    ],
    external: ["react", "react-dom"],
  },
];

export default config;
