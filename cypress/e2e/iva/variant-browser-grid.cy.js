context("Variant Browser Grid", () => {
    beforeEach(() => {
        cy.visit("#variant-browser-grid");
        cy.get("variant-browser-grid")
            .as("variantBrowser");
        cy.waitUntil(() => {
            return cy.get("@variantBrowser")
                .should("be.visible");
        });
    });

    context("render", () => {
        it("should render the component 'variant-browser-grid'", () => {
            cy.get("@variantBrowser")
                .should("be.visible");
        });
    });

    context("pagination", () => {
        it("should allow changing between pages", () => {
            cy.get("@variantBrowser")
                .find(`span[class="pagination-info"]`)
                .should("contain.text", "Showing 1 to 10 of 30 records");

            cy.get("@variantBrowser")
                .find(`div[class="fixed-table-pagination"]`)
                .find(`a[class="page-link"]`)
                .contains("2")
                .click();
            
            cy.get("@variantBrowser")
                .find(`span[class="pagination-info"]`)
                .should("contain.text", "Showing 11 to 20 of 30 records");
        });
    });

    context("modals", () => {
        context("settings", () => {
            it("should be draggable", () => {
                cy.get("@variantBrowser")
                    .find(`button[data-cy="toolbar-btn-settings"]`)
                    .click();

                cy.get("@variantBrowser")
                    .find(`div[id$="SettingModal"]`)
                    .then($modal => {
                        const startPosition = $modal.offset();
                        cy.log("start Position:", startPosition);
                        // Drag the modal to a new position using Cypress's drag command
                        cy.wrap($modal)
                            .find(".modal-header")
                            .as("modalHeader");
                        cy.get("@modalHeader")
                            .trigger("mousedown", {which: 1}); // Trigger mouse down event
                        cy.get("@modalHeader")
                            .trigger("mousemove", {clientX: 100, clientY: 100}); // Move the mouse
                        cy.get("@modalHeader")
                            .trigger("mouseup"); // Release the mouse

                        // Get the final position of the modal
                        cy.get("@modalHeader")
                            .then($modal => {
                                const finalPosition = $modal.offset();
                                cy.log("final Position:", finalPosition);
                                // Assert that the modal has moved
                                expect(finalPosition.left).to.not.equal(startPosition.left);
                                expect(finalPosition.top).to.not.equal(startPosition.top);
                            });
                    });
            });
        });
    });

    context("columns", () => {
        it("should hide columns from Settings Modal", () => {
            const columns = ["Type", "Consequence Type", "Gene"]; 
            columns.forEach(column => {
                cy.get("@variantBrowser")
                    .find("thead th")
                    .contains("div", column)
                    .should("be.visible");
            });

            cy.get("@variantBrowser")
                .find(`button[data-cy="toolbar-btn-settings"]`)
                .click();
            
            // TODO: rename tag 'data-testid' to 'data-cy'
            cy.get("@variantBrowser")
                .find(`div[data-testid="test-columns"] select-field-filter .select2-container`)
                .click();
            columns.forEach(column => {
                cy.get("@variantBrowser")
                    .find(`div[data-testid="test-columns"] select-field-filter span.select2-results li`)
                    .contains(column)
                    .click();
            });
            cy.get("@variantBrowser")
                .find(`div[data-testid="test-columns"] select-field-filter .select2-selection`)
                .click();

            cy.get("@variantBrowser")
                .find(`div[id$="SettingModal"]`)
                .contains("button", "OK")
                .click();
            
            columns.forEach(column => {
                cy.get("@variantBrowser")
                    .find("thead th")
                    .should("not.contain.text", column);
            });
        });

        context("variant column", () => {
            const columnIndex = 1;
            it("should be visible by default", () => {
                cy.get("@variantBrowser")
                    .find("thead tr:first th")
                    .eq(columnIndex)
                    .should("be.visible")
                    .and("contain.text", "Variant");
            });

            context("tooltip", () => {
                beforeEach(() => {
                    cy.get("@variantBrowser")
                        .find("tbody tr:first td")
                        .eq(columnIndex)
                        .find("a")
                        .trigger("mouseover");
                });

                it("should display a tooltip when hovering the variant ID", () => {
                    cy.get(`div[class="qtip-content"]`)
                        .contains("External Links")
                        .should("be.visible");
                });

                it("should display a link to varsome in the variant tooltip", () => {
                    cy.get("div.qtip-content")
                        .find(`div[data-cy="varsome-variant-link"] a`)
                        .should("contain.text", "Varsome")
                        .invoke("attr", "href")
                        .should("have.string", "https://varsome.com/variant/");
                });
            });
        });

        context("type column", () => {
            const columnIndex = 2;
            it("should be visible by default", () => {
                cy.get("@variantBrowser")
                    .find("thead tr:first th")
                    .eq(columnIndex)
                    .should("be.visible")
                    .and("contain.text", "Type");
            });
        });

        context("gene column", () => {
            const columnIndex = 3;
            it("should be visible by default", () => {
                cy.get("@variantBrowser")
                    .find("thead tr:first th")
                    .eq(columnIndex)
                    .should("be.visible")
                    .and("contain.text", "Gene");
            });

            context("tooltip", () => {
                beforeEach(() => {
                    cy.get("@variantBrowser")
                        .find("tbody tr:first td")
                        .eq(columnIndex)
                        .find("a")
                        .trigger("mouseover");
                });

                it("should display a tooltip when hovering the gene ID", () => {
                    cy.get(`div[class="qtip-content"]`)
                        .contains("Gene View")
                        .should("be.visible");
                });

                it("should display a link to varsome in the gene tooltip", () => {
                    cy.get("div.qtip-content")
                        .find(`div[data-cy="varsome-gene-link"] a`)
                        .should("contain.text", "Varsome")
                        .invoke("attr", "href")
                        .should("have.string", "https://varsome.com/gene/");
                });
            });
        });

        context("hgvs column", () => {
            const columnIndex = 4;
            it("should be displayed by default", () => {
                cy.get("@variantBrowser")
                    .find("thead tr:first th")
                    .contains("HGVS")
                    .should("be.visible");
            });

            it("should render a link to Ensembl Transcript", () => {
                cy.get("@variantBrowser")
                    .find("tbody tr td")
                    .eq(columnIndex)
                    .find(`a[href^="https://www.ensembl.org/Homo_sapiens/Transcript/Summary"]`)
                    .should("exist");
            });

            it("should render a link to NCBI Gene", () => {
                cy.get("@variantBrowser")
                    .find("tbody tr td")
                    .eq(columnIndex)
                    .find(`a[href^="https://www.ncbi.nlm.nih.gov/gene"]`)
                    .should("exist");
            });
        });

        context("population-frequencies column", () => {
            const columnIndex = 14;
            const populations = ["1000 Genomes", "gnomAD Genomes", "gnomAD Exomes"];

            it("should be displayed by default", () => {
                cy.get("@variantBrowser")
                    .find("thead tr:first th")
                    .contains("Population Frequencies")
                    .should("be.visible");
            });

            it("should display a subcolumn for each population", () => {
                populations.forEach(population => {
                    cy.get("@variantBrowser")
                        .find("thead tr:last th")
                        .contains(population)
                        .should("be.visible");
                });
            });

            it("should display a tooltip when hovering on each population box", () => {
                populations.forEach((population, index) => {
                    cy.get("@variantBrowser")
                        .find("tbody tr:first > td")
                        .eq(columnIndex + index)
                        .find("a")
                        .trigger("mouseover");
                });

                cy.get(`div[class="qtip-titlebar"]`)
                    .should("have.length", populations.length)
                    .and("contain.text", "Population Frequencies");
            });
        });

        context("actions column", () => {
            it("should be displayed", () => {
                cy.get("@variantBrowser")
                    .find("thead tr:first th")
                    .contains("Actions")
                    .should("be.visible");
            });

            it("should render a button with a toolbox icon", () => {
                cy.get("@variantBrowser")
                    .find("tbody tr:first td:last button")
                    .should("contain.text", "Actions")
                    .find("i")
                    .should("have.class", "fa-toolbox");
            });
        });
    });

    context("clinical info", () => {
        context("cosmic column", () => {
            const columnIndex = 18;
            it("should display an 'x' icon if no cosmic information is available", () => {
                cy.get("@variantBrowser")
                    .find(`tbody > tr[data-uniqueid="14:91649938:A:G"] > td`)
                    .eq(columnIndex)
                    .find("i")
                    .should("have.class", "fa-times");
            });

            it("should display the number of entries and total trait associations", () => {
                cy.get("@variantBrowser")
                    .find("tbody tr:first > td")
                    .eq(columnIndex)
                    .should("contain.text", "1 entry (1)");
            });

            it("should display a tooltip with a link to cosmic", () => {
                cy.get("@variantBrowser")
                    .find("tbody tr:first > td")
                    .eq(columnIndex)
                    .find("a")
                    .trigger("mouseover");

                cy.get(`div[class="qtip-content"]`)
                    .find(`a[href^="https://cancer.sanger.ac.uk/cosmic/search?q="]`)
                    .should("exist");
            });
        });
    });

    context("actions", () => {
        const variant = "14:91649858:C:T";
        beforeEach(() => {
            cy.get("@variantBrowser")
                .find("tbody tr:first td:last button")
                .click();
            cy.get("@variantBrowser")
                .find(`tbody tr:first td:last ul[class^="dropdown-menu"]`)
                .as("actionsDropdown");
        });

        context("fetch variant actions", () => {
            it("should allow to copy variant JSON to clipboard", () => {
                cy.get("@actionsDropdown")
                    .find("li a[data-action]")
                    .contains("Copy JSON")
                    .click();
                cy.window()
                    .then(windowInstance => {
                        return windowInstance.navigator.clipboard
                            .readText()
                            .then(content => {
                                const clipboardData = JSON.parse(content);
                                expect(clipboardData?.id).to.equal(variant);
                            });
                    });
            });

            it("should allow to download variant JSON as a file", () => {
                cy.get("@actionsDropdown")
                    .find("li a[data-action]")
                    .contains("Download JSON")
                    .click();
                cy.readFile(`cypress/downloads/${variant.replace(/:/g, "_")}.json`)
                    .should("exist");
            });

            it("should allow to copy the varsome ID to clipboard", () => {
                cy.get("@actionsDropdown")
                    .find("li a[data-action]")
                    .contains("Copy Varsome ID")
                    .click();
                cy.window()
                    .then(windowInstance => {
                        return windowInstance.navigator.clipboard
                            .readText()
                            .then(content => {
                                expect(content).to.equal("chr" + variant);
                            });
                    });
            });
        });

        context("external links actions", () => {
            const externalLinks = [
                ["Decipher", "https://www.deciphergenomics.org/sequence-variant/"],
                ["Varsome", "https://varsome.com/variant/"],
                ["CellBase v5.2", "https://ws.zettagenomics.com/cellbase/webservices/rest/v5.2"],
                ["CellBase v5.8", "https://ws.zettagenomics.com/cellbase/webservices/rest/v5.8"],
                ["Ensembl Genome Browser", "http://ensembl.org/Homo_sapiens/Location/View"],
                ["UCSC Genome Browser", "https://genome.ucsc.edu/cgi-bin/hgTracks"],
            ];
            externalLinks.forEach(link => {
                it(`should have a link to ${link[0]}`, () => {
                    cy.get("@actionsDropdown")
                        .find(`li a[href^="${link[1]}"]`)
                        .should("exist")
                        .and("contain.text", link[0]);
                });
            });
        });
    });
});
