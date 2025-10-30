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

import { html, LitElement, nothing } from "lit";
import UtilsNew from "../../core/utils-new.js";
import GridCommons from "../commons/grid-commons.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import LitUtils from "../commons/utils/lit-utils.js";
import "../commons/grid-toolbar.js";
import "./workflow-create.js";
import "./workflow-import.js";
import "./workflow-nf-import.js";
import "./workflow-view.js";
import "./workflow-update.js";
import "./tool-create.js";
import "./analysis/tool-executor.js";

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
        this.RESOURCE = "WORKFLOW";
        this._prefix = UtilsNew.randomString(8);
        this.gridId = this._prefix + this.COMPONENT_ID;
        this.active = true;
        this.lastFilters = null;
        this._selectedUserTool = null;

        // Define user tool types
        this.TOOL_TYPE = [
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
        ];

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
            toolId: this.toolId,
            resource: this.RESOURCE,
            columns: this._getDefaultColumns(),
        };

        this.gridCommons.registerModals({
            "create-tool": {
                display: {
                    modalTitle: "Create User Tool",
                    modalSize: "modal-xl",
                    modalCyDataName: "modal-tool-create",
                    // modalDraggable: true,
                },
                render: () => html`
                    <tool-create
                        .opencgaSession="${this.opencgaSession}"
                        .type="${"CUSTOM_TOOL"}"
                        @customToolCreate="${() => {
                            this.gridCommons.clearActiveModal();
                            this.table.bootstrapTable("refresh");
                        }}">
                    </tool-create>
                `,
            },
            "create-variant-walker": {
                display: {
                    modalTitle: "Create Variant Walker",
                    modalSize: "modal-xl",
                    modalCyDataName: "modal-variant-walker-create",
                    // modalDraggable: true,
                },
                render: () => html`
                    <tool-create
                        .opencgaSession="${this.opencgaSession}"
                        .type="${"VARIANT_WALKER"}"
                        @customToolCreate="${() => {
                            this.gridCommons.clearActiveModal();
                            this.table.bootstrapTable("refresh");
                        }}">
                    </tool-create>
                `,
            },
            "view-tool": () => ({
                display: {
                    modalTitle: `Tool ${this._selectedUserTool?.id}`,
                    modalCyDataName: `modal-workflow-view`,
                    modalSize: "modal-2xl",
                    // modalDraggable: true,
                },
                render: () => html`
                    <workflow-view
                        .workflowId="${this._selectedUserTool?.id}"
                        .opencgaSession="${this.opencgaSession}">
                    </workflow-view>
                `,
            }),
            "create-workflow": {
                display: {
                    modalTitle: "Create New Workflow",
                    modalSize: "modal-xl",
                    modalCyDataName: "modal-workflow-create",
                    // modalDraggable: true,
                },
                render: () => html`
                    <workflow-create
                        .opencgaSession="${this.opencgaSession}"
                        .displayConfig="${{
                            type: "tabs",
                            buttonClearText: "Cancel",
                            buttonsLayout: "upper"
                        }}"
                        @workflowCreate="${() => {
                            this.gridCommons.clearActiveModal();
                            this.table.bootstrapTable("refresh");
                        }}">
                    </workflow-create>
                `,
            },
            "import-workflow": {
                display: {
                    modalTitle: "Import Workflow from GitHub",
                    modalCyDataName: "modal-workflow-import",
                    modalSize: "modal-xl",
                    // modalDraggable: true,
                },
                render: () => html`
                    <workflow-import
                        .opencgaSession="${this.opencgaSession}"
                        @workflowImport="${() => {
                            this.gridCommons.clearActiveModal();
                            this.table.bootstrapTable("refresh");
                        }}">
                    </workflow-import>
                `,
            },
            "import-nf-workflow": {
                display: {
                    modalTitle: "Import Workflow from Nextflow nf-core",
                    modalCyDataName: "modal-workflow-nf-core-import",
                    modalSize: "modal-xl",
                    // modalDraggable: true,
                },
                render: () => html`
                    <workflow-nf-import
                        .opencgaSession="${this.opencgaSession}"
                        @workflowImport="${() => {
                            this.gridCommons.clearActiveModal();
                            this.table.bootstrapTable("refresh");
                        }}">
                    </workflow-nf-import>
                `,
            },
            "execute-tool": () => ({
                display: {
                    modalTitle: "Execute Tool",
                    modalCyDataName: "modal-workflow-execute",
                    modalSize: "modal-xl",
                },
                render: () => html`
                    <tool-executor
                        .toolParams="${{
                            id: this._selectedUserTool?.id,
                        }}"
                        .displayConfig="${{
                            titleVisible: false,
                        }}"
                        .opencgaSession="${this.opencgaSession}">
                    </tool-executor>
                `,
            }),
            "update-workflow": () => ({
                display: {
                    modalTitle: `Update Workflow ${this._selectedUserTool?.id}`,
                    modalCyDataName: "modal-workflow-update",
                    modalSize: "modal-xl",
                },
                render: () => html`
                    <workflow-update
                        .workflowId="${this._selectedUserTool?.id}"
                        .displayConfig="${{
                            type: "tabs",
                            buttonClearText: "Cancel",
                            buttonsLayout: "upper"
                        }}"
                        .opencgaSession="${this.opencgaSession}"
                        @workflowUpdate="${() => {
                            this.gridCommons.clearActiveModal();
                            this.table.bootstrapTable("refresh");
                        }}">
                    </workflow-update>
                `,
            }),
        });
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
                pagination: this._config.pagination,
                pageSize: this._config.pageSize,
                pageList: this._config.pageList,
                paginationVAlign: "bottom",
                formatShowingRows: (pageFrom, pageTo, totalRows) => {
                    return this.gridCommons.formatShowingRows(pageFrom, pageTo, totalRows);
                },
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
                    this.opencgaSession.opencgaClient.userTool()
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
                onLoadSuccess: data => {
                    this.gridCommons.onLoadSuccess(data);
                },
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
            loadingTemplate: () => GridCommons.loadingFormatter(),
            onPostBody: data => {
                this.gridCommons.onLoadSuccess({ rows: data, total: data.length });
            },
        });
    }

    _getDefaultColumns() {
        this._columns = [
            {
                id: "id",
                title: "Tool",
                field: "id",
                formatter: (toolId, tool) => {
                    return `
                        <a class="fw-bold link my-1" data-action="view">${toolId}</a>
                        <div class="text-secondary my-1">${tool.type || "Unknown"}</div>
                    `;
                },
                events: {
                    "click a": (event, value, row) => this.onActionClick(event, row),
                },
                visible: this.gridCommons.isColumnVisible("id")
            },
            {
                id: "name",
                title: "Name",
                field: "name",
                width: "35",
                widthUnit: "%",
                formatter: (name, workflow) => {
                    return `
                        <div class="fw-bold my-1">${name}</div>
                        <div class="text-secondary my-1">${workflow.description}</div>
                    `;
                },
                visible: this.gridCommons.isColumnVisible("name")
            },
            {
                id: "scope",
                title: "Scope",
                field: "scope",
                formatter: scope => {
                    const scopeConfig = this.TOOL_TYPE.find(t => t.id === scope);
                    return `
                        <span class="badge fs-7" style="background-color: ${scopeConfig?.displayColor || "black"};">
                            ${scopeConfig?.displayLabel || "Unknown"}
                        </span>
                    `;
                },
                visible: this.gridCommons.isColumnVisible("scope")
            },
            {
                id: "tags",
                title: "Tags",
                field: "tags",
                formatter: tags => {
                    return `
                        <span>
                            ${tags?.join(", ") || "-"}
                        </span>
                    `;
                },
                visible: this.gridCommons.isColumnVisible("tags")
            },
            {
                id: "executor",
                title: "Executor",
                formatter: (_, userTool) => {
                    if (userTool.type === "WORKFLOW") {
                        const repository = userTool?.workflow?.repository;
                        return `
                            <div class="">
                                ${repository?.name ? `
                                    <div>
                                        <a class="link d-inline-flex align-items-center gap-1" href="https://github.com/${repository.name}" target="_blank">
                                            <span>${repository.name} v${repository.tag}</span>
                                            <i class="fa fa-external-link-alt fs-8"></i>
                                        </a>
                                    </div>
                                    <div class="text-secondary my-1">${userTool.workflow.manager.id} v${userTool.workflow.manager.version}</div>
                                ` : "-"}
                            </div>
                        `;
                    } else {
                        // Both CUSTOM TOOLS and VARIANT_WALKER use docker executor
                        const docker = userTool?.docker;
                        return `
                            <div class="">
                                ${docker?.name ? `
                                    <div>
                                        <a class="link d-inline-flex align-items-center gap-1" href="https://github.com/${docker.name}" target="_blank">
                                            <span>${docker.name} v${docker.tag}</span>
                                            <i class="fa fa-external-link-alt fs-8"></i>
                                        </a>
                                    </div>
                                    <div class="text-secondary my-1">DOCKER</div>
                                ` : "-"}
                            </div>
                    `;
                    }
                },
                visible: this.gridCommons.isColumnVisible("executor")
            },
            {
                id: "minimumRequirements",
                title: "Minimum Requirements",
                field: "minimumRequirements",
                formatter: minimumRequirements => {
                    return `
                        <div class="my-1"><b>CPU</b>: ${minimumRequirements?.cpu || "-"} core(s)</div>
                        <div class="my-1"><b>Memory</b>: ${minimumRequirements?.memory?.split(".")[0] || "-"} GB</div>
                        <div class="my-1"><b>Processor</b>: ${minimumRequirements?.processorType || "CPU"}</div>
                    `;
                },
                visible: this.gridCommons.isColumnVisible("minimumRequirements")
            },
            {
                id: "ownerId",
                title: "Author",
                field: "internal.registrationUserId",
                formatter: ownerId => ownerId || "-",
                visible: this.gridCommons.isColumnVisible("ownerId")
            },
            {
                id: "creationDate",
                title: "Modification / Creation Date",
                field: "creationDate",
                formatter: (value, row) => CatalogGridFormatter.modifiedAndCreateDateFormatter(value, row),
                visible: this.gridCommons.isColumnVisible("creationDate")
            },
            {
                id: "execute",
                title: "Execute",
                field: "execute",
                formatter: _ => {
                    return `
                        <a class="btn btn-primary cursor-pointer d-inline-flex align-items-center gap-1" data-action="execute">
                            <i class="fas fa-play me-1"></i>
                            <span>Execute</span>
                        </a>
                    `;
                },
                events: {
                    "click a": (event, value, row) => this.onActionClick(event, row),
                },
                visible: this.gridCommons.isColumnVisible("execute")
            },
            {
                id: "actions",
                formatter: () => this.actionsFormatter(),
                events: {
                    "click a": (event, value, row) => this.onActionClick(event, row),
                },
                visible: this._config.showActions,
                excludeFromSettings: true,
            },
        ];

        this._columns = this.gridCommons.addColumnsFromExtensions(this.COMPONENT_ID, this.opencgaSession, this._columns);
        return this._columns;
    }

    actionsFormatter() {
        const hasWritePermission = this.gridCommons.hasPermission("WRITE");
        const hasDeletePermission = this.gridCommons.hasPermission("DELETE");
        const hasExecutePermission = this.gridCommons.hasPermission("EXECUTE", "JOB");
        return `
            <div class="d-flex justify-content-end align-items-center">
                <div class="dropdown d-flex justify-content-end">
                    <button class="btn" data-bs-toggle="dropdown" data-cy="actions-button">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div class="dropdown-menu dropdown-menu-end">
                        <a class="dropdown-item cursor-pointer" data-action="view">
                            <i class="fas fa-eye me-1"></i>
                            <span>View</span>
                        </a>
                        <a class="dropdown-item cursor-pointer" data-action="copy-json">
                            <i class="fas fa-copy me-1"></i>
                            <span>Copy JSON</span>
                        </a>
                        <a class="dropdown-item cursor-pointer" data-action="download-json">
                            <i class="fas fa-download me-1"></i>
                            <span>Download JSON</span>
                        </a>
                        <hr class="dropdown-divider">
                        <a class="dropdown-item ${hasExecutePermission ? "cursor-pointer" : "disabled"}" data-action="execute">
                            <i class="fas fa-play me-1"></i>
                            <span>Execute</span>
                        </a>
                        <hr class="dropdown-divider">
                        <a class="dropdown-item ${hasWritePermission ? "cursor-pointer" : "disabled"}" data-action="update">
                            <i class="fas fa-edit me-1"></i>
                            <span>Edit</span>
                        </a>
                        <a class="dropdown-item ${hasDeletePermission ? "cursor-pointer" : "disabled"}" data-action="delete">
                            <i class="fas fa-trash me-1"></i>
                            <span>Delete</span>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    onActionClick(event, userTool) {
        const action = (event.currentTarget?.dataset?.action || "").toLowerCase();
        switch (action) {
            case "view":
                this._selectedUserTool = userTool;
                this.gridCommons.changeActiveModal("view-tool");
                break;
            case "copy-json":
                UtilsNew.copyToClipboard(JSON.stringify(userTool, null, "\t"));
                break;
            case "download-json":
                UtilsNew.downloadData([JSON.stringify(userTool, null, "\t")], userTool.id + ".json");
                break;
            case "execute":
                this._selectedUserTool = userTool;
                this.gridCommons.changeActiveModal("execute-tool");
                break;
            case "update":
                this._selectedUserTool = userTool;
                this.gridCommons.changeActiveModal("update-workflow");
                break;
            case "delete":
                this.onDelete(userTool);
                break;
        }
    }

    onDelete(userTool) {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: `Delete Workflow`,
            message: `Are you sure you want to delete the tool ${userTool.id}?`,
            ok: () => {
                this.opencgaSession.opencgaClient.userTool()
                    .delete(userTool.id, {
                        study: this.opencgaSession.study.fqn,
                        jobId: `workflow-delete-${UtilsNew.getDatetime()}`,
                    })
                    .then(() => {
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                            message: `Workflow '${userTool.id}' has been deleted.`,
                        });
                        this.table.bootstrapTable("refresh");
                    })
                    .catch(error => {
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
                    });
            },
        });
    }

    async onDownload(e) {
        this.toolbarConfig = { ...this.toolbarConfig, downloading: true };
        this.requestUpdate();
        await this.updateComplete;

        const filters = {
            ...this.lastFilters,
            skip: 0,
            limit: 1000,
            count: false
        };
        this.opencgaSession.opencgaClient.userTool()
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
                        UtilsNew.downloadData(data, "tool_" + this.opencgaSession.study.id + ".tsv", "text/plain");
                    } else {
                        UtilsNew.downloadData(JSON.stringify(results, null, "\t"), "tool_" + this.opencgaSession.study.id + ".json", "application/json");
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
                this.toolbarConfig = { ...this.toolbarConfig, downloading: false };
                this.requestUpdate();
            });
    }

    renderToolbarLeftContent() {
        return html`
            <span id="${this.gridId + "PaginationInfo"}"></span>
        `;
    }

    getRightToolbar() {
        return [
            {
                icon: "fas fa-plus",
                title: "Create Tool",
                disabled: !this.gridCommons.hasPermission("WRITE"),
                onClick: () => this.gridCommons.changeActiveModal("create-tool"),
            },
            {
                // icon: "fas fa-file-import",
                // title: "Import Workflow",
                render: () => {
                    return html`
                        <div class="dropdown">
                            <button class="btn btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="fas fa-file-import me-1"></i>
                                Import Workflow
                            </button>
                            <ul class="dropdown-menu">
                                <li>
                                    <a class="dropdown-item cursor-pointer" @click="${() => this.gridCommons.changeActiveModal('import-workflow')}">
                                        Import from GitHub
                                    </a>
                                </li>
                                <li>
                                    <a class="dropdown-item cursor-pointer" @click="${() => this.gridCommons.changeActiveModal('import-nf-workflow')}">
                                        Import from Nextflow nf-core
                                    </a>
                                </li>
                                <li>
                                    <hr class="dropdown-divider">
                                </li>
                                <li>
                                    <a class="dropdown-item cursor-pointer" @click="${() => this.gridCommons.changeActiveModal('create-workflow')}">
                                        Import from Scripts
                                    </a>
                                </li>
                            </ul>
                        </div>
                    `;
                },
                disabled: !this.gridCommons.hasPermission("WRITE"),
            },
            {
                icon: "fas fa-plus",
                title: "Create Variant Walker",
                disabled: !this.gridCommons.hasPermission("WRITE"),
                onClick: () => this.gridCommons.changeActiveModal("create-variant-walker"),
            },
        ];
    }

    render() {
        return html`
            ${this._config.showToolbar ? html`
                <grid-toolbar
                    .resource="${"WORKFLOW"}"
                    .toolId="${this.toolId}"
                    .query="${this.query}"
                    .leftContent="${this.renderToolbarLeftContent()}"
                    .rightToolbar="${this.getRightToolbar()}"
                    .opencgaSession="${this.opencgaSession}"
                    .settings="${this.toolbarSetting}"
                    .config="${this.toolbarConfig}"
                    @download="${this.onDownload}"
                    @export="${this.onDownload}">
                </grid-toolbar>
            ` : nothing}

            <div id="${this._prefix}GridTableDiv" class="force-overflow">
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
        };
    }
}

customElements.define("workflow-grid", WorkflowGrid);
