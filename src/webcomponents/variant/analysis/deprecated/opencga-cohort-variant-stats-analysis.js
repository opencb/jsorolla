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


export default class OpencgaCohortVariantStatsAnalysis extends LitElement {

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
            id: "cohort-variant-stats",
            title: "Cohort Variant Stats",
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
                                id: "cohort",
                                title: "Cohort name",
                                type: "COHORT_FILTER",
                                addButton: true,
                                showList: true,
                                fileUpload: true
                            },
                            {
                                id: "sample",
                                title: "List of samples",
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
                                id: "sampleAnnotation",
                                title: "Samples query selecting samples of the control cohort, e.g.: age>30;gender=FEMALE",
                                type: "text"
                            },
                            {
                                id: "index",
                                title: "Index results in catalog (it requires a cohort)",
                                type: "boolean"
                            }
                        ]
                    }
                ],
                job: {
                    title: "Job Info",
                    id: "cohort-variant-stats-$DATE",
                    tags: "",
                    description: "",
                    button: "Run",
                    validation: function(params) {
                        alert("test:" + params);
                    },
                }
            },
            execute: (opencgaSession, data, params) => {
                opencgaSession.opencgaClient.variants().runCohortStats(data, params);
            },
            result: {
                // mode: "file",
                // render: (oencgaSession, jobId) => {
                //
                // }
            }
        };
    }

    render() {
        return html`
           <opencga-analysis-tool .opencgaSession="${this.opencgaSession}" .config="${this._config}" ></opencga-analysis-tool>
        `;
    }
}

customElements.define("opencga-cohort-variant-stats-analysis", OpencgaCohortVariantStatsAnalysis);
