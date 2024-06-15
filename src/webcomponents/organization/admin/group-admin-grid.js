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
import GridCommons from "../../commons/grid-commons";
import UtilsNew from "../../../core/utils-new";
import ModalUtils from "../../commons/modal/modal-utils";
import CatalogGridFormatter from "../../commons/catalog-grid-formatter";
import "./group-admin-create.js";
import "./group-admin-permissions-update.js";
import "./group-admin-delete.js";
import OpencgaCatalogUtils from "../../../core/clients/opencga/opencga-catalog-utils";

export default class GroupAdminGrid extends LitElement {

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
                type: Object,
            },
            groups: {
                type: Array,
            },
            studies: {
                type: Object,
            },
            config: {
                type: Object,
            },
            active: {
                type: Boolean,
            },
        };
    }

    #init() {
        this.COMPONENT_ID = "group-grid";
        this._prefix = UtilsNew.randomString(8);
        this.gridId = this._prefix + this.COMPONENT_ID;
        this.active = true;
        this._config = this.getDefaultConfig();
        this.action = "";
        this.studyFqn = "";
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession") ||
            changedProperties.has("groups") ||
            changedProperties.has("toolId") ||
            changedProperties.has("studies") ||
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
debugger
        this.gridCommons = new GridCommons(this.gridId, this, this._config);

        // Config for the grid toolbar
        this.toolbarSetting = {
            ...this._config,
        };

        this.toolbarConfig = {
            toolId: this.toolId,
            resource: "GROUPS",
            columns: this._getDefaultColumns(),
            create: {
                display: {
                    modalTitle: "Group Create",
                    modalDraggable: true,
                    modalCyDataName: "modal-create",
                    modalSize: "modal-lg"
                },
                render: () => {
                    return html `
                        <group-admin-create
                            .studies="${this.studies}"
                            .opencgaSession="${this.opencgaSession}"
                            .displayConfig="${{mode: "page", type: "form", buttonsLayout: "top"}}">
                        </group-admin-create>
                    `;
                }
            },
        };

        this.permissions = {
            "organization": () => OpencgaCatalogUtils.isOrganizationAdminOwner(this.organization, this.opencgaSession.user.id) || "disabled",
            "study": () => OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user.id) || "disabled",
        };

        this.modals = {
            /*
            "edit-details": {
                label: "Edit Details",
                icon: "fas fa-edit",
                modalId: `${this._prefix}UpdateDetailsModal`,
                render: () => this.renderModalDetailsUpdate(),
                permission: OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user.id) || "disabled",
            },
             */
            "edit-permissions": {
                label: "Edit Permissions",
                icon: "far fa-edit",
                color: "text-success",
                modalId: `${this._prefix}UpdatePermissionsModal`,
                render: () => this.renderModalPermissionsUpdate(),
                permission: OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user.id) || "disabled",
                divider: true,
            },
            "divider": {
                isDivider: true,
                divider: `<li><hr class="dropdown-divider"></li>`,
            },
            "delete": {
                label: "Delete",
                icon: "far fa-trash-alt ",
                color: "text-danger",
                modalId: `${this._prefix}DeleteModal`,
                render: () => this.renderModalDelete(),
                permission: OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user.id) || "disabled",
            },
        };

    }

    renderTable() {
        if (this.groups?.length > 0) {
            this.renderLocalTable();
        }
        this.requestUpdate();
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
                const rows = this.groups.slice(skip, skip + limit);

                // Get data for extensions
                this.gridCommons.prepareDataForExtensions(this.COMPONENT_ID, this.opencgaSession, null, rows)
                    .then(() => params.success(rows))
                    .catch(error => params.error(error));
            },
            // Josemi Note 2024-01-18: we use this method to tell bootstrap-table how many rows we have in our data
            responseHandler: response => {
                return {
                    total: this.groups.length,
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

    _getDefaultColumns() {
        this._columns = [
            {
                title: "Group ID",
                field: "id",
                visible: this.gridCommons.isColumnVisible("group.id")
            },
            {
                title: "Study ID",
                field: "studyId",
                visible: this.gridCommons.isColumnVisible("studyId")
            },
            {
                title: "Project ID",
                field: "projectId",
                visible: this.gridCommons.isColumnVisible("projectId")
            },
            {
                title: "No.Users",
                field: "users",
                formatter: (value, row) => this.groupNoUsersFormatter(value, row),
            },
            {
                title: "Users IDs",
                field: "users",
                formatter: (value, row) => this.groupUsersFormatter(value, row),
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
                            <i class="fas fa-toolbox me-2" aria-hidden="true"></i>
                            <span>Actions</span>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            ${
                                Object.keys(this.modals).map(modalKey => {
                                    const modal = this.modals[modalKey];
                                    return modal.isDivider ? modal.divider : `
                                        <li>
                                            <a data-action="${modalKey}"
                                            class="dropdown-item ${!modal.permission["study"]}"
                                            style="cursor:pointer;">
                                                <div class="d-flex align-items-center">
                                                    <div class="me-2"><i class="${modal.icon} ${modal.color}" aria-hidden="true"></i></div>
                                                    <div class="me-4">${modal.label}...</div>
                                                </div>
                                            </a>
                                        </li>
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

    groupNoUsersFormatter(value) {
        return `
            <span>${value.length}</span>
        `;
    }

    groupUsersFormatter(value) {
        return value.map(user => `
            <span>${user.id}</span>
        `);
    }

    // *** EVENTS ***
    /*
    async onActionClick(e, value, row) {
        const action = e.currentTarget.dataset.action;
        this.group = row.group;
        this.studyFqn = row.fqn;
        this.requestUpdate();
        await this.updateComplete;
        switch (action) {
            case "edit":
                ModalUtils.show(`${this._prefix}UpdateModal`);
                break;
            case "delete":
                ModalUtils.show(`${this._prefix}DeleteModal`);
                break;
            default:
                break;
        }
    }
    */
    async onActionClick(e, value, row) {
        this.action = e.currentTarget.dataset.action;
        this.group = row.group;
        this.studyFqn = row.fqn;
        this.requestUpdate();
        await this.updateComplete;
        ModalUtils.show(this.modals[this.action]["modalId"]);
    }

    onGroupEvent(e, id) {
        this.studyFqn = e.detail.studyFqn;
        ModalUtils.close(id);
    }

    // *** RENDER METHODS ***
    renderModalPermissionsUpdate() {
        return ModalUtils.create(this, `${this._prefix}UpdatePermissionsModal`, {
            display: {
                modalTitle: `Permissions Update: Group ${this.group?.id} in Study ${this.studyFqn}`,
                modalDraggable: true,
                modalCyDataName: "modal-update",
                modalSize: "modal-lg"
            },
            render: active => html`
                <group-admin-permissions-update
                    .groupId="${this.group?.id}"
                    .active="${active}"
                    .displayConfig="${{mode: "page", type: "form", buttonsLayout: "top"}}"
                    .opencgaSession="${this.opencgaSession}"
                    @groupUpdate="${e => this.onGroupEvent(e, `${this._prefix}UpdatePermissionsModal`)}">
                </group-admin-permissions-update>
            `,
        });
    }

    /*
    renderModalUpdate() {
        return ModalUtils.create(this, `${this._prefix}UpdateModal`, {
            display: {
                modalTitle: `Group Update: group ${this.group?.id} in study ${this.studyFqn}`,
                modalDraggable: true,
                modalCyDataName: "modal-update",
                modalSize: "modal-lg"
            },
            render: active => html`
                <group-admin-update
                    .groupId="${this.group?.id}"
                    .studyId="${this.studyId}"
                    .active="${active}"
                    .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                    .opencgaSession="${this.opencgaSession}">
                </group-admin-update>
            `,
        });
    }
    */

    renderModalDelete() {
        return ModalUtils.create(this, `${this._prefix}DeleteModal`, {
            display: {
                // modalTitle: `Group Delete: ${this.group?.id} in study ${this.studyFqn}`,
                modalTitle: `Are you sure you want to remove group '${this.group?.id}' in study '${this.studyFqn}'?`,
                modalDraggable: true,
                modalCyDataName: "modal-update",
                modalSize: "modal-lg"
            },
            render: active => html`
            <group-admin-delete
                .group="${this.group}"
                .studyFqn="${this.studyFqn}"
                .active="${active}"
                .displayConfig="${{mode: "page", type: "form", buttonsLayout: "bottom"}}"
                .opencgaSession="${this.opencgaSession}"
                @groupDelete="${e => this.onGroupEvent(e, `${this._prefix}DeleteModal`)}">
            </group-admin-delete>
        `,
        });
    }

    renderToolbar() {
        if (this._config.showToolbar) {
        // @groupCreate="${e => this.onGroupEvent(e, `${this._prefix}Modal`)}"
            return html `
                <opencb-grid-toolbar
                    .opencgaSession="${this.opencgaSession}"
                    .settings="${this.toolbarSetting}"
                    .config="${this.toolbarConfig}">
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
            ${this.action ? this.modals[this.action]["render"](): nothing}
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

customElements.define("group-admin-grid", GroupAdminGrid);
