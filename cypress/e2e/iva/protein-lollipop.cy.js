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

    beforeEach(() => {
        cy.visit("#protein-lollipop");
        cy.waitUntil(() => cy.get(svgSelector).should("exist"));
    });

    context("render", () => {
        it("should render main tracks", () => {
            const mainTracks = [
                "main:scale",
                "main:variants",
                "main:protein",
            ];
            cy.get(svgSelector)
                .within(() => {
                    mainTracks.forEach(trackName => {
                        cy.get(`g[data-track="${trackName}"]`)
                            .should("exist");
                    });
                });
        });

        it("should render two variants tracks", () => {
            cy.get(svgSelector)
                .within(() => {
                    cy.get(`g[data-track="variants"]`)
                        .should("have.length", 2);
                });
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

});
