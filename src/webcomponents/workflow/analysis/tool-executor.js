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
import "../../commons/filters/catalog-search-autocomplete.js";

export default class UserToolExecutor extends LitElement {

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
            opencgaSession: {
                type: Object,
            },
            displayConfig: {
                type: Object
            },
        };
    }

    #init() {
        this.ANALYSIS_TOOL = "user-tool";
        this.ANALYSIS_TITLE = "User Tool Parameters";
        this.ANALYSIS_DESCRIPTION = "Executes a custom tool or workflow analysis job";

        this.DEFAULT_TOOLPARAMS = {
            variables: {},
        };

        this._tool = null;
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

        // check if we need to fetch tool information
        if (this.toolParams?.id) {
            this.fetchUserTool();
        }
    }

    check() {
        return false;
    }

    fetchUserTool() {
        this._tool = null;
        this.opencgaSession.opencgaClient.userTool()
            .search({
                id: this._toolParams.id,
                study: this.opencgaSession.study.fqn,
            })
            .then(response => {
                if (response.responses?.[0]?.results?.length > 0) {
                    this._tool = response.responses[0].results[0];
                }
                // update the commandLine parameter if defined in the tool
                if (this._tool?.type === "CUSTOM_TOOL" && this._tool?.container?.commandLine) {
                    this._toolParams.commandLine = this._tool.container.commandLine;
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

    onFieldChange(event) {
        this._toolParams = {...this._toolParams};
        this.requestUpdate();

        // fetch selected tool information
        if (event.detail?.param === "id" && event.detail?.value) {
            this.fetchUserTool();
        }
    }

    onSubmit() {
        // 1. initialize form params object
        const formParams = {};

        // 2. include variables defined in the tool and filled in the form
        Object.keys(this._toolParams.variables || {}).forEach(variableId => {
            const variableConfig = (this._tool?.variables || []).find(v => v.id === variableId);
            formParams[variableId] = this._toolParams.variables[variableId];
            // check if the variable is of type FILE to add the file:// prefix if not present
            if (variableConfig?.type === "FILE" && formParams[variableId] && !formParams[variableId].startsWith("file://")) {
                formParams[variableId] = `file://${formParams[variableId]}`;
            }
        });

        // 3. add other variables from the text area, with the format key=value
        if (this._toolParams.otherVariables) {
            const lines = this._toolParams.otherVariables.split("\n");
            for (const line of lines) {
                if (line.includes("=")) {
                    const [key, value] = line.split("=");
                    formParams[key] = value;
                }
            }
        }

        // 4. prepare the job params
        const jobParams = AnalysisUtils.fillJobParams(this._toolParams, this.ANALYSIS_TOOL);
        jobParams.jobTags = this._tool.id;

        // 5. check the type of tool to choose the right run method
        let toolRunPromise = null;
        let toolParams = null;
        switch (this._tool.type.toUpperCase()) {
            case "CUSTOM_TOOL":
                toolParams = {
                    id: this._tool.id,
                    commandLine: this._toolParams.commandLine,
                    params: formParams,
                };
                toolRunPromise = this.opencgaSession.opencgaClient.userTool()
                    .runCustomDocker(toolParams, {
                        study: this.opencgaSession.study.fqn,
                        ...jobParams,
                    });
                break;
            case "WORKFLOW":
                toolParams = {
                    id: this._tool.id,
                    params: formParams,
                };
                toolRunPromise = this.opencgaSession.opencgaClient.userTool()
                    .runWorkflow(toolParams, {
                        study: this.opencgaSession.study.fqn,
                        ...jobParams,
                    });
                break;
            default:
                console.error("Tool type not supported: ", this._tool.type);
                return;
        }

        // submit analysis
        AnalysisUtils.submit(this.ANALYSIS_TITLE, toolRunPromise, this);
    }

    onClear() {
        this._toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
            ...this.toolParams,
        };
        // include the commandLine again if tool is CUSTOM_TOOL
        if (this._tool?.type === "CUSTOM_TOOL" && this._tool?.container?.commandLine) {
            this._toolParams.commandLine = this._tool.container.commandLine;
        }
        // we have to refresh the form configuration
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
        if (this._tool?.variables?.length > 0) {
            for (const variable of this._tool.variables) {
                const dataFormElement = {
                    title: variable.id,
                    field: `variables.${variable.id}`,
                    required: variable.required || false,
                    display: {
                        disabled: typeof this.toolParams?.variables?.[variable.id] !== "undefined",
                        defaultValue: variable.defaultValue,
                        helpMessage: variable.description,
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
                    case "FILE":
                        dataFormElement.type = "custom";
                        dataFormElement.display.render = (file, onChange) => html`
                            <catalog-search-autocomplete
                                .value="${(file || "").replace("file://", "")}"
                                .resource="${"FILE"}"
                                .opencgaSession="${this.opencgaSession}"
                                .config="${{
                                    multiple: false,
                                }}"
                                @filterChange="${event => onChange(event.detail.value)}">
                            </catalog-search-autocomplete>
                        `;
                        break;
                }
                variables.push(dataFormElement);
            }
        }

        const params = [
            {
                title: "Configuration",
                elements: [
                    {
                        title: "Tool ID",
                        field: "id",
                        type: "custom",
                        required: true,
                        display: {
                            render: (toolId, dataFormFilterChange) => html`
                                <catalog-search-autocomplete
                                    .value="${toolId}"
                                    .resource="${"WORKFLOW"}"
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${{
                                        multiple: false,
                                        disabled: !!this.toolParams?.id,
                                    }}"
                                    @filterChange="${event => dataFormFilterChange(event.detail.value)}">
                                </catalog-search-autocomplete>
                            `,
                        },
                    },
                    {
                        title: "Command Line",
                        field: "commandLine",
                        type: "input-text",
                        display: {
                            visible: this._tool?.type === "CUSTOM_TOOL",
                        },
                    },
                ]
            },
            {
                title: "Parameters",
                elements: [
                    ...variables,
                    {
                        title: "Parameters",
                        field: "otherVariables",
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
                        field: "otherVariables",
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

customElements.define("tool-executor", UserToolExecutor);
