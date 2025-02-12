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
import UtilsNew from "../../core/utils-new.js";
import LitUtils from "../commons/utils/lit-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import "../commons/forms/data-form.js";
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
        this._prefix = UtilsNew.randomString(8);
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
            title: "Clear File Upload",
            message: "Are you sure to clear?",
            ok: () => {
                this._file = {};
                this.requestUpdate();
            },
        });
    }

    onSubmit() {
        this.#setLoading(true);
        this.opencgaSession.opencgaClient.files()
            .upload({
                study: this.opencgaSession.study.fqn,
                file: this._file.file,
                fileName: this._file.fileName || this._file.file.name, // get the name from the uploaded file
                relativeFilePath: this.path,
                description: this._file.description || "",
            })
            .then(response => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Upload File",
                    message: `File ${this._file.fileName || this._file.file.name} uploaded correctly.`,
                });
                this._file = {}; // reset the file data
                LitUtils.dispatchCustomEvent(this, "fileUpload");
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
                            type: "input-text",
                            required: true,
                            display: {
                                defaultValue: `/${this.path || ""}`,
                                disabled: true,
                            },
                        },
                        {
                            title: "File Name",
                            field: "fileName",
                            type: "input-text",
                        },
                        {
                            title: "Description",
                            field: "description",
                            type: "input-text",
                        },
                        {
                            title: "Select File to upload",
                            field: "file",
                            type: "custom",
                            required: true,
                            display: {
                                render: (_, onFilterChange) => html`
                                    <input class="form-control" type="file" @change="${e => onFilterChange(e.target.files[0])}">
                                `,
                            }
                        },
                    ],
                },
            ],

        };
    }

}

customElements.define("file-upload", FileUpload);
