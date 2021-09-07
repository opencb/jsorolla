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

import {login, checkResults, getResult, Facet, changePage, dateFilterCheck, annotationFilterCheck, checkExactResult} from "../plugins/utils.js";
import {TIMEOUT} from "../plugins/constants.js";


context("8 - Individual Browser", () => {
    before(() => {
        login();
        goTo("iva");
    });

    it("8.1 - query", () => {
        cy.get("a[data-id=individual]", {timeout: TIMEOUT}).click({force: true});
        cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", "Individual Browser");

        checkResults("opencga-individual-grid");
        changePage("opencga-individual-grid", 2);
        checkResults("opencga-individual-grid");
        changePage("opencga-individual-grid", 1);
        checkResults("opencga-individual-grid");

        getResult("opencga-individual-grid", 1).then($text => {
            cy.get("individual-id-autocomplete input").first().type($text + "{enter}");
            cy.get("div.search-button-wrapper button").click();
            checkExactResult("opencga-individual-grid", 1);
            cy.get("opencga-active-filters button[data-filter-name='id']").click();
            checkResults("opencga-individual-grid");
        });

        // sort id ASC
        cy.get("opencga-individual-grid table .th-inner.sortable").contains("Individual").click();
        checkResults("opencga-individual-grid");
        getResult("opencga-individual-grid", 1, 0).then($ind1 => {
            getResult("opencga-individual-grid", 1, 1).then($ind2 => {
                getResult("opencga-individual-grid", 1, 2).then($ind3 => {
                    const sorted = [$ind1, $ind2, $ind3];
                    sorted.sort();
                    expect(JSON.stringify([$ind1, $ind2, $ind3]), "Individuals are sorted").to.be.equal(JSON.stringify(sorted));
                    // TODO this fails
                    // expect([$ind1, $ind3, $ind2], "Individuals are sorted").to.deep.equal(sorted);
                });
            });
        });

        dateFilterCheck("opencga-individual-grid");
        annotationFilterCheck("opencga-individual-grid");


    });

    it("8.2 - aggregated query", () => {
        cy.get("a[data-id=individual]").click({force: true});
        cy.get("a[href='#facet_tab']").click({force: true});

        cy.get("button.default-facets-button").click();
        cy.get("div.search-button-wrapper button").click();
        cy.get(".facet-wrapper .button-list button").should("have.length", 8);
        cy.get("opencb-facet-results opencga-facet-result-view", {timeout: TIMEOUT}).should("have.length", 8);


        Facet.selectDefaultFacet(); // "creationYear>>creationMonth", "status", "ethnicity", "population", "lifeStatus", "phenotypes", "sex", "numSamples[0..10]:1"
        // cy.get("button.default-facets-button").click(); // "creationYear>>creationMonth", "status", "phenotypes", "somatic"

        Facet.checkActiveFacet("creationYear", "creationYear>>creationMonth");
        Facet.checkActiveFacet("status", "status");
        Facet.checkActiveFacet("ethnicity", "ethnicity");
        Facet.checkActiveFacet("population", "population");
        Facet.checkActiveFacet("lifeStatus", "lifeStatus");
        Facet.checkActiveFacet("phenotypes", "phenotypes");
        Facet.checkActiveFacet("sex", "sex");
        Facet.checkActiveFacet("numSamples", "numSamples[0..10]:1");


        Facet.checkActiveFacetLength(8);
        cy.get("div.search-button-wrapper button").click();
        Facet.checkResultLength(8);

        // cy.get("div.facet-wrapper button[data-filter-name='creationYear']").contains("creationYear>>creationMonth");

        cy.get("[data-id='status'] ul.dropdown-menu a").contains("READY").click({force: true}); // status=READY
        Facet.checkActiveFacet("status", "status[READY]");
        // cy.get("div.facet-wrapper button[data-filter-name='status']").contains("status[READY]");


        Facet.select("Status"); // removing status

        Facet.checkActiveFacetLength(7);
        cy.get("div.search-button-wrapper button").click();
        Facet.checkResultLength(7);

    });

});
