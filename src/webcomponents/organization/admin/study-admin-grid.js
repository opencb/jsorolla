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

        this._activeActionModal = "";
        this._studyId = null;
        this._studyFqn = null;
        this._groups = null;
        this._config = this.getDefaultConfig();
    }

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
    }

    changeActiveActionModal(actionModal) {
        // 1. check if there is a modal rendered
        if (this._activeActionModal) {
            ModalUtils.close(`${this._prefix}Modal${this._activeActionModal}`);
        }

        // 2. set the new active action modal
        this._activeActionModal = actionModal;
        this.requestUpdate();

        // 3. show the new active action modal (if provided)
        this.updateComplete.then(() => {
            if (this._activeActionModal) {
                ModalUtils.show(`${this._prefix}Modal${this._activeActionModal}`);
            }
        });
    }

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
                formatter: () => {
                    const isOrganizationAdmin = OpencgaCatalogUtils.isOrganizationAdmin(this.opencgaSession.organization, this.opencgaSession.user.id);
                    return `
                        <div class="dropdown">
                            <button class="btn btn-light btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                <i class="fas fa-toolbox me-2"></i>
                                <span>Actions</span>
                            </button>
                            <div class="dropdown-menu dropdown-menu-end">
                                <a data-action="edit" class="dropdown-item ${isOrganizationAdmin ? "cursor-pointer" : "disabled"}">
                                    <i class="fas fa-edit me-1"></i> Edit Study
                                </a>
                                <hr class="dropdown-divider"></li>
                                <a data-action="create-group" class="dropdown-item ${isOrganizationAdmin ? "cursor-pointer" : "disabled"}">
                                    <i class="fas fa-edit me-1"></i> Create Group
                                </a>
                                <a data-action="manage-users" class="dropdown-item ${isOrganizationAdmin ? "cursor-pointer" : "disabled"}">
                                    <i class="fas fa-user-plus me-1"></i> Manage Organization Users in Study
                                </a>
                                <hr class="dropdown-divider"></li>
                                <a data-action="delete" class="dropdown-item disabled">
                                    <i class="fas fa-trash-alt me-1"></i> Delete Study
                                </a>
                            </div>
                        </div>
                    `;
                },
                events: {
                    "click a": (e, value, row) => this.onActionClick(e, value, row),
                },
            });
        }

        this._columns = this.gridCommons.addColumnsFromExtensions(this.COMPONENT_ID, this.opencgaSession, this._columns);
        return this._columns;
    }

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
            <div class="">${CatalogGridFormatter.dateFormatter(study.modificationDate, study)}</div>
            <div class="text-body-secondary">${CatalogGridFormatter.dateFormatter(study.creationDate, study)}</div>
        `;
    }

    async onActionClick(event, value, row) {
        const action = (event.currentTarget?.dataset?.action || "").toLowerCase();
        this._studyId = row.id;
        this._studyFqn = row.fqn;

        switch (action) {
            case "edit":
                this.changeActiveActionModal("study-edit");
                break;
            case "create-group":
                this.changeActiveActionModal("create-group");
                break;
            case "manage-users":
                this._groups = row.groups.filter(group => {
                    return ["@members", "@admins"].includes(group.id);
                });
                this.changeActiveActionModal("manage-users");
                break;
        }
    }

    renderActionModal() {
        let config = null;

        switch (this._activeActionModal) {
            case "study-create":
                config = {
                    display: {
                        modalTitle: "Create Study",
                        modalSize: "modal-lg",
                    },
                    render: () => html `
                        <study-create
                            .project=${this.project}
                            .opencgaSession="${this.opencgaSession}"
                            .displayConfig="${{
                                buttonsLayout: "bottom",
                            }}"
                            @studyCreate="${() => this.changeActiveActionModal("")}">
                        </study-create>
                    `,
                };
                break;
            case "study-edit":
                config = {
                    display: {
                        modalTitle: `Update Study ${this._studyId}`,
                        modalSize: "modal-lg",
                    },
                    render: () => html`
                        <study-update
                            .studyFqn="${this._studyFqn}"
                            .displayConfig="${{
                                buttonsLayout: "bottom",
                            }}"
                            .opencgaSession="${this.opencgaSession}"
                            @studyUpdate="${() => this.changeActiveActionModal("")}">
                        </study-update>
                    `,
                };
                break;
            case "create-group":
                config = {
                    display: {
                        modalTitle: `Create Group in Study ${this._studyId}`,
                        modalSize: "modal-lg",
                    },
                    render: () => html`
                        <group-admin-create
                            .studyFqn="${this._studyFqn}"
                            .opencgaSession="${this.opencgaSession}"
                            .displayConfig="${{
                                buttonsLayout: "bottom",
                            }}"
                            @groupCreate="${() => this.changeActiveActionModal("")}">
                        </group-admin-create>
                    `,
                };
                break;
            case "manage-users":
                config = {
                    display: {
                        modalTitle: `Manage Users in Study ${this._studyId}`,
                        modalDraggable: true,
                        modalCyDataName: "modal-users-study-update",
                        modalSize: "modal-lg"
                    },
                    render: () => html`
                        <study-users-manage
                            .studyFqn="${this._studyFqn}"
                            .groups="${this._groups}"
                            .opencgaSession="${this.opencgaSession}"
                            .displayConfig="${{
                                buttonsLayout: "bottom",
                            }}"
                            @studyUpdate="${() => this.changeActiveActionModal("")}">
                        </study-users-manage>
                    `,
                };
                break;
        }
        return config ? ModalUtils.create(this, `${this._prefix}Modal${this._activeActionModal}`, config) : nothing;
    }

    render() {
        // check if the user is organization admin, so he can create new studies on this project
        const isOrganizationAdmin = OpencgaCatalogUtils.isOrganizationAdmin(this.opencgaSession.organization, this.opencgaSession.user.id);

        return html`
            <!-- 1. Render toolbar if enabled -->
            ${this._config.showToolbar ? html`
                <div class="d-flex justify-content-end mb-3">
                    <button class="btn btn-light ${isOrganizationAdmin ? "" : "disabled"}" @click="${() => this.changeActiveActionModal("study-create")}">
                        <i class="fas fa-plus me-1"></i>
                        <span>${this._config.buttonCreateText}</span>
                    </button>
                </div>
            ` : nothing}

            <!-- 2. Render grid -->
            <div id="${this._prefix}GridTableDiv" class="force-overflow" data-cy="sb-grid">
                <table id="${this.gridId}"></table>
            </div>

            <!-- 3. Render action modal -->
            ${this.renderActionModal()}
        `;
    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 25],
            pageInfoShort: true,
            multiSelection: false,
            showSelectCheckbox: false,

            showToolbar: true,
            showActions: true,

            buttonCreateText: "Create Study",
            showCreate: true,
            showExport: false,
            showSettings: false,
            exportTabs: ["download", "link", "code"],
        };
    }

}

customElements.define("study-admin-grid", StudyAdminGrid);
