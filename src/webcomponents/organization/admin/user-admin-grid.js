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
import "./user-admin-create.js";
import "./user-admin-update.js";

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
            opencgaSession: {
                type: Object
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

    // update() {
    //     if (changedProperties.has("studyId")) {
    //         this.studyIdPropertyObserver();
    //     }
    // }

    updated(changedProperties) {
        if ((changedProperties.has("opencgaSession") ||
            changedProperties.has("organization") ||
            changedProperties.has("toolId") ||
            changedProperties.has("config") ||
            changedProperties.has("active")) && this.active) {
            this.propertyObserver();
        }
    }

    studyIdPropertyObserver() {
        // 1. Get users from the study
        let error;
        //this.opencgaSession.opencgaClient.
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
                        .opencgaSession="${this.opencgaSession}">
                    </user-admin-create>`
            },
        };
        this.renderTable();
    }

    // TODO to remove when BUG 2 fixed
    onUserCreate(e) {
        debugger
        const user = e.detail.value;
        if (UtilsNew.isNotEmpty(user)) {
            this.users.push(user);
            this.renderTable();
        }
    }
    renderTable() {
        debugger
        if (this.users?.length > 0) {
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
            gridContext: this,
            loadingTemplate: () => GridCommons.loadingFormatter(),
        });
    }

    async onActionClick(e, value, row) {
        const action = e.currentTarget.dataset.action;
        switch (action) {
            case "edit":
                debugger
                this.userId = row.userId;
                this.requestUpdate();
                await this.updateComplete;
                ModalUtils.show(`${this._prefix}UpdateModal`);
                break;
            case "delete":
                this.userId = row.userId;
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
                title: "Creation Date",
                field: "account.creationDate",
                formatter: CatalogGridFormatter.dateFormatter,
                visible: this.gridCommons.isColumnVisible("creationDate")
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
                    <div id="actions" class="d-flex justify-content-around">
                        <button data-action="delete" class="btn btn-outline-secondary disabled" style="border:0; border-radius: 50%">
                            <i class="far fa-trash-alt"></i>
                        </button>
                        <button data-action="disable" class="btn btn-outline-warning" style="border:0; border-radius: 50%">
                            <i class="fas fa-ban"></i>
                        </button>
                        <button data-action="edit" class="btn btn-outline-success" style="border:0; border-radius: 50%">
                            <i class="far fa-edit"></i>
                        </button>
                    </div>`,
                events: {
                    "click button": (e, value, row) => this.onActionClick(e, value, row),
                },
            });
        }

        this._columns = this.gridCommons.addColumnsFromExtensions(this._columns, this.COMPONENT_ID);
        return this._columns;
    }

    renderModalUpdate() {
        return ModalUtils.create(this, `${this._prefix}UpdateModal`, {
            display: {
                modalTitle: `Group Update: group ${this.groupId} in study ${this.studyId}`,
                modalDraggable: true,
                modalCyDataName: "modal-update",
                modalSize: "modal-lg"
            },
            render: active => {
                debugger
                return html`
                    <user-admin-update
                        .userId="${this.userId}"
                        .organization="${this.organization}"
                        .studyId="${this.studyId}"
                        .active="${active}"
                        .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                        .opencgaSession="${this.opencgaSession}">
                    </user-admin-update>
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
                .opencgaSession="${this.opencgaSession}">
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
                    @actionClick="${e => this.onActionClick(e)}"
                    @userCreate="${e => this.onUserCreate(e)}">
                </opencb-grid-toolbar>
            `;
        }
    }

    render() {
        debugger
        return html`
            <!-- 1. Render toolbar if enabled -->
            ${this.renderToolbar()}
            <!-- 2. Render grid -->
            <div id="${this._prefix}GridTableDiv" class="force-overflow" data-cy="sb-grid">
                <table id="${this.gridId}"></table>
            </div>
            <!-- 3. Render delete -->
            ${this.renderModalDelete()}
            <!-- 2. Render update -->
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
            // detailView: true,

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
