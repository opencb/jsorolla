const path = require("path");
const regeneratorRuntime = require("regenerator-runtime"); // TODO fix generators and AsyncFunction in babel
const CopyWebpackPlugin = require("copy-webpack-plugin");
const EsmWebpackPlugin = require("@purtuga/esm-webpack-plugin");
const PluginProposalExportDefaultFrom = require("@babel/plugin-proposal-export-default-from"); //Allows export .. from syntax in the entry point

/*
var fs = require('fs');
fs.writeFile("dir.txt", Object.values(glob_entries("./src/core/!**!/!*.js")).map(entry => `import "${entry}";`).join("\n"), function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});
console.log(Object.values(glob_entries("./src/core/!**!/!*.js")).map(entry => `import "${entry}";`).join("\n"))*/


module.exports = {
    entry: "./src/index.js",
    devtool: "source-map",
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist"),
        library: "jsorolla",
        libraryTarget: "var"
    },
    plugins: [
        new EsmWebpackPlugin(),
        new CopyWebpackPlugin([
            {
                context: "node_modules/@webcomponents/webcomponentsjs",
                from: "**/*.js",
                to: "webcomponents"
            }
        ])
    ],
    optimization: {
        minimize: false
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [[
                            "@babel/preset-env",
                            {
                                useBuiltIns: "usage",
                                targets: ">1%, not dead, not ie 11",
                                corejs: 3
                            }
                        ]],
                        // you need this even if you don't transpile..because of reasons
                        plugins: [
                            "@babel/plugin-proposal-export-default-from",
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
                            search: "/node_modules/countup.js/dist/countUp.min.js",
                            replace: "countup.js"
                        }
                    ]

                }
            }
        ]

    }
};
