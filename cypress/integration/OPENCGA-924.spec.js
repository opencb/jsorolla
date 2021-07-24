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

import {login, goTo, checkResults, getResult} from "../plugins/utils.js";
import {TIMEOUT} from "../plugins/constants.js";


context("7 - Sample Browser", () => {
    before(() => {
        login();
        goTo("iva");
    });

    it("7.1 - query", () => {
        cy.get("a[data-id=sample]", {timeout: TIMEOUT}).click({force: true});
        cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", "Sample Browser");

        // checkResults("opencga-sample-grid");

        cy.get("sample-id-autocomplete input").invoke("val", "LP3000045-DNA_B04");
        cy.get("sample-id-autocomplete input").type("{enter}");

        cy.get("div.search-button-wrapper button").click();

        //cy.get("opencga-active-filters button[data-filter-name='id']").click();


    });
});
