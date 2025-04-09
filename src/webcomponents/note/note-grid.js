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
import {ifDefined} from "lit/directives/if-defined.js";
import UtilsNew from "../../core/utils-new.js";
import GridCommons from "../commons/grid-commons.js";
import CatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import LitUtils from "../commons/utils/lit-utils.js";
import "../commons/opencb-grid-toolbar.js";
import "./note-create.js";
import "./note-update.js";
import "./note-view.js";

export default class NoteGrid extends LitElement {

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
            notes: {
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
        this.COMPONENT_ID = "note-grid";
        this.RESOURCE = "NOTE";
        this.active = true;
        this._prefix = UtilsNew.randomString(8);
        this.gridId = this._prefix + this.COMPONENT_ID;
        this._selectedNode = null;
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

        // Config for the grid toolbar
        this.toolbarSetting = {
            ...this._config,
        };

        this.toolbarConfig = {
            toolId: this.toolId,
            resource: "NOTE",
            columns: this._getDefaultColumns(),
        };

        this.gridCommons.registerModals({
            "create-note": {
                display: {
                    modalTitle: "Create Note",
                    modalDraggable: true,
                    modalCyDataName: "note-create",
                    modalSize: "modal-lg",
                },
                render: () => html`
                    <note-create
                        .displayConfig="${{
                            type: "tabs",
                            buttonsLayout: "upper",
                        }}"
                        .opencgaSession="${this.opencgaSession}"
                        @noteCreate="${() => {
                            this.gridCommons.clearActiveModal();
                            this.table.bootstrapTable("refresh");
                        }}">
                    </note-create>
                `,
            },
            "update-note": () => ({
                display: {
                    modalTitle: `Update Note ${this._selectedNote?.id}`,
                    modalDraggable: true,
                    modalCyDataName: "note-update",
                    modalSize: "modal-lg"
                },
                render: active => html`
                    <note-update
                        .noteId="${this._selectedNote?.id}"
                        .noteScope="${this._selectedNote?.scope}"
                        .active="${active}"
                        .displayConfig="${{
                            type: "tabs",
                            buttonsLayout: "upper",
                        }}"
                        .opencgaSession="${this.opencgaSession}"
                        @noteUpdate="${() => {
                            this.gridCommons.clearActiveModal();
                            this.table.bootstrapTable("refresh");
                        }}">
                    </note-update>
                `,
            }),
            "view-note": () => ({
                display: {
                    modalTitle: `Note ${this._selectedNote?.id}`,
                    modalDraggable: true,
                    modalCyDataName: "note-view",
                    modalSize: "modal-lg"
                },
                render: active => html`
                    <note-view
                        .noteId="${this._selectedNote?.id}"
                        .noteScope="${this._selectedNote?.scope}"
                        .active="${active}"
                        .opencgaSession="${this.opencgaSession}">
                    </note-view>
                `,
            }),
        });
    }

    fetchNote(query) {
        const scope = query?.scope;
        switch (scope) {
            case "ORGANIZATION":
                return this.opencgaSession.opencgaClient.organization()
                    .searchNotes(query);
            case "STUDY":
            default:
                return this.opencgaSession.opencgaClient.studies()
                    .searchNotes(this.opencgaSession.study.fqn, query);
        }
    }

