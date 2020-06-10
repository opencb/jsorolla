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
import {RestResponse} from "../../clients/rest-response.js";
import UtilsNew from "../../utilsNew.js";
import GridCommons from "../variant/grid-commons.js";
import "../commons/opencb-grid-toolbar.js";
import "../loading-spinner.js";
import DATA from "./data.js";

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
            stats: {
                type: Array
            },
            filters: {
                type: Object
            },
            query: {
                type: Object
            },
            // TODO check do we really need it..
            eventNotifyName: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "gcgrid" + UtilsNew.randomString(6) + "_";
        this.eventNotifyName = "messageevent";
        this.gridId = this._prefix + "GeneBrowserGrid";

        this.file = "SonsAlignedBamFile.bam";
        this.gene = "TP53";

        this.coverageArray = [1, 5, 10, 15, 20, 25, 30, 40, 50, 60];
        this.coverageQuality = [100, 95, 90, 85, 80, 75, 70, 65, 60, 55];
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
    }

    firstUpdated(_changedProperties) {
        this._initTableColumns();
        //this.dispatchEvent(new CustomEvent("clear", {detail: {}, bubbles: true, composed: true}));
        this.table = this.querySelector("#" + this.gridId);
        this.query = {};
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("query")) {
            this.renderTable();
        }
        if (changedProperties.has("filters")) {
            this.onFilterUpdate();
        }
        if (changedProperties.has("config")) {
            this.configObserver();
        }

        if (changedProperties.has("filteredVariables")) {
            //this.calculateFilters(); // TODO whats this?
        }
    }

    configObserver() {
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    async renderTable() {
        this.genes = [];
        this.from = 1;
        this.to = 10;

        const restResponse = await this.opencgaSession.opencgaClient.alignments().statsCoverage(this.file, this.gene, {study: this.opencgaSession.study.fqn});
        this.data = restResponse.getResults()[0];

        if (this.opencgaSession.opencgaClient && this.opencgaSession?.study?.fqn) {
            $(this.table).bootstrapTable("destroy");
            $(this.table).bootstrapTable({
                data: this.data.stats,
                columns: this._columns,
                sidePagination: "local",
                uniqueId: "transcriptId",
                // Table properties
                pagination: this._config.pagination,
                pageSize: this._config.pageSize,
                pageList: this._config.pageList,
                showExport: this._config.showExport,
                //detailView: this._config.detailView,
                formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
                onClickRow: (row, selectedElement, field) => this.gridCommons.onClickRow(row.id, row, selectedElement),
                onCheck: (row, $element) => this.gridCommons.onCheck(row.id, row),
                onCheckAll: rows => this.gridCommons.onCheckAll(rows),
                onUncheck: (row, $element) => this.gridCommons.onUncheck(row.id, row),
                onUncheckAll: rows => this.gridCommons.onUncheckAll(rows),
                onLoadSuccess: data => this.gridCommons.onLoadSuccess(data, 1, "transcriptId"),
                onPageChange: (page, size) => {
                    const result = this.gridCommons.onPageChange(page, size);
                    this.from = result.from || this.from;
                    this.to = result.to || this.to;
                },
                onPostBody: (data) => {
                    // We call onLoadSuccess to select first row
                    this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 1);
                }
            });
        } else {
            // Delete table
            this.table.bootstrapTable("destroy");
            this.numTotalResults = 0;
        }
    }

    percentageFormatter(v) {
        return parseFloat(v).toFixed(2) + "%";
    }

    cellStyle(value, row, index, field) {
        let coverage = Number.parseInt(field.split(".")[1]);
        let thresholdValue = this.coverageQuality ? this.coverageQuality[coverage] : 80;
        const color = value >= thresholdValue ? "rgba(176, 255, 199, 0.2)" : "rgba(255,194,194,0.2)";
        return {
            css: {
                background: `linear-gradient(90deg, ${color} 0%, ${color} ${value}%, transparent ${value}%, transparent ${value}%)`
            }
        };
    }

    _initTableColumns() {
        this._columns = [
            {
                title: "transcript Id",
                field: "id",
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
            }
        ];

        return this._columns;
    }

    onDownload(e) {
        const result = this.data.stats;
        let dataString = [];
        let mimeType = "";
        let extension = "";
        // Check if user clicked in Tab or JSON format
        if (e.detail.option.toLowerCase() === "tab") {
            dataString = [
                ["transcript Id", "> 1x", "> 5x", "> 10x", "> 15x", "> 20x", "> 25x", "> 30x", "> 40x", "> 50x", "> 60x"].join("\t"),
                ...result.map(_ => [
                    _.id,
                    ..._.depths
                ].join("\t"))];
            mimeType = "text/plain";
            extension = ".txt";
        } else {
            for (const res of result) {
                dataString.push(JSON.stringify(res, null, "\t"));
            }
            mimeType = "application/json";
            extension = ".json";
        }

        // Build file and anchor link
        const data = new Blob([dataString.join("\n")], {type: mimeType});
        const file = window.URL.createObjectURL(data);
        const a = document.createElement("a");
        a.href = file;
        a.download = this.opencgaSession.study.alias + "[" + new Date().toISOString() + "]" + extension;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
        }, 0);

    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 10,
            pageList: [10, 25, 50],
            showExport: false,
            detailView: false,
            showSelectCheckbox: false,
            multiSelection: false,
            nucleotideGenotype: true,
            alleleStringLengthMax: 15,
            showToolbar: true,
            header: {
                horizontalAlign: "center",
                verticalAlign: "bottom"
            }
        };
    }

    render() {
        return html`
            ${this._config.showToolbar ? html`
                <opencb-grid-toolbar .from="${this.from}"
                                    .to="${this.to}"
                                    .numTotalResultsText="${this.numTotalResultsText}"
                                    @download="${this.onDownload}">
                </opencb-grid-toolbar>`
            : null}
            <div>
                <table id="${this.gridId}"></table>
            </div>
        `;
    }

}

customElements.define("gene-coverage-grid", GeneCoverageGrid);
