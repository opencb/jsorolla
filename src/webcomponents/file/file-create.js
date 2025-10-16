/**
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

import {html, LitElement} from "lit";
import LitUtils from "../commons/utils/lit-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import "../commons/forms/data-form.js";
import "../commons/filters/catalog-distinct-autocomplete.js";
import "../commons/filters/catalog-search-autocomplete.js";

export default class FileCreate extends LitElement {

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
            path: {
                type: String,
            },
            displayConfig: {
                type: Object
            },
        };
    }

    #init() {
        this.isLoading = false;
        this._file = {};
        this._config = this.getDefaultConfig();
        this.initOriginalObjects();
    }

    initOriginalObjects() {
        this._file = {
            path: this.path || "/",
        };
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("path")) {
            this.initOriginalObjects();
        }
        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    onFieldChange(e) {
        this._file = {...e.detail.data}; // force to refresh the object-list
        this.requestUpdate();
    }

    onClear() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Discard Changes",
            message: "This will discard all changes made on this form. Do you want to continue?",
            ok: () => {
                this.initOriginalObjects();
                this.requestUpdate();
            },
        });
    }

    onSubmit() {
        const {name, path, tags, ...otherFileData} = this._file;
        const data = {
            ...otherFileData,
            type: "FILE",
            resource: (path || "").startsWith("RESOURCES/"),
            tags: tags ? tags.split(",").map(t => t.trim()) : [],
            path: `${path || ""}${name}`,
        };

        this.#setLoading(true);
        this.opencgaSession.opencgaClient.files()
            .create(data, {
                study: this.opencgaSession.study.fqn,
            })
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Create File",
                    message: `File ${name} created correctly`,
                });
                LitUtils.dispatchCustomEvent(this, "fileCreate", null, data);
                this.initOriginalObjects();
            })
            .catch(error => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
            })
            .finally(() => {
                this.#setLoading(false);
            });
    }

    render() {
        if (this.isLoading) {
            return html`
                <loading-spinner></loading-spinner>
            `;
        }

        return html`
            <data-form
                .data="${this._file}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${e => this.onClear(e)}"
                @submit="${e => this.onSubmit(e)}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                titleWidth: 3,
                defaultLayout: "horizontal",
                buttonOkText: "Create File",
                buttonClearText: "Discard Changes",
                ...this.displayConfig,
            },
            sections: [
                {
                    elements: [
                        {
                            title: "Path",
                            field: "path",
                            type: "custom",
                            display: {
                                render: (path, onFieldChange) => html`
                                    <catalog-search-autocomplete
                                        .value="${path}"
                                        .resource="${"DIRECTORY"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{
                                            multiple: false,
                                        }}"
                                        @filterChange="${e => onFieldChange(e.detail.value)}">
                                    </catalog-search-autocomplete>
                                `,
                                helpMessage: "Path where the file will be created.",
                            },
                        },
                        {
                            title: "File Name",
                            field: "name",
                            type: "input-text",
                            required: true,
                            display: {
                                helpMessage: "Name of the file to be uploaded (including extension).",
                            },
                        },
                        {
                            title: "Tags",
                            field: "tags",
                            type: "custom",
                            display: {
                                render: (tags, onFilterChange) => html`
                                    <catalog-distinct-autocomplete
                                        .opencgaSession="${this.opencgaSession}"
                                        .resource="${"FILE"}"
                                        .value="${(tags || []).join(",")}"
                                        .queryField="${"tags"}"
                                        .distinctFields="${"tags"}"
                                        .config="${{
                                            freeTag: true,
                                        }}"
                                        @filterChange="${event => onFilterChange(event.detail.value)}">
                                    </catalog-distinct-autocomplete>
                                `,
                            },
                        },
                        {
                            title: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                helpMessage: "Description of the file to be uploaded.",
                            },
                        },
                        {
                            title: "Content",
                            field: "content",
                            type: "input-text",
                            required: true,
                            display: {
                                rows: 10,
                                helpMessage: "Content of the file to be uploaded. Maximum size is 1MB.",
                            },
                        },
                    ],
                },
            ],
        };
    }
}

customElements.define("file-create", FileCreate);
