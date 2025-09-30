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
            // New defaults
            skip_fastp: false,
            skip_mark_duplicates: false,
            skip_prepare_calibration: false,
            skip_recalibrate: false,
            skip_variant_calling: false,
            skip_annotation: false,
            variant_callers: "mutect2",
            genome: "GRCh38",
            nucleotides_per_second: undefined,
            intervals: "",
            no_intervals: false,
            extra_options: "",
            fastp_options: "",
            fasta: "",
            known_sites: "",
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
                        title: "Select FastQ File 1",
                        field: "files",
                        type: "custom",
                        required: true,
                        display: {
                            render: (sample, dataFormFilterChange) => {
                                return html `
                                    <catalog-search-autocomplete
                                        .resource="${"FILE"}"
                                        .query="${{study: this.opencgaSession.study.fqn, format: "FASTQ"}}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{multiple: true}}"
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
                                "Intervals are parts of the chopped up genome used to speed up preprocessing and variant calling. See --intervals for more info.\n" +
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
                            helpMessage: "Path to target bed file in case of whole exome or targeted sequencing or intervals file. \n" +
                                "To speed up preprocessing and variant calling processes, the execution is parallelized across a reference chopped into smaller pieces. \n" +
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
                                "preprocessing and variant calling. See --intervals for more info.\n" +
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
                                "Multiple tools can be specified, separated by commas.<br>" +
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
                        title: "Skip FastP (FASTQ QC/Trimming)",
                        field: "skip_fastp",
                        type: "checkbox",
                        defaultValue: false,
                        display: {
                            helpMessage: "Do not run FastP for adapter/quality trimming or per-read QC. Use if input FASTQs are already processed."
                        }
                    },
                    {
                        title: "FastP Extra Options",
                        field: "fastp_options",
                        type: "input-text",
                        display: {
                            placeholder: "--cut_right --length_required 30",
                            disabled: data => data?.skip_fastp,
                            helpMessage: "Additional FastP CLI options. Applied only when FastP runs."
                        }
                    }
                ],
            },
            {
                title: "Preprocessing Options",
                elements: [

                ],
            },
            {
                title: "Variant Calling Options",
                elements: [
                    {
                        title: "Skip Variant Calling",
                        field: "skip_variant_calling",
                        type: "checkbox",
                        defaultValue: false,
                        display: {
                            helpMessage: "Do not execute variant calling steps. Subsequent annotation step will also be skipped unless variants are provided externally."
                        }
                    },
                    {
                        title: "Variant Callers",
                        field: "variant_callers",
                        type: "input-text",
                        display: {
                            placeholder: "mutect2,strelka,tnscope",
                            disabled: data => data?.skip_variant_calling,
                            helpMessage: "Comma-separated list of variant callers to run. Typical values: mutect2, strelka, tnscope. First one listed will be primary for downstream steps."
                        }
                    }
                ],
            },
            {
                title: "Annotation Options",
                elements: [
                    {
                        title: "Skip Annotation",
                        field: "skip_annotation",
                        type: "checkbox",
                        defaultValue: false,
                        display: {
                            helpMessage: "Do not run variant annotation. Use if VCFs are already annotated externally."
                        }
                    }
                ],
            },
            {
                title: "Reference Genome Options",
                elements: [
                    {
                        title: "Reference Genome Preset",
                        field: "genome",
                        type: "select",
                        allowedValues: ["GRCh38", "GRCh37"],
                        defaultValue: "GRCh38",
                        display: {
                            helpMessage: "Select a bundled genome preset (dictates default reference/known sites paths server-side)."
                        }
                    },
                    {
                        title: "Custom FASTA (override)",
                        field: "fasta",
                        type: "input-text",
                        display: {
                            placeholder: "/path/to/reference.fasta",
                            helpMessage: "Optional path to a custom reference FASTA to override genome preset. Must be indexed (.fai)."
                        }
                    },
                    {
                        title: "Known Sites (BQSR/Calling)",
                        field: "known_sites",
                        type: "input-text",
                        display: {
                            placeholder: "/path/dbsnp.vcf.gz,/path/known_indels.vcf.gz",
                            helpMessage: "Comma-separated VCF(s) of known polymorphic sites used for base recalibration or filtering. Each must be indexed (.tbi)."
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
