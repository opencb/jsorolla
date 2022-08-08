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
import "./file-view.js";
import "./file-preview.js";

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
            file: {
                type: Object
            },
            fileId: {
                type: String
            },
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this.file = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("fileId")) {
            this.fileIdObserver();
        }
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
        super.update(changedProperties);
    }

    fileIdObserver() {
        if (this.opencgaSession && this.fileId) {
            this.opencgaSession.opencgaClient.files().info(this.fileId, {study: this.opencgaSession.study.fqn})
                .then(restResponse => {
                    this.file = restResponse.responses[0].results[0];
                })
                .catch(restResponse => {
                    this.file = null;
                    console.error(restResponse);
                });
        } else {
            this.file = null;
        }
    }

    render() {
        if (!this.opencgaSession) {
            return "";
        }

        return html`
            <detail-tabs
                .data="${this.file}"
                .config="${this._config}"
                .opencgaSession="${this.opencgaSession}">
            </detail-tabs>
        `;
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
