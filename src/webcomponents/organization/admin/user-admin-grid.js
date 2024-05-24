/**
 * Copyright 2015-2024 OpenCB
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
import GridCommons from "../../commons/grid-commons.js";
import UtilsNew from "../../../core/utils-new.js";
import ModalUtils from "../../commons/modal/modal-utils.js";
import CatalogGridFormatter from "../../commons/catalog-grid-formatter.js";
import OpencgaCatalogUtils from "../../../core/clients/opencga/opencga-catalog-utils.js";

import "./user-admin-create.js";
import "./user-admin-update.js";
import "./user-admin-details-update.js";
import "./user-admin-password-change.js";
import "./user-admin-password-reset.js";
import LitUtils from "../../commons/utils/lit-utils";

export default class UserAdminGrid extends LitElement {

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
            organization: {
                type: Object,
            },
            studyId: {
                type: String,
            },
            users: {
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
        this.COMPONENT_ID = "user-grid";
        this._prefix = UtilsNew.randomString(8);
        this.gridId = this._prefix + this.COMPONENT_ID;
        this.active = true;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession") ||
            changedProperties.has("toolId") ||
            changedProperties.has("organization") ||
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

    studyIdPropertyObserver() {
        // 1. Get users from the study
    }

    propertyObserver() {
        // With each property change we must be updated config and create the columns again. No extra checks are needed.
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };

        this.gridCommons = new GridCommons(this.gridId, this, this._config);

        // Config for the grid toolbar
        this.toolbarSetting = {
            ...this._config,
        };

        this.toolbarConfig = {
            toolId: this.toolId,
            resource: "USERS",
            columns: this._getDefaultColumns(),
            create: {
                display: {
                    modalTitle: "User Create",
                    modalDraggable: true,
                    modalCyDataName: "modal-create",
                    modalSize: "modal-lg"
                    // disabled: true,
                    // disabledTooltip: "...",
                },
                render: () => html `
                    <user-admin-create
                        .organization="${this.organization}"
                        .displayConfig="${{mode: "page", type: "form", buttonsLayout: "top"}}"
                        .opencgaSession="${this.opencgaSession}"
                        @userCreate="${e => this.onUserEvent(e)}">
                    </user-admin-create>`
            },
        };
    }

    renderTable() {
        if (this.users?.length > 0) {
            this.renderLocalTable();
        } else {
            this.renderRemoteTable();
        }
        this.requestUpdate();
    }

    renderRemoteTable() {
        if (this.opencgaSession?.opencgaClient && this.organization.id) {
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
                // Table properties
                pagination: this._config.pagination,
                pageSize: this._config.pageSize,
                pageList: this._config.pageList,
                paginationVAlign: "both",
                formatShowingRows: this.gridCommons.formatShowingRows,
                detailView: !!this.detailFormatter,
                loadingTemplate: () => GridCommons.loadingFormatter(),
                ajax: params => {
                    let result = null;
                    this.filters = {
                        organization: this.organization.id,
                        limit: params.data.limit,
                        skip: params.data.offset || 0,
                        count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                    };

                    // Store the current filters
                    this.opencgaSession.opencgaClient.users()
                        .search(this.filters)
                        .then(response => {
                            result = response;
                            return response;
                        })
                        .then(() => {
                            // Prepare data for columns extensions
                            const rows = result.responses?.[0]?.results || [];
                            return this.gridCommons.prepareDataForExtensions(this.COMPONENT_ID, this.opencgaSession, this.filters, rows);
                        })
                        .then(() => params.success(result))
                        .catch(error => {
                            console.error(error);
                            params.error(error);
                        });
                },
                responseHandler: response => {
                    const result = this.gridCommons.responseHandler(response, $(this.table).bootstrapTable("getOptions"));
                    return result.response;
                },
                onClickRow: (row, selectedElement) => this.gridCommons.onClickRow(row.id, row, selectedElement),
                onLoadSuccess: data => this.gridCommons.onLoadSuccess(data, 1),
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
            // Josemi Note 2024-01-18: we have added the ajax function for local variants also to support executing
            // async calls when getting additional data from columns extensions.
            ajax: params => {
                const tableOptions = $(this.table).bootstrapTable("getOptions");
                const limit = params.data.limit || tableOptions.pageSize;
                const skip = params.data.offset || 0;
                const rows = this.users.slice(skip, skip + limit);

                // Get data for extensions
                this.gridCommons.prepareDataForExtensions(this.COMPONENT_ID, this.opencgaSession, null, rows)
                    .then(() => params.success(rows))
                    .catch(error => params.error(error));
            },
            // Josemi Note 2024-01-18: we use this method to tell bootstrap-table how many rows we have in our data
            responseHandler: response => {
                return {
                    total: this.users.length,
                    rows: response,
                };
            },
            iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
            icons: GridCommons.GRID_ICONS,

            // Set table properties, these are read from config property
            uniqueId: "id",
            pagination: this._config.pagination,
            pageSize: this._config.pageSize,
            pageList: this._config.pageList,
            detailView: this._config.detailView,
            loadingTemplate: () => GridCommons.loadingFormatter(),
        });
    }

    async onActionClick(e, value, row) {
        const action = e.currentTarget.dataset.action;
        switch (action) {
            /*
            case "edit":
                this.userId = row.id;
                this.requestUpdate();
                await this.updateComplete;
                ModalUtils.show(`${this._prefix}UpdateModal`);
                break;
             */
            case "edit-details":
                this.userId = row.id;
                this.requestUpdate();
                await this.updateComplete;
                ModalUtils.show(`${this._prefix}UpdateDetailsModal`);
                break;
            case "change-password":
                this.userId = row.id;
                this.requestUpdate();
                await this.updateComplete;
                ModalUtils.show(`${this._prefix}ChangePasswordModal`);
                break;
            case "reset-password":
                this.userId = row.id;
                this.requestUpdate();
                await this.updateComplete;
                ModalUtils.show(`${this._prefix}ResetPasswordModal`);
                break;
            case "delete":
                this.userId = row.id;
                this.requestUpdate();
                await this.updateComplete;
                ModalUtils.show(`${this._prefix}DeleteModal`);
                break;
            default:
                break;
        }
    }

    _getDefaultColumns() {
        this._columns = [
            {
                title: "User ID",
                field: "id",
                visible: this.gridCommons.isColumnVisible("id")
            },
            {
                title: "Name",
                field: "name",
                visible: this.gridCommons.isColumnVisible("individualId")
            },
            {
                title: "Email",
                field: "email",
                visible: this.gridCommons.isColumnVisible("individualId")
            },
            {
                title: "Authentication",
                field: "account.authentication.id",
                visible: this.gridCommons.isColumnVisible("account.authentication.id")
            },
            {
                title: "Creation Date",
                field: "account.creationDate",
                formatter: CatalogGridFormatter.dateFormatter,
                visible: this.gridCommons.isColumnVisible("account.creationDate")
            },
            {
                title: "Expiration Date",
                field: "account.expirationDate",
                formatter: CatalogGridFormatter.dateFormatter,
                visible: this.gridCommons.isColumnVisible("account.expirationDate")
            },
        ];

        if (this._config.annotations?.length > 0) {
            this.gridCommons.addColumnsFromAnnotations(this._columns, CatalogGridFormatter.customAnnotationFormatter, this._config);
        }

        if (this.opencgaSession && this._config.showActions) {
            this._columns.push({
                id: "actions",
                title: "Actions",
                field: "actions",
                formatter: (value, row) => `
                    <!-- <div id="actions" class="d-flex justify-content-around">
                        <button data-action="delete" class="btn btn-outline-secondary disabled" style="border:0; border-radius: 50%">
                            <i class="far fa-trash-alt"></i>
                        </button>
                        <button data-action="disable" class="btn btn-outline-warning" style="border:0; border-radius: 50%">
                            <i class="fas fa-ban"></i>
                        </button>

                        <button data-action="edit" class="btn btn-outline-success" style="border:0; border-radius: 50%">
                            <i class="far fa-edit"></i>
                        </button>
                    </div> -->
                    <div class="dropdown">
                        <button class="btn btn-light btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            <i class="fas fa-toolbox" aria-hidden="true"></i>
                            <span>Actions</span>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                             <li>
                                <a data-action="edit-details" class="dropdown-item ${OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user.id) || "disabled" }">
                                    <i class="fas fa-edit" aria-hidden="true"></i> Edit Details ...
                                </a>
                            </li>
                            <li>
                                <a data-action="change-password" class="dropdown-item ${OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user.id) || "disabled" }">
                                    <i class="fas fa-edit" aria-hidden="true"></i> Change Password ...
                                </a>
                            </li>
                            <li>
                                <a data-action="reset-password" class="dropdown-item ${OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user.id) || "disabled" }">
                                    <i class="fas fa-edit" aria-hidden="true"></i> Reset Password ...
                                </a>
                            </li>
                            <li>
                                <a data-action="edit-permissions" class="dropdown-item ${OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user.id) || "disabled" }">
                                    <i class="fas fa-edit" aria-hidden="true"></i> Edit Permissions ...
                                </a>
                            </li>
                            <li>
                                <a data-action="disable" class="dropdown-item">
                                    <i class="fas fa-ban" aria-hidden="true"></i> Disable
                                </a>
                            </li>
                            <li>
                                <a data-action="disable" class="dropdown-item ">
                                    <i class="far fa-trash-alt" aria-hidden="true"></i> Delete
                                </a>
                            </li>
                        </ul>
                    </div>

                `,
                events: {
                    "click ul>li>a": (e, value, row) => this.onActionClick(e, value, row),
                },
            });
        }

        this._columns = this.gridCommons.addColumnsFromExtensions(this._columns, this.COMPONENT_ID);
        return this._columns;
    }

    /*
    renderModalUpdate() {
        return ModalUtils.create(this, `${this._prefix}UpdateModal`, {
            display: {
                modalTitle: `User Update: User ${this.userId} in organization ${this.organization.id}`,
                modalDraggable: true,
                modalCyDataName: "modal-update",
                modalSize: "modal-lg"
            },
            render: active => {
                return html`
                    <user-admin-update
                        .userId="${this.userId}"
                        .organization="${this.organization}"
                        .studyId="${this.studyId}"
                        .active="${active}"
                        .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "top"}}"
                        .opencgaSession="${this.opencgaSession}">
                    </user-admin-update>
                `;
            },
        });
    }
    */
    onUserEvent() {
        LitUtils.dispatchCustomEvent(this, "sessionUpdateRequest", {}, {}, null);
    }

    renderModalDetailsUpdate() {
        return ModalUtils.create(this, `${this._prefix}UpdateDetailsModal`, {
            display: {
                modalTitle: `Update Details: User ${this.userId} in organization ${this.organization.id}`,
                modalDraggable: true,
                modalCyDataName: "modal-details-update",
                modalSize: "modal-lg"
            },
            render: active => {
                return html`
                    <user-admin-details-update
                        .userId="${this.userId}"
                        .organization="${this.organization}"
                        .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                        .opencgaSession="${this.opencgaSession}"
                        @userUpdate="${e => this.onUserEvent(e)}">
                    </user-admin-details-update>
                `;
            },
        });
    }

    renderModalPasswordUpdate() {
        return ModalUtils.create(this, `${this._prefix}ChangePasswordModal`, {
            display: {
                modalTitle: `Change Password: User ${this.userId} in organization ${this.organization.id}`,
                modalDraggable: true,
                modalCyDataName: "modal-password-change",
                modalSize: "modal-lg"
            },
            render: active => {
                return html`
                    <user-admin-password-change
                        .userId="${this.userId}"
                        .organization="${this.organization}"
                        .active="${active}"
                        .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                        .opencgaSession="${this.opencgaSession}"
                        @userUpdate="${e => this.onUserEvent(e)}">
                    </user-admin-password-change>
                `;
            },
        });
    }

    renderModalPasswordReset() {
        return ModalUtils.create(this, `${this._prefix}ResetPasswordModal`, {
            display: {
                modalTitle: `Reset Password: User ${this.userId} in organization ${this.organization.id}`,
                modalDraggable: true,
                modalCyDataName: "modal-password-reset",
                modalSize: "modal-lg"
            },
            render: active => {
                debugger
                return html`
                    <user-admin-password-reset
                        .userId="${this.userId}"
                        .organization="${this.organization}"
                        .active="${active}"
                        .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                        .opencgaSession="${this.opencgaSession}"
                        @userUpdate="${e => this.onUserEvent(e)}">
                    </user-admin-password-reset>
                `;
            },
        });
    }

    renderModalDelete() {
        return ModalUtils.create(this, `${this._prefix}DeleteModal`, {
            display: {
                modalTitle: `Group Delete: ${this.groupId}`,
                modalDraggable: true,
                modalCyDataName: "modal-update",
                modalSize: "modal-lg"
            },
            render: active => html`
            <user-admin-delete
                .userId="${this.userId}"
                .studyId="${this.studyId}"
                .active="${active}"
                .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                .opencgaSession="${this.opencgaSession}"
                @userUpdate="${e => this.onUserEvent(e)}">
            </user-admin-delete>
        `,
        });
    }

    renderToolbar() {
        if (this._config.showToolbar) {
            return html `
                <opencb-grid-toolbar
                    .query="${this.filters}"
                    .opencgaSession="${this.opencgaSession}"
                    .settings="${this.toolbarSetting}"
                    .config="${this.toolbarConfig}"
                    @actionClick="${e => this.onActionClick(e)}">
                </opencb-grid-toolbar>
            `;
        }
    }

    render() {
        return html`
            <!-- 1. Render toolbar if enabled -->
            ${this.renderToolbar()}
            <!-- 2. Render grid -->
            <div id="${this._prefix}GridTableDiv" class="force-overflow" data-cy="sb-grid">
                <table id="${this.gridId}"></table>
            </div>
            <!-- 2. Render update -->
            <!-- $this.renderModalUpdate()}-->
            <!-- 2. Render update details -->
            ${this.renderModalDetailsUpdate()}
            <!-- 3. Render update password -->
            ${this.renderModalPasswordUpdate()}
            <!-- 4. Render reset password -->
            ${this.renderModalPasswordReset()}
            <!-- 4. Render delete -->
            ${this.renderModalDelete()}

        `;
    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 25],
            multiSelection: false,
            showSelectCheckbox: false,

            showToolbar: true,
            showActions: true,

            showCreate: true,
            showExport: false,
            showSettings: false,
            exportTabs: ["download", "link", "code"],
        };
    }

}

customElements.define("user-admin-grid", UserAdminGrid);
