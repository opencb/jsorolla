const path = require("path");
const glob_entries = require("webpack-glob-entries");
const regeneratorRuntime = require("regenerator-runtime"); // TODO fix generators and AsyncFunction in babel

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
    // entry: glob_entries("./src/core/**/*.js"),
    entry: "./index.js",
    devtool: "source-map",
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist"),
        library: "jsorolla",
        libraryTarget: "var"
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
