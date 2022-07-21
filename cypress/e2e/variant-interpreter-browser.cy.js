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

import {caseFilterVariant} from "../fixtures/caseVariantData.js";
import UtilsTest from "../support/utils";
import {randomString, Facet, removeToken} from "../plugins/utils.js";
import cytoscape from "cytoscape";


const utils = new UtilsTest();

context("Case Interpreter", () => {
    const executeSearchQuery = () => cy.get("div.search-button-wrapper button").click();
    const interpreterGrid = "variant-interpreter-grid";

    beforeEach(() => {
        cy.loginByApiSession();
        cy.visit("index.html#clinicalAnalysisPortal/family/platinum");
        cy.wait(5000);
        cy.selectStudy(Cypress.env("study"));
        cy.selectCaseVariantBrowser("MARIA");
        cy.variantInterpreterWizard("variant-browser");
    });

    // good - refactor
    it("7.1 Columns Visibility", () => {
        utils.checkToolHeaderTitle("Case Interpreter");
        utils.checkTableResults(interpreterGrid);
        utils.checkColumnsGridBrowser(interpreterGrid);

        // Check is more than 1
        cy.get("variant-interpreter-grid .columns-toggle-wrapper ul li").and("have.length.gt", 1);

        // deactivate all the columns
        // utils.clickAllColumnsGridBrowser(interpreterGrid);

        // testing the first level of the header
        // utils.checkHeaderGridBrowser(interpreterGrid).should("have.lengthOf", 6);

        // reactivate all the columns
        // utils.clickAllColumnsGridBrowser(interpreterGrid);
        // utils.checkHeaderGridBrowser(interpreterGrid).should("have.lengthOf", 10);

    });

    // Variant Browser: Filter controls good
    it("7.2 Create/Delete canned filter", () => {

        // utils.checkToolHeaderTitle("Variant Browser");
        // cy.sectionFilter("ConsequenceType");
        cy.setConsequenceType("lof");

        cy.get("opencga-active-filters").contains("Consequence Types 9");

        const name = utils.randomString(5);
        cy.saveCurrentFilter({name: name, description: randomString(3)});
        cy.checkNotificationManager("Filter has been saved");
        cy.removeFilters(name);
        cy.checkNotificationManager("Filter has been deleted");
        // Fix activeFilters is not removing with filter name ct
        cy.removeActiveFilters("ct");
    });

    // Variant Browser: Individual filters
    // should assertion comes from Chai and it follows its logic
    it("7.3 Pagination", () => {
        utils.checkToolHeaderTitle("Variant Browser");
        utils.checkTableResults(interpreterGrid);
        utils.changeTablePage(interpreterGrid, 2);
        utils.checkTableResults(interpreterGrid);
        utils.changeTablePage(interpreterGrid, 1);
        utils.checkTableResults(interpreterGrid);
    });

    // Not exits cohort
    it.skip("7.4 Filters. Study and Cohorts: Cohort Alternate Stats", () => {
        // should assertion comes from Chai and it follows its logic
        utils.checkToolHeaderTitle("Variant Browser");
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
    it("7.5 Filters. Genomic: Genomic Location", () => {

        // cy.sectionFilter("Genomic");
        cy.setGenomicLocation("1:5000000-10000000");

        // Execute Query
        executeSearchQuery();
        utils.checkTableResults(interpreterGrid);

        // Remove ActiveFilter
        cy.removeActiveFilters("region");
        utils.checkTableResults(interpreterGrid);
        // close
        // cy.sectionFilter("Genomic");
        cy.wait(500);
    });

    // good
    it("7.6 Filters. Genomic: Feature IDs", () => {
        // cy.sectionFilter("Genomic");
        cy.setFeatureIds(["C5", "RS1"]);
        cy.get("opencga-active-filters").contains("XRef");
        executeSearchQuery();
        utils.checkTableResults(interpreterGrid);
        cy.removeActiveFilters("xref");
        utils.checkTableResults(interpreterGrid);
    });

    // good
    it("7.7 Filters. Genomic: Gene Biotype", () => {
        // cy.sectionFilter("Genomic");
        cy.setGeneBiotype("protein_coding");
        executeSearchQuery();
        utils.checkTableResults(interpreterGrid);
        cy.removeActiveFilters("biotype");
        utils.checkTableResults(interpreterGrid);
    });

    // good
    it("7.8 Filters. Genomic: Variant", () => {
        // cy.sectionFilter("Genomic");
        cy.setVariantType(["SNV"]);
        executeSearchQuery();
        utils.checkTableResults(interpreterGrid);
        cy.removeActiveFilters("type");
        utils.checkTableResults(interpreterGrid);
    });

    // good
    it("7.9 Filters. Consequence type: LoF", () => {
        // Consequence type: SO Term - LoF Enabled
        // Open
        // cy.sectionFilter("ConsequenceType");
        cy.setConsequenceType("coding_sequence", "Loss-of-Function (LoF)");
        executeSearchQuery();
        utils.checkTableResults(interpreterGrid);
        // Close
        // cy.sectionFilter("ConsequenceType");
    });

    // good
    it("7.10 Filters. Consequence type: Missense", () => {
        // Consequence type: SO Term - Use example: Missense
        // cy.sectionFilter("ConsequenceType");
        cy.setConsequenceType("terms_manual", ["missense_variant"]);
        executeSearchQuery();
        utils.checkTableResults(interpreterGrid);
        cy.removeActiveFilters("ct");
        utils.checkTableResults(interpreterGrid);
    });

    // good
    it("7.11 Filters. Population Frequency: 1000 Genomes - AFR < 0.0001 AND EUR > 0.0001", () => {
        // Population Frequency: 1000 Genomes - AFR < 0.0001 AND EUR > 0.0001

        // cy.sectionFilter("PopulationFrequency");
        cy.selectPopulationFrequency("1000G");
        cy.setPopulationFrequency("1000G", "AFR", "<", 0.0001);
        cy.setPopulationFrequency("1000G", "EUR", ">", 0.0001);
        executeSearchQuery();
        utils.checkTableResults(interpreterGrid);

        cy.removeActiveFilters("populationFrequencyAlt");
        utils.checkTableResults(interpreterGrid);
        cy.selectPopulationFrequency("1000G");
        // cy.sectionFilter("PopulationFrequency");
        cy.wait(200);
    });

    // good
    it("7.12 Filters. Population Frequency: gnomAD - Set all < 0.00001", () => {
        // Population Frequency: gnomAD - Set all < 0.00001

        // cy.sectionFilter("PopulationFrequency");
        cy.selectPopulationFrequency("GNOMAD_GENOMES");
        cy.setPopulationFrequency("GNOMAD_GENOMES", "Set_All", "", 0.0001);
        executeSearchQuery();
        utils.checkTableResults(interpreterGrid);
        cy.removeActiveFilters("populationFrequencyAlt");
        utils.checkTableResults(interpreterGrid);
        cy.selectPopulationFrequency("GNOMAD_GENOMES");
    });

    // good
    it("7.13 Filters. Clinical: Disease Panels", () => {

        // cy.sectionFilter("Clinical");
        // Clinical: Disease Panels
        cy.setDiseasePanels("disease_panels", [
            "Childhood onset dystonia or chorea or related movement disorder",
            "Amelogenesis imperfecta"
        ]);

        // Execute Query
        executeSearchQuery();
        utils.checkResultsOrNot(interpreterGrid);
        cy.removeActiveFilters("panel");
    });

    // good
    it("7.14 Filters. Clinical and Disease: Clinical Annotation: Pathogenic", () => {
        // Clinical: ClinVar Accessions. Use example: Pathogenic
        // cy.sectionFilter("Clinical");
        cy.setClinicalAnnotation("clinical_significance", "Pathogenic");
        executeSearchQuery();
        utils.checkTableResults(interpreterGrid);
        cy.get("opencga-active-filters button[data-filter-name='clinicalSignificance']").click();
        utils.checkTableResults(interpreterGrid);
    });

    // good
    it("7.15 Filters. Clinical and Disease: Full text: Mortality", () => {
        // Clinical and Disease: Full text. Use example: Mortality
        // cy.sectionFilter("Clinical");
        cy.setClinicalFullText("Mortality");
        executeSearchQuery();
        utils.checkTableResults(interpreterGrid);
        cy.removeActiveFilters("traits");
        utils.checkTableResults(interpreterGrid);
    });

    // good
    it("7.16 Filters. GO and HPO", () => {
        // cy.sectionFilter("Phenotype");
        // Phenotype only search by id, no name
        cy.setGoAccesions("GO:0014046");
        removeToken("go-accessions-filter", "GO:0014046");

        // HPO
        cy.setHpoAccesions("HP:0030983");
        removeToken("hpo-accessions-filter", "HP:0030983");

        // cy.removeActiveFilters("annot-hpo");
        // todo: See if visible the filter

    });

    // good
    it("7.17 Filters. Deleteriousness: Sift / Polyphen - OR operation", () => {
        // Deleteriousness: Sift / Polyphen - OR operation
        // Open Section
        // cy.sectionFilter("Deleteriousness");
        cy.setProteingSubsScore("sift", "Score", "<", 0.1);
        cy.setProteingSubsScore("polyphen", "Score", "<", 0.1);
        executeSearchQuery();
        utils.checkTableResults(interpreterGrid);
        cy.removeActiveFilters("proteinSubstitution");
        utils.checkTableResults(interpreterGrid);
        // Close Section
        // cy.sectionFilter("Deleteriousness");
        cy.wait(500);
    });
    // good
    it("7.18 Filters. Deleteriousness: Sift / Polyphen - AND operation", () => {
        // Deleteriousness: Sift / Polyphen - AND operation
        // cy.sectionFilter("Deleteriousness");
        cy.setProteingSubsScore("sift", "Tolerated");
        cy.setProteingSubsScore("polyphen", "Possibly damaging");
        // or o and
        cy.setProteingSubsScore("operator", "and");
        executeSearchQuery();
        utils.checkTableResults(interpreterGrid);
        cy.removeActiveFilters("proteinSubstitution");
        utils.checkTableResults(interpreterGrid);
    });

    // good
    it("7.19 Filters. Conservation: PhyloP", () => {
        // cy.sectionFilter("Conservation");
        cy.setConservation("phylop", 1);
        cy.setConservation("phastCons", 1);
        cy.setConservation("gerp", 1);
        executeSearchQuery();
        utils.checkTableResults(interpreterGrid);
        cy.removeActiveFilters("conservation");
        utils.checkTableResults(interpreterGrid);
    });

    // good
    it.skip("7.20 Check gene-view", () => {
        cy.get("variant-interpreter-grid .bootstrap-table .fixed-table-container tr[data-index='0'] a.gene-tooltip:first-child")
            .should("be.visible", {timeout: 6000})
            .click({force: true});
        cy.get(".qtip-content").find("a[data-cy='gene-view']").click({force: true});
        cy.get("div.page-title h2").contains(/Gene [a-z0-9:]+/gim);
    });

    // good Variant Browser: Tabs
    it("7.21 checks Variant Browser detail tabs", () => {
        cy.get("variant-browser-detail > detail-tabs > div.panel > h3").should("contain", "Variant:");
        cy.get("cellbase-variant-annotation-summary h3").contains("Summary");

        cy.showVariantBrowserTab("annotationConsType");
        utils.checkTableResults("variant-consequence-type-view");

        cy.showVariantBrowserTab("annotationPropFreq");
        utils.checkTableResults("cellbase-population-frequency-grid");

        cy.showVariantBrowserTab("annotationClinical");
        utils.checkResultsOrNot("variant-annotation-clinical-view");

        cy.showVariantBrowserTab("cohortStats");
        utils.checkResultsOrNot("variant-cohort-stats-grid");

        cy.showVariantBrowserTab("samples");
        utils.checkTableResults("variant-samples");

        cy.showVariantBrowserTab("beacon");
        cy.get("variant-beacon-network").find(".beacon-square").its("length").should("eq", 15);
    });

    it("case maria: filters on variant browser", () => {

        const {diseasePanel, clinicalAnnotation, consequenceType} = caseFilterVariant;
        // Filter: Disease Panel
        cy.setDiseasePanels("disease_panels", diseasePanel.disease_panel);
        cy.setDiseasePanels("feature_type", diseasePanel.feature_type);
        cy.setDiseasePanels("genes_by_moi", diseasePanel.genes_by_moi);
        cy.setDiseasePanels("genes_by_confidence", diseasePanel.genes_by_confidence);
        cy.setDiseasePanels("genes_by_roles_in_cancer", diseasePanel.genes_by_roles_in_cancer);
        cy.setDiseasePanels("panel_intersection", diseasePanel.panel_intersection);

        // Filter: Clinical Annotation
        cy.setClinicalAnnotation("clinical_database", clinicalAnnotation.clinical_database);
        cy.setClinicalAnnotation("clinical_significance", clinicalAnnotation.clinical_significance);
        cy.setClinicalAnnotation("clinical_status", clinicalAnnotation.clinical_status);

        // Select SO Terms
        cy.setConsequenceType("coding_sequence", consequenceType.coding_sequence);
        cy.setConsequenceType("terms_manual", consequenceType.terms_manual);
        // nonsense_mediated_decay

        cy.setGeneBiotype("nonsense_mediated_decay");
        cy.setGenomicLocation("3:444-55555,1:1-100000");
        cy.setFeatureIds(["LIN28A", "CLIC4"]);
        executeSearchQuery();
    });

    // Filters variant browser case
    it.skip("check results", ()=> {
        // Variants Table see if has results
        cy.wait(2000);
        cy.get("variant-interpreter-grid .fixed-table-body").find("table tbody").first().as("variantTable");
        cy.get("@variantTable").children().should("have.length.gt", 0);

        //  with children get elements inside tbody the first level
        // with find get element and inside those elements too, deep levels.
        // .find("tbody tr").should("have.length.gt", 0);

        // Message if it has no results
        // table table-bordered table-hover no-records-found No matching records found

        // Loading container
        // fixed-table-loading table table-bordered table-hover loading-spinner DNA_cont
    });

});


