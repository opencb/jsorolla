
import {defineConfig} from "vite";
import html from "@web/rollup-plugin-html";
import copy from "rollup-plugin-copy";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import minifyHTML from "rollup-plugin-minify-html-literals";
import summary from "rollup-plugin-summary";
import path from "path";
import del from "rollup-plugin-delete";
import {babel} from "@rollup/plugin-babel";
import {terser} from "rollup-plugin-terser";
import {execSync} from "child_process";
import pkg from "./package.json";


const buildPath = path.resolve(__dirname, "build");
const ivaPath = path.resolve(__dirname, "src/sites/iva");
const genomeMapsDemoPath = path.resolve(__dirname, "src/genome-browser");
const patternExt = /\.[0-9a-z]+$/i;
const patternConfig = /(config|settings|constants|tools)/gi;
const internalCss = /(global|magic-check|style|toggle-switch)/gi;

const revision = () => {
    try {
        const jsorollaBranch = execSync("git rev-parse --abbrev-ref HEAD").toString();
        const jsorollaSha1 = execSync("git rev-parse HEAD").toString();
        return `~
        ~ Jsorolla Version: ${pkg.version} | Git: ${jsorollaBranch.trim()} - ${jsorollaSha1.trim()}
        ~ Build generated on: ${new Date()}`;
    } catch (error) {
        console.error(`
            Status: ${error.status}
            ${error.stderr.toString()}
        `);
    }
};

const isConfig = name => {
    return name.match(patternConfig) !== null;
};

const isInternalCss = name => {
    return name.match(internalCss) !== null;
};

export default defineConfig({
    mode: "development",
    root: "./",
    server: {
        open: "/src/sites/iva/index.html",
        port: 3000,
        watch: ["src", "styles"]
    },
    build: {
        sourcemap: true,
        rollupOptions: {
            input: {
                "iva/index.html": `${ivaPath}/iva-index.html`,
                "genome-maps/index.html": `${genomeMapsDemoPath}/demo/genome-browser.html`,
            },
            plugins: [
                del({targets: "build"}),
                html({
                    transformHtml: [html => html.replace("[build-signature]", revision())],
                }),
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
                        {src: `${ivaPath}/img`, dest: `${buildPath}/iva/`},
                        {src: "./styles/img", dest: `${buildPath}/`},
                        {src: `${ivaPath}/LICENSE`, dest: `${buildPath}`},
                        {src: `${ivaPath}/README.md`, dest: `${buildPath}`},
                        {src: `${ivaPath}/favicon.ico`, dest: `${buildPath}`},
                        {src: "./styles/fonts", dest: `${buildPath}/`},
                        {src: "./node_modules/bootstrap/dist/fonts", dest: `${buildPath}/vendors/`},
                        {src: "./node_modules/@fortawesome/fontawesome-free/webfonts", dest: `${buildPath}/vendors/`},
                    ]
                }),
            ],
            output: {
                dir: "build",
                manualChunks: id => { // It's only detect "import" from script type=module.. the others no.
                    if (id.includes("node_modules")) {
                        return "vendors/js/vendors";
                    }
                    if (id.includes("src/webcomponents")) {
                        return "lib/webcomponents.min";
                    }
                    if (id.includes("src/core")) {
                        return "lib/core.min";
                    }
                },
                chunkFileNames: chunkInfo =>{
                    return "[name]-[hash].js"; // configuration of manualChunks about name format and folder.
                },
                entryFileNames: chunkInfo => { // configuration for entry script module and inline script
                    return "lib/[name].js";
                },
                assetFileNames: assetInfo => {

                    if (assetInfo.name.includes("genome-browser.config")) {
                        return "genome-maps/conf/[name][extname]";
                    }

                    if (isConfig(assetInfo.name)) {
                        return "iva/conf/[name][extname]";
                    }

                    if (isInternalCss(assetInfo.name)) {
                        return "css/[name]-[hash][extname]";
                    }

                    if (assetInfo.name.endsWith(".js") && !isConfig(assetInfo.name)) {
                        return "vendors/js/[name]-[hash][extname]";
                    }

                    if (assetInfo.name.endsWith(".css")) {
                        return "vendors/css/[name]-[hash][extname]";
                    }

                    return "vendors/[name]-[hash][extname]";
                }
            }
        },
    }
});
