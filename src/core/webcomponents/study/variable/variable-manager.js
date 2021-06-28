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
import {BaseManagerMixin} from "../../commons/manager/base-manager.js";
import "../../commons/filters/variableset-id-autocomplete.js";
import "../../commons/filters/select-field-token.js";
import LitUtils from "../../commons/utils/lit-utils.js";

// eslint-disable-next-line new-cap
export default class VariableManager extends BaseManagerMixin(LitElement) {

    constructor() {
        super();
        this._init();
    }

    static get properties() {
        return {
            variable: {
                type: Object
            }
        };
    }

    _init() {
        this.variable = {
            variables: []
        };

        this.configToken = {
            placeholder: "Type something to start",
            delimiter: [",", "-"],
            tokensAllowCustom: true,
        };

        this.disabledCategorical = true;
    }

    update(changedProperties) {
        if (changedProperties.has("variables")) {
            this.variablesObserver();
        }
        super.update(changedProperties);
    }

    variablesObserver() {
        console.log("variable Observer");
    }

    variableFormObserver() {
        console.log("changed variable form");
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.requestUpdate();
    }

    onFieldChangeVariable(e) {
        const field = e.detail.param;
        this.variable = {
            ...this.variable,
            [field]: e.detail.value
        };
        console.log("The new variable: ", this.variable);
        if (field === "type") {
            console.log("changed type variable");
            this.variableFormObserver();
        }
    }

    getDefaultConfig() {
        const variableType = ["BOOLEAN", "CATEGORICAL", "INTEGER", "DOUBLE", "STRING", "OBJECT", "MAP_BOOLEAN", "MAP_INTEGER", "MAP_DOUBLE", "MAP_STRING"];
        const mapType = ["MAP_BOOLEAN", "MAP_INTEGER", "MAP_DOUBLE", "MAP_STRING"];
        const ComplexType = ["MAP_", "OBJECT"];
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
                            name: "Type",
                            field: "type",
                            type: "select",
                            allowedValues: variableType,
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
                                    .configToken="${this.configToken}"
                                    placeholder=${"Type something to start"}
                                    @addToken=${e => this.onAddValues(e)}>
                                </select-field-token>
                                `
                            }
                        },
                        {
                            name: "Allowed Keys",
                            field: "allowedKeys",
                            type: "custom",
                            display: {
                                visible: variable => mapType.includes(variable?.type),
                                render: () => html `
                                <select-field-token
                                    .values="${this.variable?.allowedKeys}"
                                    .configToken="${this.configToken}"
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
                                disabled: variable => ComplexType.some(varType => variable?.type?.startsWith(varType))
                            }
                        },
                        {
                            name: "Multi Value",
                            field: "multivalue",
                            type: "checkbox",
                            display: {
                                disabled: variable => ComplexType.some(varType => variable?.type?.startsWith(varType))
                            }
                        },
                        {
                            name: "Depends On",
                            field: "dependsOn",
                            type: "select",
                            // allowedValues: variable => variable?.type === "CATEGORICAL" ? variable?.allowedValues: variable?.allowedKeys,
                            allowedValues: this.variables?.map(variable => variable.name),
                            display: {
                                visible: this.variables?.length > 0,
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

    onAddVariableChild(e) {
        const variable = e.detail.value;
        this.variable.variables.push(variable);
        console.log("onAddVariable Result: ", this.variable);
        e.stopPropagation();
    }

    onAddValues(e) {
        console.log("onAddValue Allowed...: ", e.detail.value);
        if (this.variable.type === "CATEGORICAL") {
            const allowedValues = e.detail.value;
            this.variable.allowedValues = allowedValues;
        } else {
            const allowedKeys = e.detail.value;
            this.variable.allowedKeys = allowedKeys;
        }
        this.variableFormObserver();
        e.stopPropagation();
    }

    onSendVariable(e) {
        // Send the variable to the upper component
        console.log("onSendVariable Variable: ", this.variable);
        this.onAddItem(this.variable);
    }


    onClearForm(e) {
        console.log("onClearForm");
        this.variable = {};
        this.onShow();
        e.stopPropagation();
    }

    onShowVariableForm(e) {
        this.onShow();
        const item = e.detail.value;
        if (item) {
            console.log("Add variable child");
        } else {
            console.log("Add a parent variable");
        }
        e.stopPropagation();
    }


    render() {
        return html`
            <div class="subform-test">
                <data-form
                    .data=${this.variable}
                    .config="${this._config}"
                    @fieldChange="${e => this.onFieldChangeVariable(e)}"
                    @clear="${this.onClearForm}"
                    @submit="${e => this.onSendVariable(e)}">
                </data-form>
            </div>`;
    }

}

customElements.define("variable-manager", VariableManager);
