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

import {login, goTo, checkResults, checkResultsOrNot} from "../plugins/utils.js";
import {TIMEOUT} from "../plugins/constants.js";


/**
 * Header bar (post-login)
 */
context("3 - Header bar (post-login): Checks each menu item in header-bar resolves correctly", () => {
    before(() => {
        login();
        goTo("iva");
    });

    it("3.1 - checks Variant Browser menu item", () => {
        cy.get("a[data-id=browser]", {timeout: TIMEOUT}).click({force: true});
        cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", "Variant Browser"); // should assertion comes from Chai and it follows its logic
        checkResults("variant-browser-grid");

    });

    it("3.2 - checks Case Portal menu item", () => {
        cy.get("a[data-id=clinicalAnalysisPortal]", {timeout: TIMEOUT}).click({force: true});
        cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", "Case Portal");
        checkResults("opencga-clinical-analysis-grid");
    });

    it("3.3 - checks Sample Browser menu item", () => {
        cy.get("a[data-id=sample]", {timeout: TIMEOUT}).click({force: true});
        cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", "Sample Browser");
        checkResults("opencga-sample-grid");
    });

    it("3.4 - checks Individual Browser menu item", () => {
        cy.get("a[data-id=individual]", {timeout: TIMEOUT}).click({force: true});
        cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", "Individual Browser"); // should assertion comes from Chai and it follows its logic
        checkResults("opencga-individual-grid");

    });

    it("3.5 - checks Family Browser menu item", () => {
        cy.get("a[data-id=family]", {timeout: TIMEOUT}).click({force: true});
        cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", "Family Browser"); // should assertion comes from Chai and it follows its logic
        checkResultsOrNot("opencga-family-grid");
    });

    it("3.6 - checks study selector menu items", () => {
        // switching between all the studies
        cy.get("a[data-study]").each(($el, index, $list) => {
            const study = $el.data("study");
            const studyName = $el.data("study-name");
            const projectName = $el.data("project-name");
            cy.get(`a[data-study='${study}'][data-project-name="${projectName}"]`).click({force: true});
            cy.get("a[data-cy='active-study']").should("be.visible").and("contain", studyName).and("contain", projectName);
        });
    });
    
    it("3.7 - checks User menu items", () => {
        cy.get("li[data-cy='user-menu'] > a").click();
        cy.get("a[data-user-menu='account']").click();
        cy.get("div.page-title h2").should("be.visible").and("contain", "Your profile");

        // cy.get("li[data-cy='user-menu'] > a").click();
        // cy.get("a[data-user-menu='logout']").click(); // TODO fix it makes Family Browser test fails because somehow it is still pending.

    });
});
