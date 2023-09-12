/* eslint-disable no-undef */
const {defineConfig} = require("cypress");
const cypressSplit = require("cypress-split");

module.exports = defineConfig({
    chromeWebSecurity: false,
    viewportWidth: 1600,
    viewportHeight: 1200,
    video: false,
    reporter: "cypress-mochawesome-reporter",
    reporterOptions: {
        charts: true,
        embeddedScreenshots: true,
        timestamp: "ddmmyyyyhhmmss",
        reportFilename: "[status]_[datetime]-[name]-report",
        reportPageTitle: "Jsorolla Report Test",
        reportDir: "cypress/reports",
        overwrite: false,
        html: false,
        json: true,
    },
    e2e: {
        baseUrl: "http://localhost:4000/test-app/index.html",
        setupNodeEvents(on, config) {
            require("cypress-mochawesome-reporter/plugin")(on);
            cypressSplit(on, config);
            return config;
        },
        defaultCommandTimeout: 12000
    },
    env: {
        // it has limitation compared to nyc configuration
        // codeCoverage: {
        //     include: "src/**/*.js",
        //     exclude: "cypress/**/*.*",
        // },
        // coverage: true,
        hideXHR: true,
        apiUrl: "",
        study: "demo@",
        user: "",
        pass: ""
    },
    experimentalWebKitSupport: true,
});
