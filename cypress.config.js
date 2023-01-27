const {defineConfig} = require("cypress");

module.exports = defineConfig({
    chromeWebSecurity: false,
    viewportWidth: 1600,
    viewportHeight: 1200,
    video:false,
    reporter: "cypress-mochawesome-reporter",
    reporterOptions: {
        charts:true,
        embeddedScreenshots:true,
        timestamp: "ddmmyyyyhhmmss",
        reportFilename:"[status]_[datetime]-[name]-report",
        reportPageTitle:"Jsorolla Report Test",
        reportDir: "cypress/reports",
        overwrite: false,
        html: false,
        json: true,
    },
    e2e: {
        baseUrl: "http://localhost:3000/src/sites/test-app/",
        setupNodeEvents(on,config) {
            require("cypress-mochawesome-reporter/plugin")(on);
        }
    },
    env: {
        hideXHR: true,
    },
    experimentalWebKitSupport: true,
});
