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
import UtilsTest from "../../support/utils-test.js";


context("8. Sample Browser", () => {
    before(() => {
        UtilsTest.login();
        UtilsTest.goTo("iva");
    });

    it("8.1 - query", () => {
        cy.get("a[data-id=sample]", {timeout: TIMEOUT}).click({force: true});
        cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", "Sample Browser");

        UtilsTest.checkResults("sample-grid");
        UtilsTest.getResult("sample-grid").then($text => {
            UtilsTest.selectToken("sample-id-autocomplete", $text);
        });

        cy.get(".lhs button[data-filter-name]").should("have.length", 1);
        cy.get("div.cy-search-button-wrapper button").click();
        UtilsTest.checkResults("sample-grid");

        cy.get("#somatic + .cy-subsection-content label").contains("True").click({force: true}); // setting filter Somatic = true

        cy.get("opencga-active-filters button[data-filter-name='id']").click();
        cy.get("opencga-active-filters button[data-filter-name='somatic']").click();
        cy.get(".lhs button[data-filter-name]").should("have.length", 0);

        UtilsTest.checkResults("sample-grid");
        UtilsTest.changePage("sample-grid", 2);
        UtilsTest.checkResults("sample-grid");
        UtilsTest.changePage("sample-grid", 1);
        UtilsTest.checkResults("sample-grid");

        UtilsTest.dateFilterCheck("sample-grid");

        UtilsTest.annotationFilterCheck("sample-grid");

    });
    it("8.2 - aggregated query", () => {
        cy.get("a[data-id=sample]").click({force: true});
        cy.get("a[href='#facet_tab']").click({force: true});

        UtilsTest.facet.selectDefaultFacet(); // "creationYear>>creationMonth", "status", "phenotypes", "somatic"
        // cy.get("button.default-facets-button").click(); // "creationYear>>creationMonth", "status", "phenotypes", "somatic"

        UtilsTest.facet.checkActiveFacet("creationYear", "creationYear>>creationMonth");
        UtilsTest.facet.checkActiveFacet("status", "status");
        UtilsTest.facet.checkActiveFacet("somatic", "somatic");


        UtilsTest.facet.checkActiveFacetLength(3);
        cy.get("div.cy-search-button-wrapper button").click();
        UtilsTest.facet.checkResultLength(3);

        // cy.get("div.facet-wrapper button[data-filter-name='creationYear']").contains("creationYear>>creationMonth");

        cy.get("[data-id='status'] ul.dropdown-menu a").contains("READY").click({force: true}); // status=READY
        UtilsTest.facet.checkActiveFacet("status", "status[READY]");
        // cy.get("div.facet-wrapper button[data-filter-name='status']").contains("status[READY]");


        cy.get("[data-id='somatic'] ul.dropdown-menu a").contains("true").click({force: true}); // somatic=true
        UtilsTest.facet.checkActiveFacet("somatic", "somatic[true]");

        UtilsTest.facet.select("Status"); // removing status

        UtilsTest.facet.checkActiveFacetLength(2);
        cy.get("div.cy-search-button-wrapper button").click();
        UtilsTest.facet.checkResultLength(2);
    });
});
