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
import WebUtils from "../../commons/utils/web-utils.js";
import ModalUtils from "../../commons/modal/modal-utils.js";
import UtilsNew from "../../../core/utils-new.js";
import "../../commons/analysis/opencga-analysis-tool.js";
import "../../commons/forms/data-form.js";
import "../../commons/forms/toggle-switch.js";
import "../../commons/filters/catalog-search-autocomplete.js";
import "./clinical-preprocessing-variant-calling-tool-configure.js";

export default class ClinicalPreprocessingAnalysisGenomics extends LitElement {

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
            analysisType: "SINGLE",
            files: [],
            fileIds: "",
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
                        parameters: WebUtils.parseParametersObject(this.toolParams.steps.qualityControl?.tool?.parameters),
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
                        parameters: WebUtils.parseParametersObject(this.toolParams.steps.alignment?.tool?.parameters),
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
                        parameters: WebUtils.parseParametersObject(variantCallingTool.parameters),
                    })),
                };
            }
        }
    }

    check() {
        return null;
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
                        parameters: WebUtils.formatParametersList(this._toolParams.qualityControl.tool.parameters || []),
                    },
                },
                alignment: {
                    active: !!this._toolParams.alignment.active,
                    options: UtilsNew.objectClone(this._toolParams.alignment.options || {}),
                    tool: {
                        id: this._toolParams.alignment.tool.id,
                        index: this._toolParams.alignment.tool.index,
                        parameters: WebUtils.formatParametersList(this._toolParams.alignment.tool.parameters || []),
                    },
                },
                variantCalling: {
                    active: this._toolParams.variantCalling.active,
                    options: UtilsNew.objectClone(this._toolParams.variantCalling.options || {}),
                    tools: (this._toolParams.variantCalling.tools || []).map(variantCallingTool => ({
                        ...variantCallingTool,
                        options: UtilsNew.objectClone(variantCallingTool.options || {}),
                        parameters: WebUtils.formatParametersList(variantCallingTool.parameters || []),
                    })),
                },
            },
        });
    }

    async onFieldChange(event) {
        this._toolParams = {...this._toolParams};

        // 1. if user has changed the analysis type, we have to clear all fields related to individuals/families/samples
        if (event.detail.param === "analysisType") {
            this._toolParams.individualId = "";
            this._toolParams.files = [];
            this._toolParams.fileIds = "";
        }

        // 2. if user has selected an individual, we have to fetch all samples and files related to that individual
        if (event.detail.param === "individualId") {
            await this.onIndividualChange();
            this._config = this.getDefaultConfig();
        }

        // 3. if user has selected a family, we have to fetch all samples and files related to the members of that family
        if (e.detail.param === "family.familyId") {
            await this.onFamilyChange();
            this._config = this.getDefaultConfig();
        }

        this.dispatchChange();
        this.requestUpdate();
    }

    onClear() {
        this.toolParamsObserver();
        this.requestUpdate();
    }

    onIndividualChange() {
        this._toolParams.files = [];
        this._toolParams.fileIds = "";

        if (this._toolParams.individualId) {
            let individual = null;
            return this.opencgaSession.opencgaClient.individuals()
                .info(this._toolParams.individualId, {
                    study: this.opencgaSession.study.fqn,
                    include: "id,father,mother,sex,samples.id,samples.somatic,samples.fileIds",
                })
                .then(response => {
                    individual = response.responses[0].results[0];

                    // prepare the list of file ids to fetch
                    const allFileIds = new Set();
                    individual.samples.forEach(sample => {
                        sample.fileIds.forEach(fileId => {
                            allFileIds.add(fileId);
                        });
                    });

                    return this.opencgaSession.opencgaClient.files()
                        .search({
                            study: this.opencgaSession.study.fqn,
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
                    this._toolParams.files = [];
                    individual.samples.forEach(sample => {
                        sample.fileIds.forEach(fileId => {
                            if (fileIdsMap.has(fileId)) {
                                const file = fileIdsMap.get(fileId);
                                this._toolParams.files.push({
                                    fileId: fileId,
                                    fileName: file.name,
                                    fileFormat: file.format,
                                    fileSize: file.size,
                                    sampleId: sample.id,
                                    sampleSomatic: sample.somatic,
                                    individualId: this._toolParams.individualId
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

    onFamilyChange() {
        this._toolParams.files = [];
        this._toolParams.fileIds = "";

        if (this._toolParams.familyId) {
            let family = null;
            return this.opencgaSession.opencgaClient.families()
                .info(this._toolParams.familyId, {
                    study: this.opencgaSession.study.fqn,
                    include: "id,members.id,members.father,members.mother,members.sex,members.samples.id,members.samples.somatic,members.samples.fileIds",
                })
                .then(response => {
                    family = response.responses[0].results[0];

                    // we have to get all files from all samples from all members
                    const allFileIds = new Set();
                    family.members.forEach(member => {
                        member.samples.forEach(sample => {
                            sample.fileIds.forEach(fileId => allFileIds.add(fileId));
                        });
                    });

                    return this.opencgaSession.opencgaClient.files()
                        .search({
                            study: this.opencgaSession.study.fqn,
                            id: Array.from(allFileIds).join(","),
                            type: "FILE",
                            format: "FASTQ,BAM,VCF",
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
                    this._toolParams.files = [];
                    family.members.forEach(member => {
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
                @fieldChange="${event => this.onFieldChange(event)}"
                @clear="${event => this.onClear(event)}"
                @submit="${event => this.onSubmit(event)}">
            </data-form>

            ${this._selectedVariantCallingToolName ? this.renderVariantCallingToolConfigureModal() : nothing}
        `;
    }

    getDefaultConfig() {
        const params = [
            {
                title: "Input Parameters",
                elements: [
                    {
                        title: "Analysis Type",
                        field: "analysisType",
                        type: "toggle-buttons",
                        allowedValues: ["SINGLE", "FAMILY", "CANCER"],
                    },
                    {
                        title: "Select Proband",
                        field: "individualId",
                        type: "custom",
                        display: {
                            visible: data => data.analysisType === "SINGLE",
                            render: (individualId, dataFormFieldChange) => html`
                                <catalog-search-autocomplete
                                    .value="${individualId}"
                                    .resource="${"INDIVIDUAL"}"
                                    .opencgaSession="${this.opencgaSession}"
                                    .config=${{
                                        multiple: false,
                                    }}
                                    @filterChange="${e => dataFormFieldChange(e.detail.value)}">
                                </catalog-search-autocomplete>
                            `,
                        },
                    },
                    {
                        title: "Select a Family",
                        field: "familyId",
                        type: "custom",
                        display: {
                            visible: data => data.analysisType === "FAMILY",
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
                        field: "fileIds",
                        type: "table",
                        display: {
                            visible: data => data.files?.length > 0,
                            getData: data => data?.files || [],
                            className: "table-borderless table-grid mb-0",
                            columns: [
                                {
                                    title: "Sample",
                                    field: "sampleId",
                                    type: "custom",
                                    display: {
                                        render: (sampleId, onFieldChange, updateParams, data, row) => html`
                                            <div class="mb-1">${sampleId}</div>
                                            <div class="text-muted fs-7">${row.sampleSomatic ? "Somatic" : "Germline"}</div>
                                        `,
                                    },
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
                                    field: "fileId",
                                    type: "custom",
                                    display: {
                                        headerCellClassName: "text-center",
                                        className: "d-flex justify-content-center align-items-center",
                                        render: (fileId, dataFormFieldChange) => html`
                                            <input
                                                type="checkbox"
                                                class="form-check-input"
                                                ?checked="${this._toolParams.fileIds?.split(",").includes(fileId)}"
                                                @change="${event => {
                                                    // note: using 'filter' to remove empty strings
                                                    const selectedFiles = new Set(this._toolParams.fileIds?.split(",").filter(Boolean));
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

customElements.define("clinical-preprocessing-analysis-genomics", ClinicalPreprocessingAnalysisGenomics);
