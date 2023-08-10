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

import {LitElement, html} from "lit";
import "../commons/forms/data-form.js";


export default class TranscriptCoverageView extends LitElement {

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
            transcriptCoverageStats: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    getDefaultConfig() {
        return {
            title: "",
            icon: "",
            display: {
                showTitle: false,
                labelWidth: 2,
                defaultValue: "-",
                defaultLayout: "horizontal"
            },
            sections: [
                {
                    title: "",
                    elements: [
                        {
                            name: "Transcript ID",
                            field: "id",
                            type: "custom",
                            display: {
                                render: id => {
                                    return html`<a href="http://www.ensembl.org/Homo_sapiens/Transcript/Summary?db=core;t=${id}" target="_blank">${id}</a>`;
                                }
                            }
                        },
                        {
                            name: "Biotype",
                            field: "biotype"
                        },
                        {
                            name: "Region",
                            type: "custom",
                            display: {
                                render: data => {
                                    const region = `${data.chromosome}:${data.start}-${data.end}`;
                                    return html`${region} <a href="http://www.ensembl.org/Homo_sapiens/Location/View?db=core;r=${region}" target="_blank"><i class="fa fa-external-link" aria-hidden="true"></i> Ensembl</a>`;
                                }
                            }
                        },
                        {
                            name: "Length (bp)",
                            field: "length"
                        },
                        {
                            name: "Exon Stats",
                            field: "exonStats",
                            type: "table",
                            display: {
                                columns: [
                                    {
                                        id: "exonID",
                                        title: "Exon ID",
                                        type: "custom",
                                        formatter: (value, row) => {
                                            return `<a href="http://www.ensembl.org/Homo_sapiens/Transcript/Exons?db=core;r=13:32315086-32400266;t=${row.id}" target="_blank">${row.id}</a>`;
                                        },
                                    },
                                    {
                                        id: "region",
                                        title: "Region",
                                        field: "region",
                                        formatter: (value, row) => {
                                            const region = `${row.chromosome}:${row.start}-${row.end}`;
                                            return `${region}`;
                                        }
                                    },
                                    {
                                        id: "sizeBp",
                                        title: "Size (bp)",
                                        formatter: (value, row) => {
                                            if (row) {
                                                return row.end - row.start + 1;
                                            } else {
                                                return "N/A";
                                            }
                                        }
                                    },
                                    {
                                        id: "depthAvg",
                                        title: "Mean depth",
                                        field: "depthAvg",
                                        formatter: value => {
                                            const color = value < 20 ? "red" : value < 30 ? "darkorange" : "black";
                                            return `<span style="color: ${color}">${value.toFixed(2)}</span>`;
                                        }
                                    },
                                    {
                                        id: "depthMin",
                                        title: "Min depth",
                                        field: "depthMin",
                                        formatter: value => {
                                            const color = value < 20 ? "red" : value < 30 ? "darkorange" : "black";
                                            return `<span style="color: ${color}">${value.toFixed(2)}</span>`;
                                        }
                                    },
                                    {
                                        id: "depthMax",
                                        title: "Max depth",
                                        field: "depthMax",
                                        formatter: value => {
                                            const color = value < 20 ? "red" : value < 30 ? "darkorange" : "black";
                                            return `<span style="color: ${color}">${value.toFixed(2)}</span>`;
                                        }
                                    },
                                ]
                            }
                        },
                    ]
                }
            ]
        };
    }

    render() {
        return html`
            <data-form
                .data=${this.transcriptCoverageStats}
                .config="${this._config}">
            </data-form>
        `;
    }

}

customElements.define("transcript-coverage-view", TranscriptCoverageView);

