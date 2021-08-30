
import {defineConfig} from "vite";
import html from "@web/rollup-plugin-html";
import copy from "rollup-plugin-copy";
import resolve from "@rollup/plugin-node-resolve";
import minifyHTML from "rollup-plugin-minify-html-literals";
import summary from "rollup-plugin-summary";
import path from "path";
import del from "rollup-plugin-delete";
import {babel, getBabelOutputPlugin} from "@rollup/plugin-babel";
import {terser} from "rollup-plugin-terser";


const buildPath = path.resolve(__dirname, "build-vite");
const ivaPath = path.resolve(__dirname, "src/sites/iva");
const patternExt = /\.[0-9a-z]+$/i;
const patternConfig = /(config|settings|constants|tools)/gi;

export default defineConfig({
    mode: "development",
    root: "./",
    server: {
        open: "/src/sites/iva",
        port: 3000,
        watch: ["src", "styles"]
    },
    build: {
        polyfillModulePreload: true,
        rollupOptions: {
            input: [`${ivaPath}/iva-index.html`, "src/genome-browser/demo/genome-browser.html"],
            preserveEntrySignatures: "strict",
            plugins: [
                del({targets: "build-vite"}),
                html(),
                resolve(),
                minifyHTML(),
                babel({
                    exclude: "node_modules/**",
                    babelHelpers: "runtime",
                    presets: ["@babel/preset-env"],
                    plugins: [
                        "@babel/plugin-proposal-export-default-from",
                        "@babel/plugin-proposal-nullish-coalescing-operator",
                        "@babel/transform-runtime",
                        ["@babel/plugin-proposal-class-properties", {"loose": false}]
                    ]
                }),
                terser({
                    ecma: 2020,
                    module: true,
                    warnings: true
                }),
                summary(),
                copy({
                    targets: [
                        {src: `${ivaPath}/img`, dest: `${buildPath}`},
                        {src: `${ivaPath}/LICENSE`, dest: `${buildPath}`},
                        {src: `${ivaPath}/README.md`, dest: `${buildPath}`},
                        {src: `${ivaPath}/favicon.ico`, dest: `${buildPath}`},
                        {src: "./styles/fonts", dest: `${buildPath}/`},
                        {src: "./node_modules/bootstrap/dist/fonts", dest: `${buildPath}/`},
                        {src: "./node_modules/@fortawesome/fontawesome-free/webfonts", dest: `${buildPath}/`},
                    ]
                }),
            ],
            output: {
                dir: "build-vite",
                assetFileNames: assetInfo => {
                    if (assetInfo.name.match(patternConfig) !== null) {
                        return "conf/[name][extname]";
                    }
                    return "assets/[name]-[hash][extname]";
                }
            }
        },
    }
});
