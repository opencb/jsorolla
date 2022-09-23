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
import "./variant-interpreter-rearrangement-grid.js";
import "../../commons/forms/data-form.js";
import "../../commons/simple-chart.js";
import "../../loading-spinner.js";
import "../../file/file-preview.js";

class CaseSmsReport extends LitElement {

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
        this._data = {};
        this._dataReportTest = {
            patient: {
                name: "John",
                lastName: "Doe",
                birthDate: "20220711140653",
                age: "30",
                cipa: "",
            },
            sample: {
                type: "Blood",
                extractionDate: "20220711140653",
                reason: "Polycystic Kidney Disease"
            },
            request: {
                requestNumber: "60cc3667",
                requestDate: "20220711140653",
                requestingDoctor: {
                    name: "Octavia Mountain",
                    specialization: "Nephrology",
                    hospitalName: "Hosp. Gen. Sample",
                    address: "61 Washington Parkway",
                    city: "Vidovci",
                    code: "34000",
                }
            },
            study: {
                reason: "Clinical diagnosis of autosomal dominant polycystic kidney disease (PQRAD)",
                project: "NGS_0183-0009-0001-5517d6d27efa",
                currentAnalysis: "Panel Medical Genetics 1 v.2 (Annex 1)",
                genePriority: ["COL4A1", "COL4A3", "COL4A4", "COL4A5", "MYH9"],
            },
            methodology: {
                description: `Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown
                printer took a galley of type and scrambled it to make a type specimen book. It has survived not
                only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
                It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages,
                and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`
            },
            results: [
                {id: "Ploidy", name: "asdasd" || "NA"},
                {id: "Aberrant cell fraction", name: "asdasd" || "NA"},
            ],
            interpretation: {},
            variantAnnotation: {},
            notes: [],
            qcInfo: {
            },
            disclaimer: `Lorem Ipsum is simply dummy text of the printing and typesetting industry.
            Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown
            printer took a galley of type and scrambled it to make a type specimen book. It has survived not
            only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
            It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages,
            and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`,
            appendix: [
                `Lorem Ipsum is simply dummy text of the printing and typesetting industry.
            Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown
            printer took a galley of type and scrambled it to make a type specimen book. It has survived not
            only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
            It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages,
            and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`,
                `Lorem Ipsum is simply dummy text of the printing and typesetting industry.
            Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown
            printer took a galley of type and scrambled it to make a type specimen book. It has survived not
            only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
            It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages,
            and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`]
        };
        // Data-form is not capturing the update of the data property
        // For that reason, we need this flag to check when the data is ready (TODO)
        this._ready = false;
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    update(changedProperties) {
        // if (changedProperties.has("clinicalAnalysisId")) {
        //     this.clinicalAnalysisIdObserver();
        // }

        // if (changedProperties.has("clinicalAnalysis")) {
        //     this.clinicalAnalysisObserver();
        // }

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
                    tumourId: somaticSample?.id || null,
                    germlineId: germlineSample?.id || null,
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
                // TODO decide what to do here
                // primaryFindings: this.clinicalAnalysis.interpretation.primaryFindings.filter(item => {
                //     return item.status.toUpperCase() === "REPORTED";
                // }),
                primaryFindings: this.clinicalAnalysis.interpretation.primaryFindings,
                analyst: this.clinicalAnalysis.analyst.name,
                signedBy: "",
                discussion: "",
                hrdetect: null,
                deletionAggreationCount: 0,
                deletionAggregationStats: null,
            };

            const allPromises = [
                this.opencgaSession.opencgaClient.files().search({
                    sampleIds: [somaticSample?.id, germlineSample?.id].join(","),
                    limit: 100,
                    study: this.opencgaSession.study.fqn,
                }),
                this.opencgaSession.opencgaClient.samples().info(somaticSample?.id, {
                    include: "annotationSets",
                    study: this.opencgaSession.study.fqn,
                }),
                this.opencgaSession.opencgaClient.variants().aggregationStatsSample({
                    study: this.opencgaSession.study.fqn,
                    field: "EXT_INS_DEL_TYPE",
                    sample: somaticSample?.id,
                    region: "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,X,Y",
                    // fileData: "AR2.10039966-01T_vs_AR2.10039966-01G.annot.pindel.vcf.gz:FILTER=PASS;QUAL>=250;REP<=9"
                    // ...this.query,
                    // ...this.queries?.["INDEL"]
                }),
            ];

