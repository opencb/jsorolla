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
import LitUtils from "../commons/utils/lit-utils.js";

// eslint-disable-next-line new-cap
export default class VariableManager extends BaseManagerMixin(LitElement) {

    constructor() {
        super();
        this._init();
    }

    static get properties() {
        return {
            variables: {
                type: Array
            }
        };
    }

    _init() {
        this.variable = {
            variableSet: []
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

    onFieldChangeVariable(e) {
        console.log("onFieldChangeVariable", this);
        const [field, prop] = e.detail.param.split(".");
        this.variable = {
            ...this.variable,
            [prop]: e.detail.value
        };
        // LitUtils.dispatchEventCustom(this, "onFieldChangeVariable", this.variable);
        e.stopPropagation();
    }

    getDefaultConfig() {
        const variableType = ["BOOLEAN", "CATEGORICAL", "INTEGER", "DOUBLE", "STRING", "OBJECT", "MAP_BOOLEAN", "MAP_INTEGER", "MAP_DOUBLE", "MAP_STRING"];

        return {
            title: "Edit",
            icon: "fas fa-edit",
            buttons: {
                show: true,
                cancelText: "Cancel",
                classes: "pull-right"
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
                            name: "Category",
                            field: "variable.category",
                            type: "input-text",
                            display: {
                                placeholder: "Name ..."
                            }
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
                            name: "required",
                            field: "variable.required",
                            type: "checkbox",
                        },
                        {
                            name: "multiValue",
                            field: "variable.multivalue",
                            type: "checkbox",
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
                            name: "depends on",
                            field: "variable.dependsOn",
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
                                    <variable-set-manager
                                        .variableSets="${this.variable?.variableSet}"
                                        .opencgaSession="${this.opencgaSession}"
                                        @addItem="${e => this.onAddVariableSetChild(e)}"
                                        @removeItem="${e => this.onRemoveVariableSetChild(e)}">
                                    </variable-set-manager>`
                            }
                        },
                    ]
                }
            ]
        };
    }

    onAddVariableSetChild(e) {
        console.log("onVariableSetChild");
        this.variable.variableSet.push(e.detail.value);
        console.log("result variableSet: ", this.variable);
    }

    onRemoveVariableSetChild(e) {
        console.log("onRemoveVariableSetChild");
        this.variable = {
            ...this.variable,
            variableSet: this.variable.variableSet.filter(item => item !== e.detai.value)
        };
    }

    onClearForm(e) {
        console.log("onClearForm");
        this.variable = {};
        this.onShow();
        e.stopPropagation();
    }

    onAddVariable(e) {
        this.onAddItem(this.variable);
        this.variable = {};
        this.onShow();
    }

    render() {
        return html`
        <div class="row">
            <div class="col-md-2" style="padding: 10px 20px">
                <h3>Variable</h3>
            </div>
            <div class="col-md-10" style="padding: 10px 20px">
                <button type="button" class="btn btn-primary ripple pull-right" @click="${this.onShow}">
                    Add Variable
                </button>
            </div>
            <div class="clearfix"></div>
            <hr style="margin:0px">
            <div class="col-md-12" style="padding: 10px 20px">
                ${this.variables?.map(item => html`
                    <span class="label label-primary" style="font-size: 14px; margin:5px; padding-right:0px; display:inline-block">${item.name}
                        <span class="badge" style="cursor:pointer" @click=${e => this.onRemoveItem(e, item)}>X</span>
                    </span>`
                )}
            </div>
        </div>
        ${this.isShow ? html `
            <div class="subform-test">
                <data-form
                    .data=${this.variable}
                    .config="${this._config}"
                    @fieldChange="${e => this.onFieldChangeVariable(e)}"
                    @clear="${this.onClearForm}"
                    @submit="${e => this.onAddVariable(e)}">
                </data-form>
            </div>`:
            html ``
        }`;
    }

}

customElements.define("variable-manager", VariableManager);
