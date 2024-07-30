/*
 * Copyright 2015-2024 OpenCB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import fs from "fs";
import path from "path";
import {defineConfig} from "vite";
import replace from "@rollup/plugin-replace";
import pkg from "./package.json";

// eslint-disable-next-line no-undef
const env = process.env || {};
const sites = ["iva", "api", "test-app"];

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

const getTestDataFile = (req, res) => {
    // eslint-disable-next-line no-undef
    const filePath = path.join(process.cwd(), "test-data", req.url.replace(/^[\w/\-_]*test-data\//, ""));
    // At this moment we only support JSON files
    if (fs.existsSync(filePath) && path.extname(filePath) === ".json") {
        res.setHeader("Content-Type", "application/json");
        res.writeHead(200);
        const fileReader = fs.createReadStream(filePath);
        fileReader.on("data", data => res.write(data));
        fileReader.on("end", () => res.end(""));
    } else {
        res.writeHead(404);
        res.end("");
    }
};

const transformHtmlContent = html => {
    return sites.reduce((prevHtml, name) => {
        const parsedName = name.replace(/-/g, "_").toUpperCase();
        const configRegex = new RegExp(`{{ ${parsedName}_CONFIG_PATH }}`, "g");
        const extensionsRegex = new RegExp(`{{ ${parsedName}_EXTENSIONS_PATH }}`, "g");

        return prevHtml
            .replace(configRegex, getCustomSitePath(name, "conf"))
            .replace(extensionsRegex, getExtensionsPath(name));
    }, html);
};

const configurePreviewServer = server => {
    // Middleware to intercept all calls that contains the 'test-data' word
    server.middlewares.use((req, res, next) => {
        if (req.url.includes("test-data/")) {
            return getTestDataFile(req, res);
        }
        return next();
    });
};

const configureServer = server => {
    // Middleware to intercept all calls that contains the 'test-data' word
    server.middlewares.use((req, res, next) => {
        if (req.url.includes("test-data/")) {
            return getTestDataFile(req, res);
        }
        return next();
    });
    // Middleware to fix the path to images used in custom-sites
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
    resolve: {
        alias: {
            "~bootstrap": path.resolve("./", "node_modules/bootstrap"),
        }
    },
    server: {
        open: env.NODE_ENV !== "production" ? "/src/sites/iva/index.html" : "/iva/index.html",
        port: 3000,
        watch: ["src", "styles", "custom-sites"]
    },
    build: {
        outDir: "build"
    },
    preview: {
        port: 4000,
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
        {
            name: "configure-preview-server",
            configurePreviewServer,
            apply: "serve",
        },
    ],
});

