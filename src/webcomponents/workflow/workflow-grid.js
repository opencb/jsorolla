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
import LitUtils from "../commons/utils/lit-utils.js";
import "../commons/opencb-grid-toolbar.js";
import "./workflow-create.js";
import "./workflow-import.js";
import "./workflow-view.js";
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
        this.RESOURCE = "WORKFLOW";
        this._prefix = UtilsNew.randomString(8);
        this.gridId = this._prefix + this.COMPONENT_ID;
        this.active = true;
        this.lastFilters = null;
        this._selectedWorkflow = null;
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
            "create-workflow": {
                display: {
                    modalTitle: "Create Workflow",
                    modalCyDataName: "modal-workflow-create",
                    modalSize: "modal-lg",
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
                    modalTitle: "Import Workflow",
                    modalCyDataName: "modal-workflow-import",
                    modalSize: "modal-lg",
                },
                render: () => html`
                    <workflow-import
                        .opencgaSession="${this.opencgaSession}"
                        @workflowImport="${() => {
                            // this.gridCommons.clearActiveModal();
                            this.table.bootstrapTable("refresh");
                        }}">
                    </workflow-import>
                `,
            },
            "view-workflow": () => ({
                display: {
                    modalTitle: `Workflow ${this._selectedWorkflow?.id}`,
                    modalCyDataName: `modal-workflow-view`,
                    modalSize: "modal-xl",
                },
                render: () => html`
                    <workflow-view
                        .workflowId="${this._selectedWorkflow?.id}"
                        .opencgaSession="${this.opencgaSession}">
                    </workflow-view>
                `,
            }),
            "execute-workflow": () => ({
                display: {
                    modalTitle: "Execute Workflow",
                    modalCyDataName: "modal-workflow-execute",
                    modalSize: "modal-lg",
                },
                render: () => html`
                    <workflow-analysis
                        .toolParams="${{
                            id: this._selectedWorkflow?.id,
                        }}"
                        .search="${false}"
                        .opencgaSession="${this.opencgaSession}">
                    </workflow-analysis>
                `,
            }),
            "update-workflow": () => ({
                display: {
                    modalTitle: `Update Workflow ${this._selectedWorkflow?.id}`,
                    modalCyDataName: "modal-workflow-update",
                    modalSize: "modal-lg",
                },
                render: () => html`
                    <workflow-update
                        .workflowId="${this._selectedWorkflow?.id}"
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
            // formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
            loadingTemplate: () => GridCommons.loadingFormatter(),
            //onClickRow: (row, selectedElement) => this.gridCommons.onClickRow(row.id, row, selectedElement),
            onPostBody: data => {
                // We call onLoadSuccess to select first row
                // this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 1);
            },
        });
    }

    _getDefaultColumns() {
        this._columns = [
            {
                id: "id",
                title: "Workflow ID",
                field: "id",
                formatter: (workflowId, workflow) => {
                    return`
                        <div class="fw-bold">${workflowId}</div>
                        <div class="text-secondary">Version ${workflow.version}</div>
                    `;
                },
                visible: this.gridCommons.isColumnVisible("id")
            },
            {
                id: "name",
                title: "Name",
                field: "name",
                formatter: (name, workflow) => {
                    return `
                        <div class="fw-bold">${name}</div>
                        <div class="text-secondary">${workflow.description}</div>
                    `;
                },
                visible: this.gridCommons.isColumnVisible("name")
            },
            {
                id: "type",
                title: "Type",
                field: "type",
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
                id: "tags",
                title: "Tags",
                field: "tags",
                formatter: tags => tags?.join(", ") || "-",
                visible: this.gridCommons.isColumnVisible("tags")
            },
            {
                id: "scripts",
                title: "Scripts",
                field: "scripts",
                formatter: scripts => {
                    return (scripts || []).map(script => `<div>${script.fileName}</div>`).join("") || "-";
                },
                visible: this.gridCommons.isColumnVisible("scripts")
            },
            {
                id: "minimumRequirements",
                title: "Minimum Requirements",
                field: "minimumRequirements",
                formatter: minimumRequirements => {
                    return `
                        <div><b>CPU</b>: ${minimumRequirements?.cpu || "-"} core(s)</div>
                        <div><b>Memory</b>: ${minimumRequirements?.memory?.split(".")[0] || "-"} GB</div>
                    `;
                },
                visible: this.gridCommons.isColumnVisible("minimumRequirements")
            },
            {
                id: "ownerId",
                title: "Owner ID",
                field: "internal.registrationUserId",
                formatter: ownerId => ownerId || "-",
                visible: this.gridCommons.isColumnVisible("ownerId")
            },
            {
                id: "creationDate",
                title: "Modified / Created",
                field: "creationDate",
                formatter: CatalogGridFormatter.modifiedAndCreateDateFormatter,
                visible: this.gridCommons.isColumnVisible("creationDate")
            },
            {
                id: "actions",
                formatter: () => this.actionsFormatter(),
                events: {
                    "click a": (event, value, row) => this.onActionClick(event, row),
                },
                excludeFromSettings: true,
                visible: this._config.showActions, // this.gridCommons.isColumnVisible("actions"),
            },
        ];

        this._columns = this.gridCommons.addColumnsFromExtensions(this.COMPONENT_ID, this.opencgaSession, this._columns);
        return this._columns;
    }

    actionsFormatter() {
        const hasWritePermission = this.gridCommons.hasPermission("WRITE");
        const hasDeletePermission = this.gridCommons.hasPermission("DELETE");
        const hasExecutePermission = this.gridCommons.hasPermission("EXECUTE");
        return `
            <div class="d-flex justify-content-end align-items-center">
                <a class="btn" data-action="view">
                    <i class="fas fa-eye"></i>
                </a>
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
                        <hr class="dropdown-divider">
                        <a class="dropdown-item ${hasDeletePermission ? "cursor-pointer" : "disabled"}" data-action="delete">
                            <i class="fas fa-trash me-1"></i>
                            <span>Delete</span>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    onColumnChange(e) {
        this.gridCommons.onColumnChange(e);
    }

    onActionClick(event, workflow) {
        const action = (event.currentTarget?.dataset?.action || "").toLowerCase();
        switch (action) {
            case "view":
                this._selectedWorkflow = workflow;
                this.gridCommons.changeActiveModal("view-workflow");
                break;
            case "copy-json":
                UtilsNew.copyToClipboard(JSON.stringify(workflow, null, "\t"));
                break;
            case "download-json":
                UtilsNew.downloadData([JSON.stringify(workflow, null, "\t")], workflow.id + ".json");
                break;
            case "execute":
                this._selectedWorkflow = workflow;
                this.gridCommons.changeActiveModal("execute-workflow");
                break;
            case "update":
                this._selectedWorkflow = workflow;
                this.gridCommons.changeActiveModal("update-workflow");
                break;
            case "delete":
                this.onDelete(workflow);
                break;
        }
    }

    onDelete(workflow) {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: `Delete Workflow`,
            message: `Are you sure you want to delete the workflow ${workflow.id}?`,
            ok: () => {
                this.opencgaSession.opencgaClient.workflows()
                    .delete(workflow.id, {
                        study: this.opencgaSession.study.fqn,
                        jobId: `workflow-delete-${UtilsNew.getDatetime()}`,
                    })
                    .then(() => {
                        this.table.bootstrapTable("refresh");
                    })
                    .catch(error => {
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
                    });
            },
        });
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

    renderToolbarLeftContent() {
        return html`
            <span id="${this.gridId + "PaginationInfo"}"></span>
        `;
    }

    getRightToolbar() {
        return [
            {
                icon: "fas fa-plus",
                title: "Create Workflow",
                disabled: !this.gridCommons.hasPermission("WRITE"),
                onClick: () => this.gridCommons.changeActiveModal("create-workflow"),
            },
            {
                icon: "fas fa-file-import",
                title: "Import Workflow",
                disabled: !this.gridCommons.hasPermission("WRITE"),
                onClick: () => this.gridCommons.changeActiveModal("import-workflow"),
            },
        ];
    }

    render() {
        return html`
            ${this._config.showToolbar ? html`
                <div class="mx-1 my-2">
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
                </div>
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
