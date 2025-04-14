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
import NotificationUtils from "../commons/utils/notification-utils.js";
import WebUtils from "../commons/utils/web-utils.js";
import LitUtils from "../commons/utils/lit-utils.js";
import "../commons/opencb-grid-toolbar.js";
import "../loading-spinner.js";
import "./job-view.js";

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
        this.RESOURCE = "JOB";
        this._prefix = UtilsNew.randomString(8);
        this.gridId = this._prefix + this.COMPONENT_ID;
        this.active = true;
        this.autoRefresh = false;
        this.eventNotifyName = "messageevent";
        this._selectedJob = null;
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
        };

        this.gridCommons.registerModals({
            "view-job": () => ({
                display: {
                    modalTitle: `Job ${this._selectedJob?.id}`,
                    modalDraggable: true,
                    modalCyDataName: "job-view",
                    modalSize: "modal-xl"
                },
                render: active => html`
                    <job-view
                        .jobId="${this._selectedJob?.id}"
                        .active="${active}"
                        .opencgaSession="${this.opencgaSession}">
                    </job-view>
                `,
            }),
            "kill-job": () => ({
                display: {
                    modalTitle: "Kill Job",
                    modalDraggable: true,
                    modalbtnsVisible: true,
                    modalSize: "modal-md",
                    okButtonText: "Kill Job",
                },
                render: () => html`
                    <div>This will kill a queued or running Job. Are you sure do you want to kill <b>${this._selectedJob?.id}</b>?</div>
                `,
                onOk: event => this.onJobKill(event),
            }),
            "retry-job": () => ({
                display: {
                    modalTitle: "Retry Job",
                    modalDraggable: true,
                    modalbtnsVisible: true,
                    modalSize: "modal-md",
                    okButtonText: "Retry Job",
                },
                render: () => html`
                    <div>
                        <span>This will execute a new Job with the same parameters as the original job. </span>
                        <span>Are you sure do you want to execute again <b>${this.jobRetryObj?.id}</b>?</span>
                    </div>
                `,
                onOk: event => this.onJobRetry(event),
            }),
        });
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
            classes: "table table-borderless table-hover table-grid",
            buttonsClass: "light",
            columns: this._getDefaultColumns(),
            sidePagination: "server",
            // Josemi Note 2024-01-18: we have added the ajax function for local jobs also to support executing async calls
            // when getting additional data from columns extensions.
            ajax: params => {
                const tableOptions = $(this.table).bootstrapTable("getOptions");
                const limit = params.data.limit || tableOptions.pageSize;
                const skip = params.data.offset || 0;
                const rows = this.jobs.slice(skip, skip + limit);

                // Get data for extensions
                this.gridCommons.prepareDataForExtensions(this.COMPONENT_ID, this.opencgaSession, null, rows)
                    .then(() => params.success(rows))
                    .catch(error => params.error(error));
            },
            // Josemi Note 2024-01-18: we use this method to tell bootstrap-table how many rows we have in our data
            responseHandler: response => {
                return {
                    total: this.jobs.length,
                    rows: response,
                };
            },
            iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
            icons: GridCommons.GRID_ICONS,
            uniqueId: "id",
            pagination: this._config.pagination,
            pageSize: this._config.pageSize,
            pageList: this._config.pageList,
            paginationVAlign: "bottom",
            formatShowingRows: (pageFrom, pageTo, totalRows) => {
                return this.gridCommons.formatShowingRows(pageFrom, pageTo, totalRows);
            },
            loadingTemplate: () => GridCommons.loadingFormatter(),
            onPostBody: data => this.gridCommons.onLoadSuccess({rows: data, total: data.length}),
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
                classes: "table table-borderless table-hover table-grid",
                buttonsClass: "light",
                columns: this._columns,
                sidePagination: "server",
                uniqueId: "id",
                iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
                icons: GridCommons.GRID_ICONS,
                pagination: this._config.pagination,
                pageSize: this._config.pageSize,
                pageList: this._config.pageList,
                paginationVAlign: "bottom",
                formatShowingRows: (pageFrom, pageTo, totalRows) => {
                    return this.gridCommons.formatShowingRows(pageFrom, pageTo, totalRows) + this.autoRefreshMsg();
                },
                loadingTemplate: () => GridCommons.loadingFormatter(),
                ajax: params => {
                    document.getElementById(this._prefix + "refreshIcon").style.visibility = "visible";

                    let jobsResponse = null;
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
                        .then(response => {
                            jobsResponse = response;
                            // Prepare data for columns extensions
                            const rows = jobsResponse.responses?.[0]?.results || [];
                            return this.gridCommons.prepareDataForExtensions(this.COMPONENT_ID, this.opencgaSession, this.filters, rows);
                        })
                        .then(() => params.success(jobsResponse))
                        .catch(error => {
                            console.error(error);
                            params.error(error);
                        })
                        .finally(() => {
                            LitUtils.dispatchCustomEvent(this, "queryComplete", null, {
                                response: jobsResponse,
                            });
                        });
                },
                responseHandler: response => {
                    const result = this.gridCommons.responseHandler(response, this.table.bootstrapTable("getOptions"));
                    return result.response;
                },
                onLoadSuccess: data => {
                    this.gridCommons.onLoadSuccess(data);
                    this.enableAutoRefresh();
                },
                onLoadError: (event, response) => this.gridCommons.onLoadError(event, response),
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

    onActionClick(event, job) {
        const action = event.target.dataset.action?.toLowerCase();
        switch (action) {
            case "view":
                this._selectedJob = job;
                this.gridCommons.changeActiveModal("view-job");
                break;
            case "retry":
                this._selectedJob = job;
                this.gridCommons.changeActiveModal("retry-job");
                break;
            case "kill":
                this._selectedJob = job;
                this.gridCommons.changeActiveModal("kill-job");
                break;
            case "copy-json":
                UtilsNew.copyToClipboard(JSON.stringify(job, null, "\t"));
                break;
            case "download-json":
                UtilsNew.downloadData([JSON.stringify(job, null, "\t")], job.id + ".json");
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
                        ${row.outDir?.path ? `<span class="d-block text-secondary" style="margin: 5px 0">/${row.outDir.path.replace(id, "").replace("//", "/")}</span>` : ""}
                    </div>
                `,
                visible: this.gridCommons.isColumnVisible("id"),
            },
            {
                id: "toolId",
                title: "Tool ID",
                field: "tool.id",
                formatter: (toolId, row) => `
                    <div>
                        <span style="margin: 5px 0">${toolId}</span>
                        ${row.tool?.type ? `<span class="d-block text-secondary" style="margin: 5px 0">${row.tool.type}</span>` : ""}
                    </div>
                `,
                visible: this.gridCommons.isColumnVisible("toolId"),
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
                formatter: status => WebUtils.jobStatusFormatter(status),
                visible: this.gridCommons.isColumnVisible("status")
            },
            {
                id: "executionR",
                title: "Runtime",
                formatter: (_, row) => {
                    const execution = row.execution;
                    if (execution?.start) {
                        const duration = moment.duration((execution.end ? execution.end : moment().valueOf()) - execution.start);
                        const f = moment.utc(duration.asMilliseconds()).format("HH:mm:ss");
                        return `<a tooltip-title="Runtime" tooltip-text="${f}"> ${duration.humanize()} </a>`;
                    }
                    return "-";
                },
                visible: this.gridCommons.isColumnVisible("executionR")
            },
            {
                id: "executionD",
                title: "Start/End Date",
                formatter: (_, row) => {
                    const execution = row.execution;
                    const values = [];
                    if (execution?.start) {
                        values.push(moment(execution.start).format("D MMM YYYY, h:mm:ss a"));
                        values.push(execution?.end ? moment(execution.end).format("D MMM YYYY, h:mm:ss a") : "-");
                    }
                    return values.join(" / ") || "-";
                },
                visible: this.gridCommons.isColumnVisible("executionD")
            },
            {
                id: "creationDate",
                title: "Creation Date",
                field: "creationDate",
                formatter: value => CatalogGridFormatter.dateFormatter(value),
                visible: this.gridCommons.isColumnVisible("creationDate"),
            },
        ];

        if (this.opencgaSession && this._config.showActions) {
            this._columns.push({
                id: "actions",
                align: "right",
                formatter: (value, row) => {
                    // const hasWritePermission = this.gridCommons.hasPermission("WRITE");
                    return `
                        <div class="d-inline-block dropdown">
                            <button class="btn" data-bs-toggle="dropdown" data-cy="actions-button">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <div class="dropdown-menu dropdown-menu-end">
                                <a data-action="view" class="dropdown-item cursor-pointer">
                                    <i class="fas fa-eye me-1"></i> View
                                </a>
                                <a data-action="copy-json" class="dropdown-item cursor-pointer">
                                    <i class="fas fa-copy me-1"></i> Copy JSON
                                </a>
                                <a data-action="download-json" class="dropdown-item cursor-pointer">
                                    <i class="fas fa-download me-1"></i> Download JSON
                                </a>
                                <hr class="dropdown-divider">
                                <a data-action="retry" class="dropdown-item cursor-pointer">
                                    <i class="fas fa-sync me-1"></i> Retry
                                </a>
                                <a data-action="kill" class="dropdown-item cursor-pointer">
                                    <i class="fas fa-skull me-1"></i> Kill
                                </a>
                                <hr class="dropdown-divider">
                                <a data-action="edit" class="dropdown-item disabled">
                                    <i class="fas fa-edit me-1"></i> Edit
                                </a>
                                <a data-action="delete" class="dropdown-item disabled">
                                    <i class="fas fa-trash me-1"></i> Delete
                                </a>
                            </div>
                        </div>
                    `;
                },
                events: {
                    "click a": (event, value, job) => this.onActionClick(event, job),
                },
                visible: this.gridCommons.isColumnVisible("actions"),
            });
        }

        this._columns = this.gridCommons.addColumnsFromExtensions(this.COMPONENT_ID, this.opencgaSession, this._columns);
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
                        const fields = ["id", "tool.id", "priority", "tags", "creationDate", "internal.status.id", "visited"];
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
        const data = {
            job: this._selectedJob.id,
        };
        this.opencgaSession.opencgaClient.jobs()
            .retry(data, {
                study: this.opencgaSession.study.fqn,
            })
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    message: "Job executed correctly"
                });
            })
            .catch(reason => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
            });
    }

    onJobKill() {
        this.opencgaSession.opencgaClient.jobs()
            .kill(this._selectedJob.id, {
                study: this.opencgaSession.study.fqn,
            })
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    message: "Job killed correctly"
                });
            })
            .catch(reason => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
            });
    }

    getRightToolbar() {
        return [
            {
                icon: "fa-sync-alt",
                title: "Refresh",
                onClick: () => this.table.bootstrapTable("refresh"),
            },
        ];
    }

    renderToolbarLeftContent() {
        return html`
            <span id="${this.gridId + "PaginationInfo"}"></span>
        `;
    }

    render() {
        return html`
            ${this._config.showToolbar ? html`
                <opencb-grid-toolbar
                    .query="${this.filters}"
                    .leftContent="${this.renderToolbarLeftContent()}"
                    .rightToolbar="${this.getRightToolbar()}"
                    .opencgaSession="${this.opencgaSession}"
                    .settings="${this.toolbarSetting}"
                    .config="${this.toolbarConfig}"
                    @download="${this.onDownload}"
                    @export="${this.onDownload}">
                </opencb-grid-toolbar>
            ` : nothing}

            <div>
                <table id="${this.gridId}"></table>
            </div>

            ${this.gridCommons.renderModals()}
        `;
    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 25],

            showToolbar: true,
            showActions: true,

            showExport: true,
            showSettings: true,
            exportTabs: ["download", "link", "code"],

            autorefreshTiming: 60000,
        };
    }

}

customElements.define("job-grid", JobGrid);
