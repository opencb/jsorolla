/* eslint-disable no-undef */
const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WebpackPluginHtmlAssetsFix = require("./scripts/webpack-plugin-html-assets-fix.js");
const WebpackPluginHtmlGlobalAssets = require("./scripts/webpack-plugin-html-global-assets.js");
const WebpackPluginHtmlBuildInfo = require("./scripts/webpack-plugin-html-build-info.js");

// load package.json from the current working directory
const pkg = require(path.join(process.cwd(), "package.json"));

// check if we are in development mode
// this is used also to tell webpack to minimize the code or not
const isDevelopment = process.env.NODE_ENV !== "production";

// list of entries to build (in src/sites folder)
const entries = ["iva", "test-app"];

// internal method to get the path to the custom site
const getCustomSitePath = (entry, folder) => {
    // NOTE: custom sites are not allowed for 'test-app'
    if (process.env.npm_config_custom_site && entry === "iva") {
        return path.join(__dirname, "custom-sites", process.env.npm_config_custom_site, "iva", folder);
    }
    // return the default path
    return path.join(entry === "iva" ? process.cwd() : __dirname, "src", "sites", entry, folder);
};

// Setup middlewares for development server.
const setupCustomMiddlewares = (middlewares, devServer) => {
    if (!devServer) {
        throw new Error("webpack-dev-server is not defined");
    }
    // Redirect requests to test data to the correct file
    devServer.app.get("/:site/test-data/:version/:file", (request, response) => {
        const filePath = path.join(__dirname, "test-data", request.params.version, request.params.file);
        // At this moment we only support JSON files
        if (fs.existsSync(filePath) && path.extname(filePath) === ".json") {
            response.setHeader("Content-Type", "application/json");
            response.writeHead(200);
            const fileReader = fs.createReadStream(filePath);
            fileReader.on("data", data => response.write(data));
            fileReader.on("end", () => response.end(""));
        } else {
            response.writeHead(404);
            response.end(`Cannot find test data file: ${filePath}`);
        }
    });
    return middlewares;
};

