const {defineConfig} = require("cypress");

/* module.exports = defineConfig({
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
            // implement node event listeners here
        },
        baseUrl: "http://localhost:3000/src/sites/iva/",
        excludeSpecPattern: [
            "012-opencga-file-browser.cy.js",
            "013-opencga-cohort-browser.cy.js",
            "014-opencga-jobs-browser.cy.js",
            // "016-rga-browser.cy.js",
        ],
    },
});*/

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
        baseUrl: "http://localhost:3000",
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
    }
});
