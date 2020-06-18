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
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("transcriptId")) {
            this.transcriptIdObserver();
        }
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    transcriptIdObserver() {
        //this.opencgaSession.opencgaClient.alignments().queryCoverage
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
                            field: "id"
                        },
                        {
                            name: "Region",
                            type: "complex",
                            display: {
                                template: "<strong>${chromosome}:${start}-${end}</strong>"
                            }
                        },
                        {
                            name: "Biotype",
                            field: "biotype"
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
                            name: "Exons Stats",
                            field: "exonStats",
                            type: "table",
                            display: {
                                columns: [
                                    {
                                        name: "Exon ID",
                                        type: "custom",
                                        display: {
                                            render: data => {
                                                return html`<a href="http://www.ensembl.org/Homo_sapiens/Transcript/Exons?db=core;r=13:32315086-32400266;t=${this.transcript.id}" target="_blank">${data.id}</a>`;
                                            }
                                        }
                                    },
                                    {
                                        name: "Region",
                                        type: "complex",
                                        display: {
                                            template: "${chromosome}:${start}-${end}"
                                        }
                                    },
                                    {
                                        name: "Size",
                                        type: "custom",
                                        display: {
                                            render: data => {
                                                if (data) {
                                                    return data.end - data.start + 1
                                                } else {
                                                    return "N/A";
                                                }
                                            }
                                        }
                                    },
                                    {
                                        name: "Mean Depth",
                                        field: "depthAvg",
                                        type: "custom",
                                        display: {
                                            render: field => {
                                                let color = field < 20 ? "red" : field < 30 ? "darkorange" : "black";
                                                return html`<span style="color: ${color}">${field.toFixed(2)}</span>`;
                                            }
                                        }
                                    },
                                    {
                                        name: "Min Depth",
                                        field: "depthMin",
                                        type: "custom",
                                        display: {
                                            render: field => {
                                                let color = field < 20 ? "red" : field < 30 ? "darkorange" : "black";
                                                return html`<span style="color: ${color}">${field.toFixed(2)}</span>`;
                                            }
                                        }
                                    },
                                    {
                                        name: "Max Depth",
                                        field: "depthMax",
                                        type: "custom",
                                        display: {
                                            render: field => {
                                                let color = field < 20 ? "red" : field < 30 ? "darkorange" : "black";
                                                return html`<span style="color: ${color}">${field.toFixed(2)}</span>`;
                                            }
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            name: "Low Coverage Regions",
                            field: "lowCoverageRegionStats",
                            type: "table",
                            display: {
                                columns: [
                                    {
                                        name: "Region",
                                        type: "complex",
                                        display: {
                                            template: "${chromosome}:${start}-${end}"
                                        }
                                    },
                                    {
                                        name: "Size",
                                        type: "custom",
                                        display: {
                                            render: data => {
                                                if (data) {
                                                    return data.end - data.start + 1
                                                } else {
                                                    return "N/A";
                                                }
                                            }
                                        }
                                    },
                                    {
                                        name: "% of exon",
                                        type: "custom",
                                        display: {
                                            render: data => {
                                                if (data) {
                                                    let perc = (data.end - data.start + 1) / this.transcript.length;
                                                    return perc.toExponential(2);
                                                } else {
                                                    return "N/A";
                                                }
                                            }
                                        }
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

