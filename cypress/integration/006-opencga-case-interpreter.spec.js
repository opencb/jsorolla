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

import {login, checkResults} from "../plugins/utils.js";
import {TIMEOUT} from "../plugins/constants.js";

const getCaseType = grid => {
    checkResults(grid);
    return cy.get("opencga-clinical-analysis-grid table tr[data-index=0] td:nth-child(1)  p[data-cy='case-type']", {timeout: 60000}).then(type => console.log("TYPE", type)).invoke("text")
};


context("6 - Case Interpreter", () => {
    before(() => {
        login();
        goTo("iva");
    });

    it("6.1 - check query results", () => {
        let caseId;

        cy.get("a[data-id=clinicalAnalysisPortal]", {timeout: TIMEOUT}).click({force: true});
        cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", "Case Portal");

        checkResults("opencga-clinical-analysis-grid");

        // reading from the first row the case Id, the proband Id, and the Family Id and use them as filters
        cy.get("opencga-clinical-analysis-grid table", {timeout: 60000})
            .find("tr[data-index=0]", {timeout: 60000})
            .then($tr => {
                const $caseId = Cypress.$("td:nth-child(1) a[data-cy='case-id']", $tr);
                const caseId = $caseId.text().trim();
                const caseType = Cypress.$("td:nth-child(1)  p[data-cy='case-type']", $tr).text().trim();
                const probandId = Cypress.$("td:nth-child(2) p[data-cy='proband-id']", $tr).text().trim();
                const probandSampleId = Cypress.$("td:nth-child(2)  p[data-cy='proband-sample-id']", $tr).text().trim();
                cy.wrap($caseId).click();
                cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", "Case Interpreter Case " + caseId);

                // test Case Interpreter in Family Cases
                console.log("caseType === \"FAMILY\"", caseType === "FAMILY")
                if (caseType === "FAMILY") {

                    /**
                     * Overview test
                     */
                    cy.get(".variant-interpreter-wizard a.variant-interpreter-step").contains("Case Info").click();
                    // check Case ID in Overview
                    cy.get("opencga-clinical-analysis-view > data-form .detail-row:nth-child(1)").contains("Case ID");
                    cy.get("opencga-clinical-analysis-view > data-form .detail-row:nth-child(1)").then($div => {
                        expect($div.first().text()).to.include(caseId);
                    });
                    // check Case Type in Overview
                    cy.get("opencga-clinical-analysis-view > data-form .detail-row:nth-child(4)").contains("Analysis Type");
                    cy.get("opencga-clinical-analysis-view > data-form .detail-row:nth-child(4)").then($div => {
                        expect($div.first().text()).to.include("FAMILY");
                    });


                    /**
                     * Quality control test
                     */
                    cy.get(".variant-interpreter-wizard a.variant-interpreter-step").contains("Quality Control").click();
                    // Default tab in Quality Control is Overview
                    cy.get("variant-interpreter-qc .content-tab-wrapper .content-tab.active .page-title h2").contains("Quality Control Overview - " + caseId);

                    // click on Quality Control/Sample Variant Stats
                    cy.get("variant-interpreter-qc .nav-tabs a[data-id=SampleVariantStats]").click();
                    cy.get("variant-interpreter-qc .content-tab-wrapper .content-tab.active .page-title h2").contains(`Sample Variant Stats - ${caseId} (${probandSampleId})`);
                    // checks there are 9 charts
                    cy.get("sample-variant-stats-view simple-chart").should("be.visible").and("have.length", 9);

                    // select PASS filter
                    cy.get("opencga-variant-filter file-quality-filter input[data-cy='filter-pass']").click();
                    cy.get("opencga-active-filters button[data-filter-name='filter']").contains("FILTER = PASS");
                    cy.get("div.search-button-wrapper button").click();

                    cy.wait(1000);
                    cy.get("sample-variant-stats-browser loading-spinner", {timeout: 120000}).should("not.exist");
                    // checks there are 9 charts after the search
                    cy.get("sample-variant-stats-view simple-chart").should("be.visible").and("have.length", 9);

                    /**
                     * Sample Variant Browser test
                     */
                    cy.get(".variant-interpreter-wizard a.variant-interpreter-step").contains("Sample Variant Browser").click();
                    checkResults("variant-interpreter-grid");

                    cy.get("opencga-active-filters button[data-filter-name='sample']").contains("Sample Genotype");
                    cy.get("opencga-variant-filter file-quality-filter input[data-cy='filter-pass']").click();
                    cy.get("opencga-active-filters button[data-filter-name='filter']").contains("FILTER = PASS");
                    cy.get("div.search-button-wrapper button").click();
                    checkResults("variant-interpreter-grid");

                    // check Disease Panel select is actually populated (but not querying for Diseases)
                    cy.get("a[data-accordion-id=Clinical].collapsed").click();
                    cy.get("disease-panel-filter").should("be.visible");
                    cy.get("disease-panel-filter button").click();
                    cy.get("disease-panel-filter select-field-filter ul.dropdown-menu li").should("have.length.above", 0);
                    cy.get("disease-panel-filter button").click();

                    // query LoF
                    cy.get("opencga-variant-filter a[data-accordion-id='ConsequenceType'].collapsed").click();
                    cy.get("consequence-type-select-filter input[value='Loss-of-Function (LoF)'").click({force: true});
                    cy.get("opencga-active-filters button[data-filter-name='ct']").contains("Consequence Types");
                    cy.get("div.search-button-wrapper button").click();
                    checkResults("variant-interpreter-grid");
                }

            });


    });


});
