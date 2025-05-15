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

context("Family Browser Grid", () => {
    beforeEach(() => {
        cy.visit("#family-browser-grid");
        cy.get("family-grid")
            .as("family-grid");
        cy.waitUntil(() => {
            return cy.get("@family-grid")
                .should("be.visible");
        });
    });

    context("toolbar", () => {
        beforeEach(() => {
            cy.get("@family-grid")
                .find("grid-toolbar")
                .as("toolbar");
        });

        it("should be visible", () => {
            cy.get("@toolbar")
                .should("be.visible");
        });

        it("should display the 'Create Family' button", () => {
            cy.get("@toolbar")
                .contains("button", "Create Family")
                .should("be.visible");
        });

        it("should display the 'Settings' button", () => {
            cy.get("@toolbar")
                .find(`button[data-cy="toolbar-btn-settings"]`)
                .should("be.visible");
        });
    });

    context("create a family", () => {
        beforeEach(() => {
            cy.get("@family-grid")
                .find("grid-toolbar")
                .contains("button", "Create Family")
                .click();
            cy.get("@family-grid")
                .find(`div[data-cy="family-create"]`)
                .as("modal-family-create");
        });

        it("should be visible when clicking on the 'Create Family' button", () => {
            cy.get("@modal-family-create")
                .find("div.modal-dialog")
                .should("be.visible");
        });

        it("should display the text 'Create Family' as a title", () => {
            cy.get("@modal-family-create")
                .find("h4.modal-title")
                .should("contain.text", "Create Family");
        });

        it("should display a 'Clear' button", () => {
            cy.get("@modal-family-create")
                .contains("button", "Clear")
                .should("be.visible");
        });

        it("should display a 'Create' button", () => {
            cy.get("@modal-family-create")
                .contains("button", "Create")
                .should("be.visible");
        });

        it("should display content as tabs", () => {
            cy.get("@modal-family-create")
                .find("ul.nav.nav-tabs > li")
                .should("have.length.at.least", 1);
        });

        it("should display a field to set the Family ID", () => {
            cy.get("@modal-family-create")
                .find("data-form")
                .should("contain.text", "Family ID");
        });
    });

    context("update a family", () => {
        beforeEach(() => {
            cy.get("@family-grid")
                .find(`table tbody tr td button[data-cy="actions-button"]`)
                .first()
                .click();
            cy.get("@family-grid")
                .find(`a[data-action="edit"]`)
                .first()
                .click();
            cy.get(`div[data-cy="family-update"]`)
                .as("modal-family-update");
        });
        
        it("should be visible after clicking on the 'Edit' action", () => {
            cy.get("@modal-family-update")
                .find("div.modal-dialog")
                .should("be.visible");
        });

        it("should display the text 'Update Family' as a title", () => {
            cy.get("@modal-family-update")
                .find("h4.modal-title")
                .should("contain.text", "Update Family");
        });

        it("should display a 'Discard Changes' button", () => {
            cy.get("@modal-family-update")
                .contains("button", "Discard Changes")
                .should("be.visible");
        });

        it("should display a 'Update' button", () => {
            cy.get("@modal-family-update")
                .contains("button", "Update")
                .should("be.visible");
        });

        it("should display the content as tabs", () => {
            cy.get("@modal-family-update")
                .find("ul.nav.nav-tabs > li")
                .should("have.length.at.least", 1);
        });

        it("should display a field with the Family ID", () => {
            cy.get("@modal-family-update")
                .find("data-form")
                .should("contain.text", "Family ID");
        });
    });

    context("settings", () => {
        it("should display the settings modal when clicking on the 'Settings' button", () => {
            cy.get("@family-grid")
                .find(`button[data-action="settings"]`)
                .click();
            cy.get("div.modal-dialog")
                .should("be.visible");
        });

        it("should allow to hide columns in the grid", () => {
            const columns = ["Clinical Interpretation", "Phenotypes"];

            cy.get("@family-grid")
                .find("thead th")
                .as("headerColumns");
            columns.forEach(column => {
                cy.get("@headerColumns")
                    .contains("div", column)
                    .should("be.visible");
            });
            cy.get("@family-grid")
                .find(`button[data-action="settings"]`)
                .click();
            cy.get("@family-grid")
                .find(`div[data-testid="test-columns"] select-field-filter`)
                .as("columnsSelector");
            cy.get("@columnsSelector")
                .find(".select2-container")
                .click();
            columns.forEach(column => {
                cy.get("@columnsSelector")
                    .find("span.select2-results li")
                    .contains(column)
                    .click();
            });
            cy.get("@columnsSelector")
                .find(".select2-selection")
                .click();
            cy.get("@family-grid")
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
            it("should display a <table> element", () => {
                cy.get("@family-grid")
                    .find("table")
                    .should("be.visible");
            });

            it("should display at least one row", () => {
                cy.get("@family-grid")
                    .find("tbody tr")
                    .should("be.visible");
            });

            it("should display at least one column", () => {
                cy.get("@family-grid")
                    .find("thead tr th")
                    .should("be.visible");
            });

            it("should display column titles", () => {
                cy.get("@family-grid")
                    .find(`thead tr th div[class="th-inner "]`)
                    .first()
                    .should("not.be.empty");
            });
        });

        context("extensions", () => {
            it("should display 'Extra Column' column", () => {
                cy.get("@family-grid")
                    .find("thead th")
                    .contains("Extra column")
                    .should("be.visible");
            });
        });
    });
});