            return Promise.all(allPromises)
                .then(values => {
                    const files = values[0].responses[0].results;

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
                        const info = this.callersInfo[file.software.name] || {};
                        this._data[`${info.group}CallingInfo`].push({
                            type: info.type,
                            rank: info.rank,
                            ...file.software,
                        });
                    });

                    // Fill filters (customFilteringInfo)
                    if (this.clinicalAnalysis.interpretation?.primaryFindings?.length > 0) {
                        const filters = [];
                        const uniqueFilters = new Set();
                        this.clinicalAnalysis.interpretation.primaryFindings.forEach(variant => {
                            if (variant?.filters?.fileData) {
                                variant.filters.fileData.split(",").forEach(item => {
                                    const [id, filter] = item.split(":");
                                    const file = files.find(f => f.id === id || f.name === id);
                                    if (file && filter && !uniqueFilters.has(item)) {
                                        const info = this.callersInfo[file.software?.name] || {};
                                        filters.push({
                                            type: info.type || "NA",
                                            rank: info.rank || 0,
                                            caller: file.software?.name || "NA",
                                            filters: filter,
                                        });
                                        uniqueFilters.add(item);
                                    }
                                });
                            }
                        });
                        this._data.customFilteringInfo = filters;
                    }

                    // Fill ASCAT metrics
                    const ascatFile = files.find(f => f.software.name.toUpperCase() === "ASCAT");
                    if (ascatFile) {
                        const ascatMetrics = ascatFile.qualityControl.variant.ascatMetrics;
                        this._data.ascatMetrics = [
                            {field: "Ploidy", value: ascatMetrics?.ploidy || "NA"},
                            {field: "Aberrant cell fraction", value: ascatMetrics?.aberrantCellFraction || "NA"},
                        ];
                        this._data.ascatPlots = ascatMetrics?.files
                            .filter(id => /(sunrise|profile|rawprofile)\.png$/.test(id));
                    }

                    this._data.qcPlots = {};
                    if (somaticSample.qualityControl?.variant?.genomePlot?.file) {
                        // this._data.qcPlots.genomePlot = somaticSample.qualityControl.variant.genomePlot.file;
                        this._data.qcPlots.genomePlotFile = somaticSample.qualityControl.variant.genomePlot.file;
                    }
                    if (somaticSample.qualityControl?.variant?.signatures?.length > 0) {
                        this._data.qcPlots.signatures = somaticSample.qualityControl.variant.signatures;
                    }

                    // Add HRDetect value (if provided)
                    const hrdetectStats = values[1].responses[0].results[0].annotationSets.find(item => {
                        return item.id === "hrdetectStats";
                    });
                    if (hrdetectStats) {
                        this._data.hrdetect = hrdetectStats.annotations.probability;
                    }

                    // Add deletion aggregation data
                    if (values[2]) {
                        const deletionData = values[2].responses[0].results[0];
                        this._data.deletionAggreationCount = deletionData.count;
                        this._data.deletionAggregationStats = Object.fromEntries(deletionData.buckets.map(item => {
                            return [item.value, item.count];
                        }));
                    }

