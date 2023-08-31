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


context("Variant Interpreter Grid Germiline", () => {
    const browserInterpreterGrid = "variant-interpreter-grid";

    beforeEach(() => {
        // cy.intercept("#variant-interpreter-grid-germline").as("getBrowserGrid") //Not Working
        cy.visit("#variant-interpreter-grid-germline")
        cy.waitUntil(() => {
            return cy.get(browserInterpreterGrid)
                .should("be.visible");
        });
        // cy.wait("@getBrowserGrid") // Not working
    });

    context("Grid", () => {
        it("should render variant-interpreter-grid", () => {
            cy.get(browserInterpreterGrid)
                .should("be.visible");
        });

        it("should change page variant-interpreter-grid", () => {
            UtilsTest.changePage(browserInterpreterGrid,2);
            UtilsTest.changePage(browserInterpreterGrid,3);
        });

        it("should move modal setting", () => {

            cy.get("button[data-action='settings']")
                .click();

            BrowserTest.getElementByComponent({
                selector: 'variant-interpreter-grid opencb-grid-toolbar',
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

    context("Tooltip",() => {
        it("should display variant tooltip", () => {
            BrowserTest.getColumnIndexByHeader("Variant");
            cy.get("@indexColumn")
                .then(index => {
                    cy.get("tbody tr:first > td")
                        .eq(index)
                        .within(() => {
                            cy.get("a")
                                .trigger("mouseover");
                        })
                    cy.get(".qtip-content")
                        .should('be.visible');
            })
        })

        it("should display gene tooltip", () => {
            BrowserTest.getColumnIndexByHeader("Gene");
            cy.get("@indexColumn")
                .then(indexColumn => {
                    cy.get("tbody tr:first > td")
                        .eq(indexColumn)
                        .within(() => {
                            cy.get("a")
                                .eq(0)
                                .trigger("mouseover");
                        });
                    cy.get(".qtip-content")
                        .should('be.visible');
                });
        });

        it("should display sample genotype (Variant Call Information) tooltip", () => {
            BrowserTest.getColumnIndexByHeader("Consequence Type");
            cy.get("@indexColumn")
                .then(indexColumn => {
                    cy.get("tbody tr:first > td")
                        .eq(indexColumn)
                        .within(() => {
                            cy.get("a")
                                .eq(0)
                                .trigger("mouseover");
                    });
                    cy.get(".qtip-content")
                        .should('be.visible');
            });
        });

        it("should display cohort stats (Population Frequencies) tooltip", () => {
            cy.get("tbody tr:first > td")
                .eq(8)
                .within(() => {
                    cy.get("a")
                        .trigger("mouseover");
                });
            cy.get(".qtip-content")
                .should('be.visible');
        });

        it("should display reference population frequencies tooltip", () => {
            cy.get("tbody tr:first > td")
                .eq(9)
                .within(() => {
                    cy.get("a")
                        .trigger("mouseover");
                });
            cy.get(".qtip-content")
                .should('be.visible');
        });

        it("should display ACMG Prediction (Classification) tooltip", () => {
            cy.get("tbody tr:first > td")
                .eq(14)
                .within(() => {
                    cy.get("a")
                        .trigger("mouseover");
                });
            cy.get(".qtip-content")
                .should('be.visible');
        });
    });

    context("Helpers", () => {

        it("should display deleteriousness column help", () => {
            cy.get("thead th")
                .contains("div","Deleteriousness")
                .within(() => {
                    cy.get("a")
                        .trigger("mouseover");
                })
            cy.get(".qtip-content")
                .should('be.visible');
        })

        it("should display reference population frequencies column help", () => {
            cy.get("thead th")
                .contains("div","Reference Population Frequencies")
                .within(() => {
                cy.get("a")
                    .trigger("mouseover");
            });
            cy.get(".qtip-content")
                .should('be.visible');
        });

        it("should display clinical info column help", () => {
            cy.get("thead th").contains("div","Clinical Info")
                .within(() => {
                    cy.get("a")
                        .trigger("mouseover");
            })
            cy.get(".qtip-content")
                .should('be.visible');
        });

        it("should display interpretation column hel`", () => {
            cy.get("thead th")
                .contains("div","Interpretation")
                .within(() => {
                cy.get("a")
                    .trigger("mouseover");
            })
            cy.get(".qtip-content")
                .should('be.visible');
        });
    });

    context("Row", () => {
        it.skip("should display variant interpreter json", () => {
            cy.get("tbody tr:first > td")
                .eq(-1)
                .within(() => {
                    cy.get("button")
                        .click();
                    cy.get("ul[class='dropdown-menu dropdown-menu-right']")
                        .contains("a","Copy JSON")
                        .click();
                    UtilsTest.assertValueCopiedToClipboard()
                        .then(content => {
                            const dataClipboard = JSON.parse(content);
                            expect(dataClipboard.id)
                                .eq("1:187378:A:G");
                            expect(dataClipboard.type)
                                .eq("SNV");
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
                    cy.readFile("cypress/downloads/1_187378_A_G.json")
                        .should("exist");
                });
        });

        it.skip("should click external links", () => {
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
