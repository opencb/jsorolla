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

import {LitElement, html} from "/web_modules/lit-element.js";
import UtilsNew from "../../../utilsNew.js";
import VariantGridFormatter from "../variant-grid-formatter.js";
import GridCommons from "../grid-commons.js";
import VariantUtils from "../variant-utils.js";
import "./opencga-interpretation-variant-review.js";
import "../../commons/opencb-grid-toolbar.js";
import "../../loading-spinner.js";


export default class VariantInterpreterGrid extends LitElement {

    constructor() {
        super();

        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            clinicalAnalysis: {
                type: Object
            },
            query: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        // Config for the grid toolbar
        this.toolbarConfig = {
            download: ["JSON"],
            columns: [
                {title: "Variant", field: "id"},
                {title: "Genes", field: "genes"},
                {title: "Type", field: "type"},
                {title: "Gene Annotations", field: "consequenceType"}
            ]
        };
        this.gridId = this._prefix + "VariantBrowserGrid";
        this.checkedVariants = new Map();
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
    }

    firstUpdated(_changedProperties) {
        this.downloadRefreshIcon = $("#" + this._prefix + "DownloadRefresh");
        this.downloadIcon = $("#" + this._prefix + "DownloadIcon");
        this.table = $("#" + this.gridId);
        // this.checkedVariants = new Map();
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }

