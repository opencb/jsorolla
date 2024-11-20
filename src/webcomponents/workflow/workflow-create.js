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

import {html, LitElement} from "lit";
import Types from "../commons/types.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import LitUtils from "../commons/utils/lit-utils";
import "../commons/filters/catalog-search-autocomplete.js";

export default class WorkflowCreate extends LitElement {

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
            mode: {
                type: String
            },
            displayConfig: {
                type: Object
            }
        };
    }

    #init() {
        this.workflow = {};
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
            this.displayConfig = {...this.displayConfigDefault, ...this.displayConfig};
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

        this.workflow = {...e.detail.data, tags: tags};
        this.requestUpdate();
    }

    onClear() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Clear workflow",
            message: "Are you sure to clear?",
            ok: () => {
                this.workflow = {};
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
        this.opencgaSession.opencgaClient.workflows()
            .create(this.workflow, params)
            .then(() => {
                this.workflow = {};
                this._config = this.getDefaultConfig();
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Workflow Create",
                    message: "New workflow created correctly"
                });
            })
            .catch(reason => {
                error = reason;
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
            })
            .finally(() => {
                LitUtils.dispatchCustomEvent(this, "workflowCreate", this.workflow, {}, error);
                this.#setLoading(false);
            });
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        return html`
            <data-form
                .data="${this.workflow}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${e => this.onClear(e)}"
                @submit="${this.onSubmit}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            mode: this.mode,
            display: this.displayConfig || this.displayConfigDefault,
            sections: [
                {
                    title: "General Information",
                    elements: [
                        {
                            title: "Workflow ID",
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
                                placeholder: "Add the workflow name...",
                            },
                        },
                        {
                            title: "Type",
                            field: "type",
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
                                    title: "Min CPU cores",
                                    field: "minimumRequirements.cpu",
                                    type: "input-num",
                                    display: {},
                                },
                                {
                                    title: "Min memory",
                                    field: "minimumRequirements.memory",
                                    type: "input-num",
                                    display: {},
                                },
                            ]
                        },
                        {
                            title: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                placeholder: "Add the workflow description...",
                            },
                        },
                    ],
                },
                {
                    title: "Input Variables",
                    text: "Optional variables that can be used in the workflow, these are NOT necessary for the workflow to run. " +
                        "The variables will be ONLY used to create automatic forms.",
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
                                        placeholder: "Add workflow file name...",
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
                                        rows: 50,
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
                {
                    title: "Scripts",
                    elements: [
                        {
                            title: "Scripts",
                            field: "scripts",
                            type: "object-list",
                            display: {
                                style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
                                // CAUTION 20231024 Vero: "collapsedUpdate" not considered in data-form.js. Perhaps "collapsed" (L1324 in data-form.js) ?
                                // collapsedUpdate: true,
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
                                        rows: 50,
                                        placeholder: "Add a content...",
                                    },
                                },
                            ],
                        },
                    ],
                },
            ]
        });
    }

}

customElements.define("workflow-create", WorkflowCreate);
