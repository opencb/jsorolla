const {defineConfig} = require("cypress");

const urlTest = {
    local: "http://localhost:3000/src/sites/iva/",
};

module.exports = defineConfig({
    chromeWebSecurity: false,
    viewportWidth: 1600,
    viewportHeight: 1200,
    reporter: "mochawesome",
    numTestsKeptInMemory: 10, // To avoid cypress app crashed
    reporterOptions: {
        overwrite: false,
        html: false,
        json: true,
    },
    env: {
        apiUrl: "https://ws.opencb.org/opencga-test/webservices/rest/v2",
        study: "demo@family:platinum",
        username: "demouser",
        password: "demouser",
        hideXHR: true, // avoid noisy xhr
        // coverage: true
    },
    e2e: {
        // We've imported your old cypress plugins here.
        // You may want to clean this up later by importing these.
        experimentalSessionAndOrigin: true,
        baseUrl: urlTest.local,
        // https://docs.cypress.io/guides/references/migration-guide#Plugins-File-Removed
        setupNodeEvents(on, config) {
            // require("@cypress/code-coverage/task")(on, config);
            // include any other plugin code
            // It's IMPORTANT to return the config object
            // with any changed environment variables
            return config;
        },
    },
});
