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
import "./file-preview.js";
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
            file: {
                type: Object
            },
            fileId: {
                type: String
            },
            opencgaSession: {
                type: Object
            },
            preview: {
                type: Boolean
            },
            mode: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this.file = {};
        this.preview = false;
        this.config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("fileId")) {
            this.fileIdObserver();
        }
        if (changedProperties.has("preview")) {
            this.config = this.getDefaultConfig();
        }
        if (changedProperties.has("mode")) {
            this.config = this.getDefaultConfig();
        }
        if (changedProperties.has("config")) {
            this.config = {...this.getDefaultConfig(), ...this.config};
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
                    this.file = null;
                    console.error(response);
                });
        }
    }

    render() {
        if (!this.file) {
            return html`
                <div class="alert alert-info"><i class="fas fa-3x fa-info-circle align-middle"></i> File not found.</div>`;
        }

        return html`
            <data-form
                .data="${this.file}"
                .config="${this.config}">
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
                        }
                    ]
                },
                {
                    title: "File Preview",
                    display: {
                        visible: () => this.preview === true || this.mode === "full",
                        layout: "vertical",
                        collapsed: false
                    },
                    elements: [
                        {
                            // title: "Name",
                            field: "name"
                        },
                        {
                            // title: "Preview",
                            type: "custom",
                            display: {
                                render: file => html`
                                    <file-preview
                                        .file="${file}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .active="${true}">
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
