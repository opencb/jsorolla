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
import "./workflow-create.js";
import UtilsNew from "../../core/utils-new.js";
import GridCommons from "../commons/grid-commons.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils";
import ModalUtils from "../commons/modal/modal-utils";
import "../commons/opencb-grid-toolbar.js";
import WebUtils from "../commons/utils/web-utils";

export default class WorkflowGrid extends LitElement {

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
            workflows: {
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

    #init() {
        this.COMPONENT_ID = "workflow-grid";
        this._prefix = UtilsNew.randomString(8);
        this.gridId = this._prefix + this.COMPONENT_ID;
        this.active = true;

        const entityActions = [
            {
                id: "workflow-create",
                tooltip: "New Workflow",
                icon: "fas fa-plus",
                title: "Create Workflow",
                modalId: `${this._prefix}WorkflowCreateModal`,
                render: () => this.renderWorkflowCreate(),
                permissionLevelRequired: "WRITE",
            },
            {
                id: "workflow-import",
                tooltip: "Import Workflow",
                icon: "fas fa-file-import",
                title: "Import workflow",
                modalId: `${this._prefix}WorkflowImportModal`,
                render: () => this.renderWorkflowImport(),
                // CAUTION 20250209 Vero: No execute permission needed?
                permissionLevelRequired: "WRITE",
            },
        ];

        const instanceActions = [
            {
                id: "workflow-view",
                title: "View",
                icon: "fas fa-external-link-alt",
                classes: "btn-outline-primary",
                quick: true,
                modalTitle: "View Workflow",
                modalId: `${this._prefix}WorkflowViewModal`,
                render: () => this.renderWorkflowView(),
                divider: true,
            },
            {
                id: "workflow-copy",
                title: "Copy JSON",
                icon: "fas fa-copy",
                render: () => this.renderWorkflowCopy(),
            },
            {
                id: "workflow-download",
                title: "Download JSON",
                icon: "fas fa-download",
                render: () => this.renderWorkflowDownload(),
                divider: true,
            },
            {
                id: "workflow-execute",
                title: "Execute...",
                icon: "fas fa-play",
                modalTitle: "Execute",
                modalId: `${this._prefix}WorkflowExecuteModal`,
                render: () => this.renderWorkflowExecute(),
                // CAUTION 20250209 Vero: Job execution permission
                permissionLevelRequired: "EXECUTE",
                divider: true,
            },
            {
                id: "workflow-update",
                title: "Edit...",
                icon: "fas fa-edit",
                modalTitle: "Update",
                modalId: `${this._prefix}WorkflowUpdateModal`,
                render: () => this.renderWorkflowUpdate(),
                permissionLevelRequired: "WRITE",
                divider: true,
            },
            {
                id: "workflow-delete",
                title: "Delete...",
                icon: "far fa-trash-alt",
                classes: "btn-outline-danger",
                permissionLevelRequired: "DELETE",
            },
        ];

        this.actions = {
            "entity": entityActions,
            "instance": instanceActions,
        };

        this.currentAction = {};

        this._config = this.getDefaultConfig();
    }

