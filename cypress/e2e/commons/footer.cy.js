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

import {TIMEOUT} from "../../support/constants.js";
import UtilsTest from "../../support/utils-test.js";

/**
 * Header bar (pre-login)
 */
context("2. Footer", () => {
    beforeEach(() => {
        cy.visit("#home");
    });

    it("Check footer IVA", () => {
        cy.get("custom-footer", {timeout: TIMEOUT}).should("be.visible");
        cy.get("custom-footer img[alt=logo]", {timeout: TIMEOUT}).should("be.visible");
        cy.get("custom-footer .footer-item:nth-child(2)").contains("IVA");
    });

    it("Check footer OpenCGA", () => {
        cy.get("custom-footer .footer-item:nth-child(3)").contains("OpenCGA");
        cy.get("custom-footer .footer-item:nth-child(3) sup")
            .should("be.visible")
            .should("not.contain", "NOT AVAILABLE");
    });
});
