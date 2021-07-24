const path = require("path");
const webpack = require("webpack");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlReplaceWebpackPlugin = require("html-replace-webpack-plugin");
// const StringReplacePlugin = require("string-replace-webpack-plugin"); webpack 2
const EsmWebpackPlugin = require("@purtuga/esm-webpack-plugin");
const PluginProposalExportDefaultFrom = require("@babel/plugin-proposal-export-default-from"); // Allows `export .. from` syntax in the entry point
const MergeIntoSingleFilePlugin = require("webpack-merge-and-include-globally");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const packageJson = require("./package.json");
const DIST_PATH = path.resolve(__dirname, "build/");
const revision = require("./rev-info.js");

const tpl = path => ({
    img: `<img alt="${path}" src="${path}" />`,
    css: `<link rel="stylesheet" type="text/css" href="${path}">`,
    js: `<script type="text/javascript" src="${path}"></script>`,
    void: ""
});

// TODO add CSS loader and group all fonts in one directory rewriting urls

module.exports = {
    mode: "production",
    entry: {
        "iva-app": "./src/iva-app.js"
    },
    output: {
        filename: "[name][hash].js",
        path: DIST_PATH
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: "./src/index.html",
            minify: {
                removeAttributeQuotes: true,
                collapseWhitespace: true
                // removeComments: true //cannot be uncommented because of HtmlReplaceWebpackPlugin depends on comments
            }
        }),
        new HtmlReplaceWebpackPlugin([
            {
                // mimic the behaviour of Grunt processhtml (for the assets defined in MergeIntoSingleFilePlugin())
                pattern: /<!-- build:([\s\S]*?)\[([\s\S]*?)] -->[\s\S]*?<!-- \/build -->/m,
                replacement: function (match, type, path) {
                    return tpl(path)[type];
                }
            },
            {
                pattern: /\[build-signature\]/m,
                replacement: function (match, type, path) {
                    return revision;
                }
            }
        ]
        ),
        new MergeIntoSingleFilePlugin({
            files: {
                "assets/css/styles.css": [
                    "lib/jsorolla/styles/css/global.css",
                    "lib/jsorolla/styles/css/style.css",
                    "src/styles/toggle-switch.css",
                    "src/styles/magic-check.css",
                    "src/styles/global.css"
                ],
                "assets/css/vendor.css": [
                    "./node_modules/bootstrap/dist/css/bootstrap.min.css",
                    "./node_modules/animate.css/animate.min.css",
                    "./node_modules/bootstrap-table/dist/bootstrap-table.min.css",
                    "./node_modules/bootstrap-select/dist/css/bootstrap-select.min.css",
                    "./node_modules/bootstrap-treeview/dist/bootstrap-treeview.min.css",
                    "./node_modules/bootstrap-colorpicker/dist/css/bootstrap-colorpicker.min.css",
                    "./node_modules/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css",
                    "./node_modules/@fortawesome/fontawesome-free/css/all.min.css",
                    "./node_modules/qtip2/dist/jquery.qtip.min.css",
                    "./node_modules/jquery.json-viewer/json-viewer/jquery.json-viewer.css",
                    "./node_modules/tokenize2/dist/tokenize2.min.css",
                    "./node_modules/sweetalert2/dist/sweetalert2.css",
                    "./node_modules/select2/dist/css/select2.css",
                    "./node_modules/select2-bootstrap-theme/dist/select2-bootstrap.css"
                ],
                "assets/js/vendor.js": [
                    "./node_modules/jquery/dist/jquery.js",
                    "./node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js",
                    "./node_modules/lodash/lodash.min.js",
                    "./node_modules/backbone/backbone-min.js",
                    "./node_modules/highcharts/highcharts.js",
                    "./node_modules/qtip2/dist/jquery.qtip.min.js",
                    "./node_modules/urijs/src/URI.min.js",
                    "./node_modules/cookies-js/dist/cookies.min.js",
                    "./node_modules/crypto-js/core.js",
                    "./node_modules/crypto-js/sha256.js",
                    "./node_modules/jquery.json-viewer/json-viewer/jquery.json-viewer.js",
                    "./node_modules/bootstrap/dist/js/bootstrap.min.js",
                    "./node_modules/bootstrap-table/dist/bootstrap-table.min.js",
                    "./node_modules/bootstrap-select/dist/js/bootstrap-select.js",
                    "./node_modules/bootstrap-treeview/dist/bootstrap-treeview.min.js",
                    "./node_modules/bootstrap-colorpicker/dist/js/bootstrap-colorpicker.min.js",
                    "./node_modules/bootstrap-validator/dist/validator.min.js",
                    "./node_modules/moment/min/moment.min.js",
                    "./node_modules/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js",
                    "./node_modules/bootstrap-notify/bootstrap-notify.js",
                    "./node_modules/jwt-decode/build/jwt-decode.min.js",
                    "./node_modules/tokenize2/dist/tokenize2.min.js",
                    "./node_modules/bootstrap-3-typeahead/bootstrap3-typeahead.min.js",
                    "./node_modules/@svgdotjs/svg.js/dist/svg.min.js",
                    "./node_modules/sweetalert2/dist/sweetalert2.js",
                    "./node_modules/clipboard/dist/clipboard.min.js",
                    "./node_modules/select2/dist/js/select2.min.js"
                ]
            },
            transform: {
                "assets/js/vendor.js": code => require("uglify-js").minify(code).code,
                "assets/css/styles.css": code => require("uglifycss").processString(code)
            }
        }),
        new CopyWebpackPlugin([
            {
                context: "./",
                from: "LICENSE",
                to: DIST_PATH
            },
            {
                context: "./",
                from: "README.md",
                to: DIST_PATH
            },
            {
                context: "./src/conf",
                from: "**/*.js",
                to: DIST_PATH + "/conf"
            },
            {
                from: "./favicon.ico",
                to: DIST_PATH + "/"
            },
            {
                context: "./src/img",
                from: "**/*",
                to: DIST_PATH + "/img"
            },
            {
                context: "./lib/jsorolla/styles/fonts",
                from: "**/*",
                to: DIST_PATH + "/assets/fonts"
            },
            {
                context: "./node_modules/bootstrap/dist/fonts",
                from: "**/*",
                to: DIST_PATH + "/assets/fonts"
            },
            {
                context: "node_modules/@webcomponents/webcomponentsjs",
                from: "**/*.js",
                to: DIST_PATH + "/webcomponents"
            },
            {
                context: "node_modules/@fortawesome/fontawesome-free/webfonts",
                from: "*",
                to: DIST_PATH + "/assets/webfonts"

            }
        ]),
        /* new MethodExtractor({options: true, output: DIST_PATH + "/conf", components: [
            "./lib/jsorolla/src/core/webcomponents/opencga/catalog/cohorts/opencga-cohort-browser.js"
            ]})*/
        // ignore is not the best way to externalize a resource, but webpack don't support external ES modules yet.
        // ignore makes sense because iva-app bundle will be an ES module on its own, so import X from "/jsorolla.min.js" won't be a problem if not processed by webpack
        // why do whe need to bundle iva-app in webpack at all then? Because we need to process litElement imports
        new webpack.IgnorePlugin({
            checkResource(resource) {
                // console.log("res", resource)
                // if (resource === "./conf/opencga-variant-browser.config.js") return true;
                // return false;
            }

            // resourceRegExp: /import [\s\S]+? from "\.\/\.\.\/lib\/jsorolla\/dist\/main\.js";/
            // resourceRegExp: /import [\s\S]+? from "main\.js";/
            // resourceRegExp: /^\.\/locale$/,
            // contextRegExp: /moment$/
        })
        // new ESLintPlugin({fix:false})

    ],
    optimization: {
        minimize: true
        /* minimizer: [
            new TerserPlugin({
                terserOptions: {
                    keep_classnames: true,
                    keep_fnames: true
                }
            })
        ]*/
    },
    /* externals: [
        {
            "externalConfig": "./conf/external-config.js"
        }
    ],*/
    module: {
        rules: [
            // es-lint check step
            /* {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ["babel-loader", "eslint-loader"]
            },*/
            /* {
                // Test for a polyfill (or any file) and it won't be included in your
                // bundle
                test: path.resolve(__dirname, "src/conf/external-config.js"),
                use: "null-loader"
            },*/
            {
                test: /\.html$/,
                use: ["html-loader"] // rewrite html content (replace automatically <img src="img.jpg"/> in require("img.jpg"))
            },
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [[
                            "@babel/preset-env",
                            {
                                // useBuiltIns: "usage",
                                // targets: ">20%, not dead, not ie 11" //browserslist query now defined in package.json
                                // corejs: 3
                            }
                        ]],
                        plugins: [
                            "@babel/plugin-proposal-export-default-from",
                            // "@babel/regenerator-runtime/runtime",
                            "@babel/transform-runtime",
                            ["@babel/plugin-proposal-class-properties", {"loose": true}]
                        ]
                    }
                }
            },
            {
                test: /\.js$/,
                loader: "string-replace-loader",
                options: {
                    multiple: [
                        {
                            search: "/web_modules/lit-element.js",
                            replace: "lit-element"
                        },
                        {
                            search: "/web_modules/lit-html.js",
                            replace: "lit-html"
                        },
                        {
                            search: "/web_modules/lit-html/directives/class-map.js",
                            replace: "lit-html/directives/class-map.js"
                        },
                        {
                            search: "/web_modules/lit-html/directives/if-defined.js",
                            replace: "lit-html/directives/if-defined.js"
                        },
                        {
                            search: "/node_modules/countup.js/dist/countUp.min.js",
                            replace: "countup.js"
                        }
                        /* js string replacement
                        {
                            search: "// @dev\\[([\\s\\S]*?)\\][\\s\\S]*?// /@dev",
                            replace: (match, p1, offset, string) => `import ${p1} from "main.js";`,
                            //replace: (match, p1, offset, string) => `${p1}`,
                            flags: "gim",
                            strict: true
                        }*/
                    ]

                }
            }

        ]

    }
};
