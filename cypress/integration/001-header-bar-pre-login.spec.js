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

import {TIMEOUT} from "../plugins/constants.js";
import {goTo} from "../plugins/utils.js";


/**
 * Header bar (pre-login)
 */
context("1 - Header bar (pre-login): checks on Header Bar elements", () => {
    before(() => {
        cy.visit("http://localhost:3000/src/");

    });

    it("1.1 - check login page content", () => {
        cy.get("#loginButton", {timeout: TIMEOUT}).should("be.visible");
        cy.get("#loginButton").click();
        cy.get("#opencgaUser").should("be.visible");
        cy.get("#opencgaPassword").should("be.visible");
    });

    it("1.2 - check header-bar icons resolve correctly", () => {
        goTo("iva");
        cy.get("#welcome-page-title", {timeout: TIMEOUT}).contains("Interactive Variant Analysis");

    });
});
