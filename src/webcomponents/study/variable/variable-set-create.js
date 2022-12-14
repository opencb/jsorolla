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

import {html, LitElement} from "lit";
import NotificationUtils from "../../commons/utils/notification-utils.js";
import Types from "../../commons/types.js";
import "../../commons/forms/select-token-filter-static.js";
import LitUtils from "../../commons/utils/lit-utils.js";


export default class VariableSetCreate extends LitElement {

    constructor() {
        super();

        this.#init();
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

    #init() {
        this.variableSet = {
            variables: [],
            unique: true
        };
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        if (param === "entities") {
            this.variableSet.entities = this.variableSet?.entities.split(",");
        }
        this.variableSet = {...this.variableSet};
        this.requestUpdate();
    }

    onClear() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Clear variable set",
            message: "Are you sure to clear?",
            ok: () => {
                this.variableSet = {};
                this._config = this.getDefaultConfig();
                this.requestUpdate();
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    message: "The fields has been cleaned.",
                });
            }
        });
    }


    onSubmit() {
        const params = {
            action: "ADD"
        };
        let error;
        this.#setLoading(true);
        this.opencgaSession.opencgaClient.studies()
            .updateVariableSets(this.opencgaSession.study.fqn, this.variableSet, params)
            .then(() => {
                this.variableSet = {
                    variables: [],
                    unique: true
                };
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "New VariableSet",
                    message: "VariableSet created correctly"
                });
            })
            .catch(reason => {
                error = reason;
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
            })
            .finally(()=> {
                LitUtils.dispatchCustomEvent(this, "variableSetCreate", this.variableSet, {}, error);
                this.#setLoading(false);
            });
    }


    render() {
        return html `
            <data-form
                .data=${this.variableSet}
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${this.onSubmit}">
            </data-form>`;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            type: "form",
            display: {
                style: "margin: 10px",
                labelWidth: 3,
                labelAlign: "right",
                defaultLayout: "horizontal",
                buttonOkText: "Create"
            },
            sections: [
                {
                    title: "General Information",
                    elements: [
                        {
                            type: "notification",
                            text: "Some changes have been done in the form. Not saved, changes will be lost",
                            display: {
                                visible: () => Object.keys(this.variableSet).length > 0,
                                notificationType: "warning",
                            }
                        },
                        {
                            title: "ID",
                            field: "id",
                            type: "input-text",
                            required: "required",
                            display: {
                                placeholder: "Add a short ID...",
                                helpIcon: "fas fa-info-circle",
                                // helpText: "short variableSet id",
                                validation: {
                                    message: "Please enter more that 3 character",
                                    validate: variable => variable?.id?.length > 4 || variable?.id === undefined || variable?.id === ""
                                    // TODO: this work if we update the config every change
                                    // to re-evaluate or refresh the form applying the validation.
                                    // validate: variable => variable?.id?.length > 4
                                }
                            }
                        },
                        {
                            title: "Name",
                            field: "name",
                            type: "input-text",
                            display: {
                                placeholder: "Name ...",
                                help: {
                                    // text: "short name variable"
                                },
                            }
                        },
                        {
                            title: "Entities",
                            field: "entities",
                            type: "select",
                            allowedValues: ["SAMPLE", "INDIVIDUAL", "FAMILY", "FILE", "COHORT"],
                            multiple: true,
                            display: {
                                placeholder: "select a entity..."
                            }
                        },
                        // {
                        //     title: "Unique",
                        //     field: "unique",
                        //     type: "checkbox",
                        // },
                        // {
                        //     title: "Confidential",
                        //     field: "confidential",
                        //     type: "checkbox",
                        //     checked: false
                        // },
                        {
                            title: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "variable description..."
                            }
                        }
                    ]
                },
                {
                    title: "Variables",
                    elements: [
                        {
                            title: "Variables",
                            field: "variables",
                            type: "object-list",
                            display: {
                                style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
                                collapsedUpdate: true,
                                view: variable => html`<div>${variable.id}</div>`,
                            },
                            elements: [
                                {
                                    title: "Variable ID",
                                    field: "variables[].id",
                                    type: "input-text",
                                    required: true,
                                    display: {
                                        placeholder: "Add variable ID...",
                                    },
                                },
                                {
                                    title: "Name",
                                    field: "variables[].name",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add a name...",
                                    },
                                },
                                {
                                    title: "Required",
                                    field: "variables[].required",
                                    type: "checkbox",
                                },
                                {
                                    title: "Internal",
                                    field: "variables[].internal",
                                    type: "checkbox",
                                },
                                {
                                    title: "Multivalue",
                                    field: "variables[].multivalue",
                                    type: "checkbox",
                                    display: {
                                        // disabled: variable => this.ComplexType.some(varType => variable?.type?.startsWith(varType))
                                    },
                                },
                                {
                                    title: "Type",
                                    field: "variables[].type",
                                    type: "select",
                                    allowedValues: ["BOOLEAN", "CATEGORICAL", "INTEGER", "DOUBLE", "STRING"],
                                    display: {
                                        placeholder: "select a variable type..."
                                    },
                                },
                                {
                                    title: "Allowed Values",
                                    field: "variables[].allowedValues",
                                    type: "custom",
                                    validation: {
                                        validate: (value, variableSet, variable) => {
                                            const validateIntegerFormat = values => false;
                                            const validateDoubleFormat = values => true;
                                            if (variable?.type === "INTEGER") {
                                                return validateIntegerFormat(variable?.allowedValues);
                                            } else {
                                                return validateDoubleFormat(variable?.allowedValues);
                                            }
                                        },
                                        // message: "It should contains the format [0:1]",
                                    },
                                    display: {
                                        visible: (variableSet, variable) => ["DOUBLE", "INTEGER"].includes(variable?.type),
                                        render: (variableSet, variable) => {
                                            const selectConfig = {
                                                placeholder: "0:100"
                                            };
                                            const handleVariableFilterChange = e => {
                                                variable(e.detail.value ? e.detail.value?.split(",") :[]);
                                            };
                                            return html`
                                                <select-token-filter-static
                                                    .values="${variable?.allowedValues}"
                                                    .config="${selectConfig}"
                                                    @filterChange=${e => handleVariableFilterChange(e)}>
                                                </select-token-filter-static>
                                            `;
                                        },
                                        helpMessage: "Follow one of this format valid for the number range: 0:1, -10:100",
                                    }
                                },
                                {
                                    title: "Allowed Values",
                                    field: "variables[].allowedValues",
                                    type: "custom",
                                    display: {
                                        visible: (variableSet, variable) => variable?.type === "CATEGORICAL",
                                        render: (fieldValue, dataFormFilterChange, updateFields, variableSet, variable) => {
                                            const handleVariableFilterChange = e => {
                                                dataFormFilterChange(e.detail.value ? e.detail.value?.split(",") : []);
                                            };
                                            return html`
                                                <select-token-filter-static
                                                    .values="${variable?.allowedValues}"
                                                    @filterChange=${e => handleVariableFilterChange(e)}>
                                                </select-token-filter-static>
                                            `;
                                        }
                                    }
                                },
                                {
                                    title: "Default Value",
                                    field: "variables[].defaultValue",
                                    type: "checkbox",
                                    display: {
                                        visible: (variableSet, variable) => variable?.type === "BOOLEAN",
                                    }
                                },
                                {
                                    title: "Default Value",
                                    field: "variables[].defaultValue",
                                    type: "input-text",
                                    display: {
                                        visible: (variableSet, variable) => ["DOUBLE", "INTEGER"].includes(variable?.type),
                                    }
                                },
                                {
                                    title: "Default Value",
                                    field: "variables[].defaultValue",
                                    type: "select",
                                    allowedValues: (variableSet, variable) => variable?.allowedValues,
                                    display: {
                                        visible: (variableSet, variable) => variable?.type === "CATEGORICAL",
                                    }
                                },
                                {
                                    title: "Depends On",
                                    field: "variables[].dependsOn",
                                    type: "select",
                                    allowedValues: (variableSet, currentVariable) => variableSet?.variables?.filter(variable => !!variable.id).filter(variable => variable.id !== currentVariable?.id),
                                    multiple: false,
                                    display: {
                                        disabled: variableSet => !variableSet?.variables?.length > 0,
                                        placeholder: "select an allow key or values..."
                                    }
                                },
                                {
                                    title: "Category",
                                    field: "variables[].category",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Name ..."
                                    }
                                },
                                {
                                    title: "Rank",
                                    field: "variables[].rank",
                                    type: "input-text",
                                    display: {
                                        placeholder: "select a variable type..."
                                    }
                                },
                                {
                                    title: "Description",
                                    field: "variables[].description",
                                    type: "input-text",
                                    display: {
                                        rows: 3,
                                        placeholder: "VariableSet description..."
                                    }
                                }
                            ],
                        },
                    ],
                },
            ]
        });
    }

}

customElements.define("variable-set-create", VariableSetCreate);
