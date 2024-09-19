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
import "../interpretation/variant-interpreter-grid.js";
import "../interpretation/variant-interpreter-rearrangement-grid.js";
import "../../commons/forms/data-form.js";
import "../../commons/forms/select-field-filter.js";
import "../../commons/simple-chart.js";
import "../../loading-spinner.js";
import "../../file/file-preview.js";
import UtilsNew from "../../../core/utils-new.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";
import LitUtils from "../../commons/utils/lit-utils.js";

class SteinerReport extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
        this.#init();
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

    #init() {
        this.gridTypes = {
            snv: "variantInterpreterCancerSNV",
            cnv: "variantInterpreterCancerCNV",
            rearrangements: "variantInterpreterRearrangement",
        };

        this.callersInfo = {
            "caveman": {type: "Substitutions", group: "somatic", rank: 1},
            "pindel": {type: "Indels", group: "somatic", rank: 2},
            "brass": {type: "Rearrangements", group: "somatic", rank: 3},
            "ascat": {type: "Copy Number", group: "somatic", rank: 4},
            "strelka": {type: "Substitutions and Indels", group: "germline", rank: 1},
            "manta": {type: "Rearrangements", group: "germline", rank: 2},
        };

        this.stockPhrases = [
            "No pathogenic variants identified.",
            "Results related to other genetic conditions of medical significance (additional findings).",
            "Results that are not expected to impact participant health but may be relevant to family members or children.",
            "The quality of the data is sufficient for mutational signature analysis and to look for potential driver mutations.",
            "The data for this sample is below the quality required to perform WGS analysis.",
        ];

        this.somaticSample = null;
        this.germlineSample = null;

        this._data = null;
        // Data-form is not capturing the update of the data property
        // For that reason, we need this flag to check when the data is ready (TODO)
        this._ready = false;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }

        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
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
        this._ready = false;
        if (this.opencgaSession && this.clinicalAnalysis) {
            // We will assume that we always have a somatic and a germline sample
            // TODO: check if both samples exists
            this.somaticSample = this.clinicalAnalysis.proband?.samples.find(s => s.somatic);
            this.germlineSample = this.clinicalAnalysis.proband?.samples.find(s => !s.somatic);

            // Initialize report data
            this._data = {
                info: {
                    project: `${this.opencgaSession.project.name} (${this.opencgaSession.project.id})`,
                    study: `${this.opencgaSession.study.name} (${this.opencgaSession.study.id})`,
                    clinicalAnalysisId: this.clinicalAnalysis.id,
                    tumourId: this.somaticSample?.id || null,
                    germlineId: this.germlineSample?.id || null,
                    tumourType: "Ovarian", // TODO
                },
                // clinicalAnalysis: this.clinicalAnalysis,
                ascatMetrics: [],
                ascatPlots: [],
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
                // TODO decide what to do here
                // primaryFindings: this.clinicalAnalysis.interpretation.primaryFindings.filter(item => {
                //     return item.status.toUpperCase() === "REPORTED";
                // }),
                primaryFindings: this.clinicalAnalysis.interpretation.primaryFindings,
                analysts: (this.clinicalAnalysis.analysts || [])
                    .map(analyst=> analyst.name)
                    .join(", "),
                hrdetects: [],
                selectedHrdetect: this.clinicalAnalysis.attributes?.report?.selectedHrdetect || null,
                selectedSnvSignature: this.clinicalAnalysis.attributes?.report?.selectedSnvSignature || null,
                selectedSvSignature: this.clinicalAnalysis.attributes?.report?.selectedSvSignature || null,
                deletionAggreationCount: 0,
                deletionAggregationStats: null,
                qcPlots: {},
                overallText: this.clinicalAnalysis.attributes?.report?.overall || "",
                ascatInterpretation: this.clinicalAnalysis.attributes?.report?.ascatInterpretation || "",
                genomePlotInterpretation: this.clinicalAnalysis.attributes?.report?.genomePlotInterpretation ?? this.somaticSample?.qualityControl?.variant?.genomePlot?.description ?? "",
                results: this.clinicalAnalysis.attributes?.report?.results || "",
                discussion: this.clinicalAnalysis.attributes?.report?.discussion || "",
                status: this.clinicalAnalysis.status?.id || "",
                signedBy: this.clinicalAnalysis.attributes?.report?.signedBy || "",
                date: this.clinicalAnalysis.attributes?.report?.date || "",
            };

            const allPromises = [
                this.opencgaSession.opencgaClient.files().search({
                    sampleIds: [this.somaticSample.id, this.germlineSample.id].join(","),
                    limit: 100,
                    study: this.opencgaSession.study.fqn,
                }),
                this.opencgaSession.opencgaClient.samples().info(this.somaticSample.id, {
                    include: "annotationSets",
                    study: this.opencgaSession.study.fqn,
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
                    const statsFields = {tumour: this.somaticSample, normal: this.germlineSample};
                    Object.entries(statsFields).forEach(([field, sample]) => {
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
                        if (info?.group && info?.type && info?.rank) {
                            this._data[`${info.group}CallingInfo`].push({
                                type: info.type,
                                rank: info.rank,
                                ...file.software,
                            });
                        }
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

                    // Add QCPlots
                    if (this.somaticSample.qualityControl?.variant?.genomePlot?.file) {
                        this._data.qcPlots.genomePlotFile = this.somaticSample.qualityControl.variant.genomePlot.file;
                    }
                    if (this.somaticSample.qualityControl?.variant?.signatures?.length > 0) {
                        this._data.qcPlots.signatures = this.somaticSample.qualityControl.variant.signatures;
                    }
                    if (this.somaticSample?.qualityControl?.variant?.files?.length > 0) {
                        this._data.qcPlots.deletionAggregationStatsPlotFile = this.somaticSample.qualityControl.variant.files.findLast(file => {
                            return file.startsWith(`deletionAggregationStats:${this.somaticSample.id}`);
                        });
                    }

                    // Add HRDetect data
                    if (this.somaticSample.qualityControl?.variant?.hrDetects) {
                        this._data.hrdetects = this.somaticSample.qualityControl.variant.hrDetects;
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

    getGroupedClinicalAnalsysisStatus() {
        const statusList = this.opencgaSession?.study?.internal?.configuration?.clinical?.interpretation?.status || [];
        const groupedStatus = UtilsNew.groupBy(statusList, "type");
        return Object.keys(groupedStatus)
            .filter(type => ["ACTIVE", "DONE", "CLOSED"].includes(type))
            .map(type => {
                return {
                    id: type,
                    fields: groupedStatus[type],
                };
            });
    }

    onSignatureChange(event, type) {
        this.selectedSignatures[type] = event.detail.value;
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };

        this.requestUpdate();
    }

    onStockPhraseSelect(phrase) {
        const discussion = this._data.discussion || "";
        this._data = {
            ...this._data,
            discussion: discussion + (discussion === "" ? "" : "\n") + phrase + "\n",
        };
        this.requestUpdate();
    }

    onSave() {
        const clinicalAnalysisParams = {
            attributes: {
                ...(this.clinicalAnalysis.attributes || {}),
                report: {
                    overall: this._data.overallText || "",
                    ascatInterpretation: this._data.ascatInterpretation || "",
                    genomePlotInterpretation: this._data.genomePlotInterpretation || "",
                    results: this._data.results || "",
                    selectedSnvSignature: this._data.selectedSnvSignature || "",
                    selectedSvSignature: this._data.selectedSvSignature || "",
                    selectedHrdetect: this._data.selectedHrdetect || "",
                    discussion: this._data.discussion || "",
                    signedBy: this._data.signedBy || "",
                    date: this._data.date || "",
                },
            },
            status: {
                id: this._data.status,
            },
        };
        this.opencgaSession.opencgaClient.clinical()
            .update(this.clinicalAnalysis.id, clinicalAnalysisParams, {
                study: this.opencgaSession.study.fqn,
            })
            .then(() => {
                // Display a confirmation message
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    message: "The report has been saved.",
                });
                // Dispatch a clinicalAnalysisUpdate event
                LitUtils.dispatchCustomEvent(this, "clinicalAnalysisUpdate", null, {
                    clinicalAnalysisParams: this.clinicalAnalysis,
                });
            })
            .catch(error => {
                console.error(error);
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_ERROR, {
                    message: "Something went wrong saving report data. Please contact the administrator."
                });
            });
    }

    onFieldChange(event) {
        // Josemi Note 2024-04-26: we need to force a refresh only if user selects a value from the dropdowns displayed
        // on the Mutational Signatures section of the report
        const param = event?.detail?.param;
        if (param === "selectedSnvSignature" || param === "selectedSvSignature" || param === "selectedHrdetect") {
            this._data = {
                ...this._data,
            };
            this.requestUpdate();
        }
    }

    generateSignaturesDropdown(signatures, type) {
        return (signatures || [])
            .filter(signature => (signature?.type || "").toUpperCase() === type)
            .map(signature => ({
                id: signature.id,
                fields: (signature.fittings || []).map(fitting => ({
                    id: `${signature.id}::${fitting.id}`,
                    name: `${signature.id}  |  ${fitting.id}`,
                })),
            }));
    }

    renderSomaticVariantsGrid(variants, gridConfig) {
        if (variants.length === 0) {
            return html`No variants found in this category.`;
        }

        return html`
            <variant-interpreter-grid
                .opencgaSession="${this.opencgaSession}"
                .clinicalAnalysis="${this.clinicalAnalysis}"
                .clinicalVariants="${variants}"
                .query="${{sample: this.somaticSample?.id || ""}}"
                .review="${false}"
                .config="${gridConfig}">
            </variant-interpreter-grid>
        `;
    }

    renderSomaticRearrangementVariantsGrid(variants, gridConfig) {
        if (variants.length === 0) {
            return html`No variants found in this category.`;
        }

        return html`
            <variant-interpreter-rearrangement-grid
                .opencgaSession="${this.opencgaSession}"
                .clinicalAnalysis="${this.clinicalAnalysis}"
                .clinicalVariants="${variants}"
                .query="${{sample: this.somaticSample?.id || ""}}"
                .review="${false}"
                .config="${gridConfig}">
            </variant-interpreter-rearrangement-grid>
        `;
    }

    render() {
        if (!this.clinicalAnalysis || !this._ready) {
            return html`
                <loading-spinner></loading-spinner>
            `;
        }

        return html`
            <data-form
                .data="${this._data}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${this.onSave}">
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
        const SUBSTITUTIONS_AND_INDELS_TYPES = [
            "SNV",
            "MNV",
            "INDEL",
        ];
        const REARRANGEMENTS_TYPES = [
            "BREAKEND",
            "SV",
            "DUPLICATION",
            "TANDEM_DUPLICATION",
            "TRANSLOCATION",
            "DELETION",
            "INSERTION",
            "INVERSION",
        ];
        const COPY_NUMBER_TYPES = [
            "COPY_NUMBER",
            "COPY_NUMBER_GAIN",
            "COPY_NUMBER_LOSS",
        ];

        // Default grid config
        const defaultGridConfig = {
            pagination: true,
            pageSize: 10,
            pageList: [10, 25, 50],
            detailView: true,
            showReview: true,
            showEditReview: false,
            showActions: false,

            showExport: false,
            showSettings: false,
            showColumns: false,
            showDownload: false,

            showSelectCheckbox: false,
            multiSelection: false,
            nucleotideGenotype: true,
            alleleStringLengthMax: 10,

            renderLocal: false,

            quality: {
                qual: 30,
                dp: 20,
            },
            evidences: {
                showSelectCheckbox: false,
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
                buttonsAlign: "end",
                titleWidth: 3,
                titleVisible: true,
                titleStyle: "padding: 20px 5px",
                titleAlign: "left",
                defaultLayout: "horizontal",
                layout: [
                    {
                        id: "",
                        className: "row",
                        sections: [
                            {
                                id: "qc-metrics",
                                className: "col-md-8"
                            },
                            {
                                id: "case-info",
                                className: "col-md-4"
                            }
                        ]
                    },
                    {
                        id: "qc-metrics-plots",
                    },
                    {
                        id: "results",
                    },
                    {
                        id: "mutational-signatures",
                    },
                    {
                        id: "final-summary",
                    }
                ]
            },
            sections: [
                {
                    id: "case-info",
                    title: "Case Info",
                    display: {
                        style: "background-color: #f3f3f3; border-left: 3px solid #0c2f4c; margin: 16px 0px; padding: 24px",
                        titleWidth: 4,
                    },
                    elements: [
                        {
                            title: "Project",
                            field: "info.project",
                        },
                        {
                            title: "Study",
                            field: "info.study",
                        },
                        {
                            title: "Clinical analysis ID",
                            field: "info.clinicalAnalysisId",
                        },
                        {
                            title: "Tumour ID",
                            field: "info.tumourId",
                        },
                        {
                            title: "Germline ID",
                            field: "info.germlineId",
                        },
                        {
                            title: "Tumour type",
                            field: "info.tumourType",
                        },
                        {
                            title: "Genotyping check match and contamination",
                            field: "info.genotypingCheck",
                            defaultValue: "100% match (25/25 markers)",
                        },
                        {
                            title: "ASCAT Metrics",
                            field: "ascatMetrics",
                            type: "table",
                            display: {
                                style: "width:auto",
                                showHeader: false,
                                columns: [
                                    {
                                        field: "field",
                                        formatter: value => `<span style="font-weight:bold">${value}</span>`
                                    },
                                    {
                                        field: "value",
                                    },
                                ],
                            },
                        },
                    ],
                },
                {
                    id: "qc-metrics",
                    title: "1. QC Metrics",
                    display: {
                        titleWidth: 3,
                    },
                    elements: [
                        {
                            title: "Sequence metrics",
                            field: "sequenceMetrics",
                            type: "table",
                            display: {
                                style: "width:auto",
                                showHeader: false,
                                columns: [
                                    {field: "field"},
                                    {field: "value"},
                                ],
                            },
                        },
                        {
                            title: "Tumour",
                            field: "tumourStats",
                            type: "table",
                            display: {
                                style: "width:auto",
                                showHeader: false,
                                columns: [
                                    {field: "field"},
                                    {field: "value"},
                                ],
                            },
                        },
                        {
                            title: "Normal",
                            field: "normalStats",
                            type: "table",
                            display: {
                                style: "width:auto",
                                showHeader: false,
                                columns: [
                                    {field: "field"},
                                    {field: "value"},
                                ],
                            },
                        },
                        {
                            title: "Processing",
                            field: "processingInfo",
                            type: "table",
                            display: {
                                style: "width:auto",
                                showHeader: false,
                                columns: [
                                    {field: "field"},
                                    {field: "value"},
                                ],
                            },
                        },
                        {
                            title: "Somatic Calling",
                            field: "somaticCallingInfo",
                            type: "table",
                            display: {
                                style: "width:auto",
                                transform: somaticCallingInfo => somaticCallingInfo.sort((a, b) => {
                                    return a.rank - b.rank;
                                }),
                                showHeader: false,
                                columns: [
                                    {field: "type"},
                                    {field: "name"},
                                    {field: "version"},
                                ],
                            },
                        },
                        {
                            title: "Custom filtering",
                            field: "customFilteringInfo",
                            type: "table",
                            display: {
                                style: "width:auto",
                                transform: data => data.sort((a, b) => {
                                    return a.rank - b.rank;
                                }),
                                showHeader: false,
                                columns: [
                                    {field: "type"},
                                    {field: "caller"},
                                    {field: "filters"},
                                ],
                            },
                        },
                        {
                            title: "Germline Calling",
                            field: "germlineCallingInfo",
                            type: "table",
                            display: {
                                style: "width:auto",
                                transform: germlineCallingInfo => germlineCallingInfo.sort((a, b) => {
                                    return a.rank - b.rank;
                                }),
                                showHeader: false,
                                columns: [
                                    {field: "type"},
                                    {field: "name"},
                                    {field: "version"},
                                ],
                            },
                        },
                        {
                            title: "Overall",
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
                        titleWidth: 2,
                    },
                    elements: [
                        SEPARATOR,
                        {
                            title: "ASCAT Copy Number Plots",
                            field: "ascatPlots",
                            type: "custom",
                            display: {
                                render: images => images?.length > 0 ? html`
                                    <div class="row">
                                        <div class="col-md-5">
                                            <file-preview
                                                .active="${true}"
                                                .fileId="${images[0]}"
                                                .opencgaSession="${this.opencgaSession}"
                                                .config="${{showFileSize: false}}">
                                            </file-preview>
                                        </div>
                                        <div class="col-md-7">
                                            <file-preview
                                                .active="${true}"
                                                .fileId="${images[2]}"
                                                .opencgaSession="${this.opencgaSession}"
                                                .config="${{showFileSize: false}}">
                                            </file-preview>
                                            <file-preview
                                                .active="${true}"
                                                .fileId="${images[1]}"
                                                .opencgaSession="${this.opencgaSession}"
                                                .config="${{showFileSize: false}}">
                                            </file-preview>
                                        </div>
                                        <div class="col-md-12 d-block text-secondary" style="padding: 10px">
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
                            title: "ASCAT Plot Interpretation",
                            field: "ascatInterpretation",
                            type: "input-text",
                            display: {
                                rows: 3,
                            },
                        },
                        SEPARATOR,
                        {
                            title: "Genome Plot",
                            field: "qcPlots",
                            type: "custom",
                            display: {
                                defaultLayout: "vertical",
                                render: qcPlots => qcPlots ? html`
                                    <div class="row">
                                        <div class="col-md-6">
                                            <file-preview
                                                .active="${true}"
                                                .fileId="${qcPlots.genomePlotFile}"
                                                .opencgaSession="${this.opencgaSession}"
                                                .config="${{showFileSize: false, showFileTitle: false}}">
                                            </file-preview>
                                        </div>
                                        <div class="col-md-6">
                                            ${(qcPlots.signatures || []).some(s => s.type === "SNV") ? html`
                                                <signature-view
                                                    .signature="${qcPlots.signatures?.find(signature => signature.type === "SNV")}"
                                                    .mode="${"SBS"}">
                                                </signature-view>
                                            ` : null}
                                            ${(qcPlots.signatures || []).some(s => s.type === "SV") ? html`
                                                <signature-view
                                                    .signature="${qcPlots.signatures?.find(signature => signature.type === "SV")}"
                                                    .mode="${"SV"}">
                                                </signature-view>
                                            ` : null}
                                        </div>
                                        <div class="col-md-12 d-block text-secondary" style="padding: 10px">
                                            <p>
                                                Whole genome circos plot (left) depicting from outermost rings heading inwards:
                                                Karyotypic ideogram outermost. Base substitutions next, plotted as rainfall plots (log10
                                                inter-mutation distance on radial axis, dot colours: blue, C>A; black, C>G; red, C>T; grey, T>A;
                                                green, T>C; pink, T>G). Ring with short green lines, insertions; ring with short red lines, deletions.
                                                Major copy number allele ring (green, gain), minor copy number allele ring (red, loss).
                                                Structural rearrangements shown as central lines (green, tandem duplications; red, deletions;
                                                blue, inversions; grey, inter-chromosomal events). Top right, 96-trinucleotide substitution profile.
                                                Bottom right, structural rearrangement profile.
                                            </p>
                                        </div>
                                    </div>
                                ` : null,
                            }
                        },
                        {
                            title: "Genome plot interpretation",
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
                            title: "Driver mutations",
                            type: "title",
                            display: {
                                titleStyle: "font-size:20px;",
                            },
                        },
                        {
                            title: "Germline substitutions and indels",
                            type: "custom",
                            field: "primaryFindings",
                            display: {
                                defaultLayout: "vertical",
                                render: variants => {
                                    const filteredVariants = variants
                                        .filter(v => v.studies[0]?.samples[0]?.sampleId === this.germlineSample?.id)
                                        .filter(v => SUBSTITUTIONS_AND_INDELS_TYPES.indexOf(v.type) > -1);

                                    const gridConfig = {
                                        ...(this.opencgaSession?.user?.configs?.IVA?.settings?.[this.gridTypes.snv]?.grid || {}),
                                        ...defaultGridConfig,
                                        somatic: false,
                                        variantTypes: ["SNV", "INDEL", "INSERTION", "DELETION"],
                                    };

                                    return filteredVariants.length > 0 ? html`
                                        <variant-interpreter-grid
                                            .opencgaSession="${this.opencgaSession}"
                                            .clinicalAnalysis="${this.clinicalAnalysis}"
                                            .clinicalVariants="${filteredVariants}"
                                            .query="${{sample: this.germlineSample?.id || ""}}"
                                            .review="${false}"
                                            .config="${gridConfig}">
                                        </variant-interpreter-grid>
                                    `: null;
                                },
                                errorMessage: "No variants found in this category",
                            },
                        },
                        {
                            title: "Germline structural rearrangement drivers",
                            type: "custom",
                            field: "primaryFindings",
                            display: {
                                defaultLayout: "vertical",
                                render: variants => {
                                    const filteredVariants = variants
                                        .filter(v => v.studies[0]?.samples[0]?.sampleId === this.germlineSample?.id)
                                        .filter(v => REARRANGEMENTS_TYPES.indexOf(v.type) > -1);

                                    const gridConfig = {
                                        ...(this.opencgaSession?.user?.configs?.IVA?.settings?.[this.gridTypes.rearrangements]?.grid || {}),
                                        ...defaultGridConfig,
                                        somatic: false,
                                        variantTypes: ["BREAKEND"],
                                    };

                                    return filteredVariants.length > 0 ? html`
                                        <variant-interpreter-rearrangement-grid
                                            .opencgaSession="${this.opencgaSession}"
                                            .clinicalAnalysis="${this.clinicalAnalysis}"
                                            .clinicalVariants="${filteredVariants}"
                                            .query="${{sample: this.germlineSample?.id || ""}}"
                                            .review="${false}"
                                            .config="${gridConfig}">
                                        </variant-interpreter-rearrangement-grid>
                                    `: null;
                                },
                                errorMessage: "No variants found in this category",
                            },
                        },
                        {
                            title: "Somatic mutations",
                            type: "title",
                            display: {
                                titleStyle: "font-size:20px;",
                            },
                        },
                        {
                            title: "High-confidence (category 1) driver events in this tumour include:",
                            type: "title",
                            display: {
                                titleWidth: 8,
                                titleStyle: "font-size:18px",
                            },
                        },
                        {
                            title: "Substitutions and indels",
                            type: "custom",
                            field: "primaryFindings",
                            display: {
                                defaultLayout: "vertical",
                                render: variants => {
                                    const filteredVariants = variants
                                        .filter(v => v.studies[0]?.samples[0]?.sampleId === this.somaticSample?.id)
                                        .filter(v => SUBSTITUTIONS_AND_INDELS_TYPES.indexOf(v.type) > -1)
                                        .filter(v => v.confidence?.value === "HIGH");

                                    return this.renderSomaticVariantsGrid(filteredVariants, {
                                        ...(this.opencgaSession?.user?.configs?.IVA?.settings?.[this.gridTypes.snv]?.grid || {}),
                                        ...defaultGridConfig,
                                        somatic: true,
                                        variantTypes: ["SNV", "INDEL"],
                                    });
                                },
                                errorMessage: "No variants found in this category.",
                            },
                            defaultValue: "No variants found in this category",
                        },
                        {
                            title: "Structural rearrangements",
                            type: "custom",
                            field: "primaryFindings",
                            display: {
                                defaultLayout: "vertical",
                                render: variants => {
                                    const filteredVariants = variants
                                        .filter(v => v.studies[0]?.samples[0]?.sampleId === this.somaticSample?.id)
                                        .filter(v => REARRANGEMENTS_TYPES.indexOf(v.type) > -1)
                                        .filter(v => v.confidence?.value === "HIGH");

                                    return this.renderSomaticRearrangementVariantsGrid(filteredVariants, {
                                        ...(this.opencgaSession?.user?.configs?.IVA?.settings?.[this.gridTypes.rearrangements]?.grid || {}),
                                        ...defaultGridConfig,
                                        somatic: true,
                                        variantTypes: ["BREAKEND"],
                                    });
                                },
                                errorMessage: "No variants found in this category",
                            },
                            defaultValue: "No variants found in this category",
                        },
                        {
                            title: "Copy number",
                            type: "custom",
                            field: "primaryFindings",
                            display: {
                                defaultLayout: "vertical",
                                render: variants => {
                                    const filteredVariants = variants
                                        .filter(v => v.studies[0]?.samples[0]?.sampleId === this.somaticSample?.id)
                                        .filter(v => COPY_NUMBER_TYPES.indexOf(v.type) > -1)
                                        .filter(v => v.confidence?.value === "HIGH");

                                    return this.renderSomaticVariantsGrid(filteredVariants, {
                                        ...(this.opencgaSession?.user?.configs?.IVA?.settings?.[this.gridTypes.cnv]?.grid || {}),
                                        ...defaultGridConfig,
                                        somatic: true,
                                        variantTypes: ["COPY_NUMBER", "CNV"],
                                    });
                                },
                                errorMessage: "No variants found in this category",
                            },
                            defaultValue: "No variants found in this category",
                        },
                        {
                            title: "Variants of interest with lower confidence as drivers (category 2) in this tumour include:",
                            type: "title",
                            display: {
                                titleWidth: 8,
                                titleStyle: "font-size:18px",
                            },
                        },
                        {
                            title: "Substitutions and indels",
                            defaultValue: "No variants found in this category",
                            type: "custom",
                            field: "primaryFindings",
                            display: {
                                defaultLayout: "vertical",
                                render: variants => {
                                    const filteredVariants = variants
                                        .filter(v => v.studies[0]?.samples[0]?.sampleId === this.somaticSample?.id)
                                        .filter(v => SUBSTITUTIONS_AND_INDELS_TYPES.indexOf(v.type) > -1)
                                        .filter(v => !v.confidence?.value || v.confidence?.value !== "HIGH");

                                    return this.renderSomaticVariantsGrid(filteredVariants, {
                                        ...(this.opencgaSession?.user?.configs?.IVA?.settings?.[this.gridTypes.snv]?.grid || {}),
                                        ...defaultGridConfig,
                                        somatic: true,
                                        variantTypes: ["SNV", "INDEL"],
                                    });
                                },
                            }
                        },
                        {
                            title: "Structural rearrangements",
                            type: "custom",
                            field: "primaryFindings",
                            display: {
                                defaultLayout: "vertical",
                                render: variants => {
                                    const filteredVariants = variants
                                        .filter(v => v.studies[0]?.samples[0]?.sampleId === this.somaticSample?.id)
                                        .filter(v => REARRANGEMENTS_TYPES.indexOf(v.type) > -1)
                                        .filter(v => !v.confidence?.value || v.confidence?.value !== "HIGH");

                                    return this.renderSomaticRearrangementVariantsGrid(filteredVariants, {
                                        ...(this.opencgaSession?.user?.configs?.IVA?.settings?.[this.gridTypes.rearrangements]?.grid || {}),
                                        ...defaultGridConfig,
                                        somatic: true,
                                        variantTypes: ["BREAKEND"],
                                    });
                                },
                            }
                        },
                        {
                            title: "Copy number",
                            type: "custom",
                            field: "primaryFindings",
                            display: {
                                defaultLayout: "vertical",
                                render: variants => {
                                    const filteredVariants = variants
                                        .filter(v => v.studies[0]?.samples[0]?.sampleId === this.somaticSample?.id)
                                        .filter(v => COPY_NUMBER_TYPES.indexOf(v.type) > -1)
                                        .filter(v => !v.confidence?.value || v.confidence?.value !== "HIGH");

                                    return this.renderSomaticVariantsGrid(filteredVariants, {
                                        ...(this.opencgaSession?.user?.configs?.IVA?.settings?.[this.gridTypes.cnv]?.grid || {}),
                                        ...defaultGridConfig,
                                        somatic: true,
                                        variantTypes: ["COPY_NUMBER", "CNV"],
                                    });
                                },
                                errorMessage: "No variants found in this category",
                            },
                            defaultValue: "No variants found in this category",
                        },
                        {
                            title: "",
                            type: "custom",
                            display: {
                                render: () => html`
                                    <div class="d-block text-secondary">
                                        Variant Allele Fraction (VAF). Loss of Heterozygosity (LOH) (Chr, start position of segment,
                                        stop position of segment, total copy number, minor copy number).
                                    </div>
                                `,
                            },
                        },
                        {
                            title: "Results Interpretation",
                            type: "input-text",
                            field: "results",
                            display: {
                                rows: 5,
                                defaultValue: "",
                            },
                        },
                    ]
                },
                {
                    id: "mutational-signatures",
                    title: "3. Mutational Signatures",
                    elements: [
                        {
                            title: "Single base pair substitution signatures (SBS)",
                            type: "title",
                            display: {
                                titleStyle: "font-size:18px",
                            },
                        },
                        {
                            title: "",
                            type: "select",
                            field: "selectedSnvSignature",
                            allowedValues: data => {
                                return this.generateSignaturesDropdown(data.qcPlots.signatures, "SNV");
                            },
                        },
                        {
                            title: "",
                            type: "custom",
                            field: "selectedSnvSignature",
                            display: {
                                visible: data => !!data.selectedSnvSignature,
                                render: (selectedSnvSignature, onChange, updateParams, data) => {
                                    const [signatureId, fittingId] = selectedSnvSignature.split("::");
                                    const signature = (data.qcPlots?.signatures || []).find(s => signatureId === s.id);
                                    return html`
                                        <div class="row" style="padding: 20px">
                                            <div class="col-md-6">
                                                <h4>SBS Profile</h4>
                                                <signature-view
                                                    .signature="${signature}">
                                                </signature-view>
                                            </div>
                                            <div class="col-md-6">
                                                <h4>SBS signature contributions</h4>
                                                <signature-view
                                                    .signature="${signature}"
                                                    .fittingId="${fittingId}"
                                                    .plots="${["fitting"]}">
                                                </signature-view>
                                            </div>
                                        </div>
                                    `;
                                },
                            },
                        },
                        {
                            title: "Indel signatures",
                            type: "title",
                            display: {
                                titleStyle: "font-size:18px",
                            },
                        },
                        {
                            title: "",
                            type: "custom",
                            field: "qcPlots",
                            display: {
                                render: qcPlots => qcPlots?.deletionAggregationStatsPlotFile ? html`
                                    <div class="row" style="padding:20px;">
                                        <div class="col-md-6">
                                            <file-preview
                                                .active="${true}"
                                                .fileId="${qcPlots.deletionAggregationStatsPlotFile}"
                                                .opencgaSession="${this.opencgaSession}"
                                                .config="${{showFileTitle: false}}">
                                            </file-preview>
                                        </div>
                                    </div>
                                ` : "",
                            },
                        },
                        {
                            title: "Rearrangement signatures",
                            type: "title",
                            display: {
                                titleStyle: "font-size:18px",
                            },
                        },
                        {
                            title: "",
                            type: "select",
                            field: "selectedSvSignature",
                            allowedValues: data => {
                                return this.generateSignaturesDropdown(data.qcPlots.signatures, "SV");
                            },
                        },
                        {
                            title: "",
                            field: "selectedSvSignature",
                            type: "custom",
                            display: {
                                visible: data => !!data.selectedSvSignature,
                                render: (selectedSvSignature, onChange, updateParams, data) => {
                                    const [signatureId, fittingId] = selectedSvSignature.split("::");
                                    const signature = (data.qcPlots?.signatures || []).find(s => signatureId === s.id);
                                    return html`
                                        <div class="row" style="padding: 20px">
                                            <div class="col-md-6">
                                                <h4>Rearrangement Profile</h4>
                                                <signature-view
                                                    .signature="${signature}"
                                                    .mode="${"SV"}">
                                                </signature-view>
                                            </div>
                                            <div class="col-md-6">
                                                <h4>Rearrangement signature contributions</h4>
                                                <signature-view
                                                    .signature="${signature}"
                                                    .fittingId="${fittingId}"
                                                    .plots="${["fitting"]}"
                                                    .mode="${"SV"}">
                                                </signature-view>
                                            </div>
                                        </div>
                                    `;
                                },
                            },
                        },
                        {
                            title: "Downstream Algorithms",
                            type: "title",
                            display: {
                                titleStyle: "font-size:18px",
                            },
                        },
                        {
                            title: "HRDetect",
                            field: "selectedHrdetect",
                            type: "select",
                            allowedValues: data => {
                                return UtilsNew.sort(data.hrdetects.map(item => item.id));
                            },
                        },
                        {
                            title: "HRDetect Probability",
                            field: "selectedHrdetect",
                            type: "custom",
                            display: {
                                visible: data => !!data.selectedHrdetect,
                                defaultLayout: "horizontal",
                                render: (selectedHrdetect, onChange, updateParams, data) => {
                                    const hrdetect = data.hrdetects.find(hrdetect => hrdetect?.id === selectedHrdetect);
                                    return hrdetect?.scores?.["probability"] ?? hrdetect?.scores?.["Probability"] ?? "NA";
                                },
                            },
                        },
                    ]
                },
                {
                    id: "final-summary",
                    title: "4. Final Summary",
                    elements: [
                        {
                            title: "Case Status",
                            field: "status",
                            type: "select",
                            allowedValues: ["CLOSED", "REJECTED"],
                            required: true,
                        },
                        {
                            title: "Discussion",
                            type: "custom",
                            display: {
                                render: () => html`
                                    <select-field-filter
                                        .data="${[...this.stockPhrases]}"
                                        .value="${""}"
                                        @filterChange="${e => this.onStockPhraseSelect(e.detail.value)}">
                                    </select-field-filter>
                                `,
                            },
                        },
                        {
                            title: " ",
                            type: "input-text",
                            field: "discussion",
                            defaultValue: "",
                            display: {
                                rows: 10,
                            },
                        },
                        {
                            title: "Analysed by",
                            field: "analysts",
                        },
                        {
                            title: "Signed off by",
                            type: "input-text",
                            field: "signedBy",
                            defaultValue: "",
                        },
                        {
                            title: "Date",
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

}

customElements.define("steiner-report", SteinerReport);
