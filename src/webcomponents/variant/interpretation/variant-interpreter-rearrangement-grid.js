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
import UtilsNew from "../../../core/utilsNew.js";
import ClinicalAnalysisManager from "../../clinical/clinical-analysis-manager.js";
import VariantInterpreterGridFormatter from "./variant-interpreter-grid-formatter.js";
import VariantGridFormatter from "../variant-grid-formatter.js";
import GridCommons from "../../commons/grid-commons.js";
import VariantUtils from "../variant-utils.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import "./variant-interpreter-grid-config.js";
import "../../clinical/interpretation/clinical-interpretation-variant-review.js";
import "../../commons/opencb-grid-toolbar.js";
import "../../loading-spinner.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";

export default class VariantInterpreterRearrangementGrid extends LitElement {

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
            clinicalVariants: {
                type: Array,
            },
            query: {
                type: Object
            },
            review: {
                type: Boolean
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
        this.review = false;

        // Set colors
        // consequenceTypesImpact;
        // eslint-disable-next-line no-undef
        this.consequenceTypeColors = VariantGridFormatter.assignColors(CONSEQUENCE_TYPES, PROTEIN_SUBSTITUTION_SCORE);
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
        this.clinicalAnalysisManager = new ClinicalAnalysisManager(this, this.clinicalAnalysis, this.opencgaSession);
    }

