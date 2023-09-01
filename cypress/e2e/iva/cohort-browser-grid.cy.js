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
import BrowserTest from "../../support/browser-test.js";

context("Cohort Browser Grid", () => {
    const browserGrid = "cohort-grid";
    const browserDetail = "cohort-detail";

    beforeEach(() => {
        cy.visit("#cohort-browser-grid");
        cy.waitUntil(() => {
            return cy.get(browserGrid)
                .should("be.visible");
        });
    });

    // TOOLBAR
    context("Cohort Toolbar", () => {
        const toolbarComponent = "";

        beforeEach(() => {
            cy.get(browserGrid)
                .find(`div[data-cy="toolbar"]`)
                .as("toolbar");
        });

        //1. Render the toolbar
        context("render", () => {
            // 1.1. It should render a div with the toolbar
            it("should render toolbar", () => {
                cy.get(browserGrid)
                    .find(`div[data-cy="toolbar-wrapper"]`)
                    .should("be.visible");
            });
            // 1.1. If configured, it should render a New button
            it("should render New button", () => {
                cy.get(browserGrid)
                    .find(`button[data-action="create"]`)
                    .should("be.visible");
            });
        });
    });

    // MODAL CREATE
    context("Modal Create", () => {
        beforeEach(() => {
            // eslint-disable-next-line cypress/unsafe-to-chain-command
            cy.get(browserGrid)
                .find(`button[data-action="create"]`)
                .click();
            cy.get(browserGrid)
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
                .should("contain.text", "Cohort Create");
        });
        // 3. Render button clear
        it("should render button clear", () => {
            // eslint-disable-next-line cypress/unsafe-to-chain-command
            cy.get("@modal-create")
                .contains('button', 'Clear')
                .should("be.visible");
        });
        // 4. Render button create
        it("should render button create", () => {
            // eslint-disable-next-line cypress/unsafe-to-chain-command
            cy.get("@modal-create")
                .contains('button', 'Create')
                .should("be.visible");
        });
        // 5. Render tabs
        it("should render form tabs", () => {
            // eslint-disable-next-line cypress/unsafe-to-chain-command
            cy.get("@modal-create")
                .find("ul.nav.nav-tabs > li")
                .should("have.length.at.least", 1);
        });
        // 6. Render Cohort ID
        it("should have form field ID", () => {
            // eslint-disable-next-line cypress/unsafe-to-chain-command
            cy.get("@modal-create")
                .find(`data-form div.form-horizontal div.row.form-group  label.control-label`)
                .should("contain.text", "Cohort ID");
        });
    });

    // MODAL UPDATE
    // context("Modal Update", () => {
    //     beforeEach(() => {
    //         // eslint-disable-next-line cypress/unsafe-to-chain-command
    //         cy.get(browserGrid)
    //             .find(`table tbody tr td button.dropdown-toggle`)
    //             .first()
    //             .click();
    //         cy.get(browserGrid)
    //             .find(`a[data-action="edit"]`)
    //             .first()
    //             .click();
    //         cy.get(browserGrid)
    //             .find(`div[data-cy="modal-update"]`)
    //             .as("modal-update");
    //     });
    //     // 1. Open modal and render update
    //     it("should render update modal", () => {
    //         // eslint-disable-next-line cypress/unsafe-to-chain-command
    //         cy.get("@modal-update")
    //             .find("div.modal-dialog")
    //             .should("be.visible");
    //     });
    //     // 2. Render title
    //     it("should render update title", () => {
    //         // eslint-disable-next-line cypress/unsafe-to-chain-command
    //         cy.get("@modal-update")
    //             .find("h4.modal-title")
    //             .should("contain.text", "Cohort Update");
    //     });
    //     // 3. Render button clear
    //     it("should render button clear", () => {
    //         // eslint-disable-next-line cypress/unsafe-to-chain-command
    //         cy.get("@modal-update")
    //             .contains('button', 'Discard Changes')
    //             .should("be.visible");
    //     });
    //     // 4. Render button create
    //     it("should render button create", () => {
    //         // eslint-disable-next-line cypress/unsafe-to-chain-command
    //         cy.get("@modal-update")
    //             .contains('button', 'Update')
    //             .should("be.visible");
    //     });
    //     // 5. Render tabs
    //     it("should render form tabs", () => {
    //         // eslint-disable-next-line cypress/unsafe-to-chain-command
    //         cy.get("@modal-update")
    //             .find("ul.nav.nav-tabs > li")
    //             .should("have.length.greaterThan", 1);
    //     });
    //     // 6. Render Sample ID
    //     it("should have form field ID equal to sample selected", () => {
    //         // eslint-disable-next-line cypress/unsafe-to-chain-command
    //         cy.get("@modal-update")
    //             .find(`data-form div.row div.row.form-group  label.control-label`)
    //             .should("contain.text", "Cohort ID");
    //     });
    // });

    context("Grid", () => {
        it("should render", () => {
            cy.get(browserGrid)
                .should("be.visible");
        });

        it("should change page", () => {
            UtilsTest.changePage(browserGrid,2);
            UtilsTest.changePage(browserGrid,3);
        });

        it("should move modal setting", () => {
            cy.get("button[data-action='settings']")
                .click()

            BrowserTest.getElementByComponent({
                selector: 'cohort-grid opencb-grid-toolbar',
                tag:'div',
                elementId: 'SettingModal'
            }).as("settingModal")

            cy.get("@settingModal")
                .then(($modal) => {
                    // const startPosition = $modal.position()
                    const startPosition = $modal.offset();
                    cy.log("start Position:", startPosition);
                    // Drag the modal to a new position using Cypress's drag command
                    cy.get("@settingModal")
                        .find('.modal-header')
                        .trigger('mousedown', { which: 1 }) // Trigger mouse down event
                        .trigger('mousemove', { clientX: 10, clientY: 10 }) // Move the mouse
                        .trigger('mouseup') // Release the mouse

                    // Get the final position of the modal
                    cy.get(`@settingModal`)
                        .find('.modal-header')
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

        it("should hidden columns [Date,Type]",() => {

            cy.get("thead th").contains("div","Type").should("be.visible")
            cy.get("thead th").contains("div", "Date").should("be.visible")

            cy.get("button[data-action='settings']")
                .click()
            UtilsTest.getByDataTest("test-columns", "select-field-filter button").click();
            UtilsTest.getByDataTest("test-columns", "select-field-filter a").contains("Date").click();
            UtilsTest.getByDataTest("test-columns", "select-field-filter a").contains("Type").click();
            UtilsTest.getByDataTest("test-columns", "select-field-filter button").click();

            BrowserTest.getElementByComponent({
                selector: 'cohort-grid opencb-grid-toolbar',
                tag:'div',
                elementId: 'SettingModal'
            }).as("settingModal")

            cy.get("@settingModal")
                .contains('button', 'OK')
                .click();

            cy.get("thead th div").should("not.have.value","Type")
            cy.get("thead th div").should("not.have.value","Date")
            // cy.get("thead th").contains("div","Type").should("not.be.visible")
            // cy.get("thead th").contains("div", "Date").should("not.be.visible")

        });
    });

    context("Row", () => {
        it("should display row #3 as selected", () => {
            // eslint-disable-next-line cypress/unsafe-to-chain-command
            cy.get("tbody tr")
                .eq(3)
                .click()
                .should("have.class","success");
            });
    });

    context("extension", () => {
        it("should display 'Extra Column' column", () => {
            cy.get("thead th")
                .contains("Extra column")
                .should('be.visible');
        });

        it("should display 'New Catalog Tab' Tab", () => {
            // eslint-disable-next-line cypress/unsafe-to-chain-command
            cy.get(`detail-tabs > div.detail-tabs > ul`)
                .find("li")
                .contains("New Catalog Tab")
                .click()
                .should('be.visible');
        });
    });

    context("detail tab", () => {
        it("should render", () => {
            cy.get(browserDetail)
                .should("be.visible");
        });

        it("should display info from the selected row",() => {
            BrowserTest.getColumnIndexByHeader("Cohort ID")
            cy.get("@indexColumn")
                .then((indexColumn) => {
                    const indexRow = 2
                    // eslint-disable-next-line cypress/unsafe-to-chain-command
                    cy.get(`tbody tr`)
                        .eq(indexRow)
                        .click() // select the row
                        .find("td")
                        .eq(indexColumn)
                        .invoke("text")
                        .as("textRow")
                    });

            cy.get("@textRow")
                .then((textRow) => {
                    cy.get("detail-tabs > div.panel")
                        .invoke("text")
                        .then((text) => {
                            const textTab = text.trim().split(" ");
                            expect(textRow).to.equal(textTab[1].trim());
                        });
                });
        });

        it("should display 'JSON Data' Tab", () => {
            // eslint-disable-next-line cypress/unsafe-to-chain-command
            cy.get(`detail-tabs > div.detail-tabs > ul`)
                .find("li")
                .contains("JSON Data")
                .click()
                .should('be.visible');
        });
    });
});
