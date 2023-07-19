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


context("Variant Browser Grid Cancer", () => {
    const browserGrid = "variant-browser-grid";
    const browserDetail = "variant-browser-detail";

    beforeEach(() => {
        cy.visit("#variant-browser-grid-cancer")
        cy.waitUntil(() => cy.get(browserGrid).should("be.visible"))
    });

    context("Grid", () => {

        it("Should be render variant-browser-grid", () => {
            cy.get(browserGrid).should("be.visible")
        })

        it("Change page variant-browser-grid", () => {
            UtilsTest.changePage(browserGrid,2)
            UtilsTest.changePage(browserGrid,3)
        })
    })

    context("Tooltip", () => {

        it("Check variant tooltip", () => {
            // Select first row, first column: Variant
            // variant == id
            BrowserTest.getColumnIndexByHeader("id")
            cy.get("@indexColumn").then(index => {
                cy.get("tbody tr:first > td").eq(index).within(() => {
                    cy.get("a").eq(0).trigger("mouseover")
                })
                cy.get(".qtip-content").should('be.visible')
            })
        })

        it("Check gene", () => {
            BrowserTest.getColumnIndexByHeader("gene")
            cy.get("@indexColumn").then(index => {
                cy.get("tbody tr:first > td").eq(index).within(() => {
                    cy.get("a").eq(0).trigger("mouseover")
                })
                cy.get(".qtip-content").should('be.visible')
            })
        })

        it("Check consequenceType", () => {
            BrowserTest.getColumnIndexByHeader("consequenceType")
            cy.get("@indexColumn").then(index => {
                cy.get("tbody tr:first > td").eq(index).within(() => {
                    cy.get("a").eq(0).trigger("mouseover")
                })
                cy.get(".qtip-content").should('be.visible')
            })
        })

        it("Check population frequencies", () => {
            cy.get("tbody tr:first > td").eq(13).within(() => {
                cy.get("a").eq(0).trigger("mouseover")
            })
            cy.get(".qtip-content").should('be.visible')
        })
    })

    context("Helpers", () => {
        // Columns helpers
        it("Check Deleteriousness column", () => {
            cy.get("thead th").contains("div","Deleteriousness").within(() => {
                cy.get("a").trigger("mouseover")
            })
            cy.get(".qtip-content").should('be.visible')
        })

        it("Check Conservation column", () => {
            cy.get("thead th").contains("div","Conservation").within(() => {
                cy.get("a").trigger("mouseover")
            })
            cy.get(".qtip-content").should('be.visible')
        })

        it("Check Population Frequencies column", () => {
            cy.get("thead th").contains("div","Population Frequencies").within(() => {
                cy.get("a").trigger("mouseover")
            })
            cy.get(".qtip-content").should('be.visible')
        })

        it("Check Clinical Info column", () => {
            cy.get("thead th").contains("div","Clinical Info").within(() => {
                cy.get("a").trigger("mouseover")
            })
            cy.get(".qtip-content").should('be.visible')
        })

    })

    context("Row",() => {
        it("Copy Variant Json", () => {
            cy.get("tbody tr:first > td").eq(18).within(() => {
                cy.get("button").click()
                cy.get("ul[class='dropdown-menu dropdown-menu-right']")
                    .contains("a","Copy JSON")
                    .click()
                UtilsTest.assertValueCopiedToClipboard().then(content => {
                    const dataClipboard = JSON.parse(content);
                    expect(dataClipboard.id).eq("1:234971680:TGTGTCTGTGTGTGCTTGTGTGTGTGTGTGTATTGGGGGAGGGATAGGTGCATAGCAGCATCATAAGCAGATAACATAAGAGCACAGCACACAGTAGATATTTATTAGGTTGTGCAAAAGTAATTGCGGTTTTTGCCACTAAAGGTAATGGTGAGAACCGCGATTACTTTCACACCAGTGTAATAAGGATTGGGCGGATGAACAAATGAGCAAGTGAATGAATTACAGGAATGAATTGGTTTAGAAAACAAAGCAAAAAGGAGCTGAAACTTTCTCAGGGGTGGATGGGGGTAGAGCTGCTGGATCAGTTTGGAAGAGAACAGACTTCTAAAGTGTAAACTTTAGAGCACTTTGTAAACCAAAGCTTCTAAATGCTGTAAATGCTGCAGACACCAGGTTCATGTGAAAAGCGTATCTGCCATGGAAAAAAATACACGCACGAGAAAATGGAGCAAGGTCACATGAATCTACTCAGAAATGAGACCTGGAACCTGAAAAAGAAAG:-")
                    expect(dataClipboard.chromosome).eq("1")
                })
            })
        })

        it.skip("Download Variant Json", () => {
            cy.get("tbody tr:first > td").eq(18).within(() => {
                cy.get("button").click()
                cy.get("ul[class='dropdown-menu dropdown-menu-right']")
                    .contains("a","Download JSON")
                    .click()
                // cy.readFile("cypress/downloads/1_234971680_TGTGTCTGTGTGTGCTTGTGTGTGTGTGTGTATTGGGGGAGGGATAGGTGCATAGCAGCATCATAAGCAGATAACATAAGAGCACAGCACACAGTAGATATTTATTAGGTTGTGCAAAAGTAATTGCGGTTTTTGCCACTAAAGGTAATGGTGAGAACCGCGATTACTTTCACACCAGTGTAATAAGGATTGGGCGGATGAACAAATGAGCAAGTGAATGAATTACAGGAATGAATTG.json")
                //     .should("exist")
            })
        })

        it.skip("External Links", () => {
            cy.get("tbody tr:first > td").eq(18).within(() => {
                cy.get("button").click()
                cy.get("ul[class='dropdown-menu dropdown-menu-right']")
                    .contains("a","Ensembl Genome Browser").click()
            })
        })
    })

    context("extension", () => {
        it("Check 'Extra Column' column", () => {
            cy.get("thead th").contains("div","Extra column").should('be.visible')
        })
    })

});
