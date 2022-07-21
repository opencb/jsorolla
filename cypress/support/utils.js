/**
 * Copyright 2015-2022 OpenCB
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

export default class UtilsTest {

    // it's not working
    setCheckBox = (selectors, val) => {
        cy.get(selectors).invoke("prop", "checked", val);
    };

    checkLabel = (selectors, tag, val) => {
        cy.get(selectors).contains(tag, val);
    };

    setInput = (selectors, val) => {
        cy.get(selectors).type(val);
    };

    checkToolHeaderTitle = val => {
        cy.get("div.page-title h2", {timeout: TIMEOUT, log: false})
            .should("be.visible")
            .and("contain", val);
    };

    checkColumnsGridBrowser = grid => {
        cy.get(`${grid} .columns-toggle-wrapper button`).should("be.visible").and("contain", "Columns").click();
    };

    clickAllColumnsGridBrowser = grid => {
        cy.get(`${grid} .columns-toggle-wrapper ul li a`).click({multiple: true, timeout: TIMEOUT});
    };

    checkHeaderGridBrowser = grid =>
        cy.get(`${grid} .bootstrap-table .fixed-table-container thead > tr:first-child > th`, {timeout: TIMEOUT});


    // Select2 Widgets
    // https://www.cypress.io/blog/2020/03/20/working-with-select-elements-and-select2-widgets-in-cypress/#fetched-data
    // <ul class="select2-selection__rendered" id="select2-DTCAOwDS-container"></ul>
    setSelectTokenFilter = (selectors, val) => {
        cy.get("feature-filter select-token-filter ul").click({force: true});
        cy.get("div[data-cy='feature'] .select2-search__field").type(val, {delay: 200});
    };

    setSelectFieldFilter = (selectors, val) => {
        cy.get("feature-filter select-token-filter ul").click({force: true});
        cy.get("div[data-cy='feature'] .select2-search__field").type(val, {delay: 200});
    };

    waitTable = gridSelector => {
        cy.wait(1000); // it is necessary to avoid the following negative assertion is early satisfied
        cy.get(gridSelector + " div.fixed-table-loading", {timeout: 60000}).should("be.not.visible");
    };

    randomString = length => {
        let result = "";
        const _length = length || 6;
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        for (let i = 0; i < _length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    };

    waitTableResults = gridSelector => {
        cy.get(gridSelector + " div.fixed-table-loading", {timeout: TIMEOUT}).should("be.visible");
        cy.get(gridSelector + " div.fixed-table-loading", {timeout: TIMEOUT}).should("be.not.visible");
    };

    /**
     * it check the table actually contains a single result
     * @param {String} [gridSelector] - name gridSelector
     * @param {Number} [numResults] - nums results
     * @returns {void}
     */
    checkExactResult = (gridSelector, numResults = 1) => {
        cy.get(gridSelector + " table", {timeout: TIMEOUT}).find("tr[data-index]", {timeout: TIMEOUT}).should("have.lengthOf", numResults); // .should("be.gte", 1);
    };


    /**
     * it check the table contains results or the message "No matching records found"
     * @param {String} [gridSelector] - name gridSelector
     * @param {Number} [id] - id
     * @returns {void}
     */
    checkResultsOrNot = (gridSelector, id) => {
        this.waitTable(gridSelector);
        cy.get(gridSelector + " .fixed-table-body > table > tbody", {timeout: TIMEOUT}).find(" > tr", {timeout: 10000})
            .should("satisfy", $els => {

                // TODO Debug this. the first print is defined the second is not
                /* console.error("$els", $els)
                cy.wait(1000)
                console.error("$els", $els)*/

                const $firstRow = Cypress.$($els[0]);
                if ($firstRow) {
                    // it covers either the case of some results or 0 results
                    return $firstRow.data("index") === 0 || $els.text().includes("No matching records found");
                }

            });
    };

    /**
     * change page in a BT table
     * @param {String} [gridSelector] - Name of the grid
     * @param {Number} [page] - Number the page of the grid
     * @returns {String} Page
     */
    changeTablePage = (gridSelector, page) => {
        cy.get(gridSelector + " .fixed-table-container + .fixed-table-pagination ul.pagination li a.page-link").should("be.visible").contains(page).click();
    };

    /**
     * it check the table actually contains results
     * @param {String} [gridSelector] - name gridSelector
     * @returns {void}
     */
    checkTableResults = gridSelector => {
        this.waitTable(gridSelector);
        cy.get(gridSelector + " table", {timeout: TIMEOUT}).find("tr[data-index]", {timeout: TIMEOUT}).should("have.length.gt", 0); // .should("be.gte", 1);
    };

}


