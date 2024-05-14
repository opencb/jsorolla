import html from "@web/rollup-plugin-html";
import copy from "rollup-plugin-copy";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import minifyHTML from "rollup-plugin-minify-html-literals";
import fs from "fs";
import path from "path";
import del from "rollup-plugin-delete";
import {babel} from "@rollup/plugin-babel";
import terser from "@rollup/plugin-terser";
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
const getSitesToBuild = () => {
    // Josemi 2023-09-12 NOTE: test-app has been included by default in build process
    const sites = ["iva", "api", "test-app"];
    // Check if we need to include the test-app site in the sites to build list
    // This can be enabled using the '--include-test-app' flag when running 'npm run build' command
    // if (env.npm_config_include_test_app) {
    //     sites.push("test-app");
    // }
    return sites;
};

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
    // NOTE: custom sites are not allowed for 'test-app'
    if (env.npm_config_custom_site && name.toUpperCase() !== "TEST-APP") {
        return `${from}custom-sites/${env.npm_config_custom_site}/${name}/${folder}`;
    }
    return folder; // Default path configuration
};

const getExtensionsPath = name => {
    // NOTE: extensions are only enabled at this moment for IVA
    if (env.npm_extensions && name.toUpperCase() === "IVA") {
        // We need to make sure that the extensions file exists
        // eslint-disable-next-line no-undef
        const extensionsPath = path.join(__dirname, "extensions", "build", "extensions.js");
        if (fs.existsSync(extensionsPath)) {
            return "../../../extensions/build";
        }
    }
    return "extensions";
};

const transformHtmlContent = (html, name) => {
    const annihilator = /<!-- build:delete -->[\s\S]*?<!-- \/build -->/mg;
    const parsedName = name.replace(/-/g, "_").toUpperCase();
    const configRegex = new RegExp(`{{ ${parsedName}_CONFIG_PATH }}`, "g");
    const extensionsRegex = new RegExp(`{{ ${parsedName}_EXTENSIONS_PATH }}`, "g");

    return html
        .replace("[build-signature]", revision())
        .replace(annihilator, "")
        .replace(configRegex, getCustomSitePath(name, "../../../", "conf"))
        .replace(extensionsRegex, getExtensionsPath(name));
};

const getSiteContent = name => {
    const content = fs.readFileSync(path.join(sitesPath, name, "index.html"), "utf8");
    return {
        name: "index.html",
        html: transformHtmlContent(content, name),
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

export default getSitesToBuild().map(site => ({
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
                "@babel/plugin-transform-runtime",
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
        minifyInternalExports: false,
        manualChunks: id => {
            // Extract opencga client mock
            if (id.includes("test-app/clients/opencga-client-mock") || id.includes("api-mock")) {
                return "lib/opencga-client-mock.min";
            }
            // Extract cellbase client mock
            if (id.includes("test-app/clients/cellbase-client-mock")) {
                return "lib/cellbase-client-mock.min";
            }
            // Josemi 2023-09-19 NOTE: 'opencga-catalog-utils' is included inside the 'clients/opencga' folder
            // We need to make sure this file is not included in the opencga client bundle
            if (id.includes("clients/opencga") && !id.includes("opencga-catalog-utils")) {
                return "lib/opencga-client.min";
            }
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
        entryFileNames: entryInfo => {
            // Check for extensions entry --> save into 'extensions' folder
            if (entryInfo.name === "extensions") {
                return "extensions/[name].js";
            }
            return "lib/[name].js";
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

            // if (assetInfo.name.includes("extensions")) {
            //     return "extensions/[name][extname]";
            // }

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
