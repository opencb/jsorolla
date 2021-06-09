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
        const [field, prop] = e.detail.param.split(".");
        switch (e.detail.param) {
            case "id":
            case "name":
            case "unique":
            case "confidential":
            case "description":
                this.variableSet = {
                    ...this.variableSet,
                    [prop]: e.detail.value
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
                                placeholder: "VariableSet description..."
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
                // {
                //     elements: [
                //         {
                //             field: "variables",
                //             type: "custom",
                //             display: {
                //                 layout: "vertical",
                //                 defaultLayout: "vertical",
                //                 width: 12,
                //                 style: "padding-left: 0px",
                //                 render: () => html`
                //                     <phenotype-manager
                //                         .phenotypes="${this.variableSet?.variables}"
                //                         .opencgaSession="${this.opencgaSession}"
                //                         @addItem="${e => this.onAddPhenotype(e)}"
                //                         @removeItem="${e => this.onRemovePhenotype(e)}">
                //                     </phenotype-manager>`
                //             }
                //         },
                //     ]
                // }
            ]
        };
    }

    onClear(e) {
        console.log("Clear Form");
    }

    onSubmit(e) {
        console.log("Submit Form");
    }

    render() {
        return html `
        <data-form
            .data=${this.variableSet}
            .config="${this._config}"
            @fieldChange="${e => this.onFieldChangeVariableSet(e)}"
            @clear="${e => this.onClear(e)}"
            @submit="${this.onSubmit}">
        </data-form>`;
    }

}

customElements.define("variable-set-create", VariableSetCreate);
