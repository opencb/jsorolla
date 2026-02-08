import {LitElement, html, nothing} from "lit";

export default class ClinicalPharmacogenomicsReview extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            toolParams: {
                type: Object
            },
            opencgaSession: {
                type: Object
            },
        };
    }

    #init() {
        this._results = [];
        this._translationFileContent = null;
        this._translationFileStats = null;
        this._genotypingFileStats = null;
    }

    update(changedProperties) {
        if (changedProperties.has("toolParams")) {
            // Process tool params to prepare results view
            this._prepareResultsView();
            this._fetchTranslationFileStats();
            this._parseGenotypingFileStats();
        }
        super.update(changedProperties);
    }

    async _fetchTranslationFileStats() {
        this._translationFileContent = null;
        this._translationFileStats = null;
        if (this.opencgaSession && this.toolParams?.alleleTyper?.translationFile) {
            try {
                // Fetch the file content from OpenCGA
                const response = await this.opencgaSession.opencgaClient.files()
                    .download(this.toolParams?.alleleTyper?.translationFile, {
                        study: this.opencgaSession.study.fqn,
                    });

                const content = response;
                this._translationFileContent = content;
                this._parseTranslationFileStats(content);
                this.requestUpdate();
            } catch (error) {
                console.error("Error fetching translation file:", error);
            }
        }
    }

    _parseTranslationFileStats(content) {
        const lines = content.trim().split(/\r?\n/);
        const genes = new Map();
        let totalAlleles = 0;
        let assayCount = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Skip comment lines
            if (line.startsWith("*") || line.startsWith("#")) {
                continue;
            }

            const columns = line.split(/\t|,/); // Support both tab and comma separation

            // Header line (contains 'gene' and 'allele')
            if (columns[0] === "gene" && columns[1] === "allele") {
                // Count assays (columns after gene and allele)
                assayCount = columns.length - 2;
                continue;
            }

            // Data lines
            if (columns.length > 2 && columns[0]) {
                const gene = columns[0];
                const allele = columns[1];

                if (gene && allele) {
                    totalAlleles++;
                    if (!genes.has(gene)) {
                        genes.set(gene, {
                            name: gene,
                            alleles: [],
                        });
                    }
                    genes.get(gene).alleles.push(allele);
                }
            }
        }

        // Calculate assays per gene
        const geneStats = Array.from(genes.values()).map(gene => ({
            name: gene.name,
            alleleCount: gene.alleles.length,
        }));

        this._translationFileStats = {
            totalGenes: genes.size,
            totalAlleles: totalAlleles,
            totalAssays: assayCount,
            genes: geneStats,
        };
    }

    _parseGenotypingFileStats() {
        this._genotypingFileStats = null;

        const genotypingFileContent = this.toolParams?.registry?.genotypingFileContent;
        if (!genotypingFileContent) {
            return;
        }

        const lines = genotypingFileContent.trim().split(/\r?\n/);
        const samples = new Set();
        const assays = new Set();
        const genes = new Map();

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Skip comments and empty lines
            if (line.startsWith("#") || line.length === 0) {
                continue;
            }

            const columns = line.split("\t");

            // Skip header line
            if (columns[0] === "Assay Name") {
                continue;
            }

            // Parse data rows
            if (columns.length > 4) {
                const assayName = columns[0]?.trim();
                const gene = columns[2]?.trim();
                const sample = columns[4]?.trim();

                // Collect unique assays
                if (assayName) {
                    assays.add(assayName);
                }

                // Collect unique samples
                if (sample) {
                    samples.add(sample);
                }

                // Collect assays per gene
                if (gene && assayName) {
                    if (!genes.has(gene)) {
                        genes.set(gene, new Set());
                    }
                    genes.get(gene).add(assayName);
                }
            }
        }

        // Calculate assays per gene
        const geneStats = Array.from(genes.entries()).map(([geneName, geneAssays]) => ({
            name: geneName,
            assayCount: geneAssays.size,
        }));

        this._genotypingFileStats = {
            totalSamples: samples.size,
            totalAssays: assays.size,
            totalGenes: genes.size,
            genes: geneStats,
        };
    }

    _prepareResultsView() {
        // TODO: This will be populated with actual analysis results
        // For now, we'll show a summary of the configuration
        this._results = [];
    }

    renderSummaryCard(title, icon, content) {
        return html`
            <div class="card mb-3">
                <div class="card-header bg-primary text-white">
                    <h5 class="mb-0">
                        <i class="${icon} me-2"></i>${title}
                    </h5>
                </div>
                <div class="card-body">
                    ${content}
                </div>
            </div>
        `;
    }

    renderResults() {
        const results = this.toolParams?.review?.results || [];

        if (results.length === 0) {
            return html`
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    No results found.
                </div>
            `;
        }

        return html`
            <div class="alert alert-success mb-3">
                <i class="fas fa-check-circle me-2"></i>
                <strong>Analysis Completed Successfully!</strong>
                <span class="ms-2">${results.length} sample${results.length > 1 ? "s" : ""} analyzed</span>
            </div>

            <table class="table table-hover table-bordered">
                <thead class="table-light">
                    <tr>
                        <th style="width: 15%">Sample ID</th>
                        <th style="width: 10%">Genes</th>
                        <th>Star Alleles Summary</th>
                        <th style="width: 15%">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.map(sample => {
                        const genesCount = sample.starAlleles?.length || 0;
                        // Create a summary of star alleles (first 5 genes)
                        const allelesSummary = sample.starAlleles?.slice(0, 5).map(gene =>
                            `${gene.gene}: ${gene.alleles?.map(a => a.allele).join(", ")}`
                        ).join(" | ");
                        const hasMore = genesCount > 5;

                        return html`
                            <tr>
                                <td><strong>${sample.sampleId}</strong></td>
                                <td>
                                    <span class="badge bg-primary">${genesCount}</span>
                                </td>
                                <td>
                                    <small>${allelesSummary}</small>
                                    ${hasMore ? html`<span class="text-muted">... and ${genesCount - 5} more</span>` : nothing}
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" @click="${() => this.showSampleDetails(sample)}">
                                        <i class="fas fa-eye me-1"></i>View Details
                                    </button>
                                </td>
                            </tr>
                        `;
                    })}
                </tbody>
            </table>
        `;
    }

    showSampleDetails(sample) {
        // TODO: Implement modal or expandable view with full details
        console.log("Sample details:", sample);
        alert(`Sample ${sample.sampleId}\n\nGenes analyzed: ${sample.starAlleles?.length}\n\nClick OK to see details in console.`);
    }

    render() {
        if (!this.opencgaSession) {
            return nothing;
        }

        const registry = this.toolParams?.registry || {};
        const alleleTyper = this.toolParams?.alleleTyper || {};

        const hasGenotyping = registry.genotypingFileContent && registry.genotypingFileContent.length > 0;
        const hasSamplesheet = registry.samplesheetFileContent && registry.samplesheetFileContent.length > 0;
        const translationFile = alleleTyper.translationFile || "";

        return html`
            <div class="mb-4">
                <h3 class="mb-3">Analysis Results & Configuration Summary</h3>
                <p class="text-muted">
                    Review the pharmacogenomics analysis configuration and results.
                    This view provides a comprehensive summary of the analysis parameters and identified findings.
                </p>
            </div>

            <div class="row">
                <div class="col-md-6">
                    ${this.renderSummaryCard(
                        "Uploaded Files",
                        "fas fa-file-upload",
                        html`
                            <div class="mb-3">
                                <strong>Genotyping Output File:</strong>
                                <div class="ms-3">
                                    ${hasGenotyping ? html`
                                        <div class="d-flex align-items-center gap-2">
                                            <i class="fas fa-check-circle text-success"></i>
                                            <span>File uploaded</span>
                                            <span class="badge bg-secondary">${(registry.genotypingFileContent.length / 1024).toFixed(2)} KB</span>
                                        </div>
                                    ` : html`
                                        <span class="text-danger">
                                            <i class="fas fa-times-circle me-1"></i>No file uploaded
                                        </span>
                                    `}
                                </div>
                            </div>
                            ${this._genotypingFileStats ? html`
                                <div class="mt-3">
                                    <strong>Genotyping File Statistics:</strong>
                                    <div class="row g-2 mt-1">
                                        <div class="col-4">
                                            <div class="text-center p-2 border rounded bg-light">
                                                <div class="fw-bold text-primary">${this._genotypingFileStats.totalSamples}</div>
                                                <div class="text-muted small">Samples</div>
                                            </div>
                                        </div>
                                        <div class="col-4">
                                            <div class="text-center p-2 border rounded bg-light">
                                                <div class="fw-bold text-success">${this._genotypingFileStats.totalAssays}</div>
                                                <div class="text-muted small">Assays</div>
                                            </div>
                                        </div>
                                        <div class="col-4">
                                            <div class="text-center p-2 border rounded bg-light">
                                                <div class="fw-bold text-info">${this._genotypingFileStats.totalGenes}</div>
                                                <div class="text-muted small">Genes</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="mt-3">
                                        <div class="small fw-bold mb-1">Assays per Gene:</div>
                                        <div class="d-flex flex-wrap gap-1">
                                            ${this._genotypingFileStats.genes.map(gene => html`
                                                <span class="badge border text-dark bg-light">
                                                    ${gene.name}: ${gene.assayCount}
                                                </span>
                                            `)}
                                        </div>
                                    </div>
                                </div>
                            ` : nothing}
                        `
                    )}
                </div>

                <div class="col-md-6">
                    ${this.renderSummaryCard(
                        "Allele Typer Configuration",
                        "fas fa-dna",
                        html`
                            <div class="mb-3">
                                <strong>Translation File:</strong>
                                <div class="ms-3">
                                    ${translationFile ? html`
                                        <div class="d-flex align-items-center gap-2">
                                            <i class="fas fa-check-circle text-success"></i>
                                            <span>${translationFile}</span>
                                        </div>
                                    ` : html`
                                        <span class="text-danger">
                                            <i class="fas fa-times-circle me-1"></i>No file selected
                                        </span>
                                    `}
                                </div>
                            </div>
                            ${this._translationFileStats ? html`
                                <div class="mt-3">
                                    <strong>Translation File Statistics:</strong>
                                    <div class="row g-2 mt-1">
                                        <div class="col-4">
                                            <div class="text-center p-2 border rounded bg-light">
                                                <div class="fw-bold text-primary">${this._translationFileStats.totalGenes}</div>
                                                <div class="text-muted small">Genes</div>
                                            </div>
                                        </div>
                                        <div class="col-4">
                                            <div class="text-center p-2 border rounded bg-light">
                                                <div class="fw-bold text-success">${this._translationFileStats.totalAlleles}</div>
                                                <div class="text-muted small">Alleles</div>
                                            </div>
                                        </div>
                                        <div class="col-4">
                                            <div class="text-center p-2 border rounded bg-light">
                                                <div class="fw-bold text-info">${this._translationFileStats.totalAssays}</div>
                                                <div class="text-muted small">Assays</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="mt-3">
                                        <div class="small fw-bold mb-1">Alleles per Gene:</div>
                                        <div class="d-flex flex-wrap gap-1">
                                            ${this._translationFileStats.genes.map(gene => html`
                                                <span class="badge border text-dark bg-light">
                                                    ${gene.name}: ${gene.alleleCount}
                                                </span>
                                            `)}
                                        </div>
                                    </div>
                                </div>
                            ` : nothing}
                        `
                    )}
                </div>
            </div>

            <div class="row mt-3">
                <div class="col-md-12">
                    <div class="card">
                        <div class="card-header bg-primary text-white">
                            <h5 class="mb-0">
                                <i class="fas fa-chart-bar me-2"></i>Pharmacogenomics Analysis Results
                            </h5>
                        </div>
                        <div class="card-body">
                            ${this.toolParams?.review?.analysisCompleted ? html`
                                ${this.renderResults()}
                            ` : html`
                                <div class="alert alert-info mb-3">
                                    <i class="fas fa-info-circle me-2"></i>
                                    <strong>Analysis Not Yet Run</strong>
                                    <p class="mb-0 mt-2">
                                        Click the <strong>"Run Analysis"</strong> button to execute the pharmacogenomics analysis
                                        with the current configuration. Results will appear below after completion.
                                    </p>
                                </div>
                                <div class="border rounded p-3 bg-light">
                                    <h6 class="fw-bold mb-2">
                                        <i class="fas fa-flask me-1"></i>Results will include:
                                    </h6>
                                    <ul class="mb-0">
                                        <li>Identified star alleles and genotypes</li>
                                        <li>Drug-gene interaction predictions</li>
                                        <li>Clinical guidelines and recommendations</li>
                                        <li>Metabolizer phenotype predictions (PM, IM, NM, RM, UM)</li>
                                        <li>Exportable pharmacogenomics report</li>
                                    </ul>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("clinical-pharmacogenomics-review", ClinicalPharmacogenomicsReview);
