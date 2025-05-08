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
import CatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import UtilsNew from "../../core/utils-new.js";
import GridCommons from "../commons/grid-commons.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import LitUtils from "../commons/utils/lit-utils.js";
import "../commons/grid-toolbar.js";
import "../loading-spinner.js";
import "../file/file-view.js";
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
        this._selectedJobId = null;
        this._selectedFileId = null;
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
                    modalTitle: `Job ${this._selectedJobId}`,
                    modalSize: "modal-3xl",
                    modalCyDataName: "job-view",
                    modalDraggable: true,
                },
                render: active => html`
                    <job-view
                        .jobId="${this._selectedJobId}"
                        .active="${active}"
                        .opencgaSession="${this.opencgaSession}">
                    </job-view>
                `,
            }),
            "kill-job": () => ({
                display: {
                    modalTitle: "Kill Job",
                    modalSize: "modal-lg",
                    modalDraggable: true,
                    modalbtnsVisible: true,
                    okButtonText: "Kill Job",
                },
                render: () => html`
                    <div>This will kill a queued or running Job. Are you sure do you want to kill <b>${this._selectedJobId}</b>?</div>
                `,
                onOk: event => this.onJobKill(event),
            }),
            "retry-job": () => ({
                display: {
                    modalTitle: "Retry Job",
                    modalSize: "modal-lg",
                    modalDraggable: true,
                    modalbtnsVisible: true,
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
            "view-file": () => ({
                display: {
                    modalTitle: `File ${this._selectedFileId.split(":").pop()}`,
                    modalCyDataName: `modal-file-view`,
                    modalSize: "modal-3xl",
                },
                render: () => html`
                    <file-view
                        .fileId="${this._selectedFileId}"
                        .opencgaSession="${this.opencgaSession}">
                    </file-view>
                `,
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

    _getDefaultColumns() {
        this._columns = [
            {
                id: "id",
                title: "Job ID",
                field: "id",
                formatter: (id, row) => `
                    <a class="link fw-bold d-block my-1" data-action="view">${id}</a>
                    ${row.outDir?.path ? `<div class="text-secondary my-1">/${row.outDir.path.replace(id, "").replace("//", "/")}</div>` : ""}
                `,
                events: {
                    "click a": (event, value, row) => this.onActionClick(event, row),
                },
                visible: this.gridCommons.isColumnVisible("id"),
            },
            {
                id: "toolId",
                title: "Tool ID",
                field: "tool.id",
                formatter: (toolId, row) => `
                    <div class="my-1">${toolId}</div>
                    ${row.tool?.type ? `<div class="text-secondary my-1">${row.tool.type}</div>` : ""}
                `,
                visible: this.gridCommons.isColumnVisible("toolId"),
            },
            {
                id: "params",
                title: "Parameters",
                field: "params",
                formatter: params => this.parametersFormatter(params),
                visible: this.gridCommons.isColumnVisible("params")
            },
            {
                id: "output",
                title: "Output Files",
                field: "output",
                formatter: outputFiles => CatalogGridFormatter.fileFormatter(outputFiles, "*"),
                events: {
                    "click a": (event, value, row) => this.onActionClick(event, row),
                },
                visible: this.gridCommons.isColumnVisible("output")
            },
            {
                id: "dependsOn",
                title: "Depends On",
                field: "dependsOn",
                formatter: dependsOn => this.dependsOnFormatter(dependsOn),
                events: {
                    "click a": (event, value, row) => this.onActionClick(event, row),
                },
                visible: this.gridCommons.isColumnVisible("dependsOn")
            },
            {
                id: "status",
                title: "Status",
                field: "internal.status",
                formatter: (status, job) => CatalogGridFormatter.jobStatusFormatter(status, job),
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
                id: "creationDate",
                title: "Submission Date",
                field: "creationDate",
                formatter: value => CatalogGridFormatter.dateFormatter(value),
                visible: this.gridCommons.isColumnVisible("creationDate"),
            },
            {
                id: "executionD",
                title: "Start/End Date",
                formatter: (_, row) => {
                    const execution = row.execution;
                    const values = [];
                    if (execution?.start) {
                        values.push(`<div class="my-1">${moment(execution.start).format("D MMM YYYY, h:mm:ss a")}</div>`);
                        values.push(execution?.end ? `<div class="my-1">${moment(execution.end).format("D MMM YYYY, h:mm:ss a")}</div>` : "-");
                    }
                    return values.join("") || "-";
                },
                visible: this.gridCommons.isColumnVisible("executionD")
            },
            {
                id: "actions",
                align: "right",
                formatter: (value, row) => this.actionsFormatter(value, row),
                events: {
                    "click a": (event, value, row) => this.onActionClick(event, row),
                },
                visible: this._config.showActions,
                excludeFromExport: true,
                excludeFromSettings: true,
            },
        ];

        this._columns = this.gridCommons.addColumnsFromExtensions(this.COMPONENT_ID, this.opencgaSession, this._columns);
        return this._columns;
    }

    parametersFormatter(params) {
        let html = "-";
        if (UtilsNew.isNotEmpty(params)) {
            html = "<div>";
            for (const key of Object.keys(params)) {
                debugger
                html += `<div style="margin: 2px 0; white-space: nowrap">`;
                // 1. Normal parameter
                if (typeof params[key] !== "object") {
                    const value = (params[key]?.length > 25 ? params[key].substring(0, 25) + " ..." : params[key]) || "true";
                    const tooltip = UtilsNew.escapeHtml((params[key]?.length > 25 ? params[key] : ""));
                    html += `
                        <span style="margin: 2px 0; font-weight: bold" title="${tooltip}">${key}:</span><span title="${tooltip}">${value}</span>
                    `;
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
                            <span style="margin: 2px 0; font-weight: bold">${key}:</span><span style="font-style: italic">none</span>
                        `;
                    }
                }
                html += "</div>";
            }
            html += "</div>";
        }
        return html;
    }

    dependsOnFormatter(dependsOn) {
        const items = (dependsOn || []).map(item => {
            return `
                <a class="link fw-bold d-block" data-action="view" data-job="${item.id}">${item.id}</a>
            `;
        });
        return GridCommons.generateExpandCollapseContent(items, 3);
    }

    actionsFormatter(value, row) {
        // Note: to kill the job user must be an admin or the job owner
        const hasKillPermission = row.userId === this.opencgaSession?.user?.id || CatalogUtils.isAdmin(this.opencgaSession?.study, this.opencgaSession?.user?.id);
        const hasExecutionPermission = this.gridCommons.hasPermission("EXECUTE");
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
                    <a data-action="retry" class="dropdown-item ${hasExecutionPermission ? "cursor-pointer" : "disabled"}">
                        <i class="fas fa-sync me-1"></i> Retry
                    </a>
                    <a data-action="kill" class="dropdown-item ${hasKillPermission ? "cursor-pointer" : "disabled"}">
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
    }

    onActionClick(event, job) {
        const action = event.currentTarget?.dataset?.action?.toLowerCase();
        switch (action) {
            case "view":
                // Note: the jobId may be passed in the dataset of the target element (for example, in the dependsOn formatter)
                this._selectedJobId = event.currentTarget?.dataset?.job || job.id;
                this.gridCommons.changeActiveModal("view-job");
                break;
            case "retry":
                this._selectedJobId = job.id;
                this.gridCommons.changeActiveModal("retry-job");
                break;
            case "kill":
                this._selectedJobId = job.id;
                this.gridCommons.changeActiveModal("kill-job");
                break;
            case "copy-json":
                UtilsNew.copyToClipboard(JSON.stringify(job, null, "\t"));
                break;
            case "download-json":
                UtilsNew.downloadData([JSON.stringify(job, null, "\t")], job.id + ".json");
                break;
            case "view-file":
                this._selectedFileId = event.currentTarget?.dataset?.file;
                this.gridCommons.changeActiveModal("view-file");
                break;
        }
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
            job: this._selectedJobId,
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
            .kill(this._selectedJobId, {
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
                <grid-toolbar
                    .query="${this.filters}"
                    .leftContent="${this.renderToolbarLeftContent()}"
                    .rightToolbar="${this.getRightToolbar()}"
                    .opencgaSession="${this.opencgaSession}"
                    .settings="${this.toolbarSetting}"
                    .config="${this.toolbarConfig}"
                    @download="${this.onDownload}"
                    @export="${this.onDownload}">
                </grid-toolbar>
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
