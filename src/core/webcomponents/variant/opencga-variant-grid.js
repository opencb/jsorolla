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

import {LitElement, html} from "/web_modules/lit-element.js";
import UtilsNew from "./../../utilsNew.js";
import VariantGridFormatter from "./variant-grid-formatter.js";
import GridCommons from "./grid-commons.js";
import VariantUtils from "./variant-utils.js";
import "../commons/opencb-grid-toolbar.js";
import "../loading-spinner.js";


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
        this._prefix = UtilsNew.randomString(8);

        this.gridId = this._prefix + "VariantBrowserGrid";
        this.checkedVariants = new Map();

        // this.rightToolbar = [
        //     {
        //         // visible: "",
        //         render: () => html`
        //                     <button type="button" class="btn btn-default ripple btn-sm dropdown-toggle" data-toggle="dropdown"
        //                             aria-haspopup="true" aria-expanded="false">
        //                         <i class="fas fa-cog icon-padding"></i> Settings
        //                     </button>`
        //     }
        // ];
    }

    connectedCallback() {
        super.connectedCallback();
        this.downloadRefreshIcon = $("#" + this._prefix + "DownloadRefresh");
        this.downloadIcon = $("#" + this._prefix + "DownloadIcon");
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    firstUpdated(_changedProperties) {
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
        this.table = this.querySelector("#" + this.gridId);
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("query") || changedProperties.has("data")) {
            this.propertyObserver();
            this.renderVariants();
        }
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
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
        const colors = VariantGridFormatter.assignColors(this.consequenceTypes, this.proteinSubstitutionScores);
        // TODO proper fix
        //Object.assign(this, colors);
        this.consequenceTypeColors = colors;

        // Config for the grid toolbar
        this.toolbarConfig = {
            columns: this._createDefaultColumns().flat().filter(f => !["deleteriousness", "conservation", "popfreq", "phenotypes"].includes(f.field)),
        };
    }

    onColumnChange(e) {
        this.gridCommons.onColumnChange(e);
    }

    renderVariants() {
        this.renderVariantTable();
        // if (this._config.renderLocal) {
        //     this.renderFromLocal();
        // } else {
        //     this.renderVariantTable();
        // }
        this.requestUpdate();
    }

    renderVariantTable() {
        this.from = 1;
        this.to = this._config.pageSize;
        this.approximateCountResult = false;

        // TODO quickfix. The check on query is required because the study is in the query object. A request without the study returns the error "Multiple projects found"
        if (this.opencgaSession && this.opencgaSession.project && this.opencgaSession.study) {
            this._columns = this._createDefaultColumns();

            // Config for the grid toolbar
            this.toolbarConfig = {
                columns: this._createDefaultColumns().flat().filter(f => !["deleteriousness", "cohorts", "conservation", "popfreq", "phenotypes"].includes(f.field))
            };

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
                paginationVAlign: "both",
                formatShowingRows: this.gridCommons.formatShowingRows,
                showExport: _this._config.showExport,
                detailView: _this._config.detailView,
                detailFormatter: _this._config.detailFormatter,
                // showColumns : false,
                // showColumnsToggleAll: false,
                formatLoadingMessage: () => "<loading-spinner></loading-spinner>",
                // this makes the opencga-variant-grid properties available in the bootstrap-table detail formatter
                variantGrid: _this,
                ajax: params => {
                    // TODO We must decide i this component support a porperty:  mode = {opencga | cellbase}
                    let tableOptions = $(this.table).bootstrapTable("getOptions");
                    let filters = {
                        study: this.opencgaSession.study.fqn,
                        limit: params.data.limit || tableOptions.pageSize,
                        skip: params.data.offset || 0,
                        count: !tableOptions.pageNumber || tableOptions.pageNumber === 1,
                        summary: !this.query.sample && !this.query.family,
                        ...this.query
                    };

                    this.opencgaSession.opencgaClient.variants().query(filters)
                        .then(res => params.success(res))
                        .catch(e => {
                            console.error(e);
                            params.error(e);
                        });
                },
                responseHandler: response => {
                    const result = this.gridCommons.responseHandler(response, $(this.table).bootstrapTable("getOptions"));
                    this.from = result.from || this.from;
                    this.to = result.to || this.to;
                    this.numTotalResultsText = result.numTotalResultsText || this.numTotalResultsText;
                    this.approximateCountResult = result.approximateCountResult;
                    this.requestUpdate();
                    return result.response;
                },
                onClickRow: (row, selectedElement, field) => this.gridCommons.onClickRow(row.id, row, selectedElement),
                onDblClickRow: function (row, element, field) {
                    // We detail view is active we expand the row automatically.
                    // FIXME: Note that we use a CSS class way of knowing if the row is expand or collapse, this is not ideal but works.
                    if (_this._config.detailView) {
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
                            $(this.table).bootstrapTable("check", i);
                        }
                    }
                    this.gridCommons.onLoadSuccess(data, 2);
                },
                onLoadError: (e, restResponse) => this.gridCommons.onLoadError(e, restResponse),
                onPageChange: (page, size) => {
                    this.from = (page - 1) * size + 1;
                    this.to = page * size;
                },
                onExpandRow: (index, row, $detail) => {
                    // Listen to Show/Hide link in the detail formatter consequence type table
                    // TODO Remove this
                    document.getElementById(this._prefix + row.id + "ShowCt").addEventListener("click", this.variantGridFormatter.toggleDetailConsequenceType.bind(this));
                    document.getElementById(this._prefix + row.id + "HideCt").addEventListener("click", this.variantGridFormatter.toggleDetailConsequenceType.bind(this));
                },
                onPostBody: (data) => {
                    // TODO remove (review this.sampleFormatter)
                    $("span.sampleGenotype").qtip({
                        content: {
                            title: "More info",
                            text: function (event, api) {
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

                    // TODO continue. remove the following lines and use UtilsNew.initTooltip
                    // Add tooltips
                    //_this.variantGridFormatter.addTooltip("div.variant-tooltip", "Links");
                    //_this.variantGridFormatter.addTooltip("span.gene-tooltip", "Links");
                    //this.variantGridFormatter.addCohortStatsInfoTooltip("cohortStatsInfoIcon", _this.populationFrequencies);
                    //this.variantGridFormatter.addPopulationFrequenciesInfoTooltip("span.popFreqInfoIcon", _this.populationFrequencies);
                    //this.variantGridFormatter.addPhenotypesInfoTooltip("phenotypesInfoIcon");
                    //this.variantGridFormatter.addTooltip("span.cosmic-tooltip", "Links");
                    //this.variantGridFormatter.addTooltip("div.clinvar-tooltip", "Links");
                    //this.variantGridFormatter.addPopulationFrequenciesTooltip("table.populationFrequenciesTable", _this.populationFrequencies);
                    //this.variantGridFormatter.addPopulationFrequenciesTooltip("table.cohortStatsTable", _this.populationFrequencies);

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
            onClickRow: function (row, $element) {
                _this.variant = row.chromosome + ":" + row.start + ":" + row.reference + ":" + row.alternate;
                $(".success").removeClass("success");
                $($element).addClass("success");
            }
        });
    }

    // TODO is this being used?
    detailFormatter(index, row, a) {
        let result = "<div class='row' style='padding-bottom: 20px'>";
        let detailHtml = "";
        if (typeof row !== "undefined" && typeof row.annotation !== "undefined") {
            detailHtml = "<div style='padding: 10px 0px 10px 25px'><h4>Consequence Types</h4></div>";
            detailHtml += "<div style='padding: 5px 50px'>";
            detailHtml += VariantGridFormatter.consequenceTypeDetailFormatter(index, row, this.variantGrid, this.variantGrid.query, this.variantGrid._config);
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
        return VariantGridFormatter.variantFormatter(value, row, this._config);
    }

    siftPproteinScoreFormatter(value, row, index) {
        let min = 10;
        let description = "";
        if (row && row.annotation?.consequenceTypes?.length > 0) {
            for (let i = 0; i < row.annotation.consequenceTypes.length; i++) {
                if (row.annotation.consequenceTypes[i]?.proteinVariantAnnotation?.substitutionScores) {
                    for (let j = 0; j < row.annotation.consequenceTypes[i].proteinVariantAnnotation.substitutionScores.length; j++) {
                        let substitutionScore = row.annotation.consequenceTypes[i].proteinVariantAnnotation.substitutionScores[j];
                        if (substitutionScore.source === "sift" && substitutionScore.score < min) {
                            min = substitutionScore.score;
                            description = substitutionScore.description;
                        }
                    }
                }
            }
        }

        if (min < 10) {
            return `<span style="color: ${this.pssColor.get(description)}" title=${min}>${description}</span>`;
        }
        return "-";
    }

    polyphenProteinScoreFormatter(value, row, index) {
        let max = 0;
        let description = "";
        if (row && row.annotation?.consequenceTypes?.length > 0) {
            for (let i = 0; i < row.annotation.consequenceTypes.length; i++) {
                if (row.annotation.consequenceTypes[i]?.proteinVariantAnnotation?.substitutionScores) {
                    for (let j = 0; j < row.annotation.consequenceTypes[i].proteinVariantAnnotation.substitutionScores.length; j++) {
                        let substitutionScore = row.annotation.consequenceTypes[i].proteinVariantAnnotation.substitutionScores[j];
                        if (substitutionScore.source === "polyphen" && substitutionScore.score >= max) {
                            max = substitutionScore.score;
                            description = substitutionScore.description;
                        }
                    }
                }
            }
        }

        if (max > 0) {
            return `<span style="color: ${this.pssColor.get(description)}" title=${max}>${description}</span>`;
        }
        return "-";
    }

    caddScaledFormatter(value, row, index) {
        if (row && row.type !== "INDEL" && row.annotation?.functionalScore?.length > 0) {
            for (let functionalScore of row.annotation.functionalScore) {
                if (functionalScore.source === "cadd_scaled") {
                    const value = Number(functionalScore.score).toFixed(2);
                    if (value < 15) {
                        return value;
                    } else {
                        return "<span style=\"color: red\">" + value + "</span>";
                    }
                }
            }
        } else {
            return "-";
        }
    }

    conservationFormatter(value, row, index) {
        if (row && row.annotation?.conservation?.length > 0) {
            for (let conservation of row.annotation.conservation) {
                if (conservation.source === this.field) {
                    return Number(conservation.score).toFixed(3);
                }
            }
        } else {
            return "-";
        }
    }

    cohortFormatter(value, row, index) {
        // TODO where does meta comes from?
        //console.error(this.meta)

        if (row && row.studies?.length > 0 && row.studies[0].stats) {
            const cohortStats = new Map();
            for (const study of row.studies) {
                if (study.studyId === this.meta.study) {
                    for (const cohortStat of study.stats) {
                        cohortStats.set(cohortStat.cohortId, Number(cohortStat.altAlleleFreq).toFixed(4));
                    }
                    break;
                }
            }
            return VariantGridFormatter.createCohortStatsTable(this.meta.cohorts, cohortStats, this.meta.context.populationFrequencies.style);
        } else {
            return "-";
        }
    }

    populationFrequenciesFormatter(value, row, index) {
        if (row && row.annotation?.populationFrequencies) {
            const popFreqMap = new Map();
            for (const popFreqIdx in row.annotation.populationFrequencies) {
                const popFreq = row.annotation.populationFrequencies[popFreqIdx];
                if (this.meta.study === popFreq.study) { // && this.meta.populationMap[popFreq.population] === true
                    popFreqMap.set(popFreq.population, Number(popFreq.altAlleleFreq).toFixed(4));
                }
            }
            return VariantGridFormatter.createPopulationFrequenciesTable(this.meta.populations,
                popFreqMap, this.meta.context.populationFrequencies.style);
        } else {
            return "-";
        }
    }

    // TODO Nacho to review and improve this function
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
                    formatter: (value, row, index) => VariantGridFormatter.snpFormatter(value, row, index, this.opencgaSession.project.organism.assembly),
                    halign: "center"
                },
                {
                    title: "Gene",
                    field: "gene",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row, index) => VariantGridFormatter.geneFormatter(value, row, index, this.opencgaSession),
                    halign: "center"
                },
                {
                    title: "Type",
                    field: "type",
                    rowspan: 2,
                    colspan: 1,
                    formatter: VariantGridFormatter.typeFormatter.bind(this),
                    halign: "center"
                },
                {
                    title: "Consequence Type",
                    field: "consequenceType",
                    rowspan: 2,
                    colspan: 1,
                    // formatteformatter: this.variantGridFormatter.consequenceTypeFormatter.bind(this),
                    formatter:(value, row, index) => VariantGridFormatter.consequenceTypeFormatter(value, row, index, this.gridConsequenceTypeSettings, this.consequenceTypeColors),
                    halign: "center"
                },
                {
                    title: `Deleteriousness <a tooltip-title="Deleteriousness" tooltip-text="SIFT scores are classified into tolerated and deleterious.
                        Polyphen scores are classified into benign, possibly damaging, probably damaging and possibly & probably damaging.
                        Please, leave the cursor over each tag to visualize the actual score value.
                        SIFT score takes values in the range [0, infinite[, the lower the values, the more damaging the prediction.
                        Polyphen score takes values in the range [0, 1[, the closer to 2, the more damaging the prediction.">
                        <i class="fa fa-info-circle" aria-hidden="true"></i></a>`,
                    field: "deleteriousness",
                    rowspan: 1,
                    colspan: 3,
                    align: "center"
                },
                {
                    title: `Conservation  <a tooltip-title='Conservation' tooltip-text="Positive PhyloP scores measure conservation which is slower evolution than expected, at sites that are predicted to be conserved. Negative PhyloP scores measure acceleration, which is faster evolution than expected, at sites that are predicted to be fast-evolving. Absolute values of phyloP scores represent -log p-values under a null hypothesis of neutral evolution. The phastCons scores represent probabilities of negative selection and range between 0 and 1. Positive GERP scores represent a substitution deficit and thus indicate that a site may be under evolutionary constraint. Negative scores indicate that a site is probably evolving neutrally. Some authors suggest that a score threshold of 2 provides high sensitivity while still strongly enriching for truly constrained sites"><i class="fa fa-info-circle" aria-hidden="true"></i></a>`,
                    field: "conservation",
                    rowspan: 1,
                    colspan: 3,
                    align: "center"
                },
                {
                    title: `Phenotypes <a id="phenotypesInfoIcon" tooltip-title="Phenotypes" tooltip-text="
                            <div>
                                <span style='font-weight: bold'>ClinVar</span> is a freely accessible, public archive of reports of the relationships among human variations 
                                and phenotypes, with supporting evidence.
                            </div>
                            <div style='padding-top: 10px'>
                                <span style='font-weight: bold'>COSMIC</span> is the world's largest and most comprehensive resource for exploring the impact of somatic mutations in human cancer.
                            </div>"
                        tooltip-position-at="left bottom" tooltip-position-my="right top"><i class="fa fa-info-circle" aria-hidden="true"></i></a>`,
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
                    formatter: VariantGridFormatter.clinicalPhenotypeFormatter,
                    align: "center"
                },
                {
                    title: "Cosmic",
                    field: "cosmic",
                    colspan: 1,
                    rowspan: 1,
                    formatter: VariantGridFormatter.clinicalPhenotypeFormatter,
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
                title: `Cohort Stats <a id="cohortStatsInfoIcon" tooltip-title="Cohort Stats" tooltip-text="${VariantGridFormatter.cohortStatsInfoTooltipContent(this.populationFrequencies)}"><i class="fa fa-info-circle" aria-hidden="true"></i></a>`,
                field: "cohorts",
                rowspan: 1,
                colspan: cohortStudies.length,
                align: "center"
            });

            for (let i = 0; i < cohortStudies.length; i++) {
                this._columns[1].splice(i + cohortIdx, 0, {
                    title: cohortStudies[i],
                    field: cohortStudies[i],
                    meta: {
                        study: cohortStudies[i],
                        cohorts: this.cohorts[this.opencgaSession.project.id][cohortStudies[i]],
                        colors: this.populationFrequencies.style,
                        context: this
                    },
                    rowspan: 1,
                    colspan: 1,
                    formatter: this.cohortFormatter,
                    align: "center",
                    eligible: false
                });
            }
        }

        if (typeof this.populationFrequencies !== "undefined" && typeof this.populationFrequencies.studies !== "undefined" && this.populationFrequencies.studies.length > 0) {
            const popIdx = isCohortPresent ? 8 : 7;
            const subPopIdx = isCohortPresent ? 6 + Object.keys(this.cohorts[this.opencgaSession.project.id]).length : 6;

            // Just one column called 'Population Frequencies'
            this._columns[0].splice(popIdx, 0, {
                title: `Population Frequencies <a class="popFreqInfoIcon" tooltip-title="Population Frequencies" tooltip-text="${VariantGridFormatter.populationFrequenciesInfoTooltipContent(this.populationFrequencies)}" tooltip-position-at="left bottom" tooltip-position-my="right top"><i class="fa fa-info-circle" aria-hidden="true"></i></a>`,
                field: "popfreq",
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
                    field: this.populationFrequencies.studies[j].id,
                    meta: {
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

    async onDownload(e) {
        this.toolbarConfig = {...this.toolbarConfig, downloading: true};
        await this.requestUpdate();
        let params = {
            study: this.opencgaSession.study.fqn,
            limit: 1000,
            summary: !this.query.sample && !this.query.family,
            ...this.query
        };
        this.opencgaSession.opencgaClient.variants().query(params)
            .then(response => {
                const results = response.getResults();
                // Check if user clicked in Tab or JSON format
                if (e.detail.option.toLowerCase() === "tab") {
                    const dataString = VariantUtils.jsonToTabConvert(results, this.populationFrequencies.studies, this.samples, this._config.nucleotideGenotype);
                    UtilsNew.downloadData(dataString, "variants_" + this.opencgaSession.study.id + ".txt", "text/plain");
                } else {
                    UtilsNew.downloadData(JSON.stringify(results), "variants_" + this.opencgaSession.study.id + ".json", "application/json");
                }
            })
            .catch(response => {
                console.log(response);
                UtilsNew.notifyError(response);
            })
            .finally(() => {
                this.toolbarConfig = {...this.toolbarConfig, downloading: false};
                this.requestUpdate();
            });
    }

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
            },
            consequenceType: {
                gencodeBasic: false,
                filterByBiotype: true,
                filterByConsequenceType: true,
            }
        };
    }

    onChangeSettings(filter, e) {
        if (!this.gridConsequenceTypeSettings) {
            this.gridConsequenceTypeSettings = {};
        }
        this.gridConsequenceTypeSettings[filter] = e.currentTarget.checked;
        // switch (filter) {
        //     case "canonicalTranscript":
        //     case "proteinCodingTranscript":
        //         break;
        //     case "worstConsequenceType":
        //         break;
        //     case "loftConsequenceType":
        //         break;
        //
        // }
    }

    onApplySettings(e) {
        // console.log(e)
        // this.table = $("#" + this.gridId);
        // this.table.bootstrapTable("refresh");
        this.renderVariants();
        // debugger
    }

    getRightToolbar() {
        return [
            {
                // visible: "",
                render: () => html`
                    <button type="button" class="btn btn-default btn-sm dropdown-toggle ripple" data-toggle="dropdown"
                            aria-haspopup="true" aria-expanded="false">
                        <i class="fas fa-cog icon-padding"></i> Settings
                    </button>
                    <ul class="dropdown-menu dropdown-menu-right" aria-labelledby="${this._prefix}SaveMenu" style="width: 360px">
                    <li style="margin: 5px 10px">
                        <h4>Consequence Types</h4>
                        <span class="help-block">You can filter which transcripts and consequence types are displayed in the variant grid</span>
                        <div style="margin: 0px 5px">
                            <label class="control-label">Select Transcripts</label>
                        </div>
                        <div style="margin: 0px 10px">
                            <div>
                                <input type="checkbox" class="form-control" @click="${e => this.onChangeSettings("canonicalTranscript", e)}">
                                <span style="margin: 0px 5px">Canonical Transcript</span>
                            </div>
                            <div>
                                <input type="checkbox" class="form-control" @click="${e => this.onChangeSettings("highQualityTranscript", e)}">
                                <span style="margin: 0px 5px">High Quality Transcript</span>
                            </div>
                            <div>
                                <input type="checkbox" class="form-control" @click="${e => this.onChangeSettings("proteinCodingTranscript", e)}">
                                <span style="margin: 0px 5px">Protein Coding</span>
                            </div>
                        </div>
                        
                        <div style="margin: 5px 5px">
                            <label>Select Consequence Types</label>
                        </div>
                        <div style="margin: 0px 10px">
                            <div>
                                <input type="checkbox" class="form-control" @click="${e => this.onChangeSettings("worstConsequenceType", e)}">
                                <span style="margin: 0px 5px">Worst Consequence Type</span>
                            </div>
                            <div>
                                <input type="checkbox" class="form-control" @click="${e => this.onChangeSettings("loftConsequenceType", e)}">
                                <span style="margin: 0px 5px">Loss-of-Function</span>
                            </div>
                        </div>
                    </li>
                    <li role="separator" class="divider"></li>
                    <li style="margin: 5px 10px">
                        <div style="float: right">
                            <button type="button" class="btn btn-primary" 
                                @click="${e => this.onApplySettings(e)}" style="margin: 5px">Apply
                            </button>
                            <button type="button" class="btn btn-primary disabled" 
                                @click="${this.onSaveInterpretation}" style="margin: 5px">Save
                            </button>
                        </div>
                    </li>
                </ul>`
            }
        ];
    }

    render() {
        return html`           
            <div>
                <opencb-grid-toolbar    .config="${this.toolbarConfig}"
                                        .rightToolbar="${this.getRightToolbar()}"
                                        @columnChange="${this.onColumnChange}"
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
