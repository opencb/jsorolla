import {html, LitElement, nothing} from "lit";
import LitUtils from "../../commons/utils/lit-utils.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";
import CatalogUtils from "../../../core/clients/opencga/opencga-catalog-utils.js";
import "../../commons/forms/data-form.js";
import DataFormElements from "../../commons/forms/data-form-elements.js";

export default class ClinicalPharmacogenomicsRegistry extends LitElement {

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
        this._data = {
            genotypingFileContent: "",
            samplesheetFileContent: "",
        };
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("toolParams")) {
            this._data = {
                genotypingFileContent: this.toolParams?.genotypingFileContent || "",
                samplesheetFileContent: this.toolParams?.samplesheetFileContent || "",
            };
        }
        if (changedProperties.has("opencgaSession")) {
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    onFieldChange(event) {
        this.notifyParamsChange();
    }

    async onSubmit(event) {
        // Validate genotyping file is provided
        if (!this._data.genotypingFileContent || this._data.genotypingFileContent.trim().length === 0) {
            return NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_WARNING, {
                message: "Genotyping file is required to create samples and individuals.",
            });
        }

        // Show loading notification
        const loadingId = NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_LOADING, {
            message: "Creating samples and individuals from genotyping file. Please wait...",
        });

        try {
            // 1. Extract unique sample IDs from genotyping file (column 5, tab-separated)
            const genotypingLines = this._data.genotypingFileContent.trim().split(/\r?\n/);
            const sampleIds = new Set();

            for (let i = 0; i < genotypingLines.length; i++) {
                const line = genotypingLines[i].trim();
                // Skip comments and empty lines
                if (line.startsWith("#") || line.length === 0) {
                    continue;
                }
                // Skip header line
                if (line.startsWith("Assay Name")) {
                    continue;
                }
                const columns = line.split("\t");
                if (columns.length > 4 && columns[4]) {
                    sampleIds.add(columns[4].trim());
                }
            }

            // 2. Parse samplesheet if provided (optional)
            let samplesheetMapping = {};
            if (this._data.samplesheetFileContent && this._data.samplesheetFileContent.trim().length > 0) {
                const mapping = CatalogUtils.parseMappingFile(this._data.samplesheetFileContent);
                // Create a map: sample ID -> {individual, sex, disorder}
                mapping.forEach(entry => {
                    if (entry.sample) {
                        samplesheetMapping[entry.sample] = {
                            individual: entry.individual || entry.sample,
                            sex: entry.sex || "UNKNOWN",
                            disorder: entry.disorder || "",
                        };
                    }
                });
            }

            const processedSamples = new Set();
            const processedIndividuals = new Set();

            // 3. Create individuals and samples for each unique sample ID
            for (const sampleId of sampleIds) {
                // Get info from samplesheet or use defaults
                const info = samplesheetMapping[sampleId] || {
                    individual: sampleId, // Use sample ID as individual ID if not in samplesheet
                    sex: "UNKNOWN",
                    disorder: "",
                };

                const individualId = info.individual;
                const sex = info.sex;
                const disorder = info.disorder;

                // 2.1. Create the individual if needed
                if (individualId && !processedIndividuals.has(individualId)) {
                    try {
                        const individualResponse = await this.opencgaSession.opencgaClient.individuals()
                            .search({
                                id: individualId,
                                study: this.opencgaSession.study.fqn,
                                include: "id",
                            });

                        // Only create the individual if it does not exist
                        if (individualResponse.responses[0].results.length === 0) {
                            const individualParams = {
                                id: individualId,
                                sex: {
                                    id: sex.toUpperCase(),
                                },
                            };

                            // Add disorder if provided
                            if (disorder) {
                                individualParams.disorders = [
                                    {
                                        id: disorder,
                                    },
                                ];
                            }

                            await this.opencgaSession.opencgaClient.individuals()
                                .create(individualParams, {
                                    study: this.opencgaSession.study.fqn,
                                });
                        }
                    } catch (error) {
                        console.error(`Individual ${individualId} creation failed:`, error);
                        throw new Error(`Failed to create individual ${individualId}. ${error.message}`);
                    }
                    processedIndividuals.add(individualId);
                }

                // 2.2. Create the sample if needed
                if (sampleId && !processedSamples.has(sampleId)) {
                    try {
                        const sampleResponse = await this.opencgaSession.opencgaClient.samples()
                            .search({
                                id: sampleId,
                                study: this.opencgaSession.study.fqn,
                                include: "id",
                            });

                        // Only create the sample if it does not exist
                        if (sampleResponse.responses[0].results.length === 0) {
                            const sampleParams = {
                                id: sampleId,
                                individualId: individualId,
                                somatic: false,
                            };

                            await this.opencgaSession.opencgaClient.samples()
                                .create(sampleParams, {
                                    study: this.opencgaSession.study.fqn,
                                });
                        }
                    } catch (error) {
                        console.error(`Sample ${sampleId} creation failed:`, error);
                        throw new Error(`Failed to create sample ${sampleId}. ${error.message}`);
                    }
                    processedSamples.add(sampleId);
                }
            }

            // Show success message
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                message: `Successfully created ${processedIndividuals.size} individuals and ${processedSamples.size} samples.`,
            });

        } catch (error) {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_ERROR, {
                message: `Failed to create samples and individuals: ${error.message}`,
            });
        } finally {
            NotificationUtils.clear(this, loadingId);
        }
    }

    notifyParamsChange() {
        LitUtils.dispatchCustomEvent(this, "paramsChange", null, {
            genotypingFileContent: this._data.genotypingFileContent,
            samplesheetFileContent: this._data.samplesheetFileContent,
        });
    }

    render() {
        if (!this.opencgaSession) {
            return nothing;
        }

        return html`
            <data-form
                .data="${this._data}"
                .config="${this._config}"
                @fieldChange="${event => this.onFieldChange(event)}"
                @submit="${event => this.onSubmit(event)}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Upload Pharmacogenomics Microarray Files",
            icon: "fas fa-file-upload",
            description: "Upload the required genotyping output file from Thermo Fisher analysis tool and an optional samplesheet to map samples to individuals and families.",
            display: {
                titleVisible: true,
                defaultLayout: "vertical",
                buttonsVisible: false,
                buttonOkText: "Register",
                buttonClearText: "Discard",
            },
            sections: [
                {
                    id: "genotyping-file",
                    title: "Genotyping Output File",
                    description: html`
                        <div class="border-start border-3 border-primary bg-light py-2 px-2 mb-3">
                            <div class="text-muted">
                                <i class="fas fa-info-circle text-primary me-1"></i>
                                <strong>Required:</strong> Upload the genotyping calls file generated by Thermo Fisher OpenArray Analysis Suite.
                                Accepted formats: TXT, TSV, CSV
                            </div>
                        </div>
                    `,
                    display: {
                        className: "px-2 py-2",
                    },
                    elements: [
                        DataFormElements.fileContentElement({
                            title: "Thermo Fisher Genotyping Output",
                            field: "genotypingFileContent",
                            required: true,
                            display: {
                                rows: 10,
                                helpMessage: "Upload the genotyping calls file from Thermo Fisher OpenArray Analysis Suite.",
                            },
                        }),
                    ],
                },
                {
                    id: "samplesheet-file",
                    title: "Sample Mapping File (Optional)",
                    description: html`
                        <div class="border-start border-3 border-secondary bg-light py-2 px-2 mb-3">
                            <div class="text-muted">
                                <i class="fas fa-table text-secondary me-1"></i>
                                <strong>Optional:</strong> Upload a samplesheet to map samples to individuals in Catalog.
                            </div>
                        </div>
                    `,
                    display: {
                        className: "px-2 py-2",
                    },
                    elements: [
                        DataFormElements.fileContentElement({
                            title: "Samplesheet (CSV/TSV)",
                            field: "samplesheetFileContent",
                            required: false,
                            display: {
                                rows: 8,
                                helpMode: "collapsible",
                                helpTitle: "Samplesheet format example",
                                helpMessage: () => html`
                                    <p class="mb-2">Your samplesheet should be a CSV or TSV file with the following columns:</p>
                                    <pre class="bg-light border rounded p-3">#sample,individual,sex,disorder
sample001,IND001,male,HP:0001250
sample002,IND002,female,OMIM:614856
sample003,IND003,male,HP:0001250
sample004,IND004,female,</pre>
                                    <ul class="small mb-0">
                                        <li><strong>#sample:</strong> Sample ID from the genotyping file (required)</li>
                                        <li><strong>individual:</strong> Individual ID in OpenCGA (required)</li>
                                        <li><strong>sex:</strong> Sex of the individual: male, female, unknown (required)</li>
                                        <li><strong>disorder:</strong> Disease ID or name (HPO, OMIM, etc.) - leave empty if unaffected (optional)</li>
                                    </ul>
                                `,
                            },
                        }),
                    ],
                },
                {
                    id: "upload-summary",
                    title: "Upload Summary",
                    display: {
                        className: "px-2 py-2",
                    },
                    elements: [
                        {
                            title: "Files Status",
                            type: "custom",
                            display: {
                                render: (value, onFieldChange, updateParams, data) => {
                                    const hasGenotyping = data?.genotypingFileContent && data.genotypingFileContent.length > 0;
                                    const hasSamplesheet = data?.samplesheetFileContent && data.samplesheetFileContent.length > 0;

                                    return html`
                                        <div class="card border-primary">
                                            <div class="card-body">
                                                <div class="row">
                                                    <div class="col-md-6">
                                                        <div class="d-flex align-items-center gap-2 mb-2">
                                                            <i class="fas ${hasGenotyping ? "fa-check-circle text-success" : "fa-times-circle text-danger"} fs-5"></i>
                                                            <div>
                                                                <strong>Genotyping File:</strong>
                                                                ${hasGenotyping ? html`
                                                                    <span class="text-success ms-1">Uploaded</span>
                                                                ` : html`
                                                                    <span class="text-danger ms-1">Required</span>
                                                                `}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="col-md-6">
                                                        <div class="d-flex align-items-center gap-2 mb-2">
                                                            <i class="fas ${hasSamplesheet ? "fa-check-circle text-success" : "fa-minus-circle text-muted"} fs-5"></i>
                                                            <div>
                                                                <strong>Samplesheet:</strong>
                                                                ${hasSamplesheet ? html`
                                                                    <span class="text-success ms-1">Uploaded</span>
                                                                ` : html`
                                                                    <span class="text-muted ms-1">Optional</span>
                                                                `}
                                                            </div>
                                                        </div>
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

customElements.define("clinical-pharmacogenomics-registry", ClinicalPharmacogenomicsRegistry);
