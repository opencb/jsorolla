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

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })


// get by selector
Cypress.Commands.add("getBySel", (selector, ...args) => {
    return cy.get(`[data-cy=${selector}]`, ...args);
});

// get by selector like..
Cypress.Commands.add("getBySelLike", (selector, ...args) => {
    return cy.get(`[data-cy*=${selector}]`, ...args);
});

// Login without enter UI
Cypress.Commands.add("loginByApi", (
    user = Cypress.env("username"),
    password = Cypress.env("password")
) => {
    cy.request("POST", `${Cypress.env("apiUrl")}/users/login`, {
        user,
        password,
    }).then(res => {
        // cy.setCookie("sessionId", response.body.sessionId);
        console.log("res", res);
        cy.setCookie("iva-test_sid", res.body.responses[0].results[0].token);
        cy.setCookie("iva-test_userId", user);
        cy.visit("");
    });
});

// Login with session and not UI
Cypress.Commands.add("loginByApiSession", (
    user = Cypress.env("username"),
    password = Cypress.env("password")
) => {
    cy.session(["loginByApiSession", user], () => {
        cy.request("POST", `${Cypress.env("apiUrl")}/users/login`, {
            user,
            password,
        }).then(res => {
            console.log("res", res);
            cy.setCookie("iva-test_sid", res.body.responses[0].results[0].token);
            cy.setCookie("iva-test_userId", user);
        });
    });
});
