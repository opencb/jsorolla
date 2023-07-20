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

context("Sample Browser Grid", () => {
    const gridComponent = "sample-grid";

    beforeEach(() => {
        cy.visit("#sample-browser-grid");
        cy.waitUntil(() => {
            return cy.get(gridComponent)
                .should("be.visible");
        });
    });


    context("render", () => {
        it("should render sample-browser-grid", () => {
            cy.get(gridComponent)
                .should("be.visible");
        })
        // Fixme: this test is not working
        // it("should change page sample-browser-grid", () => {
        //     UtilsTest.changePage(gridComponent,2);
        // })
    })

    context("extension", () => {
        it("Check 'Extra Column' column", () => {
            cy.get("thead th")
                .contains("Extra column")
                .should('be.visible')
        })
    })

});
