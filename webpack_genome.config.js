const path = require("path");
const webpack = require("webpack");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const packageJson = require("./package.json");
const DIST_PATH = path.resolve(__dirname, "build/");
const execSync = require("child_process").execSync;
const {option} = require("grunt");
const CopyPlugin = require("copy-webpack-plugin");
const MergeIntoFile = require("webpack-merge-and-include-globally");
const ivaPath = path.resolve(__dirname, "src/sites/iva");

// const StringReplacePlugin = require("string-replace-webpack-plugin"); webpack 2
// const EsmWebpackPlugin = require("@purtuga/esm-webpack-plugin");
// const PluginProposalExportDefaultFrom = require("@babel/plugin-proposal-export-default-from"); // Allows `export .. from` syntax in the entry point
// const TerserPlugin = require("terser-webpack-plugin");
// const ESLintPlugin = require("eslint-webpack-plugin");
// const revision = require("./rev-info.js");

const revision = () => {
    try {
        const jsorollaBranch = execSync("git rev-parse --abbrev-ref HEAD").toString();
        const jsorollaSha1 = execSync("git rev-parse HEAD").toString();
        return `~
        ~ Jsorolla Version: ${packageJson.version} | Git: ${jsorollaBranch.trim()} - ${jsorollaSha1.trim()}
        ~ Build generated on: ${new Date()}`;
    } catch (error) {
        console.error(`
            Status: ${error.status}
            ${error.stderr.toString()}
        `);
    }
};

const handler = (percentage, message, ...args) => {
    // e.g. Output each progress message directly to the console:
    console.info(percentage, message, ...args);
};


module.exports = {
    mode: "production",
    optimization: {
        splitChunks: {
            cacheGroups: {
                styles: {
                    name: "styles",
                    type: "css/mini-extract",
                    chunks: "all",
                    enforce: true,
                },
                // vendor: {
                //     test: /[\\/]node_modules[\\/](jquery|backbone|underscore|qtip2|urijs|cookies-js|crypto-js)[\\/]/,
                //     name: "vendor",
                //     chunks: "all"
                // }
            }
        }
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                exclude: [path.resolve(__dirname, "styles/fonts"), path.resolve(__dirname, "styles/img")],
                use: [MiniCssExtractPlugin.loader, "css-loader"]
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"],
                        plugins: [
                            "@babel/plugin-proposal-export-default-from",
                            "@babel/plugin-proposal-nullish-coalescing-operator",
                            "@babel/transform-runtime",
                            ["@babel/plugin-proposal-class-properties", {"loose": false}]
                        ]
                    }
                }
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                type: "asset/resource",
                generator: {
                    filename: "fonts/[name].[ext]"
                }
            },
            {
                test: /\.(png|jpg|gif)$/,
                include: path.resolve(__dirname, "styles/img"),
                type: "asset/resource",
                generator: {
                    filename: "img/[hash][ext][query]"
                }
            },
        ]
    },
    plugins: [
        new webpack.ProgressPlugin(handler),
        new CleanWebpackPlugin(),
        new CopyPlugin({
            patterns: [
                {
                    context: path.resolve(__dirname, "src/genome-browser"),
                    from: "config.js",
                    to: path.resolve(__dirname, "dist-genome")
                }
            ]
        }),
        new MiniCssExtractPlugin({
            filename: "[name][contenthash].css",
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "src/genome-browser/demo", "template-genome-browser.html")
        }),
        new webpack.ProvidePlugin({
            "URI": "urijs",
            "_": "underscore",
            "Backbone": "backbone",
        }),
        new MergeIntoFile({
            files: {
                "assets/css/vendor.css": [
                    "./node_modules/qtip2/dist/jquery.qtip.min.css",
                ],
                "assets/js/vendor.js": [
                    "./node_modules/jquery/dist/jquery.js",
                    "./node_modules/qtip2/dist/jquery.qtip.min.js",
                ]},
            transform: {
                "assets/js/vendor.js": code => require("uglify-js").minify(code).code,
                "assets/css/vendor.css": code => require("uglifycss").processString(code)
            }
        })
    ],
    entry: path.resolve(__dirname, "src/genome-browser/demo", "index-genome-browser.js"),
    output: {
        path: path.resolve(__dirname, "dist-genome"),
        filename: "genome_[contenthash].js"
    }
};

