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
import UtilsNew from "../../../../core/utils-new.js";
import "../../../commons/analysis/opencga-analysis-tool.js";


export default class OpencgaGwasAnalysis extends LitElement {

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
            id: "gwas",
            title: "GWAS",
            icon: "",
            requires: "2.0.0",
            description: "GWAS description",
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
                        title: "Case Cohort Parameters",
                        collapsed: false,
                        parameters: [
                            {
                                id: "caseCohort",
                                title: "Select cohort",
                                type: "COHORT_FILTER",
                                addButton: true,
                                showList: true,
                                fileUpload: true
                            },
                            {
                                id: "caseCohortSamples",
                                title: "Select cohort samples",
                                type: "text"
                            },
                            {
                                id: "caseCohortSamplesAnnotation",
                                title: "Select cohort sample annotation",
                                type: "text"
                            }
                        ]
                    },
                    {
                        title: "Control Cohort Parameters",
                        collapsed: false,
                        parameters: [
                            {
                                id: "controlCohort",
                                title: "Select cohort",
                                type: "COHORT_FILTER",
                                addButton: true,
                                showList: true,
                                fileUpload: true
                                // colspan: 6
                            },
                            {
                                id: "controlCohortSamples",
                                title: "Select cohort samples",
                                type: "text"
                            },
                            {
                                id: "controlCohortSamplesAnnotation",
                                title: "Select cohort sample annotation",
                                type: "text"
                            }
                        ]
                    },
                    {
                        title: "Configuration Parameters",
                        collapsed: false,
                        parameters: [
                            {
                                id: "method",
                                title: "Select association test",
                                type: "category",
                                required: true,
                                defaultValue: "FISHER_TEST",
                                allowedValues: ["FISHER_TEST", "CHI_SQUARE_TEST"],
                                multiple: false,
                                // colspan: 6
                                //maxOptions: 1 //you don't need to define maxOptions if multiple=false
                            },
                            {
                                id: "fisherMode",
                                title: "Select Fisher mode",
                                type: "category",
                                defaultValue: "GREATER",
                                allowedValues: ["GREATER", "LESS", "TWO_SIDED"],
                                multiple: false,
                                // colspan: 6,
                                dependsOn: "method == FISHER_TEST"
                            },
                            {
                                id: "phenotype",
                                title: "Select phenotype",
                                type: "text"
                            },
                            {
                                id: "index",
                                title: "Index results",
                                type: "boolean"
                            },
                            {
                                id: "indexScoreId",
                                title: "Index score id",
                                type: "text"
                            }
                        ]
                    }
                ],
                job: {
                    title: "Job Info",
                    id: "gwas-$DATE",
                    tags: "",
                    description: "",
                    validation: function(params) {
                        alert("test:" + params);
                    },
                    button: "Run"
                }
            },
            execute: (opencgaSession, data, params) => {
                let body = {};
                data.phenotype ? body.phenotype = data.phenotype[0] : null;
                data.method ? body.method = data.method[0] : null;
                data.fisherMode ? body.fisherMode = data.fisherMode[0] : null;
                opencgaSession.opencgaClient.variants().runGwas(body, params);
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

customElements.define("opencga-gwas-analysis", OpencgaGwasAnalysis);
