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
import {BaseManagerMixin} from "../manager/base-manager.js";
import "../manager/variable-manager.js";

// eslint-disable-next-line new-cap
export default class VariableSetManager extends BaseManagerMixin(LitElement) {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            variableSets: {
                type: Array
            }
        };
    }

    _init() {
        this.variableSet = {
            variables: []
        };
    }

    onFieldChangeVariableSet(e) {
        const field = e.detail.param;
        switch (e.detail.param) {
            case "id":
            case "name":
            case "unique":
            case "confidential":
            case "description":
                this.variableSet = {
                    ...this.variableSet,
                    [field]: e.detail.value
                };
                break;
        }
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
                // width: "8",
                style: "margin: 10px",
                labelWidth: 3,
                labelAlign: "right",
                defaultLayout: "horizontal",
                defaultValue: "",
                help: {
                    mode: "block" // icon
                }
            },
            sections: [
                {
                    title: "VariableSet for Variable Information",
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
                                        .variables="${this.variableSet?.variables}"
                                        .opencgaSession="${this.opencgaSession}"
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
        console.log("onAddVariable");
        this.variableSet.variables.push(e.detail.value);
        console.log("result variableSet: ", this.variableSet);
    }

    onRemoveVariable(e) {
        console.log("onRemoveVariable");
        this.variableSet = {
            ...this.variableSet,
            variables: this.variableSet.variables.filter(item => item !== e.detai.value)
        };
        // this.requestUpdate();
    }

    onAddVariableSetChild(e) {
        console.log("onVariableSetChild");
        this.onAddItem(this.variableSet);
        this.variableSet = {variables: []};
        this.onShow();
        // this.variableSet.variables.push(e.detail.value);
        console.log("result variableSet: ", this.variableSet);
    }

    onClear(e) {
        console.log("Clear Form");
    }

    render() {
        return html`
            <div class="row">
                <div class="col-md-2" style="padding: 10px 20px">
                    <h3>VariableSet</h3>
                </div>
                <div class="col-md-10" style="padding: 10px 20px">
                    <button type="button" class="btn btn-primary ripple pull-right" @click="${this.onShow}">
                        Add VariableSet
                    </button>
                </div>
                <div class="clearfix"></div>
                <hr style="margin:0px">
                <div class="col-md-12" style="padding: 10px 20px">
                    ${this.variableSets?.map(item => html`
                        <span class="label label-primary" style="font-size: 14px; margin:5px; padding-right:0px; display:inline-block">${item.name}
                            <span class="badge" style="cursor:pointer" @click=${e => this.onRemoveItem(e, item)}>X</span>
                        </span>`
                    )}
                </div>
            </div>
            ${this.isShow ? html `
            <div class="subform-test">
                <data-form
                    .data=${this.variableSet}
                    .config="${this._config}"
                    @fieldChange="${e => this.onFieldChangeVariable(e)}"
                    @clear="${this.onClearForm}"
                    @submit="${e => this.onAddVariableSetChild(e)}">
                </data-form>
            </div>`:
            html ``
            }`;
    }

}
customElements.define("variable-set-manager", VariableSetManager);
