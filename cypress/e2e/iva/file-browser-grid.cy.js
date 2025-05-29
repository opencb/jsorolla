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

context("File Browser Grid", () => {
    beforeEach(() => {
        cy.visit("#file-browser-grid");
        cy.get("file-grid")
            .as("file-grid");
        cy.waitUntil(() => {
            return cy.get("@file-grid")
                .should("be.visible");
        });
    });

    context("toolbar", () => {
        beforeEach(() => {
            cy.get("@file-grid")
                .find("grid-toolbar")
                .as("toolbar");
        });

        it("should be visible", () => {
            cy.get("@toolbar")
                .should("be.visible");
        });

        it("should display a 'Create Folder' button", () => {
            cy.get("@toolbar")
                .contains("button", "Create Folder")
                .should("be.visible");
        });

        it("should display a 'Create File' button", () => {
            cy.get("@toolbar")
                .contains("button", "Create File")
                .should("be.visible");
        });

        it("should display a 'Upload File' button", () => {
            cy.get("@toolbar")
                .contains("button", "Upload File")
                .should("be.visible");
        });

        it("should display a 'Fetch File' button", () => {
            cy.get("@toolbar")
                .contains("button", "Fetch File")
                .should("be.visible");
        });

        it("should display a 'Settings' button", () => {
            cy.get("@toolbar")
                .find(`button[data-cy="toolbar-btn-settings"]`)
                .should("be.visible");
        });
    });

    context("settings", () => {
        it("should display the settings modal when clicking on the 'Settings' button", () => {
            cy.get("@file-grid")
                .find(`button[data-cy="toolbar-btn-settings"]`)
                .click();
            cy.get("div.modal-dialog")
                .should("be.visible");
        });

        it("should allow to hide columns in the grid", () => {
            const columns = ["Name", "Format"];

            cy.get("@file-grid")
                .find("thead th")
                .as("headerColumns");
            columns.forEach(column => {
                cy.get("@headerColumns")
                    .contains("div", column)
                    .should("be.visible");
            });
            cy.get("@file-grid")
                .find(`button[data-cy="toolbar-btn-settings"]`)
                .click();
            cy.get("@file-grid")
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
            cy.get("@file-grid")
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
                cy.get("@file-grid")
                    .find("table")
                    .should("be.visible");
            });

            it("should display at least one row in the table", () => {
                cy.get("@file-grid")
                    .find("tbody tr")
                    .should("be.visible");
            });

            it("should display at least one column in the table", () => {
                cy.get("@file-grid")
                    .find("thead tr th")
                    .should("be.visible");
            });

            it("should display titles in of each column", () => {
                cy.get("@file-grid")
                    .find(`thead tr th div[class="th-inner "]`)
                    .eq(2)
                    .should("not.be.empty");
            });
        });

        context("extensions", () => {
            it("should display 'Extra Column' column", () => {
                cy.get("@file-grid")
                    .find("thead th")
                    .contains("Extra column")
                    .should("be.visible");
            });
        });
    });
});
