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
import {setCheckBox, checkLabel, setInput, clickElement} from "./utils";


Cypress.Commands.add("setGenomicLocation", value => {
    checkLabel("div[data-cy='region']", "span", "Genomic Location");
    setInput("region-filter textarea", value);
});

Cypress.Commands.add("setFeatureIds", value => {
    const val = Array.isArray(value) ? value.join("{enter}") + "{enter}": value;
    // Select2 Widgets
    cy.get("div[data-cy='feature']").contains("span", "Feature IDs (gene, SNPs...)");
    cy.get("feature-filter select-token-filter ul").click({force: true});
    cy.get("div[data-cy='feature'] .select2-search__field").type(val, {delay: 200});
});

Cypress.Commands.add("setGeneBiotype", value => {
    cy.get("div[data-cy='biotype']").contains("span", "Gene Biotype");
    cy.get(".subsection-content biotype-filter select-field-filter ul[role='presentation']").contains(value).click({force: true});
});

Cypress.Commands.add("setVariantType", value => {
    cy.get("div[data-cy='type']").contains("span", "Variant Type");
    if (Array.isArray(value)) {
        value.forEach(val => {
            // cy.get(`variant-type-filter checkbox-field-filter ul > li > input[value='${key}'`).invoke("prop", "checked", value[key]);
            // setCheckBox(`variant-type-filter checkbox-field-filter ul > li > input[value='${key}'`, value[key]);
            cy.get(`variant-type-filter checkbox-field-filter ul > li > input[value='${val}'`).click({force: true});
        });
    }
    if (value === "all") {
        return cy.get("variant-type-filter button").contains("Select all").click();
    }
});

// Clinical
Cypress.Commands.add("setDiseasePanels", (filter, value) => {
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
                value.map(val => {
                    cy.get("select-field-filter ul[role='presentation']").contains(val).click({force: true});
                });
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
                // cy.get("checkbox-field-filter input[value='Confirmed']").invoke("prop", "checked", value);
                setCheckBox("checkbox-field-filter input[value='Confirmed']", value);
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
            // cy.get(`consequence-type-select-filter label input[value='${filters[filter]}']`).invoke("prop", "checked", value);
            // setCheckBox(`consequence-type-select-filter label input[value='${filters[filter]}']`, value);
            // cy.get("input[value*=LoF]").click({force: true});
            cy.get(`consequence-type-select-filter label input[value='${filters[filter]}']`).click({force: true});
            break;
        case "terms_manual":
            cy.get("consequence-type-select-filter").contains("span", filters[filter]);
            value.forEach(val => {
                cy.get("consequence-type-select-filter select-field-filter ul[role='presentation']").contains(val).click({force: true});
            });

    }

});

Cypress.Commands.add("setStudyFilter", (filter, value) => {

});

Cypress.Commands.add("setCohortAlternateStats", (filter, value) => {

});

Cypress.Commands.add("setPopulationFrequency", (population, filter, opt, val) => {

    // 1000G
    // GNOMAD_GENOMES
    // cy.get("population-frequency-filter div[data-cy='pop-freq-codes-wrapper-GNOMAD_GENOMES']").should("be.visible");

    if (filter === "Set_All") {
        cy.get(`population-frequency-filter div[data-cy='pop-freq-codes-wrapper-${population}'] input[data-mode='all']`).type(val);
    } else {
        cy.get("div[data-cy='populationFrequency']")
            .contains("span", "Select Population Frequency");

        // Show Collapse
        // cy.get(`i[data-cy='pop-freq-toggle-${population}']`).click();

        // Select
        cy.get(`population-frequency-filter div[data-cy='number-field-filter-wrapper-${filter}'] select-field-filter ul[role='presentation']`)
            .contains(opt)
            .click({force: true});

        // Typing
        cy.get(`population-frequency-filter div[data-cy='pop-freq-codes-wrapper-${population}'] div[data-cy='number-field-filter-wrapper-${filter}'] input[data-field='value']`)
            .type(val);

    }


});

Cypress.Commands.add("setGoAccesions", value =>{
    // GO Accessions (max. 100 terms)
    // todo: remove token

    cy.get("go-accessions-filter .select2").first().click({force: true})
        .find(".select2-search__field").type(value + "{enter}", {delay: 200});

});


Cypress.Commands.add("setHpoAccesions", value =>{
// HPO Accessions
    cy.get("hpo-accessions-filter .select2").first().click({force: true})
        .find(".select2-search__field").type(value + "{enter}", {delay: 200});
});

Cypress.Commands.add("setProteingSubsScore", (filter, score, opt, value) =>{
    switch (filter) {
        case "sift":
        case "polyphen":
            cy.get(`protein-substitution-score-filter .${filter} .score-select .dropdown a`).contains(score).click({force: true});
            if (score === "Score") {
                cy.get(`protein-substitution-score-filter .${filter} .score-comparator .select-field-filter`).click();
                cy.get(`protein-substitution-score-filter .${filter} .score-comparator .dropdown-menu`)
                    .contains(opt)
                    .click();
                cy.get(`protein-substitution-score-filter .${filter} .score-value input[type='number']`)
                    .type(value);
            }
            break;
        case "operator":
            cy.get(`protein-substitution-score-filter .rating-label-${score}`).click();
            break;
    }

});

Cypress.Commands.add("setCadd", (opt, value) =>{
    // opt, value
    cy.get("protein-substitution-score-filter .polyphen .score-comparator .select-field-filter").click();
    cy.get("protein-substitution-score-filter .polyphen .score-comparator .dropdown-menu").contains(opt).click();
    cy.get("protein-substitution-score-filter .polyphen .score-value input[type='number']").type(value);
});

Cypress.Commands.add("setConservation", (filter, value) =>{
    cy.get(`conservation-filter .cf-${filter} input[type='text']`).type(value);
});

Cypress.Commands.add("setClinicalFullText", value =>{
    cy.get("variant-browser-filter fulltext-search-accessions-filter textarea[name='traits']").type(value);
});

Cypress.Commands.add("sectionFilter", section => {
    cy.get(`variant-browser-filter a[data-cy-section-title='${section}']`).click();
});

Cypress.Commands.add("removeActiveFilters", filterName => {
    // cy.get("opencga-active-filters button[data-filter-name='go']").contains("GO:0014046");
    cy.get(`opencga-active-filters button[data-filter-name='${filterName}']`).click();
});

Cypress.Commands.add("showVariantBrowserTab", tab => {
    cy.get(`variant-browser-detail [data-id='${tab}']`).click();


});
