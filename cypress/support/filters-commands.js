// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })


import UtilsNew from "../../src/core/utilsNew.js";


Cypress.Commands.add("setSample", (filter, value) =>{

});

Cypress.Commands.add("setGenomic", (filter, value) =>{

    const filters = {
        genomic_location: "Genomic Location",
        feature_ids: "",
        gene_biotype: "Gene Biotype",
        variant_type: "Variant Type",
    };

    switch (filter) {
        case "genomic_location":
            cy.get("div[data-cy='region']").contains("span", filters[filter]);
            cy.get("region-filter textarea").type(value);
            break;
        case "gene_biotype":
            cy.get("div[data-cy='biotype']").contains("span", filters[filter]);
            cy.get(".subsection-content biotype-filter select-field-filter ul[role='presentation']").contains(value).click({force: true});
            break;
        case "variant_type":
            cy.get("div[data-cy='type']").contains("span", filters[filter]);
            if (UtilsNew.isObject(value)) {
                return Object.keys(value).forEach(key => {
                    cy.get(`variant-type-filter checkbox-field-filter ul > li > input[value='${key}'`).invoke("prop", "checked", value[key]);
                });
            }
            if (value === "all") {
                return cy.get("variant-type-filter button").contains("Select all").click();
            }
            break;
    }

});

// Clinical
Cypress.Commands.add("setDiseasePanels", (filter, value) => {

    // setVariantQuery(ct,value);

    const filters = {
        "disease_panels": "Select Disease Panels",
        "panel_intersection": "Panel Intersection",
        "feature_type": "Filter by Feature Type",
        "genes_by_moi": "Filter Genes by Mode of Inheritance",
        "genes_by_confidence": "Filter Genes by Confidence",
        "genes_by_roles_in_cancer": "Filter Genes by Role in Cancer"
    };

    cy.get("disease-panel-filter div").contains("span", filters[filter]).as("diseaseFilter");

    switch (filter) {
        case "disease_panels":
        case "feature_type":
        case "genes_by_moi":
        case "genes_by_confidence":
        case "genes_by_roles_in_cancer":
            cy.get("@diseaseFilter").parent().within(() => {
                cy.get("select-field-filter ul[role='presentation']").contains(value).click({force: true});
            });
            break;
        case "panel_intersection":
            cy.get("@diseaseFilter").parent().within(() => {
                cy.get("toggle-switch button").contains(value).click({force: true});
            });
            break;
    }
});

Cypress.Commands.add("setClinicalAnnotation", (filter, value) => {
    // clinical-annotation-filter
    const filters = {
        "clinical_database": "Select Clinical Database",
        "clinical_significance": "Select Clinical Significance",
        "clinical_status": "Check Status"
    };

    cy.get("clinical-annotation-filter").contains("span", filters[filter]).as("clinicalDbFilter");

    switch (filter) {
        case "clinical_database":
        case "clinical_significance":
            cy.get("@clinicalDbFilter").parent().within(() => {
                if (Array.isArray(value)) {
                    value.forEach(val => cy.get("select-field-filter ul[role='presentation']").contains(val).click({force: true}));
                } else {
                    cy.get("select-field-filter ul[role='presentation']").contains(value).click({force: true});
                }
            });
            break;
        case "clinical_status":
            cy.get("@clinicalDbFilter").parent().within(() => {
                cy.get("checkbox-field-filter input[value='Confirmed']").invoke("prop", "checked", value);
            });
    }
});

Cypress.Commands.add("setConsequenceType", (filter, value) => {
    const filters = {
        "lof": "Loss-of-Function (LoF)",
        "missense": "Missense",
        "protein_altering": "Protein Altering",
        "coding_sequence": "Coding Sequence",
        "terms_manual": "Or select terms manually:"
    };

    switch (filter) {
        case "lof":
        case "missense":
        case "protein_altering":
        case "coding_sequence":
            // cy.get("consequence-type-select-filter label input[value='Coding Sequence']").check();
            cy.get(`consequence-type-select-filter label input[value='${filters[filter]}']`).invoke("prop", "checked", value);
            break;
        case "terms_manual":
            cy.get("consequence-type-select-filter").contains("span", filters[filter]);
            cy.get("consequence-type-select-filter select-field-filter ul[role='presentation']").contains(value).click({force: true});
    }

});

Cypress.Commands.add("setPopulationFrequency", (filter, value) => {
});

Cypress.Commands.add("setPhenotype", (filter, value) =>{
});

Cypress.Commands.add("setDeleteriousness", (filter, value) =>{
});

Cypress.Commands.add("setConservation", (filter, value) =>{
});
