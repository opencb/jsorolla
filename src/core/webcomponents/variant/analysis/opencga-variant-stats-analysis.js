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
import Utils from "./../../../utils.js";
import "../../commons/analysis/opencga-analysis-tool.js";


export default class OpencgaVariantStatsAnalysis extends LitElement {

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
            id: "cohort-stats",
            title: "Cohort variant statistics",
            icon: "",
            requires: "2.0.0",
            description: "Compute cohort variant stats for the selected list of samples..",
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
                                id: "study",
                                title: "Study where all the samples belong to",
                                type: "text",
                            },
                            {
                                id: "cohort",
                                title: "Cohort name",
                                type: "text",
                            },
                            {
                                id: "sample",
                                title: "List of samples",
                                type: "SAMPLE_FILTERt",
                            },
                            {
                                id: "sampleAnnotation",
                                title: "Samples query selecting samples of the control cohort, e.g.: age>30;gender=FEMALE",
                                type: "text",
                            },
                            {
                                id: "index",
                                title: "Index results in catalog (it requires a cohort)",
                                type: "boolean",
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
                        button: "Run",
                    }
                }
            },
            result: {}
        };
    }

    render() {
        return html`
           <opencga-analysis-tool .opencgaSession="${this.opencgaSession}" .config="${this._config}" ></opencga-analysis-tool>
        `;
    }
}

customElements.define("opencga-variant-stats-analysis", OpencgaVariantStatsAnalysis);
