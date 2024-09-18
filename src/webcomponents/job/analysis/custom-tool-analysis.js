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


export default class CustomToolAnalysis extends LitElement {

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
            config: {
                type: Object
            },
        };
    }

    #init() {
        this.ANALYSIS_TOOL = "custom-tool";
        this.ANALYSIS_TITLE = "Custom Tool Analysis";
        this.ANALYSIS_DESCRIPTION = "Executes a custom tool analysis job";

        this.DEFAULT_TOOLPARAMS = {};
        // Make a deep copy to avoid modifying default object.
        this.toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
        };

        this.config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("toolParams")) {
            this.toolParams = {
                ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
                ...this.toolParams,
            };
            this.config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    check() {
        // FIXME decide if this must be displayed
        // if (!this.toolParams.caseCohort) {
        //     return {
        //         message: "You must select a cohort or sample",
        //         notificationType: "warning"
        //     };
        // }
        return null;
    }

    onFieldChange(e) {
        this.toolParams = {...this.toolParams};
        // Note: these parameters have been removed from the form
        // Check if changed param was controlCohort --> reset controlCohortSamples field
        // if (param === "controlCohort") {
        //     this.toolParams.controlCohortSamples = "";
        // }
        // Check if changed param was caseCohort --> reset caseCohortSamples field
        // if (param === "caseCohort") {
        //     this.toolParams.caseCohortSamples = "";
        // }
        // this.config = this.getDefaultConfig();
        this.requestUpdate();
    }

    onSubmit() {
        const toolParams = {
            commandLine: this.toolParams.commandLine,
            docker: {
                id: this.toolParams.docker?.id || "",
                tag: this.toolParams.docker?.tag || "",
                token: this.toolParams.docker?.token || "",
            }
        };
        const params = {
            study: this.opencgaSession.study.fqn,
            ...AnalysisUtils.fillJobParams(this.toolParams, this.ANALYSIS_TOOL),
        };
        AnalysisUtils.submit(
            this.ANALYSIS_TITLE,
            this.opencgaSession.opencgaClient.jobs()
                .run(toolParams, params),
            this,
        );
    }

    onClear() {
        this.toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
        };
        this.config = this.getDefaultConfig();
    }

    render() {
        return html`
            <data-form
                .data="${this.toolParams}"
                .config="${this.config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${this.onSubmit}">
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
            this.config
        );
    }

}

customElements.define("custom-tool-analysis", CustomToolAnalysis);
