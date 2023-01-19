/* eslint-disable cypress/no-unnecessary-waiting */
/**
 * Copyright 2015-2016 OpenCB
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


import UtilsTest from "../../support/UtilsTest.js";
import {TIMEOUT} from "../../support/constants.js";


const endpoints = [
    "Users", "Projects", "Studies", "Files", "Jobs", "Samples", "Individuals", "Families", "Cohorts", "Disease Panels",
    "Analysis - Alignment", "Analysis - Variant", "Analysis - Clinical", "Operations - Variant Storage", "Meta", "GA4GH", "Admin"
];

context("17. Rest API", () => {
    before(() => {
        UtilsTest.login();
        UtilsTest.goTo("iva");
    });

    it("15.0 - Check existence and order of endpoints", () => {
        cy.get(".navbar-nav li a[data-cy='rest-api']").click({force: true});

        cy.get("div[data-cy=rest-api-endpoints] .panel-title").each((item, i) => {
            cy.wrap(item).should("contain.text", endpoints[i]);
        });
    });
});
