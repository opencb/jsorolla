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

import {LitElement, html} from "lit";
import UtilsNew from "../../core/utilsNew.js";
import "./file-view.js";
import "../loading-spinner.js";

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
            this.opencgaSession.opencgaClient.files().tree(this.currentRootId, query)
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
                const restResponse = await this.opencgaSession.opencgaClient.files().tree(node.file.id, {study: this.opencgaSession.study.fqn, maxDepth: 1, include: "id,name,path,size,format"});
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

    renderFileManager(root) {
        const children = root.children;
        return html`
            ${this.path(root)}
            <ul class="file-manager">
                ${children.map(node => {
                    if (node.file.type.toUpperCase() === "DIRECTORY") {
                        return html`${this.folder(node)}`;
                    } else if (node.file.type.toUpperCase() === "FILE") {
                        return html`${this.file(node)}`;
                    } else {
                        throw new Error("Type not recognized " + node.file.type);
                    }
                })}
            </ul>
        `;
    }

    renderTree(root) {
        const children = root.children;
        const domId = `tree-${root.file.id.replace(/:/g, "")}`;
        return html`
            ${root.file.name !== "." ? html`
                    <i @click="${() => this.toggleFolder(domId, root)}" class="fas fa-angle-${root.exploded ? "down" : "right"}"></i>
                    <a class="folder-name ${domId} ${root.exploded ? "exploded" : ""}" @click="${() => this.toggleFolder(domId, root)}"> ${root.file.name} </a>
                ` : html`
                    <i class="fas fa-home"></i> <a class="home" @click="${this.reset}"> Home</a>`}

            <ul class="">
                ${children.map(node => {
                    if (node.file.type === "DIRECTORY") {
                        return html`
                            <li class="folder">
                                <!-- <span class="badge">\${node.children.length}</span>-->
                                ${this.renderTree(node)}
                            </li>`;
                    } else if (node.file.type.toUpperCase() === "FILE") {
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
            <li class="folder">
                <a @click="${() => this.route(node.file.id)}">
                    <span class="icon"><i class="fas fa-folder fa-4x"></i></span>
                    <span class="content">
                        <span class="name"><span class="max-lines-2"> ${node.file.name} </span>
                        <!-- <span class="details">\${node.children.length} items</span> -->
                    </span>
                </a>
            </li>
        `;
    }

    file(node) {
        return html`
            <li class="file ${this.fileId === node.file.id ? "active" : ""}">
                <a @click="${() => this.onClickFile(node.file.id)}">
                    <span class="icon">${this.icon(node.file.format, 4)}<span class="format">${node.file.format !== "UNKNOWN" ? node.file.format : ""}</span></span>
                    <span class="content">
                        <span class="name">
                            <span class="max-lines-2">
                                ${node.file.name}
                            </span>
                        </span>
                        <span class="details">${UtilsNew.getDiskUsage(node.file.size)}</span>
                    </span>
                </a>
            </li>
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

    render() {
        if (!this.opencgaSession || !this.currentRoot) {
            return null;
        }

        return html`
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
