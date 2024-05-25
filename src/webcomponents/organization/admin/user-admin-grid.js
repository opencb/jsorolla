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
import CatalogGridFormatter from "../../commons/catalog-grid-formatter.js";
import OpencgaCatalogUtils from "../../../core/clients/opencga/opencga-catalog-utils.js";
import ModalUtils from "../../commons/modal/modal-utils.js";
import UtilsNew from "../../../core/utils-new.js";

import "./user-admin-create.js";
import "./user-admin-update.js";
import "./user-admin-details-update.js";
import "./user-admin-password-change.js";
import "./user-admin-password-reset.js";

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
        this.action = "";
    }

    // --- LIFE-CYCLE METHODS
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
            this.renderRemoteTable();
        }
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
                        @userCreate="${e => this.renderRemoteTable(e)}">
                    </user-admin-create>`
            },
        };

        this.permissions = {
            "organization": () => OpencgaCatalogUtils.isOrganizationAdminOwner(this.organization, this.opencgaSession.user.id) || "disabled",
            "study": () => OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user.id) || "disabled",
        };

        this.manageModal = {
            "edit-details": {
                label: "Edit Details",
                icon: "fas fa-edit",
                modalId: `${this._prefix}UpdateDetailsModal`,
                render: () => this.renderModalDetailsUpdate(),
                permission: OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user.id) || "disabled",
            },
            "change-password": {
                label: "Change Password",
                icon: "fas fa-edit",
                modalId: `${this._prefix}ChangePasswordModal`,
                render: () => this.renderModalPasswordUpdate(),
                permission: OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user.id) || "disabled",
            },
            "reset-password": {
                label: "Reset Password",
                icon: "fas fa-ban",
                modalId: `${this._prefix}ResetPasswordModal`,
                render: () => this.renderModalPasswordReset(),
                permission: OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user.id) || "disabled",
            },
            "delete": {
                label: "Delete",
                icon: "far fa-trash-alt ",
                // modalId: `${this._prefix}DeleteModal`,
                // render: () => this.renderModalPasswordReset(),
                permission: "disabled",
            },
        };
    }

    // *** PRIVATE METHODS ***
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
                formatter: () => `
                    <div class="dropdown">
                        <button class="btn btn-light btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            <i class="fas fa-toolbox" aria-hidden="true"></i>
                            <span>Actions</span>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            ${
                    Object.keys(this.manageModal).map(modalKey => {
                        const modal = this.manageModal[modalKey];
                        return `
                                        <li>
                                            <a data-action="${modalKey}" class="dropdown-item ${modal.permission["organization"]}">
                                                    <i class="${modal.icon}" aria-hidden="true"></i> ${modal.label}...
                                            </a>
                                        </li>
                                    `;
                    })
                }
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

    // *** EVENTS ***
    async onActionClick(e, value, row) {
        this.action = e.currentTarget.dataset.action;
        this.userId = row.id;
        this.requestUpdate();
        await this.updateComplete;
        ModalUtils.show(this.manageModal[this.action]["modalId"]);
    }

    onUserUpdate(e, id) {
        ModalUtils.close(id);
        this.renderRemoteTable();
    }

    // *** RENDER METHODS ***
    renderModalDetailsUpdate() {
        return ModalUtils.create(this, `${this._prefix}UpdateDetailsModal`, {
            display: {
                modalTitle: `Update Details: User ${this.userId} in organization ${this.organization.id}`,
                modalDraggable: true,
                modalCyDataName: "modal-details-update",
                modalSize: "modal-lg"
            },
            render: () => {
                return html`
                    <user-admin-details-update
                        .userId="${this.userId}"
                        .organization="${this.organization}"
                        .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                        .opencgaSession="${this.opencgaSession}"
                        @userUpdate="${e => this.onUserUpdate(e, `${this._prefix}UpdateDetailsModal`)}">
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
            render: () => {
                return html`
                    <user-admin-password-change
                        .userId="${this.userId}"
                        .organization="${this.organization}"
                        .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                        .opencgaSession="${this.opencgaSession}"
                        @userUpdate="${e => this.onUserUpdate(e, `${this._prefix}ChangePasswordModal`)}">
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
            render: () => {
                return html`
                    <user-admin-password-reset
                        .userId="${this.userId}"
                        .organization="${this.organization}"
                        .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                        .opencgaSession="${this.opencgaSession}"
                        @userUpdate="${e => this.onUserUpdate(e, `${this._prefix}ResetPasswordModal`)}">
                    </user-admin-password-reset>
                `;
            },
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
                    @userUpdate="${e => this.renderRemoteTable(e)}">
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
            <!-- 3. On action click, render update modal -->
            ${this.action ? this.manageModal[this.action]["render"](): nothing}
        `;
    }

    // *** DEFAULT CONFIG ***
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
