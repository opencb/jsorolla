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
            // buttons: ["columns", "download"],
            ...this._config,
        };

        // Config for the grid toolbar
        this.toolbarConfig = {
            toolId: this.toolId,
            resource: "WORKFLOW",
            columns: this._getDefaultColumns(),
            create: {
                display: {
                    modalTitle: "Workflow Create",
                    modalDraggable: true,
                    modalCyDataName: "modal-create",
                    modalSize: "modal-lg"
                },
                render: () => html `
                    <workflow-create
                        .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                        .opencgaSession="${this.opencgaSession}">
                    </workflow-create>
                `
            },
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
                theadClasses: "table-light",
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
                paginationVAlign: "both",
                formatShowingRows: this.gridCommons.formatShowingRows,
                showExport: this._config.showExport,
                detailView: this._config.detailView,
                detailFormatter: this.detailFormatter,
                gridContext: this,
                loadingTemplate: () => GridCommons.loadingFormatter(),
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
                onClickRow: (row, selectedElement) => this.gridCommons.onClickRow(row.id, row, selectedElement),
                onDblClickRow: (row, element) => {
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
                },
                onLoadError: (e, restResponse) => {
                    this.gridCommons.onLoadError(e, restResponse);
                },
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
            pageSize: this._config.pageSize,
            pageList: this._config.pageList,
            showExport: this._config.showExport,
            detailView: this._config.detailView,
            detailFormatter: this.detailFormatter,
            gridContext: this,
            // formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
            loadingTemplate: () => GridCommons.loadingFormatter(),
            onClickRow: (row, selectedElement) => this.gridCommons.onClickRow(row.id, row, selectedElement),
            onPostBody: data => {
                // We call onLoadSuccess to select first row
                this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 1);
            }
        });
    }

    onColumnChange(e) {
        this.gridCommons.onColumnChange(e);
    }

    detailFormatter(value, row) {
        let result = `
            <div class='row' style="padding: 5px 10px 20px 10px">
                <div class='col-md-12'>
                    <h5 style="font-weight: bold">Steps</h5>
        `;

        result += "</div></div>";
        return result;
    }

    async onActionClick(e, _, row) {
        const action = e.target.dataset.action?.toLowerCase() || e.detail.action;
        switch (action) {
            case "copy-json":
                UtilsNew.copyToClipboard(JSON.stringify(row, null, "\t"));
                break;
            case "download-json":
                UtilsNew.downloadData([JSON.stringify(row, null, "\t")], row.id + ".json");
                break;
            case "execute":
                break;
            case "edit":
                this.workflowUpdateId = row.id;
                this.requestUpdate();
                await this.updateComplete;
                ModalUtils.show(`${this._prefix}UpdateModal`);
                break;
        }
    }

    _getDefaultColumns() {
        this._columns = [
            {
                id: "id",
                title: "Workflow ID",
                field: "id",
                formatter: (workflowId, workflow) => {
                    return `
                        <div class="mt-1 mb-1">
                            <span style="font-weight: bold; margin: 5px 0">${workflowId}</span>
                            <span class="d-block text-secondary" style="margin: 5px 0">Version ${workflow.version}</span>
                        </div>`;
                },
                halign: "center",
                visible: this.gridCommons.isColumnVisible("id")
            },
            {
                id: "name",
                title: "Name",
                field: "name",
                formatter: (name, workflow) => {
                    return `
                        <div>
                            <span style="font-weight: bold; margin: 5px 0">${name}</span>
                            <span class="d-block text-secondary" style="margin: 5px 0">${workflow.description}</span>
                        </div>`;
                },
                halign: "center",
                visible: this.gridCommons.isColumnVisible("name")
            },
            {
                id: "type",
                title: "Type",
                field: "type",
                formatter: type => type || "-",
                halign: "center",
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
                halign: "center",
                visible: this.gridCommons.isColumnVisible("tags")
            },
            {
                id: "tags",
                title: "Tags",
                field: "tags",
                formatter: tags => tags?.join(",") || "-",
                halign: "center",
                visible: this.gridCommons.isColumnVisible("tags")
            },
            {
                id: "ownerId",
                title: "Owner ID",
                field: "internal.registrationUserId",
                formatter: ownerId => ownerId || "-",
                halign: "center",
                visible: this.gridCommons.isColumnVisible("ownerId")
            },
            {
                id: "creationDate",
                title: "Creation Date",
                field: "creationDate",
                formatter: CatalogGridFormatter.dateFormatter,
                halign: "center",
                visible: this.gridCommons.isColumnVisible("creationDate")
            },
        ];

        // Example of custom annotation configuration:
        // this._config.annotations = [
        //     {
        //         title: "Cardiology Tests",
        //         position: 6,
        //         variableSetId: "cardiology_tests_checklist",
        //         variables: ["ecg_test", "echo_test"]
        //     },
        //     {
        //         title: "Risk Assessment",
        //         position: 7,
        //         variableSetId: "risk_assessment",
        //     }
        // ];
        if (this._config.annotations?.length > 0) {
            this.gridCommons.addColumnsFromAnnotations(this._columns, CatalogGridFormatter.customAnnotationFormatter, this._config);
        }

        if (this.opencgaSession && this._config.showActions) {
            this._columns.push({
                id: "actions",
                title: "Actions",
                field: "actions",
                align: "center",
                formatter: (value, row) => `
                    <div class="d-inline-block dropdown">
                        <button class="btn btn-light btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            <i class="fas fa-toolbox me-1" aria-hidden="true"></i>
                            <span>Actions</span>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li>
                                <a data-action="copy-json" href="javascript: void 0" class="dropdown-item">
                                    <i class="fas fa-copy" aria-hidden="true"></i> Copy JSON
                                </a>
                            </li>
                            <li>
                                <a data-action="download-json" href="javascript: void 0" class="dropdown-item">
                                    <i class="fas fa-download" aria-hidden="true"></i> Download JSON
                                </a>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                                <a data-action="execute" class="dropdown-item"
                                        href="#workflow-analysis/${this.opencgaSession.project.id}/${this.opencgaSession.study.id}/${row.id}">
                                    <i class="fas fa-stream" aria-hidden="true"></i> Execute
                                </a>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                                <a data-action="edit" class="dropdown-item ${OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user.id) || "disabled" }">
                                    <i class="fas fa-edit" aria-hidden="true"></i> Edit ...
                                </a>
                            </li>
                            <li>
                                <a data-action="delete" href="javascript: void 0" class="dropdown-item disabled">
                                    <i class="fas fa-trash" aria-hidden="true"></i> Delete
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
        return [];
    }

    renderModalUpdate() {
        return ModalUtils.create(this, `${this._prefix}UpdateModal`, {
            display: {
                modalTitle: `Workflow Update: ${this.workflowUpdateId}`,
                modalDraggable: true,
                modalCyDataName: "modal-update",
                modalSize: "modal-lg"
            },
            render: active => html`
                <workflow-update
                    .workflowId="${this.workflowUpdateId}"
                    .active="${active}"
                    .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                    .opencgaSession="${this.opencgaSession}">
                </workflow-update>
            `,
        });
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
                    @individualCreate="${this.renderTable}">
                </opencb-grid-toolbar>
            ` : nothing}

            <div id="${this._prefix}GridTableDiv" class="force-overflow" data-cy="ib-grid">
                <table id="${this.gridId}"></table>
            </div>

            ${this.renderModalUpdate()}
        `;
    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 25],
            multiSelection: false,
            showSelectCheckbox: false,
            detailView: true,
            showToolbar: true,
            showActions: true,

            showCreate: true,
            showExport: true,
            showSettings: true,
            exportTabs: ["download", "link", "code"],
        };
    }

}

customElements.define("workflow-grid", WorkflowGrid);
