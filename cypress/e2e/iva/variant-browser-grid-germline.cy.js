/**
 * Copyright 2015-2016 OpenCB
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

context("Variant Browser Grid Germline", () => {
    const browserGrid = "variant-browser-grid";
    const browserDetail = "variant-browser-detail";

    beforeEach(() => {
        cy.visit("#variant-browser-grid-germline");
        cy.waitUntil(() => {
            return cy.get(browserGrid)
                .should("be.visible");
        });
    });

    context("Grid", () => {
        it("should render variant-browser-grid", () => {
            cy.get(browserGrid)
                .should("be.visible");
        });

        it("should change page variant-browser-grid", () => {
            UtilsTest.changePage(browserGrid,2);
            UtilsTest.changePage(browserGrid,3);
        });


        it("should move modal setting", () => {

            cy.get("button[data-action='settings']")
                .click();

            BrowserTest.getElementByComponent({
                selector: 'variant-browser-grid opencb-grid-toolbar',
                tag:'div',
                elementId: 'SettingModal'
            }).as("settingModal");

            cy.get("@settingModal")
                .then(($modal) => {
                    const startPosition = $modal.position();
                    // Drag the modal to a new position using Cypress's drag command
                    cy.get("@settingModal")
                        .find('.modal-header')
                        .trigger('mousedown', { which: 1 }) // Trigger mouse down event
                        .trigger('mousemove', { clientX: 100, clientY: 100 }) // Move the mouse
                        .trigger('mouseup'); // Release the mouse

                    // Get the final position of the modal
                    cy.get(`@settingModal`)
                        .find('.modal-header')
                        .then(($modal) => {
                            const finalPosition = $modal.position();
                            // Assert that the modal has moved
                            expect(finalPosition.left).to.not.equal(startPosition.left);
                            expect(finalPosition.top).to.not.equal(startPosition.top);
                        });
                });
        });
    });

    context("Tooltip", () => {
        it("should display variant tooltip", () => {
            // Select first row, first column: Variant
            // variant == id
            BrowserTest.getColumnIndexByHeader("Variant");
            cy.get("@indexColumn")
                .then(index => {
                    cy.get("tbody tr:first > td")
                        .eq(index)
                        .within(() => {
                            cy.get("a")
                                .eq(0)
                                .trigger("mouseover");
                        })
                    cy.get(".qtip-content")
                        .should('be.visible');
            });
        });

        it("should display gene tooltip", () => {
            BrowserTest.getColumnIndexByHeader("Gene");
            cy.get("@indexColumn")
                .then(index => {
                    cy.get("tbody tr:first > td")
                        .eq(index)
                        .within(() => {
                            cy.get("a")
                                .eq(0)
                                .trigger("mouseover");
                    });
                    cy.get(".qtip-content")
                        .should('be.visible');
            });
        });

        it("should display consequenceType tooltip", () => {
            BrowserTest.getColumnIndexByHeader("Consequence Type");
            cy.get("@indexColumn")
                .then(index => {
                    cy.get("tbody tr:first > td")
                        .eq(index)
                        .within(() => {
                            cy.get("span")
                                .eq(0)
                                .trigger("mouseover");
                    });
                // cy.get(".qtip-content")
                //  .should('be.visible')
            });
        });

        it("should display population frequencies tooltip", () => {
            cy.get("tbody tr:first > td")
                .eq(13)
                .within(() => {
                    cy.get("a")
                        .trigger("mouseover");
            })
            cy.get(".qtip-content")
                .should('be.visible');
        });
    });

    context("Helpers", () => {
        it("should display deleteriousness help", () => {
            cy.get("thead th")
                .contains("div","Deleteriousness")
                .within(() => {
                    cy.get("a")
                        .trigger("mouseover");
                });
            cy.get(".qtip-content")
                .should('be.visible');
        });

        it("should display conservation help", () => {
            cy.get("thead th")
                .contains("div","Conservation")
                .within(() => {
                    cy.get("a")
                        .trigger("mouseover");
                });
            cy.get(".qtip-content")
                .should('be.visible');
        });

        it("should display population frequencies help", () => {
            cy.get("thead th")
                .contains("div","Population Frequencies")
                    .within(() => {
                        cy.get("a")
                            .trigger("mouseover");
            });
            cy.get(".qtip-content")
                .should('be.visible');
        });

        it("should display clinical info help", () => {
            cy.get("thead th")
                .contains("div","Clinical Info")
                    .within(() => {
                        cy.get("a")
                            .trigger("mouseover");
            });
            cy.get(".qtip-content")
                .should('be.visible');
        });
    });

    context("Row", () => {
        it.skip("should copy variant json", () => {
            cy.get("tbody tr:first > td")
                .eq(18)
                .within(() => {
                    cy.get("button")
                        .click();
                    cy.get("ul[class='dropdown-menu dropdown-menu-right']")
                        .contains("a","Copy JSON")
                        .click();
                    UtilsTest.assertValueCopiedToClipboard()
                        .then(content => {
                            const dataClipboard = JSON.parse(content);
                            expect(dataClipboard.id).eq("6:168293914:C:T");
                            expect(dataClipboard.chromosome).eq("6");
                    });
            });
        });

        it("should download variant json", () => {
            cy.get("tbody tr:first > td")
                .eq(-1)
                .within(() => {
                    cy.get("button")
                        .click();
                    cy.get("ul[class='dropdown-menu dropdown-menu-right']")
                        .contains("a","Download JSON")
                        .click();
                    cy.readFile("cypress/downloads/6_168293914_C_T.json")
                        .should("exist");
            });
        });

        it.skip("External Links", () => {
            cy.get("tbody tr:first > td")
                .eq(-1)
                .within(() => {
                    cy.get("button")
                        .click();
                    cy.get("ul[class='dropdown-menu dropdown-menu-right']")
                        .contains("a","Ensembl Genome Browser")
                        .click();
            });
        });
    });
});
