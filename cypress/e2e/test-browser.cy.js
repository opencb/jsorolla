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

import {login, goTo} from "../plugins/utils.js";

context("Case Interpreter", () => {
    before(() => {
        cy.loginByApi();
        cy.visit("index.html#interpreter/family/platinum/MARIA");
    });

    // it("Does not do much!", () => {
    //     expect(true).to.equal(true);
    // });

    it("select the first case", () => {
        cy.get("table").within(() => {
            cy.get("tr[data-uniqueid=MARIA]").as("mariaCase");
            cy.get("@mariaCase").find("a").contains("MARIA").click();
        });
        cy.get("a[data-view=variant-browser]").wait(1000).click();
        // cy.get("a[data-view=variant-browser]").contains("Sample Variant Browser").click();
        // cy.get(".variant-interpreter-wizard a.variant-interpreter-step").contains("Sample Variant Browser").click();
    });

    it("select variant browser", () => {
        // cy.getBySel("diseasePanels");
    });
});


