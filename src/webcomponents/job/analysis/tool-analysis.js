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


export default class ToolAnalysis extends LitElement {

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
        this.ANALYSIS_TOOL = "tool";
        this.ANALYSIS_TITLE = "Tool Analysis";
        this.ANALYSIS_DESCRIPTION = "Executes a Docker-based tool analysis job";

        this.DEFAULT_TOOLPARAMS = {};

        this._toolParams = UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS);
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("toolParams")) {
            this._toolParams = {
                ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
                ...this.toolParams,
            };
        }

        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    check() {
        return null;
    }

    onFieldChange(e) {
        this._toolParams = {...this._toolParams};
        this.requestUpdate();
    }

    onSubmit() {
        const toolParams = {
            commandLine: this._toolParams.commandLine,
            docker: {
                id: this._toolParams.docker?.id || "",
                tag: this._toolParams.docker?.tag || "",
                token: this._toolParams.docker?.token || "",
            },
        };

        AnalysisUtils.submit(
            this.ANALYSIS_TITLE,
            this.opencgaSession.opencgaClient.jobs()
                .runTool(toolParams, {
                    study: this.opencgaSession.study.fqn,
                    ...AnalysisUtils.fillJobParams(this._toolParams, this.ANALYSIS_TOOL),
                }),
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
        const params = [
            {
                title: "Command Line",
                elements: [
                    {
                        title: "Command Line",
                        field: "commandLine",
                        type: "input-text",
                        required: true,
                        display: {
                            help: {
                                text: "Command line to be executed in the Docker container. To use file you must use the prefix 'opencga://' before the path or name, for example: 'input_file=opencga://file.vcf'",
                            }
                        }
                    }
                ]
            },
            {
                title: "Docker Configuration",
                elements: [
                    {
                        title: "Docker Image",
                        field: "docker.id",
                        type: "input-text",
                        display: {
                            placeholder: "eg. ubuntu:latest",
                            help: {
                                text: "Docker image to be used in the analysis. If empty then opencga-ext-tool is used",
                            }
                        }
                    },
                    {
                        title: "Docker Tag",
                        field: "docker.tag",
                        type: "input-text",
                        display: {
                            help: {
                                text: "Docker tag to be used in the analysis",
                            }
                        }
                    },
                    {
                        title: "Docker Token",
                        field: "docker.token",
                        type: "input-text",
                        display: {
                            help: {
                                text: "A read-only token to access the Docker image",
                            }
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

customElements.define("tool-analysis", ToolAnalysis);
