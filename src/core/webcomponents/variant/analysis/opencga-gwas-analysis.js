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
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "oga-" + Utils.randomString(6);
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.fieldMap = {};
    }

    updated(changedProperties) {
        if (changedProperties.has("config")) {
            //this._config = Object.assign(this.getDefaultConfig(), this.config);
        }
    }

    getDefaultConfig() {
        return {
            id: "test1",
            title: "Test 1",
            icon: "",
            requires: "2.0.0",
            description: "Test1 description",
            links: [
                {
                    title: "Wikipedia",
                    url: "",
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
                                type: "SAMPLE_FILTER"
                            },
                            {
                                id: "cohort",
                                title: "Select cohort",
                                type: "COHORT_FILTER"
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
                                defaultValue: "Fisher",
                                allowedValues: ["Fisher", "Chi", "LR"],
                                multiple: false,
                                //maxOptions: 1 //you don't need to define maxOptions if multiple=false
                            },
                            {
                                id: "fisher-test",
                                title: "Select Fisher mode",
                                type: "category",
                                defaultValue: "GT",
                                allowedValues: ["GT", "LT"],
                                multiple: false,
                                dependsOn: "assoc == Fisher"
                            },
                            {
                                id: "freq",
                                title: "Filter by frequency",
                                type: "number",
                                defaultValue: "0.01",
                                allowedValues: [0, 1],
                                required: true
                            },
                            {
                                id: "gene",
                                title: "Filter by Genes",
                                type: "string",
                                defaultValue: "default String",
                                dependsOn: (config) => {console.warn("dependsOn Callback", config); return true},
                                required: true
                            }
                        ]
                    }
                ],
                run: {
                    title: "Job Info",
                    job: {
                        id: "$ID-$DATE-$RANDOM",
                        tags: "",
                        description: ""
                    },
                    execute: {
                        validation: function(params) {
                            alert("test:" + params);
                        },
                        button: "Run"
                    }
                }
            },
            result: {

            }
        };
    }

    render() {
        return html`
           <opencga-analysis-tool .config="${this._config}"></opencga-analysis-tool>
        `;
    }
}

customElements.define("opencga-gwas-analysis", OpencgaGwasAnalysis);
