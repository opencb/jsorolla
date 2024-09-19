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
            displayConfig: {
                type: Object
            }
        };
    }

    #init() {
        this.workflow = {};
        this.displayConfigDefault = {
            buttonsVisible: true,
            buttonOkText: "Create",
            titleWidth: 3,
            with: "8",
            defaultValue: "",
            defaultLayout: "horizontal"
        };
        this.updatedFields = {};
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
        this.workflow = {...e.detail.data}; // force to refresh the object-list
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
                            allowedValues: ["CLINICAL_INTERPRETATION", "SECONDARY_ANALYSIS", "RESEARCH", "OTHER"],
                            display: {
                                placeholder: "Select the type...",
                            },
                        },
                        // {
                        //     title: "Tags",
                        //     field: "tags",
                        //     type: "input-text",
                        //     display: {
                        //         placeholder: "Add tags...",
                        //     },
                        // },
                        {
                            title: "Is a draft?",
                            field: "draft",
                            type: "checkbox",
                            display: {},
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
                                    <div>${workflow.filename}</div>
                                `,
                                // search: {
                                //     title: "Autocomplete",
                                //     button: false,
                                //     render: (currentData, dataFormFilterChange) => html`
                                //         <cellbase-search-autocomplete
                                //             .resource="${"workflow"}"
                                //             .cellbaseClient="${this.opencgaSession.cellbaseClient}"
                                //             @filterChange="${e => dataFormFilterChange(e.detail.data)}">
                                //         </cellbase-search-autocomplete>
                                //     `,
                                // },
                            },
                            elements: [
                                {
                                    title: "File Name",
                                    field: "scripts[].filename",
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
