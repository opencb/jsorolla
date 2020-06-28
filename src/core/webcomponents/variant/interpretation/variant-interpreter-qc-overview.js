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
import "./variant-interpreter-qc-summary.js";
import "./variant-interpreter-qc-inferred-sex.js";
import "./variant-interpreter-qc-relatedness.js";
import "./variant-interpreter-qc-variant-stats.js";
import "./variant-interpreter-qc-alignment-stats.js";

class VariantInterpreterQcOverview extends LitElement {

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
    }

    updated(changedProperties) {
        // if (changedProperties.has("opencgaSession")) {
        //     this.opencgaSessionObserver();
        // }
        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    clinicalAnalysisIdObserver() {
        if (this.opencgaSession && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis = response.responses[0].results[0];
                    this.requestUpdate();
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
                    title: "Summary",
                    collapsed: false,
                    elements: [
                        {
                            name: "Analysis ID",
                            field: "id"
                        },
                        {
                            name: "Proband",
                            field: "proband.id",
                            type: "custom",
                            display: {
                                render: probandId => html`<strong>${probandId}</strong>`
                            }
                        },
                        {
                            name: "Disorder",
                            field: "disorder",
                            type: "custom",
                            display: {
                                render: disorder => {
                                    let id = disorder.id;
                                    if (disorder.id.startsWith("OMIM:")) {
                                        id = html`<a href="https://omim.org/entry/${disorder.id.split(":")[1]}" target="_blank">${disorder.id}</a>`;
                                    }
                                    return html`${disorder.name || "-"} (${id})`
                                },
                            }
                        },
                        {
                            name: "Analysis Type",
                            field: "type"
                        },
                    ]
                },
            ]
        }
    }

    /*getVariantConfig() {
        return {
            title: "Variant",
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
                    title: "Variant Stats",
                    display: {
                        visible: data => data.type === "FAMILY",
                    },
                    elements: [
                        {
                            name: "Proband Stats",
                            // field: "proband.id",
                            type: "custom",
                            showLabel: false,
                            display: {
                                width: 12,
                                render: data => {
                                    console.log("data",data)
                                    if (data.proband && data.proband.samples && data.proband.samples.length > 0) {
                                        const stats = data.proband.samples[0].annotationSets.find( annotationSet => annotationSet.id === "opencga_sample_variant_stats");
                                        if(!stats) {
                                            console.error("Sample variant stats unavailable")
                                        }
                                        return html`
                                            <sample-variant-stats-view .opencgaSession="${this.opencgaSession}" .sampleVariantStats="${stats?.annotations}"> </sample-variant-stats-view>
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
                                contentLayout: "bullets",
                                template: "${name}"
                            }
                        }
                    ]
                }
            ]
        }
    }*/

    onSideNavClick(e) {
        e.preventDefault();

        // Remove button focus highlight
        e.target.blur();

        // Remove selected active button
        document.querySelector(".side-nav-active").classList.add("side-nav");
        document.querySelector(".side-nav-active").classList.remove("side-nav-active");
        document.querySelectorAll(".tab-content").forEach(value => value.style.display = "none");

        let option = e.currentTarget.dataset.id;
        document.getElementById(this._prefix + option).classList.remove("side-nav");
        document.getElementById(this._prefix + option).classList.add("side-nav-active");
        document.getElementById(this._prefix + option + "Content").style.display = "block";
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
            <style>
                .side-nav {
                    padding: 15px;
                }
                .side-nav-active {
                    padding: 15px;
                    font-weight: bold;
                    background-color: #EEEEEE;
                    border-left-color: var(--main-bg-color);
                }
            </style>
            <div class="row" style="margin: 10px">
                <div class="col-md-8 col-md-offset-2">
                    <h2>Overview</h2>
                </div>
                
                <div class="col-md-12">
                    <div class="col-md-2" style="margin-top: 15px">
                        <div class="list-group">
                            <button id="${this._prefix}Summary" type="button" class="list-group-item side-nav-active" 
                                  data-id="Summary" @click="${this.onSideNavClick}">Summary</button>
                            <button id="${this._prefix}InferredSex" type="button" class="list-group-item side-nav" 
                                  data-id="InferredSex" @click="${this.onSideNavClick}">Sex</button>
                            <button id="${this._prefix}Relatedness" type="button" class="list-group-item side-nav" 
                                  data-id="Relatedness" @click="${this.onSideNavClick}">Relatedness</button>
                            <button id="${this._prefix}VariantStats" type="button" class="list-group-item side-nav" 
                                  data-id="VariantStats" @click="${this.onSideNavClick}">Variant Stats</button>
                            <button id="${this._prefix}MendelianErrors" type="button" class="list-group-item side-nav" 
                                  data-id="MendelianErrors" @click="${this.onSideNavClick}">Mendelian Errors</button>
                            <button id="${this._prefix}AlignmentStats" type="button" class="list-group-item side-nav" 
                                  data-id="AlignmentStats" @click="${this.onSideNavClick}">Alignment Stats</button>
                            <button id="${this._prefix}GeneCoverageStats" type="button" class="list-group-item side-nav" 
                                  data-id="GeneCoverageStats" @click="${this.onSideNavClick}">Gene Coverage Stats</button>
                            
                        </div>
                    </div>
                    <div class="col-md-10">
                        <div class="content-tab-wrapper" style="padding: 10px 15px">
                            <div id="${this._prefix}SummaryContent" role="tabpanel" class="tab-pane tab-content">
                                <variant-interpreter-qc-summary .opencgaSession=${this.opencgaSession} 
                                                                .clinicalAnalysis=${this.clinicalAnalysis} 
                                                                .config="${this._config}">
                                </variant-interpreter-qc-summary>
                            </div>
                            
                            <div id="${this._prefix}InferredSexContent" role="tabpanel" class="tab-pane tab-content" style="display: none">
                                <h3>Inferred Sex</h3>
                                <variant-interpreter-qc-inferred-sex    .opencgaSession=${this.opencgaSession} 
                                                                        .clinicalAnalysis="${this.clinicalAnalysis}">
                                </variant-interpreter-qc-inferred-sex>
                            </div>
                            
                            <div id="${this._prefix}RelatednessContent" role="tabpanel" class="tab-pane tab-content" style="display: none">
                                <h3>Relatedness</h3>
                                <variant-interpreter-qc-relatedness  .opencgaSession=${this.opencgaSession} 
                                                                    .clinicalAnalysis="${this.clinicalAnalysis}">
                                </variant-interpreter-qc-relatedness>
                            </div>
                            
                            <div id="${this._prefix}VariantStatsContent" role="tabpanel" class="tab-pane tab-content" style="display: none">
                                <!--<data-form .data=${this.clinicalAnalysis} .config="${1||this.getVariantConfig()}"></data-form>-->
                                <variant-interpreter-qc-variant-stats     .opencgaSession=${this.opencgaSession} 
                                                                        .clinicalAnalysis="${this.clinicalAnalysis}">
                                </variant-interpreter-qc-variant-stats>
                            </div>
                            
                            <div id="${this._prefix}MendelianErrorsContent" role="tabpanel" class="tab-pane tab-content" style="display: none">
                                <h3>Mendelian Errors</h3>
                                <variant-interpreter-qc-mendelian-errors    .opencgaSession=${this.opencgaSession} 
                                                                            .clinicalAnalysis="${this.clinicalAnalysis}">
                                </variant-interpreter-qc-mendelian-errors>
                            </div>
                            
                            <div id="${this._prefix}AlignmentStatsContent" role="tabpanel" class="tab-pane tab-content" style="display: none">
                                <h3>Alignment Stats</h3>
                                <variant-interpreter-qc-alignment-stats .opencgaSession=${this.opencgaSession} 
                                                                        .clinicalAnalysis="${this.clinicalAnalysis}">
                                </variant-interpreter-qc-alignment-stats>
                            </div>
                            
                            <div id="${this._prefix}GeneCoverageStatsContent" role="tabpanel" class="tab-pane tab-content" style="display: none">
                                <h3>Gene Coverage Stats</h3>
                                <!--
                                <variant-interpreter-qc-gene-coverage-stats     .opencgaSession=${this.opencgaSession} 
                                                                                .clinicalAnalysis="${this.clinicalAnalysis}">
                                </variant-interpreter-qc-gene-coverage-stats>
                                -->
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("variant-interpreter-qc-overview", VariantInterpreterQcOverview);
