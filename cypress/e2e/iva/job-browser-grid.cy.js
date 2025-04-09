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

context("Job Browser Grid", () => {
    beforeEach(() => {
        cy.visit("#job-browser-grid");
        cy.get("job-grid")
            .as("job-grid")
        cy.waitUntil(() => {
            return cy.get("@job-grid")
                .should("be.visible");
        });
    });

    context("toolbar", () => {
        beforeEach(() => {
            cy.get("@job-grid")
                .find("opencb-grid-toolbar")
                .as("toolbar");
        });

        it("should be visible", () => {
            cy.get("@toolbar")
                .should("be.visible");
        });

        it("should display a 'Refresh' button", () => {
            cy.get("@toolbar")
                .contains("button", "Refresh")
                .should("be.visible");
        });

        it("should display a 'Export' button", () => {
            cy.get("@toolbar")
                .contains("button", "Export")
                .should("be.visible");
        });

        it("should display a 'Settings' button", () => {
            cy.get("@toolbar")
                .contains("button", "Settings")
                .should("be.visible");
        });
    });

    context("setting", () => {
        it("should display the settings modal when clicking on the 'Settings' button", () => {
            cy.get("@job-grid")
                .contains("button", "Settings")
                .click();
            cy.get("div.modal-dialog")
                .should("be.visible");
        });

        it("should allow to hide columns in the grid", () => {
            const columns = ["Status", "Output Files", "Runtime"];

            cy.get("@job-grid")
                .find("thead th")
                .as("headerColumns");
            columns.forEach(column => {
                cy.get("@headerColumns")
                    .contains("div", column)
                    .should("be.visible");
            });
            cy.get("@job-grid")
                .contains("button", "Settings")
                .click();
            cy.get("@job-grid")
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
            cy.get("@job-grid")
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
                cy.get("@job-grid")
                    .find("table")
                    .should("be.visible");
            });

            it("should display at least one row in the table", () => {
                cy.get("@job-grid")
                    .find("tbody tr")
                    .should("be.visible");
            });

            it("should display at least one column in the table", () => {
                cy.get("@job-grid")
                    .find("thead tr th")
                    .should("be.visible");
            });

            it("should display titles in of each column", () => {
                cy.get("@job-grid")
                    .find(`thead tr th div[class="th-inner "]`)
                    .first()
                    .should("not.be.empty");
            });
        });

        context("extensions", () => {
            it("should display 'Extra Column' column", () => {
                cy.get("@job-grid")
                    .find("thead th")
                    .contains("Extra column")
                    .should("be.visible");
            });
        });
    });
});
