context("GenomeBrowser Viz", () => {
    const region = {
        chromosome: "17",
        start: 43096757,
        end: 43112003,
    };

    beforeEach(() => {
        cy.visit("#genome-browser");
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

    context("tracklist panel", () => {
        beforeEach(() => {
            cy.get("@container")
                .find(`li[data-cy="gb-tracks"]`)
                .as("tracklistPanel");
        });

        it("should display the tracklist title", () => {
            cy.get("@tracklistPanel")
                .find(`div[data-cy="gb-tracklist-title"]`)
                .should("contain.text", "Detailed information");
        });

        it("should display the current window size", () => {
            cy.get("@tracklistPanel")
                .find(`div[data-cy="gb-tracklist-size"]`)
                .should("contain.text", `Window size: ${region.end - region.start + 1} nts`);
        });

        it("should display the center of the region", () => {
            cy.get("@tracklistPanel")
                .find(`div[data-cy="gb-tracklist-position-center"]`)
                .should("contain.text", `${(region.start + region.end) / 2}`);
        });

        context("sequence track", () => {
            beforeEach(() => {
                cy.get("@tracklistPanel")
                    .find(`div[data-cy="gb-track"][data-track-title="Sequence"]`)
                    .as("sequenceTrack");
            });

            it("should render", () => {
                cy.get("@sequenceTrack")
                    .should("exist");
            });

            it("should render track title", () => {
                cy.get("@sequenceTrack")
                    .find(`div[data-cy="gb-track-title"]`)
                    .should("contain.text", "Sequence");
            });
        });

        context("gene track", () => {
            const gene = "ENSG00000012048";
            const geneTitle = "BRCA1";
            const transcript = "ENST00000461798.5";
            const transcriptTitle = "BRCA1-207";
            const exon = "ENSE00003513709.1";

            beforeEach(() => {
                cy.get("@tracklistPanel")
                    .find(`div[data-cy="gb-track"][data-track-title="Gene"]`)
                    .as("geneTrack");
            });

            it("should render", () => {
                cy.get("@geneTrack")
                    .should("exist");
            });

            it("should render track title", () => {
                cy.get("@geneTrack")
                    .find(`div[data-cy="gb-track-title"]`)
                    .should("contain.text", "Gene");
            });

            it("should not display errors", () => {
                cy.get("@geneTrack")
                    .find(`div[data-cy="gb-track-error"]`)
                    .should("not.be.visible");
            });

            it("should render gene rectangle", () => {
                cy.get("@geneTrack")
                    .find(`div[data-cy="gb-track-content"] g[data-cy="gb-feature-gene"][data-id="${gene}"]`)
                    .find(`rect[data-cy="gb-feature-gene-rect"]`)
                    .should("exist");
            });

            it("should render gene label", () => {
                cy.get("@geneTrack")
                    .find(`div[data-cy="gb-track-content"] g[data-cy="gb-feature-gene"][data-id="${gene}"]`)
                    .find(`text[data-cy="gb-feature-gene-label"]`)
                    .should("exist")
                    .and("contain.text", geneTitle);
            });

            it("should display tooltip when hovering a gene", () => {
                // eslint-disable-next-line cypress/no-force
                cy.get("@geneTrack")
                    .find(`div[data-cy="gb-track-content"] g[data-cy="gb-feature-gene"][data-id="${gene}"]`)
                    .trigger("mouseover", {force: true});
                
                // eslint-disable-next-line cypress/no-unnecessary-waiting
                cy.wait(2000).then(() => {
                    cy.get("div.qtip")
                        .should("exist");
                    
                    cy.get("div.qtip")
                        .find("div.qtip-title")
                        .should("contain.text", `Gene - ${geneTitle}`);
                });
            });

            it("should render transcript", () => {
                cy.get("@geneTrack")
                    .find(`div[data-cy="gb-track-content"] g[data-cy="gb-feature-transcript"][data-id="${transcript}"]`)
                    .should("exist");
            });

            it("should render transcript label", () => {
                cy.get("@geneTrack")
                    .find(`div[data-cy="gb-track-content"] g[data-cy="gb-feature-transcript"][data-id="${transcript}"]`)
                    .find(`text[data-cy="gb-feature-transcript-label"]`)
                    .should("exist")
                    .and("contain.text", transcriptTitle);
            });

            it("should display tooltip when hovering a transcript", () => {
                // eslint-disable-next-line cypress/no-force
                cy.get("@geneTrack")
                    .find(`div[data-cy="gb-track-content"] g[data-cy="gb-feature-transcript"][data-id="${transcript}"]`)
                    .trigger("mouseover", {force: true});
                
                // eslint-disable-next-line cypress/no-unnecessary-waiting
                cy.wait(2000).then(() => {
                    cy.get("div.qtip")
                        .should("exist");
                    
                    cy.get("div.qtip")
                        .find("div.qtip-title")
                        .should("contain.text", `Transcript - ${transcriptTitle}`);
                });
            });

            it("should render exons", () => {
                cy.get("@geneTrack")
                    .find(`div[data-cy="gb-track-content"] g[data-cy="gb-feature-exon"][data-id="${exon}"]`)
                    .should("exist");
            });

            it("should display tooltip when hovering an exon", () => {
                // eslint-disable-next-line cypress/no-force
                cy.get("@geneTrack")
                    .find(`div[data-cy="gb-track-content"] g[data-cy="gb-feature-exon"][data-id="${exon}"]`)
                    .first()
                    .trigger("mouseover", {force: true});

                // eslint-disable-next-line cypress/no-unnecessary-waiting
                cy.wait(2000).then(() => {
                    cy.get("div.qtip")
                        .should("exist");
                    
                    cy.get("div.qtip")
                        .find("div.qtip-title")
                        .should("contain.text", `Exon - ${exon}`);
                });
            });
        });

        context("opencga variants track", () => {
            const snvVariant = "17:43108791:A:G";
            const indelVariant = "17:43102949:-:T";
            const highlightedVariant = "17:43106026:C:T";

            const sampleNames = ["NA12877", "NA12878", "NA12889"];
            const sampleTypes = ["Somatic", "Somatic", "Germline"];

            const colorsByConsequenceType = {
                "intron_variant": "#02599c",
                "splice_region_variant": "#ff7f50",
                "5_prime_UTR_variant": "#7ac5cd",
            };
            const colorsByGenotype = {
                "heterozygous": "darkorange",
                "homozygous": "red",
            };

            beforeEach(() => {
                cy.get("@tracklistPanel")
                    .find(`div[data-cy="gb-track"][data-track-title="Variant (Samples)"]`)
                    .as("opencgaVariantsTrack");
            });

            it("should render", () => {
                cy.get("@opencgaVariantsTrack")
                    .should("exist");
            });

            it("should render track title", () => {
                cy.get("@opencgaVariantsTrack")
                    .find(`div[data-cy="gb-track-title"]`)
                    .should("contain.text", "Variant (Samples)");
            });

            it("should not display errors", () => {
                cy.get("@opencgaVariantsTrack")
                    .find(`div[data-cy="gb-track-error"]`)
                    .should("not.be.visible");
            });

            it("should render sample names and types", () => {
                cy.get("@opencgaVariantsTrack")
                    .find(`div[data-cy="gb-track-content"] div[data-cy="gb-opencga-variants-samples"]`)
                    .find(`div[data-cy="gb-opencga-variants-samples-item"]`)
                    .each((el, index) => {
                        cy.wrap(el)
                            .find(`[data-cy="gb-opencga-variants-samples-item-name"]`)
                            .should("contain.text", sampleNames[index]);

                        cy.wrap(el)
                            .find(`[data-cy="gb-opencga-variants-samples-item-type"]`)
                            .should("contain.text", sampleTypes[index]);
                    });
            });

            it("should render variants", () => {
                cy.get("@opencgaVariantsTrack")
                    .find(`div[data-cy="gb-track-content"]`)
                    .find(`g[data-cy="gb-variant"]`)
                    .should("have.length.greaterThan", 0);
            });

            it("should render the lollipop", () => {
                cy.get("@opencgaVariantsTrack")
                    .find(`g[data-cy="gb-variant"][data-id="${indelVariant}"]`)
                    .within(() => {
                        cy.get(`path[data-cy="gb-variant-lollipop-path"]`)
                            .should("exist");
                        cy.get(`[data-cy="gb-variant-lollipop-shape"]`)
                            .should("exist");
                    });
            });

            it("should render the correct lollipop shape for INDEL variants", () => {
                cy.get("@opencgaVariantsTrack")
                    .find(`g[data-cy="gb-variant"][data-type="INDEL"][data-id="${indelVariant}"]`)
                    .find(`path[data-cy="gb-variant-lollipop-shape"]`)
                    .invoke("attr", "data-shape")
                    .should("equal", "triangle");
            });

            it("should render the correct lollipop shape for SNV variants", () => {
                cy.get("@opencgaVariantsTrack")
                    .find(`g[data-cy="gb-variant"][data-type="SNV"][data-id="${snvVariant}"]`)
                    .find(`circle[data-cy="gb-variant-lollipop-shape"]`)
                    .invoke("attr", "data-shape")
                    .should("equal", "circle");
            });

            it("should encode the consequence type of the variant in the lollipop fill", () => {
                Object.keys(colorsByConsequenceType).forEach(key => {
                    cy.get("@opencgaVariantsTrack")
                        .find(`g[data-cy="gb-variant"][data-ct="${key}"]`)
                        .first()
                        .find(`[data-cy="gb-variant-lollipop-shape"]`)
                        .invoke("attr", "fill")
                        .should("equal", colorsByConsequenceType[key]);
                });
            });

            it("should display a tooltip when hovering the lollipop shape", () => {
                // eslint-disable-next-line cypress/no-force
                cy.get("@opencgaVariantsTrack")
                    .find(`g[data-cy="gb-variant"][data-id="${indelVariant}"]`)
                    .find(`path[data-cy="gb-variant-lollipop-shape"]`)
                    .trigger("mouseover", {force: true});

                // eslint-disable-next-line cypress/no-unnecessary-waiting
                cy.wait(2000).then(() => {
                    cy.get("div.qtip")
                        .should("exist");
                    
                    cy.get("div.qtip")
                        .find("div.qtip-title")
                        .should("contain.text", indelVariant);
                });
            });

            it("should highlight the variant", () => {
                cy.get("@opencgaVariantsTrack")
                    .find(`g[data-cy="gb-variant"][data-id="${highlightedVariant}"]`)
                    .find(`path[data-cy="gb-variant-highlight"]`)
                    .should("exist");
            });

            it("should display a tooltip when user hovers the highlight icon", () => {
                // eslint-disable-next-line cypress/no-force
                cy.get("@opencgaVariantsTrack")
                    .find(`g[data-cy="gb-variant"][data-id="${highlightedVariant}"]`)
                    .find(`rect[data-cy="gb-variant-highlight-mask"]`)
                    .trigger("mouseover", {force: true});

                // eslint-disable-next-line cypress/no-unnecessary-waiting
                cy.wait(2000).then(() => {
                    cy.get("div.qtip")
                        .should("exist");
                    
                    cy.get("div.qtip")
                        .find("div.qtip-title")
                        .should("contain.text", highlightedVariant);
                });
            });

            it("should display variant genotypes for each sample", () => {
                cy.get("@opencgaVariantsTrack")
                    .find(`g[data-cy="gb-variant"][data-id="${indelVariant}"]`)
                    .find(`rect[data-cy="gb-variant-genotype"]`)
                    .should("have.length", sampleNames.length);
            });

            it("should encode the genotype in the color or each rectangle", () => {
                cy.get("@opencgaVariantsTrack")
                    .find(`g[data-cy="gb-variant"][data-id="${indelVariant}"]`)
                    .within(() => {
                        cy.get(`rect[data-cy="gb-variant-genotype"][data-sample-genotype="1/1"]`)
                            .invoke("attr", "fill")
                            .should("equal", colorsByGenotype["homozygous"]);
                        
                        cy.get(`rect[data-cy="gb-variant-genotype"][data-sample-genotype="0/1"]`)
                            .invoke("attr", "fill")
                            .should("equal", colorsByGenotype["heterozygous"]);
                    });
            });

            it("should display a tooltip when user hovers the genotype", () => {
                // eslint-disable-next-line cypress/no-force
                cy.get("@opencgaVariantsTrack")
                    .find(`g[data-cy="gb-variant"][data-id="${indelVariant}"]`)
                    .find(`rect[data-cy="gb-variant-genotype"]`)
                    .first()
                    .trigger("mouseover", {force: true});

                // eslint-disable-next-line cypress/no-unnecessary-waiting
                cy.wait(2000).then(() => {
                    cy.get("div.qtip")
                        .should("exist");
                });
            });
 
        });

        context("Cellbase variants track", () => {
            const variant = "17:43104257:G:A";

            beforeEach(() => {
                cy.get("@tracklistPanel")
                    .find(`div[data-cy="gb-track"][data-track-title="Variants (CellBase)"]`)
                    .as("cellbaseVariantsTrack");
            });

            it("should render", () => {
                cy.get("@cellbaseVariantsTrack")
                    .should("exist");
            });

            it("should render track title", () => {
                cy.get("@cellbaseVariantsTrack")
                    .find(`div[data-cy="gb-track-title"]`)
                    .should("contain.text", "Variants (CellBase)");
            });

            it("should not display errors", () => {
                cy.get("@cellbaseVariantsTrack")
                    .find(`div[data-cy="gb-track-error"]`)
                    .should("not.be.visible");
            });

            it("should render features (variants)", () => {
                cy.get("@cellbaseVariantsTrack")
                    .find(`div[data-cy="gb-track-content"]`)
                    .find(`g[data-cy="gb-feature"][data-feature-id="${variant}"]`)
                    .should("exist");
            });

            it("should not render features labels", () => {
                cy.get("@cellbaseVariantsTrack")
                    .find(`div[data-cy="gb-track-content"]`)
                    .find(`g[data-cy="gb-feature"][data-feature-id="${variant}"]`)
                    .find(`text[data-cy="gb-feature-label"]`)
                    .should("not.exist");
            });

            it("should display a tooltip when hovering a variant", () => {
                // eslint-disable-next-line cypress/no-force
                cy.get("@cellbaseVariantsTrack")
                    .find(`g[data-cy="gb-feature"][data-feature-id="${variant}"]`)
                    .trigger("mouseover", {force: true});

                // eslint-disable-next-line cypress/no-unnecessary-waiting
                cy.wait(2000).then(() => {
                    cy.get("div.qtip")
                        .should("exist");
                    
                    cy.get("div.qtip")
                        .find("div.qtip-title")
                        .should("contain.text", variant);
                });
            });
        });
    });
});
