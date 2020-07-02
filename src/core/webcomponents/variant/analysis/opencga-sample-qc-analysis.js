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


export default class OpencgaSampleQcAnalysis extends LitElement {

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
            id: "sample-qc",
            title: "Sample Quality Control",
            icon: "",
            requires: "2.0.0",
            description: "Sample Quality Control, you need special permission for running this analysis",
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
                                showList: true,
                                fileUpload: true
                                // colspan: 6
                            }
                        ]
                    },
                    {
                        // "variantStatsId": "string",
                        // "variantStatsDecription": "string",
                        // "variantStatsQuery": {},
                        title: "Variant Stats Parameters",
                        collapsed: false,
                        parameters: [

                        ]
                    },
                    {
                        // "signatureId": "string",
                        // "signatureQuery": {},
                        title: "Signature Parameters",
                        collapsed: false,
                        parameters: [

                        ]
                    },
                    {
                        // "genesForCoverageStats": [
                        //     "string"
                        // ],
                        title: "Gene Coverage Parameters",
                        collapsed: false,
                        parameters: [

                        ]
                    },
                    {
                        // "fastaFile": "string",
                        // "baitFile": "string",
                        // "targetFile": "string",
                        title: "Piccard HsMetrics Parameters",
                        collapsed: false,
                        parameters: [

                        ]
                    }
                ],
                job: {
                    title: "Job Info",
                    id: "sample-qc-$DATE",
                    tags: "",
                    description: "",
                    validation: function(params) {
                        alert("test:" + params);
                    },
                    button: "Run"
                }
            },
            execute: (opencgaSession, data, params) => {
                opencgaSession.opencgaClient.variants().runSampleQc(data, params);
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

customElements.define("opencga-sample-qc-analysis", OpencgaSampleQcAnalysis);
