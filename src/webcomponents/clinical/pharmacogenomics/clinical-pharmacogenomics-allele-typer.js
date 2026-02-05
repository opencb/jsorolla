import {html, LitElement, nothing} from "lit";
import LitUtils from "../../commons/utils/lit-utils.js";
import "../../commons/forms/data-form.js";
import "../../commons/filters/catalog-search-autocomplete.js";

export default class ClinicalPharmacogenomicsAlleleTyper extends LitElement {

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
            registryParams: {
                type: Object
            },
            opencgaSession: {
                type: Object
            },
        };
    }

    #init() {
        this._data = {
            translationFile: "",
            genotypingData: [],
        };
        this._translationFileStats = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("toolParams")) {
            const oldTranslationFile = this._data.translationFile;
            this._data = {
                translationFile: this.toolParams?.translationFile || "",
                genotypingData: this._data.genotypingData, // Keep parsed data
            };
            // Fetch translation file stats when it changes
            if (this._data.translationFile && this._data.translationFile !== oldTranslationFile) {
                this._fetchTranslationFileStats();
            } else if (!this._data.translationFile) {
                this._translationFileStats = null;
            }
        }
        if (changedProperties.has("registryParams")) {
            // Parse genotyping file when registry params change
            this._parseGenotypingFile();
        }
        if (changedProperties.has("opencgaSession")) {
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    _parseGenotypingFile() {
        if (!this.registryParams?.genotypingFileContent) {
            this._data.genotypingData = [];
            return;
        }

        const lines = this.registryParams.genotypingFileContent.trim().split(/\r?\n/);
        const data = [];
        let headers = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Skip comments and empty lines
            if (line.startsWith("#") || line.length === 0) {
                continue;
            }

            const columns = line.split("\t");

            // First non-comment line is the header
            if (headers.length === 0) {
                headers = columns.slice(0, 11); // Take first 11 columns
                continue;
            }

            // Parse all data rows
            const row = {};
            columns.slice(0, 11).forEach((value, index) => {
                row[`col${index}`] = value || "-";
            });
            data.push(row);
        }

        this._data.genotypingData = data;
        this._genotypingHeaders = headers;
    }

    async _fetchTranslationFileStats() {
        try {
            // Fetch the file content from OpenCGA
            const response = await this.opencgaSession.opencgaClient.files()
                .content(this._data.translationFile, {
                    study: this.opencgaSession.study.fqn,
                });

            const content = response.responses[0].results[0];
            this._parseTranslationFileStats(content);
            this.requestUpdate();
        } catch (error) {
            console.error("Error fetching translation file:", error);
            this._translationFileStats = null;
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

    onFieldChange(event) {
        this.notifyParamsChange();
    }

    notifyParamsChange() {
        LitUtils.dispatchCustomEvent(this, "paramsChange", null, {
            translationFile: this._data.translationFile,
        });
    }

    render() {
        if (!this.opencgaSession) {
            return nothing;
        }

        return html`
            <div class="mb-4">
                <h3 class="mb-3">
                    <i class="fas fa-dna me-2"></i>Allele Typer Configuration
                </h3>
                <p class="text-muted">
                    Select the translation file from the Catalog to map genotype calls to star alleles and pharmacogenomics annotations.
                </p>
            </div>

            <data-form
                .data="${this._data}"
                .config="${this._config}"
                @fieldChange="${event => this.onFieldChange(event)}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Allele Typer Configuration",
            display: {
                titleVisible: false,
                defaultLayout: "vertical",
                buttonsVisible: false,
            },
            sections: [
                {
                    id: "genotyping-preview",
                    title: "Genotyping File Preview",
                    elements: [
                        {
                            type: "custom",
                            display: {
                                visible: data => !data?.genotypingData || data.genotypingData.length === 0,
                                render: () => html`
                                    <div class="alert alert-info">
                                        <i class="fas fa-info-circle me-2"></i>
                                        <strong>No genotyping file uploaded yet.</strong>
                                        <p class="mb-0 mt-2">
                                            Please upload a genotyping file in the <strong>Registry</strong> step to see the data preview here.
                                        </p>
                                    </div>
                                `,
                            },
                        },
                        {
                            type: "custom",
                            display: {
                                visible: data => data?.genotypingData?.length > 0,
                                render: () => html`
                                    <div class="border-start border-3 border-info bg-light py-2 px-2 mb-3">
                                        <div class="text-muted">
                                            <i class="fas fa-table text-info me-1"></i>
                                            Showing the first 11 columns from the uploaded genotyping file (~2500 rows).
                                        </div>
                                    </div>
                                `,
                            },
                        },
                        {
                            field: "genotypingData",
                            type: "table",
                            display: {
                                visible: data => data?.genotypingData?.length > 0,
                                className: "table table-sm table-hover",
                                headerClassName: "table-light",
                                maxHeight: "360px",
                                defaultValue: "",
                                columns: this._genotypingHeaders?.map((header, index) => ({
                                    title: header,
                                    field: `col${index}`,
                                    type: "custom",
                                    display: {
                                        defaultValue: "-",
                                        render: value => {
                                            if (!value || value === "-") {
                                                return "-";
                                            }
                                            const num = parseFloat(value);
                                            if (!isNaN(num) && value.includes(".")) {
                                                return num.toFixed(4);
                                            }
                                            return value;
                                        },
                                    },
                                })) || [],
                            },
                        },
                    ],
                },
                {
                    id: "translation-file",
                    title: "Translation File",
                    description: html`
                        <div class="border-start border-3 border-primary bg-light py-2 px-2 mb-3">
                            <div class="text-muted">
                                <i class="fas fa-file-alt text-primary me-1"></i>
                                <strong>Required:</strong> Select a translation file (CSV or XLS) from the Catalog that maps genotype calls to star alleles.
                            </div>
                        </div>
                    `,
                    elements: [
                        {
                            title: "Translation File",
                            field: "translationFile",
                            type: "custom",
                            required: true,
                            display: {
                                render: (translationFile, onFieldChange) => html`
                                    <catalog-search-autocomplete
                                        .value="${translationFile}"
                                        .resource="${"FILE"}"
                                        .searchField="${"path"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{
                                            multiple: false,
                                        }}"
                                        @filterChange="${e => onFieldChange(e.detail.value)}">
                                    </catalog-search-autocomplete>
                                `,
                                helpMode: "collapsible",
                                helpTitle: "Translation file format",
                                helpMessage: () => html`
                                    <p class="mb-2">The translation file should be a CSV or XLS file with the following structure:</p>
                                    <ul class="small mb-2">
                                        <li><strong>Assay columns:</strong> Each assay/SNP from the genotyping file</li>
                                        <li><strong>Call mappings:</strong> Mapping of genotype calls to star alleles</li>
                                        <li><strong>Gene annotations:</strong> Associated pharmacogene information</li>
                                    </ul>
                                    <p class="small text-muted mb-0">
                                        <i class="fas fa-info-circle me-1"></i>
                                        Example files can be found in the Catalog under RESOURCES/pharmacogenomics/
                                    </p>
                                `,
                            },
                        },
                        {
                            type: "custom",
                            display: {
                                visible: () => this._translationFileStats !== null,
                                render: () => {
                                    if (!this._translationFileStats) {
                                        return html``;
                                    }

                                    const stats = this._translationFileStats;
                                    return html`
                                        <div class="card border-success mt-3">
                                            <div class="card-header bg-success text-white">
                                                <h6 class="mb-0">
                                                    <i class="fas fa-chart-bar me-2"></i>Translation File Statistics
                                                </h6>
                                            </div>
                                            <div class="card-body">
                                                <div class="row">
                                                    <div class="col-md-4">
                                                        <div class="text-center p-2 border rounded bg-light">
                                                            <div class="fs-3 fw-bold text-primary">${stats.totalGenes}</div>
                                                            <div class="text-muted small">Total Genes</div>
                                                        </div>
                                                    </div>
                                                    <div class="col-md-4">
                                                        <div class="text-center p-2 border rounded bg-light">
                                                            <div class="fs-3 fw-bold text-success">${stats.totalAlleles}</div>
                                                            <div class="text-muted small">Total Alleles</div>
                                                        </div>
                                                    </div>
                                                    <div class="col-md-4">
                                                        <div class="text-center p-2 border rounded bg-light">
                                                            <div class="fs-3 fw-bold text-info">${stats.totalAssays}</div>
                                                            <div class="text-muted small">Total Assays</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="mt-3">
                                                    <h6 class="fw-bold mb-2">
                                                        <i class="fas fa-dna me-1"></i>Alleles per Gene:
                                                    </h6>
                                                    <div class="row">
                                                        ${stats.genes.map(gene => html`
                                                            <div class="col-md-3 mb-2">
                                                                <div class="border rounded p-2">
                                                                    <div class="fw-bold">${gene.name}</div>
                                                                    <div class="text-muted small">${gene.alleleCount} alleles</div>
                                                                </div>
                                                            </div>
                                                        `)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    `;
                                },
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("clinical-pharmacogenomics-allele-typer", ClinicalPharmacogenomicsAlleleTyper);
