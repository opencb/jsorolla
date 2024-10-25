/* eslint-disable no-undef */
/* eslint-disable no-param-reassign */
const HtmlWebpackPlugin = require("html-webpack-plugin");

class WebpackPluginHtmlAssetsFix {

    static PLUGIN_NAME = "WebpackPluginHtmlAssetsFix";

    apply(compiler) {
        compiler.hooks.compilation.tap(WebpackPluginHtmlAssetsFix.PLUGIN_NAME, compilation => {
            const compilationHooks = HtmlWebpackPlugin.getCompilationHooks(compilation);
            compilationHooks.beforeAssetTagGeneration.tapAsync(WebpackPluginHtmlAssetsFix.PLUGIN_NAME, (data, callback) => {
                const chunk = data.plugin.userOptions.chunks[0];
                ["js", "css"].forEach(type => {
                    data.assets[type] = (data.assets[type] || [])
                        .filter(file => !!file)
                        .map(file => file.replace("../" + chunk, "."));
                });
                return callback(null, data);
            });
        });
    }

}

module.exports = WebpackPluginHtmlAssetsFix;
