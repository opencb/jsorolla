
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
            consequenceTypes: {
                type: Object
            },
            populationFrequencies: {
                type: Object
            },
            proteinSubstitutionScores: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "ovig-" + UtilsNew.randomString(6) + "_";

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
        this.table = this.querySelector("#" + this.gridId);
    }

    firstUpdated(_changedProperties) {
        this.downloadRefreshIcon = $("#" + this._prefix + "DownloadRefresh");
        this.downloadIcon = $("#" + this._prefix + "DownloadIcon");
        // this.table = this.querySelector("#" + this.gridId);
        // this.checkedVariants = new Map();
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        // if (changedProperties.has("clinicalAnalysis")) {
        //     this.clinicalAnalysisObserver();
        // }
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
        const colors = this.variantGridFormatter.assignColors(this.consequenceTypes, this.proteinSubstitutionScores);
        Object.assign(this, colors);
    }

    clinicalAnalysisObserver() {
        // Make sure somatic sample is the first one
        if (this.clinicalAnalysis) {
            if (!this.clinicalAnalysis.interpretation) {
                this.clinicalAnalysis.interpretation = {};
            }

            // if (this.clinicalAnalysis.type.toUpperCase() === "FAMILY") {
            //     if (!this.query?.sample) {
            //         let sampleGenotypes = [];
            //         for (let member of this.clinicalAnalysis.family.members) {
            //             if (member.samples && member.samples.length > 0) {
            //                 sampleGenotypes.push(member.samples[0].id + ":0/1,1/1")
            //             }
            //         }
            //         if (!this.query) {
            //             this.query = {};
            //         }
            //         this.query.sample = sampleGenotypes.join(";");
            //         this.requestUpdate();
            //     }
            // }

            if (this.clinicalAnalysis.type.toUpperCase() === "CANCER") {
                if (this.clinicalAnalysis.proband && this.clinicalAnalysis.proband.samples
                    && this.clinicalAnalysis.proband.samples.length === 2 && this.clinicalAnalysis.proband.samples[1].somatic) {
                    this.clinicalAnalysis.proband.samples = this.clinicalAnalysis.proband.samples.reverse();
                }
            }
        }
    }

    onColumnChange(e) {
        const table = $("#" + this._prefix + "VariantBrowserGrid");
        if (e.detail.selected) {
            table.bootstrapTable("showColumn", e.detail.id);
        } else {
            table.bootstrapTable("hideColumn", e.detail.id);
        }
    }

    renderVariants() {
        if (this._config.renderLocal) {
            this.renderLocalVariants();
        } else {
            this.renderRemoteVariants();
        }
    }

    renderRemoteVariants() {
        if (this.clinicalAnalysis && this._timestamp && this.clinicalAnalysis.interpretation
            && this.clinicalAnalysis.interpretation.modificationDate === this._timestamp) {
            return;
        }

        if (!this.query?.sample) {
            return;
        }

        this.from = 1;
        this.to = this._config.pageSize;
        this.approximateCountResult = false;

        this.table = $("#" + this.gridId);
        if (this.opencgaSession && this.opencgaSession.project && this.opencgaSession.study) {
            const _this = this;
            this.table.bootstrapTable("destroy");
            this.table.bootstrapTable({
                columns: this._createDefaultColumns(),
                method: "get",
                sidePagination: "server",

                // Set table properties, these are read from config property
                uniqueId: "id",
                pagination: _this._config.pagination,
                pageSize: _this._config.pageSize,
                pageList: _this._config.pageList,
                paginationVAlign: "both",
                formatShowingRows: this.gridCommons.formatShowingRows,
                showExport: _this._config.showExport,
                detailView: _this._config.detailView,
                detailFormatter: _this.detailFormatter,
                formatLoadingMessage: () =>"<div><loading-spinner></loading-spinner></div>",

                // this makes the opencga-interpreted-variant-grid properties available in the bootstrap-table formatters
                variantGrid: _this,

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
                    // if (this.clinicalAnalysis.type.toUpperCase() === "SINGLE") {
                    //     filters.sample = this.clinicalAnalysis.proband.samples[0].id;
                    // }
                    this.opencgaSession.opencgaClient.clinical().queryVariant(filters)
                        .then(res => {
                            params.success(res);
                        })
                        .catch( e => {
                        console.error(e);
                        params.error(e);
                    });
                },
                responseHandler: response => {
                    const result = this.gridCommons.responseHandler(response, $(this.table).bootstrapTable("getOptions"));
                    this.from = result.from || this.from;
                    this.to = result.to || this.to;
                    this.numTotalResultsText = result.numTotalResultsText;
                    this.approximateCountResult = result.approximateCountResult;
                    this.requestUpdate();
                    return result.response;
                },
                onClickRow: (row, selectedElement, field) => this.gridCommons.onClickRow(row.id, row, selectedElement),
                onCheck: (row, $element) => {
                    this.checkedVariants.set(row.id, row);
                    this._timestamp = new Date().getTime();
                    this.gridCommons.onCheck(row.id, row, {rows: Array.from(this.checkedVariants.values()), timestamp: this._timestamp});
                },
                onCheckAll: rows => {
                    for (let row of rows) {
                        this.checkedVariants.set(row.id, row);
                    }
                    this._timestamp = new Date().getTime();
                    this.gridCommons.onCheckAll(rows, {rows: Array.from(this.checkedVariants.values()), timestamp: this._timestamp});
                },
                onUncheck: (row, $element) => {
                    this.checkedVariants.delete(row.id);
                    this._timestamp = new Date().getTime();
                    this.gridCommons.onUncheck(row.id, row, {rows: Array.from(this.checkedVariants.values()), timestamp: this._timestamp});
                },
                onUncheckAll: rows => {
                    for (let row of rows) {
                        this.checkedVariants.delete(row.id);
                    }
                    this._timestamp = new Date().getTime();
                    this.gridCommons.onCheckAll(rows, {rows: Array.from(this.checkedVariants.values()), timestamp: this._timestamp});
                },
                onLoadSuccess: data => {
                    for (let i = 0; i < data.rows.length; i++) {
                        if (this.checkedVariants.has(data.rows[i].id)) {
                            $(this.table).bootstrapTable('check', i);
                        }
                    }
                    this.gridCommons.onLoadSuccess(data, 2);
                },
                onLoadError: (e, restResponse) => this.gridCommons.onLoadError(e, restResponse),
                onPageChange: (page, size) => {
                    this.from = (page - 1) * size + 1;
                    this.to = page * size;
                },
                onPostBody: function(data) {
                    _this._onPostBody();
                }
            });
        }
    }

    renderLocalVariants() {
        if (!this.clinicalAnalysis.interpretation.primaryFindings) {
            return;
        }

        let _variants = this.clinicalAnalysis.interpretation.primaryFindings;
        this.from = 1;
        this.to = Math.min(_variants.length, this._config.pageSize);
        this.numTotalResultsText = _variants.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        const _this = this;
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            data: _variants,
            columns: _this._createDefaultColumns(),
            sidePagination: "local",

            // Set table properties, these are read from config property
            uniqueId: "id",
            pagination: _this._config.pagination,
            pageSize: _this._config.pageSize,
            pageList: _this._config.pageList,
            showExport: _this._config.showExport,
            detailView: _this._config.detailView,
            detailFormatter: _this.detailFormatter,
            formatLoadingMessage: () =>"<div><loading-spinner></loading-spinner></div>",

            // this makes the opencga-interpreted-variant-grid properties available in the bootstrap-table formatters
            variantGrid: _this,

            onClickRow: (row, selectedElement, field) => this.gridCommons.onClickRow(row.id, row, selectedElement),
            onPageChange: function(page, size) {
                // _this.from = (page - 1) * size + 1;
                // _this.to = page * size;
            },
            onPostBody: function(data) {
                // We call onLoadSuccess to select first row
                _this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 2);
                _this._onPostBody();
            }
        });
    }

    _onPostBody() {
        // Add review button listener
        const reviewButtons = document.querySelectorAll(".reviewButton");
        for (let i = 0; i < reviewButtons.length; i++) {
            reviewButtons[i].addEventListener("click", this.onReviewClick.bind(this));
        }

        // Add tooltips
        if (this.variantGridFormatter) {
            // TODO remove the following lines and use UtilsNew.initTooltip
            this.variantGridFormatter.addTooltip("div.variant-tooltip", "Links");
            this.variantGridFormatter.addTooltip("span.gene-tooltip", "Links");
            this.variantGridFormatter.addTooltip("div.zygositySampleTooltip", "File metrics", "", {style: {classes: "qtip-rounded qtip-shadow qtip-custom-class"}});
            this.variantGridFormatter.addPopulationFrequenciesTooltip("table.populationFrequenciesTable", this.populationFrequencies);
            this.variantGridFormatter.addPopulationFrequenciesInfoTooltip("span.pop-preq-info-icon", this.populationFrequencies);
            const predictionTooltipContent = "<span style='font-weight: bold'>Prediction</span> column shows the Clinical Significance prediction and Tier following the ACMG guide recommendations";
            this.variantGridFormatter.addTooltip("span.interpretation-info-icon", "Interpretation", predictionTooltipContent, {position: {my: "top right"}, style: {classes: "qtip-rounded qtip-shadow qtip-custom-class"}});
            this.variantGridFormatter.addTooltip("div.predictionTooltip", "Classification", "", {position: {my: "top right"}, style: {classes: "qtip-rounded qtip-shadow qtip-custom-class"}, width: "360px"});
        }
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

    showGene(geneName) {
        this.dispatchEvent(new CustomEvent("selected", {
            detail: {
                gene: geneName
            }
        }));
    }

    /*
     *  GRID FORMATTERS
     */
    detailFormatter(value, row, a) {
        let result = "<div class='row' style='padding-bottom: 20px'>";
        let detailHtml = "";
        if (typeof row !== "undefined" && typeof row.annotation !== "undefined") {
            detailHtml = "<div style='padding: 10px 0px 5px 25px'><h4>Clinical Mutation Evidence</h4></div>";
            detailHtml += "<div style='padding: 5px 50px'>";
            detailHtml += this.variantGrid.variantGridFormatter.reportedEventDetailFormatter(value, row, this.variantGrid);
            detailHtml += "</div>";

            detailHtml += "<div style='padding: 25px 0px 5px 25px'><h4>Consequence Types</h4></div>";
            detailHtml += "<div style='padding: 5px 50px'>";
            detailHtml += this.variantGrid.variantGridFormatter.consequenceTypeDetailFormatter(value, row, this.variantGrid);
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

        if (UtilsNew.isNotEmptyArray(row.studies)) {
            if (UtilsNew.isNotUndefinedOrNull(row.studies[0].samples)) {
                let sampleIndex = row.studies[0].samples[0].sampleId === this.field.sampleId ? 0 : 1;

                // First, get and check info fields QUAL, FILTER; and format fields DP, AD and GQ
                let qual = "-";
                let filter = "-";
                let mutationColor = "black";
                const sampleFormat = row.studies[0].samples[sampleIndex].data;

                // INFO fields
                if (row.studies[0].files) {
                    let fileIdx = row.studies[0].samples[sampleIndex].fileIndex;
                    let file = row.studies[0].files[fileIdx];

                    if (file && file.data) {
                        qual = Number(file.data.QUAL).toFixed(2);
                        if (qual < this.field.quality.qual) {
                            mutationColor = "silver";
                        }

                        filter = file.data.FILTER;
                        if (filter !== "PASS") {
                            mutationColor = "silver";
                        }
                    } else {
                        // This can happen when no ref/ref calls are loaded
                        console.warn("file is undefined");
                    }
                }

                // FORMAT fields
                const formatFields = [];
                for (const formatField in row.studies[0].sampleDataKeys) {
                    // GT fields is treated separately
                    if (row.studies[0].sampleDataKeys[formatField] !== "GT") {
                        const html = `<div class="form-group" style="margin: 0px 2px">
                                            <label class="col-md-5">${row.studies[0].sampleDataKeys[formatField]}</label>
                                            <div class="col-md-7">${sampleFormat[formatField]}</div>
                                        </div>`;
                        formatFields.push(html);
                    }
                }

                // Second, prepare the visual representation of genotypes
                let left;
                let right;
                let leftRadio = 8;
                let rightRadio = 8;
                const genotypeSplitRegExp = new RegExp("[/|]");
                let sampleGT;
                // Make sure we always render somatic sample first

                if (this.field.clinicalAnalysis.type.toUpperCase() === "SINGLE" || this.field.clinicalAnalysis.type.toUpperCase() === "FAMILY") {
                    sampleGT = row.studies[0].samples[this.field.memberIdx].data[0];
                } else {
                    // FIXME check GT exists in sampleDataKeys to avoid issues with somatic VAF
                    if (row.studies[0].samples.length === 2) {
                        sampleGT = row.studies[0].samples[sampleIndex].data[0];
                    } else {
                        sampleGT = row.studies[0].samples[0].data[0];
                    }
                }
                if (sampleGT === "0/1" || sampleGT === "1/0") {
                    // If genotype si 0/1 or 1/0 they must be displayed like 0/1 (not phased)
                    left = "white";
                    right = mutationColor;
                } else {
                    const genotypes = sampleGT.split(genotypeSplitRegExp);
                    switch (genotypes[0]) {
                        case "0":
                            left = "white";
                            break;
                        case "1":
                            left = mutationColor;
                            break;
                        case ".":
                            left = "red";
                            leftRadio = 1;
                            break;
                    }
                    switch (genotypes[1]) {
                        case "0":
                            right = "white";
                            break;
                        case "1":
                            right = mutationColor;
                            break;
                        case ".":
                            right = "red";
                            rightRadio = 1;
                            break;
                    }
                }

                // Third, prepare the tooltip information
                const tooltipText = `<div class="col-md-12 zygosity-formatter" style="padding: 0px">
                                                <form class="form-horizontal">
                                                    <div class="form-group" style="margin: 0px 2px">
                                                        <label class="col-md-5">GT</label>
                                                        <div class="col-md-7">${sampleGT}</div>
                                                    </div>
                                                    <div class="form-group" style="margin: 0px 2px">
                                                        <label class="col-md-5">QUAL</label>
                                                        <div class="col-md-7">${qual}</div>
                                                    </div>
                                                    <div class="form-group" style="margin: 0px 2px">
                                                        <label class="col-md-5">FILTER</label>
                                                        <div class="col-md-7">${filter}</div>
                                                    </div>
                                                    ${formatFields.join("")}
                                                </form>
                                           </div>`;

                // Last, put everything together and display
                resultHtml = `<div class='zygositySampleTooltip' data-tooltip-text='${tooltipText}' style="width: 70px" align="center">
                                        <svg viewBox="0 0 70 30" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="20" cy="15" r="${leftRadio}" style="stroke: black;fill: ${left}"/>
                                            <circle cx="50" cy="15" r="${rightRadio}" style="stroke: black;fill: ${right}"/>
                                        </svg>
                                      </div>
                                `;
            }
        }

        return resultHtml;
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

            return this.variantGridFormatter.createPopulationFrequenciesTable(cohorts, cohortMap, this.populationFrequencies?.style);
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
            return this.variantGridFormatter.createPopulationFrequenciesTable(this._config.populationFrequencies, popFreqMap, this.populationFrequencies.style);
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
                clinicalSignificanceTooltipText = `<div class="col-md-12" style="padding: 0px">
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

    // checkFormatter(value, row, index) {
    //
    // }

    reviewFormatter(value, row, index) {
        return `<button class="btn btn-link reviewButton" data-variant-id="${row.id}">
                    <i class="fa fa-edit icon-padding reviewButton" aria-hidden="true" ></i>&nbsp;Edit
                </button>`;
    }

    _createDefaultColumns() {
        if (this.variantGridFormatter === undefined) {
            return;
        }

        let _columns = [
            [
                {
                    title: "Variant",
                    field: "id",
                    rowspan: 2,
                    colspan: 1,
                    // formatter: this.variantGridFormatter.variantFormatter.bind(this),
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
                    title: "Variant Stats <span class='pop-preq-info-icon'><i class='fa fa-info-circle' style='color: #337ab7' aria-hidden='true'></i></span>",
                    field: "frequencies",
                    rowspan: 1,
                    colspan: 1,
                    align: "center"
                },
                {
                    title: "Clinical",
                    rowspan: 1,
                    colspan: 2,
                    align: "center"
                },
            ],
            [
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
                    halign: "center"
                }
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

        // Add a checkbox column
        _columns[0].push(
            {
                title: "Interpretation <span class='interpretation-info-icon'><i class='fa fa-info-circle' style='color: #337ab7' aria-hidden='true'></i></span>",
                field: "interpretation",
                rowspan: 1,
                colspan: this._config.showSelectCheckbox ? 2 : 1,
                halign: "center"
        });
        if (this._config.showSelectCheckbox) {
            _columns[1].push({
                // field: "stateCheckBox",
                checkbox: true,
                rowspan: 1,
                colspan: 1,
                // formatter: this.checkFormatter.bind(this),
            });
        }

        if (this._config.showReview) {
            // _columns[1].push({
            //     title: "Status",
            //     field: "status",
            //     rowspan: 1,
            //     colspan: 1
            // });
            _columns[0].push({
                title: "Review",
                // field: "status",
                rowspan: 2,
                colspan: 1,
                formatter: this.reviewFormatter.bind(this),
                align: "center"
            });
        }

        if (this.clinicalAnalysis && (this.clinicalAnalysis.type.toUpperCase() === "SINGLE" || this.clinicalAnalysis.type.toUpperCase() === "FAMILY")) {
            // Add Cohort to Variant Stats
            _columns[0][4].colspan = 2;
            _columns[1].splice(0, 0,
                {
                    title: "Cohorts",
                    field: "cohort",
                    colspan: 1,
                    rowspan: 1,
                    formatter: this.studyCohortsFormatter.bind(this)
                }
            );

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
                            role: this.clinicalAnalysis.roleToProband[member.id].toLowerCase(),
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

        if (this.clinicalAnalysis && this.clinicalAnalysis.type.toUpperCase() === "CANCER") {
            // Add cancer columns
            _columns[0].splice(4, 0,
                {
                    title: "Role in Cancer",
                    field: "evidences",
                    rowspan: 2,
                    colspan: 1,
                    formatter: this.roleInCancerFormatter.bind(this),
                    halign: "center"
                }
            );

            // Add sample columns
            if (this.clinicalAnalysis.proband && this.clinicalAnalysis.proband.samples) {
                _columns[0].splice(5, 0, {
                    title: `Sample Genotypes (${this.clinicalAnalysis.proband.id})`,
                    rowspan: 1,
                    colspan: this.clinicalAnalysis.proband.samples.length,
                    align: "center"
                });

                for (let i = 0; i < this.clinicalAnalysis.proband.samples.length; i++) {
                    let sample = this.clinicalAnalysis.proband.samples[i];
                    let color = sample.somatic ? "darkred" : "black";

                    _columns[1].splice(i, 0, {
                        title: `<span>${sample.id}</span><br>
                            <span style="color: ${color};font-style: italic">${sample.somatic ? "somatic" : "germline"}</span>`,
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
        if (this._config.showActions) {
            _columns[0].push( {
                title: "Actions",
                rowspan: 2,
                formatter: `
                    <div class="dropdown ">
                        <button class="btn btn-default btn-small ripple dropdown-toggle one-line" type="button" data-toggle="dropdown">Select action
                        <span class="caret"></span></button>
                        <ul class="dropdown-menu dropdown-menu-right">
                            <li><a href="javascript: void 0" class="btn disabled force-text-left" data-action="remove">Remove from selection</a></li>
                            <li><a href="javascript: void 0" class="btn disabled force-text-left" data-action="download">Download</a></li>
                            <li><a href="javascript: void 0" class="btn disabled force-text-left" data-action="edit">Edit</a></li>
                        </ul>
                    </div>`,
                valign: "middle",
                /*events: {
                    "click li": this.onActionClick.bind(this)
                },*/
                visible: !this._config?.columns?.hidden?.includes("actions")
            });
        }
    }

    onActionClick(e, value, row) {
        console.log(e, value, row);
        const action = e.target.dataset.action;
        //console.log("action", action)
        if (action === "delete") {
            Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Yes, delete it!"
            }).then(result => {
                if (result.value) {
                    const clinicalAnalysisId = row.id;
                    this.opencgaSession.opencgaClient.clinical().delete(clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                        .then( restResponse => {
                            if (restResponse.getResultEvents("ERROR").length) {
                                Swal.fire({
                                    title: "Error",
                                    icon: "error",
                                    html: restResponse.getResultEvents("ERROR").map( event => event.message).join("<br>")
                                })
                            } else {
                                Swal.fire(
                                    "Deleted!",
                                    "Clinical Analysis has been deleted.",
                                    "success"
                                )
                                this.renderTable();
                            }
                        })
                        .catch (restResponse => {
                            Swal.fire(
                                "Server Error!",
                                "Clinical Analysis has not been correctly deleted.",
                                "error"
                            )
                        })
                }
            })
        }
    }

    // TODO fix tab jsonToTabConvert isn't working!
    onDownload(e) {
        console.log("onDownload interpreter-grid")
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
                    dataString = VariantUtils.jsonToTabConvert(result, this.populationFrequencies.studies, this.samples, this._config.nucleotideGenotype);
                    console.log("dataString", dataString)
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
                setTimeout(function() {
                    document.body.removeChild(a);
                }, 0);




            })
            .catch( e => {
                console.error(e);
            });
    }

    onShare() {
        const _this = this;
        $("[data-toggle=popover]").popover({
            content: function() {
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
        }).on("show.bs.popover", function() {
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
            showActions: true,
            multiSelection: false,
            nucleotideGenotype: true,
            alleleStringLengthMax: 10,

            header: {
                horizontalAlign: "center",
                verticalAlign: "bottom"
            },

            quality: {
                qual: 30,
                dp: 20
            },
            populationFrequencies: ["1kG_phase3:ALL", "GNOMAD_GENOMES:ALL", "GNOMAD_EXOMES:ALL", "UK10K:ALL", "GONL:ALL", "ESP6500:ALL", "EXAC:ALL"]
        };
    }

    showLoading(){
        $("#" + this.gridId).bootstrapTable("showLoading");
    }

    render() {
        return html`
            <style>
                .variant-link-dropdown:hover .dropdown-menu {
                    display: block;
                }
    
                .detail-view :hover {
                    background-color: white;
                }
    
                .detail-view-row :hover {
                    background-color: #f5f5f5;
                }
    
                .qtip-custom-class .qtip-content {
                    font-size: 12px;
                }
                
                /*quickfix for loading-spinner in bootstrap table*/ 
                .fixed-table-body{
                    min-height: 20vh;
                }
            </style>
    
            <opencb-grid-toolbar .from="${this.from}"
                                 .to="${this.to}"
                                 .numTotalResultsText="${this.numTotalResultsText}"
                                 .config="${this.toolbarConfig}"
                                 @columnChange="${this.onColumnChange}"
                                 @download="${this.onDownload}"
                                 @sharelink="${this.onShare}">
            </opencb-grid-toolbar>
    
            <div id="${this._prefix}GridTableDiv">
                <table id="${this._prefix}VariantBrowserGrid"></table>
            </div>
    
            <div class="modal fade" id="${this._prefix}ReviewSampleModal" data-backdrop="static" data-keyboard="false" tabindex="-1"
                 role="dialog" aria-hidden="true" style="padding-top:0; overflow-y: visible">
                <div class="modal-dialog" style="width: 1280px">
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
