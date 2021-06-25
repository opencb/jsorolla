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
            variables: this.sampleVariables()
        };
        this.variable = {};
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    onFieldChangeVariableSet(e) {
        const field = e.detail.param;
        switch (e.detail.param) {
            case "id":
            case "name":
            case "unique":
            case "confidential":
            case "description":
                if (e.detail.param === "entities") {
                    this.renderFieldEntity(e.detail.value);
                }
                this.variableSet = {
                    ...this.variableSet,
                    [field]: e.detail.value
                };
                break;
        }
    }

    renderFieldEntity(entity) {
        console.log("Render exclusive form by entity", entity);
    }

    getDefaultConfig() {
        const annotableDataModels = ["SAMPLE", "COHORT", "INDIVIDUAL", "FAMILY", "FILE"];
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
                    mode: "block"
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
                                    <variable-list-manager
                                        .opencgaSession="${this.opencgaSession}"
                                        .variables="${this.variableSet?.variables}">
                                    </variable-list-manager>`
                            }
                        },
                    ]
                }
            ]
        };
    }

    async onAddVariable(e) {
        // TODO: Fixme, I don't know why
        // I've to clean variableSet to reflex the changes.
        const variable = e.detail.value;
        const variableSetCopy = {...this.variableSet};
        this.variableSet = {variables: []};
        this._config = {...this.getDefaultConfig(), ...this.config};
        await this.requestUpdate();

        this.variableSet = variableSetCopy;
        this.variableSet.variables.push(variable);
        console.log("onAddVariable Result: ", this.variableSet);
        await this.requestUpdate();

        e.stopPropagation();
    }

    onRemoveVariable(e) {
        console.log("onRemoveVariable");
        this.variableSet = {
            ...this.variableSet,
            variables: this.variableSet.variables.filter(item => item !== e.detail.value)
        };
        this.requestUpdate();
    }

    onClear(e) {
        console.log("Clear Form");
    }

    onSubmit(e) {
        console.log("Submit Form: ", this.variableSet);
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

customElements.define("variable-set-create", VariableSetCreate);
