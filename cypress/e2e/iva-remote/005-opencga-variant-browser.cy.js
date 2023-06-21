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

import { TIMEOUT } from "../../support/constants.js";
import UtilsTest from "../../support/utils-test.js";
import BrowserTest from "../../support/browser-test.js";


context("5. Variant Browser", () => {
    const executeSearchQuery = () => cy.get("div.cy-search-button-wrapper button").click();
    const browserGrid = "variant-browser-grid";
    const browserDetail = "variant-browser-detail";

    before(() => {
        //     UtilsTest.loginByApiSession();
        // cy.visit("http://localhost:3000/src/sites/iva/#home");
        // UtilsTest.goTo("iva");
    });

    beforeEach(() => {
        UtilsTest.loginByApiSession();
        cy.visit("http://localhost:3000/src/sites/iva/#home");
        UtilsTest.goTo("iva");
        cy.get("div[data-cy-welcome-card-id='browser']").contains("strong", "Enter").click()
        BrowserTest.selectStudy(Cypress.env("study"));
    });

    it("5.1 Columns Visibility", () => {
        UtilsTest.checkToolHeaderTitle("Variant Browser");
        UtilsTest.checkTableResults(browserGrid);
        UtilsTest.checkColumnsGridBrowser(browserGrid);
        UtilsTest.actionColumnGridBrowser(browserGrid, "get")
            .should("have.length.gt", 1);

        // Desactivate all the columns
        UtilsTest.clickAllColumnsGridBrowser(browserGrid);

        // testing the first level of the header
        UtilsTest.checkHeaderGridBrowser(browserGrid).should("have.length.gt", 4);

        // reactivate all the columns
        UtilsTest.clickAllColumnsGridBrowser(browserGrid)
        UtilsTest.checkHeaderGridBrowser(browserGrid).should("have.length.gt", 6);
    });

    // Variant Browser: Filter controls
    it("5.2 Create/Delete canned filter", () => {
        UtilsTest.checkToolHeaderTitle("Variant Browser");
        BrowserTest.setConsequenceType("lof");
        cy.get("opencga-active-filters").contains("Consequence Type");
        const name = UtilsTest.randomString(5);
        BrowserTest.saveCurrentFilter({ name: name, description: UtilsTest.randomString(3) });
        BrowserTest.checkNotificationManager("Filter has been saved");
        BrowserTest.removeFilters(name);
        BrowserTest.checkNotificationManager("Filter has been deleted");
        BrowserTest.removeActiveFilters("ct");
    });

    // Variant Browser: Individual filters
    it("5.3 Pagination", () => {
        UtilsTest.checkToolHeaderTitle("Variant Browser");
        UtilsTest.checkResults(browserGrid);
        UtilsTest.changePage(browserGrid, 2);
        UtilsTest.checkResults(browserGrid);
        UtilsTest.changePage(browserGrid, 1);
        UtilsTest.checkResults(browserGrid);
    });

    it("5.4 Filters. Study and Cohorts: Cohort Alternate Stats", () => {
        UtilsTest.checkToolHeaderTitle("Variant Browser");
        BrowserTest.setCohortAlternateStats("", "ALL", "<", 0.00001);
        executeSearchQuery();
        UtilsTest.checkTableResults(browserGrid);
        UtilsTest.checkResults(browserGrid);
    });

    it("5.5 Filters. Genomic: Genomic Location", () => {
        BrowserTest.toggleSectionFilter("Genomic");
        BrowserTest.setGenomicLocation("1:5000000-10000000");
        // Execute Query
        executeSearchQuery();
        UtilsTest.checkTableResults(browserGrid);
        // Remove ActiveFilter
        BrowserTest.removeActiveFilters("region");
        UtilsTest.checkTableResults(browserGrid);

    });

    it("5.6 Filters. Genomic: Feature IDs", () => {
        BrowserTest.toggleSectionFilter("Genomic");
        UtilsTest.selectToken("feature-filter", "C5", true);
        BrowserTest.getActiveFilter().contains("XRef");
        UtilsTest.selectToken("feature-filter", "rs", true);
        executeSearchQuery();
        UtilsTest.checkTableResults(browserGrid);
        BrowserTest.removeActiveFilters("xref");
        UtilsTest.checkTableResults(browserGrid);
    });

    it("5.7 Filters. Genomic: Gene Biotype", () => {
        // Genomic: Gene Biotype
        BrowserTest.toggleSectionFilter("Genomic");
        BrowserTest.setGeneBiotype("protein_coding");
        executeSearchQuery();
        UtilsTest.checkTableResults(browserGrid);
        BrowserTest.removeActiveFilters("biotype");
        UtilsTest.checkTableResults(browserGrid);
    });

    it("5.8 Filters. Genomic: Variant", () => {
        // Genomic: Variant type cy.get('.magic-checkbox-wrapper > :nth-child(1) > label')
        BrowserTest.toggleSectionFilter("Genomic");
        BrowserTest.setVariantType(["SNV"]);
        executeSearchQuery();
        UtilsTest.checkTableResults(browserGrid);
        BrowserTest.removeActiveFilters("type");
        UtilsTest.checkTableResults(browserGrid);
    });

    it("5.9 Filters. Consequence type: LoF", () => {
        // Consequence type: SO Term - LoF Enabled
        BrowserTest.setConsequenceType("coding_sequence", "Loss-of-Function (LoF)");
        executeSearchQuery();
        UtilsTest.checkTableResults(browserGrid);
    });

    it("5.10 Filters. Consequence type: Missense", () => {
        // Consequence type: SO Term - Use example: Missense
        BrowserTest.setConsequenceType("terms_manual", ["missense_variant"]);
        executeSearchQuery();
        UtilsTest.checkTableResults(browserGrid);
        BrowserTest.removeActiveFilters("ct");
        UtilsTest.checkTableResults(browserGrid);
    });

    it("5.11 Filters. Population Frequency: 1000 Genomes - AFR < 0.0001 AND EUR > 0.0001", () => {
        // Population Frequency: 1000 Genomes - AFR < 0.001 AND EUR > 0.001
        BrowserTest.toggleSectionFilter("PopulationFrequency");
        BrowserTest.selectPopulationFrequency("1000G");
        BrowserTest.setPopulationFrequency("1000G", "ALL", "<", 0.001);
        executeSearchQuery();
        UtilsTest.checkTableResults(browserGrid);
        BrowserTest.removeActiveFilters("populationFrequencyAlt");
        BrowserTest.setPopulationFrequency("1000G", "AFR", ">", 0.001);
        BrowserTest.setPopulationFrequency("1000G", "EUR", ">", 0.001);
        executeSearchQuery();
        UtilsTest.checkTableResults(browserGrid);
        BrowserTest.removeActiveFilters("populationFrequencyAlt");
        UtilsTest.checkTableResults(browserGrid);
    });

    it("5.12 Filters. Population Frequency: gnomAD - Set all < 0.00001", () => {
        // Population Frequency: gnomAD - Set all < 0.00001
        BrowserTest.toggleSectionFilter("PopulationFrequency");
        BrowserTest.selectPopulationFrequency("GNOMAD_GENOMES");
        BrowserTest.setPopulationFrequency("GNOMAD_GENOMES", "Set_All", "<", 0.001);
        executeSearchQuery();
        UtilsTest.checkTableResults(browserGrid);
        BrowserTest.removeActiveFilters("populationFrequencyAlt");
        UtilsTest.checkTableResults(browserGrid);
    });

    it("5.13 Filters. Clinical: Disease Panels", () => {
        // Clinical: Disease Panels
        BrowserTest.setDiseasePanels("disease_panels", [
            "Childhood onset dystonia or chorea or related movement disorder",
            "Amelogenesis imperfecta"
        ]);

        // Execute Query
        executeSearchQuery();
        UtilsTest.checkResultsOrNot(browserGrid);
        BrowserTest.removeActiveFilters("panel");
    });

    it("5.14 Filters. Clinical and Disease: Clinical Annotation: Pathogenic", () => {
        // Clinical: ClinVar Accessions. Use example: Pathogenic
        BrowserTest.toggleSectionFilter("Clinical");
        BrowserTest.setClinicalAnnotation("clinical_significance", "Pathogenic");
        executeSearchQuery();
        UtilsTest.checkTableResults(browserGrid);
        BrowserTest.removeActiveFilters("clinicalSignificance");
        UtilsTest.checkTableResults(browserGrid);
    });

    it("5.15 Filters. Clinical and Disease: Full text: Mortality", () => {
        // Clinical and Disease: Full text. Use example: Mortality
        BrowserTest.toggleSectionFilter("Clinical");
        cy.get("fulltext-search-accessions-filter textarea").type("Mortality");
        executeSearchQuery();
        UtilsTest.checkResults(browserGrid);
        BrowserTest.removeActiveFilters("traits");
        UtilsTest.checkResults(browserGrid);
    });

    it("5.16 Filters. GO and HPO", () => {
        // Phenotype only search by id, no name
        BrowserTest.toggleSectionFilter("Phenotype");
        BrowserTest.setGoAccesions("GO:0001840");
        executeSearchQuery();
        UtilsTest.checkResults(browserGrid);
        BrowserTest.removeToken("go-accessions-filter", "GO:0001840");

        // HPO
        BrowserTest.setHpoAccesions("HP:0030983");
        executeSearchQuery();
        UtilsTest.checkResults(browserGrid);
        BrowserTest.removeToken("hpo-accessions-filter", "HP:0030983");
    });

    it("5.17 Filters. Deleteriousness: Sift / Polyphen - OR operation", () => {
        BrowserTest.toggleSectionFilter("Deleteriousness");
        BrowserTest.setProteingSubsScore("sift", "Score", "<", 0.1);
        BrowserTest.setProteingSubsScore("polyphen", "Score", "<", 0.1);
        executeSearchQuery();
        UtilsTest.checkTableResults(browserGrid);
        BrowserTest.removeActiveFilters("proteinSubstitution");
        UtilsTest.checkTableResults(browserGrid);
    });

    it("5.18 Filters. Deleteriousness: Sift / Polyphen - AND operation", () => {
        // Deleteriousness: Sift / Polyphen - AND operation
        BrowserTest.toggleSectionFilter("Deleteriousness");
        BrowserTest.setProteingSubsScore("sift", "Tolerated");
        BrowserTest.setProteingSubsScore("polyphen", "Possibly damaging");
        // or o and
        BrowserTest.setProteingSubsScore("operator", "and");
        executeSearchQuery();
        UtilsTest.checkTableResults(browserGrid);
        BrowserTest.removeActiveFilters("proteinSubstitution");
        UtilsTest.checkTableResults(browserGrid);
    });

    it("5.19 Filters. Conservation: PhyloP", () => {
        BrowserTest.toggleSectionFilter("Conservation");
        BrowserTest.setConservation("phylop", 1);
        BrowserTest.setConservation("phastCons", 1);
        BrowserTest.setConservation("gerp", 1);
        executeSearchQuery();
        UtilsTest.checkTableResults(browserGrid);
        BrowserTest.removeActiveFilters("conservation");
        UtilsTest.checkTableResults(browserGrid);
    });

    it.skip("5.20 Check gene-view", () => {
        cy.get("button[data-id='table-tab']", { timeout: TIMEOUT }).click();
        cy.get("variant-browser-grid .bootstrap-table .fixed-table-container tr[data-index='0'] a.gene-tooltip:first-child")
            .should("be.visible", { timeout: TIMEOUT })
            .click({ force: true });
        // .trigger('mouseover'); // .trigger('mouseover') doesn't work in this case as the hover action changes the DOM
        cy.get(".qtip-content").find("a[data-cy='gene-view']").click({ force: true });
        cy.get("div.page-title h2").contains(/Gene [a-z0-9:]+/gim);
    });

    // Variant Browser: Tabs
    it("5.21 checks Variant Browser detail tabs", () => {

        cy.get("variant-browser-detail > detail-tabs > div.panel > h3")
            .scrollIntoView()
            .should("contain", "Selected Variant:");

        cy.get("cellbase-variant-annotation-summary h3").contains("Summary");

        BrowserTest.showVariantBrowserTab(browserDetail, "annotationConsType");
        UtilsTest.checkTableResults("variant-consequence-type-view");

        // NOTE, it should be has a table
        BrowserTest.showVariantBrowserTab(browserDetail, "annotationPropFreq");
        // // UtilsTest.checkTableResults("cellbase-population-frequency-grid");

        BrowserTest.showVariantBrowserTab(browserDetail, "annotationClinical");
        UtilsTest.checkResultsOrNot("variant-annotation-clinical-view");

        BrowserTest.showVariantBrowserTab(browserDetail, "cohortStats");
        UtilsTest.checkResultsOrNot("variant-cohort-stats-grid");

        BrowserTest.showVariantBrowserTab(browserDetail, "samples");
        UtilsTest.checkTableResults("variant-samples");

        BrowserTest.showVariantBrowserTab(browserDetail, "beacon");
        cy.get("variant-beacon-network")
            .find(".beacon-square")
            .should("have.length", 15);

        BrowserTest.showVariantBrowserTab(browserDetail, "json-view");
    });

    it.skip("5.22 aggregated query", () => {

        cy.get("variant-browser-filter a[data-cy-section-title='ConsequenceType']").click();
        cy.get("consequence-type-select-filter input[value='Loss-of-Function (LoF)'").click({ force: true });

        cy.get("a[href='#facet_tab']").click({ force: true });

        UtilsTest.vfacet.selectDefaultFacet();
        // cy.get("button.default-facets-button").click(); // default facets selection (chromosome, type)

        UtilsTest.facet.select("Gene");
        // cy.get("facet-filter .facet-selector li a").contains("Gene").click({force: true}); // gene facets selection

        cy.get("#type_Select a").contains("INSERTION").click({ force: true }); // type=INSERTION
        UtilsTest.Facet.checkActiveFacet("type", "type[INSERTION]");
        // cy.get("div.facet-wrapper button[data-filter-name='type']").contains("type[INSERTION]");

        UtilsTest.Facet.checkActiveFacetLength(3);
        cy.get("div.cy-search-button-wrapper button").click();
        UtilsTest.facet.checkResultLength(3);
        // cy.get("opencb-facet-results", {timeout: 120000}).find("opencga-facet-result-view", {timeout: TIMEOUT}).should("have.lengthOf", 3); // 2 default fields + genes

        UtilsTest.facet.select("Chromosome"); // removing chromosome
        UtilsTest.facet.checkActiveFacetLength(2);
        cy.get("div.cy-search-button-wrapper button").click();
        UtilsTest.facet.checkResultLength(2);

        UtilsTest.facet.removeActive("type");
        UtilsTest.facet.checkResultLength(1);
        UtilsTest.facet.removeActive("genes");
        UtilsTest.facet.checkResultLength(0);

    });
});
