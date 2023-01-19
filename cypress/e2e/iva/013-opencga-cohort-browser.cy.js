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

import {TIMEOUT} from "../../support/constants.js";
import UtilsTest from "../../support/UtilsTest.js";


context("13. Cohort Browser", () => {
    before(() => {
        UtilsTest.login();
        UtilsTest.goTo("iva");
    });

    it("13.1 - query", () => {
        cy.get("a[data-id=cohort]", {timeout: TIMEOUT}).click({force: true});
        cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", "Cohort Browser");
        UtilsTest.checkResults("opencga-cohort-grid");

        UtilsTest.getResult("opencga-cohort-grid").then($text => {
            UtilsTest.selectToken("cohort-id-autocomplete", $text);
        });
        cy.get(".lhs button[data-filter-name]").should("have.length", 1);
        cy.get("div.search-button-wrapper button").click();
        UtilsTest.checkResults("opencga-cohort-grid");
        cy.get("opencga-active-filters button[data-filter-name='id']").click();

        UtilsTest.checkResults("opencga-cohort-grid");
        UtilsTest.changePage("opencga-cohort-grid", 2);
        UtilsTest.checkResults("opencga-cohort-grid");
        UtilsTest.changePage("opencga-cohort-grid", 1);
        UtilsTest.checkResults("opencga-cohort-grid");

        UtilsTest.dateFilterCheck("opencga-cohort-grid");
        UtilsTest.annotationFilterCheck("opencga-cohort-grid");

    });

    it("13.2 - aggregated query", () => {
        cy.get("a[data-id=cohort]").click({force: true});

        cy.get("a[href='#facet_tab']").click({force: true});

        UtilsTest.facet.selectDefaultFacet(); // "creationYear>>creationMonth", "status", "numSamples[0..10]:1"

        UtilsTest.facet.checkActiveFacet("creationYear", "creationYear>>creationMonth");
        UtilsTest.facet.checkActiveFacet("status", "status");
        UtilsTest.facet.checkActiveFacet("numSamples", "numSamples[0..10]:1");


        UtilsTest.facet.checkActiveFacetLength(3);
        cy.get("div.search-button-wrapper button").click();
        UtilsTest.facet.checkResultLength(3);

        // cy.get("div.facet-wrapper button[data-filter-name='creationYear']").contains("creationYear>>creationMonth");

        cy.get("[data-id='status'] ul.dropdown-menu a").contains("READY").click({force: true}); // status=READY
        UtilsTest.facet.checkActiveFacet("status", "status[READY]");

        UtilsTest.facet.select("Status"); // removing status

        UtilsTest.facet.checkActiveFacetLength(2);
        cy.get("div.search-button-wrapper button").click();
        UtilsTest.facet.checkResultLength(2);


    });
});
