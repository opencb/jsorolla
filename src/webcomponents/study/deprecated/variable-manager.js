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

import {LitElement, html} from "lit";
import "../../commons/filters/variableset-id-autocomplete.js";
import "../../deprecated/select-field-token.js";
import LitUtils from "../../commons/utils/lit-utils.js";

// eslint-disable-next-line new-cap
export default class VariableManager extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            variable: {
                type: Object
            },
            dependsOn: {
                type: Array
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this.variable = {};
        this.mapType = ["MAP_BOOLEAN", "MAP_INTEGER", "MAP_DOUBLE", "MAP_STRING"];
        this.ComplexType = ["MAP_", "OBJECT"];

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    refreshForm() {
        // When using data-form we need to update config object and render again
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.requestUpdate();
    }

    onFieldChange(e) {
        e.stopPropagation(); // avoid to conflict with the event fieldChange from variable-set-create
        const field = e.detail.param;
        if (e.detail.value) {
            this.variable = {
                ...this.variable,
                [field]: e.detail.value
            };
        } else {
            delete this.variable[field];
        }

        // When we change 'type' we might need to enable/disable some parts of the form
        if (field === "type") {
            console.log("changed type variable");
            this.refreshForm();
        }


    }

    getDefaultConfig() {
        return {
            title: "Edit",
            icon: "fas fa-edit",
            buttons: {
                show: true,
                cancelText: "Cancel",
                classes: "pull-right",
                okText: "Add"
            },
            display: {
                labelWidth: 3,
                labelAlign: "right",
                defaultLayout: "horizontal",
                defaultValue: ""
            },
            sections: [
                {
                    elements: [
                        {
                            name: "Id",
                            field: "id",
                            type: "input-text",
                            display: {
                                placeholder: "Name ..."
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
                            name: "Required",
                            field: "required",
                            type: "checkbox",
                        },
                        {
                            name: "Internal",
                            field: "internal",
                            type: "checkbox",
                        },
                        {
                            name: "Type",
                            field: "type",
                            type: "select",
                            allowedValues: ["BOOLEAN", "CATEGORICAL", "INTEGER", "DOUBLE", "STRING", "OBJECT", "MAP_BOOLEAN", "MAP_INTEGER", "MAP_DOUBLE", "MAP_STRING"],
                            display: {
                                placeholder: "select a variable type..."
                            }
                        },
                        {
                            name: "Allowed Values",
                            field: "allowedValues",
                            type: "custom",
                            display: {
                                visible: variable => variable?.type === "CATEGORICAL",
                                layout: "horizontal",
                                defaultLayout: "horizontal",
                                width: 12,
                                style: "padding-left: 0px",
                                render: () => html`
                                    <select-field-token
                                        .values="${this.variable?.allowedValues}"
                                        @addToken=${e => this.onAddValues(e)}>
                                    </select-field-token>`
                            }
                        },
                        {
                            name: "Allowed Keys",
                            field: "allowedKeys",
                            type: "custom",
                            display: {
                                visible: variable => this.mapType.includes(variable?.type),
                                render: () => html `
                                <select-field-token
                                    .values="${this.variable?.allowedKeys}"
                                    @addToken=${e => this.onAddValues(e)}>
                                </select-field-token>
                                `
                            }
                        },
                        {
                            name: "Default Value",
                            field: "defaultValue",
                            type: "input-text",
                            display: {
                                disabled: variable => this.ComplexType.some(varType => variable?.type?.startsWith(varType))
                            }
                        },
                        {
                            name: "Multi Value",
                            field: "multivalue",
                            type: "checkbox",
                            display: {
                                disabled: variable => this.ComplexType.some(varType => variable?.type?.startsWith(varType))
                            }
                        },
                        {
                            name: "Depends On",
                            field: "dependsOn",
                            type: "select",
                            // allowedValues: variable => variable?.type === "CATEGORICAL" ? variable?.allowedValues: variable?.allowedKeys,
                            allowedValues: this.dependsOn?.map(variable => variable.name),
                            display: {
                                visible: this.dependsOn?.length > 0,
                                placeholder: "select an allow key or values..."
                            }
                        },
                        {
                            name: "Category",
                            field: "category",
                            type: "input-text",
                            display: {
                                placeholder: "Name ..."
                            }
                        },
                        {
                            name: "Rank",
                            field: "rank",
                            type: "input-text",
                            display: {
                                placeholder: "select a variable type..."
                            }
                        },
                        {
                            name: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "VariableSet description..."
                            }
                        }
                    ],
                }
            ]
        };
    }

    onAddValues(e) {
        e.stopPropagation();

        if (this.variable.type === "CATEGORICAL") {
            this.variable.allowedValues = e.detail.value ?? [];
        } else {
            this.variable.allowedKeys = e.detail.value ?? [];
        }
        this.refreshForm();
    }

    onSendVariable(e) {
        // Send the variable to the upper component
        console.log("onSendVariable Variable: ", this.variable);
        LitUtils.dispatchCustomEvent(this, "addItem", this.variable);
    }

    onClearForm(e) {
        e.stopPropagation();
        console.log("Close form");
        LitUtils.dispatchCustomEvent(this, "closeForm");
    }

    render() {
        return html `
            <div class="subform">
                <data-form
                    .data=${this.variable}
                    .config="${this._config}"
                    @fieldChange="${e => this.onFieldChange(e)}"
                    @clear="${this.onClearForm}"
                    @submit="${e => this.onSendVariable(e)}">
                </data-form>
            </div>`;
    }

}

customElements.define("variable-manager", VariableManager);
