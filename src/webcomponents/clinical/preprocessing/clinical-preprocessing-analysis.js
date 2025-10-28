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
        // 1. reset the internal toolParams object to the default values and merge with the new incoming toolParams
        this._toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
            ...this._toolParams,
        };

        // 2. merge steps configuration
        if (this.toolParams?.steps) {
            // 2.1. merge quality control step configuration
            if (this.toolParams.steps?.qualityControl) {
                this._toolParams.qualityControl = {
                    active: this.toolParams.steps.qualityControl.active ?? this._toolParams.qualityControl.active,
                    options: {
                        ...this._toolParams.qualityControl.options,
                        ...this.toolParams.steps.qualityControl.options,
                    },
                    tool: {
                        ...this._toolParams.qualityControl.tool,
                        ...this.toolParams.steps.qualityControl?.tool,
                        parameters: this.parseParametersObject(this.toolParams.steps.qualityControl?.tool?.parameters),
                    },
                };
            }

            // 2.2. merge alignment step configuration
            if (this.toolParams.steps?.alignment) {
                this._toolParams.alignment = {
                    active: this.toolParams.steps.alignment.active ?? this._toolParams.alignment.active,
                    options: {
                        ...this._toolParams.alignment.options,
                        ...this.toolParams.steps.alignment.options,
                    },
                    tool: {
                        ...this._toolParams.alignment.tool,
                        ...this.toolParams.steps.alignment?.tool,
                        parameters: this.parseParametersObject(this.toolParams.steps.alignment?.tool?.parameters),
                    },
                };
            }

            // 2.3. merge variant calling step configuration
            if (this.toolParams.steps?.variantCalling) {
                this._toolParams.variantCalling = {
                    active: this.toolParams.steps.variantCalling.active ?? this._toolParams.variantCalling.active,
                    options: {
                        ...this._toolParams.variantCalling.options,
                        ...this.toolParams.steps.variantCalling.options,
                    },
                    tools: (this.toolParams.steps.variantCalling.tools || []).map(variantCallingTool => ({
                        id: variantCallingTool.id,
                        options: variantCallingTool.options || {},
                        parameters: this.parseParametersObject(variantCallingTool.parameters),
                    })),
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
        LitUtils.dispatchCustomEvent(this, "paramsChange", null, {
            ...this._toolParams,
            outputDir: this._toolParams.outputDir || "",
            indexDir: this._toolParams.indexDir || "",
            steps: {
                qualityControl: {
                    active: !!this._toolParams.qualityControl?.active,
                    options: UtilsNew.objectClone(this._toolParams.qualityControl.options || {}),
                    tool: {
                        id: this._toolParams.qualityControl.tool.id || "fastqc",
                        parameters: this.formatParametersList(this._toolParams.qualityControl.tool.parameters || []),
                    },
                },
                alignment: {
                    active: !!this._toolParams.alignment.active,
                    options: UtilsNew.objectClone(this._toolParams.alignment.options || {}),
                    tool: {
                        id: this._toolParams.alignment.tool.id,
                        index: this._toolParams.alignment.tool.index,
                        parameters: this.formatParametersList(this._toolParams.alignment.tool.parameters || []),
                    },
                },
                variantCalling: {
                    active: this._toolParams.variantCalling.active,
                    options: UtilsNew.objectClone(this._toolParams.variantCalling.options || {}),
                    tools: (this._toolParams.variantCalling.tools || []).map(variantCallingTool => ({
                        ...variantCallingTool,
                        options: UtilsNew.objectClone(variantCallingTool.options || {}),
                        parameters: this.formatParametersList(variantCallingTool.parameters || []),
                    })),
                },
            },
        });
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
        const toolIndex = (this._toolParams?.variantCalling?.tools || []).findIndex(t => t.id === toolId);
        if (toolIndex >= 0 && !event.detail.value) {
            this._toolParams.variantCalling.tools.splice(toolIndex, 1);
        } else if (toolIndex < 0 && event.detail.value) {
            this._toolParams.variantCalling.tools.push({
                id: toolId,
                parameters: [],
            });
        }
        // force a refresh of data-form
        this._toolParams = {
            ...this._toolParams,
        };
        this.requestUpdate();
        this.dispatchChange();
    }

    onVariantCallingToolConfigure(event, toolId) {
        this._selectedVariantCallingToolName = this.VARIANT_CALLING_TOOLS.find(t => t.id === toolId).name;
        this._selectedVariantCallingToolData = UtilsNew.objectClone(this._toolParams.variantCalling.tools.find(t => t.id === toolId));
        this.requestUpdate();
        this.updateComplete.then(() => {
            ModalUtils.show("VariantCallingToolConfigure");
        });
    }

    onVariantCallingToolConfigureSave(event) {
        // 1. update the internal _toolParams object with the new variant calling tool data
        const toolIndex = (this._toolParams?.variantCalling?.tools || []).findIndex(t => t.id === this._selectedVariantCallingToolData.id);
        if (toolIndex >= 0) {
            this._toolParams.variantCalling.tools[toolIndex] = event.detail;
            this._toolParams = {
                ...this._toolParams,
            };
        }

        // 2. reset selected variant calling tool internal variables and force an update
        this._selectedVariantCallingToolName = null;
        this._selectedVariantCallingToolData = null;
        this.requestUpdate();
        this.dispatchChange();
    }

    renderVariantCallingToolConfigureModal() {
        return ModalUtils.create(this, "VariantCallingToolConfigure", {
            display: {
                title: `Variant Calling Tools - Configure ${this._selectedVariantCallingToolName}`,
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
                        ModalUtils.close("VariantCallingToolConfigure");
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
                    {
                        title: "Aligner Parameters",
                        field: "alignment.tool.parameters",
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
                                                    .disabled="${!this._toolParams?.variantCalling?.active}"
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
                                            const active = (this._toolParams?.variantCalling?.tools || []).some(t => t.id === toolId) && this._toolParams?.variantCalling?.active;
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
