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
        cy.visit("#variant-interpreter-grid-cancer")
        cy.waitUntil(() => {
            return cy.get(browserInterpreterGrid)
                .should("be.visible")
        })
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
                        .should('be.visible');
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
                        })
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

        it("should display cohort stats (population frequencies) tooltip", () => {
            cy.get("tbody tr:first > td")
                .eq(8)
                .within(() => {
                    cy.get("a").trigger("mouseover")
                });
            cy.get(".qtip-content")
                .should('be.visible')
        });

        it("should reference population frequencies tooltip", () => {
            cy.get("tbody tr:first > td")
                .eq(9)
                .within(() => {
                    cy.get("a")
                        .trigger("mouseover");
                });
            cy.get(".qtip-content")
                .should('be.visible');
        })

        // it("8.Tooltip: Check ACMG Prediction (Classification)", () => {
        //     cy.get("tbody tr:first > td").eq(14).within(() => {
        //         cy.get("a").trigger("mouseover")
        //     })
        //     cy.get(".qtip-content").should('be.visible')
        // })
    })

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
                .should('be.visible');
        })

        it("should display Reference Population Frequencies column help", () => {
            cy.get("thead th")
                .contains("div","Reference Population Frequencies")
                .within(() => {
                    cy.get("a")
                        .trigger("mouseover");
            });
            cy.get(".qtip-content")
                .should('be.visible');
        })

        it("should display clinical info column help", () => {
            cy.get("thead th")
                .contains("div","Clinical Info")
                .within(() => {
                    cy.get("a")
                        .trigger("mouseover");
                });
            cy.get(".qtip-content")
                .should('be.visible');
        });

        it("should display interpretation column help", () => {
            cy.get("thead th")
                .contains("div","Interpretation")
                .within(() => {
                    cy.get("a")
                        .trigger("mouseover");
                });
            cy.get(".qtip-content")
                .should('be.visible');
        });
    });

    context("Row", () => {
        it.skip("should copy variant interpreter Json", () => {
            cy.get("tbody tr:first > td")
                .eq(-1)
                .within(() =>{
                    cy.get("button")
                        .click();
                    cy.get("ul[class='dropdown-menu dropdown-menu-right']")
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
                    cy.get("ul[class='dropdown-menu dropdown-menu-right']")
                        .contains("a","Download JSON")
                        .click();
                    cy.readFile("cypress/downloads/1_611230_A_G.json")
                        .should("exist");
                });
        });

        it("should click External Links", () => {
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
