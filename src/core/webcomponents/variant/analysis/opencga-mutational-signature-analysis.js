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


export default class OpencgaMutationalSignatureAnalysis extends LitElement {

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

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    connectedCallback() {
        super.connectedCallback();
        // this._config = {...this.getDefaultConfig(), ...this.config};
        // this.fieldMap = {};
    }

    updated(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.requestUpdate();
        }
    }

    getDefaultConfig() {
        return {
            id: "mutational-signature",
            title: "Mutational Signature Analysis",
            icon: "",
            requires: "2.0.0",
            description: "Sample Variant Stats description",
            links: [
                {
                    title: "OpenCGA",
                    url: "http://docs.opencb.org/display/opencga/Sample+Stats",
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
                                title: "Select somatic sample",
                                type: "SAMPLE_FILTER",
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
           <opencga-analysis-tool .opencgaSession="${this.opencgaSession}" .config="${this._config}" ></opencga-analysis-tool>
        `;
    }
}

customElements.define("opencga-mutational-signature-analysis", OpencgaMutationalSignatureAnalysis);
