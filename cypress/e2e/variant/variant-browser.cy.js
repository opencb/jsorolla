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
import UtilsTest from "../../support/utils";

context("5. Variant Browser", () => {
    const executeSearchQuery = () => cy.get("div.search-button-wrapper button").click();
    // before(() => {
    //     cy.loginByApiSession();
    //     cy.visit("index.html#home");
    //     cy.wait(1000);
    //     cy.get(".hi-icon-wrap > [data-id='iva']", {log: false}).click();
    //     cy.selectStudy(Cypress.env("study"));
    // });

    beforeEach(() => {
        cy.loginByApiSession();
        cy.visit("index.html#browser");
        cy.selectStudy(Cypress.env("study"));
    });

    // good - refactor
    it("5.1 Columns Visibility", () => {
        UtilsTest.checkToolHeaderTitle("Variant Browser");
        UtilsTest.checkResults("variant-browser-grid");
        UtilsTest.checkColumnsGridBrowser("variant-browser-grid");

        // Check is more than 1
        // TODO refactor
        cy.get("variant-browser-grid .columns-toggle-wrapper ul li").and("have.length.gt", 1);

        // deactivate all the columns
        UtilsTest.clickAllColumnsGridBrowser("variant-browser-grid");

        // testing the first level of the header
        UtilsTest.checkHeaderGridBrowser("variant-browser-grid").should("have.lengthOf", 6);

        // reactivate all the columns
        UtilsTest.clickAllColumnsGridBrowser("variant-browser-grid");
        UtilsTest.checkHeaderGridBrowser("variant-browser-grid").should("have.lengthOf", 10);

    });

    // Variant Browser: Filter controls good
    it("5.2 Create/Delete canned filter", () => {

        UtilsTest.checkToolHeaderTitle("Variant Browser");
        cy.sectionFilter("ConsequenceType");
        cy.setConsequenceType("lof");

        cy.get("opencga-active-filters").contains("Consequence Types 9");

        const name = UtilsTest.randomString(5);
        cy.saveCurrentFilter({name: name, description: UtilsTest.randomString(3)});
        cy.checkNotificationManager("Filter has been saved");
        cy.removeFilters(name);
        cy.checkNotificationManager("Filter has been deleted");
        // Fix activeFilters is not removing with filter name ct
        cy.removeActiveFilters("ct");
    });

    // Variant Browser: Individual filters
    // should assertion comes from Chai and it follows its logic
    it("5.3 Pagination", () => {
        UtilsTest.checkToolHeaderTitle("Variant Browser");
        UtilsTest.checkResults("variant-browser-grid");
        UtilsTest.changePage("variant-browser-grid", 2);
        UtilsTest.checkResults("variant-browser-grid");
        UtilsTest.changePage("variant-browser-grid", 1);
        UtilsTest.checkResults("variant-browser-grid");
    });

    // Not exits cohort
    it.skip("5.4 Filters. Study and Cohorts: Cohort Alternate Stats", () => {
        // should assertion comes from Chai and it follows its logic
        UtilsTest.checkToolHeaderTitle("Variant Browser");
        cy.get("variant-browser a[href='#filters_tab']").click();
        // Study and Cohorts: Cohort Alternate Stats
        // TODO add condition Cohort no exist
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
        executeSearchQuery();
        UtilsTest.checkResults("variant-browser-grid");

        // Remove ActiveFilter
        cy.removeActiveFilters("region");
        UtilsTest.checkResults("variant-browser-grid");
        // close
        cy.sectionFilter("Genomic");
        cy.wait(500);
    });

    // good
    it("5.6 Filters. Genomic: Feature IDs", () => {
        cy.sectionFilter("Genomic");
        cy.setFeatureIds(["C5", "RS1"]);
        cy.get("opencga-active-filters").contains("XRef");
        executeSearchQuery();
        UtilsTest.checkResults("variant-browser-grid");
        cy.removeActiveFilters("xref");
        UtilsTest.checkResults("variant-browser-grid");
    });

    // good
    it("5.7 Filters. Genomic: Gene Biotype", () => {
        cy.sectionFilter("Genomic");
        cy.setGeneBiotype("protein_coding");
        executeSearchQuery();
        UtilsTest.checkResults("variant-browser-grid");
        cy.removeActiveFilters("biotype");
        UtilsTest.checkResults("variant-browser-grid");
    });

    // good
    it("5.8 Filters. Genomic: Variant", () => {
        cy.sectionFilter("Genomic");
        cy.setVariantType(["SNV"]);
        executeSearchQuery();
        UtilsTest.checkResults("variant-browser-grid");
        cy.removeActiveFilters("type");
        UtilsTest.checkResults("variant-browser-grid");
    });

    // good
    it("5.9 Filters. Consequence type: LoF", () => {
        // Consequence type: SO Term - LoF Enabled
        // Open
        cy.sectionFilter("ConsequenceType");
        cy.setConsequenceType("coding_sequence", "Loss-of-Function (LoF)");
        executeSearchQuery();
        UtilsTest.checkResults("variant-browser-grid");
        // Close
        cy.sectionFilter("ConsequenceType");
    });

    // good
    it("5.10 Filters. Consequence type: Missense", () => {
        // Consequence type: SO Term - Use example: Missense
        cy.sectionFilter("ConsequenceType");
        cy.setConsequenceType("terms_manual", ["missense_variant"]);
        executeSearchQuery();
        UtilsTest.checkResults("variant-browser-grid");
        cy.removeActiveFilters("ct");
        UtilsTest.checkResults("variant-browser-grid");
    });

    // good
    it("5.11 Filters. Population Frequency: 1000 Genomes - AFR < 0.0001 AND EUR > 0.0001", () => {
        // Population Frequency: 1000 Genomes - AFR < 0.0001 AND EUR > 0.0001

        cy.sectionFilter("PopulationFrequency");
        cy.selectPopulationFrequency("1000G");
        cy.setPopulationFrequency("1000G", "AFR", "<", 0.0001);
        cy.setPopulationFrequency("1000G", "EUR", ">", 0.0001);
        executeSearchQuery();
        UtilsTest.checkResults("variant-browser-grid");

        cy.removeActiveFilters("populationFrequencyAlt");
        UtilsTest.checkResults("variant-browser-grid");
        cy.selectPopulationFrequency("1000G");
        cy.sectionFilter("PopulationFrequency");
        cy.wait(200);
    });

    // good
    it("5.12 Filters. Population Frequency: gnomAD - Set all < 0.00001", () => {
        // Population Frequency: gnomAD - Set all < 0.00001

        cy.sectionFilter("PopulationFrequency");
        cy.selectPopulationFrequency("GNOMAD_GENOMES");
        cy.setPopulationFrequency("GNOMAD_GENOMES", "Set_All", "", 0.0001);
        executeSearchQuery();
        UtilsTest.checkResults("variant-browser-grid");
        cy.removeActiveFilters("populationFrequencyAlt");
        UtilsTest.checkResults("variant-browser-grid");
        cy.selectPopulationFrequency("GNOMAD_GENOMES");
    });

    // good
    it("5.13 Filters. Clinical: Disease Panels", () => {

        cy.sectionFilter("Clinical");
        // Clinical: Disease Panels
        cy.setDiseasePanels("disease_panels", [
            "Childhood onset dystonia or chorea or related movement disorder",
            "Amelogenesis imperfecta"
        ]);

        // Execute Query
        executeSearchQuery();
        UtilsTest.checkResultsOrNot("variant-browser-grid");
        cy.removeActiveFilters("panel");
    });

    // good
    it("5.14 Filters. Clinical and Disease: Clinical Annotation: Pathogenic", () => {
        // Clinical: ClinVar Accessions. Use example: Pathogenic
        cy.sectionFilter("Clinical");
        cy.setClinicalAnnotation("clinical_significance", "Pathogenic");
        executeSearchQuery();
        UtilsTest.checkResults("variant-browser-grid");
        cy.get("opencga-active-filters button[data-filter-name='clinicalSignificance']").click();
        UtilsTest.checkResults("variant-browser-grid");
    });

    // good
    it("5.15 Filters. Clinical and Disease: Full text: Mortality", () => {
        // Clinical and Disease: Full text. Use example: Mortality
        cy.sectionFilter("Clinical");
        cy.setClinicalFullText("Mortality");
        executeSearchQuery();
        UtilsTest.checkResults("variant-browser-grid");
        cy.removeActiveFilters("traits");
        UtilsTest.checkResults("variant-browser-grid");
    });

    // good
    it("5.16 Filters. GO and HPO", () => {
        cy.sectionFilter("Phenotype");
        // Phenotype only search by id, no name
        cy.setGoAccesions("GO:0014046");
        UtilsTest.removeToken("go-accessions-filter", "GO:0014046");

        // HPO
        cy.setHpoAccesions("HP:0030983");
        UtilsTest.removeToken("hpo-accessions-filter", "HP:0030983");

        // cy.removeActiveFilters("annot-hpo");
        // todo: See if visible the filter

    });

    // good
    it("5.17 Filters. Deleteriousness: Sift / Polyphen - OR operation", () => {
        // Deleteriousness: Sift / Polyphen - OR operation
        // Open Section
        cy.sectionFilter("Deleteriousness");
        cy.setProteingSubsScore("sift", "Score", "<", 0.1);
        cy.setProteingSubsScore("polyphen", "Score", "<", 0.1);
        executeSearchQuery();
        UtilsTest.checkResults("variant-browser-grid");
        cy.removeActiveFilters("proteinSubstitution");
        UtilsTest.checkResults("variant-browser-grid");
        // Close Section
        cy.sectionFilter("Deleteriousness");
        cy.wait(500);
    });
    // good
    it("5.18 Filters. Deleteriousness: Sift / Polyphen - AND operation", () => {
        // Deleteriousness: Sift / Polyphen - AND operation
        cy.sectionFilter("Deleteriousness");
        cy.setProteingSubsScore("sift", "Tolerated");
        cy.setProteingSubsScore("polyphen", "Possibly damaging");
        // or o and
        cy.setProteingSubsScore("operator", "and");
        executeSearchQuery();
        UtilsTest.checkResults("variant-browser-grid");
        cy.removeActiveFilters("proteinSubstitution");
        UtilsTest.checkResults("variant-browser-grid");
    });

    // good
    it("5.19 Filters. Conservation: PhyloP", () => {
        // Todo: operator
        cy.sectionFilter("Conservation");
        cy.setConservation("phylop", 1);
        cy.setConservation("phastCons", 1);
        cy.setConservation("gerp", 1);
        executeSearchQuery();
        UtilsTest.checkResults("variant-browser-grid");
        cy.removeActiveFilters("conservation");
        UtilsTest.checkResults("variant-browser-grid");
    });

    // good
    it.skip("5.20 Check gene-view", () => {
        // cy.get("button[data-id='table-tab']", {timeout: TIMEOUT}).click();
        cy.get("variant-browser-grid .bootstrap-table .fixed-table-container tr[data-index='0'] a.gene-tooltip:first-child")
            .should("be.visible", {timeout: TIMEOUT})
            .click({force: true});
        cy.get(".qtip-content").find("a[data-cy='gene-view']").click({force: true});
        cy.get("div.page-title h2").contains(/Gene [a-z0-9:]+/gim);
    });

    // good Variant Browser: Tabs
    it("5.21 checks Variant Browser detail tabs", () => {
        cy.get("variant-browser-detail > detail-tabs > div.panel > h3").should("contain", "Variant:");
        cy.get("cellbase-variant-annotation-summary h3").contains("Summary");

        cy.showVariantBrowserTab("annotationConsType");
        UtilsTest.checkResults("variant-consequence-type-view");

        cy.showVariantBrowserTab("annotationPropFreq");
        UtilsTest.checkResults("cellbase-population-frequency-grid");

        cy.showVariantBrowserTab("annotationClinical");
        UtilsTest.checkResultsOrNot("variant-annotation-clinical-view");

        cy.showVariantBrowserTab("cohortStats");
        UtilsTest.checkResultsOrNot("variant-cohort-stats-grid");

        cy.showVariantBrowserTab("samples");
        UtilsTest.checkResults("variant-samples");

        cy.showVariantBrowserTab("beacon");
        cy.get("variant-beacon-network").find(".beacon-square").its("length").should("eq", 15);
    });

    // good
    it("5.22 aggregated query", () => {

        cy.sectionFilter("ConsequenceType");
        cy.setConsequenceType("lof");
        cy.get("a[href='#facet_tab']").click({force: true});

        UtilsTest.facet.selectDefaultFacet();
        // cy.get("button.default-facets-button").click(); // default facets selection (chromosome, type)

        UtilsTest.facet..select("Gene");
        // cy.get("facet-filter .facet-selector li a").contains("Gene").click({force: true}); // gene facets selection

        cy.get("#type_Select a").contains("INSERTION").click({force: true}); // type=INSERTION
        UtilsTest.facet..checkActiveFacet("type", "type[INSERTION]");
        // cy.get("div.facet-wrapper button[data-filter-name='type']").contains("type[INSERTION]");

        UtilsTest.facet.checkActiveFacetLength(3);
        executeSearchQuery();
        UtilsTest.facet.checkResultLength(3);
        // cy.get("opencb-facet-results", {timeout: 120000}).find("opencga-facet-result-view", {timeout: TIMEOUT}).should("have.lengthOf", 3); // 2 default fields + genes

        UtilsTest.facet.select("Chromosome"); // removing chromosome
        UtilsTest.facet.checkActiveFacetLength(2);
        executeSearchQuery();
        UtilsTest.facet.checkResultLength(2);

        UtilsTest.facet.removeActive("type");
        UtilsTest.facet.checkResultLength(1);
        UtilsTest.facet.removeActive("genes");
        UtilsTest.facet.checkResultLength(0);

    });
});
