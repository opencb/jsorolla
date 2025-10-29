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

import {html, LitElement, nothing} from "lit";
import UtilsNew from "../../core/utils-new.js";
import "../commons/forms/data-form.js";

export default class WorkflowSummary extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            workflow: {
                type: Object,
            },
            workflowId: {
                type: String,
            },
            opencgaSession: {
                type: Object,
            },
            displayConfig: {
                type: Object,
            },
        };
    }

    #init() {
        this._workflow = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("workflow")) {
            this.workflowObserver();
        }

        if (changedProperties.has("workflowId")) {
            this.workflowIdObserver();
        }

        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    workflowIdObserver() {
        this._workflow = null;
        if (this.workflowId && this.opencgaSession) {
            this.opencgaSession.opencgaClient.workflows()
                .info(this.workflowId, {
                    study: this.opencgaSession.study.fqn,
                })
                .then(response => {
                    this._workflow = response.responses[0].results[0];
                    this.requestUpdate();
                })
                .catch(reason => {
                    console.error(reason);
                });
        }
    }

    workflowObserver() {
        this._workflow = {...this.workflow};
    }

    render() {
        if (!this.opencgaSession || !this._workflow) {
            return nothing;
        }

        return html`
            <data-form
                .data="${this._workflow}"
                .config="${this._config || {}}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                titleVisible: false,
                buttonsVisible: false,
                ...this.displayConfig,
            },
            sections: [
                {
                    title: "General Information",
                    elements: [
                        {
                            title: "Workflow ID",
                            type: "complex",
                            display: {
                                template: "${id} (UUID: ${uuid})",
                                style: {
                                    id: {
                                        "font-weight": "bold",
                                    }
                                }
                            },
                        },
                        {
                            id: "name",
                            title: "Name",
                            field: "name",
                        },
                        {
                            title: "Version",
                            field: "version",
                        },
                        {
                            id: "type",
                            title: "Type",
                            field: "type",
                        },
                        {
                            title: "Draft",
                            field: "draft",
                            type: "checkbox",
                            display: {
                                disabled: true,
                            },
                        },
                        {
                            title: "Minimum Requirements",
                            field: "minimumRequirements",
                            type: "object",
                            display: {
                                defaultLayout: "horizontal",
                            },
                            elements: [
                                {
                                    title: "Min CPU cores",
                                    field: "minimumRequirements.cpu",
                                },
                                {
                                    title: "Min memory",
                                    field: "minimumRequirements.memory",
                                },
                                {
                                    title: "Processor Type",
                                    field: "minimumRequirements.processorType",
                                    display: {
                                        defaultValue: "CPU",
                                    },
                                },
                            ]
                        },
                        {
                            title: "Status",
                            type: "complex",
                            display: {
                                template: "${internal.status.name} (${internal.status.date})",
                                format: {
                                    "internal.status.date": date => UtilsNew.dateFormatter(date)
                                }
                            },
                        },
                        {
                            title: "Description",
                            field: "description",
                        },
                        {
                            title: "Creation Date",
                            field: "creationDate",
                            display: {
                                format: date => UtilsNew.dateFormatter(date)
                            },
                        },
                        {
                            title: "Modification Date",
                            field: "modificationDate",
                            display: {
                                format: modificationDate => UtilsNew.dateFormatter(modificationDate),
                            },
                        },
                        {
                            title: "Description",
                            field: "description",
                        },
                    ],
                },
                {
                    title: "Input Variables",
                    text: `
                        Optional variables that can be used in the workflow, these are NOT necessary for the workflow to run.
                        The variables will be ONLY used to create automatic forms.
                    `,
                    elements: [
                        {
                            title: "Variables",
                            field: "variables",
                            type: "table",
                            display: {
                                defaultValue: "No input parameters are currently configured.",
                                columns: [
                                    {
                                        title: "ID",
                                        field: "id",
                                    },
                                    {
                                        title: "Name",
                                        field: "name",
                                    },
                                    {
                                        title: "Required",
                                        field: "required",
                                    },
                                    {
                                        title: "Default Value",
                                        field: "defaultValue",
                                    },
                                    {
                                        title: "Description",
                                        field: "description",
                                    },
                                ],
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("workflow-summary", WorkflowSummary);
