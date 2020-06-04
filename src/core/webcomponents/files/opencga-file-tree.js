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
import "../commons/view/data-form.js";


export default class OpencgaFileTree extends LitElement {

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

    firstUpdated(_changedProperties) {
        this.opencgaSession.opencgaClient.files().tree(this.currentRootId, {study: this.opencgaSession.study.fqn, maxDepth:3})
            .then(restResponse => {
                this.tree = restResponse.getResult(0);
                this.currentRoot =  restResponse.getResult(0);
                this.requestUpdate();
            })
            .catch(restResponse => {
                console.error(restResponse);
            });
    }

    updated(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    fetchFolder(fileId) {
        this.opencgaSession.opencgaClient.files().tree(fileId, {study: this.opencgaSession.study.fqn, maxDepth:3})
            .then(restResponse => {
                const result = restResponse.getResult(0);
                const folder = this.searchNode(fileId, this.tree.children);
                folder.children = result.children;
                this.currentRoot = result;
                this.requestUpdate();
            })
            .catch(restResponse => {
                console.error(restResponse);
            });
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

    renderEntry(root) {
        const children = root.children;
        return html`
            ${this.path(root)}
            <ul class="file-manager">
                ${children.map(node => {
                    if (node.file.type === "DIRECTORY") {
                        return html`${this.folder(node)}`    
                    } else if (node.file.type === "FILE") {
                        return html`${this.file(node)}`
                    } else {
                        throw new Error("Type not recognized " + node.file.type)
                    }
                }) }
            </ul>
        `;
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
        `
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
        `
    }

    route(nodeId) {
        this.currentRoot = this.searchNode(nodeId, this.tree.children);
        this.requestUpdate();
    }

    reset() {
        this.currentRoot = this.tree;
        this.requestUpdate();
    }

    path(node) {
        console.log(node)
        const path = node.file.id.split(":").filter(_ => _);
        console.log("path", path)
        return html`
            <div class="file-manager-breadcrumbs">
                <a @click="${this.reset}"> &compfn; </a> <span class="path-separator">/</span>
                ${path.map( (name,i) => html`<a @click="${() => this.route(path.slice(0,i + 1).join(":") + ":")}"> ${name} </a> <span class="path-separator">/</span>`)}
            </div>`
    }

    onClickFolder() {

    }

    onClickFile(id) {
        console.log("onClickFile", id)
    }

    getDefaultConfig() {
        return {
            title: "Summary",
            icon: ""
        };
    }

    render() {
        if (this.currentRoot) {
            return html`
            <div>
                ${this.renderEntry(this.currentRoot)}
            </div>
        `;
        } else {
            return html`no root`;
        }
    }

}

customElements.define("opencga-file-tree", OpencgaFileTree);
