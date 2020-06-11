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
import GridCommons from "../variant/grid-commons.js";
import UtilsNew from "../../utilsNew.js";
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
            }
        };
    }

    _init() {
        this._prefix = "fg" + UtilsNew.randomString(6);
        this.gridId = this._prefix + "FileBrowserGrid";
        this._config = this.getDefaultConfig();
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
        if (changedProperties.has("opencgaSession") || changedProperties.has("query")) {
            this.renderTable();
        }

        if (changedProperties.has("config")) {
            this._config = Object.assign(this.getDefaultConfig(), this.config);
            this.requestUpdate();
        }
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
        this.from = 1;
        this.to = this._config.pageSize || 10;

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
                formatShowingRows: this.gridCommons.formatShowingRows,
                showExport: this._config.showExport,
                detailView: this._config.detailView,
                detailFormatter: this._config.detailFormatter,
                formatLoadingMessage: () =>"<div><loading-spinner></loading-spinner></div>",
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
                    this.opencgaSession.opencgaClient.files().search(filters).then( res => params.success(res));
                },
                responseHandler: response => {
                    const result = this.gridCommons.responseHandler(response, $(this.table).bootstrapTable("getOptions"));
                    this.from = result.from || this.from;
                    this.to = result.to || this.to;
                    this.numTotalResultsText = result.numTotalResultsText || this.numTotalResultsText;
                    this.approximateCountResult = result.approximateCountResult;
                    this.requestUpdate();
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
                onPageChange: (page, size) => {
                    const result = this.gridCommons.onPageChange(page, size);
                    this.from = result.from || this.from;
                    this.to = result.to || this.to;
                },
                onPostBody: (data) => {
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
            formatLoadingMessage: () =>"<div><loading-spinner></loading-spinner></div>",

            onClickRow: (row, selectedElement, field) => this.gridCommons.onClickRow(row.id, row, selectedElement),
            onPageChange: (page, size) => {
                const result = this.gridCommons.onPageChange(page, size);
                this.from = result.from || this.from;
                this.to = result.to || this.to;
            },
            onPostBody: (data) => {
                // We call onLoadSuccess to select first row
                this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 2);
                // this.catalogUiUtils.addTooltip("div.phenotypesTooltip", "Phenotypes");
            }
        });
    }

    // sizeFormatter(bytes) {
    //     const si = true; // international system of units
    //     let u, b=bytes, t= si ? 1000 : 1024;
    //     ["", si?"k":"K", ..."MGTPEZY"].find(x=> (u=x, b/=t, b**2<1));
    //     return `${u ? (t*b).toFixed(1) : bytes} ${u}${!si && u ? "i":""}B`;
    // }

    creationDateFormatter(date) {
        //return moment(date, "YYYYMMDDHHmmss").format("D MMM YYYY, h:mm:ss a")
        return `<a tooltip-title="Creation date"  tooltip-text="${moment(date, "YYYYMMDDHHmmss").format("D MMM YYYY, h:mm:ss a")}"> ${moment(date, "YYYYMMDDHHmmss").fromNow()} </a>`
    }

    _getDefaultColumns() {
        // name,path,samples,status,format,bioformat,creationDate,modificationDate,uuid"
        let _columns = [
            {
                title: "Uuid",
                field: "uuid",
                visible: false
            },
            {
                title: "Name",
                field: "name"
            },
            {
                title: "Path",
                field: "path"
            },
            {
                title: "Format",
                field: "format"
            },
            {
                title: "Bioformat",
                field: "bioformat"
            },
            {
                title: "Size",
                field: "size",
                formatter: UtilsNew.getDiskUsage
            },
            {
                title: "Creation date",
                field: "creationDate",
                formatter: this.creationDateFormatter
            },
            {
                title: "Status",
                field: "internal.status.name"
            },
            {
                title: "Index",
                field: "internal.index.status.name"
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

    onDownload(e) {
        // let urlQueryParams = this._getUrlQueryParams();
        // let params = urlQueryParams.queryParams;
        const params = {
            ...this.query,
            limit: 1000,
            sid: this.opencgaSession.opencgaClient._config.sessionId,
            skip: 0,
            count: false,
            study: this.opencgaSession.study.fqn,
            include: "name,path,format,bioformat,creationDate,modificationDate,status",
            type: "FILE"
        };
        this.opencgaSession.opencgaClient.files().search(params)
            .then(response => {
                const result = response.response[0].result;
                let dataString = [];
                let mimeType = "";
                let extension = "";
                if (result) {
                    // Check if user clicked in Tab or JSON format
                    if (e.detail.option.toLowerCase() === "tab") {
                        dataString = [
                            ["Name", "Path", "Format", "Bioformat", "Size", "Creation date", "Modification date", "Status"].join("\t"),
                            ...result.map( _ => [
                                _.id,
                                _.path,
                                _.format,
                                _.bioformat,
                                _.size,
                                _.creationDate,
                                _.modificationDate,
                                _.status.name
                            ].join("\t"))];
                        // console.log(dataString);
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
                    a.download = this.opencgaSession.study.alias + extension;
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(function() {
                        document.body.removeChild(a);
                    }, 0);
                } else {
                    console.error("Error in result format");
                }
            })
            .then(function() {
                // this.downloadRefreshIcon.css("display", "none");
                // this.downloadIcon.css("display", "inline-block");
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
            <opencb-grid-toolbar .from="${this.from}"
                                .to="${this.to}"
                                .numTotalResultsText="${this.numTotalResultsText}"
                                @columnChange="${this.onColumnChange}"
                                @download="${this.onDownload}">
            </opencb-grid-toolbar>
            <div id="${this._prefix}GridTableDiv">
                <table id="${this._prefix}FileBrowserGrid">
                </table>
            </div>
        `;
    }

}

customElements.define("opencga-file-grid", OpencgaFileGrid);
