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

import {checkResults, login, getResult, checkResultsOrNot, hasResults, Facet, changePage, dateFilterCheck, annotationFilterCheck, goTo, selectToken} from "../../plugins/utils.js";
import {TIMEOUT} from "../../plugins/constants.js";


context("11. Family Browser", () => {
    before(() => {
        login();
        goTo("iva");
    });

    it("11.1 - query", () => {
        cy.get("a[data-id=family]", {timeout: TIMEOUT}).click({force: true});
        cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", "Family Browser");

        checkResultsOrNot("family-grid");

        hasResults("family-grid").then($bool => {
            if ($bool) {
                // run other tests in case there are results
                getResult("family-grid", 1).then($text => {
                    selectToken("family-id-autocomplete", $text);
                    cy.get(".lhs button[data-filter-name]").should("have.length", 1);
                    cy.get("div.search-button-wrapper button").click();
                });
                checkResults("family-grid");
                cy.get("opencga-active-filters button[data-filter-name='id']").click();

                checkResults("family-grid");
                getResult("family-grid", 3, 0, "html").then($html => {
                    cy.wrap($html).get("span[data-cy='disorder-id']").then($text => {
                        selectToken(".subsection-content[data-cy=disorders]", $text.first().text(), true); // disorder id
                        cy.get("div.search-button-wrapper button").click();
                        checkResults("family-grid");
                        cy.get("opencga-active-filters button[data-filter-name='disorders']").click();
                    });
                });
                checkResults("family-grid");
                changePage("family-grid", 2);
                checkResults("family-grid");
                changePage("family-grid", 1);
                checkResults("family-grid");

                // sort id ASC
                cy.get("family-grid table .th-inner.sortable").contains("Family").click();
                checkResults("family-grid");
                getResult("family-grid", 1, 0).then($f1 => {
                    getResult("family-grid", 1, 1).then($f2 => {
                        getResult("family-grid", 1, 2).then($f3 => {
                            const sorted = [$f1, $f2, $f3];
                            sorted.sort();
                            expect(JSON.stringify([$f1, $f2, $f3]), "Families are sorted").to.be.equal(JSON.stringify(sorted));
                            // TODO this fails
                            // expect([$f1, $f2, $f3], "Families are sorted").to.deep.equal(sorted);
                        });
                    });
                });

                dateFilterCheck("family-grid");
                annotationFilterCheck("family-grid");
            }
        });
    });

    it("11.2 - aggregated query", () => {
        cy.get("a[data-id=family]", {timeout: TIMEOUT}).click({force: true});
        cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", "Family Browser");

        checkResultsOrNot("family-grid");

        hasResults("family-grid").then($bool => {
            if ($bool) {
                // in case there are actually results, run the aggregated tests
                cy.get("a[href='#facet_tab']").click({force: true});

                cy.wait(500); // TODO recheck. this avoids a strange selection in 'Select a Term or Range Facet' dropdown: ", , ,"
                Facet.selectDefaultFacet(); // "creationYear>>creationMonth", "status", "phenotypes", "expectedSize", "numMembers[0..20]:2"

                Facet.checkActiveFacet("creationYear", "creationYear>>creationMonth");
                Facet.checkActiveFacet("status", "status");
                Facet.checkActiveFacet("phenotypes", "phenotypes");
                Facet.checkActiveFacet("expectedSize", "expectedSize");
                Facet.checkActiveFacet("numMembers", "numMembers[0..20]:2");


                Facet.checkActiveFacetLength(5);
                cy.get("div.search-button-wrapper button").click();
                Facet.checkResultLength(5);

                Facet.removeActive("status"); // removing status
                Facet.checkResultLength(4);

            }
        });

    });
});
