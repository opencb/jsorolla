/**
 * Copyright 2015-2021 OpenCB
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

import {LitElement, html} from "/web_modules/lit-element.js";
import "../manager/variable-manager.js";

export default class VariableSetCreate extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this.variableSet = {
            variables: []
        };
        this.variable = {};
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    onFieldChangeVariableSet(e) {
        const field = e.detail.param;
        switch (e.detail.param) {
            case "id":
            case "name":
            case "unique":
            case "confidential":
            case "description":
                if (e.detail.param === "entities") {
                    this.renderFieldEntity(e.detail.value);
                }
                this.variableSet = {
                    ...this.variableSet,
                    [field]: e.detail.value
                };
                break;
        }
    }

    renderFieldEntity(entity) {
        console.log("Render exclusive form by entity", entity);
    }

    getDefaultConfig() {
        const annotableDataModels = ["SAMPLE", "COHORT", "INDIVIDUAL", "FAMILY", "FILE"];
        return {
            title: "Edit",
            icon: "fas fa-edit",
            type: "form",
            buttons: {
                show: true,
                cancelText: "Cancel",
                okText: "Save"
            },
            display: {
                style: "margin: 10px",
                labelWidth: 3,
                labelAlign: "right",
                defaultLayout: "horizontal",
                defaultValue: "",
                help: {
                    mode: "block"
                }
            },
            sections: [
                {
                    title: "VariableSet General Information",
                    elements: [
                        {
                            name: "Id",
                            field: "id",
                            type: "input-text",
                            required: true,
                            display: {
                                placeholder: "Add a short ID...",
                                help: {
                                    text: "short variableSet id"
                                },
                                validation: {}
                            }
                        },
                        {
                            name: "Name",
                            field: "name",
                            type: "input-text",
                            display: {
                                placeholder: "Name ..."
                            }
                        },
                        {
                            name: "Unique",
                            field: "unique",
                            type: "checkbox",
                            checked: false
                        },
                        {
                            name: "Confidential",
                            field: "confidential",
                            type: "checkbox",
                            checked: false
                        },
                        {
                            name: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "variable description..."
                            }
                        },
                        {
                            name: "Entities",
                            field: "entities",
                            type: "select",
                            allowedValues: annotableDataModels,
                            display: {
                                placeholder: "select a entity..."
                            }
                        }
                    ]
                },
                {
                    elements: [
                        {
                            field: "variables",
                            type: "custom",
                            display: {
                                layout: "vertical",
                                defaultLayout: "vertical",
                                width: 12,
                                style: "padding-left: 0px",
                                render: () => html`
                                    <variable-manager
                                        .parent="${true}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .variables="${this.variableSet?.variables}"
                                        @addItem="${e => this.onAddVariable(e)}"
                                        @removeItem="${e => this.onRemoveVariable(e)}">
                                    </variable-manager>`
                            }
                        },
                    ]
                }
            ]
        };
    }

    onAddVariable(e) {
        const variable = e.detail.value;
        console.log("onAddVariable: ", e.detail.value);
        this.variableSet.variables.push(e.detail.value);
        console.log("onAddVariable Result: ", this.variableSet);
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.requestUpdate();
    }

    onRemoveVariable(e) {
        console.log("onRemoveVariable");
        this.variableSet = {
            ...this.variableSet,
            variables: this.variableSet.variables.filter(item => item !== e.detai.value)
        };
        // this.requestUpdate();
    }

    onClear(e) {
        console.log("Clear Form");
    }

    onSubmit(e) {
        console.log("Submit Form: ", this.variableSet);
    }

    render() {
        return html `
        <data-form
            .data=${this.variableSet}
            .config="${this._config}"
            @fieldChange="${e => this.onFieldChangeVariableSet(e)}"
            @clear="${e => this.onClear(e)}"
            @submit="${e => this.onSubmit(e)}">
        </data-form>`;
    }

}

customElements.define("variable-set-create", VariableSetCreate);
