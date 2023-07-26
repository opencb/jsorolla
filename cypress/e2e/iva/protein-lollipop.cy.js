/**
 * Copyright 2015-2023 OpenCB
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

context("Protein Lollipop", () => {
    const highlightedVariant = "X:150638967:G:-";
    const hoverVariant = "X:150641342:T:-";
    const highlightColor = "rgba(253, 152, 67, 0.6)";

    const consequenceColors = {
        "missense_variant": "#fd7e14",
        "stop_gained": "#dc3545",
    };

    beforeEach(() => {
        cy.visit("#protein-lollipop");
        cy.get(`div[data-cy="protein-lollipop"] svg`)
            .as("container");
        cy.waitUntil(() => {
            return cy.get(`div[data-cy="protein-lollipop"] svg`)
                .should("exist");
        });
    });

    context("render", () => {
        it("should render main tracks", () => {
            ["scale", "variants", "protein"].forEach(track => {
                cy.get("@container")
                    .find(`g[data-track="main:${track}"]`)
                    .should("exist");
            });
        });

        it("should render two variants tracks", () => {
            cy.get("@container")
                .find(`g[data-track="variants"]`)
                .should("have.length", 2);
        });
    });

    context("scale track", () => {
        beforeEach(() => {
            cy.get("@container")
                .find(`g[data-track="main:scale"]`)
                .as("scaleTrack");
        });

        it("should render ticks", () => {
            cy.get("@scaleTrack")
                .find(`g[data-cy="protein-lollipop-scale-tick"]`)
                .should("have.length.greaterThan", 0);
        });
    });

    context("variants track", () => {
        beforeEach(() => {
            cy.get("@container")
                .find(`g[data-track="main:variants"]`)
                .as("variantsTrack");
        });

        it("should render variants", () => {
            cy.get("@variantsTrack")
                .find(`g[data-cy="protein-lollipop-variant"]`)
                .should("have.length.greaterThan", 0);
        });

        it("should render variant circle and path", () => {
            cy.get("@variantsTrack")
                .find(`g[data-cy="protein-lollipop-variant"]`)
                .first()
                .within(() => {
                    cy.get(`path[data-cy="protein-lollipop-variant-path"]`)
                        .should("exist");
                    cy.get(`circle[data-cy="protein-lollipop-variant-circle"]`)
                        .should("exist");
                });
        });

        it("should render variant label", () => {
            const position = "43";
            cy.get("@variantsTrack")
                .find(`g[data-cy="protein-lollipop-variant"][data-position="${position}"]`)
                .find(`text[data-cy="protein-lollipop-variant-label"]`)
                .should("exist")
                .and("contain.text", position);
        });

        context("highlight", () => {
            beforeEach(() => {
                cy.get("@variantsTrack")
                    .find(`g[data-id="${highlightedVariant}"]`)
                    .as("variant");
            });

            it("should mark the variant as highlighted in the main variants track", () => {
                cy.get("@variant")
                    .invoke("attr", "data-highlighted")
                    .should("eq", "true");
            });

            it("should style the variant in the main variants track", () => {
                cy.get("@variant").within(() => {
                    cy.get(`path[fill="none"]`).as("variantPath");
                    cy.get("circle").as("variantCircle");

                    // Assert on lollipop path element
                    cy.get("@variantPath")
                        .invoke("attr", "style")
                        .should("contain", "stroke-width: 4px");
                    cy.get("@variantPath")
                        .invoke("attr", "style")
                        .should("contain", `stroke: ${highlightColor}`);

                    // Assert on lollipop circle element
                    cy.get("@variantCircle")
                        .invoke("attr", "style")
                        .should("contain", "stroke-width: 4px");
                    cy.get("@variantCircle")
                        .invoke("attr", "style")
                        .should("contain", `stroke: ${highlightColor}`);
                });
            });

            it("should mark the variant as highlighted in the clinvar variants track", () => {
                cy.get("@container")
                    .find(`g[data-track="variants"]`)
                    .first()
                    .find(`g[data-highlighted="true"]`)
                    .should("exist");
            });

            it("should mark the variant as highlighted in the cosmic variants track", () => {
                cy.get("@container")
                    .find(`g[data-track="variants"]`)
                    .last()
                    .find(`g[data-highlighted="true"]`)
                    .should("exist");
            });
        });

        context("hover", () => {
            beforeEach(() => {
                cy.get("@variantsTrack")
                    .find(`g[data-id="${hoverVariant}"]`)
                    .as("variant");
                cy.get("@variant")
                    .find("circle")
                    .trigger("mouseover");
            });

            it("should style the variant", () => {
                cy.get("@variant").within(() => {
                    cy.get(`path[fill="none"]`).as("variantPath");
                    cy.get("circle").as("variantCircle");

                    // Assert on lollipop path element
                    cy.get("@variantPath")
                        .invoke("attr", "style")
                        .should("contain", "stroke-width: 4px");
                    cy.get("@variantPath")
                        .invoke("attr", "style")
                        .should("contain", `stroke: ${highlightColor}`);

                    // Assert on lollipop circle element
                    cy.get("@variantCircle")
                        .invoke("attr", "style")
                        .should("contain", "stroke-width: 4px");
                    cy.get("@variantCircle")
                        .invoke("attr", "style")
                        .should("contain", `stroke: ${highlightColor}`);
                });
            });

            it("should make the variant text bolder", () => {
                cy.get("@variant")
                    .find("text")
                    .invoke("attr", "style")
                    .should("contain", "font-weight: bold;");
            });

            it("should display the position indicator", () => {
                cy.get("@container")
                    .find(`g[data-cy="protein-lollipop-position"]`)
                    .invoke("attr", "style")
                    .should("be.empty");
            });
        });

        context("tooltip", () => {
            beforeEach(() => {
                cy.get("@variantsTrack")
                    .find(`g[data-id="${hoverVariant}"]`)
                    .as("variant");
                cy.get("@variant")
                    .find("circle")
                    .trigger("mouseenter");
            });

            it("should be displayed when hovering the variant", () => {
                cy.get(".viz-tooltip")
                    .should("exist");
            });

            it("should contain the information of the variant", () => {
                cy.get(".viz-tooltip")
                    .find(".viz-tooltip-title")
                    .should("contain.text", hoverVariant);
                cy.get(".viz-tooltip")
                    .find(".viz-tooltip-content")
                    .children()
                    .should("have.length.greaterThan", 0);
            });

            it("should be removed when user leaves the variant", () => {
                cy.get("@variant")
                    .find("circle")
                    .trigger("mouseleave");
                cy.get(".viz-tooltip")
                    .should("not.exist");
            });
        });

        context("legend", () => {
            let ct = "";

            beforeEach(() => {
                cy.get("@variantsTrack")
                    .find(`div[data-cy="protein-lollipop-legend"]`)
                    .as("legend");
                
                cy.get("@variantsTrack")
                    .find(`div[data-cy="protein-lollipop-legend-item"]`)
                    .first()
                    .as("firstLegendItem")
                
                cy.get("@firstLegendItem")
                    .invoke("attr", "data-item")
                    .then(str => ct = str);
                
                // eslint-disable-next-line cypress/no-force
                cy.get("@firstLegendItem")
                    .trigger("click", {force: true});
            });

            it("should render", () => {
                cy.get("@legend")
                    .should("exist");
            });

            it("should display the correct number of ct", () => {
                cy.get("@firstLegendItem")
                    .invoke("attr", "data-count")
                    .then(count => {
                        cy.get("@firstLegendItem")
                            .find(`div[data-cy="protein-lollipop-legend-item-title"] > strong`)
                            .should("contain.text", count);

                        cy.get("@variantsTrack")
                            .find(`g[data-ct="${ct}"]`)
                            .should("have.length", parseInt(count));
                    });
            });

            it("should hide variants with different ct when clicking", () => {
                cy.get("@variantsTrack")
                    .find(`g[data-ct="${ct}"]`)
                    .invoke("attr", "style")
                    .should("equal", "opacity:1;");
                cy.get("@variantsTrack")
                    .find(`g[data-ct]:not([data-ct="${ct}"])`)
                    .invoke("attr", "style")
                    .should("equal", "opacity: 0.2;");
            });

            it("should reset state when clicking again the the same ct", () => {
                // eslint-disable-next-line cypress/no-force
                cy.get("@firstLegendItem")
                    .trigger("click", {force: true});

                cy.get("@variantsTrack")
                    .find(`g[data-ct]`)
                    .invoke("attr", "style")
                    .should("equal", "opacity:1;");
            });
        });
    });

    context("protein track", () => {
        beforeEach(() => {
            cy.get("@container")
                .find(`g[data-track="main:protein"]`)
                .as("proteinTrack");
        });

        it("should render all exons of the protein", () => {
            cy.get("@proteinTrack")
                .find(`path[fill="transparent"]`)
                .should("have.length", 14);
        });

        context("tooltip", () => {
            beforeEach(() => {
                cy.get("@proteinTrack")
                    .find(`path[fill="transparent"]`)
                    .eq(0)
                    .as("proteinExon");
                cy.get("@proteinExon")
                    .trigger("mouseenter");
            });

            it("should be displayed when user hovers an exon", () => {
                cy.get(".viz-tooltip")
                    .should("exist");
            });

            it("should display exon information", () => {
                cy.get(".viz-tooltip")
                    .find(".viz-tooltip-title")
                    .should("contain.text", "ENSE00003647423.1");
            });

            it("should be removed when user leaves exon", () => {
                cy.get("@proteinExon")
                    .trigger("mouseleave");
                cy.get(".viz-tooltip")
                    .should("not.exist");
            });
        });
    });

    context("clinvar track", () => {
        beforeEach(() => {
            cy.get("@container")
                .find(`g[data-cy="protein-lollipop-track"][data-track-title="clinvar"]`)
                .as("clinvarTrack");
        });

        it("should render", () => {
            cy.get("@clinvarTrack")
                .should("exist");
        });

        context("info", () => {
            beforeEach(() => {
                cy.get("@clinvarTrack")
                    .find(`g[data-cy="protein-lollipop-track-info"]`)
                    .as("clinvarTrackInfo");
            });

            it("should render the track title", () => {
                cy.get("@clinvarTrackInfo")
                    .find(`text[data-cy="protein-lollipop-track-info-title"]`)
                    .should("contain.text", "CLINVAR");
            });

            it("should render the number of variants", () => {
                cy.get("@clinvarTrackInfo")
                    .find(`text[data-cy="protein-lollipop-track-info-line"][data-index="0"]`)
                    .should("contain.text", "100 Variants");
            });
        });

        context("variants", () => {
            it("should render", () => {
                cy.get("@clinvarTrack")
                    .find(`g[data-cy="protein-lollipop-track-feature"]`)
                    .should("have.length", 100);
            });

            it("should be styled with the correct color", () => {
                Object.keys(consequenceColors).forEach(ct => {
                    cy.get("@clinvarTrack")
                        .find(`g[data-cy="protein-lollipop-track-feature"][data-ct="${ct}"][data-highlighted="false"]`)
                        .first()
                        .within(() => {
                            cy.get("path")
                                .invoke("attr", "stroke")
                                .should("equal", consequenceColors[ct]);
                            cy.get("circle")
                                .invoke("attr", "fill")
                                .should("equal", consequenceColors[ct]);
                        });
                });
            });
        });

        context("tooltip", () => {
            beforeEach(() => {
                cy.get("@clinvarTrack")
                    .find(`g[data-cy="protein-lollipop-track-feature"][data-index="0"]`)
                    .as("firstClinvarVariant");
                
                // eslint-disable-next-line cypress/no-force
                cy.get("@firstClinvarVariant")
                    .find("circle")
                    .trigger("mouseenter", {force: true});
            });

            it("should be displayed when hovering a variant", () => {
                cy.get("div.viz-tooltip")
                    .should("exist");
            });

            it("should be removed when user leaves the variant", () => {
                // eslint-disable-next-line cypress/no-force
                cy.get("@firstClinvarVariant")
                    .find("circle")
                    .trigger("mouseleave", {force: true});

                cy.get("div.viz-tooltip")
                    .should("not.exist");
            });
        });

        context("legend", () => {
            let ct = "";

            beforeEach(() => {
                cy.get("@clinvarTrack")
                    .find(`div[data-cy="protein-lollipop-legend"]`)
                    .as("clinvarTrackLegend");
                cy.get("@clinvarTrackLegend")
                    .find(`div[data-cy="protein-lollipop-legend-item"]`)
                    .first()
                    .as("firstClinvarLegendItem");
                
                cy.get("@firstClinvarLegendItem")
                    .invoke("attr", "data-item")
                    .then(value => ct = value);
                
                // eslint-disable-next-line cypress/no-force
                cy.get("@firstClinvarLegendItem")
                    .trigger("click", {force: true});
            });

            it("should render", () => {
                cy.get("@clinvarTrackLegend")
                    .should("exist");
            });

            it("should display the correct number of ct", () => {
                cy.get("@firstClinvarLegendItem")
                    .invoke("attr", "data-count")
                    .then(count => {
                        cy.get("@firstClinvarLegendItem")
                            .find(`div[data-cy="protein-lollipop-legend-item-title"] > strong`)
                            .should("contain.text", count);

                        cy.get("@clinvarTrack")
                            .find(`g[data-cy="protein-lollipop-track-feature"][data-ct="${ct}"]`)
                            .should("have.length", parseInt(count));
                    });
            });


            it("should hide variants with different ct when clicking", () => {
                cy.get("@clinvarTrack")
                    .find(`g[data-cy="protein-lollipop-track-feature"][data-ct="${ct}"]`)
                    .invoke("attr", "style")
                    .should("equal", "opacity:1;");
                cy.get("@clinvarTrack")
                    .find(`g[data-cy="protein-lollipop-track-feature"]:not([data-cy="${ct}"])`)
                    .invoke("attr", "style")
                    .should("equal", "opacity: 0.1;");
            });

            it("should reset state when clicking again the the same ct", () => {
                // eslint-disable-next-line cypress/no-force
                cy.get("@firstClinvarLegendItem")
                    .trigger("click", {force: true});

                cy.get("@clinvarTrack")
                    .find(`g[data-cy="protein-lollipop-track-feature"]`)
                    .invoke("attr", "style")
                    .should("equal", "opacity:1;");
            });
        });
    });
});
