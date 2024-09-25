context("GenomeBrowser", () => {
    const region = {
        chromosome: "17",
        start: 43102293,
        end: 43106467,
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
                .trigger("click", {force: true});

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

        it("should display cytobands sorted", () => {
            const armLabels = {
                p: ["p11.1", "p11.2", "p12", "p13.1", "p13.2", "p13.3"],
                q: ["q11.1","q11.2","q12","q21.1","q21.2","q21.31","q21.32","q21.33","q22","q23.1","q23.2","q23.3","q24.1","q24.2","q24.3","q25.1","q25.2","q25.3"],
            };

            Object.keys(armLabels).forEach(arm => {
                cy.get("@chromosome")
                    .find(`svg text[data-cy="gb-chromosome-cytoband-label"][data-chromosome-arm="${arm}"]`)
                    .invoke("text")
                    .should("equal", armLabels[arm].join(""));
            });
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
                    .should("have.length", 1);
                cy.get("@geneOverviewTrack")
                    .find(`svg g[data-cy="gb-feature"]`)
                    .invoke("attr", "data-feature-id")
                    .should("equal", "ENSG00000012048");
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

            it("should encode biotype as the exon color", () => {
                const exons = ["ENSE00001946902.1", "ENSE00002796714.1", "ENSE00003824040.1"];
                const biotypes = ["protein_coding", "non_stop_decay", "nonsense_mediated_decay"];
                const colors = ["#a00000", "aqua", "seagreen"];

                exons.forEach((exonId, index) => {
                    cy.get("@geneTrack")
                        .find(`div[data-cy="gb-track-content"] g[data-cy="gb-feature-exon"][data-id="${exonId}"]`)
                        .as("exon");
                    
                    cy.get("@exon")
                        .invoke("attr", "data-transcript-biotype")
                        .should("equal", biotypes[index]);
                    cy.get("@exon")
                        .find(`rect[data-cy="gb-feature-exon-coding"]`)
                        .invoke("attr", "fill")
                        .should("equal", colors[index]);
                });
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

        context("OpenCGA variants track", () => {
            const snvVariant = "17:43108791:A:G";
            const indelVariant = "17:43102949:-:T";
            const highlightedVariant = "17:43106026:C:T";
            const qualityVariant = "17:43100558:G:A";

            const sampleNames = ["NA12877", "NA12878", "NA12889"];
            const sampleTypes = ["Somatic", "Somatic", "Germline"];
            const sampleSexIcons = ["fa-mars", "fa-genderless", "fa-genderless"];

            const colorsByConsequenceType = {
                "intron_variant": "#02599c",
                "synonymous_variant": "#8BC34A",
                "missense_variant": "#ffd700",
                // "splice_region_variant": "#ff7f50",
                // "5_prime_UTR_variant": "#7ac5cd",
                "3_prime_UTR_variant": "#7ac5cd"
            };
            const colorsByGenotype = {
                "heterozygous": "darkorange",
                "homozygous": "red",
            };

            beforeEach(() => {
                cy.get("@tracklistPanel")
                    .find(`div[data-cy="gb-track"][data-track-title="Variants (OpenCGA)"]`)
                    .as("opencgaVariantsTrack");
            });

            it("should render", () => {
                cy.get("@opencgaVariantsTrack")
                    .should("exist");
            });

            it("should render track title", () => {
                cy.get("@opencgaVariantsTrack")
                    .find(`div[data-cy="gb-track-title"]`)
                    .should("contain.text", "Variants (OpenCGA)");
            });

            it("should not display errors", () => {
                cy.get("@opencgaVariantsTrack")
                    .find(`div[data-cy="gb-track-error"]`)
                    .should("not.be.visible");
            });

            it("should render sample names", () => {
                cy.get("@opencgaVariantsTrack")
                    .find(`div[data-cy="gb-track-content"] div[data-cy="gb-opencga-variants-samples"]`)
                    .find(`div[data-cy="gb-opencga-variants-sample"]`)
                    .each((el, index) => {
                        cy.wrap(el)
                            .find(`[data-cy="gb-opencga-variants-sample-name"]`)
                            .should("contain.text", sampleNames[index]);
                    });
            });

            it("should render sample types", () => {
                cy.get("@opencgaVariantsTrack")
                    .find(`div[data-cy="gb-track-content"] div[data-cy="gb-opencga-variants-samples"]`)
                    .find(`div[data-cy="gb-opencga-variants-sample"]`)
                    .each((el, index) => {
                        cy.wrap(el)
                            .find(`[data-cy="gb-opencga-variants-sample-type"]`)
                            .should("contain.text", sampleTypes[index]);
                    });
            });

            it("should render sample sex", () => {
                cy.get("@opencgaVariantsTrack")
                    .find(`div[data-cy="gb-track-content"] div[data-cy="gb-opencga-variants-samples"]`)
                    .find(`div[data-cy="gb-opencga-variants-sample"]`)
                    .each((el, index) => {
                        cy.wrap(el)
                            .find(`[data-cy="gb-opencga-variants-sample-sex"]`)
                            .invoke("attr", "class")
                            .should("contain", sampleSexIcons[index]);
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

            it("should encode the genotype in the color of each rectangle", () => {
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

            it("should encode the quality as the opacity of each rectangle", () => {
                cy.get("@opencgaVariantsTrack")
                    .find(`g[data-cy="gb-variant"][data-id="${qualityVariant}"]`)
                    .within(() => {
                        // In the first sample, this variant does not pass quality checks
                        cy.get(`rect[data-cy="gb-variant-genotype"][data-sample-index="0"]`)
                            .invoke("attr", "opacity")
                            .should("equal", "0.3");
                        
                        // In the third sample, this variant pass quality checks
                        cy.get(`rect[data-cy="gb-variant-genotype"][data-sample-index="2"]`)
                            .invoke("attr", "opacity")
                            .should("equal", "1");
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
            const variantId = "17:43104257:G:A";
            const variantColor = "#8BC35A";

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
                    .find(`g[data-cy="gb-feature"][data-feature-id="${variantId}"]`)
                    .should("exist");
            });

            it("should not render features labels", () => {
                cy.get("@cellbaseVariantsTrack")
                    .find(`div[data-cy="gb-track-content"]`)
                    .find(`g[data-cy="gb-feature"][data-feature-id="${variantId}"]`)
                    .find(`text[data-cy="gb-feature-label"]`)
                    .should("not.exist");
            });

            it("should style features rectangle", () => {
                cy.get("@cellbaseVariantsTrack")
                    .find(`div[data-cy="gb-track-content"]`)
                    .find(`g[data-cy="gb-feature"][data-feature-id="${variantId}"]`)
                    .find(`rect[data-cy="gb-feature-rect"]`)
                    .invoke("attr", "fill")
                    .should("equal", variantColor);
            });

            it("should display a tooltip when hovering a variant", () => {
                // eslint-disable-next-line cypress/no-force
                cy.get("@cellbaseVariantsTrack")
                    .find(`g[data-cy="gb-feature"][data-feature-id="${variantId}"]`)
                    .trigger("mouseover", {force: true});

                // eslint-disable-next-line cypress/no-unnecessary-waiting
                cy.wait(2000).then(() => {
                    cy.get("div.qtip")
                        .should("exist");
                    
                    cy.get("div.qtip")
                        .find("div.qtip-title")
                        .should("contain.text", variantId);
                });
            });
        });

        context("Alignments track", () => {
            const pairedAlignmentId = "A00354:92:HLCFJDSXX:2:2307:17390:27352";
            const deletionAlignmentId = "A00354:92:HLCFJDSXX:2:2278:31439:21621";
            const translocationAlignmentId = "E00527:162:H23G7CCX2:4:2201:12611:7866";
            const lowQualityAlignmentId = "A00354:92:HLCFJDSXX:1:2233:30779:21762";

            const alignmentsColor = {
                default: "#6c757d",
                possibleDeletion: "#dc3545",
                // possibleInsertion: "#0d6efd",
                translocation: "#fd7e14",
                // not_paired: "#140330", // "#2c0b0e",
            };

            beforeEach(() => {
                cy.get("@tracklistPanel")
                    .find(`div[data-cy="gb-track"][data-track-title="Alignments (OpenCGA)"]`)
                    .as("alignmentsTrack");
            });

            it("should render", () => {
                cy.get("@alignmentsTrack")
                    .should("exist");
            });

            it("should render track title", () => {
                cy.get("@alignmentsTrack")
                    .find(`div[data-cy="gb-track-title"]`)
                    .should("contain.text", "Alignments (OpenCGA)");
            });

            it("should not display errors", () => {
                cy.get("@alignmentsTrack")
                    .find(`div[data-cy="gb-track-error"]`)
                    .should("not.be.visible");
            });

            context("coverage", () => {
                beforeEach(() => {
                    cy.get("@alignmentsTrack")
                        .find(`g[data-cy="gb-coverage"]`)
                        .as("coverage");
                });

                it("should render coverage of current region", () => {
                    cy.get("@coverage")
                        .find("polyline")
                        .should("exist");
                });
            });

            context("alignments", () => {
                beforeEach(() => {
                    cy.get("@alignmentsTrack")
                        .find(`g[data-cy="gb-alignments"]`)
                        .as("alignments");
                });

                it("should render alignments", () => {
                    cy.get("@alignments")
                        .should("exist")
                        .and("not.be.empty");
                });

                context("reads", () => {
                    it("should render paired reads", () => {
                        cy.get("@alignments")
                            .find(`g[data-cy="gb-alignment"][data-alignment-id="${pairedAlignmentId}"]`)
                            .find(`path[data-cy="gb-alignment-read"]`)
                            .should("have.length", 2);
                    });

                    it("should render connector between paired reads", () => {
                        cy.get("@alignments")
                            .find(`g[data-cy="gb-alignment"][data-alignment-id="${pairedAlignmentId}"]`)
                            .find(`path[data-cy="gb-alignment-connector"]`)
                            .should("exist");
                    });

                    it("should encode possible deletion as the read color", () => {
                        cy.get("@alignments")
                            .find(`g[data-cy="gb-alignment"][data-alignment-id="${deletionAlignmentId}"]`)
                            .find(`path[data-cy="gb-alignment-read"]`)
                            .invoke("attr", "fill")
                            .should("equal", alignmentsColor.possibleDeletion);
                    });

                    it("should not render a connector in overlapped reads (possible deletion)", () => {
                        cy.get("@alignments")
                            .find(`g[data-cy="gb-alignment"][data-alignment-id="${deletionAlignmentId}"]`)
                            .find(`path[data-cy="gb-alignment-connector"]`)
                            .should("not.exist");
                    });

                    it("should render a single read in a translocation alignment", () => {
                        cy.get("@alignments")
                            .find(`g[data-cy="gb-alignment"][data-alignment-id="${translocationAlignmentId}"]`)
                            .find(`path[data-cy="gb-alignment-read"]`)
                            .should("have.length", 1);
                    });

                    it("should encode translocation as the read color", () => {
                        cy.get("@alignments")
                            .find(`g[data-cy="gb-alignment"][data-alignment-id="${translocationAlignmentId}"]`)
                            .find(`path[data-cy="gb-alignment-read"]`)
                            .invoke("attr", "fill")
                            .should("equal", alignmentsColor.translocation);
                    });

                    it("should encode quality as the read fill-opacity", () => {
                        cy.get("@alignments")
                            .find(`g[data-cy="gb-alignment"][data-alignment-id="${lowQualityAlignmentId}"]`)
                            .find(`path[data-cy="gb-alignment-read"]`)
                            .invoke("attr", "fill-opacity")
                            .should("equal", "0.2");
                    });
                });

                context("tooltip", () => {
                    beforeEach(() => {
                        // eslint-disable-next-line cypress/no-force
                        cy.get("@alignments")
                            .find(`g[data-cy="gb-alignment"][data-alignment-id="${pairedAlignmentId}"]`)
                            .find(`path[data-cy="gb-alignment-read"]`)
                            .first()
                            .trigger("mouseover", {force: true});
                    });

                    it("should display a tooltip when hovering a read", () => {
                        cy.get("div.qtip")
                            .should("exist");
                    });

                    it("should display the alignment ID in the tooltip title", () => {
                        cy.get("div.qtip")
                            .find("div.qtip-title")
                            .should("contain.text", `Alignment ${pairedAlignmentId}`);
                    });

                    it("should display read flags in tooltip when hovering the read", () => {
                        cy.get("div.qtip")
                            .find("div.qtip-content")
                            .find(`div[data-cy="gb-alignment-tooltip-flags"]`)
                            .find(`div[data-cy="gb-alignment-tooltip-flag"]`)
                            .should("have.length.greaterThan", 0);
                    });
                });
            });
        });
    });
});
