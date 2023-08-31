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

context("File Browser Grid", () => {
    const browserGrid = "file-grid";
    const browserDetail = "file-detail";

    beforeEach(() => {
        cy.visit("#file-browser-grid")
        cy.waitUntil(() => {
            return cy.get(browserGrid)
                .should("be.visible");
        });
    });


    // TOOLBAR
    context("File Toolbar", () => {
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
                .should("be.disabled");
            cy.get(browserGrid)
                .find(`div[data-cy="modal-create"]`)
                .as("modal-create");
        });
        // 1. Open modal and render create
        // it("should render create modal", () => {
        //     // eslint-disable-next-line cypress/unsafe-to-chain-command
        //     cy.get("@modal-create")
        //         .find("div.modal-dialog")
        //         .should("be.visible");
        // });
        // 2. Render title
        // it("should render create title", () => {
        //     // eslint-disable-next-line cypress/unsafe-to-chain-command
        //     cy.get("@modal-create")
        //         .find("h4.modal-title")
        //         .should("contain.text", "File Create");
        // });
        // 3. Render button clear
        // it("should render button clear", () => {
        //     // eslint-disable-next-line cypress/unsafe-to-chain-command
        //     cy.get("@modal-create")
        //         .contains('button', 'Clear')
        //         .should("be.visible");
        // });
        // 4. Render button create
        // it("should render button create", () => {
        //     // eslint-disable-next-line cypress/unsafe-to-chain-command
        //     cy.get("@modal-create")
        //         .contains('button', 'Create')
        //         .should("be.visible");
        // });
        // 5. Render tabs
        // it("should render form tabs", () => {
        //     // eslint-disable-next-line cypress/unsafe-to-chain-command
        //     cy.get("@modal-create")
        //         .find("ul.nav.nav-tabs > li")
        //         .should("have.length.at.least", 1);
        // });
        // 6. Render File ID
        // it("should have form field ID", () => {
        //     // eslint-disable-next-line cypress/unsafe-to-chain-command
        //     cy.get("@modal-create")
        //         .find(`data-form div.form-horizontal div.row.form-group  label.control-label`)
        //         .should("contain.text", "File ID");
        // });
    });

    context("Grid",{tags: "@shortTask"}, () => {
        it("should render", () => {
            cy.get(browserGrid)
                .should("be.visible");
        });

        it("should change page", () => {
            UtilsTest.changePage(browserGrid,2);
            UtilsTest.changePage(browserGrid,3);
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

        it("should download file json",{tags:"@shortTask"}, () => {
            cy.get("tbody tr:first > td")
                .eq(-2)
                .within(() => {
                    cy.get("button")
                        .click();
                    cy.get("ul[class='dropdown-menu dropdown-menu-right']")
                        .contains("a","Download JSON")
                        .click();
            });
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
            BrowserTest.getColumnIndexByHeader("Name")
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
                            const textTab = text.split(":");
                            expect(textRow).to.equal(textTab[1].trim());
                        });
                });
        });

        it("should display 'Preview' Tab", () => {
            // eslint-disable-next-line cypress/unsafe-to-chain-command
            cy.get(`detail-tabs > div.detail-tabs > ul`)
                .find("li")
                .contains("Preview")
                .click()
                .should('be.visible');
        });
    });
});
