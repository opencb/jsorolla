import {html, LitElement, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import DataFormElements from "../../commons/forms/data-form-elements.js";
import "../../commons/forms/data-form.js";
import "../../commons/filters/catalog-search-autocomplete.js";
import "../../commons/filters/disease-panel-filter.js";
import "../filters/clinical-flag-filter.js";
import CatalogGridFormatter from "../../commons/catalog-grid-formatter.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";

export default class ClinicalTertiarySelect extends LitElement {

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
                type: Object,
            },
            opencgaSession: {
                type: Object,
            },
            displayConfig: {
                type: Object,
            },
        };
    }

    #init() {
        this.DEFAULT_TOOLPARAMS = {
            mode: "Single", // Single, Batch
            selectionType: "Sample",
            sample: null,
            samples: [],
            caseId: "",
            panels: [],
            flags: "",
            type: "SINGLE",
            disorders: [],
            mappingFile: "",
        };
        this._toolParams = UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS);
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("toolParams")) {
            this.toolParamsObserver();
        }

        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    toolParamsObserver() {
        if (this.toolParams) {
            this._toolParams = {...this.DEFAULT_TOOLPARAMS, ...this.toolParams};
        } else {
            this._toolParams = UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS);
        }
    }

    onFieldChange(event) {
        this._toolParams = {
            ...this._toolParams,
        };

        // 1. check if we have changed the mode
        if (event.detail.param === "mode") {
            this._toolParams.samples = []; // force to reset selected samples
            this._toolParams.mappingFile = ""; // reset mapping file content
            if (event.detail.value === "Single") {
                this._toolParams.selectionType = "Sample";
            } else {
                this._toolParams.selectionType = "Cohort";
            }
        }

        // 2. check if we have uploaded a mapping file and get sample IDs from it
        if (event.detail.param === "mappingFile") {
            this._toolParams.samples = []; // force to reset selected samples
            // get the sample IDs from the mapping file
            const mappingFileContent = event.detail.value;
            if (mappingFileContent) {
                const header = mappingFileContent.split("\n")[0];
                const separator = header.includes("\t") ? "\t" : ",";
                const headerItems = header
                    .trim()
                    .replace("#", "")
                    .toLowerCase()
                    .split(separator);
                const sampleIndex = headerItems.findIndex(h => h === "sample" || h === "sampleid");

                if (sampleIndex === -1) {
                    console.error("Mapping file must contain a 'sample' column in the header.");
                    return;
                }

                const sampleIds = mappingFileContent
                    .split("\n")
                    .slice(1) // skip header
                    .map(line => line.split(separator)[sampleIndex])
                    .filter(id => id); // remove empty lines

                // Fetch sample details from OpenCGA
                this.opencgaSession.opencgaClient.samples()
                    .info(sampleIds, {
                        study: this.opencgaSession.study.fqn,
                        include: "id,internal.status.id,somatic,individualId",
                        includeIndividual: true,
                    })
                    .then(response => {
                        const samples = response?.responses?.[0]?.results || [];
                        this._toolParams.samples = samples;
                        this.requestUpdate();
                    });
                return; // exit early since we handle async update
            }
        }

        // LitUtils.dispatchCustomEvent(this, "paramsChange", null, this._toolParams);
        this.requestUpdate();
    }

    onClear() {
        this._toolParams = UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS);
        this.requestUpdate();
    }

    async onSelectSamples(resource, value) {
        let resourcePromise = null;

        // If not value, reset samples
        if (!value) {
            this._toolParams = {
                ...this._toolParams,
                samples: [],
            };
            this.requestUpdate();
            return;
        }

        switch (resource) {
            case "Sample":
                resourcePromise = await this.opencgaSession.opencgaClient.samples()
                    .search(value, {
                        id: value,
                        study: this.opencgaSession.study.fqn,
                        include: "id,individualId,somatic,internal.status.id",
                        includeIndividual: true,
                    });
                    // .then(response => {
                    //     return response?.responses?.[0]?.results || [];
                    // });
                break;
            case "Cohort":
                resourcePromise = await this.opencgaSession.opencgaClient.samples()
                    .search({
                        cohortIds: value,
                        study: this.opencgaSession.study.fqn,
                        include: "id,individualId,somatic,internal.status.id",
                        includeIndividual: true,
                    });
                    // .then(response => {
                    //     return response?.responses?.[0]?.results?.[0]?.samples || [];
                    // });
                break;
        }


        const samples = resourcePromise.getResults() || [];

        // Now we need to read samples.individualId and fetch clinical analysis case if any
        const individualIds = samples
            .map(sample => sample.individualId)
            .filter((value, index, self) => self.indexOf(value) === index); // unique values

        if (individualIds.length > 0) {
            // 1. fetch clinical analysis for the individuals
            const clinicalResponse = await this.opencgaSession.opencgaClient.clinical()
                .search({
                    proband: individualIds.join(","),
                    study: this.opencgaSession.study.fqn,
                    include: "id,type,panels,disorders",
                });
            const clinicalCases = clinicalResponse?.responses?.[0]?.results || [];

            // 2. fetch families for the individuals
            const familiesResponse = await this.opencgaSession.opencgaClient.families()
                .search({
                    members: individualIds.join(","),
                    study: this.opencgaSession.study.fqn,
                    include: "id,members.id",
                });
            const families = familiesResponse?.responses?.[0]?.results || [];

            // 3. add clinical analysis and family info to each sample
            samples.forEach(sample => {
                const caseForSample = clinicalCases.find(ca => ca.proband?.id === sample.individualId);
                const familyForSample = families.find(family =>
                    family.members?.some(member => member.id === sample.individualId)
                );
                sample.familyId = familyForSample?.id || null;
                sample.clinicalAnalysisId = caseForSample?.id || null;
            });
        }

        this._toolParams = {
            ...this._toolParams,
            samples: samples || [],
        };

        this.requestUpdate();
    }

    onCreateClinicaAnalysis() {
        // Dispatch event to create clinical analysis for the selected samples
        LitUtils.dispatchCustomEvent(this, "createClinicalAnalysis", null, this._toolParams.samples);

        const results = this._toolParams.samples.map(sample => {
            // console.log(`Creating clinical analysis for sample: ${sample.id}`);
            const createParams = {
                id: `${sample.id}-CA`,
                type: "SINGLE",
                proband: {
                    id: sample.individualId
                },
            };
            return this.opencgaSession.opencgaClient.clinical()
                .create(createParams, {
                    study: this.opencgaSession.study.fqn,
                })
                .then(() => {
                    // update the sample with the created clinical analysis ID
                    sample.clinicalAnalysisId = createParams.id;
                });
            }
        );

        Promise.all(results)
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Clinical Analyses Created",
                    message: "All clinical analyses have been created successfully.",
                });
                console.log("All clinical analyses creation attempts completed.");
            })
            .catch(error => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_ERROR, {
                    title: "Error Creating Clinical Analyses",
                    message: "An error occurred while creating clinical analyses.",
                });
                console.error("Error during clinical analyses creation:", error);
            })
            .finally(() => {
                this._toolParams = {
                    ...this._toolParams,
                };
                this.requestUpdate();
            });
    }

    renderSelection(selectionType, allowedSelectionTypes) {
        return html`
            <div class="input-group flex-nowrap">
                <catalog-search-autocomplete
                    class="flex-grow-1"
                    .resource="${selectionType.toUpperCase()}"
                    .opencgaSession="${this.opencgaSession}"
                    .config="${{
                        multiple: false,
                    }}"
                    @filterChange="${event => this.onSelectSamples(selectionType, event.detail.value)}">
                </catalog-search-autocomplete>
                <button class="btn btn-outline-secondary dropdown-toggle mb-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <span>${selectionType}</span>
                </button>
                <div class="dropdown-menu dropdown-menu-end">
                    ${allowedSelectionTypes.map(type => html`
                        <div class="dropdown-item ${selectionType === type ? "active" : "cursor-pointer"}">
                            ${type}
                        </div>
                    `)}
                </div>
            </div>
        `;
    }

    render() {
        if (!this.opencgaSession) {
            return nothing;
        }

        return html`
            <data-form
                .data="${this._toolParams}"
                .config="${this._config}"
                @fieldChange="${event => this.onFieldChange(event)}"
                @clear="${event => this.onClear(event)}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Analysis Selection",
            display: {
                titleClassName: "mb-4",
                ...this.displayConfig,
            },
            sections: [
                {
                    // title: "Select Analysis Mode",
                    elements: [
                        DataFormElements.tabsElement({
                            field: "mode",
                            tabs: [
                                {id: "Single", text: "Single"},
                                {id: "Batch", text: "Batch"},
                            ],
                        }),
                    ],
                },
                {
                    title: "Single Analysis Configuration",
                    display: {
                        visible: data => data?.mode === "Single",
                    },
                    elements: [
                         {
                            title: "Select Sample",
                            field: "selectionType",
                            type: "custom",
                            display: {
                                render: (selectionType) => {
                                    return this.renderSelection(selectionType, ["Sample", "Individual", "Family"]);
                                },
                                helpMessage: "Select samples by Sample, Individual, or Family.",
                            },
                        },
                        {
                            title: " ",
                            field: "samples",
                            type: "table",
                            display: {
                                visible: data => data?.samples?.length > 0,
                                columns: [
                                    {
                                        title: "Sample",
                                        field: "id",
                                    },
                                    {
                                        title: "Individual",
                                        field: "individualId",
                                    },
                                    {
                                        title: "Somatic",
                                        field: "somatic",
                                    },
                                    {
                                        title: "Status",
                                        field: "internal.status.id",
                                    },
                                    {
                                        title: "Select",
                                        type: "custom",
                                        display: {
                                            headerCellClassName: "text-center",
                                            render: (sample, onFieldChange) => {
                                                return html`
                                                    <div class="w-full d-flex justify-content-center">
                                                        <input type="checkbox" class="form-check-input" ?checked="${true}">
                                                    </div>
                                                `;
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            title: "Clinical Analysis",
                            type: "object",
                            field: "clinicalAnalysis",
                            elements: [
                                {
                                    title: "Clinical Analysis ID",
                                    field: "clinicalAnalysis.id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "e.g. AN-1234",
                                    },
                                },
                                {
                                    title: "Clinical Analysis Type",
                                    field: "clinicalAnalysis.type",
                                    type: "select",
                                    allowedValues: ["SINGLE", "FAMILY", "CANCER"],
                                },
                                {
                                    title: "Disease Panels",
                                    field: "clinicalAnalysis.panels",
                                    type: "custom",
                                    display: {
                                        render: (panels, dataFormFilterChange) => {
                                            const handlePanelsFilterChange = e => {
                                                const panelList = (e.detail?.value?.split(",") || [])
                                                    .filter(panelId => panelId)
                                                    .map(panelId => ({id: panelId}));
                                                dataFormFilterChange(panelList);
                                            };
                                            return html`
                                                <disease-panel-filter
                                                    .opencgaSession="${this.opencgaSession}"
                                                    .diseasePanels="${this.opencgaSession.study?.panels}"
                                                    .panel="${panels?.map(p => p.id).join(",")}"
                                                    .showExtendedFilters="${false}"
                                                    .showSelectedPanels="${false}"
                                                    @filterChange="${e => handlePanelsFilterChange(e)}">
                                                </disease-panel-filter>
                                            `;
                                        },
                                    },
                                },
                                {
                                    title: "Flags",
                                    field: "clinicalAnalysis.flags",
                                    type: "custom",
                                    display: {
                                        render: (flags, dataFormFilterChange, updateParams, clinicalAnalysis) => {
                                            const handleFlagsFilterChange = e => {
                                                // We need to convert value from a string wth commas to an array of IDs
                                                const flagList = (e.detail?.value?.split(",") || [])
                                                    .filter(flagId => flagId)
                                                    .map(flagId => ({id: flagId}));
                                                dataFormFilterChange(flagList);
                                            };
                                            return html`
                                                <clinical-flag-filter
                                                    .flag="${flags?.map(f => f.id).join(",")}"
                                                    .flags="${this.opencgaSession.study.internal?.configuration?.clinical?.flags || []}"
                                                    .multiple="${true}"
                                                    .classes="${updateParams?.flags ? "selection-updated" : ""}"
                                                    .disabled="${!!clinicalAnalysis?.locked}"
                                                    @filterChange="${e => handleFlagsFilterChange(e)}">
                                                </clinical-flag-filter>
                                            `;
                                        },
                                    },
                                },
                                {
                                    title: "Disorders",
                                    field: "clinicalAnalysis.disorders",
                                    type: "select",
                                    allowedValues: data => {
                                        return data?.samples?.[0]?.attributes?.OPENCGA_INDIVIDUAL?.disorders || [];
                                    },
                                    display: {
                                    },
                                },
                            ],
                        },
                    ],
                },
                {
                    title: "Batch Analysis Configuration",
                    display: {
                        visible: data => data?.mode === "Batch",
                    },
                    elements: [
                         {
                            title: "Select Samples",
                            field: "selectionType",
                            type: "custom",
                            display: {
                                render: (selectionType) => {
                                    return this.renderSelection(selectionType, ["Cohort"]);
                                },
                                helpMessage: "Select samples by Cohort.",
                            },
                        },
                        DataFormElements.fileContentElement({
                            title: "Or Upload Mapping File",
                            field: "mappingFile",
                            display: {
                                helpMessage: "Upload a file mapping samples to clinical analysis parameters.",
                            },
                        }),
                        {
                            title: "Samples Configuration",
                            type: "custom",
                            display: {
                                visible: data => data?.samples?.length > 0,
                                render: (samples) => {
                                    return html`
                                        <div class="d-flex align-items-center justify-content-end gap-2">
                                            <button class="btn btn-light d-flex align-items-center gap-2" @click="${() => this.onCreateClinicaAnalysis()}">
                                                <i class="fas fa-plus"></i>
                                                <span>Create Clinical Analyses</span>
                                            </button>
                                            <button class="btn btn-light d-flex align-items-center gap-2">
                                                <i class="fas fa-cog"></i>
                                                <span>Configure All</span>
                                            </button>
                                        </div>
                                    `;
                                },
                            },
                        },
                        {
                            type: "table",
                            field: "samples",
                            display: {
                                visible: data => data?.samples?.length > 0,
                                columns: [
                                    {
                                        title: "Sample",
                                        field: "id",
                                        type: "custom",
                                        display: {
                                            bodyCellClassName: "align-middle",
                                            render: (sampleId, updateField, updateParams, data, row) => {
                                                return html`
                                                    <div class="fw-bold my-1">${sampleId}</div>
                                                    <div class="text-secondary small my-1">${row?.somatic ? "Somatic" : "Germline"}</div>
                                                `;
                                            },
                                        },
                                    },
                                    {
                                        title: "Individual",
                                        field: "individualId",
                                        type: "custom",
                                        display: {
                                            bodyCellClassName: "align-middle",
                                            render: (individualId, updateField, updateParams, data, row) => {
                                                const individual = row?.attributes?.OPENCGA_INDIVIDUAL;
                                                const sexHtml = CatalogGridFormatter.sexFormatter(individual.sex, individual);
                                                return html`
                                                    <div class="fw-bold my-1">${individualId || "-"}</div>
                                                    ${individualId && sexHtml ? html`<div class="text-secondary my-1">${sexHtml}</div>` : nothing}
                                                `;
                                            }
                                        },
                                    },
                                    {
                                        title: "Family",
                                        field: "familyId",
                                        type: "custom",
                                        display: {
                                            bodyCellClassName: "align-middle",
                                            render: (familyId) => {
                                                return html`
                                                    <span class="fw-bold">${familyId || "-"}</span>
                                                `;
                                            }
                                        },
                                    },
                                    {
                                        title: "Clinical Analysis",
                                        field: "clinicalAnalysisId",
                                        type: "custom",
                                        display: {
                                            headerCellClassName: "text-center",
                                            bodyCellClassName: "align-middle",
                                            render: (clinicalAnalysisId) => {
                                                return html`
                                                    <div class="w-full d-flex justify-content-center">
                                                        <i class="fas fs-5 ${!!clinicalAnalysisId ? "fa-check text-success" : "fa-times"}"></i>
                                                    </div>
                                                `;
                                            },
                                        },
                                    },
                                    {
                                        title: "Select",
                                        type: "custom",
                                        display: {
                                            headerCellClassName: "text-center",
                                            bodyCellClassName: "align-middle",
                                            render: (sample, onFieldChange) => {
                                                return html`
                                                    <div class="w-full d-flex justify-content-center">
                                                        <input type="checkbox" class="form-check-input" ?checked="${true}">
                                                    </div>
                                                `;
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("clinical-tertiary-select", ClinicalTertiarySelect);
