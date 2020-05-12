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

import {LitElement, html} from "/web_modules/lit-element.js";
import UtilsNew from "./../../../utilsNew.js";
import "../../commons/analysis/opencga-analysis-tool.js";


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
                        title: "Input Parameters",
                        collapsed: false,
                        parameters: [
                            {
                                id: "sample",
                                title: "Select samples",
                                type: "SAMPLE_FILTER",
                                showList: true
                                // colspan: 6
                            },
                            {
                                id: "cohort",
                                title: "Select cohort",
                                type: "COHORT_FILTER",
                                showList: true
                                // colspan: 6
                            },
                            {
                                id: "phenotype",
                                title: "Select phenotype",
                                type: "string",
                                // colspan: 6
                            }
                        ]
                    },
                    {
                        title: "Configuration Parameters",
                        collapsed: false,
                        parameters: [
                            {
                                id: "assoc",
                                title: "Select association test",
                                type: "category",
                                required: true,
                                defaultValue: "Fisher",
                                allowedValues: ["Fisher", "Chi", "LR"],
                                multiple: false,
                                // colspan: 6
                                //maxOptions: 1 //you don't need to define maxOptions if multiple=false
                            },
                            {
                                id: "fisher-test",
                                title: "Select Fisher mode",
                                type: "category",
                                defaultValue: "GT",
                                allowedValues: ["GT", "LT"],
                                multiple: false,
                                // colspan: 6,
                                dependsOn: "assoc == Fisher"
                            },
                            // {
                            //     id: "freq",
                            //     title: "Filter by frequency",
                            //     type: "number",
                            //     required: true,
                            //     defaultValue: "0.01",
                            //     allowedValues: [0, 1],
                            //     colspan: 6
                            // },
                            // {
                            //     id: "gene",
                            //     title: "Filter by Genes",
                            //     type: "string",
                            //     required: true,
                            //     defaultValue: "default String",
                            //     // colspan: 6,
                            //     dependsOn: config => {console.warn("dependsOn Callback", config); return true}
                            // }
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
                opencgaSession.opencgaClient.variants().runGwas(data, params);
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
