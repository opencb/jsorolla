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

        // if (e.detail.param === "single.sampleId") {
        //     await this.#onSampleChange(e);
        //     this._config = this.getDefaultConfig();
        // }

        if (e.detail.param === "single.individualId") {
            await this.#onIndividualChange();
            // await this.#onSampleChange(e);
            this._config = this.getDefaultConfig();
        }

        if (e.detail.param === "family.familyId") {
            await this.#onFamilyChange();
            this._config = this.getDefaultConfig();
        }

        LitUtils.dispatchCustomEvent(this, "paramsChange", this._toolParams);
        this.requestUpdate();
    }

    // #onSampleChange(e) {
    //     this._toolParams.single.files = [];
    //     this._toolParams.single.fileIds = "";

    //     if (this._toolParams.single.sampleId) {
    //         return this.opencgaSession.opencgaClient.files()
    //             .search({
    //                 study: this.opencgaSession.study.fqn,
    //                 sampleIds: this._toolParams.single.sampleId,
    //                 type: "FILE",
    //                 format: "FASTQ,BAM,VCF",
    //                 // status: "READY",
    //                 exclude: "qualityControl,attributes",
    //                 limit: 100,
    //             })
    //             .then(response => {
    //                 this._toolParams.single.files = response.responses[0].results;
    //             })
    //             .catch(reason => {
    //                 console.error(reason);
    //             });
    //     }
    // }

    #onIndividualChange() {
        this._toolParams.single.individual = {};
        this._toolParams.single.files = [];
        this._toolParams.single.fileIds = "";

        if (this._toolParams.single?.individualId) {
            return this.opencgaSession.opencgaClient.individuals()
                .info(this._toolParams.single.individualId, {
                    study: this.opencgaSession.study.fqn,
                    include: "id,father,mother,sex,samples.id,samples.somatic,samples.fileIds",
                })
                .then(response => {
                    this._toolParams.single.individual = response.responses[0].results[0];

                    // prepare the list of file ids to fetch
                    const allFileIds = new Set();
                    this._toolParams.single.individual.samples.forEach(sample => {
                        sample.fileIds.forEach(fileId => {
                            allFileIds.add(fileId);
                        });
                    });

                    // Select sample if only one is available
                    // if (this._toolParams.single.individual.samples.length === 1) {
                    //     this._toolParams.single.sampleId = this._toolParams.single.individual.samples[0].id;
                    // }
                    return this.opencgaSession.opencgaClient.files()
                        .search({
                            study: this.opencgaSession.study.fqn,
                            // sampleIds: this._toolParams.single.sampleId,
                            id: Array.from(allFileIds).join(","),
                            type: "FILE",
                            format: "FASTQ,BAM,VCF",
                            exclude: "qualityControl,attributes",
                            limit: 100,
                        });
                })
                .then(response => {
                    const fileIdsMap = new Map();
                    response.responses[0].results.forEach(file => {
                        fileIdsMap.set(file.id, file);
                    });

                    // now we can generate the list of files including sampleId
                    this._toolParams.single.files = [];
                    this._toolParams.single.individual.samples.forEach(sample => {
                        sample.fileIds.forEach(fileId => {
                            if (fileIdsMap.has(fileId)) {
                                const file = fileIdsMap.get(fileId);
                                this._toolParams.single.files.push({
                                    fileId: fileId,
                                    fileName: file.name,
                                    fileFormat: file.format,
                                    fileSize: file.size,
                                    sampleId: sample.id,
                                    sampleSomatic: sample.somatic,
                                });
                            }
                        });
                    });
                })
                .catch(reason => {
                    console.error(reason);
                });
        }
    }

    #onFamilyChange() {
        this._toolParams.family.family = {};
        this._toolParams.family.files = [];
        this._toolParams.family.fileIds = "";

        if (this._toolParams.family?.familyId) {
            return this.opencgaSession.opencgaClient.families()
                .info(this._toolParams.family.familyId, {
                    study: this.opencgaSession.study.fqn,
                    include: "id,members.id,members.father,members.mother,members.sex,members.samples.id,members.samples.somatic,members.samples.fileIds",
                })
                .then(response => {
                    this._toolParams.family.family = response.responses[0].results[0];

                    // we have to get all files from all samples from all members
                    const allFileIds = new Set();
                    this._toolParams.family.family.members.forEach(member => {
                        member.samples.forEach(sample => {
                            sample.fileIds.forEach(fileId => allFileIds.add(fileId));
                        });
                    });

                    return this.opencgaSession.opencgaClient.files()
                        .search({
                            study: this.opencgaSession.study.fqn,
                            id: Array.from(allFileIds).join(","),
                            type: "FILE",
                            format: "FASTQ,BAM",
                            exclude: "qualityControl,attributes",
                            limit: 100,
                        });
                })
                .then(response => {
                    // we have to generate a list of files with sampleId and individualId included
                    const fileIdsMap = new Map();
                    response.responses[0].results.forEach(file => {
                        fileIdsMap.set(file.id, file);
                    });

                    // now we can generate the list of files including sampleId and individualId
                    this._toolParams.family.files = [];
                    this._toolParams.family.family.members.forEach(member => {
                        member.samples.forEach(sample => {
                            sample.fileIds.forEach(fileId => {
                                if (fileIdsMap.has(fileId)) {
                                    const file = fileIdsMap.get(fileId);
                                    this._toolParams.family.files.push({
                                        fileId: fileId,
                                        fileName: file.name,
                                        fileFormat: file.format,
                                        fileSize: file.size,
                                        sampleId: sample.id,
                                        sampleSomatic: sample.somatic,
                                        individualId: member.id,
                                    });
                                }
                            });
                        });
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
                        // {
                        //     title: "Select Samples",
                        //     field: "single.sampleId",
                        //     type: "select",
                        //     allowedValues: () => this._toolParams.single?.individual?.samples?.map(s => s.id) || [],
                        //     required: true,
                        // },
                        {
                            title: "Select Files",
                            field: "single.fileIds",
                            type: "table",
                            display: {
                                getData: data => data?.single?.files || [],
                                className: "table-borderless table-grid mb-0",
                                defaultValue: "Select an individual to see available files.",
                                columns: [
                                    {
                                        title: "Sample",
                                        field: "sampleId",
                                    },
                                    {
                                        title: "File",
                                        field: "fileName",
                                    },
                                    {
                                        title: "Format",
                                        field: "fileFormat",
                                    },
                                    {
                                        title: "Size",
                                        field: "fileSize",
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
                            field: "family.familyId",
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
                        {
                            title: "Select Files",
                            field: "family.fileIds",
                            type: "table",
                            display: {
                                getData: data => data?.family?.files || [],
                                className: "table-borderless table-grid mb-0",
                                defaultValue: "Select a Family to see available files.",
                                columns: [
                                    {
                                        title: "Individual",
                                        field: "individualId",
                                    },
                                    {
                                        title: "Sample",
                                        field: "sampleId",
                                    },
                                    {
                                        title: "File",
                                        field: "fileName",
                                    },
                                    {
                                        title: "Format",
                                        field: "fileFormat",
                                    },
                                    {
                                        title: "Size",
                                        field: "fileSize",
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
                                                    ?checked="${this._toolParams.family.fileIds?.split(",").includes(fileId)}"
                                                    @change="${event => {
                                                        // note: using 'filter' to remove empty strings
                                                        const selectedFiles = new Set(this._toolParams.family.fileIds?.split(",").filter(Boolean));
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

                    ]
                },
            ],
        };
    }

}

customElements.define("clinical-preprocessing-select-files", ClinicalPreprocessingSelectFiles);
