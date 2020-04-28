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
import Utils from "../../../utils.js"
import UtilsNew from "../../../utilsNew.js";
import VariantGridFormatter from "../VariantGridFormatter.js";
import GridCommons from "../grid-commons.js";
import VariantUtils from "../variant-utils.js";
import "./opencga-interpretation-variant-review.js";
import "../../commons/opencb-grid-toolbar.js";
import "../../../loading-spinner.js";


export default class VariantCancerInterpreterGrid extends LitElement {

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
            reportedVariants: {
                type: Array
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
        this._prefix = "ovig-" + Utils.randomString(6) + "_";

        // Config for the grid toolbar
        this.toolbarConfig = {
            columns: [
                {title: "Variant", field: "id"},
                {title: "Genes", field: "genes"},
                {title: "Type", field: "type"},
                {title: "Gene Annotations", field: "consequenceType"}
            ]
        };
        this.gridId = this._prefix + "VariantBrowserGrid";
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
    }

    firstUpdated(_changedProperties) {
        this.downloadRefreshIcon = $("#" + this._prefix + "DownloadRefresh");
        this.downloadIcon = $("#" + this._prefix + "DownloadIcon");
        this.table = this.querySelector("#" + this.gridId);
    }

    updated(changedProperties) {
        // if (changedProperties.has("opencgaSession") || changedProperties.has("config")) {
        //     this.opencgaSessionObserver();
        // }
        // if (changedProperties.has("clinicalAnalysis")) {
        //     this.clinicalAnalysisObserver();
        // }
        if (changedProperties.has("opencgaSession") || changedProperties.has("clinicalAnalysis")
            || changedProperties.has("query") || changedProperties.has("config")) {
            this.opencgaSessionObserver();
            this.clinicalAnalysisObserver();
            this.renderVariants();
        }
        if (changedProperties.has("reportedVariants")) {
            this.renderLocalVariants();
        }
    }

    opencgaSessionObserver() {
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.variantGridFormatter = new VariantGridFormatter(this.opencgaSession, this._config);
        this.gridCommons = new GridCommons(this.gridId, this, this._config);

        const colors = this.variantGridFormatter.assignColors(this.consequenceTypes, this.proteinSubstitutionScores);
        Object.assign(this, colors);
    }

