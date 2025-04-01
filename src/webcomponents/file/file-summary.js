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
import UtilsNew from "../../core/utils-new.js";
import "./file-preview.js";
import "../commons/forms/data-form.js";

export default class FileSummary extends LitElement {

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
            preview: {
                type: Boolean
            },
            displayConfig: {
                type: Object
            }
        };
    }

    #init() {
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

        if (changedProperties.has("displayConfig") || changedProperties.has("preview")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    fileIdObserver() {
        this._file = null;
        if (this.fileId && this.opencgaSession) {
            this.opencgaSession.opencgaClient.files()
                .info(this.fileId, {
                    study: this.opencgaSession.study.fqn,
                })
                .then(response => {
                    this._file = response.responses[0].results[0];
                    this.requestUpdate();
                })
                .catch(reason => {
                    console.error(reason);
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
                buttonsVisible: false,
                titleVisible: false,
                ...this.displayConfig,
            },
            sections: [
                {
                    title: "General",
                    elements: [
                        {
                            title: "File ID",
                            type: "complex",
                            display: {
                                template: "${id} (UUID: ${uuid})",
                                style: {
                                    id: {
                                        "font-weight": "bold",
                                    }
                                },
                            },
                        },
                        {
                            title: "Name",
                            field: "name",
                        },
                        {
                            title: "Study Path",
                            field: "path",
                        },
                        {
                            title: "Size",
                            field: "size",
                            display: {
                                format: field => UtilsNew.getDiskUsage(field),
                            },
                        },
                        {
                            title: "Format",
                            field: "format",
                        },
                        {
                            title: "Tags",
                            field: "tags",
                            type: "list",
                            display: {
                                separator: ", ",
                            },
                        },
                        {
                            title: "Creation Date",
                            field: "creationDate",
                            display: {
                                format: date => UtilsNew.dateFormatter(date),
                            },
                        },
                        {
                            title: "Status",
                            type: "complex",
                            display: {
                                template: "${internal.status.id} (${internal.status.date})",
                                format: {
                                    "internal.status.date": date => UtilsNew.dateFormatter(date),
                                }
                            },
                        },
                        {
                            title: "Variant Index Status",
                            type: "complex",
                            display: {
                                template: "${internal.variant.index.status.id} (${internal.variant.index.status.date})",
                                format: {
                                    "internal.variant.index.status.date": date => UtilsNew.dateFormatter(date),
                                }
                            },
                        },
                    ],
                },
                {
                    title: "File Preview",
                    display: {
                        visible: file => file?.id && this.preview === true,
                        layout: "vertical",
                    },
                    elements: [
                        {
                            field: "name",
                        },
                        {
                            type: "custom",
                            display: {
                                render: file => html`
                                    <file-preview
                                        .file="${file}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .active="${true}">
                                    </file-preview>
                                `,
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("file-summary", FileSummary);
