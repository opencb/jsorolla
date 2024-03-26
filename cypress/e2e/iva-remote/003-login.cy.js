/*
 * Copyright 2015-2024 OpenCB
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

// fixed
context("3. Login", () => {
    beforeEach(() => {
        cy.visit("http://localhost:3000/src/sites/iva/#login");
    });

    it("3.1 - login unsuccessful: not existing user", () => {
        cy.get("user-login .panel-body #user").type(Cypress.env("user"));
        cy.get("user-login .panel-body #password").type("123456789");
        cy.get("button.btn-primary").contains("Sign In").click();
        cy.get(".alert.alert-danger").should("be.visible");
        cy.get(".alert.alert-danger").contains("Incorrect user or password");
    });

    it("3.2 - login unsuccessful: wrong password", () => {
        cy.get("user-login .panel-body #user").type("testest23ml");
        cy.get("user-login .panel-body #password").type("123456");
        cy.get("button.btn-primary").contains("Sign In").click();
        cy.get(".alert.alert-danger").should("be.visible");
        cy.get(".alert.alert-danger").contains("CatalogAuthenticationException");
    });

    it("3.3 - login successful", () => {

        const username = Cypress.env("user");
        const password = Cypress.env("pass");

        expect(username, "username was set").to.be.a("string").and.not.be.empty;
        expect(password, "password was set").to.be.a("string").and.not.be.empty;
        cy.get("user-login .panel-body #user").type(username);
        cy.get("user-login .panel-body #password").type(password);
        cy.get("button.btn-primary").contains("Sign In").click();

        cy.get(".login-overlay", { timeout: TIMEOUT }).should("be.visible");
        cy.get(".login-overlay", { timeout: TIMEOUT }).should("not.exist");

        cy.url().should("include", "#home", { timeout: TIMEOUT });

        // switch to defined Study
        if (Cypress.env("study")) {
            cy.get(`a[data-cy-fqn="${Cypress.env("study")}"]`, { timeout: 60000 }).click({ force: true });
        }

        UtilsTest.goTo("iva");
        cy.get("h1", { timeout: TIMEOUT }).contains("Variant Analysis");
    });

});
