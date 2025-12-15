import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import "../../commons/forms/data-form.js";
import "../../commons/filters/catalog-search-autocomplete.js";
import "../../commons/filters/disease-panel-filter.js";
import "../filters/clinical-flag-filter.js";

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
            selectionType: "Single", // Single, Batch
            // Single mode params
            sample: null,
            caseId: "",
            panels: [],
            flags: "",
            type: "SINGLE",
            disorders: [],
            // Batch mode params
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
        const {field, value} = event.detail;
        this._toolParams = {
            ...this._toolParams,
            [field]: value,
        };
        
        // If switching between modes, we might want to reset some fields or just keep them?
        // keeping them for now.

        LitUtils.dispatchCustomEvent(this, "paramsChange", null, this._toolParams);
        this.requestUpdate();
    }

    onClear() {
        this._toolParams = UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS);
        this.requestUpdate();
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
                    title: "Select Analysis Mode",
                    elements: [
                        {
                            title: "Mode",
                            field: "selectionType",
                            type: "toggle-buttons",
                            allowedValues: ["Single", "Batch"],
                            defaultValue: "Single",
                        },
                    ],
                },
                {
                    title: "Single Analysis Configuration",
                    display: {
                        visible: data => data?.selectionType === "Single",
                    },
                    elements: [
                         {
                            title: "Select Sample",
                            field: "sample",
                            type: "custom",
                            display: {
                                render: (sample, onFieldChange) => {
                                    return html`
                                        <catalog-search-autocomplete
                                            .value="${sample}"
                                            .resource="${"SAMPLE"}"
                                            .opencgaSession="${this.opencgaSession}"
                                            .config="${{
                                                multiple: false,
                                            }}"
                                            @filterChange="${e => onFieldChange(e.detail.value)}">
                                        </catalog-search-autocomplete>
                                    `;
                                },
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
                                    type: "custom",
                                    display: {
                                        render: (disorders, onFieldChange) => {
                                            return html``;
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
                {
                    title: "Batch Analysis Configuration",
                    display: {
                        visible: data => data?.selectionType === "Batch",
                    },
                    elements: [
                         {
                            title: "Select Samples",
                            field: "batchSamples",
                            type: "custom",
                            display: {
                                render: (samples, onFieldChange) => {
                                    return html`
                                        <catalog-search-autocomplete
                                            .value="${samples}"
                                            .resource="${"SAMPLE"}"
                                            .opencgaSession="${this.opencgaSession}"
                                            .config="${{
                                                multiple: true,
                                            }}"
                                            @filterChange="${e => onFieldChange(e.detail.value)}">
                                        </catalog-search-autocomplete>
                                    `;
                                },
                            },
                        },
                        {
                            title: "Or Upload Mapping File",
                            field: "mappingFile",
                            type: "file", // Or file-content if we want to parse it immediately
                            display: {
                                helpMessage: "Upload a file mapping samples to clinical analysis parameters.",
                            },
                        },
                        {
                            title: "Summary",
                            type: "custom",
                            display: {
                                render: (data) => {
                                    // TODO: Implement table summary parsing mappingFile or multiple samples
                                    return html`
                                        <div class="alert alert-info">
                                            Table summary of batch selection will appear here.
                                        </div>
                                    `;
                                }
                            }
                        }
                    ],
                },
            ],
        };
    }

}

customElements.define("clinical-tertiary-select", ClinicalTertiarySelect);
