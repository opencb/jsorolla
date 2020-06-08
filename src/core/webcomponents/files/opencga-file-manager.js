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

import {LitElement, html} from "/web_modules/lit-element.js";
import UtilsNew from "../../utilsNew.js";
import "./opencga-file-view.js";
import "../commons/view/data-form.js";
import "../loading-spinner.js";

export default class OpencgaFileManager extends LitElement {

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
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }

        if (changedProperties.has("opencgaSession")) {
            this.opencgaSession.opencgaClient.files().tree(this.currentRootId, {study: this.opencgaSession.study.fqn, maxDepth: 3})
                .then(restResponse => {
                    this.tree = restResponse.getResult(0);
                    this.currentRoot = restResponse.getResult(0);
                    this.requestUpdate();
                })
                .catch(restResponse => {
                    console.error(restResponse);
                });
        }
    }

    async fetchFolder(fileId) {
        try {
            const folder = this.searchNode(fileId, this.tree.children);
            if (!folder.visited) {
                const restResponse = await this.opencgaSession.opencgaClient.files().tree(fileId, {study: this.opencgaSession.study.fqn, maxDepth: 3})
                const result = restResponse.getResult(0);
                folder.children = result.children;
                folder.visited = true;
                this.currentRoot = result;
            } else {
                this.currentRoot = folder;
            }

            console.log("current root", this.currentRoot)

            this.requestUpdate();
        } catch (restResponse) {
            console.error(restResponse);
        }
    }

    searchNode(nodeId, array) {
        for (const f of array) {
            if (f.file.id === nodeId) {
                return f;
            }
            if (f.file.type === "DIRECTORY") {
                const r = this.searchNode(nodeId, f.children || []);
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
            if (node.file.type === "DIRECTORY") {
                return html`${this.folder(node)}`;
            } else if (node.file.type === "FILE") {
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
        const id = `tree-${root.file.id.replace(/:/g, "-")}`;
        return html`
            ${root.file.name !== "." ? html`
                    <i @click="${() => this.toggleFolder(id, root)}" class="fas fa-angle-${root.exploded ? "down" : "right"}"></i> <a class="folder-name ${id}" @click="${() => this.route(root.file.id.replace(/:/g, "-"))}"> ${root.file.name} </a>
                ` : html`
                    <i class="fas fa-home"></i> <a @click="${() => this.reset}"> Home</a>`}
            
            <ul class="">
                ${children.map(node => {
                    if (node.file.type === "DIRECTORY") {
                        return html`
                            <li class="folder">
                                <!-- <span class="badge">${node.children.length}</span>-->
                                ${this.renderTree(node)}
                            </li>`;
                    } else if (node.file.type === "FILE") {
                        return html`
                            <p class="file" @click="${() => this.onClickFile(node.file.id)}">
                                ${node.file.name}
                            </p>`;
                    } else {
                        throw new Error("Type not recognized " + node.file.type);
                    }
                })}
            </ul>
        `;
    }

    async toggleFolder(id, node) {
        // TODO avoid this check and to execute fetchFolder in case of collapsing an <ul>
        //check for the root
        if (id !== "tree-") {
            if(!node.exploded) {
                node.exploded = true;
                await this.fetchFolder(node.file.id);
            } else {
                node.exploded = false;
            }
            console.log("toggle" + node.file.id);
            console.log($("." + id + " ul"));

        } else {
            console.log("no id")
        }
        $("." + id + " + ul").slideToggle();
    }


    folder(node) {
        return html`
            <li class="folder">
                <a @click="${() => this.fetchFolder(node.file.id)}">
                    <span class="icon"><i class="fas fa-folder fa-6x"></i></span>
                    <span class="name">${node.file.name}</span>
                    <span class="details">${node.children.length} items</span>
                </a>
            </li>
        `;
    }

    file(node) {
        return html`
            <li class="file">
                <a @click="${() => this.onClickFile(node.file.id)}">
                    <span class="icon"><i class="fas fa-file fa-6x"></i></span>
                    <span class="name">${node.file.name}</span>
                    <span class="details">${UtilsNew.getDiskUsage(node.file.size)}</span>
                </a>
            </li>
        `;
    }

    route(nodeId) {
        this.currentRoot = this.searchNode(nodeId, this.tree.children);
        this.fileId = null;
        this.requestUpdate();
    }

    reset() {
        this.currentRoot = this.tree;
        this.fileId = null;
        this.requestUpdate();
    }

    path(node) {
        const path = node.file.id.split(":").filter(Boolean);
        return html`
            <div class="file-manager-breadcrumbs">
                <a @click="${this.reset}"> ~ </a> <span class="path-separator">/</span>
                ${path.map((name, i) => html`<a @click="${() => this.route(path.slice(0, i + 1).join(":") + ":")}"> ${name} </a> <span class="path-separator">/</span>`)}
            </div>`;
    }

    onClickFile(id) {
        this.fileId = id;
        this.requestUpdate();
    }

    getDefaultConfig() {
        return {
            title: "Summary",
            icon: ""
        };
    }


    render() {
        return html`
            <div class="page-title">
                <h2>
                    <i aria-hidden="true" class="fas fa-file"></i>&nbsp;File Manager
                </h2>
            </div>
            
            <div class="row">
                <div class="col-md-2 left-menu file-manager-tree">
                    ${this.tree ? html`${this.renderTree(this.tree)}` : null}
                    
                </div>

                <div class="col-md-10">
                    ${this.currentRoot ? html`
                        <div>
                            ${this.renderFileManager(this.currentRoot)}
                        </div>
                    <opencga-file-view .opencgaSession="${this.opencgaSession}" .fileId="${this.fileId}"></opencga-file-view>
                ` : html`<loading-spinner></loading-spinner>`}
                    
                </div>
            </div>
            
        `;
    }
}

customElements.define("opencga-file-manager", OpencgaFileManager);
