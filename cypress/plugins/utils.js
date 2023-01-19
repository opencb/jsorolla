
/**
 * https://github.com/cypress-io/cypress/issues/5743#issuecomment-650421731
 * getAttached(selector)
 * getAttached(selectorFn)
 *
 * Waits until the selector finds an attached element, then yields it (wrapped).
 * selectorFn, if provided, is passed $(document). Don't use cy methods inside selectorFn.
 */

import {TIMEOUT} from "./constants.js";

Cypress.Commands.add("getAttached", selector => {
    const getElement = typeof selector === "function" ? selector : $d => $d.find(selector);
    let $el = null;
    return cy.document().should($d => {
        $el = getElement(Cypress.$($d));
        expect(Cypress.dom.isDetached($el)).to.be.false;
    }).then(() => cy.wrap($el));
});

export const waitTable = gridSelector => {
    cy.wait(1000); // it is necessary to avoid the following negative assertion is early satisfied
    cy.get(gridSelector + " div.fixed-table-loading", {timeout: 60000}).should("be.not.visible");
};

export const login = () => {
    cy.visit("http://localhost:3000/src/sites/iva/#login");
    const username = Cypress.env("username");
    const password = Cypress.env("password");
    cy.get("user-login .panel-body #user").type(username);
    cy.get("user-login .panel-body #password").type(password, {log: false});
    cy.get("button.btn-primary").contains("Sign In").click();

    // temp fix
    cy.get(".login-overlay", {timeout: TIMEOUT}).should("be.visible");
    cy.get(".login-overlay", {timeout: TIMEOUT}).should("not.exist");

    // switch to defined Study
    if (Cypress.env("study")) {
        cy.get(`a[data-cy-fqn="${Cypress.env("study")}"]`, {timeout: TIMEOUT}).click({force: true});
    }


};

/**
 * Routes to a specific Tool
 * @param {String} toolId The tool you want to go to
 * @returns {void}
 */
export const goTo = toolId => {
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

export const randomString = length => {
    let result = "";
    const _length = length || 6;
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    for (let i = 0; i < _length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

export const waitTableResults = gridSelector => {
    cy.get(gridSelector + " div.fixed-table-loading", {timeout: TIMEOUT}).should("be.visible");
    cy.get(gridSelector + " div.fixed-table-loading", {timeout: TIMEOUT}).should("be.not.visible");
};

/**
 * it check the table actually contains a single result
 * @param {String} [gridSelector] - name gridSelector
 * @param {Number} [numResults] - nums results
 * @returns {void}
 */
export const checkExactResult = (gridSelector, numResults = 1) => {
    cy.get(gridSelector + " table", {timeout: TIMEOUT}).find("tr[data-index]", {timeout: TIMEOUT}).should("have.lengthOf", numResults); // .should("be.gte", 1);
};

/**
 * it check the table actually contains results
 * @param {String} [gridSelector] - name gridSelector
 * @returns {void}
 */
export const checkResults = gridSelector => {
    waitTable(gridSelector);
    cy.get(gridSelector + " table", {timeout: TIMEOUT}).find("tr[data-index]", {timeout: TIMEOUT}).should("have.length.gt", 0); // .should("be.gte", 1);
};

/**
 * it check the table contains results or the message "No matching records found"
 * @param {String} [gridSelector] - name gridSelector
 * @param {Number} [id] - id
 * @returns {void}
 */
export const checkResultsOrNot = (gridSelector, id) => {
    waitTable(gridSelector);
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
 * Given column and row coordinates, it returns the value of a single cell out of a bootstrap table
 * @param {String} gridSelector CSS selector of the table
 * @param {Number} colIndex column index
 * @param {Number} rowIndex row index
 * @param {String} invokeFn text|html
 * @returns {Cypress.Chainable}
 */
export const getResult = (gridSelector, colIndex = 0, rowIndex = 0, invokeFn= "text") => {
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
export const hasResults = gridSelector => {
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
export const changePage = (gridSelector, page) => {
    cy.get(gridSelector + " .fixed-table-container + .fixed-table-pagination ul.pagination li a.page-link").should("be.visible").contains(page).click();
};

export const Facet = {
    select: label => {
        cy.get("facet-filter .facet-selector li a").contains(label).click({force: true});
    },
    // TODO add action: remove from select
    remove: label => {
        // TODO check whether it is active and then remove from select
        // cy.get("div.facet-wrapper button[data-filter-name='" + field + "']")
        cy.get("facet-filter .facet-selector li a").contains(label).click({force: true});
    },
    selectDefaultFacet: () => {
        cy.get("button.default-facets-button").click();
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
export const dateFilterCheck = gridSelector => {
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
    checkResults(gridSelector);
};


/*
 * Lookup for the first simple text variable
 * type a random string and then check whether the button in opencga-active-filters is built correctly
 */
export const annotationFilterCheck = gridSelector => {
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
                                const str = randomString();
                                const variableSetId = $input.data("variableSetId");
                                const variableId = $input.data("variableId");
                                cy.wrap($input).type(str);
                                cy.get("opencga-annotation-filter-modal .modal-footer button").contains("OK").click();
                                cy.get("opencga-active-filters button[data-filter-name='annotation']").contains(`annotation: ${variableSetId}:${variableId}=${str}`);
                                cy.get("opencga-active-filters button[data-filter-name='annotation']").click();
                                checkResults(gridSelector);
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
export const selectToken = (filterSelector, value, tags = false) => {

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
    // the combination of invoke("val") and left arrow avoids flooding the server with 1 request for each character,
    // also it seems more stable selecting cy.get("span.select2-dropdown ul li") because the dropdown is not re-rendered multiple time
    // e.g. Timed out retrying after 4000ms: cy.should() failed because this element is detached from the DOM. on cy.get("span.select2-dropdown ul li", {timeout: 5000}).first().should("be.visible").
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
export const removeToken = (filterSelector, value) => {
    cy.get(filterSelector + " .select2").first()
        .contains(".select2-selection__choice", value)
        .find(".select2-selection__choice__remove").click();
    cy.get(filterSelector + " .select2-selection").first().focus().blur(); // TODO better check how reliable it is to blur the textarea

};

export const typeField = (name, value) => {
    // Temporal solution
    return cy.get("label").contains(name).parent().parent().within(()=> {
        cy.get("input[type='text']").type(value);
    });
};
