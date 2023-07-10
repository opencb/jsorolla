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
    const svgSelector = `div[data-test-id="protein-lollipop-container"] svg`;

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
            cy.get(svgSelector).within(() => {
                mainTracks.forEach(trackName => {
                    cy.get(`g[data-track="${trackName}"]`).should("exist");
                });
            });
        });

        it("should render two variants tracks", () => {
            cy.get(svgSelector).within(() => {
                cy.get(`g[data-track="variants"]`).should("have.length", 2);
            });
        });
    });

    context("highlight", () => {
        const highlightedVariant = "X:150638967:G:-";

        beforeEach(() => {
            cy.get(svgSelector).find(`g[data-track="main:variants"]`).within(() => {
                cy.get(`g[data-id="${highlightedVariant}"]`).as("variant");
            });
        });

        it("should mark the variant as highlighted in the main variants track", () => {
            cy.get("@variant").invoke("attr", "data-highlighted").should("eq", "true");
        });

        it("should style the variant in the main variants track", () => {
            cy.get("@variant").within(() => {
                cy.get(`path[fill="none"]`).as("variantPath");
                cy.get("circle").as("variantCircle");
                cy.get("@variantPath").invoke("attr", "style").should("contain", "stroke-width: 4px");
                cy.get("@variantPath").invoke("attr", "style").should("contain", `stroke: ${highlightColor}`);
                cy.get("@variantCircle").invoke("attr", "style").should("contain", "stroke-width: 4px");
                cy.get("@variantCircle").invoke("attr", "style").should("contain", `stroke: ${highlightColor}`);
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

});
