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

import {login, randomString, checkResults, checkResultsOrNot, Facet, changePage, goTo, selectToken, removeToken} from "../plugins/utils.js";
import {TIMEOUT} from "../plugins/constants.js";
import {checkToolHeaderTitle, checkColumnsGridBrowser, clickAllColumnsGridBrowser, checkHeaderGridBrowser} from "../support/utils.js";

context("5. Variant Browser", () => {
    before(() => {
        cy.loginByApi();
        // goTo("iva");
        // cy.visit("index.html#browser");

        // Go to Variant Analysi
        cy.wait(1000);
        cy.get(".hi-icon-wrap > [data-id='iva']", {log: false}).click();
    });

    beforeEach(() => {
        // cy.get("a[data-id=browser]", {timeout: TIMEOUT}).click({force: true});
        // Go to Iva
        cy.get("#bs-example-navbar-collapse-1 > :nth-child(1) > :nth-child(1) > a", {timeout: TIMEOUT, log: false}).click({force: true});
    });

    // good - refactor
    it("5.1 Columns Visibility", () => {
        checkToolHeaderTitle("Variant Browser");
        checkResults("variant-browser-grid");
        checkColumnsGridBrowser("variant-browser-grid");

        // Check is more than 1
        cy.get("variant-browser-grid .columns-toggle-wrapper ul li").and("have.length.gt", 1);

        // deactivate all the columns
        clickAllColumnsGridBrowser("variant-browser-grid");

        // testing the first level of the header
        checkHeaderGridBrowser("variant-browser-grid").should("have.lengthOf", 6);

        // reactivate all the columns
        clickAllColumnsGridBrowser("variant-browser-grid");
        checkHeaderGridBrowser("variant-browser-grid").should("have.lengthOf", 10);

    });

    // Variant Browser: Filter controls
    it("5.2 Create/Delete canned filter", () => {

        checkToolHeaderTitle("Variant Browser");
        cy.sectionFilter("ConsequenceType");
        cy.setConsequenceType("lof", true);

        cy.get("opencga-active-filters").contains("Consequence Types 9");

        cy.get("button[data-cy='filter-button']").click({force: true});
        cy.get("ul.saved-filter-wrapper a[data-action='active-filter-save']")
            .contains("Save current filter")
            .click();

        const name = randomString(5);
        // Wait modal should be visible
        cy.wait(1000);
        cy.get("input[data-cy='modal-filter-name']").type(name);
        cy.get("input[data-cy='modal-filter-description']").type(randomString(3));

        // confirm save
        cy.get("button[data-cy='modal-filter-save-button']").click();

        // Check if saved
        cy.contains(".notification-manager .alert", "Filter has been saved", {timeout: TIMEOUT})
            .should("be.visible");

        cy.get(".active-filter-label").click();

        // If contains filter saved
        cy.get("ul.saved-filter-wrapper").contains(name);

        cy.get(`span.action-buttons i[data-cy=delete][data-filter-id='${name}']`).click();
        cy.get("#myModalLabel").contains("Are you sure?");

        // confirm deletion action
        // cy.get(".modal-content .modal-footer .btn-primary").click();
        cy.get(":nth-child(5) > .modal > .modal-dialog > .modal-content > .modal-footer > .btn-primary").click();

        cy.contains(".notification-manager .alert", "Filter has been deleted", {timeout: TIMEOUT}).should("be.visible");

        // Fix activeFilters is not removing with filter name ct
        cy.removeActiveFilters("ct");
        // cy.get("opencga-active-filters button[data-filter-name='ct']").click({force: true});
    });

    // Variant Browser: Individual filters
    // should assertion comes from Chai and it follows its logic
    it("5.3 Pagination", () => {
        checkToolHeaderTitle("Variant Browser");
        checkResults("variant-browser-grid");
        changePage("variant-browser-grid", 2);
        checkResults("variant-browser-grid");
        changePage("variant-browser-grid", 1);
        checkResults("variant-browser-grid");
    });

    // x
    it("5.4 Filters. Study and Cohorts: Cohort Alternate Stats", () => {
        // should assertion comes from Chai and it follows its logic
        checkToolHeaderTitle("Variant Browser");
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

    // good
    it("5.5 Filters. Genomic: Genomic Location", () => {
        cy.sectionFilter("Genomic");
        cy.setGenomicLocation("1:5000000-10000000");

        // Execute Query
        cy.get("div.search-button-wrapper button").click();
        checkResults("variant-browser-grid");

        // Remove ActiveFilter
        cy.removeActiveFilters("region");
        checkResults("variant-browser-grid");
    });

    // good
    it("5.6 Filters. Genomic: Feature IDs", () => {
        cy.sectionFilter("Genomic");
        cy.setFeatureIds(["C5", "RS1"]);
        cy.get("opencga-active-filters").contains("XRef");
        cy.get("div.search-button-wrapper button").click();
        checkResults("variant-browser-grid");
        cy.removeActiveFilters("xref");
        checkResults("variant-browser-grid");
    });

    // good
    it("5.7 Filters. Genomic: Gene Biotype", () => {
        cy.sectionFilter("Genomic");
        cy.setGeneBiotype("protein_coding");
        cy.get("div.search-button-wrapper button").click();
        checkResults("variant-browser-grid");
        cy.removeActiveFilters("biotype");
        checkResults("variant-browser-grid");
    });

    // good
    it("5.8 Filters. Genomic: Variant", () => {
        cy.sectionFilter("Genomic");
        cy.setVariantType(["SNV"]);
        cy.get("div.search-button-wrapper button").click();
        checkResults("variant-browser-grid");
        cy.removeActiveFilters("type");
        checkResults("variant-browser-grid");
    });

    // good
    it("5.9 Filters. Consequence type: LoF", () => {
        // Consequence type: SO Term - LoF Enabled
        cy.sectionFilter("ConsequenceType");
        cy.setConsequenceType("coding_sequence", "Loss-of-Function (LoF)");
        cy.get("div.search-button-wrapper button").click();
        checkResults("variant-browser-grid");
    });

    // good
    it("5.10 Filters. Consequence type: Missense", () => {
        // Consequence type: SO Term - Use example: Missense
        cy.sectionFilter("ConsequenceType");
        cy.setConsequenceType("terms_manual", ["missense_variant"]);
        cy.get("div.search-button-wrapper button").click();
        checkResults("variant-browser-grid");
        cy.removeActiveFilters("ct");
        checkResults("variant-browser-grid");
    });

    // x
    it.only("5.11 Filters. Population Frequency: 1000 Genomes - AFR < 0.0001 AND EUR > 0.0001", () => {
        // Population Frequency: 1000 Genomes - AFR < 0.0001 AND EUR > 0.0001
        cy.sectionFilter("PopulationFrequency");
        cy.setPopulationFrequency("1000G", "AFR", "<", 0.0001);
        // cy.setPopulationFrequency("1000G", "EUR", ">", 0.0001);

        // cy.get("div.search-button-wrapper button")
        //     .click();
        // checkResults("variant-browser-grid");

        // cy.get("opencga-active-filters button[data-filter-name='populationFrequencyAlt']")
        //     .click();
        // checkResults("variant-browser-grid");

        // cy.get("population-frequency-filter div[data-cy='pop-freq-codes-wrapper-1kG_phase3'] div[data-cy='number-field-filter-wrapper-AFR'] select-field-filter button").click();
        // cy.get("population-frequency-filter div[data-cy='pop-freq-codes-wrapper-1kG_phase3'] div[data-cy='number-field-filter-wrapper-AFR'] select-field-filter div.dropdown-menu").find("li").contains(">").click();
    });

    // x
    it("5.12 Filters. Population Frequency: gnomAD - Set all < 0.00001", () => {
        // Population Frequency: gnomAD - Set all < 0.00001
        cy.get("population-frequency-filter i[data-cy='pop-freq-toggle-GNOMAD_GENOMES']").click();
        cy.get("population-frequency-filter div[data-cy='pop-freq-codes-wrapper-GNOMAD_GENOMES']").should("be.visible");
        cy.get("population-frequency-filter div[data-cy='pop-freq-codes-wrapper-GNOMAD_GENOMES'] div[data-cy='number-field-filter-wrapper-AFR'] input[data-field='value']").type("0.0001");
        cy.get("div.search-button-wrapper button").click();
        checkResults("variant-browser-grid");
        cy.get("opencga-active-filters button[data-filter-name='populationFrequencyAlt']").click();
        checkResults("variant-browser-grid");
    });

    it("5.13 Filters. Clinical: Disease Panels", () => {

        cy.sectionFilter("Clinical");
        // Clinical: Disease Panels
        cy.setDiseasePanels("disease_panels", [
            "Childhood onset dystonia or chorea or related movement disorder",
            "Amelogenesis imperfecta"
        ]);

        // Execute Query
        cy.get("div.search-button-wrapper button").click();
        checkResultsOrNot("variant-browser-grid");
        cy.removeActiveFilters("panel");
    });

    it("5.14 Filters. Clinical and Disease: Clinical Annotation: Pathogenic", () => {
        // Clinical: ClinVar Accessions. Use example: Pathogenic
        cy.sectionFilter("Clinical");
        cy.setClinicalAnnotation("clinical_significance", "Pathogenic");
        cy.get("div.search-button-wrapper button").click();
        checkResults("variant-browser-grid");
        cy.get("opencga-active-filters button[data-filter-name='clinicalSignificance']").click();
        checkResults("variant-browser-grid");
    });

    // x
    it("5.15 Filters. Clinical and Disease: Full text: Mortality", () => {
        // Clinical and Disease: Full text. Use example: Mortality
        cy.get("fulltext-search-accessions-filter textarea").type("Mortality");
        // cy.get("fulltext-search-accessions-filter textarea").type("centroid");
        cy.get("div.search-button-wrapper button").click();
        checkResults("variant-browser-grid");
        cy.get("opencga-active-filters button[data-filter-name='traits']").click();
        checkResults("variant-browser-grid");
    });

    // x
    it("5.16 Filters. GO and HPO", () => {
        cy.get("[data-cy-section-title=Phenotype]").click();

        // GO
        selectToken("go-accessions-filter", "dopamine", true); // "dopamine secretion" exchange factor activity
        cy.get("opencga-active-filters button[data-filter-name='go']").contains("GO:0014046");
        removeToken("go-accessions-filter", "GO:0014046");

        // HPO
        cy.get("[data-cy-section-id=Phenotype]")
            .then($div => {
                // HPO filter is visible
                if (Cypress.$(".subsection-content[data-cy='hpo']", $div).length) {
                    selectToken("hpo-accessions-filter", "Ovarian", true); // Ovariant thecoma
                    cy.get("opencga-active-filters button[data-filter-name='annot-hpo']").contains("HP:0030983");
                    removeToken("hpo-accessions-filter", "HP:0030983");
                }
            });
    });

    // x
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
        checkResults("variant-browser-grid");
        cy.get("opencga-active-filters button[data-filter-name='proteinSubstitution']").click();
        checkResults("variant-browser-grid");
    });

    // x
    it("5.18 Filters. Deleteriousness: Sift / Polyphen - AND operation", () => {
        // Deleteriousness: Sift / Polyphen - AND operation
        cy.get("protein-substitution-score-filter .sift .score-select .dropdown .btn").click();
        cy.get("protein-substitution-score-filter .sift .score-select .dropdown a").contains("Tolerated").click();
        cy.get("protein-substitution-score-filter .polyphen .score-select .dropdown .btn").click();
        cy.get("protein-substitution-score-filter .polyphen .score-select .dropdown a").contains("Possibly damaging").click();

        cy.get("protein-substitution-score-filter .rating-label-and").click();
        cy.get("div.search-button-wrapper button").click();
        checkResults("variant-browser-grid");
        cy.get("opencga-active-filters button[data-filter-name='proteinSubstitution']").click();
        checkResults("variant-browser-grid");
    });

    // x
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
                    checkResults("variant-browser-grid");
                    cy.get("opencga-active-filters button[data-filter-name='conservation']").click();
                    checkResults("variant-browser-grid");
                } else {
                    cy.get("div[data-cy-section-id='Conservation']").should("not.exist");
                }
            });
    });

    // x
    it("5.20 Check gene-view", () => {
        cy.get("button[data-id='table-tab']", {timeout: TIMEOUT}).click();
        cy.get("variant-browser-grid .bootstrap-table .fixed-table-container tr[data-index='0'] a.gene-tooltip:first-child")
            .should("be.visible", {timeout: TIMEOUT})
            .click({force: true});
        // .trigger('mouseover'); // .trigger('mouseover') doesn't work in this case as the hover action changes the DOM
        cy.get(".qtip-content").find("a[data-cy='gene-view']").click({force: true});
        cy.get("div.page-title h2").contains(/Gene [a-z0-9:]+/gim);
    });

    // x Variant Browser: Tabs
    it("5.21 checks Variant Browser detail tabs", () => {

        cy.get("variant-browser-detail > detail-tabs > div.panel > h3", {timeout: TIMEOUT}).should("contain", "Variant:");

        cy.get("cellbase-variant-annotation-summary h3").contains("Summary");

        cy.get("variant-browser-detail [data-id='annotationConsType']").click();
        checkResults("variant-consequence-type-view");

        cy.get("variant-browser-detail [data-id='annotationPropFreq']").click();

        cy.wait(1000);
        cy.get("cellbase-population-frequency-grid")
            .then($div => {
                // check CB data are available
                if (Cypress.$("div[data-cy='cellbase-population-frequency-table']", $div).length) {
                    checkResultsOrNot("cellbase-population-frequency-grid");
                } else {
                    cy.get("cellbase-population-frequency-grid .alert-info").contains("No population frequencies found");
                }
            });


        cy.get("variant-browser-detail [data-id='annotationClinical']").click();
        checkResultsOrNot("variant-annotation-clinical-view");

        cy.get("variant-browser-detail [data-id='cohortStats']").click();
        checkResultsOrNot("variant-cohort-stats-grid");

        cy.get("variant-browser-detail [data-id='samples']").click();
        checkResults("variant-samples");

        cy.get("variant-browser-detail [data-id='beacon']").click();
        cy.get("variant-beacon-network", {timeout: TIMEOUT}).find(".beacon-square").its("length").should("eq", 15);
    });

    // x
    it("5.22 aggregated query", () => {

        cy.get("variant-browser-filter a[data-cy-section-title='ConsequenceType']").click();
        cy.get("consequence-type-select-filter input[value='Loss-of-Function (LoF)'").click({force: true});

        cy.get("a[href='#facet_tab']").click({force: true});

        Facet.selectDefaultFacet();
        // cy.get("button.default-facets-button").click(); // default facets selection (chromosome, type)

        Facet.select("Gene");
        // cy.get("facet-filter .facet-selector li a").contains("Gene").click({force: true}); // gene facets selection

        cy.get("#type_Select a").contains("INSERTION").click({force: true}); // type=INSERTION
        Facet.checkActiveFacet("type", "type[INSERTION]");
        // cy.get("div.facet-wrapper button[data-filter-name='type']").contains("type[INSERTION]");

        Facet.checkActiveFacetLength(3);
        cy.get("div.search-button-wrapper button").click();
        Facet.checkResultLength(3);
        // cy.get("opencb-facet-results", {timeout: 120000}).find("opencga-facet-result-view", {timeout: TIMEOUT}).should("have.lengthOf", 3); // 2 default fields + genes

        Facet.select("Chromosome"); // removing chromosome
        Facet.checkActiveFacetLength(2);
        cy.get("div.search-button-wrapper button").click();
        Facet.checkResultLength(2);

        Facet.removeActive("type");
        Facet.checkResultLength(1);
        Facet.removeActive("genes");
        Facet.checkResultLength(0);

    });
});
