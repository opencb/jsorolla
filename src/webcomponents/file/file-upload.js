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
import LitUtils from "../commons/utils/lit-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import CatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import "../commons/forms/data-form.js";
import "../commons/filters/catalog-distinct-autocomplete.js";
import "../loading-spinner.js";

export default class FileUpload extends LitElement {

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
                type: Object,
            },
        };
    }

    #init() {
        this._displayConfigDefault = {
            buttonOkText: "Upload File",
            buttonClearText: "Discard Changes",
        };
        this._file = {};
        this._config = this.getDefaultConfig();
        this._isLoading = false;
    }

    #setLoading(value) {
        this._isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("displayConfig") || changedProperties.has("path")) {
            this._file.relativeFilePath = "/" + this.path;
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    onFieldChange(event) {
        this._file = {...event.detail.data};

        // if user selects a local file and the fileName is not set, then set the fileName with the name of the file
        if (event.detail.param === "file" && event.detail.value?.name && !event.detail.data.fileName) {
            this._file.fileName = event.detail.value.name;
        }

        this.requestUpdate();
    }

    onClear() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Clear File Upload",
            message: "Are you sure to clear?",
            ok: () => {
                this._file = {};
                this.requestUpdate();
            },
        });
    }

    onSubmit() {
        const params = {
            study: this.opencgaSession.study.fqn,
            file: this._file.file,
            fileName: this._file.fileName || this._file.file.name, // get the name from the uploaded file
            relativeFilePath: this._file.relativeFilePath.substring(1) || this.path,
            description: this._file.description || "",
            resource: this._file.resource ?? false,
            tags: this._file.tags ? this._file.tags.split(",").map(t => t.trim()) : [],
        };

        this.#setLoading(true);
        this.opencgaSession.opencgaClient.files()
            .upload(params)
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Upload File",
                    message: `File ${this._file.fileName || this._file.file.name} uploaded correctly.`,
                });
                this._file = {}; // reset the file data
                LitUtils.dispatchCustomEvent(this, "fileUpload", null, params);
            })
            .catch(error => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
            })
            .finally(() => {
                this.#setLoading(false);
            });
    }

    render() {
        if (this._isLoading) {
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
                ...this._displayConfigDefault,
                ...this.displayConfig,
            },
            sections: [
                {
                    elements: [
                        {
                            title: "Path",
                            field: "relativeFilePath",
                            type: "custom",
                            display: {
                                disabled: () => this._uploading,
                                render: (path = "/", onFieldChange) => html`
                                    <div>
                                        <catalog-search-autocomplete
                                            .value="${path}"
                                            .resource="${"DIRECTORY"}"
                                            .opencgaSession="${this.opencgaSession}"
                                            .config="${{multiple: false}}"
                                            @filterChange="${e => onFieldChange(e.detail.value)}">
                                        </catalog-search-autocomplete>
                                    </div>
                                `,
                                helpMessage: "Path where the files will be uploaded.",
                            },
                        },
                        {
                            title: "Select File",
                            field: "file",
                            type: "custom",
                            required: true,
                            display: {
                                render: (file, onFilterChange) => html`
                                    <input class="form-control" type="file" @change="${e => onFilterChange(e.target.files[0])}">
                                `,
                                helpMessage: "Select the file to be uploaded. Maximum file size: 5GB",
                            },
                        },
                        {
                            title: "File Name",
                            field: "fileName",
                            type: "input-text",
                            display: {
                                helpMessage: "Name of the file to be uploaded. If not provided, the name of the uploaded file will be used.",
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
                            title: "Resource",
                            field: "resource",
                            type: "checkbox",
                            display: {
                                disabled: () => {
                                    return !CatalogUtils.isAdmin(this.opencgaSession?.study, this.opencgaSession?.user?.id);
                                },
                                helpMessage: "If checked, the file will be created as a resource. This option is only available for study administrators.",
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
                    ],
                },
            ],
        };
    }

}

customElements.define("file-upload", FileUpload);
