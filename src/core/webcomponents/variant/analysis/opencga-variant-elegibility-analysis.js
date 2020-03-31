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


export default class OpencgaVariantEligibilityAnalysis extends LitElement {

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
            id: "sample-eligibility",
            title: "Sample eligibility analysis",
            icon: "",
            requires: "2.0.0",
            description: "Filter samples by a complex query involving metadata and variants data.",
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
                                title: "Study [[user@]project:]study where study and project can be either the ID or UUID",
                                type: "text",
                            },
                            {
                                id: "query",
                                title: "Election query. e.g. ((gene=A AND ct=lof) AND (NOT (gene=B AND ct=lof)))",
                                type: "text",
                            },
                            {
                                id: "index",
                                title: "Create a cohort with the resulting set of samples (if any)",
                                type: "boolean",
                            },
                            {
                                id: "cohortId",
                                title: "ID for the cohort to be created if index",
                                type: "text",
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

customElements.define("opencga-variant-eligibility-analysis", OpencgaVariantEligibilityAnalysis);