    clinicalAnalysisObserver() {
        // Make sure somatic sample is the first one
        if (this.clinicalAnalysis && this.clinicalAnalysis.proband && this.clinicalAnalysis.proband.samples) {
            if (this.clinicalAnalysis.proband.samples.length === 2 && this.clinicalAnalysis.proband.samples[1].somatic) {
                this.clinicalAnalysis.proband.samples = this.clinicalAnalysis.proband.samples.reverse();
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
        if (this.reportedVariants) {
            this.renderLocalVariants();
        } else {
            this.renderRemoteVariants();
        }
    }

    renderRemoteVariants() {
        this.from = 1;
        this.to = this._config.pageSize;
        this.approximateCountResult = false;

        this.table = $("#" + this.gridId);
        if (this.opencgaSession && this.opencgaSession.project && this.opencgaSession.study) {
            this._columns = this._createDefaultColumns();

            const _this = this;
            this.table.bootstrapTable("destroy");
            this.table.bootstrapTable({
                columns: _this._columns,
                method: "get",
                sidePagination: "server",

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

                ajax: (params) => {
                    let tableOptions = $(this.table).bootstrapTable("getOptions");
                    let filters = {
                        study: this.opencgaSession.study.fqn,
                        limit: params.data.limit || tableOptions.pageSize,
                        skip: params.data.offset || 0,
                        count: !tableOptions.pageNumber || tableOptions.pageNumber === 1,
                        includeSampleId: "true",
                        ...this.query
                    };
                    this.opencgaSession.opencgaClient.clinical().primaryFindingsInterpretation(filters)
                        .then( res => params.success(res));
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
//                 onClickRow: function(row, selectedElement, field) {
//                     $("#" + _this._prefix + "VariantBrowserGrid tr").removeClass("success");
//                     $(selectedElement).addClass("success");
//                     _this._onSelectVariant(row, "selectvariant");
//                 },
                onCheck: (row, $element) => this.gridCommons.onCheck(row.id, row),
                // onCheck: function(row, $element) {
                //     const _variant = row.chromosome + ":" + row.start + ":" + row.reference + ":" + row.alternate;
                //     _this.dispatchEvent(new CustomEvent("checkvariant", {
                //         detail: {
                //             id: _variant,
                //             variant: row,
                //             checkdVariant: true,
                //             variants: $("#" + _this._prefix + "VariantBrowserGrid").bootstrapTable("getAllSelections")
                //         }
                //     }));
                // },
                onCheckAll: rows => this.gridCommons.onCheckAll(rows),
                // onCheckAll: function(rows) {
                //     _this.dispatchEvent(new CustomEvent("checkrow", {
                //         detail: {
                //             variants: $("#" + _this._prefix + "VariantBrowserGrid").bootstrapTable("getAllSelections")
                //         }
                //     }));
                // },
                onUncheck: (row, $element) => this.gridCommons.onUncheck(row.id, row),
                // onUncheck: function(row, $element) {
                //     const _variant = row.chromosome + ":" + row.start + ":" + row.reference + ":" + row.alternate;
                //     _this.dispatchEvent(new CustomEvent("checkrow", {
                //         detail: {
                //             id: _variant,
                //             variant: row,
                //             checkdVariant: false,
                //             variants: $("#" + _this._prefix + "VariantBrowserGrid").bootstrapTable("getAllSelections")
                //         }
                //     }));
                // },
                onLoadSuccess: data => {
                    if (data.rows && data.rows.length > 0) {
                        this.gridCommons.onLoadSuccess(data, data.rows[0].id, 2)
                    }
                },
                // onLoadSuccess: data => {
                //     // The first time we mark as selected the first row that is rows[2] since the first two rows are the header
                //     if (UtilsNew.isNotEmptyArray(data.rows) && UtilsNew.isNotUndefinedOrNull(this.table)) {
                //         PolymerUtils.querySelector(this.table.selector).rows[2].setAttribute("class", "success");
                //         _this._onSelectVariant(data.rows[0]);
                //
                //         // const elementsByClassName = PolymerUtils.getElementsByClassName("genome-browser-option");
                //         // for (const elem of elementsByClassName) {
                //         //     elem.addEventListener("click", function(e) {
                //         //         // _this.genomeBrowserPosition = e.target.dataset.variantPosition;
                //         //         _this.dispatchEvent(new CustomEvent("setgenomebrowserposition", {
                //         //             detail: {
                //         //                 genomeBrowserPosition: e.target.dataset.variantPosition
                //         //             }, bubbles: true, composed: true
                //         //         }));
                //         //     });
                //         // }
                //     }
                // },
                onLoadError: function(status, res) {
                    console.error(res)

                },
                onPageChange: function(page, size) {
                    _this.from = (page - 1) * size + 1;
                    _this.to = page * size;
                },
                onPostBody: function(data) {
                    // const _onPostBody = _this._onPostBody.bind(_this, data, "remote");
                    // _this._onPostBody();
                    // const removeIndividualButtons = PolymerUtils.querySelectorAll(".removeIndividualButton");
                    // for (let i = 0; i < removeIndividualButtons.length; i++) {
                    //     removeIndividualButtons[i].addEventListener("click", this.onReviewClick.bind(this));
                    // }
                    //
                    // // The first time we mark as selected the first row that is rows[2] since the first two rows are the header
                    // const _table = $("#" + this._prefix + "VariantBrowserGrid");
                    // if (UtilsNew.isNotEmptyArray(data) && UtilsNew.isNotUndefinedOrNull(_table)) {
                    //     PolymerUtils.querySelector(_table.selector).rows[2].setAttribute("class", "success");
                    //     if (mode === "remote") {
                    //         this._onSelectVariant(data[0]);
                    //     } else {
                    //         this._onClickSelectedVariant(data[0]);
                    //     }
                    // }

                    if (_this.variantGridFormatter) {
                        _this.variantGridFormatter.addTooltip("div.variant-tooltip", "Links");
                        _this.variantGridFormatter.addTooltip("span.gene-tooltip", "Links");
                        _this.variantGridFormatter.addTooltip("div.zygositySampleTooltip", "File metrics", "", {style: {classes: "qtip-rounded qtip-shadow qtip-custom-class"}});
                        _this.variantGridFormatter.addPopulationFrequenciesTooltip("table.populationFrequenciesTable", _this.populationFrequencies);
                        _this.variantGridFormatter.addPopulationFrequenciesInfoTooltip("span.pop-preq-info-icon", _this.populationFrequencies);
                        const predictionTooltipContent = "<span style='font-weight: bold'>Prediction</span> column shows the Clinical Significance prediction and Tier following the ACMG guide recommendations";
                        _this.variantGridFormatter.addTooltip("span.interpretation-info-icon", "Interpretation", predictionTooltipContent, {position: {my: "top right"}, style: {classes: "qtip-rounded qtip-shadow qtip-custom-class"}});
                        _this.variantGridFormatter.addTooltip("div.predictionTooltip", "Classification", "", {position: {my: "top right"}, style: {classes: "qtip-rounded qtip-shadow qtip-custom-class"}, width: "360px"});
                    }
                }
            });
        }
    }

    renderLocalVariants() {
        this.from = 1;
        this.to = Math.min(this.reportedVariants.length, this._config.pageSize);
        this.numTotalResultsText = this.reportedVariants.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        this.table = $("#" + this.gridId);
        this._columns = this._createDefaultColumns();
        const _this = this;
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            data: _this.reportedVariants,
            columns: _this._columns,
            sidePagination: "local",

            // Set table properties, these are read from config property
            uniqueId: "id",
            pagination: _this._config.pagination,
            pageSize: _this._config.pageSize,
            pageList: _this._config.pageList,
            showExport: _this._config.showExport,
            detailView: _this._config.detailView,
            detailFormatter: _this._config.detailFormatter,

            // this makes the opencga-interpreted-variant-grid properties available in the bootstrap-table formatters
            variantGrid: _this,

            onClickRow: function(row, $element) {
                $("#" + _this._prefix + "VariantBrowserGrid tr").removeClass("success");
                $($element).addClass("success");

                _this._onClickSelectedVariant(row);
            },
            onPageChange: function(page, size) {
                _this.from = (page - 1) * size + 1;
                _this.to = page * size;
            },
            onPostBody: function(data) {
                const _onPostBody = _this._onPostBody.bind(_this, data, "local");
                _this._onPostBody();
            }
        });
    }

    _onClickSelectedVariant(row) {
        if (typeof row !== "undefined") {
            const _variant = row.chromosome + ":" + row.start + ":" + row.reference + ":" + row.alternate;
            this.dispatchEvent(new CustomEvent("selectvariant2", {detail: {id: _variant, variant: row}}));
        }
    }

    onReviewClick(e) {
        // debugger
        // this.dispatchEvent(new CustomEvent('reviewvariant', {
        //     detail: {
        //         variant: e.currentTarget.dataset.variant
        //     }
        // }));

        for (const rv of this.reportedVariants) {
            if (rv.id === e.currentTarget.dataset.variantId) {
                this.variantReview = rv;
                break;
            }
        }

        $("#" + this._prefix + "ReviewSampleModal").modal("show");
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
        return variantHtmlDiv + "<div style='padding-top: 10px'>" + snptHtmlAnchor + "</div>";
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
                        console.warn("file is undefined")
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
                if (row.studies[0].samples.length === 2) {

                    sampleGT = row.studies[0].samples[sampleIndex].data[0];
                } else {
                    sampleGT = row.studies[0].samples[0].data[0];
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
                const tooltipText = `<div class="col-md-12" style="padding: 0px">
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

    // studyCohortsFormatter(value, row) {
    //     if (typeof row !== "undefined" && typeof row.studies !== "undefined") {
    //         const cohorts = [];
    //         const cohortMap = new Map();
    //         for (const study of row.studies) {
    //             const arr = study.studyId.split(":");
    //             const s = arr[arr.length - 1] + ":ALL";
    //             cohorts.push(s);
    //             cohortMap.set(s, Number(study.stats[0].altAlleleFreq).toFixed(4));
    //         }
    //
    //         return this.variantGridFormatter.createPopulationFrequenciesTable(cohorts, cohortMap, this.populationFrequencies.style);
    //     } else {
    //         return "-";
    //     }
    // }

    clinicalPopulationFrequenciesFormatter(value, row) {
        if (typeof row !== "undefined" && typeof row.annotation !== "undefined") {
            const popFreqMap = new Map();
            if (UtilsNew.isNotEmptyArray(row.annotation.populationFrequencies)) {
                for (const popFreq of row.annotation.populationFrequencies) {
                    popFreqMap.set(popFreq.study + ":" + popFreq.population, Number(popFreq.altAlleleFreq).toFixed(4));
                }
            }
            return this.variantGridFormatter.createPopulationFrequenciesTable(this._config.populationFrequencies,
                popFreqMap, this.populationFrequencies.style);
        } else {
            return "-";
        }
    }

    clinicalPhenotypeFormatter(value, row, index) {
        let phenotypeHtml = "<span><i class='fa fa-times' style='color: red'></i></span>";
        if (typeof row !== "undefined" && typeof row.annotation !== "undefined") {
            if (UtilsNew.isNotUndefinedOrNull(row.annotation.variantTraitAssociation)) {
                const traits = [];
                const clinicalData = row.annotation.variantTraitAssociation[this.field];
                if (UtilsNew.isNotEmptyArray(clinicalData)) {
                    for (let j = 0; j < clinicalData.length; j++) {
                        if (this.field === "clinvar" && traits.indexOf(clinicalData[j].traits[0]) === -1 &&
                            clinicalData[j].traits[0] !== "not specified" && clinicalData[j].traits[0] !== "not provided") {
                            traits.push(clinicalData[j].traits[0]);
                        } else if (this.field === "cosmic" && traits.indexOf(clinicalData[j].primaryHistology) === -1) {
                            traits.push(clinicalData[j].primaryHistology);
                        }
                    }

                    if (traits.length > 0) {
                        let traitText = traits[0];
                        if (traits.length > 1) {
                            traitText += ", ...";
                        }
                        phenotypeHtml = `<span data-toggle="tooltip" data-placement="bottom" title="${traitText}"><i class='fa fa-check' style='color: green'></i></span>`;
                    }
                }
            }
        }
        return phenotypeHtml;
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

    reviewFormatter(value, row, index) {
        return `<button class="btn btn-link removeIndividualButton" data-variant-id="${row.id}">
                            <i class="fa fa-edit icon-padding removeIndividualButton" aria-hidden="true"></i> Edit
                        </button>`;
    }

    _createDefaultColumns() {
        if (this.variantGridFormatter === undefined) {
            return;
        }

        this._columns = [
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
                    title: "Role in Cancer",
                    field: "evidences",
                    rowspan: 2,
                    colspan: 1,
                    formatter: this.roleInCancerFormatter.bind(this),
                    halign: "center"
                },
                // {
                //     title: "Variant Stats <span class='pop-preq-info-icon'><i class='fa fa-info-circle' style='color: #337ab7' aria-hidden='true'></i></span>",
                //     field: "frequencies",
                //     rowspan: 1,
                //     colspan: 2,
                //     align: "center"
                // },
                {
                    title: "Clinical",
                    // field: "phenotypes",
                    rowspan: 1,
                    colspan: 2,
                    align: "center"
                }
                // {
                //     title: "Interpretation <span class='interpretation-info-icon'><i class='fa fa-info-circle' style='color: #337ab7' aria-hidden='true'></i></span>",
                //     field: "interpretation",
                //     rowspan: 1,
                //     colspan: 2,
                //     halign: 'center'
                // },
            ],
            [
                // {
                //     title: "Cohorts",
                //     field: "cohort",
                //     colspan: 1,
                //     rowspan: 1,
                //     formatter: this.studyCohortsFormatter.bind(this)
                // },
                // {
                //     title: "Population Frequencies",
                //     field: "populationFrequencies",
                //     colspan: 1,
                //     rowspan: 1,
                //     formatter: this.clinicalPopulationFrequenciesFormatter.bind(this)
                // },
                {
                    title: "ClinVar",
                    field: "clinvar",
                    colspan: 1,
                    rowspan: 1,
                    formatter: this.clinicalPhenotypeFormatter,
                    align: "center"
                },
                {
                    title: "Cosmic",
                    field: "cosmic",
                    colspan: 1,
                    rowspan: 1,
                    formatter: this.clinicalPhenotypeFormatter,
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
                // {
                //     title: "Select",
                //     field: "selectForInterpretation",
                //     rowspan: 1,
                //     colspan: 1,
                //     align: 'center'
                // }
            ]
        ];

        // update columns dynamically
        this._updateTableColumns();

        return this._columns;
    }

    _updateTableColumns() {
        // Add a checkbox column
        this._columns[0].push({
            title: "Interpretation <span class='interpretation-info-icon'><i class='fa fa-info-circle' style='color: #337ab7' aria-hidden='true'></i></span>",
            field: "interpretation",
            rowspan: 1,
            colspan: this._config.showSelectCheckbox ? 2 : 1,
            halign: "center"
        });
        if (this._config.showSelectCheckbox) {
            this._columns[1].push({
                // field: "stateCheckBox",
                checkbox: true,
                rowspan: 1,
                colspan: 1
            });
        }

        if (this._config.showStatus) {
            // this._columns[1].push({
            //     title: "Status",
            //     field: "status",
            //     rowspan: 1,
            //     colspan: 1
            // });
            this._columns[0].push({
                title: "Review",
                // field: "status",
                rowspan: 2,
                colspan: 1,
                formatter: this.reviewFormatter.bind(this),
                align: "center"
            });
        }

        // Set sample columns
        if (typeof this._columns !== "undefined" && this.clinicalAnalysis.proband && this.clinicalAnalysis.proband.samples) {
            this._columns[0].splice(5, 0, {
                title: `Sample Genotypes (${this.clinicalAnalysis.proband.id})`,
                rowspan: 1,
                colspan: this.clinicalAnalysis.proband.samples.length,
                align: "center"
            });

            for (let i = 0; i < this.clinicalAnalysis.proband.samples.length; i++) {
                let sample = this.clinicalAnalysis.proband.samples[i];
                let color = sample.somatic ? "darkred" : "black";

                this._columns[1].splice(i, 0, {
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

    // TODO adapt to this resource!
    onDownload(e) {
        const urlQueryParams = this._getUrlQueryParams();
        const params = urlQueryParams.queryParams;
        params.limit = 1000; // Default limit is 1000 for now

        this.downloadRefreshIcon.css("display", "inline-block");
        this.downloadIcon.css("display", "none");

        const _this = this;
        this.opencgaSession.opencgaClient.variants().query(params)
            .then(function(response) {
                const result = response.response[0].result;
                let dataString = [];
                let mimeType = "";
                let extension = "";

                // Check if user clicked in Tab or JSON format
                if (e.detail.option.toLowerCase() === "tab") {
                    dataString = VariantUtils.jsonToTabConvert(result, _this.populationFrequencies.studies, _this.samples, _this._config.nucleotideGenotype);
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
                a.download = _this.opencgaSession.study.alias + extension;
                document.body.appendChild(a);
                a.click();
                setTimeout(function() {
                    document.body.removeChild(a);
                }, 0);
            })
            .then(function() {
                _this.downloadRefreshIcon.css("display", "none");
                _this.downloadIcon.css("display", "inline-block");
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

            showSelectCheckbox: true,
            showStatus: false,
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
            // populationFrequencies: ["1kG_phase3:ALL", "GNOMAD_GENOMES:ALL", "GNOMAD_EXOMES:ALL", "UK10K:ALL", "GONL:ALL", "ESP6500:ALL", "EXAC:ALL"]
        };
    }

    showLoading(){
        $("#" + this.gridId).bootstrapTable("showLoading");
    }

    render() {
        return html`
            <style include="jso-styles">
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
                                 @columnchange="${this.onColumnChange}"
                                 @download="${this.onDownload}"
                                 @sharelink="${this.onShare}">
            </opencb-grid-toolbar>
    
            <div id="${this._prefix}GridTableDiv">
                <table id="${this._prefix}VariantBrowserGrid">
                </table>
            </div>
    
            <div class="modal fade" id="${this._prefix}ReviewSampleModal" data-backdrop="static" data-keyboard="false" tabindex="-1"
                 role="dialog" aria-hidden="true" style="padding-top:0; overflow-y: visible">
                <div class="modal-dialog" style="width: 1280px">
                    <div class="modal-content">
                        <div class="modal-header" style="padding: 5px 15px">
                            <h3>Sample and File Filters</h3>
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

customElements.define("variant-cancer-interpreter-grid", VariantCancerInterpreterGrid);
