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

// it's not working
export const setCheckBox = (selectors, val) => {
    cy.get(selectors).invoke("prop", "checked", val);
};

export const checkLabel = (selectors, tag, val) => {
    cy.get(selectors).contains(tag, val);
};

export const setInput = (selectors, val) => {
    cy.get(selectors).type(val);
};


export const checkToolHeaderTitle = val => {
    cy.get("div.page-title h2", {timeout: TIMEOUT, log: false})
        .should("be.visible")
        .and("contain", val);
};

export const checkColumnsGridBrowser = grid => {
    cy.get(`${grid} .columns-toggle-wrapper button`).should("be.visible").and("contain", "Columns").click();
};

export const clickAllColumnsGridBrowser = grid => {
    cy.get(`${grid} .columns-toggle-wrapper ul li a`).click({multiple: true, timeout: TIMEOUT});
};

export const checkHeaderGridBrowser = grid =>
    cy.get(`${grid} .bootstrap-table .fixed-table-container thead > tr:first-child > th`, {timeout: TIMEOUT});


// Select2 Widgets
// https://www.cypress.io/blog/2020/03/20/working-with-select-elements-and-select2-widgets-in-cypress/#fetched-data
// <ul class="select2-selection__rendered" id="select2-DTCAOwDS-container"></ul>
export const setSelectTokenFilter = (selectors, val) => {
    cy.get("feature-filter select-token-filter ul").click({force: true});
    cy.get("div[data-cy='feature'] .select2-search__field").type(val, {delay: 200});
};

export const setSelectFieldFilter = (selectors, val) => {
    cy.get("feature-filter select-token-filter ul").click({force: true});
    cy.get("div[data-cy='feature'] .select2-search__field").type(val, {delay: 200});
};

