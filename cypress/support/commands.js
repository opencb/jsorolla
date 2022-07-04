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

// get by selector
Cypress.Commands.add("getBySel", (selector, ...args) => {
    return cy.get(`[data-cy=${selector}]`, ...args);
});

// get by selector like..
Cypress.Commands.add("getBySelLike", (selector, ...args) => {
    return cy.get(`[data-cy*=${selector}]`, ...args);
});

// Login without enter UI
Cypress.Commands.add("loginByApi", (
    user = Cypress.env("username"),
    password = Cypress.env("password")
) => {
    cy.request("POST", `${Cypress.env("apiUrl")}/users/login`, {
        user,
        password,
    }).then(res => {
        // cy.setCookie("sessionId", response.body.sessionId);
        console.log("res", res);
        cy.setCookie("iva-test_sid", res.body.responses[0].results[0].token);
        cy.setCookie("iva-test_userId", user);
        cy.visit("");
    });
});

Cypress.Commands.add("setVariantQuery", (filter, value) => {

    // setVariantQuery(ct,value);

    // Filter by Feature Type
    // Panel Intersection
    // Filter Genes by Mode of Inheritance
    // Filter Genes by Confidence
    // Filter Genes by Role in Cancer

    const filters = {
        "ds": "Select Disease Panels",
        "pi": "Panel Intersenction",

    };

    switch (filters[filter]) {
        case "ds":
            cy.get("disease-panel-filter div").contains("span", "Select Disease Panels").as("diseaseFilter");
            return cy.get("@diseaseFilter").parent().within(() => {
                cy.get("select-field-filter select")
                    .select([4], {force: true})
                    .invoke("val")
                    .should("deep.equal", [value]);
            });
        default:
            break;
    }


    return filters[filter](value);
});


Cypress.Commands.add("diseasePanels", (filter, value) => {

    // setVariantQuery(ct,value);

    // Filter by Feature Type
    // Panel Intersection
    // Filter Genes by Mode of Inheritance
    // Filter Genes by Confidence
    // Filter Genes by Role in Cancer

    const filters = {
        "disease_panels": "Select Disease Panels",
        "panel_intersection": "Panel Intersection",
        "feature_type": "Filter by Feature Type",
        "genes_by_moi": "Filter Genes by Mode of Inheritance",
        "genes_by_confidence": "Filter Genes by Confidence",
        "genes_by_roles_in_cancer": "Filter Genes by Role in Cancer"
    };

    // Select Disease Panels
    // cy.get("disease-panel-filter div").contains("span", "Select Disease Panels").as("diseaseFilter");
    // cy.get("@diseaseFilter").parent().within(() => {
    //     cy.get("select-field-filter select")
    //         .select([4], {force: true})
    //         .invoke("val")
    //         .should("deep.equal", ["Amelogenesis_imperfecta-PanelAppId-269"]);
    // });

    switch (filter) {
        case "disease_panels":
        case "feature_type":
        case "genes_by_moi":
        case "genes_by_confidence":
        case "genes_by_roles_in_cancer":
            cy.get("disease-panel-filter div").contains("span", filters[filter]).as("diseaseFilter");
            cy.get("@diseaseFilter").parent().within(() => {
                cy.get("select-field-filter ul[role='presentation']").contains(value).click({force: true});
            });
            break;
        case "panel_intersection":
            cy.get("disease-panel-filter div").contains("span", filters[filter]).as("diseaseFilter");
            cy.get("@diseaseFilter").parent().within(() => {
                cy.get("toggle-switch button").contains(value).click({force: true});
            });
            break;

    }


});

Cypress.Commands.add("clinicalAnnotation", (filter, value) => {
    // clinical-annotation-filter
    // Select Clinical Database
    // Select Clinical Significance
    // CheckBox Status
    const filters = {
        "clinical_database": "Select Clinical Database",
        "clinical_significance": "Select Clinical Significance",
    };

    // Select Clinical Database
    // cy.get("clinical-annotation-filter ").contains("span", "Select Clinical Database").as("clinicalDbFilter");
    // cy.get("@clinicalDbFilter").parent().within(() =>{
    //     cy.get("select-field-filter select")
    //         .select(["clinvar"], {force: true})
    //         .invoke("val")
    //         .should("deep.equal", ["clinvar"]);
    // });

    switch (filter) {
        case "clinical_database":
        case "clinical_significance":
            cy.get("clinical-annotation-filter").contains("span", filters[filter]).as("clinicalDbFilter");
            cy.get("@clinicalDbFilter").parent().within(() => {
                cy.get("select-field-filter ul[role='presentation']").contains(value).click({force: true});
            });
            break;
        case "clinical_status":
            // cy.get("clinical-annotation-filter").contains("span", "Check Status").as("clinicalDbFilter");
            // cy.get("@clinicalDbFilter").parent().within(() => {
            //     cy.get("checkbox-field-filter input[value='Confirmed']").check({force: true});
            // });
            cy.get("clinical-annotation-filter").contains("span", "Check Status").as("clinicalDbFilter");
            cy.get("@clinicalDbFilter").parent().within(() => {
                cy.get("checkbox-field-filter input[value='Confirmed']").invoke("prop", "checked", value);
            });
    }
});

