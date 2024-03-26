/*
 * Copyright 2015-2024 OpenCB
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
import UtilsNew from "../../core/utils-new.js";
import "../commons/forms/data-form.js";


export default class TranscripCoverageLow extends LitElement {

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
                            name: "Low Coverage Threshold",
                            field: "lowCoverageThreshold"
                        },
                        {
                            name: "Low Coverage Regions",
                            field: "lowCoverageRegionStats",
                            type: "table",
                            display: {
                                columns: [
                                    {
                                        id: "region",
                                        title: "Region",
                                        field: "region",
                                        formatter: (value, row) => {
                                            const region = `${row.chromosome}:${row.start}-${row.end}`;
                                            return `<a href="http://www.ensembl.org/Homo_sapiens/Location/View?db=core;r=${region}" target="_blank">${region}</a>`;
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
                                        id: "percTranscript",
                                        title: "% of Transcript",
                                        formatter: (value, row) => {
                                            if (row) {
                                                const perc = (row.end - row.start + 1) * 100 / this.transcriptCoverageStats.length;
                                                return perc.toFixed(2);
                                            } else {
                                                return "N/A";
                                            }
                                        }
                                    },
                                    {
                                        id: "depthAvg",
                                        title: "Mean depth",
                                        field: "depthAvg",
                                        formatter: value => value.toFixed(2),
                                    },
                                    {
                                        id: "depthMin",
                                        title: "Min depth",
                                        field: "depthMin",
                                        formatter: value => value.toFixed(2),
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
            <data-form
                .data=${this.transcriptCoverageStats}
                .config="${this.getDefaultConfig()}">
            </data-form>
        `;
    }

}

customElements.define("transcript-coverage-low", TranscripCoverageLow);
