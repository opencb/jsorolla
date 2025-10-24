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
import ModalUtils from "../../commons/modal/modal-utils.js";
import "../../commons/analysis/opencga-analysis-tool.js";
import "../../commons/forms/data-form.js";
import "../../commons/forms/toggle-switch.js";
import "../../commons/filters/catalog-search-autocomplete.js";
import "./clinical-preprocessing-variant-calling-tool-configure.js";

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

        this.VARIANT_CALLING_TOOLS = [
            {id: "gatk", name: "GATK"},
            {id: "freebayes", name: "FreeBayes"},
        ];

        this.DEFAULT_TOOLPARAMS = {
            indexDir: "",
            outputDir: "",
            qualityControl: {
                active: true,
                options: {},
                tool: {
                    id: "fastqc",
                    parameters: [
                        {
                            name: "threads",
                            value: "2",
                        }
                    ],
                },
            },
            alignment: {
                active: true,
                options: {
                    clean: true,
                    cram: false,
                    qc: true,
                },
                tool: {
                    id: "bwa",
                    index: "",
                    parameters: [
                        {
                            name: "t",
                            value: "2",
                        },
                        {
                            name: "k",
                            value: "19",
                        },
                    ],
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

        // internal variables to manage the selected variant calling tool to configure
        this._selectedVariantCallingToolName = null;
        this._selectedVariantCallingToolData = null;
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

        // 3. copy outputDir field
        if (this.toolParams?.outputDir) {
            this._toolParams.outputDir = this.toolParams.outputDir;
        }

        // 4. merge steps configuration
        if (this.toolParams?.steps) {
            // 4.1. merge quality control step configuration
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

            // 4.2. merge alignment step configuration
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

            // 4.3. merge variant calling step configuration
            // if (this.toolParams.steps?.variantCalling) {
            //     this._toolParams.variantCalling = {
            //         active: !!this.toolParams.steps.variantCalling.active ?? this._toolParams.variantCalling.active ?? true,
            //         options: {
            //             ...this._toolParams.variantCalling.options,
            //             ...this.toolParams.steps.variantCalling.options,
            //         },
            //         tools: this.toolParams.steps.variantCalling.tools || [],
            //     };
            // }
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
            case "fastqc":
                return "https://home.cc.umanitoba.ca/~psgendb/doc/fastqc.help";
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

    onVariantCallingToolToggle(event, toolId) {
        // TODO
    }

    onVariantCallingToolConfigure(event, toolId) {
        this._selectedVariantCallingToolName = this.VARIANT_CALLING_TOOLS.find(t => t.id === toolId).name;
        this._selectedVariantCallingToolData = this._toolParams.variantCalling.tools.find(t => t.id === toolId);
        this.requestUpdate();
        this.updateComplete.then(() => {
            ModalUtils.show("VariantCallingToolConfigure");
        });
    }

    onVariantCallingToolConfigureSave(event) {
        // TODO
        this._selectedVariantCallingToolName = null;
        this.requestUpdate();
        this.updateComplete.then(() => {
            ModalUtils.close("VariantCallingToolConfigure");
        });
    }

    renderVariantCallingToolConfigureModal() {
        return ModalUtils.create(this, "VariantCallingToolConfigure", {
            display: {
                title: `Configure ${this._selectedVariantCallingToolName}`,
                size: "modal-lg",
                buttonsVisible: false,
                draggable: false,
            },
            render: () => html`
                <clinical-preprocessing-variant-calling-tool-configure
                    .opencgaSession="${this.opencgaSession}"
                    .toolName="${this._selectedVariantCallingToolName}"
                    .toolData="${this._selectedVariantCallingToolData}"
                    @toolConfigureSave="${event => {
                        this.onVariantCallingToolConfigureSave(event);
                    }}">
                </clinical-preprocessing-variant-calling-tool-configure>
            `,
        });
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

            ${this._selectedVariantCallingToolName ? this.renderVariantCallingToolConfigureModal() : nothing}
        `;
    }

    getDefaultConfig() {
        const params = [
            {
                title: "General Parameters",
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
                        title: "Index Directory",
                        description: "Folder containing the indexes shared by the different tools used in the pipeline.",
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
                        },
                    },
                    {
                        title: "Output Directory",
                        description: "Output directory where all the analysis results will be stored.",
                        field: "outputDir",
                        type: "custom",
                        display: {
                            render: (outputDir, dataFormFilterChange) => {
                                return html `
                                    <catalog-search-autocomplete
                                        .value="${outputDir}"
                                        .resource="${"DIRECTORY"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{
                                            multiple: false,
                                        }}"
                                        @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                    </catalog-search-autocomplete>
                                `;
                            },
                        },
                    },
                ],
            },
            {
                title: "Quality Control Options",
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
                    // {
                    //     title: "Number of Threads",
                    //     field: "qualityControl.tool.parameters.threads",
                    //     type: "input-num",
                    //     display: {
                    //         disabled: data => !data.qualityControl.active,
                    //         placeholder: "e.g. 2",
                    //         min: 1,
                    //         helpMessage: [
                    //             "Specifies the number of files which can be processed simultaneously.",
                    //             "Each thread will be allocated 250MB of memory so you shouldn't run more threads than your",
                    //             "available memory will cope with, and not more than 6 threads on a 32 bit machine.",
                    //         ].join(" "),
                    //     },
                    // },
                    // {
                    //     title: "Minimum Length",
                    //     field: "qualityControl.tool.parameters.min_length",
                    //     type: "input-num",
                    //     display: {
                    //         disabled: data => !data.qualityControl.active,
                    //         helpMessage: [
                    //             "Sets an artificial lower limit on the length of the sequence to be shown in the report.",
                    //             "As long as you set this to a value greater or equal to your longest read length then this",
                    //             "will be the sequence length used to create your read groups. This can be useful for making",
                    //             "directly comaparable statistics from datasets with somewhat variable read lengths.",
                    //         ].join(" "),
                    //     },
                    // },
                    // {
                    //     title: "Oxford Nanopore Data",
                    //     field: "qualityControl.tool.parameters.nano",
                    //     type: "checkbox",
                    //     defaultValue: false,
                    //     display: {
                    //         disabled: data => !data.qualityControl.active,
                    //         helpMessage: [
                    //             "Files come from nanopore sequences and are in fast5 format. In this mode you can pass in",
                    //             "directories to process and the program will take in all fast5 files within those directories",
                    //             "and produce a single output file from the sequences found in all files.",
                    //         ].join(" "),
                    //     },
                    // },
                    // {
                    //     title: "Common FastQC Parameters",
                    //     // description: "Common parameters for the selected alignment tool.",
                    //     type: "object",
                    //     display: {
                    //         itemClassName: "row",
                    //         itemTitleClassName: "col-md-3",
                    //         itemContentClassName: "col-md-9",
                    //         disabled: data => !data.qualityControl.active,
                    //     },
                    //     elements: [
                    //         {
                    //             title: "Number of Threads",
                    //             field: "qualityControl.tool.parameters.threads",
                    //             type: "input-num",
                    //             display: {
                    //                 disabled: data => !data.qualityControl.active,
                    //                 defaultValue: "2",
                    //                 min: 1,
                    //                 helpMessage: [
                    //                     "Specifies the number of files which can be processed simultaneously.",
                    //                     "Each thread will be allocated 250MB of memory so you shouldn't run more threads than your",
                    //                     "available memory will cope with, and not more than 6 threads on a 32 bit machine.",
                    //                 ].join(" "),
                    //             },
                    //         },
                    //         {
                    //             title: "Minimum Length",
                    //             field: "qualityControl.tool.parameters.min_length",
                    //             type: "input-num",
                    //             display: {
                    //                 disabled: data => !data.qualityControl.active,
                    //                 helpMessage: [
                    //                     "Sets an artificial lower limit on the length of the sequence to be shown in the report.",
                    //                     "As long as you set this to a value greater or equal to your longest read length then this",
                    //                     "will be the sequence length used to create your read groups. This can be useful for making",
                    //                     "directly comaparable statistics from datasets with somewhat variable read lengths.",
                    //                 ].join(" "),
                    //             },
                    //         },
                    //         {
                    //             title: "Oxford Nanopore Data",
                    //             field: "qualityControl.tool.parameters.nano",
                    //             type: "checkbox",
                    //             defaultValue: false,
                    //             display: {
                    //                 disabled: data => !data.qualityControl.active,
                    //                 helpMessage: [
                    //                     "Files come from nanopore sequences and are in fast5 format. In this mode you can pass in",
                    //                     "directories to process and the program will take in all fast5 files within those directories",
                    //                     "and produce a single output file from the sequences found in all files.",
                    //                 ].join(" "),
                    //             },
                    //         },
                    //     ],
                    // },
                    {
                        title: "FastQC Parameters",
                        field: "qualityControl.tool.parameters",
                        type: "input-parameters",
                        display: {
                            disabled: data => !data.alignment.active,
                            itemId: "name",
                            itemAddText: "Add parameter",
                            fileRender: (selectedFile, dataFormFilterChange) => html`
                                <catalog-search-autocomplete
                                    .value="${selectedFile}"
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
                    },
                    {
                        title: "Tool Usage Documentation",
                        field: "qualityControl.tool.id",
                        type: "custom",
                        display: {
                            render: tool => {
                                const usagePage = "https://home.cc.umanitoba.ca/~psgendb/doc/fastqc.help";
                                if (!tool || !usagePage) {
                                    return html`
                                        <div class="alert alert-light d-flex flex-column align-items-center gap-2 text-center py-4">
                                            <i class="fa fa-book fs-4"></i>
                                            <span class="fw-bold">No usage information available for the selected tool.</span>
                                        </div>
                                    `;
                                }
                                return html`
                                    <div class="border rounded p-2 shadow-lg bg-white py-3" style="box-shadow: 0 .5rem 1rem rgba(0,0,0,.15);">
                                        <iframe src="${usagePage}" width="100%" height="720px" class="w-100 border-0"></iframe>
                                    </div>
                                `;
                            },
                        },
                    },
                ],
            },
            {
                title: "Alignment Options",
                description: "These parameters apply to BWA alignment step",
                elements: [
                    {
                        title: "Active",
                        field: "alignment.active",
                        type: "toggle-switch",
                        display: {
                            onText: "Yes",
                            offText: "No",
                            helpMessage: "Activate or deactivate the alignment step.",
                        },
                    },
                    {
                        title: "Aligner Tool",
                        field: "alignment.tool.id",
                        type: "select",
                        allowedValues: ["bwa", "bwa-mem2", "minimap2"],
                        display: {
                            disabled: data => !data.alignment.active,
                            helpMessage: "Select the alignment tool to use. Options are 'bwa' (BWA-MEM), 'bwa-mem2' (BWA-MEM2) and 'minimap2' (Minimap2)."
                        },
                    },
                    {
                        title: "Aligner Index Directory",
                        field: "alignment.tool.index",
                        // description: "Aligner index to be used for the alignment step. This overrides the general index directory.",
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
                            helpMessage: "Aligner index directory to be used for the alignment step. This overrides the general index directory."
                        }
                    },
                    {
                        title: "Alignment Step Options",
                        // description: "Select options for the alignment step.",
                        type: "object",
                        display: {
                            itemClassName: "row",
                            itemTitleClassName: "col-md-3",
                            itemContentClassName: "col-md-9",
                            disabled: data => !data.alignment.active,
                        },
                        elements: [
                            {
                                title: "Clean Intermediate Files",
                                field: "alignment.options.clean",
                                type: "toggle-switch",
                                display: {
                                    helpMessage: "If enabled, intermediate files generated during the alignment process will be deleted to save disk space.",
                                },
                            },
                            {
                                title: "Create CRAM Files",
                                field: "alignment.options.cram",
                                type: "toggle-switch",
                                display: {
                                    helpMessage: "If enabled, the output files will be in CRAM format instead of BAM format.",
                                },
                            },
                            {
                                title: "Calculate Quality Control",
                                field: "alignment.options.qc",
                                type: "toggle-switch",
                                display: {
                                    helpMessage: "If enabled, quality control will be performed on the aligned data after the alignment step.",
                                },
                            },
                        ],
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
                    // {
                    //     title: "Common Aligner Parameters",
                    //     // description: "Common parameters for the selected alignment tool.",
                    //     type: "object",
                    //     display: {
                    //         itemClassName: "row",
                    //         itemTitleClassName: "col-md-3",
                    //         itemContentClassName: "col-md-9",
                    //         disabled: data => !data.alignment.active,
                    //     },
                    //     elements: [
                    //         {
                    //             title: "Number of Threads",
                    //             field: "alignment.tool.parameters.t",
                    //             description: "Parameter: -t",
                    //             type: "input-num",
                    //             display: {
                    //                 visible: params => params.alignment.tool.id === "bwa" || params.alignment.tool.id === "bwa-mem2",
                    //                 placeholder: "2",
                    //                 min: 1,
                    //                 helpMessage: "Number of threads to use for the alignment step. [1]"
                    //             },
                    //         },
                    //         {
                    //             title: "Minimum Seed Length",
                    //             field: "alignment.tool.parameters.k",
                    //             description: "Parameter: -k",
                    //             type: "input-num",
                    //             display: {
                    //                 visible: params => params.alignment.tool.id === "bwa" || params.alignment.tool.id === "bwa-mem2",
                    //                 placeholder: "19",
                    //                 min: 1,
                    //                 helpMessage: "Minimum seed length. Matches shorter than INT will be missed. " +
                    //                     "The alignment speed is usually insensitive to this value unless it significantly deviates 20. [19]"
                    //             },
                    //         },
                    //     ],
                    // },
                    {
                        title: "Aligner Parameters",
                        field: "alignment.tool.parameters",
                        // description: "Add additional parameters for the selected alignment tool.",
                        type: "input-parameters",
                        display: {
                            disabled: data => !data.alignment.active,
                            itemsNotFoundText: "No parameters registered for this tool.",
                            fileRender: (selectedFile, dataFormFilterChange) => html`
                                <catalog-search-autocomplete
                                    .value="${selectedFile}"
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
                    },
                    {
                        title: "Tool Usage Documentation",
                        field: "alignment.tool.id",
                        // description: "Alignment tool usage documentation.",
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
                                    <div class="border rounded p-2 shadow-lg bg-white py-3" style="box-shadow: 0 .5rem 1rem rgba(0,0,0,.15);">
                                        <iframe src="${usagePage}" width="100%" height="720px" class="w-100 border-0"></iframe>
                                    </div>
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
                        type: "table",
                        display: {
                            className: "table-borderless table-grid mb-0",
                            bodyCellClassName: "align-middle",
                            getData: data => {
                                return this.VARIANT_CALLING_TOOLS;
                            },
                            columns: [
                                {
                                    title: "Tool",
                                    field: "name",
                                },
                                {
                                    title: "Active?",
                                    field: "id",
                                    type: "custom",
                                    display: {
                                        render: toolId => {
                                            const active = (this._toolParams?.variantCalling?.tools || []).some(t => t.id === toolId);
                                            return html`
                                                <toggle-switch
                                                    .value="${active}"
                                                    .onText="${"Yes"}"
                                                    .offText="${"No"}"
                                                    @filterChange="${event => this.onVariantCallingToolToggle(event, toolId)}">
                                                </toggle-switch>
                                            `;
                                        },
                                    },
                                },
                                {
                                    title: "",
                                    field: "id",
                                    type: "custom",
                                    display: {
                                        bodyCellClassName: "d-flex justify-content-end",
                                        render: toolId => {
                                            const active = (this._toolParams?.variantCalling?.tools || []).some(t => t.id === toolId);
                                            return html`
                                                <button class="btn btn-light d-flex align-items-center ${active ? "" : "disabled"}" @click="${event => this.onVariantCallingToolConfigure(event, toolId)}">
                                                    <i class="fa fa-cog me-1"></i>
                                                    <span>Configure</span>
                                                </button>
                                            `;
                                        },
                                    },
                                },
                            ],
                        },
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
