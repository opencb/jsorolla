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

import {LitElement, html} from "lit";
import AnalysisUtils from "../../commons/analysis/analysis-utils.js";
import UtilsNew from "../../../core/utils-new.js";
import "../../commons/forms/data-form.js";
import "../../commons/filters/catalog-search-autocomplete.js";


export default class BcfToolsAnalysis extends LitElement {

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
            config: {
                type: Object
            },
        };
    }

    #init() {
        this.ANALYSIS_TOOL = "bcftools";
        this.ANALYSIS_TITLE = "BCFtools";
        this.ANALYSIS_DESCRIPTION = "Executes a GWAS analysis job";

        this.DEFAULT_TOOLPARAMS = {};
        // Make a deep copy to avoid modifying default object.
        this.toolParams = {
            command: "annotate",
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
        };

        this.bcfToolsCommands = {
            annotate: "edit VCF files, add or remove annotations",
            call: "SNP/indel calling (former 'view')",
            cnv: "Copy Number Variation caller",
            concat: "concatenate VCF/BCF files from the same set of samples",
            consensus: "create consensus sequence by applying VCF variants",
            convert: "convert VCF/BCF to other formats and back",
            csq: "haplotype aware consequence caller",
            filter: "filter VCF/BCF files using fixed thresholds",
            gtcheck: "check sample concordance, detect sample swaps and contamination",
            head: "view VCF/BCF file headers",
            index: "index VCF/BCF",
            isec: "intersections of VCF/BCF files",
            merge: "merge VCF/BCF files files from non-overlapping sample sets",
            mpileup: "multi-way pileup producing genotype likelihoods",
            norm: "normalize indels",
            plugin: "run user-defined plugin",
            polysomy: "detect contaminations and whole-chromosome aberrations",
            query: "transform VCF/BCF into user-defined formats",
            reheader: "modify VCF/BCF header, change sample names",
            roh: "identify runs of homo/auto-zygosity",
            sort: "sort VCF/BCF files",
            stats: "produce VCF/BCF stats (former vcfcheck)",
            view: "subset, filter and convert VCF and BCF files",
        };

        this.config = this.getDefaultConfig();
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };
    }

    update(changedProperties) {
        if (changedProperties.has("toolParams")) {
            this.toolParams = {
                ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
                ...this.toolParams,
            };
            this.config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    check() {
        // FIXME decide if this must be displayed
        // if (!this.toolParams.caseCohort) {
        //     return {
        //         message: "You must select a cohort or sample",
        //         notificationType: "warning"
        //     };
        // }
        return null;
    }

    onFieldChange(e) {
        this.toolParams = {...this.toolParams};
        // Note: these parameters have been removed from the form
        // Check if changed param was controlCohort --> reset controlCohortSamples field
        // if (param === "controlCohort") {
        //     this.toolParams.controlCohortSamples = "";
        // }
        // Check if changed param was caseCohort --> reset caseCohortSamples field
        // if (param === "caseCohort") {
        //     this.toolParams.caseCohortSamples = "";
        // }
        // this.config = this.getDefaultConfig();
        this.requestUpdate();
    }

    onSubmit() {
        this.toolParams
debugger
        const toolParams = {
            command: this.toolParams.command,
            commandLine: this.toolParams.commandLine || "",

            controlCohort: this.toolParams.controlCohort || "",
            // controlCohortSamples: this.toolParams.controlCohortSamples?.split(",") || [],
            // controlCohortSamplesAnnotation: this.toolParams.controlCohortSamplesAnnotation,
            caseCohort: this.toolParams.caseCohort || "",
            // caseCohortSamples: this.toolParams.caseCohortSamples?.split(",") || [],
            // caseCohortSamplesAnnotation: this.toolParams.caseCohortSamplesAnnotation,
            mode: this.toolParams.mode,
            fisherMode: this.toolParams.fisherMode,
            // phenotype: this.toolParams.phenotype,
            index: this.toolParams.index ?? false,
            indexScoreId: this.toolParams.indexScoreId,
        };
        const params = {
            study: this.opencgaSession.study.fqn,
            ...AnalysisUtils.fillJobParams(this.toolParams, this.ANALYSIS_TOOL),
        };
        AnalysisUtils.submit(
            this.ANALYSIS_TITLE,
            this.opencgaSession.opencgaClient.jobs()
                .runTool(toolParams, params),
            this,
        );
    }

    onClear() {
        this.toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
        };
        this.config = this.getDefaultConfig();
    }

    render() {
        return html`
            <data-form
                .data="${this.toolParams}"
                .config="${this.config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${this.onSubmit}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        const params= [
            {
                title: "Input Cohorts",
                elements: [
                    {
                        title: "Command",
                        field: "command",
                        type: "select",
                        required: true,
                        allowedValues: Object.keys(this.bcfToolsCommands),
                        defaultValue: "annotate",
                    },
                    {
                        title: "VCF File",
                        field: "inputVcfFile1",
                        type: "custom",
                        required: true,
                        display: {
                            visible: data => data.command !== "mpileup",
                            render: (caseCohort, dataFormFilterChange) => html`
                                <catalog-search-autocomplete
                                    .resource="${"FILE"}"
                                    .query="${{study: this.opencgaSession.study.fqn, format: "VCF"}}"
                                    .config="${{multiple: false}}"
                                    .opencgaSession="${this.opencgaSession}"
                                    @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                </catalog-search-autocomplete>
                            `,
                        },
                    },
                    {
                        title: "Second VCF File",
                        field: "inputVcfFile2",
                        type: "custom",
                        required: false,
                        display: {
                            visible: data => data.command === "concat" || data.command === "merge" || data.command === "isec",
                            render: (caseCohort, dataFormFilterChange) => html`
                                <catalog-search-autocomplete
                                    .resource="${"FILE"}"
                                    .query="${{study: this.opencgaSession.study.fqn, format: "VCF"}}"
                                    .config="${{multiple: false}}"
                                    .opencgaSession="${this.opencgaSession}"
                                    @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                </catalog-search-autocomplete>
                            `,
                        },
                    },
                    {
                        title: "BAM File",
                        field: "inputBamFile",
                        type: "custom",
                        required: false,
                        display: {
                            visible: data => data.command === "mpileup",
                            render: (caseCohort, dataFormFilterChange) => html`
                                <catalog-search-autocomplete
                                    .resource="${"FILE"}"
                                    .query="${{study: this.opencgaSession.study.fqn, format: "BAM"}}"
                                    .config="${{multiple: false}}"
                                    .opencgaSession="${this.opencgaSession}"
                                    @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                </catalog-search-autocomplete>
                            `,
                        },
                    },
                    // {
                    //     title: "Command Line",
                    //     field: "commandLine",
                    //     type: "input-text",
                    //     required: true,
                    //     display: {
                    //         placeholder: ``,
                    //         help: {
                    //             text: `bcftools ${this.toolParams.command} .. ${this.bcfToolsCommands[this.toolParams.command]}`,
                    //         }
                    //     },
                    // },
                    {
                        title: "Parameters",
                        field: "parameters",
                        type: "object-list",
                        display: {
                            style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
                            itemId: "name",
                            itemAddText: "Add parameter",
                            itemsNotFoundText: "No parameters found",
                            itemsTitle: "Parameters:",
                            summary: (data, items) => {
                                return html`
                                    <div>
                                        <span class="fw-bold">Command Line:</span>
                                    </div>
                                    <div class="m-2">
                                        <span>bcftools ${data.command} ${items.map(item => item.name + " " + (item.value ?? "")).join(" ")}</span>
                                    </div>
                                `;
                            },
                            view: variable => html`
                                <div class="m-2">${variable.name} ${variable.value}</div>
                            `,
                        },
                        elements: [
                            {
                                title: "Parameter Name",
                                field: "parameters[].name",
                                type: "input-text",
                                display: {
                                    placeholder: "",
                                    help: {
                                        text: "Add parameter name, eg: -t, --threads. Parameters MUST include hyphen (-) or double hyphen (--) at the beginning.",
                                    }
                                }
                            },
                            {
                                title: "Is a File Parameter?",
                                field: "parameters[].isFile",
                                type: "checkbox",
                                display: {},
                            },
                            {
                                title: "Parameter Value",
                                field: "parameters[].value",
                                type: "input-text",
                                display: {
                                    visible: (data, item) => {
                                        return !item.isFile;
                                    },
                                }
                            },
                            {
                                title: "Select File",
                                field: "parameters[].value",
                                type: "custom",
                                display: {
                                    visible: (data, item) => {
                                        return item.isFile;
                                    },
                                    render: (data, dataFormFilterChange) => html`
                                        <catalog-search-autocomplete
                                            .resource="${"FILE"}"
                                            .config="${{multiple: false}}"
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
                        field: "usage",
                        type: "custom",
                        required: false,
                        display: {
                            render: () => html`
                                <h4>BCFtools Usage:</h4>
                                <div class="m-2 shadow">
                                    <iframe src="https://samtools.github.io/bcftools/bcftools.html#${this.toolParams.command}" width="100%" height="600px"></iframe>
                                </div>
                            `,
                        },
                    },
                ]
            },
        ];

        return AnalysisUtils.getAnalysisConfiguration(
            this.ANALYSIS_TOOL,
            this.ANALYSIS_TITLE,
            this.ANALYSIS_DESCRIPTION,
            params,
            this.check(),
            this.config
        );
    }

}

customElements.define("bcftools-analysis", BcfToolsAnalysis);
