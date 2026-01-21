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
import LitUtils from "../commons/utils/lit-utils.js";
import AIUtils from "../commons/utils/ai-utils.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter.js";
import "../commons/catalog-browser-grid-config.js";
import "../commons/grid-toolbar.js";
import "../commons/ai/ai-chat.js";
import "./disease-panel-view.js";
import "./disease-panel-update.js";
import "./disease-panel-create.js";
import "./disease-panel-gel-import.js";

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
        this.RESOURCE = "DISEASE_PANEL";
        this._prefix = UtilsNew.randomString(8);
        this.gridId = this._prefix + this.COMPONENT_ID;
        this.active = true;
        this._selectedDiseasePanel = null;
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
            resource: this.RESOURCE,
            columns: this._getDefaultColumns(),
        };

        this.gridCommons.registerModals({
            "view-disease-panel": () => ({
                display: {
                    modalTitle: `Disease Panel ${this._selectedDiseasePanel?.id}`,
                    modalSize: "modal-3xl",
                    modalCyDataName: "modal-disease-panel-view",
                    modalDraggable: true,
                },
                render: () => html`
                    <disease-panel-view
                        .diseasePanelId="${this._selectedDiseasePanel?.id}"
                        .active="${true}"
                        .opencgaSession="${this.opencgaSession}">
                    </disease-panel-view>
                `,
            }),
            "create-disease-panel": {
                display: {
                    modalTitle: "Create Disease Panel",
                    modalSize: "modal-lg",
                    modalCyDataName: "modal-disease-panel-create",
                    modalDraggable: true,
                },
                render: () => html`
                    <disease-panel-create
                        .displayConfig="${{
                            type: "tabs",
                            buttonsLayout: "upper",
                        }}"
                        .opencgaSession="${this.opencgaSession}"
                        .active="${true}"
                        @diseasePanelCreate="${() => {
                            this.gridCommons.clearActiveModal();
                            this.table.bootstrapTable("refresh");
                        }}">
                    </disease-panel-create>
                `,
            },
            "import-disease-panel": {
                display: {
                    modalTitle: "Import Panel from GEL PanelApp",
                    modalSize: "modal-2xl",
                    modalCyDataName: "modal-disease-panel-import",
                    modalDraggable: true,
                },
                render: () => html`
                    <disease-panel-gel-import
                        .opencgaSession="${this.opencgaSession}"
                        .active="${true}"
                        @panelImport="${() => {
                            this.table.bootstrapTable("refresh");
                        }}">
                    </disease-panel-gel-import>
                `,
            },
            "update-disease-panel": () => ({
                display: {
                    modalTitle: `Update Disease Panel ${this._selectedDiseasePanel?.id}`,
                    modalDraggable: true,
                    modalCyDataName: "modal-disease-panel-update",
                    modalSize: "modal-lg",
                },
                render: () => html`
                    <disease-panel-update
                        .diseasePanelId="${this._selectedDiseasePanel?.id}"
                        .active="${true}"
                        .displayConfig="${{
                            type: "tabs",
                            buttonsLayout: "upper",
                        }}"
                        .opencgaSession="${this.opencgaSession}"
                        @diseasePanelUpdate="${() => {
                            this.gridCommons.clearActiveModal();
                            this.table.bootstrapTable("refresh");
                        }}">
                    </disease-panel-update>
                `,
            }),
        });
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
                classes: "table table-borderless table-hover table-grid",
                buttonsClass: "light",
                columns: this._columns,
                sidePagination: "server",
                iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
                icons: GridCommons.GRID_ICONS,
                uniqueId: "id",
                pagination: this._config.pagination,
                pageSize: this._config.pageSize,
                pageList: this._config.pageList,
                paginationVAlign: "bottom",
                formatShowingRows: (pageFrom, pageTo, totalRows) => {
                    return this.gridCommons.formatShowingRows(pageFrom, pageTo, totalRows);
                },
                loadingTemplate: () => GridCommons.loadingFormatter(),
                ajax: params => {
                    let panelsResponse = null;
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
                        .then(response => {
                            panelsResponse = response;
                            // Prepare data for columns extensions
                            const rows = panelsResponse.responses?.[0]?.results || [];
                            return this.gridCommons.prepareDataForExtensions(this.COMPONENT_ID, this.opencgaSession, this.filters, rows);
                        })
                        .then(() => params.success(panelsResponse))
                        .catch(error => {
                            console.error(error);
                            params.error(error);
                        })
                        .finally(() => {
                            LitUtils.dispatchCustomEvent(this, "queryComplete", null, {
                                response: panelsResponse,
                            });
                        });
                },
                responseHandler: response => {
                    const result = this.gridCommons.responseHandler(response, $(this.table).bootstrapTable("getOptions"));
                    return result.response;
                },
                onLoadSuccess: data => this.gridCommons.onLoadSuccess(data),
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
            // Josemi Note 2024-01-18: we have added the ajax function for local disease panels also to support executing async calls
            // when getting additional data from columns extensions.
            ajax: params => {
                const tableOptions = $(this.table).bootstrapTable("getOptions");
                const limit = params.data.limit || tableOptions.pageSize;
                const skip = params.data.offset || 0;
                const rows = this.diseasePanels.slice(skip, skip + limit);

                // Get data for extensions
                this.gridCommons.prepareDataForExtensions(this.COMPONENT_ID, this.opencgaSession, null, rows)
                    .then(() => params.success(rows))
                    .catch(error => params.error(error));
            },
            // Josemi Note 2024-01-18: we use this method to tell bootstrap-table how many rows we have in our data
            responseHandler: response => {
                return {
                    total: this.diseasePanels.length,
                    rows: response,
                };
            },
            iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
            icons: GridCommons.GRID_ICONS,
            uniqueId: "id",
            pagination: this._config.pagination,
            pageSize: this._config.pageSize,
            pageList: this._config.pageList,
            paginationVAlign: "bottom",
            formatShowingRows: (pageFrom, pageTo, totalRows) => {
                return this.gridCommons.formatShowingRows(pageFrom, pageTo, totalRows);
            },
            loadingTemplate: () => GridCommons.loadingFormatter(),
            onPostBody: data => this.gridCommons.onLoadSuccess({rows: data, total: data.length}),
        });
    }

    _getDefaultColumns() {
        this._columns = [
            {
                id: "name",
                title: "Panel",
                field: "name",
                formatter: (name, row) => {
                    let idLinkHtml = "";
                    if (row?.source?.project === "PanelApp") {
                        idLinkHtml = `
                            <a class="link d-flex align-items-center gap-1" href="${BioinfoUtils.getPanelAppLink(row?.source?.id)}" target="_blank">
                                ${row?.id || "-"} <i class="fas fa-external-link-alt fs-8"></i>
                            </a>
                        `;
                    }
                    return `
                        <a class="link fw-bold d-block" data-action="view">${name}</a>
                        ${idLinkHtml ? `<div class="text-secondary">${idLinkHtml}</div>` : ""}
                    `;
                },
                events: {
                    "click a": (event, value, row) => this.onActionClick(event, row),
                },
                visible: this.gridCommons.isColumnVisible("name"),
            },
            {
                id: "disorders",
                title: "Disorders",
                field: "disorders",
                formatter: disorders => CatalogGridFormatter.disorderFormatter(disorders),
                visible: this.gridCommons.isColumnVisible("disorders"),
            },
            {
                id: "stats",
                title: "Stats",
                field: "stats",
                formatter: stats => `
                    <div style="white-space: nowrap">
                        <b>Genes</b>: <span>${stats.numberOfGenes}</span>
                    </div>
                    <div style="white-space: nowrap">
                        <b>Regions</b>: <span>${stats.numberOfRegions}</span>
                    </div>
                    <div style="white-space: nowrap">
                        <b>Variants</b>: <span>${stats.numberOfVariants}</span>
                    </div>
                `,
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
                            const projectUrl = `https://panelapp.genomicsengland.co.uk/api/v1/panels/${id}/?version=${version}`;
                            projectAndVersion = `
                                <a class="link d-inline-flex align-items-center gap-1" href="${projectUrl}" target="_blank">
                                    <span>${project} ${version}</span>
                                    <i class="fas fa-external-link-alt fs-8"></i>
                                </a>
                            `;
                        } else {
                            projectAndVersion = [project, version].filter(Boolean).join(" ");
                        }
                        return [author, projectAndVersion].filter(Boolean).join(" - ");
                    }
                    return "-";
                },
                visible: this.gridCommons.isColumnVisible("source"),
            },
            {
                id: "actions",
                align: "right",
                formatter: () => this.actionsFormatter(),
                events: {
                    "click a": (event, value, row) => this.onActionClick(event, row),
                },
                visible: this._config.showActions,
                excludeFromExport: true,
                excludeFromSettings: true,
            },
        ];

        this._columns = this.gridCommons.addColumnsFromExtensions(this.COMPONENT_ID, this.opencgaSession, this._columns);
        return this._columns;
    }

    actionsFormatter() {
        const hasWritePermission = this.gridCommons.hasPermission("WRITE");
        const hasDeletePermission = this.gridCommons.hasPermission("DELETE");
        return `
            <div class="dropdown">
                <button class="btn" data-bs-toggle="dropdown" data-cy="actions-button">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
                <div class="dropdown-menu dropdown-menu-end">
                    <a data-action="view" class="dropdown-item cursor-pointer">
                        <i class="fas fa-eye me-1"></i> View
                    </a>
                    <a data-action="copy-json" class="dropdown-item cursor-pointer">
                        <i class="fas fa-copy me-1"></i> Copy JSON
                    </a>
                    <a data-action="download-json" class="dropdown-item cursor-pointer">
                        <i class="fas fa-download me-1"></i> Download JSON
                    </a>
                    <hr class="dropdown-divider">
                    <a data-action="copy" class="dropdown-item ${hasWritePermission ? "cursor-pointer" : "disabled" }">
                        <i class="fas fa-clone me-1"></i> Make a Copy
                    </a>
                    <hr class="dropdown-divider">
                    <a data-action="edit" class="dropdown-item ${hasWritePermission ? "cursor-pointer" : "disabled" }">
                        <i class="fas fa-edit me-1"></i> Edit
                    </a>
                    <a data-action="delete"class="dropdown-item ${hasDeletePermission ? "cursor-pointer" : "disabled" }">
                        <i class="fas fa-trash me-1"></i> Delete
                    </a>
                </div>
            </div>
        `;
    }

    onActionClick(event, diseasePanel) {
        const action = event.target.dataset.action?.toLowerCase();
        switch (action) {
            case "view":
                this._selectedDiseasePanel = diseasePanel;
                this.gridCommons.changeActiveModal("view-disease-panel");
                break;
            case "edit":
                this._selectedDiseasePanel = diseasePanel;
                this.gridCommons.changeActiveModal("update-disease-panel");
                break;
            case "copy-json":
                UtilsNew.copyToClipboard(JSON.stringify(diseasePanel, null, "\t"));
                break;
            case "download-json":
                UtilsNew.downloadData([JSON.stringify(diseasePanel, null, "\t")], diseasePanel.id + ".json");
                break;
            case "copy":
                this.onCopy(diseasePanel);
                break;
            case "delete":
                this.onDelete(diseasePanel);
                break;
        }
    }

    onCopy(diseasePanel) {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: `Copy Disease Panel`,
            message: `Are you sure you want to make a copy of the disease panel <b>${diseasePanel.id}</b>?`,
            display: {
                okButtonText: "Yes, copy it",
            },
            ok: () => {
                const copy = JSON.parse(JSON.stringify(diseasePanel));
                copy.id = diseasePanel.id + "-Copy";
                copy.name = "Copy of " + diseasePanel.name;
                // Delete managed fields
                delete copy.uuid;
                delete copy.creationDate; // FIXME remove this line
                delete copy.modificationDate; // FIXME remove this line
                delete copy.internal;
                delete copy.release;
                delete copy.version;
                delete copy.status;
                this.opencgaSession.opencgaClient.panels()
                    .create(copy, {
                        study: this.opencgaSession.study.fqn,
                        includeResult: true,
                    })
                    .then(response => {
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                            message: `Disease panel '${diseasePanel.id}' has been copied.`,
                        });
                        LitUtils.dispatchCustomEvent(this, "diseasePanelCreate", response.responses[0].results[0]);
                        this.table.bootstrapTable("refresh");
                    }).catch(response => {
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                });
            },
        });
    }

    onDelete(diseasePanel) {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: `Delete Disease Panel`,
            message: `Are you sure you want to delete the disease panel <b>'${diseasePanel.id}'</b>?`,
            display: {
                okButtonText: "Yes, delete it",
            },
            ok: () => {
                this.opencgaSession.opencgaClient.panels()
                    .delete(diseasePanel.id, {
                        study: this.opencgaSession.study.fqn,
                    })
                    .then(() => {
                        // Display confirmation message and update the table
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                            message: `Disease panel '${diseasePanel.id}' has been deleted.`,
                        });
                        LitUtils.dispatchCustomEvent(this, "diseasePanelDelete", diseasePanel);
                        this.table.bootstrapTable("refresh");
                    }).catch(response => {
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                });
            },
        });
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

    onAiResponse(event) {
        // console.log(event.detail.value);
        const response = AIUtils.parseJsonResponse(event.detail.value || "");
        if (response && response.id) {
            this.opencgaSession.opencgaClient.panels()
                .create(response, {
                    study: this.opencgaSession.study.fqn,
                })
                .then(res => {
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                        message: `Disease panel '${response.id}' has been created using AI.`,
                    });
                    LitUtils.dispatchCustomEvent(this, "diseasePanelCreate", res.responses[0].results[0]);
                    this.table.bootstrapTable("refresh");
                })
                .catch(err => {
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, err);
                });
        } else {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_ERROR, {
                message: "Could not parse a valid Disease Panel from the AI response.",
            });
        }
    }

    renderToolbarLeftContent() {
        return html`
            <span id="${this.gridId + "PaginationInfo"}"></span>
        `;
    }

    getRightToolbar() {
        const hasWritePermission = this.gridCommons.hasPermission("WRITE");
        return [
            {
                icon: "fas fa-plus",
                title: "Create Disease Panel",
                disabled: !hasWritePermission,
                onClick: () => this.gridCommons.changeActiveModal("create-disease-panel"),
            },
            {
                icon: "fas fa-file-import me-1",
                title: "Import from GEL PanelApp",
                disabled: !hasWritePermission,
                onClick: () => this.gridCommons.changeActiveModal("import-disease-panel"),
            },
            {
                render: () => html`
                    <div class="dropdown">
                        <button class="btn ai-btn ${!hasWritePermission ? "disabled" : "cursor-pointer"}" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                            <i class="fas fa-brain me-1"></i>
                            <span class="">Create with AI</span>
                        </button>
                        <div class="dropdown-menu dropdown-menu-end shadow-sm ai-dropdown p-3 rounded-4" style="width:400px;">
                            <ai-chat
                                .opencgaSession="${this.opencgaSession}"
                                .config="${{
                                    greeting: "I can help to create disease panels based on disorders or gene lists.",
                                    placeholder: "E.g.: Create a disease panel for breast cancer including BRCA1 and BRCA2 genes.",
                                    preparePrompt: inputText => {
                                        return `
                                            Based on the following input: "${inputText}", generate a disease panel JSON object including the following fields: 
                                            id, name, description, disorders (with id and name), genes (with id, name, and coordinates), and regions (with id and coordinates).
                                            The coordinates of genes and regions should ben an array of objects with assembly, location, and source. Use Ensembl for sources, and if not specified use GRCh38 as assembly.
                                            Only fill the genes field if the input mentions genes, otherwise leave it empty. Make sure to include gene coordinates from Ensembl.
                                            Only fill the regions field if the input mentions chromosomal regions, otherwise leave it empty.
                                            The JSON should be properly formatted and ready to use in OpenCGA.
                                        `;
                                    },
                                }}"
                                @aiResponse="${event => this.onAiResponse(event)}">
                            </ai-chat>
                        </div>
                    </div>
                `,
            },
        ];
    }

    render() {
        return html`
            ${this._config.showToolbar ? html`
                <grid-toolbar
                    .query="${this.filters}"
                    .opencgaSession="${this.opencgaSession}"
                    .leftContent="${this.renderToolbarLeftContent()}"
                    .rightToolbar="${this.getRightToolbar()}"
                    .settings="${this.toolbarSetting}"
                    .config="${this.toolbarConfig}"
                    @download="${this.onDownload}"
                    @export="${this.onDownload}">
                </grid-toolbar>
            ` : nothing}

            <div id="${this._prefix}GridTableDiv" class="force-overflow" data-cy="dpb-grid">
                <table id="${this.gridId}"></table>
            </div>

            ${this.gridCommons.renderModals()}
        `;
    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 25],

            showToolbar: true,
            showActions: true,

            showExport: true,
            showSettings: true,
            exportTabs: ["download", "link", "code"],
        };
    }

}

customElements.define("disease-panel-grid", DiseasePanelGrid);
