import {LitElement, html, nothing} from "lit";
import LitUtils from "../../commons/utils/lit-utils.js";
import UtilsNew from "../../../core/utils-new.js";
import "../../commons/forms/data-form.js";
import "../../commons/filters/catalog-search-autocomplete.js";

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
        this._data = {};
        this._translationFileContent = null;
        this._translationFileStats = null;
        this._genotypingFileStats = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("toolParams")) {
            this._data = {
                registry: this.toolParams?.registry || {},
                alleleTyper: this.toolParams?.alleleTyper || {},
                review: this.toolParams?.review || {},
            };
            // Process tool params to prepare results view
            this._prepareResultsView();
            this._fetchTranslationFileStats();
            this._parseGenotypingFileStats();
            this._config = this.getDefaultConfig();
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
                this._config = this.getDefaultConfig();
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

    showSampleDetails(sample) {
        // TODO: Implement modal or expandable view with full details
        console.log("Sample details:", sample);
        alert(`Sample ${sample.sampleId}\n\nGenes analyzed: ${sample.starAlleles?.length}\n\nClick OK to see details in console.`);
    }

    onFieldChange(event) {
        event.stopPropagation();
        LitUtils.dispatchCustomEvent(this, "paramsChange", null, this._data.review);
    }

    render() {
        if (!this.opencgaSession) {
            return nothing;
        }

        return html`
            <data-form
                .data="${this._data}"
                .config="${this._config}"
                @fieldChange="${event => this.onFieldChange(event)}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        const registry = this._data?.registry || {};
        const alleleTyper = this._data?.alleleTyper || {};
        const hasGenotyping = registry.genotypingFileContent && registry.genotypingFileContent.length > 0;
        const hasCnvGenotyping = registry.cnvGenotypingFileContent && registry.cnvGenotypingFileContent.length > 0;
        const translationFile = alleleTyper.translationFile || "";
        const results = this._data?.review?.results || [];

        return {
            title: "Analysis Summary & Run",
            icon: "fas fa-clipboard-check",
            description: "Review the pharmacogenomics configuration and execute the analysis.",
            display: {
                titleVisible: true,
                defaultLayout: "vertical",
                buttonsVisible: false,
                layout: [
                    {
                        className: "row",
                        sections: [
                            {
                                id: "registry",
                                className: "col-6",
                            },
                            {
                                id: "allele-typer",
                                className: "col-6",
                            },
                        ]
                    },
                    {
                        id: "analysis-configuration",
                    },
                    {
                        id: "job-configuration",
                    },
                ],
            },
            sections: [
                {
                    id: "results",
                    title: "Analysis Results",
                    display: {
                        visible: () => false, // results.length > 0,
                    },
                    elements: [
                        {
                            type: "custom",
                            display: {
                                render: () => html`
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
                                `,
                            },
                        },
                    ],
                },
                {
                    id: "registry",
                    title: "Uploaded Files",
                    display: {
                        className: "p-4 bg-white rounded-5 shadow-sm",
                    },
                    elements: [
                        {
                            title: "Genotyping Output File",
                            type: "custom",
                            display: {
                                render: () => html`
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
                                `,
                            },
                        },
                        {
                            title: "CNV Genotyping Output File",
                            type: "custom",
                            display: {
                                render: () => html`
                                    <div class="ms-3">
                                        ${hasCnvGenotyping ? html`
                                            <div class="d-flex align-items-center gap-2">
                                                <i class="fas fa-check-circle text-success"></i>
                                                <span>File uploaded</span>
                                                <span class="badge bg-secondary">${(registry.cnvGenotypingFileContent.length / 1024).toFixed(2)} KB</span>
                                            </div>
                                        ` : html`
                                            <span class="text-muted">
                                                <i class="fas fa-minus-circle me-1"></i>No file uploaded (optional)
                                            </span>
                                        `}
                                    </div>
                                `,
                            },
                        },
                    ],
                },
                // Allele Typer Configuration section
                {
                    id: "allele-typer",
                    title: "Allele Typer Configuration",
                    display: {
                        className: "p-4 bg-white rounded-5 shadow-sm",
                    },
                    elements: [
                        {
                            title: "Translation File",
                            type: "custom",
                            display: {
                                render: () => html`
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
                                `,
                            },
                        },
                    ],
                },
                {
                    id: "analysis-configuration",
                    title: "Analysis Configuration",
                    elements: [
                        {
                            title: "Batch Identifier",
                            field: "review.batchId",
                            type: "custom",
                            display: {
                                render: (batchId, dataFormFieldChange) => html`
                                    <div class="input-group">
                                        <span class="input-group-text">batch-</span>
                                        <input
                                            type="text"
                                            class="form-control"
                                            value="${batchId}"
                                            placeholder="001"
                                            @change="${event => dataFormFieldChange(event.target.value)}">
                                    </div>
                                `,
                                helpMessage: "Identifier for the batch of pharmacogenomics results. Results will be saved in the folder pharmacogenomics/batch-BATCH_ID.",
                            },
                        },
                    ],
                },
                {
                    id: "job-configuration",
                    title: "Job Configuration",
                    elements: [
                        {
                            title: "Job ID",
                            field: "review.jobId",
                            type: "input-text",
                            display: {
                                placeholder: `pharmacogenomics-${UtilsNew.getDatetime()}`,
                                help: {
                                    text: "If empty then it is automatically initialized with the tool ID and current date"
                                }
                            },
                        },
                        {
                            title: "Depends On",
                            field: "review.jobDependsOn",
                            type: "custom",
                            display: {
                                placeholder: "Add job tags...",
                                visible: () => !!this.opencgaSession,
                                render: (jobDependsOn, dataFormFilterChange) => html`
                                    <catalog-search-autocomplete
                                        .resource="${"JOB"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .query="${
                                            {
                                                internalStatus: "PENDING,QUEUED,RUNNING",
                                                include: "id,name",
                                            }}"
                                        .config="${{multiple: false}}"
                                        .value="${jobDependsOn}"
                                        @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                    </catalog-search-autocomplete>
                                `,
                                helpMessage: "Job ID that this job depends on. The job will not start until the specified job has finished. Only jobs in PENDING, QUEUED or RUNNING status can be selected.",
                            },
                        },
                        {
                            title: "Tags",
                            field: "review.jobTags",
                            type: "input-text",
                            display: {
                                placeholder: "Add job tags...",
                                helpMessage: "Comma separated list of tags to be associated to the job",
                            },
                        },
                        {
                            title: "Description",
                            field: "review.jobDescription",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Add a job description...",
                                helpMessage: "Description of the job",
                            },
                        },
                    ]
                }
            ],
        };
    }

}

customElements.define("clinical-pharmacogenomics-review", ClinicalPharmacogenomicsReview);
