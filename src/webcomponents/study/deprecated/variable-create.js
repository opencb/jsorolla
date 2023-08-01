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
import LitUtils from "../../commons/utils/lit-utils.js";
import Types from "../../commons/types.js";
import FormUtils from "../../commons/forms/form-utils.js";

// DEPRECATED
export default class VariableCreate extends LitElement {

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
            mode: {
                type: String,
            },
            displayConfig: {
                type: Object
            }
        };
    }

    _init() {
        this.mode = "";
        this.variable = {};
        this.displayConfigDefault = {
            buttonsAlign: "right",
            buttonClearText: "Clear",
            buttonOkText: "Create Ontology Term",
            titleVisible: false,
            defaultLayout: "horizontal",
        };
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {...this.displayConfigDefault, ...this.displayConfig};
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    onFieldChange(e, field) {
        e.stopPropagation();
        const param = field || e.detail.param;

        this.variable = {
            ...FormUtils.createObject(
                this.variable,
                param,
                e.detail.value
            )};

        if (param === "type") {
            console.log("tesd");
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.requestUpdate();
        }

        LitUtils.dispatchCustomEvent(this, "fieldChange", this.variable);
    }

    // Submit to upper component.
    onSendVariable(e) {
        // Avoid others onSubmit...ex. sample-create::onSubmit
        e.stopPropagation();
        // Send the ontology to the upper component
        LitUtils.dispatchCustomEvent(this, "addItem", this.variable);
    }

    onClearForm(e) {
        e.stopPropagation();
        this.variable = {};
        LitUtils.dispatchCustomEvent(this, "closeForm");
    }

    #onAddValues(e) {
        e.stopPropagation();
        if (this.variable.type === "CATEGORICAL") {
            this.variable.allowedValues = e.detail.value ?? [];
        } else {
            this.variable.allowedKeys = e.detail.value ?? [];
        }
        this.refreshForm();
    }

    render() {
        return html`
            <data-form
                .data=${this.variable}
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClearForm}"
                @submit="${e => this.onSendVariable(e)}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            type: this.mode,
            display: this.displayConfig || this.displayConfigDefault,
            sections: [
                {
                    elements: [
                        {
                            name: "ID",
                            field: "id",
                            type: "input-text",
                            required: true,
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
                            name: "Multi Value",
                            field: "multivalue",
                            type: "checkbox",
                            display: {
                                // disabled: variable => this.ComplexType.some(varType => variable?.type?.startsWith(varType))
                            }
                        },
                        {
                            name: "Type",
                            field: "type",
                            type: "select",
                            allowedValues: ["BOOLEAN", "CATEGORICAL", "INTEGER", "DOUBLE", "STRING"],
                            display: {
                                placeholder: "select a variable type..."
                            }
                        },
                        {
                            name: "Allowed Values",
                            field: "allowedValues",
                            type: "custom",
                            display: {
                                // disabled: variable => variable?.type !== "CATEGORICAL",

                                render: allowedValues => html`
                                    <select-token-filter-static
                                        .values="${allowedValues}"
                                        .disabled="${this.variable?.type !== "CATEGORICAL"}"
                                        @addToken=${e => this.#onAddValues(e)}>
                                    </select-token-filter-static>`
                            }
                        },
                        // {
                        //     name: "Allowed Keys",
                        //     field: "allowedKeys",
                        //     type: "custom",
                        //     display: {
                        //         // visible: variable => this.mapType.includes(variable?.type),
                        //         render: () => html `
                        //         <select-field-token
                        //             .values="${this.variable?.allowedKeys}"
                        //             @addToken=${e => this.#onAddValues(e)}>
                        //         </select-field-token>
                        //         `
                        //     }
                        // },
                        {
                            name: "Default Value",
                            field: "defaultValue",
                            type: "checkbox",
                            display: {
                                visible: variable => variable?.type === "BOOLEAN",
                            }
                        },
                        {
                            name: "Default Value",
                            field: "defaultValue",
                            type: "input-text",
                            display: {
                                visible: variable => variable?.type !== "BOOLEAN" && variable?.type !== "DOUBLE" && variable?.type !== "INTEGER",
                                disabled: variable => !variable?.type && !(variable?.type === "STRING" || variable?.type === "CATEGORICAL")
                            }
                        },
                        {
                            name: "Default Value",
                            field: "defaultValue",
                            type: "input-num",
                            display: {
                                visible: variable => variable?.type === "DOUBLE" || variable?.type === "INTEGER",
                            }
                        },
                        {
                            name: "Depends On",
                            field: "dependsOn",
                            type: "select",
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
        });
    }

}

customElements.define("variable-create", VariableCreate);
