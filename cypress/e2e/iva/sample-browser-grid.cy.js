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
import BrowserTest from "../../support/browser-test";

context("Sample Browser Grid", () => {
    const browserGrid = "sample-grid";
    beforeEach(() => {
        cy.visit("#sample-browser-grid");
        cy.get(`div[data-cy="sample-browser-container"]`)
            .as("container");
        cy.waitUntil(() => {
            return cy.get("@container")
                .should("be.visible");
        });
    });

    // TOOLBAR
    context("Sample Toolbar", () => {
        beforeEach(() => {
            cy.get("@container")
                .find(`div[data-cy="toolbar"]`)
                .as("toolbar");
        });

        //1. Render the toolbar
        context("render", () => {
            // 1.1. It should render a div with the toolbar
            it("should render toolbar", () => {
                cy.get("@container")
                    .find(`div[data-cy="toolbar-wrapper"]`)
                    .should("be.visible");
            });
            // 1.1. If configured, it should render a New button
            it("should render New button", () => {
                cy.get("@container")
                    .find(`button[data-action="create"]`)
                    .should("be.visible");
            });
        });
    });

    // MODAL CREATE
    context("Modal Create", () => {
        beforeEach(() => {
            cy.get("@container")
                .find(`button[data-action="create"]`)
                .click();
            cy.get("@container")
                .find(`div[data-cy="modal-create"]`)
                .as("modal-create");
        });
        // 1. Open modal and render create
        it("should render create modal", () => {
            cy.get("@modal-create")
                .find("div.modal-dialog")
                .should("be.visible");
        });
        // 2. Render title
        it("should render create title", () => {
            cy.get("@modal-create")
                .find("h4.modal-title")
                .should("contain.text", "Sample Create");
        });
        // 3. Render button clear
        it("should render button clear", () => {
            cy.get("@modal-create")
                .contains("button", "Clear")
                .should("be.visible");
        });
        // 4. Render button create
        it("should render button create", () => {
            cy.get("@modal-create")
                .contains("button", "Create")
                .should("be.visible");
        });
        // 5. Render tabs
        it("should render form tabs", () => {
            cy.get("@modal-create")
                .find("ul.nav.nav-tabs > li")
                .should("have.length.greaterThan", 1);
        });
        // 6. Render Sample ID
        it("should have form field ID", () => {
            cy.get("@modal-create")
                .find(`data-form div.form-horizontal div.row div.col-md-3`)
                .should("contain.text", "Sample ID");
        });
    });

    // MODAL UPDATE
    context("Modal Update", () => {
        beforeEach(() => {
            cy.get("@container")
                .find(`table tbody tr td button.dropdown-toggle`)
                .first()
                .click();
            cy.get("@container")
                .find(`a[data-action="edit"]`)
                .first()
                .click();
            cy.get(`div[data-cy="modal-update"]`)
                .as("modal-update");
        });
        // 1. Open modal and render update
        it("should render update modal", () => {
            cy.get("@modal-update")
                .find("div.modal-dialog")
                .should("be.visible");
        });
        // 2. Render title
        it("should render update title", () => {
            cy.get("@modal-update")
                .find("h4.modal-title")
                .should("contain.text", "Sample Update");
        });
        // 3. Render button clear
        it("should render button clear", () => {
            cy.get("@modal-update")
                .contains("button", "Discard Changes")
                .should("be.visible");
        });
        // 4. Render button create
        it("should render button create", () => {
            cy.get("@modal-update")
                .contains("button", "Update")
                .should("be.visible");
        });
        // 5. Render tabs
        it("should render form tabs", () => {
            cy.get("@modal-update")
                .find("ul.nav.nav-tabs > li")
                .should("have.length.greaterThan", 1);
        });
        // 6. Render Sample ID
        it("should have form field ID equal to sample selected", () => {
            cy.get("@modal-update")
                .find(`data-form div.row div.row div.col-md-3`)
                .should("contain.text", "Sample ID");
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
                    // const startPosition = $modal.position()
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
                        .trigger("mouseup"); // Release the mouse

                    // Get the final position of the modal
                    cy.get(`@modalHeader`)
                        .then(($modal) => {
                            // const finalPosition = $modal.position();
                            const finalPosition = $modal.offset();
                            cy.log("final Position:", finalPosition);

                            // Assert that the modal has moved
                            expect(finalPosition.left).to.not.equal(startPosition.left);
                            expect(finalPosition.top).to.not.equal(startPosition.top);
                        });
                });
        });

        it("should hide columns [Collection Method,Preparation Method]",() => {
            const columns = ["Collection Method", "Preparation Method"];
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

    // GRID
    context("Sample Grid", () => {
        const gridComponent = "sample-grid";

        beforeEach(() => {
            cy.get("@container")
                .find(`div[data-cy="sb-grid"]`)
                .as("grid");
        });

        // 1. Render the grid
        context("render", () => {
            // It should render a table, with at least one column and one row
            it("should render table", () => {
                cy.get("@container")
                    .find(`table`)
                    .should("be.visible");
            });
            it("should render at least one row", () => {
                cy.get("@container")
                    .find(`tbody tr`)
                    .should("be.visible");
            });
            it("should render at least one column", () => {
                cy.get("@container")
                    .find(`thead tr th`)
                    .should("be.visible");
            });
            it("should render column titles", () => {
                cy.get("@container")
                    .find(`thead tr th div[class="th-inner "]`)
                    .should("not.be.empty");
            });
            it("should render at least one row", () => {
                cy.get("@container")
                    .find(`tbody tr`)
                    .should("be.visible");
            });
            // It should render the pagination
            it("should change page", () => {
                UtilsTest.changePage(gridComponent,2);
            });

            it("should move modal setting", () => {
                cy.get("button[data-action='settings']")
                    .click();

                BrowserTest.getElementByComponent({
                    selector: "sample-grid opencb-grid-toolbar",
                    tag: "div",
                    elementId: "SettingModal",
                }).as("settingModal");

                cy.get("@settingModal")
                    .then(($modal) => {
                        const startPosition = $modal.offset();
                        cy.log("start Position:", startPosition);
                        // Drag the modal to a new position using Cypress's drag command
                        // eslint-disable-next-line cypress/unsafe-to-chain-command
                        cy.get("@settingModal")
                            .find(".modal-header")
                            .trigger("mousedown", { which: 1 }) // Trigger mouse down event
                            .trigger("mousemove", { clientX: 100, clientY: 100 }) // Move the mouse
                            .trigger("mouseup"); // Release the mouse

                        // Get the final position of the modal
                        cy.get(`@settingModal`)
                            .find(".modal-header")
                            .then(($modal) => {
                                const finalPosition = $modal.offset();
                                cy.log("final Position:", finalPosition);
                                // Assert that the modal has moved
                                expect(finalPosition.left).to.not.equal(startPosition.left);
                                expect(finalPosition.top).to.not.equal(startPosition.top);
                    });
                });
            });

        });

        context("data completeness", () => {
            let creationDateIndex = null;

            beforeEach(() => {
                cy.get("@grid")
                    .find(`tbody`)
                    .as("body");
            });

            it("should have IDs", () => {
                cy.get("@body")
                    .find("td:first-child")
                    .each($td => {
                        cy.wrap($td)
                            .should("not.be.empty");
                    });
            });

            it("should have a creation date", () => {
                cy.get("@grid")
                    .contains("th", "Creation Date")
                    .invoke("index")
                    .then(i => {
                        creationDateIndex = i + 1;
                        cy.get("@body")
                            .find(`td:nth-child(${creationDateIndex})`)
                            .each(td => {
                                cy.wrap(td)
                                    .should("not.be.empty");
                            });
                    });
            });

            it("should have a creation date with valid format", () => {
                cy.get("@body")
                    .find(`td:nth-child(${creationDateIndex})`)
                    .each(td => {
                        const regExp = /^(([0-9])|([0-2][0-9])|([3][0-1])) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}$/;
                        expect(td.text()).to.match(regExp);
                    });
            });

            it("should have a creation date equal or earlier than today ", () => {
                cy.get("@body")
                    .find(`td:nth-child(${creationDateIndex})`)
                    .each(td => {
                        const date = new Date(td.text());
                        const today = new Date();
                        expect(date).to.be.lte(today);
                    });
            });

        });

        context("data format", () => {
            beforeEach(() => {
                cy.get("@grid")
                    .find(`tbody tr[data-index="0"]`)
                    .as("row");
            });
        });

        context("extension", () => {
            it("should display 'Extra Column' column", () => {
                cy.get("thead th")
                    .contains("Extra column")
                    .should("be.visible");
            });
        });
    });

    context("Detail", () => {
        beforeEach(() => {
            cy.get("@container")
                .find(`div[data-cy="sb-detail"]`)
                .as("detail");
        });

        it("should render", () => {
            cy.get("@detail")
                .should("be.visible");
        });

        it("should display info from the selected row", () => {
            const sample = "NA12889";
            cy.get(`tbody tr[data-uniqueid="${sample}"]`)
                .find(`td:first`)
                .trigger("click");

            cy.get(`detail-tabs h3`)
                .should("contain.text", `Sample ${sample}`);
        });

        it("should display 'JSON Data' Tab", () => {
            cy.get("@detail")
                .find("li")
                .contains("JSON Data")
                .trigger("click");

            cy.get("json-viewer")
                .should("be.visible");
        });
    });
});
