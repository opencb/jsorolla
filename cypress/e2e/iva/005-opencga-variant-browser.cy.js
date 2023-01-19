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
import UtilsTest from "../../support/UtilsTest.js";

context("5. Variant Browser", () => {
    before(() => {
        UtilsTest.login();
        UtilsTest.goTo("iva");
    });

    beforeEach(() => {
        cy.get("a[data-id=browser]", {timeout: TIMEOUT}).click({force: true});
    });

    it("5.1 Columns Visibility", () => {
        cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", "Variant Browser");

        UtilsTest.checkResults("variant-browser-grid");

        cy.get("variant-browser-grid .columns-toggle-wrapper button").should("be.visible").and("contain", "Columns").click();
        cy.get("variant-browser-grid .columns-toggle-wrapper ul li").and("have.length.gt", 1);

        cy.get("variant-browser-grid .columns-toggle-wrapper ul li a").click({multiple: true, timeout: TIMEOUT}); // deactivate all the columns
        cy.get("variant-browser-grid .bootstrap-table .fixed-table-container thead > tr:first-child > th", {timeout: TIMEOUT}).should("have.lengthOf", 6); // testing the first level of the header

        cy.get("variant-browser-grid .columns-toggle-wrapper ul li a").click({multiple: true, timeout: TIMEOUT}); // reactivate all the columns
        cy.get("variant-browser-grid .bootstrap-table .fixed-table-container thead > tr:first-child > th", {timeout: TIMEOUT}).should("have.lengthOf", 10);

    });

    // Variant Browser: Filter controls
    it("5.2 Create/Delete canned filter", () => {
        cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", "Variant Browser");

        cy.get("input[value*=LoF]").click({force: true});
        cy.get("opencga-active-filters").contains("Consequence Types 9");

        cy.get("button[data-cy='filter-button']").click({force: true});
        // cy.get("ul.saved-filter-wrapper a").contains("Save filter...").click(); // it also works
        cy.get("ul.saved-filter-wrapper a[data-action='active-filter-save']").contains("Save current filter").click();

        const name = UtilsTest.randomString(5);
        // cy.get("input[data-cy='modal-filter-name']").type(name); // TODO Cypress doesn't type the entire string. https://github.com/cypress-io/cypress/issues/5480  invoke("val") is a workaround
        cy.get("input[data-cy='modal-filter-name']").invoke("val", name);
        cy.get("input[data-cy='modal-filter-description']").type(UtilsTest.randomString(3));
        cy.get("button[data-cy='modal-filter-save-button']").click(); // confirm save

        cy.contains(".notification-manager .alert", "Filter has been saved", {timeout: TIMEOUT}).should("be.visible");
        cy.get(".active-filter-label").click();
        cy.get("ul.saved-filter-wrapper").contains(name);
        cy.get(`span.action-buttons i[data-cy=delete][data-filter-id='${name}']`).click();
        cy.get(".swal2-title").contains("Are you sure?");
        cy.get(".swal2-confirm").click(); // confirm deletion action

        cy.contains(".notification-manager .alert", "Filter has been deleted", {timeout: TIMEOUT}).should("be.visible");
        // cy.get(".swal2-confirm").click({force: true}); // dismiss confirmation modal
        cy.get("opencga-active-filters button[data-filter-name='ct']").click();
    });

    // Variant Browser: Individual filters
    it("5.3 Pagination", () => {
        cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", "Variant Browser"); // should assertion comes from Chai and it follows its logic
        UtilsTest.checkResults("variant-browser-grid");
        UtilsTest.changePage("variant-browser-grid", 2);
        UtilsTest.checkResults("variant-browser-grid");
        UtilsTest.changePage("variant-browser-grid", 1);
        UtilsTest.checkResults("variant-browser-grid");
    });

    it("5.4 Filters. Study and Cohorts: Cohort Alternate Stats", () => {
        cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", "Variant Browser"); // should assertion comes from Chai and it follows its logic
        cy.get("variant-browser a[href='#filters_tab']").click();
        // Study and Cohorts: Cohort Alternate Stats
        // TODO add condition
        /* cy.get("cohort-stats-filter i[data-cy='study-cohort-toggle']").first({timeout: TIMEOUT}).should("be.visible").click();
        cy.get("cohort-stats-filter input[data-field='value']").first({timeout: TIMEOUT}).type("0.00001"); // set ALL cohort
        cy.get("div.search-button-wrapper button").click();
        checkResults("variant-browser-grid");
        cy.get("opencga-active-filters button[data-filter-name='cohortStatsAlt']").contains("Cohort ALT Stats");
        cy.get("opencga-active-filters button[data-filter-name='cohortStatsAlt']").click();*/

    });

    it("5.5 Filters. Genomic: Genomic Location", () => {
        cy.get("variant-browser-filter a[data-cy-section-title='Genomic']").click();
        cy.get("region-filter textarea").type("1:5000000-10000000");
        cy.get("div.search-button-wrapper button").click();
        UtilsTest.checkResults("variant-browser-grid");
        cy.get("opencga-active-filters button[data-filter-name='region']").contains("Region").click();
        UtilsTest.checkResults("variant-browser-grid");
    });

    it("5.6 Filters. Genomic: Feature IDs", () => {
        UtilsTest.selectToken("feature-filter", "C5", true);
        cy.get("opencga-active-filters").contains("XRef");
        UtilsTest.selectToken("feature-filter", "rs", true);
        cy.get("div.search-button-wrapper button").click();
        UtilsTest.checkResults("variant-browser-grid");
        cy.get("opencga-active-filters button[data-filter-name='xref']").click();
        UtilsTest.checkResults("variant-browser-grid");
    });

    it("5.7 Filters. Genomic: Gene Biotype", () => {
        // Genomic: Gene Biotype
        cy.get("biotype-filter button").click();
        cy.get("biotype-filter input[type='search']").type("protein"); // typing protein_coding using autocomplete
        cy.get("biotype-filter div.dropdown-menu").find("a").should("have.length", 1);
        cy.get("biotype-filter div.dropdown-menu a").click();
        cy.get("div.search-button-wrapper button").click();
        UtilsTest.checkResults("variant-browser-grid");
        cy.get("opencga-active-filters button[data-filter-name='biotype']").click();
        UtilsTest.checkResults("variant-browser-grid");
    });

    it("5.8 Filters. Genomic: Variant", () => {
        // Genomic: Variant type cy.get('.magic-checkbox-wrapper > :nth-child(1) > label')
        cy.get("variant-type-filter input[value='SNV'] + label").click({force: true});
        cy.get("div.search-button-wrapper button").click();
        UtilsTest.checkResults("variant-browser-grid");
        cy.get("opencga-active-filters button[data-filter-name='type']").click();
        UtilsTest.checkResults("variant-browser-grid");
    });

    it("5.9 Filters. Consequence type: LoF", () => {
        // Consequence type: SO Term - LoF Enabled
        cy.get("variant-browser-filter a[data-cy-section-title='ConsequenceType']").click();
        cy.get("consequence-type-select-filter input[value='Loss-of-Function (LoF)'").click({force: true});
        cy.get("div.search-button-wrapper button").click();
        UtilsTest.checkResults("variant-browser-grid");
    });

    it("5.10 Filters. Consequence type: Missense", () => {
        // Consequence type: SO Term - Use example: Missense
        cy.get("consequence-type-select-filter button").click();
        cy.get("consequence-type-select-filter input[type='search']").type("miss"); // typing missense using autocomplete
        cy.get("consequence-type-select-filter div.dropdown-menu").find("a").should("have.length", 1);
        cy.get("consequence-type-select-filter div.dropdown-menu a").click();
        cy.get("div.search-button-wrapper button").click();
        UtilsTest.checkResults("variant-browser-grid");
        cy.get("opencga-active-filters button[data-filter-name='ct']").click();
        UtilsTest.checkResults("variant-browser-grid");
    });

    it("5.11 Filters. Population Frequency: 1000 Genomes - AFR < 0.0001 AND EUR > 0.0001", () => {
        // Population Frequency: 1000 Genomes - AFR < 0.0001 AND EUR > 0.0001
        cy.get("variant-browser-filter a[data-cy-section-title='PopulationFrequency']").click();
        cy.get("population-frequency-filter i[data-cy='pop-freq-toggle-1kG_phase3']").click();
        cy.get("population-frequency-filter div[data-cy='pop-freq-codes-wrapper-1kG_phase3']").should("be.visible");
        cy.get("population-frequency-filter div[data-cy='pop-freq-codes-wrapper-1kG_phase3'] div[data-cy='number-field-filter-wrapper-AFR'] input[data-field='value']").type("0.0001");
        // cy.get("population-frequency-filter div[data-cy='pop-freq-codes-wrapper-1kG_phase3'] div[data-cy='number-field-filter-wrapper-AFR'] select-field-filter button").click();
        // cy.get("population-frequency-filter div[data-cy='pop-freq-codes-wrapper-1kG_phase3'] div[data-cy='number-field-filter-wrapper-AFR'] select-field-filter div.dropdown-menu").find("li").contains(">").click();
        cy.get("population-frequency-filter div[data-cy='pop-freq-codes-wrapper-1kG_phase3'] div[data-cy='number-field-filter-wrapper-EUR'] input[data-field='value']").type("0.0001");
        cy.get("population-frequency-filter div[data-cy='pop-freq-codes-wrapper-1kG_phase3'] div[data-cy='number-field-filter-wrapper-EUR'] select-field-filter button").click();
        cy.get("population-frequency-filter div[data-cy='pop-freq-codes-wrapper-1kG_phase3'] div[data-cy='number-field-filter-wrapper-EUR'] select-field-filter div.dropdown-menu").find("li").contains(">").click();
        cy.get("div.search-button-wrapper button").click();
        UtilsTest.checkResults("variant-browser-grid");
        cy.get("opencga-active-filters button[data-filter-name='populationFrequencyAlt']").click();
        UtilsTest.checkResults("variant-browser-grid");
    });

    it("5.12 Filters. Population Frequency: gnomAD - Set all < 0.00001", () => {
        // Population Frequency: gnomAD - Set all < 0.00001
        cy.get("population-frequency-filter i[data-cy='pop-freq-toggle-GNOMAD_GENOMES']").click();
        cy.get("population-frequency-filter div[data-cy='pop-freq-codes-wrapper-GNOMAD_GENOMES']").should("be.visible");
        cy.get("population-frequency-filter div[data-cy='pop-freq-codes-wrapper-GNOMAD_GENOMES'] div[data-cy='number-field-filter-wrapper-AFR'] input[data-field='value']").type("0.0001");
        cy.get("div.search-button-wrapper button").click();
        UtilsTest.checkResults("variant-browser-grid");
        cy.get("opencga-active-filters button[data-filter-name='populationFrequencyAlt']").click();
        UtilsTest.checkResults("variant-browser-grid");
    });

    it("5.13 Filters. Clinical: Disease Panels", () => {
        cy.get("variant-browser-filter a[data-cy-section-title='Clinical']").click();

        // Clinical: Disease Panels
        cy.get("disease-panel-filter").find(" a").contains("Childhood onset dystonia or chorea or related movement disorder").click({force: true}); // URI too long
        cy.get("disease-panel-filter").find(" a").contains("Amelogenesis imperfecta").click({force: true});
        cy.get("div.search-button-wrapper button").click();

        UtilsTest.checkResultsOrNot("variant-browser-grid");

        // Test ALL Panels
        // NOTE Covid19... is the first URI too long
        /* cy.get("disease-panel-filter div.dropdown-menu a").each(el => {

            // cannot use cy.wrap(el) here. disease-panel-filter div.dropdown-menu is refreshed on click on buttons and DOM refs are broken (https://github.com/cypress-io/cypress/issues/7306)
            const id = el.attr("id");
            cy.get("#" + id).should("exist").click({force: true});
            //cy.wrap(el).should("exist").click({force: true});
            cy.get("div.search-button-wrapper button").click();
            checkResultsOrNot("variant-browser-grid");
            cy.wait(2000);
            cy.get("opencga-active-filters button[data-filter-name='panel']").click();
        });*/
        cy.get("opencga-active-filters button[data-filter-name='panel']").click();

    });

    it("5.14 Filters. Clinical and Disease: Clinical Annotation: Pathogenic", () => {
        // Clinical: ClinVar Accessions. Use example: Pathogenic
        cy.get("clinical-annotation-filter div[data-cy='clinical-significance'] button.dropdown-toggle").click();
        cy.get("clinical-annotation-filter div[data-cy='clinical-significance'] .dropdown-menu").contains("Pathogenic").click();
        cy.get("div.search-button-wrapper button").click();
        UtilsTest.checkResults("variant-browser-grid");
        cy.get("opencga-active-filters button[data-filter-name='clinicalSignificance']").click();
        UtilsTest.checkResults("variant-browser-grid");
    });

    it("5.15 Filters. Clinical and Disease: Full text: Mortality", () => {
        // Clinical and Disease: Full text. Use example: Mortality
        cy.get("fulltext-search-accessions-filter textarea").type("Mortality");
        // cy.get("fulltext-search-accessions-filter textarea").type("centroid");
        cy.get("div.search-button-wrapper button").click();
        UtilsTest.checkResults("variant-browser-grid");
        cy.get("opencga-active-filters button[data-filter-name='traits']").click();
        UtilsTest.checkResults("variant-browser-grid");
    });

    it("5.16 Filters. GO and HPO", () => {
        cy.get("[data-cy-section-title=Phenotype]").click();

        // GO
        UtilsTest.selectToken("go-accessions-filter", "dopamine", true); // "dopamine secretion" exchange factor activity
        cy.get("opencga-active-filters button[data-filter-name='go']").contains("GO:0014046");
        UtilsTest.removeToken("go-accessions-filter", "GO:0014046");

        // HPO
        cy.get("[data-cy-section-id=Phenotype]")
            .then($div => {
                // HPO filter is visible
                if (Cypress.$(".subsection-content[data-cy='hpo']", $div).length) {
                    UtilsTest.selectToken("hpo-accessions-filter", "Ovarian", true); // Ovariant thecoma
                    cy.get("opencga-active-filters button[data-filter-name='annot-hpo']").contains("HP:0030983");
                    UtilsTest.removeToken("hpo-accessions-filter", "HP:0030983");
                }
            });
    });

    it("5.17 Filters. Deleteriousness: Sift / Polyphen - OR operation", () => {
        // Deleteriousness: Sift / Polyphen - OR operation
        cy.get("variant-browser-filter a[data-cy-section-title='Deleteriousness']").click();
        cy.get("protein-substitution-score-filter .sift .score-comparator .select-field-filter").click();
        cy.get("protein-substitution-score-filter .sift .score-comparator .dropdown-menu").contains("<").click();
        cy.get("protein-substitution-score-filter .sift .score-value input[type='number']").type("0.1");

        cy.get("protein-substitution-score-filter .polyphen .score-comparator .select-field-filter").click();
        cy.get("protein-substitution-score-filter .polyphen .score-comparator .dropdown-menu").contains("≤").click();
        cy.get("protein-substitution-score-filter .polyphen .score-value input[type='number']").type("0.1");

        cy.get("div.search-button-wrapper button").click();
        UtilsTest.checkResults("variant-browser-grid");
        cy.get("opencga-active-filters button[data-filter-name='proteinSubstitution']").click();
        UtilsTest.checkResults("variant-browser-grid");
    });

    it("5.18 Filters. Deleteriousness: Sift / Polyphen - AND operation", () => {
        // Deleteriousness: Sift / Polyphen - AND operation
        cy.get("protein-substitution-score-filter .sift .score-select .dropdown .btn").click();
        cy.get("protein-substitution-score-filter .sift .score-select .dropdown a").contains("Tolerated").click();
        cy.get("protein-substitution-score-filter .polyphen .score-select .dropdown .btn").click();
        cy.get("protein-substitution-score-filter .polyphen .score-select .dropdown a").contains("Possibly damaging").click();

        cy.get("protein-substitution-score-filter .rating-label-and").click();
        cy.get("div.search-button-wrapper button").click();
        UtilsTest.checkResults("variant-browser-grid");
        cy.get("opencga-active-filters button[data-filter-name='proteinSubstitution']").click();
        UtilsTest.checkResults("variant-browser-grid");
    });

    it("5.19 Filters. Conservation: PhyloP", () => {
        cy.get("variant-browser-filter")
            .then($div => {
                // Conservation Score is visible
                if (Cypress.$("div[data-cy-section-id='Conservation']", $div).length) {
                    // Conservation: PhyloP Use example
                    cy.get("variant-browser-filter a[data-cy-section-title='Conservation']").click();
                    cy.get("conservation-filter .cf-phylop input[type='text']").type("1");
                    cy.get("conservation-filter .cf-phastCons input[type='text']").type("1");
                    cy.get("div.search-button-wrapper button").click();
                    UtilsTest.checkResults("variant-browser-grid");
                    cy.get("opencga-active-filters button[data-filter-name='conservation']").click();
                    UtilsTest.checkResults("variant-browser-grid");
                } else {
                    cy.get("div[data-cy-section-id='Conservation']").should("not.exist");
                }
            });
    });

    it("5.20 Check gene-view", () => {
        cy.get("button[data-id='table-tab']", {timeout: TIMEOUT}).click();
        cy.get("variant-browser-grid .bootstrap-table .fixed-table-container tr[data-index='0'] a.gene-tooltip:first-child")
            .should("be.visible", {timeout: TIMEOUT})
            .click({force: true});
        // .trigger('mouseover'); // .trigger('mouseover') doesn't work in this case as the hover action changes the DOM
        cy.get(".qtip-content").find("a[data-cy='gene-view']").click({force: true});
        cy.get("div.page-title h2").contains(/Gene [a-z0-9:]+/gim);
    });

    // Variant Browser: Tabs
    it("5.21 checks Variant Browser detail tabs", () => {

        cy.get("variant-browser-detail > detail-tabs > div.panel > h3", {timeout: TIMEOUT}).should("contain", "Variant:");

        cy.get("cellbase-variant-annotation-summary h3").contains("Summary");

        cy.get("variant-browser-detail [data-id='annotationConsType']").click();
        UtilsTest.checkResults("variant-consequence-type-view");

        cy.get("variant-browser-detail [data-id='annotationPropFreq']").click();

        cy.wait(1000);
        cy.get("cellbase-population-frequency-grid")
            .then($div => {
                // check CB data are available
                if (Cypress.$("div[data-cy='cellbase-population-frequency-table']", $div).length) {
                    UtilsTest.checkResultsOrNot("cellbase-population-frequency-grid");
                } else {
                    cy.get("cellbase-population-frequency-grid .alert-info").contains("No population frequencies found");
                }
            });


        cy.get("variant-browser-detail [data-id='annotationClinical']").click();
        UtilsTest.checkResultsOrNot("variant-annotation-clinical-view");

        cy.get("variant-browser-detail [data-id='cohortStats']").click();
        UtilsTest.checkResultsOrNot("variant-cohort-stats-grid");

        cy.get("variant-browser-detail [data-id='samples']").click();
        UtilsTest.checkResults("variant-samples");

        cy.get("variant-browser-detail [data-id='beacon']").click();
        cy.get("variant-beacon-network", {timeout: TIMEOUT}).find(".beacon-square").its("length").should("eq", 15);
    });

    it("5.22 aggregated query", () => {

        cy.get("variant-browser-filter a[data-cy-section-title='ConsequenceType']").click();
        cy.get("consequence-type-select-filter input[value='Loss-of-Function (LoF)'").click({force: true});

        cy.get("a[href='#facet_tab']").click({force: true});

        UtilsTest.vfacet.selectDefaultFacet();
        // cy.get("button.default-facets-button").click(); // default facets selection (chromosome, type)

        UtilsTest.facet.select("Gene");
        // cy.get("facet-filter .facet-selector li a").contains("Gene").click({force: true}); // gene facets selection

        cy.get("#type_Select a").contains("INSERTION").click({force: true}); // type=INSERTION
        UtilsTest.Facet.checkActiveFacet("type", "type[INSERTION]");
        // cy.get("div.facet-wrapper button[data-filter-name='type']").contains("type[INSERTION]");

        UtilsTest.Facet.checkActiveFacetLength(3);
        cy.get("div.search-button-wrapper button").click();
        UtilsTest.facet.checkResultLength(3);
        // cy.get("opencb-facet-results", {timeout: 120000}).find("opencga-facet-result-view", {timeout: TIMEOUT}).should("have.lengthOf", 3); // 2 default fields + genes

        UtilsTest.facet.select("Chromosome"); // removing chromosome
        UtilsTest.facet.checkActiveFacetLength(2);
        cy.get("div.search-button-wrapper button").click();
        UtilsTest.facet.checkResultLength(2);

        UtilsTest.facet.removeActive("type");
        UtilsTest.facet.checkResultLength(1);
        UtilsTest.facet.removeActive("genes");
        UtilsTest.facet.checkResultLength(0);

    });
});
