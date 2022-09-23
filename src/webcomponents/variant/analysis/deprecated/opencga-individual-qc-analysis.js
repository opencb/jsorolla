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
import UtilsNew from "./../../../core/utilsNew.js";
import "../../commons/analysis/opencga-analysis-tool.js";


export default class OpencgaIndividualQcAnalysis extends LitElement {

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
        this._prefix = "oga-" + UtilsNew.randomString(6);

        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();
    }

    updated(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.requestUpdate();
        }
    }

    getDefaultConfig() {
        return {
            id: "individual-qc",
            title: "Individual Quality Control",
            icon: "",
            requires: "2.0.0",
            description: "Run quality control (QC) for a given individual. It includes inferred sex and mendelian errors (UDP)",
            links: [
                {
                    title: "OpenCGA",
                    url: "http://docs.opencb.org/display/opencga/Genome-Wide+Association+Study",
                    icon: ""
                }
            ],
            form: {
                sections: [
                    {
                        title: "Input Parameters",
                        collapsed: false,
                        parameters: [
                            {
                                id: "individual",
                                title: "Select individuals",
                                type: "INDIVIDUAL_FILTER",
                                addButton: true,
                                showList: true,
                                fileUpload: true
                            },
                            {
                                id: "sample",
                                title: "Select sample",
                                type: "SAMPLE_FILTER",
                                addButton: true,
                                showList: true,
                                fileUpload: true
                            }
                        ]
                    },
                    {
                        title: "Configuration Parameters",
                        collapsed: false,
                        parameters: [
                            {
                                id: "inferredSexMethod",
                                title: "Inferred sex method",
                                type: "text"
                            }
                        ]
                    }
                ],
                job: {
                    title: "Job Info",
                    id: "individual-qc-$DATE",
                    tags: "",
                    description: "",
                    validation: function (params) {
                        alert("test:" + params);
                    },
                    button: "Run"
                }
            },
            execute: (opencgaSession, data, params) => {
                const body = {};
                data.individual ? body.individual = data.individual.join(",") : null;
                data.sample ? body.sample = data.sample.join(",") : null;
                opencgaSession.opencgaClient.variants().runIndividualQc(body, params);
            },
            result: {
            }
        };
    }

    render() {
        return html`
           <opencga-analysis-tool .opencgaSession="${this.opencgaSession}" .config="${this._config}" ></opencga-analysis-tool>
        `;
    }

}

customElements.define("opencga-individual-qc-analysis", OpencgaIndividualQcAnalysis);
