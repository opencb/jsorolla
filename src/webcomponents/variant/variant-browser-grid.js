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

import {html, LitElement, nothing} from "lit";
import UtilsNew from "../../core/utils-new.js";
import VariantGridFormatter from "./variant-grid-formatter.js";
import VariantInterpreterGridFormatter from "./interpretation/variant-interpreter-grid-formatter.js";
import GridCommons from "../commons/grid-commons.js";
import VariantUtils from "./variant-utils.js";
import LitUtils from "../commons/utils/lit-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import BioinfoUtils from "../../core/bioinfo/bioinfo-utils";
import WebUtils from "../commons/utils/web-utils.js";
import ModalUtils from "../commons/modal/modal-utils";
import "../commons/opencb-grid-toolbar.js";
import "../loading-spinner.js";
import "./variant-view.js";

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
        this.RESOURCE = "VARIANT";
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
        if (changedProperties.has("opencgaSession") || changedProperties.has("config") || changedProperties.has("toolId")) {
            this.configObserver();
        }

        if (changedProperties.has("query")) {
            this.queryObserver();
        }

        super.update(changedProperties);
    }

    updated(changedProperties) {
        if (changedProperties.size > 0) {
            this.renderVariants();
        }
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

    configObserver() {
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };

        this.gridCommons = new GridCommons(this.gridId, this, this._config);

        // Config for the grid toolbar
        this.toolbarSetting = {
            ...this._config,
            showCreate: false, // Caution: Ignore a possible admin configuration change to showCreate: true.
        };

        this.toolbarConfig = {
            toolId: this.toolId,
            resource: "VARIANT",
            disableCreate: true,
            showInterpreterConfig: true,
            columns: this._getDefaultColumns(),
        };

        this.gridCommons.registerModals({
            "view-variant": () => ({
                display: {
                    modalTitle: `Variant: ${this.selectedVariantId}`,
                    modalDraggable: true,
                    modalCyDataName: "modal-variant-view",
                    modalSize: "modal-xl",
                },
                render: () => html`
                    <variant-view
                        .variantId="${this.selectedVariantId}"
                        .opencgaSession="${this.opencgaSession}">
                    </variant-view>
                `,
            }),
        });
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
            this.table = $("#" + this.gridId);
            this.table.bootstrapTable("destroy");
            this.table.bootstrapTable({
                classes: "table table-borderless table-hover table-grid",
                buttonsClass: "light",
                columns: this._columns,
                sidePagination: "server",
                iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
                icons: GridCommons.GRID_ICONS,
                // Set table properties, these are read from config property
                uniqueId: "id",
                pagination: this._config.pagination,
                pageSize: this._config.pageSize,
                pageList: this._config.pageList,
                paginationVAlign: "bottom",
                formatShowingRows: (pageFrom, pageTo, totalRows) => {
                    return this.gridCommons.formatShowingRows(pageFrom, pageTo, totalRows, this.totalRowsNotTruncated);
                },
                detailView: this._config.detailView,
                detailFormatter: this.detailFormatter,
                loadingTemplate: () => GridCommons.loadingFormatter(),
                // this makes the variant-browser-grid properties available in the bootstrap-table detail formatter
                variantGrid: this,
                ajax: params => {
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
                        .then(response => {
                            variantResponse = response;
                            const rows = variantResponse.responses?.[0]?.results || [];
                            return this.gridCommons.prepareDataForExtensions(this.COMPONENT_ID, this.opencgaSession, this.filters, rows);
                        })
                        .then(() => params.success(variantResponse))
                        .catch(e => params.error(e))
                        .finally(() => {
                            LitUtils.dispatchCustomEvent(this, "queryComplete", null, {
                                response: variantResponse,
                            });
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
            classes: "table table-borderless table-hover table-grid",
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
            formatShowingRows: (pageFrom, pageTo, totalRows) => {
                return this.gridCommons.formatShowingRows(pageFrom, pageTo, totalRows);
            },
            detailView: this._config.detailView,
            detailFormatter: this.detailFormatter,
            loadingTemplate: () => GridCommons.loadingFormatter(),
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

        this._columns = [
            [
                {
                    id: "id",
                    title: "Variant",
                    field: "id",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row, index) => {
                        return VariantGridFormatter.variantIdFormatter(value, row, index, this.opencgaSession.project.organism.assembly, this._config);
                    },
                    visible: this.gridCommons.isColumnVisible("id"),
                },
                {
                    id: "type",
                    title: "Type",
                    field: "type",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => VariantGridFormatter.typeFormatter(value, row),
                    visible: this.gridCommons.isColumnVisible("type"),
                },
                {
                    id: "gene",
                    title: "Gene",
                    field: "gene",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row, index) => {
                        return VariantGridFormatter.geneFormatter(row, index, this.query, this.opencgaSession, this._config);
                    },
                    visible: this.gridCommons.isColumnVisible("gene")
                },
                {
                    id: "hgvs",
                    title: "HGVS",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => VariantGridFormatter.hgvsFormatter(row, this._config),
                    visible: this.gridCommons.isColumnVisible("hgvs"),
                },
                {
                    id: "consequenceType",
                    title: "Consequence Type",
                    field: "consequenceType",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => VariantGridFormatter.consequenceTypeFormatter(value, row, this.query?.ct, this._config),
                    visible: this.gridCommons.isColumnVisible("consequenceType"),
                },
                {
                    id: "deleteriousness",
                    title: `
                        <span>Deleteriousness</span>
                        <a tooltip-title="Deleteriousness" tooltip-text="${VariantGridFormatter.deleteriousnessInfoTooltipContent()}">
                            <i class="fa fa-info-circle text-primary" aria-hidden="true"></i>
                        </a>
                    `,
                    field: "deleteriousness",
                    rowspan: 1,
                    colspan: 5,
                    align: "center",
                },
                {
                    id: "conservation",
                    title: `
                        <span>Conservation</span>
                        <a tooltip-title="Conservation" tooltip-text="${VariantGridFormatter.conservationInfoTooltipContent()}"> 
                            <i class="fa fa-info-circle text-primary" aria-hidden="true"></i>
                        </a>
                    `,
                    field: "conservation",
                    rowspan: 1,
                    colspan: 3,
                    align: "center",
                },
                {
                    id: "samples",
                    title: "Samples",
                    field: "samples",
                    rowspan: 1,
                    colspan: sampleColumns.length,
                    align: "center",
                    visible: sampleColumns.length > 0 && typeof sampleColumns[0].visible === "undefined",
                },
                {
                    id: "cohorts",
                    title: `
                        <span>Cohort Stats</span>
                        <a tooltip-title="Cohort Stats" tooltip-text="${VariantGridFormatter.populationFrequenciesInfoTooltipContent(this.populationFrequencies)}">
                            <i class="fa fa-info-circle text-primary"></i>
                        </a>
                    `,
                    field: "cohorts",
                    rowspan: 1,
                    colspan: cohortColumns.length,
                    align: "center",
                    visible: cohortColumns.length > 0 && typeof cohortColumns[0].visible === "undefined",
                },
                {
                    id: "popfreq",
                    title: `
                        <span>Population Frequencies</span>
                        <a tooltip-title="Population Frequencies" tooltip-text="${VariantGridFormatter.populationFrequenciesInfoTooltipContent(this.populationFrequencies)}">
                            <i class="fa fa-info-circle text-primary"></i>
                        </a>
                    `,
                    field: "popfreq",
                    rowspan: 1,
                    colspan: populationFrequencyColumns.length,
                    align: "center",
                    visible: populationFrequencyColumns.length > 0 && typeof populationFrequencyColumns[0].visible === "undefined",
                },
                {
                    id: "clinicalInfo",
                    title: `
                        <span>Clinical Info</span>
                        <a tooltip-title="Clinical Info" tooltip-text="${VariantGridFormatter.clinicalInfoTooltipContent()}" tooltip-position-my="right top">
                            <i class="fa fa-info-circle text-primary"></i>
                        </a>
                    `,
                    rowspan: 1,
                    colspan: 6,
                    align: "center"
                },
                // {
                //     id: "select",
                //     title: "Select",
                //     rowspan: 2,
                //     colspan: 1,
                //     formatter: (value, row) => this.checkFormatter(value, row),
                //     align: "center",
                //     events: {
                //         "click input": event => this.onCheck(event),
                //     },
                //     visible: this._config.showSelectCheckbox,
                //     excludeFromSettings: true,
                //     excludeFromExport: true,
                // },
                {
                    id: "actions",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => this.actionsFormatter(value, row),
                    align: "right",
                    events: {
                        "click a": (e, value, row) => this.onActionClick(e, value, row)
                    },
                    visible: this._config?.showActions,
                    excludeFromSettings: true,
                    excludeFromExport: true,
                },
            ],
            [
                {
                    id: "SIFT",
                    title: "SIFT",
                    field: "sift",
                    colspan: 1,
                    rowspan: 1,
                    formatter: (value, row) => VariantGridFormatter.siftPproteinScoreFormatter(value, row, this.consequenceTypeColors),
                    halign: "center",
                    align: "center",
                    visible: this.gridCommons.isColumnVisible("SIFT", "deleteriousness"),
                },
                {
                    id: "polyphen",
                    title: "Polyphen",
                    field: "polyphen",
                    colspan: 1,
                    rowspan: 1,
                    formatter: (value, row) => VariantGridFormatter.polyphenProteinScoreFormatter(value, row, this.consequenceTypeColors),
                    halign: "center",
                    align: "center",
                    visible: this.gridCommons.isColumnVisible("polyphen", "deleteriousness")
                },
                {
                    id: "revel",
                    title: "Revel",
                    field: "revel",
                    colspan: 1,
                    rowspan: 1,
                    formatter: (value, row) => VariantGridFormatter.revelProteinScoreFormatter(value, row),
                    halign: "center",
                    align: "center",
                    visible: this.gridCommons.isColumnVisible("revel", "deleteriousness")
                },
                {
                    id: "cadd",
                    title: "CADD",
                    field: "cadd",
                    colspan: 1,
                    rowspan: 1,
                    formatter: (value, row) => VariantGridFormatter.caddScaledFormatter(value, row),
                    align: "center",
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
                    align: "center",
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
                    align: "center",
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
                    align: "center",
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
                    align: "center",
                    halign: "center",
                    visible: this.gridCommons.isColumnVisible("gerp", "conservation")
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
                    halign: "center",
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
                    halign: "center",
                    align: "center",
                    visible: this.gridCommons.isColumnVisible("cosmic", "clinicalInfo")
                },
                {
                    id: "hgmd",
                    title: "HGMD",
                    field: "hgmd",
                    colspan: 1,
                    rowspan: 1,
                    formatter: VariantGridFormatter.clinicalTraitAssociationFormatter,
                    halign: "center",
                    align: "center",
                    visible: this.gridCommons.isColumnVisible("hgmd", "clinicalInfo")
                },
                {
                    id: "omim",
                    title: "OMIM",
                    field: "omim",
                    colspan: 1,
                    rowspan: 1,
                    formatter: VariantGridFormatter.clinicalOmimFormatter,
                    align: "center",
                    halign: "center",
                    visible: this.gridCommons.isColumnVisible("omim"),
                },
                {
                    id: "pharmgkb",
                    title: "PharmGKB",
                    field: "pharmgkb",
                    colspan: 1,
                    rowspan: 1,
                    formatter: VariantGridFormatter.clinicalPharmGKBFormatter,
                    halign: "center",
                    align: "center",
                    visible: this.gridCommons.isColumnVisible("pharmgkb"),
                },
                {
                    id: "hotspots",
                    title: "Cancer Hotspots",
                    field: "hotspots",
                    colspan: 1,
                    rowspan: 1,
                    formatter: VariantGridFormatter.clinicalCancerHotspotsFormatter,
                    halign: "center",
                    align: "center",
                    visible: this.gridCommons.isColumnVisible("hotspots"),
                },
            ],
        ];

        // Inject columns for extensions
        this._columns = this.gridCommons.addColumnsFromExtensions(this.COMPONENT_ID, this.opencgaSession, this._columns);

        // this._columns = UtilsNew.mergeTable(this._columns, this._config.columns || this._config.hiddenColumns, !!this._config.hiddenColumns);
        return this._columns;
    }

    actionsFormatter(value, row) {
        const assembly = this.opencgaSession?.project?.organism?.assembly;
        const variantPosition = `${row.chromosome}:${row.start}-${row.end}`;
        const cellbaseVersions = ["v5.2", "v5.8"];
        return `
            <div class="dropdown">
                <button class="btn" data-bs-toggle="dropdown" data-cy="actions-button">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
                <div class="dropdown-menu dropdown-menu-end">
                    <a class="dropdown-item cursor-pointer" data-action="view">
                        <i class="fas fa-eye me-1"></i> Variant View
                    </a>
                    <div class="dropdown-header">External Links</div>
                    <a target="_blank" class="dropdown-item ${row.type !== "SNV" ? "disabled" : ""}" href="${BioinfoUtils.getVariantLink(row.id, variantPosition, "decipher")}">
                        <i class="fas fa-external-link-alt me-1"></i> Decipher
                    </a>
                    <a target="_blank" class="dropdown-item ${row.type === "COPY_NUMBER" ? "disabled" : ""}" href="${BioinfoUtils.getVariantLink(row.id, "", "varsome", assembly)}">
                        <i class="fas fa-external-link-alt me-1"></i> Varsome
                    </a>
                    <div class="dropdown-header">CellBase Links</div>
                    ${cellbaseVersions.map(v => `
                        <a target="_blank" class="dropdown-item" href="${BioinfoUtils.getVariantLink(row.id, variantPosition, `CELLBASE_${v}`)}">
                            <i class="fas fa-external-link-alt me-1"></i>
                            <span>CellBase ${v} ${this.opencgaSession?.project.cellbase.version === v ? "(current)" : ""}</span>
                        </a>
                    `).join("")}
                    <div class="dropdown-header">External Genome Browsers</div>
                    <a target="_blank" class="dropdown-item" href="${BioinfoUtils.getVariantLink(row.id, variantPosition, "ensembl_genome_browser", assembly)}">
                        <i class="fas fa-external-link-alt me-1"></i> Ensembl Genome Browser
                    </a>
                    <a target="_blank" class="dropdown-item" href="${BioinfoUtils.getVariantLink(row.id, variantPosition, "ucsc_genome_browser")}">
                        <i class="fas fa-external-link-alt me-1"></i> UCSC Genome Browser
                    </a>
                    <div class="dropdown-divider"></div>
                    <div class="dropdown-header">Copy Variant Info</div>
                    <a class="dropdown-item" data-action="copy-link">
                        <i class="fas fa-copy me-1"></i> Copy IVA Link
                    </a>
                    <a class="dropdown-item ${row.type === "COPY_NUMBER" ? "disabled" : "cursor-pointer"}" data-action="copy-varsome-id">
                        <i class="fas fa-download me-1"></i> Copy Varsome ID
                    </a>
                    <div class="dropdown-divider"></div>
                    <div class="dropdown-header">Fetch Variant</div>
                    <a class="dropdown-item cursor-pointer" data-action="copy-json">
                        <i class="fas fa-copy me-1"></i> Copy JSON
                    </a>
                    <a class="dropdown-item cursor-pointer" data-action="download">
                        <i class="fas fa-download me-1"></i> Download JSON
                    </a>
                </div>
            </div>
        `;
    }

    onActionClick(event, value, row) {
        const action = event.target?.dataset?.action?.toLowerCase();
        switch (action) {
            case "view":
                this.selectedVariantId = row.id;
                this.gridCommons.changeActiveModal("view-variant");
                break;
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

    renderToolbarLeftContent() {
        return html`
            <span id="${this.gridId + "PaginationInfo"}"></span>
        `;
    }

    render() {
        return html`
            ${this._config?.showToolbar ? html`
                <opencb-grid-toolbar
                    .query="${this.query}"
                    .opencgaSession="${this.opencgaSession}"
                    .leftContent="${this.renderToolbarLeftContent()}"
                    .settings="${this.toolbarSetting}"
                    .config="${this.toolbarConfig}"
                    @columnChange="${this.onColumnChange}"
                    @download="${this.onDownload}"
                    @export="${this.onDownload}"
                    @changeExportField="${this.onChangeExportField}">
                </opencb-grid-toolbar>
            ` : nothing}

            <div data-cy="vb-grid">
                <table id="${this.gridId}"></table>
            </div>

            ${this.gridCommons.renderModals()}
        `;
    }

    getDefaultConfig() {
        return {
            // Bootstrap Grid config
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 25],
            detailView: true,
            showSelectCheckbox: false,
            multiSelection: false,
            // nucleotideGenotype: true,
            genotype: {
                type: "VCF_CALL"
            },

            alleleStringLengthMax: 15,

            showToolbar: true,
            showActions: true,

            showCreate: false,
            showExport: true,
            showSettings: true,
            exportTabs: ["download", "export", "link", "code"], // this is customisable in external settings in `table.toolbar`
            annotations: [],
            highlights: [],

            geneSet: {
                ensembl: true,
                refseq: true,
            },
            // Fixme: check this code
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
            },
            populationFrequenciesConfig: {
                displayMode: "FREQUENCY_BOX"
            }
        };
    }

}

customElements.define("variant-browser-grid", VariantBrowserGrid);
