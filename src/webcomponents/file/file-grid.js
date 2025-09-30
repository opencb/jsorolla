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
import LitUtils from "../commons/utils/lit-utils.js";
import "../commons/grid-toolbar.js";
import "../loading-spinner.js";
import "../sample/sample-view.js";
import "../job/job-view.js";
import "./file-folder-create.js";
import "./file-create.js";
import "./file-upload.js";
import "./file-fetch.js";
import "./file-view.js";
import "./file-editor.js";
import "../variant/operation/variant-index-operation.js";

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
        this.RESOURCE = "FILE";
        this._prefix = UtilsNew.randomString(8);
        this.gridId = this._prefix + this.COMPONENT_ID;
        this.active = true;
        this.lastFilters = null;
        this._selectedFile = null;
        this._selectedSampleId = null;
        this._selectedJobId = null;
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
            resource: this.RESOURCE,
            columns: this._getDefaultColumns(),
        };

        // register the available modals
        this.gridCommons.registerModals({
            "view": () => ({
                display: {
                    modalTitle: `File ${this._selectedFile?.name}`,
                    modalSize: "modal-3xl",
                    modalCyDataName: `modal-file-view`,
                    modalDraggable: true,
                },
                render: () => html`
                    <file-view
                        .fileId="${this._selectedFile.id}"
                        .opencgaSession="${this.opencgaSession}">
                    </file-view>
                `,
            }),
            "edit-content": () => ({
                display: {
                    title: `Update ${this._selectedFile?.name} Content`,
                    size: "modal-xl",
                    buttonsVisible: false,
                },
                render: () => html`
                    <file-editor
                        .path="${this._selectedFile.path || this._selectedFile.id}"
                        .opencgaSession="${this.opencgaSession}"
                        @fileContentSave="${() => {
                            this.gridCommons.clearActiveModal();
                            this.table.bootstrapTable("refresh");
                        }}">
                    </file-editor>
                `,
            }),
            "create-folder": {
                display: {
                    modalTitle: "Create Folder",
                    modalSize: "modal-lg",
                    modalCyDataName: "modal-create",
                    modalDraggable: true,
                },
                render: () => html`
                    <file-folder-create
                        .opencgaSession="${this.opencgaSession}"
                        .path="${this.getCurrentPath()}"
                        .displayConfig="${{type: "form", buttonsLayout: "bottom"}}"
                        @folderCreate="${event => {
                            this.gridCommons.clearActiveModal();
                            this.table.bootstrapTable("refresh");
                            this.onPathCreate(event.detail.path);
                        }}">
                    </file-folder-create>
                `,
            },
            "create-file": {
                display: {
                    modalTitle: "Create File",
                    modalSize: "modal-lg",
                    modalCyDataName: "modal-create",
                    modalDraggable: true,
                },
                render: () => html`
                    <file-create
                        .opencgaSession="${this.opencgaSession}"
                        .path="${this.getCurrentPath()}"
                        .displayConfig="${{type: "form", buttonsLayout: "bottom"}}"
                        @fileCreate="${event => {
                            this.gridCommons.clearActiveModal();
                            this.table.bootstrapTable("refresh");
                            this.onPathCreate(event.detail.path);
                        }}">
                    </file-create>
                `,
            },
            "upload-file": {
                display: {
                    modalTitle: "Upload File",
                    modalSize: "modal-lg",
                    modalCyDataName: "modal-upload",
                    modalDraggable: true,
                },
                render: () => html`
                    <file-upload
                        .opencgaSession="${this.opencgaSession}"
                        .path="${this.getCurrentPath()}"
                        .displayConfig="${{type: "form", buttonsLayout: "bottom"}}"
                        @fileUpload="${event => {
                            this.gridCommons.clearActiveModal();
                            this.table.bootstrapTable("refresh");
                            this.onPathCreate(event.detail.relativeFilePath + event.detail.fileName);
                        }}">
                    </file-upload>
                `,
            },
            "fetch-file": {
                display: {
                    modalTitle: "Fetch File",
                    modalSize: "modal-lg",
                    modalCyDataName: "modal-fetch",
                    modalDraggable: true,
                },
                render: () => html`
                    <file-fetch
                        .opencgaSession="${this.opencgaSession}"
                        .path="${this.getCurrentPath()}"
                        .displayConfig="${{type: "form", buttonsLayout: "bottom"}}"
                        @fileUpload="${() => {
                            this.gridCommons.clearActiveModal();
                            this.table.bootstrapTable("refresh");
                        }}">
                    </file-fetch>
                `,
            },
            "variant-index": {
                display: {
                    modalTitle: "Run Variant Index",
                    modalSize: "modal-lg",
                    modalCyDataName: "modal-variant-index",
                    modalDraggable: true,
                },
                render: () => html`
                    <variant-index-operation
                        .opencgaSession="${this.opencgaSession}"
                        .toolParams="${{
                            file: this._selectedFile.id,
                            study: this.opencgaSession.study.fqn,
                        }}">
                    </variant-index-operation>
                `,
            },
            "view-sample": () => ({
                display: {
                    modalTitle: `Sample ${this._selectedSampleId}`,
                    modalSize: "modal-3xl",
                    modalCyDataName: "sample-view",
                    modalDraggable: true,
                },
                render: () => html`
                    <sample-view
                        .sampleId="${this._selectedSampleId}"
                        .opencgaSession="${this.opencgaSession}">
                    </sample-view>
                `,
            }),
            "view-job": () => ({
                display: {
                    modalTitle: `Job ${this._selectedJobId}`,
                    modalSize: "modal-3xl",
                    modalCyDataName: "job-view",
                    modalDraggable: true,
                },
                render: active => html`
                    <job-view
                        .jobId="${this._selectedJobId}"
                        .active="${active}"
                        .opencgaSession="${this.opencgaSession}">
                    </job-view>
                `,
            }),
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
                loadingTemplate: () => GridCommons.loadingFormatter(),
                ajax: params => {
                    let filesResponse = null;
                    const filters = {
                        study: this.opencgaSession.study.fqn,
                        // type: "FILE",
                        limit: params.data.limit,
                        skip: params.data.offset || 0,
                        count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                        include: "id,name,path,type,uuid,sampleIds,jobId,status,format,bioformat,size,creationDate,modificationDate,internal,annotationSets,attributes.variantFileMetadata.header.version",
                        ...this.query
                    };
                    // When searching by directory we must also show directories
                    // if (this.filters.directory) {
                    //     this.filters.type = "FILE,DIRECTORY";
                    // }

                    // Store the current filters
                    this.lastFilters = filters;
                    this.opencgaSession.opencgaClient.files()
                        .search(filters)
                        .then(response => {
                            filesResponse = response;
                            // Prepare data for columns extensions
                            const rows = filesResponse.responses?.[0]?.results || [];
                            return this.gridCommons.prepareDataForExtensions(this.COMPONENT_ID, this.opencgaSession, filters, rows);
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
                onDblClickRow: row => {
                    if (row.type === "DIRECTORY") {
                        this.onPathChange(row.path);
                    }
                },
                onLoadSuccess: data => this.gridCommons.onLoadSuccess(data),
                onLoadError: (event, response) => this.gridCommons.onLoadError(event, response),
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
            classes: "table table-borderless table-hover table-grid",
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
            loadingTemplate: () => GridCommons.loadingFormatter(),
            onPostBody: data => this.gridCommons.onLoadSuccess({rows: data, total: data.length}),
        });
    }

    getCurrentPath() {
        return this.query?.directory || (this.query?.path || "").slice(2, -2);
    }

    _getDefaultColumns() {
        this._columns = [
            {
                id: "icon",
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
                    const parentPath = "/" + row.path.split("/").slice(0, -1).join("/").replace(/\/\//g, "/");
                    return `
                        <a class="link fw-bold my-1" data-action="view">${fileName}</a>
                        <div class="text-secondary my-1">${parentPath}</div>
                    `;
                },
                events: {
                    "click a": (event, value, row) => this.onActionClick(event, row),
                },
                visible: this.gridCommons.isColumnVisible("name")
            },
            {
                id: "format",
                title: "Format",
                field: "format",
                formatter: (format, file) => {
                    let result = "-";
                    if (file.type === "FILE") {
                        switch (file.format) {
                            case "VCF":
                                result = `
                                    <div class="my-1">${format}</div>
                                    <div class="text-secondary">${file.attributes?.variantFileMetadata?.header?.version?.replace("VCF", "") || ""}</div>
                                `;
                                break;
                            case "BAM":
                                result = format;
                                break;
                        }
                    }
                    return result;
                },
                visible: this.gridCommons.isColumnVisible("format")
            },
            {
                id: "size",
                title: "Size",
                field: "size",
                formatter: (size, file) => {
                    return file.type === "DIRECTORY" ? "-" : UtilsNew.getDiskUsage(size);
                },
                visible: this.gridCommons.isColumnVisible("size")
            },
            {
                id: "sampleIds",
                title: "Samples",
                field: "sampleIds",
                formatter: sampleIds => {
                    const samples = (sampleIds || []).map(sampleId => {
                        return `<a class="link fw-bold" data-action="view-sample" data-sample="${sampleId}">${sampleId}</a>`;
                    });
                    return GridCommons.generateExpandCollapseContent(samples, 3);
                },
                events: {
                    "click a": (event, value, row) => this.onActionClick(event, row),
                },
                visible: this.gridCommons.isColumnVisible("sampleIds")
            },
            {
                id: "jobId",
                title: "Job",
                field: "jobId",
                formatter: jobId => {
                    return jobId ? `<a class="link fw-bold" data-action="view-job" data-job="${jobId}">${jobId}</a>` : "-";
                },
                events: {
                    "click a": (event, value, row) => this.onActionClick(event, row),
                },
                visible: this.gridCommons.isColumnVisible("jobId")
            },
            {
                id: "index",
                title: "Variant Index Status",
                field: "internal.variant.index.status.id",
                formatter: (status, file) => {
                    let result = "-";
                    if (file.type === "FILE") {
                        switch (file.format) {
                            case "VCF":
                                result = file.internal?.variant?.index?.status?.id || "-";
                                break;
                            case "BAM":
                                result = file.internal?.alignment?.index?.status?.id || "-";
                                break;
                        }
                    }
                    return result;
                },
                visible: this.gridCommons.isColumnVisible("index"),
            },
            {
                id: "creationDate",
                title: "Creation date",
                field: "creationDate",
                formatter: date => CatalogGridFormatter.dateFormatter(date),
                visible: this.gridCommons.isColumnVisible("creationDate")
            },
            {
                id: "actions",
                formatter: (value, row) => this.actionsFormatter(value, row),
                align: "right",
                events: {
                    "click a": (event, value, row) => this.onActionClick(event, row),
                },
                excludeFromExport: true,
                excludeFromSettings: true,
                visible: this._config.showActions,
            },
        ];

        if (this._config.annotations?.length > 0) {
            this.gridCommons.addColumnsFromAnnotations(this._columns, CatalogGridFormatter.customAnnotationFormatter, this._config);
        }

        this._columns = this.gridCommons.addColumnsFromExtensions(this.COMPONENT_ID, this.opencgaSession, this._columns);
        return this._columns;
    }

    actionsFormatter(value, row) {
        const hasWritePermission = this.gridCommons.hasPermission("WRITE");
        const hasDownloadPermission = this.gridCommons.hasPermission("DOWNLOAD");
        const hasDeletePermission = this.gridCommons.hasPermission("DELETE");
        const isStudyAdmin = OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user.id);
        const downloadUrl = OpencgaCatalogUtils.getDownloadFileUrl(this.opencgaSession, row.id);
        return `
            <div class="d-flex justify-content-end align-items-center gap-1">
                <div class="d-inline-block dropdown">
                    <button class="btn" type="button" data-bs-toggle="dropdown">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div class="dropdown-menu dropdown-menu-end">
                        <a class="dropdown-item ${!row.id || row.id === "." ? "disabled" : "cursor-pointer"}" data-action="view">
                            <i class="fas fa-eye me-1"></i>
                            <span>View</span>
                        </a>
                        <a data-action="copy-json" class="dropdown-item cursor-pointer">
                            <i class="fas fa-copy me-1" aria-hidden="true"></i> Copy JSON
                        </a>
                        <a data-action="download-json" class="dropdown-item cursor-pointer">
                            <i class="fas fa-download me-1" aria-hidden="true"></i> Download JSON
                        </a>
                        <hr class="dropdown-divider">
                        <a data-action="download" target="_blank" class="dropdown-item ${row.type === "DIRECTORY" || !hasDownloadPermission ? "disabled" : "cursor-pointer"}" href="${downloadUrl}">
                            <i class="fas fa-download me-1"></i> Download
                        </a>
                        <a data-action="edit-content" class="dropdown-item ${this.isUpdateContentAllowed(row) && hasDownloadPermission && hasWritePermission ? "cursor-pointer" : "disabled"}">
                            <i class="fas fa-edit me-1"></i> Update Content
                        </a>
                        <a data-action="variant-index" class="dropdown-item ${row.format === "VCF" && isStudyAdmin ? "cursor-pointer" : "disabled"}">
                            <i class="fas fa-rocket me-1"></i> Run Variant Index
                        </a>
                        <hr class="dropdown-divider">
                        <a data-action="delete" class="dropdown-item ${hasDeletePermission ? "cursor-pointer" : "disabled"}">
                            <i class="fas fa-trash me-1" aria-hidden="true"></i> Delete
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    isUpdateContentAllowed(file) {
        return file.type === "FILE" && ["TAB_SEPARATED_VALUES", "COMMA_SEPARATED_VALUES", "XML", "JSON", "PLAIN", "PED", "JAVASCRIPT", "NONE", "UNKNOWN"].includes(file.format);
    }

    onActionClick(event, file) {
        const action = (event.currentTarget?.dataset?.action || "").toLowerCase();
        switch (action) {
            case "view":
                this._selectedFile = file;
                this.gridCommons.changeActiveModal("view");
                break;
            case "copy-json":
                UtilsNew.copyToClipboard(JSON.stringify(file, null, "\t"));
                break;
            case "download-json":
                UtilsNew.downloadData([JSON.stringify(file, null, "\t")], file.id + ".json");
                break;
            case "variant-index":
                this._selectedFile = file;
                this.gridCommons.changeActiveModal("variant-index");
                break;
            case "delete":
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
                    title: `Delete <b>${file.name}</b>`,
                    message: `Do you want to delete the ${file.type === "DIRECTORY" ? "directory" : "file"} <b>${file.name}</b>? This action can not be undone.`,
                    ok: () => this.onDelete(file),
                });
                break;
            case "view-sample":
                this._selectedSampleId = event.currentTarget.dataset.sample;
                this.gridCommons.changeActiveModal("view-sample");
                break;
            case "view-job":
                this._selectedJobId = event.currentTarget.dataset.job;
                this.gridCommons.changeActiveModal("view-job");
                break;
            case "edit-content":
                this._selectedFile = file;
                this.gridCommons.changeActiveModal("edit-content");
                break;
        }
    }

    onDelete(file) {
        const params = {
            study: this.opencgaSession.study.fqn,
        };

        // FIXME 20241217 VERO: When trying to delete a file fetched from an external source in the root path:
        //  - If delete is used, opencga returns error "Use unlink". This is happening because the field "external" in this case is set to true in opencga.
        //  - If unlink is used, opencga returns error "[...] Could not unlink [...] Could not delete file: No documents could be found to be updated".
        //  Bug created:  https://app.clickup.com/t/36631768/TASK-7291
        const endpoint = file.external ?
            this.opencgaSession.opencgaClient.files().unlink(file.id, params) :
            this.opencgaSession.opencgaClient.files().delete(file.id, params);
        endpoint
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    message: `A new job has been launched to delete the ${file.type === "DIRECTORY" ? "directory" : "file"} ${file.name}.`,
                });
            })
            .catch(error => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
            });
    }

    async onDownload(e) {
        this.toolbarConfig = {...this.toolbarConfig, downloading: true};
        this.requestUpdate();
        await this.updateComplete;

        const filters = {
            ...this.lastFilters,
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

    onPathCreate(newPath) {
        LitUtils.dispatchCustomEvent(this, "pathCreate", newPath);
    }

    renderToolbarLeftContent() {
        const pathFragments = this.getCurrentPath()
            .split("/")
            .filter(Boolean)
            .map((fragment, index, array) => {
                const active = index === array.length - 1; // Last fragment is marked as active
                const path = array.slice(0, index + 1).join("/") + "/"; // Build again the path
                return html`
                    <span class="breadcrumb-item ${active ? "active" : "cursor-pointer hover:text-decoration-underline"}"
                          @click="${() => this.onPathChange(path)}">
                        ${fragment}
                    </span>
                `;
            });

        return html`
            <div class="breadcrumb mb-0">
                <span class="breadcrumb-item ${pathFragments.length === 0 ? "active" : "cursor-pointer hover:text-decoration-underline"}"
                      @click="${() => this.onPathClear()}">
                    <i class="fas fa-hdd pe-1"></i>
                    <span>DATA</span>
                </span>
                ${pathFragments}
            </div>
        `;
    }

    getRightToolbar() {
        const hasWritePermission = this.gridCommons.hasPermission("WRITE");
        const hasUploadPermission = this.gridCommons.hasPermission("UPLOAD");
        const hasJobExecutionPermission = this.gridCommons.hasPermission("EXECUTE", "JOB");

        return [
            {
                icon: "fa-folder-plus",
                title: "Create Folder",
                disabled: !hasWritePermission,
                onClick: () => this.gridCommons.changeActiveModal("create-folder"),
            },
            {
                icon: "fa-file-medical",
                title: "Create File",
                disabled: !hasWritePermission,
                onClick: () => this.gridCommons.changeActiveModal("create-file"),
            },
            {
                icon: "fa-file-upload",
                title: "Upload File",
                disabled: !hasWritePermission || !hasUploadPermission,
                onClick: () => this.gridCommons.changeActiveModal("upload-file"),
            },
            {
                icon: "fas fa-cloud-download-alt",
                title: "Fetch File",
                disabled: !hasWritePermission || !hasJobExecutionPermission,
                onClick: () => this.gridCommons.changeActiveModal("fetch-file"),
            },
        ];
    }

    render() {
        return html`
            ${this._config.showToolbar ? html`
                <grid-toolbar
                    .resource="${"FILE"}"
                    .toolId="${this.toolId}"
                    .query="${this.query}"
                    .opencgaSession="${this.opencgaSession}"
                    .leftContent="${this.renderToolbarLeftContent()}"
                    .rightToolbar="${this.getRightToolbar()}"
                    .settings="${this.toolbarSetting}"
                    .config="${this.toolbarConfig}"
                    @download="${this.onDownload}"
                    @export="${this.onDownload}">
                </grid-toolbar>
            ` : nothing}

            <div id="${this._prefix}GridTableDiv" class="force-overflow">
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

customElements.define("file-grid", OpencgaFileGrid);
