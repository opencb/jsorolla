import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new";
import LitUtils from "../../commons/utils/lit-utils";
import "../../commons/forms/data-form.js";

export default class ClinicalPreprocessingSelectFiles extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object,
            },
            displayConfig: {
                type: Object,
            },
        };
    }

    #init() {
        this._data = {
            analysisType: "SINGLE",
            single: {},
            family: {},
            cancer: {}
        };
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    async onFieldChange(e) {
        this._data = {...this._data};

        if (e.detail.param === "single.individualId") {
            await this.#onIndividualChange(e);
            await this.#onSampleChange(e);
            this._config = this.getDefaultConfig();
        }

        if (e.detail.param === "single.sampleId") {
            await this.#onSampleChange(e);
            this._config = this.getDefaultConfig();
        }

        LitUtils.dispatchCustomEvent(this, "paramsChange", this._data);
        this.requestUpdate();
    }

    #onIndividualChange(e) {
        // Clear samples and files
        this._data.single.sampleId = "";
        this._data.single.samples = [];

        const individualId = e.detail.value;
        if (individualId) {
            return this.opencgaSession.opencgaClient.individuals()
                .info(individualId, {
                    study: this.opencgaSession.study.fqn,
                    include: "id,samples",
                })
                .then(response => {
                    this._data.single.samples = response.responses[0].results[0].samples
                        .map(s => s.id);

                    // Select sample if only one is available
                    if (this._data.single.samples.length === 1) {
                        this._data.single.sampleId = this._data.single.samples[0];
                    }

                })
                .catch(reason => {
                    console.error(reason);
                });
        }
    }

    #onSampleChange(e) {
        this._data.single.files = [];
        this._data.single.fileIds = "";

        if (this._data.single.sampleId) {
            return this.opencgaSession.opencgaClient.files()
                .search({
                    study: this.opencgaSession.study.fqn,
                    sampleIds: this._data.single.sampleId,
                    type: "FILE",
                    format: "FASTQ,BAM,VCF",
                    // status: "READY",
                    exclude: "qualityControl,attributes",
                    limit: 100,
                })
                .then(response => {
                    this._data.single.files = response.responses[0].results;
                })
                .catch(reason => {
                    console.error(reason);
                });
        }
    }

    render() {
        if (!this.opencgaSession) {
            return nothing;
        }

        return html`
            <data-form
                .data="${this._data}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${this.onSubmit}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Configuration",
            display: {
                ...this.displayConfig,
            },
            sections: [
                {
                    title: "Select Sample",
                    description: "",
                    elements: [
                        {
                            title: "Create or Select Sample",
                            field: "analysisType",
                            type: "select",
                            allowedValues: ["SINGLE", "FAMILY"],
                            defaultValue: "SINGLE",
                            required: true,
                            display: {
                                helpMessage: "Choose whether to create a new sample or select an existing one.",
                            },
                        }
                    ]
                },
                {
                    title: "Analysis Type: Single Sample",
                    description: "",
                    display: {
                        visible: data => data?.analysisType === "SINGLE",
                    },
                    elements: [
                        {
                            title: "Select Proband",
                            field: "single.individualId",
                            type: "custom",
                            required: true,
                            display: {
                                render: (probandId, dataFormFieldChange) => {
                                    return html`
                                        <catalog-search-autocomplete
                                            .value="${probandId}"
                                            .resource="${"INDIVIDUAL"}"
                                            .opencgaSession="${this.opencgaSession}"
                                            .config=${{
                                                multiple: false,
                                            }}
                                            @filterChange="${e => dataFormFieldChange(e.detail.value)}">
                                        </catalog-search-autocomplete>
                                    `;
                                },
                            },
                        },
                        {
                            title: "Select Samples",
                            field: "single.sampleId",
                            type: "select",
                            allowedValues: () => this._data.single?.samples || [],
                            required: true,
                        },
                        {
                            title: "Select Files",
                            field: "single.fileIds",
                            type: "table",
                            display: {
                                getData: data => data?.single?.files || [],
                                className: "table-borderless table-grid mb-0",
                                defaultValue: "Select a sample to see available files.",
                                columns: [
                                    {
                                        title: "File",
                                        field: "name",
                                    },
                                    {
                                        title: "Format",
                                        field: "format",
                                    },
                                    {
                                        title: "Size",
                                        field: "size",
                                        type: "custom",
                                        display: {
                                            render: size => UtilsNew.getDiskUsage(size),
                                        },
                                    },
                                    {
                                        title: "Select",
                                        field: "id",
                                        type: "custom",
                                        display: {
                                            className: "d-flex justify-content-center align-items-center",
                                            render: (fileId, dataFormFieldChange) => html`
                                                <input
                                                    type="checkbox"
                                                    class="form-check-input"
                                                    ?checked="${this._data.single.fileIds?.split(",").includes(fileId)}"
                                                    @change="${event => {
                                                        // note: using 'filter' to remove empty strings
                                                        const selectedFiles = new Set(this._data.single.fileIds?.split(",").filter(Boolean));
                                                        if (event.target.checked) {
                                                            selectedFiles.add(fileId);
                                                        } else {
                                                            selectedFiles.delete(fileId);
                                                        }
                                                        dataFormFieldChange(Array.from(selectedFiles).join(","));
                                                    }}">
                                            `,
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                },
                {
                    title: "Analysis Type: Family",
                    description: "",
                    display: {
                        visible: data => data?.analysisType === "FAMILY",
                    },
                    elements: [
                        {
                            title: "Select a Family",
                            field: "familyId",
                            type: "custom",
                            display: {
                                render: (familyId, onFieldChange) => html`
                                    <catalog-search-autocomplete
                                        .value="${familyId}"
                                        .resource="${"FAMILY"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{
                                            multiple: false,
                                        }}"
                                        @filterChange="${e => onFieldChange(e.detail.value)}">
                                    </catalog-search-autocomplete>
                                `,
                            },
                        },
                    ]
                },
            ],
        };
    }

}

customElements.define("clinical-preprocessing-select-files", ClinicalPreprocessingSelectFiles);
