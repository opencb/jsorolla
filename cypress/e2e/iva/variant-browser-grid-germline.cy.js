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
            const columns = ["Type","Consequence Type","Gene"];
            cy.get("variant-browser-grid thead th")
                .as("headerColumns");
            columns.forEach(col => {
                cy.get("@headerColumns")
                    .contains("div",col)
                    .should("be.visible");
            });
            cy.get("button[data-action='settings']")
                .click();
            UtilsTest.getByDataTest("test-columns", "select-field-filter button")
                .click();
            columns.forEach(col => {
                UtilsTest.getByDataTest("test-columns", "select-field-filter a")
                    .contains(col)
                    .click();
            });
            UtilsTest.getByDataTest("test-columns", "select-field-filter button")
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
                .then($header => {
                    const _columns = Array.from($header, th => th.textContent.trim());
                    columns.forEach(col => {
                        expect(col).not.to.be.oneOf(_columns);
                    });
                });
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
                        });
                    cy.get(".qtip-content")
                        .should("be.visible");
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
                        .should("be.visible");
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
            });
            cy.get(".qtip-content")
                .should("be.visible");
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
                .should("be.visible");
        });

        it("should display conservation help", () => {
            cy.get("thead th")
                .contains("div","Conservation")
                .within(() => {
                    cy.get("a")
                        .trigger("mouseover");
                });
            cy.get(".qtip-content")
                .should("be.visible");
        });

        it("should display population frequencies help", () => {
            cy.get("thead th")
                .contains("div","Population Frequencies")
                    .within(() => {
                        cy.get("a")
                            .trigger("mouseover");
            });
            cy.get(".qtip-content")
                .should("be.visible");
        });

        it("should display clinical info help", () => {
            cy.get("thead th")
                .contains("div","Clinical Info")
                    .within(() => {
                        cy.get("a")
                            .trigger("mouseover");
            });
            cy.get(".qtip-content")
                .should("be.visible");
        });
    });

    context("Row", () => {
        it.skip("should copy variant json", () => {
            cy.get("tbody tr:first > td")
                .eq(18)
                .within(() => {
                    cy.get("button")
                        .click();
                    cy.get("ul[class*='dropdown-menu']")
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
                    cy.get("ul[class*='dropdown-menu']")
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
                    cy.get("ul[class*='dropdown-menu']")
                        .contains("a","Ensembl Genome Browser")
                        .click();
            });
        });
    });

    context("Varsome Links", () => {
        it("should display a link to varsome in the variant tooltip", () => {
            cy.get("tbody tr:first td")
                .eq(1)
                .find("a[tooltip-title]")
                .trigger("mouseover");
            cy.get("div.qtip-content")
                .find(`div[data-cy="varsome-variant-link"]`)
                .within(() => {
                    cy.get("a")
                        .should("exist")
                        .and("contain.text", "Varsome");
                    cy.get("a")
                        .invoke("attr", "href")
                        .should("have.string", "https://varsome.com/variant/");
                });
        });

        it("should display a link to varsome in the gene tooltip", () => {
            cy.get("tbody tr:first td")
                .eq(2)
                .find("a[tooltip-title]")
                .eq(0)
                .trigger("mouseover");
            cy.get("div.qtip-content")
                .find(`div[data-cy="varsome-gene-link"]`)
                .within(() => {
                    cy.get("a")
                        .should("exist")
                        .and("contain.text", "Varsome");
                    cy.get("a")
                        .invoke("attr", "href")
                        .should("have.string", "https://varsome.com/gene/");
                });
        });

        it("should display a link to varsome in the Actions dropdown", () => {
            cy.get("tbody tr:first td")
                .last()
                .find(`div.dropdown ul.dropdown-menu li[data-cy="varsome-variant-link"]`)
                .within(() => {
                    cy.get("a")
                        .should("exist")
                        .and("contain.text", "Varsome");
                    cy.get("a")
                        .invoke("attr", "href")
                        .should("have.string", "https://varsome.com/variant/");
                });
        });

        it("should display an action to copy variant ID in Varsome format", () => {
            cy.get("tbody tr:first td")
                .last()
                .find(`div.dropdown ul.dropdown-menu li[data-cy="varsome-copy"]`)
                .within(() => {
                    cy.get("a")
                        .should("exist")
                        .and("contain.text", "Copy Varsome ID");
                    // eslint-disable-next-line cypress/no-force
                    cy.get("a")
                        .click({force: true});
                    UtilsTest.assertValueCopiedToClipboard()
                        .then(content => {
                            expect(content).to.match(/^chr/);
                        });
                });
        });
    });
});
