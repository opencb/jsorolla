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
import UtilsNew from "../../../../core/utils-new.js";
import "../../../commons/analysis/opencga-analysis-tool.js";


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
            description: "Run quality control (QC) for a given sample. It includes variant stats, FastQC,samtools/flagstat, picard/CollectHsMetrics and gene coverage stats; and for somatic samples, mutational signature",
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
                                addButton: true,
                                showList: true,
                                fileUpload: true
                            }
                        ]
                    },
                    {
                        title: "Variant Stats Parameters",
                        collapsed: false,
                        parameters: [
                            {
                                id: "variantStatsId",
                                title: "Choose variant stats id",
                                type: "text"
                            },
                            {
                                id: "variantStatsDescription",
                                title: "Variant stats description",
                                type: "text"
                            },
                            {
                                id: "variantStatsQuery",
                                title: "Variant stats query",
                                type: "text"
                            }
                        ]
                    },
                    {
                        title: "Signature Parameters",
                        collapsed: false,
                        parameters: [
                            {
                                id: "signatureId",
                                title: "Choose signature id",
                                type: "text"
                            },
                            {
                                id: "signatureQuery",
                                title: "Signature query",
                                type: "text"
                            }
                        ]
                    },
                    {
                        title: "Gene Coverage Parameters",
                        collapsed: false,
                        parameters: [
                            {
                                id: "genesForCoverageStats",
                                title: "List of genes for coverage stats",
                                type: "text"
                            }
                        ]
                    },
                    {
                        title: "Piccard HsMetrics Parameters",
                        collapsed: false,
                        parameters: [
                            {
                                id: "fastaFile",
                                title: "Fasta file",
                                type: "FILE_FILTER",
                                addButton: true,
                                showList: true,
                                fileUpload: true
                            },
                            {
                                id: "baitFile",
                                title: "Bait file",
                                type: "FILE_FILTER",
                                addButton: true,
                                showList: true,
                                fileUpload: true
                            },
                            {
                                id: "targetFile",
                                title: "Target file",
                                type: "FILE_FILTER",
                                addButton: true,
                                showList: true,
                                fileUpload: true
                            }
                        ]
                    }
                ],
                job: {
                    title: "Job Info",
                    id: "sample-qc-$DATE",
                    tags: "",
                    description: "",
                    validation: function (params) {
                        alert("test:" + params);
                    },
                    button: "Run"
                }
            },
            execute: (opencgaSession, data, params) => {
                const body = {};
                data.sample ? body.sample = data.sample.join(",") : null;
                data.genesForCoverageStats ? body.genesForCoverageStats = data.genesForCoverageStats.join(",") : null;
                opencgaSession.opencgaClient.variants().runSampleQc(body, params);
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
