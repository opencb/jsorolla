import {LitElement, html, nothing} from "lit";
import "../../commons/forms/data-form.js";
import UtilsNew from "../../../core/utils-new";
import LitUtils from "../../commons/utils/lit-utils";

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
                type: Object
            },
            displayConfig: {
                type: Object
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
            if (this._data.single.sampleId) {
                this.#onSampleChange(e);
            }
        }

        if (e.detail.param === "single.sampleId") {
            if (this._data.single.sampleId) {
                this.#onSampleChange(e);
            }
        }
        debugger

        // LitUtils.dispatchCustomEvent(this, "paramsChange", null, this._toolParams);
        this.requestUpdate();
    }

    #onIndividualChange(e) {
        this._data.single.sampleId = "";
        this._data.single.samples = [];

        const individualId = e.detail.value;
        if (individualId) {
            return this.opencgaSession.opencgaClient.individuals()
                .info(individualId, {study: this.opencgaSession.study.fqn, include: "id,samples"})
                .then(response => {
                    this._data.single.samples = response.responses[0].results[0].samples
                        .map(s => s.id);

                    // Select sample if only one is available
                    if (this._data.single.samples.length === 1) {
                        this._data.single.sampleId = this._data.single.samples[0];
                    }

                    this._config = this.getDefaultConfig();
                })
                .catch(reason => {
                    console.error(reason);
                });
        } else {
            this._config = this.getDefaultConfig();
        }
    }

    #onSampleChange(e) {
        this.opencgaSession.opencgaClient.files()
            .search({
                study: this.opencgaSession.study.fqn,
                sampleIds: this._data.single.sampleId,
                type: "FILE",
                // format: "FASTQ,BAM,VCF",
                // status: "READY",
                exclude: "qualityControl,attributes",
                limit: 100
            })
            .then(response => {
                this._data.single.files = response.responses[0].results;
                debugger
                this._config = this.getDefaultConfig();
                this.requestUpdate();
            })
            .catch(reason => {
                console.error(reason);
            });

    }

    render() {
        if (!this.opencgaSession) {
            return nothing;
        }

        return html`
            <div>
                <data-form
                    .data="${this._data}"
                    .config="${this._config}"
                    @fieldChange="${e => this.onFieldChange(e)}"
                    @clear="${this.onClear}"
                    @submit="${this.onSubmit}">
                </data-form>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Configuration",
            display: {
                // titleVisible: false,
                // buttonOkText: "Upload Files",
                // buttonOkDisabled: () => this._uploading || (this._data?.files?.length === 0) || this._data?.files?.every(f => f.status === this.FILE_STATUS.DONE),
                // buttonClearText: "Discard",
                // buttonClearDisabled: () => this._uploading || (this._data?.files?.length === 0),
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
                                render: ((probandId, dataFormFieldChange) => {
                                    return html`
                                        <catalog-search-autocomplete
                                            .value="${probandId}"
                                            .resource="${"INDIVIDUAL"}"
                                            .opencgaSession="${this.opencgaSession}"
                                            .config=${{addButton: false, multiple: false}}
                                            @filterChange="${e => dataFormFieldChange(e.detail.value)}">
                                        </catalog-search-autocomplete>
                                    `;
                                }),
                            },
                        },
                        {
                            title: "Select Samples",
                            field: "single.sampleId",
                            type: "select",
                            allowedValues: () => this._data.single?.samples || [],
                            // defaultValue: ``,
                            required: true,
                            // validation: {
                            //     // validate: () => {
                            //     //     return this.clinicalAnalysis?.samples?.length === 1;
                            //     // },
                            //     message: "A germline sample must be selected.",
                            // },
                            display: {

                            },
                        },
                        {
                            title: "Select Files",
                            field: "single.files",
                            type: "list",
                            // required: true,
                            // validation: {
                            //     // validate: () => {
                            //     //     return this.clinicalAnalysis?.samples?.length === 1;
                            //     // },
                            //     message: "A germline sample must be selected.",
                            // },
                            display: {

                            },
                        },
                        // {
                        //     title: "Select Samples2",
                        //     field: "single",
                        //     type: "custom",
                        //     required: true,
                        //     validation: {
                        //         // validate: () => {
                        //         //     return this.clinicalAnalysis?.samples?.length === 1;
                        //         // },
                        //         message: "A germline sample must be selected.",
                        //     },
                        //     display: {
                        //         render: single => {
                        //             // return this.renderSamplesSelection(samples, false, false);
                        //             return html`
                        //                 <select-field-filter
                        //                     .value="${single.sampleId}"
                        //                     .data=${single.samples || []}
                        //                     .config="${{}}"
                        //                     @filterChange="${e => this.#onSampleChange(e)}">
                        //                 </select-field-filter>
                        //             `;
                        //         },
                        //     },
                        // },
                    ]
                },
                {
                    title: "Analysis Type: Family",
                    description: "",
                    display: {
                        visible: data => data?.analysisType === "FAMILY",
                    },
                    elements: [
                        {
                            title: "Select a Sample",
                            field: "sampleId",
                            type: "custom",
                            display: {
                                render: (sampleId, onFieldChange) => html`
                                    <div>
                                        <catalog-search-autocomplete
                                            .value="${sampleId}"
                                            .resource="${"SAMPLE"}"
                                            .opencgaSession="${this.opencgaSession}"
                                            .config="${{multiple: false}}"
                                            @filterChange="${e => onFieldChange(e.detail.value)}">
                                        </catalog-search-autocomplete>
                                    </div>
                                `,
                                helpMessage: "Path where the files will be uploaded.",
                            },
                        },
                    ]
                },
            ],
        };
    }

}

customElements.define("clinical-preprocessing-select-files", ClinicalPreprocessingSelectFiles);
