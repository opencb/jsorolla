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

context("Variant Grid Component", () => {
    beforeEach(() => {
        cy.visit("index.html#variant-browser");
    });

    it("Columns Visibility", () => {
        UtilsTest.checkResults("variant-browser-grid");
        UtilsTest.checkColumnsGridBrowser("variant-browser-grid");

        // Check is more than 1
        cy.get("variant-browser-grid .columns-toggle-wrapper ul li").should("have.length.gt", 1);

        // deactivate all the columns
        UtilsTest.clickAllColumnsGridBrowser("variant-browser-grid");

        // testing the first level of the header
        UtilsTest.checkHeaderGridBrowser("variant-browser-grid").should("have.lengthOf", 6);

        // reactivate all the columns
        UtilsTest.clickAllColumnsGridBrowser("variant-browser-grid");
        UtilsTest.checkHeaderGridBrowser("variant-browser-grid").should("have.lengthOf", 10);

    });


    it.only("Pagination", () => {
        UtilsTest.checkResults("variant-browser-grid");
        UtilsTest.changePage("variant-browser-grid", 2);
        UtilsTest.checkResults("variant-browser-grid");
        UtilsTest.changePage("variant-browser-grid", 1);
        UtilsTest.checkResults("variant-browser-grid");
    });

});
