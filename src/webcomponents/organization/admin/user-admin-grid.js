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
import NotificationUtils from "../../commons/utils/notification-utils";
import UtilsNew from "../../../core/utils-new.js";
import "./user-admin-create.js";
import "./user-admin-details-update.js";
import "./user-admin-status-update.js";
import "./user-admin-admins-change.js";

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
            resource: "USER",
            columns: this._getDefaultColumns(),
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
            },
            {
                id: "name",
                title: "Name",
                field: "name",
                visible: this.gridCommons.isColumnVisible("name"),
                formatter: (value, row) => this.userNameFormatter(value, row),
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
                field: "internal.account.authentication.id",
                visible: this.gridCommons.isColumnVisible("authentication")
            },
            {
                id: "failedAttempts",
                title: "Failed Attempts",
                field: "internal.account.failedAttempts",
                visible: this.gridCommons.isColumnVisible("failedAttempts"),
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
            {
                id: "actions",
                title: "",
                field: "actions",
                formatter: (value, row) => `
                    <div class="d-flex justify-content-end align-items-center">
                        <div class="dropdown d-flex justify-content-end">
                            <button class="btn" data-bs-toggle="dropdown">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <div class="dropdown-menu dropdown-menu-end">
                                <a data-action="edit-details" class="dropdown-item ${OpencgaCatalogUtils.isOrganizationAdmin(this.organization, this.opencgaSession.user.id) ? "cursor-pointer" : "disabled"}">
                                    <i class="fas fa-edit me-1"></i>
                                    <span>Edit Details</span>
                                </a>
                                <hr class="dropdown-divider">
                                <a data-action="reset-password" class="dropdown-item ${OpencgaCatalogUtils.isOrganizationAdmin(this.organization, this.opencgaSession.user.id) ? "cursor-pointer" : "disabled"}">
                                    <i class="fas fa-key me-1"></i>
                                    <span>Reset Password</span>
                                </a>
                                <hr class="dropdown-divider">
                                <a data-action="change-status" class="dropdown-item ${OpencgaCatalogUtils.isOrganizationAdmin(this.organization, this.opencgaSession.user.id) ? "cursor-pointer" : "disabled"}">
                                    <i class="fas fa-sign-in-alt me-1"></i>
                                    <span>Change Status</span>
                                </a>
                                <!--
                                <a data-action="change-admin" class="dropdown-item ${OpencgaCatalogUtils.isOrganizationAdmin(this.organization, this.opencgaSession.user.id) ? "cursor-pointer" : "disabled"}">
                                    <i class="fas fa-user-plus me-1"></i>
                                    <span>Add as Admin</span>
                                </a>
                                -->
                                <a data-action="change-admin"
                                   class="dropdown-item ${OpencgaCatalogUtils.isOrganizationAdmin(this.organization, this.opencgaSession.user.id) ? "" : "disabled"}}"
                                   style="cursor:pointer;">
                                   <div class="d-flex align-items-center">
                                        ${this.opencgaSession.organization.admins.includes(row.id) ? `
                                            <!-- If the user is admin, enable action REMOVE -->
                                            <div class="" style="margin-right: 10px"><i class="fas fa-user-minus" aria-hidden="true"></i></div>
                                            <div class="me-4">Remove as Admin...</div>
                                        ` : `
                                            <!-- If the user is admin, enable action ADD -->
                                            <div class="" style="margin-right: 10px"><i class="fas fa-user-plus" aria-hidden="true"></i></div>
                                            <div class="me-4">Add as Admin...</div>
                                        `}
                                   </div>
                                </a>
                                <hr class="dropdown-divider">
                                <a data-action="delete" class="dropdown-item disabled">
                                    <i class="fas fa-trash-alt me-1"></i>
                                    <span>Delete</span>
                                </a>
                            </div>
                        </div>
                    </div>
                `,
                events: {
                    "click a": (e, value, user) => this.onActionClick(e, value, user),
                },
                excludeFromSettings: true,
                visible: this._config.showActions, // this.gridCommons.isColumnVisible("actions"),
            },
        ];

        this._columns = this.gridCommons.addColumnsFromExtensions(this.COMPONENT_ID, this.opencgaSession, this._columns);
        return this._columns;
    }

    userNameFormatter(name, user) {
        // Note 20240620 vero: Viz and change owner will be implemented in following release
        // const organizationOwner = this.organization.owner;

        // Note 20250228 Vero: To review viz and implementation.
        // The organization owner is not included in the array of organization admins. Why not?

        const adminType = this.opencgaSession.organization.owner === user.id ? "OWNER"
            : this.opencgaSession.organization.admins.includes(user.id) ? "ORGANIZATION ADMIN"
            : "";

        return adminType ? `
            <div class="d-flex flex-column">
                <div>${name}</div>
                <div class="fs-8 text-muted">${adminType}</div>
            </div>
        ` : name;
    }

    datesFormatter(value, user) {
        const expirationDateString = UtilsNew.dateFormatter(user.internal.account.expirationDate);
        const expirationDate = new Date(expirationDateString);
        const currentDate = new Date();
        let expirationDateClass = null;
        if (currentDate > expirationDate) {
            expirationDateClass = "text-danger";
        }
        return `
            <div class="${expirationDateClass}">${expirationDateString}</div>
            <div class="text-body-secondary">${UtilsNew.dateFormatter(user.creationDate)}</div>
        `;
    }

    onActionClick(event, value, user) {
        const action = (event.currentTarget?.dataset?.action || "").toLowerCase();
        switch (action) {
            case "edit-details":
                this.userId = user.id;
                this.changeActiveActionModal("edit-details");
                break;
            case "reset-password":
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
                    display: {
                        okButtonText: "Reset Password",
                    },
                    title: `Reset Password: User <b>${user.id}</b> in organization ${this.opencgaSession.organization.id}`,
                    message: `
                        Are you sure you want to reset <b>${user.id}</b>'s password?
                        <br><br>
                        The user <b>${user.id}</b> will receive an email with a temporary password in the following email address:
                        <span class="text-muted">${user.email}</span>.
                    `,
                    ok: () => this.onUserPasswordReset(user),
                });
                break;
            case "change-status":
                this.userId = user.id;
                this.changeActiveActionModal("change-status");
                break;
            case "change-admin":
                this.userId = user.id;
                this.changeActiveActionModal("change-admin");
                break;
            case "delete":
                break;
        }
    }

    onUserPasswordReset(user) {
        this.opencgaSession.opencgaClient.organization()
            .resetUserPassword({
                userId: user.id,
            })
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: `User Reset Password`,
                    message: `User ${user.id} password reset correctly`,
                });
            })
            .catch(response => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            });
    }

    onUserUpdate() {
        this.changeActiveActionModal("");
        this.renderRemoteTable();
    }

    onUserCreate() {
        this.changeActiveActionModal("");
    }

    onCloseNotification() {
        this.userId = null;
        this.action = "";
        this.requestUpdate();
    }

    renderToolbarLeftContent() {
        return html`
            <span id="${this.gridId + "PaginationInfo"}"></span>
        `;
    }

    getRightToolbar() {
        return [
            {
                // className: this.permissions.WRITE ? "" : "disabled",
                icon: "fas fa-plus",
                title: "Create User",
                onClick: () => this.changeActiveActionModal("create"),
            }
        ];
    }

    renderActionModal() {
        let config = null;

        switch (this.activeActionModal) {
            case "create":
                config = {
                    display: {
                        modalTitle: "Create User",
                        modalDraggable: true,
                        modalCyDataName: "modal-create",
                        modalSize: "modal-lg"
                    },
                    render: () => html `
                        <user-admin-create
                            .organization="${this.organization}"
                            .displayConfig="${{mode: "page", type: "form", buttonsLayout: "top"}}"
                            .opencgaSession="${this.opencgaSession}"
                            @userCreate="${e => this.onUserCreate(e)}">
                        </user-admin-create>`
                };
                break;
            case "edit-details":
                config = {
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
                                @userUpdate="${e => this.onUserUpdate(e)}">
                            </user-admin-details-update>
                        `;
                    }
                };
                break;
            case "change-status":
                config = {
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
                            @userUpdate="${e => this.onUserUpdate(e)}">
                        </user-admin-status-update>
                    `,
                };
                break;
            case "change-admin":
                const isAdmin = this.opencgaSession.organization.admins.includes(this.userId);
                config = {
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
                            .action="${isAdmin ? "REMOVE" : "ADD"}"
                            .displayConfig="${{mode: "page", type: "form", buttonsLayout: "top", buttonClearText: ""}}"
                            .opencgaSession="${this.opencgaSession}"
                            @userUpdate="${e => this.onUserUpdate(e)}">
                        </user-admin-admins-change>
                    `,
                };
                break;
        }

        // render a modal with the provided configuration
        return config ? ModalUtils.create(this, `${this._prefix}Modal${this.activeActionModal}`, config) : nothing;
    }

    render() {
        return html`
            <!-- 1. Render toolbar if enabled -->
            <div class="mx-1 my-2">
                <opencb-grid-toolbar
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


            <!-- 2. Render grid -->
            <div id="${this._prefix}GridTableDiv" class="force-overflow" data-cy="sb-grid">
                <table id="${this.gridId}"></table>
            </div>

            <!-- 3. On action click, render update modal -->
            ${this.renderActionModal()}
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

            showCreate: false,
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
