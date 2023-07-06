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


context("File Browser Grid", () => {
    const browserGrid = "file-grid";

    beforeEach(() => {
        cy.visit("#file-browser-grid")
        cy.waitUntil(() => cy.get(browserGrid).should("be.visible"))
    });


    it("[Grid] Should be render file-browser-grid", () => {
        cy.get(browserGrid).should("be.visible")
    })

    it("[Grid] Change page fileb-browser-grid", () => {
        UtilsTest.changePage(browserGrid,2)
        UtilsTest.changePage(browserGrid,3)
    })

    // Rows
    // flaky issue require permission from browser to clipboard
    it.skip("[Row] Copy Variant Json", () => {
        cy.window().focus();
        cy.get("tbody tr:first > td").eq(7).within(() => {
            cy.get("button").click()
            cy.get("ul[class='dropdown-menu dropdown-menu-right']")
                .contains("a","Copy JSON")
                .focus().click()
            UtilsTest.assertValueCopiedToClipboard().then(content => {
                const dataClipboard = JSON.parse(content);
                expect(dataClipboard.name).eq("variant-aggregate-family.20220831105044.Av0GoT.log")
            })
        })
    })

    it("[Row] Download Variant Json", () => {
        cy.get("tbody tr:first > td").eq(7).within(() => {
            cy.get("button").click()
            cy.get("ul[class='dropdown-menu dropdown-menu-right']")
                .contains("a","Download JSON")
                .click()
        })
    })

});
