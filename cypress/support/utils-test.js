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

import UtilsNew from "../../src/core/utils-new.js";
import JSZip from "jszip";
import {TIMEOUT} from "./constants.js";


export default class UtilsTest {


    static getFileJson = async (path, filename ) => {
        try {
            const zipFiles = await JSZip.loadAsync(UtilsNew.importBinaryFile(path));
            const content = await zipFiles.file(filename).async("string");
            return JSON.parse(content);
        } catch (err) {
            console.error("File not exist", err);
        }
    }

    static getByDataTest = (selector, tag, ...args) => cy.get(`div[data-testid='${selector}'] ${tag ?? ""}`, ...args);

    static setInput = (selectors, val) => {
        cy.get(selectors).type(val);
    };

    static enterField = (name, value) => {
        cy.get("label").contains(name).parents("div[class='row form-group ']").within(()=> {
            cy.get("input[type='text']").type(value);
        });
    }

    static submitForm = () => {
        cy.get("button[class='btn btn-primary ']").contains("OK").click();
    }

    static checkLabel = (selectors, tag, val) => {
        cy.get(selectors).contains(tag, val);
    };

    static checkToolHeaderTitle = val => {
        cy.get("div.page-title h2", {timeout: TIMEOUT, log: false})
            .should("be.visible")
            .and("contain", val);
    };

    static checkColumnsGridBrowser = grid => {
        cy.get(`${grid} .columns-toggle-wrapper button`)
            .should("be.visible")
            .and("contain", "Columns")
            .click();
    };

    static clickAllColumnsGridBrowser = grid => {
        cy.get(`${grid} .columns-toggle-wrapper ul li a`).click({multiple: true, timeout: TIMEOUT});
    };

    static checkHeaderGridBrowser = grid =>
        cy.get(`${grid} .bootstrap-table .fixed-table-container thead > tr:first-child > th`, {timeout: TIMEOUT});


    /**
     * Routes to a specific Tool
     * @param {String} toolId The tool you want to go to
     * @returns {void}
     */
    static goTo = toolId => {
        cy.get("nav.main-navbar").then($div => {
            if (Cypress.$("#waffle-icon", $div).length) {
                cy.get("#waffle-icon").should("be.visible");
                cy.get("#waffle-icon").click();
                cy.get(`#side-nav > nav > ul > li > a[data-id='${toolId}']`).click();
            } else {
                cy.get("#waffle-icon", {timeout: 5000}).should("not.exist");
                cy.get(".navbar-header .app-logo").click();
            }
        });
    };

    // other Approach:
    // is It possible to create a utility file for the table or grid only.
    static actionColumnGridBrowser = (grid, action) => {

        // button columns
        const selector = `${grid} .columns-toggle-wrapper`;
        switch (action) {
            case "clickAll":
                return cy.get(`${selector} ul li a`)
                    .click({multiple: true, timeout: TIMEOUT});
            case "get":
                return cy.get(`${selector} ul li`);
            case "checkVisible":
                return cy.get(`${selector} button`)
                    .should("be.visible")
                    .and("contain", "Columns")
                    .click();
        }
    }

    // Select2 Widgets
    // https://www.cypress.io/blog/2020/03/20/working-with-select-elements-and-select2-widgets-in-cypress/#fetched-data
    // <ul class="select2-selection__rendered" id="select2-DTCAOwDS-container"></ul>
    static setSelectTokenFilter = (selectors, val) => {
        cy.get("feature-filter select-token-filter ul").click({force: true});
        cy.get("div[data-cy='feature'] .select2-search__field").type(val, {delay: 200});
    };

    static setSelectFieldFilter = (selectors, val) => {
        cy.get("feature-filter select-token-filter ul").click({force: true});
        cy.get("div[data-cy='feature'] .select2-search__field").type(val, {delay: 200});
    };

    static waitTable = gridSelector => {
        // cy.wait(1000); // it is necessary to avoid the following negative assertion is early satisfied
        cy.get(gridSelector + " div.fixed-table-loading", {timeout: 60000}).should("be.not.visible");
    };

