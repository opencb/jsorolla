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
import BrowserTest from "../../support/browser-test";

context("Disease Panel Browser Grid", () => {
    const browserGrid = "disease-panel-grid";

    beforeEach(() => {
        cy.visit("#disease-panel-browser-grid");
        cy.get("disease-panel-grid")
            .as("disease-panel-grid");
        cy.waitUntil(() => {
            return cy.get("@disease-panel-grid")
                .should("be.visible");
        });
    });

    context("toolbar", () => {
        beforeEach(() => {
            cy.get("@disease-panel-grid")
                .find("opencb-grid-toolbar")
                .as("toolbar");
        });

        it("should be visible", () => {
            cy.get("@toolbar")
                .should("be.visible");
        });

        it("should display the 'Create Disease Panel' button", () => {
            cy.get("@toolbar")
                .contains("button", "Create Disease Panel")
                .should("be.visible");
        });

        it("should display the 'Settings' button", () => {
            cy.get("@toolbar")
                .contains("button", "Settings")
                .should("be.visible");
        });
    });

    context("create a disease panel", () => {
        beforeEach(() => {
            cy.get("@disease-panel-grid")
                .contains("button", "Create Disease Panel")
                .click();
            cy.get("@disease-panel-grid")
                .find("div[data-cy='modal-disease-panel-create']")
                .as("modal-disease-panel-create");
        });

        it("should display the modal for creating a disease panel when clicking the 'Create Disease Panel' button", () => {
            cy.get("@modal-disease-panel-create")
                .find("div.modal-dialog")
                .should("be.visible");
        });

        it("should display the 'Create Disease Panel' title in the modal", () => {
            cy.get("@modal-disease-panel-create")
                .find("h4.modal-title")
                .should("contain.text", "Create Disease Panel");
        });

        it("should display the 'Create' button in the modal", () => {
            cy.get("@modal-disease-panel-create")
                .contains("button", "Create")
                .should("be.visible");
        });

        it("should display the 'Clear' button in the modal", () => {
            cy.get("@modal-disease-panel-create")
                .contains("button", "Clear")
                .should("be.visible");
        });

        it("should display content as tabs", () => {
            cy.get("@modal-disease-panel-create")
                .find("ul.nav.nav-tabs > li")
                .should("have.length.greaterThan", 1);
        });

        it("should ask for a disease panel ID in the form", () => {
            cy.get("@modal-disease-panel-create")
                .find("data-form")
                .should("contain.text", "Disease Panel ID");
        });
    });

    context("update a disease panel", () => {
        beforeEach(() => {
            cy.get("@disease-panel-grid")
                .find(`table tbody tr td button[data-cy="actions-button"]`)
                .first()
                .click();
            cy.get("@disease-panel-grid")
                .find(`a[data-action="edit"]`)
                .first()
                .click();
            cy.get(`div[data-cy="modal-disease-panel-update"]`)
                .as("modal-disease-panel-update");
        });

        it("should display the modal for updating a disease panel when clicking the 'Edit' action", () => {
            cy.get("@modal-disease-panel-update")
                .find("div.modal-dialog")
                .should("be.visible");
        });

        it("should display the 'Update Disease Panel' title in the modal", () => {
            cy.get("@modal-disease-panel-update")
                .find("h4.modal-title")
                .should("contain.text", "Update Disease Panel");
        });

        it("should display the 'Discard Changes' button in the modal", () => {
            cy.get("@modal-disease-panel-update")
                .contains("button", "Discard Changes")
                .should("be.visible");
        });

        it("should display the 'Update' button in the modal", () => {
            cy.get("@modal-disease-panel-update")
                .contains("button", "Update")
                .should("be.visible");
        });

        it("should display content as tabs", () => {
            cy.get("@modal-disease-panel-update")
                .find("ul.nav.nav-tabs > li")
                .should("have.length.greaterThan", 1);
        });

        it("should have a field with the ID of the selected disease panel", () => {
            cy.get("@modal-disease-panel-update")
                .find("data-form")
                .should("contain.text", "Disease Panel ID");
        });
    });

    context("settings", () => {
        it("should display the settings modal when clicking on the 'Settings' button", () => {
            cy.get("@disease-panel-grid")
                .find(`button[data-action="settings"]`)
                .click();
            cy.get("div.modal-dialog")
                .should("be.visible");
        });

        it("should allow to hide columns in the grid", () => {
            const columns = ["Disorders", "Source", "Extra column"];

            cy.get("@disease-panel-grid")
                .find("thead th")
                .as("headerColumns");
            columns.forEach(column => {
                cy.get("@headerColumns")
                    .contains("div", column)
                    .should("be.visible");
            });
            cy.get("@disease-panel-grid")
                .find(`button[data-action="settings"]`)
                .click();
            cy.get("@disease-panel-grid")
                .find(`div[data-testid="test-columns"] select-field-filter`)
                .as("columnsSelector");
            cy.get("@columnsSelector")
                .find(".select2-container")
                .click();
            columns.forEach(col => {
                cy.get("@columnsSelector")
                    .find("span.select2-results li")
                    .contains(col)
                    .click();
            });
            cy.get("@columnsSelector")
                .find(".select2-selection")
                .click();
            cy.get("@disease-panel-grid")
                .find(".modal-body")
                .contains("button", "OK")
                .click();

            cy.get("@headerColumns")
                .should($header => {
                    const visibleColumns = Array.from($header, th => th.textContent.trim());
                    columns.forEach(col => {
                        expect(col).not.to.be.oneOf(visibleColumns);
                    });
                });
        });
    });

    context("grid", () => {
        context("content", () => {
            it("should render a <table> element", () => {
                cy.get("@disease-panel-grid")
                    .find("table")
                    .should("be.visible");
            });

            it("should display at least one row in the table", () => {
                cy.get("@disease-panel-grid")
                    .find("tbody tr")
                    .should("be.visible");
            });

            it("should display at least one column in the table", () => {
                cy.get("@disease-panel-grid")
                    .find("thead tr th")
                    .should("be.visible");
            });

            it("should display titles in of each column", () => {
                cy.get("@disease-panel-grid")
                    .find(`thead tr th div[class="th-inner "]`)
                    .first()
                    .should("not.be.empty");
            });
        });

        context("data completeness", () => {
            it("should display the disease panel ID in each row", () => {
                cy.get("@disease-panel-grid")
                    .find("tbody td:first-child")
                    .each($td => {
                        cy.wrap($td)
                            .should("not.be.empty");
                    });
            });
        });

        context("extensions", () => {
            it("should display 'Extra Column' column", () => {
                cy.get("@disease-panel-grid")
                    .find("thead th")
                    .contains("Extra column")
                    .should("be.visible");
            });
        });
    });
});
