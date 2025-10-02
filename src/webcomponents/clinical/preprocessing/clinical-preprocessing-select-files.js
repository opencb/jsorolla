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
            analysisType: "SINGLE",
            single: {},
            family: {},
            cancer: {}
        };

        // Make a deep copy to avoid modifying default object.
        this._toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS)
        };

        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("toolParams") || changedProperties.has("opencgaSession")) {
            this._toolParams = {
                ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
                ...this.toolParams,
            };
            this._config = this.getDefaultConfig();
        }
        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    async onFieldChange(e) {
        this._toolParams = {...this._toolParams};

        if (e.detail.param === "single.sampleId") {
            await this.#onSampleChange(e);
            this._config = this.getDefaultConfig();
        }

        if (e.detail.param === "single.individualId") {
            await this.#onIndividualChange(e);
            await this.#onSampleChange(e);
            this._config = this.getDefaultConfig();
        }

        if (e.detail.param === "single.familyId") {
            await this.#onSampleChange(e);
            this._config = this.getDefaultConfig();
        }

        LitUtils.dispatchCustomEvent(this, "paramsChange", this._toolParams);
        this.requestUpdate();
    }

    #onSampleChange(e) {
        this._toolParams.single.files = [];
        this._toolParams.single.fileIds = "";

        if (this._toolParams.single.sampleId) {
            return this.opencgaSession.opencgaClient.files()
                .search({
                    study: this.opencgaSession.study.fqn,
                    sampleIds: this._toolParams.single.sampleId,
                    type: "FILE",
                    format: "FASTQ,BAM,VCF",
                    // status: "READY",
                    exclude: "qualityControl,attributes",
                    limit: 100,
                })
                .then(response => {
                    this._toolParams.single.files = response.responses[0].results;
                })
                .catch(reason => {
                    console.error(reason);
                });
        }
    }

    #onIndividualChange(e) {
        // Clear samples and files
        this._toolParams.single.individual = {};
        this._toolParams.single.sampleId = "";

        const individualId = e.detail.value;
        if (individualId) {
            return this.opencgaSession.opencgaClient.individuals()
                .info(individualId, {
                    study: this.opencgaSession.study.fqn,
                    include: "id,father,mother,sex,samples.id,samples.somatic,samples.fileIds",
                })
                .then(response => {
                    this._toolParams.single.individual = response.responses[0].results[0];

                    // Select sample if only one is available
                    if (this._toolParams.single.individual.samples.length === 1) {
                        this._toolParams.single.sampleId = this._toolParams.single.individual.samples[0].id;
                    }
                })
                .catch(reason => {
                    console.error(reason);
                });
        }
    }

    #onFamilyChange(e) {
        // Clear samples and files
        this._toolParams.family.individual = {};
        this._toolParams.family.sampleIds = [];

        const familyId = e.detail.value;
        if (familyId) {
            return this.opencgaSession.opencgaClient.families()
                .info(familyId, {
                    study: this.opencgaSession.study.fqn,
                    include: "id,members.id,members.father,members.mother,members.sex,members.samples.id,members.samples.somatic,members.samples.fileIds",
                })
                .then(response => {
                    this._toolParams.family.family = response.responses[0].results[0];


                    // Select sample if only one is available
                    this._toolParams.family.family.members.forEach(member => {
                        if (member.samples.length === 1) {
                            this._toolParams.single.sampleIds.push(member.samples[0].id);
                        }
                    });
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
                .data="${this._toolParams}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${this.onSubmit}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Select Files",
            display: {
                titleClassName: "mb-4",
                ...this.displayConfig,
            },
            sections: [
                {
                    elements: [
                        {
                            title: "Analysis Type",
                            field: "analysisType",
                            type: "toggle-buttons",
                            allowedValues: ["SINGLE", "FAMILY", "CANCER"],
                            defaultValue: "SINGLE",
                        },
                    ],
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
                            allowedValues: () => this._toolParams.single?.individual?.samples?.map(s => s.id) || [],
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
                                        title: "Sample",
                                        field: "sampleId",
                                    },
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
                                                    ?checked="${this._toolParams.single.fileIds?.split(",").includes(fileId)}"
                                                    @change="${event => {
                                                        // note: using 'filter' to remove empty strings
                                                        const selectedFiles = new Set(this._toolParams.single.fileIds?.split(",").filter(Boolean));
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
