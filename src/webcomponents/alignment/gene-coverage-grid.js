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
import GridCommons from "../commons/grid-commons.js";
import "../commons/opencb-grid-toolbar.js";
import "../loading-spinner.js";
// import DATA from "./data.js";

export default class GeneCoverageGrid extends LitElement {

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
            geneIds: {
                type: String
            },
            transcriptCoverageStats: {
                type: Array
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "gcgrid" + UtilsNew.randomString(6);
        this.gridId = this._prefix + "GeneBrowserGrid";

        // this.file = "SonsAlignedBamFile.bam"; // TODO remove
        // this.gene = "TP53"; // TODO remove
        this.transcriptCoverageStats = null;
        this.loading = false;
        this.errorState = false;

        // this.coverageArray = [1, 5, 10, 15, 20, 25, 30, 40, 50, 60];
        this.coverageQuality = [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 50];
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
    }

    firstUpdated() {
        this._initTableColumns();
        // this.dispatchEvent(new CustomEvent("clear", {detail: {}, bubbles: true, composed: true}));
        this.table = this.querySelector("#" + this.gridId);
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("geneIds")) {
            // this.renderTable();
        }
        if (changedProperties.has("transcriptCoverageStats")) {
            this.renderLocalTable();
        }
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    renderLocalTable() {
        this.from = 1;
        this.to = Math.min(this.transcriptCoverageStats.length, this._config.pageSize);
        this.numTotalResultsText = this.transcriptCoverageStats.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            theadClasses: "table-light",
            buttonsClass: "light",
            data: this.transcriptCoverageStats,
            columns: this._initTableColumns(),
            sidePagination: "local",
            iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
            icons: GridCommons.GRID_ICONS,
            // Set table properties, these are read from config property
            uniqueId: "id",
            pagination: this._config.pagination,
            pageSize: this._config.pageSize,
            pageList: this._config.pageList,
            showExport: this._config.showExport,
            detailView: !!this.detailFormatter,
            loadingTemplate: () => GridCommons.loadingFormatter(),
            onClickRow: (row, selectedElement) => this.gridCommons.onClickRow(row.id, row, selectedElement),
            onPageChange: (page, size) => {
                const result = this.gridCommons.onPageChange(page, size);
                this.from = result.from || this.from;
                this.to = result.to || this.to;
            },
            onPostBody: data => {
                // We call onLoadSuccess to select first row
                this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 1);
            }
        });
    }

    async renderTable() {
        this.from = 1;
        this.to = 10;

        try {
            if (this.opencgaSession.opencgaClient && this.opencgaSession?.study?.fqn && this.geneIds) {
                this.errorState = false;
                this.table = $("#" + this.gridId);
                this.table.bootstrapTable("destroy");
                this.table.bootstrapTable({
                    theadClasses: "table-light",
                    buttonsClass: "light",
                    columns: this._columns,
                    uniqueId: "id",
                    iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
                    icons: GridCommons.GRID_ICONS,
                    // Table properties
                    showPaginationSwitch: true,
                    pagination: this._config.pagination,
                    pageSize: this._config.pageSize,
                    pageList: this._config.pageList,
                    showExport: this._config.showExport,
                    detailView: !!this.detailFormatter,
                    loadingTemplate: () => GridCommons.loadingFormatter(),
                    ajax: params => {
                        this.opencgaSession.opencgaClient.alignments().statsCoverage(this.file, this.geneIds, {study: this.opencgaSession.study.fqn})
                            .then(restResponse => {
                                this.transcriptCoverageStats = restResponse.getResults()[0].stats;
                                params.success(this.transcriptCoverageStats);
                            })
                            .catch(e => {
                                console.error(e);
                                params.error(e);
                            });
                    },
                    onClickRow: (row, selectedElement) => this.gridCommons.onClickRow(row.id, row, selectedElement),
                    onCheck: row => this.gridCommons.onCheck(row.id, row),
                    onCheckAll: rows => this.gridCommons.onCheckAll(rows),
                    onUncheck: row => this.gridCommons.onUncheck(row.id, row),
                    onUncheckAll: rows => this.gridCommons.onUncheckAll(rows),
                    onLoadSuccess: data => this.gridCommons.onLoadSuccess(data, 1, "id"),
                    onLoadError: (e, restResponse) => this.gridCommons.onLoadError(e, restResponse),
                    onPageChange: (page, size) => {
                        const result = this.gridCommons.onPageChange(page, size);
                        this.from = result.from || this.from;
                        this.to = result.to || this.to;
                    },
                    onPostBody: () => {
                        // We call onLoadSuccess to select first row
                        // this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 0);
                    }
                });

            } else {
                // Delete table
                $(this.table).bootstrapTable("destroy");
            }
        } catch (e) {
            console.error(e);
            this.transcriptCoverageStats = null;
            this.errorState = "Error from the Server";
            this.requestUpdate();
        }
    }

    transcriptIdFormatter(value, row) {
        return `<a href="http://www.ensembl.org/Homo_sapiens/Transcript/Summary?db=core;t=${row.id}" target="_blank">${row.id}</a>
                <br>
                <em>${row.biotype}</em>
        `;
    }

    percentageFormatter(value) {
        return parseFloat(value).toFixed(2) + "%";
    }

    cellStyle(value, row, index, field) {
        const coverage = Number.parseInt(field.split(".")[1]);
        const thresholdValue = this.coverageQuality ? this.coverageQuality[coverage] : 80;
        const color = value >= thresholdValue ? "#e7f7ec" : "#fef3f3";
        return {
            css: {
                background: `linear-gradient(90deg, ${color} 0%, ${color} ${value}%, transparent ${value}%, transparent 100%)`
            }
        };
    }

    _initTableColumns() {
        this._columns = [
            {
                title: "Transcript Id",
                formatter: this.transcriptIdFormatter
            },
            {
                title: "> 1x",
                field: "depths.0",
                formatter: this.percentageFormatter,
                cellStyle: this.cellStyle.bind(this)
            },
            {
                title: "> 5x",
                field: "depths.1",
                formatter: this.percentageFormatter,
                cellStyle: this.cellStyle.bind(this)
            },
            {
                title: "> 10x",
                field: "depths.2",
                formatter: this.percentageFormatter,
                cellStyle: this.cellStyle.bind(this)
            },
            {
                title: "> 15x",
                field: "depths.3",
                formatter: this.percentageFormatter,
                cellStyle: this.cellStyle.bind(this)
            },
            {
                title: "> 20x",
                field: "depths.4",
                formatter: this.percentageFormatter,
                cellStyle: this.cellStyle.bind(this)
            },
            {
                title: "> 25x",
                field: "depths.5",
                formatter: this.percentageFormatter,
                cellStyle: this.cellStyle.bind(this)
            },
            {
                title: "> 30x",
                field: "depths.6",
                formatter: this.percentageFormatter,
                cellStyle: this.cellStyle.bind(this)
            },
            {
                title: "> 40x",
                field: "depths.7",
                formatter: this.percentageFormatter,
                cellStyle: this.cellStyle.bind(this)
            },
            {
                title: "> 50x",
                field: "depths.8",
                formatter: this.percentageFormatter,
                cellStyle: this.cellStyle.bind(this)
            },
            {
                title: "> 60x",
                field: "depths.9",
                formatter: this.percentageFormatter,
                cellStyle: this.cellStyle.bind(this)
            },
            {
                title: "> 75x",
                field: "depths.10",
                formatter: this.percentageFormatter,
                cellStyle: this.cellStyle.bind(this)
            },
            {
                title: "> 100x",
                field: "depths.11",
                formatter: this.percentageFormatter,
                cellStyle: this.cellStyle.bind(this)
            }
        ];

        return this._columns;
    }

    onDownload(e) {
        const results = this.transcriptCoverageStats;
        // Check if user clicked in Tab or JSON format
        if (e.detail.option.toLowerCase() === "tab") {
            const dataString = [
                ["transcript Id", "> 1x", "> 5x", "> 10x", "> 15x", "> 20x", "> 25x", "> 30x", "> 40x", "> 50x", "> 60x", "> 75x", "> 100x"].join("\t"),
                ...results.map(_ => [
                    _.id,
                    ..._.depths
                ].join("\t"))];
            UtilsNew.downloadData(dataString, "gene_coverage_" + this.opencgaSession.study.id + ".tsv", "text/plain");
        } else {
            UtilsNew.downloadData(JSON.stringify(results, null, "\t"), this.opencgaSession.study.id + ".json", "application/json");
        }
    }

    render() {
        return html`
            ${this.loading ? html`
                <div id="loading">
                    <loading-spinner></loading-spinner>
                </div>
            ` : null}
            ${this._config.showToolbar ? html`
                <opencb-grid-toolbar @download="${this.onDownload}">
                </opencb-grid-toolbar>` : nothing
            }
            <div class="gene-coverage-grid">
                <table id="${this.gridId}"></table>
            </div>
            ${this.errorState ? html`
                <div id="error" class="alert alert-danger" role="alert">
                    ${this.errorState}
                </div>
            ` : null}
        `;
    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 10,
            pageList: [10, 25, 50],
            showExport: false,
            alleleStringLengthMax: 15,
            showToolbar: true,
        };
    }

}

customElements.define("gene-coverage-grid", GeneCoverageGrid);
