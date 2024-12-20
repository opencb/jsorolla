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
import ModalUtils from "../commons/modal/modal-utils";
import GridCommons from "../commons/grid-commons";
import "../commons/data-list.js";
import "../loading-spinner.js";
import "./file-view.js";
import "./file-delete.js";
import "./folder-create.js";
import "./file-create.js";
import "./file-fetch.js"
import NotificationUtils from "../commons/utils/notification-utils";
import LitUtils from "../commons/utils/lit-utils";

export default class FileDataManager extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            root: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this.COMPONENT_ID = "file-manager";
        this._prefix = UtilsNew.randomString(8);
        this.resource = "FILE";
        this.currentRootId = ":";

        this.tree = null;
        this.currentRoot = null;
        this.fileId = null;
        this.loading = false;

        this.preparedQuery = {};
        this.lastFilters = {};

        const entityActions = [
            {
                id: "folder-create",
                tooltip: "New Folder",
                icon: "fas fa-folder-plus",
                modalTitle: "Create Folder",
                modalId: `${this._prefix}FolderCreateModal`,
                render: () => this.renderFolderCreate(),
                // permission: this.permissions["organization"](),
            },
            {
                id: "file-create",
                tooltip: "New File",
                icon: "fas fa-file",
                modalTitle: "Create File",
                modalId: `${this._prefix}FileCreateModal`,
                render: () => this.renderFileCreate(),
            },
            // Note 20241211 Vero: Disabled for now. Endpoint not implemented.
            {
                id: "file-upload",
                tooltip: "Upload File",
                action: null,
                icon: "fas fa-upload",
                permission: "disabled",
            },
            {
                id: "file-fetch",
                tooltip: "Fetch File",
                icon: "fas fa-cloud-download-alt",
                modalTitle: "Fetch File",
                modalId: `${this._prefix}FileFetchModal`,
                render: () => this.renderFileFetch(),
            }
        ];
        const instanceActions = [
            {
                id: "file-view",
                title: "View",
                icon: "fas fa-file-alt",
                modalTitle: "View File",
                modalId: `${this._prefix}FileViewModal`,
                render: () => this.renderFileView(),
                // permission: this.permissions["organization"](),
            },
            {
                id: "file-copy",
                title: "Copy JSON",
                icon: "fas fa-copy",
                render: () => this.renderFileCopy(),
            },
            /*
            {
                id: "file-execute",
                title: "View",
                icon: "",
                modalTitle: "Execute",
                modalId: `${this._prefix}FileExecuteModal`,
                render: () => this.renderFileExecute(),
                // permission: this.permissions["organization"](),
            },
            */
            {
                id: "file-delete",
                title: "Delete",
                icon: "far fa-trash-alt",
                render: () => this.renderFileDelete(),
            },

        ];

        this.actions = {
            "entity": entityActions,
            "instance": instanceActions,
        };

        this.currentAction = {};

        this._config = this.getDefaultConfig();
    }
    x

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }


    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }

        super.update(changedProperties);
    }

    updated(changedProperties) {
        super.firstUpdated(changedProperties);

        UtilsNew.initTooltip(this);
    }

    opencgaSessionObserver() {
        if (this.opencgaSession) {
            this.#setLoading(true);
            this.fetchFolder(this.currentRootId)
                .then(response => {
                    this.errorState = false;
                    this.tree = response.getResult(0);
                    this.tree.visited = true;
                    this.currentRoot = this.tree;
                })
                .catch(error => {
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
                    LitUtils.dispatchCustomEvent(this, "getFolderFailed", null, {}, error);
                })
                .finally(() => {
                    this.#setLoading(false);
                });

        }
    }

    fetchFolder(nodeId) {
        const query = {
            study: this.opencgaSession.study.fqn,
            maxDepth: 1,
            include: "id,name,path,size,format,bioformat,sampleIds,jobId,internal",
        };
        return this.opencgaSession.opencgaClient.files().tree(nodeId, query);
    }

    /*
    async fetchFolder(node) {
        try {
            if (!node.visited) {
                const restResponse = await this.opencgaSession.opencgaClient.files()
                    .tree(node.file.id, {study: this.opencgaSession.study.fqn, maxDepth: 1, include: "id,name,path,format,size,sampleIds,jobId,internal"});
                const result = restResponse.getResult(0);
                node.children = result.children;
                node.visited = true;
            }
            this.errorState = false;
            this.requestUpdate();
        } catch (restResponse) {
            if (restResponse.getEvents?.("ERROR")?.length) {
                this.errorState = restResponse.getEvents("ERROR").map(error => error.message).join("<br>");
            } else {
                this.errorState = "Server Error";
            }
            console.error(restResponse);
        }
    }
     */

    searchNode(nodeId, baseNode) {
        if (nodeId === ":") {
            return this.tree;
        }
        if (baseNode.file.id === nodeId) {
            return baseNode;
        }
        if (baseNode.file.type.toUpperCase() === "DIRECTORY") {
            for (const f of baseNode.children) {
                const r = this.searchNode(nodeId, f);
                if (r) return r;
            }
        }
    }

    renderStyles() {
        return html`
            <style>
                .file-manager-tree {
                    border-right: 1px solid gainsboro;
                }

                .file-manager-tree ul {
                    font-size: 14px;
                    margin-top: 30px;
                }

                .file-manager-tree ul {
                    margin: 0;
                    padding: 0;
                    list-style-type: none;
                }

                .file-manager-tree .folder {
                    padding: 10px 0 0 15px;
                }

                .file-manager-tree .folder-name {
                    font-weight: bold;
                    word-break: break-all;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .file-manager-tree .folder-name,
                .file-manager-tree .home{
                    cursor: pointer;
                }

                .file-manager-tree .folder-name + ul {
                    display: none;
                }

                .file-manager-tree .folder-name.exploded + ul {
                    display: block;
                }

                .file-manager-tree .file {
                    word-break: break-all;
                    padding: 5px 0 0 12px;
                    cursor: pointer;
                    color: #337ab7;
                    transition: 0.3s background-color;
                }

                .file-manager-tree .file i{
                    margin-right: 10px;
                    color: #747474;
                }

                .file-manager-tree .file.active {
                    background-color: #f1f1f1;
                    color: black;
                }

                .file-manager-full-height,
                .file-manager-tree{
                    min-height: calc(100vh - 160px);
                }

                /* temp fix for long filenames in opencga-file-manager  */
                .file-manager-tree .file {
                    display: flex;
                }
                .file-manager-tree .file {
                    word-break: normal;
                }
                .file-manager-tree .folder {
                    overflow: auto;
                }

            </style>

        `;
    }

    renderTree(root) {
        const children = root.children;
        const domId = `tree-${root.file.id.replace(/:/g, "")}`;
        return html`
            ${root.file.name !== "." ? html`
                <i @click="${() => this.toggleFolder(domId, root)}" class="fas fa-angle-${root.exploded ? "down" : "right"}"></i>
                <a class="text-decoration-none folder-name ${domId} ${root.exploded ? "exploded" : ""}" @click="${() => this.toggleFolder(domId, root)}"> ${root.file.name} </a>
            ` : html`
                <i class="fas fa-home"></i> <a class="text-decoration-none home" @click="${this.reset}"> Home</a>`}

            <ul>
                ${
                    children.map(node => {
                        switch (node.file.type.toUpperCase()) {
                            case "DIRECTORY":
                                return html`
                                <li class="folder">
                                    <!-- <span class="badge">\${node.children.length}</span>-->
                                    ${this.renderTree(node)}
                                </li>`;
                            case "FILE":
                            case "VIRTUAL":
                                return html`
                                <p class="file ${this.fileId === node.file.id ? "active" : ""}" @click="${() => this.onClickFile(node.file.id)}">
                                    ${this.icon(node.file.format)} ${node.file.name}
                                </p>`;
                            default:
                                throw new Error("Type not recognized " + node.file.type);
                        }
                    })
                }
            </ul>
        `;
    }

    async toggleFolder(domId, node) {
        // check for the root
        if (domId !== "tree-") {
            if (!node.exploded) {
                /* node.exploded = true;
                if(!node.visited) {
                    await this.fetchFolder(node);
                }
                $("." + domId + "").addClass("exploded")*/
                await this.route(node.file.id);
            } else {
                node.exploded = false;
                $("." + domId + "").removeClass("exploded");
            }
            // console.log("toggle" + node.file.id);
            // console.log($("." + domId + " ul"));

        } else {
            console.error("no id!");
        }
        // $("." + id + " + ul").slideToggle();
        this.requestUpdate();
        await this.updateComplete;
    }

    icon(format, size) {
        const icon = {
            IMAGE: "fas fa-file-image",
            VCF: "fas fa-file"
        }[format];
        return html`<i class="${icon || "fas fa-file"}${size ? ` fa-${size}x` : ""}"></i>`;
    }

    renderBreadcrumb(node) {
        const path = node.file.id.split(":").filter(Boolean);
        return html`
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb mb-0">
                    <li class="breadcrumb-item" @click="${this.reset}">~</li>
                    ${path.map((name, i) => html`
                        <li
                            class="breadcrumb-item ${i === path.length ? "active" : ""}"
                            @click="${() => this.route(path.slice(0, i + 1).join(":") + ":")}">
                            ${name}
                        </li>
                    `)}
                </ol>
            </nav>
        `;
    }

    route(id, resetFileId = true) {
        this.currentRoot = this.searchNode(id, this.tree);
        this.currentRoot.exploded = true;

        if (!this.currentRoot.visited) {
            /*
            await this.fetchFolder(this.currentRoot);
             */
            this.fetchFolder(this.currentRoot.file.id || this.currentRootId)
                .then(response => {
                    this.currentRoot.children = response.getResult(0).children;
                    this.currentRoot.visited = true;
                    this.requestUpdate();
                })
                .catch(error => {
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
                    LitUtils.dispatchCustomEvent(this, "getFolderFailed", null, {}, error);
                })
        } else {
            console.log("node already visited", this.currentRoot);
        }
        const domId = `tree-${id.replace(/:/g, "")}`;
        $("." + domId + "").addClass("exploded");
        if (resetFileId) {
            this.fileId = null;
        }
        this.requestUpdate();
    }

    reset() {
        this.currentRoot = this.tree;
        this.fileId = null;
        this.requestUpdate();
    }

    onClickFile(id) {
        const path = id.split(":").slice(0, -1).join(":") + ":";
        this.fileId = id;
        this.route(path, false);
    }

    onDblClickRow(e) {
        this.onClickFile(e.detail.value.id);
    }

    async onActionClick(e, value, file) {
        this.currentAction = this.actions[e.currentTarget.dataset.type].find(action => action.id === e.currentTarget.dataset.action);
        this.fileId = file?.id ?? "";
        this.file = file ?? {};
        this.requestUpdate();
        await this.updateComplete;
        ModalUtils.show(this.currentAction["modalId"]);
    }

    #initOriginalObjects() {
        this.currentAction = {};
        this.fileId = "";
        this.file = {};
        this.currentRoot.visited = false;
        this.route(this.currentRoot.file.id)
    }

    onFileAction(e,id) {
        ModalUtils.close(id);
        this.#initOriginalObjects();
    }

    onCloseNotification() {
        this.#initOriginalObjects();
    }

    onCheckRow(e) {}

    renderFolderCreate() {
        return ModalUtils.create(this, `${this.currentAction["modalId"]}`, {
            display: {
                modalTitle: this.currentAction["modalTitle"],
                modalDraggable: true,
                modalSize: "modal-lg",
            },
            render: () => {
                return html`
                    <folder-create
                        .path="${this.currentRoot.file.path}"
                        .opencgaSession="${this.opencgaSession}"
                        .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                        @folderCreate="${e => this.onFileAction(e, `${this.currentAction["modalId"]}`)}">
                    </folder-create>
                `;
            },
        });
    }

    renderFileCreate() {
        return ModalUtils.create(this, `${this.currentAction["modalId"]}`, {
            display: {
                modalTitle: this.currentAction["modalTitle"],
                modalDraggable: true,
                modalSize: "modal-lg",
            },
            render: () => {
                return html`
                    <file-create
                        .path="${this.currentRoot.file.path}"
                        .opencgaSession="${this.opencgaSession}"
                        .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                        @fileCreate="${e => this.onFileAction(e, `${this.currentAction["modalId"]}`)}">
                    </file-create>
                `;
            },
        });
    }

    renderFileFetch() {
        return ModalUtils.create(this, `${this.currentAction["modalId"]}`, {
            display: {
                modalTitle: this.currentAction["modalTitle"],
                modalDraggable: true,
                modalSize: "modal-lg",
            },
            render: () => {
                // FIXME 20241217 Vero: unlink files for fetched files not working. Waiting for Pedro's feedback.
                return html`
                    <file-fetch
                        .path="${this.currentRoot.file.path}"
                        .opencgaSession="${this.opencgaSession}"
                        .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                        @fileFetch="${e => this.onFileAction(e, `${this.currentAction["modalId"]}`)}">
                    </file-fetch>
                `;
            },
        });
    }

    renderFileView() {
        return ModalUtils.create(this, `${this.currentAction["modalId"]}`, {
            display: {
                modalTitle: "View File",
                modalDraggable: true,
                modalSize: "modal-lg",
            },
            render: () => html`
                <div class="mb-3">
                    <file-view
                        .opencgaSession="${this.opencgaSession}"
                        .fileId="${this.fileId}"
                        mode="full">
                    </file-view>
                </div>
            `,
        });
    }

    renderFileCopy() {
        UtilsNew.copyToClipboard(JSON.stringify(this.file, null, "\t"));
    }

    renderFileDelete() {
        return html`
            <file-delete
                .opencgaSession="${this.opencgaSession}"
                .fileId="${this.fileId}"
                @closeNotification="${e => this.onCloseNotification(e)}">
            </file-delete>
        `;
    }

    addSearch(action, icon = "fa-search", placeholder = "Search ...", className = "", style = "") {
        return html`
            <div class="input-group ${className}" style="${style}">
                ${icon ? html`
                    <div class="input-group-text" id="btnGroupAddon">
                        <i class="fas fa-search" aria-hidden="true"></i>
                    </div>
                ` : nothing}

                <input id="${this._prefix}InputSearch" type="text" class="form-control" placeholder="${placeholder}" aria-label="Input group example" aria-describedby="btnGroupAddon"
                       @input="${action}">
            </div>
        `;
    }

    renderEntityToolbar() {
        return html`
            <div class="btn-toolbar d-flex" role="toolbar" aria-label="Toolbar with button groups">
                <div class="m-2">
                    ${
                        this.actions["entity"].map(action => {
                            return html`
                                <button
                                    type="button"
                                    class="btn btn-outline-dark ms-2 ${action.permission}"
                                    data-action="${action.id}"
                                    data-type="entity"
                                    @click="${ (e, value, row) => this.onActionClick(e, value, row)}">
                                        ${action.icon ? html`<span><i class="${action.icon} fa-lg"></i></span>` : nothing}
                                        ${action.title ? html`${action.title}` : nothing}
                                </button>
                            `;
                        })
                    }
                </div>
                <!--
                <div class="m-2">
                    $this.addSearch(this.onSearch, "fa-search", "Search ...", "", "")}
                </div>
                -->
            </div>
        `;
    }

    #onViewChange(newView) {
        this.currentView = newView;
        this.requestUpdate();
    }

    renderToolViews() {
        return html`
            <div>
                ${this._config.views.map(view => html`
                    <button
                        class="${`btn btn-light ${this.currentView === view.id ? "active bg-primary text-white" : ""}`}"
                        @click="${() => this.#onViewChange(view.id)}">
                            ${view.icon ? html`
                                <i class="${`fas ${view.icon}`}"></i>
                            ` : null}
                            <strong>${view.name}</strong>
                    </button>
                `)}
            </div>
        `;
    }

    onQueryFilterChange(e) {
        this.preparedQuery = e.detail.query
        this.requestUpdate();
    }

    onQueryFilterSearch(e) {
        debugger
        let filesResponse = null;
        const query = {
            study: this.opencgaSession.study.fqn,
            type: this.preparedQuery.directory ? "FILE,DIRECTORY" : "FILE",
            include: "id,name,path,uuid,sampleIds,jobId,status,format,bioformat,size,creationDate,modificationDate,internal,annotationSets",
            ...this.preparedQuery,
        };

        // Store the current filters
        this.lastFilters = {query};
        this.opencgaSession.opencgaClient.files()
            .search(query)
            .then(response => {
                debugger
                this.currentRoot = {};
                // Prepare data for columns extensions
                this.searchResult = response.responses?.[0]?.results || [];
                this.requestUpdate()
            })
            .catch(error => {
                console.error(error);
            });
    }



    renderFilter() {
        const filter = this._config.filter;
        debugger
        return html`
            <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvas-${filter.id}" aria-labelledby="offcanvas-${filter.id}-Label">
                <div class="offcanvas-header d-flex justify-content-between">
                    <div class="d-flex align-items-center">
                        ${this._config.showQuery ? html`
                            <span
                                    class="flex-grow-1 me-2 text-gray-200"
                                    tooltip-title="VIEW QUERY"
                                    tooltip-text="${JSON.stringify(this.preparedQuery)}">
                                    <span class="fa-stack">
                                      <i class="fa fa-circle fa-stack-2x"></i>
                                      <i class="fa fa-code fa-xs fa-stack-1x text-gray-700"></i>
                                    </span>
                            </span>
                        `: nothing}
                        <h5 class="offcanvas-title flex-grow-1" id="offcanvasExampleLabel">FILE ${filter.name}</h5>
                    </div>
                    <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>
                <div class="offcanvas-body">
                    <opencga-browser-filter
                        .query="${this.preparedQuery}"
                        .resource="${this.resource}"
                        .opencgaSession="${this.opencgaSession}"
                        .config="${this._config.filter}"
                        @queryChange="${e => this.onQueryFilterChange(e)}"
                        @querySearch="${this.onQueryFilterSearch}">
                    </opencga-browser-filter>
                </div>
            </div>
        `;
    }

    render() {
        if (!this.opencgaSession || !this.currentRoot) {
            return null;
        }
debugger
        return html`
            ${this.renderStyles()}
            <tool-header
                title="${this._config.title}"
                subtitle="${this._config.subtitle}"
                icon="${this._config.icon}"
                .rhs="${this.renderToolViews()}">
            </tool-header>

            <div class="row w-full">
                <!-- TREE -->
                <!--
                <div class="file-manager-tree left-menu col-md-3">
                    ${this.tree ? html`${this.renderTree(this.tree)}` : null}
                </div>
                -->
                <!-- FILE MANAGER -->
                <div class="file-manager-grid col-md-9">
                    <!--
                    ${this.errorState ? html`
                    <div id="error" class="alert alert-danger" role="alert">
                        ${this.errorState}
                    </div>
                    ` : null}
                    -->
                    ${this.loading ? html`
                        <div id="loading">
                            <loading-spinner></loading-spinner>
                        </div>
                    ` : null}

                    <div class="px-2">
                        <!-- 0. Activated filters / search with filters -->
                        <div class="d-flex py-4">
                            <button
                                class="d-flex flex-grow-0 btn bg-secondary-subtle btn-sm"
                                style="cursor: pointer"
                                data-bs-toggle="offcanvas"
                                data-bs-target="#offcanvas-${this._config.filter.id}"
                                aria-controls="offcanvasExample">
                                <!-- Icon -->
                                <div class="me-2">
                                    <i class="${this._config.filter.icon}"></i>
                                </div>
                                <!-- Label -->
                                <div>
                                ${this._config.filter.label}
                                </div>
                                <!--<div>opencgaActiveFilters</div>-->
                            </button>
                        </div>
                            <!-- 1. Data list actions -->
                        ${UtilsNew.isNotEmpty(this.currentRoot) ? html`
                            <div class="d-flex justify-content-between border-bottom border-black">
                                <!-- BREADCRUMBS-->
                                <div class="d-flex align-items-center flex-grow-1">
                                    <div class="me-2 fw-bold">CURRENT PATH:</div>
                                    ${this.renderBreadcrumb(this.currentRoot)}
                                </div>
                                <!-- ENTITY ACTIONS TOOLBAR -->
                                <div>
                                    ${this.renderEntityToolbar()}
                                </div>
                            </div>
                        ` : html `
                            <div class="d-flex align-items-center flex-grow-1">
                                <div class="me-2 fw-bold">SEARCH RESULT</div>
                            </div>
                        `}
                        <!-- 2. Data list -->
                        <data-list
                            .data="${this.currentRoot?.children?.map(child => child.file) ?? this.searchResult}"
                            .config="${this._config.dataList}"
                            @doubleclickrow="${this.onDblClickRow}"
                            @checkrow="${this.onCheckRow}">
                        </data-list>
                    </div>
                </div>
            </div>
            <!-- 3. On entity action click, render the respective modal -->
            ${UtilsNew.isNotEmpty(this.currentAction) ? this.currentAction["render"](): nothing}
            <!-- 4. Render filter in offcanvas right-->
            ${this.renderFilter()}
        `;
    }

    getDefaultConfig() {
        return {
            showQuery: true,
            title: "Data Manager",
            subtitle: "This is a subtitle",
            // icon: "img/tools/icons/file_explorer.svg",
            dataList: {
                display: {
                    float: "left"
                },
                search: {
                    fields: ["id", "name", "description"],
                    placeholder: "Filter file ...",
                    ignoreCase: true
                },
                sortBy: {
                    options: [
                        {
                            id: "name",
                            name: "Name",
                            // order: "asc"
                        },
                        {
                            id: "modificationDate",
                            name: "Recently updated",
                            order: "desc"
                        },
                        {
                            id: "creationDate",
                            name: "Created",
                            order: "desc"
                        },
                    ]
                },
                groupBy: {
                    options: [
                        {
                            id: "type",
                            name: "File Type",
                            // values: ["SECONDARY_ANALYSIS", "RESEARCH_ANALYSIS", "CLINICAL_INTERPRETATION_ANALYSIS", "OTHER"]
                        },
                        {
                            id: "tags",
                            name: "Tags",
                        }
                    ]
                },
                table: {
                    showHeader: true,
                    checkbox: false,
                    checkboxIndex: 0,
                    options: {
                        classes: "table table-hover table-borderless",
                        theadClasses: "table-light",
                        buttonsClass: "light",
                        iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
                        icons: GridCommons.GRID_ICONS,
                        pagination: false,
                        pageSize: 100,
                        pageList: [100],
                        detailView: false,
                        rowStyle: ""
                    },
                    columns: [
                        {
                            title: "",
                            field: "type",
                            rowspan: 1,
                            colspan: 1,
                            formatter: value => {
                                debugger
                                return `
                                <div>
                                    <i class="${value === "DIRECTORY" ? "fas fa-folder" : "far fa-file"}"></i>
                                </div>
                            `;
                            },
                            width: "20",
                            widthUnit: "px"
                        },
                        {
                            title: "Name",
                            field: "name",
                            rowspan: 1,
                            colspan: 1,
                            formatter: value => {
                                return `
                                <div>
                                    <label style="cursor: pointer">${value}</label>
                                </div>
                            `;
                            },
                            events: {
                                "click label": (e, value, row) => this.onClickFile(row.id),
                            },
                            width: "20",
                            widthUnit: "%"
                        },
                        {
                            title: "Format",
                            field: "format",
                            rowspan: 1,
                            colspan: 1,
                            formatter: (value, row) => {
                                debugger
                                if (row.type === "DIRECTORY") {
                                    return "";
                                }
                                return `
                                <div>
                                    <label>${value || "-"}</label>
                                    <div class="d-block text-secondary my-1">
                                        ${row.internal.variant?.index?.status?.id === "READY" ? `Indexed ${UtilsNew.dateFormatter(row.internal.variant.index.status.date)}` : ""}
                                    </div>
                                </div>
                            `;
                            }
                        },
                        {
                            title: "Bioformat",
                            field: "bioformat",
                            rowspan: 1,
                            colspan: 1,
                        },
                        {
                            title: "Status",
                            field: "internal.status.id",
                            rowspan: 1,
                            colspan: 1,
                        },
                        {
                            title: "Tags",
                            field: "tags",
                            rowspan: 1,
                            colspan: 1,
                            formatter: value => {
                                return `
                                <div>
                                    <label>${value?.join(", ") || "-"}</label>
                                </div>
                            `;
                            }
                        },
                        {
                            title: "Size",
                            field: "size",
                            rowspan: 1,
                            colspan: 1,
                            formatter: value => UtilsNew.getDiskUsage(value),
                        },
                        {
                            title: "Creation Date",
                            field: "internal.registrationDate",
                            rowspan: 1,
                            colspan: 1,
                            formatter: value => {
                                return `
                                    <div>
                                        <div class="d-block text-secondary">${UtilsNew.dateFormatter(value)}</div>
                                    </div>
                                `;
                            }
                        },
                        {
                            title: "Modification Date",
                            field: "internal.lastModified",
                            rowspan: 1,
                            colspan: 1,
                            formatter: value => {
                                return `
                                    <div>
                                        <div class="d-block text-secondary">${UtilsNew.dateFormatter(value)}</div>
                                    </div>
                                `;
                            }
                        },
                        {
                            title: "Actions",
                            field: "actions",
                            rowspan: 1,
                            colspan: 1,
                            formatter: () => {
                                return `
                                    <div class="dropdown d-flex justify-content-end">
                                        <button type="button" class="btn" data-bs-toggle="dropdown" aria-expanded="false">
                                            <i class="fas fa-ellipsis-v"></i>
                                        </button>
                                        <ul class="dropdown-menu">
                                        ${this.actions["instance"].map(action => {
                                            return `
                                                <li>
                                                    <a
                                                    class="dropdown-item ${action.permission}"
                                                    data-action="${action.id}"
                                                    data-type="instance"
                                                    style="cursor:pointer;">
                                                        ${action.icon ? `<span><i class="${action.icon} pe-2"></i></span>` : ""}
                                                        ${action.title ? `${action.title}` : ""}
                                                    </a>
                                                </li>
                                            `;
                                        }).join("")}
                                        </ul>
                                    </div>
                                <!--
                                    <li>
                                        <a class="dropdown-item" href="#" data-action="view">
                                        <i class="fas fa-file-alt pe-2" aria-hidden="true"></i>View</a>
                                    </li>
                                    <li>
                                        <a class="dropdown-item" href="#" data-action="download">
                                        <i class="fas fa-download pe-2" aria-hidden="true"></i>Download</a>
                                    </li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li>
                                        <a class="dropdown-item" href="#" data-action="head">
                                        <i class="fas fa-file-alt pe-2" aria-hidden="true"></i>Head</a>
                                    </li>
                                    <li>
                                        <a class="dropdown-item" href="#" data-action="tail">
                                        <i class="fas fa-file-alt pe-2" aria-hidden="true"></i>Tail</a>
                                    </li>
                                    <li>
                                        <a class="dropdown-item" href="#" data-action="grep">
                                        <i class="fas fa-filter pe-2" aria-hidden="true"></i>Grep</a>
                                    </li>
                                    <li><hr class="dropdown-divider"></li>
                                     <li>
                                        <a class="dropdown-item" href="#" data-action="edit">
                                        <i class="fas fa-eraser pe-2" aria-hidden="true"></i>Edit ...</a>
                                    </li>
                                    <li>
                                        <a class="dropdown-item disabled" href="#" data-action="delete">
                                        <i class="fas fa-trash pe-2" aria-hidden="true"></i>Delete</a>
                                    </li>
                                    -->
                        `;
                            },
                            events: {
                                "click a": (e, value, row) => this.onActionClick(e, value, row),
                            },
                        }
                    ],
                },
                grid: {
                    options: {
                        columns: 3,
                        rowClass: "g-2",
                        cellClass: "p-2"
                    },
                    render: data => {
                        return html`
                            <div class="card">
                                <div class="card-header">
                                    <h4 class="card-title">
                                        ${data.id}
                                    </h4>
                                </div>
                                <div class="card-body">
                                    ${data.description}
                                </div>
                            </div>
                        `;
                    }
                }
            },
            views: [
                {
                    id: "datalist",
                    name: "",
                    icon: "fas fa-list",
                    display: {
                        titleVisible: true,
                    },
                    /*
                    render: () => html`
                        <clinical-analysis-browser
                            .opencgaSession="${this.opencgaSession}"
                            .settings="${this.settings}"
                            .config="${{componentId: "clinicalAnalysisBrowserPortal", showHeader: false}}">
                        </clinical-analysis-browser>
                    `,
                     */
                },
                {
                    id: "aggregation",
                    name: "",
                    icon: "far fa-chart-bar",
                    display: {
                        titleVisible: true,
                    },
                    /*
                    render: () => html`
                        <clinical-analysis-browser
                            .opencgaSession="${this.opencgaSession}"
                            .settings="${this.settings}"
                            .config="${{componentId: "clinicalAnalysisBrowserPortal", showHeader: false}}">
                        </clinical-analysis-browser>
                    `,
                     */
                },
            ],
            filter: {
                    id: "form-search",
                    icon: "fas fa-search",
                    label: "ACTIVE FILTERS",
                    name: "SEARCH",
                    searchButton: true,
                    sections: [
                        {
                            title: "Section title",
                            collapsed: false,
                            filters: [
                                {
                                    id: "directory",
                                    name: "Directory",
                                    type: "string",
                                    placeholder: "genomes/resources/files/...",
                                    description: ""
                                },
                                {
                                    id: "name",
                                    name: "Name",
                                    type: "string",
                                    placeholder: "accepted_hits.bam, phenotypes.vcf...",
                                    description: ""
                                },
                                /*
                                {
                                    id: "sampleIds",
                                    name: "Sample ID",
                                    type: "string",
                                    placeholder: "HG01879, HG01880, HG01881...",
                                    description: ""
                                },
                                 */
                                /*
                                {
                                    id: "jobId",
                                    name: "Job ID",
                                    type: "string",
                                    placeholder: "Job ID ...",
                                    description: "",
                                },
                                 */
                                {
                                    id: "format",
                                    name: "Format",
                                    type: "string",
                                    placeholder: "Format ...",
                                    description: ""
                                },
                                /* ToDo 2024-12-20
                                {
                                    id: "bioformat",
                                    name: "Bioformat",
                                    type: "string",
                                    placeholder: "Bioformat ...",
                                    description: ""
                                },
                                 */
                                /*
                                {
                                    id: "internalVariantIndexStatus",
                                    name: "Variant Index Status",
                                    multiple: true,
                                    // NOTE 20230310 Vero: The current internalVariantIndexStatus (internal.variant.index.status) vocabulary is:
                                    // "READY", "DELETED", "NONE", "TRANSFORMED", "TRANSFORMING", "LOADING", "INDEXING"
                                    // But the DELETED status gets mapped in opencga to NONE (Jacobo)
                                    allowedValues: ["READY", "NONE", "TRANSFORMED", "TRANSFORMING", "LOADING", "INDEXING"],
                                    type: "category"
                                },
                                 */
                                {
                                    id: "date",
                                    name: "Date",
                                    type: "date",
                                    description: ""
                                },
                                /*
                                {
                                    id: "annotations",
                                    name: "File Annotations",
                                    description: "",
                                }
                                 */
                            ],
                        },
                    ],
                },
        };
    }

}

customElements.define("file-data-manager", FileDataManager);
