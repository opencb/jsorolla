/*
 * Copyright 2015-2024 OpenCB
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

import {html, LitElement, nothing} from "lit";
import UtilsNew from "../../core/utils-new.js";
import VariantGridFormatter from "./variant-grid-formatter.js";
import VariantInterpreterGridFormatter from "./interpretation/variant-interpreter-grid-formatter.js";
import GridCommons from "../commons/grid-commons.js";
import VariantUtils from "./variant-utils.js";
import "../commons/opencb-grid-toolbar.js";
import "../loading-spinner.js";
import LitUtils from "../commons/utils/lit-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import {CellBaseClient} from "../../core/clients/cellbase/cellbase-client";
import BioinfoUtils from "../../core/bioinfo/bioinfo-utils";
import WebUtils from "../commons/utils/web-utils.js";

export default class VariantBrowserGrid extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            toolId: {
                type: String,
            },
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
            populationFrequencies: {
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

    #init() {
        this.COMPONENT_ID = "variant-browser-grid";
        this._prefix = UtilsNew.randomString(8);
        this.gridId = this._prefix + this.COMPONENT_ID;
        this.checkedVariants = new Map();

        // Set colors
        // eslint-disable-next-line no-undef
        this.consequenceTypeColors = VariantGridFormatter.assignColors(CONSEQUENCE_TYPES, PROTEIN_SUBSTITUTION_SCORE);

        // TODO move to the configuration?
        this.maxNumberOfPages = 1000000;

        this.gridCommons = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }

        if (changedProperties.has("query")) {
            this.queryObserver();
        }

        if (changedProperties.has("config") || changedProperties.has("toolId")) {
            this.configObserver();
        }

        super.update(changedProperties);
    }

    updated(changedProperties) {
        if (changedProperties.size > 0) {
            this.renderVariants();
        }
    }

    opencgaSessionObserver() {
        // With each property change we must be updated config and create the columns again. No extra checks are needed.
        this.#initInternalConfig();
    }

    queryObserver() {
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
    }

    #initInternalConfig() {
        // Deep merge of external settings and default internal configuration
        const defaultConfig = this.getDefaultConfig();
        this._config = {
            ...defaultConfig,
            ...this.config,
            toolbar: {
                ...defaultConfig.toolbar,
                ...this.config.toolbar
            }
        };
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
    }

    configObserver() {
        this.#initInternalConfig();

        this.toolbarConfig = {
            toolId: this.toolId,
            resource: "VARIANT",
            grid: this._config,
            disableCreate: true,
            showInterpreterConfig: true,
            columns: this._getDefaultColumns(),
        };
    }

    onColumnChange(e) {
        this.gridCommons.onColumnChange(e);
        this.renderVariants();
    }

    renderVariants() {
        if (this.variants?.length > 0) {
            this.renderFromLocal();
        } else {
            this.renderRemoteVariants();
        }
    }

    renderRemoteVariants() {
        if (this.opencgaSession?.study) {
            this._columns = this._getDefaultColumns();
            // debugger
            this.table = $("#" + this.gridId);
            this.table.bootstrapTable("destroy");
            this.table.bootstrapTable({
                theadClasses: "table-light",
                buttonsClass: "light",
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
                detailView: !!this.detailFormatter,
                detailFormatter: (value, row) => this.detailFormatter(value, row),
                loadingTemplate: () => GridCommons.loadingFormatter(),
                ajax: params => {
                    this.gridCommons.clearResponseWarningEvents();
                    const tableOptions = $(this.table).bootstrapTable("getOptions");
                    this.filters = {
                        study: this.opencgaSession.study.fqn,
                        limit: params.data.limit || tableOptions.pageSize,
                        skip: params.data.offset || 0,
                        count: !tableOptions.pageNumber || tableOptions.pageNumber === 1,
                        includeStudy: "all",
                        includeSampleId: "true",
                        // summary: !this.query.sample && !this.query.family,
                        ...this.query
                    };
                    // TASK-5791: Temporary SNP ID Search fix
                    if (this.query.xref) {
                        const snpIds = this.query.xref.split(",").filter(xref => xref.startsWith("rs"));
                        if (snpIds.length > 0) {
                            const snpRegion = [];
                            const request = new XMLHttpRequest();
                            for (const snpId of snpIds) {
                                const url = `https://rest.ensembl.org/variation/human/${snpId}?content-type=application/json`;

                                request.onload = event => {
                                    if (request.status === 200) {
                                        const restObject = JSON.parse(event.currentTarget.response);
                                        const mapping = restObject.mappings?.find(m => m.assembly_name === "GRCh38");
                                        snpRegion.push(mapping.seq_region_name + ":" + mapping.start);
                                    }
                                };
                                request.open("GET", url, false);
                                request.send();
                            }
                            if (this.filters.region) {
                                this.filters.region += "," + snpRegion.join(",");
                            } else {
                                this.filters.region = snpRegion.join(",");
                            }
                        }
                    }

                    let variantResponse = null;
                    this.opencgaSession.opencgaClient.variants()
                        .query(this.filters)
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
                                            }
                                        }
                                    }).catch(error => {
                                        console.log(error);
                                    });
                                }
                            }
                            variantResponse = res;
                            return;
                        })
                        .then(() => {
                            // Prepare data for columns extensions
                            const rows = variantResponse.responses?.[0]?.results || [];
                            return this.gridCommons.prepareDataForExtensions(this.COMPONENT_ID, this.opencgaSession, this.filters, rows);
                        })
                        .then(() => params.success(variantResponse))
                        .catch(e => params.error(e))
                        .finally(() => {
                            LitUtils.dispatchCustomEvent(this, "queryComplete", null);
                        });
                },
                responseHandler: response => {
                    this.gridCommons.displayResponseWarningEvents(response);

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
                    this.detailFormatter ?
                        this.table.bootstrapTable("toggleDetailView", element[0].dataset.index) :
                        nothing;
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
            theadClasses: "table-light",
            buttonsClass: "light",
            columns: this._getDefaultColumns(),
            sidePagination: "server",
            // Josemi Note 2024-01-18: we have added the ajax function for local variants also to support executing async calls
            // when getting additional data from columns extensions.
            ajax: params => {
                const tableOptions = $(this.table).bootstrapTable("getOptions");
                const limit = params.data.limit || tableOptions.pageSize;
                const skip = params.data.offset || 0;
                const rows = this.variants.slice(skip, skip + limit);

                // Get data for extensions
                this.gridCommons.prepareDataForExtensions(this.COMPONENT_ID, this.opencgaSession, null, rows)
                    .then(() => params.success(rows))
                    .catch(error => params.error(error));
            },
            // Josemi Note 2024-01-18: we use this method to tell bootstrap-table how many rows we have in our data
            responseHandler: response => {
                return {
                    total: this.variants.length,
                    rows: response,
                };
            },
            // Set table properties, these are read from config property
            uniqueId: "id",
            pagination: this._config.pagination,
            pageSize: this._config.pageSize,
            pageList: this._config.pageList,
            paginationVAlign: "bottom",
            formatShowingRows: this.gridCommons.formatShowingRows,
            detailView: !!this.detailFormatter,
            detailFormatter: (value, row) => this.detailFormatter(value, row),
            loadingTemplate: () => GridCommons.loadingFormatter(),
            // this makes the variant-browser-grid properties available in the bootstrap-table detail formatter
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

    detailFormatter(index, row) {
        let result = "<div class='row' style='padding-bottom: 20px'>";
        let detailHtml = "";

        if (row?.annotation) {
            detailHtml = "<div style='padding: 10px 0px 5px 25px'><h4>Consequence Types</h4></div>";
            detailHtml += "<div style='padding: 5px 40px'>";
            detailHtml += VariantGridFormatter
                .consequenceTypeDetailFormatter(index, row, this, this.query, this._config, this.opencgaSession.project.organism.assembly);
            detailHtml += "</div>";

            detailHtml += "<div style='padding: 10px 0px 5px 25px'><h4>Clinical Phenotypes</h4></div>";
            detailHtml += "<div style='padding: 5px 40px'>";
            detailHtml += VariantGridFormatter.clinicalTableDetail(index, row);
            detailHtml += "</div>";
        }
        result += detailHtml + "</div>";
        return result;
    }

    siftPproteinScoreFormatter(value, row) {
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

    polyphenProteinScoreFormatter(value, row) {
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

    revelProteinScoreFormatter(value, row) {
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

    conservationFormatter(value, row) {
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

    cohortFormatter(value, row) {
        if (row && row.studies?.length > 0 && row.studies[0].stats) {
            const cohortStats = new Map();
            for (const study of row.studies) {
                // Now we support both study.is and study.fqn
                const metaStudy = study.studyId.includes("@") ? this.meta.study : this.meta.study.split(":")[1];
                if (study.studyId === metaStudy) {
                    (study?.stats || []).forEach(cohortStat => {
                        cohortStats.set(cohortStat.cohortId, cohortStat);
                    });
                    break;
                }
            }
            // We need to convert cohort objects to a string array
            const cohortIds = this.meta.cohorts.map(cohort => cohort.id);
            return VariantGridFormatter.renderPopulationFrequencies(
                cohortIds,
                cohortStats,
                this.meta.context.populationFrequencies.style,
                this.meta.populationFrequenciesConfig,
            );
        } else {
            return "-";
        }
    }

    populationFrequenciesFormatter(value, row) {
        const popFreqMap = new Map();
        // Fill the map with the freqs if there are any
        if (row?.annotation?.populationFrequencies?.length > 0) {
            row.annotation.populationFrequencies.forEach(popFreq => {
                if (this.meta.study === popFreq?.study) { // && this.meta.populationMap[popFreq.population] === true
                    popFreqMap.set(popFreq?.population || {}, popFreq);
                }
            });
        }
        return VariantGridFormatter.renderPopulationFrequencies(
            this.meta.populations,
            popFreqMap,
            this.meta.context.populationFrequencies.style,
            this.meta.populationFrequenciesConfig,
        );
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
                    rowspan: 1,
                    colspan: 1,
                    formatter: (value, row, index) => {
                        return VariantInterpreterGridFormatter.sampleGenotypeFormatter(value, row, index, {
                            sampleId: this.samples[i].id,
                            config: this._config
                        });
                    },
                    align: "center",
                    visible: true,
                    excludeFromSettings: true,
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
                        populationFrequenciesConfig: this._config?.populationFrequenciesConfig,
                        context: this
                    },
                    rowspan: 1,
                    colspan: 1,
                    formatter: this.cohortFormatter,
                    align: "center",
                    eligible: true,
                    visible: true,
                    excludeFromSettings: true,
                });
            }
        }

        // IMPORTANT: empty columns are not supported in boostrap-table,
        let populationFrequencyColumns = [{visible: false}];
        if (this.populationFrequencies?.studies?.length > 0) {
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
                        populationFrequenciesConfig: this._config?.populationFrequenciesConfig,
                        context: this
                    },
                    rowspan: 1,
                    colspan: 1,
                    formatter: this.populationFrequenciesFormatter,
                    align: "center",
                    visible: this.gridCommons.isColumnVisible(this.populationFrequencies.studies[j].id, "popfreq"),
                });
            }
        }

        // 1. Default columns
        this._columns = [
            [
                {
                    id: "id",
                    title: "Variant",
                    field: "id",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row, index) =>
                        VariantGridFormatter.variantIdFormatter(value, row, index, this.opencgaSession.project.organism.assembly, this._config),
                    halign: "center",
                    visible: this.gridCommons.isColumnVisible("id")
                },
                {
                    id: "type",
                    title: "Type",
                    field: "type",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => VariantGridFormatter.typeFormatter(value, row),
                    halign: "center",
                    visible: this.gridCommons.isColumnVisible("type")
                },
                {
                    id: "gene",
                    title: "Gene",
                    field: "gene",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row, index) =>
                        VariantGridFormatter.geneFormatter(row, index, this.query, this.opencgaSession, this._config),
                    halign: "center",
                    visible: this.gridCommons.isColumnVisible("gene")
                },
                {
                    id: "hgvs",
                    title: "HGVS",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => VariantGridFormatter.hgvsFormatter(row, this._config),
                    halign: "center",
                    visible: this.gridCommons.isColumnVisible("hgvs"),
                },
                {
                    id: "consequenceType",
                    title: "Consequence Type",
                    field: "consequenceType",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => VariantGridFormatter.consequenceTypeFormatter(value, row, this.query?.ct, this._config),
                    halign: "center",
                    visible: this.gridCommons.isColumnVisible("consequenceType")
                },
                {
                    id: "deleteriousness",
                    title: `Deleteriousness <a tooltip-title="Deleteriousness" tooltip-text="SIFT scores are classified into tolerated and deleterious.
                        Polyphen scores are classified into benign, possibly damaging, probably damaging and possibly & probably damaging.
                        Please, leave the cursor over each tag to visualize the actual score value.
                        SIFT score takes values in the range [0, infinite[, the lower the values, the more damaging the prediction.
                        Polyphen score takes values in the range [0, 1[, the closer to 2, the more damaging the prediction.
                        CADD is a tool for scoring the deleteriousness of single nucleotide variants in the human genome.
                        C-scores strongly correlate with allelic diversity, pathogenicity of both coding and non-coding variants,
                        and experimentally measured regulatory effects, and also highly rank causal variants within individual genome sequences.
                        SpliceAI: a deep learning-based tool to identify splice variants.">
                        <i class="fa fa-info-circle text-primary" aria-hidden="true"></i></a>`,
                    field: "deleteriousness",
                    rowspan: 1,
                    colspan: 5,
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
                                <i class="fa fa-info-circle text-primary" aria-hidden="true"></i>
                        </a>`,
                    field: "conservation",
                    rowspan: 1,
                    colspan: 3,
                    align: "center"
                },
                {
                    id: "samples",
                    title: "Samples",
                    field: "samples",
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
                            <i class="fa fa-info-circle text-primary" aria-hidden="true">
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
                            <i class="fa fa-info-circle text-primary" aria-hidden="true"></i>
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
                            tooltip-position-at="left bottom" tooltip-position-my="right top"><i class="fa fa-info-circle text-primary" aria-hidden="true"></i></a>`,
                    field: "clinicalInfo",
                    rowspan: 1,
                    colspan: 3,
                    align: "center"
                },
                // ...ExtensionsManager.getColumns("variant-browser-grid"),
                {
                    id: "select",
                    title: "Select",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => this.checkFormatter(value, row),
                    align: "center",
                    events: {
                        "click input": this.onCheck.bind(this)
                    },
                    visible: this._config.showSelectCheckbox,
                    excludeFromSettings: true, // If true, this column will not be visible in Settings column
                },
                {
                    id: "actions",
                    title: "Actions",
                    rowspan: 2,
                    colspan: 1,
                    eligible: false,
                    formatter: (value, row) => {
                        return `
                            <div class="dropdown">
                                <button class="btn btn-light btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                    <i class="fas fa-toolbox" aria-hidden="true"></i>
                                    <span>Actions</span>
                                    <span class="caret" style="margin-left: 5px"></span>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-end">
                                    <li class="dropdown-header">External Links</li>
                                    <li>
                                        <a target="_blank" class="dropdown-item" ${row.type !== "SNV" ? "disabled" : ""} title="${row.type !== "SNV" ? "Only SNV are accepted" : ""}"
                                                href="${BioinfoUtils.getVariantLink(row.id, row.chromosome + ":" + row.start + "-" + row.end, "decipher")}">
                                            <i class="fas fa-external-link-alt" aria-hidden="true"></i> Decipher
                                        </a>
                                    </li>
                                    <li data-cy="varsome-variant-link">
                                        <a target="_blank" class="btn force-text-left" ${row.type === "COPY_NUMBER" ? "disabled" : ""}
                                            href="${BioinfoUtils.getVariantLink(row.id, "", "varsome", this.opencgaSession?.project?.organism?.assembly)}">
                                            <i class="fas fa-external-link-alt icon-padding" aria-hidden="true"></i> Varsome
                                        </a>
                                    </li>

                                    <li class="dropdown-header">CellBase Links</li>
                                    ${["v5.2", "v5.8"].map(v => `
                                    <li>
                                        <a target="_blank" class="dropdown-item" href="${BioinfoUtils.getVariantLink(row.id, row.chromosome + ":" + row.start + "-" + row.end, `CELLBASE_${v}`)}">
                                            <i class="fas fa-external-link-alt icon-padding" aria-hidden="true"></i>
                                            CellBase ${v} ${this.opencgaSession?.project.cellbase.version === v ? "(current)" : ""}
                                        </a>
                                    </li>
                                    `).join("")}
                                    <li class="dropdown-header">External Genome Browsers</li>
                                    <li>
                                        <a target="_blank" class="dropdown-item"
                                                href="${BioinfoUtils.getVariantLink(row.id, row.chromosome + ":" + row.start + "-" + row.end, "ensembl_genome_browser", this.opencgaSession?.project?.organism?.assembly)}">
                                            <i class="fas fa-external-link-alt" aria-hidden="true"></i> Ensembl Genome Browser
                                        </a>
                                    </li>
                                    <li>
                                        <a target="_blank" class="dropdown-item"
                                                href="${BioinfoUtils.getVariantLink(row.id, row.chromosome + ":" + row.start + "-" + row.end, "ucsc_genome_browser")}">
                                            <i class="fas fa-external-link-alt" aria-hidden="true"></i> UCSC Genome Browser
                                        </a>
                                    </li>
                                    <li role="separator" class="divider"></li>
                                    <li class="dropdown-header">Copy Variant Info</li>
                                    <li data-cy="copy-link">
                                        <a class="btn force-text-left" data-action="copy-link">
                                            <i class="fas fa-copy icon-padding"></i> Copy IVA Link
                                        </a>
                                    </li>
                                    <li data-cy="varsome-copy">
                                        <a href="javascript: void 0" class="btn force-text-left" ${row.type === "COPY_NUMBER" ? "disabled" : ""} data-action="copy-varsome-id">
                                            <i class="fas fa-download icon-padding" aria-hidden="true"></i> Copy Varsome ID
                                        </a>
                                    </li>
                                    <li role="separator" class="divider"></li>
                                    <li class="dropdown-header">Fetch Variant</li>
                                    <li>
                                        <a href="javascript: void 0" class="dropdown-item" data-action="copy-json">
                                            <i class="fas fa-copy" aria-hidden="true"></i> Copy JSON
                                        </a>
                                    </li>
                                    <li>
                                        <a href="javascript: void 0" class="dropdown-item" data-action="download">
                                            <i class="fas fa-download" aria-hidden="true"></i> Download JSON
                                        </a>
                                    </li>
                                </ul>
                            </div>`;
                    },
                    align: "center",
                    events: {
                        "click a": (e, value, row) => this.onActionClick(e, value, row)
                    },
                    visible: this._config?.showActions,
                    excludeFromSettings: true,
                    excludeFromExport: true, // this is used in opencga-export
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
                    halign: "center",
                    visible: this.gridCommons.isColumnVisible("SIFT", "deleteriousness")
                },
                {
                    id: "polyphen",
                    title: "Polyphen",
                    field: "polyphen",
                    colspan: 1,
                    rowspan: 1,
                    formatter: this.polyphenProteinScoreFormatter.bind(this),
                    halign: "center",
                    visible: this.gridCommons.isColumnVisible("polyphen", "deleteriousness")
                },
                {
                    id: "revel",
                    title: "Revel",
                    field: "revel",
                    colspan: 1,
                    rowspan: 1,
                    formatter: this.revelProteinScoreFormatter.bind(this),
                    halign: "center",
                    visible: this.gridCommons.isColumnVisible("revel", "deleteriousness")
                },
                {
                    id: "cadd",
                    title: "CADD",
                    field: "cadd",
                    colspan: 1,
                    rowspan: 1,
                    formatter: (value, row) => VariantGridFormatter.caddScaledFormatter(value, row),
                    align: "right",
                    halign: "center",
                    visible: this.gridCommons.isColumnVisible("cadd", "deleteriousness")
                },
                {
                    id: "spliceai",
                    title: "SpliceAI",
                    field: "spliceai",
                    colspan: 1,
                    rowspan: 1,
                    formatter: (value, row) => VariantGridFormatter.spliceAIFormatter(value, row),
                    align: "right",
                    halign: "center",
                    visible: this.gridCommons.isColumnVisible("spliceai", "deleteriousness")
                },
                {
                    id: "phylop",
                    title: "PhyloP",
                    field: "phylop",
                    colspan: 1,
                    rowspan: 1,
                    formatter: this.conservationFormatter,
                    align: "right",
                    halign: "center",
                    visible: this.gridCommons.isColumnVisible("phylop", "conservation")
                },
                {
                    id: "phastCons",
                    title: "PhastCons",
                    field: "phastCons",
                    colspan: 1,
                    rowspan: 1,
                    formatter: this.conservationFormatter,
                    align: "right",
                    halign: "center",
                    visible: this.gridCommons.isColumnVisible("phastCons", "conservation")
                },
                {
                    id: "gerp",
                    title: "GERP",
                    field: "gerp",
                    colspan: 1,
                    rowspan: 1,
                    formatter: this.conservationFormatter,
                    align: "right",
                    halign: "center",
                    visible: this.gridCommons.isColumnVisible("gerp", "conservation")
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
                    formatter: VariantGridFormatter.clinicalTraitAssociationFormatter,
                    align: "center",
                    visible: this.gridCommons.isColumnVisible("clinvar", "clinicalInfo")
                },
                {
                    id: "cosmic",
                    title: "Cosmic",
                    field: "cosmic",
                    colspan: 1,
                    rowspan: 1,
                    formatter: VariantGridFormatter.clinicalTraitAssociationFormatter,
                    align: "center",
                    visible: this.gridCommons.isColumnVisible("cosmic", "clinicalInfo")
                },
                {
                    id: "omim",
                    title: "OMIM",
                    field: "omim",
                    colspan: 1,
                    rowspan: 1,
                    formatter: VariantGridFormatter.clinicalOmimFormatter,
                    align: "center",
                    visible: this.gridCommons.isColumnVisible("omim"),
                },
            ]
        ];

        // 2. Extensions: Inject columns for extensions
        this._columns = this.gridCommons.addColumnsFromExtensions(this._columns);

        return this._columns;
    }

    onActionClick(e, value, row) {
        const action = e.target.dataset.action?.toLowerCase();
        switch (action) {
            case "copy-link":
                // 1. Generate the URL to this variant
                const link = WebUtils.getIVALink(this.opencgaSession, this.toolId, {id: row.id});
                // 2. Copy this link to the clipboard
                UtilsNew.copyToClipboard(link);
                // 3. Notify user that link has been copied to the clipboard
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    message: `Link to variant '${row.id}' copied to clipboard.`,
                });
                break;
            case "copy-json":
                navigator.clipboard.writeText(JSON.stringify(row, null, "\t"));
                break;
            case "download":
                UtilsNew.downloadData([JSON.stringify(row, null, "\t")], row.id + ".json");
                break;
            case "copy-varsome-id":
                // Note: varsome format is disabled for copy_number variants
                // See https://app.clickup.com/t/36631768/TASK-3902
                if (row.type !== "COPY_NUMBER") {
                    const varsomeId = BioinfoUtils.getVariantInVarsomeFormat(row.id);
                    UtilsNew.copyToClipboard(varsomeId);
                }
                break;
            default:
                console.warn("Option not recognize: " + action);
                break;
        }
    }

    async onDownload(e) {
        this.toolbarConfig = {...this.toolbarConfig, downloading: true};
        this.requestUpdate();
        await this.updateComplete;
        const filters = {
            ...this.filters,
            skip: 0,
            limit: 1000,
            count: false
        };
        this.opepncgaSession.opencgaClient.variants().query(filters)
            .then(response => {
                const results = response.getResults();
                // Check if user clicked in Tab or JSON format
                if (e.detail.option.toLowerCase() === "tab") {
                    const dataString = VariantUtils.jsonToTabConvert(results, this.populationFrequencies.studies, this.samples, this._config?.genotype?.type?.toUpperCase() === "ALLELES", e.detail.exportFields);
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

    onGridConfigChange(e) {
        this.__config = e.detail.value;
    }

    onGridConfigSave() {
        LitUtils.dispatchCustomEvent(this, "gridconfigsave", this.__config || {});
    }

    render() {
        return html`
            <div id="${this.gridId}WarningEvents"></div>
            ${this._config?.showToolbar ? html`
                <opencb-grid-toolbar
                    .query="${this.query}"
                    .opencgaSession="${this.opencgaSession}"
                    .config="${this.toolbarConfig}"
                    @columnChange="${this.onColumnChange}"
                    @download="${this.onDownload}"
                    @export="${this.onDownload}"
                    @changeExportField="${this.onChangeExportField}">
                </opencb-grid-toolbar>
            ` : null}

            <div data-cy="vb-grid">
                <table id="${this.gridId}"></table>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            // Bootstrap Grid config
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 25],

            showToolbar: true,
            showActions: true,
            toolbar: {
                showSettings: true,
                showExport: true,
                exportTabs: ["download", "export", "link", "code"]
            },
            skipExtensions: false,

            showSelectCheckbox: false,
            genotype: {
                type: "VCF_CALL"
            },
            alleleStringLengthMax: 15,
            geneSet: {
                ensembl: true,
                refseq: true,
            },
            consequenceType: {
                maneTranscript: true,
                gencodeBasicTranscript: true,
                ensemblCanonicalTranscript: true,
                refseqTranscript: true, // Fixme: not considered in variant-interpreter-grid-config?
                ccdsTranscript: false,
                ensemblTslTranscript: false,
                proteinCodingTranscript: false,
                highImpactConsequenceTypeTranscript: false,
                showNegativeConsequenceTypes: true
            },
            populationFrequenciesConfig: {
                displayMode: "FREQUENCY_BOX", // Options: FREQUENCY_BOX | FREQUENCY_NUMBER
            },

            // Highlight conditions for Variant Browser
            // highlights: [
            //     {
            //         id: "highlight1",
            //         name: "Test highlight 1",
            //         description: "",
            //         condition: () => true,
            //         style: {
            //             rowBackgroundColor: "#cfe2ff",
            //             rowOpacity: 0.5,
            //             icon: "circle",
            //             iconColor: "blue",
            //         },
            //     },
            // ],
        };
    }

}

customElements.define("variant-browser-grid", VariantBrowserGrid);
