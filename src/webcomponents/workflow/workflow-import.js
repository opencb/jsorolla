/**
 * Copyright 2015-2022 OpenCB
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

import { html, LitElement } from "lit";
import LitUtils from "../commons/utils/lit-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";

export default class WorkflowImport extends LitElement {

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
                type: Object
            },
        };
    }

    #init() {
        this.workflow = {
            name: "",
            tag: "",
            user: "",
            password: ""
        };
        this.isLoading = false;
        this.displayConfigDefault = {
            style: "margin: 10px",
            titleWidth: 3,
            defaultLayout: "horizontal",
            buttonOkText: "Import"
        };
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = { ...this.displayConfigDefault, ...this.displayConfig };
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    onFieldChange(e) {
        this.workflow = { ...e.detail.data };
        this.requestUpdate();
    }

    onClear() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Clear Workflow",
            message: "Are you sure to clear?",
            ok: () => {
                this.workflow = {};
                this._config = this.getDefaultConfig();
                this.requestUpdate();
            },
        });
    }

    onSubmit(e, row) {
        const params = {
            study: this.opencgaSession.study.fqn,
        };
        let error;
        this.#setLoading(true);
        this.opencgaSession.opencgaClient.userTool()
            .importWorkflow({ name: this.workflow.name }, params)
            .then(() => {
                this.workflow = {};
                this._config = this.getDefaultConfig();
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Workflow Import",
                    message: `New workflow ${this.workflow.name} imported correctly`
                });
            })
            .catch(reason => {
                error = reason;
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
            })
            .finally(() => {
                LitUtils.dispatchCustomEvent(this, "workflowImport", { id: this.workflow.name }, {}, error);
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
            <div>
                <data-form
                    .data="${this.workflow}"
                    .config="${this._config}"
                    @fieldChange="${e => this.onFieldChange(e)}"
                    @clear="${e => this.onClear(e)}"
                    @submit="${e => this.onSubmit(e)}">
                </data-form>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            display: this.displayConfig || this.displayConfigDefault,
            sections: [
                {
                    title: "GitHub Repository Details",
                    elements: [
                        {
                            title: "Name",
                            field: "name",
                            type: "input-text",
                            required: true,
                            display: {
                                placeholder: "e.g., nf-core/rnaseq"
                            }
                        },
                        {
                            title: "Tag/Version",
                            field: "tag",
                            type: "input-text",
                            display: {
                                placeholder: "e.g., v3.0"
                            }
                        },
                        {
                            title: "User ID",
                            field: "user",
                            type: "input-text",
                            display: {
                                placeholder: "GitHub username (optional)"
                            }
                        },
                        {
                            title: "Password/Token",
                            field: "password",
                            type: "input-password",
                            display: {
                                placeholder: "GitHub token or password (optional)"
                            }
                        }
                    ]
                }
            ]
        };
    }

}

customElements.define("workflow-import", WorkflowImport);
