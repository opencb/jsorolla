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
import UtilsTest from "../../support/utils-test.js";;;;;

context("11. Family Browser", () => {
    before(() => {
        UtilsTest.login();
        UtilsTest.goTo("iva");
    });

    it("11.1 - query", () => {
        cy.get("a[data-id=family]", {timeout: TIMEOUT}).click({force: true});
        cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", "Family Browser");

        UtilsTest.checkResultsOrNot("family-grid");

        UtilsTest.hasResults("family-grid").then($bool => {
            if ($bool) {
                // run other tests in case there are results
                UtilsTest.getResult("family-grid", 1).then($text => {
                    UtilsTest.selectToken("family-id-autocomplete", $text);
                    cy.get(".lhs button[data-filter-name]").should("have.length", 1);
                    cy.get("div.cy-search-button-wrapper button").click();
                });
                UtilsTest.checkResults("family-grid");
                cy.get("opencga-active-filters button[data-filter-name='id']").click();

                UtilsTest.checkResults("family-grid");
                UtilsTest.getResult("family-grid", 3, 0, "html").then($html => {
                    cy.wrap($html).get("span[data-cy='disorder-id']").then($text => {
                        UtilsTest.selectToken(".cy-subsection-content[data-cy=disorders]", $text.first().text(), true); // disorder id
                        cy.get("div.cy-search-button-wrapper button").click();
                        UtilsTest.checkResults("family-grid");
                        cy.get("opencga-active-filters button[data-filter-name='disorders']").click();
                    });
                });
                UtilsTest.checkResults("family-grid");
                UtilsTest.changePage("family-grid", 2);
                UtilsTest.checkResults("family-grid");
                UtilsTest.changePage("family-grid", 1);
                UtilsTest.checkResults("family-grid");

                // sort id ASC
                cy.get("family-grid table .th-inner.sortable").contains("Family").click();
                UtilsTest.checkResults("family-grid");
                UtilsTest.getResult("family-grid", 1, 0).then($f1 => {
                    UtilsTest.getResult("family-grid", 1, 1).then($f2 => {
                        UtilsTest.getResult("family-grid", 1, 2).then($f3 => {
                            const sorted = [$f1, $f2, $f3];
                            sorted.sort();
                            expect(JSON.stringify([$f1, $f2, $f3]), "Families are sorted").to.be.equal(JSON.stringify(sorted));
                            // TODO this fails
                            // expect([$f1, $f2, $f3], "Families are sorted").to.deep.equal(sorted);
                        });
                    });
                });

                UtilsTest.dateFilterCheck("family-grid");
                UtilsTest.annotationFilterCheck("family-grid");
            }
        });
    });

    it("11.2 - aggregated query", () => {
        cy.get("a[data-id=family]", {timeout: TIMEOUT}).click({force: true});
        cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", "Family Browser");

        UtilsTest.checkResultsOrNot("family-grid");

        UtilsTest.hasResults("family-grid").then($bool => {
            if ($bool) {
                // in case there are actually results, run the aggregated tests
                cy.get("a[href='#facet_tab']").click({force: true});

                cy.wait(500); // TODO recheck. this avoids a strange selection in 'Select a Term or Range Facet' dropdown: ", , ,"
                UtilsTest.facet.selectDefaultFacet(); // "creationYear>>creationMonth", "status", "phenotypes", "expectedSize", "numMembers[0..20]:2"

                UtilsTest.facet.checkActiveFacet("creationYear", "creationYear>>creationMonth");
                UtilsTest.facet.checkActiveFacet("status", "status");
                UtilsTest.facet.checkActiveFacet("phenotypes", "phenotypes");
                UtilsTest.facet.checkActiveFacet("expectedSize", "expectedSize");
                UtilsTest.facet.checkActiveFacet("numMembers", "numMembers[0..20]:2");


                UtilsTest.facet.checkActiveFacetLength(5);
                cy.get("div.cy-search-button-wrapper button").click();
                UtilsTest.facet.checkResultLength(5);

                UtilsTest.facet.removeActive("status"); // removing status
                UtilsTest.facet.checkResultLength(4);

            }
        });

    });
});
