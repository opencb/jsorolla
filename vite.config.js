
import {defineConfig} from "vite";
import html from "@web/rollup-plugin-html";
import copy from "rollup-plugin-copy";
import resolve from "@rollup/plugin-node-resolve";
import {terser} from "rollup-plugin-terser";
import minifyHTML from "rollup-plugin-minify-html-literals";
import summary from "rollup-plugin-summary";
import path from "path";
import del from "rollup-plugin-delete";

const buildPath = path.resolve(__dirname, "build-vite");
const ivaPath = path.resolve(__dirname, "src/sites/iva");

export default defineConfig({
    mode: "development",
    root: "./",
    server: {
        open: "/src/sites/iva",
        port: 3000,
        watch: ["src", "styles"]
    },
    build: {
        rollupOptions: {
            input: `${ivaPath}/iva-index.html`,
            preserveEntrySignatures: "strict",
            plugins: [
                del({targets: "build-vite/*"}),
                html(),
                resolve(),
                minifyHTML(),
                terser({
                    ecma: 2020,
                    module: true,
                    warnings: true,
                }),
                copy({
                    targets: [
                        {src: `${ivaPath}/img`, dest: `${buildPath}`},
                        {src: `${ivaPath}/LICENSE`, dest: `${buildPath}`},
                        {src: `${ivaPath}/README.md`, dest: `${buildPath}`},
                        {src: `${ivaPath}/conf/*.js`, dest: `${buildPath}/conf`},
                        {src: `${ivaPath}/favicon.ico`, dest: `${buildPath}`},
                        {src: "./styles/fonts", dest: `${buildPath}/`},
                        {src: "./node_modules/bootstrap/dist/fonts", dest: `${buildPath}/`},
                        {src: "./node_modules/@fortawesome/fontawesome-free/webfonts", dest: `${buildPath}/`},
                    ]
                }),
                summary(),
            ],
            output: {
                dir: "build-vite",
            }
        }
    }
});
