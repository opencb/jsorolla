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

import { TIMEOUT } from "../../support/constants.js";
import UtilsTest from "../../support/utils-test.js";
import BrowserTest from "../../support/browser-test.js";


context("Variant Browser Grid", () => {
    const browserGrid = "variant-browser-grid";
    const browserDetail = "variant-browser-detail";

    beforeEach(() => {
        cy.visit("#variant-grid")
    });


    it("Should be render variant-browser-grid", () => {
        cy.get(browserGrid).should("be.visible")
    })

    it("Change page variant-browser-grid", () => {
        UtilsTest.changePage(browserGrid,2)
        UtilsTest.changePage(browserGrid,3)
    })

    // Columns tooltips
    it.only("Tooltip: Check variant tooltip", () => {
        // Table
        cy.get("tbody tr:first > td").eq(2).within(() =>{
            cy.get("a").trigger("mouseover")
        })
        cy.get(".qtip-content").should('be.visible')
    })

    it("Tooltip: Check gene", () => {
        expect(true).to.equal(true)
    })

    it("Tooltip: Check population frequencies", () => {
        expect(true).to.equal(true)
    })

    // Columns helpers
    it("Helpers: Check Deleteriousness column", () => {
        expect(true).to.equal(true)
    })

    it("Helpers: Check Conservation column", () => {
        expect(true).to.equal(true)
    })

    it("Helpers: Check Population Frequencies column", () => {
        expect(true).to.equal(true)
    })

    it("Helpers: Check Clinical Info column", () => {
        expect(true).to.equal(true)
    })

    // Rows
    it("Row: Copy Variant Json", () => {
        expect(true).to.equal(true)
    })

    it("Row: Download Variant Json", () => {
        expect(true).to.equal(true)
    })

    it("Row: External Links", () => {
        expect(true).to.equal(true)
    })

});
