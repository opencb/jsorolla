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

export default class ToolCustomCreate extends LitElement {

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
            // mode: {
            //     type: String
            // },
            displayConfig: {
                type: Object
            }
        };
    }

    #init() {
        this.customTool = {};
        this.updatedFields = {};
        this.mode = "";
        this.displayConfigDefault = {
            buttonsVisible: true,
            buttonOkText: "Create",
            titleWidth: 3,
            with: "8",
            defaultValue: "",
            defaultLayout: "horizontal"
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
        let tags = [];
        if (e.detail.data?.tags) {
            // e.detail.data.tags = e.detail.data?.tags?.split(",") || [];
            if (typeof e.detail.data?.tags === "string") {
                tags = e.detail.data?.tags?.split(",") || [];
            } else {
                tags = e.detail.data?.tags || [];
            }
        }

        this.customTool = { ...e.detail.data, tags: tags };
        this.requestUpdate();
    }

    onClear() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Clear tool",
            message: "Are you sure to clear?",
            ok: () => {
                this.customTool = {};
                this._config = this.getDefaultConfig();
                this.requestUpdate();
            },
        });
    }

    onSubmit() {
        const params = {
            study: this.opencgaSession.study.fqn,
            includeResult: true
        };
        let error;
        this.#setLoading(true);
        this.opencgaSession.opencgaClient.userTool()
            .createCustom(this.customTool, params)
            .then(() => {
                this.customTool = {};
                this._config = this.getDefaultConfig();
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Custom Tool Create",
                    message: "New custom tool created correctly"
                });
            })
            .catch(reason => {
                error = reason;
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
            })
            .finally(() => {
                LitUtils.dispatchCustomEvent(this, "customToolCreate", this.customTool, {}, error);
                this.#setLoading(false);
            });
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        return html`
                <data-form
                    .data="${this.customTool}"
                    .config="${this._config}"
                    @fieldChange="${e => this.onFieldChange(e)}"
                    @clear="${e => this.onClear(e)}"
                    @submit="${this.onSubmit}">
                </data-form>
            `;
    }

    getDefaultConfig() {
        return {
            display: this.displayConfig || this.displayConfigDefault,
            sections: [
                {
                    title: "General Information",
                    elements: [
                        {
                            title: "Tool ID",
                            field: "id",
                            type: "input-text",
                            required: true,
                            display: {
                                placeholder: "Add an ID...",
                                help: {
                                    text: "Add an ID",
                                },
                            },
                        },
                        {
                            title: "Name",
                            field: "name",
                            type: "input-text",
                            display: {
                                placeholder: "Add the tool name...",
                            },
                        },
                        {
                            title: "Scope",
                            field: "scope",
                            type: "select",
                            allowedValues: ["SECONDARY_ANALYSIS", "RESEARCH_ANALYSIS", "CLINICAL_INTERPRETATION_ANALYSIS", "OTHER"],
                            display: {
                                placeholder: "Select the type...",
                            },
                        },
                        {
                            title: "Tags",
                            field: "tags",
                            type: "input-text",
                            display: {
                                placeholder: "Add tags...",
                                help: {
                                    text: "Comma-separated tags",
                                },
                            },
                        },
                        {
                            title: "Draft",
                            field: "draft",
                            type: "checkbox",
                            display: {},
                        },
                        {
                            title: "Minimum Requirements",
                            field: "minimumRequirements",
                            type: "object",
                            elements: [
                                {
                                    title: "Min. CPU cores",
                                    field: "minimumRequirements.cpu",
                                    type: "input-text",
                                    display: {},
                                },
                                {
                                    title: "Min. memory",
                                    field: "minimumRequirements.memory",
                                    type: "input-text",
                                    display: {},
                                },
                            ]
                        },
                        {
                            title: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Add the tool description...",
                            },
                        },
                    ],
                },
                {
                    title: "Docker Configuration",
                    elements: [
                        {
                            title: "Docker Name",
                            field: "docker.name",
                            type: "input-text",
                            required: true,
                            display: {
                                placeholder: "Add docker image name...",
                            },
                        },
                        {
                            title: "Docker Tag",
                            field: "docker.tag",
                            type: "input-text",
                            display: {
                                placeholder: "Add docker image tag...",
                            },
                        },
                        {
                            title: "Command Line",
                            field: "docker.commandLine",
                            type: "input-text",
                            display: {
                                placeholder: "Add docker command line...",
                            },
                        },
                        {
                            title: "User ID",
                            field: "docker.user",
                            type: "input-text",
                            display: {
                                placeholder: "Add docker user id...",
                            },
                        },
                        {
                            title: "Password/Token",
                            field: "docker.password",
                            type: "input-password",
                            display: {
                                placeholder: "Add docker password or token...",
                            },
                        },
                    ],
                },
                {
                    title: "Input Variables",
                    text: "This section defines optional input variables that may be associated with the tool. " +
                        "These variables are not required for the tool's core functionality or execution. " +
                        "Instead, they serve as metadata to facilitate the automatic generation of user interface forms, " +
                        "enabling dynamic input collection and validation when the tool is invoked through the application interface.",
                    elements: [
                        {
                            title: "Variables",
                            field: "variables",
                            type: "object-list",
                            display: {
                                style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
                                // CAUTION 20231024 Vero: "collapsedUpdate" not considered in data-form.js. Perhaps "collapsed" (L1324 in data-form.js) ?
                                // collapsedUpdate: true,
                                view: variable => html`
                                        <div>${variable.id}</div>
                                    `,
                            },
                            elements: [
                                {
                                    title: "ID",
                                    field: "variables[].id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add tool file name...",
                                    }
                                },
                                {
                                    title: "Name",
                                    field: "variables[].name",
                                    type: "input-text",
                                    display: {}
                                },
                                {
                                    title: "Required",
                                    field: "variables[].required",
                                    type: "checkbox",
                                    display: {
                                        placeholder: "Add a content...",
                                    },
                                },
                                {
                                    title: "Default Value",
                                    field: "variables[].defaultValue",
                                    type: "input-text",
                                    display: {}
                                },
                                {
                                    title: "Description",
                                    field: "variables[].description",
                                    type: "input-text",
                                    display: {
                                        rows: 3,
                                        placeholder: "Add a content...",
                                    },
                                },
                            ],
                        },
                    ],
                },
            ]
        };
    }

}

customElements.define("tool-custom-create", ToolCustomCreate);
