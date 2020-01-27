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
        }
    }

    _init() {
        this._prefix = "oga-" + Utils.randomString(6);
    }

    updated(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = Object.assign(this.getDefaultConfig(), this.config);
        }
    }

    render() {
        return html`
           <opencga-analysis-tool .config="${this._config}"></opencga-analysis-tool>
        `;
    }

    getDefaultConfig() {
        return {
            id: "test1",
            title: "Test1",
            icon: "",
            about: {
                description: "Test1 description",
                links: [
                    {
                        title: "Wikipedia",
                        url: "",
                        icon: ""
                    }
                ]
            },
            form: {
                input: [
                    {
                        title: "Select Parameters 1",
                        collapsed: false,
                        parameters: [
                            {
                                id: "method",
                                type: "number",
                                defaultValue: "0",
                                allowedValues: [0, 1],
                                required: true
                            },
                            {
                                id: "option",
                                type: "categorical",
                                defaultValue: "Option3",
                                allowedValues: ["Option1", "Option2", "Option3"],
                                multiple: true,
                                maxOptions: 2
                            },
                            {
                                id: "suboption3",
                                type: "categorical",
                                defaultValue: "SubOption3",
                                dependsOn: "option == Option3"
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
                        text: "Run",
                        validation: function(params) {
                            alert("test:" + params);
                        },
                    }
                }
            },
            result: {

            }
        }
    }

}

customElements.define('opencga-gwas-analysis', OpencgaGwasAnalysis);
