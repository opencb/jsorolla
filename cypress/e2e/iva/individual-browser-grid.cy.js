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

context("Individual Browser Grid", () => {
    const browserGrid = "individual-grid";

    beforeEach(() => {
        cy.visit("#individual-browser-grid");
        cy.get(`div[data-cy="individual-browser-container"]`)
            .as("container");
        cy.waitUntil(() => {
            return cy.get("@container")
                .should("be.visible");
        });
    });

    // TOOLBAR
    context("Individual Toolbar", () => {

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
            // eslint-disable-next-line cypress/unsafe-to-chain-command
            cy.get("@container")
                .find(`button[data-action="create"]`)
                .click();
            cy.get("@container")
                .find(`div[data-cy="modal-create"]`)
                .as("modal-create");
        });
        // 1. Open modal and render create
        it("should render create modal", () => {
            // eslint-disable-next-line cypress/unsafe-to-chain-command
            cy.get("@modal-create")
                .find("div.modal-dialog")
                .should("be.visible");
        });
        // 2. Render title
        it("should render create title", () => {
            // eslint-disable-next-line cypress/unsafe-to-chain-command
            cy.get("@modal-create")
                .find("h4.modal-title")
                .should("contain.text", "Individual Create");
        });
        // 3. Render button clear
        it("should render button clear", () => {
            // eslint-disable-next-line cypress/unsafe-to-chain-command
            cy.get("@modal-create")
                .contains("button", "Clear")
                .should("be.visible");
        });
        // 4. Render button create
        it("should render button create", () => {
            // eslint-disable-next-line cypress/unsafe-to-chain-command
            cy.get("@modal-create")
                .contains("button", "Create")
                .should("be.visible");
        });
        // 5. Render tabs
        it("should render form tabs", () => {
            // eslint-disable-next-line cypress/unsafe-to-chain-command
            cy.get("@modal-create")
                .find("ul.nav.nav-tabs > li")
                .should("have.length.greaterThan", 1);
        });
        // 5. Render Sample ID
        it("should have form field ID", () => {
            // eslint-disable-next-line cypress/unsafe-to-chain-command
            cy.get("@modal-create")
                .find(`data-form div.form-horizontal div.row label.col-form-label`)
                .should("contain.text", "Individual ID");
        });
    });

    // MODAL CREATE AUTOCOMPLETE
    context("Modal Create Autocomplete", () => {
        beforeEach(() => {
            // eslint-disable-next-line cypress/unsafe-to-chain-command
            cy.get("@container")
                .find(`button[data-action="create"]`)
                .click();
            cy.get("@container")
                .find(`div[data-cy="modal-create"]`)
                .as("modal-create");
        });

        it("should autocomplete on searching and selecting one result", () => {
            // eslint-disable-next-line cypress/unsafe-to-chain-command
            cy.get("@modal-create")
                .contains("ul.nav.nav-tabs > li", "Phenotypes")
                .click();
            cy.get("@modal-create")
                .contains("button", "Add Item")
                .click();
            cy.get("cellbase-search-autocomplete")
                .find("select-token-filter .select2-container")
                .click();
            cy.get("cellbase-search-autocomplete")
                .find("input.select2-search__field")
                .type("gli");
            cy.get("cellbase-search-autocomplete")
                .find("span.select2-results li")
                .first()
                .click();
            cy.get("cellbase-search-autocomplete")
                .find("span.select2-selection__rendered")
                .should("contain.text", "Glioblastoma multiforme");
            cy.get("@modal-create")
                .find(`input[placeholder="Add phenotype ID..."]`)
                .then(element => {
                    expect(element.val()).equal("HP:0012174");
                    cy.wrap(element).should("be.disabled");
                });

        });
    });

    // MODAL UPDATE
    context("Modal Update", () => {
        beforeEach(() => {
            // eslint-disable-next-line cypress/unsafe-to-chain-command
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
            // eslint-disable-next-line cypress/unsafe-to-chain-command
            cy.get("@modal-update")
                .find("div.modal-dialog")
                .should("be.visible");
        });
        // 2. Render title
        it("should render update title", () => {
            // eslint-disable-next-line cypress/unsafe-to-chain-command
            cy.get("@modal-update")
                .find("h4.modal-title")
                .should("contain.text", "Individual Update");
        });
        // 3. Render button clear
        it("should render button clear", () => {
            // eslint-disable-next-line cypress/unsafe-to-chain-command
            cy.get("@modal-update")
                .contains("button", "Discard Changes")
                .should("be.visible");
        });
        // 4. Render button create
        it("should render button create", () => {
            // eslint-disable-next-line cypress/unsafe-to-chain-command
            cy.get("@modal-update")
                .contains("button", "Update")
                .should("be.visible");
        });
        // 5. Render tabs
        it("should render form tabs", () => {
            // eslint-disable-next-line cypress/unsafe-to-chain-command
            cy.get("@modal-update")
                .find("ul.nav.nav-tabs > li")
                .should("have.length.greaterThan", 1);
        });
        // 6. Render Sample ID
        it("should have form field ID equal to sample selected", () => {
            // eslint-disable-next-line cypress/unsafe-to-chain-command
            cy.get("@modal-update")
                .find(`data-form div.row div.row label.col-form-label`)
                .should("contain.text", "Individual ID");
        });
    });

    // MODAL SETTINGS
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
                        .trigger("mouseup"); // Release the mouse

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

        it("should hide columns [Disorders,Case ID,Ethnicity]",() => {
            const columns = ["Disorders","Case ID","Ethnicity"];
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
    context("Individual Grid", () => {

        beforeEach(() => {
            cy.get("@container")
                .find(`div[data-cy="ib-grid"]`)
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
            it("should render at least one column", () => {
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
        });

        // 2. Data completeness in the grid
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
                            .find(`td:nth-child(${i})`)
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

        // 3. Data format
        context("data format", () => {
            beforeEach(() => {
                cy.get("@grid")
                    .find(`tbody tr[data-index="0"]`)
                    .as("row");
            });
        });

        // 4. Extensions
        context("extension", () => {
            it("should display 'Extra Column' column", () => {
                cy.get("thead th")
                    .contains("Extra column")
                    .should('be.visible');
            });
        });

        // 5. Annotations
        context("annotations", () => {
            const annotations = [
                {
                    title: "Cardiology Tests",
                    position: 6,
                    variables: ["ecg_test", "echo_test"]
                },
                {
                    title: "Risk Assessment",
                    position: 7,
                    variables: ["date_risk_assessment"]
                }
            ];

            beforeEach(() => {
                cy.get("@grid")
                    .find("table")
                    .as("table");
            });

            // 5.1 Render each varSet title as column header
            it("should render enabled varSet column titles", () => {
                cy.wrap(annotations).each(annotation => {
                    cy.get("@table")
                        .contains("thead tr th", annotation.title);
                });
            });
            // 5.2 Render each varSet column at the position configured in position
            it("should have varSet position configured equal to the index of the corresponding column", () => {
                cy.wrap(annotations).each(annotation => {
                    cy.get("@table")
                        .contains("thead tr th", annotation.title)
                        .invoke("index")
                        .then(i => {
                            // 1. Test index column configured equals column index rendered
                            expect(i-1).equal(annotation.position);
                        });
                    });
                });
        // 5.3 Render variables correctly
            it("should render annotations configured", () => {
            cy.wrap(annotations).each(annotation => {
                cy.get("@table")
                    .contains("thead tr th", annotation.title)
                    .invoke("index")
                    .then(i => {
                        // 1. Test index column configured equals column index rendered
                        cy.get("tbody tr")
                            .first()
                            .find("td")
                            .eq(i)
                            .should("contain.text", annotation.variables[0]);
                        });
                });
            });
        });
    });

    // DETAIL TABS
    context("Detail", () => {
        beforeEach(() => {
            cy.get("@container")
                .find(`div[data-cy="ib-detail"]`)
                .as("detail");
        });

        it("should render", () => {
            cy.get("@detail")
                .should("be.visible");
        });

        it("should display info from the selected row", () => {
            const individual = "NA12877";
            cy.get(`tbody tr[data-uniqueid="${individual}"]`)
                .find(`td`)
                .eq(1)
                .trigger("click");

            cy.get(`detail-tabs h3`)
                .should("contain.text", `Individual ${individual}`);
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
