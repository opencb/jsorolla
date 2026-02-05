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
    }

    update(changedProperties) {
        if (changedProperties.has("toolParams")) {
            // Process tool params to prepare results view
            this._prepareResultsView();
        }
        super.update(changedProperties);
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
                            <div class="mb-0">
                                <strong>Samplesheet:</strong>
                                <div class="ms-3">
                                    ${hasSamplesheet ? html`
                                        <div class="d-flex align-items-center gap-2">
                                            <i class="fas fa-check-circle text-success"></i>
                                            <span>File uploaded</span>
                                            <span class="badge bg-secondary">${(registry.samplesheetFileContent.length / 1024).toFixed(2)} KB</span>
                                        </div>
                                    ` : html`
                                        <span class="text-muted">
                                            <i class="fas fa-minus-circle me-1"></i>Optional - not uploaded
                                        </span>
                                    `}
                                </div>
                            </div>
                        `
                    )}

                    ${this.renderSummaryCard(
                        "Allele Typer Configuration",
                        "fas fa-dna",
                        html`
                            <div class="mb-0">
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
                        `
                    )}
                </div>

                <div class="col-md-6">
                    ${this.renderSummaryCard(
                        "Analysis Results",
                        "fas fa-chart-bar",
                        html`
                            <div class="alert alert-info mb-0">
                                <i class="fas fa-info-circle me-2"></i>
                                <strong>Analysis Not Yet Run</strong>
                                <p class="mb-0 mt-2">
                                    Click the <strong>"Run Analysis"</strong> button to execute the pharmacogenomics analysis
                                    with the current configuration. Results will appear here after completion.
                                </p>
                            </div>
                        `
                    )}
                </div>
            </div>

            <div class="row mt-3">
                <div class="col-md-12">
                    <div class="card">
                        <div class="card-header bg-secondary text-white">
                            <h5 class="mb-0">
                                <i class="fas fa-table me-2"></i>Pharmacogenomics Findings
                            </h5>
                        </div>
                        <div class="card-body">
                            <div class="alert alert-warning">
                                <i class="fas fa-flask me-2"></i>
                                <strong>Coming Soon:</strong> This section will display detailed pharmacogenomics findings including:
                                <ul class="mb-0 mt-2">
                                    <li>Identified star alleles and genotypes</li>
                                    <li>Drug-gene interaction predictions</li>
                                    <li>Clinical guidelines and recommendations</li>
                                    <li>Metabolizer phenotype predictions (PM, IM, NM, RM, UM)</li>
                                    <li>Exportable pharmacogenomics report</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("clinical-pharmacogenomics-review", ClinicalPharmacogenomicsReview);
