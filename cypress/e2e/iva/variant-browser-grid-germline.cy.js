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
        cy.visit("#variant-browser-grid-germline")
        cy.waitUntil(() => cy.get(browserGrid).should("be.visible"))
    });


    it("1.Should be render variant-browser-grid", () => {
        cy.get(browserGrid).should("be.visible")
    })

    it("2.Change page variant-browser-grid", () => {
        UtilsTest.changePage(browserGrid,2)
        UtilsTest.changePage(browserGrid,3)
    })

    // Columns tooltips
    it("3.Tooltip: Check variant tooltip", () => {
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

    it("4.Tooltip: Check gene", () => {
        BrowserTest.getColumnIndexByHeader("gene")
        cy.get("@indexColumn").then(index => {
            cy.get("tbody tr:first > td").eq(index).within(() => {
                cy.get("a").eq(0).trigger("mouseover")
            })
            cy.get(".qtip-content").should('be.visible')
        })
    })

    it("5.Tooltip: Check consequenceType", () => {
        BrowserTest.getColumnIndexByHeader("consequenceType")
        cy.get("@indexColumn").then(index => {
            cy.get("tbody tr:first > td").eq(index).within(() => {
                cy.get("span").eq(0).trigger("mouseover")
            })
            // cy.get(".qtip-content").should('be.visible')
        })
    })

    it("6.Tooltip: Check population frequencies", () => {
        cy.get("tbody tr:first > td").eq(13).within(() => {
            cy.get("a").trigger("mouseover")
        })
        cy.get(".qtip-content").should('be.visible')
    })

    // Columns helpers
    it("7.Helpers: Check Deleteriousness column", () => {
        cy.get("thead th").contains("div","Deleteriousness").within(() => {
            cy.get("a").trigger("mouseover")
        })
        cy.get(".qtip-content").should('be.visible')
    })

    it("8.Helpers: Check Conservation column", () => {
        cy.get("thead th").contains("div","Conservation").within(() => {
            cy.get("a").trigger("mouseover")
        })
        cy.get(".qtip-content").should('be.visible')
    })

    it("9.Helpers: Check Population Frequencies column", () => {
        cy.get("thead th").contains("div","Population Frequencies").within(() => {
            cy.get("a").trigger("mouseover")
        })
        cy.get(".qtip-content").should('be.visible')
    })

    it("10.Helpers: Check Clinical Info column", () => {
        cy.get("thead th").contains("div","Clinical Info").within(() => {
            cy.get("a").trigger("mouseover")
        })
        cy.get(".qtip-content").should('be.visible')
    })

    // Rows
    it("11.Row: Copy Variant Json", () => {
        cy.get("tbody tr:first > td").eq(18).within(() => {
            cy.get("button").click()
            cy.get("ul[class='dropdown-menu dropdown-menu-right']")
                .contains("a","Copy JSON")
                .click()
            UtilsTest.assertValueCopiedToClipboard().then(content => {
                const dataClipboard = JSON.parse(content);
                expect(dataClipboard.id).eq("6:168293914:C:T")
                expect(dataClipboard.chromosome).eq("6")
            })
        })
    })

    it("12.Row: Download Variant Json", () => {
        cy.get("tbody tr:first > td").eq(18).within(() => {
            cy.get("button").click()
            cy.get("ul[class='dropdown-menu dropdown-menu-right']")
                .contains("a","Download JSON")
                .click()
            cy.readFile("cypress/downloads/6_168293914_C_T.json")
                .should("exist")
        })
    })

    it.skip("13.Row: External Links", () => {
        cy.get("tbody tr:first > td").eq(18).within(() => {
            cy.get("button").click()
            cy.get("ul[class='dropdown-menu dropdown-menu-right']")
                .contains("a","Ensembl Genome Browser").click()
        })
    })

});
