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
import UtilsNew from "../../utilsNew.js";
import {NotificationQueue} from "../Notification.js";
import GridCommons from "../commons/grid-commons.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter.js";
import "../commons/opencb-grid-toolbar.js";
import "../loading-spinner.js";


export default class OpencgaFileGrid extends LitElement {

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
            files: {
                type: Array
            },
            config: {
                type: Object
            },
            active: {
                type: Boolean
            }
        };
    }

    _init() {
        this._prefix = "fg" + UtilsNew.randomString(6);
        this.gridId = this._prefix + "FileBrowserGrid";
        this._config = this.getDefaultConfig();
        this.active = true;
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
    }

    firstUpdated(_changedProperties) {
        this.dispatchEvent(new CustomEvent("clear", {detail: {}, bubbles: true, composed: true}));
        this.table = this.querySelector("#" + this.gridId);
        this.query = {};
    }

    updated(changedProperties) {
        if ((changedProperties.has("opencgaSession") || changedProperties.has("query") || changedProperties.has("active")) && this.active) {
            this.propertyObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.requestUpdate();
        }
    }

    propertyObserver() {
        this.toolbarConfig = {
            resource: "FILE",
            buttons: ["columns", "download"],
            columns: this._getDefaultColumns().filter(column => column.visible !== false)
        };
        this.renderTable();
    }

    renderTable() {
        // If this.files is provided as property we render the array directly
        if (this.files && this.files.length > 0) {
            this.renderLocalTable();
        } else {
            this.renderRemoteTable();
        }
        this.requestUpdate();
    }

    renderRemoteTable() {
        if (this.opencgaSession.opencgaClient && this.opencgaSession.study && this.opencgaSession.study.fqn) {
            this.table = $("#" + this.gridId);
            this.table.bootstrapTable("destroy");
            this.table.bootstrapTable({
                columns: this._getDefaultColumns(),
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
                    const filters = {
                        study: this.opencgaSession.study.fqn,
                        type: "FILE",
                        limit: params.data.limit,
                        skip: params.data.offset || 0,
                        count: !$(this.table).bootstrapTable("getOptions").pageNumber || $(this.table).bootstrapTable("getOptions").pageNumber === 1,
                        include: "name,path,uuid,samples,status,format,bioformat,size,creationDate,modificationDate,internal",
                        ...this.query
                    };
                    this.opencgaSession.opencgaClient.files().search(filters)
                        .then(res => params.success(res))
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
                onDblClickRow: (row, element, field) => {
                    // We detail view is active we expand the row automatically.
                    // FIXME: Note that we use a CSS class way of knowing if the row is expand or collapse, this is not ideal but works.
                    if (this._config.detailView) {
                        if (element[0].innerHTML.includes("icon-plus")) {
                            this.table.bootstrapTable("expandRow", element[0].dataset.index);
                        } else {
                            this.table.bootstrapTable("collapseRow", element[0].dataset.index);
                        }
                    }
                },
                onCheck: (row, $element) => {
                    this.gridCommons.onCheck(row.id, row);
                },
                onCheckAll: rows => {
                    this.gridCommons.onCheckAll(rows);
                },
                onUncheck: (row, $element) => {
                    this.gridCommons.onUncheck(row.id, row);
                },
                onUncheckAll: rows => {
                    this.gridCommons.onUncheckAll(rows);
                },
                onLoadSuccess: data => {
                    this.gridCommons.onLoadSuccess(data, 1);
                },
                onLoadError: (e, restResponse) => this.gridCommons.onLoadError(e, restResponse),
                onPostBody: data => {
                    // Add tooltips?
                }
            });
        }
    }

    renderLocalTable() {
        this.from = 1;
        this.to = Math.min(this.samples.length, this._config.pageSize);
        this.numTotalResultsText = this.samples.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            columns: this._getDefaultColumns(),
            data: this.files,
            sidePagination: "local",

            // Set table properties, these are read from config property
            uniqueId: "id",
            pagination: this._config.pagination,
            pageSize: this._config.pageSize,
            pageList: this._config.pageList,
            showExport: this._config.showExport,
            detailView: this._config.detailView,
            detailFormatter: this.detailFormatter,
            formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",

            onClickRow: (row, selectedElement, field) => this.gridCommons.onClickRow(row.id, row, selectedElement),
            onPageChange: (page, size) => {
                const result = this.gridCommons.onPageChange(page, size);
                this.from = result.from || this.from;
                this.to = result.to || this.to;
            },
            onPostBody: data => {
                // We call onLoadSuccess to select first row
                this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 2);
            }
        });
    }

    onColumnChange(e) {
        this.gridCommons.onColumnChange(e);
    }

    _getDefaultColumns() {
        const _columns = [
            {
                title: "Name",
                field: "name"
            },
            {
                title: "Directory",
                // field: "path",
                formatter: (value, row) => "/" + row.path.replace("/" + row.name, "")
            },
            {
                title: "Size",
                field: "size",
                formatter: UtilsNew.getDiskUsage
            },
            {
                title: "Format",
                field: "format"
            },
            {
                title: "Bioformat",
                field: "bioformat"
            },
            // {
            //     title: "Status",
            //     field: "internal.status.name"
            // },
            {
                title: "Index",
                field: "internal.index.status.name"
            },
            {
                title: "Creation date",
                field: "creationDate",
                formatter: CatalogGridFormatter.dateFormatter
            },
            {
                title: "Actions",
                field: "id",
                visible: this._config.downloadFile ?? true, // it comes from opencga-sample-browser.config.js
                formatter: (value, row) => {
                    const url = this.opencgaSession.server.host + "/webservices/rest/" + this.opencgaSession.server.version + "/files/" + value + "/download?study=" + this.opencgaSession.study.fqn + "&sid=" + this.opencgaSession.token;
                    return `<a class="btn btn-small btn-default ripple one-line" target="_blank" href="${url}"> <i class="fas fa-download"></i> Download</a>`;
                },
                valign: "middle",
                events: {
                    "click button": this.downloadFile
                }
            }
        ];

        if (this._config.showSelectCheckbox) {
            _columns.push({
                field: "state",
                checkbox: true,
                // formatter: this.stateFormatter,
                class: "cursor-pointer",
                eligible: false
            });
        }

        return _columns;
    }

    async onDownload(e) {
        this.toolbarConfig = {...this.toolbarConfig, downloading: true};
        await this.requestUpdate();
        const params = {
            ...this.query,
            limit: 1000,
            skip: 0,
            count: false,
            study: this.opencgaSession.study.fqn,
            include: "name,path,format,bioformat,size,creationDate,modificationDate,internal",
            type: "FILE"
        };
        this.opencgaSession.opencgaClient.files().search(params)
            .then(restResponse => {
                const results = restResponse.getResults();
                if (results) {
                    // Check if user clicked in Tab or JSON format
                    if (e.detail.option.toLowerCase() === "tab") {
                        const fields = ["id", "path", "format", "bioformat", "size", "creationDate", "modificationDate", "internal.status.name"];
                        const data = UtilsNew.toTableString(results, fields);
                        UtilsNew.downloadData(data, "files_" + this.opencgaSession.study.id + ".txt", "text/plain");
                    } else {
                        UtilsNew.downloadData(JSON.stringify(results, null, "\t"), "files_" + this.opencgaSession.study.id + ".json", "application/json");
                    }
                } else {
                    console.error("Error in result format");
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
            detailView: false,
            detailFormatter: undefined, // function with the detail formatter
            multiSelection: false,
            showSelectCheckbox: false
        };
    }

    render() {
        return html`
            <opencb-grid-toolbar  .config="${this.toolbarConfig}"
                                  .query="${this.query}"
                                  .opencgaSession="${this.opencgaSession}"
                                  @columnChange="${this.onColumnChange}"
                                  @download="${this.onDownload}"
                                  @export="${this.onDownload}">
            </opencb-grid-toolbar>
            <div id="${this._prefix}GridTableDiv">
                <table id="${this._prefix}FileBrowserGrid"></table>
            </div>
        `;
    }

}

customElements.define("opencga-file-grid", OpencgaFileGrid);
