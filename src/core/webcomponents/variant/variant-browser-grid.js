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
import VariantInterpreterGridFormatter from "./interpretation/variant-interpreter-grid-formatter.js";
import GridCommons from "../commons/grid-commons.js";
import VariantUtils from "./variant-utils.js";
import "../commons/opencb-grid-toolbar.js";
import "../loading-spinner.js";


export default class VariantBrowserGrid extends LitElement {

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
            variants: {
                type: Array
            },
            cohorts: {
                type: Array
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

        // Set colors
        this.consequenceTypeColors = VariantGridFormatter.assignColors(consequenceTypes, proteinSubstitutionScore);

        // TODO move to the configuration?
        this.maxNumberOfPages = 1000000;
    }

    connectedCallback() {
        super.connectedCallback();

        this.downloadRefreshIcon = $("#" + this._prefix + "DownloadRefresh");
        this.downloadIcon = $("#" + this._prefix + "DownloadIcon");
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    firstUpdated(_changedProperties) {
        // this.gridCommons = new GridCommons(this.gridId, this, this._config);
        this.table = this.querySelector("#" + this.gridId);
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("query") || changedProperties.has("variants")) {
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
        this.gridCommons = new GridCommons(this.gridId, this, this._config);

        // We parse query fields and store a samples object array for convenience
        const _samples = [];
        if (this.query?.sample) {
            for (const sampleId of this.query.sample.split("[,;]")) {
                _samples.push({
                    id: sampleId.split(":")[0]
                });
            }
        }
        this.samples = _samples;
        const fieldToHide = ["deleteriousness", "cohorts", "conservation", "popfreq", "phenotypes", "clinicalInfo"];
        // Config for the grid toolbar
        this.toolbarConfig = {
            columns: this._createDefaultColumns()
                .flat()
                .filter(f => f.title && !fieldToHide.includes(f.field) && (f.visible ?? true))
        };
        this.requestUpdate();
    }

    onColumnChange(e) {
        this.gridCommons.onColumnChange(e);
    }

    renderVariants() {
        if (this.variants && this.variants.length > 0) {
            this.renderFromLocal();
        } else {
            this.renderRemoteVariants()
        }
        this.requestUpdate();
    }

    renderRemoteVariants() {
        // TODO quickfix. The check on query is required because the study is in the query object. A request without the study returns the error "Multiple projects found"
        if (this.opencgaSession && this.opencgaSession.project && this.opencgaSession.study) {
            this._columns = this._createDefaultColumns();

            this.table = $("#" + this.gridId);
            this.table.bootstrapTable("destroy");
            this.table.bootstrapTable({
                columns: this._columns,
                method: "get",
                sidePagination: "server",

                // Set table properties, these are read from config property
                uniqueId: "id",
                pagination: this._config.pagination,
                pageSize: this._config.pageSize,
                pageList: this._config.pageList,
                paginationVAlign: "both",
                formatShowingRows: (pageFrom, pageTo, totalRows) =>
                    this.gridCommons.formatShowingRows(pageFrom, pageTo, totalRows, this.totalRowsNotTruncated, this.isApproximateCount),
                showExport: this._config.showExport,
                detailView: this._config.detailView,
                detailFormatter: this._config.detailFormatter,
                formatLoadingMessage: () => "<loading-spinner></loading-spinner>",
                // this makes the variant-browser-grid properties available in the bootstrap-table detail formatter
                variantGrid: this,
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
                        .then(res => {
                            params.success(res)
                        })
                        .catch(e => {
                            console.error(e);
                            params.error(e);
                        });
                },
                responseHandler: response => {
                    const result = this.gridCommons.responseHandler(response, $(this.table).bootstrapTable("getOptions"));

                    // Only the first 1M pages must be shown
                    this.totalRowsNotTruncated = null;
                    if (result.response.total / result.pageSize > this.maxNumberOfPages) {
                        this.totalRowsNotTruncated = result.response.total;
                        result.response.total = this.maxNumberOfPages * result.pageSize;
                    }

                    return result.response;
                },
                onClickRow: (row, selectedElement, field) => this.gridCommons.onClickRow(row.id, row, selectedElement),
                onDblClickRow: (row, element, field) => {
                    // We detail view is active we expand the row automatically.
                    // FIXME: Note that we use a CSS class way of knowing if the row is expand or collapse, this is not ideal but works.
                    if (this._config.detailView) {
                        if (element[0].innerHTML.includes("icon-plus")) {
                            $("#" + this.gridId).bootstrapTable("expandRow", element[0].dataset.index);
                        } else {
                            $("#" + this.gridId).bootstrapTable("collapseRow", element[0].dataset.index);
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
                // onPageChange: (page, size) => {
                //     this.from = (page - 1) * size + 1;
                //     this.to = page * size;
                // },
                onExpandRow: (index, row, $detail) => {
                    // Listen to Show/Hide link in the detail formatter consequence type table
                    // TODO Remove this
                    document.getElementById(this._prefix + row.id + "ShowCt").addEventListener("click", VariantGridFormatter.toggleDetailConsequenceType.bind(this));
                    document.getElementById(this._prefix + row.id + "HideCt").addEventListener("click", VariantGridFormatter.toggleDetailConsequenceType.bind(this));

                    UtilsNew.initTooltip(this);
                },
                onPostBody: (data) => {
                }
            });
        }
    }

    renderFromLocal() {
        $("#" + this.gridId).bootstrapTable("destroy");
        $("#" + this.gridId).bootstrapTable({
            data: this.variants,
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
            detailFormatter: this._config.detailFormatter,
            formatLoadingMessage: () => "<loading-spinner></loading-spinner>",
            // this makes the variant-browser-grid properties available in the bootstrap-table detail formatter
            variantGrid: this,
            onClickRow: (row, $element) => {
                this.variant = row.chromosome + ":" + row.start + ":" + row.reference + ":" + row.alternate;
                $(".success").removeClass("success");
                $($element).addClass("success");
            },
            onExpandRow: (index, row, $detail) => {
                // Listen to Show/Hide link in the detail formatter consequence type table
                // TODO Remove this
                document.getElementById(this._prefix + row.id + "ShowCt").addEventListener("click", VariantGridFormatter.toggleDetailConsequenceType.bind(this));
                document.getElementById(this._prefix + row.id + "HideCt").addEventListener("click", VariantGridFormatter.toggleDetailConsequenceType.bind(this));

                UtilsNew.initTooltip(this);
            },
            onPostBody: (data) => {
                // We call onLoadSuccess to select first row, this is only needed when rendering from local
                this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 2);
            }
        });
    }

    detailFormatter(index, row, a) {
        let result = "<div class='row' style='padding-bottom: 20px'>";
        let detailHtml = "";

        if (typeof row !== "undefined" && typeof row.annotation !== "undefined") {
            detailHtml = "<div style='padding: 10px 0px 5px 25px'><h4>Consequence Types</h4></div>";
            detailHtml += "<div style='padding: 5px 40px'>";
            detailHtml += VariantGridFormatter.consequenceTypeDetailFormatter(index, row, this.variantGrid, this.variantGrid.query, this.variantGrid._config, this.variantGrid.opencgaSession.project.organism.assembly);
            detailHtml += "</div>";

            detailHtml += "<div style='padding: 10px 0px 5px 25px'><h4>Clinical Phenotypes</h4></div>";
            detailHtml += "<div style='padding: 5px 40px'>";
            detailHtml += VariantGridFormatter.clinicalTableDetail(index, row);
            detailHtml += "</div>";
        }
        result += detailHtml + "</div>";
        return result;
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
            return `<span style="color: ${this.consequenceTypeColors.pssColor.get(description)}" title=${min}>${description}</span>`;
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
            return `<span style="color: ${this.consequenceTypeColors.pssColor.get(description)}" title=${max}>${description}</span>`;
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
            return VariantGridFormatter.createPopulationFrequenciesTable(this.meta.populations, popFreqMap, this.meta.context.populationFrequencies.style);
        } else {
            return "-";
        }
    }

    _createDefaultColumns() {
        // IMPORTANT: empty columns are not supported in boostrap-table,
        let sampleColumns = [{visible: false}];
        if (this._columns && this.samples && this.samples.length > 0) {
            sampleColumns = [];
            for (let i = 0; i < this.samples.length; i++) {
                sampleColumns.push({
                    title: this.samples[i].id,
                    field: "samples",
                    rowspan: 1,
                    colspan: 1,
                    formatter: VariantInterpreterGridFormatter.sampleGenotypeFormatter,
                    align: "center",
                    nucleotideGenotype: true
                });
            }
        }

        // IMPORTANT: empty columns are not supported in boostrap-table,
        let cohortColumns = [{visible: false}];
        if (this.cohorts?.length > 0) {
            cohortColumns = [];
            for (const study of this.cohorts) {
                cohortColumns.push({
                    title: study.id,
                    field: study.id,
                    meta: {
                        study: study.id,
                        cohorts: study.cohorts,
                        colors: this.populationFrequencies.style,
                        context: this
                    },
                    rowspan: 1,
                    colspan: 1,
                    formatter: this.cohortFormatter,
                    align: "center",
                    eligible: true
                });
            }
        }

        // IMPORTANT: empty columns are not supported in boostrap-table,
        let populationFrequencyColumns = [{visible: false}];
        if (this.populationFrequencies && this.populationFrequencies.studies && this.populationFrequencies.studies.length > 0) {
            populationFrequencyColumns = [];
            for (let j = 0; j < this.populationFrequencies.studies.length; j++) {
                const populations = [];
                const populationMap = {};
                for (const pop in this.populationFrequencies.studies[j].populations) {
                    populations.push(this.populationFrequencies.studies[j].populations[pop].id);
                    populationMap[this.populationFrequencies.studies[j].populations[pop].id] = true;
                }

                populationFrequencyColumns.push({
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

        this._columns = [
            [
                {
                    title: "Variant",
                    field: "id",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row, index) => VariantGridFormatter.variantFormatter(value, row, index, this.opencgaSession.project.organism.assembly, this._config),
                    halign: "center"
                },
                {
                    title: "Gene",
                    field: "gene",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row, index) => VariantGridFormatter.geneFormatter(value, row, index, this.query, this.opencgaSession),
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
                    formatter:(value, row, index) => VariantGridFormatter.consequenceTypeFormatter(value, row, index, this._config.consequenceType, this.consequenceTypeColors),
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
                    // colspan: this.opencgaSession.project.organism.assembly.toUpperCase() === "GRCH37" ? 3 : 2,
                    align: "center"
                },
                {
                    title: "Samples",
                    field: "samples",
                    rowspan: 1,
                    colspan: sampleColumns.length,
                    align: "center",
                    visible: sampleColumns.length > 0 && sampleColumns[0].visible === undefined
                },
                {
                    title: `Cohort Stats <a id="cohortStatsInfoIcon" tooltip-title="Cohort Stats" tooltip-text="${VariantGridFormatter.cohortStatsInfoTooltipContent(this.populationFrequencies)}"><i class="fa fa-info-circle" aria-hidden="true"></i></a>`,
                    field: "cohorts",
                    rowspan: 1,
                    colspan: cohortColumns.length,
                    align: "center",
                    visible: cohortColumns.length > 0 && cohortColumns[0].visible === undefined
                },
                {
                    title: `Population Frequencies <a class="popFreqInfoIcon" tooltip-title="Population Frequencies" tooltip-text="${VariantGridFormatter.populationFrequenciesInfoTooltipContent(this.populationFrequencies)}" tooltip-position-at="left bottom" tooltip-position-my="right top"><i class="fa fa-info-circle" aria-hidden="true"></i></a>`,
                    field: "popfreq",
                    rowspan: 1,
                    colspan: populationFrequencyColumns.length,
                    align: "center",
                    visible: populationFrequencyColumns.length > 0 && populationFrequencyColumns[0].visible === undefined
                },
                {
                    title: `Clinical Info <a id="phenotypesInfoIcon" tooltip-title="Phenotypes" tooltip-text="
                                <div>
                                    <span style='font-weight: bold'>ClinVar</span> is a freely accessible, public archive of reports of the relationships among human variations 
                                    and phenotypes, with supporting evidence.
                                </div>
                                <div style='padding-top: 10px'>
                                    <span style='font-weight: bold'>COSMIC</span> is the world's largest and most comprehensive resource for exploring the impact of somatic mutations in human cancer.
                                </div>"
                            tooltip-position-at="left bottom" tooltip-position-my="right top"><i class="fa fa-info-circle" aria-hidden="true"></i></a>`,
                    field: "clinicalInfo",
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
                    halign: "center",
                    visible: this.opencgaSession.project.organism.assembly.toUpperCase() === "GRCH37"
                },
                ...sampleColumns,
                ...cohortColumns,
                ...populationFrequencyColumns,
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
                },
                {
                    field: "stateCheckBox",
                    checkbox: true,
                    rowspan: 1,
                    colspan: 1,
                    visible: this._config.showSelectCheckbox
                }
            ]
        ];

        return this._columns;
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
            pageList: [5, 10, 25],
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
                gencodeBasic: true,
                filterByBiotype: true,
                filterByConsequenceType: true,

                canonicalTranscript: false,
                highQualityTranscripts: false,
                proteinCodingTranscripts: false,
                worstConsequenceTypes: true,

                showNegativeConsequenceTypes: true
            }
        };
    }

    render() {
        return html`           
            <div>
                <opencb-grid-toolbar    .config="${this.toolbarConfig}"
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

customElements.define("variant-browser-grid", VariantBrowserGrid);
