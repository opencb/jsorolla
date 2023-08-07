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


context("Variant Interpreter Grid Cancer CNV", () => {
    const browserInterpreterGrid = "variant-interpreter-grid";

    beforeEach(() => {
        cy.visit("#variant-interpreter-grid-cancer-cnv");
        cy.waitUntil(() => {
            return cy.get(browserInterpreterGrid)
                .should("be.visible");
        });
    });

    context("Grid", () => {
        it("should render variant-interpreter-grid", () => {
            cy.get(browserInterpreterGrid)
                .should("be.visible");
        })

        it("should change page variant-interpreter-grid", () => {
            UtilsTest.changePage(browserInterpreterGrid,2);
            UtilsTest.changePage(browserInterpreterGrid,1);
        })
    })

    context("Tooltip", () => {

        it("should display variant tooltip", () => {
            BrowserTest.getColumnIndexByHeader("Variant")
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

        it("should display gene", () => {
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
            // NOTE: the Sample Genotype column is the 8th column in the table
            // We can not use 'BrowserTest.getColumnIndexByHeader("Sample Genotype");' because there are nested columns before this column,
            // so this function will return 7 instead of 8
            cy.get("tbody tr:first > td")
                .eq(8)
                .find("a")
                .trigger("mouseover");
            cy.get(".qtip-content")
                .should("be.visible");
        });

        it("should display cohort stats (population frequencies) tooltip", () => {
            // NOTE: the Cohort stats column is the 9th column in the table
            // We can not use 'BrowserTest.getColumnIndexByHeader("Cohort Stats");' because there are nested columns before this column,
            // so this function will return 8 instead of 9
            cy.get(`tbody tr:first > td`)
                .eq(9)
                .find("a")
                .trigger("mouseover");
            cy.get(".qtip-content")
                .should("be.visible");
        });

        it.skip("should reference population frequencies tooltip", () => {
            cy.get("tbody tr:first > td")
                .eq(10)
                .find("a")
                .trigger("mouseover");
            cy.get(".qtip-content")
                .should("be.visible");
        });

        // it("Check ACMG Prediction (Classification)", () => {
        //     cy.get("tbody tr:first > td").eq(14).within(() => {
        //         cy.get("a").trigger("mouseover")
        //     })
        //     cy.get(".qtip-content").should('be.visible')
        // })
    });

    context("Helpers", () =>{
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

        it("should display reference population frequencies column help", () => {
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
                })
            cy.get(".qtip-content")
                .should('be.visible');
        })

        it("should display Interpretation column", () => {
            cy.get("thead th")
                .contains("div","Interpretation")
                .within(() => {
                    cy.get("a")
                        .trigger("mouseover");
                });
            cy.get(".qtip-content")
                .should('be.visible');
        })
    })

    context("Row", () => {
        it.skip("should copy variant interpreter json", () => {
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
                        expect(dataClipboard.id).eq("13:25715210-25792213:-:<CNV>");
                        expect(dataClipboard.type).eq("COPY_NUMBER");
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
                // cy.readFile("cypress/downloads/13_25715210-25792213_-__CNV_.json")
                //     .should("exist")
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
