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
import UtilsNew from "../../../utilsNew.js";


class VariantInterpreterQcSummary extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
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
            clinicalAnalysisId: {
                type: String
            },
            clinicalAnalysis: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "vcis-" + UtilsNew.randomString(6);

        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
        // this.requestUpdate();
    }

    firstUpdated(_changedProperties) {
        // this.requestUpdate();
    }

    updated(changedProperties) {
        // if (changedProperties.has("opencgaSession")) {
        //     this.opencgaSessionObserver();
        // }
        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }
        // if (changedProperties.has("clinicalAnalysis")) {
        //     this.clinicalAnalysisObserver();
        // }
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    clinicalAnalysisIdObserver() {
        if (this.opencgaSession) {
            let _this = this;
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    _this.clinicalAnalysis = response.responses[0].results[0];
                    _this.requestUpdate();
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    getDefaultConfig() {
        return {
            title: "QC Summary",
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
                    title: "QC Summary",
                    collapsed: false,
                    elements: [
                        {
                            name: "Analysis ID",
                            field: "id"
                        },
                        {
                            name: "Proband",
                            field: "proband.id"
                        },
                        {
                            name: "Disorder",
                            field: "disorder",
                            type: "custom",
                            display: {
                                render: clinicalAnalysis => {
                                    let id = clinicalAnalysis.disorder.id;
                                    debugger
                                    if (clinicalAnalysis.disorder.id.startsWith("OMIM:")) {
                                        id = html`<a href="https://omim.org/entry/${clinicalAnalysis.disorder.id.split(":")[1]}" target="_blank">${clinicalAnalysis.disorder.id}</a>`;
                                    }
                                    return html`${clinicalAnalysis.disorder.name || "-"} (${id})`
                                },
                            }
                        },
                        {
                            name: "Analysis Type",
                            field: "type"
                        },
                    ]
                },
                {
                    title: "Variant Stats",
                    display: {
                        visible: data => data.type === "FAMILY",
                    },
                    elements: [
                        {
                            name: "Proband Stats",
                            // field: "proband.id",
                            type: "custom",
                            display: {
                                width: 12,
                                render: (data) => {
                                    if (data.proband && data.proband.samples && data.proband.samples.length > 0) {
                                        return html`
                                            <sample-variant-stats-view .opencgaSession="${this.opencgaSession}" .sampleId="${data.proband.samples[0].id}"> </sample-variant-stats-view>
                                        `;
                                    }
                                },
                            }
                        },
                    ]
                },
                {
                    title: "Files",
                    elements: [
                        {
                            name: "File",
                            field: "files",
                            type: "list",
                            display: {
                                layout: "bullets",
                                template: "${name}"
                            }
                        }
                    ]
                }
            ]
        }
    }

    render() {
        // Check Project exists
        if (!this.opencgaSession.project) {
            return html`
                <div class="guard-page">
                    <i class="fas fa-lock fa-5x"></i>
                    <h3>No public projects available to browse. Please login to continue</h3>
                </div>
            `;
        }

        return html`
            <data-form .data=${this.clinicalAnalysis} .config="${this._config}"></data-form>
        `;

        // return html`
        //         <div class="row" style="padding: 10px">
        //             <div class="col-md-12">
        //                 <div class="col-md-6">
        //                     <h2>Circos</h2>
        //                     <img width="640" src="https://www.researchgate.net/profile/Angela_Baker6/publication/259720064/figure/fig1/AS:613877578465328@1523371228720/Circos-plot-summarizing-somatic-events-A-summary-of-all-identified-somatic-genomic.png">
        //                 </div>
        //                 <div class="col-md-6">
        //                     <h2>Signature</h2>
        //                     <img width="480" src="https://cancer.sanger.ac.uk/signatures_v2/Signature-3.png">
        //
        //                     <div style="padding-top: 20px">
        //                         <h2>Sample Stats</h2>
        //                         <img width="480" src="https://www.ensembl.org/img/vep_stats_2.png">
        //                     </div>
        //                 </div>
        //             </div>
        //         </div>
        //     `;
    }

}

customElements.define("variant-interpreter-qc-summary", VariantInterpreterQcSummary);
