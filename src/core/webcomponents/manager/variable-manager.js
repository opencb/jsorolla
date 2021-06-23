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
import {BaseManagerMixin} from "./base-manager.js";
import "../commons/tool-header.js";
import "../commons/filters/variableset-id-autocomplete.js";
import "../variable/variable-set-manager.js";
import "../variable/variable-type-value.js";
import "../commons/filters/select-field-token.js";
import "../variable/treeviewer-variable.js";
import LitUtils from "../commons/utils/lit-utils.js";

// eslint-disable-next-line new-cap
export default class VariableManager extends BaseManagerMixin(LitElement) {

    constructor() {
        super();
        this._init();
    }

    static get properties() {
        return {
            parent: {
                type: Boolean
            },
            variables: {
                type: Array
            }
        };
    }

    _init() {
        this.variable = {
            variables: []
        };
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
        const [field, prop] = e.detail.param.split(".");
        const value = e.detail.value;
        this.variable = {
            ...this.variable,
            [prop]: e.detail.value
        };
        if (prop === "type") {
            console.log("changed type variable");
            this.variableFormObserver();
            // this.typeObserver(value);
            // e.stopPropagation();
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
                okText: this.parent ? "Save":"Add"
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
                            field: "variable.id",
                            type: "input-text",
                            display: {
                                placeholder: "Name ..."
                            }
                        },
                        {
                            name: "Name",
                            field: "variable.name",
                            type: "input-text",
                            display: {
                                placeholder: "Name ..."
                            }
                        },
                        {
                            name: "Required",
                            field: "variable.required",
                            type: "checkbox",
                        },
                        {
                            name: "Type",
                            field: "variable.type",
                            type: "select",
                            allowedValues: variableType,
                            display: {
                                placeholder: "select a variable type..."
                            }
                        },
                        {
                            name: "Allowed Values",
                            field: "variable.allowedValues",
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
                                    placeholder=${"Type something to start"}
                                    @addToken=${e => this.onAddValues(e)}>
                                </select-field-token>
                                `
                            }
                        },
                        {
                            name: "Allowed Keys",
                            field: "variable.allowedKeys",
                            type: "custom",
                            display: {
                                visible: variable => mapType.includes(variable?.type),
                                render: () => html `
                                <select-field-token
                                    .values="${this.variable?.allowedKeys}"
                                    placeholder=${"Type something to start"}
                                    @addToken=${e => this.onAddValues(e)}>
                                </select-field-token>
                                `
                            }
                        },
                        {
                            name: "Default Value",
                            field: "variable.defaultValue",
                            type: "input-text",
                            display: {
                                disabled: variable => ComplexType.some(varType => variable?.type?.startsWith(varType))
                            }
                        },
                        {
                            name: "Multi Value",
                            field: "variable.multivalue",
                            type: "checkbox",
                            display: {
                                disabled: variable => ComplexType.some(varType => variable?.type?.startsWith(varType))
                            }
                        },
                        {
                            name: "Depends On",
                            field: "variable.dependsOn",
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
                            field: "variable.category",
                            type: "input-text",
                            display: {
                                placeholder: "Name ..."
                            }
                        },
                        {
                            name: "Rank",
                            field: "variable.rank",
                            type: "input-text",
                            display: {
                                placeholder: "select a variable type..."
                            }
                        },
                        {
                            name: "Description",
                            field: "variable.description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "VariableSet description..."
                            }
                        }
                    ],
                },
                // {
                //     elements: [
                //         {
                //             field: "variables",
                //             type: "custom",
                //             display: {
                //                 visible: false, // variable => variable?.type === "OBJECT",
                //                 layout: "vertical",
                //                 defaultLayout: "vertical",
                //                 width: 12,
                //                 style: "padding-left: 0px",
                //                 render: () => html`
                //                     <variable-manager
                //                         .parent="${false}"
                //                         .variables="${this.variable?.variables}"
                //                         .opencgaSession="${this.opencgaSession}"
                //                         @addItem="${e => this.onAddVariableChild(e)}">
                //                     </variable-manager>`
                //             }
                //         }
                //     ]
                // },
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
        this.onShow();
        e.stopPropagation();
    }

    onEditVariable(item) {
        console.log(item);
        this.variable = item;
        this.isShow = true;
        this.variableFormObserver();
        // this.getVariablesById(item.variableSetId);
    }

    onRemoveVariable(e) {
        console.log("onRemoveVariable ", e.detail.value);
        const removeVariable = e.detail.value.split(".");
        this.variables = this.removalVariable(this.variables, removeVariable);
        console.log("result: ", this.variables);
        this.requestUpdate();
        // this.variable = {
        //     ...this.variable,
        //     variables: this.variable.variables.filter(item => item !== e.detail.value)
        // };
    }

    removalVariable(variables, removeVariables) {
        let result = [];

        if (removeVariables.length === 1) {
            return variables.filter(item => item.id !== removeVariables[0]);
        }

        removeVariables.forEach(removeVariable => {
            result = variables.map(item => {
                if (item.id === removeVariable) {
                    if (removeVariables.length > 1) {
                        removeVariables.shift();
                        return {...item, variables: this.removalVariable(item.variables, removeVariables)};
                    }
                } else {
                    return item;
                }
            });
        });
        return result;
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
        <div class="row">
            <div class="col-md-2" style="padding: 10px 20px">
                <h3>Variable</h3>
            </div>
            <div class="clearfix"></div>
            <hr style="margin:0px">
            <div class="col-md-10" style="padding: 10px 20px">
                <div class="col-md-12" style="padding: 10px 20px">
                    <treeviewer-variable
                        .variables="${this.variables}"
                        @addVariable="${e => this.onShowVariableForm(e)}"
                        @removeVariable="${e => this.onRemoveVariable(e)}">
                    </treeviewer-variable>
                </div>
                <!-- <button type="button" class="btn btn-primary ripple" @click="\${this.onShow}">
                    \${!this.isShow? "Add Variable":"Close Variable"}
                </button> -->
            </div>

        </div>
        ${this.isShow ? html `
            <div class="subform-test">
                <data-form
                    .data=${this.variable}
                    .config="${this._config}"
                    @fieldChange="${e => this.onFieldChangeVariable(e)}"
                    @clear="${this.onClearForm}"
                    @submit="${e => this.onSendVariable(e)}">
                </data-form>
            </div>`:
            html ``
        }`;
    }

}

customElements.define("variable-manager", VariableManager);
