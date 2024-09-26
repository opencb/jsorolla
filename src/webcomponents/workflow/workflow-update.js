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
import UtilsNew from "../../core/utils-new.js";
import "../commons/tool-header.js";
import "../commons/filters/catalog-search-autocomplete.js";

export default class WorkflowUpdate extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            workflowId: {
                type: String
            },
            active: {
                type: Boolean,
            },
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
        this._workflow = {};
        this.workflowId = "";
        this.mode = "";
        this.displayConfig = {
            titleWidth: 3,
            modalButtonClassName: "btn-primary btn-sm",
            titleVisible: false,
            titleAlign: "left",
            defaultLayout: "horizontal",
            buttonsVisible: true,
            buttonsWidth: 8,
            buttonsAlign: "end",
        };

        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {...this.displayConfig};
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    onWorkflowIdObserver(e) {
        this._workflow = UtilsNew.objectClone(e.detail.value);
        this._config = this.getDefaultConfig();
        this.requestUpdate();
    }

    render() {
        return html`
            <opencga-update
                .resource="${"WORKFLOW"}"
                .componentId="${this.workflowId}"
                .opencgaSession="${this.opencgaSession}"
                .active="${this.active || true}"
                .config="${this._config}"
                @componentIdObserver="${e => this.onWorkflowIdObserver(e)}">
            </opencga-update>
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

customElements.define("workflow-update", WorkflowUpdate);
