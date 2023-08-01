import fs from "fs";
import path from "path";
import {defineConfig} from "vite";
import replace from "@rollup/plugin-replace";
import pkg from "./package.json";

// eslint-disable-next-line no-undef
const env = process.env || {};
const sites = ["iva", "api", "test"];

const getCustomSitePath = (name, folder) => {
    if (env.npm_config_custom_site) {
        return `../../../custom-sites/${env.npm_config_custom_site}/${name}/${folder}`;
    }
    return folder; // Default path configuration
};

const getExtensionsPath = name => {
    // NOTE: at this moment, extensions are only available for IVA
    if (env.npm_extensions && name.toUpperCase() === "IVA") {
        return "../../../extensions/build";
    }
    return "extensions";
};

const transformHtmlContent = html => {
    return sites.reduce((prevHtml, name) => {
        const configRegex = new RegExp(`{{ ${name.toUpperCase()}_CONFIG_PATH }}`, "g");
        const extensionsRegex = new RegExp(`{{ ${name.toUpperCase()}_EXTENSIONS_PATH }}`, "g");

        return prevHtml
            .replace(configRegex, getCustomSitePath(name, "conf"))
            .replace(extensionsRegex, getExtensionsPath(name));
    }, html);
};

const configureServer = server => {
    server.middlewares.use((req, res, next) => {
        if (env.npm_config_custom_site && req.url.startsWith("/src/sites") && req.url.includes("img")) {
            const customUrl = req.url.replace("/src/sites", `/custom-sites/${env.npm_config_custom_site}`);
            // eslint-disable-next-line no-undef
            const originalPath = path.join(process.cwd(), req.url);
            // eslint-disable-next-line no-undef
            const customPath = path.join(process.cwd(), customUrl);
            if (!fs.existsSync(originalPath) && fs.existsSync(customPath)) {
                // eslint-disable-next-line no-param-reassign
                req.url = customUrl; // Replace the url with the correct image path
            }
        }
        return next();
    });
};

export default defineConfig({
    mode: env.NODE_ENV || "development",
    root: "./",
    server: {
        open: env.NODE_ENV !== "production" ? "/src/sites/iva/index.html" : "/iva/index.html",
        port: 3000,
        watch: ["src", "styles", "custom-sites"]
    },
    build: {
        outDir: "build"
    },
    plugins: [
        {
            ...replace({
                preventAssignment: true,
                values: {
                    "process.env.VERSION": JSON.stringify(pkg.version),
                },
            }),
            apply: "serve",
        },
        {
            name: "html-transform",
            transformIndexHtml: transformHtmlContent,
            apply: "serve",
        },
        {
            name: "configure-server",
            configureServer,
            apply: "serve",
        },
    ],
});

