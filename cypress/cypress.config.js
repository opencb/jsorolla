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