    renderTable() {
        // If this.notes is provided as property we render the array directly
        if (this.notes?.length > 0) {
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
                // Table properties
                pagination: this._config.pagination,
                pageSize: this._config.pageSize,
                pageList: this._config.pageList,
                paginationVAlign: "bottom",
                formatShowingRows: (pageFrom, pageTo, totalRows) => {
                    return this.gridCommons.formatShowingRows(pageFrom, pageTo, totalRows);
                },
                loadingTemplate: () => GridCommons.loadingFormatter(),
                ajax: params => {
                    let notesResponse = null;
                    this.filters = {
                        limit: params.data.limit,
                        skip: params.data.offset || 0,
                        // include: "id,scope,tags,userId,visibility,creationDate,modificationDate,valueType,uuid,version",
                        exclude: "value",
                        count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                        ...this.query
                    };
                    // remove study from query
                    const {study, ...filters} = this.filters;
                    // Store the current filters
                    this.lastFilters = {...this.filters};
                    this.fetchNote(filters)
                        .then(response => {
                            notesResponse = response;
                            // Prepare data for columns extensions
                            const rows = notesResponse?.responses?.[0]?.results || [];
                            return this.gridCommons.prepareDataForExtensions(this.COMPONENT_ID, this.opencgaSession, this.filters, rows);
                        })
                        .then(() => params.success(notesResponse))
                        .catch(error => {
                            console.error(error);
                            params.error(error);
                        })
                        .finally(() => {
                            LitUtils.dispatchCustomEvent(this, "queryComplete", null, {
                                response: notesResponse,
                            });
                        });
                },
                responseHandler: response => {
                    const result = this.gridCommons.responseHandler(response, $(this.table).bootstrapTable("getOptions"));
                    return result.response;
                },
                // onLoadSuccess: data => {
                //     this.gridCommons.onLoadSuccess(data, 1);
                // },
                onLoadError: (e, restResponse) => this.gridCommons.onLoadError(e, restResponse),
            });
        }
    }

    renderLocalTable() {
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            classes: "table table-borderless table-hover table-grid",
            buttonsClass: "light",
            columns: this._getDefaultColumns(),
            sidePagination: "server",
            // Josemi Note 2024-01-18: we have added the ajax function for local variants also to support executing async calls
            // when getting additional data from columns extensions.
            ajax: params => {
                const tableOptions = $(this.table).bootstrapTable("getOptions");
                const limit = params.data.limit || tableOptions.pageSize;
                const skip = params.data.offset || 0;
                const rows = this.notes.slice(skip, skip + limit);
                // Get data for extensions
                this.gridCommons.prepareDataForExtensions(this.COMPONENT_ID, this.opencgaSession, null, rows)
                    .then(() => params.success(rows))
                    .catch(error => params.error(error));
            },
            // Josemi Note 2024-01-18: we use this method to tell bootstrap-table how many rows we have in our data
            responseHandler: response => {
                return {
                    total: this.notes.length,
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
            paginationVAlign: "bottom",
            formatShowingRows: (pageFrom, pageTo, totalRows) => {
                return this.gridCommons.formatShowingRows(pageFrom, pageTo, totalRows);
            },
            loadingTemplate: () => GridCommons.loadingFormatter(),
            // onPostBody: data => {
            //     // We call onLoadSuccess to select first row
            //     this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 1);
            // }
        });
    }

    _getDefaultColumns() {
        this._columns = [
            {
                id: "id",
                title: "Note ID",
                field: "id",
                visible: this.gridCommons.isColumnVisible("id")
            },
            {
                id: "type",
                title: "Note Type",
                field: "type",
                visible: this.gridCommons.isColumnVisible("type"),
            },
            {
                id: "userId",
                title: "User ID",
                field: "userId",
                visible: this.gridCommons.isColumnVisible("userId")
            },
            {
                id: "scope",
                title: "Scope",
                field: "scope",
                visible: this.gridCommons.isColumnVisible("scope")
            },
            {
                id: "tags",
                title: "Tags",
                field: "tags",
                formatter: tags => {
                    return (tags || []).map(t => `<span class="badge rounded-pill text-bg-primary">${t}</span>`).join(" ") || "-";
                },
                visible: this.gridCommons.isColumnVisible("tags")
            },
            {
                id: "type",
                title: "Type",
                field: "valueType",
                visible: this.gridCommons.isColumnVisible("valueType")
            },
            {
                id: "visibility",
                title: "Visibility",
                field: "visibility",
                width: "5",
                widthUnit: "%",
                formatter: field => {
                    return `<i class="fas ${field === "PUBLIC" ? "fa-globe-americas" : "fa-lock"}"></i>`;
                },
                visible: this.gridCommons.isColumnVisible("visibility")
            },
            {
                id: "dates",
                title: "Modification / Creation Date",
                field: "Dates",
                halign: this.displayConfigDefault?.header?.horizontalAlign,
                valign: "middle",
                formatter: (field, note) => {
                    return `
                        <div class="fw-bold">${UtilsNew.dateFormatter(note.modificationDate)}</div>
                        <div class="text-body-secondary">${UtilsNew.dateFormatter(note.creationDate)}</div>
                    `;
                },
                visible: this.gridCommons.isColumnVisible("dates")
            },
        ];

        if (this.opencgaSession && this._config.showActions) {
            this._columns.push({
                id: "actions",
                align: "right",
                formatter: (value, row) => this.actionsFormatter(row),
                events: {
                    "click a": (event, value, row) => this.onActionClick(event, row),
                },
            });
        }
        this._columns = this.gridCommons.addColumnsFromExtensions(this.COMPONENT_ID, this.opencgaSession, this._columns);
        return this._columns;
    }

    actionsFormatter(row) {
        const user = this.opencgaSession?.user?.id;
        let hasAdminPermissions = false;
        // Case 1: user is an admin organization or owner. In this case, he has permission to perform any action
        // regardless the scope of the note
        if (CatalogUtils.isOrganizationAdmin(this.opencgaSession?.organization, user)) {
            hasAdminPermissions = true;
        } else {
            // If user is not an organization admin or owner, we will check the scope of the note
            // If the note has STUDY scope and the user is a study admin, he has permission to perform any action to this note
            if (row.scope === "STUDY" && CatalogUtils.isAdmin(this.opencgaSession?.study, user)) {
                hasAdminPermissions = true;
            }
        }
        return `
            <div class="d-inline-block dropdown">
                <button class="btn" type="button" data-bs-toggle="dropdown" data-cy="actions-button">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
                <div class="dropdown-menu dropdown-menu-end">
                    <a data-action="view" class="dropdown-item cursor-pointer">
                        <i class="fas fa-eye me-1"></i> View
                    </a>
                    <a data-action="copy-json" class="dropdown-item cursor-pointer">
                        <i class="fas fa-copy me-1" aria-hidden="true"></i> Copy JSON
                    </a>
                    <a data-action="download-json" class="dropdown-item cursor-pointer">
                        <i class="fas fa-download"></i> Download JSON
                    </a>
                    <hr class="dropdown-divider">
                    <a data-action="edit" class="dropdown-item ${hasAdminPermissions ? "cursor-pointer" : "disabled"}">
                        <i class="fas fa-edit me-1"></i> Edit
                    </a>
                    <a data-action="delete" class="dropdown-item ${hasAdminPermissions ? "cursor-pointer" : "disabled"}">
                        <i class="fas fa-trash me-1"></i> Delete
                    </a>
                </div>
            </div>
        `;
    }

    onDeleteNote(note) {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Delete Note",
            message: `Are you sure you want to delete note '${note.id}'? This action can not be undone.`,
            ok: () => {
                let deleteNotePromise = null;
                if (note.scope === "STUDY") {
                    deleteNotePromise = this.opencgaSession.opencgaClient.studies()
                        .deleteNotes(this.opencgaSession.study.fqn, note.id);
                } else {
                    deleteNotePromise = this.opencgaSession.opencgaClient.organization()
                        .deleteNotes(note.id);
                }
                deleteNotePromise
                    .then(() => {
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                            message: `Note '${note.id}' has been removed`,
                        });
                        // Force to render the table again
                        this.renderTable();
                    })
                    .catch(error => {
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
                    });
            },
        });
    }

    onActionClick(event, note) {
        const action = event.target?.dataset?.action?.toLowerCase() || event.detail.action;
        switch (action) {
            case "view":
                this._selectedNote = note;
                this.gridCommons.changeActiveModal("view-note");
                break;
            case "edit":
                this._selectedNote = note;
                this.gridCommons.changeActiveModal("update-note");
                break;
            case "copy-json":
                this.fetchNote({id: note.id, scope: note.scope})
                    .then(response => {
                        UtilsNew.copyToClipboard(JSON.stringify(response.responses[0].results[0], null, "\t"));
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                            message: "Note JSON copied to clipboard.",
                        });
                    })
                    .catch(error => {
                        console.error(error);
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
                    });
                break;
            case "download-json":
                this.fetchNote({id: note.id, scope: note.scope})
                    .then(response => {
                        UtilsNew.downloadData([JSON.stringify(response.responses[0].results[0], null, "\t")], note.id + ".json");
                    })
                    .catch(error => {
                        console.error(error);
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
                    });
                break;
            case "delete":
                this.onDeleteNote(note);
                break;
        }
    }

    getRightToolbar() {
        const isOrganizationAdmin = CatalogUtils.isOrganizationAdmin(this.opencgaSession?.organization, this.opencgaSession?.user?.id);
        const isStudyAdmin = CatalogUtils.isAdmin(this.opencgaSession?.study, this.opencgaSession?.user?.id);
        return [
            {
                icon: "fa-plus",
                title: "Create Note",
                disabled: !isOrganizationAdmin && !isStudyAdmin,
                onClick: () => this.gridCommons.changeActiveModal("create-note"),
            },
        ];
    }

    renderToolbarLeftContent() {
        return html`
            <span id="${this.gridId + "PaginationInfo"}"></span>
        `;
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
                    .config="${this.toolbarConfig}">
                </opencb-grid-toolbar>
            ` : nothing}

            <div id="${this._prefix}GridTableDiv" class="force-overflow">
                <table id="${ifDefined(this.gridId)}"></table>
            </div>

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
            showToolbar: true,
            showActions: true,

            showCreate: true,
            showExport: false,
            showSettings: true,
            exportTabs: ["download", "link", "code"],
        };
    }

}

customElements.define("note-grid", NoteGrid);
