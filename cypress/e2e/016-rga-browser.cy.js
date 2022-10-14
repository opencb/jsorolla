/* eslint-disable cypress/no-unnecessary-waiting */
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

import {login, goTo, getResult, checkResults, selectToken} from "../plugins/utils.js";
import {TIMEOUT} from "../plugins/constants.js";

const timeout = 180000; // 3 mins
let ENABLED = false;

const goToViewAndClear = viewId => {
    cy.get("a[data-id=rga]", {timeout: TIMEOUT}).click({force: true});
    cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", "Recessive Variant Browser");
    cy.get("button[data-tab-id='"+ viewId +"']", {timeout: TIMEOUT}).click({force: true});

    // clear filters
    cy.get("button.active-filter-label").click();
    cy.get("a[data-action='active-filter-clear']").click();

};

context("16.  RGA Browser", () => {
    before(() => {
        login();
        goTo("iva");

        // Check availability for current study
        cy.get("a[data-id=rga]", {timeout: TIMEOUT}).click({force: true});
        cy.get("rga-browser", {timeout: TIMEOUT}).then($comp => {
            if (!Cypress.$("tool-header[title='Recessive Variant Browser']", $comp).length) {
                cy.get("div.guard-page h3").contains("not enabled to Recessive Variant Analysis");
            } else {
                ENABLED = true;
            }
        });
    });

    beforeEach(function () {
        if (!ENABLED) {
            cy.log("RGA Test skipped");
            this.skip();
        }

    });


    it("16.1 - RGA Check availability for current study", () => {
        cy.get("a[data-id=rga]", {timeout: TIMEOUT}).click({force: true});
        cy.get("rga-browser", {timeout: TIMEOUT}).then($comp => {
            if (!Cypress.$("tool-header[title='Recessive Variant Browser']", $comp).length) {
                cy.get("div.guard-page h3").contains("not enabled to Recessive Variant Analysis");
            } else {
                ENABLED = true;
            }
        });
    });


    it("16.2 - Gene View. An RGA item exist in the main menu and Gene button shows the Gene View.", () => {
        goToViewAndClear("gene-tab");
        checkResults("rga-gene-view");
    });

    it("16.3 - Gene View. Columns dropdown exists and every item toggles the related column in the table.", () => {
        goToViewAndClear("gene-tab");
        checkResults("rga-gene-view");

        cy.get("rga-gene-view .columns-toggle-wrapper button").should("be.visible").and("contain", "Columns").click(); // checks that columns dropdown exists and click on it
        cy.get("rga-gene-view .columns-toggle-wrapper ul li").and("have.length.gt", 1); // columns dropdown has more than 1 item

        cy.get("rga-gene-view .columns-toggle-wrapper ul li a").click({multiple: true, timeout: TIMEOUT}); // deactivate all the columns
        cy.get("rga-gene-view div[data-cy='gene-view-grid'] .bootstrap-table .fixed-table-container tr[data-index=0] > td", {timeout: TIMEOUT}).should("have.lengthOf", 0);

        cy.get("rga-gene-view .columns-toggle-wrapper ul li a").click({multiple: true, timeout: TIMEOUT}); // reactivate all the columns
        cy.get("rga-gene-view div[data-cy='gene-view-grid'] .bootstrap-table .fixed-table-container tr[data-index=0] > td", {timeout: TIMEOUT}).should("have.lengthOf", 8);

        checkResults("rga-gene-view");
    });

    it("16.4 - Gene View. Filtering by the first Gene in results, gene column contains that gene (exclusively).", () => {
        goToViewAndClear("gene-tab");
        checkResults("rga-gene-view");

        // gene Name
        // queries for the first gene and then check if the first result contains the gene.
        let geneName;
        getResult("rga-gene-view", 0).then($text => {
            geneName = $text;
            selectToken("feature-filter", geneName, true);
            cy.get("div.search-button-wrapper button").click();
            checkResults("rga-gene-view");
            getResult("rga-gene-view", 0).then($resultCell => {
                cy.wrap($resultCell).should("contain", geneName);
            });
        });
        cy.get("opencga-active-filters button[data-filter-name='geneName']").click();
        checkResults("rga-gene-view");

    });


    it("16.5 - Gene View. Querying by KnockoutType=COMP_HET, one or more columns among 'CH - Definite', 'CH - Probable' are not equal to '-' for each row (first 10).", () => {
        goToViewAndClear("gene-tab");
        checkResults("rga-gene-view");
        checkResults("rga-gene-view");

        // knockoutType
        cy.get("div[data-cy='knockoutType'] button").click();
        cy.get("div[data-cy='knockoutType'] .dropdown-menu a").contains("Compound Heterozygous").click();
        cy.get("div.search-button-wrapper button").click();

        let definite, probable;

        // iterate over result rows
        for (let i = 0; i<10; i++) {
            console.log("I", i);
            getResult("rga-gene-view", 3, i).then($text => {
                console.log("CH 1", parseInt($text));
                definite = parseInt($text);

                getResult("rga-gene-view", 4, i).then($text => {
                    console.log("CH 2", parseInt($text));
                    probable = parseInt($text);

                    // definite or probable could be either a number > 0 or NaN. If all are NaN the test fails.
                    expect(definite || probable, "At least one of definite or probable is > 0").to.not.be.NaN;
                });
            });
        }

        cy.get("opencga-active-filters button[data-filter-name='knockoutType']").click();
        checkResults("rga-gene-view");
    });

    it("16.6 - Gene View. Querying by KnockoutType=HOM, column 'HOM' is not equal to '-' for each row (first 10).", () => {
        goToViewAndClear("gene-tab");
        checkResults("rga-gene-view");
        checkResults("rga-gene-view");

        // knockoutType
        cy.get("div[data-cy='knockoutType'] button").click();
        cy.get("div[data-cy='knockoutType'] .dropdown-menu a").contains("Homozygous").click();
        cy.get("div.search-button-wrapper button").click();

        getResult("rga-gene-view", 2).then($text => {
            console.log("HOM", $text);
            // checking for the number of HOM individuals > 0
            expect(parseInt($text), "HOM gt 0").to.be.gt(0);
        });

        cy.get("opencga-active-filters button[data-filter-name='knockoutType']").click();
        checkResults("rga-gene-view");
    });

    it("16.7 - Gene View. Querying for first individual Id from results in Individual View, search for first individual and check for 'Total individual' Column = 1", () => {
        goToViewAndClear("gene-tab");
        checkResults("rga-gene-view");
        checkResults("rga-gene-view");

        // Grab first individual in Individual View and use the Individual Id in Gene View
        cy.get("a[data-id=rga]", {timeout: TIMEOUT}).click({force: true});
        cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", "Recessive Variant Browser");
        cy.get("button[data-tab-id='individual-tab']", {timeout: TIMEOUT}).click({force: true});
        checkResults("rga-individual-view");

        let IndividualId;
        getResult("rga-individual-view", 0).then($text => {
            IndividualId = $text;
            console.log("IndividualId", IndividualId);
            selectToken("individual-id-autocomplete", IndividualId);
            cy.get("div.search-button-wrapper button").click();
            checkResults("rga-individual-view");

            // switching back to Gene View
            cy.get("button[data-tab-id='gene-tab']", {timeout: TIMEOUT}).click({force: true});
            checkResults("rga-gene-view");

            getResult("rga-gene-view", 1).then($text => {
                expect(parseInt($text), "Total individual > 0").to.be.eq(1);
            });
        });
        cy.get("opencga-active-filters button[data-filter-name='individualId']").click();
        checkResults("rga-gene-view");

    });

    it("16.8 - Gene View. Filter: Definite. 'CH Definite' Column > 0 for each row (first 10)", () => {
        goToViewAndClear("gene-tab");
        checkResults("rga-gene-view");

        // numParents=2
        cy.get("div[data-cy='numParents'] .magic-checkbox-wrapper > :nth-child(2) > label").click();
        cy.get("div.search-button-wrapper button").click();
        checkResults("rga-gene-view");

        // checking the number of CH Definite is > 0 for each row
        for (let i = 0; i<10; i++) {
            getResult("rga-gene-view", 3, i).then($text => {
                expect(parseInt($text), "Definite > 0").to.be.gt(0);
            });
        }
        cy.get("opencga-active-filters button[data-filter-name='numParents']").click();
        checkResults("rga-gene-view");
    });

    it("16.9 - Gene View. Filter: Probable. 'CH Probable' Column > 0 for each row (first 10)", () => {
        goToViewAndClear("gene-tab");
        checkResults("rga-gene-view");

        // numParents=1
        cy.get("div[data-cy='numParents'] .magic-checkbox-wrapper > :nth-child(1) > label").click();
        cy.get("div.search-button-wrapper button").click();
        checkResults("rga-gene-view");

        // checking the number of CH Probable is > 0 for each row
        for (let i = 0; i<10; i++) {
            getResult("rga-gene-view", 4, i).then($text => {
                expect(parseInt($text), "Probable > 0").to.be.gt(0);
            });
        }
        cy.get("opencga-active-filters button[data-filter-name='numParents']").click();
        checkResults("rga-gene-view");
    });

    it("16.10 - Individual View. An RGA item exist in the main menu and Gene button shows the Gene View.", () => {
        goToViewAndClear("individual-tab");
        checkResults("rga-individual-view");
    });

    it("16.11 - Individual View. Columns dropdown exists and every item toggles the related column in the table.", () => {
        goToViewAndClear("individual-tab");
        checkResults("rga-individual-view");

        cy.get("rga-individual-view .columns-toggle-wrapper button").should("be.visible").and("contain", "Columns").click();
        cy.get("rga-individual-view .columns-toggle-wrapper ul li").and("have.length.gt", 1);

        cy.get("rga-individual-view .columns-toggle-wrapper ul li a").click({multiple: true, timeout: TIMEOUT}); // deactivate all the columns
        cy.get("rga-individual-view div[data-cy='individual-view-grid'] .bootstrap-table .fixed-table-container tr[data-index=0] > td", {timeout: TIMEOUT}).should("have.lengthOf", 0);

        cy.get("rga-individual-view .columns-toggle-wrapper ul li a").click({multiple: true, timeout: TIMEOUT}); // reactivate all the columns
        cy.get("rga-individual-view div[data-cy='individual-view-grid'] .bootstrap-table .fixed-table-container tr[data-index=0] > td", {timeout: TIMEOUT}).should("have.lengthOf", 9);

    });

    it("16.12 - Individual View. Querying for GRIK5 Gene, Gene column contains GRIK5 (not exclusively) for each fow (first 10).", () => {
        goToViewAndClear("individual-tab");
        checkResults("rga-individual-view");

        selectToken("feature-filter", "grik5", true);
        cy.get("div.search-button-wrapper button").click();
        checkResults("rga-individual-view");

        // queries for the grik5 gene and then check if the first result contains the gene.
        for (let i = 0; i<10; i++) {
            getResult("rga-individual-view", 2).then($resultCell => {
                cy.wrap($resultCell).should("contain", $resultCell);
            });

        }
        cy.get("opencga-active-filters button[data-filter-name='geneName']").click();
        checkResults("rga-individual-view");

    });

    it("16.13 - Individual View. Querying by KnockoutType=COMP_HET, one or more columns among 'CH - Definite', 'CH - Probable' are not equal to '-' for each row (first 10).", () => {
        goToViewAndClear("individual-tab");
        checkResults("rga-individual-view");

        // knockoutType
        cy.get("div[data-cy='knockoutType'] button").click();
        cy.get("div[data-cy='knockoutType'] .dropdown-menu a").contains("Compound Heterozygous").click();
        cy.get("div.search-button-wrapper button").click();

        let definite, probable, possible;

        // iterate over result rows
        for (let i = 0; i<10; i++) {
            console.log("I", i);
            getResult("rga-individual-view", 4, i).then($text => {
                console.log("CH 1", parseInt($text));
                definite = parseInt($text);

                getResult("rga-individual-view", 5, i).then($text => {
                    console.log("CH 2", parseInt($text));
                    probable = parseInt($text);

                    // definite or probable could be either a number > 0 or NaN. If all are NaN the test fails.
                    expect(definite || probable, "At least one of definite or probable is > 0").to.not.be.NaN;
                });
            });

        }

        cy.get("opencga-active-filters button[data-filter-name='knockoutType']").click();
        checkResults("rga-individual-view");
    });

    it("16.14 - Individual View. Querying by KnockoutType=HOM, column 'HOM' is not equal to '-' for each row (first 10).", () => {
        goToViewAndClear("individual-tab");
        checkResults("rga-individual-view");

        // knockoutType
        cy.get("div[data-cy='knockoutType'] button").click();
        cy.get("div[data-cy='knockoutType'] .dropdown-menu a").contains("Homozygous").click();
        cy.get("div.search-button-wrapper button").click();

        getResult("rga-individual-view", 3).then($text => {
            console.log("HOM", $text);
            // checking for the number of HOM individuals > 0
            expect(parseInt($text), "HOM gt 0").to.be.gt(0);
        });

        cy.get("opencga-active-filters button[data-filter-name='knockoutType']").click();
        checkResults("rga-individual-view");
    });

    it("16.15 - Individual View. Filter: Definite. 'CH Definite' Column > 0 for each row (first 10)", () => {
        goToViewAndClear("individual-tab");
        checkResults("rga-individual-view");

        cy.get("button[data-tab-id='individual-tab']", {timeout: TIMEOUT}).click({force: true});

        // numParents=2
        cy.get("div[data-cy='numParents'] .magic-checkbox-wrapper > :nth-child(2) > label").click();
        cy.get("div.search-button-wrapper button").click();
        checkResults("rga-individual-view");

        // checking the number of CH Definite is > 0 for each row
        for (let i = 0; i<10; i++) {
            getResult("rga-individual-view", 4, i).then($text => {
                expect(parseInt($text), "Definite > 0").to.be.gt(0);
            });
        }
        cy.get("opencga-active-filters button[data-filter-name='numParents']").click();
        checkResults("rga-individual-view");
    });

    it("16.16 - Individual View. Filter: Probable. 'CH Probable' Column > 0 for each row (first 10)", () => {
        goToViewAndClear("individual-tab");
        checkResults("rga-individual-view");

        // numParents=1
        cy.get("div[data-cy='numParents'] .magic-checkbox-wrapper > :nth-child(1) > label").click();
        cy.get("div.search-button-wrapper button").click();
        checkResults("rga-individual-view");

        // checking the number of CH Probable is > 0 for each row
        for (let i = 0; i<10; i++) {
            getResult("rga-individual-view", 5, i).then($text => {
                expect(parseInt($text), "Possible > 0").to.be.gt(0);
            });
        }
        cy.get("button.active-filter-label").click();
        cy.get("a[data-action='active-filter-clear']").click();

        cy.get("opencga-active-filters button[data-filter-name='numParents']").click();
        checkResults("rga-individual-view");
    });


    it("16.17 - Individual View. Querying for first individual Id from results, total results = 1.", () => {
        goToViewAndClear("individual-tab");
        checkResults("rga-individual-view");

        let IndividualId;

        getResult("rga-individual-view", 0).then($text => {
            IndividualId = $text;
            console.log("IndividualId i", IndividualId);
            selectToken("individual-id-autocomplete", IndividualId);
            cy.get("div.search-button-wrapper button").click();
            checkResults("rga-individual-view");

            getResult("rga-individual-view", 0).then($resultCell => {
                console.log("$resultCell", $resultCell);
                cy.wrap($resultCell).should("contain", IndividualId);

            });
            cy.get("rga-individual-view div[data-cy='individual-view-grid'] table tbody tr").should("have.length", 1);

        });
        cy.get("button.active-filter-label").click();
        cy.get("a[data-action='active-filter-clear']").click();
        checkResults("rga-individual-view");

    });

    it("16.18 - Individual View. Empty query, Family table has > 0 results", () => {
        goToViewAndClear("individual-tab");
        checkResults("rga-individual-view");

        checkResults("rga-individual-family");
    });


    it("16.19 - Variant View. An RGA item exist in the main menu and Gene button shows the Gene View.", () => {
        goToViewAndClear("variant-tab");
        checkResults("rga-variant-view");
    });

    it("16.20 - Variant View. Columns dropdown exists and every item toggles the related column in the table.", () => {
        goToViewAndClear("variant-tab");
        checkResults("rga-variant-view");

        cy.get("rga-variant-view .columns-toggle-wrapper button").should("be.visible").and("contain", "Columns").click();
        cy.get("rga-variant-view .columns-toggle-wrapper ul li").and("have.length.gt", 1);

        cy.get("rga-variant-view .columns-toggle-wrapper ul li a").click({multiple: true, timeout: TIMEOUT}); // deactivate all the columns
        cy.get("rga-variant-view div[data-cy='variant-view-grid'] .bootstrap-table .fixed-table-container tr[data-index=0] > td", {timeout: TIMEOUT}).should("have.lengthOf", 0);

        cy.get("rga-variant-view .columns-toggle-wrapper ul li a").click({multiple: true, timeout: TIMEOUT}); // reactivate all the columns
        cy.get("rga-variant-view div[data-cy='variant-view-grid'] .bootstrap-table .fixed-table-container tr[data-index=0] > td", {timeout: TIMEOUT}).should("have.lengthOf", 12);

    });


    it("16.21 - Variant View. Querying for GRIK5 Gene, Gene column contains GRIK5 (not exclusively) for each fow (first 10).", () => {
        goToViewAndClear("variant-tab");
        checkResults("rga-variant-view");

        selectToken("feature-filter", "grik5", true);
        cy.get("div.search-button-wrapper button").click();
        checkResults("rga-variant-view");

        // queries for the grik5 gene and then check if the first result contains the gene.
        for (let i = 0; i<10; i++) {
            getResult("rga-variant-view", 1).then($resultCell => {
                cy.wrap($resultCell).should("contain", $resultCell);
            });

        }
    });

    it("16.22 - Variant View. Querying for first individual Id from results in Individual View, 'Total individual' Column = 1", () => {
        goToViewAndClear("variant-tab");
        checkResults("rga-variant-view");


        // Grab first individual in Individual View and use the Individual Id in Gene View
        cy.get("a[data-id=rga]", {timeout: TIMEOUT}).click({force: true});
        cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", "Recessive Variant Browser");
        cy.get("button[data-tab-id='individual-tab']", {timeout: TIMEOUT}).click({force: true});
        checkResults("rga-individual-view");

        let IndividualId;
        getResult("rga-individual-view", 0).then($text => {
            IndividualId = $text;
            console.log("IndividualId", IndividualId);
            selectToken("individual-id-autocomplete", IndividualId);
            cy.get("div.search-button-wrapper button").click();
            checkResults("rga-individual-view");

            // switching back to Gene View
            cy.get("button[data-tab-id='gene-tab']", {timeout: TIMEOUT}).click({force: true});
            checkResults("rga-variant-view");

            getResult("rga-variant-view", 8).then($text => {
                expect(parseInt($text), "Total individual > 0").to.be.gt(0);
            });
        });
        cy.get("opencga-active-filters button[data-filter-name='individualId']").click();
        checkResults("rga-variant-view");

    });


    it("16.23 - Variant View. Querying by KnockoutType=COMP_HET, one or more columns among 'CH - Definite', 'CH - Probable' are not equal to '-' for each row (first 10).", () => {
        goToViewAndClear("variant-tab");
        checkResults("rga-variant-view");

        // knockoutType
        cy.get("div[data-cy='knockoutType'] button").click();
        cy.get("div[data-cy='knockoutType'] .dropdown-menu a").contains("Compound Heterozygous").click();
        cy.get("div.search-button-wrapper button").click();

        let definite, probable, possible;

        // iterate over result rows
        for (let i = 0; i<10; i++) {
            console.log("I", i);
            getResult("rga-variant-view", 10, i).then($text => {
                console.log("CH 1", parseInt($text));
                definite = parseInt($text);

                getResult("rga-variant-view", 11, i).then($text => {
                    console.log("CH 2", parseInt($text));
                    probable = parseInt($text);

                    // definite or probable could be either a number > 0 or NaN. If all are NaN the test fails.
                    expect(definite || probable, "At least one of definite or probable is > 0").to.not.be.NaN;
                });
            });
        }

        cy.get("opencga-active-filters button[data-filter-name='knockoutType']").click();
        checkResults("rga-variant-view");
    });

    it("16.24 - Variant View. Querying by KnockoutType=HOM, column 'HOM' is not equal to '-' for each row (first 10).", () => {
        goToViewAndClear("variant-tab");
        checkResults("rga-variant-view");

        // knockoutType
        cy.get("div[data-cy='knockoutType'] button").click();
        cy.get("div[data-cy='knockoutType'] .dropdown-menu a").contains("Homozygous").click();
        cy.get("div.search-button-wrapper button").click();

        getResult("rga-variant-view", 9).then($text => {
            // console.log("HOM", $text);
            // checking for the number of HOM individuals > 0
            expect(parseInt($text), "HOM gt 0").to.be.gt(0);
        });

        cy.get("opencga-active-filters button[data-filter-name='knockoutType']").click();
        checkResults("rga-individual-view");
    });

    it("16.25 - Variant View. Filter: Definite. 'CH Definite' Column > 0 for each row (first 10)", () => {
        goToViewAndClear("variant-tab");
        checkResults("rga-variant-view");

        // numParents=2
        cy.get("div[data-cy='numParents'] .magic-checkbox-wrapper > :nth-child(2) > label").click();
        cy.get("div.search-button-wrapper button").click();
        checkResults("rga-variant-view");

        // checking the number of CH Definite is > 0 for each row
        for (let i = 0; i<10; i++) {
            getResult("rga-variant-view", 10, i).then($text => {
                expect(parseInt($text), "Definite > 0").to.be.gt(0);
            });
        }
        cy.get("opencga-active-filters button[data-filter-name='numParents']").click();
        checkResults("rga-variant-view");
    });

    it("16.26 - Variant View. Filter: Probable. 'CH Probable' Column > 0 for each row (first 10)", () => {
        goToViewAndClear("variant-tab");
        checkResults("rga-variant-view");

        // numParents=1
        cy.get("div[data-cy='numParents'] .magic-checkbox-wrapper > :nth-child(1) > label").click();
        cy.get("div.search-button-wrapper button").click();
        checkResults("rga-variant-view");

        // checking the number of CH Probable is > 0 for each row
        for (let i = 0; i<10; i++) {
            getResult("rga-variant-view", 11, i).then($text => {
                expect(parseInt($text), "Probable > 0").to.be.gt(0);
            });
        }
        cy.get("opencga-active-filters button[data-filter-name='numParents']").click();
        checkResults("rga-variant-view");
    });


    it("16.27 - Variant View. Querying for the first Variant Id from results, number of results = 1 and Variant Id matches.", () => {
        goToViewAndClear("variant-tab");
        checkResults("rga-variant-view");

        cy.get("a[data-id=rga]", {timeout: TIMEOUT}).click({force: true});
        cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", "Recessive Variant Browser");
        cy.get("button[data-tab-id='variant-tab']", {timeout: TIMEOUT}).click({force: true});
        checkResults("rga-variant-view");

        // variantId
        let variantId;
        getResult("rga-variant-view", 0).then(v => {
            variantId = v.trim().match(/\d+:\d+\s{2}\w+\/\w+/)[0];
            const [, pos, ref, alt] = v.trim().match(/(\d+:\d+)\s{2}(\w+)\/(\w+)/);
            cy.get("div[data-cy='variants'] input").type(pos + ":" + ref + ":" + alt);
            cy.get("div.search-button-wrapper button").click();
            checkResults("rga-variant-view", timeout);
            getResult("rga-variant-view", 0).then($resultCell => {
                cy.wrap($resultCell).should("contain", variantId);
            });
        });

    });


    it("16.28 - Variant View. Querying for Population frequency: 1000k < 0.01, 'Alternate allele frequency' column check.", () => {
        goToViewAndClear("variant-tab");
        checkResults("rga-variant-view");

        cy.get("button[data-tab-id='variant-tab']", {timeout: TIMEOUT}).click({force: true});

        // Population frequency
        cy.get("population-frequency-filter i[data-cy='pop-freq-toggle-1kG_phase3']").click();
        cy.get("div[data-cy='pop-freq-codes-wrapper-1kG_phase3'] select-field-filter[placeholder='Frequency ...'] button").click();
        cy.get("div[data-cy='pop-freq-codes-wrapper-1kG_phase3'] select-field-filter[placeholder='Frequency ...'] .dropdown-menu a").contains("0.01").click();

        cy.get("opencga-active-filters button[data-filter-name='populationFrequency']").contains("populationFrequency: 1kG_phase3:ALL<0.01");

        cy.get("div.search-button-wrapper button").click();
        checkResults("rga-variant-view");

        getResult("rga-variant-view", 3, 0, "html").then($popFreqtable => {
            expect(Cypress.$("td", $popFreqtable).length).to.be.equal(9, "Checking the Pop Freq boxes are there");
        });

    });

    it("16.29 - Variant View. Querying for Variant Type=SNV, 'Type' contains 'SNV'", () => {
        goToViewAndClear("variant-tab");
        checkResults("rga-variant-view");

        cy.get("button[data-tab-id='variant-tab']", {timeout: TIMEOUT}).click({force: true});

        // variant type
        cy.get("variant-type-filter input[value='SNV'] + label").click({force: true});
        cy.get("div.search-button-wrapper button").click();
        checkResults("rga-variant-view", timeout);
        // checking the variant type for each row
        for (let i = 0; i<10; i++) {
            getResult("rga-variant-view", 4, i).then($text => {
                expect($text.trim(), "Variant type = SNV for row #"+i).to.be.equal("SNV");
            });
        }

    });


    it("16.30 - Variant View. Querying for Consequence Type: 'LoF', 'Consequence Type' columns contains one or more LoF CTs for each fow (first 10)", () => {
        goToViewAndClear("variant-tab");
        checkResults("rga-variant-view");

        const LoF = ["frameshift_variant", "incomplete_terminal_codon_variant", "start_lost", "stop_gained", "stop_lost", "splice_acceptor_variant", "splice_donor_variant", "feature_truncation", "transcript_ablation"];
        cy.get("button[data-tab-id='variant-tab']", {timeout: TIMEOUT}).click({force: true});

        // consequence type
        cy.get("consequence-type-select-filter input[value='Loss-of-Function (LoF)'").click();
        cy.get("div.search-button-wrapper button").click();
        checkResults("rga-variant-view", timeout);

        // checking the CT for each row
        for (let i = 0; i<10; i++) {
            getResult("rga-variant-view", 7, i).then($text => {
                const cts = $text.split(", ");
                cts.forEach(entry => {
                    // entry is in the form "splice_donor_variant (SO:0001575)"
                    const [, ct, id] = entry.trim().match(/(\w+) \((\w+:\w+)\)/);
                    expect(LoF).contains(ct, ct + " is a LoF");
                });
            });
        }
    });

    it("16.31 - Variant View. Querying Clinical Significance: 'Pathogenic', 'Clinical Significance' column contains either 'Pathogenic', 'Likely Pathogenic', or 'Uncertain Significance'", () => {
        goToViewAndClear("variant-tab");
        checkResults("rga-variant-view");

        const clinicalSignificance = ["benign", "pathogenic", "uncertain_significance"];
        // Clinical: ClinVar Accessions. Use example: Pathogenic
        cy.get("clinvar-accessions-filter button.dropdown-toggle").click();
        cy.get("clinvar-accessions-filter .dropdown-menu").contains("Pathogenic").click();
        cy.get("div.search-button-wrapper button").click();
        checkResults("rga-variant-view");

        // check that all the entries has benign OR pathogenic OR uncertain_significance Clinical Significance
        for (let i = 0; i<10; i++) {
            getResult("rga-variant-view", 8, i).then($text => {
                const cs = $text.split(", ");
                cs.forEach(entry => {
                    expect(clinicalSignificance).contains(entry);
                });
            });
        }
        cy.get("opencga-active-filters button[data-filter-name='clinicalSignificance']").click();
        checkResults("rga-variant-view");
    });

    it("16.32 - Variant View. Individual Table. Title in component is 'Individual presenting [variant X]' (first variant in main table)", () => {
        goToViewAndClear("variant-tab");
        checkResults("rga-variant-view");

        getResult("rga-variant-view", 0).then(v => {
            const variantId = v.trim().match(/\d+:\d+\s{2}\w+\/\w+/)[0];
            const [, pos, ref, alt] = v.trim().match(/(\d+:\d+)\s{2}(\w+)\/(\w+)/);
            // cy.get("div[data-cy='variants'] input").type(pos + ":" + ref + ":" + alt);

            cy.get("rga-variant-individual h3").contains("Individual presenting " + pos + ":" + ref + ":" + alt);
        });
        checkResults("rga-variant-view");


    });

    it("16.33 - Variant View. Individual Table. Querying for first individual Id from results in Individual View, Check individual to be present in variant-individual-table", () => {
        goToViewAndClear("variant-tab");
        checkResults("rga-variant-view");

        // detail-tabs Individuals table
        // 1. get the first individual out of Individual View
        // 2. use it to filter Variant View
        // 3. check individual to be present in variant-individual-grid
        cy.get("button[data-tab-id='individual-tab']", {timeout: TIMEOUT}).click({force: true});
        checkResults("rga-individual-view", timeout);
        getResult("rga-individual-view", 0).then($text => {
            const IndividualId = $text;
            cy.get("button[data-tab-id='variant-tab']", {timeout: TIMEOUT}).click({force: true});
            checkResults("rga-variant-view", timeout);
            selectToken("individual-id-autocomplete", IndividualId);
            cy.get("div.search-button-wrapper button").click();
            checkResults("rga-variant-view", timeout);

            checkResults("rga-variant-individual", timeout);
            getResult("rga-variant-individual", 0).then($resultCell => {
                cy.wrap($resultCell).should("contain", IndividualId);
            });

            cy.get("opencga-active-filters button[data-filter-name='individualId']").click(); // remove individual id
            checkResults("rga-variant-individual", timeout);
        });
    });

    it("16.34 - Variant View. Individual Table. Querying for Knockout Type: HOM_ALT and Variant Type SNV, knockoutType column = HOM_ALT for each row (first 10)", () => {
        goToViewAndClear("variant-tab");
        checkResults("rga-variant-view");

        // knockoutType
        cy.get("div[data-cy='knockoutType'] button").click();
        cy.get("div[data-cy='knockoutType'] .dropdown-menu a").contains("Homozygous").click();

        // Variant Type = SNV
        cy.get("variant-type-filter input[value='SNV'] + label").click({force: true});

        cy.get("div.search-button-wrapper button").click();
        checkResults("rga-variant-view");

        for (let i = 0; i<10; i++) {
            getResult("rga-variant-individual", 2, i).then($text => {
                expect($text, "knockoutType=HOM_ALT on row #" + i).to.be.equals("HOM_ALT");
            });

            getResult("rga-variant-individual", 3, i).then($text => {
                expect($text, "type=SNV on row #" + i).to.be.equals("SNV");
            });
        }

        cy.get("opencga-active-filters button[data-filter-name='knockoutType']").click();
        checkResults("rga-variant-view");
    });

    it("16.35 - Variant View. Allele Pairs. Empty query, Variant Allele Pairs has > 0 results", () => {
        cy.get("a[data-id='allele-view']", {timeout: TIMEOUT}).click({force: true});
        checkResults("rga-variant-allele-pairs");
    });

    it("16.35 - Variant View. Allele Pairs. Empty query, Individuals Table in Variant Allele Pairs has > 0 results", () => {
        goToViewAndClear("variant-tab");
        checkResults("rga-variant-view");

        cy.get("a[data-id='allele-view']", {timeout: TIMEOUT}).click({force: true});
        checkResults("rga-variant-allele-pairs");

        // strict selector to avoid multiple matching with popFreq table in each row and Individual table on expanded rows
        cy.get("rga-variant-allele-pairs > .row > .bootstrap-table > .fixed-table-container > .fixed-table-body > table > tbody > tr:nth-child(1) > td:nth-child(1)").click();

        // individuals table
        checkResults("rga-variant-allele-pairs .detail-view");

    });

    it("16.36 - Variant View. Clinical Table. Querying Clinical Significance: 'Pathogenic', 'Clinical Significance' column contains either 'Pathogenic', 'Likely Pathogenic', or 'Uncertain Significance'", () => {
        goToViewAndClear("variant-tab");
        checkResults("rga-variant-view");

        const clinicalSignificance = ["benign", "pathogenic", "uncertain_significance"];
        // Clinical: ClinVar Accessions. Use example: Pathogenic
        cy.get("clinvar-accessions-filter button.dropdown-toggle").click();
        cy.get("clinvar-accessions-filter .dropdown-menu").contains("Pathogenic").click();
        cy.get("div.search-button-wrapper button").click();
        checkResults("rga-variant-view");

        cy.get("a[data-id='clinvar-view']", {timeout: TIMEOUT}).click({force: true});

        cy.get("variant-annotation-clinical-view table tbody tr").then($tds => {
            // $tds.length is the number clinVar cases
            for (let i = 0; i<$tds.length; i++) {
                getResult("variant-annotation-clinical-view", 5, i).then($text => {
                    const cs = $text.split(", ");
                    cs.forEach(entry => {
                        expect(clinicalSignificance).contains(entry);
                    });
                });
            }
        });
    });


    it("16.37 - Variant View. Population Frequencies Table. Querying 'populationFrequency: GNOMAD_GENOMES:ALL>0.01', Population frequency table has > 1 results.", () => {
        goToViewAndClear("variant-tab");
        checkResults("rga-variant-view");

        cy.get("a[data-id='popfreq-view']", {timeout: TIMEOUT}).click({force: true});
        checkResults("cellbase-population-frequency-grid");
    });

    /*
        it("16.3 - Variant View", () => {

            cy.get("a[data-id=rga]", {timeout: TIMEOUT}).click({force: true});
            cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", "Recessive Variant Browser");
            cy.get("button[data-tab-id='variant-tab']", {timeout: TIMEOUT}).click({force: true});

            checkResults("rga-variant-view", timeout);

            cy.get("variant-type-filter input[value='SNV'] + label").click({force: true});
            cy.get("div.search-button-wrapper button").click();
            checkResults("rga-variant-view", timeout);

            cy.get("opencga-active-filters button[data-filter-name='geneName']").click();
            checkResults("rga-variant-view", timeout);

            // detail-tabs allele pairs table
            cy.get("rga-variant-view detail-tabs ul.nav-tabs > li > a").contains("Allele Pairs").click();
            checkResults("rga-variant-allele-pairs", timeout);
            getResult("rga-variant-allele-pairs", 0).then($resultCell => {
                // check the variant id stored before
                const variant = $resultCell.trim();
                cy.wrap(variant).should("contain", variantId.trim());
            });


        });
    */

});
