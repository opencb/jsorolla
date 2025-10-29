/*
 * Copyright 2015-2016 OpenCB
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
import AnalysisUtils from "../../commons/analysis/analysis-utils.js";
import UtilsNew from "../../../core/utils-new.js";
import "../../commons/forms/data-form.js";


export default class WorkflowAnalysis extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            toolParams: {
                type: Object,
            },
            search: {
                type: Boolean,
            },
            opencgaSession: {
                type: Object,
            },
            displayConfig: {
                type: Object
            },
        };
    }

    #init() {
        this.ANALYSIS_TOOL = "workflow";
        this.ANALYSIS_TITLE = "Workflow Parameters";
        this.ANALYSIS_DESCRIPTION = "Executes a workflow analysis job";

        this.DEFAULT_TOOLPARAMS = {};
        this.search = true;

        this._workflow = null;
        this._toolParams = UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS);
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("toolParams")) {
            this.toolParamsObserver();
        }

        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    toolParamsObserver() {
        this._toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
            ...this.toolParams,
        };
        this._config = this.getDefaultConfig();

        if (this._toolParams.id) {
            this.#fetchWorkflow();
        }
    }

    check() {
        return false;
    }

    #fetchWorkflow() {
        this.opencgaSession.opencgaClient.workflows()
            .search({
                id: this._toolParams.id,
                study: this.opencgaSession.study.fqn,
            })
            .then(restResponse => {
                const results = restResponse.getResults();
                if (results.length > 0) {
                    this._workflow = results[0];
                } else {
                    console.error("Error in result format");
                }
            })
            .catch(response => {
                console.log(response);
            })
            .finally(() => {
                this._config = this.getDefaultConfig();
                this.requestUpdate();
            });
    }

    onFieldChange(e) {
        this._toolParams = {...this._toolParams};

        if (this._toolParams?.id) {
            this.#fetchWorkflow();
        }
    }

    onSubmit() {
        // Parse form params
        const formParams = {};
        if (this._toolParams.params) {
            const lines = this._toolParams.params.split("\n");
            for (const line of lines) {
                if (line.includes("=")) {
                    const [key, value] = line.split("=");
                    formParams[key] = value;
                }
            }
        }

        const toolParams = {
            id: this._toolParams.id,
            version: this._toolParams.version,
            params: formParams,
        };
        const params = {
            study: this.opencgaSession.study.fqn,
            ...AnalysisUtils.fillJobParams(this._toolParams, this.ANALYSIS_TOOL),
        };
        AnalysisUtils.submit(
            this.ANALYSIS_TITLE,
            this.opencgaSession.opencgaClient.workflows()
                .run(toolParams, params),
            this,
        );
    }

    onClear() {
        this._toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
            ...this.toolParams,
        };
        this._config = this.getDefaultConfig();
    }

    render() {
        return html`
            <data-form
                .data="${this._toolParams}"
                .config="${this._config}"
                @fieldChange="${event => this.onFieldChange(event)}"
                @clear="${event => this.onClear(event)}"
                @submit="${event => this.onSubmit(event)}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        // Create automatic form based on the workflow variables
        const variables = [];
        if (this._workflow?.variables?.length > 0) {
            for (const variable of this._workflow.variables) {
                const dataFormElement = {
                    title: variable.id,
                    field: variable.id,
                    required: variable.required || false,
                    display: {
                        defaultValue: variable.defaultValue,
                        help: {
                            text: `Variable name '${variable.name || variable.id}'. ${variable.description || ""}`,
                        }
                    }
                };

                switch (variable.type) {
                    case "BOOLEAN":
                        dataFormElement.type = "checkbox";
                        break;
                    case "INTEGER":
                    case "DOUBLE":
                    case "STRING":
                        dataFormElement.type = "input-text";
                        break;
                }
                variables.push(dataFormElement);
            }
        }

        const params = [
            {
                title: "Configuration",
                display: {
                    className: "p-2"
                },
                elements: [
                    {
                        title: "Workflow ID",
                        field: "id",
                        type: "custom",
                        required: true,
                        display: {
                            render: (caseCohort, dataFormFilterChange) => html`
                                <catalog-search-autocomplete
                                    .value="${caseCohort}"
                                    .resource="${"WORKFLOW"}"
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${{
                                        multiple: false,
                                        disabled: !this.search,
                                    }}"
                                    @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                </catalog-search-autocomplete>
                            `,
                        },
                    },
                    {
                        title: "Workflow Version",
                        field: "version",
                        type: "input-text",
                        required: false,
                        display: {
                            defaultValue: this._workflow?.version || "",
                            help: {
                                text: "Default version is the latest available",
                            }
                        }
                    }
                ]
            },
            {
                title: "Parameters",
                display: {
                    className: "p-2"
                },
                elements: [
                    ...variables,
                    {
                        title: "Parameters",
                        field: "params",
                        type: "input-text",
                        display: {
                            rows: 5,
                            placeholder: "k1=v1\nk2=v2\nk3=v3",
                            help: {
                                text: "Format valid is 'key=value', one per line. To use file you must use the prefix 'file://' before the path or name, for example: 'input_file=file://file.vcf'",
                            },
                            visible: () => variables.length === 0
                        }
                    },
                    {
                        title: "Other Parameters",
                        field: "params",
                        type: "input-text",
                        display: {
                            rows: 5,
                            placeholder: "k1=v1\nk2=v2\nk3=v3",
                            help: {
                                text: "Format valid is 'key=value', one per line. To use file you must use the prefix 'file://' before the path or name, for example: 'input_file=file://file.vcf'. These parameters will override the ones defined above.",
                            },
                            visible: () => variables.length > 0
                        }
                    },
                ]
            }
        ];

        return AnalysisUtils.getAnalysisConfiguration(
            this.ANALYSIS_TOOL,
            this.ANALYSIS_TITLE,
            this.ANALYSIS_DESCRIPTION,
            params,
            this.check(),
            {
                display: {
                    ...this.displayConfig,
                },
            },
        );
    }

}

customElements.define("workflow-analysis", WorkflowAnalysis);
