context("GenomeBrowser Viz", () => {
    const region = {
        chromosome: "17",
        start: 43096757,
        end: 43112003,
    };

    beforeEach(() => {
        cy.visit("#genome-browser");
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        // cy.wait(2000);
        cy.get(`div[data-cy="genome-browser-container"]`)
            .as("container");
        cy.waitUntil(() => {
            return cy.get("@container")
                .find(`div[data-cy="gb-parent"]`)
                .should("exist");
        });
    });

    context("render", () => {
        it("should render navigation and status panels", () => {
            cy.get("@container")
                .find(`div[data-cy="gb-navigation"]`)
                .should("exist");
            cy.get("@container")
                .find(`div[data-cy="gb-status"]`)
                .should("exist");
        });

        it("should render inner panels", () => {
            ["karyotype", "chromosome", "tracks"].forEach(name => {
                cy.get("@container")
                    .find(`li[data-cy="gb-${name}"]`)
                    .should("exist");
            });
        });
    });

    context("navigation panel", () => {
        beforeEach(() => {
            cy.get("@container")
                .find(`div[data-cy="gb-navigation"]`)
                .as("navigation");
        });

        it("should display the current region in the region input", () => {
            cy.get("@navigation")
                .find(`input[data-cy="gb-region-input"]`)
                .invoke("val")
                .should("equal", `${region.chromosome}:${region.start}-${region.end}`);
        });

        it("should display the current region size", () => {
            cy.get("@navigation")
                .find(`input[data-cy="gb-window-size"]`)
                .invoke("val")
                .should("equal", `${region.end - region.start + 1}`);
        });

        it("should display the features of interest", () => {
            cy.get("@navigation")
                .find(`ul[data-cy="gb-features-list"] > li.dropdown-submenu`)
                .as("features");
            
            cy.get("@features")
                .should("have.length", 2);

            ["Primary Findings", "My genes of interest"].forEach((name, index) => {
                cy.get("@features")
                    .eq(index)
                    .find("a > span")
                    .should("contain.text", name);
            });
        });
    });

    context("karyotype panel", () => {
        beforeEach(() => {
            cy.get("@container")
                .find(`li[data-cy="gb-karyotype"]`)
                .as("karyotype");
        });

        it("should display the karyotype panel title", () => {
            cy.get("@karyotype")
                .find(`div[data-cy="gb-karyotype-title"]`)
                .should("contain.text", "Karyotype");
        });

        it("should hide the panel content when toggle button is clicked", () => {
            cy.get("@karyotype")
                .find(`div[data-cy="gb-karyotype-content"]`)
                .as("karyotypeContent");

            cy.get("@karyotypeContent")
                .invoke("css", "display")
                .should("equal", "block");

            cy.get("@karyotype")
                .find(`div[data-cy="gb-karyotype-toggle"]`)
                .trigger("click");

            cy.get("@karyotypeContent")
                .invoke("css", "display")
                .should("equal", "none");
        });

        it("should render the 24 + MT chromosomes", () => {
            cy.get("@karyotype")
                .find("svg > g[data-chr-name]")
                .should("have.length", 25);
        });

        it("should render the name of each chromosome", () => {
            cy.get("@karyotype")
                .find("svg > g[data-chr-name]")
                .each((el, index) => {
                    const name = el.attr("data-chr-name");
                    cy.get("@karyotype")
                        .find("svg > text")
                        .eq(index)
                        .should("contain.text", name);
                });
        });
    });

    context("chromosome panel", () => {
        beforeEach(() => {
            cy.get("@container")
                .find(`li[data-cy="gb-chromosome"]`)
                .as("chromosome");
        });
 
        it("should display current chromosome in title", () => {
            cy.get("@chromosome")
                .find(`div[data-cy="gb-chromosome-title"]`)
                .should("contain.text", `Chromosome ${region.chromosome}`);
        });

        it("should display all cytobands labels", () => {
            cy.get("@chromosome")
                .find(`svg text[data-cy="gb-chromosome-cytoband-label"]`)
                .should("have.length", 24);
        });

        it("should display a mark in the current positon in the chromosome", () => {
            cy.get("@chromosome")
                .find(`g[data-cy="gb-chromosome-position"]`)
                .invoke("attr", "data-position")
                .should("equal", `${(region.start + region.end) / 2}`);
        });

        it("should display features of interest", () => {
            const displayedFeatures = ["BRCA1", "TP53"];
    
            cy.get("@chromosome")
                .find(`g[data-cy="gb-chromosome-feature-of-interest"]`)
                .each((el, index) => {
                    cy.wrap(el)
                        .invoke("attr", "data-feature-id")
                        .should("equal", displayedFeatures[index]);
                });
        });
    });

    context("region overview panel", () => {
        beforeEach(() => {
            cy.get("@container")
                .find(`li[data-cy="gb-region"]`)
                .as("regionOverview");
        });

        it("should display the region overview title", () => {
            cy.get("@regionOverview")
                .find(`div[data-cy="gb-tracklist-title"]`)
                .should("contain.text", "Region overview");
        });

        it("should display center nucleotide", () => {
            cy.get("@regionOverview")
                .find(`div[data-cy="gb-tracklist-position-center"]`)
                .should("contain.text", `${(region.start + region.end) / 2}`);
        });
        
        context("gene overview track", () => {
            beforeEach(() => {
                cy.get("@regionOverview")
                    .find(`div[data-cy="gb-track"]`)
                    .as("geneOverviewTrack");
            });

            it("should display track title", () => {
                cy.get("@geneOverviewTrack")
                    .find(`div[data-cy="gb-track-title"]`)
                    .should("contain.text", "Gene overview");
            });

            it("should display features", () => {
                cy.get("@geneOverviewTrack")
                    .find(`svg g[data-cy="gb-feature"]`)
                    .should("have.length", 6);
            });

            it("should display feature labels", () => {
                cy.get("@geneOverviewTrack")
                    .find(`svg g[data-cy="gb-feature"][data-feature-id="ENSG00000012048"]`)
                    .find(`text[data-cy="gb-feature-label"]`)
                    .should("contain.text", "BRCA1");
            });

            it("should display tooltip when a feature is hovered", () => {
                // eslint-disable-next-line cypress/no-force
                cy.get("@geneOverviewTrack")
                    .find(`svg g[data-cy="gb-feature"][data-feature-id="ENSG00000012048"]`)
                    .trigger("mouseover", {force: true});

                // eslint-disable-next-line cypress/no-unnecessary-waiting
                cy.wait(2000).then(() => {
                    cy.get("div.qtip")
                        .find("div.qtip-title")
                        .should("contain.text", "Gene - BRCA1");
                });
            });
        });
    });
});
