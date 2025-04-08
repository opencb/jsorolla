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

context("Sample Browser Grid", () => {
    beforeEach(() => {
        cy.visit("#sample-browser-grid");
        cy.get(`div[data-cy="sample-browser-container"]`)
            .as("container");
        cy.waitUntil(() => {
            return cy.get("@container")
                .should("be.visible");
        });
    });

    context("toolbar", () => {
        beforeEach(() => {
            cy.get("@container")
                .find("opencb-grid-toolbar")
                .as("toolbar");
        });

        it("should be visible", () => {
            cy.get("@toolbar")
                .should("be.visible");
        });

        it("should display the 'Create Sample' button", () => {
            cy.get("@toolbar")
                .contains("button", "Create Sample")
                .should("be.visible");
        });

        it("should display the 'Create Cohort' button", () => {
            cy.get("@toolbar")
                .contains("button", "Create Cohort")
                .should("be.visible");
        });

        it("should display the 'Settings' button", () => {
            cy.get("@toolbar")
                .contains("button", "Settings")
                .should("be.visible");
        });
    });

    context("create a sample", () => {
        beforeEach(() => {
            cy.get("@container")
                .contains("button", "Create Sample")
                .click();
            cy.get("@container")
                .find(`div[data-cy="sample-create"]`)
                .as("modal-sample-create");
        });

        it("should render the modal for creating a sample", () => {
            cy.get("@modal-sample-create")
                .find("div.modal-dialog")
                .should("be.visible");
        });

        it("should display the 'Create Sample' title in the modal", () => {
            cy.get("@modal-sample-create")
                .find("h4.modal-title")
                .should("contain.text", "Create Sample");
        });

        it("should display the 'Create' and 'Clear' buttons in the modal", () => {
            cy.get("@modal-sample-create")
                .contains("button", "Create")
                .should("be.visible");
            cy.get("@modal-sample-create")
                .contains("button", "Clear")
                .should("be.visible");
        });

        it("should display content as tabs", () => {
            cy.get("@modal-sample-create")
                .find("ul.nav.nav-tabs > li")
                .should("have.length.greaterThan", 1);
        });

        it("should ask for a sample ID in the form", () => {
            cy.get("@modal-sample-create")
                .find("data-form")
                .should("contain.text", "Sample ID");
        });
    });

    context("update a sample", () => {
        beforeEach(() => {
            cy.get("@container")
                .find(`table tbody tr td button[data-cy="actions-button"]`)
                .first()
                .click();
            cy.get("@container")
                .find(`a[data-action="edit"]`)
                .first()
                .click();
            cy.get(`div[data-cy="sample-update"]`)
                .as("modal-sample-update");
        });

        it("should render the modal for updating a sample", () => {
            cy.get("@modal-sample-update")
                .find("div.modal-dialog")
                .should("be.visible");
        });

        it("should display the 'Update Sample' title in the modal", () => {
            cy.get("@modal-sample-update")
                .find("h4.modal-title")
                .should("contain.text", "Update Sample");
        });

        it("should display the 'Discard Changes' button in the modal", () => {
            cy.get("@modal-sample-update")
                .contains("button", "Discard Changes")
                .should("be.visible");
        });

        it("should display the 'Update' button in the modal", () => {
            cy.get("@modal-sample-update")
                .contains("button", "Update")
                .should("be.visible");
        });

        it("should display content as tabs", () => {
            cy.get("@modal-sample-update")
                .find("ul.nav.nav-tabs > li")
                .should("have.length.greaterThan", 1);
        });

        it("should have a field with the ID of the selected sample", () => {
            cy.get("@modal-sample-update")
                .find("data-form")
                .should("contain.text", "Sample ID");
        });
    });

    context("settings", () => {
        it("should render the settings modal when clicking on the 'Settings' button", () => {
            cy.get("@container")
                .find(`button[data-action="settings"]`)
                .click();
            cy.get("div.modal-dialog")
                .should("be.visible");
        });

        it("should allow to hide columns in the grid",() => {
            const columns = ["Collection Method", "Preparation Method"];

            cy.get("sample-grid thead th")
                .as("headerColumns");
            columns.forEach(col => {
                cy.get("@headerColumns")
                    .contains("div",col)
                    .should("be.visible");
            });
            cy.get("@container")
                .find(`button[data-action="settings"]`)
                .click();
            cy.get("@container")
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
            cy.get("@container")
                .find(".modal-body")
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

    context("grid", () => {
        beforeEach(() => {
            cy.get("@container")
                .find("sample-grid")
                .as("sample-grid");
        });

        context("content", () => {
            it("should render a <table> element", () => {
                cy.get("@sample-grid")
                    .find("table")
                    .should("be.visible");
            });

            it("should render at least one row in the table", () => {
                cy.get("@sample-grid")
                    .find("tbody tr")
                    .should("be.visible");
            });

            it("should render at least one column in the table", () => {
                cy.get("@sample-grid")
                    .find("thead tr th")
                    .should("be.visible");
            });

            it("should render titles in of each column", () => {
                cy.get("@sample-grid")
                    .find(`thead tr th div[class="th-inner "]`)
                    .first()
                    .should("not.be.empty");
            });
        });

        context("data completeness", () => {
            it("should display the sample ID in each row", () => {
                cy.get("@sample-grid")
                    .find("tbody td:first-child")
                    .each($td => {
                        cy.wrap($td)
                            .should("not.be.empty");
                    });
            });

            it("should display the creation date in each row", () => {
                cy.get("@sample-grid")
                    .find("thead")
                    .contains("th", "Creation Date")
                    .invoke("index")
                    .then(index => {
                        cy.get("@sample-grid")
                            .find(`tbody td:nth-child(${index + 1})`)
                            .each(td => {
                                cy.wrap(td)
                                    .should("not.be.empty");
                            });
                    });
            });

            it("should display a creation date with valid format", () => {
                const regExp = /^(([0-9])|([0-2][0-9])|([3][0-1])) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}$/;

                cy.get("@sample-grid")
                    .find("thead")
                    .contains("th", "Creation Date")
                    .invoke("index")
                    .then(index => {
                        cy.get("@sample-grid")
                            .find(`tbody td:nth-child(${index + 1})`)
                            .each(td => {
                                expect(td.text()).to.match(regExp);
                            });
                    });
            });

            it("should display a creation date equal or earlier than today", () => {
                cy.get("@sample-grid")
                    .find("thead")
                    .contains("th", "Creation Date")
                    .invoke("index")
                    .then(index => {
                        cy.get("@sample-grid")
                            .find(`tbody td:nth-child(${index + 1})`)
                            .each(td => {
                                const date = new Date(td.text());
                                const today = new Date();
                                expect(date).to.be.lte(today);
                            });
                    });
            });
        });

        context("extensions", () => {
            it("should display a 'Extra Column' column", () => {
                cy.get("@sample-grid")
                    .find("thead th")
                    .contains("Extra column")
                    .should("be.visible");
            });
        });
    });
});
