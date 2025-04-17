/* eslint-disable no-undef */
/* eslint-disable no-param-reassign */
const HtmlWebpackPlugin = require("html-webpack-plugin");

class WebpackPluginHtmlBuildInfo {

    static PLUGIN_NAME = "WebpackPluginHtmlBuildInfo";

    constructor(options) {
        this.options = options;
    }

    apply(compiler) {
        compiler.hooks.compilation.tap(WebpackPluginHtmlBuildInfo.PLUGIN_NAME, compilation => {
            const compilationHooks = HtmlWebpackPlugin.getCompilationHooks(compilation);
            compilationHooks.beforeEmit.tapAsync(WebpackPluginHtmlBuildInfo.PLUGIN_NAME, (data, callback) => {
                const lines = data.html.split("\n");
                // find the index where the <head> begins
                const headStartIndex = lines.findIndex(line => {
                    return line.trim().startsWith("<head>");
                });
                if (headStartIndex > -1) {
                    lines.splice(headStartIndex + 1, 0, `    -->`);
                    lines.splice(headStartIndex + 1, 0, `        Build generated on: ${this.options.date}`);
                    lines.splice(headStartIndex + 1, 0, `        ${this.options.name} Version: ${this.options.version} | Git: ${this.options.branch} - ${this.options.commit}`);
                    lines.splice(headStartIndex + 1, 0, `    <!--`);
                    data.html = lines.join("\n");
                }
                return callback(null, data);
            });
        });
    }

}

module.exports = WebpackPluginHtmlBuildInfo;
