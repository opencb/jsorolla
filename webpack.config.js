const path = require("path");
const glob_entries = require("webpack-glob-entries");


module.exports = {
    entry: glob_entries("./src/core/**/*.js"),
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist")
    },
    plugins: [],
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
                        presets: ["@babel/preset-env"],
                        plugins: [
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
