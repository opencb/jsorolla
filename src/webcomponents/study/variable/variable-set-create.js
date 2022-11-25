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
import FormUtils from "../../../webcomponents/commons/forms/form-utils.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";
import UtilsNew from "../../../core/utils-new.js";
import Types from "../../commons/types.js";
import "../variable/variable-create.js";
import "../variable/variable-update.js";
import "../../commons/forms/select-token-filter-static.js";

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
        this.variable = {};
        this._config = this.getDefaultConfig();
        this.dependsOn = [];
    }

    refreshForm() {
        // When using data-form we need to update config object and render again
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.requestUpdate();
    }

    onFieldChange(e, field) {
        console.log("Test change field ");
        e.stopPropagation();
        const param = field || e.detail.param;
        switch (param) {
            case "id":
            case "name":
            case "unique":
            case "confidential":
            case "description":
                this.variableSet = {
                    ...FormUtils.createObject(
                        this.variableSet,
                        param,
                        e.detail.value
                    )
                };
                break;
            case "entities":
                const entities = e.detail.value ? e.detail.value.split(",") : [];
                this.variableSet = {
                    ...FormUtils.createObject(
                        this.variableSet,
                        param,
                        entities
                    )
                };
                break;
            // case "variables":
            //     this.variableSet = {...this.variableSet, variables: e.detail.value};
            //     break;
        }
    }

    // Option2 : Event for valiations ... this dispatch when user out the input field.
    // onBlurChange(e) {
    //     e.stopPropagation();
    //     const field = e.detail.param;
    //     console.log("VariableSet Data", field, e.detail.value);
    //     switch (e.detail.param) {
    //         case "id":
    //         case "name":
    //         case "unique":
    //         case "confidential":
    //         case "description":
    //         case "entities":
    //             console.log("Blur Event:", e.detail.value);
    //             if (field === "id") {
    //                 this.refreshForm();
    //             }
    //             console.log("VariableSet Data", this.variableSet);
    //             this.requestUpdate();
    //     }
    // }


    onClear() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Clear variable set",
            message: "Are you sure to clear?",
            ok: () => {
                this.variableSet = {};
                this.requestUpdate();

                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    message: "The fields has been cleaned.",
                });
            }
        });
    }

    async saveData() {
        // TODO: review requestUpdate();
        try {
            this.requestUpdate();
            await this.updateComplete;
            const res = await this.opencgaSession.opencgaClient.studies()
                .updateVariableSets(this.opencgaSession.study.fqn, this.variableSet, {action: "ADD"});
            this.variableSet = {
                variables: [],
                unique: true
            };
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                title: "New VariableSet",
                message: "VariableSet created correctly"
            });
            // FormUtils.showAlert(
            //     "New VariableSet",
            //     "VariableSet save correctly",
            //     "success"
            // );
        } catch (err) {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, err);
            // FormUtils.showAlert(
            //     "New VariableSet",
            //     `Could not save variableSet ${err}`,
            //     "error"
            // );
        } finally {
            this.requestUpdate();
            await this.updateComplete;
        }
    }

    onSubmit() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Create new variable set",
            message: "Are you sure to create?",
            dispatch: {
                okButtonText: "Yes, save it!",
            },
            ok: () => {
                this.saveData();
            },
        });
    }

    onAddOrUpdateItem(e) {
        const param = e.detail.param;
        const value = e.detail.value;
        if (UtilsNew.isNotEmpty(value)) {
            this.variableSet = {...this.variableSet, variables: value};
        } else {
            this.variableSet = {
                ...this.variableSet,
                [param]: []
            };
            delete this.variableSet[param];
        }
        this.requestUpdate();
    }

    #onAddValues(e) {
        console.log("Execute this function ", this.variable);
        e.stopPropagation();
        if (this.variable.type === "CATEGORICAL") {
            this.variable.allowedValues = e.detail.value ?? [];
        } else {
            this.variable.allowedKeys = e.detail.value ?? [];
        }
        this.refreshForm();
    }

    render() {
        return html `
            <data-form
                .data=${this.variableSet}
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @addOrUpdateItem="${e => this.onAddOrUpdateItem(e)}"
                @clear="${e => this.onClear(e)}"
                @submit="${e => this.onSubmit(e)}">
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
                            allowedValues: ["SAMPLE", "COHORT", "INDIVIDUAL", "FAMILY", "FILE"],
                            multiple: true,
                            display: {
                                placeholder: "select a entity..."
                            }
                        },
                        {
                            title: "Unique",
                            field: "unique",
                            type: "checkbox",
                        },
                        {
                            title: "Confidential",
                            field: "confidential",
                            type: "checkbox",
                            checked: false
                        },
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
                                {
                                    title: "Default Value",
                                    field: "variables[].defaultValue",
                                    type: "checkbox",
                                    display: {
                                        // visible: variable => variable?.type === "BOOLEAN",
                                        visible: false,
                                    }
                                },
                                {
                                    title: "Default Value",
                                    field: "variables[].defaultValue",
                                    type: "input-text",
                                    display: {
                                        visible: false,
                                        // visible: variable => variable?.type !== "BOOLEAN" && variable?.type !== "DOUBLE" && variable?.type !== "INTEGER",
                                        disabled: variable => !variable?.type && !(variable?.type === "STRING" || variable?.type === "CATEGORICAL")
                                    }
                                },
                                {
                                    title: "Default Value",
                                    field: "variables[].defaultValue",
                                    type: "input-num",
                                    display: {
                                        visible: false,
                                        // visible: variable => variable?.type === "DOUBLE" || variable?.type === "INTEGER",
                                    }
                                },
                                {
                                    title: "Depends On",
                                    field: "variables[].dependsOn",
                                    type: "select",
                                    allowedValues: this.dependsOn?.map(variable => variable.name),
                                    display: {
                                        visible: false,
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
                // {
                //     title: "Variables",
                //     elements: [
                //         {
                //             title: "Variables",
                //             field: "variables",
                //             type: "custom-list",
                //             display: {
                //                 style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
                //                 collapsedUpdate: true,
                //                 renderUpdate: (variable, callback) => html `
                //                     <variable-update
                //                         .variable="${variable}"
                //                         .displayConfig="${{
                //                             defaultLayout: "vertical",
                //                             buttonOkText: "Save",
                //                             buttonClearText: "",
                //                         }}"
                //                         @updateItem="${callback}">
                //                     </variable-update>
                //                 `,
                //                 renderCreate: (variable, callback) => html`
                //                     <label>Create new item</label>
                //                     <variable-create
                //                         .displayConfig="${{
                //                             defaultLayout: "vertical",
                //                             buttonOkText: "Add",
                //                             buttonClearText: "",
                //                         }}"
                //                         @addItem="${callback}">
                //                     </variable-create>`
                //             }
                //         },
                //     ]
                // },
                // {
                //     title: "Variables",
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
                //                     <variable-list-update
                //                         .variables="${this.variableSet?.variables}"
                //                         @changeVariables="${e => this.onFieldChange(e, "variables")}">
                //                     </variable-list-update>`
                //             }
                //         },
                //     ]
                // }
            ]
        });
    }

}

customElements.define("variable-set-create", VariableSetCreate);
