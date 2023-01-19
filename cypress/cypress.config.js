const {defineConfig} = require("cypress");

module.exports = defineConfig({
    chromeWebSecurity: false,
    viewportWidth: 1600,
    viewportHeight: 1200,
    reporter: "mochawesome",
    reporterOptions: {
        overwrite: false,
        html: false,
        json: true,
    },
    e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
        setupNodeEvents(on, config) {
            return require("../cypress/plugins/index.js")(on, config);
        },
        baseUrl: "http://localhost:3000/src/sites/test-app/",
    },
    // component: {
    //     supportFile: "cypress/support/component.js",
    //     devServer: {
    //         bundler: "vite",
    //     },
    //     indexHtmlFile: "cypress/support/component-index.html",
    // },
    experimentalWebKitSupport: true,
});
