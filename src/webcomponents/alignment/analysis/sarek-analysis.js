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

export default class SarekAnalysis extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }
    // CAUTION: waiting for decision on params accepted
    static get properties() {
        return {
            // files: {
            //     type: Array,
            // },
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
        this.ANALYSIS_TOOL = "nf-core.sarek";
        this.ANALYSIS_TITLE = "Sarek";
        this.ANALYSIS_DESCRIPTION = "Sarek is a best practice analysis pipeline for whole-genome and whole-exome sequencing data. ";

        this.DEFAULT_TOOLPARAMS = {
            step: "mapping",
            split_fastq: 50000000,
            length_required: 15,
            genome: "GATK.GRCh38",
        };

        // Make a deep copy to avoid modifying default object.
        this._toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS)
        };

        // this.files = "";
        this.config = this.getDefaultConfig();
    }

    // firstUpdated(changedProperties) {
    //     if (changedProperties.has("toolParams")) {
    //         // This parameter will indicate if either an individual ID or a sample ID were passed as an argument
    //         this.files = this.toolParams.files || "";
    //         // update this.toolParams with default values
    //     }
    // }

    update(changedProperties) {
        if (changedProperties.has("toolParams")) {
            this._toolParams = {
                ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
                ...this.toolParams,
            };
            // this.files = this._toolParams.files || "";
            // delete this._toolParams.files;
            this.config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    check() {
        // if (this.opencgaSession && !OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user?.id)) {
        //     return {
        //         message: "Only Study admins can execute QC methods"
        //     };
        // }
        return null;
    }

    onFieldChange() {
        this._toolParams = {...this._toolParams};

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

        // 0. Prepare special params. 'otherToolParams' will be included in the 'params' object and MUST NOT include these params
        const {files, jobId, jobDependsOn, jobTags, jobDescription, ...otherToolParams} = this._toolParams;
        const filesArray = files?.split(",") || [];
debugger
        // 1. Check if sarek workflow is installed
        // TODO: check if sarek is installed

        // 2. Create and upload a samplesheet
        let samplesheet = "patient,status,sample,lane,fastq_1,fastq_2\n";
        if (files?.length > 0) {
            // 1. Get samples related to the files
            // We assume that the files belong to the same sample
            const response = await this.opencgaSession.opencgaClient.samples().search({
                study: this.opencgaSession.study.fqn,
                fileIds: files,
                include: "id,individualId",
            });
debugger
            // Check there is one single sample
            if (response.responses[0].numResults > 1) {
                AnalysisUtils.notify("", "Please select files belonging to a single sample", NotificationUtils.NOTIFY_ERROR, this);
                return;
            }

            const samples = response.responses[0].results;
            samples.forEach(sample => {
                const individualId = sample.individualId ? sample.individualId : "no_individual";
                // Assuming single-end reads for simplicity; modify as needed for paired-end
                const fastq1 = filesArray?.find(f => f.id === filesArray[0].id)?.path || "N/A";
                const fastq2 = filesArray.length > 1 ? (filesArray?.find(f => f.id === filesArray[1].id)?.path || "N/A") : "N/A";
                samplesheet += `${individualId},1,${sample.id},lane_1,file://${fastq1},file://${fastq2}\n`;
            });

            // Upload samplesheet to OpenCGA
            const uploadResponse = await this.opencgaSession.opencgaClient.files().upload("data/samplesheets", {
                study: this.opencgaSession.study.fqn,
                content: samplesheet,
                // parents: true,
                description: `Samplesheet for Sarek analysis - ${UtilsNew.getDatetime()}`,
            });

            // Add samplesheet path to otherToolParams
            const samplesheetFile = uploadResponse.responses[0].results[0];
            otherToolParams.input = samplesheetFile.path;
        } else {
            AnalysisUtils.notify("", "Please select at least one FASTQ file", NotificationUtils.NOTIFY_ERROR, this);
            return;
        }

        // 3. Create toolParams and params objects
        const dataBody = {
            id: this.ANALYSIS_TOOL, // This must be the same as the workflow id
            params: {
                "-r": "3.5.1",
                "-profile": "docker",
            },
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
            this.opencgaSession.opencgaClient.workflows()
                .run(dataBody, params),
            this,
        );
    }

    onClear() {
        this._toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
            ...this.toolParams,
        };
        this.config = this.getDefaultConfig();

        this.requestUpdate();
    }

    render() {
        return html`
            <data-form
                .data="${this._toolParams}"
                .config="${this.config}"
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
                        field: "files",
                        type: "custom",
                        required: true,
                        display: {
                            render: (sample, dataFormFilterChange) => {
                                return html `
                                    <catalog-search-autocomplete
                                        .value="${sample}"
                                        .resource="${"FILE"}"
                                        .query="${{study: this.opencgaSession.study.fqn, format: "FASTQ"}}"
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
                    {
                        title: "Starting Step",
                        field: "step",
                        type: "select",
                        allowedValues: ["mapping", "mark_duplicates", "prepare_calibration", "recalibrate", "variant_calling", "annotate"],
                        defaultValue: "mapping",
                        display: {
                            helpMessage: "The pipeline starts from this step and then runs through the possible subsequent steps.\n" +
                                "For instance, if you select 'mark_duplicates', the pipeline will run 'mark_duplicates', 'prepare_calibration', 'recalibrate', 'variant_calling' and 'annotate'."
                        }
                    },

                ],
            },
            {
                title: "Main Options",
                elements: [
                    {
                        title: "Split FASTQ",
                        field: "split_fastq",
                        type: "input-num",
                        display: {
                            helpMessage: "Specify how many reads each split of a FastQ file contains. Set 0 to turn off splitting at all. \n" +
                                "Use the the tool FastP to split FASTQ file by number of reads. This parallelizes across fastq file shards speeding up mapping. " +
                                "Note although the minimum value is 250 reads, if you have fewer than 250 reads a single FASTQ shard will still be created."
                        }
                    },
                    {
                        title: "Nucleotides per second",
                        field: "nucleotides_per_second",
                        type: "input-num",
                        display: {
                            placeholder: "e.g. 5000000",
                            min: 1,
                            disabled: data => !["prepare_calibration", "recalibrate", "variant_calling"].includes(data?.step),
                            helpMessage: "Estimate interval size.\n" +
                                "Intervals are parts of the chopped up genome used to speed up preprocessing and variant calling. See --intervals for more info. " +
                                "Changing this parameter, changes the number of intervals that are grouped and processed together. Bed files from target sequencing can contain thousands or small intervals. Spinning up a new process for each can be quite resource intensive. Instead it can be desired to process small intervals together on larger nodes. In order to make use of this parameter, no runtime estimate can be present in the bed file (column 5)."
                        }
                    },
                    {
                        title: "Intervals",
                        field: "intervals",
                        type: "input-text",
                        display: {
                            placeholder: "path/to/targets.bed(.gz) or 1-22,X,Y,MT",
                            disabled: data => !["prepare_calibration", "recalibrate", "variant_calling"].includes(data?.step),
                            helpMessage: "Path to target bed file in case of whole exome or targeted sequencing or intervals file. " +
                                "To speed up preprocessing and variant calling processes, the execution is parallelized across a reference chopped into smaller pieces. " +
                                "Parts of preprocessing and variant calling are done by these intervals, the different resulting files are then merged. " +
                                "This can parallelize processes, and push down wall clock time significantly."
                        }
                    },
                    {
                        title: "No Intervals",
                        field: "no_intervals",
                        type: "checkbox",
                        defaultValue: false,
                        display: {
                            disabled: data => !["prepare_calibration", "recalibrate", "variant_calling"].includes(data?.step),
                            helpMessage: "Disable usage of intervals. Intervals are parts of the chopped up genome used to speed up " +
                                "preprocessing and variant calling. See --intervals for more info. " +
                                "If 'no_intervals' is set no intervals will be taken into account for speed up or data processing."
                        }
                    },
                    {
                        title: "Whole Exome Sequencing (WES)",
                        field: "wes",
                        type: "checkbox",
                        defaultValue: false,
                        display: {
                            helpMessage: "Enable when exome or panel data is provided. " +
                                "With this parameter flags in various tools are set for targeted sequencing data. " +
                                "It is recommended to enable for whole-exome and panel data analysis."
                        }
                    },
                    {
                        title: "Tools",
                        field: "tools",
                        type: "input-text",
                        display: {
                            helpMessage: "Tools to use for duplicate marking, variant calling and/or for annotation. " +
                                "Multiple tools can be specified, separated by commas. " +
                                "This parameter must be a combination of the following values: " +
                                "ascat, bcfann, cnvkit, controlfreec, deepvariant, freebayes, haplotypecaller, lofreq, sentieon_dnascope, " +
                                "sentieon_haplotyper, manta, indexcov, merge, mpileup, msisensorpro, mutect2, ngscheckmate, sentieon_dedup, " +
                                "snpeff, strelka, tiddit, vep"
                        }
                    },
                    {
                        title: "Skip Tools",
                        field: "skip_tools",
                        type: "input-text",
                        display: {
                            helpMessage: "Disable specified tools. " +
                                "Multiple tools can be specified, separated by commas. " +
                                "This parameter must be a combination of the following values: " +
                                "baserecalibrator, baserecalibrator_report, bcftools, dnascope_filter, documentation, fastqc, " +
                                "haplotypecaller_filter, haplotyper_filter, markduplicates, markduplicates_report, mosdepth, multiqc, " +
                                "samtools, vcftools, versions"
                        }
                    }
                ],
            },
            {
                title: "FASTQ Processing Options",
                elements: [
                    {
                        title: "Trim FASTQ (FastP)",
                        field: "trim_fastq",
                        type: "checkbox",
                        // defaultValue: false,
                        display: {
                            helpMessage: "Run FastP for read trimming. Use this to perform adapter trimming. Adapter are detected " +
                                "automatically by using the FastP flag 'detect_adapter_for_pe'. For more info see FastP."
                        }
                    },
                    {
                        title: "Save Trimmed FASTQ",
                        field: "save_trimmed",
                        type: "checkbox",
                        // defaultValue: false,
                        display: {
                            helpMessage: "Save trimmed FastQ file intermediates."
                        }
                    },
                    {
                        title: "Length Required (FastP)",
                        field: "length_required",
                        type: "input-num",
                        display: {
                            helpMessage: "Minimum length of reads to keep. This is the minimum length of reads to keep after trimming. " +
                                "Corresponds to the FastP flag --length_required (default in FastP is 15bp)."
                        }
                    }
                ],
            },
            {
                title: "Preprocessing Options",
                elements: [
                    {
                        title: "Aligner",
                        field: "aligner",
                        type: "select",
                        allowedValues: ["bwa-mem", "bwa-mem2", "dragmap", "sentieon-bwamem"],
                        defaultValue: "bwa-mem2",
                        display: {
                            helpMessage: "Specify aligner to be used to map reads to reference genome. Sarek will build missing indices " +
                                "automatically if not provided. Set 'bwa' false if indices should be (re-)built. " +
                                "If DragMap is selected as aligner, it is recommended to skip 'baserecalibration' with 'skip_tools baserecalibrator'."
                        }
                    },
                    {
                        title: "Save Mapped BAM",
                        field: "save_mapped",
                        type: "checkbox",
                        defaultValue: false,
                        display: {
                            helpMessage: "Save mapped files. If the parameter 'split-fastq' is used, the sharded bam files are merged and converted to CRAM before saving them."
                        }
                    }
                ],
            },
            {
                title: "Variant Calling Options",
                elements: [
                    {
                        title: "Only Paired Variant Calling",
                        field: "only_paired_variant_calling",
                        type: "checkbox",
                        defaultValue: false,
                        display: {
                            helpMessage: "If true, skips germline variant calling for matched normal to tumor sample. Normal samples without matched tumor will still be processed through germline variant calling tools. " +
                                "This can speed up computation for somatic variant calling with matched normal samples. If false, all normal samples are processed as well through the germline variantcalling tools. If true, only somatic variant calling is done."
                        }
                    },
                    {
                        title: "Variant Callers - GATK",
                        field: "joint_germline",
                        type: "checkbox",
                        display: {
                            helpMessage: "Turn on the joint germline variant calling for GATK haplotypecaller. " +
                                "Uses all normal germline samples (as designated by 'status' in the input csv) in the joint germline variant calling process."
                        }
                    },
                    {
                        title: "Variant Callers - Mutect2",
                        field: "joint_mutect2",
                        type: "checkbox",
                        display: {
                            helpMessage: "Runs Mutect2 in joint (multi-sample) mode for better concordance among variant calls of tumor samples from the same patient. " +
                                "Mutect2 outputs will be stored in a subfolder named with patient ID under variant_calling/mutect2/ folder. " +
                                "Only a single normal sample per patient is allowed. Tumor-only mode is also supported."
                        }
                    },
                    {
                        title: "Concatenate VCFs",
                        field: "concatenate_vcfs",
                        type: "checkbox",
                        defaultValue: false,
                        display: {
                            helpMessage: "Option for concatenating germline vcf-files. Concatenating the germline vcf-files from each applied variant-caller into one vcf-file using 'bfctools' concat."
                        }
                    }
                ],
            },
            {
                title: "Annotation Options",
                elements: [
                    {
                        title: "",
                        type: "notification",
                        text: "Variant annotation will be annotated using CellBase in the Variant database",
                        display: {
                            notificationType: "info",
                        }
                    }
                ],
            },
            {
                title: "Reference Genome Options",
                elements: [
                    {
                        title: "Reference Genome",
                        field: "genome",
                        type: "input-text",
                        // allowedValues: ["GATK.GRCh38", "GRCh37", ],
                        // defaultValue: "GATK.GRCh38",
                        display: {
                            helpMessage: "Name of iGenomes reference. If using a reference genome configured in the pipeline using iGenomes, use this parameter to give the ID for the reference. This is then used to build the full paths for all required reference genome files e.g. 'genome GATK.GRCh38'."
                        }
                    },
                    {
                        title: "Custom FASTA",
                        field: "fasta",
                        type: "input-text",
                        display: {
                            placeholder: "/path/to/reference.fasta",
                            helpMessage: "Path to FASTA genome file. This parameter is mandatory if Reference Genome is not specified. " +
                                "If you use AWS iGenomes, this has already been set for you appropriately."
                        }
                    },
                    {
                        title: "BWA Index",
                        field: "bwa",
                        type: "input-text",
                        display: {
                            placeholder: "/path/to/bwa/index",
                            helpMessage: "Path to BWA mem indices. If you wish to recompute indices available on igenomes, set 'bwa false'. " +
                                "If you use AWS iGenomes, this has already been set for you appropriately."
                        }
                    },
                    {
                        title: "BWA Mem2 Index",
                        field: "bwamem2",
                        type: "input-text",
                        display: {
                            placeholder: "/path/to/bwa/index",
                            helpMessage: "Path to bwa-mem2 indices. If you wish to recompute indices available on igenomes, set 'bwamem2 false'. " +
                                "If you use AWS iGenomes, this has already been set for you appropriately."
                        }
                    },
                ],
            },
            {
                title: "Other Options",
                elements: [
                    {
                        title: "Other Parameters",
                        type: "input-text",
                        display: {
                            rows: 5,
                            placeholder: "--myparam value",
                            helpMessage: "Other parameters not listed above can be passed to the pipeline using this parameter. " +
                                "Please refer to the nf-core/sarek documentation for a full list of parameters that can be used."
                        }
                    }
                ],
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

customElements.define("sarek-analysis", SarekAnalysis);
