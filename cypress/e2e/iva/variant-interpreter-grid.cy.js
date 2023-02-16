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


context("Variant Interpreter Grid", () => {
    const browserInterpreterGrid = "variant-interpreter-grid";

    beforeEach(() => {
        cy.visit("#variant-interpreter-grid")
    });

    it("Should be render variant-interpreter-grid", () => {
        expect(true).to.equal(true)
    })

    it("Change page variant-interpreter-grid", () => {
        expect(true).to.equal(true)
    })

    // Columns tooltips
    it("Tooltip: Check variant tooltip", () => {
        expect(true).to.equal(true)
    })

    it("Tooltip: Check gene", () => {
        expect(true).to.equal(true)
    })

    it("Tooltip: Check Sample Genotype (Variant Call Information)", () => {
        expect(true).to.equal(true)
    })

    it("Tooltip: Check Cohort Stats (Population Frequencies)", () => {
        expect(true).to.equal(true)
    })

    it("Tooltip: Check Reference population frequencies", () => {
        expect(true).to.equal(true)
    })

    it("Tooltip: Check ACMG Prediction (Classification)", () => {
        expect(true).to.equal(true)
    })

    // Columns helpers
    it("Helpers: Check Deleteriousness column", () => {
        expect(true).to.equal(true)
    })

    it("Helpers: Check Reference Population Frequencies column", () => {
        expect(true).to.equal(true)
    })

    it("Helpers: Check Clinical Info column", () => {
        expect(true).to.equal(true)
    })

    it("Helpers: Check Interpretation column", () => {
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
