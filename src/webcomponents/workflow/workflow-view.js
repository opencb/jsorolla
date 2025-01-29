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

import {html, LitElement} from "lit";
import UtilsNew from "../../core/utils-new.js";
import Types from "../commons/types.js";
import LitUtils from "../commons/utils/lit-utils.js";
import "../commons/forms/data-form.js";
import "../commons/filters/catalog-search-autocomplete.js";
import "../loading-spinner.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter";

export default class WorkflowView extends LitElement {

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
            search: {
                type: Boolean,
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
        this.workflow = {};
        this.search = false;

        this.isLoading = false;
        this.displayConfigDefault = {
            collapsable: true,
            titleVisible: false,
            titleWidth: 2,
            defaultValue: "-",
            defaultLayout: "horizontal",
            buttonsVisible: false,
            pdf: false,
        };
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        // to update disorders if it has more than one
        // if (changedProperties.has("workflow")) {
        //     this._config = this.getDefaultConfig();
        // }
        debugger
        if (changedProperties.has("workflowId")) {
            this.workflowIdObserver();
        }
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {
                ...this.displayConfigDefault,
                ...this.displayConfig
            };
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    workflowIdObserver() {
        debugger
        if (this.workflowId && this.opencgaSession) {
            const params = {
                study: this.opencgaSession.study.fqn,
            };
            let error;
            this.#setLoading(true);
            this.opencgaSession.opencgaClient.workflows()
                .info(this.workflowId, params)
                .then(response => {
                    this.workflow = response.responses[0].results[0];
                    debugger
                })
                .catch(reason => {
                    this.workflow = {};
                    error = reason;
                    console.error(reason);
                })
                .finally(() => {
                    this._config = this.getDefaultConfig();
                    LitUtils.dispatchCustomEvent(this, "workflowSearch", this.workflow, {}, error);
                    this.#setLoading(false);
                });
        } else {
            this.workflow = {};
        }
    }

    onFilterChange(e) {
        this.workflowId = e.detail.value;
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        if (!this.workflow?.id && this.search === false) {
            return html`
                <div class="alert alert-info">
                    <i class="fas fa-3x fa-info-circle align-middle" style="padding-right: 10px"></i>
                    Workflow ID not found.
                </div>
            `;
        }

        return html`
            <data-form
                .data="${this.workflow}"
                .config="${this._config}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            title: "Summary",
            icon: "",
            display: this.displayConfig || this.displayConfigDefault,
            sections: [
                {
                    title: "Search",
                    display: {
                        visible: workflow => !workflow?.id && this.search === true,
                    },
                    elements: [
                        {
                            title: "Workflow ID",
                            // field: "workflowId",
                            type: "custom",
                            display: {
                                render: () => html `
                                    <catalog-search-autocomplete
                                        .value="${this.sample?.id}"
                                        .resource="${"WORKFLOW"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{multiple: false}}"
                                        @filterChange="${e => this.onFilterChange(e)}">
                                    </catalog-search-autocomplete>`,
                            },
                        },
                    ],
                },
                {
                    title: "General Information",
                    collapsed: false,
                    display: {
                        visible: workflow => workflow?.id,
                    },
                    elements: [
                        {
                            title: "Workflow ID",
                            // type: "custom",
                            type: "complex",
                            display: {
                                // render: data => `
                                //     <span style="font-weight: bold">${data.id}</span> (UUID: ${data.uuid})
                                // `,
                                template: "${id} (UUID: ${uuid})",
                                // transform: {
                                //     id: id => id.toLowerCase(),
                                // },
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
                            elements: [
                                {
                                    title: "Min CPU cores",
                                    field: "minimumRequirements.cpu",
                                },
                                {
                                    title: "Min memory",
                                    field: "minimumRequirements.memory",
                                },
                            ]
                        },
                        {
                            title: "Status",
                            type: "complex",
                            display: {
                                // render: field => field ? `${field.name} (${UtilsNew.dateFormatter(field.date)})` : "-"
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
                                // render: field => field ? UtilsNew.dateFormatter(field) : "-"
                                format: date => UtilsNew.dateFormatter(date)
                            },
                        },
                        {
                            title: "Modification Date",
                            field: "modificationDate",
                            // type: "custom",
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
                {
                    title: "Scripts",
                    elements: [
                        {
                            title: "Scripts",
                            field: "scripts",
                            type: "list",
                            display: {
                                defaultValue: "No scripts are currently available.",
                                contentLayout: "vertical",
                                format: script => {
                                    return `
                                        <h5 class="card-title">${script.fileName} ${script.main ? `(main)`: ``}</h5>
                                        <div class="card">
                                            <div class="card-body">
                                                <p class="card-text">${script.content}</p>
                                            </div>
                                        </div>
                                    `;
                                }
                            },
                        },
                    ],
                },
            ],
        });
    }

}

customElements.define("workflow-view", WorkflowView);
