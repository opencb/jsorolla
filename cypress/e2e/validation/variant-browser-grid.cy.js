import Utils from "../../support/utils.js";
import vb from "../../fixtures/variant-browser-grid.js";

context("Variant Browser Grid (Validation)", () => {
    beforeEach(() => {
        cy.visit("#variant-browser-grid-validation");
        cy.get("variant-browser-grid table")
            .as("variantBrowserTable");
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
                                        const hexColor = variant.populations[index].populationsColors[i];
                                        cy.wrap(el)
                                            .should("have.css", "background-color", Utils.hexToRgb(hexColor));
                                    });
                            });
                        });
                    });
                });
            });

        });
    });
});
