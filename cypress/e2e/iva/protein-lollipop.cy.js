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

context("Protein Lollipop Viz", () => {
    const svgSelector = `div[data-cy="protein-lollipop-container"] svg`;

    const highlightedVariant = "X:150638967:G:-";
    const hoverVariant = "X:150641342:T:-";
    const highlightColor = "rgba(253, 152, 67, 0.6)";

    const consequenceColors = {
        "missense_variant": "#fd7e14",
        "stop_gained": "#dc3545",
    };

    beforeEach(() => {
        cy.visit("#protein-lollipop");
        cy.get(`div[data-cy="protein-lollipop-container"] svg`)
            .as("container");
        cy.waitUntil(() => {
            cy.get("@container").should("exist");
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

    context("variant:highlight", () => {
        beforeEach(() => {
            cy.get(svgSelector)
                .find(`g[data-track="main:variants"]`)
                .within(() => {
                    cy.get(`g[data-id="${highlightedVariant}"]`).as("variant");
                });
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
            cy.get(`g[data-track="variants"]`)
                .eq(0)
                .find(`g[data-highlighted="true"]`)
                .should("exist");
        });

        it("should mark the variant as highlighted in the cosmic variants track", () => {
            cy.get(`g[data-track="variants"]`)
                .eq(1)
                .find(`g[data-highlighted="true"]`)
                .should("exist");
        });
    });

    context("variant:hover", () => {
        beforeEach(() => {
            cy.get(svgSelector)
                .find(`g[data-track="main:variants"]`)
                .within(() => {
                    cy.get(`g[data-id="${hoverVariant}"]`).as("variant");
                    cy.get("@variant")
                        .find("circle")
                        .trigger("mouseover");
                });
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
            cy.get(svgSelector)
                .get("g")
                .find("g:not([data-track])")
                .invoke("attr", "style")
                .should("be.empty");
        });
    });

    context("variant:tooltip", () => {
        beforeEach(() => {
            cy.get(svgSelector)
                .find(`g[data-track="main:variants"]`)
                .within(() => {
                    cy.get(`g[data-id="${hoverVariant}"]`).as("variant");
                    cy.get("@variant")
                        .find("circle")
                        .trigger("mouseenter");
                });
        });

        it("should be displayed when hovering the variant", () => {
            cy.get(".viz-tooltip")
                .should("exist");
        });

        it("should contain the information of the variant", () => {
            cy.get(".viz-tooltip").within(() => {
                cy.get(".viz-tooltip-title")
                    .should("contain.text", hoverVariant);
                cy.get(".viz-tooltip-content")
                    .children()
                    .should("have.length.greaterThan", 0);
            });
        });

        it("should be removed when user leaves the variant", () => {
            cy.get("@variant")
                .find("circle")
                .trigger("mouseleave");
            cy.get(".viz-tooltip")
                .should("not.exist");
        });
    });

    context("variant:legend", () => {
        beforeEach(() => {
            cy.get(svgSelector)
                .find(`g[data-track="main:variants"]`)
                .within(() => {
                    cy.get("foreignObject div").as("legend");
                    cy.get("@legend")
                        .find("div[data-index]")
                        .eq(0)
                        .as("firstLegendItem");
                });
        });

        it("should render variant legend", () => {
            cy.get("@legend").should("exist");
        });

        it("should display all consequency types from variants", () => {
            const consequenceTypes = new Set();
            cy.get(svgSelector)
                .find(`g[data-track="main:variants"] g[data-ct]`)
                .each(el => {
                    consequenceTypes.add(el.data("ct"));
                });
            Array.from(consequenceTypes)
                .forEach(ct => {
                    cy.get("legend")
                        .contains(ct.toUpperCase())
                        .should("exist");
                });
        });

        it("should display the correct number of ct", () => {
            cy.get("@firstLegendItem")
                .find("strong")
                .invoke("text")
                .then(textContent => {
                    const ct = textContent.trim().split(" ")[0].toLowerCase();
                    const count = parseInt(textContent.trim().split(" ")[1].replace("(", "").replace(")", ""));

                    cy.get(svgSelector)
                        .find(`g[data-track="main:variants"] g[data-ct="${ct}"]`)
                        .should("have.length", count);
                });
        });

        it("should hide variants with different ct when clicking", () => {
            cy.get("@firstLegendItem")
                .trigger("click");
            cy.get("@firstLegendItem")
                .find("strong")
                .invoke("text")
                .then(textContent => {
                    const ct = textContent.trim().split(" ")[0].toLowerCase();
                    cy.get(svgSelector)
                        .find(`g[data-track="main:variants"] g[data-ct="${ct}"]`)
                        .invoke("attr", "style")
                        .should("equal", "opacity:1;");
                    cy.get(svgSelector)
                        .find(`g[data-ct]:not([data-ct="${ct}"])`)
                        .invoke("attr", "style")
                        .should("equal", "opacity: 0.2;");
                });
        });

        it("should reset state when clicking again the the same ct", () => {
            cy.get("@firstLegendItem")
                .trigger("click");
            cy.get("@firstLegendItem")
                .trigger("click");
            
            cy.get(svgSelector)
                .find(`g[data-track="main:variants"] g[data-ct]`)
                .invoke("attr", "style")
                .should("equal", "opacity:1;");
        });
    });

    context("protein:render", () => {
        it("should render all exons of the protein", () => {
            cy.get(svgSelector)
                .find(`g[data-track="main:protein"] path[fill="transparent"]`)
                .should("have.length", 14);
        });
    });

    context("protein:tooltip", () => {
        beforeEach(() => {
            cy.get(svgSelector)
                .find(`g[data-track="main:protein"] path[fill="transparent"]`)
                .eq(0)
                .as("proteinExon");
            cy.get("@proteinExon")
                .trigger("mouseenter");
        });

        it("should display a tooltip when user hovers an exon", () => {
            cy.get(".viz-tooltip")
                .should("exist");
        });

        it("should display exon information", () => {
            cy.get(".viz-tooltip")
                .find(".viz-tooltip-title")
                .should("contain.text", "ENSE00003647423.1");
        });

        it("should remove the tooltip when user leaves exon", () => {
            cy.get("@proteinExon")
                .trigger("mouseleave");
            cy.get(".viz-tooltip")
                .should("not.exist");
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

            it("should render track title", () => {
                cy.get("@clinvarTrackInfo")
                    .find(`text[data-cy="protein-lollipop-track-info-title"]`)
                    .should("contain.text", "CLINVAR");
            });

            it("should render number of variants", () => {
                cy.get("@clinvarTrackInfo")
                    .find(`text[data-cy="protein-lollipop-track-info-line"][data-index="0"]`)
                    .should("contain.text", "100 Variants");
            });
        });

        context("variants", () => {
            it("should render all variants", () => {
                cy.get("@clinvarTrack")
                    .find(`g[data-cy="protein-lollipop-track-feature"]`)
                    .should("have.length", 100);
            });

            it("should style variants with the correct color", () => {
                Object.keys(consequenceColors).forEach(ct => {
                    cy.get("@clinvarTrack")
                        .find(`g[data-cy="protein-lollipop-track-feature"][data-ct="${ct}"][data-highlighted="false"]`)
                        .each(el => {
                            cy.wrap(el)
                                .find("path")
                                .invoke("attr", "stroke")
                                .should("equal", consequenceColors[ct]);
                            cy.wrap(el)
                                .find("circle")
                                .invoke("attr", "fill")
                                .should("equal", consequenceColors[ct]);
                        });
                });
            });

            it("should display tooltip when hovering the variant", () => {
                // eslint-disable-next-line cypress/no-force
                cy.get("@clinvarTrack")
                    .find(`g[data-cy="protein-lollipop-track-feature"][data-index="0"] > circle`)
                    .trigger("mouseenter", {force: true});
                cy.get("div.viz-tooltip")
                    .should("exist");
            });
        });

        context("legend", () => {
            beforeEach(() => {
                cy.get("@clinvarTrack")
                    .find(`div[data-cy="protein-lollipop-legend"]`)
                    .as("clinvarTrackLegend");
            });

            it("should render", () => {
                cy.get("@clinvarTrackLegend")
                    .should("exist");
            });

            it("should show only the variants whith the same CT when clicking", () => {
                const ct = "start_lost";
                
                // eslint-disable-next-line cypress/no-force
                cy.get("@clinvarTrackLegend")
                    .find(`div[data-cy="protein-lollipop-legend-item"][data-item="${ct}"]`)
                    .trigger("click", {force: true});

                cy.get("@clinvarTrack")
                    .find(`g[data-cy="protein-lollipop-track-feature"][data-ct="${ct}"]`)
                    .invoke("attr", "style")
                    .should("equal", "opacity:1;");
                cy.get("@clinvarTrack")
                    .find(`g[data-cy="protein-lollipop-track-feature"]:not([data-cy="${ct}"])`)
                    .invoke("attr", "style")
                    .should("equal", "opacity: 0.1;");
            });
        });
    });
});
