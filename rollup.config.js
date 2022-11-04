import html from "@web/rollup-plugin-html";
import copy from "rollup-plugin-copy";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import minifyHTML from "rollup-plugin-minify-html-literals";
import fs from "fs";
import path from "path";
import del from "rollup-plugin-delete";
import {babel} from "@rollup/plugin-babel";
import {terser} from "rollup-plugin-terser";
import {execSync} from "child_process";
import pkg from "./package.json";

// eslint-disable-next-line no-undef
const env = process.env || {};
// eslint-disable-next-line no-undef
const buildPath = path.join(__dirname, "build");
// eslint-disable-next-line no-undef
const sitesPath = path.join(__dirname, "src/sites");
const patternConfig = /(config|settings|constants|tools)/gi;
const internalCss = /(global|magic-check|style|toggle-switch|genome-browser)/gi;

// Get target sites to build
// const sites = env.npm_config_sites ? env.npm_config_sites.split(",") : ["iva"];
const sites = ["iva", "api"];

const revision = () => {
    try {
        const jsorollaBranch = execSync("git rev-parse --abbrev-ref HEAD").toString();
        const jsorollaSha1 = execSync("git rev-parse HEAD").toString();
        return `
        Jsorolla Version: ${pkg.version} | Git: ${jsorollaBranch.trim()} - ${jsorollaSha1.trim()}
        Build generated on: ${new Date()}\n    `;
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

const getCustomSitePath = (name, from, folder) => {
    if (env.npm_config_custom_site) {
        return `${from}custom-sites/${env.npm_config_custom_site}/${name}/${folder}`;
    }
    return folder; // Default path configuration
};

const transformHtmlContent = html => {
    const annihilator = /<!-- build:delete -->[\s\S]*?<!-- \/build -->/mg;
    let newHtml = html.replace("[build-signature]", revision()).replace(annihilator, "");
    sites.forEach(name => {
        const regex = new RegExp(`{{ ${name.toUpperCase()}_CONFIG_PATH }}`, "g");
        newHtml = newHtml.replace(regex, getCustomSitePath(name, "../../../", "conf")).replace(annihilator, "");
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

const getCopyTargets = site => {
    const targets = [
        {
            src: `./src/sites/${site}/img`,
            dest: `${buildPath}/${site}/`,
        },
        {
            src: "./styles/img",
            dest: `${buildPath}/${site}/`,
        },
        {
            src: "./styles/fonts",
            dest: `${buildPath}/${site}/`,
        },
        {
            src: "./src/genome-browser/img",
            dest: `${buildPath}/${site}/`,
        },
        {
            src: "./node_modules/@fortawesome/fontawesome-free/webfonts/*.woff2",
            dest: `${buildPath}/${site}/vendors/webfonts`,
        },
    ];
    if (env.npm_config_custom_site) {
        targets.push({
            src: getCustomSitePath(site, "", "img"),
            dest: `${buildPath}/${site}/`
        });
    }
    return targets;
};

export default sites.map(site => ({
    plugins: [
        del({
            targets: `build/${site}`,
        }),
        replace({
            preventAssignment: true,
            values: {
                "process.env.VERSION": JSON.stringify(pkg.version),
            },
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
        copy({
            targets: getCopyTargets(site),
        }),
    ],
    moduleContext: id => {
        // Avoid this Error: https://rollupjs.org/guide/en/#error-this-is-undefined
        /*
        * In order to match native module behaviour, Rollup sets `this`
        * as `undefined` at the top level of modules. Rollup also outputs
        * a warning if a module tries to access `this` at the top level.
        * The following modules use `this` at the top level and expect it
        * to be the global `window` object, so we tell Rollup to set
        *`this = window` for these modules.
        */
        const thisAsWindowForModules = [
            "node_modules/countup.js/dist/countUp.min.js"
        ];

        if (thisAsWindowForModules.some(id_ => id.trimRight().endsWith(id_))) {
            return "window";
        }
    },
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
        chunkFileNames: () => {
            return "[name]-[hash].js"; // configuration of manualChunks about name format and folder.
        },
        entryFileNames: () => {
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
