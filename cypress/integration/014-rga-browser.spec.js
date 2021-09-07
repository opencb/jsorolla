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

import {login, goTo, getResult, checkResults, checkResultsOrNot} from "../plugins/utils.js";
import {TIMEOUT} from "../plugins/constants.js";


context("14 - RGA Browser", () => {
    before(() => {
        login();
        goTo("iva");
    });
    /* "geneName",
        "IndividualId",
        "numParents",
        "cohort",
        "populationFrequencyAlt",
        "type",
        "consequenceType",
        "clinicalSignificance"*/
    it("14.1 - Gene View", () => {
        cy.get("a[data-id=rga]", {timeout: TIMEOUT}).click({force: true});
        cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", "Recessive Variant Browser");
        cy.get("button[data-tab-id='gene-tab']", {timeout: TIMEOUT}).click({force: true});

        cy.get("rga-gene-view .columns-toggle-wrapper button").should("be.visible").and("contain", "Columns").click();
        cy.get("rga-gene-view .columns-toggle-wrapper ul li").and("have.length.gt", 1);

        cy.get("rga-gene-view .columns-toggle-wrapper ul li a").click({multiple: true, timeout: TIMEOUT}); // deactivate all the columns
        cy.get("rga-gene-view .bootstrap-table .fixed-table-container tr[data-index=0] > td", {timeout: TIMEOUT}).should("have.lengthOf", 0);

        cy.get("rga-gene-view .columns-toggle-wrapper ul li a").click({multiple: true, timeout: TIMEOUT}); // reactivate all the columns
        cy.get("rga-gene-view .bootstrap-table .fixed-table-container tr[data-index=0] > td", {timeout: TIMEOUT}).should("have.length.gt", 1);

        checkResults("rga-gene-view");

        // gene Name
        // queries for the first gene and then check if the first result contains the gene.
        let geneName;
        getResult("rga-gene-view", 0).then($text => {
            geneName = $text;
            cy.get("feature-filter input[type='text']").type(geneName);
            cy.get("feature-filter ul.dropdown-menu li").should("have.lengthOf", 1);

            // occasionally fails
            // Timed out retrying after 4050ms: cy.click() failed because this element is detached from the DOM.
            // <a class="dropdown-item" href="#" role="option">DMKN</a>
            cy.wait(500);
            cy.get("feature-filter ul.dropdown-menu li.active a").click({force: true});
            cy.get("div.search-button-wrapper button").click();

            checkResults("rga-gene-view");
            getResult("rga-gene-view", 0).then($resultCell => {
                cy.wrap($resultCell).should("contain", geneName);

            });
        });

        // knockoutType
        cy.get("section-filter#Gene div[data-cy='knockoutType'] button").click();
        cy.get("section-filter#Gene div[data-cy='knockoutType'] .dropdown-menu a").contains("COMP_HET").click();
        cy.get("div.search-button-wrapper button").click();
        checkResults("rga-gene-view");

        // set numParents=2
        cy.get("section-filter#Confidence .magic-checkbox-wrapper > :nth-child(3) > label").click();
        cy.get("div.search-button-wrapper button").click();
        checkResults("rga-gene-view");

        // checking the number of CH Definite is > 0 (the current query is geneName=XXX,knockoutType=COMP_HET,numParents=2)
        getResult("rga-gene-view", 3).then($CHDefiniteNum => {
            // expect($div.text().trim()).gt(0)
            assert.isAbove(Number($CHDefiniteNum), 0, "Results");
        });

        // cy.get("opencga-active-filters button[data-filter-name='knockoutType']").click();

        cy.get("button.active-filter-label").click();
        cy.get("a[data-action='active-filter-clear']").click();
        checkResults("rga-gene-view");

    });
    it("14.2 - Individual View", () => {
        cy.get("a[data-id=rga]", {timeout: TIMEOUT}).click({force: true});
        cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", "Recessive Variant Browser");
        cy.get("button[data-tab-id='individual-tab']", {timeout: TIMEOUT}).click({force: true});

        checkResults("rga-individual-view");

        cy.get("rga-individual-view .columns-toggle-wrapper button").should("be.visible").and("contain", "Columns").click();
        cy.get("rga-individual-view .columns-toggle-wrapper ul li").and("have.length.gt", 1);

        cy.get("rga-individual-view .columns-toggle-wrapper ul li a").click({multiple: true, timeout: TIMEOUT}); // deactivate all the columns
        cy.get("rga-individual-view .bootstrap-table .fixed-table-container tr[data-index=0] > td", {timeout: TIMEOUT}).should("have.lengthOf", 1);

        cy.get("rga-individual-view .columns-toggle-wrapper ul li a").click({multiple: true, timeout: TIMEOUT}); // reactivate all the columns
        cy.get("rga-individual-view .bootstrap-table .fixed-table-container tr[data-index=0] > td", {timeout: TIMEOUT}).should("have.length.gt", 1);

        // queries for the first gene and then check if the first result contains the gene.
        let IndividualId;
        getResult("rga-individual-view", 0).then($text => {
            IndividualId = $text;
            console.log("IndividualId i", IndividualId);
            cy.get("div[data-cy='individualId'] input[type='text']").type(IndividualId + "{enter}");
            cy.get("div.search-button-wrapper button").click();
            checkResults("rga-individual-view");

            getResult("rga-individual-view", 0).then($resultCell => {
                console.log("$resultCell", $resultCell);
                cy.wrap($resultCell).should("contain", IndividualId);

            });

            // check detail-tabs family table
            // ensure `IndividualId` is present in table header
            cy.get("rga-individual-family table > thead > :nth-child(1) > :nth-child(7) > .th-inner").contains(IndividualId);

        });
        cy.get("button.active-filter-label").click();
        cy.get("a[data-action='active-filter-clear']").click();
        checkResults("rga-individual-view");

    });
    it("14.3 - Variant View", () => {
        cy.get("a[data-id=rga]", {timeout: TIMEOUT}).click({force: true});
        cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", "Recessive Variant Browser");
        cy.get("button[data-tab-id='variant-tab']", {timeout: TIMEOUT}).click({force: true});

        checkResults("rga-variant-view");

        cy.get("rga-variant-view > .container-fluid .columns-toggle-wrapper button").should("be.visible").and("contain", "Columns").click();
        cy.get("rga-variant-view > .container-fluid .columns-toggle-wrapper ul li").and("have.length.gt", 1);

        cy.get("rga-variant-view > .container-fluid .columns-toggle-wrapper ul li a").click({multiple: true, timeout: TIMEOUT}); // deactivate all the columns
        cy.get("rga-variant-view > .container-fluid > .row .bootstrap-table .fixed-table-container tr[data-index=0] > td", {timeout: TIMEOUT}).should("have.lengthOf", 0);

        cy.get("rga-variant-view > .container-fluid .columns-toggle-wrapper ul li a").click({multiple: true, timeout: TIMEOUT}); // reactivate all the columns
        cy.get("rga-variant-view > .container-fluid > .row .bootstrap-table .fixed-table-container tr[data-index=0] > td", {timeout: TIMEOUT}).should("have.length.gt", 1);

        cy.get("button.active-filter-label").click();
        cy.get("a[data-action='active-filter-clear']").click();

        checkResults("rga-variant-view");

        let variantId;
        // region
        getResult("rga-variant-view", 0).then(vId => {
            variantId = vId;
            const region = variantId.trim().match(/\d+:\d+/)[0];
            cy.get("region-filter textarea").type(region);
            cy.get("div.search-button-wrapper button").click();
            checkResults("rga-variant-view");
            getResult("rga-variant-view", 0).then($resultCell => {
                cy.wrap($resultCell).should("contain", region);

            });
        });

        cy.get("opencga-active-filters button[data-filter-name='region']").click();
        checkResults("rga-variant-view");

        // gene Name
        // queries for the first gene and then check if the first result contains the gene.
        let geneName = "";
        getResult("rga-variant-view", 1).then($text => {
            geneName = $text.split(",")[0];
            cy.get("feature-filter input[type='text']").type(geneName);
            cy.get("feature-filter ul.dropdown-menu li").should("have.lengthOf", 1);

            // occasionally fails
            // Timed out retrying after 4050ms: cy.click() failed because this element is detached from the DOM.
            // <a class="dropdown-item" href="#" role="option">DMKN</a>
            cy.wait(500);
            cy.get("feature-filter ul.dropdown-menu li.active a").click({force: true});
            cy.get("div.search-button-wrapper button").click();

            checkResults("rga-variant-view");
            getResult("rga-variant-view", 1).then($resultCell => {
                cy.wrap($resultCell).should("contain", geneName);
            });
        });

        cy.get("opencga-active-filters button[data-filter-name='geneName']").click();
        checkResults("rga-variant-view");

        // detail-tabs allele pairs table
        cy.get("rga-variant-view detail-tabs ul.nav-tabs > li > a").contains("Allele Pairs").click();
        checkResults("rga-variant-allele-pairs");
        getResult("rga-variant-allele-pairs", 0).then($resultCell => {
            // check the variant id stored before
            cy.wrap($resultCell).should("contain", variantId);
        });

        // detail-tabs Individuals table
        // 1. get the first individual out of Individual View
        // 2. use it to filter Variant View
        // 3. check individual to be present in variant-individual-grid
        cy.get("button[data-tab-id='individual-tab']", {timeout: TIMEOUT}).click({force: true});
        checkResults("rga-individual-view");
        let IndividualId= "";
        getResult("rga-individual-view", 0).then($text => {
            IndividualId = $text;
            cy.get("button[data-tab-id='variant-tab']", {timeout: TIMEOUT}).click({force: true});
            checkResults("rga-variant-view");
            cy.get("div[data-cy='individualId'] input[type='text']").type(IndividualId + "{enter}");
            cy.get("div.search-button-wrapper button").click();
            checkResults("rga-variant-view");

            checkResults("rga-variant-individual-grid");
            getResult("rga-variant-individual-grid", 0).then($resultCell => {
                cy.wrap($resultCell).should("contain", IndividualId);
            });
        });
    });
});
