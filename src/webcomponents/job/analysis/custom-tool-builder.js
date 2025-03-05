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


export default class CustomToolBuilder extends LitElement {

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
        this.ANALYSIS_TOOL = "tool-builder";
        this.ANALYSIS_TITLE = "Custom Tool Builder";
        this.ANALYSIS_DESCRIPTION = "Builds a Docker-based tool";

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
            gitRepository: this.toolParams.gitRepository,
            aptGet: this.toolParams.aptGet || "",
            installR: this.toolParams.installR || false,
            docker: {
                organisation: this.toolParams.docker?.organisation || "",
                name: this.toolParams.docker?.name || "",
                tag: this.toolParams.docker?.tag || "",
                user: this.toolParams.docker?.user || "",
                password: this.toolParams.docker?.password || "",
            }
        };
        const params = {
            study: this.opencgaSession.study.fqn,
            ...AnalysisUtils.fillJobParams(this.toolParams, this.ANALYSIS_TOOL),
        };
        AnalysisUtils.submit(
            this.ANALYSIS_TITLE,
            this.opencgaSession.opencgaClient.jobs()
                .buildTool(toolParams, params),
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
                        title: "GitHub Repository",
                        field: "gitRepository",
                        type: "input-text",
                        required: true,
                        display: {
                            help: {
                                text: "GitHub repository to be build the tool from",
                            }
                        }
                    },
                    {
                        title: "Ubuntu apt-get dependencies",
                        field: "aptGet",
                        type: "input-text",
                        required: false,
                        display: {
                            help: {
                                text: "List of Ubuntu apt-get dependencies to be installed",
                            }
                        }
                    },
                    {
                        title: "Ubuntu apt-get dependencies",
                        field: "installR",
                        type: "checkbox",
                        required: false,
                        display: {
                            help: {
                                text: "Whether to install R or not",
                            }
                        }
                    }
                ]
            },
            {
                title: "Docker Build Configuration",
                elements: [
                    {
                        title: "Docker Organisation",
                        field: "docker.organisation",
                        type: "input-text",
                        required: true,
                        display: {
                            placeholder: "eg. ubuntu:latest",
                            help: {
                                text: "Docker organisation to push the Docker image",
                            }
                        }
                    },
                    {
                        title: "Docker Name",
                        field: "docker.name",
                        type: "input-text",
                        required: true,
                        display: {
                            help: {
                                text: "Docker name to be pushed",
                            }
                        }
                    },
                    {
                        title: "Docker Tag",
                        field: "docker.tag",
                        type: "input-text",
                        required: true,
                        display: {
                            help: {
                                text: "Docker tag to be used",
                            }
                        }
                    },
                    {
                        title: "Docker User Name",
                        field: "docker.user",
                        type: "input-text",
                        required: true,
                        display: {
                            help: {
                                text: "Docker user name to push the Docker image",
                            }
                        }
                    },
                    {
                        title: "Docker Password",
                        field: "docker.password",
                        type: "input-password",
                        required: true,
                        display: {
                            help: {
                                text: "Docker password to push the Docker image",
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

customElements.define("custom-tool-builder", CustomToolBuilder);
