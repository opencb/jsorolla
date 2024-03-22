import Utils from "../../support/utils.js";
import vb from "../../fixtures/variant-browser-grid.js";

context("Variant Browser Grid (Validation)", () => {
    beforeEach(() => {
        cy.visit("#variant-browser-grid-validation");
        cy.get("variant-browser-grid table")
            .as("variantBrowserTable");
        cy.get(`variant-browser-grid opencb-grid-toolbar`)
            .as("variantBrowserToolbar");
        cy.waitUntil(() => {
            return cy.get("@variantBrowserTable")
                .should("be.visible");
        });
    });

    context("Grid", () => {
        context("Population Frequencies", () => {
            it("should exist", () => {
                cy.get("@variantBrowserTable")
                    .find(`th[data-field="${vb.grid.population.id}"]`)
                    .should("exist")
                    .and("contain.text", vb.grid.population.text);
            });

            it("should contain one subcolumn for each population project", () => {
                vb.grid.population.subColumnsItems.forEach(column => {
                    cy.get("@variantBrowserTable")
                        .find(`th[data-field="${column.id}"]`)
                        .should("exist")
                        .and("contain.text", column.text);
                });
            });

            // Generate one context test for each variant defined in vb.variants
            vb.variants.forEach(variant => {
                context(`For variant '${variant.id}'`, () => {
                    context("With 'FREQUENCY_BOX' mode enabled", () => {
                        it("should render one box for each population", () => {
                            vb.grid.population.subColumnsItems.forEach((item, index) => {
                                cy.get("@variantBrowserTable")
                                    .find(`tr[data-uniqueid="${variant.id}"] > td`)
                                    .eq(vb.grid.population.subColumnsIndex + index)
                                    .find(`table td`)
                                    .should("have.length", vb.grid.population.metadata.populations.length);
                            });
                        });

                        it("should encode population color in each box", () => {
                            vb.grid.population.subColumnsItems.forEach((item, index) => {
                                cy.get("@variantBrowserTable")
                                    .find(`tr[data-uniqueid="${variant.id}"] > td`)
                                    .eq(vb.grid.population.subColumnsIndex + index)
                                    .find(`table td`)
                                    .each((el, i) => {
                                        const hexColor = variant.populations[index].frequencyBoxMode.colors[i];
                                        cy.wrap(el)
                                            .should("have.css", "background-color", Utils.hexToRgb(hexColor));
                                    });
                            });
                        });

                        it("should display 'Allele ALT' values in a tooltip", () => {
                            vb.grid.population.subColumnsItems.forEach((item, index) => {
                                // eslint-disable-next-line cypress/no-force
                                cy.get("@variantBrowserTable")
                                    .find(`tr[data-uniqueid="${variant.id}"] > td`)
                                    .eq(vb.grid.population.subColumnsIndex + index)
                                    .find(`a`)
                                    .trigger("mouseover", {force: true});

                                // eslint-disable-next-line cypress/no-unnecessary-waiting
                                cy.wait(50).then(() => {
                                    cy.get("div.qtip")
                                        .eq(index)
                                        .find(`div.qtip-content > table > tbody > tr`)
                                        .each((el, i) => {
                                            cy.wrap(el)
                                                .find(`td:nth(1)`)
                                                .should("contain.text", variant.populations[index].frequencyBoxMode.tooltip.altFreqText[i]);
                                        });
                                });
                            });
                        });

                        it("should display 'Genotype HOM_ALT' values in tooltip", () => {
                            vb.grid.population.subColumnsItems.forEach((item, index) => {
                                // eslint-disable-next-line cypress/no-force
                                cy.get("@variantBrowserTable")
                                    .find(`tr[data-uniqueid="${variant.id}"] > td`)
                                    .eq(vb.grid.population.subColumnsIndex + index)
                                    .find(`a`)
                                    .trigger("mouseover", {force: true});

                                // eslint-disable-next-line cypress/no-unnecessary-waiting
                                cy.wait(50).then(() => {
                                    cy.get("div.qtip")
                                        .eq(index)
                                        .find(`div.qtip-content > table > tbody > tr`)
                                        .each((el, i) => {
                                            cy.wrap(el)
                                                .find(`td:nth(2)`)
                                                .should("contain.text", variant.populations[index].frequencyBoxMode.tooltip.genotypeHomAltFreqText[i]);
                                        });
                                });
                            });
                        });
                    });

                    context("With 'FREQUENCY_NUMBER' mode enabled", () => {
                        beforeEach(() => {
                            cy.get("@variantBrowserToolbar")
                                .find(`button[data-action="settings"]`)
                                .click();
                            cy.get("@variantBrowserToolbar")
                                .find("a")
                                .contains("Population Frequencies")
                                .click();
                            cy.get("@variantBrowserToolbar")
                                .find(`div[data-cy="test-populationFrequenciesConfig.displayMode"]`)
                                .find("select-field-filter button")
                                .click();
                            cy.get("@variantBrowserToolbar")
                                .find(`select-field-filter a.dropdown-item`)
                                .contains("FREQUENCY_NUMBER")
                                .click();
                            cy.get("@variantBrowserToolbar")
                                .find(`div[class="modal-body"]`)
                                .find("button")
                                .contains("OK")
                                .click();
                        });

                        it("should render one line for each population", () => {
                            vb.grid.population.subColumnsItems.forEach((item, index) => {
                                cy.get("@variantBrowserTable")
                                    .find(`tr[data-uniqueid="${variant.id}"] > td`)
                                    .eq(vb.grid.population.subColumnsIndex + index)
                                    .find(`div[data-cy^="population"]`)
                                    .should("have.length", vb.grid.population.metadata.populations.length);
                            });
                        });
                    });
                });
            });

        });
    });
});
