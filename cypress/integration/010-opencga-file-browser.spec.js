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


context("10 - File Browser", () => {
    before(() => {
        login();
        goTo("iva");
    });

    it("10.1 - query", () => {
        cy.get("a[data-id=file]", {timeout: TIMEOUT}).click({force: true});
        cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", "File Browser");

        checkResults("opencga-file-grid");

        getResult("opencga-file-grid").then($text => {
            cy.get("file-name-autocomplete input").type($text + "{enter}");
        });

        cy.get(".lhs button[data-filter-name]").should("have.length", 1);

        cy.get("div.search-button-wrapper button").click();
        checkResults("opencga-file-grid");

        cy.get("#format + .subsection-content a").contains("VCF").click({force: true});
        cy.get("#bioformat + .subsection-content a").contains("VARIANT").click({force: true});

        cy.get(".lhs button[data-filter-name]").should("have.length", 3);
        cy.get("div.search-button-wrapper button").click();

        checkResults("opencga-file-grid");
        changePage("opencga-file-grid", 2);
        checkResults("opencga-file-grid");
        changePage("opencga-file-grid", 1);
        checkResults("opencga-file-grid");

        dateFilterCheck("opencga-file-grid");
        annotationFilterCheck("opencga-file-grid");


    });

    it("10.2 - aggregated query", () => {
        cy.get("a[data-id=file]").click({force: true});
        cy.get("a[href='#facet_tab']").click({force: true});

        Facet.selectDefaultFacet(); // "creationYear>>creationMonth", "bioformat", "format>>bioformat", "status", "size[0..214748364800]:10737418240", "numSamples[0..10]:1"

        Facet.checkActiveFacet("creationYear", "creationYear>>creationMonth");
        // cy.get("div.facet-wrapper button[data-filter-name='creationYear']").contains("creationYear>>creationMonth");

        Facet.checkActiveFacet("format", "format>>bioformat");
        // cy.get("div.facet-wrapper button[data-filter-name='format']").contains("format>>bioformat");

        Facet.checkActiveFacet("bioformat", "bioformat");
        // cy.get("div.facet-wrapper button[data-filter-name='bioformat']").contains("bioformat");

        Facet.checkActiveFacet("status", "status");
        // cy.get("div.facet-wrapper button[data-filter-name='status']").contains("status");

        Facet.checkActiveFacet("size", "size[0..214748364800]:10737418240");
        // cy.get("div.facet-wrapper button[data-filter-name='size']").contains("size[0..214748364800]:10737418240");

        Facet.checkActiveFacet("numSamples", "numSamples[0..10]:1");
        // cy.get("div.facet-wrapper button[data-filter-name='numSamples']").contains("numSamples[0..10]:1");


        cy.get("[data-id='status'] ul.dropdown-menu a").contains("READY").click({force: true}); // status=READY
        Facet.checkActiveFacet("status", "status[READY]");
        // cy.get("div.facet-wrapper button[data-filter-name='status']").contains("status[READY]");

        cy.get("div.search-button-wrapper button").click();

        Facet.checkActiveFacetLength(6);
        Facet.checkResultLength(6);
        // cy.get("div.facet-wrapper button[data-filter-value]", {timeout: TIMEOUT}).should("have.length", 6);
        // cy.get("opencb-facet-results opencga-facet-result-view", {timeout: TIMEOUT}).should("have.length", 6);


        Facet.select("Creation Year"); // removing Creation Year
        // cy.get("facet-filter .facet-selector li a").contains("Creation Year").click({force: true}); // creationYear remove

        Facet.checkActiveFacetLength(5);
        cy.get("div.search-button-wrapper button").click();
        Facet.checkResultLength(5);

        // cy.get("div.facet-wrapper button[data-filter-value]", {timeout: TIMEOUT}).should("have.length", 5);
        // cy.get("div.search-button-wrapper button").click();
        // cy.get("opencb-facet-results opencga-facet-result-view", {timeout: TIMEOUT}).should("have.length", 5);

        Facet.select("Creation Year"); // adding Creation Year
        cy.get("a[data-collapse=\"#creationYear_nested\"]").click({force: true});
        cy.get("#creationYear_nested select-field-filter div.dropdown-menu a").contains("Creation Month").click({force: true}); // Creation Month nested in Year field

        // removing all values but `creationYear` and `format` through the select, not active-filter
        Facet.select("Bioformat");
        Facet.select("Status");
        Facet.select("Size");
        Facet.select("Number Of Samples");

        Facet.checkActiveFacetLength(2);
        cy.get("div.search-button-wrapper button").click();
        Facet.checkResultLength(2);

    });
});
