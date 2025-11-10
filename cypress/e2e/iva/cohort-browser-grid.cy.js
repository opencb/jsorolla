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

context("Cohort Browser Grid", () => {
    beforeEach(() => {
        cy.visit("#cohort-browser-grid");
        cy.get("cohort-grid")
            .as("cohort-grid")
        cy.waitUntil(() => {
            return cy.get("@cohort-grid")
                .should("be.visible");
        });
    });

    context("toolbar", () => {
        beforeEach(() => {
            cy.get("@cohort-grid")
                .find("grid-toolbar")
                .as("toolbar");
        });

        it("should be visible", () => {
            cy.get("@toolbar")
                .should("be.visible");
        });

        it("should display the 'Create Cohort' button", () => {
            cy.get("@toolbar")
                .contains("button", "Create Cohort")
                .should("be.visible");
        });

        it("should display the 'Settings' button", () => {
            cy.get("@toolbar")
                .find(`button[data-cy="toolbar-btn-settings"]`)
                .should("be.visible");
        });
    });

    context("create a cohort", () => {
        beforeEach(() => {
            cy.get("@cohort-grid")
                .contains("button", "Create Cohort")
                .click();
            cy.get("@cohort-grid")
                .find(`div[data-cy="cohort-create"]`)
                .as("modal-cohort-create");
        });

        it("should display the modal for creating a cohort when clicking the 'Create Cohort' button", () => {
            cy.get("@modal-cohort-create")
                .find("div.modal-dialog")
                .should("be.visible");
        });

        it("should display the 'Create Cohort' title in the modal", () => {
            cy.get("@modal-cohort-create")
                .find("h4.modal-title")
                .should("contain.text", "Create Cohort");
        });

        it("should display the 'Create' button in the modal", () => {
            cy.get("@modal-cohort-create")
                .contains("button", "Create")
                .should("be.visible");
        });

        it("should display the 'Clear' button in the modal", () => {
            cy.get("@modal-cohort-create")
                .contains("button", "Clear")
                .should("be.visible");
        });

        it("should ask for a cohort ID in the form", () => {
            cy.get("@modal-cohort-create")
                .find("data-form")
                .should("contain.text", "Cohort ID");
        });
    });

    context("settings", () => {
        it("should display the settings modal when clicking on the 'Settings' button", () => {
            cy.get("@cohort-grid")
                .find(`button[data-action="settings"]`)
                .click();
            cy.get("div.modal-dialog")
                .should("be.visible");
        });

        it("should allow to hide columns in the grid", () => {
            const columns = ["Cohort", "Creation Date"];

            cy.get("@cohort-grid")
                .find("thead th")
                .as("headerColumns");
            columns.forEach(column => {
                cy.get("@headerColumns")
                    .contains("div", column)
                    .should("be.visible");
            });
            cy.get("@cohort-grid")
                .find(`button[data-action="settings"]`)
                .click();
            cy.get("@cohort-grid")
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
            cy.get("@cohort-grid")
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
                cy.get("@cohort-grid")
                    .find("table")
                    .should("be.visible");
            });

            it("should display at least one row in the table", () => {
                cy.get("@cohort-grid")
                    .find("tbody tr")
                    .should("be.visible");
            });

            it("should display at least one column in the table", () => {
                cy.get("@cohort-grid")
                    .find("thead tr th")
                    .should("be.visible");
            });

            it("should display titles in of each column", () => {
                cy.get("@cohort-grid")
                    .find(`thead tr th div[class="th-inner "]`)
                    .first()
                    .should("not.be.empty");
            });
        });

        context("extensions", () => {
            it("should display a 'Extra Column' column", () => {
                cy.get("@cohort-grid")
                    .find("thead th")
                    .contains("Extra column")
                    .should("be.visible");
            });
        });
    });
});
