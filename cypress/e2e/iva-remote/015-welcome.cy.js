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
import {TIMEOUT} from "../../support/constants.js";

const homePanel = [
    {id: "browser", title: "Variant Browser"},
    {id: "clinicalAnalysisPortal", title: "Case Portal"},
    {id: "cat-catalog", title: "Catalog"}
];

// resolve Home Category Cards (not used anymore)
const resolveButtons = page => {
    cy.get(".cy-login-overlay", {timeout: TIMEOUT}).should("not.exist");
    cy.get(`a[data-cat-id=${page.id}]`).should("be.visible").click();
    cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", page.title);
    // cy.get("a#home-nav").click();
    cy.get(".navbar-header > a[href='#home']").click();
};

context("15. Welcome page", () => {
    before(() => {
        UtilsTest.login();
        UtilsTest.goTo("iva");
    });

    it("15.1 - check home page content", () => {
        // cy.get("#home-nav > img", {timeout: TIMEOUT}).should("be.visible");
        cy.get(".navbar-brand > img", {timeout: TIMEOUT}).should("be.visible");
        // cy.get("a#home-nav").click();
        cy.get(".navbar-brand").click();
        cy.get(".cy-login-overlay", {timeout: TIMEOUT}).should("not.exist");
        cy.get("#welcome-page-title", {timeout: TIMEOUT}).contains("Interactive Variant Analysis");
        cy.get(".iva-logo").find("img").should("be.visible");
        cy.get("#welcome-page-title ").contains("Interactive Variant Analysis");
    });

    it("15.2 - check buttons resolves correctly", () => {
        homePanel.forEach((el, i) => {
            cy.get("div[data-cy-welcome-card-id=" + el.id + "]", {timeout: TIMEOUT}).should("be.visible");
            cy.get("div[data-cy-welcome-card-id=" + el.id + "] a", {timeout: TIMEOUT}).first().click();
            cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", el.title);
            cy.wait(1000);
            cy.get(".navbar-header > a[href='#home']").click();
        });
    });

});
