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
        this.displayConfigDefault = {
            style: "margin: 10px",
            titleWidth: 3,
            defaultLayout: "horizontal",
            buttonOkText: "Create File",
            buttonClearText: "Discard Changes",
        };

        this.#initOriginalObjects();
    }

    #initOriginalObjects() {
        this._file = {
            type: "FILE",
        };
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
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
            title: "Clear File",
            message: "Are you sure to clear?",
            ok: () => {
                this.#initOriginalObjects();
                this.requestUpdate();
            },
        });
    }

    onSubmit() {
        const {name, ...otherFileData} = this._file;
        const data = {
            ...otherFileData,
            tags: otherFileData.tags ? otherFileData.tags.split(",") : [],
            path: `${this.path || ""}${name}`,
        };

        this.#setLoading(true);
        this.opencgaSession.opencgaClient.files()
            .create(data, {
                study: this.opencgaSession.study.fqn,
            })
            .then(() => {
                this.#initOriginalObjects();
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Create File",
                    message: `File ${name} created correctly`,
                });
                LitUtils.dispatchCustomEvent(this, "fileCreate", null, data);
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
                ...this.displayConfigDefault,
                ...this.displayConfig,
            },
            sections: [
                {
                    elements: [
                        {
                            title: "Path",
                            field: "path",
                            type: "input-text",
                            display: {
                                defaultValue: `/${this.path}`,
                                disabled: true,
                                helpMessage: "Path where the file will be uploaded.",
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
                            title: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                helpMessage: "Description of the file to be uploaded.",
                            },
                        },
                        {
                            title: "Tags",
                            field: "tags",
                            type: "input-text",
                            display: {
                                helpMessage: "Comma separated list of tags to be associated with the file.",
                                placeholder: "tag1,tag2",
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
