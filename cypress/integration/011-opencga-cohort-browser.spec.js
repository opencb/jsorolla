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

import {checkResults, login, getResult, Facet, changePage, dateFilterCheck, annotationFilterCheck} from "../plugins/utils.js";
import {TIMEOUT} from "../plugins/constants.js";


context("11 - Cohort Browser", () => {
    before(() => {
        login();
        goTo("iva");
    });

    it("11.1 - query", () => {
        cy.get("a[data-id=cohort]", {timeout: TIMEOUT}).click({force: true});
        cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", "Cohort Browser");
        checkResults("opencga-cohort-grid");

        getResult("opencga-cohort-grid").then($text => {
            cy.get("cohort-id-autocomplete input").type($text + "{enter}");
        });
        cy.get(".lhs button[data-filter-name]").should("have.length", 1);

        cy.get("div.search-button-wrapper button").click();

        checkResults("opencga-cohort-grid");
        changePage("opencga-cohort-grid", 2);
        checkResults("opencga-cohort-grid");
        changePage("opencga-cohort-grid", 1);
        checkResults("opencga-cohort-grid");

        dateFilterCheck("opencga-cohort-grid");
        annotationFilterCheck("opencga-cohort-grid");

    });

    it("11.2 - aggregated query", () => {
        cy.get("a[data-id=cohort]").click({force: true});

        cy.get("a[href='#facet_tab']").click({force: true});

        Facet.selectDefaultFacet(); // "creationYear>>creationMonth", "status", "numSamples[0..10]:1"

        Facet.checkActiveFacet("creationYear", "creationYear>>creationMonth");
        Facet.checkActiveFacet("status", "status");
        Facet.checkActiveFacet("numSamples", "numSamples[0..10]:1");


        Facet.checkActiveFacetLength(3);
        cy.get("div.search-button-wrapper button").click();
        Facet.checkResultLength(3);

        // cy.get("div.facet-wrapper button[data-filter-name='creationYear']").contains("creationYear>>creationMonth");

        cy.get("[data-id='status'] ul.dropdown-menu a").contains("READY").click({force: true}); // status=READY
        Facet.checkActiveFacet("status", "status[READY]");

        Facet.select("Status"); // removing status

        Facet.checkActiveFacetLength(2);
        cy.get("div.search-button-wrapper button").click();
        Facet.checkResultLength(2);


    });
});
