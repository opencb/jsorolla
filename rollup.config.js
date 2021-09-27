import html from "@web/rollup-plugin-html";
import copy from "rollup-plugin-copy";
import resolve from "@rollup/plugin-node-resolve";
import minifyHTML from "rollup-plugin-minify-html-literals";
import summary from "rollup-plugin-summary";
import fs from "fs";
import path from "path";
import del from "rollup-plugin-delete";
import {babel} from "@rollup/plugin-babel";
import {terser} from "rollup-plugin-terser";
import {execSync} from "child_process";
import pkg from "./package.json";

const env = process.env || {};
const buildPath = path.join(__dirname, "build");
const sitesPath = path.join(__dirname, "src/sites");
const patternExt = /\.[0-9a-z]+$/i;
const patternConfig = /(config|settings|constants|tools)/gi;
const internalCss = /(global|magic-check|style|toggle-switch)/gi;

// Get target sites to build
// const sites = env.npm_config_sites ? env.npm_config_sites.split(",") : ["iva"];
const sites = ["iva"];

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

const getSiteConfigPath = name => {
    if (env.npm_config_custom_config) {
        return `../../../custom-conf/${env.npm_config_custom_config}/${name}`;
    }
    return "conf"; // Default path configuration
};

const transformHtmlContent = html => {
    let newHtml = html.replace("[build-signature]", revision());
    sites.forEach(name => {
        const regex = new RegExp(`{{ ${name.toUpperCase()}_CONFIG_PATH }}`, "g");
        newHtml = newHtml.replace(regex, getSiteConfigPath(name));
    });
    return newHtml;
};

const getSiteContent = name => {
    const content = fs.readFileSync(path.join(sitesPath, name, "index.html"), "utf8");
    return {
        name: "index.html",
        html: transformHtmlContent(content),
    };
};

export default sites.map(site => ({
    plugins: [
        del({
            targets: `build/${site}`,
        }),
        html({
            rootDir: `${sitesPath}/${site}/`,
            input: getSiteContent(site),
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
                {src: `./src/sites/${site}/img`, dest: `${buildPath}/${site}/`},
                {src: "./styles/img", dest: `${buildPath}/${site}/`},
                // {src: `${ivaPath}/LICENSE`, dest: `${buildPath}`},
                // {src: `${ivaPath}/README.md`, dest: `${buildPath}`},
                {src: "./styles/fonts", dest: `${buildPath}/${site}/`},
                {src: "./node_modules/bootstrap/dist/fonts", dest: `${buildPath}/${site}/vendors/`},
                {src: "./node_modules/@fortawesome/fontawesome-free/webfonts", dest: `${buildPath}/${site}/vendors/`},
            ]
        }),
    ],
    output: {
        dir: `${buildPath}/${site}`,
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
        chunkFileNames: chunkInfo => {
            return "[name]-[hash].js"; // configuration of manualChunks about name format and folder.
        },
        entryFileNames: chunkInfo => {
            return "lib/[name].js"; // configuration for entry script module and inline script
        },
        assetFileNames: assetInfo => {
            // if (assetInfo.name.includes("genome-browser.config")) {
            //     return "genome-maps/conf/[name][extname]";
            // }

            if (isConfig(assetInfo.name)) {
                return "conf/[name][extname]";
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
        },
    },
}));
