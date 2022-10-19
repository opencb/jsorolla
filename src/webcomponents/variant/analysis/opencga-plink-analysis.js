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
import UtilsNew from "../../../core/utils-new.js";
import "../../commons/analysis/opencga-analysis-tool.js";


export default class OpencgaPlinkAnalysis extends LitElement {

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
            id: "plink",
            title: "Plink",
            icon: "",
            requires: "2.0.0",
            description: "Plink is a whole genome association analysis toolset, designed to perform a range of basic, large-scale analyses.",
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
                                id: "tpedFile",
                                title: "Select tped file",
                                type: "FILE_FILTER",
                                addButton: true,
                                showList: true,
                                fileUpload: true
                            },
                            {
                                id: "tfamFile",
                                title: "Select tfam file",
                                type: "FILE_FILTER",
                                addButton: true,
                                showList: true,
                                fileUpload: true
                            },
                            {
                                id: "covarFile",
                                title: "Select covar file",
                                type: "FILE_FILTER",
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
                                id: "plinkParams",
                                title: "Plink parameters",
                                type: "text"
                            }
                        ]
                    }
                ],
                job: {
                    title: "Job Info",
                    id: "plink-$DATE",
                    tags: "",
                    description: "",
                    validation: function(params) {
                        alert("test:" + params);
                    },
                    button: "Run"
                }
            },
            execute: (opencgaSession, data, params) => {
                opencgaSession.opencgaClient.variants().runFamilyQc(data, params);
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

customElements.define("opencga-plink-analysis", OpencgaPlinkAnalysis);