                    // End filling report data
                    this._ready = true;
                    this.requestUpdate();
                })
                .catch(error => {
                    console.error(error);
                });
        }
    }

    onFieldChange() {
        // TODO
    }

    render() {
        // if (!this.clinicalAnalysis || !this._ready) {
        //     return html`
        //         <loading-spinner></loading-spinner>
        //     `;
        // }

        return html`
            <data-form
                .data="${this._dataReportTest}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${this.onRun}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        const SEPARATOR = {
            type: "separator",
            display: {
                style: "border-top: 1px solid lightgrey;",
            },
        };
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
            buttons: {
                clearText: "Cancel",
                okText: "Save Report",
            },
            display: {
                width: 12,
                buttonsAlign: "right",
                titleWidth: 3,
                titleVisible: true,
                titleStyle: "padding: 20px 5px",
                titleAlign: "left",
                defaultLayout: "horizontal",
                layout: [
                    {
                        id: "",
                        className: "row",
                        display: {
                            style: "background-color: #f3f3f3; border-left: 3px solid #0c2f4c; margin: 16px 0px; padding: 24px",
                        },
                        sections: [
                            {
                                id: "patient-personal",
                                className: "col-md-6"
                            },
                            {
                                id: "request-detail",
                                className: "col-md-6"
                            },
                        ]
                    },
                    {
                        id: "study-description",
                    },
                    {
                        id: "methodology",
                    },
                    {
                        id: "results",
                    },
                    {
                        id: "interpretation",
                    },
                    {
                        id: "variant-detail-annotation-description",
                    },
                    {
                        id: "notes",
                    },
                    {
                        id: "qc-info",
                    },
                    {
                        id: "disclaimer"
                    },
                    {
                        id: "appendix"
                    },
                ]
            },
            sections: [
                {
                    id: "patient-personal",
                    title: "1. Patient personal details",
                    display: {
                        style: "background-color: #f3f3f3; border-left: 3px solid #0c2f4c; margin: 16px 0px; padding: 24px",
                        titleWidth: 4,
                    },
                    elements: [
                        {
                            title: "Name",
                            field: "patient.name",
                            defaultValue: "N/A"
                        },
                        {
                            title: "Last Name",
                            field: "patient.lastName",
                            defaultValue: "N/A"
                        },
                        {
                            title: "Birth Date",
                            field: "patient.birthDate",
                            type: "custom",
                            display: {
                                render: field => `${UtilsNew.dateFormatter(field)}`
                            }
                        },
                        {
                            title: "Age",
                            field: "patient.age",
                            defaultValue: "N/A"
                        },
                        {
                            title: "CIPA",
                            // field: "info.germlineId",
                            defaultValue: "N/A"
                        },
                        {
                            title: "Sample type",
                            field: "sample.type",
                            defaultValue: "N/A"
                        },
                        {
                            title: "Extration Date",
                            field: "sample.extractionDate",
                            type: "custom",
                            display: {
                                render: field => `${UtilsNew.dateFormatter(field)}`
                            }

                        },
                        {
                            title: "Reason", // Cause
                            field: "sample.reason",
                            defaultValue: "N/A",

                        },
                    ]
                },
                {
                    id: "request-detail",
                    title: "2. Diagnostics Request Info and Details",
                    display: {
                        style: "background-color: #f3f3f3; border-left: 3px solid #0c2f4c; margin: 16px 0px; padding: 24px",
                        titleWidth: 4,
                    },
                    elements: [
                        {
                            title: "N. Request",
                            field: "request.requestingDoctor.requestNumber",
                            defaultValue: "N/A"
                        },
                        {
                            title: "Request Date",
                            field: "request.requestingDoctor.requestDate",
                            defaultValue: "N/A"
                        },
                        {
                            title: "Dr/Dra.:",
                            field: "request.requestingDoctor.name",
                            display: {
                                defaultLayout: "vertical",
                            },
                            defaultValue: "N/A"
                        },
                        {
                            title: "",
                            field: "request.requestingDoctor.specialization",
                            defaultValue: "N/A"
                        },
                        {
                            title: "",
                            field: "request.requestingDoctor.hospitalName",
                            defaultValue: "N/A"
                        },
                        {
                            title: "",
                            field: "request.requestingDoctor.address",
                            defaultValue: "N/A"
                        },
                        {
                            title: "",
                            field: "request.requestingDoctor.code",
                            defaultValue: "N/A"
                        },
                    ]
                },
                {
                    id: "study-description",
                    title: "3. Study Description",
                    elements: [
                        {
                            title: "Study Reason",
                            field: "study.reason",
                            defaultValue: "Testing"
                        },
                        {
                            title: "Project",
                            field: "study.project",
                            defaultValue: "Testing"
                        },
                        {
                            title: "Current Analysis",
                            field: "study.currentAnalysis",
                            defaultValue: "Testing"
                        },
                        {
                            title: "Gene Priority",
                            field: "study.genePriority",
                            type: "custom",
                            display: {
                                render: field => `${field.join(", ")}`
                            },
                            defaultValue: "Testing"
                        },
                    ]
                },
                {
                    id: "methodology",
                    title: "4. Methodology used",
                    elements: [
                        {
                            title: "Study Reason",
                            // field: "info.project",
                            type: "text",
                            display: {
                                defaultLayout: "vertical",
                            },
                            text: `Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                            Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown
                            printer took a galley of type and scrambled it to make a type specimen book. It has survived not
                            only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
                            It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages,
                            and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`
                        },
                    ]
                },
                {
                    id: "results",
                    title: "4. Results",
                    elements: [
                        {
                            title: "Variants",
                            field: "results",
                            type: "table",
                            display: {
                                style: "width:auto",
                                layout: "vertical",
                                columns: [
                                    {
                                        title: "id",
                                        field: "id"
                                    },
                                    {
                                        title: "name",
                                        field: "name"
                                    },
                                ],
                            },
                        },
                    ]
                },
                {
                    id: "interpretation",
                    title: "5. Interpretation results",
                    elements: [
                        {
                            title: "",
                            display: {
                                defaultLayout: "vertical",
                            },
                            // field: "info.project",
                            defaultValue: "'Global Section'"
                        },
                        {
                            title: "",
                            display: {
                                defaultLayout: "vertical",
                            },
                            // field: "info.project",
                            defaultValue: "'section for each variant'"
                        },
                    ]
                },
                {
                    id: "variant-detail-annotation-description",
                    title: "6. Detailed variant annotation description",
                    elements: [
                        {
                            title: "",
                            display: {
                                defaultLayout: "vertical",
                            },
                            // field: "info.project",
                            defaultValue: "'Population freq and presence in other DB'"
                        },
                        {
                            title: "",
                            display: {
                                defaultLayout: "vertical",
                            },
                            // field: "info.project",
                            defaultValue: "'pathogenicity and ACMGstudy'"
                        },
                        {
                            title: "",
                            display: {
                                defaultLayout: "vertical",
                            },
                            // field: "info.project",
                            defaultValue: "'Gen implication in the disease'"
                        },
                        {
                            title: "",
                            display: {
                                defaultLayout: "vertical",
                            },
                            // field: "info.project",
                            defaultValue: "'Clinical recommendations'"
                        },
                    ]
                },
                {
                    id: "notes",
                    title: "7. Notes",
                    elements: [
                        {
                            title: "",
                            // field: "info.project",
                            type: "text",
                            display: {
                                defaultLayout: "vertical",
                            },
                            text: `Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                            Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown
                            printer took a galley of type and scrambled it to make a type specimen book. It has survived not
                            only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
                            It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages,
                            and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`
                        },
                    ]
                },
                {
                    id: "qc-info",
                    title: "8. QC info",
                    elements: [
                        {
                            title: "",
                            display: {
                                defaultLayout: "vertical",
                            },
                            // field: "info.project",
                            defaultValue: "'Coverage metrics'"
                        },
                        {
                            title: "",
                            display: {
                                defaultLayout: "vertical",
                            },
                            // field: "info.project",
                            defaultValue: "'Coverage plots'"
                        },
                        {
                            title: "",
                            display: {
                                defaultLayout: "vertical",
                            },
                            // field: "info.project",
                            defaultValue: "'igv plots'"
                        },
                        {
                            title: "",
                            display: {
                                defaultLayout: "vertical",
                            },
                            // field: "info.project",
                            defaultValue: "'chromatogram view'"
                        },
                    ]
                },
                {
                    id: "disclaimer",
                    title: "9. Disclaimer",
                    elements: [
                        {
                            title: "",
                            // field: "info.project",
                            type: "text",
                            display: {
                                defaultLayout: "vertical",
                            },
                            text: `Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                            Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown
                            printer took a galley of type and scrambled it to make a type specimen book. It has survived not
                            only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
                            It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages,
                            and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`
                        },
                    ]
                },
                {
                    id: "appendix",
                    title: "Appendix",
                    elements: [
                        {
                            title: "Appendix 1",
                            // field: "info.project",
                            type: "text",
                            display: {
                                defaultLayout: "vertical",
                            },
                            text: `Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                            Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown
                            printer took a galley of type and scrambled it to make a type specimen book. It has survived not
                            only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
                            It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages,
                            and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`
                        },
                        {
                            title: "Appendix 2",
                            // field: "info.project",
                            type: "text",
                            display: {
                                defaultLayout: "vertical",
                            },
                            text: `Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                            Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown
                            printer took a galley of type and scrambled it to make a type specimen book. It has survived not
                            only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
                            It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages,
                            and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`
                        },
                    ]
                },
            ]
        };
    }

}

customElements.define("case-sms-report", CaseSmsReport);
