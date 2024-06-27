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
import GridCommons from "../commons/grid-commons.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter.js";
import "../commons/opencb-grid-toolbar.js";
import "../loading-spinner.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import ModalUtils from "../commons/modal/modal-utils.js";
import WebUtils from "../commons/utils/web-utils.js";

export default class JobGrid extends LitElement {

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
            query: {
                type: Object
            },
            jobs: {
                type: Array
            },
            // TODO check do we really need it..
            eventNotifyName: {
                type: String
            },
            active: {
                type: Boolean
            },
            config: {
                type: Object
            },
        };
    }

    #init() {
        this.COMPONENT_ID = "job-grid";
        this._prefix = UtilsNew.randomString(8);
        this.gridId = this._prefix + this.COMPONENT_ID;
        this.active = true;
        this.autoRefresh = false;
        this.eventNotifyName = "messageevent";
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession") ||
            changedProperties.has("toolId") ||
            changedProperties.has("query") ||
            changedProperties.has("config")) {
            this.propertyObserver();
        }
        super.update(changedProperties);
    }

    updated(changedProperties) {
        if (changedProperties.size > 0 && this.active) {
            this.renderTable();
        }
    }

    propertyObserver() {
        // With each property change we must update config and create the columns again. No extra checks are needed.
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };
        this.gridCommons = new GridCommons(this.gridId, this, this._config);

        this.toolbarSetting = {
            ...this._config,
        };

        // Config for the grid toolbar
        this.toolbarConfig = {
            ...this.config?.toolbar,
            toolId: this.toolId,
            resource: "JOB",
            columns: this._getDefaultColumns(),
            // Uncomment in case we need to change defaults
            // create: {
            //     display: {
            //         modalTitle: "Job Create",
            //         modalDraggable: true,
            //         disabled: true,
            //         disabledTooltip: "This operation will be implemented soon. Thanks for your patience.",
            //         modalCyDataName: "modal-create",
            //     },
            //     render: () => html `
            //         <job-create
            //             .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
            //             .opencgaSession="${this.opencgaSession}">
            //         </job-create>`
            // },
            // export: {
            //     display: {
            //         modalTitle: "Job Export",
            //     },
            //     render: () => html`
            //         <opencga-export
            //             .config="${this._config}"
            //             .query=${this.query}
            //             .opencgaSession="${this.opencgaSession}"
            //             @export="${this.onExport}"
            //             @changeExportField="${this.onChangeExportField}">
            //         </opencga-export>`
            // },
            // settings: {
            //     display: {
            //         modalTitle: "Job Settings",
            //     },
            //     render: () => html `
            //         <catalog-browser-grid-config
            //             .opencgaSession="${this.opencgaSession}"
            //             .gridColumns="${this._columns}"
            //             .config="${this._config}"
            //             @configChange="${this.onGridConfigChange}">
            //         </catalog-browser-grid-config>`
            // }
        };

        this.permissionID = WebUtils.getPermissionID(this.toolbarConfig.resource, "WRITE");
    }

    renderTable() {
        if (this.jobs?.length > 0) {
            this.renderLocalTable();
        } else {
            this.renderRemoteTable();
        }
    }

    renderLocalTable() {
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            columns: this._getDefaultColumns(),
            data: this.jobs,
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
            gridContext: this,
            formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
            onClickRow: (row, selectedElement) => this.gridCommons.onClickRow(row.id, row, selectedElement),
            onPostBody: data => {
                // We call onLoadSuccess to select first row
                this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 1);
            }
        });
    }

    renderRemoteTable() {
        if (this.opencgaSession?.opencgaClient && this.opencgaSession?.study?.fqn) {
            if (this.lastFilters && JSON.stringify(this.lastFilters) === JSON.stringify(this.query)) {
                // Abort destroying and creating again the grid. The filters have not changed
                return;
            }

            this._columns = this._getDefaultColumns();
            this.table = $("#" + this.gridId);
            this.table.bootstrapTable("destroy");
            this.table.bootstrapTable({
                columns: this._columns,
                method: "get",
                sidePagination: "server",
                uniqueId: "id",
                iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
                icons: GridCommons.GRID_ICONS,
                pagination: this._config.pagination,
                pageSize: this._config.pageSize,
                pageList: this._config.pageList,
                paginationVAlign: "both",
                formatShowingRows: (pageFrom, pageTo, totalRows) => {
                    return this.gridCommons.formatShowingRows(pageFrom, pageTo, totalRows) + this.autoRefreshMsg();
                },
                showExport: this._config.showExport,
                detailView: this._config.detailView,
                detailFormatter: this.detailFormatter,
                sortName: "Creation",
                sortOrder: "asc",
                gridContext: this,
                formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
                ajax: params => {
                    document.getElementById(this._prefix + "refreshIcon").style.visibility = "visible";
                    this.filters = {
                        study: this.opencgaSession.study.fqn,
                        deleted: false,
                        count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                        sort: "creationDate",
                        order: -1,
                        limit: params.data.limit || this.table.bootstrapTable("getOptions").pageSize,
                        skip: params.data.offset || 0,
                        include: "id,userId,tool,priority,tags,creationDate,visited,dependsOn,outDir,internal,execution,params,input,output,annotationSets",
                        ...this.query
                    };

                    // Store the current filters
                    this.lastFilters = {...this.filters};
                    this.opencgaSession.opencgaClient.jobs()
                        .search(this.filters)
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
                    this.enableAutoRefresh();
                },
                onLoadError: (e, restResponse) => this.gridCommons.onLoadError(e, restResponse)
            });
        }
    }

    autoRefreshMsg() {
        const id = this._prefix + "refreshIcon";
        const refreshTime = (this._config?.toolbar?.autorefreshTiming ?? this._config.autorefreshTiming) / 1000;

        return `<i id="${id}" class="fas fa-sync-alt anim-rotate" title="Autorefresh every ${refreshTime}s" style="visibility:hidden;margin-left:8px;"></i>`;
    }

    enableAutoRefresh() {
        if (!this.autoRefresh) {
            this.autoRefresh = true;
            this.table.bootstrapTable("refresh", {silent: true});
            clearInterval(this.interval);

            this.interval = setInterval(() => {
                if (!this?.opencgaSession?.token || !$(`#${this.gridId}`).is(":visible")) {
                    this.autoRefresh = false;
                    clearInterval(this.interval);
                } else {
                    this.autoRefresh = true;
                    this.table.bootstrapTable("refresh", {silent: true});
                }
            }, this._config?.toolbar?.autorefreshTiming ?? this._config.autorefreshTiming);
        }
    }

    onColumnChange(e) {
        this.gridCommons.onColumnChange(e);
    }

    detailFormatter(value, row) {
        let result = "<div class='row' style='padding-bottom: 20px'>";
        let detailHtml = "";

        if (row) {
            // Job Dependencies section
            detailHtml = "<div style='padding: 10px 0px 10px 25px'><h4>Job Dependencies</h4></div>";
            detailHtml += "<div style='padding: 5px 40px'>";
            if (row.dependsOn && row.dependsOn.length > 0) {
                detailHtml += `
                    <div class='row' style="padding: 5px 10px 20px 10px">
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

        result += detailHtml + "</div>";
        return result;
    }

    async onActionClick(e, _, row) {
        const action = e.target.dataset.action?.toLowerCase();
        switch (action) {
            case "retry":
                this.jobRetryObj = row;
                this.requestUpdate();
                // await this.updateComplete;
                ModalUtils.show(`${this._prefix}RetryModal`);
                break;
            case "edit":
                this.jobUpdateId = row.id;
                this.requestUpdate();
                await this.updateComplete;
                ModalUtils.show(`${this._prefix}UpdateModal`);
                break;
            case "copy-json":
                UtilsNew.copyToClipboard(JSON.stringify(row, null, "\t"));
                break;
            case "download-json":
                UtilsNew.downloadData([JSON.stringify(row, null, "\t")], row.id + ".json");
                break;
        }
    }

    _getDefaultColumns() {
        this._columns = [
            {
                id: "id",
                title: "Job ID",
                field: "id",
                formatter: (id, row) => `
                    <div>
                        <span style="font-weight: bold; margin: 5px 0">${id}</span>
                        ${row.outDir?.path ? `<span class="help-block" style="margin: 5px 0">/${row.outDir.path.replace(id, "").replace("//", "/")}</span>` : ""}
                    </div>
                `,
                visible: this.gridCommons.isColumnVisible("id")
            },
            {
                id: "toolId",
                title: "Tool ID",
                field: "tool.id",
                formatter: (toolId, row) => `
                    <div>
                        <span style="margin: 5px 0">${toolId}</span>
                        ${row.tool?.type ? `<span class="help-block" style="margin: 5px 0">${row.tool.type}</span>` : ""}
                    </div>
                `,
                visible: this.gridCommons.isColumnVisible("toolId")
            },
            {
                id: "params",
                title: "Parameters",
                field: "params",
                formatter: params => {
                    let html = "-";
                    if (UtilsNew.isNotEmpty(params)) {
                        html = "<div>";
                        for (const key of Object.keys(params)) {
                            html += `<div style="margin: 2px 0; white-space: nowrap">`;
                            // 1. Normal parameter
                            if (typeof params[key] !== "object") {
                                if (params[key].length > 100) {
                                    html += `
                                        <span title="${params[key]}" style="margin: 2px 0; font-weight: bold">${key}:</span> <span title="${params[key]}">${params[key].substring(0, 100) + "..." || "true"}</span>
                                    `;
                                } else {
                                    html += `
                                        <span style="margin: 2px 0; font-weight: bold">${key}:</span> ${params[key] || "true"}
                                    `;
                                }
                            } else {
                                // 2. This parameter is an Object, we need to loop its internal subparams.
                                let nestedObject = "";
                                // 2.1 It can contain some subparams, or ...
                                if (UtilsNew.isNotEmpty(params[key])) {
                                    for (const subKey of Object.keys(params[key])) {
                                        nestedObject += `
                                            <div style="margin: 2px 0">
                                                <span style="margin: 2px 0; font-weight: bold">${subKey}:</span> ${params[key][subKey]}
                                            </div>
                                        `;
                                    }
                                    html += `
                                        <div>
                                            <span style="margin: 2px 0; font-weight: bold">${key}:</span>
                                        </div>
                                        <div style="padding-left: 10px">
                                            ${nestedObject}
                                        </div>
                                    `;
                                } else {
                                    // 2.2 ... it can be an empty object.
                                    html += `
                                        <span style="margin: 2px 0; font-weight: bold">${key}:</span><spam style="font-style: italic">none</spam>
                                    `;
                                }
                            }
                            html += "</div>";
                        }
                        html += "</div>";
                    }
                    return html;
                },
                visible: this.gridCommons.isColumnVisible("params")
            },
            {
                id: "output",
                title: "Output Files",
                field: "output",
                formatter: outputFiles => CatalogGridFormatter.fileFormatter(outputFiles, null, "name"),
                visible: this.gridCommons.isColumnVisible("output")
            },
            {
                id: "dependsOn",
                title: "Depends On",
                field: "dependsOn",
                formatter: dependsOn => {
                    let html = "-";
                    if (dependsOn?.length > 0) {
                        html = `<div style="white-space: nowrap">`;
                        for (let i = 0; i < dependsOn.length; i++) {
                            // Display first 3 files
                            if (i < 3) {
                                html += `<div style="margin: 2px 0"><span>${dependsOn[i].id}</span></div>`;
                            } else {
                                html += `
                                    <a tooltip-title="jOBS" tooltip-text='${dependsOn.map(job => `<p>${job.id}</p>`).join("<br>")}'>
                                        ... view all jobs (${dependsOn.length})
                                    </a>
                                `;
                                break;
                            }
                        }
                        html += "</div>";
                    }
                    return html;
                },
                visible: this.gridCommons.isColumnVisible("dependsOn")
            },
            {
                id: "status",
                title: "Status",
                field: "internal.status",
                formatter: status => UtilsNew.jobStatusFormatter(status),
                visible: this.gridCommons.isColumnVisible("status")
            },
            {
                id: "executionR",
                title: "Runtime",
                field: "execution",
                formatter: execution => {
                    if (execution?.start) {
                        const duration = moment.duration((execution.end ? execution.end : moment().valueOf()) - execution.start);
                        const f = moment.utc(duration.asMilliseconds()).format("HH:mm:ss");
                        return `<a tooltip-title="Runtime"  tooltip-text="${f}"> ${duration.humanize()} </a>`;
                    }
                    return "-";
                },
                visible: this.gridCommons.isColumnVisible("executionR")
            },
            {
                id: "executionD",
                title: "Start/End Date",
                field: "execution",
                formatter: execution => execution?.start ?
                    moment(execution.start).format("D MMM YYYY, h:mm:ss a") + " / " + (execution?.end ? moment(execution.end).format("D MMM YYYY, h:mm:ss a") : "-") :
                    "-",
                visible: this.gridCommons.isColumnVisible("executionD")
            },
            {
                id: "creationDate",
                title: "Creation Date",
                field: "creationDate",
                formatter: CatalogGridFormatter.dateFormatter,
                visible: this.gridCommons.isColumnVisible("creationDate")
            },
        ];

        if (this.opencgaSession && this._config.showActions) {
            this._columns.push({
                id: "actions",
                title: "Actions",
                field: "actions",
                align: "center",
                formatter: () => `
                    <div class="inline-block dropdown">
                        <button class="btn btn-default btn-sm dropdown-toggle" type="button" data-toggle="dropdown">
                            <i class="fas fa-toolbox icon-padding" aria-hidden="true"></i>
                            <span>Actions</span>
                            <span class="caret" style="margin-left: 5px"></span>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-right">
                            <li>
                                <a data-action="retry" href="javascript: void 0" class="btn force-text-left">
                                    <i class="fas fa-sync icon-padding" aria-hidden="true"></i> Retry ...
                                </a>
                            </li>
                            <li role="separator" class="divider"></li>
                            <li>
                                <a data-action="copy-json" href="javascript: void 0" class="btn force-text-left">
                                    <i class="fas fa-copy icon-padding" aria-hidden="true"></i> Copy JSON
                                </a>
                            </li>
                            <li>
                                <a data-action="download-json" href="javascript: void 0" class="btn force-text-left">
                                    <i class="fas fa-download icon-padding" aria-hidden="true"></i> Download JSON
                                </a>
                            </li>
                            <li role="separator" class="divider"></li>
                            <li>
                                <a data-action="edit" class="btn force-text-left disabled ${OpencgaCatalogUtils.checkPermissions(this.opencgaSession.study, this.opencgaSession.user.id, this.permissionID) || "disabled" }">
                                    <i class="fas fa-edit icon-padding" aria-hidden="true"></i> Edit ...
                                </a>
                            </li>
                            <li>
                                <a data-action="delete" href="javascript: void 0" class="btn force-text-left disabled">
                                    <i class="fas fa-trash icon-padding" aria-hidden="true"></i> Delete
                                </a>
                            </li>
                        </ul>
                    </div>
                `,
                events: {
                    "click a": this.onActionClick.bind(this),
                },
                visible: this.gridCommons.isColumnVisible("actions"),
            });
        }

        // _columns = UtilsNew.mergeTable(_columns, this._config.columns || this._config.hiddenColumns, !!this._config.hiddenColumns);
        this._columns = this.gridCommons.addColumnsFromExtensions(this._columns, this.COMPONENT_ID);
        return this._columns;
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
        this.opencgaSession.opencgaClient.jobs()
            .search(filters)
            .then(response => {
                const results = response.getResults();
                if (results) {
                    // Check if user clicked in Tab or JSON format
                    if (e.detail.option.toLowerCase() === "tab") {
                        const fields = ["id", "tool.id", "priority", "tags", "creationDate", "internal.status.name", "visited"];
                        const data = UtilsNew.toTableString(results, fields);
                        UtilsNew.downloadData(data, "job_" + this.opencgaSession.study.id + ".tsv", "text/plain");
                    } else {
                        UtilsNew.downloadData(JSON.stringify(results, null, "\t"), "job_" + this.opencgaSession.study.id + ".json", "application/json");
                    }
                } else {
                    console.error("Error in result format");
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

    onJobRetry() {
        const params = {
            study: this.opencgaSession.study.fqn
        };
        let error;
        this.opencgaSession.opencgaClient.jobs()
            .retry(
                {
                    job: this.jobRetryObj?.id
                }, params)
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Job Retry",
                    message: "Job executed correctly"
                });
            })
            .catch(reason => {
                error = reason;
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
            });
    }

    getRightToolbar() {
        return [
            {
                render: () => html`
                    <button type="button" data-cy="job-refresh" class="btn btn-default btn-sm" @click="${() => this.table.bootstrapTable("refresh")}">
                        <i class="fas fa-sync-alt icon-padding"></i> Refresh
                    </button>
                `,
            }
        ];
    }

    render() {
        return html`
            ${this._config.showToolbar ? html`
                <opencb-grid-toolbar
                    .query="${this.filters}"
                    .rightToolbar="${this.getRightToolbar()}"
                    .opencgaSession="${this.opencgaSession}"
                    .settings="${this.toolbarSetting}"
                    .config="${this.toolbarConfig}"
                    @columnChange="${this.onColumnChange}"
                    @download="${this.onDownload}"
                    @export="${this.onDownload}"
                    @actionClick="${e => this.onActionClick(e)}"
                    @jobCreate="${this.renderRemoteTable}">
                </opencb-grid-toolbar>
            ` : nothing}

            <div>
                <table id="${this.gridId}"></table>
            </div>

            ${ModalUtils.create(this, `${this._prefix}RetryModal`, {
                display: {
                    modalTitle: "Job Retry",
                    modalDraggable: true,
                    modalbtnsVisible: true
                },
                render: () => {
                    return html`
                        <div>This will execute a new Job with the same parameters as the original job.
                            Are you sure do you want to execute again <span style="font-weight: bold">${this.jobRetryObj?.id}</span>?
                        </div>
                    `;
                },
                onOk: e => this.onJobRetry(e)
            })}

            ${ModalUtils.create(this, `${this._prefix}UpdateModal`, {
                display: {
                    modalTitle: "Job Update",
                    modalDraggable: true,
                },
                render: active => {
                    return html `
                        <job-update
                            .jobId="${this.jobUpdateId}"
                            .active="${active}"
                            .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                            .opencgaSession="${this.opencgaSession}">
                        </job-update>
                    `;
                }
            })}
        `;
    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 25],
            showSelectCheckbox: false,
            multiSelection: false,
            detailView: true,

            showToolbar: true,
            showActions: true,

            showCreate: true,
            showExport: true,
            showSettings: true,
            showRefresh: true,
            exportTabs: ["download", "link", "code"],

            nucleotideGenotype: true,
            alleleStringLengthMax: 15,
            autorefreshTiming: 60000,
        };
    }

}

customElements.define("job-grid", JobGrid);
