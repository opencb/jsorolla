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
import "./opencga-file-preview.js";

export default class OpencgaFileDetail extends LitElement {

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
            fileId: {
                type: String
            },
            file: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "sf-" + UtilsNew.randomString(6);
        this._config = this.getDefaultConfig();
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.file = null;
        }

        if (changedProperties.has("fileId")) {
            this.fileIdObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.requestUpdate();
        }
    }

    fileIdObserver() {
        if (this.opencgaSession && this.fileId) {
            this.opencgaSession.opencgaClient.files().info(this.fileId, {study: this.opencgaSession.study.fqn})
                .then(restResponse => {
                    this.file = restResponse.getResult(0);
                })
                .catch(restResponse => {
                    console.error(restResponse);
                });
        }
    }

    getDefaultConfig() {
        return {
            title: "File",
            showTitle: true,
            items: [
                {
                    id: "file-view",
                    name: "Overview",
                    active: true,
                    render: (file, active, opencgaSession) => {
                        return html` <opencga-file-view .opencgaSession="${opencgaSession}" .file="${file}"></opencga-file-view>`;
                    }
                },
                {
                    id: "file-preview",
                    name: "Preview",
                    render: (file, active, opencgaSession) => {
                        return html`<opencga-file-preview .opencgaSession=${opencgaSession} .active="${active}" .file="${file}"></opencga-file-preview>`;
                    }
                }
            ]
        };
    }

    render() {
        return this.opencgaSession && this.file
            ? html`
                <detail-tabs .data="${this.file}" .config="${this._config}" .opencgaSession="${this.opencgaSession}"></detail-tabs>`
            : null;
    }

}

customElements.define("opencga-file-detail", OpencgaFileDetail);
