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
import "../commons/forms/data-form.js";

export default class ToolCreate extends LitElement {

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
                type: Object,
            },
            type: {
                type: String,
            },
            displayConfig: {
                type: Object,
            },
        };
    }

    #init() {
        this.type = "CUSTOM_TOOL";
        this._customTool = {};
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("displayConfig") || changedProperties.has("type")) {
            this._config = this.getDefaultConfig();
        }
        if (changedProperties.has("type")) {
            this._customTool = {};
        }
        super.update(changedProperties);
    }

    onFieldChange() {
        this._customTool = { ...this._customTool };
        debugger
        this.requestUpdate();
    }

    onClear() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Clear tool",
            message: "Are you sure to clear?",
            ok: () => {
                this._customTool = {};
                this._config = this.getDefaultConfig();
                this.requestUpdate();
            },
        });
    }

    onSubmit() {
        this.#setLoading(true);

        // call the right create method according to the tool type
        let toolCreatePromise = null;
        switch (this.type) {
            case "CUSTOM_TOOL":
                toolCreatePromise = this.opencgaSession.opencgaClient.userTool()
                    .createCustom(this._customTool, {
                        study: this.opencgaSession.study.fqn,
                    });
                break;
            case "WORKFLOW":
                toolCreatePromise = this.opencgaSession.opencgaClient.userTool()
                    .createWorkflow(this._customTool, {
                        study: this.opencgaSession.study.fqn,
                    });
                break;
            case "VARIANT_WALKER":
                toolCreatePromise = this.opencgaSession.opencgaClient.userTool()
                    .createWalker(this._customTool, {
                        study: this.opencgaSession.study.fqn,
                    });
                break;
            default:
                console.error("Tool type not supported");
                return;
        }

        // wait for the promise to finish
        toolCreatePromise
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    message: "New custom tool created correctly"
                });
                LitUtils.dispatchCustomEvent(this, "toolCreateSubmit", this._customTool);
                this._customTool = {};
            })
            .catch(reason => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
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
                .data="${this._customTool}"
                .config="${this._config}"
                @fieldChange="${event => this.onFieldChange(event)}"
                @clear="${event => this.onClear(event)}"
                @submit="${event => this.onSubmit(event)}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                buttonsVisible: true,
                buttonsLayout: "bottom",
                buttonOkText: "Create",
                buttonClearText: "Cancel",
                titleWidth: 3,
                defaultLayout: "horizontal",
                type: "tabs",
                ...this.displayConfig,
            },
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
                                    text: "Unique identifier for the tool. Once created, it cannot be changed.",
                                },
                            },
                        },
                        {
                            title: "Name",
                            field: "name",
                            type: "input-text",
                            display: {
                                placeholder: "Add the tool name...",
                                helpMessage: "Descriptive name for the tool.",
                            },
                        },
                        {
                            title: "Scope",
                            field: "scope",
                            type: "select",
                            allowedValues: ["SECONDARY_ANALYSIS", "RESEARCH_ANALYSIS", "CLINICAL_INTERPRETATION_ANALYSIS", "OTHER"],
                            display: {
                                placeholder: "Select the scope...",
                                helpMessage: "Scope of the tool.",
                            },
                        },
                        {
                            title: "Tags",
                            field: "tags",
                            type: "input-tags",
                            display: {
                                placeholder: "Add tags...",
                                helpMessage: "Tags to categorize the tool.",
                            },
                        },
                        {
                            title: "Draft",
                            field: "draft",
                            type: "checkbox",
                            display: {
                                helpMessage: "Indicates whether the tool is in draft status.",
                            },
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
                                    display: {
                                        defaultValue: "4",
                                        placeholder: "E.g., 4",
                                        helpMessage: "Minimum number of CPU cores required to run the tool.",
                                    },
                                },
                                {
                                    title: "Min. memory",
                                    field: "minimumRequirements.memory",
                                    type: "input-text",
                                    display: {
                                        defaultValue: "8",
                                        placeholder: "E.g., 8",
                                        helpMessage: "Minimum memory in GB required to run the tool (e.g., 4). Do not include the 'GB' suffix.",
                                    },
                                },
                            ]
                        },
                        {
                            title: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Add a description...",
                                helpMessage: "Detailed description of the tool.",
                            },
                        },
                    ],
                },
                {
                    title: "Container Configuration",
                    display: {
                        visible: this.type === "CUSTOM_TOOL" || this.type === "VARIANT_WALKER",
                    },
                    elements: [
                        {
                            title: "Container Name",
                            field: "container.name",
                            type: "input-text",
                            required: true,
                            display: {
                                placeholder: "E.g., biocontainers/bwa or quay.io/biocontainers/bwa",
                                helpMessage: "Container name, including the registry if needed. You can use Docker Hub, Quay.io, etc.",
                            },
                        },
                        {
                            title: "Container Tag",
                            field: "container.tag",
                            type: "input-text",
                            required: true,
                            display: {
                                placeholder: "E.g., 0.7.17",
                                helpMessage: "Container tag (version). If not provided, 'latest' will be used.",
                            },
                        },
                        {
                            title: "Command Line Template",
                            field: "container.commandLine",
                            type: "input-text",
                            display: {
                                placeholder: `eg. bwa mem -t $\{num_threads} $\{input} > $\{output}`,
                                helpMessage: "Command line template to run the tool inside the container. You can use ${input} and ${output} as placeholders for input and output files. E.g., 'bwa mem ${input} > ${output}'",
                            },
                        },
                        {
                            title: "User ID",
                            field: "container.user",
                            type: "input-text",
                            display: {
                                placeholder: "",
                                helpMessage: "Docker user ID for private repositories. At the moment, only Docker Hub is supported for private containers.",
                            },
                        },
                        {
                            title: "Password/Token",
                            field: "container.password",
                            type: "input-password",
                            display: {
                                placeholder: "",
                                helpMessage: "Docker password or token for private repositories.",
                            },
                        },
                    ],
                },
                {
                    title: "Scripts",
                    display: {
                        visible: this.type === "WORKFLOW",
                    },
                    elements: [
                        {
                            title: "Scripts",
                            field: "scripts",
                            type: "object-list",
                            display: {
                                view: workflow => html`
                                    <div>${workflow.fileName}</div>
                                `,
                            },
                            elements: [
                                {
                                    title: "File Name",
                                    field: "scripts[].fileName",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add workflow file name...",
                                    }
                                },
                                {
                                    title: "is main script?",
                                    field: "scripts[].main",
                                    type: "checkbox",
                                    display: {}
                                },
                                {
                                    title: "Content",
                                    field: "scripts[].content",
                                    type: "input-text",
                                    display: {
                                        rows: 25,
                                        placeholder: "Add a content...",
                                    },
                                },
                            ],
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
                                    title: "Type",
                                    field: "variables[].type",
                                    type: "select",
                                    allowedValues: ["FLAG", "BOOLEAN", "INTEGER", "DOUBLE", "STRING", "FILE"],
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

customElements.define("tool-create", ToolCreate);
