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


context("9. Individual Browser", () => {
    before(() => {
        UtilsTest.login();
        UtilsTest.goTo("iva");
    });

    it("9.1 - query", () => {
        cy.get("a[data-id=individual]", {timeout: TIMEOUT}).click({force: true});
        cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", "Individual Browser");

        UtilsTest.checkResults("individual-grid");
        UtilsTest.changePage("individual-grid", 2);
        UtilsTest.checkResults("individual-grid");
        UtilsTest.changePage("individual-grid", 1);
        UtilsTest.checkResults("individual-grid");

        UtilsTest.getResult("individual-grid", 1).then($text => {
            UtilsTest.selectToken(".cy-subsection-content[data-cy='id'] individual-id-autocomplete", $text);
            cy.get("div.cy-search-button-wrapper button").click();
            UtilsTest.checkExactResult("individual-grid", 1);
            cy.get("opencga-active-filters button[data-filter-name='id']").click();
            UtilsTest.checkResults("individual-grid");
        });

        // sort id ASC
        cy.get("individual-grid table .th-inner.sortable").contains("Individual").click();
        UtilsTest.checkResults("individual-grid");
        UtilsTest.getResult("individual-grid", 1, 0).then($ind1 => {
            UtilsTest.getResult("individual-grid", 1, 1).then($ind2 => {
                UtilsTest.getResult("individual-grid", 1, 2).then($ind3 => {
                    const sorted = [$ind1, $ind2, $ind3];
                    sorted.sort();
                    expect(JSON.stringify([$ind1, $ind2, $ind3]), "Individuals are sorted").to.be.equal(JSON.stringify(sorted));
                    // TODO this fails
                    // expect([$ind1, $ind3, $ind2], "Individuals are sorted").to.deep.equal(sorted);
                });
            });
        });

        UtilsTest.dateFilterCheck("individual-grid");
        UtilsTest.annotationFilterCheck("individual-grid");


    });

    it("9.2 - aggregated query", () => {
        cy.get("a[data-id=individual]").click({force: true});
        cy.get("a[href='#facet_tab']").click({force: true});

        UtilsTest.facet.selectDefaultFacet(); // "creationYear>>creationMonth", "status", "ethnicity", "population", "lifeStatus", "phenotypes", "sex", "numSamples[0..10]:1"
        // cy.get("button.default-facets-button").click(); // "creationYear>>creationMonth", "status", "phenotypes", "somatic"

        UtilsTest.facet.checkActiveFacet("creationYear", "creationYear>>creationMonth");
        UtilsTest.facet.checkActiveFacet("status", "status");
        UtilsTest.facet.checkActiveFacet("ethnicity", "ethnicity");
        UtilsTest.facet.checkActiveFacet("population", "population");
        UtilsTest.facet.checkActiveFacet("lifeStatus", "lifeStatus");
        UtilsTest.facet.checkActiveFacet("phenotypes", "phenotypes");
        UtilsTest.facet.checkActiveFacet("sex", "sex");
        UtilsTest.facet.checkActiveFacet("numSamples", "numSamples[0..10]:1");


        UtilsTest.facet.checkActiveFacetLength(8);
        cy.get("div.cy-search-button-wrapper button").click();
        UtilsTest.facet.checkResultLength(8);

        // cy.get("div.facet-wrapper button[data-filter-name='creationYear']").contains("creationYear>>creationMonth");

        cy.get("[data-id='status'] ul.dropdown-menu a").contains("READY").click({force: true}); // status=READY
        UtilsTest.facet.checkActiveFacet("status", "status[READY]");
        // cy.get("div.facet-wrapper button[data-filter-name='status']").contains("status[READY]");


        UtilsTest.facet.select("Status"); // removing status

        UtilsTest.facet.checkActiveFacetLength(7);
        cy.get("div.cy-search-button-wrapper button").click();
        UtilsTest.facet.checkResultLength(7);

    });

});