        if (changedProperties.has("clinicalAnalysis") || changedProperties.has("query")) {
            this.opencgaSessionObserver();
            this.clinicalAnalysisObserver();
            this.renderVariants();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    opencgaSessionObserver() {
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.variantGridFormatter = new VariantGridFormatter(this.opencgaSession, this._config);
        this.gridCommons = new GridCommons(this.gridId, this, this._config);

        // FIXME Re-think this code
        const colors = this.variantGridFormatter.assignColors(consequenceTypes, proteinSubstitutionScore);
        Object.assign(this, colors);
    }

    clinicalAnalysisObserver() {
        // Make sure somatic sample is the first one
        if (this.clinicalAnalysis) {
            if (!this.clinicalAnalysis.interpretation) {
                this.clinicalAnalysis.interpretation = {};
            }

            this.checkedVariants = new Map();
            if (this.clinicalAnalysis?.interpretation?.primaryFindings?.length > 0) {
                for (let variant of this.clinicalAnalysis.interpretation.primaryFindings) {
                    this.checkedVariants.set(variant.id, variant);
                }
            } else {
                this.checkedVariants.clear();
            }
            // this.gridCommons.checkedRows = this.checkedVariants;

            if (this.clinicalAnalysis.type.toUpperCase() === "CANCER") {
                if (this.clinicalAnalysis.proband && this.clinicalAnalysis.proband.samples
                    && this.clinicalAnalysis.proband.samples.length === 2 && this.clinicalAnalysis.proband.samples[1].somatic) {
                    this.clinicalAnalysis.proband.samples = this.clinicalAnalysis.proband.samples.reverse();
                }
            }
        }
    }

    onColumnChange(e) {
        this.gridCommons.onColumnChange(e);
    }

    renderVariants() {
        if (this._config.renderLocal) {
            this.renderLocalVariants();
        } else {
            this.renderRemoteVariants();
        }
    }

    renderRemoteVariants() {
        if (!this.clinicalAnalysis || !this.clinicalAnalysis.interpretation || !this._config) {
            console.warn("clinicalAnalysis or interpretation do not exist");
            return;
        }

        if (!this.query?.sample) {
            console.warn("No sample found, query: ", this.query)
            return;
        }

        this.table = $("#" + this.gridId);
        if (this.opencgaSession && this.opencgaSession.project && this.opencgaSession.study) {
            this.table.bootstrapTable("destroy");
            this.table.bootstrapTable({
                columns: this._createDefaultColumns(),
                method: "get",
                sidePagination: "server",

                // Set table properties, these are read from config property
                uniqueId: "id",
                pagination: this._config.pagination,
                pageSize: this._config.pageSize,
                pageList: this._config.pageList,
                paginationVAlign: "both",
                formatShowingRows: this.gridCommons.formatShowingRows,
                showExport: this._config.showExport,
                detailView: this._config.detailView,
                detailFormatter: this.detailFormatter,
                formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",

                // this makes the opencga-interpreted-variant-grid properties available in the bootstrap-table formatters
                variantGrid: this,

                ajax: (params) => {
                    if (this.clinicalAnalysis.type.toUpperCase() === "FAMILY" && this.query?.sample) {
                        let samples = this.query.sample.split(";");
                        let sortedSamples = [];
                        for (let sample of samples) {
                            let sampleFields = sample.split(":");
                            if (sampleFields && sampleFields[0] === this.clinicalAnalysis.proband.samples[0].id) {
                                sortedSamples.unshift(sample);
                            } else {
                                sortedSamples.push(sample);
                            }
                        }
                        this.query.sample = sortedSamples.join(";");
                    }

                    let tableOptions = $(this.table).bootstrapTable("getOptions");
                    let filters = {
                        study: this.opencgaSession.study.fqn,
                        limit: params.data.limit || tableOptions.pageSize,
                        skip: params.data.offset || 0,
                        count: !tableOptions.pageNumber || tableOptions.pageNumber === 1,
                        includeSampleId: "true",
                        ...this.query
                    };

                    this.opencgaSession.opencgaClient.clinical().queryVariant(filters)
                        .then(res => {
                            console.log(res)
                            params.success(res);
                        })
                        .catch(e => {
                            console.error(e);
                            console.trace();
                            params.error(e);
                        });
                },
                responseHandler: response => {
                    const result = this.gridCommons.responseHandler(response, $(this.table).bootstrapTable("getOptions"));
                    return result.response;
                },
                onClickRow: (row, selectedElement, field) => this.gridCommons.onClickRow(row.id, row, selectedElement),
                onLoadSuccess: data => {
                    // We keep the table rows as global variable, needed to fetch the variant object when checked
                    this._rows = data.rows;
                    this.gridCommons.onLoadSuccess(data, 2);
                },
                onLoadError: (e, restResponse) => this.gridCommons.onLoadError(e, restResponse),
                onExpandRow: (index, row, $detail) => {
                    // Listen to Show/Hide link in the detail formatter consequence type table
                    document.getElementById(this._prefix + row.id + "ShowEvidence").addEventListener("click", this.variantGridFormatter.toggleDetailClinicalEvidence.bind(this));
                    document.getElementById(this._prefix + row.id + "HideEvidence").addEventListener("click", this.variantGridFormatter.toggleDetailClinicalEvidence.bind(this));

                    document.getElementById(this._prefix + row.id + "ShowCt").addEventListener("click", this.variantGridFormatter.toggleDetailConsequenceType.bind(this));
                    document.getElementById(this._prefix + row.id + "HideCt").addEventListener("click", this.variantGridFormatter.toggleDetailConsequenceType.bind(this));
                },
                onPostBody: (data) => {
                    this._onPostBody();
                }
            });
        }
    }

    renderLocalVariants() {
        if (!this.clinicalAnalysis.interpretation.primaryFindings) {
            return;
        }

        let _variants = this.clinicalAnalysis.interpretation.primaryFindings;

        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            data: _variants,
            columns: this._createDefaultColumns(),
            sidePagination: "local",

            // Set table properties, these are read from config property
            uniqueId: "id",
            pagination: this._config.pagination,
            pageSize: this._config.pageSize,
            pageList: this._config.pageList,
            paginationVAlign: "both",
            formatShowingRows: this.gridCommons.formatShowingRows,
            showExport: this._config.showExport,
            detailView: this._config.detailView,
            detailFormatter: this.detailFormatter,
            formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",

            // this makes the opencga-interpreted-variant-grid properties available in the bootstrap-table formatters
            variantGrid: this,

            onClickRow: (row, selectedElement, field) => this.gridCommons.onClickRow(row.id, row, selectedElement),
            onExpandRow: (index, row, $detail) => {
                // Listen to Show/Hide link in the detail formatter consequence type table
                document.getElementById(this._prefix + row.id + "ShowEvidence").addEventListener("click", this.variantGridFormatter.toggleDetailClinicalEvidence.bind(this));
                document.getElementById(this._prefix + row.id + "HideEvidence").addEventListener("click", this.variantGridFormatter.toggleDetailClinicalEvidence.bind(this));

                document.getElementById(this._prefix + row.id + "ShowCt").addEventListener("click", this.variantGridFormatter.toggleDetailConsequenceType.bind(this));
                document.getElementById(this._prefix + row.id + "HideCt").addEventListener("click", this.variantGridFormatter.toggleDetailConsequenceType.bind(this));
            },
            onPostBody: (data) => {
                // We call onLoadSuccess to select first row, this is only needed when rendering from local
                this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 2);

                this._onPostBody();
            }
        });
    }

    _onPostBody() {
        // Add tooltips
        if (this.variantGridFormatter) {
            // TODO remove the following lines and use UtilsNew.initTooltip
            this.variantGridFormatter.addTooltip("div.variant-tooltip", "Links");
            this.variantGridFormatter.addTooltip("span.gene-tooltip", "Links");
            this.variantGridFormatter.addTooltip("div.zygositySampleTooltip", "Variant Call Information", "", {style: {classes: "qtip-rounded qtip-shadow qtip-custom-class"}});
            this.variantGridFormatter.addPopulationFrequenciesTooltip("table.populationFrequenciesTable", populationFrequencies);
            this.variantGridFormatter.addPopulationFrequenciesInfoTooltip("span.pop-preq-info-icon", populationFrequencies);
            const predictionTooltipContent = "<span style='font-weight: bold'>Prediction</span> column shows the Clinical Significance prediction and Tier following the ACMG guide recommendations";
            this.variantGridFormatter.addTooltip("span.interpretation-info-icon", "Interpretation", predictionTooltipContent, {
                position: {my: "top right"},
                style: {classes: "qtip-rounded qtip-shadow qtip-custom-class"}
            });
            this.variantGridFormatter.addTooltip("div.predictionTooltip", "Classification", "", {
                position: {my: "top right"},
                style: {classes: "qtip-rounded qtip-shadow qtip-custom-class"},
                width: "360px"
            });
        }
    }

    onCheck(e) {
        let variantId = e.currentTarget.dataset.variantId;
        let variant = this._rows.find(e => e.id === variantId);

        if (e.currentTarget.checked) {
            this.checkedVariants.set(variantId, variant);
        } else {
            this.checkedVariants.delete(variantId);
        }

        this.dispatchEvent(new CustomEvent("checkrow", {
            detail: {
                id: variantId,
                row: variant,
                checked: e.currentTarget.checked,
                rows: Array.from(this.checkedVariants.values())
            }
        }));
    }

    onReviewClick(e) {
        // this.dispatchEvent(new CustomEvent('reviewvariant', {
        //     detail: {
        //         variant: e.currentTarget.dataset.variant
        //     }
        // }));

        if (this.checkedVariants) {
            this.variantReview = this.checkedVariants.get(e.currentTarget.dataset.variantId);
            $("#" + this._prefix + "ReviewSampleModal").modal("show");
        }
    }

    /*
     *  GRID FORMATTERS
     */
    detailFormatter(value, row, a) {
        let result = "<div class='row' style='padding-bottom: 20px'>";
        let detailHtml = "";
        if (row && row.annotation) {
            if (this.variantGrid.clinicalAnalysis.type.toUpperCase() !== "CANCER") {
                detailHtml = "<div style='padding: 10px 0px 5px 25px'><h4>Variant Allele Frequency</h4></div>";
                detailHtml += "<div style='padding: 5px 50px'>";
                detailHtml += this.variantGrid.variantGridFormatter.variantAlleleFrequencyDetailFormatter(value, row, this.variantGrid);
                detailHtml += "</div>";
            }

            detailHtml += "<div style='padding: 10px 0px 5px 25px'><h4>Clinical Mutation Evidence</h4></div>";
            detailHtml += "<div style='padding: 5px 50px'>";
            detailHtml += this.variantGrid.variantGridFormatter.reportedEventDetailFormatter(value, row, this.variantGrid, this.variantGrid.query, this.variantGrid._config);
            detailHtml += "</div>";

            detailHtml += "<div style='padding: 25px 0px 5px 25px'><h4>Consequence Types</h4></div>";
            detailHtml += "<div style='padding: 5px 50px'>";
            detailHtml += this.variantGrid.variantGridFormatter.consequenceTypeDetailFormatter(value, row, this.variantGrid, this.variantGrid.query, this.variantGrid._config);
            detailHtml += "</div>";

            detailHtml += "<div style='padding: 20px 0px 5px 25px'><h4>Clinical Phenotypes</h4></div>";
            detailHtml += "<div style='padding: 5px 50px'>";
            let clinvarTraits = "<div><label style='padding-right: 10px'>ClinVar: </label>-</div>";
            let cosmicTraits = "<div><label style='padding-right: 10px'>Cosmic: </label>-</div>";
            if (typeof row.annotation.traitAssociation !== "undefined" && row.annotation.traitAssociation != null) {
                const traits = {
                    clinvar: [],
                    cosmic: []
                };
                const fields = ["clinvar", "cosmic"];
                for (const field of fields) {
                    const clinicalData = row.annotation.traitAssociation[field];
                    if (UtilsNew.isNotEmptyArray(clinicalData)) {
                        for (let j = 0; j < clinicalData.length; j++) {
                            if (field === "clinvar" && traits.clinvar.indexOf(clinicalData[j].traits[0]) === -1 &&
                                clinicalData[j].traits[0] !== "not specified" && clinicalData[j].traits[0] !== "not provided") {
                                traits.clinvar.push(clinicalData[j].traits[0]);
                            } else if (field === "cosmic" && traits.cosmic.indexOf(clinicalData[j].primaryHistology) === -1) {
                                const histologySubtype = (UtilsNew.isNotEmpty(clinicalData[j].histologySubtype)) ? clinicalData[j].histologySubtype : "-";
                                traits.cosmic.push(clinicalData[j].primaryHistology + " (" + histologySubtype + ")");
                            }
                        }
                    }
                }

                if (traits.clinvar.length > 0) {
                    clinvarTraits = "<div><label style='padding-right: 10px'>ClinVar: </label>" + traits.clinvar.join(", ") + "</div>";
                }
                if (traits.cosmic.length > 0) {
                    cosmicTraits = "<div><label style='padding-right: 10px'>Cosmic: </label>" + traits.cosmic.join(", ") + "</div>";
                }
            }
            detailHtml += clinvarTraits + cosmicTraits;
            detailHtml += "</div>";
        }
        result += detailHtml + "</div>";
        return result;
    }

    variantFormatter(value, row, index) {
        const variantHtmlDiv = this.variantGridFormatter.variantFormatter(value, row, this._config);
        const snptHtmlAnchor = this.variantGridFormatter.snpFormatter(value, row, index);
        return `${variantHtmlDiv}<div style='padding-top: 10px'>${snptHtmlAnchor && snptHtmlAnchor !== "-" ? snptHtmlAnchor : ""}</div>`;
    }

    roleInCancerFormatter(value, row, index) {
        if (value) {
            let roles = new Set();
            for (let evidenceIndex in value) {
                let evidence = value[evidenceIndex];
                if (evidence.roleInCancer && evidence.genomicFeature.geneName) {
                    let roleInCancer = evidence.roleInCancer === "TUMOUR_SUPPRESSOR_GENE" || evidence.roleInCancer === "TUMOR_SUPPRESSOR_GENE" ? "TSG" : evidence.roleInCancer;
                    roles.add(`${roleInCancer} (${evidence.genomicFeature.geneName})`);
                }
            }
            if (roles.size > 0) {
                return Array.from(roles.keys()).join("<br>");
            }
        }
        return "-";
    }

    zygosityFormatter(value, row, index) {
        let resultHtml = "";

        if (row.studies?.length > 0 && row.studies[0].samples?.length > 0) {
            const sampleId = this.field.sampleId;
            const sampleIndex = row.studies[0].samples.findIndex(s => s.sampleId === sampleId);

            let sampleEntries = [row.studies[0].samples[sampleIndex]];

            // Check if there are any DISCREPANCY issue for this sample and add it to the calls to be displayed
            if (row.studies[0]?.issues?.length > 0) {
                const sampleIssues = row.studies[0].issues.filter(e => e.sample.sampleId === sampleId && e.type === "DISCREPANCY");
                sampleEntries = sampleEntries.concat(sampleIssues.map(e => e.sample));
            }

            for (let sampleEntry of sampleEntries) {
                // FIRST, get and check info fields QUAL, FILTER; and format fields DP, AD and GQ
                let filter = "-";
                let qual = "-";
                let originalCall = "";
                let mutationColor = "black";
                let noCallColor = "rgba(255, 0, 0, 0.5)";
                const sampleFormat = sampleEntry.data;

                let file;
                if (row.studies[0].files) {
                    let fileIdx = sampleEntry?.fileIndex ?? 0;
                    if (fileIdx >= 0) {
                        file = row.studies[0].files[fileIdx];
                    }
                }

                // INFO fields
                const infoFields = [];
                if (file && file.data) {
                    filter = file.data.FILTER;
                    qual = Number(file.data.QUAL).toFixed(2);
                    originalCall = file.call?.variantId ? file.call.variantId : `${row.chromosome}:${row.position}:${row.reference}:${row.alternate}`;

                    if (filter !== "PASS" || qual < this.field.quality.qual) {
                        mutationColor = "silver";
                    }

                    for (let key of Object.keys(file.data)) {
                        if (key !== "FILTER" && key !== "QUAL") {
                            const html = `<div class="form-group" style="margin: 2px 2px">
                                            <label class="col-md-5">${key}</label>
                                            <div class="col-md-7">${file.data[key]}</div>
                                          </div>`;
                            infoFields.push(html);
                        }
                    }
                } else {
                    // This can happen when no ref/ref calls are loaded
                    console.warn("file is undefined");
                }

                // FORMAT fields
                const formatFields = [];
                for (const formatField in row.studies[0].sampleDataKeys) {
                    // GT fields is treated separately
                    let key = row.studies[0].sampleDataKeys[formatField];
                    key = key !== "GT" ? key : `${key} (${row.reference || "-"}/${row.alternate || "-"})`;
                    let value = sampleFormat[formatField] ? sampleFormat[formatField] : "-";
                    const html = `<div class="form-group" style="margin: 2px 2px">
                                                <label class="col-md-5">${key}</label>
                                                <div class="col-md-7">${value}</div>
                                            </div>`;
                    formatFields.push(html);
                }

                // SECONDARY ALTERNATES fields
                const secondaryAlternates = [];
                for (const v of row.studies[0].secondaryAlternates) {
                    const html = `<div class="form-group" style="margin: 2px 2px">
                                    <label class="col-md-5">${v.chromosome}:${v.start}-${v.end}</label>
                                    <div class="col-md-7">${v.reference}/${v.alternate} ${v.type}</div>
                                  </div>`;
                    secondaryAlternates.push(html);
                }

                const tooltipText = `<div class="" style="padding: 5px">
                                        <form class="form-horizontal">
                                            <div class="form-group" style="margin: 2px 2px">
                                                <label class="col-md-12" style="color: darkgray;padding: 10px 0px 5px 0px">SUMMARY</label>
                                            </div>
                                            <div class="form-group" style="margin: 2px 2px">
                                                <label class="col-md-5">Sample ID</label>
                                                <div class="col-md-7">${sampleId ? sampleId : "-"}</div>
                                            </div>
                                            <div class="form-group" style="margin: 2px 2px">
                                                <label class="col-md-5">File Name</label>
                                                <div class="col-md-7">${file && file.fileId ? file.fileId : "-"}</div>
                                            </div>
                                            <div class="form-group" style="margin: 2px 2px">
                                                <label class="col-md-5">File FILTER</label>
                                                <div class="col-md-7">${filter}</div>
                                            </div>
                                            <div class="form-group" style="margin: 2px 2px">
                                                <label class="col-md-5">File QUAL</label>
                                                <div class="col-md-7">${qual}</div>
                                            </div>
                                            <div class="form-group" style="margin: 2px 2px">
                                                <label class="col-md-5">File VCF call</label>
                                                <div class="col-md-7">${originalCall}</div>
                                            </div>
                                            <div class="form-group" style="margin: 2px 2px">
                                                <label class="col-md-12" style="color: darkgray;padding: 10px 0px 5px 0px">SAMPLE DATA</label>
                                            </div>
                                            ${formatFields.join("")}
                                            <div class="form-group" style="margin: 2px 2px">
                                                <label class="col-md-12" style="color: darkgray;padding: 10px 0px 5px 0px">FILE INFO</label>
                                            </div>
                                            ${infoFields.join("")}
                                            <div class="form-group" style="margin: 2px 2px">
                                                <label class="col-md-12" style="color: darkgray;padding: 10px 0px 5px 0px">SECONDARY ALTERNATES</label>
                                            </div>
                                            ${secondaryAlternates && secondaryAlternates.length > 0 
                                                ? secondaryAlternates.join("") 
                                                : `<div class="form-group" style="margin: 2px 2px">
                                                        <label class="col-md-12">-</label>
                                                   </div>`
                                            }
                                        </form>
                                     </div>`;

                // SECOND, prepare the visual representation of genotypes
                let left;
                let right;
                let leftRadio = 8;
                let rightRadio = 8;
                const genotypeSplitRegExp = new RegExp("[/|]");
                let sampleGT;
                // Make sure we always render somatic sample first

                if (this.field.clinicalAnalysis.type.toUpperCase() === "SINGLE" || this.field.clinicalAnalysis.type.toUpperCase() === "FAMILY") {
                    sampleGT = sampleEntry.data[0];
                } else {
                    // FIXME check GT exists in sampleDataKeys to avoid issues with somatic VAF
                    if (row.studies[0].samples.length === 2) {
                        sampleGT = sampleEntry.data[0];
                    } else {
                        sampleGT = sampleEntry.data[0];
                    }
                }

                switch (sampleGT) {
                    case "./.":
                    case "?/?":
                    case "NA":
                        left = noCallColor;
                        right = noCallColor;
                        break;
                    case "0|1":
                    case "1|0":
                        left = "white";
                        right = mutationColor;
                        break;
                    default:
                        const alleles = sampleGT.split(genotypeSplitRegExp);
                        switch (alleles[0]) {
                            case "0":
                                left = "white";
                                break;
                            case ".":
                                left = noCallColor;
                                break;
                            default:
                                left = mutationColor;
                                break;
                        }
                        switch (alleles[1]) {
                            case "0":
                                right = "white";
                                break;
                            case ".":
                                right = noCallColor;
                                break;
                            default:
                                right = mutationColor;
                                break;
                        }
                        break;
                }

                // THIRD, render genotypes
                if (this.field.config.genotype.type === "bar") {
                    let af, ad, dp;
                    let afIndex, adIndex, dpIndex;
                    let refFreq, altFreq;
                    // let altFreqs = [];

                    // Find and get the DP
                    dpIndex = row.studies[0].sampleDataKeys.findIndex(e => e === "DP");
                    if (dpIndex === -1) {
                        dp = file ? file.DP : null;
                    } else {
                        dp = Number.parseInt(sampleFormat[dpIndex]);
                    }

                    // Get Allele Frequencies
                    adIndex = row.studies[0].sampleDataKeys.findIndex(e => e === "AD");
                    if (adIndex !== -1) {
                        ad = sampleFormat[adIndex];
                        let adCounts = ad.split(",");
                        if (!dp && adCounts.length > 1) {
                            dp = Number.parseInt(adCounts[0]) + Number.parseInt(adCounts[1]);
                        }
                        if (dp > 0) {
                            refFreq = Number.parseInt(adCounts[0]) / dp;
                            altFreq = Number.parseInt(adCounts[1]) / dp;
                        }
                    } else {
                        // In cancer data AF has just one single value for the ALT
                        afIndex = row.studies[0].sampleDataKeys.findIndex(e => e === "AF");
                        if (afIndex !== -1) {
                            af = Number.parseFloat(sampleFormat[afIndex]);
                            refFreq = 1 - af;
                            altFreq = af;
                        }
                    }

                    if (refFreq >= 0 && altFreq >= 0) {
                        let widthPx = 80;
                        let refWidth = Math.max(widthPx * refFreq, 1);
                        let refColor = refFreq !== 0 ? "blue" : "black";
                        let altWidth = widthPx - refWidth;
                        let altColor = altFreq !== 0 ? "red" : "black";
                        let opacity = file?.data?.FILTER === "PASS" ? 100 : 50;
                        resultHtml += `<div class="zygositySampleTooltip" data-tooltip-text='${tooltipText}' align="center">
                                        <table style="width: ${widthPx}px">
                                            <tr>
                                                <td style="width: ${refWidth}px; background-color: ${refColor}; border-right: 1px solid white; opacity: ${opacity}%">&nbsp;</td>
                                                <td style="width: ${altWidth}px; background-color: ${altColor}; border-right: 1px solid white; opacity: ${opacity}%">&nbsp;</td>
                                            </tr>
                                    `;
                        resultHtml += `</table></div>`;
                    } else {
                        // Just in case we cannot render freqs, this should never happen.
                        resultHtml += `
                            <div class='zygositySampleTooltip' data-tooltip-text='${tooltipText}' style="width: 70px" align="center">
                                <svg viewBox="0 0 70 30" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="20" cy="15" r="${leftRadio}" style="stroke: black;fill: ${left}"/>
                                    <circle cx="50" cy="15" r="${rightRadio}" style="stroke: black;fill: ${right}"/>
                                </svg>
                            </div>`;
                    }
                } else {
                    resultHtml += `
                        <div class='zygositySampleTooltip' data-tooltip-text='${tooltipText}' style="width: 70px" align="center">
                            <svg viewBox="0 0 70 30" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="20" cy="15" r="${leftRadio}" style="stroke: black;fill: ${left}"/>
                                <circle cx="50" cy="15" r="${rightRadio}" style="stroke: black;fill: ${right}"/>
                            </svg>
                        </div>`;
                }
            }
        }

        return resultHtml;
    }

    vcfDataFormatter(value, row, index) {
        if (this.field.vcfColumn === "info") {
            for (let file of row.studies[0].files) {
                if (file.data[this.field.key]) {
                    return file.data[this.field.key];
                }
            }
        } else {
            let sampleIndex = row.studies[0].samples.findIndex(sample => sample.sampleId === this.field.sample.id);
            let index = row.studies[0].sampleDataKeys.findIndex(key => key === this.field.key);
            if (index >= 0) {
                return row.studies[0].samples[sampleIndex].data[index];
            } else {
                return "-";
            }
        }
    }

    pathogeniticyFormatter(value, row, index) {
        // TODO we must call to PathDB to get the frequency of each variant, next code is just an example
        const val = `<div class="col-md-12" style="padding: 0px">
                                <form class="form-horizontal">
                                    <div class="col-md-12" style="padding: 0px">
                                        <form class="form-horizontal">
                                            <div class="form-group" style="margin: 0px 2px">
                                                <label class="col-md-5">HP:00${Math.floor((Math.random() * 1000) + 1)}</label>
                                                <div class="col-md-7">${Number(Math.random()).toFixed(2)}</div>
                                            </div>
                                             <div class="form-group" style="margin: 0px 2px">
                                                <label class="col-md-5">HP:00${Math.floor((Math.random() * 1000) + 1)}</label>
                                                <div class="col-md-7">${Number(Math.random()).toFixed(2)}</div>
                                             </div>
                                         </form>
                                      </div>
                                </form>
                           </div>`;

        return val;
    }

    studyCohortsFormatter(value, row) {
        //console.log("value, row",value, row)
        if (typeof row !== "undefined" && typeof row.studies !== "undefined" && this.variantGridFormatter) {
            const cohorts = [];
            const cohortMap = new Map();
            for (const study of row.studies) {
                const arr = study.studyId.split(":");
                const s = arr[arr.length - 1] + ":ALL";
                cohorts.push(s);
                cohortMap.set(s, study.stats.length ? Number(study.stats[0].altAlleleFreq).toFixed(4) : "-");
            }

            return this.variantGridFormatter.createPopulationFrequenciesTable(cohorts, cohortMap, populationFrequencies?.style);
        } else {
            return "-";
        }
    }

    clinicalPopulationFrequenciesFormatter(value, row) {
        if (typeof row !== "undefined" && typeof row.annotation !== "undefined") {
            const popFreqMap = new Map();
            if (UtilsNew.isNotEmptyArray(row.annotation.populationFrequencies)) {
                for (const popFreq of row.annotation.populationFrequencies) {
                    popFreqMap.set(popFreq.study + ":" + popFreq.population, Number(popFreq.altAlleleFreq).toFixed(4));
                }
            }
            return this.variantGridFormatter.createPopulationFrequenciesTable(this._config.populationFrequencies, popFreqMap, populationFrequencies.style);
        } else {
            return "-";
        }
    }

    predictionFormatter(value, row, index) {
        if (!row.evidences) {
            return "-";
        }

        const clinicalSignificanceCodes = {
            BENIGN: {code: 5, color: "blue"},
            LIKELY_BENIGN: {code: 5, color: "blue"},
            UNCERTAIN_SIGNIFICANCE: {code: 5, color: "darkorange"},
            LIKELY_PATHOGENIC: {code: 5, color: "red"},
            PATHOGENIC: {code: 5, color: "red"},
            NOT_ASSESSED: {code: 5, color: "black"},
        };

        let clinicalSignificanceCode = 0;
        let clinicalSignificanceHtml = "NA";
        let clinicalSignificanceTooltipText = "";
        const modeOfInheritances = [];

        for (const re of row.evidences) {
            if (re.modeOfInheritance && !modeOfInheritances.includes(re.modeOfInheritance)) {
                modeOfInheritances.push(re.modeOfInheritance);
            }

            if (clinicalSignificanceCodes[re.classification.clinicalSignificance] && clinicalSignificanceCodes[re.classification.clinicalSignificance].code > clinicalSignificanceCode) {
                clinicalSignificanceCode = clinicalSignificanceCodes[re.classification.clinicalSignificance].code;
                let clinicalSignificance = re.classification.clinicalSignificance.replace("_", " ");
                clinicalSignificanceHtml = `<span style="color: ${clinicalSignificanceCodes[re.classification.clinicalSignificance].color}">${clinicalSignificance}</span>`;
                clinicalSignificanceTooltipText = `<div class="col-md-12 predictionTooltip-inner" style="padding: 0px">
                                                        <form class="form-horizontal">
                                                            <div class="form-group" style="margin: 0px 2px">
                                                                <label class="col-md-5">ACMG</label>
                                                                <div class="col-md-7">${re.classification.acmg.join(", ")}</div>
                                                            </div>
                                                            <div class="form-group" style="margin: 0px 2px">
                                                                <label class="col-md-5">ACMG Tier</label>
                                                                <div class="col-md-7">${re.classification.tier}</div>
                                                            </div>
                                                        </form>
                                                   </div>`;
            }
        }
        return `<div class='predictionTooltip' data-tooltip-text='${clinicalSignificanceTooltipText}'>
                    ${clinicalSignificanceHtml}
                </div>`;
    }

    checkFormatter(value, row, index) {
        let checked = "";
        if (this.checkedVariants && this.checkedVariants.has(row.id)) {
            checked = "checked";
        }
        return `<input class="Check check-variant" type="checkbox" data-variant-id="${row.id}" ${checked}>`;
    }

    reviewFormatter(value, row, index) {
        return `<button class="btn btn-link reviewButton" data-variant-id="${row.id}">
                    <i class="fa fa-edit icon-padding reviewButton" aria-hidden="true" ></i>&nbsp;Edit
                </button>`;
    }

    _createDefaultColumns() {
        if (this.variantGridFormatter === undefined) {
            return;
        }

        // This prepares the configured columns with VCF Data
        let vcfDataColumns = [];
        if (this._config.vcf && this.clinicalAnalysis.type.toUpperCase() === "CANCER") {
            if (this._config.vcf.info?.length > 0 ) {
                for (let i = 0; i < this._config.vcf.info.length; i++) {
                    vcfDataColumns.push({
                        title: this._config.vcf.info[i],
                        field: {
                            vcfColumn: "info",
                            key: this._config.vcf.info[i]
                        },
                        rowspan: 1,
                        colspan: 1,
                        formatter: this.vcfDataFormatter,
                        halign: "center"
                    });
                }
            }
            if (this._config.vcf.format?.length > 0) {
                for (let i = 0; i < this._config.vcf.format.length; i++) {
                    vcfDataColumns.push({
                        title: this._config.vcf.format[i],
                        field: {
                            vcfColumn: "format",
                            sample: samples[0],
                            key: this._config.vcf.format[i]
                        },
                        rowspan: 1,
                        colspan: 1,
                        formatter: this.vcfDataFormatter,
                        halign: "center"
                    });
                }
            }
        }

        let _columns = [
            [
                {
                    title: "Variant",
                    field: "id",
                    rowspan: 2,
                    colspan: 1,
                    formatter: this.variantFormatter.bind(this),
                    halign: "center",
                    sortable: true
                },
                {
                    title: "Genes",
                    field: "genes",
                    rowspan: 2,
                    colspan: 1,
                    formatter: this.variantGridFormatter.geneFormatter.bind(this),
                    halign: "center"
                },
                {
                    title: "Type",
                    field: "type",
                    rowspan: 2,
                    colspan: 1,
                    formatter: this.variantGridFormatter.typeFormatter.bind(this),
                    halign: "center"
                },
                {
                    title: "Gene Annotation",
                    field: "consequenceType",
                    rowspan: 2,
                    colspan: 1,
                    formatter: this.variantGridFormatter.consequenceTypeFormatter.bind(this),
                    halign: "center"
                },
                {
                    title: "Role in Cancer",
                    field: "evidences",
                    rowspan: 2,
                    colspan: 1,
                    formatter: this.roleInCancerFormatter.bind(this),
                    halign: "center",
                    visible: this.clinicalAnalysis.type.toUpperCase() === "CANCER"
                },
                {
                    title: "VCF Data",
                    rowspan: 1,
                    colspan: vcfDataColumns?.length,
                    halign: "center",
                    visible: vcfDataColumns?.length > 0
                },
                {
                    title: "Variant Allele Frequency <span class='pop-preq-info-icon'><i class='fa fa-info-circle' style='color: #337ab7' aria-hidden='true'></i></span>",
                    field: "frequencies",
                    rowspan: 1,
                    colspan: 2,
                    align: "center"
                },
                {
                    title: "Clinical",
                    rowspan: 1,
                    colspan: 2,
                    align: "center"
                },
                {
                    title: "Interpretation <span class='interpretation-info-icon'><i class='fa fa-info-circle' style='color: #337ab7' aria-hidden='true'></i></span>",
                    field: "interpretation",
                    rowspan: 1,
                    colspan: 2,
                    halign: "center"
                },
                {
                    title: "Review",
                    rowspan: 2,
                    colspan: 1,
                    formatter: this.reviewFormatter.bind(this),
                    align: "center",
                    events: {
                        "click button": this.onReviewClick.bind(this)
                    },
                    visible: this._config.showReview
                },
                {
                    title: "Actions",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => `
                        <div class="dropdown">
                            <button class="btn btn-default btn-small ripple dropdown-toggle one-line" type="button" data-toggle="dropdown">Select action
                                <span class="caret"></span>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-right">
                                <li>
                                    <a href="javascript: void 0" class="btn force-text-left" data-action="download">
                                        <i class="fas fa-download icon-padding" aria-hidden="true"></i> Download
                                    </a>
                                </li>
                                <li role="separator" class="divider"></li>
                                <li>
                                    <a href="javascript: void 0" class="btn force-text-left reviewButton" data-variant-id="${row.id} data-action="edit">
                                        <i class="fas fa-edit icon-padding reviewButton" aria-hidden="true"></i> Edit
                                    </a>
                                </li>
                                <li>
                                    <a href="javascript: void 0" class="btn disabled force-text-left" data-action="remove">
                                        <i class="fas fa-trash icon-padding" aria-hidden="true"></i> Remove
                                    </a>
                                </li>
                            </ul>
                        </div>`,
                    align: "center",
                    events: {
                        "click a": this.onActionClick.bind(this)
                    },
                    visible: this._config.showActions && !this._config?.columns?.hidden?.includes("actions")
                }
            ],
            [
                ...vcfDataColumns,
                {
                    title: "Cohorts",
                    field: "cohort",
                    colspan: 1,
                    rowspan: 1,
                    formatter: this.studyCohortsFormatter.bind(this),
                    visible: this.clinicalAnalysis.type.toUpperCase() === "SINGLE" || this.clinicalAnalysis.type.toUpperCase() === "FAMILY"
                },
                {
                    title: "Population Frequencies",
                    field: "populationFrequencies",
                    colspan: 1,
                    rowspan: 1,
                    formatter: this.clinicalPopulationFrequenciesFormatter.bind(this)
                },
                {
                    title: "ClinVar",
                    field: "clinvar",
                    colspan: 1,
                    rowspan: 1,
                    formatter: this.variantGridFormatter.clinicalPhenotypeFormatter,
                    align: "center"
                },
                {
                    title: "Cosmic",
                    field: "cosmic",
                    colspan: 1,
                    rowspan: 1,
                    formatter: this.variantGridFormatter.clinicalPhenotypeFormatter,
                    align: "center"
                },
                {
                    title: "Prediction",
                    field: "prediction",
                    rowspan: 1,
                    colspan: 1,
                    formatter: this.predictionFormatter,
                    halign: "center",
                    visible: this.clinicalAnalysis.type.toUpperCase() === "SINGLE" || this.clinicalAnalysis.type.toUpperCase() === "FAMILY"
                },
                {
                    title: "Select",
                    rowspan: 1,
                    colspan: 1,
                    formatter: this.checkFormatter.bind(this),
                    align: "center",
                    events: {
                        "click input": this.onCheck.bind(this)
                    },
                    visible: this._config.showSelectCheckbox
                },
            ]
        ];

        // update columns dynamically
        this._updateTableColumns(_columns);
        return _columns;
    }

    _updateTableColumns(_columns) {
        if (!_columns) {
            return;
        }

        if (this.clinicalAnalysis && (this.clinicalAnalysis.type.toUpperCase() === "SINGLE" || this.clinicalAnalysis.type.toUpperCase() === "FAMILY")) {
            // Add Samples
            let samples = [];
            let sampleInfo = {};
            if (this.clinicalAnalysis.family && this.clinicalAnalysis.family.members) {
                for (const member of this.clinicalAnalysis.family.members) {
                    if (member.samples && member.samples.length > 0) {
                        // Proband must tbe the first column
                        if (member.id === this.clinicalAnalysis.proband.id) {
                            samples.unshift(member.samples[0]);
                        } else {
                            samples.push(member.samples[0]);
                        }
                        sampleInfo[member.samples[0].id] = {
                            proband: member.id === this.clinicalAnalysis.proband.id,
                            affected: member.disorders && member.disorders.length > 0 && member.disorders[0].id === this.clinicalAnalysis.disorder.id,
                            role: this.clinicalAnalysis.family?.roles[this.clinicalAnalysis.proband.id][member.id]?.toLowerCase(),
                            sex: member.sex
                        };
                    }
                }
            } else {
                if (this.clinicalAnalysis.proband && this.clinicalAnalysis.proband.samples) {
                    samples.push(this.clinicalAnalysis.proband.samples[0]);
                    sampleInfo[this.clinicalAnalysis.proband.samples[0].id] = {
                        proband: true,
                        affected: this.clinicalAnalysis.proband.disorders && this.clinicalAnalysis.proband.disorders.length > 0,
                        role: "proband",
                        sex: this.clinicalAnalysis.proband.sex
                    };
                }
            }

            if (samples.length > 0) {
                _columns[0].splice(4, 0, {
                    title: "Sample Genotypes",
                    field: "zygosity",
                    rowspan: 1,
                    colspan: samples.length,
                    align: "center"
                });

                for (let i = 0; i < samples.length; i++) {
                    let color = "black";
                    if (sampleInfo[samples[i].id].proband) {
                        color = "darkred";
                        if (UtilsNew.isEmpty(sampleInfo[samples[i].id].role)) {
                            sampleInfo[samples[i].id].role = "proband";
                        }
                    }

                    let affected = "<span>UnAff.</span>";
                    if (sampleInfo[samples[i].id].affected) {
                        affected = "<span style='color: red'>Aff.</span>";
                    }

                    _columns[1].splice(i, 0, {
                        title: `<span style="color: ${color}">${samples[i].id}</span>
                                <br>
                                <span style="font-style: italic">${sampleInfo[samples[i].id].role}, ${affected}</span>`,
                        field: {
                            memberIdx: i,
                            memberName: samples[i].id,
                            sampleId: samples[i].id,
                            quality: this._config.quality,
                            clinicalAnalysis: this.clinicalAnalysis,
                            config: this._config
                        },
                        rowspan: 1,
                        colspan: 1,
                        formatter: this.zygosityFormatter,
                        align: "center",
                        nucleotideGenotype: true
                    });
                }
            }
        }

        if (this.clinicalAnalysis && this.clinicalAnalysis.type.toUpperCase() === "CANCER") {
            // Add sample columns
            let samples = null;
            if (this.clinicalAnalysis.proband && this.clinicalAnalysis.proband.samples) {
                // We only render somatic sample
                if (this.query && this.query.sample) {
                    samples = [];
                    let _sampleGenotypes = this.query.sample.split(";");
                    for (let sampleGenotype of _sampleGenotypes) {
                        let sampleId = sampleGenotype.split(":")[0];
                        samples.push(this.clinicalAnalysis.proband.samples.find(s => s.id === sampleId));
                    }
                } else {
                    samples = this.clinicalAnalysis.proband.samples.filter(s => s.somatic);
                }

                _columns[0].splice(5, 0, {
                    title: `Sample Genotypes`,
                    rowspan: 1,
                    colspan: samples.length,
                    align: "center"
                });
                for (let i = 0; i < samples.length; i++) {
                    let sample = samples[i];
                    let color = sample?.somatic ? "darkred" : "black";

                    _columns[1].splice(i, 0, {
                        title: `<span>${sample.id}</span><br>
                                <span style="color: ${color};font-style: italic">${sample?.somatic ? "somatic" : "germline"}</span>`,
                        field: {
                            sampleId: sample.id,
                            quality: this._config.quality,
                            config: this._config,
                            clinicalAnalysis: this.clinicalAnalysis
                        },
                        rowspan: 1,
                        colspan: 1,
                        formatter: this.zygosityFormatter,
                        align: "center",
                        nucleotideGenotype: true
                    });
                }
            }
        }
    }

    onActionClick(e, value, row) {
        console.log(e, value, row);
        const {action} = e.target.dataset;
        if (action === "download") {
            UtilsNew.downloadData([JSON.stringify(row, null, "\t")], row.id + ".json");
        }
    }

    // TODO fix tab jsonToTabConvert isn't working!
    onDownload(e) {
        console.log("onDownload interpreter-grid");
        //this.downloadRefreshIcon.css("display", "inline-block");
        //this.downloadIcon.css("display", "none");


        if (this.clinicalAnalysis.type.toUpperCase() === "FAMILY" && this.query?.sample) {
            let samples = this.query.sample.split(";");
            let sortedSamples = [];
            for (let sample of samples) {
                let sampleFields = sample.split(":");
                if (sampleFields && sampleFields[0] === this.clinicalAnalysis.proband.samples[0].id) {
                    sortedSamples.unshift(sample);
                } else {
                    sortedSamples.push(sample);
                }
            }
            this.query.sample = sortedSamples.join(";");
        }

        let filters = {
            study: this.opencgaSession.study.fqn,
            limit: 1000,
            count: false,
            includeSampleId: "true",
            ...this.query
        };
        this.opencgaSession.opencgaClient.clinical().queryVariant(filters)
            .then(restResponse => {
                const result = restResponse.getResults();
                let dataString = [];
                let mimeType = "";
                let extension = "";

                // Check if user clicked in Tab or JSON format
                if (e.detail.option.toLowerCase() === "tab") {
                    dataString = VariantUtils.jsonToTabConvert(result, populationFrequencies.studies, this.samples, this._config.nucleotideGenotype);
                    console.log("dataString", dataString);
                    mimeType = "text/plain";
                    extension = ".txt";
                } else {
                    for (const res of result) {
                        dataString.push(JSON.stringify(res));
                    }
                    mimeType = "application/json";
                    extension = ".json";
                }

                // Build file and anchor link
                const data = new Blob([dataString.join("\n")], {type: mimeType});
                const file = window.URL.createObjectURL(data);
                const a = document.createElement("a");
                a.href = file;
                a.download = this.opencgaSession.study.alias + extension;
                document.body.appendChild(a);
                a.click();
                setTimeout(function () {
                    document.body.removeChild(a);
                }, 0);


            })
            .catch(e => {
                console.error(e);
            });
    }

    onShare() {
        const _this = this;
        $("[data-toggle=popover]").popover({
            content: function () {
                const getUrlQueryParams = _this._getUrlQueryParams();
                const query = ["limit=1000"];
                for (const key in getUrlQueryParams.queryParams) {
                    // Check sid has a proper value. For public projects sid is undefined. In that case, sid must be removed from the url
                    if (key === "sid" && getUrlQueryParams.queryParams[key] === undefined) {
                        delete getUrlQueryParams.queryParams["sid"];
                    } else {
                        query.push(key + "=" + getUrlQueryParams.queryParams[key]);
                    }
                }
                return getUrlQueryParams.host + "?" + query.join("&");
            }
        }).on("show.bs.popover", function () {
            $(this).data("bs.popover").tip().css("max-width", "none");
        });
    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 10,
            pageList: [10, 25, 50],
            showExport: false,
            detailView: true,
            showReview: false,
            showSelectCheckbox: true,
            showActions: false,
            multiSelection: false,
            nucleotideGenotype: true,
            alleleStringLengthMax: 10,

            genotype: {
                type: "circle"
            },
            header: {
                horizontalAlign: "center",
                verticalAlign: "bottom"
            },

            quality: {
                qual: 30,
                dp: 20
            },
            populationFrequencies: ["1kG_phase3:ALL", "GNOMAD_GENOMES:ALL", "GNOMAD_EXOMES:ALL", "UK10K:ALL", "GONL:ALL", "ESP6500:ALL", "EXAC:ALL"],

            consequenceType: {
                gencodeBasic: true,
                filterByBiotype: true,
                filterByConsequenceType: true,
            },

            vcf: {
                info: ["DP", "ASMD", "TG", "QUAL", "REP"],
                format: []
            }
        };
    }

    showLoading() {
        $("#" + this.gridId).bootstrapTable("showLoading");
    }

    render() {
        return html`
            <style>
                .variant-link-dropdown:hover .dropdown-menu {
                    display: block;
                }
                .qtip-custom-class {
                    font-size: 13px;
                    max-width: none;
                }
                .check-variant {
                    transform: scale(1.2);
                }
            </style>
    
            <opencb-grid-toolbar .config="${this.toolbarConfig}"
                                 @columnChange="${this.onColumnChange}"
                                 @download="${this.onDownload}"
                                 @sharelink="${this.onShare}">
            </opencb-grid-toolbar>
    
            <div id="${this._prefix}GridTableDiv" class="force-overflow">
                <table id="${this._prefix}VariantBrowserGrid"></table>
            </div>
            
            <div class="modal fade" id="${this._prefix}ReviewSampleModal" data-backdrop="static" data-keyboard="false" tabindex="-1"
                 role="dialog" aria-hidden="true" style="padding-top:0; overflow-y: visible">
                <div class="modal-dialog" style="width: 768px">
                    <div class="modal-content">
                        <div class="modal-header" style="padding: 5px 15px">
                            <h3>Review Variant</h3>
                        </div>
                        <opencga-interpretation-variant-review .opencgaSession="${this.opencgaSession}"
                                                               .variant="${this.variantReview}">
                        </opencga-interpretation-variant-review>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" data-dismiss="modal">OK</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("variant-interpreter-grid", VariantInterpreterGrid);
