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
import ModalUtils from "../commons/modal/modal-utils.js";
import "../commons/opencb-grid-toolbar.js";
import "./note-create.js";
import "./note-update.js";

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

        // Config for the grid toolbar
        this.toolbarSetting = {
            ...this._config,
        };

        this.toolbarConfig = {
            toolId: this.toolId,
            resource: "NOTE",
            columns: this._getDefaultColumns(),
            create: {
                display: {
                    modalTitle: "Note Create",
                    modalDraggable: true,
                    modalCyDataName: "modal-create",
                    modalSize: "modal-lg"
                },
                render: () => html`
                    <note-create
                        .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                        .opencgaSession="${this.opencgaSession}">
                    </note-create>
                `,
            },
        };
    }

    fetchNotes(query) {
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
                gridContext: this,
                loadingTemplate: () => GridCommons.loadingFormatter(),
                ajax: params => {
                    let notesResponse = null;
                    this.filters = {
                        limit: params.data.limit,
                        skip: params.data.offset || 0,
                        // include: "id,scope,tags,userId,visibility,creationDate,modificationDate,valueType,uuid,version",
                        exclude: "studyUid,uid",
                        count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                        ...this.query
                    };
                    // remove study from query
                    const {study, ...filters} = this.filters;
                    // Store the current filters
                    this.lastFilters = {...this.filters};
                    this.fetchNotes(filters)
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
            // data: this.notes,
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
            detailView: this._config.detailView,
            gridContext: this,
            loadingTemplate: () => GridCommons.loadingFormatter(),
            onClickRow: (row, selectedElement) => this.gridCommons.onClickRow(row.id, row, selectedElement),
            onPostBody: data => {
                // We call onLoadSuccess to select first row
                this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 1);
            }
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
                    if (tags?.length == 0) {
                        return "-";
                    }

                    if (tags?.length > 5) {
                        const fiveTags = tags.slice(-4);
                        const restTags = tags.slice(5);
                        let contentHtml = fiveTags.map(tag => String.raw`

                                <span class="badge rounded-pill text-bg-primary">${tag}</span>

                        `).join("");
                        contentHtml += `<a tooltip-title="Files" tooltip-text='${restTags.join("")}'>... view all tags (${restTags.length})</a>`;
                        return contentHtml;
                    } else {
                        return tags.map(tag => String.raw`
                            <span class="badge rounded-pill text-bg-primary">${tag}</span>
                        `).join("");
                    }

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
                align: "center",
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
                title: "Actions",
                field: "actions",
                align: "center",
                formatter: (value, row) => this.actionsFormatter(value, row),
                events: {
                    "click a": this.onActionClick.bind(this),
                },
                // visible: !this._config.columns?.hidden?.includes("actions")
            });
        }
        this._columns = this.gridCommons.addColumnsFromExtensions(this._columns, this.COMPONENT_ID);
        return this._columns;
    }

    actionsFormatter() {
        const user = this.opencgaSession?.user?.id;
        const hasAdminPermissions = CatalogUtils.isOrganizationAdmin(this.opencgaSession?.organization, user) || CatalogUtils.isAdmin(this.opencgaSession?.study, user);

        return `
            <div class="d-inline-block dropdown">
                <button class="btn btn-light btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    <i class="fas fa-toolbox" aria-hidden="true"></i>
                    <span>Actions</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                        <a data-action="copy-json" href="javascript: void 0" class="dropdown-item">
                            <i class="fas fa-copy me-1" aria-hidden="true"></i> Copy JSON
                        </a>
                    </li>
                    <li>
                        <a data-action="download-json" href="javascript: void 0" class="dropdown-item">
                            <i class="fas fa-download me-1" aria-hidden="true"></i> Download JSON
                        </a>
                    </li>
                    <li><hr class="dropdown-divider"></li>
                    <li>
                        <a data-action="edit" href="javascript: void 0" class="dropdown-item ${hasAdminPermissions ? "" : "disabled"}">
                            <i class="fas fa-edit me-1" aria-hidden="true"></i> Edit ...
                        </a>
                    </li>
                    <li>
                        <a data-action="delete" href="javascript: void 0" class="dropdown-item ${hasAdminPermissions ? "" : "disabled"}">
                            <i class="fas fa-trash me-1" aria-hidden="true"></i> Delete
                        </a>
                    </li>
                </ul>
            </div>
        `;
    }
    onColumnChange(e) {
        this.gridCommons.onColumnChange(e);
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

    async onActionClick(e, _, row) {
        const action = e.target.dataset.action?.toLowerCase() || e.detail.action;
        switch (action) {
            case "edit":
                this.noteUpdate = row;
                this.requestUpdate();
                await this.updateComplete;
                ModalUtils.show(`${this._prefix}UpdateModal`);
                break;
            case "copy-json":
                UtilsNew.copyToClipboard(JSON.stringify(row, null, "\t"));
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    message: "Note JSON copied to clipboard.",
                });
                break;
            case "download-json":
                UtilsNew.downloadData([JSON.stringify(row, null, "\t")], row.id + ".json");
                break;
            case "delete":
                this.onDeleteNote(row);
                break;
        }
    }

    renderModalUpdate() {
        return ModalUtils.create(this, `${this._prefix}UpdateModal`, {
            display: {
                modalTitle: `Note Update: ${this.noteUpdate?.id}`,
                modalDraggable: true,
                modalCyDataName: "modal-update",
                modalSize: "modal-lg"
            },
            render: active => html`
                <note-update
                    .noteId="${this.noteUpdate?.id}"
                    .noteScope="${this.noteUpdate?.scope}"
                    .active="${active}"
                    .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                    .opencgaSession="${this.opencgaSession}">
                </note-update>
            `,
        });
    }

    render() {
        return html`
            ${this._config.showToolbar ? html`
                <opencb-grid-toolbar
                    .query="${this.filters}"
                    .opencgaSession="${this.opencgaSession}"
                    .settings="${this.toolbarSetting}"
                    .config="${this.toolbarConfig}"
                    @columnChange="${this.onColumnChange}"
                    @actionClick="${e => this.onActionClick(e)}"
                    @noteCreate="${this.renderTable}">
                </opencb-grid-toolbar>
            ` : nothing}

            <div id="${this._prefix}GridTableDiv" class="force-overflow" data-cy="sb-grid">
                <table id="${ifDefined(this.gridId)}"></table>
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
