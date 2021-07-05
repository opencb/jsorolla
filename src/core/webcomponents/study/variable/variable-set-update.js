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
import "./variable-list-manager.js";
import FormUtils from "../../../form-utils.js";

export default class VariableSetUpdate extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            variableSet: {
                type: Object
            },
            variableSetId: {
                type: String
            },
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this.variableSet = {};
        this.updateParams = {};
        this.variable = {};
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    update(changedProperties) {
        if (changedProperties.has("variableSet")) {
            this.variableSetObserver();
        }

        if (changedProperties.has("variableSetId")) {
            this.variableSetIdObserver();
        }

        super.update(changedProperties);
    }

    variabelSetObserver() {
        if (this.variableSet) {
            this._variableSet = JSON.parse(JSON.stringify(this.variableSet));
        }
    }

    variableSetIdObserver() {
        if (this.opencgaSession && this.variableSetId) {
            this.opencgaSession.opencgaClient.studies().variableSets(this.opencgaSession.study.fqn, this.variableSetId)
                .then(response => {
                    this.variableSet = response.responses[0].results[0];
                    this.requestUpdate();
                })
                .catch(reason => {
                    console.error(reason);
                });
        }
    }

    refreshForm() {
        // When using data-form we need to update config object and render again
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.requestUpdate();
    }

    onFieldChangeVariableSet(e) {
        const field = e.detail.param;
        console.log("Field:", field);
        switch (e.detail.param) {
            case "id":
            case "name":
            case "unique":
            case "confidential":
            case "description":
            case "entities":
                this.variableSet = {
                    ...this.variableSet,
                    [field]: e.detail.value
                };
                break;
        }
        // TODO: Here we can put a switch of field has validation to refreshForm
        if (field === "id") {
            this.refreshForm();
        }
        console.log("VariableSet Data", this.variableSet);

    }


    getDefaultConfig() {
        return {
            title: "Edit",
            icon: "fas fa-edit",
            type: "form",
            buttons: {
                show: true,
                top: true,
                classes: "pull-right",
                cancelText: "Cancel",
                okText: "Save"
            },
            display: {
                style: "margin: 10px",
                labelWidth: 3,
                labelAlign: "right",
                defaultLayout: "horizontal",
                defaultValue: "",
                help: {
                    mode: "block",
                    // icon: "fa fa-lock",
                }
            },
            sections: [
                {
                    title: "General Information",
                    elements: [
                        {
                            name: "Id",
                            field: "id",
                            type: "input-text",
                            required: "required",
                            display: {
                                placeholder: "Add a short ID...",
                                help: {
                                    // mode: "block",
                                    icon: "fa fa-lock",
                                    text: "short variableSet id"

                                },
                                validation: {
                                    message: "Please enter more that 3 character",
                                    validate: variable => variable?.id?.length > 4 || variable?.id === undefined || variable?.id === ""
                                    // TODO: this work if we update the config everychange
                                    // to re-evaluate or refresh the form applying the validation.
                                    // validate: variable => variable?.id?.length > 4
                                }
                            }
                        },
                        {
                            name: "Name",
                            field: "name",
                            type: "input-text",
                            required: "required",
                            display: {
                                placeholder: "Name ...",
                                help: {
                                    text: ";kaslkaslkas"
                                },
                            }
                        },
                        {
                            name: "Entities",
                            field: "entities",
                            type: "select",
                            allowedValues: ["SAMPLE", "COHORT", "INDIVIDUAL", "FAMILY", "FILE"],
                            multiple: true,
                            display: {
                                placeholder: "select a entity..."
                            }
                        },
                        {
                            name: "Unique",
                            field: "unique",
                            type: "checkbox",
                            required: true
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
                            required: true,
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
                            field: "variables",
                            type: "custom",
                            display: {
                                layout: "vertical",
                                defaultLayout: "vertical",
                                width: 12,
                                style: "padding-left: 0px",
                                render: () => html`
                                    <variable-list-manager
                                        .opencgaSession="${this.opencgaSession}"
                                        .variables="${this.variableSet?.variables}"
                                        @changeVariables="${e => this.onSyncVariables(e)}">
                                    </variable-list-manager>`
                            }
                        },
                    ]
                }
            ]
        };
    }

    async onSyncVariables(e) {
        console.log("...Sync variables list to the variableSet", e.detail.value);
        this.variableSet = {...this.variableSet, variables: e.detail.value};
        console.log("variableSet synced: ", this.variableSet);
        e.stopPropagation();
    }

    onClear(e) {
        console.log("Clear Form");
        Swal.fire({
            title: "Are you sure to clear?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then(result => {
            if (result.isConfirmed) {
                this.variableSet = {};
                this.requestUpdate();
                Swal.fire(
                    "Cleaned!",
                    "The fields has been cleaned.",
                    "success"
                );
            }
        });
    }

    async onSubmit(e) {
        e.preventDefault();
        console.log("Submit Form: ", this.variableSet);
        // try {
        //     const res = await this.opencgaSession.opencgaClient.studies()
        //         .updateVariableSets(this.opencgaSession.study.fqn, this.variableSet, {action: "ADD"});
        //     this.variableSet = {
        //         variables: [],
        //         unique: true
        //     };
        //     this.requestUpdate();
        //     FormUtils.showAlert(
        //         "New VariableSet",
        //         "VariableSet save correctly",
        //         "success"
        //     );
        // } catch (err) {
        //     FormUtils.showAlert(
        //         "New VariableSet",
        //         `Could not save variableSet ${err}`,
        //         "error"
        //     );
        // }
    }

    sampleVariables() {
        return [
            {
                "id": "typeCount",
                "name": "typeCount",
                "category": "",
                "type": "MAP_INTEGER",
                "required": false,
                "multiValue": false,
                "allowedValues": [],
                "rank": 7,
                "dependsOn": "",
                "description": "Variants count group by type. e.g. SNP, INDEL, MNP, SNV, ...",
                "attributes": {}
            },
            {
                "id": "variantCount",
                "name": "variantCount",
                "category": "",
                "type": "INTEGER",
                "required": false,
                "multiValue": false,
                "allowedValues": [],
                "rank": 0,
                "dependsOn": "",
                "description": "Number of variants in the variant set",
                "attributes": {}
            },
            {
                "id": "hsMetricsReport",
                "name": "Hs metrics report",
                "category": "",
                "type": "OBJECT",
                "required": false,
                "multiValue": false,
                "allowedValues": [],
                "rank": 10,
                "dependsOn": "",
                "description": "Hs metrics report (from the picard/CollecHsMetrics command)",
                "variables": [
                    {
                        "id": "onBaitVsSelected",
                        "name": "On bait vs selected",
                        "type": "DOUBLE",
                        "required": false,
                        "multiValue": false,
                        "allowedValues": [],
                        "rank": 24,
                        "description": "The percentage of on+near bait bases that are on as opposed to near"
                    },
                    {
                        "id": "minTargetCoverage",
                        "name": "Min target coverage",
                        "type": "DOUBLE",
                        "required": false,
                        "multiValue": false,
                        "allowedValues": [],
                        "rank": 23,
                        "description": "The minimum coverage of targets"
                    }
                ]
            },
            {
                "id": "fastQcReport",
                "name": "FastQC report",
                "category": "",
                "type": "OBJECT",
                "required": false,
                "multiValue": false,
                "allowedValues": [],
                "rank": 8,
                "dependsOn": "",
                "description": "FastQC report (from the FastQC tool)",
                "variables": [],
                "attributes": {}
            },
            {
                "id": "mendelianErrorsReport",
                "name": "Mendelian errors report",
                "category": "",
                "type": "OBJECT",
                "required": false,
                "multiValue": false,
                "allowedValues": [],
                "rank": 7,
                "dependsOn": "",
                "description": "Mendelian errors report",
                "variables": [
                    {
                        "id": "numErrors",
                        "name": "Total number of errors",
                        "type": "INTEGER",
                        "required": false,
                        "multiValue": false,
                        "allowedValues": [],
                        "rank": 0,
                        "description": "Total number of errors"
                    },
                    {
                        "id": "chromAggregation",
                        "name": "Aggregation per chromosome",
                        "type": "OBJECT",
                        "required": false,
                        "multiValue": false,
                        "allowedValues": [],
                        "rank": 2,
                        "description": "Aggregation per chromosome",
                        "variables": [
                            {
                                "id": "codeAggregation",
                                "name": "Aggregation per error code",
                                "type": "MAP_INTEGER",
                                "required": false,
                                "multiValue": false,
                                "allowedValues": [],
                                "rank": 2,
                                "description": "Aggregation per error code for that chromosome"
                            },
                            {
                                "id": "numErrors",
                                "name": "Total number of errors",
                                "type": "STRING",
                                "required": false,
                                "multiValue": false,
                                "allowedValues": [],
                                "rank": 1,
                                "description": "Total number of errors"
                            },
                            {
                                "id": "chromosome",
                                "name": "chromosome",
                                "type": "STRING",
                                "required": false,
                                "multiValue": false,
                                "allowedValues": [],
                                "rank": 0,
                                "description": "Chromosome"
                            }
                        ]
                    },
                ]
            }
        ];
    }

    render() {
        return html `
             <data-form
                 .data=${this.variableSet}
                 .config="${this._config}"
                 @fieldChange="${e => this.onFieldChangeVariableSet(e)}"
                 @clear="${e => this.onClear(e)}"
                 @submit="${e => this.onSubmit(e)}">
             </data-form>`;
    }

}

customElements.define("variable-set-update", VariableSetUpdate);
