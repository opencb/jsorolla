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
import UtilsNew from "../../../core/utils-new.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import FormUtils from "../../commons/forms/form-utils.js";
import Types from "../../commons/types.js";

export default class VariableUpdate extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            variable: {
                type: Object
            },
            variableId: {
                type: String
            },
            displayConfig: {
                type: Object
            }
        };
    }

    #init() {
        this.displayConfigDefault = {
            buttonsAlign: "end",
            buttonClearText: "Clear",
            buttonOkText: "Create Variable",
            titleVisible: false,
            titleWidth: 4,
            defaultLayout: "horizontal",
        };
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("variable")) {
            this.variableObserver();
        }

        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {...this.displayConfigDefault, ...this.displayConfig};
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    variableObserver() {
        if (this.variable) {
            this._variable = UtilsNew.objectClone(this.variable);
        }
    }

    onFieldChange(e) {
        e.stopPropagation();
        // No need to switch(field) since all of them are processed in the same way
        this.updateParams = FormUtils.updateScalar(
            this._variable,
            this.variable,
            this.updateParams,
            e.detail.param,
            e.detail.value);

        this.variable = {...this.variable, ...this.updateParams};
        LitUtils.dispatchCustomEvent(this, "fieldChange", this.variable);
    }

    onSendVariable(e) {
        // Send the variable to the upper component
        e.stopPropagation();
        this.updateParams = {};
        LitUtils.dispatchCustomEvent(this, "updateItem", this.variable);
    }

    onClear(e) {
        e.stopPropagation();
        this.variable = JSON.parse(JSON.stringify(this._variable));
        this.updateParams = {};
        LitUtils.dispatchCustomEvent(this, "closeForm");
    }

    render() {
        return html`
            <data-form
                .data=${this.variable}
                .config="${this._config}"
                .updateParams=${this.updateParams}
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${e => this.onSendVariable(e)}">
            </data-form>
    `;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            display: this.displayConfig || this.displayConfigDefault,
            sections: [
                {
                    elements: [
                        {
                            name: "ID",
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
                            disabled: true,
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
                                        .disabled="${this.variable?.type !== "CATEGORICAL"}"></select-token-filter-static>
                                    </select-token-filter-static>`
                            }
                        },
                        // {
                        //     name: "Allowed Values",
                        //     field: "allowedValues",
                        //     type: "custom",
                        //     disabled: true,
                        //     display: {
                        //         visible: variable => variable?.type === "CATEGORICAL",
                        //         layout: "horizontal",
                        //         defaultLayout: "horizontal",
                        //         width: 12,
                        //         style: "padding-left: 0px",
                        //         render: () => html`
                        //             <select-field-token
                        //                 .values="${this.variable?.allowedValues}">
                        //             </select-field-token>`
                        //     }
                        // },
                        // {
                        //     name: "Allowed Keys",
                        //     field: "allowedKeys",
                        //     type: "custom",
                        //     disabled: true,
                        //     display: {
                        //         visible: variable => this.mapType.includes(variable?.type),
                        //         render: () => html `
                        //         <select-field-token
                        //             .values="${this.variable?.allowedKeys}">
                        //         </select-field-token>
                        //         `
                        //     }
                        // },
                        // {
                        //     name: "Default Value",
                        //     field: "defaultValue",
                        //     type: "input-text",
                        //     display: {
                        //         disabled: variable => this.ComplexType.some(varType => variable?.type?.startsWith(varType))
                        //     }
                        // },
                        // {
                        //     name: "Multi Value",
                        //     field: "multivalue",
                        //     type: "checkbox",
                        //     display: {
                        //         disabled: variable => this.ComplexType.some(varType => variable?.type?.startsWith(varType))
                        //     }
                        // },
                        // {
                        //     name: "Depends On",
                        //     field: "dependsOn",
                        //     type: "select",
                        //     allowedValues: this.dependsOn?.map(variable => variable.name),
                        //     display: {
                        //         visible: this.dependsOn?.length > 0,
                        //         placeholder: "select an allow key or values..."
                        //     }
                        // },
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

customElements.define("variable-update", VariableUpdate);
