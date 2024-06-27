/**
 * Copyright 2015-2022 OpenCB
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

import {html, LitElement, nothing} from "lit";
import UtilsNew from "../../core/utils-new.js";
import GridCommons from "../commons/grid-commons.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import BioinfoUtils from "../../core/bioinfo/bioinfo-utils.js";
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils";
import LitUtils from "../commons/utils/lit-utils.js";
import "../commons/catalog-browser-grid-config.js";
import "../commons/opencb-grid-toolbar.js";
import ModalUtils from "../commons/modal/modal-utils.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter.js";
import WebUtils from "../commons/utils/web-utils.js";

export default class DiseasePanelGrid extends LitElement {

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
            diseasePanels: {
                type: Array
            },
            active: {
                type: Boolean
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this.COMPONENT_ID = "disease-panel-grid";
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
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };
        this.gridCommons = new GridCommons(this.gridId, this, this._config);

        this.toolbarSetting = {
            ...this._config,
        };

        // Config for the grid toolbar
        this.toolbarConfig = {
            toolId: this.toolId,
            resource: "DISEASE_PANEL",
            columns: this._getDefaultColumns(),
            create: {
                display: {
                    modalTitle: "Disease Panel Create",
                    modalDraggable: true,
                    modalCyDataName: "modal-create",
                },
                render: () => html`
                    <disease-panel-create
                        .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                        .opencgaSession="${this.opencgaSession}">
                    </disease-panel-create>
                `,
            }
            // Uncomment in case we need to change defaults
            // export: {
            //     display: {
            //         modalTitle: "Disease Panel Export",
            //     },
            //     render: () => html`
            //         <opencga-export
            //             .config="${this._config}"
            //             .query=${this.query}
            //             .opencgaSession="${this.opencgaSession}"
            //             @export="${this.onExport}"
            //             @changeExportField="${this.onChangeExportField}">
            //         </opencga-export>`
            // },
            // settings: {
            //     display: {
            //         modalTitle: "Disease Panel Settings",
            //     },
            //     render: () => html `
            //         <catalog-browser-grid-config
            //             .opencgaSession="${this.opencgaSession}"
            //             .gridColumns="${this._columns}"
            //             .config="${this._config}"
            //             @configChange="${this.onGridConfigChange}">
            //         </catalog-browser-grid-config>`
            // }
        };

        this.permissionID = WebUtils.getPermissionID(this.toolbarConfig.resource, "WRITE");
    }

    renderTable() {
        if (this.diseasePanels?.length > 0) {
            this.renderLocalTable();
        } else {
            this.renderRemoteTable();
        }
    }

    renderRemoteTable() {
        if (this.opencgaSession.opencgaClient && this.opencgaSession?.study?.fqn) {
            if (this.lastFilters && JSON.stringify(this.lastFilters) === JSON.stringify(this.query)) {
                // Abort destroying and creating again the grid. The filters have not changed
                return;
            }

            this._columns = this._getDefaultColumns();
            this.table = $("#" + this.gridId);
            this.table.bootstrapTable("destroy");
            this.table.bootstrapTable({
                columns: this._columns,
                method: "get",
                sidePagination: "server",
                iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
                icons: GridCommons.GRID_ICONS,
                uniqueId: "id",
                pagination: this._config.pagination,
                pageSize: this._config.pageSize,
                pageList: this._config.pageList,
                paginationVAlign: "both",
                formatShowingRows: this.gridCommons.formatShowingRows,
                showExport: this._config.showExport,
                detailView: this._config.detailView,
                gridContext: this,
                formatLoadingMessage: () => String.raw`<div><loading-spinner></loading-spinner></div>`,
                ajax: params => {
                    this.filters = {
                        study: this.opencgaSession.study.fqn,
                        limit: params.data.limit,
                        skip: params.data.offset || 0,
                        count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                        ...this.query
                    };

                    // Store the current filters
                    this.lastFilters = {...this.filters};
                    this.opencgaSession.opencgaClient.panels()
                        .search(this.filters)
                        .then(response => params.success(response))
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
            columns: this._getDefaultColumns(),
            data: this.diseasePanels,
            sidePagination: "local",
            iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
            icons: GridCommons.GRID_ICONS,
            uniqueId: "id",
            pagination: this._config.pagination,
            pageSize: this._config.pageSize,
            pageList: this._config.pageList,
            showExport: this._config.showExport,
            detailView: this._config.detailView,
            gridContext: this,
            formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
            onClickRow: (row, selectedElement) => this.gridCommons.onClickRow(row.id, row, selectedElement),
            onPostBody: data => {
                // We call onLoadSuccess to select first row
                this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 1);
            },
        });
    }

    onColumnChange(e) {
        this.gridCommons.onColumnChange(e);
    }

    async onActionClick(e, _, row) {
        const action = e.target.dataset.action?.toLowerCase();
        switch (action) {
            case "edit":
                this.diseasePanelUpdateId = row.id;
                this.requestUpdate();
                await this.updateComplete;
                ModalUtils.show(`${this._prefix}UpdateModal`);
                break;
            case "copy-json":
                UtilsNew.copyToClipboard(JSON.stringify(row, null, "\t"));
                break;
            case "download-json":
                UtilsNew.downloadData([JSON.stringify(row, null, "\t")], row.id + ".json");
                break;
            case "copy":
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
                    title: `Copy Disease Panel '${row.id}'`,
                    message: `Are you sure you want to delete the disease panel <b>'${row.id}'</b>?`,
                    display: {
                        okButtonText: "Yes, copy it",
                    },
                    ok: () => {
                        const copy = JSON.parse(JSON.stringify(row));
                        copy.id = row.id + "-Copy";
                        copy.name = "Copy of " + row.name;
                        // Delete managed fields
                        delete copy.uuid;
                        delete copy.creationDate; // FIXME remove this line
                        delete copy.modificationDate; // FIXME remove this line
                        delete copy.internal;
                        delete copy.release;
                        delete copy.version;
                        delete copy.status;
                        this.opencgaSession.opencgaClient.panels().create(copy, {
                            study: this.opencgaSession.study.fqn,
                        }).then(response => {
                            if (response.getResultEvents("ERROR").length) {
                                return NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                            }
                            // Display confirmation message and update the table
                            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                                message: `Case '${copy.id}' has been copied.`,
                            });
                            LitUtils.dispatchCustomEvent(this, "rowUpdate", row);
                            this.renderTable();
                        }).catch(response => {
                            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                        });
                    },
                });
                break;
            case "delete":
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
                    title: `Delete Disease Panel '${row.id}'`,
                    message: `Are you sure you want to delete the disease panel <b>'${row.id}'</b>?`,
                    display: {
                        okButtonText: "Yes, delete it",
                    },
                    ok: () => {
                        const diseasePanelId = row.id;
                        this.opencgaSession.opencgaClient.panels().delete(diseasePanelId, {
                            study: this.opencgaSession.study.fqn,
                        }).then(response => {
                            if (response.getResultEvents("ERROR").length) {
                                return NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                            }
                            // Display confirmation message and update the table
                            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                                message: `Case '${diseasePanelId}' has been deleted.`,
                            });
                            LitUtils.dispatchCustomEvent(this, "rowUpdate", row);
                            this.renderTable();
                        }).catch(response => {
                            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                        });
                    },
                });
                break;
        }
    }

    _getDefaultColumns() {
        this._columns = [
            {
                id: "name",
                title: "Panel",
                field: "name",
                formatter: (name, row) => {
                    let idLinkHtml = "";
                    if (row?.source && row?.source?.project === "PanelApp") {
                        idLinkHtml = `
                            <a href="${BioinfoUtils.getPanelAppLink(row?.source?.id)}" title="Panel ID: ${row?.id}" target="_blank">
                                ${row?.id ?? "-"} <i class="fas fa-external-link-alt" style="padding-left: 5px"></i>
                            </a>
                        `;
                    }
                    return `
                        <div>
                            <div style="font-weight: bold; margin: 5px 0">${name}</div>
                            <div style="margin: 5px 0">${idLinkHtml}</div>
                        </div>
                    `;
                },
                halign: "center",
                visible: this.gridCommons.isColumnVisible("name"),
            },
            {
                id: "disorders",
                title: "Disorders",
                field: "disorders",
                formatter: disorders => CatalogGridFormatter.disorderFormatter(disorders),
                halign: "center",
                visible: this.gridCommons.isColumnVisible("disorders"),
            },
            {
                id: "stats",
                title: "Stats",
                field: "stats",
                formatter: stats => `
                    <div>
                        <div style="margin: 2px 0; white-space: nowrap">
                            <span style="font-weight: bold">Genes:</span><span> ${stats.numberOfGenes}</span>
                        </div>
                        <div style="margin: 2px 0; white-space: nowrap">
                            <span style="font-weight: bold">Regions:</span><span> ${stats.numberOfRegions}</span>
                        </div>
                        <div style="margin: 2px 0; white-space: nowrap">
                            <span style="font-weight: bold">Variants:</span><span> ${stats.numberOfVariants}</span>
                        </div>
                    </div>
                `,
                align: "center",
                visible: this.gridCommons.isColumnVisible("stats"),
            },
            {
                id: "source",
                title: "Source",
                field: "source",
                formatter: (value, row) => {
                    if (row?.source) {
                        const {id, author, project, version} = row.source;
                        let projectAndVersion = "";
                        if (project?.toUpperCase() === "PANELAPP") {
                            projectAndVersion = `
                                <a href="https://panelapp.genomicsengland.co.uk/api/v1/panels/${id}/?version=${version}" target="_blank">
                                    ${project} ${version} <i class="fas fa-external-link-alt" style="padding-left: 5px"></i>
                                </a>
                            `;
                        } else {
                            projectAndVersion = `${project || ""} ${version}`;
                        }
                        return `${author ? `${author} -` : ""} ${projectAndVersion}`;
                    }
                    return "-";
                },
                align: "center",
                visible: this.gridCommons.isColumnVisible("source"),
            },
        ];

        if (this.opencgaSession && this._config.showActions) {
            this._columns.push({
                id: "actions",
                title: "Actions",
                field: "actions",
                align: "center",
                formatter: () => {
                    const isAdmin = OpencgaCatalogUtils.checkPermissions(this.opencgaSession.study, this.opencgaSession.user.id, this.permissionID);
                    return `
                        <div class="inline-block dropdown">
                            <button class="btn btn-default btn-sm dropdown-toggle" type="button" data-toggle="dropdown">
                                <i class="fas fa-toolbox icon-padding" aria-hidden="true"></i>
                                <span>Actions</span>
                                <span class="caret" style="margin-left: 5px"></span>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-right">
                                <li>
                                    <a data-action="copy-json" href="javascript: void 0" class="btn force-text-left">
                                        <i class="fas fa-copy icon-padding" aria-hidden="true"></i> Copy JSON
                                    </a>
                                </li>
                                <li>
                                    <a data-action="download-json" href="javascript: void 0" class="btn force-text-left">
                                        <i class="fas fa-download icon-padding" aria-hidden="true"></i> Download JSON
                                    </a>
                                </li>
                                <li role="separator" class="divider"></li>
                                <li>
                                    <a data-action="copy" href="javascript: void 0" class="btn force-text-left ${isAdmin ? "" : "disabled"}">
                                        <i class="fas fa-user icon-padding" aria-hidden="true"></i> Make a Copy
                                    </a>
                                </li>
                                <li role="separator" class="divider"></li>
                                <li>
                                    <a data-action="edit" class="btn force-text-left ${isAdmin ? "" : "disabled" }">
                                        <i class="fas fa-edit icon-padding" aria-hidden="true"></i> Edit ...
                                    </a>
                                </li>
                                <li>
                                    <a data-action="delete" href="javascript: void 0" class="btn force-text-left ${isAdmin ? "" : "disabled"}">
                                        <i class="fas fa-trash icon-padding" aria-hidden="true"></i> Delete
                                    </a>
                                </li>
                            </ul>
                        </div>
                    `;
                },
                events: {
                    "click a": this.onActionClick.bind(this),
                },
                visible: this.gridCommons.isColumnVisible("actions"),
            });
        }

        this._columns = this.gridCommons.addColumnsFromExtensions(this._columns, this.COMPONENT_ID);
        return this._columns;
    }

    async onDownload(e) {
        this.toolbarConfig = {...this.toolbarConfig, downloading: true};
        this.requestUpdate();
        await this.updateComplete;

        const filters = {
            ...this.filters,
            skip: 0,
            limit: 1000,
            count: false
        };
        this.opencgaSession.opencgaClient.panels()
            .search(filters)
            .then(response => {
                const results = response.getResults();
                if (results) {
                    // Check if user clicked in Tab or JSON format
                    if (e.detail.option.toUpperCase() === "TAB") {
                        const fields = ["id", "name", "stats.numberOfGenes", "stats.numberOfRegions", "stats.numberOfVariants", "source.author", "source.project", "source.version"];
                        const data = UtilsNew.toTableString(results, fields);
                        UtilsNew.downloadData(data, UtilsNew.generateFileNameDownload("disease_panel", this.opencgaSession, ".tsv"), "text/plain");
                    } else {
                        UtilsNew.downloadData(JSON.stringify(results, null, "\t"), UtilsNew.generateFileNameDownload("disease_panel", this.opencgaSession, ".json"), "application/json");
                    }
                } else {
                    console.error("Error in result format");
                }
            })
            .catch(response => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            })
            .finally(() => {
                this.toolbarConfig = {...this.toolbarConfig, downloading: false};
                this.requestUpdate();
            });
    }

    render() {
        // CAUTION 20230517 Vero: the event dispatched from disease-panel-create.js is called sessionPanelUpdate.
        return html`
            ${this._config.showToolbar ? html`
                <opencb-grid-toolbar
                    .query="${this.filters}"
                    .opencgaSession="${this.opencgaSession}"
                    .settings="${this.toolbarSetting}"
                    .config="${this.toolbarConfig}"
                    @columnChange="${this.onColumnChange}"
                    @download="${this.onDownload}"
                    @export="${this.onDownload}"
                    @actionClick="${e => this.onActionClick(e)}"
                    @sessionPanelUpdate="${this.renderTable}">
                </opencb-grid-toolbar>
            ` : nothing}

            <div id="${this._prefix}GridTableDiv" class="force-overflow" data-cy="dpb-grid">
                <table id="${this.gridId}"></table>
            </div>

            ${ModalUtils.create(this, `${this._prefix}UpdateModal`, {
                display: {
                    modalTitle: `Disease Panel Update: ${this.diseasePanelUpdateId}`,
                    modalDraggable: true,
                    modalCyDataName: "modal-update",
                },
                render: active => {
                    return html `
                        <disease-panel-update
                            .diseasePanelId="${this.diseasePanelUpdateId}"
                            .active="${active}"
                            .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                            .opencgaSession="${this.opencgaSession}">
                        </disease-panel-update>
                    `;
                }
            })}
        `;
    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 25],
            showSelectCheckbox: false,
            multiSelection: false,
            detailView: false,

            showToolbar: true,
            showActions: true,

            showCreate: true,
            showExport: true,
            showSettings: true,
            exportTabs: ["download", "link", "code"],
        };
    }

}

customElements.define("disease-panel-grid", DiseasePanelGrid);
