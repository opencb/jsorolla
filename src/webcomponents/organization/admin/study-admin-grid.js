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

import "../../study/admin/study-create.js";
import "../../study/admin/study-update.js";
import "./study-users-manage.js";

export default class StudyAdminGrid extends LitElement {

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
            project: {
                type: Object,
            },
            organization: {
                type: Object,
            },
            opencgaSession: {
                type: Object
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
        this.COMPONENT_ID = "study-grid";
        this._prefix = UtilsNew.randomString(8);
        this.gridId = this._prefix + this.COMPONENT_ID;
        this.active = true;
        this._config = this.getDefaultConfig();
        this._action = "";
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
            changedProperties.has("project") ||
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
            resource: "STUDIES",
            columns: this._getDefaultColumns(),
            create: {
                display: {
                    modalTitle: "Study Create",
                    modalDraggable: true,
                    modalCyDataName: "modal-study-create",
                    modalSize: "modal-lg"
                },
                render: () => html `
                    <study-create
                        .project=${this.project}
                        .opencgaSession="${this.opencgaSession}"
                        .displayConfig="${{mode: "page", type: "form", buttonsLayout: "top"}}"
                        @studyCreate="${e => this.onStudyEvent(e)}">
                    </study-create>
                `,
            },
        };

        this.permissions = {
            "organization": () => OpencgaCatalogUtils.isOrganizationAdminOwner(this.organization, this.opencgaSession.user.id) ? "" : "disabled",
            "study": () => OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user.id) ? "" : "disabled",
        };

        this.modals = {
            "edit-study": {
                label: "Edit Study",
                icon: "fas fa-edit",
                modalId: `${this._prefix}UpdateStudyModal`,
                render: () => this.renderStudyUpdate(),
                permission: this.permissions["organization"](),
                divider: true,
            },
            "create-group": {
                label: "Create Group",
                icon: "fas fa-edit",
                modalId: `${this._prefix}CreateGroupModal`,
                render: () => this.renderGroupCreate(),
                permission: this.permissions["organization"](),
                divider: false,
            },
            "manage-users": {
                label: "Manage Organization Users in Study",
                icon: "fas fa-user-plus",
                modalId: `${this._prefix}ManageUsersStudyModal`,
                render: () => this.renderManageUsersStudy(),
                permission: this.permissions["organization"](),
                divider: true,
            },
            "delete": {
                label: "Delete Study",
                icon: "fas fa-trash-alt ",
                // color: "text-danger",
                // modalId: `${this._prefix}DeleteModal`,
                // render: () => this.renderModalPasswordReset(),
                permission: "disabled", // Caution: Not possible to delete studies for now.
            },
        };
    }

    // *** PRIVATE METHODS ***
    renderRemoteTable() {
        if (this.opencgaSession?.opencgaClient && this.project.id) {
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
                detailView: !!this.detailFormatter,
                loadingTemplate: () => GridCommons.loadingFormatter(),
                ajax: params => {
                    let result = null;
                    this.filters = {
                        limit: params.data.limit,
                        skip: params.data.offset || 0,
                        count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                    };

                    // Store the current filters
                    this.opencgaSession.opencgaClient.projects()
                        .studies(this.project.id, this.filters)
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
                onLoadSuccess: () => UtilsNew.initTooltip(this),
                onLoadError: (e, restResponse) => this.gridCommons.onLoadError(e, restResponse),
            });
        }
    }

    _getDefaultColumns() {
        this._columns = [
            {
                title: "Study ID",
                field: "id",
                visible: this.gridCommons.isColumnVisible("id")
            },
            {
                title: "Study Fqn",
                field: "fqn",
                visible: this.gridCommons.isColumnVisible("fqn")
            },
            {
                title: "Name",
                field: "name",
                visible: this.gridCommons.isColumnVisible("name")
            },
            {
                title: "Groups",
                field: "groups",
                formatter: (groups, row) => this.groupsFormatter(groups, row),
                visible: this.gridCommons.isColumnVisible("modificationDate")
            },
            {
                title: "Modification / Creation Dates",
                field: "dates",
                halign: this.displayConfigDefault.header.horizontalAlign,
                valign: "middle",
                formatter: (value, row) => this.datesFormatter(value, row),
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
                                    return `
                                        <li>
                                            <a data-action="${modalKey}"
                                            class="dropdown-item ${modal.permission}"
                                            style="cursor:pointer;">
                                                <div class="d-flex align-items-center">
                                                    <div class="me-2"><i class="${modal.icon} ${modal.color}" aria-hidden="true"></i></div>
                                                    <div class="me-4 ${modal.color}">${modal.label}...</div>
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

    // *** FORMATTERS ***
    groupsFormatter(groups) {
        const groupsBadges = groups.map(group => `
            <div class="d-flex flex-column mb-1">
                <div>${group.id}  [${group.userIds.length}]</div>
                <small class="text-muted">${group.userIds.join(", ")}</small>
            </div>
        `);

        const maxShow = 3;
        const badgesShow = groupsBadges.splice(0, maxShow);
        return `
            <div class="d-flex flex-column align-items-start justify-content-center">
                ${badgesShow.join("")}
                ${groupsBadges.length > 0 ? `
                    <a tooltip-title="GROUPS" tooltip-text='${groupsBadges.join("<br>")}'>
                        ... View all groups (${groupsBadges.length})
                    </a>
                ` : ""}
            </div>
        `;
    }

    datesFormatter(value, study) {
        return `
            <div class="text-body-secondary">${CatalogGridFormatter.dateFormatter(study.modificationDate, study)}</div>
            <div class="">${CatalogGridFormatter.dateFormatter(study.creationDate, study)}</div>
        `;
    }

    // *** EVENTS ***
    async onActionClick(e, value, row) {
        this._action = e.currentTarget.dataset.action;
        this.studyId = row.id;
        this.studyFqn = row.fqn;
        if (this._action === "manage-users") {
            // Manage organization users: (a) add/remove from study, (b) set/unset as study admins
            this.groups = row.groups.filter(group => ["@members", "@admins"].includes(group.id));
        }
        this.requestUpdate();
        await this.updateComplete;
        ModalUtils.show(this.modals[this._action]["modalId"]);
    }

    onStudyEvent(e, id) {
        // Fixme 20240616 Vero: find out a way to close modal creates!
        this._action = "";
        ModalUtils.close(id);
    }

    // *** RENDER METHODS ***
    renderGroupCreate() {
        return ModalUtils.create(this, `${this._prefix}CreateGroupModal`, {
            display: {
                modalTitle: `Group Create in Study: ${this.studyId}`,
                modalDraggable: true,
                modalCyDataName: "modal-group-create",
                modalSize: "modal-lg"
            },
            render: () => html`
                <group-admin-create
                    .studyFqn="${this.studyFqn}"
                    .opencgaSession="${this.opencgaSession}"
                    .displayConfig="${{mode: "page", type: "form", buttonsLayout: "top"}}"
                    @groupCreate="${e => this.onStudyEvent(e, `${this._prefix}CreateGroupModal`)}">
                </group-admin-create>
            `,
        });
    }

    renderStudyUpdate() {
        return ModalUtils.create(this, `${this._prefix}UpdateStudyModal`, {
            display: {
                modalTitle: `Update Study: ${this.studyId}`,
                modalDraggable: true,
                modalCyDataName: "modal-study-update",
                modalSize: "modal-lg"
            },
            render: () => html`
                <study-update
                    .studyFqn="${this.studyFqn}"
                    .displayConfig="${{mode: "page", type: "form", buttonsLayout: "top"}}"
                    .opencgaSession="${this.opencgaSession}"
                    @studyUpdate="${e => this.onStudyEvent(e, `${this._prefix}UpdateStudyModal`)}">
                </study-update>
            `,
        });
    }

    renderManageUsersStudy() {
        return ModalUtils.create(this, `${this._prefix}ManageUsersStudyModal`, {
            display: {
                modalTitle: `Manage Organization Users in Study: ${this.studyId}`,
                modalDraggable: true,
                modalCyDataName: "modal-users-study-update",
                modalSize: "modal-lg"
            },
            render: () => {
                return html`
                    <study-users-manage
                        .studyFqn="${this.studyFqn}"
                        .groups="${this.groups}"
                        .opencgaSession="${this.opencgaSession}"
                        .displayConfig="${{mode: "page", type: "form", buttonsLayout: "top"}}"
                        @studyUpdate="${e => this.onStudyEvent(e, `${this._prefix}ManageUsersStudyModal`)}">
                    </study-users-manage>
                `;
            }
        });
    }

    renderToolbar() {
        if (this._config.showToolbar) {
            return html `
                <opencb-grid-toolbar
                    .query="${this.filters}"
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
            ${this._action ? this.modals[this._action]["render"](): nothing}
        `;
    }

    // *** DEFAULT CONFIG ***
    getDefaultConfig() {
        return {
            // Settings
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 25],
            pageInfoShort: true,
            multiSelection: false,
            showSelectCheckbox: false,

            showToolbar: true,
            showActions: true,

            buttonCreateText: "New Study...",
            showCreate: true,
            showExport: false,
            showSettings: false,
            exportTabs: ["download", "link", "code"],
        };
    }

}

customElements.define("study-admin-grid", StudyAdminGrid);
