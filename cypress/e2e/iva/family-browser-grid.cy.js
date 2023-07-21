/**
 * Copyright 2015-2023 OpenCB
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

import UtilsTest from "../../support/utils-test.js";

context("Family Browser Grid", () => {
    const browserGrid = "family-grid";

    beforeEach(() => {
        cy.visit("#family-browser-grid");
        cy.waitUntil(() => {
            return cy.get(browserGrid)
                .should("be.visible")
        })
    });

    context("Grid", () => {
        it("should be render family-browser-grid", () => {
            cy.get(browserGrid)
                .should("be.visible");
        });
    });

    context("Row", () => {
        it("should download family json", () => {
            cy.get("tbody tr:first > td")
                .eq(-2)
                .within(() => {
                    cy.get("button")
                        .click();
                    cy.get("ul[class='dropdown-menu dropdown-menu-right']")
                        .contains("a","Download JSON")
                        .click();
            });
        });
    });

    context("extension", () => {
        it("should display 'Extra Column' column", () => {
            cy.get("thead th")
                .contains("Extra column")
                .should('be.visible');
        });
    });
});
