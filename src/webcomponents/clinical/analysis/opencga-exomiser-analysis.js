/* select
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


export default class OpencgaExomiserAnalysis extends LitElement {

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
            title: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();
    }

    update(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
        super.update(changedProperties);
    }

    render() {
        return html`
            <opencga-analysis-tool
                .opencgaSession="${this.opencgaSession}"
                .config="${this._config}">
            </opencga-analysis-tool>
        `;
    }

    getDefaultConfig() {
        return {
            id: "exomiser",
            // title: `${this.title ?? "RD Tiering"}`,
            icon: "",
            requires: "2.0.0",
            description: "",
            links: [
                // {
                //     title: "OpenCGA",
                //     url: "http://docs.opencb.org/display/opencga/Genome-Wide+Association+Study",
                //     icon: ""
                // }
            ],
            form: {
                sections: [
                    {
                        title: "Input Parameters",
                        collapsed: false,
                        parameters: [
                            {
                                id: "clinicalAnalysis",
                                title: "Clinical Analysis",
                                type: "CLINICAL_ANALYSIS_FILTER",
                                showList: true
                            }
                        ]
                    }
                ],
                job: {
                    title: "Job Info",
                    id: "exomiser-$DATE",
                    tags: "",
                    description: "",
                    validation: function(params) {
                        alert("test:" + params);
                    },
                    button: "Run"
                }
            },
            execute: (opencgaSession, data, params) => {
                opencgaSession.opencgaClient.clinical().runInterpreterExomiser(data, params);
            },
            result: {
            }
        };
    }

}

customElements.define("opencga-exomiser-analysis", OpencgaExomiserAnalysis);