module.exports = {
    mode: isDevelopment ? "development" : "production",
    target: "web",
    entry: {
        "iva": "./src/sites/iva/iva-app.js",
        "test-app": "./src/sites/test-app/test-app.js",
        "pdf-worker": {
            import: path.join(__dirname, "node_modules/pdfjs-dist/build/pdf.worker.mjs"),
            filename: "iva/js/pdf.worker.js",
        },
    },
    output: {
        path: path.join(process.cwd(), "build"),
        filename: "[name]/js/[name].[contenthash].js",
        iife: true,
        scriptType: "text/javascript",
        chunkFormat: "array-push",
    },
    experiments: {
        outputModule: true,
    },
    optimization: {
        minimize: !isDevelopment,
        splitChunks: {
            cacheGroups: {
                defaultVendors: false,
                vendorIva: {
                    test: /node_modules/,
                    chunks: /iva/,
                    filename: "iva/js/vendor.[contenthash].js",
                },
                vendorTestApp: {
                    test: /node_modules/,
                    chunks: /test-app/,
                    filename: "test-app/js/vendor.[contenthash].js",
                },
            },
        },
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
            {
                test: /\.scss$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    {
                        loader: "sass-loader",
                        options: {
                            implementation: require.resolve("sass"),
                        },
                    },
                ],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: "asset/inline",
            },
        ],
    },
    devServer: {
        hot: false,
        open: "/iva/index.html",
        port: process.env.npm_config_port || 3000,
        client: {
            overlay: false,
        },
        setupMiddlewares: setupCustomMiddlewares,
        devMiddleware: {
            writeToDisk: false,
        },
    },
    performance: {
        // this is used to remove the warning message when the size of the generated files is too big
        assetFilter: () => false,
    },
    plugins: [
        new webpack.ProgressPlugin(),
        new WebpackPluginHtmlAssetsFix(),
        new MiniCssExtractPlugin({
            filename: () => {
                // TODO: get the cache group from pathData.chunk.chunkReason
                // Example: chunkReason: 'split chunk (cache group: vendor)'
                return "[name]/css/vendor.[contenthash].css";
            },
        }),
        new WebpackPluginHtmlGlobalAssets({
            cwd: __dirname,
            files: {
                "[name]/js/globals.[contenthash].js": [
                    "node_modules/jquery/dist/jquery.min.js",
                    "node_modules/lodash/lodash.min.js",
                    "node_modules/backbone/backbone-min.js",
                    "node_modules/moment/min/moment.min.js",
                    "node_modules/highcharts/highcharts.js",
                    "node_modules/qtip2/dist/jquery.qtip.min.js",
                    "node_modules/cookies-js/dist/cookies.min.js",
                    "node_modules/@popperjs/core/dist/umd/popper.min.js",
                    "node_modules/bootstrap/dist/js/bootstrap.min.js",
                    "node_modules/select2/dist/js/select2.full.min.js",
                    "node_modules/@eonasdan/tempus-dominus/dist/js/tempus-dominus.min.js",
                    "node_modules/bootstrap-table/dist/bootstrap-table.min.js",
                    "node_modules/jwt-decode/build/jwt-decode.min.js",
                    "node_modules/clipboard/dist/clipboard.min.js",
                    "node_modules/swagger-ui/dist/swagger-ui-bundle.js",
                    "node_modules/swagger-ui/dist/swagger-ui-standalone-preset.js",
                    // "node_modules/ollama/dist/browser.mjs",
                    // "node_modules/pdfmake/build/pdfmake.min.js",
                    // "node_modules/pdfmake/build/vfs_fonts.js",
                    // "node_modules/html-to-pdfmake/browser.js",
                ],
                "[name]/css/globals.[contenthash].css": [
                    // "node_modules/bootstrap/dist/css/bootstrap.min.css",
                    "node_modules/select2/dist/css/select2.min.css",
                    "node_modules/select2-bootstrap-5-theme/dist/select2-bootstrap-5-theme.min.css",
                    "node_modules/@eonasdan/tempus-dominus/dist/css/tempus-dominus.min.css",
                    "node_modules/bootstrap-table/dist/bootstrap-table.min.css",
                    "node_modules/@fortawesome/fontawesome-free/css/all.min.css",
                    "node_modules/qtip2/dist/jquery.qtip.min.css",
                    "node_modules/swagger-ui/dist/swagger-ui.css"
                ],
            },
            chunks: entries,
        }),
        ...entries.map(entry => {
            return new HtmlWebpackPlugin({
                template: path.join(__dirname, "src", "sites", entry, "index.html"),
                filename: entry + "/index.html",
                chunks: [entry],
                minify: false,
            });
        }),
        ...entries.map(entry => {
            return new CopyWebpackPlugin({
                patterns: [
                    {
                        from: path.join(__dirname, "src", "sites", entry, "favicon.ico"),
                        to: entry + "/favicon.ico",
                    },
                    {
                        from: getCustomSitePath(entry, "conf"),
                        to: entry + "/conf",
                    },
                    {
                        from: getCustomSitePath(entry, "img"),
                        to: entry + "/img",
                    },
                    {
                        from: path.join(__dirname, "src", "sites", entry, "extensions"),
                        to: entry + "/extensions",
                    },
                    {
                        from: path.join(__dirname, "node_modules/@fortawesome/fontawesome-free/webfonts"),
                        to: entry + "/webfonts",
                    },
                ],
            });
        }),
        new webpack.DefinePlugin({
            "process.env.VERSION": JSON.stringify(pkg.version),
        }),
        new WebpackPluginHtmlBuildInfo({
            name: "Jsorolla",
            version: require(path.join(__dirname, "package.json")).version,
            branch: childProcess.execSync("git rev-parse --abbrev-ref HEAD", {cwd: __dirname}).toString().trim(),
            commit: childProcess.execSync("git rev-parse HEAD", {cwd: __dirname}).toString().trim(),
            date: new Date().toString(),
        }),
    ],
};
