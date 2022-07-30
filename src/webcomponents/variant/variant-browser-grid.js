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

import {LitElement, html} from "lit";
import UtilsNew from "./../../core/utilsNew.js";
import VariantGridFormatter from "./variant-grid-formatter.js";
import VariantInterpreterGridFormatter from "./interpretation/variant-interpreter-grid-formatter.js";
import GridCommons from "../commons/grid-commons.js";
import VariantUtils from "./variant-utils.js";
import "../commons/opencb-grid-toolbar.js";
import "../loading-spinner.js";
import LitUtils from "../commons/utils/lit-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import {CellBaseClient} from "../../core/clients/cellbase/cellbase-client";


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
        this.consequenceTypeColors = VariantGridFormatter.assignColors(CONSEQUENCE_TYPES, PROTEIN_SUBSTITUTION_SCORE);

        // TODO move to the configuration?
        this.maxNumberOfPages = 1000000;
    }

    connectedCallback() {
        super.connectedCallback();

        // this.downloadRefreshIcon = $("#" + this._prefix + "DownloadRefresh");
        // this.downloadIcon = $("#" + this._prefix + "DownloadIcon");
        // this._config = {...this.getDefaultConfig(), ...this.config};
    }

    firstUpdated() {
        // this.gridCommons = new GridCommons(this.gridId, this, this._config);
        this.table = this.querySelector("#" + this.gridId);
        this.downloadRefreshIcon = $("#" + this._prefix + "DownloadRefresh");
        this.downloadIcon = $("#" + this._prefix + "DownloadIcon");
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        if (changedProperties.has("query") || changedProperties.has("variants")) {
            this.propertyObserver();
            this.renderVariants();
        }
        if (changedProperties.has("config")) {
            this.configObserver();
            this.requestUpdate();
            this.renderVariants();
        }
    }

    opencgaSessionObserver() {
        // With each property change we must updated config and create the columns again. No extra checks are needed.
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
    }

    propertyObserver() {
        // We parse query fields and store a samples object array for convenience
        const _samples = [];
        if (this.query?.sample) {
            for (const sampleId of this.query.sample.split(new RegExp("[,;]"))) {
                _samples.push(
                    {
                        id: sampleId.split(":")[0]
                    }
                );
            }
        }
        this.samples = _samples;
        this.requestUpdate();
    }

    configObserver() {
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);

        // Config for the grid toolbar
        this.toolbarConfig = {
            resource: "VARIANT",
            showExport: true,
            exportTabs: ["download", "export", "link", "code"], // this is customisable in external settings in `table.toolbar`
            ...this._config.toolbar,
            columns: this._getDefaultColumns()[0].filter(col => col.rowspan === 2 && col.colspan === 1 && col.visible !== false), // flat list for the column dropdown
            gridColumns: this._getDefaultColumns() // original column structure
        };
    }

    onColumnChange(e) {
        this.gridCommons.onColumnChange(e);
    }

    renderVariants() {
        if (this.variants && this.variants.length > 0) {
            this.renderFromLocal();
        } else {
            this.renderRemoteVariants();
        }
        // this.requestUpdate();
    }

    renderRemoteVariants() {
        if (this.opencgaSession?.study) {
            this._columns = this._getDefaultColumns();

            this.table = $("#" + this.gridId);
            this.table.bootstrapTable("destroy");
            this.table.bootstrapTable({
                columns: this._columns,
                method: "get",
                sidePagination: "server",
                iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
                icons: GridCommons.GRID_ICONS,
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
                    const tableOptions = $(this.table).bootstrapTable("getOptions");
                    const filters = {
                        study: this.opencgaSession.study.fqn,
                        limit: params.data.limit || tableOptions.pageSize,
                        skip: params.data.offset || 0,
                        count: !tableOptions.pageNumber || tableOptions.pageNumber === 1,
                        includeStudy: "all",
                        includeSampleId: "true",
                        // summary: !this.query.sample && !this.query.family,
                        ...this.query
                    };
                    this.opencgaSession.opencgaClient.variants().query(filters)
                        .then(res => {
                            // FIXME A quick temporary fix -> TASK-947
                            if (this.opencgaSession?.project?.cellbase?.version === "v4" || this.opencgaSession?.project?.internal?.cellbase?.version === "v4") {
                                let found = false;
                                const variants = res.responses[0].results;
                                for (const variant of variants) {
                                    for (const ct of variant.annotation.consequenceTypes) {
                                        if (ct.transcriptFlags || ct.transcriptAnnotationFlags) {
                                            found = true;
                                            break;
                                        }
                                    }
                                }

                                if (!found) {
                                    this.cellbaseClient = new CellBaseClient({
                                        host: this.opencgaSession?.project?.cellbase?.url || this.opencgaSession?.project?.internal?.cellbase?.url,
                                        // host: "https://ws.opencb.org/cellbase-4.8.2",
                                        version: "v4",
                                        species: "hsapiens",
                                    });
                                    const variantIds = variants.map(v => v.id);
                                    this.cellbaseClient.get("genomic", "variant", variantIds.join(","), "annotation", {
                                        assembly: this.opencgaSession.project.organism.assembly,
                                        exclude: "populationFrequencies,conservation,expression,geneDisease,drugInteraction"
                                    }).then(response => {
                                        const annotatedVariants = response.responses;
                                        for (let i = 0; i < variants.length; i++) {
                                            // Store annotatedVariant in a Map, so we can search later and we do not need them to have the same order
                                            const annotatedVariantsMap = new Map();
                                            for (const av of annotatedVariants[i].results[0].consequenceTypes) {
                                                // We can ignore the CTs without ensemblTranscriptId since they do not have flags.
                                                if (av.ensemblTranscriptId) {
                                                    annotatedVariantsMap.set(av.ensemblTranscriptId, av);
                                                }
                                            }

                                            for (let j = 0; j < variants[i].annotation.consequenceTypes.length; j++) {
                                                if (variants[i].annotation.consequenceTypes[j].ensemblTranscriptId) {
                                                    // We can ignore the CTs without ensemblTranscriptId since they do not have flags.
                                                    const annotatedVariant = annotatedVariantsMap.get(variants[i].annotation.consequenceTypes[j].ensemblTranscriptId).transcriptAnnotationFlags;
                                                    if (annotatedVariant) {
                                                        variants[i].annotation.consequenceTypes[j].transcriptFlags = annotatedVariant;
                                                        variants[i].annotation.consequenceTypes[j].transcriptAnnotationFlags = annotatedVariant;
                                                    }
                                                }
                                                // if (variants[i].annotation.consequenceTypes[j].ensemblTranscriptId) {
                                                //     variants[i].annotation.consequenceTypes[j].transcriptFlags = annotatedVariantsMap.get(variants[i].annotation.consequenceTypes[j].ensemblTranscriptId).transcriptAnnotationFlags;
                                                //     variants[i].annotation.consequenceTypes[j].transcriptAnnotationFlags = annotatedVariantsMap.get(variants[i].annotation.consequenceTypes[j].ensemblTranscriptId).transcriptAnnotationFlags;
                                                // }
                                            }
                                        }
                                    }).catch(error => {
                                        console.log(error);
                                    });
                                }
                            }

                            params.success(res);
                        })
                        .catch(e => params.error(e))
                        .finally(() => {
                            LitUtils.dispatchCustomEvent(this, "queryComplete", null);
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
                onClickRow: (row, selectedElement) => {
                    this.gridCommons.onClickRow(row.id, row, selectedElement);
                },
                onDblClickRow: (row, element) => {
                    // We detail view is active we expand the row automatically.
                    // FIXME: Note that we use a CSS class way of knowing if the row is expand or collapse, this is not ideal but works.
                    if (this._config.detailView) {
                        if (element[0].innerHTML.includes("fa-plus")) {
                            $("#" + this.gridId).bootstrapTable("expandRow", element[0].dataset.index);
                        } else {
                            $("#" + this.gridId).bootstrapTable("collapseRow", element[0].dataset.index);
                        }
                    }
                },
                onLoadSuccess: data => {
                    // We keep the table rows as global variable, needed to fetch the variant object when checked
                    this._rows = data.rows;
                    this.gridCommons.onLoadSuccess(data, 2);
                },
                onLoadError: (e, restResponse) => this.gridCommons.onLoadError(e, restResponse),
                onExpandRow: (index, row) => {
                    this.gridCommons.onClickRow(row.id, row, this.querySelector(`tr[data-index="${index}"]`));

                    // Listen to Show/Hide link in the detail formatter consequence type table
                    // TODO Remove this
                    document.getElementById(this._prefix + row.id + "ShowCt").addEventListener("click", VariantGridFormatter.toggleDetailConsequenceType.bind(this));
                    document.getElementById(this._prefix + row.id + "HideCt").addEventListener("click", VariantGridFormatter.toggleDetailConsequenceType.bind(this));

                    UtilsNew.initTooltip(this);
                },
                // onPostBody: data => {},
                rowStyle: (row, index) => this.gridCommons.rowHighlightStyle(row, index),
            });
        }
    }

    renderFromLocal() {
        $("#" + this.gridId).bootstrapTable("destroy");
        $("#" + this.gridId).bootstrapTable({
            data: this.variants,
            columns: this._getDefaultColumns(),
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
            onExpandRow: (index, row) => {
                this.gridCommons.onClickRow(row.id, row, this.querySelector(`tr[data-index="${index}"]`));

                // Listen to Show/Hide link in the detail formatter consequence type table
                // TODO Remove this
                document.getElementById(this._prefix + row.id + "ShowCt").addEventListener("click", VariantGridFormatter.toggleDetailConsequenceType.bind(this));
                document.getElementById(this._prefix + row.id + "HideCt").addEventListener("click", VariantGridFormatter.toggleDetailConsequenceType.bind(this));

                UtilsNew.initTooltip(this);
            },
            onPostBody: data => {
                // We call onLoadSuccess to select first row, this is only needed when rendering from local
                this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 2);
            },
            rowStyle: (row, index) => this.gridCommons.rowHighlightStyle(row, index),
        });
    }

    onConfigClick(e) {
        $("#" + this._prefix + "ConfigModal").modal("show");
    }

    detailFormatter(index, row, a) {
        let result = "<div class='row' style='padding-bottom: 20px'>";
        let detailHtml = "";

        if (row?.annotation) {
            detailHtml = "<div style='padding: 10px 0px 5px 25px'><h4>Consequence Types</h4></div>";
            detailHtml += "<div style='padding: 5px 40px'>";
            detailHtml += VariantGridFormatter
                .consequenceTypeDetailFormatter(index, row, this.variantGrid, this.variantGrid.query, this.variantGrid._config, this.variantGrid.opencgaSession.project.organism.assembly);
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
                        const substitutionScore = row.annotation.consequenceTypes[i].proteinVariantAnnotation.substitutionScores[j];
                        if (substitutionScore.source === "sift" && substitutionScore.score < min) {
                            min = substitutionScore.score;
                            description = substitutionScore.description;
                        }
                    }
                }
            }
        }

        if (min < 10) {
            return `<span style="color: ${this.consequenceTypeColors.pssColor.get("sift")[description]}" title=${min}>${description}</span>`;
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
                        const substitutionScore = row.annotation.consequenceTypes[i].proteinVariantAnnotation.substitutionScores[j];
                        if (substitutionScore.source === "polyphen" && substitutionScore.score >= max) {
                            max = substitutionScore.score;
                            description = substitutionScore.description;
                        }
                    }
                }
            }
        }

        if (max > 0) {
            return `<span style="color: ${this.consequenceTypeColors.pssColor.get("polyphen")[description]}" title=${max}>${description}</span>`;
        }
        return "-";
    }

    revelProteinScoreFormatter(value, row, index) {
        let max = 0;
        if (row && row.annotation?.consequenceTypes?.length > 0) {
            for (let i = 0; i < row.annotation.consequenceTypes.length; i++) {
                if (row.annotation.consequenceTypes[i]?.proteinVariantAnnotation?.substitutionScores) {
                    for (let j = 0; j < row.annotation.consequenceTypes[i].proteinVariantAnnotation.substitutionScores.length; j++) {
                        const substitutionScore = row.annotation.consequenceTypes[i].proteinVariantAnnotation.substitutionScores[j];
                        if (substitutionScore.source === "revel" && substitutionScore.score >= max) {
                            max = substitutionScore.score;
                        }
                    }
                }
            }
        }

        if (max > 0) {
            return `<span style="color: ${max > 0.5 ? "darkorange" : "black"}" title=${max}>${max}</span>`;
        }
        return "-";
    }

    caddScaledFormatter(value, row, index) {
        if (row && row.type !== "INDEL" && row.annotation?.functionalScore?.length > 0) {
            for (const functionalScore of row.annotation.functionalScore) {
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
        if (row?.annotation?.conservation?.length > 0) {
            for (const conservation of row.annotation.conservation) {
                if (conservation.source === this.field) {
                    return Number(conservation.score).toFixed(3);
                }
            }
            return "-";
        } else {
            return "-";
        }
    }

    cohortFormatter(value, row, index) {
        if (row && row.studies?.length > 0 && row.studies[0].stats) {
            const cohortStats = new Map();
            for (const study of row.studies) {
                // Now we support both study.is and study.fqn
                const metaStudy = study.studyId.includes("@") ? this.meta.study : this.meta.study.split(":")[1];
                if (study.studyId === metaStudy) {
                    for (const cohortStat of study.stats) {
                        const freq = Number(cohortStat.altAlleleFreq);
                        cohortStats.set(cohortStat.cohortId, freq > 0 ? freq.toPrecision(4) : 0);
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
            // eslint-disable-next-line guard-for-in
            for (const popFreqIdx in row.annotation.populationFrequencies) {
                const popFreq = row.annotation.populationFrequencies[popFreqIdx];
                if (this.meta.study === popFreq.study) { // && this.meta.populationMap[popFreq.population] === true
                    const freq = Number(popFreq.altAlleleFreq);
                    popFreqMap.set(popFreq.population, freq > 0 ? freq.toPrecision(4) : 0);
                }
            }
            return VariantGridFormatter.createPopulationFrequenciesTable(this.meta.populations, popFreqMap, this.meta.context.populationFrequencies.style);
        } else {
            return "-";
        }
    }

    onCheck(e) {
        const variantId = e.currentTarget.dataset.variantId;
        const variant = this._rows.find(e => e.id === variantId);

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

    checkFormatter(value, row) {
        const checked = this.checkedVariants && this.checkedVariants.has(row.id) ? "checked" : "";
        return `<input class="Check check-variant" type="checkbox" data-variant-id="${row.id}" ${checked}>`;
    }

    _getDefaultColumns() {
        // IMPORTANT: empty columns are not supported in boostrap-table,
        let sampleColumns = [{visible: false}];
        if (this.samples?.length > 0) {
            sampleColumns = [];
            for (let i = 0; i < this.samples.length; i++) {
                sampleColumns.push({
                    id: this.samples[i].id,
                    title: this.samples[i].id,
                    // field: "samples",
                    field: {
                        memberIdx: i,
                        memberName: this.samples[i].id,
                        sampleId: this.samples[i].id,
                        config: this._config
                    },
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
                    id: study.id,
                    title: study.id,
                    field: study.id,
                    meta: {
                        study: study.fqn,
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
                // eslint-disable-next-line guard-for-in
                for (const pop in this.populationFrequencies.studies[j].populations) {
                    populations.push(this.populationFrequencies.studies[j].populations[pop].id);
                    populationMap[this.populationFrequencies.studies[j].populations[pop].id] = true;
                }

                // FIXME CellBase v5 uses 1000G while v4 uses 1kG_phase3, remove this in v2.3
                if (this.populationFrequencies.studies[j].id === "1000G" &&
                    (this.opencgaSession.project?.cellbase?.version === "v4" || this.opencgaSession.project?.internal?.cellbase?.version === "v4")) {
                    this.populationFrequencies.studies[j].id = "1kG_phase3";
                }

                populationFrequencyColumns.push({
                    id: this.populationFrequencies.studies[j].id,
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
                    id: "id",
                    title: "Variant",
                    field: "id",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row, index) =>
                        VariantGridFormatter.variantFormatter(value, row, index, this.opencgaSession.project.organism.assembly, this._config),
                    halign: "center"
                },
                {
                    id: "gene",
                    title: "Gene",
                    field: "gene",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row, index) =>
                        VariantGridFormatter.geneFormatter(row, index, this.query, this.opencgaSession, this._config),
                    halign: "center"
                },
                {
                    id: "type",
                    title: "Type",
                    field: "type",
                    rowspan: 2,
                    colspan: 1,
                    formatter: VariantGridFormatter.typeFormatter.bind(this),
                    halign: "center"
                },
                {
                    id: "consequenceType",
                    title: "Consequence Type",
                    field: "consequenceType",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => VariantGridFormatter.consequenceTypeFormatter(value, row, this.query.ct, this._config),
                    halign: "center"
                },
                {
                    id: "deleteriousness",
                    title: `Deleteriousness <a tooltip-title="Deleteriousness" tooltip-text="SIFT scores are classified into tolerated and deleterious.
                        Polyphen scores are classified into benign, possibly damaging, probably damaging and possibly & probably damaging.
                        Please, leave the cursor over each tag to visualize the actual score value.
                        SIFT score takes values in the range [0, infinite[, the lower the values, the more damaging the prediction.
                        Polyphen score takes values in the range [0, 1[, the closer to 2, the more damaging the prediction.">
                        <i class="fa fa-info-circle" aria-hidden="true"></i></a>`,
                    field: "deleteriousness",
                    rowspan: 1,
                    colspan: 4,
                    align: "center"
                },
                {
                    id: "conservation",
                    title: `Conservation
                        <a  tooltip-title='Conservation'
                            tooltip-text="Positive PhyloP scores measure conservation which is slower evolution than expected,
                                at sites that are predicted to be conserved. Negative PhyloP scores measure acceleration, which is
                                faster evolution than expected, at sites that are predicted to be fast-evolving. Absolute values of phyloP scores represent
                                -log p-values under a null hypothesis of neutral evolution. The phastCons scores represent probabilities of negative selection and
                                range between 0 and 1. Positive GERP scores represent a substitution deficit and thus indicate that a site may be under evolutionary constraint.
                                Negative scores indicate that a site is probably evolving neutrally. Some authors suggest that a score threshold of 2 provides high sensitivity while
                                still strongly enriching for truly constrained sites">
                                <i class="fa fa-info-circle" aria-hidden="true"></i>
                        </a>`,
                    field: "conservation",
                    rowspan: 1,
                    colspan: 3,
                    align: "center"
                },
                {
                    id: "samples",
                    title: "Samples",
                    // field: "samples",
                    rowspan: 1,
                    colspan: sampleColumns.length,
                    align: "center",
                    visible: sampleColumns.length > 0 && sampleColumns[0].visible === undefined
                },
                {
                    id: "cohorts",
                    title: `Cohort Stats
                        <a id="cohortStatsInfoIcon"
                            tooltip-title="Cohort Stats"
                            tooltip-text="${VariantGridFormatter.populationFrequenciesInfoTooltipContent(this.populationFrequencies)}">
                            <i class="fa fa-info-circle" aria-hidden="true">
                            </i>
                        </a>`,
                    field: "cohorts",
                    rowspan: 1,
                    colspan: cohortColumns.length,
                    align: "center",
                    visible: cohortColumns.length > 0 && cohortColumns[0].visible === undefined
                },
                {
                    id: "popfreq",
                    title: `Population Frequencies
                        <a class="popFreqInfoIcon"
                            tooltip-title="Population Frequencies"
                            tooltip-text="${VariantGridFormatter.populationFrequenciesInfoTooltipContent(this.populationFrequencies)}"
                            tooltip-position-at="left bottom" tooltip-position-my="right top">
                            <i class="fa fa-info-circle" aria-hidden="true"></i>
                        </a>`,
                    field: "popfreq",
                    rowspan: 1,
                    colspan: populationFrequencyColumns.length,
                    align: "center",
                    visible: populationFrequencyColumns.length > 0 && populationFrequencyColumns[0].visible === undefined
                },
                {
                    id: "clinicalInfo",
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
                },
                {
                    title: "Select",
                    rowspan: 2,
                    colspan: 1,
                    formatter: this.checkFormatter.bind(this),
                    align: "center",
                    events: {
                        "click input": this.onCheck.bind(this)
                    },
                    visible: this._config.showSelectCheckbox
                },
            ],
            [
                {
                    id: "SIFT",
                    title: "SIFT",
                    field: "sift",
                    colspan: 1,
                    rowspan: 1,
                    formatter: this.siftPproteinScoreFormatter.bind(this),
                    halign: "center"
                },
                {
                    id: "polyphen",
                    title: "Polyphen",
                    field: "polyphen",
                    colspan: 1,
                    rowspan: 1,
                    formatter: this.polyphenProteinScoreFormatter.bind(this),
                    halign: "center"
                },
                {
                    id: "revel",
                    title: "Revel",
                    field: "revel",
                    colspan: 1,
                    rowspan: 1,
                    formatter: this.revelProteinScoreFormatter.bind(this),
                    halign: "center"
                },
                {
                    id: "cadd",
                    title: "CADD",
                    field: "cadd",
                    colspan: 1,
                    rowspan: 1,
                    formatter: this.caddScaledFormatter,
                    align: "right",
                    halign: "center"
                },
                {
                    id: "phylop",
                    title: "PhyloP",
                    field: "phylop",
                    colspan: 1,
                    rowspan: 1,
                    formatter: this.conservationFormatter,
                    align: "right",
                    halign: "center"
                },
                {
                    id: "phastCons",
                    title: "PhastCons",
                    field: "phastCons",
                    colspan: 1,
                    rowspan: 1,
                    formatter: this.conservationFormatter,
                    align: "right",
                    halign: "center"
                },
                {
                    id: "gerp",
                    title: "GERP",
                    field: "gerp",
                    colspan: 1,
                    rowspan: 1,
                    formatter: this.conservationFormatter,
                    align: "right",
                    halign: "center"
                    // visible: this.opencgaSession.project.organism.assembly.toUpperCase() === "GRCH37"
                },
                ...sampleColumns,
                ...cohortColumns,
                ...populationFrequencyColumns,
                {
                    id: "clinvar",
                    title: "ClinVar",
                    field: "clinvar",
                    colspan: 1,
                    rowspan: 1,
                    formatter: VariantGridFormatter.clinicalPhenotypeFormatter,
                    align: "center"
                },
                {
                    id: "cosmic",
                    title: "Cosmic",
                    field: "cosmic",
                    colspan: 1,
                    rowspan: 1,
                    formatter: VariantGridFormatter.clinicalPhenotypeFormatter,
                    align: "center"
                },
            ]
        ];

        this._columns = UtilsNew.mergeTable(this._columns, this._config.columns || this._config.hiddenColumns, !!this._config.hiddenColumns);
        return this._columns;
    }

    async onDownload(e) {
        this.toolbarConfig = {...this.toolbarConfig, downloading: true};
        this.requestUpdate();
        await this.updateComplete;
        const params = {
            study: this.opencgaSession.study.fqn,
            limit: e.detail?.exportLimit ?? 1000,
            summary: !this.query.sample && !this.query.family, // remove this to test includeSample param
            // includeSample: "all" // TODO this causes a time-out
            ...this.query
        };
        this.opencgaSession.opencgaClient.variants().query(params)
            .then(response => {
                const results = response.getResults();
                // Check if user clicked in Tab or JSON format
                if (e.detail.option.toLowerCase() === "tab") {
                    const dataString = VariantUtils.jsonToTabConvert(results, this.populationFrequencies.studies, this.samples, this._config.nucleotideGenotype, e.detail.exportFields);
                    UtilsNew.downloadData(dataString, "variants_" + this.opencgaSession.study.id + ".tsv", "text/plain");
                } else {
                    UtilsNew.downloadData(JSON.stringify(results), "variants_" + this.opencgaSession.study.id + ".json", "application/json");
                }
            })
            .catch(response => {
                console.error(response);
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            })
            .finally(() => {
                this.toolbarConfig = {...this.toolbarConfig, downloading: false};
                this.requestUpdate();
            });
    }

    // not used as changes to exportFields is not propagated outside opencga-export anymore (they are sent on click on download button via `export` event)
    /* onChangeExportField(e) {
        this.exportFields = e.detail.value;
    } */

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 25],
            showExport: false,
            detailView: true,
            detailFormatter: this.detailFormatter,
            showToolbar: true,
            showSelectCheckbox: false,
            multiSelection: false,
            nucleotideGenotype: true,
            alleleStringLengthMax: 15,

            header: {
                horizontalAlign: "center",
                verticalAlign: "bottom"
            },

            highlights: [],
            activeHighlights: [],

            geneSet: {
                ensembl: true,
                refseq: true,
            },
            consequenceType: {
                maneTranscript: true,
                gencodeBasicTranscript: true,
                ensemblCanonicalTranscript: true,
                refseqTranscript: true,
                ccdsTranscript: false,
                ensemblTslTranscript: false,
                proteinCodingTranscript: false,
                highImpactConsequenceTypeTranscript: false,

                showNegativeConsequenceTypes: true
            }
        };
    }

    onGridConfigChange(e) {
        this.__config = e.detail.value;
    }

    onGridConfigSave() {
        LitUtils.dispatchCustomEvent(this, "gridconfigsave", this.__config || {});
    }

    getRightToolbar() {
        return [
            {
                render: () => html`
                    <button type="button" class="btn btn-default btn-sm" aria-haspopup="true" aria-expanded="false" @click="${e => this.onConfigClick(e)}">
                        <i class="fas fa-cog icon-padding"></i> Settings ...
                    </button>`
            }
        ];
    }

    render() {
        return html`
            ${this._config?.showToolbar ? html`
                <opencb-grid-toolbar
                    .config="${this.toolbarConfig}"
                    .query="${this.query}"
                    .opencgaSession="${this.opencgaSession}"
                    .rightToolbar="${this.getRightToolbar()}"
                    @columnChange="${this.onColumnChange}"
                    @download="${this.onDownload}"
                    @export="${this.onDownload}"
                    @changeExportField="${this.onChangeExportField}">
                </opencb-grid-toolbar>
            ` : null}

            <div>
                <table id="${this.gridId}"></table>
            </div>

            <div class="modal fade" id="${this._prefix}ConfigModal" tabindex="-1"
                 role="dialog" aria-hidden="true" style="padding-top:0; overflow-y: visible">
                <div class="modal-dialog" style="width: 1024px">
                    <div class="modal-content">
                        <div class="modal-header" style="padding: 5px 15px">
                            <button type="button" class="close" data-dismiss="modal">&times;</button>
                            <h3>Settings</h3>
                        </div>
                        <div class="modal-body">
                            <div class="container-fluid">
                                <variant-interpreter-grid-config
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${this._config}"
                                    @configChange="${this.onGridConfigChange}">
                                </variant-interpreter-grid-config>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" data-dismiss="modal" @click="${() => this.onGridConfigSave()}">Save</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("variant-browser-grid", VariantBrowserGrid);
