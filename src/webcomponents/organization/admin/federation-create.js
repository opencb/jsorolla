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
import LitUtils from "../../commons/utils/lit-utils.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";
import "../../commons/forms/data-form.js";

export default class FederationCreate extends LitElement {

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
            displayConfig: {
                type: Object,
            },
        };
    }

    #init() {
        this.isLoading = false;
        this.displayConfigDefault = {
            style: "margin: 10px",
            titleWidth: "4",
            width: "8",
            defaultLayout: "horizontal",
            buttonOkText: "Create Federation",
            buttonClearText: "Discard",
        };
        this.#initOriginalObjects();
    }

    #initOriginalObjects() {
        this._federation = {

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
        this._federation = {...e.detail.data}; // force to refresh the object-list
        this.requestUpdate();
    }

    onClear() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Clear Folder",
            message: "Are you sure to clear?",
            ok: () => {
                this.#initOriginalObjects();
                this.requestUpdate();
            },
        });
    }

    onSubmit() {
        const {name, ...otherFileData} = this._federation;
        const data = {
            ...otherFileData,
        };

        this.#setLoading(true);
        this.opencgaSession.opencgaClient.files()
            .create(data, {
                study: this.opencgaSession.study.fqn,
            })
            .then(() => {
                this.#initOriginalObjects();
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Create Federation",
                    message: `Federation ${name} created correctly`,
                });
                LitUtils.dispatchCustomEvent(this, "folderCreate", null, data);
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
                .data="${this._federation}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${e => this.onClear(e)}"
                @submit="${e => this.onSubmit(e)}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Create New Federation",
            display: {
                ...this.displayConfigDefault,
                ...this.displayConfig,
            },
            sections: [
                {
                    elements: [
                        {
                            title: "Federation ID",
                            field: "id",
                            type: "input-text",
                            required: true,
                            display: {
                                defaultValue: "",
                                help: {
                                    text: "Unique identifier for the federation.",
                                }
                            },
                        },
                        {
                            title: "Email",
                            field: "email",
                            type: "input-text",
                            required: true,
                            display: {
                                help: {
                                    text: "Invitation email for the federation.",
                                },
                            }
                        },
                        {
                            title: "User ID",
                            field: "userId",
                            type: "input-text",
                            display: {
                                help: {
                                    text: "Name for the user that will be associated with the federation. If not provided, the federation ID will be used.",
                                },
                            }
                        },
                        {
                            title: "Federation Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                help: {
                                    text: "Description of the federation.",
                                },
                            }
                        },
                    ],
                },
            ],
        };
    }
}

customElements.define("federation-create", FederationCreate);
