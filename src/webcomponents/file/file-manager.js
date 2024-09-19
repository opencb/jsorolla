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

import {html, LitElement} from "lit";
import UtilsNew from "../../core/utils-new.js";
import "./file-view.js";
import "../loading-spinner.js";
import ModalUtils from "../commons/modal/modal-utils";

export default class FileManager extends LitElement {

    constructor() {
        super();
        this._init();
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

    _init() {
        this.currentRootId = ":";

        this.tree = null;
        this.fileId = null;
        this.loading = false;

        this._config = this.getDefaultConfig();
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

    opencgaSessionObserver() {
        this.currentRoot = null;
        if (this.opencgaSession) {
            this.loading = true;
            const query = {
                study: this.opencgaSession.study.fqn,
                maxDepth: 1,
                include: "id,name,path,size,format",
            };
            this.opencgaSession.opencgaClient.files()
                .tree(this.currentRootId, query)
                .then(restResponse => {
                    this.errorState = false;
                    this.tree = restResponse.getResult(0);
                    this.tree.visited = true;
                    this.currentRoot = this.tree;
                    this.requestUpdate();
                })
                .catch(restResponse => {
                    this.currentRoot = null;
                    if (restResponse.getEvents?.("ERROR")?.length) {
                        this.errorState = restResponse.getEvents("ERROR").map(error => error.message).join("<br>");
                    } else {
                        this.errorState = "Server Error";
                    }
                    console.error(restResponse);
                })
                .finally(() => {
                    this.loading = false;
                    this.requestUpdate();
                });
        }
    }

    async fetchFolder(node) {
        try {
            if (!node.visited) {
                const restResponse = await this.opencgaSession.opencgaClient.files()
                    .tree(node.file.id, {study: this.opencgaSession.study.fqn, maxDepth: 1, include: "id,name,path,size,format"});
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
                /****** file manager ********/
                .file-manager {
                    padding: 0;
                }

                .file-manager > li {
                    border-radius: 3px;
                    background-color: #373743;
                    width: 307px;
                    height: 118px;
                    list-style-type: none;
                    margin: 10px;
                    display: inline-block;
                    position: relative;
                    overflow: hidden;
                    padding: 0.3em;
                    z-index: 1;
                    cursor: pointer;
                    box-sizing: border-box;
                    transition: 0.3s background-color;
                }

                .file-manager-breadcrumbs {
                    padding: 10px;
                }

                .file-manager-breadcrumbs a,
                .file-manager-breadcrumbs .path-separator {
                    font-size: 1.5em;
                    cursor: pointer;
                }

                .file-manager li a {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                }

                .file-manager li:hover {
                    background-color: #42424E;
                }

                .file-manager li:hover .icon {
                    color: #286090;
                }

                .file-manager .icon {
                    margin: 1em;
                    background-color: transparent;
                    overflow: hidden;
                }
                .file-manager .content {
                    width: 210px;
                }

                .file-manager .name {
                    color: #ffffff;
                    font-size: 15px;
                    font-weight: 700;
                    line-height: 20px;
                    word-break: break-all;
                }

                .file-manager .name .max-lines-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .file-manager .details {
                    color: #b6c1c9;
                    font-size: 13px;
                    font-weight: 400;
                    width: 55px;
                    height: 10px;
                    white-space: nowrap;
                    display: block;
                }
                .file-manager .format {
                    display: block;
                    color: #fff;
                    text-align: center;
                    margin-top: 3px;
                    width: 45px;
                    text-overflow: ellipsis;
                    overflow: hidden;
                }
                .file-manager .file.active {
                    background-color: #3aafdc;
                    color: white;
                    outline: thick solid #d0d0d0;
                }

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

                .opencga-file-manager .opencga-file-view {
                    margin-left: 5px;
                }

                .opencga-file-manager .file-manager-full-height,
                .opencga-file-manager .file-manager-tree{
                    min-height: calc(100vh - 160px);
                }

                /* temp fix for long filenames in opencga-file-manager  */
                .opencga-file-manager .file-manager-tree .file {
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

    renderFileManager(root) {
        const children = root.children;
        return html`
            ${this.path(root)}
            <div class="file-manager text-center p-2">
                <div class="row row-cols-5 gap-1">
                    ${children.map(node => {
                        if (node.file.type.toUpperCase() === "DIRECTORY") {
                            return html`${this.folder(node)}`;
                        } else if (["FILE", "VIRTUAL"].includes(node.file.type.toUpperCase())) {
                            return html`${this.file(node)}`;
                        } else {
                            throw new Error("Type not recognized " + node.file.type);
                        }
                    })}
                </div>
            </div>
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
                ${children.map(node => {
                    if (node.file.type === "DIRECTORY") {
                        return html`
                            <li class="folder">
                                <!-- <span class="badge">\${node.children.length}</span>-->
                                ${this.renderTree(node)}
                            </li>`;
                    } else if (["FILE", "VIRTUAL"].includes(node.file.type.toUpperCase())) {
                        return html`
                            <p class="file ${this.fileId === node.file.id ? "active" : ""}" @click="${() => this.onClickFile(node.file.id)}">
                                ${this.icon(node.file.format)} ${node.file.name}
                            </p>`;
                    } else {
                        throw new Error("Type not recognized " + node.file.type);
                    }
                })}
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

    folder(node) {
        return html`
            <div class="col card mb-3 rounded-3 shadow-sm">
                <div class="card-body text-center w-100" @click="${() => this.route(node.file.id)}">
                    <div class="d-flex gap-2 align-items-center">
                        <span><i class="fas fa-folder fa-4x"></i></span>
                        <div class="fs-6 text-break p-1" style="width:80%">
                            ${node.file.name}
                            <!-- <span class="details">\${node.children.length} items</span> -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    file(node) {
        return html`
            <div class="col card mb-3 rounded-3 shadow-sm file ${this.fileId === node.file.id ? "active" : ""}">
                <div class="card-body text-center w-100" @click="${() => this.onClickFile(node.file.id)}">
                    <div class="d-flex gap-2 align-items-center">
                        <div class="d-flex flex-column">
                            ${this.icon(node.file.format, 4)}
                            <span>
                                ${node.file.format !== "UNKNOWN" ? node.file.format : ""}
                            </span>
                        </div>
                        <span class="fs-6 text-break p-3">
                        ${node.file.name}
                        <span class="">${UtilsNew.getDiskUsage(node.file.size)}</span>
                    </span>
                    </div>

                </div>
            </div>
        `;
    }

    path(node) {
        const path = node.file.id.split(":").filter(Boolean);
        return html`
            <div class="file-manager-breadcrumbs">
                <a @click="${this.reset}"> ~ </a> <span class="path-separator">/</span>
                ${path.map((name, i) => html`<a @click="${() => this.route(path.slice(0, i + 1).join(":") + ":")}"> ${name} </a> <span class="path-separator">/</span>`)}
            </div>`;
    }

    async route(id, resetFileId = true) {
        this.currentRoot = this.searchNode(id, this.tree);
        this.currentRoot.exploded = true;

        if (!this.currentRoot.visited) {
            await this.fetchFolder(this.currentRoot);
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
        this.requestUpdate();
    }

    newFolder() {
        return ModalUtils.create(this, `${this._prefix}UpdateModal`, {
            display: {
                modalTitle: "Job Update",
                modalDraggable: true,
                modalSize: "modal-lg",
            },
            render: active => html`
                <job-update
                    .jobId="${this.jobUpdateId}"
                    .active="${active}"
                    .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                    .opencgaSession="${this.opencgaSession}">
                </job-update>
            `,
        });
    }

    render() {
        if (!this.opencgaSession || !this.currentRoot) {
            return null;
        }

        return html`
            ${this.renderStyles()}
            <div class="opencga-file-manager">
                <tool-header title="${this._config.title}" icon="${this._config.icon}"></tool-header>

                <div class="row file-manager-full-height">
                    <div class="file-manager-tree left-menu col-md-3">
                        ${this.tree ? html`${this.renderTree(this.tree)}` : null}
                    </div>

                    <div class="file-manager-grid col-md-9">
                        ${this.errorState ? html`
                            <div id="error" class="alert alert-danger" role="alert">
                                ${this.errorState}
                            </div>
                        ` : null}
                        ${this.loading ? html`
                            <div id="loading">
                                <loading-spinner></loading-spinner>
                            </div>
                        ` : null}


                        <div class="row">
                            <div class="col-9">
                                <button type="button" class="btn btn-primary float-end" @click="${this.newFolder}">New Folder ...</button>
                            </div>
                        </div>

                        ${this.currentRoot ? html`
                            <div>
                                ${this.renderFileManager(this.currentRoot)}
                            </div>
                            ${this.fileId ? html`
                                <div class="opencga-file-view">
                                    <file-view
                                        .opencgaSession="${this.opencgaSession}"
                                        .fileId="${this.fileId}"
                                        mode="full">
                                    </file-view>
                                </div>
                            ` : null}
                        ` : null}
                    </div>
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            title: "File Explorer",
            icon: "img/tools/icons/file_explorer.svg"
        };
    }

}

customElements.define("file-manager", FileManager);
