/**
 * Copyright 2015-2019 OpenCB
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
import UtilsNew from "../../utilsNew.js";
import "../commons/view/data-form.js";


export default class GeneCoverageView extends LitElement {

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
            transcriptId: {
                type: String
            },
            transcript: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        // this.prefix = "osv" + UtilsNew.randomString(6);
        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }


    firstUpdated(_changedProperties) {
    }

    updated(changedProperties) {
        if (changedProperties.has("jobId")) {
            this.jobIdObserver();
        }
        if (changedProperties.has("job")) {
            this.jobObserver();
        }
        if (changedProperties.has("config")) {
            this.configObserver();
        }
    }

    configObserver() {
    }

    jobIdObserver() {
        const params = {
            study: this.opencgaSession.study.fqn,
            includeIndividual: true
        };
        this.opencgaSession.opencgaClient.jobs().info(this.jobId, params)
            .then(response => {
                this.job = response.getResult(0);
                this.job.id = this.job.id ?? this.job.name;
                this.requestUpdate();
            })
            .catch(function(reason) {
                console.error(reason);
            });


    }

    getDefaultConfig() {
        return {
            title: "Summary",
            icon: "",
            display: {
                collapsable: true,
                showTitle: false,
                labelWidth: 2,
                defaultValue: "-",
                defaultLayout: "horizontal"
            },
            sections: [
                {
                    title: "General",
                    collapsed: false,
                    elements: [
                        {
                            name: "Transcript ID",
                            field: "transcriptId"
                        },
                        {
                            name: "length",
                            field: "length"
                        },
                        {
                            name: "Low Coverage Threshold",
                            field: "lowCoverageThreshold"
                        },
                        {
                            name: "Low Coverage Regions",
                            field: "lowCoverageRegions",
                            type: "table",
                            display: {
                                columns: [
                                    {
                                        name: "Region",
                                        type: "complex",
                                        display: {
                                            template: "<strong>${start}</strong>-<strong>${end}</strong>"
                                        }
                                    },
                                    {
                                        name: "Size",
                                        field: ""
                                    },
                                    {
                                        name: "% of exon",
                                        field: ""
                                    },
                                    {
                                        name: "Mean depth",
                                        field: "depthAvg",
                                        type: "custom",
                                        display: {
                                            render: field => field.toFixed(2)
                                        }
                                    },
                                    {
                                        name: "Min depth",
                                        field: "depthMin",
                                        type: "custom",
                                        display: {
                                            render: field => field.toFixed(2)
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
            ]
        };
    }

    render() {
        return html`
            <data-form .data=${this.transcript} .config="${this.getDefaultConfig()}"></data-form>
        `;
    }

}

customElements.define("gene-coverage-view", GeneCoverageView);

