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

import {LitElement, html, nothing} from "lit";
import ExtensionsManager from "../extensions-manager.js";
import "../commons/forms/data-form.js";
import "../commons/json-viewer.js";
import "./file-summary.js";
import "./file-preview.js";

export default class FileView extends LitElement {

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
            file: {
                type: Object
            },
            fileId: {
                type: String
            },
            displayConfig: {
                type: Object,
            },
        };
    }

    #init() {
        this.COMPONENT_ID = "file-view";
        this._file = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("fileId")) {
            this.fileIdObserver();
        }

        if (changedProperties.has("file")) {
            this.fileObserver();
        }

        if (changedProperties.has("defaultConfig")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    fileIdObserver() {
        if (this.opencgaSession && this.fileId) {
            this.opencgaSession.opencgaClient.files()
                .info(this.fileId, {
                    study: this.opencgaSession.study.fqn,
                })
                .then(response => {
                    this._file = response.getResult(0);
                    this.requestUpdate();
                })
                .catch(response => {
                    console.error(response);
                });
        }
    }

    fileObserver() {
        this._file = {...this.file};
    }

    render() {
        if (!this.opencgaSession || !this._file) {
            return nothing;
        }

        return html`
            <data-form
                .data="${this._file}"
                .config="${this._config || {}}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                type: "tabs",
                buttonsVisible: false,
                ...this.displayConfig,
            },
            sections: [
                {
                    id: "file-summary",
                    name: "Overview",
                    render: (file, active) => html`
                        <file-summary
                            .opencgaSession="${this.opencgaSession}"
                            .active="${active}"
                            .file="${file}">
                        </file-summary>
                    `,
                },
                {
                    id: "file-preview",
                    name: "Preview",
                    render: (file, active) => html`
                        <file-preview
                            .opencgaSession=${this.opencgaSession}
                            .active="${active}"
                            .file="${file}">
                        </file-preview>
                    `,
                },
                {
                    id: "json-view",
                    name: "JSON Data",
                    render: (file, active) => html`
                        <json-viewer
                            .data="${file}"
                            .active="${active}">
                        </json-viewer>
                    `,
                },
                ...ExtensionsManager.getViews(this.COMPONENT_ID),
            ],
        };
    }

}

customElements.define("file-view", FileView);
