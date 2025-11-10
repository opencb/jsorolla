context("Variant Browser Grid", () => {
    beforeEach(() => {
        cy.visit("#variant-browser-grid");
        cy.get("variant-browser-grid")
            .as("variant-browser-grid");

        cy.waitUntil(() => {
            return cy.get("@variant-browser-grid")
                .should("be.visible");
        });
    });

    context("toolbar", () => {
        beforeEach(() => {
            cy.get("@variant-browser-grid")
                .find("grid-toolbar")
                .as("toolbar");
        });

        it("should be visible", () => {
            cy.get("@toolbar")
                .should("be.visible");
        });

        it("should display the 'Export' button", () => {
            cy.get("@toolbar")
                .find(`button[data-cy="toolbar-btn-export"]`)
                .should("be.visible");
        });

        it("should display the 'Settings' button", () => {
            cy.get("@toolbar")
                .find(`button[data-cy="toolbar-btn-settings"]`)
                .should("be.visible");
        });
    });

    context("settings", () => {
        it("should display the settings modal when clicking on the 'Settings' button", () => {
            cy.get("@variant-browser-grid")
                .find(`button[data-action="settings"]`)
                .click();
            cy.get("div.modal-dialog")
                .should("be.visible");
        });
    });

    context("grid", () => {
        context("content", () => {
            it("should render a <table> element", () => {
                cy.get("@variant-browser-grid")
                    .find("table")
                    .should("be.visible");
            });
        });

        context("pagination", () => {
            it("should display the current page and total records", () => {
                cy.get("@variant-browser-grid")
                    .find("span.pagination-info")
                    .should("contain.text", "Showing 1 to 10 of 30 records");
            });

            it("should display the buttons for changing between pages", () => {
                cy.get("@variant-browser-grid")
                    .find("ul.pagination li.page-item")
                    .should("have.length", 3 + 2); // 3 pages + 2 for previous and next
            });

            it("should allow changing between pages", () => {
                cy.get("@variant-browser-grid")
                    .find("ul.pagination li.page-item")
                    .contains("2")
                    .click();

                cy.get("@variant-browser-grid")
                    .find("span.pagination-info")
                    .should("contain.text", "Showing 11 to 20 of 30 records");
            });
        });

        context("columns", () => {
            context("variant ID", () => {
                it("should be visible", () => {
                    cy.get("@variant-browser-grid")
                        .find("thead tr:first th")
                        .contains("Variant")
                        .should("be.visible");
                    });
                });

            context("variant type", () => {
                it("should be visible", () => {
                    cy.get("@variant-browser-grid")
                        .find("thead tr:first th")
                        .contains("Type")
                        .should("be.visible");
                });
            });

            context("gene", () => {
                it("should be visible", () => {
                    cy.get("@variant-browser-grid")
                        .find("thead tr:first th")
                        .contains("Gene")
                        .should("be.visible");
                });

                context("tooltip", () => {
                    beforeEach(() => {
                        cy.get("@variant-browser-grid")
                            .find("tbody tr:first td a")
                            .eq(2)
                            .trigger("mouseover");
                        cy.get("div.qtip-title")
                            .as("gene-tooltip-title");
                        cy.get("div.qtip-content")
                            .as("gene-tooltip-content");
 
                    });

                    it("should be visible when hovering the gene ID", () => {
                        cy.get("@gene-tooltip-title")
                            .should("be.visible")
                            .and("contain.text", "Links");
                    });

                    it("should display a link to varsome", () => {
                        cy.get("@gene-tooltip-content")
                            .find(`div[data-cy="varsome-gene-link"] a`)
                            .should("contain.text", "Varsome")
                            .invoke("attr", "href")
                            .should("have.string", "https://varsome.com/gene/");
                    });
                });
            });

            context("hgvs", () => {
                beforeEach(() => {
                    cy.get("@variant-browser-grid")
                        .find("tbody tr td")
                        .eq(4)
                        .as("hgvs-column");
                });

                it("should be visible", () => {
                    cy.get("@variant-browser-grid")
                        .find("thead tr:first th")
                        .contains("HGVS")
                        .should("be.visible");
                });

                it("should display a link to Ensembl Transcript", () => {
                    cy.get("@hgvs-column")
                        .find(`a[href^="https://www.ensembl.org/Homo_sapiens/Transcript/Summary"]`)
                        .should("exist");
                });

                it("should display a link to NCBI Gene", () => {
                    cy.get("@hgvs-column")
                        .find(`a[href^="https://www.ncbi.nlm.nih.gov/gene"]`)
                        .should("exist");
                });
            });

            context("population-frequencies", () => {
                const populations = ["1000 Genomes", "gnomAD Genomes", "gnomAD Exomes"];

                it("should be visible", () => {
                    cy.get("@variant-browser-grid")
                        .find("thead tr:first th")
                        .contains("Population Frequencies")
                        .should("be.visible");
                });

                it("should display a subcolumn for each population", () => {
                    populations.forEach(population => {
                        cy.get("@variant-browser-grid")
                            .find("thead tr:last th")
                            .contains(population)
                            .should("be.visible");
                    });
                });

                it("should display a tooltip when hovering on each population box", () => {
                    populations.forEach((population, index) => {
                        cy.get("@variant-browser-grid")
                            .find("tbody tr:first td")
                            .eq(14 + index)
                            .find("a")
                            .trigger("mouseover");
                    });

                    cy.get(`div[class="qtip-titlebar"]`)
                        .should("have.length", populations.length)
                        .and("contain.text", "Population Frequencies");
                });
            });

            context("cosmic", () => {
                const columnIndex = 19;

                it("should display a 'x' icon if no cosmic information is available", () => {
                    cy.get("@variant-browser-grid")
                        .find(`tbody tr[data-uniqueid="14:91649938:A:G"] td`)
                        .eq(columnIndex)
                        .find("i")
                        .should("have.class", "fa-times");
                });

                it("should display the number of entries and total trait associations", () => {
                    cy.get("@variant-browser-grid")
                        .find("tbody tr:first td")
                        .eq(columnIndex)
                        .should("contain.text", "1 entry (1)");
                });

                context("tooltip", () => {
                    beforeEach(() => {
                        cy.get("@variant-browser-grid")
                            .find("tbody tr:first > td")
                            .eq(columnIndex)
                            .find("a")
                            .trigger("mouseover");
                        cy.get("div.qtip-title")
                            .as("cosmic-tooltip-title");
                        cy.get("div.qtip-content")
                            .as("cosmic-tooltip-content");
                    });

                    it("should be visible when hovering the cosmic ID", () => {
                        cy.get("@cosmic-tooltip-title")
                            .should("be.visible")
                            .and("contain.text", "Cosmic");
                    });

                    it("should display a link to cosmic", () => {
                        cy.get("@cosmic-tooltip-content")
                            .find(`a[href^="https://cancer.sanger.ac.uk/cosmic/search?q="]`)
                            .should("exist");
                    });
                });
            });

            context("actions", () => {
                it("should display a button with a tree-dots icon", () => {
                    cy.get("@variant-browser-grid")
                        .find("tbody tr:first td:last button i")
                        .should("have.class", "fa-ellipsis-v");
                });
            });
        });

        context("actions", () => {
            beforeEach(() => {
                cy.get("@variant-browser-grid")
                    .find("tbody tr:first td:last button")
                    .click();
                cy.get("@variant-browser-grid")
                    .find("tbody tr:first td:last div.dropdown-menu")
                    .as("actions-dropdown");
            });

            it("should display a dropdown menu with actions", () => {
                cy.get("@actions-dropdown")
                    .should("be.visible");
            });

            it("should display external links", () => {
                const externalLinks = [
                    ["Decipher", "https://www.deciphergenomics.org/sequence-variant/"],
                    ["Varsome", "https://varsome.com/variant/"],
                    ["CellBase", "https://ws.zettagenomics.com/cellbase/webservices/rest"],
                    ["Ensembl Genome Browser", "https://www.ensembl.org/Homo_sapiens/Location/View"],
                    ["UCSC Genome Browser", "https://genome.ucsc.edu/cgi-bin/hgTracks"],
                ];

                externalLinks.forEach(link => {
                    cy.get("@actions-dropdown")
                        .find(`a.dropdown-item[href^="${link[1]}"]`)
                        .should("exist")
                        .and("contain.text", link[0]);
                });
            });
        });

        context("extensions", () => {
            it("should display a 'Extra Column' column", () => {
                cy.get("@variant-browser-grid")
                    .find("thead th")
                    .contains("Extra column")
                    .should("be.visible");
            });

        });
    });
});
