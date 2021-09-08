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

import {login, randomString, checkResults, checkResultsOrNot, Facet, changePage, goTo} from "../plugins/utils.js";
import {TIMEOUT} from "../plugins/constants.js";

context("4. Variant Browser", () => {
    before(() => {
        login();
        goTo("iva");
    });

    beforeEach(() => {
        cy.get("a[data-id=browser]", {timeout: TIMEOUT}).click({force: true});
    });

    it("4.1 Columns Visibility", () => {
        cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", "Variant Browser");

        checkResults("variant-browser-grid");

        cy.get("variant-browser-grid .columns-toggle-wrapper button").should("be.visible").and("contain", "Columns").click();
        cy.get("variant-browser-grid .columns-toggle-wrapper ul li").and("have.length.gt", 1);

        cy.get("variant-browser-grid .columns-toggle-wrapper ul li a").click({multiple: true, timeout: TIMEOUT}); // deactivate all the columns
        cy.get("variant-browser-grid .bootstrap-table .fixed-table-container tr[data-index=0] > td", {timeout: TIMEOUT}).should("have.lengthOf", 1);

        cy.get("variant-browser-grid .columns-toggle-wrapper ul li a").click({multiple: true, timeout: TIMEOUT}); // reactivate all the columns
        cy.get("variant-browser-grid .bootstrap-table .fixed-table-container tr[data-index=0] > td", {timeout: TIMEOUT}).should("have.length.gt", 1);

    });

    // Variant Browser: Filter controls
    it("4.2 Create/Delete canned filter", () => {
        cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", "Variant Browser");

        cy.get("input[value*=LoF]").click({force: true});
        cy.get("opencga-active-filters").contains("Consequence Types 9");

        cy.get("button[data-cy='filter-button']").click({force: true});
        // cy.get("ul.saved-filter-wrapper a").contains("Save filter...").click(); // it also works
        cy.get("ul.saved-filter-wrapper a[data-action='active-filter-save']").contains("Save filter...").click();

        const name = randomString(5);
        // cy.get("input[data-cy='modal-filter-name']").type(name); // TODO Cypress doesn't type the entire string. https://github.com/cypress-io/cypress/issues/5480  invoke("val") is a workaround
        cy.get("input[data-cy='modal-filter-name']").invoke("val", name);
        cy.get("input[data-cy='modal-filter-description']").type(randomString(3));
        cy.get("button[data-cy='modal-filter-save-button']").click(); // confirm save

        cy.get(".swal2-actions").contains(/Yes|OK/).click(); // dismiss notification (either new filter or overwrite a saved one)
        cy.get("button[data-cy='filter-button']").click();
        cy.get("ul.saved-filter-wrapper").contains(name);
        cy.get(`span.action-buttons i[data-cy=delete][data-filter-id='${name}']`).click();
        cy.get(".swal2-title").contains("Are you sure?");
        cy.get(".swal2-confirm").click(); // confirm deletion action

        // cy.get(".swal2-content", {timeout: TIMEOUT}).contains("Filter has been deleted.");
        // this selector doesn't work without .should("be.visible") assertion because it refers to the previous #swal2-content which has been detatched from DOM before
        cy.contains(".swal2-content", "Filter has been deleted", {timeout: TIMEOUT}).should("be.visible");
        cy.get(".swal2-confirm").click({force: true}); // dismiss confirmation modal
        cy.get("opencga-active-filters button[data-filter-name='ct']").click();
    });

    // Variant Browser: Individual filters
    it("4.3 Pagination", () => {
        cy.get("div.page-title h2", {timeout: TIMEOUT}).should("be.visible").and("contain", "Variant Browser"); // should assertion comes from Chai and it follows its logic
        checkResults("variant-browser-grid");
        changePage("variant-browser-grid", 2);
        checkResults("variant-browser-grid");
        changePage("variant-browser-grid", 1);
        checkResults("variant-browser-grid");
    });

    it("4.4 Filters. Study and Cohorts: Cohort Alternate Stats", () => {
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

    it("4.5 Filters. Genomic: Genomic Location", () => {
        cy.get("opencga-variant-filter a[data-accordion-id='Genomic']").click();
        cy.get("region-filter textarea").type("1:5000000-10000000");
        cy.get("div.search-button-wrapper button").click();
        checkResults("variant-browser-grid");
        cy.get("opencga-active-filters button[data-filter-name='region']").click();
        checkResults("variant-browser-grid");
    });

    it("4.6 Filters. Genomic: Feature IDs", () => {
        cy.get("feature-filter input").type("C5{enter}rs4680{enter}");
        cy.get("div.search-button-wrapper button").click();
        checkResults("variant-browser-grid");
        cy.get("opencga-active-filters button[data-filter-name='xref']").click();
        checkResults("variant-browser-grid");
    });

    it("4.7 Filters. Genomic: Disease Panels", () => {
        // Genomic: Disease Panels
        // TODO decomment once opencga error 'URI Too Long' is fixed
        // disease-panel-filter select + button
        // cy.get("disease-panel-filter").find(" a").contains("Childhood onset dystonia or chorea or related movement disorder").click({force:true}) // URI too long
        // cy.get("disease-panel-filter").find(" a").contains("Amelogenesis imperfecta").click({force:true})
        // cy.get("div.search-button-wrapper button").click();
        //
        // checkResultsOrNot("variant-browser-grid")

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
    });

    it("4.8 Filters. Genomic: Gene Biotype", () => {
        // Genomic: Gene Biotype
        cy.get("biotype-filter button").click();
        cy.get("biotype-filter input[type='search']").type("protein"); // typing protein_coding using autocomplete
        cy.get("biotype-filter div.dropdown-menu").find("a").should("have.length", 1);
        cy.get("biotype-filter div.dropdown-menu a").click();
        cy.get("div.search-button-wrapper button").click();
        checkResults("variant-browser-grid");
        cy.get("opencga-active-filters button[data-filter-name='biotype']").click();
        checkResults("variant-browser-grid");
    });

    it("4.9 Filters. Genomic: Variant", () => {
        // Genomic: Variant type cy.get('.magic-checkbox-wrapper > :nth-child(1) > label')
        cy.get("variant-type-filter input[value='SNV'] + label").click({force: true});
        cy.get("div.search-button-wrapper button").click();
        checkResults("variant-browser-grid");
        cy.get("opencga-active-filters button[data-filter-name='type']").click();
        checkResults("variant-browser-grid");
    });

    it("4.10 Filters. Consequence type: LoF", () => {
        // Consequence type: SO Term - LoF Enabled
        cy.get("opencga-variant-filter a[data-accordion-id='ConsequenceType']").click();
        cy.get("consequence-type-select-filter input[value='Loss-of-Function (LoF)'").click({force: true});
        cy.get("div.search-button-wrapper button").click();
        checkResults("variant-browser-grid");
    });

    it("4.11 Filters. Consequence type: Missense", () => {
        // Consequence type: SO Term - Use example: Missense
        cy.get("consequence-type-select-filter button").click();
        cy.get("consequence-type-select-filter input[type='search']").type("miss"); // typing missense using autocomplete
        cy.get("consequence-type-select-filter div.dropdown-menu").find("a").should("have.length", 1);
        cy.get("consequence-type-select-filter div.dropdown-menu a").click();
        cy.get("div.search-button-wrapper button").click();
        checkResults("variant-browser-grid");
        cy.get("opencga-active-filters button[data-filter-name='ct']").click();
        checkResults("variant-browser-grid");
    });

    it("4.12 Filters. Population Frequency: 1000 Genomes - AFR < 0.0001 AND EUR > 0.0001", () => {
        // Population Frequency: 1000 Genomes - AFR < 0.0001 AND EUR > 0.0001
        cy.get("opencga-variant-filter a[data-accordion-id='PopulationFrequency']").click();
        cy.get("population-frequency-filter i[data-cy='pop-freq-toggle-1kG_phase3']").click();
        cy.get("population-frequency-filter div[data-cy='pop-freq-codes-wrapper-1kG_phase3']").should("be.visible");
        cy.get("population-frequency-filter div[data-cy='pop-freq-codes-wrapper-1kG_phase3'] div[data-cy='number-field-filter-wrapper-AFR'] input[data-field='value']").type("0.0001");
        cy.get("population-frequency-filter div[data-cy='pop-freq-codes-wrapper-1kG_phase3'] div[data-cy='number-field-filter-wrapper-AFR'] select[data-field='comparator']").select("<");
        cy.get("population-frequency-filter div[data-cy='pop-freq-codes-wrapper-1kG_phase3'] div[data-cy='number-field-filter-wrapper-EUR'] input[data-field='value']").type("0.0001");
        cy.get("population-frequency-filter div[data-cy='pop-freq-codes-wrapper-1kG_phase3'] div[data-cy='number-field-filter-wrapper-EUR'] select[data-field='comparator']").select(">");
        cy.get("div.search-button-wrapper button").click();
        checkResults("variant-browser-grid");
        cy.get("opencga-active-filters button[data-filter-name='populationFrequencyAlt']").click();
        checkResults("variant-browser-grid");
    });

    it("4.13 Filters. Population Frequency: gnomAD - Set all < 0.00001", () => {
        // Population Frequency: gnomAD	- Set all < 0.00001
        cy.get("population-frequency-filter i[data-cy='pop-freq-toggle-GNOMAD_GENOMES']").click();
        cy.get("population-frequency-filter div[data-cy='pop-freq-codes-wrapper-GNOMAD_GENOMES']").should("be.visible");
        cy.get("population-frequency-filter div[data-cy='pop-freq-codes-wrapper-GNOMAD_GENOMES'] div[data-cy='number-field-filter-wrapper-AFR'] input[data-field='value']").type("0.0001");
        cy.get("population-frequency-filter div[data-cy='pop-freq-codes-wrapper-GNOMAD_GENOMES'] div[data-cy='number-field-filter-wrapper-AFR'] select[data-field='comparator']").select("<");
        cy.get("div.search-button-wrapper button").click();
        checkResults("variant-browser-grid");
        cy.get("opencga-active-filters button[data-filter-name='populationFrequencyAlt']").click();
        checkResults("variant-browser-grid");
    });

    it("4.14 Filters. Clinical and Disease: ClinVar Accessions: Pathogenic", () => {
        // Clinical and Disease: ClinVar Accessions	Use example: Pathogenic
        cy.get("opencga-variant-filter a[data-accordion-id='Clinical']").click();
        cy.get("clinvar-accessions-filter select").select("Pathogenic", {force: true});
        checkResults("variant-browser-grid");
        cy.get("opencga-active-filters button[data-filter-name='clinicalSignificance']").click();
        checkResults("variant-browser-grid");
    });

    it("4.15 Filters. Clinical and Disease: Full text: Mortality", () => {
        // Clinical and Disease: Full text	Use example: Mortality
        cy.get("fulltext-search-accessions-filter textarea").type("Mortality");
        // cy.get("fulltext-search-accessions-filter textarea").type("centroid");
        cy.get("div.search-button-wrapper button").click();
        checkResults("variant-browser-grid");
        cy.get("opencga-active-filters button[data-filter-name='traits']").click();
        checkResults("variant-browser-grid");
    });

    it("4.16 Filters. GO", () => {
        // TODO cannot relies on data-nodeid because the order in not guaranteed
        // cy.get("go-accessions-filter > button").click();
        // cy.get(".modal-body .list-group-item[data-nodeid='2'] > .expand-icon").click(); // click on cellular component
        // cy.get(".modal-body .list-group-item[data-nodeid='2'] > .expand-icon").click(); // click on protein-containing complex
        // cy.get(".modal-body .list-group-item[data-nodeid='3'] > .expand-icon").click(); // click on bcl3

        // TODO you cannot tell in advance which is present in the study
        // Phenotype: HPO Accessions Use example
        /* cy.get("hpo-accessions-filter > textarea").type("HP:0041054");
        cy.get("div.search-button-wrapper button").click();
        checkResults("variant-browser-grid");
        cy.get("opencga-active-filters button[data-filter-name='annot-hpo']").click();*/
    });

    it("4.17 Filters. Deleteriousness: Sift / Polyphen - OR operation", () => {
        // Deleteriousness: Sift / Polyphen - OR operation
        cy.get("opencga-variant-filter a[data-accordion-id='Deleteriousness']").click();
        cy.get("protein-substitution-score-filter .sift input[type='text']").type("0.1");
        cy.get("protein-substitution-score-filter .polyphen input[type='text']").type("0.1");
        cy.get("div.search-button-wrapper button").click();
        checkResults("variant-browser-grid");
        cy.get("opencga-active-filters button[data-filter-name='protein_substitution']").click();
        checkResults("variant-browser-grid");
    });

    it("4.18 Filters. Deleteriousness: Sift / Polyphen - AND operation", () => {
        // Deleteriousness: Sift / Polyphen - AND operation
        cy.get("protein-substitution-score-filter .sift input[type='text']").type("0.1");
        cy.get("protein-substitution-score-filter .polyphen input[type='text']").type("0.1");
        cy.get("protein-substitution-score-filter .rating-label-and").click();
        cy.get("div.search-button-wrapper button").click();
        checkResults("variant-browser-grid");
        cy.get("opencga-active-filters button[data-filter-name='protein_substitution']").click();
        checkResults("variant-browser-grid");
    });

    it("4.19 Filters. Conservation: PhyloP", () => {
        // Conservation: PhyloP Use example
        cy.get("opencga-variant-filter a[data-accordion-id='Conservation']").click();
        cy.get("conservation-filter .cf-phylop input[type='text']").type("1");
        cy.get("conservation-filter .cf-phastCons input[type='text']").type("1");
        cy.get("div.search-button-wrapper button").click();
        checkResults("variant-browser-grid");
        cy.get("opencga-active-filters button[data-filter-name='conservation']").click();
        checkResults("variant-browser-grid");
    });

    it("4.20 Check gene-view", () => {
        cy.get("button[data-id='table-tab']", {timeout: TIMEOUT}).click();
        cy.get("variant-browser-grid .bootstrap-table .fixed-table-container tr[data-index='0'] a.gene-tooltip:first-child")
            .should("be.visible", {timeout: TIMEOUT})
            .click({force: true});
        // .trigger('mouseover'); // .trigger('mouseover') doesn't work in this case as the hover action changes the DOM
        cy.get(".qtip-content").find("a[data-cy='gene-view']").click({force: true});
        cy.get("div.page-title h2").contains(/Gene [a-z0-9:]+/gim);
    });

    // Variant Browser: Tabs
    it("4.21 checks Variant Browser detail tabs", () => {

        cy.get("variant-browser-detail > detail-tabs > div.panel > h3", {timeout: TIMEOUT}).should("contain", "Variant:");

        cy.get("cellbase-variant-annotation-summary h3").contains("Summary");

        cy.get("variant-browser-detail [data-id='annotationConsType']").click();
        checkResults("variant-consequence-type-view");

        cy.get("variant-browser-detail [data-id='annotationPropFreq']").click();
        checkResultsOrNot("cellbase-population-frequency-grid");

        cy.get("variant-browser-detail [data-id='annotationClinical']").click();
        checkResultsOrNot("variant-annotation-clinical-view");

        cy.get("variant-browser-detail [data-id='cohortStats']").click();
        checkResults("variant-cohort-stats-grid");

        cy.get("variant-browser-detail [data-id='samples']").click();
        checkResults("opencga-variant-samples");

        cy.get("variant-browser-detail [data-id='beacon']").click();
        cy.get("variant-beacon-network", {timeout: TIMEOUT}).find(".beacon-square").its("length").should("eq", 15);
    });

    it("4.22 aggregated query", () => {

        cy.get("opencga-variant-filter a[data-accordion-id='ConsequenceType']").click();
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
