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

import {html, LitElement, nothing} from "lit";
import UtilsNew from "../../core/utils-new.js";
import GridCommons from "../commons/grid-commons.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import WebUtils from "../commons/utils/web-utils.js";
import LitUtils from "../commons/utils/lit-utils.js";
import ModalUtils from "../commons/modal/modal-utils.js";
import "../commons/opencb-grid-toolbar.js";
import "../loading-spinner.js";
import "./file-create.js";
import "./folder-create.js";

export default class OpencgaFileGrid extends LitElement {

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
            files: {
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
        this.COMPONENT_ID = "file-grid";
        this._prefix = UtilsNew.randomString(8);
        this.gridId = this._prefix + this.COMPONENT_ID;
        this.active = true;
        this.activeActionModal = "";
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
        // With each property change we must updated config and create the columns again. No extra checks are needed.
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
            resource: "FILE",
            columns: this._getDefaultColumns(),
        };

        this.permissionID = WebUtils.getPermissionID(this.toolbarConfig.resource, "WRITE");
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

    renderTable() {
        // If this.files is provided as property we render the array directly
        if (this.files?.length > 0) {
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
                method: "get",
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
                showExport: this._config.showExport,
                detailView: this._config.detailView,
                gridContext: this,
                // formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
                loadingTemplate: () => GridCommons.loadingFormatter(),
                ajax: params => {
                    let filesResponse = null;
                    this.filters = {
                        study: this.opencgaSession.study.fqn,
                        // type: "FILE",
                        limit: params.data.limit,
                        skip: params.data.offset || 0,
                        count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                        include: "id,name,path,type,uuid,sampleIds,jobId,status,format,bioformat,size,creationDate,modificationDate,internal,annotationSets",
                        ...this.query
                    };
                    // When searching by directory we must also show directories
                    // if (this.filters.directory) {
                    //     this.filters.type = "FILE,DIRECTORY";
                    // }

                    // Store the current filters
                    this.lastFilters = {...this.filters};
                    this.opencgaSession.opencgaClient.files()
                        .search(this.filters)
                        .then(response => {
                            filesResponse = response;
                            // Prepare data for columns extensions
                            const rows = filesResponse.responses?.[0]?.results || [];
                            return this.gridCommons.prepareDataForExtensions(this.COMPONENT_ID, this.opencgaSession, this.filters, rows);
                        })
                        .then(() => params.success(filesResponse))
                        .catch(error => {
                            console.error(error);
                            params.error(error);
                        })
                        .finally(() => {
                            LitUtils.dispatchCustomEvent(this, "queryComplete", null, {
                                response: filesResponse,
                            });
                        });
                },
                responseHandler: response => {
                    const result = this.gridCommons.responseHandler(response, $(this.table).bootstrapTable("getOptions"));
                    return result.response;
                },
                onClickRow: (row, selectedElement) => this.gridCommons.onClickRow(row.id, row, selectedElement),
                onDblClickRow: (_, element) => {
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
        this.from = 1;
        this.to = Math.min(this.files.length, this._config.pageSize);
        this.numTotalResultsText = this.files.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            theadClasses: "table-light",
            buttonsClass: "light",
            columns: this._getDefaultColumns(),
            // data: this.files,
            sidePagination: "server",
            // Josemi Note 2024-01-18: we have added the ajax function for local files also to support executing async calls
            // when getting additional data from columns extensions.
            ajax: params => {
                const tableOptions = $(this.table).bootstrapTable("getOptions");
                const limit = params.data.limit || tableOptions.pageSize;
                const skip = params.data.offset || 0;
                const rows = this.files.slice(skip, skip + limit);

                // Get data for extensions
                this.gridCommons.prepareDataForExtensions(this.COMPONENT_ID, this.opencgaSession, null, rows)
                    .then(() => params.success(rows))
                    .catch(error => params.error(error));
            },
            // Josemi Note 2024-01-18: we use this method to tell bootstrap-table how many rows we have in our data
            responseHandler: response => {
                return {
                    total: this.files.length,
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
            showExport: this._config.showExport,
            detailView: this._config.detailView,
            gridContext: this,
            // formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
            loadingTemplate: () => GridCommons.loadingFormatter(),
            onClickRow: (row, selectedElement) => this.gridCommons.onClickRow(row.id, row, selectedElement),
            onPageChange: (page, size) => {
                const result = this.gridCommons.onPageChange(page, size);
                this.from = result.from || this.from;
                this.to = result.to || this.to;
            },
            onPostBody: data => {
                // We call onLoadSuccess to select first row
                this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 2);
            },
        });
    }

    onColumnChange(e) {
        this.gridCommons.onColumnChange(e);
    }

    async onActionClick(e, _, row) {
        // e.preventDefault();
        const action = e.target.dataset.action?.toLowerCase();
        switch (action) {
            /*
            case "edit":
                this.fileUpdateId = row.id;
                this.requestUpdate();
                await this.updateComplete;
                ModalUtils.show(`${this._prefix}UpdateModal`);
                break;
             */
            case "copy-json":
                UtilsNew.copyToClipboard(JSON.stringify(row, null, "\t"));
                break;
            case "download-json":
                UtilsNew.downloadData([JSON.stringify(row, null, "\t")], row.id + ".json");
                break;
            case "quality-control":
                alert("Not implemented yet");
                break;
        }
    }

    getCurrentPath() {
        return this.query?.directory || (this.query?.path || "").slice(2, -2);
    }

    _getDefaultColumns() {
        this._columns = [
            {
                id: "icon",
                title: "",
                field: "type",
                formatter: value => {
                    return `
                        <i class="fs-5 fas ${value === "DIRECTORY" ? "fa-folder" : "fa-file-alt"}"></i>
                    `;
                },
                align: "center",
                width: 40,
                excludeFromSettings: true,
            },
            {
                id: "name",
                title: "Name",
                field: "name",
                formatter: (fileName, row) => {
                    return `
                        <div class="fw-bold mb-1">${fileName}</div>
                        <div class="text-secondary">${("/" + row.path.replace(row.name, "")).replace("//", "/")}</div>
                    `;
                },
                visible: this.gridCommons.isColumnVisible("name")
            },
            {
                id: "sampleIds",
                title: "Samples",
                field: "sampleIds",
                formatter: sampleIds => {
                    let html = "-";
                    if (sampleIds?.length > 0) {
                        html = `<div class="text-nowrap">`;
                        for (let i = 0; i < sampleIds.length; i++) {
                            // Display first 3 files
                            if (i < 3) {
                                html += `<div style="margin: 2px 0"><span class="fw-bold">${sampleIds[i]}</span></div>`;
                            } else {
                                html += `<a tooltip-title="Samples" tooltip-text='${sampleIds.join("<br>")}'>... view all samples (${sampleIds.length})</a>`;
                                break;
                            }
                        }
                        html += "</div>";
                    }
                    return html;
                },
                visible: this.gridCommons.isColumnVisible("sampleIds")
            },
            {
                id: "jobId",
                title: "Job ID",
                field: "jobId",
                formatter: jobId => jobId || "-",
                visible: this.gridCommons.isColumnVisible("jobId")
            },
            {
                id: "size",
                title: "Size",
                field: "size",
                formatter: size => UtilsNew.getDiskUsage(size),
                visible: this.gridCommons.isColumnVisible("size")
            },
            {
                id: "format",
                title: "Format",
                field: "format",
                visible: this.gridCommons.isColumnVisible("format")
            },
            {
                id: "index",
                title: "Variant Index Status",
                field: "internal.variant.index.status.id",
                visible: this.gridCommons.isColumnVisible("index"),
                // NOTE 20230310 Vero: Formatter for displaying in the future information
                // about annotation and secondary index in the column
                // formatter: (value, row) => {
                //     if (row.format === "VCF") {
                //         return `
                //             <div>${row.internal.variant.index?.status?.id}</div>
                //             <div>${row.internal.variant.annotationIndex?.status?.id}</div>
                //         `;
                //     } else {
                //         return `<div>NA</div>`;
                //     }
                // }
            },
            {
                id: "creationDate",
                title: "Creation date",
                field: "creationDate",
                formatter: date => CatalogGridFormatter.dateFormatter(date),
                visible: this.gridCommons.isColumnVisible("creationDate")
            },
        ];

        if (this._config.annotations?.length > 0) {
            this.gridCommons.addColumnsFromAnnotations(this._columns, CatalogGridFormatter.customAnnotationFormatter, this._config);
        }

        if (this.opencgaSession && this._config.showActions) {
            this._columns.push({
                id: "actions",
                field: "actions",
                align: "right",
                formatter: (value, row) => {
                    const hasWritePermission = OpencgaCatalogUtils.getStudyEffectivePermission(
                        this.opencgaSession.study,
                        this.opencgaSession.user.id,
                        this.permissionID,
                        this.opencgaSession?.organization?.configuration?.optimizations?.simplifyPermissions);
                    const downloadUrl = OpencgaCatalogUtils.getDownloadFileUrl(this.opencgaSession, row.id);

                    return `
                        <div class="d-inline-block dropdown">
                            <button class="btn" type="button" data-bs-toggle="dropdown">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <div class="dropdown-menu dropdown-menu-end">
                                <a data-action="download" target="_blank" class="dropdown-item ${row.id ? "cursor-pointer" : "disabled"}" href="${downloadUrl}">
                                    <i class="fas fa-download me-1"></i> Download
                                </a>
                                <hr class="dropdown-divider">
                                <a data-action="copy-json" class="dropdown-item cursor-pointer">
                                    <i class="fas fa-copy me-1" aria-hidden="true"></i> Copy JSON
                                </a>
                                <a data-action="download-json" class="dropdown-item cursor-pointer">
                                    <i class="fas fa-download me-1" aria-hidden="true"></i> Download JSON
                                </a>
                                <hr class="dropdown-divider">
                                <a data-action="quality-control"
                                    class="dropdown-item ${row.qualityControl?.metrics && row.qualityControl.metrics.length === 0 ? "cursor-pointer" : "disabled"}"
                                    title="${row.qualityControl?.metrics && row.qualityControl.metrics.length === 0 ? "Launch a job to calculate Quality Control stats" : "Quality Control stats already calculated"}">
                                        <i class="fas fa-rocket me-1" aria-hidden="true"></i> Calculate Quality Control
                                </a>
                                <hr class="dropdown-divider">
                                <a data-action="edit" class="dropdown-item disabled ${hasWritePermission ? "cursor-pointer" : "disabled"}">
                                    <i class="fas fa-edit me-1" aria-hidden="true"></i> Edit ...
                                </a>
                                <a data-action="delete" class="dropdown-item disabled">
                                    <i class="fas fa-trash me-1" aria-hidden="true"></i> Delete
                                </a>
                            </div>
                        </div>
                    `;
                },
                events: {
                    "click a": this.onActionClick.bind(this)
                },
                excludeFromSettings: true,
                visible: this.gridCommons.isColumnVisible("actions")
            });
        }

        // _columns = UtilsNew.mergeTable(_columns, this._config.columns || this._config.hiddenColumns, !!this._config.hiddenColumns);
        this._columns = this.gridCommons.addColumnsFromExtensions(this._columns);
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
        this.opencgaSession.opencgaClient.files()
            .search(filters)
            .then(restResponse => {
                const results = restResponse.getResults();
                if (results) {
                    // Check if user clicked in Tab or JSON format
                    if (e.detail.option.toUpperCase() === "TAB") {
                        const fields = ["id", "name", "path", "format", "bioformat", "size", "creationDate", "modificationDate", "internal.status.id"];
                        const data = UtilsNew.toTableString(results, fields);
                        UtilsNew.downloadData(data, "files_" + this.opencgaSession.study.id + ".tsv", "text/plain");
                    } else {
                        UtilsNew.downloadData(JSON.stringify(results, null, "\t"), "files_" + this.opencgaSession.study.id + ".json", "application/json");
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

    onPathChange(path) {
        LitUtils.dispatchCustomEvent(this, "pathChange", path);
    }

    onPathClear() {
        LitUtils.dispatchCustomEvent(this, "pathClear");
    }

    getRightToolbar() {
        return [
            {
                icon: "fa-file-medical",
                title: "Create File",
                onClick: () => this.changeActiveActionModal("create-file"),
            },
            {
                icon: "fa-folder-plus",
                title: "Create Folder",
                onClick: () => this.changeActiveActionModal("create-folder"),
            },
        ];
    }

    renderToolbarLeftContent() {
        const pathFragments = this.getCurrentPath()
            .split("/")
            .filter(Boolean)
            .map((fragment, index, array) => {
                const active = index === array.length - 1; // Last fragment is marked as active
                const path = array.slice(0, index + 1).join("/") + "/"; // Build again the path
                return html`
                    <span class="breadcrumb-item ${active ? "active" : "cursor-pointer hover:text-decoration-underline"}" @click="${() => this.onPathChange(path)}">
                        ${fragment}
                    </span>
                `;
            });

        return html`
            <div class="breadcrumb mb-0">
                <span class="breadcrumb-item ${pathFragments.length === 0 ? "active" : "cursor-pointer hover:text-decoration-underline"}" @click="${() => this.onPathClear()}">
                    <i class="fas fa-hdd pe-1"></i>
                    <span>DATA</span>
                </span>
                ${pathFragments}
            </div>
        `;
    }

    renderActionModal() {
        let config = null;

        switch (this.activeActionModal) {
            case "create-file":
                config = {
                    display: {
                        modalTitle: "Create File",
                        modalCyDataName: "modal-create",
                        modalSize: "modal-lg"
                    },
                    render: () => html`
                        <file-create
                            .opencgaSession="${this.opencgaSession}"
                            .path="${this.getCurrentPath()}"
                            .displayConfig="${{type: "form", buttonsLayout: "bottom"}}"
                            @fileCreate="${() => this.changeActiveActionModal("")}">
                        </file-create>
                    `,
                };
                break;
            case "create-folder":
                config = {
                    display: {
                        modalTitle: "Create Folder",
                        modalCyDataName: "modal-create",
                        modalSize: "modal-lg"
                    },
                    render: () => html`
                        <folder-create
                            .opencgaSession="${this.opencgaSession}"
                            .path="${this.getCurrentPath()}"
                            .displayConfig="${{type: "form", buttonsLayout: "bottom"}}"
                            @folderCreate="${() => this.changeActiveActionModal("")}">
                        </folder-create>
                    `,
                };
                break;
        }
        return config ? ModalUtils.create(this, `${this._prefix}Modal${this.activeActionModal}`, config) : nothing;
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
                    .config="${this.toolbarConfig}"
                    @columnChange="${this.onColumnChange}"
                    @download="${this.onDownload}"
                    @export="${this.onDownload}"
                    @actionClick="${e => this.onActionClick(e)}"
                    @fileCreate="${this.renderTable}">
                </opencb-grid-toolbar>
            ` : nothing}

            <div id="${this._prefix}GridTableDiv" class="force-overflow">
                <table id="${this.gridId}"></table>
            </div>

            ${this.renderActionModal()}
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

            showCreate: false,
            showExport: true,
            showSettings: true,
            exportTabs: ["download", "link", "code"],

            skipExtensions: false,
        };
    }

}

customElements.define("file-grid", OpencgaFileGrid);
