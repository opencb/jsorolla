/**
 * Copyright 2015-2022 OpenCB
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

import UtilsTest from "./utils-test.js";


export default class BrowserTest {

    // Should this command be used for all tests?
    static selectStudy = fqn => {
        // fqn example: demo@family:platinum
        cy.get(`ul[class='dropdown-menu'] li a[data-cy-fqn='${fqn}']`, { timeout: 6000 }).click({ force: true });
    }

    static setGenomicLocation = value => {
        UtilsTest.checkLabel("div[data-cy='region']", "span", "Genomic Location");
        UtilsTest.setInput("region-filter textarea", value);

    }

    static selectCaseVariantBrowser = caseName => {
        cy.get("table").within(() => {
            cy.get(`tr[data-uniqueid=${caseName}]`).as("selectedCase");
            cy.get("@selectedCase").find("a").contains(caseName).click();
        });
    };

    static variantInterpreterWizard = name => {
        cy.get(`a[data-view=${name}]`)
            .should("not.have.class", "disabled")
            .click();
    };

    // All browser has filters
    static saveCurrentFilter = data => {
        // Open the filters
        cy.get("button[data-cy='filter-button']").click({ force: true });

        // save current
        cy.get("ul.saved-filter-wrapper a[data-action='active-filter-save']")
            .contains("Save current filter")
            .click();
        // Wait modal should be visible
        cy.wait(500);
        cy.get("input[data-cy='modal-filter-name']").type(data.name);
        cy.get("input[data-cy='modal-filter-description']").type(data.description);
        cy.get("button[data-cy='modal-filter-save-button']").click();
    };

    // All browser has filters
    static removeFilters = name => {
        cy.get(".active-filter-label").click();
        cy.get("ul.saved-filter-wrapper").contains(name);
        cy.get(`span.action-buttons i[data-cy=delete][data-filter-id='${name}']`).click();
        cy.get("#myModalLabel").contains("Are you sure?");
        cy.get(":nth-child(5) > .modal > .modal-dialog > .modal-content > .modal-footer > .btn-primary").click();
    };

    // Should be command for all test?
    static checkNotificationManager = msg => {
        cy.get(".notification-manager", { timeout: 500 }).contains(msg)
            .should("be.visible");
    };

    static setFeatureIds = value => {
        const val = Array.isArray(value) ? value.join("{enter}") + "{enter}" : value;
        // Select2 Widgets
        cy.get("div[data-cy='feature']").contains("span", "Feature IDs (gene, SNPs, ...)");
        cy.get("feature-filter select-token-filter ul").click({ force: true });
        cy.get("div[data-cy='feature'] .select2-search__field").type(val, { delay: 200 });
    };

    static setGeneBiotype = value => {
        cy.get("div[data-cy='biotype']").contains("span", "Gene Biotype");
        cy.get(".subsection-content biotype-filter select-field-filter ul[role='presentation']").contains(value).click({ force: true });
    };

    static setVariantType = value => {
        cy.get("div[data-cy='type']").contains("span", "Variant Type");
        if (Array.isArray(value)) {
            value.forEach(val => {
                // cy.get(`variant-type-filter checkbox-field-filter ul > li > input[value='${key}'`).invoke("prop = "checked", value[key]);
                // setCheckBox(`variant-type-filter checkbox-field-filter ul > li > input[value='${key}'`, value[key]);
                cy.get(`variant-type-filter checkbox-field-filter ul > li > input[value='${val}'`).click({ force: true });
            });
        }
        if (value === "all") {
            return cy.get("variant-type-filter button").contains("Select all").click();
        }
    };

    // Clinical
    static setDiseasePanels = (filter, value) => {
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
                        cy.get("select-field-filter ul[role='presentation']").contains(val).click({ force: true });
                    });
                });
                break;
            case "panel_intersection":
                cy.get("@diseaseFilter").parent().within(() => {
                    cy.get("toggle-switch button").contains(value).click({ force: true });
                });
                break;
        }
    };

    static setClinicalAnnotation = (filter, value) => {
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
                        value.forEach(val => cy.get("select-field-filter ul[role='presentation']").contains(val).click({ force: true }));
                    } else {
                        cy.get("select-field-filter ul[role='presentation']").contains(value).click({ force: true });
                    }
                });
                break;
            case "clinical_status":
                cy.get("@clinicalDbFilter").parent().within(() => {
                    // cy.get("checkbox-field-filter input[value='Confirmed']").invoke("prop", "checked", value);
                    UtilsTest.setCheckBox("checkbox-field-filter input[value='Confirmed']", value);
                });
        }
    };

    static setConsequenceType = (filter, value) => {
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
                cy.get(`consequence-type-select-filter label input[value='${filters[filter]}']`).click({ force: true });
                break;
            case "terms_manual":
                cy.get("consequence-type-select-filter").contains("span", filters[filter]);
                value.forEach(val => {
                    cy.get("consequence-type-select-filter select-field-filter ul[role='presentation']").contains(val).click({ force: true });
                });
        }
    };

    static setCohortAlternateStats = (cohort, filter, opt, value) => {
        // cy.get("[data-cohort='ALL']");

        // Select
        cy.get(`cohort-stats-filter div[data-cy='number-field-filter-wrapper-${filter}'] select-field-filter ul[role='presentation']`)
            .contains(opt)
            .click({ force: true });

        // Typing
        cy.get(`cohort-stats-filter div[data-cy='number-field-filter-wrapper-${filter}'] input[data-field='value']`).first()
            .type(value, { force: true });
    };

    static selectPopulationFrequency = population => {
        // Show Collapse
        cy.get(`i[data-cy='pop-freq-toggle-${population}']`).click();
    };

    static setPopulationFrequency = (population, filter, opt, value) => {

        // 1000G
        // GNOMAD_GENOMES
        // cy.get("population-frequency-filter div[data-cy='pop-freq-codes-wrapper-GNOMAD_GENOMES']").should("be.visible");

        if (filter === "Set_All") {
            cy.get(`population-frequency-filter div[data-cy='pop-freq-codes-wrapper-${population}'] input[data-mode='all']`).type(value);
        } else {
            cy.get("div[data-cy='populationFrequency']")
                .contains("span", "Select Population Frequency");

            // Select
            cy.get(`population-frequency-filter div[data-cy='number-field-filter-wrapper-${filter}'] select-field-filter ul[role='presentation']`)
                .contains(opt)
                .click({ force: true });

            // Typing
            cy.get(`population-frequency-filter div[data-cy='pop-freq-codes-wrapper-${population}'] div[data-cy='number-field-filter-wrapper-${filter}'] input[data-field='value']`)
                .type(value);
        }
    };

    static setPopulationFrequencyInterpreter = (population, filter, opt, value) => {

        if (filter === "Set_All") {
            cy.get(`population-frequency-filter div[data-cy='pop-freq-codes-wrapper-${population}'] input[data-mode='all']`).type(value);
        } else {
            cy.get("div[data-cy='populationFrequency']")
                .contains("span", "Select Population Frequency");

            cy.get(`population-frequency-filter div[data-cy='pop-freq-codes-wrapper-${population}'] select-field-filter[data-cy='comparator']`)
                .then($elm => {
                    // This way to know the value has default
                    const currentValue = $elm["0"].__value;
                    if (currentValue !== opt) {
                        cy.get("population-frequency-filter select-field-filter[data-cy='comparator'] ul[role='presentation']")
                            .contains(opt)
                            .click({ force: true });
                    } else {
                        cy.get("population-frequency-filter  select-field-filter[data-cy='comparator'] button").contains("span", opt);
                    }
                });

            cy.get(`population-frequency-filter div[data-cy='pop-freq-codes-wrapper-${population}'] select-field-filter[placeholder='Frequency ...'] ul[role='presentation']`)
                .contains(value)
                .click({ force: true });
        }
    };

    static setGoAccesions = value => {
        // GO Accessions (max. 100 terms)
        // todo: remove token
        cy.get("go-accessions-filter .select2").first().click({ force: true })
            .find(".select2-search__field").type(value + "{enter}", { delay: 200 });

    };

    static setHpoAccesions = value => {
        // HPO Accessions
        cy.get("hpo-accessions-filter .select2").first().click({ force: true })
            .find(".select2-search__field").type(value + "{enter}", { delay: 200 });
    };

    static setProteingSubsScore = (filter, score, opt, value) => {
        switch (filter) {
            case "sift":
            case "polyphen":
                cy.get(`protein-substitution-score-filter .${filter} .score-select .dropdown a`).contains(score).click({ force: true });
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

    };

    static setCadd = (opt, value) => {
        // opt, value
        cy.get("protein-substitution-score-filter .polyphen .score-comparator .select-field-filter").click();
        cy.get("protein-substitution-score-filter .polyphen .score-comparator .dropdown-menu").contains(opt).click();
        cy.get("protein-substitution-score-filter .polyphen .score-value input[type='number']").type(value);
    };

    static setConservation = (filter, value) => {
        cy.get(`conservation-filter .cf-${filter} input[type='text']`).type(value);
    };

    static setClinicalFullText = value => {
        cy.get("variant-browser-filter fulltext-search-accessions-filter textarea[name='traits']").type(value);
    };

    static sectionFilter = section => {
        cy.get(`variant-browser-filter a[data-cy-section-title='${section}']`).click();
    };

    static getActiveFilter = () => {
        return cy.get("opencga-active-filters");
    }

    static removeActiveFilters = filter => {
        cy.get(`opencga-active-filters button[data-filter-name='${filter}']`).click();
    };

    /**
         * Remove from a token from a select2 textarea
         * @param {String} filterSelector CSS selector of the filter
         * @param {Number} value value to look for in the autocomplete dropdown
     */
    static removeToken = (filterSelector, value) => {
        cy.get(`${filterSelector} .select2`)
            .first()
            .contains(".select2-selection__choice", value)
            .find(".select2-selection__choice__remove")
            .click();
        cy.get(`${filterSelector} .select2-selection`)
            .first()
            .focus()
            .blur();
        // TODO better check how reliable it is to blur the textarea
    };

    // Soon
    static actionActiveFilter = () => {
        // get
        // remove

    }

    static caseInterpreterWizard = view => {
        // select,qc,variant-browser,review,report
        cy.get(`.variant-interpreter-step [data-view=${view}]`).click();
    };

    static showVariantBrowserTab = (component, tab) => {
        cy.get(`${component} [data-id='${tab}']`).click({ force: true });
    };

    static toggleSectionFilter = (filter) => {
        cy.get(`section-filter a[data-cy-section-title=${filter}]`).click();
    }


}
