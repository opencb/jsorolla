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

context("Individual Browser Grid", () => {
    beforeEach(() => {
        cy.visit("#individual-browser-grid");
        cy.get("individual-grid")
            .as("individual-grid");
        cy.waitUntil(() => {
            return cy.get("@individual-grid")
                .should("be.visible");
        });
    });

    context("toolbar", () => {
        beforeEach(() => {
            cy.get("@individual-grid")
                .find("grid-toolbar")
                .as("toolbar");
        });

        it("should be visible", () => {
            cy.get("@toolbar")
                .should("be.visible");
        });

        it("should display the 'Create Individual' button", () => {
            cy.get("@toolbar")
                .contains("button", "Create Individual")
                .should("be.visible");
        });

        it("should display the 'Create Cohort' button", () => {
            cy.get("@toolbar")
                .contains("button", "Create Cohort")
                .should("be.visible");
        });

        it("should display the 'Settings' button", () => {
            cy.get("@toolbar")
                .find(`button[data-cy="toolbar-btn-settings"]`)
                .should("be.visible");
        });
    });

    context("create individual", () => {
        beforeEach(() => {
            cy.get("@individual-grid")
                .contains("button", "Create Individual")
                .click();
            cy.get("@individual-grid")
                .find(`div[data-cy="individual-create"]`)
                .as("modal-individual-create");
        });

        it("should be visible after clicking on the 'Create Individual' button", () => {
            cy.get("@modal-individual-create")
                .find("div.modal-dialog")
                .should("be.visible");
        });

        it("should display the text 'Create Individual' as title", () => {
            cy.get("@modal-individual-create")
                .find("h4.modal-title")
                .should("contain.text", "Create Individual");
        });

        it("should display a 'Clear' button", () => {
            cy.get("@modal-individual-create")
                .contains("button", "Clear")
                .should("be.visible");
        });

        it("should display a 'Create' button", () => {
            cy.get("@modal-individual-create")
                .contains("button", "Create")
                .should("be.visible");
        });

        it("should display content as tabs", () => {
            cy.get("@modal-individual-create")
                .find("ul.nav.nav-tabs > li")
                .should("have.length.greaterThan", 1);
        });

        it("should ask for an individual ID in the form", () => {
            cy.get("@modal-individual-create")
                .find("data-form")
                .should("contain.text", "Individual ID");
        });
    });

    context("update individual", () => {
        beforeEach(() => {
            cy.get("@individual-grid")
                .find(`table tbody tr td button[data-cy="actions-button"]`)
                .first()
                .click();
            cy.get("@individual-grid")
                .find(`a[data-action="edit"]`)
                .first()
                .click();
            cy.get(`div[data-cy="individual-update"]`)
                .as("modal-individual-update");
        });
        
        it("should be visible after clicking on the 'Edit' action", () => {
            cy.get("@modal-individual-update")
                .find("div.modal-dialog")
                .should("be.visible");
        });

        it("should display the text 'Update Individual' as a title", () => {
            cy.get("@modal-individual-update")
                .find("h4.modal-title")
                .should("contain.text", "Update Individual");
        });

        it("should display a 'Discard Changes' button", () => {
            cy.get("@modal-individual-update")
                .contains("button", "Discard Changes")
                .should("be.visible");
        });

        it("should display a 'Update' button", () => {
            cy.get("@modal-individual-update")
                .contains("button", "Update")
                .should("be.visible");
        });

        it("should display content as tabs", () => {
            cy.get("@modal-individual-update")
                .find("ul.nav.nav-tabs > li")
                .should("have.length.greaterThan", 1);
        });

        it("should display a field with the selected individual ID", () => {
            cy.get("@modal-individual-update")
                .find("data-form")
                .should("contain.text", "Individual ID");
        });
    });

    context("settings", () => {
        it("should display the settings modal when clicking on the 'Settings' button", () => {
            cy.get("@individual-grid")
                .find(`button[data-action="settings"]`)
                .click();
            cy.get("div.modal-dialog")
                .should("be.visible");
        });

        it("should allow to hide columns in the grid", () => {
            const columns = ["Disorders", "Clinical Interpretation"];

            cy.get("@individual-grid")
                .find("thead th")
                .as("headerColumns");
            columns.forEach(column => {
                cy.get("@headerColumns")
                    .contains("div", column)
                    .should("be.visible");
            });
            cy.get("@individual-grid")
                .find(`button[data-action="settings"]`)
                .click();
            cy.get("@individual-grid")
                .find(`div[data-testid="test-columns"] div[data-cy="select-dropdown"]`)
                .as("columnsSelector");
            cy.get("@columnsSelector")
                .find(`div[data-cy="select-dropdown-toggle"]`)
                .click();
            columns.forEach(column => {
                cy.get("@columnsSelector")
                    .find(`div[data-cy="select-dropdown-menu"] a`)
                    .contains(column)
                    .click();
            });
            cy.get("@columnsSelector")
                .find(`div[data-cy="select-dropdown-toggle"]`)
                .click();
            cy.get("@individual-grid")
                .find(".modal-body")
                .contains("button", "OK")
                .click();
            cy.get("@headerColumns")
                .should($header => {
                    const visibleColumns = Array.from($header, th => th.textContent.trim());
                    columns.forEach(col => {
                        expect(col).not.to.be.oneOf(visibleColumns);
                    });
                });
        });
    });

    context("grid", () => {
        context("content", () => {
            it("should display a <table> element", () => {
                cy.get("@individual-grid")
                    .find("table")
                    .should("be.visible");
            });

            it("should display at least one row", () => {
                cy.get("@individual-grid")
                    .find("tbody tr")
                    .should("be.visible");
            });

            it("should display at least one column", () => {
                cy.get("@individual-grid")
                    .find("thead tr th")
                    .should("be.visible");
            });

            it("should display column titles", () => {
                cy.get("@individual-grid")
                    .find(`thead tr th div[class="th-inner "]`)
                    .first()
                    .should("not.be.empty");
            });
        });

        context("data completeness", () => {
            it("should display individual ids", () => {
                cy.get("@individual-grid")
                    .find("tbody td:first-child")
                    .each($td => {
                        cy.wrap($td)
                            .should("not.be.empty");
                    });
            });

            it("should display a creation date", () => {
                cy.get("@individual-grid")
                    .contains("th", "Creation Date")
                    .invoke("index")
                    .then(index => {
                        cy.get("@individual-grid")
                            .find(`tbody td:nth-child(${index + 1})`)
                            .each(td => {
                                cy.wrap(td)
                                    .should("not.be.empty");
                            });
                    });
            });

            it("should have a creation date with valid format", () => {
                const regExp = /^(([0-9])|([0-2][0-9])|([3][0-1])) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}$/;

                cy.get("@individual-grid")
                    .contains("th", "Creation Date")
                    .invoke("index")
                    .then(index => {
                        cy.get("@individual-grid")
                            .find(`tbody td:nth-child(${index + 1})`)
                            .each(td => {
                                td.text()
                                    .split("\n")
                                    .filter(text => text.trim() !== "")
                                    .forEach(text => {
                                        expect(text.trim()).to.match(regExp);
                                    });
                            });
                    });
            });
        });

        context("extensions", () => {
            it("should display 'Extra Column' column", () => {
                cy.get("@individual-grid")
                    .find("thead th")
                    .contains("Extra column")
                    .should("be.visible");
            });
        });

        context("annotations", () => {
            const annotations = [
                {
                    title: "Cardiology Tests",
                    position: 5,
                    variables: ["ecg_test", "echo_test"]
                },
                {
                    title: "Risk Assessment",
                    position: 6,
                    variables: ["date_risk_assessment"]
                }
            ];

            // 5.1 Render each varSet title as column header
            it("should display enabled varSet column titles", () => {
                cy.wrap(annotations).each(annotation => {
                    cy.get("@individual-grid")
                        .find("thead tr th")
                        .contains(annotation.title);
                });
            });

            // 5.2 Render each varSet column at the position configured in position
            it("should display varSet position configured equal to the index of the corresponding column", () => {
                cy.wrap(annotations).each(annotation => {
                    cy.get("@individual-grid")
                        .contains("thead tr th", annotation.title)
                        .invoke("index")
                        .then(index => {
                            expect(index - 1).equal(annotation.position);
                        });
                    });
            });

            // 5.3 Render variables correctly
            it("should display annotations", () => {
                cy.wrap(annotations).each(annotation => {
                    cy.get("@individual-grid")
                        .contains("thead tr th", annotation.title)
                        .invoke("index")
                        .then(index => {
                            cy.get("tbody tr")
                                .first()
                                .find("td")
                                .eq(index)
                                .should("contain.text", annotation.variables[0]);
                            });
                    });
            });
        });
    });
});
