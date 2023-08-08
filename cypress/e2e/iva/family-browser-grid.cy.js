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

import BrowserTest from "../../support/browser-test.js";

context("Family Browser Grid", () => {
    const browserGrid = "family-grid";
    const browserDetail = "family-detail";

    beforeEach(() => {
        cy.visit("#family-browser-grid");
        cy.waitUntil(() => {
            return cy.get(browserGrid)
                .should("be.visible")
        })
    });

    context("Grid", () => {
        it("should render", () => {
            cy.get(browserGrid)
                .should("be.visible");
        });
    });

    context("Row", () => {
        it("should display row #1 as selected", () => {
            cy.get("tbody tr")
                .eq(1)
                .as("rowSelected")
                .click()

            cy.get("@rowSelected")
                .should("have.class","table-success");
        });

        it("should download family json", () => {
            cy.get("tbody tr:first > td")
                .eq(-2)
                .within(() => {
                    cy.get("button")
                        .click();
                    cy.get("ul[class*='dropdown-menu']")
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

        it("should display 'New Catalog Tab' Tab", () => {
            cy.get(`detail-tabs > div.detail-tabs > ul li`)
                .contains("New Catalog Tab")
                .as("catalogTab")
                .click()

            cy.get("@catalogTab")
                .should('be.visible');
        });
    });

    context("detail tab",{tags: ["@shortTask","@testTask"]}, () => {
        it("should render", () => {
            cy.get(browserDetail)
                .should("be.visible");
        });

        it("should display info from the selected row",() => {
            BrowserTest.getColumnIndexByHeader("Family")
            cy.get("@indexColumn")
                .then((indexColumn) => {
                    const indexRow = 1
                    cy.get(`tbody tr`)
                        .eq(indexRow)
                        .as("selectRow")
                        .click()

                    cy.get("@selectRow")
                        .find("td")
                        .eq(indexColumn)
                        .invoke("text")
                        .as("textRow")
                    });

            cy.get("@textRow")
                .then((textRow) => {
                    cy.get("detail-tabs > div > h3")
                        .invoke("text")
                        .then((text) => {
                            const textTab = text.trim().split(" ");
                            expect(textRow).to.equal(textTab[1].trim());
                        });
                });
        });

        it("should display 'JSON Data' Tab", () => {
            cy.get(`detail-tabs > div.detail-tabs > ul li`)
                .contains("JSON Data")
                .as("jsonTab")
                .click()

            cy.get("@jsonTab")
                .should('be.visible');
        });
    });
});
