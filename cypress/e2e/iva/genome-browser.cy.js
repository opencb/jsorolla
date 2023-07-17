context("GenomeBrowser Viz", () => {
    const region = "17:43096757-43112003";

    beforeEach(() => {
        cy.visit("#genome-browser");
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(2000);
        cy.get(`div[data-cy="genome-browser-container"]`).as("container");
    });

    context("render", () => {
        it("should render navigation and status panels", () => {
            cy.get("@container")
                .within(() => {
                    cy.get(`div[data-cy="gb-navigation"]`)
                        .should("exist");
                    cy.get(`div[data-cy="gb-status"]`)
                        .should("exist");
                });
        });

        it("should render inner panels", () => {
            ["karyotype", "chromosome", "tracks"].forEach(name => {
                cy.get("@container")
                    .get(`li[data-cy="gb-${name}"]`)
                    .should("exist");
            });
        });
    });

    context("navigation panel", () => {
        it("should display the current region in the region input", () => {
            cy.get("@container")
                .get(`div[data-cy="gb-navigation"]`)
                .get(`input[data-cy="gb-region-input"]`)
                .invoke("val")
                .should("equal", region);
        });
    });

});