    firstUpdated() {
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
            // this.opencgaSessionObserver();
            this.clinicalAnalysisObserver();
            this.renderVariants();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.gridCommons = new GridCommons(this.gridId, this, this._config);
            // Nacho (14/11/2020) - Commented since it does not look necessary
            // this.requestUpdate();
        }
    }

    opencgaSessionObserver() {
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
        this.clinicalAnalysisManager = new ClinicalAnalysisManager(this, this.clinicalAnalysis, this.opencgaSession);
    }

    clinicalAnalysisObserver() {
        // We need to load server config always.
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };
        this.clinicalAnalysisManager = new ClinicalAnalysisManager(this, this.clinicalAnalysis, this.opencgaSession);

        // Make sure somatic sample is the first one
        if (this.clinicalAnalysis) {
            if (!this.clinicalAnalysis.interpretation) {
                this.clinicalAnalysis.interpretation = {};
            }

            // Update checked variants
            this.checkedVariants = new Map();
            (this.clinicalAnalysis.interpretation?.primaryFindings || []).forEach(variant => {
                this.checkedVariants.set(variant.id, variant);
            });
            // this.gridCommons.checkedRows = this.checkedVariants;

            if (this.clinicalAnalysis.type.toUpperCase() === "CANCER") {
                if (this.clinicalAnalysis.proband && this.clinicalAnalysis.proband.samples &&
                    this.clinicalAnalysis.proband.samples.length === 2 && this.clinicalAnalysis.proband.samples[1].somatic) {
                    this.clinicalAnalysis.proband.samples = this.clinicalAnalysis.proband.samples.reverse();
                }
            }
        }
    }

    onColumnChange(e) {
        this.gridCommons.onColumnChange(e);
    }

    generateRowsFromVariants(variants) {
        const pairs = []; // pairs = [[v1, v2], [v3, v4], [v5, v6]];
        (variants || []).forEach(variant => {
            const mateId = variant.studies[0].files[0].data.MATEID;
            let found = false;
            pairs.forEach(pair => {
                if (pair[0].studies[0].files[0].data.VCF_ID === mateId) {
                    pair.push(variant);
                    found = true;
                }
            });

            // If not pair has been found --> inser this single variant
            if (!found) {
                pairs.push([variant]);
            }
        });

        return pairs;
    }

    renderVariants() {
        if (this.clinicalVariants && this.clinicalVariants.length > 0) {
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
            console.warn("No sample found, query: ", this.query);
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
                formatShowingRows: (pageFrom, pageTo, totalRows) =>
                    this.gridCommons.formatShowingRows(pageFrom, pageTo, totalRows, null, this.isApproximateCount),
                showExport: this._config.showExport,
                // detailView: this._config.detailView,
                // detailFormatter: this.detailFormatter,
                formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",

                // this makes the opencga-interpreted-variant-grid properties available in the bootstrap-table formatters
                variantGrid: this,

                ajax: params => {
                    // Make a deep clone object to manipulate the query sent to OpenCGA
                    const internalQuery = JSON.parse(JSON.stringify(this.query));

                    const tableOptions = $(this.table).bootstrapTable("getOptions");
                    const filters = {
                        study: this.opencgaSession.study.fqn,
                        limit: params.data.limit * 2 || tableOptions.pageSize * 2,
                        skip: params.data.offset || 0,
                        count: !tableOptions.pageNumber || tableOptions.pageNumber === 1,

                        approximateCount: true,
                        approximateCountSamplingSize: 500,

                        ...internalQuery,
                        includeSampleId: "true",
                        type: "BREAKEND"
                    };

                    this.opencgaSession.opencgaClient.clinical().queryVariant(filters)
                        .then(res => {
                            this.isApproximateCount = res.responses[0].attributes?.approximateCount ?? false;

                            // pairs will have the following format: [[v1, v2], [v3, v4], [v5, v6]];
                            const pairs = this.generateRowsFromVariants(res.responses[0].results);
                            // It's important to overwrite results array
                            res.responses[0].results = pairs;

                            params.success(res);
                        })
                        .catch(e => {
                            console.error(e);
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
                rowStyle: (row, index) => this.gridCommons.rowHighlightStyle(row, index),
            });
        }
    }

    renderLocalVariants() {
        // Generate rows from local clinical variants
        // const variants = this.clinicalAnalysis.interpretation.primaryFindings;
        const variants = this.generateRowsFromVariants(this.clinicalVariants);

        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            data: variants,
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
            onPostBody: data => {
                // We call onLoadSuccess to select first row, this is only needed when rendering from local
                this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 2);
            },
            rowStyle: (row, index) => this.gridCommons.rowHighlightStyle(row, index),
        });
    }

    onRowCheck(event) {
        const index = parseInt(event.target.dataset.rowIndex);

        // Add or remove this pair of variants from checkedVariants list
        this._rows[index].forEach(variant => {
            if (event.target.checked) {
                this.checkedVariants.set(variant.id, variant);
            } else {
                this.checkedVariants.delete(variant.id);
            }
        });

        // Dispatch row check event
        LitUtils.dispatchCustomEvent(this, "checkrow", null, {
            checked: event.target.checked,
            row: this._rows[index],
            rows: Array.from(this.checkedVariants.values()),
        });
        // const variantId = e.currentTarget.dataset.variantId;
        // const variant = this._rows.find(e => e.id === variantId);

        // if (e.currentTarget.checked) {
        //     this.checkedVariants.set(variantId, variant);
        // } else {
        //     this.checkedVariants.delete(variantId);
        // }

        // this.dispatchEvent(new CustomEvent("checkrow", {
        //     detail: {
        //         id: variantId,
        //         row: variant,
        //         checked: e.currentTarget.checked,
        //         rows: Array.from(this.checkedVariants.values())
        //     }
        // }));
    }

    onReviewClick(e) {
        if (this.checkedVariants) {
            this.variantReview = this.checkedVariants.get(e.currentTarget.dataset.variantId);
            this.requestUpdate();

            $("#" + this._prefix + "ReviewSampleModal").modal("show");
        }
    }

    onConfigClick(e) {
        $("#" + this._prefix + "ConfigModal").modal("show");
    }

    /*
     *  GRID FORMATTERS
     */
    detailFormatter(value, row, a) {
        let result = "<div class='row' style='padding-bottom: 20px'>";
        let detailHtml = "";
        if (row && row.annotation) {
            // if (this.variantGrid.clinicalAnalysis.type.toUpperCase() !== "CANCER") {
            //     detailHtml = "<div style='padding: 10px 0px 5px 25px'><h4>Variant Allele Frequency</h4></div>";
            //     detailHtml += "<div style='padding: 5px 40px'>";
            //     detailHtml += VariantInterpreterGridFormatter.variantAlleleFrequencyDetailFormatter(value, row, this.variantGrid);
            //     detailHtml += "</div>";
            // }

            detailHtml += "<div style='padding: 10px 0px 5px 25px'><h4>Molecular Consequence</h4></div>";
            detailHtml += "<div style='padding: 5px 40px'>";
            detailHtml += VariantInterpreterGridFormatter.reportedEventDetailFormatter(value, row, this.variantGrid, this.variantGrid.query, this.variantGrid.review, this.variantGrid._config);
            detailHtml += "</div>";

            detailHtml += "<div style='padding: 25px 0px 5px 25px'><h4>Consequence Types</h4></div>";
            detailHtml += "<div style='padding: 5px 40px'>";
            detailHtml += VariantGridFormatter.consequenceTypeDetailFormatter(value, row, this.variantGrid, this.variantGrid.query, this.variantGrid._config, this.variantGrid.opencgaSession.project.organism.assembly);
            detailHtml += "</div>";

            detailHtml += "<div style='padding: 20px 0px 5px 25px'><h4>Clinical Phenotypes</h4></div>";
            detailHtml += "<div style='padding: 5px 40px'>";
            detailHtml += VariantGridFormatter.clinicalTableDetail(value, row);
            detailHtml += "</div>";
        }
        result += detailHtml + "</div>";
        return result;
    }

    vcfDataFormatter(value, row, field, separator = " / ") {
        if (row.studies?.length > 0) {
            if (field.vcfColumn === "info") {
                for (const file of row.studies[0].files) {
                    if (field.key.length === 1) {
                        if (file.data[field.key[0]]) {
                            return file.data[field.key[0]];
                        }
                    } else {
                        return `${file.data[field.key[0]] || "-"} ${separator} <span style="white-space: nowrap;">${file.data[field.key[1]] || "-"}</span>`;
                    }
                }
            } else { // This must be FORMAT column
                const sampleIndex = row.studies[0].samples.findIndex(sample => sample.sampleId === field.sample.id);
                const index = row.studies[0].sampleDataKeys.findIndex(key => key === this.field.key);
                if (index >= 0) {
                    return row.studies[0].samples[sampleIndex].data[index];
                }
            }
        } else {
            console.error("This should never happen: row.studies[] is not valid");
        }
        return "-";
    }

    // DEPRECATED
    pathogeniticyFormatter(value, row, index) {
        // TODO we must call to PathDB to get the frequency of each variant, next code is just an example
        return `
            <div class="col-md-12" style="padding: 0px">
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
            </div>
        `;
    }

    reviewFormatter(value, row, index) {
        return `
            <button class="btn btn-link reviewButton" data-variant-id="${row.id}">
                <i class="fa fa-edit icon-padding reviewButton" aria-hidden="true"></i>&nbsp;Edit
            </button>
        `;
        // return `
        //     <div>
        //         <button class="btn btn-link reviewButton" data-variant-id="${row.id}">
        //             <i class="fa fa-edit icon-padding reviewButton" aria-hidden="true" ></i>&nbsp;Edit
        //         </button>
        //     </div>
        //     <div>
        //         <opencga-interpretation-variant-review .opencgaSession="${this.opencgaSession}"
        //                                                .variant="${row}"
        //                                                mode="modal">
        //         </opencga-interpretation-variant-review>
        //     </div>`;
    }

    _createDefaultColumns() {
        // This code creates dynamically the columns for the VCF INFO and FORMAT column data.
        // Multiple file callers are supported.
        let vcfDataColumns = [];
        const vcfDataColumns2 = [];
        const fileCallers = this.clinicalAnalysis.files.filter(file => file.format === "VCF" && file.software?.name).map(file => file.software.name);
        if (this._config.callers?.length > 0 && fileCallers?.length > 0) {
            for (const caller of this._config.callers) {
                if (fileCallers.includes(caller.id)) {
                    // New Columns
                    // eslint-disable-next-line no-empty
                    if (caller.columns?.length > 0) {

                    }
                    // INFO column
                    if (caller.info?.length > 0) {
                        for (let i = 0; i < caller.info.length; i++) {
                            vcfDataColumns.push({
                                title: `${caller.info[i].name}<br><span class="help-block" style="margin: 0px">${caller.info[i].fields.join(", ")}</span>`,
                                rowspan: 1,
                                colspan: 1,
                                formatter: (value, row) => this.vcfDataFormatter(value, row[0], {
                                    vcfColumn: "info",
                                    key: caller.info[i].fields
                                }, caller.info[i].separator),
                                halign: "center"
                            });
                        }

                        for (let i = 0; i < caller.info.length; i++) {
                            vcfDataColumns2.push({
                                title: `${caller.info[i].name}<br><span class="help-block" style="margin: 0px">${caller.info[i].fields.join(", ")}</span>`,
                                rowspan: 1,
                                colspan: 1,
                                formatter: (value, row) => this.vcfDataFormatter(value, row[1], {
                                    vcfColumn: "info",
                                    key: caller.info[i].fields
                                }, caller.info[i].separator),
                                halign: "center"
                            });
                        }
                    }

                    // FORMAT column
                    if (caller.format?.length > 0) {
                        for (let i = 0; i < caller.format.length; i++) {
                            vcfDataColumns.push({
                                title: caller.format[i],
                                field: {
                                    vcfColumn: "format",
                                    // sample: samples[0],
                                    sample: this.clinicalAnalysis.proband.samples[0],
                                    key: caller.format[i]
                                },
                                rowspan: 1,
                                colspan: 1,
                                formatter: this.vcfDataFormatter,
                                halign: "center"
                            });
                        }
                    }
                }
            }
        }
        // IMPORTANT: empty columns are not supported in boostrap-table,
        // we need to create an empty not visible column when no VCF file data is configured.
        if (!vcfDataColumns || vcfDataColumns.length === 0) {
            vcfDataColumns = [
                {
                    visible: false
                }
            ];
        }

        // Prepare Grid columns
        const _columns = [
            [
                {
                    title: "Variant 1",
                    field: "id",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row, index) => VariantGridFormatter.variantFormatter(value, row[0], index, this.opencgaSession.project.organism.assembly, this._config),
                    halign: "center",
                    sortable: true
                },
                {
                    title: "Variant 2",
                    field: "id",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row, index) => VariantGridFormatter.variantFormatter(value, row[1], index, this.opencgaSession.project.organism.assembly, this._config),
                    halign: "center",
                    sortable: true
                },
                {
                    title: "Gene",
                    field: "gene",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row, index) => VariantGridFormatter.geneFormatter(row[0], index, this.query, this.opencgaSession),
                    halign: "center"
                },
                // {
                //     title: "Gene",
                //     field: "gene",
                //     rowspan: 2,
                //     colspan: 1,
                //     formatter: (value, row, index) => VariantGridFormatter.geneFormatter(row[1], index, this.query, this.opencgaSession),
                //     halign: "center"
                // },
                {
                    title: "Type<br><span class='help-block' style='margin: 0px'>SVCLASS</span>",
                    field: "type",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => this.vcfDataFormatter(value, row[0], {vcfColumn: "info", key: ["EXT_SVTYPE", "SVCLASS"]}, "<br>"),
                    halign: "center"
                },
                // {
                //     title: "SVCLASS",
                //     // field: "type",
                //     rowspan: 2,
                //     colspan: 1,
                //     formatter: (value, row) => {
                //         return `<div>${VariantGridFormatter.vcfFormatter(value, row[0], "SVCLASS", "INFO")}</div>`;
                //     },
                //     halign: "center"
                // },
                {
                    title: "Assembly<br>Score",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => {
                        return `<div>${VariantGridFormatter.vcfFormatter(value, row[0], "BAS", "INFO") || "-"}</div>`;
                    },
                    halign: "center"
                },
                {
                    title: "CN Flag",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => {
                        return `<div>${VariantGridFormatter.vcfFormatter(value, row[0], "CNCH", "INFO") || "-"}</div>`;
                    },
                    halign: "center"
                },
                {
                    title: "VCF Data 1",
                    rowspan: 1,
                    colspan: vcfDataColumns?.length,
                    halign: "center",
                    visible: vcfDataColumns?.length > 1
                },
                {
                    title: "VCF Data 2",
                    rowspan: 1,
                    colspan: vcfDataColumns2?.length,
                    halign: "center",
                    visible: vcfDataColumns2?.length > 1
                },
                {
                    title: "Fusion Flag",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => {
                        return `<div>${VariantGridFormatter.vcfFormatter(value, row[0], "FFV", "INFO") || "-"}</div>`;
                    },
                    halign: "center"
                },
                {
                    title: `Interpretation
                        <a class='interpretation-info-icon'
                            tooltip-title='Interpretation'
                            tooltip-text="<span style='font-weight: bold'>Prediction</span> column shows the Clinical Significance prediction and Tier following the ACMG guide recommendations"
                            tooltip-position-at="left bottom" tooltip-position-my="right top">
                            <i class='fa fa-info-circle' aria-hidden='true'></i>
                        </a>`,
                    field: "interpretation",
                    rowspan: 1,
                    colspan: 4,
                    halign: "center"
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
                ...vcfDataColumns2,
                {
                    title: "Cohorts",
                    field: "cohort",
                    colspan: 1,
                    rowspan: 1,
                    formatter: VariantInterpreterGridFormatter.studyCohortsFormatter.bind(this),
                    visible: this.clinicalAnalysis.type.toUpperCase() === "SINGLE" || this.clinicalAnalysis.type.toUpperCase() === "FAMILY"
                },
                {
                    title: `${this.clinicalAnalysis.type !== "CANCER" ? "ACMG <br> Prediction" : "Prediction"}`,
                    field: "prediction",
                    rowspan: 1,
                    colspan: 1,
                    formatter: VariantInterpreterGridFormatter.predictionFormatter,
                    halign: "center",
                    visible: this.clinicalAnalysis.type.toUpperCase() === "SINGLE" || this.clinicalAnalysis.type.toUpperCase() === "FAMILY"
                },
                {
                    title: "Select",
                    rowspan: 1,
                    colspan: 1,
                    formatter: (value, row, index) => {
                        const checked = this.checkedVariants?.has(row[0].id) ? "checked" : "";
                        return `<input class="check check-variant" type="checkbox" data-row-index="${index}" ${checked}>`;
                    },
                    align: "center",
                    events: {
                        "click input": event => this.onRowCheck(event),
                    },
                    visible: this._config.showSelectCheckbox,
                },
                {
                    title: "Review",
                    rowspan: 1,
                    colspan: 1,
                    formatter: this.reviewFormatter.bind(this),
                    align: "center",
                    events: {
                        "click button": this.onReviewClick.bind(this)
                    },
                    // visible: this._config.showReview
                    visible: !!this.review,
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
            const samples = [];
            const sampleInfo = {};
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
                        formatter: (value, row) => VariantInterpreterGridFormatter.sampleGenotypeFormatter(value, row[0]),
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
                    const _sampleGenotypes = this.query.sample.split(";");
                    for (const sampleGenotype of _sampleGenotypes) {
                        const sampleId = sampleGenotype.split(":")[0];
                        samples.push(this.clinicalAnalysis.proband.samples.find(s => s.id === sampleId));
                    }
                } else {
                    samples = this.clinicalAnalysis.proband.samples.filter(s => s.somatic);
                }

                _columns[0].splice(4, 0, {
                    title: "Sample Genotypes",
                    rowspan: 1,
                    colspan: samples.length,
                    align: "center"
                });
                for (let i = 0; i < samples.length; i++) {
                    const sample = samples[i];
                    const color = sample?.somatic ? "darkred" : "black";

                    _columns[1].splice(i, 0, {
                        title: `<span>${sample.id}</span><br>
                                <span class="help-block" style="margin: 0px">PS / RC</span>`,
                        field: {
                            sampleId: sample.id,
                            quality: this._config.quality,
                            config: this._config,
                            clinicalAnalysis: this.clinicalAnalysis
                        },
                        rowspan: 1,
                        colspan: 1,
                        // formatter: VariantInterpreterGridFormatter.sampleGenotypeFormatter,
                        formatter: (value, row) => {
                            return `${VariantGridFormatter.vcfFormatter(value, row[0], "RC", "FORMAT")} / ${VariantGridFormatter.vcfFormatter(value, row[0], "PS", "FORMAT")}`;
                        },
                        align: "center",
                        nucleotideGenotype: true
                    });
                }
            }
        }
    }

    onActionClick(e, value, row) {
        const {action} = e.target.dataset;
        if (action === "download") {
            UtilsNew.downloadData([JSON.stringify(row, null, "\t")], row.id + ".json");
        }
    }

    // TODO fix tab jsonToTabConvert isn't working!
    async onDownload(e) {
        this.toolbarConfig = {...this.toolbarConfig, downloading: true};
        this.requestUpdate();
        await this.updateComplete;
        if (this.clinicalAnalysis.type.toUpperCase() === "FAMILY" && this.query?.sample) {
            const samples = this.query.sample.split(";");
            const sortedSamples = [];
            for (const sample of samples) {
                const sampleFields = sample.split(":");
                if (sampleFields && sampleFields[0] === this.clinicalAnalysis.proband.samples[0].id) {
                    sortedSamples.unshift(sample);
                } else {
                    sortedSamples.push(sample);
                }
            }
            this.query.sample = sortedSamples.join(";");
        }

        const filters = {
            study: this.opencgaSession.study.fqn,
            limit: 1000,
            count: false,
            includeSampleId: "true",
            ...this.query
        };
        this.opencgaSession.opencgaClient.clinical().queryVariant(filters)
            .then(restResponse => {
                const results = restResponse.getResults();
                // Check if user clicked in Tab or JSON format
                if (e.detail.option.toLowerCase() === "tab") {
                    const dataString = VariantUtils.jsonToTabConvert(results, POPULATION_FREQUENCIES.studies, this.samples, this._config.nucleotideGenotype);
                    console.log("dataString", dataString);
                    UtilsNew.downloadData(dataString, "variant_interpreter_" + this.opencgaSession.study.id + ".tsv", "text/plain");
                } else {
                    UtilsNew.downloadData(JSON.stringify(results, null, "\t"), "variant_interpreter_" + this.opencgaSession.study.id + ".json", "application/json");
                }
            })
            .catch(response => {
                // console.log(response);
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            })
            .finally(() => {
                this.toolbarConfig = {...this.toolbarConfig, downloading: false};
                this.requestUpdate();
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

    showLoading() {
        $("#" + this.gridId).bootstrapTable("showLoading");
    }


    onGridConfigChange(e) {
        this.__config = e.detail.value;
    }

    onGridConfigSave() {
        LitUtils.dispatchCustomEvent(this, "gridconfigsave", this.__config || {});
    }

    // async onApplySettings(e) {
    //     try {
    //         this._config = {
    //             ...this.getDefaultConfig(),
    //             ...this.opencgaSession.user.configs?.IVA?.interpreter?.rearrangementGrid,
    //             ...this.__config,
    //         };

    //         // TODO Delete old config values. Remove this in IVA 2.2
    //         delete this._config.consequenceType.canonicalTranscript;
    //         delete this._config.consequenceType.gencodeBasic;
    //         delete this._config.consequenceType.highQualityTranscripts;
    //         delete this._config.consequenceType.proteinCodingTranscripts;
    //         delete this._config.consequenceType.worstConsequenceTypes;
    //         delete this._config.consequenceType.filterByBiotype;
    //         delete this._config.consequenceType.filterByConsequenceType;
    //         delete this._config.consequenceType.highImpactConsequenceTypeTranscripts;

    //         const userConfig = await this.opencgaSession.opencgaClient.updateUserConfigs({
    //             ...this.opencgaSession.user.configs.IVA,
    //             interpreterGrid: this._config
    //         });
    //         this.opencgaSession.user.configs.IVA = userConfig.responses[0].results[0];
    //         this.renderVariants();
    //     } catch (e) {
    //         NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, e);
    //     }
    // }


    onVariantChange(e) {
        this._variantChanged = e.detail.value;
        // this._variantUpdates = e.detail.update;
    }

    onSaveVariant(e) {
        if (this._variantChanged) {
            this.clinicalAnalysisManager.updateVariant(this._variantChanged, this.clinicalAnalysis.interpretation);
            this._variantChanged = null;
        }
    }

    onCancelVariant(e) {
        this._variantChanged = null;
    }

    getRightToolbar() {
        return [
            {
                render: () => html`
                    <button type="button" class="btn btn-default btn-sm" aria-haspopup="true" aria-expanded="false" @click="${e => this.onConfigClick(e)}">
                        <i class="fas fa-cog icon-padding"></i> Settings ...
                    </button>
                `,
            }
        ];
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

            <opencb-grid-toolbar
                .config="${this.toolbarConfig}"
                .rightToolbar="${this.getRightToolbar()}"
                @columnChange="${this.onColumnChange}"
                @download="${this.onDownload}"
                @sharelink="${this.onShare}">
            </opencb-grid-toolbar>

            <div id="${this._prefix}GridTableDiv">
                <table id="${this._prefix}VariantBrowserGrid"></table>
            </div>

            <div class="modal fade" id="${this._prefix}ReviewSampleModal" tabindex="-1"
                 role="dialog" aria-hidden="true" style="padding-top:0; overflow-y: visible">
                <div class="modal-dialog" style="width: 768px">
                    <div class="modal-content">
                        <div class="modal-header" style="padding: 5px 15px">
                            <h3>Review Variant</h3>
                        </div>
                        <clinical-interpretation-variant-review
                            .opencgaSession="${this.opencgaSession}"
                            .variant="${this.variantReview}"
                            mode=${"form"}
                            @variantChange="${e => this.onVariantChange(e)}">
                        </clinical-interpretation-variant-review>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" data-dismiss="modal" @click="${e => this.onSaveVariant(e)}">OK</button>
                        </div>
                    </div>
                </div>
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
                                    .config="${this._config}"
                                    @configChange="${this.onGridConfigChange}">
                                </variant-interpreter-grid-config>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" data-dismiss="modal" @click="${e => this.onGridConfigSave(e)}">OK</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 25],
            showExport: false,
            detailView: true,
            showReview: true,
            showSelectCheckbox: false,
            showActions: false,
            multiSelection: false,
            nucleotideGenotype: true,

            alleleStringLengthMax: 50,

            genotype: {
                type: "VCF_CALL"
            },
            header: {
                horizontalAlign: "center",
                verticalAlign: "bottom"
            },

            quality: {
                qual: 30,
                dp: 20
            },
            populationFrequencies: [],

            consequenceType: {
                maneTranscript: true,
                gencodeBasicTranscript: true,
                ensemblCanonicalTranscript: true,
                ccdsTranscript: false,
                ensemblTslTranscript: false,
                proteinCodingTranscript: false,
                highImpactConsequenceTypeTranscript: false,

                showNegativeConsequenceTypes: true
            },
            callers: [
                {
                    id: "brass",
                    // TODO
                    columns: [
                        {name: "Assembly Score", field: "BAS", position: 5},
                        {name: "...", field: "CNCH", position: 6},
                        {name: "...", field: "FFV", position: 9},
                    ],
                    info: [
                        {name: "Gene", fields: ["GENE", "TID"], separator: "<br>"},
                        {name: "Region Type", fields: ["RGN"]},
                        {name: "Region Position", fields: ["RGNNO", "RGNC"]}
                    ]
                }
            ],
            evidences: {
                showSelectCheckbox: true,
            },
        };
    }

}

customElements.define("variant-interpreter-rearrangement-grid", VariantInterpreterRearrangementGrid);
