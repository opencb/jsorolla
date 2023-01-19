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


context("10. Disease Browser", () => {
    before(() => {
        UtilsTest.login();
        UtilsTest.goTo("iva");
    });

    it("10.1 - query", () => {
        cy.get("a[data-id=disease-panel]", {timeout: TIMEOUT}).click({force: true});
        cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", "Disease Panel Browser");

        UtilsTest.checkResultsOrNot("disease-panel-grid");

        UtilsTest.hasResults("disease-panel-grid").then($bool => {
            // run other tests in case there are results
            if ($bool) {
                // Disease Panel Id
                UtilsTest.getResult("disease-panel-grid", 0).then($text => {
                    UtilsTest.selectToken("disease-panel-id-autocomplete", $text.trim());
                    cy.get(".lhs button[data-filter-name]").should("have.length", 1);
                    cy.get("div.search-button-wrapper button").click();
                });
                UtilsTest.checkResults("disease-panel-grid");
                cy.get("opencga-active-filters button[data-filter-name='id']").click();

                // TODO FIXME disorders filter shows IDs in the dropdown, but we don't show IDs in the table
                /* checkResults("disease-panel-grid");
                getResult("disease-panel-grid", 3, 0, "html").then($html => {
                    cy.wrap($html).get("span[data-cy='disorder-id']").then($text => {
                        selectToken(".subsection-content[data-cy=disorders]", $text.first().text(), true); // disorder id
                        cy.get("div.search-button-wrapper button").click();
                        checkResults("disease-panel-grid");
                        cy.get("opencga-active-filters button[data-filter-name='disorders']").click();
                    });
                });*/
                UtilsTest.checkResults("disease-panel-grid");
                UtilsTest.changePage("disease-panel-grid", 2);
                UtilsTest.checkResults("disease-panel-grid");
                UtilsTest.changePage("disease-panel-grid", 1);
                UtilsTest.checkResults("disease-panel-grid");

                UtilsTest.dateFilterCheck("disease-panel-grid");
            }
        });
    });
});
