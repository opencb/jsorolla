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
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import ModalUtils from "../commons/modal/modal-utils.js";
import WebUtils from "../commons/utils/web-utils.js";
import LitUtils from "../commons/utils/lit-utils.js";
import "../commons/opencb-grid-toolbar.js";
import "./workflow-create.js";
import "./workflow-import.js";
import "./workflow-detail.js";
import "./workflow-update.js";
import "./analysis/workflow-analysis.js";

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
        this.activeActionModal = "";
        this.lastFilters = null;

        // const entityActions = [
        //     {
        //         id: "workflow-create",
        //         tooltip: "New Workflow",
        //         icon: "fas fa-plus",
        //         title: "Create Workflow",
        //         modalId: `${this._prefix}WorkflowCreateModal`,
        //         render: () => this.renderWorkflowCreate(),
        //         permissionLevelRequired: "WRITE",
        //     },
        //     {
        //         id: "workflow-import",
        //         tooltip: "Import Workflow",
        //         icon: "fas fa-file-import",
        //         title: "Import workflow",
        //         modalId: `${this._prefix}WorkflowImportModal`,
        //         render: () => this.renderWorkflowImport(),
        //         // CAUTION 20250209 Vero: No execute permission needed?
        //         permissionLevelRequired: "WRITE",
        //     },
        // ];

        // const instanceActions = [
        //     {
        //         id: "workflow-view",
        //         title: "View",
        //         icon: "fas fa-external-link-alt",
        //         classes: "btn-outline-primary",
        //         quick: true,
        //         modalTitle: "View Workflow",
        //         modalId: `${this._prefix}WorkflowViewModal`,
        //         render: () => this.renderWorkflowView(),
        //         divider: true,
        //     },
        //     {
        //         id: "workflow-copy",
        //         title: "Copy JSON",
        //         icon: "fas fa-copy",
        //         render: () => this.renderWorkflowCopy(),
        //     },
        //     {
        //         id: "workflow-download",
        //         title: "Download JSON",
        //         icon: "fas fa-download",
        //         render: () => this.renderWorkflowDownload(),
        //         divider: true,
        //     },
        //     {
        //         id: "workflow-execute",
        //         title: "Execute...",
        //         icon: "fas fa-play",
        //         modalTitle: "Execute",
        //         modalId: `${this._prefix}WorkflowExecuteModal`,
        //         render: () => this.renderWorkflowExecute(),
        //         // CAUTION 20250209 Vero: Job execution permission
        //         permissionLevelRequired: "EXECUTE",
        //         divider: true,
        //     },
        //     {
        //         id: "workflow-update",
        //         title: "Edit...",
        //         icon: "fas fa-edit",
        //         modalTitle: "Update",
        //         modalId: `${this._prefix}WorkflowUpdateModal`,
        //         render: () => this.renderWorkflowUpdate(),
        //         permissionLevelRequired: "WRITE",
        //         divider: true,
        //     },
        //     {
        //         id: "workflow-delete",
        //         title: "Delete...",
        //         icon: "far fa-trash-alt",
        //         classes: "btn-outline-danger",
        //         permissionLevelRequired: "DELETE",
        //     },
        // ];

        // this.actions = {
        //     "entity": entityActions,
        //     "instance": instanceActions,
        // };

        // this.currentAction = {};

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
            columns: this._getDefaultColumns(),
        };

        // Create a map with the allowed permissions for the authenticated user
        this.permissions = Object.fromEntries(["WRITE", "DELETE", "EXECUTE"].map(operation => {
            const hasPermission =  OpencgaCatalogUtils.getStudyEffectivePermission(
                this.opencgaSession.study,
                this.opencgaSession.user.id,
                WebUtils.getPermissionID(operation === "EXECUTE" ? "JOB" : "WORKFLOW", operation),
                this.opencgaSession?.organization?.configuration?.optimizations?.simplifyPermissions
            );
            return [operation, hasPermission];
        }));
    }

    changeActiveActionModal(actionModal) {
        // 1. check if there is a modal rendered
        if (this.activeActionModal) {
            ModalUtils.close(`${this._prefix}Modal${this.activeActionModal}`);
        }

        // 2. set the new active action modal
        this.activeActionModal = actionModal;
        this.requestUpdate();

        // 3. show the new active action modal (if provided)
        this.updateComplete.then(() => {
            if (this.activeActionModal) {
                ModalUtils.show(`${this._prefix}Modal${this.activeActionModal}`);
            }
        });
    }

    forceTableRefresh() {
        this.lastFilters = null; // reset last filters to force a refresh of the table
        this.renderTable();
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
                classes: "table table-borderless table-hover table-grid",
                buttonsClass: "light",
                columns: this._columns,
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
                detailView: !!this.detailFormatter,
                gridContext: this,
                loadingTemplate: () => GridCommons.loadingFormatter(),
                ajax: params => {
                    let workflowResponse = null;
                    const filters = {
                        study: this.opencgaSession.study.fqn,
                        limit: params.data.limit,
                        skip: params.data.offset || 0,
                        count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                        ...this.query
                    };

                    // Store the current filters
                    this.lastFilters = filters;
                    this.opencgaSession.opencgaClient.workflows()
                        .search(filters)
                        .then(response => {
                            workflowResponse = response;
                            // Prepare data for columns extensions
                            const rows = workflowResponse.responses?.[0]?.results || [];
                            return this.gridCommons.prepareDataForExtensions(this.COMPONENT_ID, this.opencgaSession, filters, rows);
                        })
                        .then(() => params.success(workflowResponse))
                        .catch(e => {
                            console.error(e);
                            params.error(e);
                        })
                        .finally(() => {
                            LitUtils.dispatchCustomEvent(this, "queryComplete", null, {
                                response: workflowResponse,
                            });
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
                        </div>
                    `;
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
                        <span class="badge" style="background-color: ${typeConfig.displayColor}">
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
                        </div>
                    `;
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
            {
                id: "actions",
                title: "",
                field: "actions",
                rowspan: 1,
                colspan: 1,
                align: "center",
                formatter: () => `
                    <div class="d-flex justify-content-center align-items-center">
                        <div class="d-flex justify-content-around">
                            <a class="btn" data-action="view">
                                <i class="fa fa-external-link-alt"></i>
                            </a>
                        </div>
                        <div class="dropdown d-flex justify-content-end">
                            <button class="btn" data-bs-toggle="dropdown">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <div class="dropdown-menu dropdown-menu-end">
                                <a class="dropdown-item cursor-pointer" data-action="copy-json">
                                    <i class="fas fa-copy me-1"></i>
                                    <span>Copy JSON</span>
                                </a>
                                <a class="dropdown-item cursor-pointer" data-action="download-json">
                                    <i class="fas fa-download me-1"></i>
                                    <span>Download JSON</span>
                                </a>
                                <hr class="dropdown-divider">
                                <a class="dropdown-item ${this.permissions.EXECUTE ? "cursor-pointer" : "disabled"}" data-action="execute">
                                    <i class="fas fa-play me-1"></i>
                                    <span>Execute...</span>
                                </a>
                                <hr class="dropdown-divider">
                                <a class="dropdown-item ${this.permissions.WRITE ? "cursor-pointer" : "disabled"}" data-action="update">
                                    <i class="fas fa-edit me-1"></i>
                                    <span>Edit...</span>
                                </a>
                                <hr class="dropdown-divider">
                                <a class="dropdown-item ${this.permissions.DELETE ? "cursor-pointer" : "disabled"}" data-action="delete">
                                    <i class="fas fa-trash me-1"></i>
                                    <span>Delete...</span>
                                </a>
                            </div>
                        </div>
                    </div>
                `,
                events: {
                    "click a": (e, value, workflow) => this.onActionClick(e, value, workflow),
                },
                excludeFromSettings: true,
                visible: this._config.showActions, // this.gridCommons.isColumnVisible("actions"),
            },
        ];

        this._columns = this.gridCommons.addColumnsFromExtensions(this._columns, this.COMPONENT_ID);
        return this._columns;
    }

    onColumnChange(e) {
        this.gridCommons.onColumnChange(e);
    }

    onActionClick(event, value, workflow) {
        const action = event.currentTarget.dataset.action;
        switch (action) {
            case "view":
                this.workflowId = workflow.id;
                this.changeActiveActionModal("view");
                break;
            case "copy-json":
                UtilsNew.copyToClipboard(JSON.stringify(workflow, null, "\t"));
                break;
            case "download-json":
                UtilsNew.downloadData([JSON.stringify(workflow, null, "\t")], workflow.id + ".json");
                break;
            case "execute":
                this.workflowId = workflow.id;
                this.changeActiveActionModal("execute");
                break;
            case "update":
                this.workflowId = workflow.id;
                this.changeActiveActionModal("update");
                break;
            case "delete":
                this.workflowId = workflow.id;
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
                    title: `Delete Workflow: Workflow <b>${this.workflowId}</b> in organization ${this.opencgaSession.organization.id}`,
                    message: `Are you sure you want to delete this workflow ${this.workflowId}?`,
                    ok: () => {
                        this.opencgaSession.opencgaClient.workflows()
                            .delete(this.workflowId, {
                                study: this.opencgaSession.study.fqn,
                                jobId: `workflow-delete-${UtilsNew.getDatetime()}`,
                            })
                            .then(() => {
                                this.forceTableRefresh();
                            })
                            .catch(error => {
                                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
                            });
                    },
                });
                break;
        }
    }

    async onDownload(e) {
        this.toolbarConfig = {...this.toolbarConfig, downloading: true};
        this.requestUpdate();
        await this.updateComplete;

        const filters = {
            ...this.lastFilters,
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
        return [
            {
                className: this.permissions.WRITE ? "" : "disabled",
                icon: "fas fa-plus",
                title: "Create Workflow",
                onClick: () => this.changeActiveActionModal("create"),
            },
            {
                className: this.permissions.WRITE ? "" : "disabled",
                icon: "fas fa-file-import",
                title: "Import Workflow",
                onClick: () => this.changeActiveActionModal("import"),
            },
        ];
    }

    renderActionModal() {
        let config = null;

        switch (this.activeActionModal) {
            case "create":
                config = {
                    display: {
                        modalTitle: "Create Workflow",
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
                            @workflowCreate="${() => {
                                this.changeActiveActionModal("");
                                this.forceTableRefresh();
                            }}">
                        </workflow-create>
                    `,
                };
                break;
            case "import":
                config = {
                    display: {
                        modalTitle: "Import Workflow",
                        modalCyDataName: "modal-workflow-import",
                        modalSize: "modal-lg",
                    },
                    render: () => html`
                        <workflow-import
                            .opencgaSession="${this.opencgaSession}"
                            @workflowImport="${() => {
                                // this.changeActiveActionModal("");
                                this.forceTableRefresh();
                            }}">
                        </workflow-import>
                    `,
                };
                break;
            case "view":
                config = {
                    display: {
                        modalTitle: `Workflow ${this.workflowId}`,
                        modalCyDataName: `modal-workflow-view`,
                        modalContainerClass: "fullscreen-modal",
                        modalTitleHeader: "h4",
                    },
                    render: () => html`
                        <workflow-detail
                            .workflowId="${this.workflowId}"
                            .opencgaSession="${this.opencgaSession}">
                        </workflow-detail>
                    `,
                };
                break;
            case "execute":
                config = {
                    display: {
                        modalTitle: "Execute Workflow",
                        modalCyDataName: "modal-workflow-execute",
                        modalSize: "modal-lg",
                    },
                    render: () => html`
                        <workflow-analysis
                            .toolParams="${{id: this.workflowId}}"
                            .search="${false}"
                            .opencgaSession="${this.opencgaSession}">
                        </workflow-analysis>
                    `,
                };
                break;
            case "update":
                config = {
                    display: {
                        modalTitle: `Update Workflow ${this.workflowId}`,
                        modalCyDataName: "modal-workflow-update",
                        modalSize: "modal-lg",
                    },
                    render: () => html`
                        <workflow-update
                            .workflowId="${this.workflowId}"
                            .displayConfig="${{
                                buttonClearText: "Cancel",
                                type: "tabs",
                                buttonsLayout: "upper"
                            }}"
                            .opencgaSession="${this.opencgaSession}"
                            @workflowUpdate="${() => {
                                this.changeActiveActionModal("");
                                this.forceTableRefresh();
                            }}">
                        </workflow-update>
                    `,
                };
                break;
        }

        // render a modal with the provided configuration
        return config ? ModalUtils.create(this, `${this._prefix}Modal${this.activeActionModal}`, config) : nothing;
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
                    .resource="${"WORKFLOW"}"
                    .toolId="${this.toolId}"
                    .query="${this.query}"
                    .leftContent="${this.renderToolbarLeftContent()}"
                    .rightToolbar="${this.getRightToolbar()}"
                    .opencgaSession="${this.opencgaSession}"
                    .settings="${this.toolbarSetting}"
                    .config="${this.toolbarConfig}"
                    @columnChange="${this.onColumnChange}"
                    @download="${this.onDownload}"
                    @export="${this.onDownload}"
                    @actionClick="${e => this.onActionClick(e)}">
                </opencb-grid-toolbar>
            ` : nothing}

            <div id="${this._prefix}GridTableDiv" class="force-overflow">
                <table id="${this.gridId}"></table>
            </div>

            ${this.renderActionModal()}
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
        };
    }
}

customElements.define("workflow-grid", WorkflowGrid);
