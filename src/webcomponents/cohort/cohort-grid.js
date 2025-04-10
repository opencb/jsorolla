
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

import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../core/utils-new.js";
import GridCommons from "../commons/grid-commons.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter.js";
import PolymerUtils from "../PolymerUtils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import ModalUtils from "../commons/modal/modal-utils.js";
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import WebUtils from "../commons/utils/web-utils.js";
import LitUtils from "../commons/utils/lit-utils.js";
import "../commons/opencb-grid-toolbar.js";
import "./cohort-create.js";
import "./cohort-update.js";
import "./cohort-view.js";

export default class CohortGrid extends LitElement {

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
            cohorts: {
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
        this.COMPONENT_ID = "cohort-grid";
        this.RESOURCE = "COHORT";
        this._prefix = UtilsNew.randomString(8);
        this.gridId = this._prefix + this.COMPONENT_ID;
        this.active = true;
        this._selectedCohort = null;
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

        // Settings for the grid toolbar
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
            "view-cohort": () => ({
                display: {
                    modalTitle: `Cohort ${this._selectedCohort?.id}`,
                    modalDraggable: true,
                    modalCyDataName: "cohort-view",
                    modalSize: "modal-xl"
                },
                render: () => html`
                    <cohort-view
                        .cohortId="${this._selectedCohort?.id}"
                        .active="${true}"
                        .opencgaSession="${this.opencgaSession}">
                    </cohort-view>
                `,
            }),
            "create-cohort": {
                display: {
                    modalTitle: "Create Cohort",
                    modalDraggable: true,
                    modalCyDataName: "cohort-create",
                    modalSize: "modal-lg"
                },
                render: () => html`
                    <cohort-create
                        .displayConfig="${{
                            type: "tabs",
                            buttonsLayout: "upper",
                        }}"
                        .opencgaSession="${this.opencgaSession}">
                    </cohort-create>
                `,
            },
        });

        this.permissionID = WebUtils.getPermissionID(this.toolbarConfig.resource, "WRITE");
    }

    renderTable() {
        if (this.cohorts?.length > 0) {
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
            // data: this.cohorts,
            sidePagination: "server",
            // Josemi Note 2024-01-18: we have added the ajax function for local cohorts also to support executing async calls
            // when getting additional data from columns extensions.
            ajax: params => {
                const tableOptions = $(this.table).bootstrapTable("getOptions");
                const limit = params.data.limit || tableOptions.pageSize;
                const skip = params.data.offset || 0;
                const rows = this.cohorts.slice(skip, skip + limit);

                // Get data for extensions
                this.gridCommons.prepareDataForExtensions(this.COMPONENT_ID, this.opencgaSession, null, rows)
                    .then(() => params.success(rows))
                    .catch(error => params.error(error));
            },
            // Josemi Note 2024-01-18: we use this method to tell bootstrap-table how many rows we have in our data
            responseHandler: response => {
                return {
                    total: this.cohorts.length,
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
            showExport: this._config.showExport,
            detailView: this._config.detailView,
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

    renderRemoteTable() {
        if (this.opencgaSession?.opencgaClient && this.opencgaSession?.study?.fqn) {
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
                pagination: this._config.pagination,
                pageSize: this._config.pageSize,
                pageList: this._config.pageList,
                paginationVAlign: "bottom",
                formatShowingRows: (pageFrom, pageTo, totalRows) => {
                    return this.gridCommons.formatShowingRows(pageFrom, pageTo, totalRows);
                },
                showExport: this._config.showExport,
                detailView: this._config.detailView,
                loadingTemplate: () => GridCommons.loadingFormatter(),
                ajax: params => {
                    let cohorstResponse = null;
                    this.filters = {
                        study: this.opencgaSession.study.fqn,
                        limit: params.data.limit,
                        skip: params.data.offset || 0,
                        count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                        include: "id,creationDate,status,type,numSamples,annotationSets",
                        ...this.query
                    };

                    // Store the current filters
                    this.lastFilters = {...this.filters};
                    this.opencgaSession.opencgaClient.cohorts()
                        .search(this.filters)
                        .then(response => {
                            cohorstResponse = response;
                            // Prepare data for columns extensions
                            const rows = cohorstResponse.responses?.[0]?.results || [];
                            return this.gridCommons.prepareDataForExtensions(this.COMPONENT_ID, this.opencgaSession, this.filters, rows);
                        })
                        .then(() => params.success(cohorstResponse))
                        .catch(e => {
                            console.error(e);
                            params.error(e);
                        })
                        .finally(() => {
                            LitUtils.dispatchCustomEvent(this, "queryComplete", null, {
                                response: cohorstResponse,
                            });
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
                            $(PolymerUtils.getElementById(this._prefix + "CohortBrowserGrid")).bootstrapTable("expandRow", element[0].dataset.index);
                        } else {
                            $(PolymerUtils.getElementById(this._prefix + "CohortBrowserGrid")).bootstrapTable("collapseRow", element[0].dataset.index);
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
                onLoadError: (e, restResponse) => this.gridCommons.onLoadError(e, restResponse)
            });
        }
    }

    onColumnChange(e) {
        this.gridCommons.onColumnChange(e);
    }

    onActionClick(event, cohort) {
        const action = event.target.dataset.action?.toLowerCase();
        switch (action) {
            case "view":
                this._selectedCohort = cohort;
                this.gridCommons.changeActiveModal("view-cohort");
                break;
            case "edit":
                this._selectedCohort = cohort;
                this.gridCommons.changeActiveModal("update-cohort");
                break;
        }
    }

    _getDefaultColumns() {
        this._columns = [
            {
                id: "id",
                title: "Cohort ID",
                field: "id",
                formatter: (cohortId, cohort) => {
                    return `
                        <div>
                            <span style="font-weight: bold; margin: 5px 0">${cohortId}</span>
                            ${cohort.name ? `<span class="d-block text-secondary" style="margin: 5px 0">${cohort.name}</span>` : ""}
                        </div>`;
                },
                halign: "center",
                visible: this.gridCommons.isColumnVisible("id")
            },
            {
                id: "numSamples",
                title: "Number of Samples",
                field: "numSamples",
                halign: "center",
                visible: this.gridCommons.isColumnVisible("numSamples")
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

        if (this._config.annotations?.length > 0) {
            this.gridCommons.addColumnsFromAnnotations(this._columns, CatalogGridFormatter.customAnnotationFormatter, this._config);
        }

        if (this.opencgaSession && this._config.showActions) {
            this._columns.push({
                id: "actions",
                align: "right",
                formatter: () => {
                    const hasWritePermission = OpencgaCatalogUtils.getStudyEffectivePermission(
                        this.opencgaSession.study,
                        this.opencgaSession.user.id,
                        this.permissionID,
                        this.opencgaSession?.organization?.configuration?.optimizations?.simplifyPermissions);
                    return `
                        <div class="d-inline-block dropdown">
                            <button class="btn" data-bs-toggle="dropdown" data-cy="actions-button">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <div class="dropdown-menu dropdown-menu-end">
                                <a data-action="view" class="dropdown-item cursor-pointer">
                                    <i class="fas fa-eye me-1"></i> View
                                </a>
                                <a data-action="edit" class="dropdown-item ${hasWritePermission ? "cursor-pointer" : "disabled"}">
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
                    "click a": (event, value, row) => this.onActionClick(event, row),
                },
                visible: this.gridCommons.isColumnVisible("actions"),
            });
        }

        if (this._config.multiSelection) {
            this._columns.unshift({
                field: "state",
                checkbox: true,
                class: "cursor-pointer",
                eligible: false
            });
        }

        this._columns = this.gridCommons.addColumnsFromExtensions(this.COMPONENT_ID, this.opencgaSession, this._columns);
        return this._columns;
    }

    async onDownload(e) {
        this.toolbarConfig = {
            ...this.toolbarConfig,
            downloading: true
        };
        this.requestUpdate();
        await this.updateComplete;
        const filters = {
            ...this.query,
            study: this.opencgaSession.study.fqn,
            limit: e.detail?.exportLimit ?? 1000,
            includeIndividual: true,
            // skipCount: true,
            include: "id,creationDate,status,type,samples"
        };
        this.opencgaSession.opencgaClient.cohorts()
            .search(filters)
            .then(response => {
                const results = response.getResults();
                if (results) {
                    // Check if user clicked in Tab or JSON format
                    if (e.detail.option.toUpperCase() === "TAB") {
                        const dataString = [
                            ["Cohort", "#Samples", "Date", "Status", "Type"].join("\t"),
                            ...results.map(_ => [
                                _.id,
                                _.samples ? _.samples.map(_ => `${_.id}`).join(",") : "",
                                _.creationDate ? CatalogGridFormatter.dateFormatter(_.creationDate) : "-",
                                _.status.id,
                                _.type
                            ].join("\t"))];
                        UtilsNew.downloadData(dataString, "cohort_" + this.opencgaSession.study.id + ".tsv", "text/plain");
                    } else {
                        UtilsNew.downloadData(JSON.stringify(results, null, "\t"), "cohort_" + this.opencgaSession.study.id + ".json", "application/json");
                    }
                } else {
                    console.error("Error in result format");
                }
            })
            .catch(response => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            })
            .finally(() => {
                this.toolbarConfig = {
                    ...this.toolbarConfig,
                    downloading: false
                };
                this.requestUpdate();
            });
    }

    renderModalUpdate() {
        return ModalUtils.create(this, `${this._prefix}UpdateModal`, {
            display: {
                modalTitle: `Cohort Update: ${this.cohortUpdateId}`,
                modalDraggable: true,
                modalSize: "modal-lg",
            },
            render: active => html`
                <cohort-update
                    .cohortId="${this.cohortUpdateId}"
                    .active="${active}"
                    .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                    .opencgaSession="${this.opencgaSession}">
                </cohort-update>
            `,
        });
    }

    renderToolbarLeftContent() {
        return html`
            <span id="${this.gridId + "PaginationInfo"}"></span>
        `;
    }

    getRightToolbar() {
        const hasWritePermission = this.gridCommons.hasPermission("WRITE");
        return [
            {
                icon: "fa-folder-plus",
                title: "Create Cohort",
                disabled: !hasWritePermission,
                onClick: () => this.gridCommons.changeActiveModal("create-cohort"),
            },
        ];
    }

    render() {
        return html`
            ${this._config.showToolbar ? html`
                <opencb-grid-toolbar
                    .query="${this.filters}"
                    .opencgaSession="${this.opencgaSession}"
                    .leftContent="${this.renderToolbarLeftContent()}"
                    .rightToolbar="${this.getRightToolbar()}"
                    .settings="${this.toolbarSetting}"
                    .config="${this.toolbarConfig}"
                    @columnChange="${this.onColumnChange}"
                    @download="${this.onDownload}"
                    @export="${this.onDownload}"
                    @actionClick="${e => this.onActionClick(e)}"
                    @cohortCreate="${this.renderTable}">
                </opencb-grid-toolbar>
            ` : nothing}

            <div id="${this._prefix}GridTableDiv" class="force-overflow">
                <table id="${this.gridId}"></table>
            </div>

            ${this.renderModalUpdate()}
            ${this.gridCommons.renderModals()}
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

            showCreate: true,
            showExport: true,
            showSettings: true,
            exportTabs: ["download", "link", "code"],
        };
    }

}

customElements.define("cohort-grid", CohortGrid);
