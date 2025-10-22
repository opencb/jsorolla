/*
 * Copyright 2015-2016 OpenCB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {html, LitElement, nothing} from "lit";
import AnalysisUtils from "../../commons/analysis/analysis-utils.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import UtilsNew from "../../../core/utils-new.js";
import "../../commons/analysis/opencga-analysis-tool.js";

export default class ClinicalPreprocessingAnalysis extends LitElement {

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
                type: Object
            },
        };
    }

    #init() {
        this.ANALYSIS_TOOL = "ngs-pipeline";
        this.ANALYSIS_TITLE = "NGS Preprocessing Parameters";
        this.ANALYSIS_DESCRIPTION = "";

        this.DEFAULT_TOOLPARAMS = {
            indexDir: "",
            qualityControl: {
                active: true,
                options: {},
                tool: {
                    id: "fastqc",
                    parameters: [],
                },
            },
            alignment: {
                active: true,
                options: {},
                tool: {
                    id: "bwa",
                    index: "",
                    parameters: [],
                },

            },
            variantCalling: {
                active: true,
                options: {},
                tools: [],
            }
        };

        // Make a deep copy to avoid modifying default object.
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

    firstUpdated() {
        this.dispatchChange();
    }

    toolParamsObserver() {
        // 1. reset the internal toolParams object to the default values
        this._toolParams = UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS);

        // 2. copy indexDir field
        if (this.toolParams?.input?.indexDir) {
            this._toolParams.indexDir = this.toolParams.input.indexDir;
        }

        // 3. merge steps configuration
        if (this.toolParams?.steps) {
            // 3.1. merge quality control step configuration
            if (this.toolParams.steps?.qualityControl) {
                this._toolParams.qualityControl = {
                    ...this._toolParams.qualityControl,
                    ...this.toolParams.steps.qualityControl,
                    tool: {
                        ...this._toolParams.qualityControl.tool,
                        ...this.toolParams.steps.qualityControl?.tool,
                        parameters: this.parseParametersObject(this.toolParams.steps.qualityControl?.tool?.parameters),
                    },
                };
            }

            // 3.2. merge alignment step configuration
            if (this.toolParams.steps?.alignment) {
                this._toolParams.alignment = {
                    ...this._toolParams.alignment,
                    ...this.toolParams.steps.alignment,
                    tool: {
                        ...this._toolParams.alignment.tool,
                        ...this.toolParams.steps.alignment?.tool,
                        parameters: this.parseParametersObject(this.toolParams.steps.alignment?.tool?.parameters),
                    },
                };
            }

            // 3.3. merge variant calling step configuration
            if (this.toolParams.steps?.variantCalling) {
                this._toolParams.variantCalling = {
                    active: !!this.toolParams.steps.variantCalling.active ?? this._toolParams.variantCalling.active ?? true,
                    options: {
                        ...this._toolParams.variantCalling.options,
                        ...this.toolParams.steps.variantCalling.options,
                    },
                    tools: this.toolParams.steps.variantCalling.tools || [],
                };
            }
        }
    }

    check() {
        return null;
    }

    parseParametersObject(parameters = {}) {
        return Object.keys(parameters).map(key => {
            return {
                name: key,
                value: parameters[key],
            };
        });
    }

    formatParametersList(parameters = []) {
        return Object.fromEntries(parameters.map(parameter => {
            return [parameter.name, parameter.value];
        }));
    }

    getUsagePage(tool) {
        switch (tool) {
            case "bwa":
            case "bwa-mem2":
                return "https://bio-bwa.sourceforge.net/bwa.shtml";
            case "minimap2":
                return "https://lh3.github.io/minimap2/minimap2.html";
        }
        return "";
    }

    dispatchChange() {
        // LitUtils.dispatchCustomEvent(this, "paramsChange", null, {
        //     input: {
        //         indexDir: this._toolParams.indexDir || "",
        //     },
        //     steps: {
        //         qualityControl: UtilsNew.objectClone(this._toolParams.qualityControl),
        //         alignment: UtilsNew.objectClone(this._toolParams.alignment),
        //         variantCalling: {
        //             active: this._toolParams.variantCalling.active,
        //             options: UtilsNew.objectClone(this._toolParams.variantCalling.options || {}),
        //             tools: [
        //                 UtilsNew.objectClone(this._toolParams.variantCalling.tool),
        //             ],
        //         },
        //     },
        // });
    }

    onFieldChange() {
        this._toolParams = {
            ...this._toolParams,
        };

        this.dispatchChange();
        this.requestUpdate();
    }

    onClear() {
        this.toolParamsObserver();
        this.requestUpdate();
    }

    render() {
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
        const params = [
            {
                title: "Input Parameters",
                elements: [
                    // {
                    //     title: "Select FastQ Files",
                    //     field: "files",
                    //     type: "custom",
                    //     required: true,
                    //     display: {
                    //         render: (sample, dataFormFilterChange) => {
                    //             return html `
                    //                 <catalog-search-autocomplete
                    //                     .value="${sample}"
                    //                     .resource="${"FILE"}"
                    //                     .query="${{
                    //                         study: this.opencgaSession.study.fqn,
                    //                         format: "FASTQ",
                    //                     }}"
                    //                     .opencgaSession="${this.opencgaSession}"
                    //                     .config="${{
                    //                         multiple: true,
                    //                         disabled: (this.toolParams?.input?.files || []).length > 0,
                    //                     }}"
                    //                     @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                    //                 </catalog-search-autocomplete>
                    //             `;
                    //         },
                    //         help: {
                    //             text: "Select a sample to run QC. Only Study Admins can execute QC analysis"
                    //         },
                    //     }
                    // },
                    // {
                    //     title: "Starting Step",
                    //     field: "step",
                    //     type: "select",
                    //     allowedValues: ["quality-control", "alignment", "variant-calling"],
                    //     defaultValue: "quality-control",
                    //     display: {
                    //         helpMessage: "Select the starting step of the secondary analysis."
                    //     }
                    // },
                    {
                        title: "Reference Genome Indexes",
                        field: "indexDir",
                        type: "custom",
                        display: {
                            render: (indexDir, dataFormFilterChange) => {
                                return html `
                                    <catalog-search-autocomplete
                                        .value="${indexDir}"
                                        .resource="${"DIRECTORY"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{
                                            multiple: false,
                                        }}"
                                        @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                    </catalog-search-autocomplete>
                                `;
                            },
                            helpMessage: "Folder containing the indexes shared by the different tools used in the pipeline.",
                        },
                    },
                ],
            },
            {
                title: "FastQC - Quality Control Options",
                description: "These parameters apply to FastQC quality control step",
                elements: [
                    {
                        title: "QC Active",
                        field: "qualityControl.active",
                        type: "toggle-switch",
                        display: {
                            onText: "Yes",
                            offText: "No",
                            helpMessage: "Activate or deactivate the quality control step.",
                        },
                    },
                    {
                        title: "Number of Threads",
                        field: "qualityControl.tool.parameters.threads",
                        type: "input-num",
                        display: {
                            disabled: data => !data.qualityControl.active,
                            placeholder: "e.g. 2",
                            min: 1,
                            helpMessage: [
                                "Specifies the number of files which can be processed simultaneously.",
                                "Each thread will be allocated 250MB of memory so you shouldn't run more threads than your",
                                "available memory will cope with, and not more than 6 threads on a 32 bit machine.",
                            ].join(" "),
                        },
                    },
                    {
                        title: "Minimum Length",
                        field: "qualityControl.tool.parameters.min_length",
                        type: "input-num",
                        display: {
                            disabled: data => !data.qualityControl.active,
                            helpMessage: [
                                "Sets an artificial lower limit on the length of the sequence to be shown in the report.",
                                "As long as you set this to a value greater or equal to your longest read length then this",
                                "will be the sequence length used to create your read groups. This can be useful for making",
                                "directly comaparable statistics from datasets with somewhat variable read lengths.",
                            ].join(" "),
                        },
                    },
                    {
                        title: "Oxford Nanopore Data",
                        field: "qualityControl.tool.parameters.nano",
                        type: "checkbox",
                        defaultValue: false,
                        display: {
                            disabled: data => !data.qualityControl.active,
                            helpMessage: [
                                "Files come from nanopore sequences and are in fast5 format. In this mode you can pass in",
                                "directories to process and the program will take in all fast5 files within those directories",
                                "and produce a single output file from the sequences found in all files.",
                            ].join(" "),
                        },
                    },
                ],
            },
            {
                title: "Alignment Options",
                description: "These parameters apply to BWA alignment step",
                elements: [
                    {
                        title: "Alignment Active",
                        field: "alignment.active",
                        type: "toggle-switch",
                        display: {
                            onText: "Yes",
                            offText: "No",
                            helpMessage: "Activate or deactivate the alignment step.",
                        },
                    },
                    {
                        title: "Alignment Tool",
                        field: "alignment.tool.id",
                        type: "select",
                        allowedValues: ["bwa", "bwa-mem2", "minimap2"],
                        display: {
                            disabled: data => !data.alignment.active,
                            helpMessage: "Select the alignment tool to use. Options are 'bwa' (BWA-MEM), 'bwa-mem2' (BWA-MEM2) and 'minimap2' (Minimap2)."
                        },
                    },
                    {
                        title: "Alignment Index",
                        field: "alignment.tool.index",
                        type: "custom",
                        display: {
                            render: (alignmentIndex, dataFormFilterChange) => {
                                return html `
                                    <catalog-search-autocomplete
                                        .value="${alignmentIndex}"
                                        .resource="${"FILE"}"
                                        .searchField="${"path"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{
                                            multiple: false,
                                            disabled: !this._toolParams?.alignment?.active,
                                        }}"
                                        @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                    </catalog-search-autocomplete>
                                `;
                            },
                        }
                    },
                    // {
                    //     title: "Number of Threads",
                    //     field: "alignment.tool.parameters.t",
                    //     type: "input-num",
                    //     display: {
                    //         disabled: data => !data.alignment.active,
                    //         visible: params => params.alignment.tool.name === "bwa" || params.alignment.tool.name === "bwa-mem2",
                    //         placeholder: "e.g. 2",
                    //         min: 1,
                    //         helpMessage: "Number of threads to use for the alignment step."
                    //     },
                    // },
                    // {
                    //     title: "Minimum Seed Length",
                    //     field: "alignment.tool.parameters.k",
                    //     type: "input-num",
                    //     display: {
                    //         disabled: data => !data.alignment.active,
                    //         visible: params => params.alignment.tool.name === "bwa" || params.alignment.tool.name === "bwa-mem2",
                    //         placeholder: "e.g. 2",
                    //         min: 1,
                    //         helpMessage: "Minimum seed length [19]"
                    //     },
                    // },
                    {
                        title: "Alignment Options",
                        type: "object",
                        display: {
                            itemClassName: "row",
                            itemTitleClassName: "col-md-3",
                            itemContentClassName: "col-md-9",
                        },
                        elements: [
                            {
                                title: "Clean",
                                field: "alignment.options.clean",
                                type: "toggle-switch",
                            },
                            {
                                title: "Cram",
                                field: "alignment.options.cram",
                                type: "toggle-switch",
                            },
                            {
                                title: "Quality Control",
                                field: "alignment.options.qc",
                                type: "toggle-switch",
                            },
                        ],
                    },
                    {
                        title: "Aligment Parameters",
                        field: "alignment.tool.parameters",
                        type: "object-list",
                        display: {
                            itemId: "name",
                            itemAddText: "Add parameter",
                            itemsNotFoundText: "No parameters registered for this tool.",
                            view: variable => html`
                                <div class="">
                                    <b>${variable.name || ""}</b> ${typeof variable.value !== "undefined" ? html` = ${variable.value}` : nothing}
                                </div>
                            `,
                        },
                        elements: [
                            {
                                title: "Parameter Name",
                                field: "alignment.tool.parameters[].name",
                                type: "input-text",
                                display: {
                                    placeholder: "",
                                    help: {
                                        text: "Add parameter name, eg: t, -t, or --threads. Parameters can include hyphen (-) or double hyphen (--) at the beginning.",
                                    }
                                }
                            },
                            {
                                title: "Is a File Parameter?",
                                field: "alignment.tool.parameters[].isFile",
                                type: "checkbox",
                                display: {},
                            },
                            {
                                title: "Parameter Value",
                                field: "alignment.tool.parameters[].value",
                                type: "input-text",
                                display: {
                                    visible: (data, item) => {
                                        return !item.isFile;
                                    },
                                }
                            },
                            {
                                title: "Select File",
                                field: "alignment.tool.parameters[].value",
                                type: "custom",
                                display: {
                                    visible: (data, item) => {
                                        return item.isFile;
                                    },
                                    render: (data, dataFormFilterChange) => html`
                                        <catalog-search-autocomplete
                                            .resource="${"FILE"}"
                                            .searchField="${"path"}"
                                            .config="${{
                                                multiple: false,
                                            }}"
                                            .opencgaSession="${this.opencgaSession}"
                                            @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                        </catalog-search-autocomplete>
                                    `,
                                },
                            }
                        ],
                    },
                    {
                        title: "Usage",
                        field: "alignment.tool.id",
                        type: "custom",
                        display: {
                            render: tool => {
                                const usagePage = this.getUsagePage(tool);
                                if (!tool || !usagePage) {
                                    return html`
                                        <div class="alert alert-light d-flex flex-column align-items-center gap-2 text-center py-4">
                                            <i class="fa fa-book fs-4"></i>
                                            <span class="fw-bold">No usage information available for the selected tool.</span>
                                        </div>
                                    `;
                                }
                                return html`
                                    <iframe src="${usagePage}" width="100%" height="600px"></iframe>
                                `;
                            },
                        },
                    },
                ],
            },
            {
                title: "Variant Calling Options",
                description: "These parameters apply to variant calling step",
                elements: [
                    {
                        title: "Variant Calling Active",
                        field: "variantCalling.active",
                        type: "toggle-switch",
                        display: {
                            onText: "Yes",
                            offText: "No",
                            helpMessage: "Activate or deactivate the variant calling step.",
                        },
                    },
                    {
                        title: "Variant Calling Tools",
                        field: "variantCalling.tools",
                        type: "object-list",
                        display: {
                            disabled: data => !data.variantCalling.active,
                            showAddBatchListButton: false,
                            showEditItemListButton: true,
                            showDeleteItemListButton: true,
                            itemAddText: "Add Tool",
                            view: tool => {
                                return html`Tool: <b>${tool.id || "-"}</b>`;
                            },
                        },
                        elements: [
                            {
                                title: "Tool",
                                field: "variantCalling.tools[].id",
                                type: "select",
                                allowedValues: ["gatk", "freebayes"],
                            },
                            {
                                title: "Reference Genome Index",
                                field: "variantCalling.tools[].reference",
                                type: "custom",
                                display: {
                                    render: (reference, dataFormFilterChange) => {
                                        return html `
                                            <catalog-search-autocomplete
                                                .value="${reference}"
                                                .resource="${"FILE"}"
                                                .searchField="${"path"}"
                                                .opencgaSession="${this.opencgaSession}"
                                                .config="${{
                                                    multiple: false,
                                                    disabled: !this._toolParams?.variantCalling?.active,
                                                }}"
                                                @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                            </catalog-search-autocomplete>
                                        `;
                                    },
                                },
                            },
                        ],
                    },
                ],
            },
        ];

        return AnalysisUtils.getAnalysisConfiguration(
            this.ANALYSIS_TOOL,
            this.ANALYSIS_TITLE,
            this.ANALYSIS_DESCRIPTION,
            params,
            this.check(),
            {
                type: "PILLS",
                display: {
                    ...this.displayConfig,
                },
            },
        );
    }

}

customElements.define("clinical-preprocessing-analysis", ClinicalPreprocessingAnalysis);
