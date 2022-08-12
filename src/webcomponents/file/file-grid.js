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
import UtilsNew from "../../core/utilsNew.js";
import GridCommons from "../commons/grid-commons.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter.js";
import "../commons/opencb-grid-toolbar.js";
import "../loading-spinner.js";
import NotificationUtils from "../commons/utils/notification-utils.js";


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
        this.active = true;
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig()};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
    }

    updated(changedProperties) {
        if ((changedProperties.has("opencgaSession") ||
            changedProperties.has("query") ||
            changedProperties.has("config") ||
            changedProperties.has("active")) &&
            this.active) {
            this.propertyObserver();
        }
    }

    propertyObserver() {
        // With each property change we must updated config and create the columns again. No extra checks are needed.
        this._config = {...this.getDefaultConfig(), ...this.config};
        // Config for the grid toolbar
        this.toolbarConfig = {
            ...this.config.toolbar,
            resource: "FILE",
            buttons: ["columns", "download"],
            columns: this._getDefaultColumns().filter(column => column.visible !== false)
        };
        console.log(this.toolbarConfig);
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
        if (this.opencgaSession.opencgaClient && this.opencgaSession?.study?.fqn) {
            this.table = $("#" + this.gridId);
            this.table.bootstrapTable("destroy");
            this.table.bootstrapTable({
                columns: this._getDefaultColumns(),
                method: "get",
                sidePagination: "server",
                iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
                icons: GridCommons.GRID_ICONS,
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
                        count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                        include: "id,name,path,uuid,samples,status,format,bioformat,size,creationDate,modificationDate,internal",
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
                onClickRow: (row, selectedElement) => this.gridCommons.onClickRow(row.id, row, selectedElement),
                onDblClickRow: (_, element) => {
                    // We detail view is active we expand the row automatically.
                    // FIXME: Note that we use a CSS class way of knowing if the row is expand or collapse, this is not ideal but works.
                    if (this._config.detailView) {
                        if (element[0].innerHTML.includes("fa-plus")) {
                            this.table.bootstrapTable("expandRow", element[0].dataset.index);
                        } else {
                            this.table.bootstrapTable("collapseRow", element[0].dataset.index);
                        }
                    }
                },
                onCheck: row => {
                    this.gridCommons.onCheck(row.id, row);
                },
                onCheckAll: rows => {
                    this.gridCommons.onCheckAll(rows);
                },
                onUncheck: row => {
                    this.gridCommons.onUncheck(row.id, row);
                },
                onUncheckAll: rows => {
                    this.gridCommons.onUncheckAll(rows);
                },
                onLoadSuccess: data => {
                    this.gridCommons.onLoadSuccess(data, 1);
                },
                onLoadError: (e, restResponse) => this.gridCommons.onLoadError(e, restResponse),
                // onPostBody: data => {
                //     // Add tooltips?
                // }
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
            iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
            icons: GridCommons.GRID_ICONS,

            // Set table properties, these are read from config property
            uniqueId: "id",
            pagination: this._config.pagination,
            pageSize: this._config.pageSize,
            pageList: this._config.pageList,
            showExport: this._config.showExport,
            detailView: this._config.detailView,
            detailFormatter: this.detailFormatter,
            formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",

            onClickRow: (row, selectedElement) => this.gridCommons.onClickRow(row.id, row, selectedElement),
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
        let _columns = [
            {
                id: "name",
                title: "Name",
                field: "name"
            },
            {
                id: "directory",
                title: "Directory",
                field: "path",
                formatter: (_, row) => "/" + row.path.replace("/" + row.name, "")
            },
            {
                id: "size",
                title: "Size",
                field: "size",
                formatter: UtilsNew.getDiskUsage
            },
            {
                id: "format",
                title: "Format",
                field: "format"
            },
            {
                id: "bioformat",
                title: "Bioformat",
                field: "bioformat"
            },
            // {
            //     title: "Status",
            //     field: "internal.status.name"
            // },
            {
                id: "index",
                title: "Index",
                field: "internal.index.status.name"
            },
            {
                id: "creationDate",
                title: "Creation date",
                field: "creationDate",
                formatter: CatalogGridFormatter.dateFormatter
            },
            {
                id: "actions",
                title: "Actions",
                field: "id",
                visible: this._config.downloadFile ?? true, // it comes from opencga-sample-browser.config.js
                formatter: value => {
                    const url = [
                        this.opencgaSession.server.host,
                        "/webservices/rest/",
                        this.opencgaSession.server.version,
                        "/files/",
                        value,
                        "/download?study=",
                        this.opencgaSession.study.fqn,
                        "&sid=",
                        this.opencgaSession.token,
                    ];
                    return `
                        <a class="btn btn-small btn-default" target="_blank" href="${url.join("")}">
                            <i class="fas fa-download icon-padding"></i>Download
                        </a>
                    `;
                },
                align: "center",
                valign: "middle",
            },
        ];

        if (this._config.showSelectCheckbox) {
            _columns.push({
                id: "state",
                field: "state",
                checkbox: true,
                // formatter: this.stateFormatter,
                class: "cursor-pointer",
                eligible: false
            });
        }

        _columns = UtilsNew.mergeTable(_columns, this._config.columns || this._config.hiddenColumns, !!this._config.hiddenColumns);

        return _columns;
    }

    async onDownload(e) {
        this.toolbarConfig = {...this.toolbarConfig, downloading: true};
        this.requestUpdate();
        await this.updateComplete;
        const params = {
            ...this.query,
            limit: e.detail?.exportLimit ?? 1000,
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
                    if (e.detail.option.toUpperCase() === "TAB") {
                        const fields = ["id", "path", "format", "bioformat", "size", "creationDate", "modificationDate", "internal.status.name"];
                        const data = UtilsNew.toTableString(results, fields);
                        UtilsNew.downloadData(data, "files_" + this.opencgaSession.study.id + ".tsv", "text/plain");
                    } else {
                        UtilsNew.downloadData(JSON.stringify(results, null, "\t"), "files_" + this.opencgaSession.study.id + ".json", "application/json");
                    }
                } else {
                    console.error("Error in result format");
                }
            })
            .catch(response => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            })
            .finally(() => {
                this.toolbarConfig = {...this.toolbarConfig, downloading: false};
                this.requestUpdate();
            });
    }

    render() {
        return html`
            ${this._config.showToolbar ? html`
                <opencb-grid-toolbar
                    .config="${this.toolbarConfig}"
                    .query="${this.query}"
                    .opencgaSession="${this.opencgaSession}"
                    @columnChange="${this.onColumnChange}"
                    @download="${this.onDownload}"
                    @export="${this.onDownload}">
                </opencb-grid-toolbar>
            ` : null}
            <div id="${this._prefix}GridTableDiv">
                <table id="${this._prefix}FileBrowserGrid"></table>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 10,
            pageList: [10, 25, 50],
            showExport: false,
            detailView: false,
            detailFormatter: null, // function with the detail formatter
            multiSelection: false,
            showSelectCheckbox: false,
            showToolbar: true,
        };
    }

}

customElements.define("file-grid", OpencgaFileGrid);
