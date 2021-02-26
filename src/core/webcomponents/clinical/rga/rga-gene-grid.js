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
import UtilsNew from "../../../utilsNew.js";
import GridCommons from "../../commons/grid-commons.js";
import CatalogGridFormatter from "../../commons/catalog-grid-formatter.js";


export default class RgaGeneGrid extends LitElement {

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
            query: {
                type: Object
            },
            active: {
                type: Boolean
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "rga-g-" + UtilsNew.randomString(6) + "_";
        this.gridId = this._prefix + "RgaGeneBrowserGrid";
        this.prevQuery = {};
        this._query = {};

    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
    }

    firstUpdated(_changedProperties) {
    }

    updated(changedProperties) {
        if ((changedProperties.has("opencgaSession") || changedProperties.has("query") || changedProperties.has("config") || changedProperties.has("active")) && this.active) {
            this.propertyObserver();
        }
    }

    propertyObserver() {
        // With each property change we must updated config and create the columns again. No extra checks are needed.
        this._config = Object.assign(this.getDefaultConfig(), this.config);
        this._columns = this._initTableColumns();
        // Config for the grid toolbar
        this.toolbarConfig = {
            columns: this._columns[0]
        };

        this.renderTable();
    }

    renderTable() {
        if (!this.active) {
            return;
        }

        this._query = {...this.query, study: this.opencgaSession.study.fqn}; // we want to support a query obj param both with or without study.
        console.log("UtilsNew.objectCompare(this._query, this.prevQuery)", UtilsNew.objectCompare(this._query, this.prevQuery));
        if (UtilsNew.objectCompare(this._query, this.prevQuery)) {
            return;
        }

        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            // url: opencgaHostUrl,
            columns: this._columns,
            method: "get",
            sidePagination: "server",
            uniqueId: "id",
            // Table properties
            pagination: this._config.pagination,
            pageSize: this._config.pageSize,
            pageList: this._config.pageList,
            paginationVAlign: "both",
            formatShowingRows: this.gridCommons.formatShowingRows,
            showExport: this._config.showExport,
            detailView: this._config.detailView,
            detailFormatter: this._config.detailFormatter,
            formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
            ajax: params => {
                const _filters = {
                    study: this.opencgaSession.study.fqn,
                    // order: params.data.order,
                    // limit: params.data.limit,
                    // skip: params.data.offset || 0,
                    // count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                    ...this._query,
                    // geneName: "BRCA2,BRCA1",
                    limit: 2
                };
                this.opencgaSession.opencgaClient.clinical().queryRgaGene(_filters)
                    .then(res => {
                        console.log("res", res);
                        params.success(res);
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
            onCheck: (row, $element) => this.gridCommons.onCheck(row.id, row),
            onLoadSuccess: data => this.gridCommons.onLoadSuccess(data, 1),
            onLoadError: (e, restResponse) => this.gridCommons.onLoadError(e, restResponse)
        });

    }

    onColumnChange(e) {
        this.gridCommons.onColumnChange(e);
    }

    sampleFormatter(value, row) {
        if (UtilsNew.isNotUndefined(row.samples)) {
            return row.samples.length;
        } else {
            return 0;
        }
    }

    _initTableColumns() {
        return [
            [
                {
                    title: "Gene",
                    field: "name",
                    rowspan: 2,
                    halign: "center",
                    formatter: this.geneIdFormatter
                },
                {
                    title: "Compound Heterozygous",
                    colspan: 4
                },
                {
                    title: "Homozygous"
                },
                {
                    title: "All"
                }
            ],
            [
                {
                    title: "Tot"
                    // formatter: this.compTotalFormatter.bind(this)
                },
                {
                    title: "Def."
                },
                {
                    title: "Probable"
                },
                {
                    title: "Possible"
                },
                {
                    title: "Total"
                },
                {
                    title: "Total"
                    // formatter: (val, row, index) => this.tableData[index].individuals?.length
                }
            ]
        ];
    }

    async onDownload(e) {

    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 10,
            pageList: [10, 25, 50],
            showExport: false,
            detailView: false,
            detailFormatter: undefined, // function with the detail formatter
            multiSelection: false,
            header: {
                horizontalAlign: "center",
                verticalAlign: "bottom"
            }
        };
    }

    render() {
        return html`
            <opencb-grid-toolbar
                .config="${this.toolbarConfig}"
                 @columnChange="${this.onColumnChange}"
                 @download="${this.onDownload}">
            </opencb-grid-toolbar>

            <div id="${this._prefix}GridTableDiv">
                <table id="${this._prefix}RgaGeneBrowserGrid"></table>
            </div>
            

        `;
    }

}

customElements.define("rga-gene-grid", RgaGeneGrid);
