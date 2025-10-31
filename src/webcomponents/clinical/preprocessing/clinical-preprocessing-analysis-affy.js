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
import "../../commons/forms/data-form.js";
import "../../commons/forms/toggle-switch.js";
import "../../commons/filters/catalog-search-autocomplete.js";

export default class ClinicalPreprocessingAnalysisAffy extends LitElement {

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
        this.ANALYSIS_TOOL = "affy-pipeline";
        this.ANALYSIS_TITLE = "Affy Preprocessing Parameters";
        this.ANALYSIS_DESCRIPTION = "";

        this.DEFAULT_TOOLPARAMS = {
            indexDir: "",
            outputDir: "",
            qualityControl: {
                active: true,
                options: {},
                tool: {
                    id: "apt-geno-qc-axiom",
                    parameters: [
                        {
                            name: "threads",
                            value: "4",
                        }
                    ],
                },
            },
            genotype: {
                active: true,
                options: {
                    clean: true,
                    qc: true,
                },
                tool: {
                    id: "apt-genotype-axiom",
                    parameters: [],
                },
            },
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

            // 2.2. merge genotype step configuration
            if (this.toolParams.steps?.genotype) {
                this._toolParams.genotype = {
                    active: this.toolParams.steps.genotype.active ?? this._toolParams.genotype.active,
                    options: {
                        ...this._toolParams.genotype.options,
                        ...this.toolParams.steps.genotype.options,
                    },
                    tool: {
                        ...this._toolParams.genotype.tool,
                        ...this.toolParams.steps.genotype?.tool,
                        parameters: this.parseParametersObject(this.toolParams.steps.genotype?.tool?.parameters),
                    },
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
                        id: this._toolParams.qualityControl.tool.id || "apt-geno-qc-axiom",
                        parameters: this.formatParametersList(this._toolParams.qualityControl.tool.parameters || []),
                    },
                },
                genotype: {
                    active: !!this._toolParams.genotype.active,
                    options: UtilsNew.objectClone(this._toolParams.genotype.options || {}),
                    tool: {
                        id: this._toolParams.genotype.tool.id,
                        parameters: this.formatParametersList(this._toolParams.genotype.tool.parameters || []),
                    },
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

    render() {
        return html`
            <data-form
                .data="${this._toolParams}"
                .config="${this._config}"
                @fieldChange="${event => this.onFieldChange(event)}"
                @clear="${event => this.onClear(event)}"
                @submit="${event => this.onSubmit(event)}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        const params = [
            {
                title: "General Parameters",
                elements: [
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
                title: "Affy Options",
                description: "These parameters apply to BWA alignment step",
                elements: [
                    // {
                    //     title: "Active",
                    //     field: "alignment.active",
                    //     type: "toggle-switch",
                    //     display: {
                    //         onText: "Yes",
                    //         offText: "No",
                    //         helpMessage: "Activate or deactivate the alignment step.",
                    //     },
                    // },
                    {
                        title: "APT Tool",
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

customElements.define("clinical-preprocessing-analysis-affy", ClinicalPreprocessingAnalysisAffy);
