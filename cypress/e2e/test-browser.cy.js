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

import {login, goTo} from "../plugins/utils.js";

context("Case Interpreter", () => {
    before(() => {
        cy.loginByApi();
        cy.visit("index.html#clinicalAnalysisPortal/family/platinum");
        cy.wait(2000);
    });

    // it("Does not do much!", () => {
    //     expect(true).to.equal(true);
    // });

    // it("Select illumina platinum study", ()=>{
    //     // nav navbar-nav navbar-right .dropdown project-name study-id
    //     cy.getBySel("active-study").within(() => {
    //         cy.get(".project-name").should("have.text", "Family Studies GRCh38");
    //         cy.get(".study-id").should("have.text", "Illumina Platinum");
    //     });
    // });

    it("select case: maria", () => {
        cy.get("table").within(() => {
            cy.get("tr[data-uniqueid=MARIA]").as("mariaCase");
            cy.get("@mariaCase").find("a").contains("MARIA").click();
        });
        cy.get("a[data-view=variant-browser]").wait(2000).click();
        // cy.get("a[data-view=variant-browser]").contains("Sample Variant Browser").click();
        // cy.get(".variant-interpreter-wizard a.variant-interpreter-step").contains("Sample Variant Browser").click();
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

        cy.setGenomic("gene_biotype", "nonsense_mediated_decay");
        cy.setGenomic("genomic_location", "3:444-55555,1:1-100000");
        // cy.setGenomic("variant_type", {"SNV": false, "INSERTION": true});

        // cy.get("variant-interpreter-browser-template .search-button-wrapper").contains("button", "Search").click();
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


