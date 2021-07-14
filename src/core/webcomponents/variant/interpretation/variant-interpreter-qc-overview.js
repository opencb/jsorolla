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
import "./variant-interpreter-qc-variant-stats.js";
import "./variant-interpreter-qc-inferred-sex.js";
import "./variant-interpreter-qc-relatedness.js";
import "./variant-interpreter-qc-mendelian-errors.js";
import "./variant-interpreter-qc-signature.js";
import "./variant-interpreter-qc-alignment-stats.js";
import "./variant-interpreter-qc-gene-coverage-stats.js";
import "../../sample/sample-files-view.js";
import "../../alignment/alignment-stats-view.js";

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
        this._prefix = UtilsNew.randomString(8);

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
        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }

        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
            if (this.config.overviewTabs) {
                this._config = UtilsNew.mergeDataFormConfig(this._config, this.config.overviewTabs);
            }
            this.requestUpdate();
        }
    }

    clinicalAnalysisObserver() {
        if (this.opencgaSession && this.clinicalAnalysis?.proband?.samples) {
            const bamFileIds = [];
            for (const sample of this.clinicalAnalysis.proband.samples) {
                const bamFile = sample.fileIds.find(fileId => fileId.endsWith(".bam"));
                if (bamFile) {
                    bamFileIds.push(bamFile);
                }
            }
            if (bamFileIds.length) {
                this.opencgaSession.opencgaClient.files().info(bamFileIds.join(","), {study: this.opencgaSession.study.fqn})
                    .then(response => {
                        this.alignmentStats = [];
                        for (const file of response.responses[0].results) {
                            const annotSet = file.annotationSets.find(annotSet => annotSet.id === "opencga_alignment_stats");
                            if (annotSet?.annotations) {
                                this.alignmentStats.push(annotSet.annotations);
                            }
                        }
                    })
                    .catch(response => {
                        console.error("An error occurred fetching clinicalAnalysis: ", response);
                    });
            }
        }
    }

    clinicalAnalysisIdObserver() {
        if (this.opencgaSession && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis = response.responses[0].results[0];
                    // this.requestUpdate();
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    getDefaultConfig() {
        if (!this.clinicalAnalysis) {
            return;
        }

        if (this.clinicalAnalysis.type.toUpperCase() !== "CANCER") {
            return {
                title: "Quality Control Overview",
                sections: [
                    {
                        elements: [
                            {
                                id: "Summary",
                                title: "Summary"
                            },
                            /* {
                                id: "VariantStats",
                                title: "Variant Stats"
                            },*/
                            {
                                id: "InferredSex",
                                title: "Sex Inference"
                            },
                            {
                                id: "MendelianErrors",
                                title: "Mendelian Errors"
                            },
                            {
                                id: "Relatedness",
                                title: "Relatedness"
                            },
                            {
                                id: "AlignmentStats",
                                title: "Samtools Flagstats",
                                /*disabled: application.appConfig !== "opencb"*/
                            }
                            /* {
                                id: "GeneCoverageStats",
                                title: "Gene Coverage Stats",
                                disabled: application.appConfig !== "opencb"
                            }*/
                        ]
                    }
                ]
            };
        } else {
            return {
                title: "Quality Control Overview",
                sections: [
                    {
                        elements: [
                            {
                                id: "Summary",
                                title: "Summary"
                            },
                            {
                                id: "VariantStats",
                                title: "QC Plot Files",
                                /*disabled: application.appConfig !== "opencb"*/
                            },
                            {
                                id: "SamtoolsPlots",
                                title: "Samtools Plots"
                            },
                            {
                                id: "Alignment",
                                title: "Samtools Stats",
                                /*disabled: application.appConfig !== "opencb"*/
                            },
                            {
                                id: "AlignmentStats",
                                title: "Samtools Flagstats",
                                /*disabled: application.appConfig !== "opencb"*/
                            },
                            {
                                id: "GenomicContext",
                                title: "Genomic Context (Signature)"
                            },
                            {
                                id: "GeneCoverageStats",
                                title: "Gene Coverage Stats",
                                /*disabled: application.appConfig !== "opencb"*/
                            }
                        ]
                    }
                ]
            };
        }
    }

    onSideNavClick(e) {
        e.preventDefault();
        // Remove button focus highlight
        e.currentTarget.blur();
        const tabId = e.currentTarget.dataset.id;
        $(".interpreter-side-nav > button", this).removeClass("active");
        $(`.interpreter-side-nav > button[data-id=${tabId}]`, this).addClass("active");
        $(".interpreter-content-tab > div[role=tabpanel]", this).hide();
        $("#" + this._prefix + tabId, this).show();
        // for (const tab in this.activeTab) this.activeTab[tab] = false;
        // this.activeTab[tabId] = true;
        this.requestUpdate();
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
            <!--<tool-header title="${this._config.title}" class="bg-white" icon="${this._config.icon}"></tool-header>-->
            <div class="row variant-interpreter-overview" style="padding: 10px 15px">
                <div class="col-md-2 list-group interpreter-side-nav side-tabs side-nav">
                    ${this._config.sections[0].elements.filter(field => !field.disabled).map((field, i) => {
                        return html`<button type="button" 
                                        class="list-group-item ${i === 0 ? "active" : ""}" 
                                        data-id="${field.id}" 
                                        @click="${this.onSideNavClick}">${field.title}
                                    </button>`;
                    })}
                </div>
                
                <div class="col-md-10">
                    <div class="content-tab-wrapper interpreter-content-tab" style="margin: 0px 10px">
                        <div id="${this._prefix}Summary" role="tabpanel" class="tab-pane content-tab active">
                            <h3>Summary</h3>
                            <variant-interpreter-qc-summary .opencgaSession=${this.opencgaSession}
                                                            .clinicalAnalysis=${this.clinicalAnalysis}>
                            </variant-interpreter-qc-summary>
                        </div>
                         
                        <div id="${this._prefix}VariantStats" role="tabpanel" class="tab-pane content-tab">
                            <h3>QC Plot Files</h3>
                            <sample-files-view .sampleId="${this.clinicalAnalysis.proband.samples?.[1]?.id}" 
                                               .mode="${"sample-qc"}"
                                               .opencgaSession="${this.opencgaSession}">
                            </sample-files-view>
                        </div>

                        <div id="${this._prefix}SamtoolsPlots" role="tabpanel" class="tab-pane content-tab">
                            <h3>Samtools Plots</h3>
                            <sample-files-view .sampleId="${this.clinicalAnalysis.proband.samples?.[1]?.id}"
                                               .opencgaSession="${this.opencgaSession}">
                            </sample-files-view>
                        </div>
                        
                        <div id="${this._prefix}InferredSex" role="tabpanel" class="tab-pane content-tab">
                            <h3>Inferred Sex</h3>
                            <variant-interpreter-qc-inferred-sex    .opencgaSession=${this.opencgaSession} 
                                                                    .clinicalAnalysis="${this.clinicalAnalysis}">
                            </variant-interpreter-qc-inferred-sex>
                        </div>
                                                
                        <div id="${this._prefix}MendelianErrors" role="tabpanel" class="tab-pane content-tab">
                            <h3>Mendelian Errors</h3>
                            <variant-interpreter-qc-mendelian-errors    .opencgaSession=${this.opencgaSession} 
                                                                        .clinicalAnalysis="${this.clinicalAnalysis}">
                            </variant-interpreter-qc-mendelian-errors>
                        </div>
                        
                        <div id="${this._prefix}Relatedness" role="tabpanel" class="tab-pane content-tab">
                            <h3>Relatedness</h3>
                            <variant-interpreter-qc-relatedness     .opencgaSession=${this.opencgaSession} 
                                                                    .clinicalAnalysis="${this.clinicalAnalysis}">
                            </variant-interpreter-qc-relatedness>
                        </div>
                        
                        <div id="${this._prefix}Alignment" role="tabpanel" class="tab-pane content-tab">
                            <h3>Samtools Stats</h3>
                            <alignment-stats-view .opencgaSession=${this.opencgaSession}
                                                  .alignmentStats="${this.alignmentStats}">
                            </alignment-stats-view>
                        </div>
                        
                        <div id="${this._prefix}AlignmentStats" role="tabpanel" class="tab-pane content-tab">
                            <h3>Samtools Flagstats</h3>
                            <variant-interpreter-qc-alignment-stats .opencgaSession=${this.opencgaSession} 
                                                                    .clinicalAnalysis="${this.clinicalAnalysis}">
                            </variant-interpreter-qc-alignment-stats>                                
                        </div>

                        <div id="${this._prefix}GenomicContext" role="tabpanel" class="tab-pane content-tab">
                            <h3>Genomic Context (Signature)</h3>
                            <variant-interpreter-qc-signature     .opencgaSession=${this.opencgaSession}
                                                                  .clinicalAnalysis="${this.clinicalAnalysis}">
                            </variant-interpreter-qc-signature>
                        </div>
                        
                        <div id="${this._prefix}GeneCoverageStats" role="tabpanel" class="tab-pane content-tab">
                            <h3>Gene Coverage Stats</h3>
                            <variant-interpreter-qc-gene-coverage-stats  .opencgaSession=${this.opencgaSession} 
                                                                         .clinicalAnalysis="${this.clinicalAnalysis}">
                            </variant-interpreter-qc-gene-coverage-stats>
                        </div>

                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("variant-interpreter-qc-overview", VariantInterpreterQcOverview);
