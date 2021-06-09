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
        this.variable = {};
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
                }
            ]
        };
    }

    onFieldChangeVariable(e) {
        console.log("onFieldChangeVariable", this);
        this.variable = {
            ...this.variable,
            [e.detail.param]: e.detail.value
        };
        LitUtils.dispatchEventCustom(this, "onFieldChangeVariable", this.variable);
        e.stopPropagation();
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

        <div class="subform-test" style="${this.isShow ? "display:block" : "display:none"}">
            <data-form
                .data=${this.variable}
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChangeVariable(e)}"
                @clear="${this.onClearForm}">
            </data-form>
        </div>
    `;
    }

}

customElements.define("variable-manager", VariableManager);
