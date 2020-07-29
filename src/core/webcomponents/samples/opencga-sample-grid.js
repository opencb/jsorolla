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
import CatalogUIUtils from "../commons/CatalogUIUtils.js";
import "../commons/opencb-grid-toolbar.js";


export default class OpencgaSampleGrid extends LitElement {

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
            samples: {
                type: Array
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
        this._prefix = "VarSampleGrid" + UtilsNew.randomString(6);

        this.catalogUiUtils = new CatalogUIUtils();
        this.gridId = this._prefix + "SampleBrowserGrid";
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
    }

    firstUpdated() {
        this.table = $("#" + this.gridId);
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession") ||
            changedProperties.has("query") ||
            changedProperties.has("active")) {
            this.propertyObserver();
        }

        if (changedProperties.has("config")) {
            this.configObserver();
        }
    }

    propertyObserver() {
        // With each property change we must updated config and create the columns again. No extra checks are needed.
        //this._config = Object.assign(this.getDefaultConfig(), this.config);
        //this._columns = this._initTableColumns();

        // Config for the grid toolbar
        this.toolbarConfig = {
            columns: this._getDefaultColumns()
        };

        this.renderTable();
    }

    configObserver() {
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    renderTable() {
        // If this.samples is provided as property we render the array directly
        if (this.samples && this.samples.length > 0) {
            this.renderLocalTable();
        } else {
            this.renderRemoteTable();
        }
        this.requestUpdate();
    }

    renderRemoteTable() {
        // Initialise row counters
        this.from = 1;
        this.to = this._config.pageSize;

        if (this.opencgaSession.opencgaClient && this.opencgaSession.study && this.opencgaSession.study.fqn) {
            const filters = {...this.query};
            //TODO fix and replicate this in all browsers (the current filter is not "filters", it is actually built in the ajax() function in bootstrapTable)
            if (UtilsNew.isNotUndefinedOrNull(this.lastFilters) &&
                JSON.stringify(this.lastFilters) === JSON.stringify(filters)) {
                // Abort destroying and creating again the grid. The filters have not changed
                return;
            }

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
                gridContext: this,
                formatLoadingMessage: () =>"<div><loading-spinner></loading-spinner></div>",
                ajax: params => {
                    const _filters = {
                        study: this.opencgaSession.study.fqn,
                        limit: params.data.limit,
                        skip: params.data.offset || 0,
                        count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                        //include: "id,phenotypes,internal,individualId,creationDate",
                        ...filters
                    };
                    // Store the current filters
                    this.lastFilters = {..._filters};
                    this.opencgaSession.opencgaClient.samples().search(_filters)
                        .then( res => params.success(res))
                        .catch( e => {
                            console.error(e);
                            params.error(e);
                        });
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
                onLoadError: (e, restResponse) => this.gridCommons.onLoadError(e, restResponse),
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
            data: this.samples,
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
                this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 1);
            }
        });
    }

    onColumnChange(e) {
        this.gridCommons.onColumnChange(e);
    }

    individualFormatter(value, row) {
        return row?.individualId ?? "-";
    }

    fileFormatter(values, row) {
        return values?.length
            ? values
                .filter(fileId => fileId.endsWith("vcf") || fileId.endsWith("vcf.gz") || fileId.endsWith("bam"))
                .map(fileId => {
                    let fields = fileId.split(":");
                    return fields[fields.length - 1];
                })
                .join("<br>")
            : "-";
    }

    dateFormatter(value, row) {
        return moment(value, "YYYYMMDDHHmmss").format("D MMM YYYY");
    }

    cellTypeFormatter(value, row) {
        return (row.somatic) ? "Somatic" : "Germline";
    }

    _getDefaultColumns() {

        let _columns = [
                {
                    title: "Sample ID",
                    field: "id"
                },
                {
                    title: "Individual ID",
                    formatter: this.individualFormatter
                },
                {
                    title: "Files",
                    field: "fileIds",
                    formatter: this.fileFormatter
                },
                {
                    title: "Collection Method",
                    field: "collection.method"
                },
                {
                    title: "Preparation Method",
                    field: "processing.preparationMethod"
                },
                {
                    title: "Cell Line",
                    formatter: this.cellTypeFormatter
                },
                {
                    title: "Creation Date",
                    field: "creationDate",
                    formatter: this.dateFormatter
                },
                {
                    title: "Status",
                    field: "internal.status",
                    formatter: field => `${field.name} (${UtilsNew.dateFormatter(field.date)})`
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
        const params = {
            ...this.query,
            limit: 1000,
            skip: 0,
            includeIndividual: true,
            count: false,
            include: "id,source,collection,processing,creationDate,status,type,version,release,individual.id,status"
        };

        this.opencgaSession.opencgaClient.samples().search(params)
            .then(response => {
                const result = response.response[0].result;
                console.log(result);
                let dataString = [];
                let mimeType = "";
                let extension = "";
                if (result) {
                    // Check if user clicked in Tab or JSON format
                    if (e.detail.option.toLowerCase() === "tab") {
                        dataString = [
                            ["Sample ID", "Individual ID", "Source", "Collection Method", "Preparation Method", "Cell Line", "Creation Date", "Status"].join("\t"),
                            ...result.map( _ => [
                                _.id,
                                _.attributes?.OPENCGA_INDIVIDUAL?.id ?? "",
                                _.source,
                                _.collection?.method ?? "",
                                _.processing?.preparationMethod ?? "",
                                _.somatic ? "Somatic" : "Germline",
                                _.creationDate,
                                _.internal?.status?.name ?? ""
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
            detailFormatter: null, // function with the detail formatter
            multiSelection: false,
            showSelectCheckbox: true,
            showToolbar: true
        };
    }

    render() {
        return html`
            ${this._config.showToolbar ? html`
                <opencb-grid-toolbar .config="${this.toolbarConfig}"
                                     @columnChange="${this.onColumnChange}"
                                     @download="${this.onDownload}">
                </opencb-grid-toolbar>`
            :  null}
    
            <div id="${this._prefix}GridTableDiv">
                <table id="${this._prefix}SampleBrowserGrid"></table>
            </div>
        `;
    }

}

customElements.define("opencga-sample-grid", OpencgaSampleGrid);
