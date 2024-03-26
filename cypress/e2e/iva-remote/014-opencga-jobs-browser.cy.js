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

import {TIMEOUT} from "../../support/constants.js";
import UtilsTest from "../../support/utils-test.js";

context("14. Jobs Browser", () => {
    before(() => {
        UtilsTest.login();
        UtilsTest.goTo("iva");
    });

    it("14.1 - query", () => {
        cy.get("a[data-id=job]", {timeout: TIMEOUT}).click({force: true});
        cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", "Jobs Browser");

        UtilsTest.checkResults("opencga-job-grid");

        UtilsTest.getResult("opencga-job-grid", 1).then($text => {
            UtilsTest.selectToken("jobs-id-autocomplete", $text);
        });

        UtilsTest.getResult("opencga-job-grid", 2).then($text => {
            UtilsTest.selectToken("analysis-tool-id-autocomplete", $text);
        });

        cy.get(".lhs button[data-filter-name]").should("have.length", 2);

        cy.get("div.search-button-wrapper button").click();
        UtilsTest.checkResults("opencga-job-grid");

        cy.get("opencga-active-filters button[data-filter-name='id']").click();
        UtilsTest.checkResults("opencga-job-grid");

        cy.get("opencga-active-filters button[data-filter-name='tool']").click();
        UtilsTest.checkResults("opencga-job-grid");

        cy.get("#priority + .subsection-content a").click({force: true, multiple: true});

        cy.get(".lhs button[data-filter-name]").should("have.length", 1);
        cy.get("div.search-button-wrapper button").click();

        UtilsTest.checkResults("opencga-job-grid");
        UtilsTest.changePage("opencga-job-grid", 2);
        UtilsTest.checkResults("opencga-job-grid");
        UtilsTest.changePage("opencga-job-grid", 1);
        UtilsTest.checkResults("opencga-job-grid");

        UtilsTest.dateFilterCheck("opencga-job-grid");

    });

    it("14.2 - aggregated query", () => {
        cy.get("a[data-id=job]").click({force: true});
        cy.get("a[href='#facet_tab']").click({force: true});


        UtilsTest.facet.selectDefaultFacet(); // "creationYear>>creationMonth", "toolId>>executorId"

        UtilsTest.facet.checkActiveFacet("creationYear", "creationYear>>creationMonth");
        UtilsTest.facet.checkActiveFacet("toolId", "toolId>>executorId");

        UtilsTest.facet.checkActiveFacetLength(2);
        cy.get("div.search-button-wrapper button").click();
        UtilsTest.facet.checkResultLength(2);

        UtilsTest.facet.select("Tool Id"); // removing toolId

        UtilsTest.facet.checkActiveFacetLength(1);
        cy.get("div.search-button-wrapper button").click();
        UtilsTest.facet.checkResultLength(1);

    });
});
