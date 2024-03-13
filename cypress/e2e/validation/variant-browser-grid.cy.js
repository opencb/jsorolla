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
                    });
                });
            });

        });
    });
});
