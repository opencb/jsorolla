/**
 * Copyright 2015-2019 OpenCB
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

import {html, LitElement} from "/web_modules/lit-element.js";
import UtilsNew from "./../../utilsNew.js";
import VariantGridFormatter from "./variant-grid-formatter.js";
import GridCommons from "./grid-commons.js";
import VariantUtils from "./variant-utils.js";
import "../commons/opencb-grid-toolbar.js";
import "../../loading-spinner.js";


export default class OpencgaVariantGrid extends LitElement {

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
            cellbaseClient: {
                type: Object
            },
            query: {
                type: Object
            },
            data: {
                type: Array
            },
            cohorts: {
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
        this._prefix = "vbg-" + UtilsNew.randomString(6);

        // Config for the grid toolbar
        this.toolbarConfig = {
            columns: [
                {
                    title: "Variant", field: "id"
                },
                {
                    title: "dbSNP Id", field: "dbSNP"
                },
                {
                    title: "Gene", field: "gene"
                },
                {
                    title: "Type", field: "type"
                },
                {
                    title: "Consequence Type", field: "consequenceType"
                }
            ]
        };

        this.gridId = this._prefix + "VariantBrowserGrid";
        this.checkedVariants = new Map();
    }

    connectedCallback() {
        super.connectedCallback();

        this.downloadRefreshIcon = $("#" + this._prefix + "DownloadRefresh");
        this.downloadIcon = $("#" + this._prefix + "DownloadIcon");
    }

    firstUpdated(_changedProperties) {
        // this._createDefaultColumns();
        // this.query = {};
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
        this.table = this.querySelector("#" + this.gridId);
        // this.checkedVariants = new Map();
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("query") || changedProperties.has("config") || changedProperties.has("data")) {
            this.propertyObserver();
            this.renderVariants();
        }
    }

    propertyObserver() {
        // With each property change we must updated config and create the columns again. No extra checks are needed.
        this._config = Object.assign(this.getDefaultConfig(), this.config);
        this.variantGridFormatter = new VariantGridFormatter(this.opencgaSession, this._config);
        this.gridCommons = new GridCommons(this.gridId, this, this._config);

        // We check query.sample and query.genotype to check if samples exist.
        // We parse query fields and store a samples object array for convenience
        const _samples = [];
        if (this.query) {
            if (this.query.sample) {
                for (const sampleId of this.query.sample.split("[,;]")) {
                    _samples.push({
                        id: sampleId.split(":")[0]
                    });
                }
            }
        }
        this.samples = _samples;

        // Set colors
        const colors = this.variantGridFormatter.assignColors(this.consequenceTypes, this.proteinSubstitutionScores);
        Object.assign(this, colors);
    }

    onColumnChange(e) {
        const table = $("#" + this.gridId);
        if (e.detail.selected) {
            table.bootstrapTable("showColumn", e.detail.id);
        } else {
            table.bootstrapTable("hideColumn", e.detail.id);
        }
    }

    renderVariants() {
        this.renderVariantTable();
        // if (this._config.renderLocal) {
        //     this.renderFromLocal();
        // } else {
        //     this.renderVariantTable();
        // }
    }

    renderVariantTable() {
        this.from = 1;
        this.to = 10;
        this.approximateCountResult = false;

        // TODO quickfix. The check on query is required because the study is in the query object. A request without the study returns the error "Multiple projects found"
        if (this.opencgaSession && this.opencgaSession.project && this.opencgaSession.study) {
            this._columns = this._createDefaultColumns();

            const _this = this;
            this.table = $("#" + this.gridId);
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
                detailFormatter: _this._config.detailFormatter,
                formatLoadingMessage: () =>"<loading-spinner></loading-spinner>",

                // this makes the opencga-variant-grid properties available in the bootstrap-table formatters
                variantGrid: _this,
                ajax: params => {
                    // TODO We must decide i this component support a porperty:  mode = {opencga | cellbase}
                    let tableOptions = $(this.table).bootstrapTable("getOptions");
                    let filters = {
                        study: this.opencgaSession.study.fqn,
                        summary: !this.query.sample && !this.query.family,
                        limit: params.data.limit || tableOptions.pageSize,
                        skip: params.data.offset || 0,
                        count: !tableOptions.pageNumber || tableOptions.pageNumber === 1,
                        // include: "name,path,samples,status,format,bioformat,creationDate,modificationDate,uuid",
                        ...this.query
                    };

                    // if (!this.query.sample && !this.query.family) {
                    //     filters.summary = true;
                    // }
                    // if (this._config.grid && this._config.grid.queryParams) {
                    //     filters = {...filters, ...this._config.grid.queryParams};
                    // }

                    this.opencgaSession.opencgaClient.variants().query(filters)
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
                onDblClickRow: function(row, element, field) {
                    // We detail view is active we expand the row automatically.
                    // FIXME: Note that we use a CSS class way of knowing if the row is expand or collapse, this is not ideal but works.
                    if (_this._config.detailView) {
                        // TODO refactor this omg!
                        if (element[0].innerHTML.includes("icon-plus")) {
                            $("#" + _this.gridId).bootstrapTable("expandRow", element[0].dataset.index);
                        } else {
                            $("#" + _this.gridId).bootstrapTable("collapseRow", element[0].dataset.index);
                        }
                    }
                },
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
                onLoadError: function(status, res) {
                    console.trace(res);
                },
                onPageChange: (page, size) => {
                    this.from = (page - 1) * size + 1;
                    this.to = page * size;
                },
                onPostBody: function(data) {
                    $("span.sampleGenotype").qtip({
                        content: {
                            title: "More info",
                            text: function(event, api) {
                                return $(this).attr("data-text");
                            }
                        },
                        position: {
                            target: "mouse",
                            adjust: {
                                x: 2, y: 2,
                                mouse: false
                            }
                        },
                        style: {
                            width: true
                        },
                        show: {
                            delay: 200
                        },
                        hide: {
                            fixed: true,
                            delay: 300
                        }
                    });

                    // Add tooltips
                    _this.variantGridFormatter.addTooltip("div.variant-tooltip", "Links");
                    _this.variantGridFormatter.addTooltip("span.gene-tooltip", "Links");
                    _this.variantGridFormatter.addCohortStatsInfoTooltip("cohortStatsInfoIcon", _this.populationFrequencies);
                    _this.variantGridFormatter.addPopulationFrequenciesTooltip("table.populationFrequenciesTable", _this.populationFrequencies);
                    _this.variantGridFormatter.addPopulationFrequenciesTooltip("table.cohortStatsTable", _this.populationFrequencies);
                    _this.variantGridFormatter.addPopulationFrequenciesInfoTooltip("span.popFreqInfoIcon", _this.populationFrequencies);
                    _this.variantGridFormatter.addPhenotypesInfoTooltip("phenotypesInfoIcon");
                }
            });
        }
    }

    renderFromLocal() {
        const _this = this;
        $("#" + this.gridId).bootstrapTable("destroy");
        $("#" + this.gridId).bootstrapTable({
            data: this.data,
            columns: this.cols,
            onClickRow: function(row, $element) {
                _this.variant = row.chromosome + ":" + row.start + ":" + row.reference + ":" + row.alternate;
                $(".success").removeClass("success");
                $($element).addClass("success");
            }
        });
    }

    // TODO refactor using bootstrap table ajax
    _getUrlQueryParams() {
        // Init queryParams with default and config values plus query object
        let queryParams = {};
        if (UtilsNew.isNotUndefinedOrNull(this.config) && UtilsNew.isNotUndefinedOrNull(this.config.grid) &&
            UtilsNew.isNotUndefinedOrNull(this.config.grid.queryParams)) {
            queryParams = Object.assign({}, this.config.grid.queryParams, this.query);
        } else {
            queryParams = Object.assign({}, this.query);
        }

        // if (this.opencgaSession.opencgaClient._config.sessionId !== undefined) {
        //     queryParams = Object.assign(queryParams, {sid: this.opencgaSession.opencgaClient._config.sessionId});
        // }

        if (UtilsNew.isEmptyArray(this.samples)) {
            queryParams.summary = true;
            // queryParams.exclude = "annotation.geneExpression";
        } else {
            queryParams.summary = false;
            // queryParams.exclude = "annotation.geneExpression";
        }

        if (typeof this.config !== "undefined" && UtilsNew.isNotUndefinedOrNull(this.config.grid) &&
            typeof this.config.grid.includeMissing !== "undefined" && this.config.grid.includeMissing) {
            const keys = Object.keys(queryParams);
            for (let i = 0; i < keys.length; i++) {
                let val = queryParams[keys[i]];
                if (typeof val === "string" && keys[i] !== "cohortStatsMaf" && keys[i] !== "cohortStatsAlt") {
                    val = val.replace(/</g, "<<");
                    // val = val.replace(/>/g, ">>");
                    queryParams[keys[i]] = val;
                }
            }
        }

        return queryParams;
    }

    showGene(geneName) {
        //                this.fire('selected', {gene: geneName});
        this.dispatchEvent(new CustomEvent("selected", {detail: {gene: geneName}}));
    }

    detailFormatter(value, row, a) {
        let result = "<div class='row' style='padding-bottom: 20px'>";
        let detailHtml = "";
        if (typeof row !== "undefined" && typeof row.annotation !== "undefined") {
            detailHtml = "<div style='padding: 10px 0px 10px 25px'><h4>Consequence Types</h4></div>";
            detailHtml += "<div style='padding: 5px 50px'>";
            detailHtml += this.variantGrid.variantGridFormatter.consequenceTypeDetailFormatter(value, row, this.variantGrid);
            detailHtml += "</div>";

            detailHtml += "<div style='padding: 20px 0px 15px 25px'><h4>Clinical Phenotypes</h4></div>";
            detailHtml += "<div style='padding: 5px 50px'>";
            let clinvarTraits = "";
            let cosmicTraits = "";
            if (typeof row.annotation.variantTraitAssociation !== "undefined" && row.annotation.variantTraitAssociation != null) {
                const traits = {
                    clinvar: [],
                    cosmic: []
                };
                const fields = ["clinvar", "cosmic"];
                for (const field of fields) {
                    const clinicalData = row.annotation.variantTraitAssociation[field];
                    if (typeof clinicalData !== "undefined" && clinicalData.length > 0) {
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
                } else {
                    clinvarTraits = "<div><label style='padding-right: 10px'>ClinVar: </label>-</div>";
                }
                if (traits.cosmic.length > 0) {
                    cosmicTraits = "<div><label style='padding-right: 10px'>Cosmic: </label>" + traits.cosmic.join(", ") + "</div>";
                } else {
                    cosmicTraits = "<div><label style='padding-right: 10px'>Cosmic: </label>-</div>";
                }
            }
            detailHtml += clinvarTraits + cosmicTraits;
            detailHtml += "</div>";
        }
        result += detailHtml + "</div>";
        return result;
    }

    variantFormatter(value, row, index) {
        return this.variantGridFormatter.variantFormatter(value, row, this._config);
    }

    // TODO refactor this to make it more clear (polyphenProteinScoreFormatter too)
    siftPproteinScoreFormatter(value, row, index) {
        let min = 10;
        const description = {};
        if (typeof row !== "undefined" && typeof row.annotation !== "undefined") {
            if (typeof row.annotation !== "undefined" && typeof row.annotation.consequenceTypes !== "undefined") {
                for (let i = 0; i < row.annotation.consequenceTypes.length; i++) {
                    if (typeof row.annotation.consequenceTypes[i].proteinVariantAnnotation !== "undefined" &&
                        typeof row.annotation.consequenceTypes[i].proteinVariantAnnotation.substitutionScores !== "undefined") {
                        for (let j = 0; j < row.annotation.consequenceTypes[i].proteinVariantAnnotation.substitutionScores.length; j++) {
                            if (row.annotation.consequenceTypes[i].proteinVariantAnnotation.substitutionScores[j].source === "sift") {
                                if (row.annotation.consequenceTypes[i].proteinVariantAnnotation.substitutionScores[j].score < min) {
                                    min = row.annotation.consequenceTypes[i].proteinVariantAnnotation.substitutionScores[j].score;
                                    description.sift = row.annotation.consequenceTypes[i].proteinVariantAnnotation.substitutionScores[j].description;
                                }
                            }
                        }
                    }
                }
            }
        }

        if (min !== 10) {
            return "<span style=\"color: " + this.pssColor.get(description.sift) + "\" title=\"" + min + "\">" + description.sift + "</span>";
        }
        return "-";
    }

    polyphenProteinScoreFormatter(value, row, index) {
        let max = 0;
        const description = {};
        if (typeof row !== "undefined" && typeof row.annotation !== "undefined") {
            if (typeof row.annotation !== "undefined" && typeof row.annotation.consequenceTypes !== "undefined") {
                for (let i = 0; i < row.annotation.consequenceTypes.length; i++) {
                    if (typeof row.annotation.consequenceTypes[i].proteinVariantAnnotation !== "undefined" &&
                        typeof row.annotation.consequenceTypes[i].proteinVariantAnnotation.substitutionScores !== "undefined") {
                        for (let j = 0; j < row.annotation.consequenceTypes[i].proteinVariantAnnotation.substitutionScores.length; j++) {
                            if (row.annotation.consequenceTypes[i].proteinVariantAnnotation.substitutionScores[j].source === "polyphen") {
                                if (row.annotation.consequenceTypes[i].proteinVariantAnnotation.substitutionScores[j].score >= max) {
                                    max = row.annotation.consequenceTypes[i].proteinVariantAnnotation.substitutionScores[j].score;
                                    description.polyphen = row.annotation.consequenceTypes[i].proteinVariantAnnotation.substitutionScores[j].description;
                                }
                            }
                        }
                    }
                }
            }
        }

        if (max >= 0 && UtilsNew.isNotUndefinedOrNull(description) && UtilsNew.isNotUndefinedOrNull(description.polyphen)) {
            let str = description.polyphen;
            if (str.indexOf(" ") >= 0) {
                str = str
                    .replace(/\s(.)/g, function($1) {
                        return $1.toUpperCase();
                    })
                    .replace(/\s/g, "")
                    .replace(/^(.)/, function($1) {
                        return $1.toLowerCase();
                    });
            }
            return "<span style=\"color: " + this.pssColor.get(str) + "\" title=\"" + max + "\">" + description.polyphen + "</span>";
        }
        return "-";
    }

    caddScaledFormatter(value, row, index) {
        if (typeof row !== "undefined" && typeof row.annotation !== "undefined" && typeof row.annotation.functionalScore !== "undefined") {
            for (let i = 0; i < row.annotation.functionalScore.length; i++) {
                if (typeof row.annotation.functionalScore[i] !== "undefined" && row.annotation.functionalScore[i].source === "cadd_scaled" && row.type !== "INDEL") {
                    const value = Number(row.annotation.functionalScore[i].score).toFixed(2);
                    if (value < 15) {
                        return value;
                    } else {
                        return "<span style=\"color: red\">" + value + "</span>";
                    }
                }
            }
        }
        return "-";
    }

    conservationFormatter(value, row, index) {
        if (typeof row !== "undefined" && typeof row.annotation !== "undefined" && typeof row.annotation.conservation !== "undefined") {
            for (let i = 0; i < row.annotation.conservation.length; i++) {
                if (row.annotation.conservation[i].source === this.field) {
                    return Number(row.annotation.conservation[i].score).toFixed(3);
                }
            }
        }
        return "-";
    }

    cohortFormatter(value, row, index) {
        if (typeof row !== "undefined" && typeof row.studies !== "undefined" && typeof row.studies[0].stats !== "undefined") {
            const cohortStats = new Map();
            for (const study of row.studies) {
                if (study.studyId === this.field.study) {
                    for (const cohortStat of study.stats) {
                        cohortStats.set(cohortStat.cohortId, Number(cohortStat.altAlleleFreq).toFixed(4));
                    }
                    break;
                }
            }
            return this.field.context.variantGridFormatter.createCohortStatsTable(this.field.cohorts, cohortStats,
                this.field.context.populationFrequencies.style);
        } else {
            return "-";
        }
    }

    populationFrequenciesFormatter(value, row, index) {
        if (typeof row !== "undefined" && typeof row.annotation !== "undefined" && typeof row.annotation.populationFrequencies !== "undefined") {
            const popFreqMap = new Map();
            for (const popFreqIdx in row.annotation.populationFrequencies) {
                const popFreq = row.annotation.populationFrequencies[popFreqIdx];
                if (this.field.study === popFreq.study) { // && this.field.populationMap[popFreq.population] === true
                    popFreqMap.set(popFreq.population, Number(popFreq.altAlleleFreq).toFixed(4));
                }
            }
            return this.field.context.variantGridFormatter.createPopulationFrequenciesTable(this.field.populations,
                popFreqMap, this.field.context.populationFrequencies.style);
        } else {
            return "-";
        }
    }

    clinicalPhenotypeFormatter(value, row, index) {
        let phenotypeHtml = "<span><i class='fa fa-times' style='color: red'></i></span>";
        if (typeof row !== "undefined" && typeof row.annotation !== "undefined" && typeof row.annotation.variantTraitAssociation !== "undefined") {
            if (row.annotation.variantTraitAssociation != null) {
                const traits = [];
                const clinicalData = row.annotation.variantTraitAssociation[this.field];
                if (typeof clinicalData !== "undefined" && clinicalData.length > 0) {
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

    sampleFormatter(value, row, index) {
        let res = "-";

        if (typeof row !== "undefined" && typeof row.studies !== "undefined" && row.studies.length > 0) {
            // NOTE: There are always 4 columns before the samples
            // This context is for row
            if (this.nucleotideGenotype) {
                const alternateSequence = row.alternate;
                const referenceSequence = row.reference;
                const genotypeMatch = new Map();
                let colText = "";
                let referenceValueColText = "-";
                let alternateValueColText = "-";

                genotypeMatch.set(0, referenceSequence === "" ? "-" : referenceSequence);
                genotypeMatch.set(1, alternateSequence === "" ? "-" : alternateSequence);

                row.studies.forEach(study => {
                    if (UtilsNew.isNotUndefinedOrNull(study.secondaryAlternates) && UtilsNew.isNotEmptyArray(study.secondaryAlternates)) {
                        study.secondaryAlternates.forEach(secondary => {
                            genotypeMatch.set(genotypeMatch.size, secondary.alternate === "" ? "-" : secondary.alternate);
                        });
                    }
                    if (UtilsNew.isNotUndefinedOrNull(study.samplesData) && UtilsNew.isNotEmptyArray(study.samplesData)) {
                        if (UtilsNew.isNotUndefinedOrNull(study.samplesData[this.fieldIndex - 4])) {
                            const currentGenotype = study.samplesData[this.fieldIndex - 4][0];
                            let reference = currentGenotype.split("/")[0];
                            let alternate = currentGenotype.split("/")[1];
                            let tooltipText = reference + " / " + alternate;
                            if (UtilsNew.isNotEqual(reference, ".") && UtilsNew.isNotEqual(alternate, ".")) {
                                reference = parseInt(reference);
                                alternate = parseInt(alternate);
                                const referenceValue = genotypeMatch.get(reference);
                                const alternateValue = genotypeMatch.get(alternate);
                                // Cases which this will cover.
                                // referenceValue.length <= 5 && alternateVAlue.length <= 5
                                // referenceValue.length <= 10 && alternateValue == "-"
                                // alternateValue.length <= 10 && referenceValue == "-"
                                referenceValueColText = referenceValue;
                                alternateValueColText = alternateValue;

                                // Not equal X/- or -/X
                                if (UtilsNew.isNotEqual(referenceValue, "-") && UtilsNew.isNotEqual(alternateValue, "-")) {
                                    if ((referenceValue.length <= 5 && alternateValue.length > 5) || (referenceValue.length > 5 && alternateValue.length <= 5)) {
                                        if (referenceValue.length > 5) {
                                            // referenceValue > 5
                                            referenceValueColText = referenceValue.substring(0, 3) + "...";
                                            //                                                    tooltipText += "<br>" + referenceValue +" / " + alternateValue;
                                        } else {
                                            // alternateValue > 5
                                            alternateValueColText = alternateValue.substring(0, 3) + "...";
                                            //                                                    tooltipText += "<br>" + referenceValue +" / " + alternateValue;
                                        }
                                    } else if (referenceValue.length > 5 && alternateValue.length > 5) {
                                        // Both > 5 It will never happen
                                        referenceValueColText = referenceValue.substring(0, 3) + "...";
                                        alternateValueColText = alternateValue.substring(0, 3) + "...";
                                        //                                                tooltipText += "<br>" +   referenceValue +" / " + alternateValue;
                                    }
                                } else if (UtilsNew.isNotEqual(referenceValue, "-") && referenceValue.length > 10) {
                                    // X/-
                                    const substringReference = referenceValue.substring(0, 5) + "...";
                                    referenceValueColText = substringReference;
                                    alternateValueColText = "-";
                                    //                                                tooltipText += "<br>" +   referenceValue +" / " + alternateValue;
                                } else if (UtilsNew.isNotEqual(alternateValue, "-") && alternateValue.length > 10) {
                                    // -/X
                                    const substringAlternate = alternateValue.substring(0, 5) + "...";
                                    alternateValueColText = substringAlternate;
                                    referenceValueColText = "-";
                                    //                                                tooltipText += "<br>" +   referenceValue + " / " + alternateValue;
                                }
                                tooltipText += "<br>" + referenceValue + " / " + alternateValue;
                            } else {
                                referenceValueColText = reference;
                                alternateValueColText = alternate;
                                tooltipText += "<br>" + reference + " / " + alternate;
                            }

                            const referenceIndex = parseInt(reference);
                            const alternateIndex = parseInt(alternate);
                            if (referenceIndex === 1 && (referenceValueColText !== "-" && referenceValueColText !== "*")) {
                                referenceValueColText = "<span class='orangeText'>" + referenceValueColText + "</span>";
                            } else if (referenceIndex > 1 && (referenceValueColText !== "-" && referenceValueColText !== "*")) {
                                referenceValueColText = "<span class='redText'>" + referenceValueColText + "</span>";
                            }
                            if (alternateIndex === 1 && (alternateValueColText !== "-" && alternateValueColText !== "*")) {
                                alternateValueColText = "<span class='orangeText'>" + alternateValueColText + "</span>";
                            } else if (alternateIndex > 1 && (alternateValueColText !== "-" && alternateValueColText !== "*")) {
                                alternateValueColText = "<span class='redText'>" + alternateValueColText + "</span>";
                            }
                            colText = referenceValueColText + " / " + alternateValueColText;
                            res = "<span class='sampleGenotype' data-text='" + tooltipText + "'> " + colText + " </span>";
                        }
                    }
                });
            } else {
                row.studies.forEach(study => {
                    if (study.samplesData.length > 0) {
                        const currentGenotype = study.samplesData[this.fieldIndex - 4];
                        if (UtilsNew.isNotUndefinedOrNull(currentGenotype)) {
                            res = currentGenotype[0];
                        }
                    }
                });
            }
        }
        return res;
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
                    formatter: this.variantFormatter.bind(this),
                    halign: "center"
                },
                {
                    title: "dbSNP Id",
                    field: "dbSNP",
                    rowspan: 2,
                    colspan: 1,
                    formatter: this.variantGridFormatter.snpFormatter.bind(this),
                    halign: "center"
                },
                {
                    title: "Gene",
                    field: "gene",
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
                    title: "Consequence Type",
                    field: "consequenceType",
                    rowspan: 2,
                    colspan: 1,
                    formatter: this.variantGridFormatter.consequenceTypeFormatter.bind(this),
                    halign: "center"
                },
                {
                    title: "Deleteriousness <a data-toggle=\"tooltip\" title=\"SIFT scores are classified into tolerated and deleterious. " +
                        "Polyphen scores are classified into benign, possibly damaging, probably damaging and possibly & probably damaging. " +
                        "Please, leave the cursor over each tag to visualize the actual score value. " +
                        "SIFT score takes values in the range [0, infinite[, the lower the values, the more damaging the prediction. " +
                        "Polyphen score takes values in the range [0, 1[, the closer to 2, the more damaging the prediction.\">" +
                        "<i class=\"fa fa-info-circle\" aria-hidden=\"true\"></i></a>",
                    field: "deleteriousness",
                    rowspan: 1,
                    colspan: 3,
                    align: "center"
                },
                {
                    title: "Conservation  <a data-toggle=\"tooltip\" title=\"Positive PhyloP scores measure conservation which is slower evolution than expected, at sites that are predicted to be conserved. Negative PhyloP scores measure acceleration, which is faster evolution than expected, at sites that are predicted to be fast-evolving. Absolute values of phyloP scores represent -log p-values under a null hypothesis of neutral evolution. The phastCons scores represent probabilities of negative selection and range between 0 and 1. Positive GERP scores represent a substitution deficit and thus indicate that a site may be under evolutionary constraint. Negative scores indicate that a site is probably evolving neutrally. Some authors suggest that a score threshold of 2 provides high sensitivity while still strongly enriching for truly constrained sites\"><i class=\"fa fa-info-circle\" aria-hidden=\"true\"></i></a>",
                    field: "Conservation",
                    rowspan: 1,
                    colspan: 3,
                    align: "center"
                },
                {
                    title: "Phenotypes <span id=\"phenotypesInfoIcon\"><i class=\"fa fa-info-circle\" style=\"color: #337ab7\" aria-hidden=\"true\"></i></span>",
                    field: "phenotypes",
                    rowspan: 1,
                    colspan: 2,
                    align: "center"
                }
            ],
            [
                {
                    title: "SIFT",
                    field: "sift",
                    colspan: 1,
                    rowspan: 1,
                    formatter: this.siftPproteinScoreFormatter.bind(this),
                    halign: "center"
                },
                {
                    title: "Polyphen",
                    field: "polyphen",
                    colspan: 1,
                    rowspan: 1,
                    formatter: this.polyphenProteinScoreFormatter.bind(this),
                    halign: "center"
                },
                {
                    title: "CADD",
                    field: "cadd",
                    colspan: 1,
                    rowspan: 1,
                    formatter: this.caddScaledFormatter,
                    align: "right",
                    halign: "center"
                },
                {
                    title: "PhyloP",
                    field: "phylop",
                    colspan: 1,
                    rowspan: 1,
                    formatter: this.conservationFormatter,
                    align: "right",
                    halign: "center"
                },
                {
                    title: "PhastCons",
                    field: "phastCons",
                    colspan: 1,
                    rowspan: 1,
                    formatter: this.conservationFormatter,
                    align: "right",
                    halign: "center"
                },
                {
                    title: "GERP",
                    field: "gerp",
                    colspan: 1,
                    rowspan: 1,
                    formatter: this.conservationFormatter,
                    align: "right",
                    halign: "center"
                },
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
                }
            ]
        ];

        // update columns dynamically
        this._updateTableColumns();

        return this._columns;
    }

    _updateTableColumns() {
        // add last checkbox column
        if (this._config.showSelectCheckbox) {
            this._columns[1].push({
                field: "stateCheckBox",
                checkbox: true,
                rowspan: 1,
                colspan: 1
            });
        }

        let isCohortPresent = false;
        // if (typeof this._columns !== "undefined" && typeof this.cohorts !== "undefined" && Object.keys(this.cohorts).length > 0
        //     && this.config.filter.menu.skipSubsections !== undefined && !this.config.filter.menu.skipSubsections.includes("cohort")) {
        if (typeof this._columns !== "undefined" && typeof this.cohorts !== "undefined" && Object.keys(this.cohorts).length > 0 &&
            typeof this.cohorts[this.opencgaSession.project.id] !== "undefined") {
            isCohortPresent = true;
            const cohortStudyIdx = 7;
            const cohortIdx = 6;
            const cohortStudies = Object.keys(this.cohorts[this.opencgaSession.project.id]);

            this._columns[0].splice(cohortStudyIdx, 0, {
                // title: this.opencgaSession.project.name,
                title: "Cohort Stats <span id=\"cohortStatsInfoIcon\"><i class=\"fa fa-info-circle\" style=\"color: #337ab7\" aria-hidden=\"true\"></i></span>",
                field: "cohorts",
                rowspan: 1,
                colspan: cohortStudies.length,
                align: "center"
            });

            for (let i = 0; i < cohortStudies.length; i++) {
                this._columns[1].splice(i + cohortIdx, 0, {
                    title: cohortStudies[i],
                    field: {
                        study: cohortStudies[i],
                        cohorts: this.cohorts[this.opencgaSession.project.id][cohortStudies[i]],
                        colors: this.populationFrequencies.style,
                        context: this
                    },
                    rowspan: 1,
                    colspan: 1,
                    formatter: this.cohortFormatter,
                    align: "center"
                });
            }
        }

        if (typeof this.populationFrequencies !== "undefined" && typeof this.populationFrequencies.studies !== "undefined" && this.populationFrequencies.studies.length > 0) {
            const popIdx = isCohortPresent ? 8 : 7;
            const subPopIdx = isCohortPresent ? 6 + Object.keys(this.cohorts[this.opencgaSession.project.id]).length : 6;

            // Just one column called 'Population Frequencies'
            this._columns[0].splice(popIdx, 0, {
                title: "Population Frequencies <span class=\"popFreqInfoIcon\"><i class=\"fa fa-info-circle\" style=\"color: #337ab7\" aria-hidden=\"true\"></i></span>",
                field: "",
                rowspan: 1,
                colspan: this.populationFrequencies.studies.length,
                align: "center"
            });

            for (let j = 0; j < this.populationFrequencies.studies.length; j++) {
                const populations = [];
                const populationMap = {};
                for (const pop in this.populationFrequencies.studies[j].populations) {
                    populations.push(this.populationFrequencies.studies[j].populations[pop].id);
                    populationMap[this.populationFrequencies.studies[j].populations[pop].id] = true;
                }

                this._columns[1].splice(j + subPopIdx, 0, {
                    title: this.populationFrequencies.studies[j].title,
                    field: {
                        study: this.populationFrequencies.studies[j].id,
                        populations: populations,
                        populationMap: populationMap,
                        colors: this.populationFrequencies.style,
                        context: this
                    },
                    rowspan: 1,
                    colspan: 1,
                    formatter: this.populationFrequenciesFormatter,
                    align: "center"
                });
            }
        }

        if (typeof this._columns !== "undefined" && typeof this.samples !== "undefined" && this.samples.length > 0) {
            this._columns[0].splice(4, 0, {
                title: "Samples",
                field: "samples",
                rowspan: 1,
                colspan: this.samples.length,
                align: "center"
            });
            for (let i = 0; i < this.samples.length; i++) {
                this._columns[1].splice(i, 0, {
                    title: this.samples[i].id,
                    field: "samples",
                    rowspan: 1,
                    colspan: 1,
                    formatter: this.sampleFormatter,
                    align: "center",
                    nucleotideGenotype: true
                });
            }
        }
    }

    onDownload(e) {
        const params = this._getUrlQueryParams();
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

    /* onShare() {
        let _this = this;
        $("[data-toggle=popover]").popover({
            content: function() {
                let getUrlQueryParams = _this._getUrlQueryParams();
                let query = ["limit=1000"];
                for (let key in getUrlQueryParams.queryParams) {
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
    }*/

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 10,
            pageList: [10, 25, 50],
            showExport: false,
            detailView: true,
            detailFormatter: this.detailFormatter,

            showSelectCheckbox: false,
            multiSelection: false,
            nucleotideGenotype: true,
            alleleStringLengthMax: 15,

            header: {
                horizontalAlign: "center",
                verticalAlign: "bottom"
            }
        };
    }

    render() {
        return html`
            <style>
                #opencga-variant-grid {
                    font-size: 12px;
                }
                
                span.redText, span.orangeText {
                    margin-left: 0;
                }
    
                span.redText {
                    color: red;
                }
    
                span.orangeText {
                    color: orange;
                }
    
                .detail-view :hover {
                    background-color: white;
                }
    
                .detail-view-row :hover {
                    background-color: #f5f5f5;
                }
    
                .variant-link-dropdown:hover .dropdown-menu {
                    display: block;
                }
    
                .qtip-custom-class .qtip-content{
                    font-size: 12px;
                }
            </style>
            
            <div>
                <opencb-grid-toolbar    .from="${this.from}"
                                        .to="${this.to}"
                                        .numTotalResultsText="${this.numTotalResultsText}"
                                        .config="${this.toolbarConfig}"
                                        @columnchange="${this.onColumnChange}"
                                        @download="${this.onDownload}"
                                        @sharelink="${this.onShare}">
                </opencb-grid-toolbar>
                
                <div>
                    <table id="${this.gridId}"></table>
                </div>
            </div>
        `;
    }
}

customElements.define("opencga-variant-grid", OpencgaVariantGrid);