    static randomString = length => {
        let result = "";
        const _length = length || 6;
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        for (let i = 0; i < _length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    };

    static waitTableResults = gridSelector => {
        cy.get(gridSelector + " div.fixed-table-loading", {timeout: TIMEOUT}).should("be.visible");
        cy.get(gridSelector + " div.fixed-table-loading", {timeout: TIMEOUT}).should("be.not.visible");
    };

    /**
     * it check the table actually contains a single result
     * @param {String} [gridSelector] - name gridSelector
     * @param {Number} [numResults] - nums results
     * @returns {void}
     */
    static checkExactResult = (gridSelector, numResults = 1) => {
        cy.get(gridSelector + " table", {timeout: TIMEOUT}).find("tr[data-index]", {timeout: TIMEOUT}).should("have.lengthOf", numResults); // .should("be.gte", 1);
    };

    /**
 * it check the table actually contains results
 * @param {String} [gridSelector] - name gridSelector
 * @returns {void}
 */
    static checkResults = gridSelector => {
        this.waitTable(gridSelector);
        cy.get(gridSelector + " table", {timeout: TIMEOUT}).find("tr[data-index]", {timeout: TIMEOUT}).should("have.length.gt", 0); // .should("be.gte", 1);
    };

    /**
     * it check the table contains results or the message "No matching records found"
     * @param {String} [gridSelector] - name gridSelector
     * @param {Number} [id] - id
     * @returns {void}
     */
    static checkResultsOrNot = (gridSelector, id) => {
        this.waitTable(gridSelector);
        cy.get(gridSelector + " .fixed-table-body > table > tbody", {timeout: TIMEOUT}).find(" > tr", {timeout: 10000})
            .should("satisfy", $els => {

                const $firstRow = Cypress.$($els[0]);
                if ($firstRow) {
                    // it covers either the case of some results or 0 results
                    return $firstRow.data("index") === 0 || $els.text().includes("No matching records found");
                }

            });
    };


    static getAttached = selector => {
        const getElement = typeof selector === "function" ? selector : $d => $d.find(selector);
        let $el = null;
        return cy.document().should($d => {
            $el = getElement(Cypress.$($d));
            expect(Cypress.dom.isDetached($el)).to.be.false;
        }).then(() => cy.wrap($el));
    }

    /**
     * Given column and row coordinates, it returns the value of a single cell out of a bootstrap table
     * @param {String} gridSelector CSS selector of the table
     * @param {Number} colIndex column index
     * @param {Number} rowIndex row index
     * @param {String} invokeFn text|html
     * @returns {Cypress.Chainable}
     */
    static getResult = (gridSelector, colIndex = 0, rowIndex = 0, invokeFn= "text") => {
        // check results are >= resultIndex
        // cy.get(gridSelector + " table", {timeout: TIMEOUT}).find("tr[data-index]", {timeout: TIMEOUT}).should("have.length.gte", rowIndex);
        // cy.get(gridSelector + " table", {timeout: TIMEOUT}).find(`tr[data-index=${rowIndex}] > :nth-child(${colIndex})`, {timeout: TIMEOUT}).invoke("text").as("text")
        return cy.get(gridSelector + " table", {timeout: TIMEOUT}).find(`tr[data-index=${rowIndex}] > :nth-child(${colIndex + 1})`, {timeout: TIMEOUT}).first().invoke(invokeFn);
    };

    /**
     * it checks whether the grid has results.
     * @param {String} [gridSelector] - name of the gridSelector
     * @returns {boolean} - return a boolean
     */
    static hasResults = gridSelector => {
        return cy.get(gridSelector + " .fixed-table-body > table > tbody > tr")
            .then($rows => {
                if ($rows.length) {
                    return !Cypress.$($rows[0]).hasClass("no-records-found");
                }
            });
    };

    /**
     * change page in a BT table
     * @param {String} [gridSelector] - Name of the grid
     * @param {Number} [page] - Number the page of the grid
     * @returns {String} Page
     */
    static changePage = (gridSelector, page) => {
        cy.get(gridSelector + " .fixed-table-container + .fixed-table-pagination ul.pagination li a.page-link").should("be.visible").contains(page).click();
    };

    /**
     * change page in a BT table
     * @param {String} [gridSelector] - Name of the grid
     * @param {Number} [page] - Number the page of the grid
     * @returns {String} Page
     */
    static changeTablePage = (gridSelector, page) => {
        cy.get(gridSelector + " .fixed-table-container + .fixed-table-pagination ul.pagination li a.page-link").should("be.visible").contains(page).click();
    };

    /**
     * it check the table actually contains results
     * @param {String} [gridSelector] - name gridSelector
     * @returns {void}
     */
    static checkTableResults = gridSelector => {
        this.waitTable(gridSelector);
        cy.get(gridSelector + " table", {timeout: TIMEOUT}).find("tr[data-index]", {timeout: TIMEOUT}).should("have.length.gt", 0); // .should("be.gte", 1);
    };


    static facet = {
        select: label => {
            cy.get("facet-filter .cy-facet-selector li a").contains(label).click({force: true});
        },
        // TODO add action: remove from select
        remove: label => {
            // TODO check whether it is active and then remove from select
            // cy.get("div.facet-wrapper button[data-filter-name='" + field + "']")
            cy.get("facet-filter .cy-facet-selector li a").contains(label).click({force: true});
        },
        selectDefaultFacet: () => {
            cy.get("button.cy-default-facets-button").click();
        },
        removeActive: field => {
            cy.get("div.facet-wrapper button[data-filter-name='" + field + "']").click();
        },
        checkActiveFacet: (field, value) => {
            cy.get("div.facet-wrapper button[data-filter-name='" + field + "']").contains(value);
        },
        checkActiveFacetLength: len => {
            cy.get("div.facet-wrapper button[data-filter-value]", {timeout: TIMEOUT}).should("have.length", len);
        },
        checkResultLength: len => {
            cy.get("opencb-facet-results opencga-facet-result-view", {timeout: 180000}).should("have.length", len);
        }
    };

    /*
    * Date-filter test
    */
    static dateFilterCheck = gridSelector => {
        cy.get("date-filter input[data-tab=range] + label").click();
        cy.get("div[data-cy='date-range'] select-field-filter[data-type=range][data-endpoint=start][data-field=year] button").click();
        cy.get("div[data-cy='date-range'] select-field-filter[data-type=range][data-endpoint=start][data-field=year] a").contains("2020").click();

        cy.get("div[data-cy='date-range'] select-field-filter[data-type=range][data-endpoint=start][data-field=month] button").click();
        cy.get("div[data-cy='date-range'] select-field-filter[data-type=range][data-endpoint=start][data-field=month] a").contains("Feb").click();

        cy.get("div[data-cy='date-range'] select-field-filter[data-type=range][data-endpoint=start][data-field=day] button").click();
        cy.get("div[data-cy='date-range'] select-field-filter[data-type=range][data-endpoint=start][data-field=day] a").contains("2").click();

        cy.get("div[data-cy='date-range'] select-field-filter[data-type=range][data-endpoint=end][data-field=year] button").click();
        cy.get("div[data-cy='date-range'] select-field-filter[data-type=range][data-endpoint=end][data-field=year] a").contains("2020").click();

        cy.get("div[data-cy='date-range'] select-field-filter[data-type=range][data-endpoint=end][data-field=month] button").click();
        cy.get("div[data-cy='date-range'] select-field-filter[data-type=range][data-endpoint=end][data-field=month] a").contains("Mar").click();

        cy.get("div[data-cy='date-range'] select-field-filter[data-type=range][data-endpoint=end][data-field=day] button").click();
        cy.get("div[data-cy='date-range'] select-field-filter[data-type=range][data-endpoint=end][data-field=day] a").contains("3").click();

        cy.get("opencga-active-filters button[data-filter-name='creationDate']").contains("20200202-20200303");
        cy.get("opencga-active-filters button[data-filter-name='creationDate']").click();
        this.checkResults(gridSelector);
    };

    /*
    * Lookup for the first simple text variable
    * type a random string and then check whether the button in opencga-active-filters is built correctly
    */
    static annotationFilterCheck = gridSelector => {
        cy.get("opencga-annotation-filter-modal", {timeout: TIMEOUT})
            .then($wc => {
                // check whether there are variableSet
                if (Cypress.$("button", $wc).length) {
                    cy.get("div[data-cy='annotations'] button").contains("Annotation").click();
                    const $tabs = Cypress.$("div.tab-pane", $wc);
                    // checkes whether there are VariableSets tabs
                    assert.isAbove($tabs.length, 0, "The number of VariableSets");
                    if ($tabs.length) {
                        const $firstTab = Cypress.$($tabs[0]);
                        if ($firstTab) {
                            // check whether there is actually an input field in the first VariableSet, if not bypass the test
                            const $inputFields = Cypress.$("input[data-variable-id]", $firstTab);
                            if ($inputFields.length) {
                                cy.get("opencga-annotation-filter-modal").find("input[data-variable-id]").first().should("be.visible").then($input => {
                                    const str = this.randomString();
                                    const variableSetId = $input.data("variableSetId");
                                    const variableId = $input.data("variableId");
                                    cy.wrap($input).type(str);
                                    cy.get("opencga-annotation-filter-modal .modal-footer button").contains("OK").click();
                                    cy.get("opencga-active-filters button[data-filter-name='annotation']").contains(`annotation: ${variableSetId}:${variableId}=${str}`);
                                    cy.get("opencga-active-filters button[data-filter-name='annotation']").click();
                                    this.checkResults(gridSelector);
                                });
                            } else {
                                // return true; // cy..then($wc => {}) fails because you cannot mixing up async and sync code.
                                // so we can just make the test pass by check the non existence of inputs fields
                                cy.get("opencga-annotation-filter-modal input[data-variable-id]", {timeout: TIMEOUT}).should("not.exist");
                                cy.get("opencga-annotation-filter-modal .modal-footer button").contains("OK").click();
                            }
                        }
                    }
                } else {
                    cy.wrap($wc).contains("No variableSets defined in the study");
                }
            });
    };

    /**
     * Select a token from a select2 textarea
     * @param {String} filterSelector CSS selector of the filter
     * @param {Number} value value to look for in the autocomplete dropdown
     * @param {Boolean} tags Indicates whether the autocomplete is in "freeTag" mode: if so (select2 tags=true), we need to explicitly press {downarrow} to select the right entry.
     */
    static selectToken = (filterSelector, value, tags = false) => {

        // Select2 HTML widget is inserted after the corresponding <select> element
        // thus we can find it using " + " CSS selector
        cy.get(filterSelector + " .select2").first().click({force: true})
            // after we click on the Select2 widget, the search drop down and input appear
            .find(".select2-search")
            .type(value + (tags ? "{downarrow}" : "") + "{enter}", {delay: 1500});
        // cy.get(filterSelector + " .select2").first().blur({force: true});
        // cy.get("body").click();

        // cy.get(filterSelector + " textarea").first().type(value, {force: true});

        /*
        the combination of invoke("val") and left arrow avoids flooding the server with 1 request for each character,
        also it seems more stable selecting cy.get("span.select2-dropdown ul li") because the dropdown is not re-rendered multiple time
        e.g. Timed out retrying after 4000ms: cy.should() failed because this element is detached from the DOM. on cy.get("span.select2-dropdown ul li", {timeout: 5000}).first().should("be.visible").
        cy.get(filterSelector + " textarea").first().invoke("val", value);
        cy.get(filterSelector + " textarea").first().type("{pagedown}", {force: true});

        cy.wait(1000); // it is necessary to avoid the following negative assertion is early satisfied
        cy.get(filterSelector + " span.select2-dropdown ul li", {timeout: TIMEOUT}).first().should("be.visible").and("not.contain", "Searching");
        cy.get(filterSelector + " textarea").first().focus().type(`${tags ? "{downarrow}" : ""}{enter}`).blur({force: true});*/
    };

    /**
     * Remove from a token from a select2 textarea
     * @param {String} filterSelector CSS selector of the filter
     * @param {Number} value value to look for in the autocomplete dropdown
     */
    static removeToken = (filterSelector, value) => {
        cy.get(filterSelector + " .select2").first()
            .contains(".select2-selection__choice", value)
            .find(".select2-selection__choice__remove").click();
        cy.get(filterSelector + " .select2-selection").first().focus().blur(); // TODO better check how reliable it is to blur the textarea
    };

    static loginByApiSession = (
        user = Cypress.env("user"),
        password = Cypress.env("pass")
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
        };

    static assertValueCopiedToClipboard = () => {
        return cy.window().then(win => win.navigator.clipboard.readText())
    }
}
