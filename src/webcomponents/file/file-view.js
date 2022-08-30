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
import LitUtils from "../commons/utils/lit-utils";
import "./file-preview.js";
import "../commons/forms/data-form.js";
import "../loading-spinner.js";

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
            file: {
                type: Object
            },
            fileId: {
                type: String
            },
            search: {
                type: Boolean
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
            displayConfig: {
                type: Object
            }
        };
    }

    #init() {
        this.file = {};
        this.search = false;
        this.preview = false;
        this.isLoading = false;

        this.displayConfigDefault = {
            buttonsVisible: false,
            collapsable: true,
            titleVisible: false,
            titleWidth: 2,
            defaultValue: "-",
        };
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("fileId")) {
            this.fileIdObserver();
        }
        if (changedProperties.has("preview")) {
            this._config = this.getDefaultConfig();
        }
        if (changedProperties.has("mode")) {
            this._config = this.getDefaultConfig();
        }
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {...this.displayConfigDefault, ...this.displayConfig};
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    fileIdObserver() {
        if (this.fileId && this.opencgaSession) {
            const query = {
                study: this.opencgaSession.study.fqn
            };
            let error;
            this.#setLoading(true);
            this.opencgaSession.opencgaClient.files()
                .info(this.fileId, query)
                .then(response => {
                    this.file = response.responses[0].results[0];
                })
                .catch(reason => {
                    this.file = {};
                    error = reason;
                    console.error(reason);
                })
                .finally(() => {
                    this._config = this.getDefaultConfig();
                    LitUtils.dispatchCustomEvent(this, "fileSearch", this.file, {}, error);
                    this.#setLoading(false);
                });
        } else {
            this.file = {};
        }
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        if (!this.file?.id && this.search === false) {
            return html`
                <div class="alert alert-info">
                    <i class="fas fa-3x fa-info-circle align-middle" style="padding-right: 10px"></i>
                    No File ID found.
                </div>
            `;
        }

        return html`
            <data-form
                .data="${this.file}"
                .config="${this._config}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Summary",
            icon: "",
            display: this.displayConfig || this.displayConfigDefault,
            sections: [
                {
                    title: "Search",
                    display: {
                        visible: file => !file?.id && this.search === true,
                    },
                    elements: [
                        {
                            title: "File",
                            // field: "fileId",
                            type: "custom",
                            display: {
                                render: () => html `
                                    <catalog-search-autocomplete
                                        .value="${this.file?.id}"
                                        .resource="${"FILE"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{multiple: false}}"
                                        @filterChange="${e => this.onFilterChange(e)}">
                                    </catalog-search-autocomplete>
                                `,
                            },
                        },
                    ],
                },
                {
                    title: "General",
                    display: {
                        collapsed: false,
                    },
                    elements: [
                        {
                            title: "File ID",
                            type: "custom",
                            display: {
                                render: data => html`
                                    <span style="font-weight: bold">${data.id}</span> (UUID: ${data.uuid})
                                `,
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
                            type: "custom",
                            display: {
                                render: field => html`${UtilsNew.getDiskUsage(field)}`
                            },
                        },
                        {
                            title: "Format (Bioformat)",
                            type: "complex",
                            display: {
                                template: "${format} (${bioformat})",
                            },
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
                            type: "custom",
                            display: {
                                render: field => html`${UtilsNew.dateFormatter(field)}`,
                            },
                        },
                        {
                            title: "Status",
                            field: "internal.status",
                            type: "custom",
                            display: {
                                render: field => field ? html`${field.name} (${UtilsNew.dateFormatter(field.date)})` : "-",
                            },
                        },
                        {
                            title: "Index Status",
                            field: "internal.index.status",
                            type: "custom",
                            display: {
                                render: field => field?.name ? html`${field.name} (${UtilsNew.dateFormatter(field.date)})` : "-",
                            },
                        },
                    ],
                },
                {
                    title: "File Preview",
                    display: {
                        visible: () => this.preview === true || this.mode === "full",
                        layout: "vertical",
                        collapsed: false,
                    },
                    elements: [
                        {
                            field: "name",
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
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("file-view", FileView);
