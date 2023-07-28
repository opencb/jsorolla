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
import CatalogGridFormatter from "../../../src/webcomponents/commons/catalog-grid-formatter";

context("Sample Browser Grid", () => {
    const gridComponent = "sample-grid";

    beforeEach(() => {
        cy.visit("#sample-browser-grid");
        cy.get(`div[data-cy="sample-browser-container"]`)
            .as("container");
        cy.waitUntil(() => {
            return cy.get("@container")
                .should("be.visible");
        });
    });

    // GRID
    context("sample browser grid - table", () => {

        beforeEach(() => {
            cy.get("@container")
                .find(`div[data-cy="sb-grid"]`)
                .as("grid");
        });

        // 1. Render the grid
        context("render", () => {
            // It should render a table, with at least one column and one row
            it("should render table", () => {
                cy.get("@container")
                    .find(`table`)
                    .should("be.visible");
            });
            it("should render at least one row", () => {
                cy.get("@container")
                    .find(`tbody tr`)
                    .should("be.visible");
            });
            it("should render at least one column", () => {
                cy.get("@container")
                    .find(`thead tr th`)
                    .should("be.visible");
            });
            it("should render column titles", () => {
                cy.get("@container")
                    .find(`thead tr th div[class="th-inner "]`)
                    .should("not.be.empty");
            });
            it("should render at least one row", () => {
                cy.get("@container")
                    .find(`tbody tr`)
                    .should("be.visible");
            });
            // It should render the pagination
            it("should change page sample-browser-grid", () => {
                UtilsTest.changePage(gridComponent,2);
            });

        });

        context("data completeness", () => {
            let creationDateIndex = null;

            beforeEach(() => {
                cy.get("@grid")
                    .find(`tbody`)
                    .as("body");
            });

            it("should have IDs", () => {
                cy.get("@body")
                    .find("td:first-child")
                    .each($td => {
                        cy.wrap($td)
                            .should("not.be.empty");
                    });
            });

            it("should have a creation date", () => {
                cy.get("@grid")
                    .contains("th", "Creation Date")
                    .invoke("index")
                    .then(i => {
                        creationDateIndex = i + 1;
                        cy.get("@body")
                            .find(`td:nth-child(${i})`)
                            .each(td => {
                                cy.wrap(td)
                                    .should("not.be.empty");
                            });
                    });
            });

            it("should have a creation date with valid format", () => {
                cy.get("@body")
                    .find(`td:nth-child(${creationDateIndex})`)
                    .each(td => {
                        const regExp = /^(([0-9])|([0-2][0-9])|([3][0-1])) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}$/
                        expect(td.text()).to.match(regExp);
                    });
            });

            it("should have a creation date equal or earlier than today ", () => {
                cy.get("@body")
                    .find(`td:nth-child(${creationDateIndex})`)
                    .each(td => {
                        const date = new Date(td.text());
                        const today = new Date();
                        expect(date).to.be.lte(today);
                    });
            });

        });

        context("data format", () => {
            beforeEach(() => {
                cy.get("@grid")
                    .find(`tbody tr[data-index="0"]`)
                    .as("row");
            });
        });

        context("extension", () => {
            it("should display 'Extra Column' column", () => {
                cy.get("thead th")
                    .contains("Extra column")
                    .should('be.visible')
            })
        })

    });
});
