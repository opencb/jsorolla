/* eslint-disable no-undef */
/* eslint-disable no-param-reassign */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

class WebpackPluginHtmlGlobalAssets {

    static PLUGIN_NAME = "WebpackPluginHtmlGlobalAssets";

    constructor(options) {
        this.options = options;
        this.generatedFilesByChunk = {};
    }

    createHash(content) {
        return crypto.createHash("sha256").update(content).digest("hex");
    }

    apply(compiler) {
        compiler.hooks.compilation.tap(WebpackPluginHtmlGlobalAssets.PLUGIN_NAME, compilation => {
            // 1. hook to generate global assets
            const processAssetsOptions = {
                name: WebpackPluginHtmlGlobalAssets.PLUGIN_NAME,
                stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
            };
            compilation.hooks.processAssets.tapAsync(processAssetsOptions, (_, callback) => {
                const cwd = this.options.cwd || process.cwd();
                (this.options.chunks || []).forEach(chunk => {
                    const shouldGenerate = Array.from(compilation.chunks).filter(c => c.name === chunk && c.rendered).length > 0;
                    if (shouldGenerate && !this.generatedFilesByChunk[chunk]) {
                        this.generatedFilesByChunk[chunk] = [];
                        // iterate over all files in this.options.files
                        Object.keys(this.options.files).forEach(outputFileName => {
                            const content = this.options.files[outputFileName]
                                .map(file => fs.readFileSync(path.join(cwd, file), "utf8"))
                                .join(this.options.separator || "\n");
                            // generate the hash of the content
                            const contenthash = this.createHash(content).slice(0, 20);
                            const fileName = outputFileName.replace("[contenthash]", contenthash).replace("[name]", chunk);
                            const fileSource = new webpack.sources.RawSource(content);
                            compilation.emitAsset(fileName, fileSource);
                            this.generatedFilesByChunk[chunk].push(fileName);
                        });
                    }
                });
                return callback();
            });
            // 2. hook to inject the generated assets into the html
            const compilationHooks = HtmlWebpackPlugin.getCompilationHooks(compilation);
            compilationHooks.beforeAssetTagGeneration.tapAsync(WebpackPluginHtmlGlobalAssets.PLUGIN_NAME, (data, callback) => {
                const chunk = data.plugin.userOptions.chunks[0];
                if (this.generatedFilesByChunk[chunk]) {
                    this.generatedFilesByChunk[chunk].forEach(file => {
                        const type = file.endsWith(".js") ? "js" : "css";
                        // Note: we have to replace the chunk name with "./" to make the path relative
                        data.assets[type].unshift(file.replace(chunk + "/", "./"));
                    });
                }
                return callback(null, data);
            });
        });
    }

}

module.exports = WebpackPluginHtmlGlobalAssets;
