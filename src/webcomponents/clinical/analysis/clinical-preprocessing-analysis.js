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

import {html, LitElement} from "lit";
import AnalysisUtils from "../../commons/analysis/analysis-utils.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";
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
            // pipeline: {
            //     type: Object,
            // },
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
        this.ANALYSIS_TITLE = "NGS Pipeline";
        this.ANALYSIS_DESCRIPTION = "";

        this.DEFAULT_TOOLPARAMS = {
            step: "quality-control",
            genome: "https://ftp.ensembl.org/pub/release-115/fasta/homo_sapiens/dna/Homo_sapiens.GRCh38.dna.primary_assembly.fa.gz",
            input: {
                files: "",
            },
            qc: {
                options: {},
                tool: {
                    name: "fastqc",
                    index: "",
                    parameters: {
                        threads: 2,
                    },
                },
            },
            alignment: {
                options: {},
                tool: {
                    name: "bwa",
                    index: "",
                    parameters: {
                        t: 2,
                        k: 19
                    },
                },

            },
            vc: {
                options: {},
                tool: {
                    name: "gatk",
                    index: "",
                    parameters: {
                    },
                }
            }
        };

        // Make a deep copy to avoid modifying default object.
        this._toolParams = UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS);
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("toolParams")) {
            this._toolParams = {
                ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
                ...this.toolParams,
            };
        }

        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    firstUpdated() {
        LitUtils.dispatchCustomEvent(this, "paramsChange", null, this._toolParams);
    }

    check() {
        return null;
    }

    onFieldChange() {
        this._toolParams = {
            ...this._toolParams,
        };

        LitUtils.dispatchCustomEvent(this, "paramsChange", null, this._toolParams);
        this.requestUpdate();
    }

    async onSubmit() {
        // This web service calls to workflow run method, which requires the following JSON data model:
        // {
        //   "id": "string",
        //   "version": 0,
        //   "params": {
        //     "additionalProp1": "string",
        //     "additionalProp2": "string",
        //   }
        // }

        // 1. Prepare special params. 'otherToolParams' will be included in the 'params' object and MUST NOT include these params
        const {files, jobId, jobDependsOn, jobTags, jobDescription, ...otherToolParams} = this._toolParams;
        const filesArray = files?.split(",") || [];

        // 2. Create and upload a samplesheet
        if (filesArray?.length === 0) {
            AnalysisUtils.notify("", "Please select at least one FASTQ file", NotificationUtils.NOTIFY_ERROR, this);
            return;
        }

        const _bodyParam = {
            name: "ngs-pipeline",
            input: {
                sample: "",
                type: "FASTQ",
                files: filesArray.map(file => file.trim()),
            },
            steps: [
                {
                    name: "quality-control",
                    options: {},
                    ...otherToolParams.qc

                },
                {
                    name: "alignment",
                    ...otherToolParams.alignment
                },
                {
                    name: "variant-calling",
                    options: {},
                    tools: [
                        {...otherToolParams.vc}
                    ],
                }
            ]
        }

        this._toolParams
        debugger

        // 3. Create toolParams and params objects
        const dataBody = {
            id: this.ANALYSIS_TOOL, // This must be the same as the workflow id
            params: {},
        }
        // Nextflow workflow parameters must start with '--'
        Object.keys(otherToolParams).forEach(key => {
            dataBody.params["--" + key] = otherToolParams[key];
        });

        // 4. Create params object
        const params = {
            study: this.opencgaSession.study.fqn,
            ...AnalysisUtils.fillJobParams(this._toolParams, this.ANALYSIS_TOOL),
        };

        // 5. Submit
        AnalysisUtils.submit(
            this.ANALYSIS_TITLE,
            this.opencgaSession.opencgaClient.clinical()
                .runNgsPipeline(dataBody, params),
            this,
        );
    }

    onClear() {
        this._toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
            ...this.toolParams,
        };
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
                    {
                        title: "Select FastQ Files",
                        field: "input.files",
                        type: "custom",
                        required: true,
                        display: {
                            render: (sample, dataFormFilterChange) => {
                                return html `
                                    <catalog-search-autocomplete
                                        .value="${sample}"
                                        .resource="${"FILE"}"
                                        .query="${{
                                            study: this.opencgaSession.study.fqn,
                                            format: "FASTQ",
                                        }}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{
                                            multiple: true,
                                            disabled: !!this.toolParams?.input?.files,
                                        }}"
                                        @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                    </catalog-search-autocomplete>
                                `;
                            },
                            help: {
                                text: "Select a sample to run QC. Only Study Admins can execute QC analysis"
                            },
                        }
                    },
                    {
                        title: "Starting Step",
                        field: "step",
                        type: "select",
                        allowedValues: ["quality-control", "alignment", "variant-calling"],
                        defaultValue: "quality-control",
                        display: {
                            helpMessage: "Select the starting step of the secondary analysis."
                        }
                    },
                    {
                        title: "Download a Reference Genome",
                        field: "genome",
                        type: "input-text",
                        // allowedValues: ["GATK.GRCh38", "GRCh37", ],
                        // defaultValue: "GATK.GRCh38",
                        display: {
                            helpMessage: "Name of iGenomes reference. If using a reference genome configured in the pipeline using iGenomes, use this parameter to give the ID for the reference. This is then used to build the full paths for all required reference genome files e.g. 'genome GATK.GRCh38'."
                        }
                    },
                    {
                        title: "Reference Genome (FASTA)",
                        field: "fasta",
                        type: "custom",
                        display: {
                            render: (sample, dataFormFilterChange) => {
                                return html `
                                    <catalog-search-autocomplete
                                        .value="${sample}"
                                        .resource="${"FILE"}"
                                        .query="${{study: this.opencgaSession.study.fqn, format: "FASTA"}}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{multiple: true, disabled: this.toolParams?.files || ""}}"
                                        @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                    </catalog-search-autocomplete>
                                `;
                            },
                            help: {
                                text: "Select a sample to run QC. Only Study Admins can execute QC analysis"
                            },
                        }
                    },

                ],
            },
            {
                title: "FastQC - Quality Control Options",
                description: "These parameters apply to FastQC quality control step",
                elements: [
                    {
                        title: "Number of Threads",
                        field: "qc.tool.parameters.threads",
                        type: "input-num",
                        display: {
                            placeholder: "e.g. 2",
                            min: 1,
                            helpMessage: "Specifies the number of files which can be processed\n" +
                                "                    simultaneously.  Each thread will be allocated 250MB of\n" +
                                "                    memory so you shouldn't run more threads than your\n" +
                                "                    available memory will cope with, and not more than\n" +
                                "                    6 threads on a 32 bit machine"
                        }
                    },
                    {
                        title: "Minimum Length",
                        field: "qc.tool.parameters.min_length",
                        type: "input-num",
                        display: {
                            helpMessage: "Sets an artificial lower limit on the length of the sequence\n" +
                                "                    to be shown in the report.  As long as you set this to a value\n" +
                                "                    greater or equal to your longest read length then this will be\n" +
                                "                    the sequence length used to create your read groups.  This can\n" +
                                "                    be useful for making directly comaparable statistics from \n" +
                                "                    datasets with somewhat variable read lengths."
                        }
                    },
                    {
                        title: "Oxford Nanopore Data",
                        field: "qc.tool.parameters.nano",
                        type: "checkbox",
                        defaultValue: false,
                        display: {
                            helpMessage: "Files come from nanopore sequences and are in fast5 format. In\n" +
                                "                    this mode you can pass in directories to process and the program\n" +
                                "                    will take in all fast5 files within those directories and produce\n" +
                                "                    a single output file from the sequences found in all files."
                        }
                    },
                ],
            },
            {
                title: "Alignment Options",
                description: "These parameters apply to BWA alignment step",
                elements: [
                    {
                        title: "Alignment Tool",
                        field: "alignment.tool.name",
                        type: "select",
                        allowedValues: ["bwa", "bwa-mem2", "minimap2"],
                        defaultValue: "bwa",
                        display: {
                            helpMessage: "Select the alignment tool to use. Options are 'bwa' (BWA-MEM), 'bwa-mem2' (BWA-MEM2) and 'minimap2' (Minimap2)."
                        }
                    },
                    {
                        title: "Alignment Index",
                        field: "alignment.tool.index",
                        type: "custom",
                        display: {
                            render: (sample, dataFormFilterChange) => {
                                return html `
                                    <catalog-search-autocomplete
                                        .value="${sample}"
                                        .resource="${"FILE"}"
                                        .query="${{study: this.opencgaSession.study.fqn}}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{multiple: false}}"
                                        @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                    </catalog-search-autocomplete>
                                `;
                            },
                            help: {
                                text: "Select a sample to run QC. Only Study Admins can execute QC analysis"
                            },
                        }
                    },
                    {
                        title: "Number of Threads",
                        field: "alignment.tool.parameters.t",
                        type: "input-num",
                        display: {
                            visible: params => params.alignment.tool.name === "bwa" || params.alignment.tool.name === "bwa-mem2",
                            placeholder: "e.g. 2",
                            min: 1,
                            helpMessage: "Number of threads to use for the alignment step."
                        }
                    },
                    {
                        title: "Minimum Seed Length",
                        field: "alignment.tool.parameters.k",
                        type: "input-num",
                        display: {
                            visible: params => params.alignment.tool.name === "bwa" || params.alignment.tool.name === "bwa-mem2",
                            placeholder: "e.g. 2",
                            min: 1,
                            helpMessage: "Minimum seed length [19]"
                        }
                    },
                ],
            },
            {
                title: "Variant Calling Options",
                description: "These parameters apply to variant calling step",
                elements: [
                    {
                        title: "Alignment Tool",
                        field: "vc.tool.name",
                        type: "select",
                        allowedValues: ["GATK", "freebayes2", "mutect2"],
                        defaultValue: "GATK",
                        display: {
                            helpMessage: "Select the variant caller to use. Options are 'GATK' (HaplotypeCaller + GenotypeGVCFs), 'freebayes2' (FreeBayes2) and 'mutect2' (Mutect2)."
                        }
                    },
                    {
                        title: "Variant Callers - GATK",
                        field: "vc.tool.parameters.joint_germline",
                        type: "checkbox",
                        display: {
                            helpMessage: "Turn on the joint germline variant calling for GATK haplotypecaller. " +
                                "Uses all normal germline samples (as designated by 'status' in the input csv) in the joint germline variant calling process."
                        }
                    },
                    {
                        title: "Variant Callers - Mutect2",
                        field: "vc.tool.parameters.joint_mutect2",
                        type: "checkbox",
                        display: {
                            helpMessage: "Runs Mutect2 in joint (multi-sample) mode for better concordance among variant calls of tumor samples from the same patient. " +
                                "Mutect2 outputs will be stored in a subfolder named with patient ID under variant_calling/mutect2/ folder. " +
                                "Only a single normal sample per patient is allowed. Tumor-only mode is also supported."
                        }
                    },
                ],
            },
            // {
            //     title: "Other Options",
            //     elements: [
            //         {
            //             title: "Other Parameters",
            //             type: "input-text",
            //             display: {
            //                 rows: 5,
            //                 placeholder: "--myparam value",
            //                 helpMessage: "Other parameters not listed above can be passed to the pipeline using this parameter. " +
            //                     "Please refer to the nf-core/sarek documentation for a full list of parameters that can be used."
            //             }
            //         }
            //     ],
            // },
        ];

        return AnalysisUtils.getAnalysisConfiguration(
            this.ANALYSIS_TOOL,
            this.ANALYSIS_TITLE,
            this.ANALYSIS_DESCRIPTION,
            params,
            this.check(),
            {
                display: this.displayConfig || {},
            },
        );
    }

}

customElements.define("clinical-preprocessing-analysis", ClinicalPreprocessingAnalysis);
