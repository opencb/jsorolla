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

context("12. File Browser", () => {
    before(() => {
        UtilsTest.login();
        UtilsTest.goTo("iva");
    });

    it("12.1 - query", () => {
        cy.get("a[data-id=file]", {timeout: TIMEOUT}).click({force: true});
        cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", "File Browser");

        UtilsTest.checkResults("opencga-file-grid");

        UtilsTest.getResult("opencga-file-grid").then($text => {
            UtilsTest.selectToken("file-name-autocomplete", $text);
        });

        cy.get(".lhs button[data-filter-name]").should("have.length", 1);
        cy.get("div.search-button-wrapper button").click();
        UtilsTest.checkResults("opencga-file-grid");
        cy.get("opencga-active-filters button[data-filter-name='name']").click();
        UtilsTest.checkResults("opencga-file-grid");

        cy.get("#format + .subsection-content a").contains("VCF").click({force: true});
        cy.get("#bioformat + .subsection-content a").contains("VARIANT").click({force: true});

        cy.get(".lhs button[data-filter-name]").should("have.length", 3);
        cy.get("div.search-button-wrapper button").click();

        UtilsTest.checkResults("opencga-file-grid");
        UtilsTest.changePage("opencga-file-grid", 2);
        UtilsTest.checkResults("opencga-file-grid");
        UtilsTest.changePage("opencga-file-grid", 1);
        UtilsTest.checkResults("opencga-file-grid");

        UtilsTest.dateFilterCheck("opencga-file-grid");
        UtilsTest.annotationFilterCheck("opencga-file-grid");


    });

    it("12.2 - aggregated query", () => {
        cy.get("a[data-id=file]").click({force: true});
        cy.get("a[href='#facet_tab']").click({force: true});

        UtilsTest.facet.selectDefaultFacet(); // "creationYear>>creationMonth", "bioformat", "format>>bioformat", "status", "size[0..214748364800]:10737418240", "numSamples[0..10]:1"

        UtilsTest.facet.checkActiveFacet("creationYear", "creationYear>>creationMonth");
        // cy.get("div.facet-wrapper button[data-filter-name='creationYear']").contains("creationYear>>creationMonth");

        UtilsTest.facet.checkActiveFacet("format", "format>>bioformat");
        // cy.get("div.facet-wrapper button[data-filter-name='format']").contains("format>>bioformat");

        UtilsTest.facet.checkActiveFacet("bioformat", "bioformat");
        // cy.get("div.facet-wrapper button[data-filter-name='bioformat']").contains("bioformat");

        UtilsTest.facet.checkActiveFacet("status", "status");
        // cy.get("div.facet-wrapper button[data-filter-name='status']").contains("status");

        UtilsTest.facet.checkActiveFacet("size", "size[0..214748364800]:10737418240");
        // cy.get("div.facet-wrapper button[data-filter-name='size']").contains("size[0..214748364800]:10737418240");

        UtilsTest.facet.checkActiveFacet("numSamples", "numSamples[0..10]:1");
        // cy.get("div.facet-wrapper button[data-filter-name='numSamples']").contains("numSamples[0..10]:1");


        cy.get("[data-id='status'] ul.dropdown-menu a").contains("READY").click({force: true}); // status=READY
        UtilsTest.facet.checkActiveFacet("status", "status[READY]");
        // cy.get("div.facet-wrapper button[data-filter-name='status']").contains("status[READY]");

        cy.get("div.search-button-wrapper button").click();

        UtilsTest.facet.checkActiveFacetLength(6);
        UtilsTest.facet.checkResultLength(6);
        // cy.get("div.facet-wrapper button[data-filter-value]", {timeout: TIMEOUT}).should("have.length", 6);
        // cy.get("opencb-facet-results opencga-facet-result-view", {timeout: TIMEOUT}).should("have.length", 6);


        UtilsTest.facet.select("Creation Year"); // removing Creation Year
        // cy.get("facet-filter .facet-selector li a").contains("Creation Year").click({force: true}); // creationYear remove

        UtilsTest.facet.checkActiveFacetLength(5);
        cy.get("div.search-button-wrapper button").click();
        UtilsTest.facet.checkResultLength(5);

        // cy.get("div.facet-wrapper button[data-filter-value]", {timeout: TIMEOUT}).should("have.length", 5);
        // cy.get("div.search-button-wrapper button").click();
        // cy.get("opencb-facet-results opencga-facet-result-view", {timeout: TIMEOUT}).should("have.length", 5);

        UtilsTest.facet.select("Creation Year"); // adding Creation Year
        cy.get("a[data-collapse=\"#creationYear_nested\"]").click({force: true});
        cy.get("#creationYear_nested select-field-filter div.dropdown-menu a").contains("Creation Month").click({force: true}); // Creation Month nested in Year field

        // removing all values but `creationYear` and `format` through the select, not active-filter
        UtilsTest.facet.select("Bioformat");
        UtilsTest.facet.select("Status");
        UtilsTest.facet.select("Size");
        UtilsTest.facet.select("Number Of Samples");

        UtilsTest.facet.checkActiveFacetLength(2);
        cy.get("div.search-button-wrapper button").click();
        UtilsTest.facet.checkResultLength(2);

    });
});
