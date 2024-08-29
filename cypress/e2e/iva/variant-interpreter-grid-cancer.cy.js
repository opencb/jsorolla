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

context("Variant Interpreter Grid Cancer", () => {
    const browserInterpreterGrid = "variant-interpreter-grid";

    beforeEach(() => {
        cy.visit("#variant-interpreter-grid-cancer");
        cy.waitUntil(() => {
            return cy.get(browserInterpreterGrid)
                .should("be.visible");
        });
    });

    context("Modal Setting", () => {

        it("should move modal setting", () => {

            cy.get("button[data-action='settings']")
                .click();

            BrowserTest.getElementByComponent({
                selector: `${browserInterpreterGrid} opencb-grid-toolbar`,
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
                    cy.get("@modalHeader")
                        .then(($modal) => {
                            const finalPosition = $modal.offset();
                            cy.log("final Position:", finalPosition);
                            // Assert that the modal has moved
                            expect(finalPosition.left).to.not.equal(startPosition.left);
                            expect(finalPosition.top).to.not.equal(startPosition.top);
                        });
                });
        });

        it("should hide columns [Type,Consequence Type,Gene]",() => {
            const columns = ["Consequence Type","Gene"];
            cy.get("variant-interpreter-grid thead th")
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
                selector: `${browserInterpreterGrid} opencb-grid-toolbar`,
                tag:"div",
                elementId: "SettingModal"
            }).as("settingModal");
            cy.get("@settingModal")
                .contains("button", "OK")
                .click();
            cy.get("@headerColumns")
                .should("not.exist");
            cy.get("@headerColumns")
                .should("exist");
            cy.get("@headerColumns")
                .should($header => {
                    const _columns = Array.from($header, th => th.textContent.trim());
                    columns.forEach(col => {
                        expect(col).not.to.be.oneOf(_columns);
                    });
                });
        });
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
                selector: "variant-interpreter-grid opencb-grid-toolbar",
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
                    cy.get("@modalHeader")
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

    context("Tooltip", () => {
        it("should display variant tooltip", () => {
            BrowserTest.getColumnIndexByHeader("Variant");
            cy.get("@indexColumn")
                .then(index => {
                    cy.get("tbody tr:first > td")
                        .eq(index)
                        .within(() => {
                        cy.get("a")
                            .trigger("mouseover");
                    });
                    cy.get(".qtip-content")
                        .should("be.visible");
            });
        });

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
                        .should("be.visible");
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
                        .should("be.visible");
            });
        });

        it("should display cohort stats tooltip", () => {
            cy.get("tbody tr:first > td")
                .eq(13)
                .find("a")
                .trigger("mouseover");
            cy.get(".qtip-content")
                .should("be.visible");
        });

        it("should display reference population frequencies tooltip", () => {
            cy.get("tbody tr:first > td")
                .eq(14)
                .find("a")
                .trigger("mouseover");
            cy.get(".qtip-content")
                .should("be.visible");
        });

        // it("8.Tooltip: Check ACMG Prediction (Classification)", () => {
        //     cy.get("tbody tr:first > td").eq(14).within(() => {
        //         cy.get("a").trigger("mouseover")
        //     })
        //     cy.get(".qtip-content").should('be.visible')
        // })
    });

    context("Helpers", () => {
         // Columns helpers
        it("should display deleteriousness column help", () => {
            cy.get("thead th")
                .contains("div","Deleteriousness")
                .within(() => {
                    cy.get("a")
                        .trigger("mouseover");
            });
            cy.get(".qtip-content")
                .should("be.visible");
        });

        it("should display Reference Population Frequencies column help", () => {
            cy.get("thead th")
                .contains("div","Reference Population Frequencies")
                .within(() => {
                    cy.get("a")
                        .trigger("mouseover");
            });
            cy.get(".qtip-content")
                .should("be.visible");
        });

        it("should display clinical info column help", () => {
            cy.get("thead th")
                .contains("div","Clinical Info")
                .within(() => {
                    cy.get("a")
                        .trigger("mouseover");
                });
            cy.get(".qtip-content")
                .should("be.visible");
        });

        it("should display interpretation column help", () => {
            cy.get("thead th")
                .contains("div","Interpretation")
                .within(() => {
                    cy.get("a")
                        .trigger("mouseover");
                });
            cy.get(".qtip-content")
                .should("be.visible");
        });
    });

    context("Row", () => {
        it.skip("should copy variant interpreter Json", () => {
            cy.get("tbody tr:first > td")
                .eq(-1)
                .within(() =>{
                    cy.get("button")
                        .click();
                    cy.get("ul[class*='dropdown-menu']")
                        .contains("a","Copy JSON")
                        .click();
                    UtilsTest.assertValueCopiedToClipboard()
                        .then(content => {
                            const dataClipboard = JSON.parse(content);
                            expect(dataClipboard.id)
                                .eq("1:611230:A:G");
                            expect(dataClipboard.type)
                                .eq("SNV");
                        });
            });
        });

        it("should download variant interpreter json", () => {
            cy.get("tbody tr:first > td")
                .eq(-1)
                .within(() => {
                    cy.get("button")
                        .click();
                    cy.get("ul[class*='dropdown-menu']")
                        .contains("a","Download JSON")
                        .click();
                    cy.readFile("cypress/downloads/1_611230_A_G.json")
                        .should("exist");
                });
        });

        it.skip("should click External Links", () => {
            cy.get("tbody tr:first > td")
                .eq(-1)
                .within(() => {
                    cy.get("button")
                        .click();
                    cy.get("ul[class*='dropdown-menu']")
                        .contains("a","Ensembl Genome Browser")
                        .click();
                });
        });
    });
});
