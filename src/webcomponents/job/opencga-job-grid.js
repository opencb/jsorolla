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


export default class OpencgaJobGrid extends LitElement {

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
            jobs: {
                type: Array
            },
            filters: {
                type: Object,
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
            },
            active: {
                type: Boolean
            },
        };
    }

    _init() {
        this._prefix = "jbgrid" + UtilsNew.randomString(6) + "_";
        this.eventNotifyName = "messageevent";
        this.gridId = this._prefix + "JobBrowserGrid";
        this.active = true;
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
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
        this.toolbarConfig = {
            ...this.config.toolbar,
            resource: "JOB",
            columns: this._initTableColumns().filter(col => col.field)
        };
        this.renderTable();
    }

    onColumnChange(e) {
        this.gridCommons.onColumnChange(e);
    }

    renderTable() {
        this.jobs = [];

        if (this.opencgaSession.opencgaClient && this.opencgaSession?.study?.fqn) {
            // Make a copy of the jobs (if they exist), we will use this private copy until it is assigned to this.jobs
            if (UtilsNew.isNotUndefined(this.jobs)) {
                this._jobs = this.jobs;
            } else {
                this._jobs = [];
            }

            this.table = $("#" + this.gridId);
            this.table.bootstrapTable("destroy");

            this.table.bootstrapTable({
                columns: this._initTableColumns(),
                method: "get",
                sidePagination: "server",
                uniqueId: "id",

                // NOTE native Bootstrap table autorefresh doesn't clear interval correctly
                // showRefresh: true,
                // autoRefresh: true,
                // autoRefreshSilent: false,
                // autoRefreshStatus: true,
                // autoRefreshInterval: 5,

                // Table properties
                pagination: this._config.pagination,
                pageSize: this._config.pageSize,
                pageList: this._config.pageList,
                paginationVAlign: "both",
                formatShowingRows: (pageFrom, pageTo, totalRows) => this.gridCommons.formatShowingRows(pageFrom, pageTo, totalRows) + this.autorefreshMsg(),
                showExport: this._config.showExport,
                detailView: this._config.detailView,
                detailFormatter: this._config.detailFormatter.bind(this),
                sortName: "Creation",
                sortOrder: "asc",
                order: "AAA",
                formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
                ajax: params => {
                    const filters = {
                        study: this.opencgaSession.study.fqn,
                        deleted: false,
                        count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                        sort: "creationDate",
                        order: -1,
                        limit: params.data.limit || this.table.bootstrapTable("getOptions").pageSize,
                        skip: params.data.offset || 0,
                        include: "id,userId,tool,priority,tags,creationDate,visited,dependsOn,outDir,internal,execution,params,input,output",
                        ...this.query
                    };
                    this.opencgaSession.opencgaClient.jobs().search(filters)
                        .then(res => params.success(res))
                        .catch(e => {
                            console.error(e);
                            params.error(e);
                        });
                },
                responseHandler: response => {
                    const result = this.gridCommons.responseHandler(response, this.table.bootstrapTable("getOptions"));
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
                    this.enableAutorefresh();
                },
                onLoadError: (e, restResponse) => this.gridCommons.onLoadError(e, restResponse)
            });
        }
    }

    autorefreshMsg() {
        return ` <i class="fas fa-sync-alt ${this.autorefresh === true ? "anim-rotate" : "disabled"}"
                    title="Autorefresh of results every ${(this._config?.toolbar?.autorefreshTiming ?? this._config.autorefreshTiming) / 1000}s"></i>`;
    }

    enableAutorefresh() {
        if (this.autorefresh) {
            return;
        } else {
            this.autorefresh = true;
            // this.renderTable();
            this.table.bootstrapTable("refresh", {silent: true});
            // this.requestUpdate();

            clearInterval(this.interval);
            this.interval = setInterval(() => {
                if (!this?.opencgaSession?.token || !$(`#${this.gridId}`).is(":visible")) {
                    this.autorefresh = false;
                    clearInterval(this.interval);
                } else {
                    this.autorefresh = true;
                    // this.renderTable();
                    this.table.bootstrapTable("refresh", {silent: true});
                    // this.requestUpdate();
                }
            }, this._config?.toolbar?.autorefreshTiming ?? this._config.autorefreshTiming);
        }
    }

    /* setAutorefresh(force = false) {
        if (force) {
            if (this.autorefresh) {
                return;
            } else {
                this.autorefresh = false;
            }
        } else {

            if (this.autorefresh) {
                clearInterval(this.interval);
                this.autorefresh = false;
                this.requestUpdate();
            } else {
                this.autorefresh = true;
                // this.renderTable();
                this.table.bootstrapTable("refresh", {silent: false});
                this.requestUpdate();

                clearInterval(this.interval);
                this.interval = setInterval(() => {
                    if (!this?.opencgaSession?.token || !$(`#${this.gridId}`).is(":visible")) {
                        this.autorefresh = false;
                        clearInterval(this.interval);
                    } else {
                        this.autorefresh = true;

                        // this.renderTable();
                        console.log("refreshed", this._config?.toolbar?.autorefreshTiming ?? this._config.autorefreshTiming);
                        this.table.bootstrapTable("refresh", {silent: false});

                        this.requestUpdate();
                    }
                }, this._config?.toolbar?.autorefreshTiming ?? this._config.autorefreshTiming);
            }
        }
    }*/

    _initTableColumns() {
        let _columns = [
            // name,path,samples,status,format,bioformat,creationDate,modificationDate,uuid"
            {
                id: "id",
                title: "Job ID",
                field: "id"
            },
            {
                id: "toolId",
                title: "Analysis Tool ID",
                field: "tool.id"
            },
            {
                id: "status",
                title: "Status",
                field: "internal.status",
                formatter: status => UtilsNew.jobStatusFormatter(status)
            },

            {
                id: "priority",
                title: "Priority",
                field: "priority"
            },
            {
                id: "dependsOn",
                title: "Depends on",
                field: "dependsOn",
                formatter: v => v.length > 0 ?
                    `<div class="tooltip-div">
                            <a tooltip-title="Dependencies" tooltip-text="${v.map(job => `<p>${job.id}</p>`).join("<br>")}"> ${v.length} job${v.length > 1 ? "s" : ""}</a>
                    </div>
                    ` : "-"
            },
            {
                id: "output",
                title: "Output Files",
                field: "output",
                formatter: value => {
                    if (value) {
                        const fileIds = value?.map(file => file);
                        return CatalogGridFormatter.fileFormatter(fileIds, null, "name");
                    } else {
                        return "-";
                    }
                }
            },
            // {
            //     title: "Tags",
            //     field: "tags",
            //     formatter: v => v && v.length ? v.map( tag => `<span class="badge badge-secondary">${tag}</span>`).join(" ") : "-"
            // },
            {
                id: "execution",
                title: "Runtime",
                field: "execution",
                formatter: execution => {
                    if (execution?.start) {
                        const duration = moment.duration((execution.end ? execution.end : moment().valueOf()) - execution.start);
                        const f = moment.utc(duration.asMilliseconds()).format("HH:mm:ss");
                        return `<a tooltip-title="Runtime"  tooltip-text="${f}"> ${duration.humanize()} </a>`;
                    }
                }

            },
            {
                id: "execution",
                title: "Start/End Date",
                field: "execution",
                formatter: execution => execution?.start ?
                    moment(execution.start).format("D MMM YYYY, h:mm:ss a") + " / " + (execution?.end ? moment(execution.end).format("D MMM YYYY, h:mm:ss a") : "-") :
                    "-"
            },
            {
                id: "creationDate",
                title: "Creation Date",
                field: "creationDate",
                formatter: CatalogGridFormatter.dateFormatter,
            }
        ];

        _columns = UtilsNew.mergeTable(_columns, this._config.columns || this._config.hiddenColumns, !!this._config.hiddenColumns);
        return _columns;
    }

    detailFormatter(value, row) {
        let result = "<div class='row' style='padding-bottom: 20px'>";
        let detailHtml = "";

        if (row) {
            // Job Dependencies section
            detailHtml = "<div style='padding: 10px 0px 10px 25px'><h4>Job Dependencies</h4></div>";
            detailHtml += "<div style='padding: 5px 40px'>";
            if (row.dependsOn && row.dependsOn.length > 0) {
                detailHtml += ` <div class='row' style="padding: 5px 10px 20px 10px">
                                    <div class='col-md-12'>
                                        <div>
                                            <table class="table table-hover table-no-bordered">
                                                <thead>
                                                    <tr class="table-header">
                                                        <th>ID</th>
                                                        <th>Tool</th>
                                                        <th>Status</th>
                                                        <th>Priority</th>
                                                        <th>Creation Date</th>
                                                        <th>Visited</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    ${row.dependsOn.map(job => `
                                                        <tr class="detail-view-row">
                                                            <td>${job.id}</td>
                                                            <td>${job.tool.id}</td>
                                                            <td>${UtilsNew.jobStatusFormatter(job.internal.status)}</td>
                                                            <td>${job.priority}</td>
                                                            <td>${moment(job.creationDate, "YYYYMMDDHHmmss").format("D MMM YYYY, h:mm:ss a")}</td>
                                                            <td>${job.visited}</td>
                                                       </tr>
                                                    `).join("")}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>`;
            } else {
                detailHtml += "No dependencies";
            }
            detailHtml += "</div>";

            // Input Files section
            detailHtml += "<div style='padding: 10px 0px 10px 25px'><h4>Input Files</h4></div>";
            detailHtml += "<div style='padding: 5px 50px'>";
            detailHtml += "To be implemented";
            detailHtml += "</div>";
        }

        // return row.dependsOn && row.dependsOn.length ? `
        //     <div class='row' style="padding: 5px 10px 20px 10px">
        //         <div class='col-md-12'>
        //             <h5 style="font-weight: bold">Dependencies</h5>
        //             <div>
        //                 <table class="table table-hover table-no-bordered">
        //                     <thead>
        //                         <tr class="table-header">
        //                             <th>ID</th>
        //                             <th>Tool</th>
        //                             <th>Status</th>
        //                             <th>Priority</th>
        //                             <th>Creation Date</th>
        //                             <th>Visited</th>
        //                         </tr>
        //                     </thead>
        //                     <tbody>
        //                         ${row.dependsOn.map(job => `
        //                             <tr class="detail-view-row">
        //                                 <td>${job.id}</td>
        //                                 <td>${job.tool.id}</td>
        //                                 <td>${this.statusFormatter(job.internal.status.name)}</td>
        //                                 <td>${job.priority}</td>
        //                                 <td>${moment(job.creationDate, "YYYYMMDDHHmmss").format("D MMM YYYY, h:mm:ss a")}</td>
        //                                 <td>${job.visited}</td>
        //                            </tr>
        //                         `).join("")}
        //                     </tbody>
        //                 </table>
        //             </div>
        //     </div>
        // </div>` : "No dependencies";

        result += detailHtml + "</div>";
        return result;
    }

    async onDownload(e) {
        this.toolbarConfig = {...this.toolbarConfig, downloading: true};
        this.requestUpdate();
        await this.updateComplete;
        const filters = {
            limit: 1000,
            skip: 0,
            count: false,
            study: this.opencgaSession.study.fqn,
            ...this.query
        };
        this.opencgaSession.opencgaClient.jobs().search(filters)
            .then(response => {
                const results = response.getResults();
                if (results) {
                    // Check if user clicked in Tab or JSON format
                    if (e.detail.option.toLowerCase() === "tab") {
                        const fields = ["id", "tool.id", "priority", "tags", "creationDate", "internal.status.name", "visited"];
                        const data = UtilsNew.toTableString(results, fields);
                        UtilsNew.downloadData(data, "job_" + this.opencgaSession.study.id + ".txt", "text/plain");
                    } else {
                        UtilsNew.downloadData(JSON.stringify(results, null, "\t"), this.opencgaSession.study.id + ".json", "application/json");
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

    getRightToolbar() {
        return [
            {
                render: () => html`
                    <div class="btn-group" role="group">
                            <!-- <button type="button"
                                class="btn btn-default btn-sm ripple ${this.autorefresh === true ? "active" : ""}"
                                @click="${() => this.setAutorefresh()}" title="Autorefresh of results every ${(this._config?.toolbar?.autorefreshTiming ?? this._config.autorefreshTiming) / 1000}s">
                            Autorefresh <i class="fas fa-sync-alt ${this.autorefresh === true ? "anim-rotate" : "disabled"}"></i>
                        </button> -->
                        <button type="button" class="btn btn-default btn-sm ripple" @click="${() => this.table.bootstrapTable("refresh")}" title="Force a refresh of results">
                            <i class="fas fa-bolt"></i>
                        </button>
                    </div>
                `
            }
        ];
    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 10,
            pageList: [10, 25, 50],
            showExport: false,
            detailView: true,
            detailFormatter: this.detailFormatter,
            showSelectCheckbox: false,
            multiSelection: false,
            nucleotideGenotype: true,
            alleleStringLengthMax: 15,
            showToolbar: true,
            header: {
                horizontalAlign: "center",
                verticalAlign: "bottom"
            },
            autorefreshTiming: 30000
        };
    }

    render() {
        return html`
            ${this._config.showToolbar ?
                    html`
                        <opencb-grid-toolbar .config="${this.toolbarConfig}"
                                             .query="${this.query}"
                                             .opencgaSession="${this.opencgaSession}"
                                             .rightToolbar="${this.getRightToolbar()}"
                                             @columnChange="${this.onColumnChange}"
                                             @download="${this.onDownload}"
                                             @export="${this.onDownload}">
                        </opencb-grid-toolbar>` :
                    ""
            }
            <div>
                <table id="${this.gridId}"></table>
            </div>
        `;
    }

}

customElements.define("opencga-job-grid", OpencgaJobGrid);
