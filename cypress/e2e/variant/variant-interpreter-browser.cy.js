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

import {caseFilterVariant} from "../../fixtures/caseVariantData.js";
import UtilsTest from "../../support/UtilsTest";
import VariantAction from "../../support/variant/variantAction";

const variantAction = new VariantAction();

// Last time 4m 37s
context("Case Interpreter", () => {
    const executeSearchQuery = () => cy.get("div.search-button-wrapper button").click();
    const interpreterGrid = "variant-interpreter-grid";
    const interpreterDetail = "variant-interpreter-detail";

    beforeEach(() => {
        cy.loginByApiSession();
        cy.visit("index.html#clinicalAnalysisPortal/family/platinum");
        variantAction.selectStudy(Cypress.env("study"));
        variantAction.selectCaseVariantBrowser("MARIA");
        variantAction.variantInterpreterWizard("variant-browser");
    });

    // good - refactor
    it.only("7.1 Columns Visibility", () => {
        UtilsTest.checkToolHeaderTitle("Case Interpreter");
        UtilsTest.checkTableResults(interpreterGrid);
        UtilsTest.checkColumnsGridBrowser(interpreterGrid);

        // Check is more than 1
        UtilsTest.actionColumnGridBrowser(interpreterGrid, "get").and("have.length.gt", 1);
        // deactivate all the columns
        // Note Erro Action Column
        // UtilsTest.clickAllColumnsGridBrowser(interpreterGrid);

        // testing the first level of the header
        // UtilsTest.checkHeaderGridBrowser(interpreterGrid).should("have.lengthOf", 6);

        // reactivate all the columns
        // UtilsTest.clickAllColumnsGridBrowser(interpreterGrid);
        // UtilsTest.checkHeaderGridBrowser(interpreterGrid).should("have.lengthOf", 10);

    });

    // Variant Browser: Filter controls good
    it("7.2 Create/Delete canned filter", () => {
        UtilsTest.checkToolHeaderTitle("Variant Browser");
        variantAction.setConsequenceType("lof");
        cy.get("opencga-active-filters").contains("Consequence Types 9");
        const name = UtilsTest.randomString(5);
        variantAction.saveCurrentFilter({name: name, description: UtilsTest.randomString(3)});
        variantAction.checkNotificationManager("Filter has been saved");
        variantAction.removeFilters(name);
        variantAction.checkNotificationManager("Filter has been deleted");
        // Fix activeFilters is not removing with filter name ct
        variantAction.removeActiveFilters("ct");
    });

    // Variant Browser: Individual filters
    // should assertion comes from Chai and it follows its logic
    it("7.3 Pagination", () => {
        UtilsTest.checkToolHeaderTitle("Variant Browser");
        UtilsTest.checkTableResults(interpreterGrid);
        UtilsTest.changeTablePage(interpreterGrid, 2);
        UtilsTest.checkTableResults(interpreterGrid);
        UtilsTest.changeTablePage(interpreterGrid, 1);
        UtilsTest.checkTableResults(interpreterGrid);
    });

    it("7.4 Filters. Study and Cohorts: Cohort Alternate Stats", () => {
        // Study and Cohorts: Cohort Alternate Stats
        UtilsTest.checkToolHeaderTitle("Variant Browser");
        variantAction.setCohortAlternateStats("", "ALL", "<", 0.00001);
        executeSearchQuery();
        UtilsTest.checkTableResults(interpreterGrid);
    });

    // good
    it("7.5 Filters. Genomic: Genomic Location", () => {

        // variantAction.sectionFilter("Genomic");
        variantAction.setGenomicLocation("1:5000000-10000000");

        // Execute Query
        executeSearchQuery();
        UtilsTest.checkTableResults(interpreterGrid);

        // Remove ActiveFilter
        variantAction.removeActiveFilters("region");
        UtilsTest.checkTableResults(interpreterGrid);
        // cy.wait(500);
    });

    // good
    it("7.6 Filters. Genomic: Feature IDs", () => {
        variantAction.setFeatureIds(["C5", "RS1"]);
        variantAction.getActiveFilter().contains("XRef");
        executeSearchQuery();
        UtilsTest.checkTableResults(interpreterGrid);
        variantAction.removeActiveFilters("xref");
        UtilsTest.checkTableResults(interpreterGrid);
    });

    // good
    it("7.7 Filters. Genomic: Gene Biotype", () => {
        variantAction.setGeneBiotype("protein_coding");
        executeSearchQuery();
        UtilsTest.checkTableResults(interpreterGrid);
        variantAction.removeActiveFilters("biotype");
        UtilsTest.checkTableResults(interpreterGrid);
    });

    // good
    it("7.8 Filters. Genomic: Variant", () => {
        variantAction.setVariantType(["SNV"]);
        executeSearchQuery();
        UtilsTest.checkTableResults(interpreterGrid);
        variantAction.removeActiveFilters("type");
        UtilsTest.checkTableResults(interpreterGrid);
    });

    // good
    it("7.9 Filters. Consequence type: LoF", () => {
        // Consequence type: SO Term - LoF Enabled
        variantAction.setConsequenceType("coding_sequence", "Loss-of-Function (LoF)");
        executeSearchQuery();
        UtilsTest.checkTableResults(interpreterGrid);
    });

    // good
    it("7.10 Filters. Consequence type: Missense", () => {
        // Consequence type: SO Term - Use example: Missense
        variantAction.setConsequenceType("terms_manual", ["missense_variant"]);
        executeSearchQuery();
        UtilsTest.checkTableResults(interpreterGrid);
        variantAction.removeActiveFilters("ct");
        UtilsTest.checkTableResults(interpreterGrid);
    });

    // good
    it("7.11 Filters. Population Frequency: 1kG_phase3 - ALL", () => {
        variantAction.selectPopulationFrequency("1kG_phase3");
        variantAction.setPopulationFrequencyInterpreter("1kG_phase3", "ALL", "<", 0.0001);
        executeSearchQuery();
        UtilsTest.checkTableResults(interpreterGrid);
        variantAction.removeActiveFilters("populationFrequencyAlt");

    });

    // good
    it("7.12 Filters. Population Frequency: gnomAD - Set all < 0.00001", () => {
        // Population Frequency: gnomAD - Set all < 0.00001
        variantAction.selectPopulationFrequency("GNOMAD_GENOMES");
        variantAction.setPopulationFrequencyInterpreter("GNOMAD_GENOMES", "ALL", "<", 0.0001);
        executeSearchQuery();
        UtilsTest.checkTableResults(interpreterGrid);
        variantAction.removeActiveFilters("populationFrequencyAlt");
    });

    // good
    it("7.13 Filters. Clinical: Disease Panels", () => {
        // Clinical: Disease Panels
        variantAction.setDiseasePanels("disease_panels", [
            "Childhood onset dystonia or chorea or related movement disorder",
            "Amelogenesis imperfecta"
        ]);

        // Execute Query
        executeSearchQuery();
        UtilsTest.checkResultsOrNot(interpreterGrid);
        variantAction.removeActiveFilters("panel");
    });

    // good
    it("7.14 Filters. Clinical and Disease: Clinical Annotation: Pathogenic", () => {
        // Clinical: ClinVar Accessions. Use example: Pathogenic
        variantAction.setClinicalAnnotation("clinical_significance", "Pathogenic");
        executeSearchQuery();
        UtilsTest.checkTableResults(interpreterGrid);
        // cy.get("opencga-active-filters button[data-filter-name='clinicalSignificance']").click();
        variantAction.removeActiveFilters("clinicalSignificance");
        UtilsTest.checkTableResults(interpreterGrid);
    });

    // good
    it("7.15 Filters. GO and HPO", () => {
        // Phenotype only search by id, no name
        variantAction.setGoAccesions("GO:0014046");
        variantAction.removeToken("go-accessions-filter", "GO:0014046");

        // HPO
        variantAction.setHpoAccesions("HP:0030983");
        variantAction.removeToken("hpo-accessions-filter", "HP:0030983");
    });

    // good
    it("7.16 Filters. Deleteriousness: Sift / Polyphen - OR operation", () => {
        // Deleteriousness: Sift / Polyphen - OR operation
        variantAction.setProteingSubsScore("sift", "Score", "<", 0.1);
        variantAction.setProteingSubsScore("polyphen", "Score", "<", 0.1);
        executeSearchQuery();
        UtilsTest.checkTableResults(interpreterGrid);
        variantAction.removeActiveFilters("proteinSubstitution");
        UtilsTest.checkTableResults(interpreterGrid);
    });
    // good
    it("7.17 Filters. Deleteriousness: Sift / Polyphen - AND operation", () => {
        // Deleteriousness: Sift / Polyphen - AND operation
        variantAction.setProteingSubsScore("sift", "Tolerated");
        variantAction.setProteingSubsScore("polyphen", "Possibly damaging");
        // or o and
        variantAction.setProteingSubsScore("operator", "and");
        executeSearchQuery();
        UtilsTest.checkTableResults(interpreterGrid);
        variantAction.removeActiveFilters("proteinSubstitution");
        UtilsTest.checkTableResults(interpreterGrid);
    });

    // good
    it("7.18 Filters. Conservation: PhyloP", () => {
        variantAction.setConservation("phylop", 1);
        variantAction.setConservation("phastCons", 1);
        variantAction.setConservation("gerp", 1);
        executeSearchQuery();
        UtilsTest.checkTableResults(interpreterGrid);
        variantAction.removeActiveFilters("conservation");
        UtilsTest.checkTableResults(interpreterGrid);
    });

    // good
    it("7.19 Check gene-view", () => {
        cy.get("variant-interpreter-grid .bootstrap-table .fixed-table-container tr[data-index='0'] a.gene-tooltip:first-child")
            .should("be.visible", {timeout: 6000})
            .click({force: true});
        cy.get(".qtip-content", {timeout: 6000}).find("a[data-cy='gene-view']").click({force: true});
        cy.get("div.page-title h2").contains(/Gene [a-z0-9:]+/gim);
    });

    // good Variant Browser: Tabs
    it("7.20 checks Variant Browser detail tabs", () => {
        cy.get("variant-interpreter-detail > detail-tabs > div.panel > h3")
            .scrollIntoView()
            .should("contain", "Selected Variant:");

        cy.get("cellbase-variant-annotation-summary h3").contains("Summary");

        variantAction.showVariantBrowserTab(interpreterDetail, "annotationConsType");
        UtilsTest.checkTableResults("variant-consequence-type-view");

        // NOTE, it should be has a table
        variantAction.showVariantBrowserTab(interpreterDetail, "annotationPropFreq");
        // // UtilsTest.checkTableResults("cellbase-population-frequency-grid");

        variantAction.showVariantBrowserTab(interpreterDetail, "annotationClinical");
        UtilsTest.checkResultsOrNot("variant-annotation-clinical-view");

        variantAction.showVariantBrowserTab(interpreterDetail, "cohortStats");
        UtilsTest.checkResultsOrNot("variant-cohort-stats-grid");

        variantAction.showVariantBrowserTab(interpreterDetail, "samples");
        UtilsTest.checkTableResults("variant-samples");

        variantAction.showVariantBrowserTab(interpreterDetail, "beacon");
        cy.get("variant-beacon-network")
            .find(".beacon-square")
            .should("have.length", 15);

        variantAction.showVariantBrowserTab(interpreterDetail, "json-view");
    });

    it("7.21 case maria: filters on variant browser", () => {

        const {diseasePanel, clinicalAnnotation, consequenceType} = caseFilterVariant;
        // Filter: Disease Panel
        variantAction.setDiseasePanels("disease_panels", diseasePanel.disease_panel);
        variantAction.setDiseasePanels("feature_type", diseasePanel.feature_type);
        variantAction.setDiseasePanels("genes_by_moi", diseasePanel.genes_by_moi);
        variantAction.setDiseasePanels("genes_by_confidence", diseasePanel.genes_by_confidence);
        variantAction.setDiseasePanels("genes_by_roles_in_cancer", diseasePanel.genes_by_roles_in_cancer);
        variantAction.setDiseasePanels("panel_intersection", diseasePanel.panel_intersection);

        // Filter: Clinical Annotation
        variantAction.setClinicalAnnotation("clinical_database", clinicalAnnotation.clinical_database);
        variantAction.setClinicalAnnotation("clinical_significance", clinicalAnnotation.clinical_significance);
        variantAction.setClinicalAnnotation("clinical_status", clinicalAnnotation.clinical_status);

        // Select SO Terms
        variantAction.setConsequenceType("coding_sequence", consequenceType.coding_sequence);
        variantAction.setConsequenceType("terms_manual", consequenceType.terms_manual);
        // nonsense_mediated_decay

        variantAction.setGeneBiotype("nonsense_mediated_decay");
        variantAction.setGenomicLocation("3:444-55555,1:1-100000");
        variantAction.setFeatureIds(["LIN28A", "CLIC4"]);
        executeSearchQuery();
    });

    // Filters variant browser case
    it.skip("check results", ()=> {
        // Variants Table see if has results
        // cy.wait(2000);
        cy.get("variant-interpreter-grid .fixed-table-body", {timeout: 3000}).find("table tbody").first().as("variantTable");
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
