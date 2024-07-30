/*
 * Copyright 2015-2024 OpenCB
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
import BrowserTest from "../../support/browser-test.js";

context("Job Browser Grid", () => {
    const browserGrid = "job-grid";
    const browserDetail = "job-detail";

    beforeEach(() => {
        cy.visit("#job-browser-grid");
        cy.waitUntil(() => {
            return cy.get(browserGrid)
                .should("be.visible");
        });
    });

    // TOOLBAR
    context("Job Toolbar", () => {
        beforeEach(() => {
            cy.get(browserGrid)
                .find(`div[data-cy="toolbar"]`)
                .as("toolbar");
        });

        it("should render toolbar", () => {
            cy.get(browserGrid)
                .find(`div[data-cy="toolbar-wrapper"]`)
                .should("be.visible");
        });

        it("should render Refresh button", () => {
            cy.get(browserGrid)
                .find(`button[data-cy="job-refresh"]`)
                .should("be.visible");
        });

        it("should render Export button", () => {
            cy.get(browserGrid)
                .find(`button[data-cy="toolbar-btn-export"]`)
                .should("be.visible");
        });

        it("should render Settings button", () => {
            cy.get(browserGrid)
                .find(`button[data-cy="toolbar-btn-settings"]`)
                .should("be.visible");
        });
    });

    context("Modal Setting", () => {
        it("should move modal setting", () => {
            cy.get("button[data-action='settings']")
                .click();

            BrowserTest.getElementByComponent({
                selector: `${browserGrid} opencb-grid-toolbar`,
                tag:"div",
                elementId: "SettingModal"
            }).as("settingModal");

            cy.get("@settingModal")
                .then(($modal) => {
                    const startPosition = $modal.offset();
                    cy.log("start Position:", startPosition);
                    // Drag the modal to a new position using Cypress's drag command
                    cy.get("@settingModal")
                        .find(".modal-header")
                        .as("modalHeader");

                    cy.get("@modalHeader")
                        .trigger("mousedown", { which: 1 }); // Trigger mouse down event
                    cy.get("@modalHeader")
                        .trigger("mousemove", { clientX: 100, clientY: 100 }); // Move the mouse
                    cy.get("@modalHeader")
                        .trigger("mouseup"); // Release the mouse// Release the mouse

                    // Get the final position of the modal
                    cy.get(`@modalHeader`)
                        .then(($modal) => {
                            const finalPosition = $modal.offset();
                            cy.log("final Position:", finalPosition);
                            // Assert that the modal has moved
                            expect(finalPosition.left).to.not.equal(startPosition.left);
                            expect(finalPosition.top).to.not.equal(startPosition.top);
                        });
                });
        });

        it("should hide columns [Status,Output Files,Runtime]",() => {
            const columns = ["Status","Output Files","Runtime"];
            cy.get(`${browserGrid} thead th`)
                .as("headerColumns");

            columns.forEach(col => {
                cy.get("@headerColumns")
                    .contains("div",col)
                    .should("be.visible");
            });
            cy.get("button[data-action='settings']")
                .click();
            UtilsTest.getByDataTest("test-columns", "select-field-filter .select2-container")
                .click();
            columns.forEach(col => {
                UtilsTest.getByDataTest("test-columns", "select-field-filter span.select2-results li")
                    .contains(col)
                    .click();
            });
            UtilsTest.getByDataTest("test-columns", "select-field-filter .select2-selection")
                .click();
            BrowserTest.getElementByComponent({
                selector: `${browserGrid} opencb-grid-toolbar`,
                tag:"div",
                elementId: "SettingModal"
            }).as("settingModal");

            cy.get("@settingModal")
                .contains("button", "OK")
                .click();

            cy.get("@headerColumns")
                .should($header => {
                    const _columns = Array.from($header, th => th.textContent.trim());
                    columns.forEach(col => {
                        expect(col).not.to.be.oneOf(_columns);
                    });
                });
        });
    });

    context("Grid", () => {
        it("should render", () => {
            cy.get(browserGrid)
                .should("be.visible");
        });

        it("should change page file-browser-grid", () => {
            UtilsTest.changePage(browserGrid,2);
            UtilsTest.changePage(browserGrid,3);
        });
    });

    context("Row", () => {
        it("should display row #3 as selected", () => {
            // eslint-disable-next-line cypress/unsafe-to-chain-command
            cy.get("tbody tr")
                .eq(3)
                .as("rowSelected")
                .click();

            cy.get("@rowSelected")
                .should("have.class","table-success");
        });

        it.only("should download job Json", () => {
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
                .should("be.visible");
        });

        it("should display 'New Catalog Tab' Tab", () => {
            // eslint-disable-next-line cypress/unsafe-to-chain-command
            cy.get(`detail-tabs > div.detail-tabs > ul`)
                .find("li")
                .contains("New Catalog Tab")
                .as("catalogTab")
                .click()
                .should("be.visible");
        });
    });

    context("detail tabs", {tags: "@shortTask"}, () => {
        it("should render", () => {
            cy.get(browserDetail)
                .should("be.visible");
        });

        it("should display info from the selected row", () => {
            const job = "pedigree-graph-init.20230530144950.FWjipG";
            cy.get(`tbody tr[data-uniqueid="${job}"]`)
                .find(`td`)
                .eq(1)
                .trigger("click");

            cy.get(`detail-tabs h3`)
                .should("contain.text", `Job ${job}`);
        });

        it("should display 'Logs' Tab", () => {
            cy.get(`detail-tabs > div.detail-tabs > ul`)
                .find("li")
                .contains("Logs")
                .trigger("click");

            cy.get("job-detail-log")
                .should("be.visible");
        });
    });
});
