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
import "../commons/forms/data-form.js";

export default class FileView extends LitElement {

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
            },
            mode: {
                type: String
            }
        };
    }

    _init() {
        this._config = this.getDefaultConfig();
        this.file = {};
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
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
                .then(response => {
                    this.file = response.responses[0].results[0];
                })
                .catch(response => {
                    console.error(response);
                });
        } else {
            this.file = null;
        }
    }

    render() {
        return this.file && html`
            <data-form
                .data=${this.file}
                .config="${this._config}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Summary",
            icon: "",
            display: {
                buttonsVisible: false,
                collapsable: true,
                titleVisible: false,
                titleWidth: 2,
                defaultValue: "-",
            },
            sections: [
                {
                    title: "General",
                    display: {
                        // width: 10,
                        collapsed: false
                    },
                    elements: [
                        {
                            title: "File ID",
                            type: "custom",
                            display: {
                                render: data => html`
                                    <span style="font-weight: bold">${data.id}</span> (UUID: ${data.uuid})
                                `,
                            }
                        },
                        {
                            title: "Name",
                            field: "name"
                        },
                        {
                            title: "Study Path",
                            field: "path"
                        },
                        {
                            title: "Size",
                            field: "size",
                            type: "custom",
                            display: {
                                render: field => html`${UtilsNew.getDiskUsage(field)}`
                            }
                        },
                        {
                            title: "Format (Bioformat)",
                            type: "complex",
                            display: {
                                template: "${format} (${bioformat})",
                            }
                        },
                        {
                            title: "Tags",
                            field: "tags",
                            type: "list",
                            display: {
                                separator: ", ",
                            }
                        },
                        {
                            title: "Creation Date",
                            field: "creationDate",
                            type: "custom",
                            display: {
                                render: field => html`${UtilsNew.dateFormatter(field)}`,
                            }
                        },
                        {
                            title: "Status",
                            field: "internal.status",
                            type: "custom",
                            display: {
                                render: field => field ? html`${field.name} (${UtilsNew.dateFormatter(field.date)})` : "-",
                            }
                        },
                        {
                            title: "Index Status",
                            field: "internal.index.status",
                            type: "custom",
                            display: {
                                render: field => field?.name ? html`${field.name} (${UtilsNew.dateFormatter(field.date)})` : "-",
                            }
                        },
                        {
                            title: "Preview",
                            type: "custom",

                            display: {
                                visible: this.mode === "full",
                                render: file => html`
                                    <file-preview
                                        .opencgaSession=${this.opencgaSession}
                                        .active="${true}"
                                        .file="${file}">
                                    </file-preview>
                                `,
                            }
                        }
                    ]
                }
            ]
        };
    }

}

customElements.define("file-view", FileView);
