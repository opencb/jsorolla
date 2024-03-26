/*
 * Copyright 2015-2024 OpenCB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-undef */
const {defineConfig} = require("cypress");

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
        baseUrl: "http://localhost:4000/test-app/",
        setupNodeEvents: on => {
            require("cypress-mochawesome-reporter/plugin")(on);
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
