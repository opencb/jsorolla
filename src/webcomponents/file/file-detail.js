/*
 * Copyright 2015-2024 OpenCB
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
import "./file-view.js";
import "./file-preview.js";
import ExtensionsManager from "../extensions-manager.js";

export default class OpencgaFileDetail extends LitElement {

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
            config: {
                type: Object
            }
        };
    }

    #init() {
        this.COMPONENT_ID = "file-detail";
        this._file = null;
        this._config = this.getDefaultConfig();
        this.#updateDetailTabs();
    }

    update(changedProperties) {
        if (changedProperties.has("fileId")) {
            this.fileIdObserver();
        }

        if (changedProperties.has("file")) {
            this.fileObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
            this.#updateDetailTabs();
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
        this.requestUpdate();
    }

    #updateDetailTabs() {
        this._config.items = [
            ...this._config.items,
            ...ExtensionsManager.getDetailTabs(this.COMPONENT_ID),
        ];
    }

    render() {
        if (!this.opencgaSession) {
            return "";
        }

        return html`
            <detail-tabs
                .data="${this._file}"
                .config="${this._config}"
                .opencgaSession="${this.opencgaSession}">
            </detail-tabs>
        `;
    }

    getDefaultConfig() {
        return {
            title: "File",
            showTitle: true,
            display: {
                titleClass: "mt-4",
                contentClass: "p-3"
            },
            items: [
                {
                    id: "file-view",
                    name: "Overview",
                    active: true,
                    render: (file, active, opencgaSession) => html`
                        <file-view
                            .opencgaSession="${opencgaSession}"
                            .preview="${true}"
                            .file="${file}">
                        </file-view>
                    `,
                },
                {
                    id: "file-preview",
                    name: "Preview",
                    render: (file, active, opencgaSession) => html`
                        <file-preview
                            .opencgaSession=${opencgaSession}
                            .active="${active}"
                            .file="${file}">
                        </file-preview>
                    `,
                }
            ]
        };
    }

}

customElements.define("file-detail", OpencgaFileDetail);
