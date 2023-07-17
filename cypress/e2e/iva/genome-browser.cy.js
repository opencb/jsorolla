context("GenomeBrowser Viz", () => {
    const region = {
        chromosome: "17",
        start: 43096757,
        end: 43112003,
    };

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
        beforeEach(() => {
            cy.get("@container")
                .get(`div[data-cy="gb-navigation"]`)
                .as("navigation");
        });

        it("should display the current region in the region input", () => {
            cy.get("@navigation")
                .get(`input[data-cy="gb-region-input"]`)
                .invoke("val")
                .should("equal", `${region.chromosome}:${region.start}-${region.end}`);
        });

        it("shoudl display the current region size", () => {
            cy.get("@navigation")
                .get(`input[data-cy="gb-window-size"]`)
                .invoke("val")
                .should("equal", `${region.end - region.start + 1}`);
        });

        it("should display the features of interest", () => {
            cy.get("@navigation")
                .get(`ul[data-cy="gb-features-list"]`)
                .get("li.dropdown-submenu")
                .as("features");
            
            cy.get("@features")
                .should("have.length", 2);

            ["Primary Findings", "My genes of interest"].forEach((name, index) => {
                cy.get("@features")
                    .eq(index)
                    .get("a > span")
                    .should("contain.text", name);
            });
        });
    });

});