    #initOriginalObjects() {
        this.currentAction = {};
        this.workflowId = "";
        this.workflow = {};
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
        // With each property change we must be updated config and create the columns again. No extra checks are needed.
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };
        this.gridCommons = new GridCommons(this.gridId, this, this._config);

        // settings for the grid toolbar
        this.toolbarSetting = {
            ...this._config,
        };

        // Config for the grid toolbar
        this.toolbarConfig = {
            toolId: this.toolId,
            resource: "WORKFLOW",
            columns: this._getDefaultColumns(),
            // create: {
            //     display: {
            //         modalTitle: "Workflow Create",
            //         modalDraggable: true,
            //         modalCyDataName: "modal-create",
            //         modalSize: "modal-lg"
            //     },
            //     render: () => html`
            //         <workflow-create
            //                 .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
            //                 .opencgaSession="${this.opencgaSession}">
            //         </workflow-create>
            //     `
            // },
            // Uncomment in case we need to change defaults
            // export: {
            //     display: {
            //         modalTitle: "Workflow Export",
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
            //         modalTitle: "Workflow Settings",
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


        this.permissions = ["WRITE", "DELETE", "EXECUTE"].reduce((acc, operation) => {
            const operationId =  WebUtils.getPermissionID(
                operation === "EXECUTE" ? "JOB" : this.toolbarConfig.resource,
                operation);
            acc[operation] =  OpencgaCatalogUtils.getStudyEffectivePermission(
                this.opencgaSession.study,
                this.opencgaSession.user.id,
                operationId,
                this.opencgaSession?.organization?.configuration?.optimizations?.simplifyPermissions) ? "" : "disabled";
            return acc;
        }, {});
        console.log(this.permissions);
    }

    renderTable() {
        if (this.workflows?.length > 0) {
            this.renderLocalTable();
        } else {
            this.renderRemoteTable();
        }
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
                // classes: "table table-hover table-borderless",
                classes: "table table-borderless table-hover table-grid",
                buttonsClass: "light",
                columns: this._columns,
                method: "get",
                sidePagination: "server",
                iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
                icons: GridCommons.GRID_ICONS,
                uniqueId: "id",
                silentSort: false,
                pagination: this._config.pagination,
                pageSize: this._config.pageSize,
                pageList: this._config.pageList,
                paginationVAlign: "bottom",
                formatShowingRows: (pageFrom, pageTo, totalRows) => {
                    return this.gridCommons.formatShowingRows(pageFrom, pageTo, totalRows);
                },
                showExport: this._config.showExport,
                detailView: !!this.detailFormatter,
                gridContext: this,
                loadingTemplate: () => GridCommons.loadingFormatter(),
                // rowStyle: () => ({css: {"background-color": "white",}}),
                ajax: params => {
                    let workflowResponse = null;
                    this.filters = {
                        study: this.opencgaSession.study.fqn,
                        limit: params.data.limit,
                        skip: params.data.offset || 0,
                        count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                        ...this.query
                    };

                    // Store the current filters
                    this.lastFilters = {...this.filters};
                    this.opencgaSession.opencgaClient.workflows()
                        .search(this.filters)
                        .then(response => {
                            workflowResponse = response;
                            // Prepare data for columns extensions
                            const rows = workflowResponse.responses?.[0]?.results || [];
                            return this.gridCommons.prepareDataForExtensions(this.COMPONENT_ID, this.opencgaSession, this.filters, rows);
                        })
                        .then(() => params.success(workflowResponse))
                        .catch(e => {
                            console.error(e);
                            params.error(e);
                        });
                },
                responseHandler: response => {
                    const result = this.gridCommons.responseHandler(response, $(this.table).bootstrapTable("getOptions"));
                    return result.response;
                },
                onCheck: row => this.gridCommons.onCheck(row.id, row),
                onCheckAll: rows => this.gridCommons.onCheckAll(rows),
                onUncheck: row => this.gridCommons.onUncheck(row.id, row),
                onUncheckAll: rows => this.gridCommons.onUncheckAll(rows),
                // Vero 20250202: Do not display a pre-selected row
                // onLoadSuccess: data => this.gridCommons.onLoadSuccess(data, 1),
                onLoadError: (e, restResponse) => this.gridCommons.onLoadError(e, restResponse),
            });
        }
    }

    renderLocalTable() {
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            theadClasses: "table-light",
            buttonsClass: "light",
            columns: this._getDefaultColumns(),
            // data: this.workflows,
            sidePagination: "server",
            // Josemi Note 2024-01-18: we have added the ajax function for local workflows also to support executing async calls
            // when getting additional data from columns extensions.
            ajax: params => {
                const tableOptions = $(this.table).bootstrapTable("getOptions");
                const limit = params.data.limit || tableOptions.pageSize;
                const skip = params.data.offset || 0;
                const rows = this.workflows.slice(skip, skip + limit);

                // Get data for extensions
                this.gridCommons.prepareDataForExtensions(this.COMPONENT_ID, this.opencgaSession, null, rows)
                    .then(() => params.success(rows))
                    .catch(error => params.error(error));
            },
            // Josemi Note 2024-01-18: we use this method to tell bootstrap-table how many rows we have in our data
            responseHandler: response => {
                return {
                    total: this.workflows.length,
                    rows: response,
                };
            },
            iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
            icons: GridCommons.GRID_ICONS,
            uniqueId: "id",
            pagination: this._config.pagination,
            paginationVAlign: "bottom",
            pageSize: this._config.pageSize,
            pageList: this._config.pageList,
            showExport: this._config.showExport,
            detailView: this._config.detailView && this.detailFormatter,
            gridContext: this,
            // formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
            loadingTemplate: () => GridCommons.loadingFormatter(),
            onClickRow: (row, selectedElement) => this.gridCommons.onClickRow(row.id, row, selectedElement),
            onPostBody: data => {
                // We call onLoadSuccess to select first row
                // this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 1);
            }
        });
    }

    onColumnChange(e) {
        this.gridCommons.onColumnChange(e);
    }

    async onActionClick(e, value, workflow) {
        this.currentAction = this.actions[e.currentTarget.dataset.type].find(action => action.id === e.currentTarget.dataset.action);
        this.workflowId = workflow?.id ?? "";
        this.workflow = workflow ?? {};
        this.requestUpdate();
        await this.updateComplete;
        ModalUtils.show(this.currentAction["modalId"]);
    }

    _getDefaultColumns() {
        this._columns = [
            {
                id: "id",
                title: "Workflow ID",
                field: "id",
                rowspan: 1,
                colspan: 1,
                formatter: (workflowId, workflow) => {
                    return`
                        <div class="m-1">
                            <span style="font-weight: bold; margin: 5px 0">${workflowId}</span>
                            <span class="d-block text-secondary" style="margin: 5px 0">Version ${workflow.version}</span>
                        </div>
                    `;
                },
                visible: this.gridCommons.isColumnVisible("id")
            },
            {
                id: "name",
                title: "Name",
                field: "name",
                rowspan: 1,
                colspan: 1,
                formatter: (name, workflow) => {
                    return `
                        <div class="m-1">
                            <span style="font-weight: bold; margin: 5px 0">${name}</span>
                            <span class="d-block text-secondary" style="margin: 5px 0">${workflow.description}</span>
                        </div>`;
                },
                visible: this.gridCommons.isColumnVisible("name")
            },
            {
                id: "type",
                title: "Type",
                field: "type",
                rowspan: 1,
                colspan: 1,
                formatter: type => {
                    const typeConfig = this._config.workflowType.find(t => t.id === type);
                    return`
                        <span
                            class="badge"
                            style="background-color: ${typeConfig.displayColor}">
                                ${typeConfig.displayLabel}
                        </span>
                    `;
                },
                visible: this.gridCommons.isColumnVisible("type")
            },
            {
                id: "scripts",
                title: "Scripts",
                field: "scripts",
                formatter: scripts => {
                    return `
                        <div>
                            ${scripts?.map(script => `<span class="">${script.fileName}</span>`).join("<br>")}
                        </div>
                    `;
                },
                visible: this.gridCommons.isColumnVisible("scripts")
            },
            {
                id: "tags",
                title: "Tags",
                field: "tags",
                rowspan: 1,
                colspan: 1,
                formatter: tags => tags?.join(",") || "-",
                visible: this.gridCommons.isColumnVisible("tags")
            },
            {
                id: "minimumRequirements",
                title: "Minimum Requirements",
                field: "minimumRequirements",
                rowspan: 1,
                colspan: 1,
                formatter: minimumRequirements => {
                    return `
                        <div class="m-1">
                            <div style="margin: 5px 0">
                                <span class="px-1">CPU:</span><span>${minimumRequirements?.cpu || "-"} core(s)</span>
                            </div>
                            <div style="margin: 5px 0">
                                <span class="px-1">Memory:</span><span>${minimumRequirements?.memory.split(".")[0] || "-"} GB</span>
                            </div>
                        </div>`;
                },
                visible: this.gridCommons.isColumnVisible("minumumRequirements")
            },
            {
                id: "ownerId",
                title: "Owner ID",
                field: "internal.registrationUserId",
                rowspan: 1,
                colspan: 1,
                formatter: ownerId => ownerId || "-",
                visible: this.gridCommons.isColumnVisible("ownerId")
            },
            {
                id: "creationDate",
                title: "Modified / Created",
                field: "creationDate",
                rowspan: 1,
                colspan: 1,
                formatter: CatalogGridFormatter.modifiedAndCreateDateFormatter,
                visible: this.gridCommons.isColumnVisible("creationDate")
            },
        ];

        if (this.opencgaSession && this._config.showActions) {
            this._columns.push({
                id: "actions",
                title: "",
                field: "actions",
                rowspan: 1,
                colspan: 1,
                align: "center",
                formatter: () => `
                    <div class="d-flex justify-content-center align-items-center">
                            <div id="" class="d-flex justify-content-around">
                                ${this.actions["instance"]
                                    .filter(action => !!action.quick)
                                    .map(action => {
                                        return`
                                            <button
                                                class="btn ${action.classes} ${this.permissions[action.permissionLevelRequired] || ""}} quick-action"
                                                data-action="${action.id}"
                                                data-type="instance"
                                                style="border: 0; cursor:pointer;">
                                                    <i class="${action.icon}"></i>
                                            </button>
                                        `;
                                    }).join("")
                                }
                            </div>
                            <div class="dropdown d-flex justify-content-end">
                                <button
                                    type="button"
                                    class="btn"
                                    style="border: 0"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false">
                                    <i class="fas fa-ellipsis-v"></i>
                                </button>
                                <ul class="dropdown-menu">
                                    ${this.actions["instance"]
                                        .filter(action => !action.quick)
                                        .map(action => `
                                            <li>
                                                <a
                                                class="dropdown-item ${this.permissions[action.permissionLevelRequired] || ""}"
                                                data-action="${action.id}"
                                                data-type="instance"
                                                style="cursor:pointer;">
                                                    <div class="d-flex align-items-center">
                                                        <div class="me-2">${action.icon ? `<span><i class="${action.icon} pe-2"></i></span>` : ""}</div>
                                                        <div class="me-4">${action.title ? `${action.title}` : ""}</div>
                                                    </div>
                                                </a>
                                            </li>
                                            ${action.divider ? `<li><hr class="dropdown-divider"></li>` : ""}
                                        `).join("")
                                    }
                                </ul>
                            </div>
                        </div>
                `,
                events: {
                    "click a, button.quick-action": (e, value, workflow) => this.onActionClick(e, value, workflow),
                },
                visible: this.gridCommons.isColumnVisible("actions"),
            });
        }

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
        this.opencgaSession.opencgaClient.workflows()
            .search(filters)
            .then(restResponse => {
                const results = restResponse.getResults();
                if (results) {
                    // Check if user clicked in Tab or JSON format
                    if (e.detail.option.toUpperCase() === "TAB") {
                        const fields = ["id", "type", "creationDate"];
                        const data = UtilsNew.toTableString(results, fields, {
                            "sex.id": CatalogGridFormatter.sexFormatter,
                        });
                        UtilsNew.downloadData(data, "workflows_" + this.opencgaSession.study.id + ".tsv", "text/plain");
                    } else {
                        UtilsNew.downloadData(JSON.stringify(results, null, "\t"), "workflows_" + this.opencgaSession.study.id + ".json", "application/json");
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

    getRightToolbar() {
        return this.actions["entity"].map(action => {
            return {
                render: () => html`
                    <div class="btn-group">
                        <button
                                type="button"
                                class="btn btn-light ${action.permission}"
                                data-action="${action.id}"
                                data-type="entity"
                                @click="${(e, value, row) => this.onActionClick(e, value, row)}">
                            ${action.icon ? html`<span><i class="${action.icon} fa-lg pe-1"></i></span>` : nothing}
                            ${action.title ? html`${action.title}` : nothing}
                        </button>
                    </div>
                `,
            }
        })
    }

    renderWorkflowCreate() {
        return ModalUtils.create(this, `${this.currentAction["modalId"]}`, {
            display: {
                modalTitle: this.currentAction["modalTitle"],
                modalDraggable: true,
                modalCyDataName: "modal-workflow-create",
                modalSize: "modal-lg",
            },
            render: () => html`
                <workflow-create
                        .opencgaSession="${this.opencgaSession}"
                        .displayConfig="${{
                            buttonClearText: "Cancel",
                            type: "tabs",
                            buttonsLayout: "upper"
                        }}"
                        .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                        @workflowCreate="${e => this.onWorkflowAction(e, `${this.currentAction["modalId"]}`)}">
                </workflow-create>
            `,
        });
    }

    onWorkflowImport(e) {
        this.opencgaSession.opencgaClient.workflows()
            .search(
                {
                    study: this.opencgaSession.study.fqn,
                    limit: 100,
                    count: true
                })
            .then(response => {
                this.workflows = response.getResults();
            })
            .catch(error => {
                console.error(error);
                params.error(error);
            }).finally(() => {
            this.requestUpdate();
        });
    }

    renderWorkflowImport() {
        return ModalUtils.create(this, `${this.currentAction["modalId"]}`, {
            display: {
                modalTitle: this.currentAction["modalTitle"],
                modalDraggable: true,
                modalCyDataName: `modal-${this.currentAction["id"]}`,
                modalSize: "modal-lg",
            },
            render: () => html`
                <workflow-import
                        .opencgaSession="${this.opencgaSession}"
                        @workflowImport="${this.onWorkflowImport}">
                </workflow-import>
            `,
        });
    }

    renderWorkflowView() {
        return ModalUtils.create(this, `${this.currentAction["modalId"]}`, {
            display: {
                modalTitle: `Workflow ${this.workflowId}`,
                modalDraggable: false,
                modalCyDataName: `modal-${this.currentAction["id"]}`,
                modalContainerClass: "fullscreen-modal",
                modalTitleHeader: "h4",
            },
            render: () => html`
                <!--
                <workflow-view
                    .workflowId="${this.workflowId}"
                    .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "bottom"}}"
                    .opencgaSession="${this.opencgaSession}">
                </workflow-view>
                -->
                <workflow-detail
                    .workflowId="${this.workflowId}"
                    .opencgaSession="${this.opencgaSession}"
                    .config="${this._config.view}">
                </workflow-detail>
            `,
        });
    }

    renderWorkflowExecute() {
        return ModalUtils.create(this, `${this.currentAction["modalId"]}`, {
            display: {
                modalTitle: this.currentAction["modalTitle"],
                modalDraggable: true,
                modalCyDataName: `modal-${this.currentAction["id"]}`,
                modalSize: "modal-lg",
            },
            render: () => html`
                <workflow-analysis
                    .toolParams="${{id: this.workflowId}}"
                    .search="${false}"
                    .opencgaSession="${this.opencgaSession}">
                </workflow-analysis>
            `,
        });
    }

    renderWorkflowUpdate() {
        return ModalUtils.create(this, `${this.currentAction["modalId"]}`, {
            display: {
                modalTitle: this.currentAction["modalTitle"],
                modalDraggable: true,
                modalCyDataName: `modal-${this.currentAction["id"]}`,
                modalSize: "modal-lg",
            },
            render: active => html`
                <workflow-update
                        .workflowId="${this.workflowId}"
                        .active="${active}"
                        .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                        .opencgaSession="${this.opencgaSession}">
                </workflow-update>
            `,
        });
    }

    renderWorkflowCopy() {
        UtilsNew.copyToClipboard(JSON.stringify(this.workflow, null, "\t"));
    }

    renderWorkflowDownload() {
        UtilsNew.downloadData([JSON.stringify(this.workflow, null, "\t")], this.workflow.id + ".json");
    }

    renderWorkflowDelete() {
        return html`
            <workflow-delete
                .opencgaSession="${this.opencgaSession}"
                .workflowId="${this.workflowId}"
                @closeNotification="${e => this.onCloseNotification(e)}">
            </workflow-delete>
        `;
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
                    @columnChange="${this.onColumnChange}"
                    @download="${this.onDownload}"
                    @export="${this.onDownload}"
                    @actionClick="${e => this.onActionClick(e)}"
                    @individualCreate="${this.renderTable}">
                </opencb-grid-toolbar>
            ` : nothing}

            <div id="${this._prefix}GridTableDiv" class="force-overflow" data-cy="w-grid">
                <table id="${this.gridId}"></table>
            </div>
            <!-- 3. On entity action click, render the respective modal -->
            ${UtilsNew.isNotEmpty(this.currentAction) ? this.currentAction["render"]() : nothing}
        `;
    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 25],
            multiSelection: false,
            showSelectCheckbox: false,
            detailView: false,
            showToolbar: true,
            showActions: true,

            showCreate: false,
            showExport: false,
            showSettings: false,
            exportTabs: ["download", "link", "code"],

            view: {
                title: "",
                showTitle: false,
                items: [
                    {
                        id: "workflow-view",
                        name: "Overview",
                        active: true,
                        render: (workflow, active, opencgaSession) => html`
                            <workflow-view
                                    .workflow="${workflow}"
                                    .opencgaSession="${opencgaSession}">
                            </workflow-view>
                        `,
                    },
                    {
                        id: "workflow-scripts",
                        name: "Scripts",
                        render: workflow => html`
                            <workflow-scripts-view
                                    .workflow="${workflow}">
                            </workflow-scripts-view>
                        `,
                    },
                    {
                        id: "workflow-jobs",
                        name: "Jobs",
                        render: (workflow, active, opencgaSession) => html`
                            <workflow-jobs
                                    .workflow="${workflow}"
                                    .opencgaSession="${opencgaSession}">
                            </workflow-jobs>
                        `,
                    },
                    {
                        id: "json-view",
                        name: "JSON Data",
                        render: (workflow, active) => html`
                            <json-viewer
                                    .data="${workflow}"
                                    .active="${active}">
                            </json-viewer>
                        `,
                    }
                ]
            },

            workflowType: [
                {
                    id: "SECONDARY_ANALYSIS",
                    displayLabel: "SECONDARY",
                    displayColor: "#25283D",
                    displayOutline: "btn-outline-success",
                    description: "",
                },
                {
                    id: "RESEARCH_ANALYSIS",
                    displayLabel: "RESEARCH",
                    displayColor: "#98DFEA",
                    displayOutline: "btn-outline-success",
                    description: "",
                },
                {
                    id: "CLINICAL_INTERPRETATION_ANALYSIS",
                    displayLabel: "CLINICAL INTERPRETATION",
                    displayColor: "#9F1F93",
                    displayOutline: "btn-outline-success",
                    description: "",
                },
                {
                    id: "OTHER",
                    displayLabel: "OTHER",
                    displayColor: "#C2CBCF",
                    displayOutline: "btn-outline-success",
                    description: "",
                }
            ],
        }
    }
}

customElements.define("workflow-grid", WorkflowGrid);
