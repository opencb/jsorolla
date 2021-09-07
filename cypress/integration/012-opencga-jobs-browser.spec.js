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

import {login, getResult, checkResults, Facet, changePage, dateFilterCheck, annotationFilterCheck} from "../plugins/utils.js";
import {TIMEOUT} from "../plugins/constants.js";


context("12 - Jobs Browser", () => {
    before(() => {
        login();
        goTo("iva");
    });

    it("12.1 - query", () => {
        cy.get("a[data-id=job]", {timeout: TIMEOUT}).click({force: true});
        cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", "Jobs Browser");

        checkResults("opencga-job-grid");

        getResult("opencga-job-grid", 1).then($text => {
            cy.get("jobs-id-autocomplete input").type($text + "{enter}");
        });
        getResult("opencga-job-grid", 2).then($text => {
            cy.get("analysis-tool-id-autocomplete input").type($text + "{enter}");
        });

        cy.get(".lhs button[data-filter-name]").should("have.length", 2);

        cy.get("div.search-button-wrapper button").click();
        checkResults("opencga-job-grid");

        cy.get("#priority + .subsection-content a").click({force: true, multiple: true});

        cy.get(".lhs button[data-filter-name]").should("have.length", 3);
        cy.get("div.search-button-wrapper button").click();

        checkResults("opencga-job-grid");
        changePage("opencga-job-grid", 2);
        checkResults("opencga-job-grid");
        changePage("opencga-job-grid", 1);
        checkResults("opencga-job-grid");

        dateFilterCheck("opencga-job-grid");
        annotationFilterCheck("opencga-job-grid");

    });

    it("12.1 - aggregated query", () => {
        cy.get("a[data-id=job]").click({force: true});
        cy.get("a[href='#facet_tab']").click({force: true});


        Facet.selectDefaultFacet(); // "creationYear>>creationMonth", "toolId>>executorId"

        Facet.checkActiveFacet("creationYear", "creationYear>>creationMonth");
        Facet.checkActiveFacet("toolId", "toolId>>executorId");

        Facet.checkActiveFacetLength(2);
        cy.get("div.search-button-wrapper button").click();
        Facet.checkResultLength(2);

        Facet.select("Tool Id"); // removing toolId

        Facet.checkActiveFacetLength(1);
        cy.get("div.search-button-wrapper button").click();
        Facet.checkResultLength(1);

    });
});
