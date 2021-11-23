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
import VariantGridFormatter from "../variant-grid-formatter.js";
import UtilsNew from "../../../core/utilsNew.js";
import "./variant-interpreter-grid.js";
import "../../commons/forms/data-form.js";
import "../../file/file-preview.js";

class VariantInterpreterReport extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            clinicalAnalysisId: {
                type: String
            },
            clinicalAnalysis: {
                type: Object
            },
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this.callersInfo = {
            "caveman": {type: "Substitutions", group: "somatic", rank: 1},
            "pindel": {type: "Indels", group: "somatic", rank: 2},
            "brass": {type: "Rearrangements", group: "somatic", rank: 3},
            "ascat": {type: "Copy Number", group: "somatic", rank: 4},
            "strelka": {type: "Substitutions and Indels", group: "germline", rank: 1},
            "manta": {type: "Rearrangements", group: "germline", rank: 2},
        };

        this._config = this.getDefaultConfig();
        this._data = null;
        // Data-form is not capturing the update of the data property
        // For that reason, we need this flag to check when the data is ready (TODO)
        this._ready = false;
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    update(changedProperties) {
        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }

        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }

        super.update(changedProperties);
    }

    clinicalAnalysisIdObserver() {
        if (this.opencgaSession && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis = response.responses[0].results[0];
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    clinicalAnalysisObserver() {
        if (this.opencgaSession && this.clinicalAnalysis) {
            console.log(this.opencgaSession);
            console.log(this.clinicalAnalysis);

            // We will assume that we always have a somatic and a germline sample
            // TODO: check if both samples exists
            const somaticSample = this.clinicalAnalysis.proband?.samples.find(s => s.somatic);
            const germlineSample = this.clinicalAnalysis.proband?.samples.find(s => !s.somatic);

            // Initialize report data
            this._data = {
                info: {
                    project: `${this.opencgaSession.project.name} (${this.opencgaSession.project.id})`,
                    study: `${this.opencgaSession.study.name} (${this.opencgaSession.study.id})`,
                    clinicalAnalysisId: this.clinicalAnalysis.id,
                    tumourId: somaticSample.id || null,
                    germlineId: germlineSample.id || null,
                    tumourType: "Ovarian", // TODO
                },
                // clinicalAnalysis: this.clinicalAnalysis,
                ascatMetrics: [],
                ascatPlots: [],
                ascatInterpretation: [
                    "Sunrise plot indicates a successful copy number analysis with estimated tumour content of and ploidy of XX.",
                    "The copy number profile (bottom right) shows a degree of over segmentation, however, the quality is acceptable.",
                    "The genome contains numerous copy number changes and regions of LOH (minor allele frequency of 0) suggestive of genomic instability.",
                ].join(" "),
                sequenceMetrics: [
                    {field: "Sequence methods", value: "WGS Illumina NovaSeq paired end"}
                ],
                processingInfo: [
                    // {field: "Alignment", value: "bwa mem 0.7.17-r1188"},
                    {field: "Genome build", value: this.opencgaSession.project.organism.assembly},
                ],
                somaticCallingInfo: [],
                germlineCallingInfo: [],
                customFilteringInfo: [],
                //     {field: "Substitutions", value: "ASMD >= 140, CLPM=0"},
                //     {field: "Indels", value: "QUAL >= 250, Repeats <10"},
                //     {field: "Rearrangements", value: "BRASSII reconstructed"},
                // ],
                overallText: [
                    "Sequence coverage is good. Duplicate read rate <10%.",
                    "There is adequate tumour cellularity, a correct copy number result and adequate mutation data to proceed",
                    "with an interpretation of this report.",
                ].join(" "),
                primaryFindings: this.clinicalAnalysis.interpretation.primaryFindings.filter(item => {
                    return item.status.toUpperCase() === "REPORTED";
                }),
                analyst: this.clinicalAnalysis.analyst.name,
                signedBy: "",
                discussion: "",
            };

            const filesQuery = {
                sampleIds: [somaticSample.id, germlineSample.id].join(","),
                limit: 100,
                study: this.opencgaSession.study.fqn,
            };

            return this.opencgaSession.opencgaClient.files().search(filesQuery)
                .then(response => {
                    const files = response.responses[0].results;

                    // Get processing alignment info from one BAM file
                    const bamFile = files.find(f => f.format === "BAM");
                    if (bamFile) {
                        this._data.processingInfo.unshift({
                            field: "Alignment",
                            value: `${bamFile.software.name} ${bamFile.software.version || ""}`,
                        });
                    }

                    // Fill tumour and normal stats fields
                    Object.entries({tumour: somaticSample, normal: germlineSample}).forEach(([field, sample]) => {
                        const sampleBamName = sample.fileIds.find(f => f.endsWith(".bam"));
                        const file = files.find(f => f.id === sampleBamName);
                        // Find annotation sets of this BAM file
                        const annotationSet = file.annotationSets.find(annotSet => annotSet.variableSetId === "bamQcStats");
                        if (annotationSet) {
                            this._data[`${field}Stats`] = [
                                {field: "Sequence coverage", value: `${annotationSet.annotations.avgSequenceDepth}X`},
                                {field: "Duplicate reads rate", value: annotationSet.annotations.duplicateReadRate},
                                {field: "Insert size", value: `${annotationSet.annotations.avgInsertSize} bp`},
                            ];
                        }
                    });

                    // Fill somatic and germline Calling info
                    files.filter(f => f.format === "VCF").forEach(file => {
                        const info = this.callersInfo[file.software.name];
                        this._data[`${info.group}CallingInfo`].push({
                            type: info.type,
                            rank: info.rank,
                            ...file.software,
                        });
                    });

                    // Fill ASCAT metrics
                    const ascatFile = files.find(f => f.software.name.toUpperCase() === "ASCAT");
                    if (ascatFile) {
                        const ascatMetrics = ascatFile.qualityControl.variant.ascatMetrics;
                        this._data.ascatMetrics = [
                            {field: "Ploidy", value: ascatMetrics?.ploidy || "NA"},
                            {field: "Aberrant cell fraction", value: ascatMetrics?.aberrantCellFraction || "NA"},
                        ];
                        this._data.ascatPlots = ascatMetrics?.files
                            .filter(id => /(sunrise|profile|rawprofile)\.png$/.test(id))
                            .map(id => files.find(f => f.id === id)) || [];
                    }

                    this._data.qcPlots = {};
                    if (somaticSample.qualityControl?.variant?.files?.length > 0) {
                        this._data.qcPlots.genomePlots = somaticSample.qualityControl.variant.files;
                    }
                    if (somaticSample.qualityControl?.variant?.signatures?.length > 0) {
                        this._data.qcPlots.signatures = somaticSample.qualityControl.variant.signatures;
                    }

                    // End filling report data
                    this._ready = true;
                    return this.requestUpdate();
                })
                .catch(error => {
                    console.error(error);
                });
        }
    }

    onFieldChange() {
        // TODO
    }

    getDefaultConfig() {
        const SEPARATOR = {type: "separator", display: {style: "border-top: 1px solid lightgrey;"}};
        const SUBSTITUTIONS_AND_INDELS_TYPES = ["SNV", "MNV", "INDEL"];
        const REARRANGEMENTS_TYPES = ["BREAKEND", "SV", "DUPLICATION", "TANDEM_DUPLICATION", "TRANSLOCATION", "DELETION", "INSERTION", "INVERSION"];
        const COPY_NUMBER_TYPES = ["COPY_NUMBER", "COPY_NUMBER_GAIN", "COPY_NUMBER_LOSS"];

        // Default grid config
        const defaultGridConfig = {
            pagination: true,
            pageSize: 10,
            pageList: [10, 25, 50],
            showExport: false,
            detailView: true,
            showReview: false,
            showActions: false,

            showSelectCheckbox: false,
            multiSelection: false,
            nucleotideGenotype: true,
            alleleStringLengthMax: 10,

            renderLocal: false,

            header: {
                horizontalAlign: "center",
                verticalAlign: "bottom",
            },

            quality: {
                qual: 30,
                dp: 20,
            },
            // populationFrequencies: ["1kG_phase3:ALL", "GNOMAD_GENOMES:ALL", "GNOMAD_EXOMES:ALL", "UK10K:ALL", "GONL:ALL", "ESP6500:ALL", "EXAC:ALL"]
            evidences: {
                showSelectCheckbox: true,
            },
        };

        return {
            id: "clinical-analysis",
            title: "AcademicGenome.SNZ.v4 CONFIDENTIAL FOR RESEARCH PURPOSES ONLY",
            logo: "img/opencb-logo.png",
            icon: "fas fa-user-md",
            type: "form",
            buttons: {
                show: true,
                clearText: "Cancel",
                okText: "Save",
                classes: "col-md-offset-4 col-md-3"
            },
            display: {
                width: "12",
                labelWidth: "3",
                showTitle: true,
                title: {
                    style: "padding: 20px 5px"
                },
                infoIcon: "",
                labelAlign: "left",
                defaultLayout: "horizontal",
                layout: [
                    {
                        id: "",
                        classes: "row",
                        sections: [
                            {
                                id: "qc-metrics",
                                classes: "col-md-8"
                            },
                            {
                                id: "case-info",
                                classes: "col-md-4"
                            }
                        ]
                    },
                    {
                        id: "qc-metrics-plots",
                        classes: ""
                    },
                    {
                        id: "results",
                        classes: ""
                    },
                    {
                        id: "mutational-signatures",
                        classes: ""
                    },
                    {
                        id: "final-summary",
                        classes: ""
                    }
                ]
            },
            sections: [
                {
                    id: "case-info",
                    title: "Case Info",
                    display: {
                        style: "background-color: #f3f3f3; border-left: 3px solid #0c2f4c; margin: 15px 0px; padding: 25px",
                        labelWidth: "4",
                    },
                    elements: [
                        {
                            name: "Project",
                            field: "info.project",
                        },
                        {
                            name: "Study",
                            field: "info.study",
                        },
                        {
                            name: "Clinical analysis ID",
                            field: "info.clinicalAnalysisId",
                        },
                        {
                            name: "Tumour ID",
                            field: "info.tumourId",
                        },
                        {
                            name: "Germline ID",
                            field: "info.germlineId",
                        },
                        {
                            name: "Tumour type",
                            field: "info.tumourType",
                        },
                        {
                            name: "Genotyping check match and contamination",
                            field: "info.genotypingCheck",
                            defaultValue: "100% match (25/25 markers)",
                        },
                        {
                            name: "ASCAT Metrics",
                            field: "ascatMetrics",
                            type: "table",
                            display: {
                                hideHeader: true,
                                columns: [
                                    {field: "field", display: {style: "font-weight: bold"}},
                                    {field: "value"},
                                ],
                            },
                        },
                    ],
                },
                {
                    id: "qc-metrics",
                    title: "1. QC Metrics",
                    display: {
                        labelWidth: "3",
                    },
                    elements: [
                        {
                            name: "Sequence metrics",
                            field: "sequenceMetrics",
                            type: "table",
                            display: {
                                hideHeader: true,
                                columns: [
                                    {field: "field"},
                                    {field: "value"},
                                ],
                            },
                        },
                        {
                            name: "Tumour",
                            field: "tumourStats",
                            type: "table",
                            display: {
                                hideHeader: true,
                                columns: [
                                    {field: "field"},
                                    {field: "value"},
                                ],
                            },
                        },
                        {
                            name: "Normal",
                            field: "normalStats",
                            type: "table",
                            display: {
                                hideHeader: true,
                                columns: [
                                    {field: "field"},
                                    {field: "value"},
                                ],
                            },
                        },
                        {
                            name: "Processing",
                            field: "processingInfo",
                            type: "table",
                            display: {
                                hideHeader: true,
                                columns: [
                                    {field: "field"},
                                    {field: "value"},
                                ],
                            },
                        },
                        {
                            name: "Somatic Calling",
                            field: "somaticCallingInfo",
                            type: "table",
                            display: {
                                transform: somaticCallingInfo => somaticCallingInfo.sort((a, b) => {
                                    return a.rank - b.rank;
                                }),
                                hideHeader: true,
                                columns: [
                                    {field: "type"},
                                    {field: "name"},
                                    {field: "version"},
                                ],
                            },
                        },
                        {
                            name: "Custom filtering",
                            field: "customFilteringInfo",
                            type: "table",
                            display: {
                                hideHeader: true,
                                columns: [
                                    {field: "field"},
                                    {field: "value"},
                                ],
                            },
                        },
                        {
                            name: "Germline Calling",
                            field: "germlineCallingInfo",
                            type: "table",
                            display: {
                                transform: germlineCallingInfo => germlineCallingInfo.sort((a, b) => {
                                    return a.rank - b.rank;
                                }),
                                hideHeader: true,
                                columns: [
                                    {field: "type"},
                                    {field: "name"},
                                    {field: "version"},
                                ],
                            },
                        },
                        {
                            name: "Overall",
                            field: "overallText",
                            type: "input-text",
                            display: {
                                rows: 3,
                            },
                        },
                    ]
                },
                {
                    id: "qc-metrics-plots",
                    title: "",
                    display: {
                        labelWidth: "2",
                    },
                    elements: [
                        SEPARATOR,
                        {
                            name: "ASCAT Copy Number Plots",
                            field: "ascatPlots",
                            type: "custom",
                            display: {
                                render: images => images.length > 0 ? html`
                                    <div class="row">
                                        <div class="col-md-5">
                                            <file-preview
                                                .active="${true}"
                                                .file="${images[0]}"
                                                .opencgaSession="${this.opencgaSession}">
                                            </file-preview>
                                            <file-preview
                                                .active="${true}"
                                                .file="${images[0]}"
                                                .opencgaSession="${this.opencgaSession}">
                                            </file-preview>
                                            <file-preview
                                                .active="${true}"
                                                .file="${images[1]}"
                                                .opencgaSession="${this.opencgaSession}">
                                            </file-preview>
                                        </div>
                                        <div class="col-md-7">
                                            <file-preview
                                                .active="${true}"
                                                .file="${images[2]}"
                                                .opencgaSession="${this.opencgaSession}">
                                            </file-preview>
                                            <file-preview
                                                .active="${true}"
                                                .file="${images[1]}"
                                                .opencgaSession="${this.opencgaSession}">
                                            </file-preview>
                                        </div>
                                        <div class="col-md-12 help-block" style="padding: 10px">
                                            <p>
                                                Sunrise plot (left) the cross indicates the highest probability solutions for aberrant
                                                cell fraction and ploidy. Copy number plot (top right) Major copy number in red,
                                                minor copy number in green. Raw copy number profile (bottom right) total copy number in purple,
                                                minor copy number in blue.
                                            </p>
                                        </div>
                                    </div>
                                ` : null,
                            },
                        },
                        {
                            name: "ASCAT Plot Interpretation",
                            field: "ascatInterpretation",
                            type: "input-text",
                            display: {
                                rows: 3,
                            },
                        },
                        SEPARATOR,
                        {
                            name: "Genome Plot",
                            field: "qcPlots",
                            type: "custom",
                            display: {
                                render: qcPlots => qcPlots ? html`
                                    <div class="row">
                                        <div class="col-md-7">
                                                <!-- <image-viewer .data="\${qcPlots.genomePlots?.[0].file}"></image-viewer> -->
                                            <img class="img-responsive" src="${qcPlots.genomePlots?.[0].file}"/>
                                        </div>
                                        <div class="col-md-5">
                                            <signature-view .signature="${qcPlots.signatures?.[0]}" .active="${this.active}"></signature-view>
                                        </div>
                                        <div class="col-md-12 help-block" style="padding: 10px">
                                            <p>
                                                Whole genome circos plot (left) depicting from outermost rings heading inwards:
                                                Karyotypic ideogram outermost. Base substitutions next, plotted as rainfall plots (log10
                                                inter-mutation distance on radial axis, dot colours: blue, C>A; black, C>G; red, C>T; grey, T>A;
                                                green, T>C; pink, T>G). Ring with short green lines, insertions; ring with short red lines, deletions.
                                                Major copy number allele ring (green, gain), minor copy number allele ring (red, loss).
                                                Structural rearrangements shown as central lines (green, tandem duplications; red, deletions;
                                                blue, inversions; grey, inter-chromosomal events). Top right, 96-trinculeotide substitution profile.
                                                Middle right, small insertion and deletion sub-types. Bottom right, structural rearrangement sub-types.
                                            </p>
                                        </div>
                                    </div>
                                ` : null,
                            }
                        },
                        {
                            name: "Genome plot interpretation",
                            field: "genomePlotInterpretation",
                            type: "input-text",
                            defaultValue: "Free text",
                            display: {
                                rows: 3,
                            },
                        },
                    ]
                },
                {
                    id: "results",
                    title: "2. Results",
                    elements: [
                        {
                            name: "Driver mutations",
                            type: "title",
                            display: {
                                labelStyle: "font-size:20px;",
                            },
                        },
                        {
                            name: "Germline substitutions and indels",
                            type: "custom",
                            field: "primaryFindings",
                            display: {
                                defaultLayout: "vertical",
                                render: variants => {
                                    const filteredVariants = variants
                                        .filter(v => {
                                            const sampleId = v.studies[0]?.samples[0]?.sampleId;
                                            const sample = this.clinicalAnalysis.proband.samples.find(s => s.id === sampleId);
                                            return sample && !sample.somatic;
                                        })
                                        .filter(v => SUBSTITUTIONS_AND_INDELS_TYPES.indexOf(v.type) > -1);
                                    return filteredVariants.length > 0 ? html`
                                        <variant-interpreter-grid
                                            .opencgaSession="${this.opencgaSession}"
                                            .clinicalAnalysis="${this.clinicalAnalysis}"
                                            .clinicalVariants="${filteredVariants}"
                                            .review="${false}"
                                            .config="${defaultGridConfig}">
                                        </variant-interpreter-grid>
                                    `: null;
                                },
                                errorMessage: "No variants found in this category",
                            },
                        },
                        {
                            name: "Germline structural rearrangement drivers",
                            type: "custom",
                            field: "primaryFindings",
                            display: {
                                defaultLayout: "vertical",
                                render: variants => {
                                    const filteredVariants = variants
                                        .filter(v => {
                                            const sampleId = v.studies[0]?.samples[0]?.sampleId;
                                            const sample = this.clinicalAnalysis.proband.samples.find(s => s.id === sampleId);
                                            return sample && !sample.somatic;
                                        })
                                        .filter(v => REARRANGEMENTS_TYPES.indexOf(v.type) > -1);
                                    return filteredVariants.length > 0 ? html`
                                        <variant-interpreter-grid
                                            .opencgaSession="${this.opencgaSession}"
                                            .clinicalAnalysis="${this.clinicalAnalysis}"
                                            .clinicalVariants="${filteredVariants}"
                                            .review="${false}"
                                            .config="${defaultGridConfig}">
                                        </variant-interpreter-grid>
                                    `: null;
                                },
                                errorMessage: "No variants found in this category",
                            },
                        },
                        {
                            name: "Somatic mutations",
                            type: "title",
                            display: {
                                labelStyle: "font-size:20px;",
                            },
                        },
                        {
                            name: "High-confidence (category 1) driver events in this tumour include:",
                            type: "title",
                            display: {
                                labelWidth: "8",
                                labelStyle: "font-size:18px",
                            },
                        },
                        {
                            name: "Substitutions and indels",
                            type: "custom",
                            field: "primaryFindings",
                            display: {
                                defaultLayout: "vertical",
                                render: variants => {
                                    const filteredVariants = variants
                                        .filter(v => {
                                            const sampleId = v.studies[0]?.samples[0]?.sampleId;
                                            const sample = this.clinicalAnalysis.proband.samples.find(s => s.id === sampleId);
                                            return sample && sample.somatic;
                                        })
                                        .filter(v => SUBSTITUTIONS_AND_INDELS_TYPES.indexOf(v.type) > -1);
                                    return filteredVariants.length > 0 ? html`
                                        <variant-interpreter-grid
                                            .opencgaSession="${this.opencgaSession}"
                                            .clinicalAnalysis="${this.clinicalAnalysis}"
                                            .clinicalVariants="${filteredVariants}"
                                            .review="${false}"
                                            .config="${defaultGridConfig}">
                                        </variant-interpreter-grid>
                                    ` : null;
                                },
                                errorMessage: "No variants found in this category",
                            },
                        },
                        {
                            name: "Structural rearrangements",
                            type: "custom",
                            field: "primaryFindings",
                            display: {
                                defaultLayout: "vertical",
                                render: variants => {
                                    const filteredVariants = variants
                                        .filter(v => {
                                            const sampleId = v.studies[0]?.samples[0]?.sampleId;
                                            const sample = this.clinicalAnalysis.proband.samples.find(s => s.id === sampleId);
                                            return sample && sample.somatic;
                                        })
                                        .filter(v => REARRANGEMENTS_TYPES.indexOf(v.type) > -1);
                                    return filteredVariants.length > 0 ? html`
                                        <variant-interpreter-grid
                                            .opencgaSession="${this.opencgaSession}"
                                            .clinicalAnalysis="${this.clinicalAnalysis}"
                                            .clinicalVariants="${filteredVariants}"
                                            .review="${false}"
                                            .config="${defaultGridConfig}">
                                        </variant-interpreter-grid>
                                    ` : null;
                                },
                                errorMessage: "No variants found in this category",
                            },
                            defaultValue: "No variants found in this category",
                        },
                        {
                            name: "Copy number",
                            type: "custom",
                            field: "primaryFindings",
                            display: {
                                defaultLayout: "vertical",
                                render: variants => {
                                    const filteredVariants = variants
                                        .filter(v => {
                                            const sampleId = v.studies[0]?.samples[0]?.sampleId;
                                            const sample = this.clinicalAnalysis.proband.samples.find(s => s.id === sampleId);
                                            return sample && sample.somatic;
                                        })
                                        .filter(v => COPY_NUMBER_TYPES.indexOf(v.type) > -1);
                                    return filteredVariants.length > 0 ? html`
                                        <variant-interpreter-grid
                                            .opencgaSession="${this.opencgaSession}"
                                            .clinicalAnalysis="${this.clinicalAnalysis}"
                                            .clinicalVariants="${filteredVariants}"
                                            .review="${false}"
                                            .config="${defaultGridConfig}">
                                        </variant-interpreter-grid>
                                    ` : null;
                                },
                                errorMessage: "No variants found in this category",
                            },
                            defaultValue: "No variants found in this category",
                        },
                        {
                            name: "Variants of interest with lower confidence as drivers (category 2) in this tumour include:",
                            type: "title",
                            display: {
                                labelWidth: "8",
                                labelStyle: "font-size:18px",
                            },
                        },
                        {
                            name: "Substitutions and indels",
                            defaultValue: "No variants found in this category",
                            display: {
                                defaultLayout: "vertical",
                            }
                        },
                        {
                            name: "Structural rearrangements",
                            defaultValue: "No variants found in this category",
                            display: {
                                defaultLayout: "vertical",
                            }
                        },
                        {
                            name: "",
                            type: "custom",
                            display: {
                                render: () => html`
                                    <div class="help-block">
                                        Variant Allele Fraction (VAF). Loss of Heterozygosity (LOH) (Chr, start position of segment,
                                        stop position of segment, total copy number, minor copy number).
                                    </div>
                                `,
                            },
                        },
                    ]
                },
                {
                    id: "mutational-signatures",
                    title: "3. Mutational Signatures",
                    elements: [
                        {
                            name: "Single base pair substitution signatures (SBS)",
                            type: "title",
                            display: {
                                labelStyle: "font-size:18px",
                            },
                        },
                        {
                            name: "",
                            type: "custom",
                            display: {
                                defaultLayout: "vertical",
                                render: clinicalAnalysis => html`
                                    <div class="row" style="padding: 20px">
                                        <div class="col-md-6">
                                            <h4>SBS Profile</h4>
                                            <signature-view .signature="${clinicalAnalysis.qcPlots.signatures?.[0]}" .active="${this.active}"></signature-view>
                                        </div>
                                        <div class="col-md-6">
                                            <h4>SBS signature contributions</h4>
                                            <span style="font-weight: bold">Pending</span>
                                        </div>
                                    </div>
                                `,
                            },
                        },
                        {
                            name: "Indel signatures",
                            type: "title",
                            display: {
                                labelStyle: "font-size:18px",
                            },
                        },
                        {
                            name: "",
                            type: "custom",
                            display: {
                                render: () => html`
                                    <div>
                                        <span style="font-weight: bold">Pending</span>
                                    </div>
                                `,
                            },
                        },
                        {
                            name: "Rearrangement signatures:",
                            type: "title",
                            display: {
                                labelStyle: "font-size:18px",
                            },
                        },
                        {
                            name: "",
                            type: "custom",
                            display: {
                                render: () => html`
                                    <div>
                                        <span style="font-weight: bold">Pending</span>
                                    </div>
                                `,
                            },
                        },
                    ]
                },
                {
                    id: "final-summary",
                    title: "4. Final Summary",
                    elements: [
                        {
                            name: "Case Status",
                            field: "status.id",
                            type: "select",
                            allowedValues: ["REVIEW", "CLOSED", "DISCARDED"],
                            required: true,
                            display: {
                            }
                        },
                        {
                            name: "Discussion",
                            type: "input-text",
                            field: "discussion",
                            defaultValue: "",
                            display: {
                                rows: 10,
                            },
                        },
                        {
                            name: "Analysed by",
                            field: "analyst",
                        },
                        {
                            name: "Signed off by",
                            type: "input-text",
                            field: "signedBy",
                            defaultValue: "",
                        },
                        {
                            name: "Date",
                            type: "input-date",
                            field: "date",
                            display: {
                                disabled: false,
                            },
                        },
                    ]
                }
            ]
        };
    }

    render() {
        if (!this.clinicalAnalysis || !this._ready) {
            return html``;
        }

        return html`
            <data-form
                .data="${this._data}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${this.onRun}">
            </data-form>
        `;
    }

}

customElements.define("variant-interpreter-report", VariantInterpreterReport);
