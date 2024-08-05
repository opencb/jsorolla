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
import "./user-admin-details-update.js";
import "./user-admin-password-reset.js";
import "./user-admin-status-update.js";
import "./user-admin-admins-change.js";
// import "./user-admin-password-change.js";

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
        this.displayConfigDefault = {
            header: {
                horizontalAlign: "center",
                verticalAlign: "bottom",
            },
        };
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
            "organization": () => OpencgaCatalogUtils.isOrganizationAdmin(this.organization, this.opencgaSession.user.id) ? "" : "disabled",
            "study": () => OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user.id) ? "" : "disabled",
        };

        this.modals = {
            "edit-details": {
                label: "Edit Details",
                icon: "fas fa-edit",
                modalId: `${this._prefix}UpdateDetailsModal`,
                render: () => this.renderModalDetailsUpdate(),
                permission: this.permissions["organization"](),
                divider: true,
            },
            // ToDo 20240529 Vero: Nacho/Pedro to discuss:
            //  - Organization admin/owner can change usr pwd without entering current pwd
            /*
            "change-password": {
                label: "Change Password",
                icon: "fas fa-edit",
                modalId: `${this._prefix}ChangePasswordModal`,
                render: () => this.renderModalPasswordUpdate(),
                permission: OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user.id) || "disabled",
            },
             */
            "reset-password": {
                label: "Reset Password",
                icon: "fas fa-key",
                modalId: `${this._prefix}ResetPasswordModal`,
                render: () => this.renderModalPasswordReset(),
                permission: this.permissions["organization"](),
                divider: true,
            },
            "change-status": {
                label: "Change Status",
                icon: "fas fa-sign-in-alt",
                modalId: `${this._prefix}ChangeStatusModal`,
                render: () => this.renderModalStatusUpdate(),
                permission: this.permissions["organization"](),
            },
            "change-admin": {
                labelAdd: "Add as Admin",
                labelRemove: "Remove as Admin",
                iconAdd: "fas fa-user-plus",
                iconRemove: "fas fa-user-minus",
                modalId: `${this._prefix}ChangeAdminModal`,
                render: action => this.renderModalAdminChange(action),
                permission: this.permissions["organization"](),
                divider: true,
            },
            "delete": {
                label: "Delete User",
                icon: "fas fa-trash-alt ",
                color: "text-danger",
                // modalId: `${this._prefix}DeleteUserModal`,
                // render: () => this.renderModalDeleteUser(),
                permission: "disabled", // CAUTION: Not possible to delete users for now
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
                // formatShowingRows: this.gridCommons.formatShowingRows,
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
                id: "id",
                title: "User ID",
                field: "id",
                visible: this.gridCommons.isColumnVisible("id"),
                formatter: (value, row) => this.userIdFormatter(value, row),
            },
            {
                id: "name",
                title: "Name",
                field: "name",
                visible: this.gridCommons.isColumnVisible("name"),
            },
            {
                id: "email",
                title: "Email",
                field: "email",
                visible: this.gridCommons.isColumnVisible("email"),
            },
            {
                id: "authentication",
                title: "Authentication",
                field: "account.authentication.id",
                visible: this.gridCommons.isColumnVisible("authentication")
            },
            {
                id: "noAttempts",
                title: "Failed Attempts",
                field: "internal.failedAttempts",
                visible: this.gridCommons.isColumnVisible("noAttempts"),
            },
            {
                id: "status",
                title: "Status",
                field: "internal.status",
                formatter: value => CatalogGridFormatter.userStatusFormatter(value, this._config.userStatus),
                visible: this.gridCommons.isColumnVisible("status")
            },
            {
                id: "lastModifiedDate",
                title: "Last Modified Date",
                field: "internal.lastModified",
                formatter: (value, row) => UtilsNew.dateFormatter(row.internal.lastModified),
                visible: this.gridCommons.isColumnVisible("lastModifiedDate")
            },
            {
                id: "dates",
                title: "Expiration / Creation Dates",
                field: "dates",
                halign: this.displayConfigDefault.header.horizontalAlign,
                valign: "middle",
                formatter: (value, row) => this.datesFormatter(value, row),
                visible: this.gridCommons.isColumnVisible("dates")
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
                align: "center",
                formatter: (value, row) => `
                    <div class="dropdown">
                        <button class="btn btn-light btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            <i class="fas fa-toolbox me-2" aria-hidden="true"></i>
                            <span class="me-2">Actions</span>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            ${
                                Object.keys(this.modals).map(modalKey => {
                                    const modal = this.modals[modalKey];
                                    const color = modal.permission !== "disabled" ? modal.color : "";
                                    // If the action refers to modify the organization admins,
                                    // a conditional display needs to be managed.
                                    if (modalKey === "change-admin") {
                                        const isAdmin = this.organization.admins.includes(row.id);
                                        return `
                                            <li>
                                                <a data-action="${modalKey}"
                                                data-admin="${isAdmin ? `REMOVE` : `ADD`}"
                                                class="dropdown-item ${modal.permission}"
                                                style="cursor:pointer;">
                                                    <div class="d-flex align-items-center">
                                                        ${isAdmin ? `
                                                            <!-- If the user is admin, enable action REMOVE -->
                                                            <div class="" style="margin-right: 10px"><i class="${modal.iconRemove} ${color}" aria-hidden="true"></i></div>
                                                            <div class="me-4 ${color}" style="width: 84%">${modal.labelRemove}...</div>
                                                        ` : `
                                                            <!-- If the user is admin, enable action ADD -->
                                                            <div class="" style="margin-right: 10px"><i class="${modal.iconAdd} ${color}" aria-hidden="true"></i></div>
                                                            <div class="me-4 ${color}" style="width: 84%">${modal.labelAdd}...</div>
                                                        `}
                                                    </div>
                                                </a>
                                            </li>
                                            ${modal.divider ? `<li><hr class="dropdown-divider"></li>` : ""}
                                        `;
                                    }
                                    return `
                                        <li>
                                            <a data-action="${modalKey}"
                                            class="dropdown-item ${modal.permission}"
                                            style="cursor:pointer;">
                                                <div class="d-flex align-items-center">
                                                    <div class="" style="margin-right: 10px"><i class="${modal.icon} ${color}" aria-hidden="true"></i></div>
                                                    <div class="me-4 ${color}" style="width: 84%">${modal.label}...</div>
                                                </div>
                                            </a>
                                        </li>
                                        ${modal.divider ? `<li><hr class="dropdown-divider"></li>` : ""}
                                    `;
                                }).join("")
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

    userIdFormatter(value, user) {
        // Note 20240620 vero: Viz and change owner will be implemented in following release
        // const organizationOwner = this.organization.owner;
        return this.organization.admins.includes(user.id) ? `
                <div class="d-flex align-items-center">
                    <i class="fas fa-user-shield me-2"></i>
                     ${value}
                </div>
            ` : value;
    }

    datesFormatter(value, user) {
        const expirationDateString = UtilsNew.dateFormatter(user.account.expirationDate);
        const expirationDate = new Date(expirationDateString);
        const currentDate = new Date();
        let expirationDateClass = null;
        if (currentDate > expirationDate) {
            expirationDateClass = "text-danger";
        }
        return `
            <div class="${expirationDateClass}">${expirationDateString}</div>
            <div class="text-body-secondary">${UtilsNew.dateFormatter(user.account.creationDate)}</div>
        `;
    }

    // *** EVENTS ***
    async onActionClick(e, value, row) {
        this.action = e.currentTarget.dataset.action;
        this.userId = row.id;
        this.adminAction = e.currentTarget.dataset.admin ?? "";
        this.requestUpdate();
        await this.updateComplete;
        // NOTE 20240804 Vero: Since reset password does not need inputs, it has been decided that it should be
        // a notification instead of the regular update modal. Therefore, in this case, a modal is not created and
        // should not be shown.
        if (this.action !== "reset-password") {
            ModalUtils.show(this.modals[this.action]["modalId"]);
        }
    }

    onUserUpdate(e, id) {
        ModalUtils.close(id);
        this.renderRemoteTable();
    }

    onCloseNotification() {
        this.userId = null;
        this.action = "";
        this.requestUpdate();
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
                        .displayConfig="${{mode: "page", type: "form", buttonsLayout: "top"}}"
                        .opencgaSession="${this.opencgaSession}"
                        @userUpdate="${e => this.onUserUpdate(e, `${this._prefix}UpdateDetailsModal`)}">
                    </user-admin-details-update>
                `;
            },
        });
    }

    /*
    // Caution 20240616 Vero: Uncomment this code when endpoint fixed in OpenCGA for admin/owner change usr pwd
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
    */

    renderModalPasswordReset() {
        return html`
            <user-admin-password-reset
                .userId="${this.userId}"
                .opencgaSession="${this.opencgaSession}"
                @closeNotification="${e => this.onCloseNotification(e)}">
            </user-admin-password-reset>
        `;
    }

    renderModalStatusUpdate() {
        return ModalUtils.create(this, `${this._prefix}ChangeStatusModal`, {
            display: {
                modalTitle: `Update Status: User '${this.userId}' in organization '${this.organization.id}'`,
                modalDraggable: true,
                modalCyDataName: "modal-user-admin-status-update",
                modalSize: "modal-lg"
            },
            render: () => html`
                <user-admin-status-update
                    .userId="${this.userId}"
                    .organization="${this.organization}"
                    .displayConfig="${{mode: "page", type: "form", buttonsLayout: "top", userStatus: this._config.userStatus}}"
                    .opencgaSession="${this.opencgaSession}"
                    @userUpdate="${e => this.onUserUpdate(e, `${this._prefix}ChangeStatusModal`)}">
                </user-admin-status-update>
            `,
        });
    }

    renderModalAdminChange(action) {
        return ModalUtils.create(this, `${this._prefix}ChangeAdminModal`, {
            display: {
                modalTitle: `Update Organization Admins: User ${this.userId} in organization ${this.organization.id}`,
                modalDraggable: true,
                modalCyDataName: "modal-user-admin-admin-set",
                modalSize: "modal-lg"
            },
            render: () => html`
                <user-admin-admins-change
                    .userId="${this.userId}"
                    .organization="${this.organization}"
                    .action="${action}"
                    .displayConfig="${{mode: "page", type: "form", buttonsLayout: "top", buttonClearText: ""}}"
                    .opencgaSession="${this.opencgaSession}"
                    @userUpdate="${e => this.onUserUpdate(e, `${this._prefix}ChangeAdminModal`)}">
                </user-admin-admins-change>
            `,
        });
    }

    renderToolbar() {
        if (this._config.showToolbar) {
            return html `
                <opencb-grid-toolbar
                    .opencgaSession="${this.opencgaSession}"
                    .settings="${this.toolbarSetting}"
                    .config="${this.toolbarConfig}"
                    @userCreate="${e => this.renderRemoteTable(e)}">
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
            ${this.action ? this.modals[this.action]["render"](this.adminAction || null) : nothing}
        `;
    }

    // *** DEFAULT CONFIG ***
    getDefaultConfig() {
        return {
            // Settings
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
            // Config
            userStatus: [
                {
                    id: "READY",
                    displayLabel: "ACTIVE", // Fixme: ACTIVE | ENABLED | READY?
                    displayColor: "#16A83C",
                    displayOutline: "btn-outline-success",
                    description: "The user can login",
                    isSelectable: true, // Choice selectable by org admin/owner
                    isEnabled: true, // Choice visible by org admin/owner
                },
                {
                    id: "SUSPENDED",
                    displayLabel: "SUSPENDED",
                    displayColor: "#E1351E",
                    displayOutline: "btn-outline-danger",
                    description: "The user can not login into the system",
                    isSelectable: true,
                    isEnabled: true,
                },
                {
                    id: "BANNED",
                    displayLabel: "BANNED",
                    displayColor: "#E17F1E",
                    description: "User locked for more than allowed login attempts. The admin/owner can enable the user back.",
                    isSelectable: false,
                    isEnabled: true,
                },
                {
                    id: "UNDEFINED",
                    displayLabel: "-",
                    displayColor: "#E1E2E5",
                    description: "The user status is unknown",
                    isSelectable: false,
                    isEnabled: false,
                },
            ],

        };
    }

}

customElements.define("user-admin-grid", UserAdminGrid);
