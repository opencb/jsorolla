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
import {classMap} from "lit/directives/class-map.js";
import ClinicalAnalysisUtils from "../../clinical/clinical-analysis-utils.js";
import UtilsNew from "../../../core/utils-new.js";
import "../../alignment/gene-coverage-view.js";

class VariantInterpreterQcGeneCoverageStats extends LitElement {

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
        this.activeTab = {};
        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("clinicalAnalysis")) {
            this.prepareGeneCoverageStats();
        }
        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.prepareGeneCoverageStats();
        }
    }

    clinicalAnalysisIdObserver() {
        if (this.opencgaSession && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis = response.responses[0].results[0];
                    this.prepareGeneCoverageStats();
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    prepareGeneCoverageStats() {
        let sampleQc = ClinicalAnalysisUtils.getProbandSampleQc(this.clinicalAnalysis);
        if (sampleQc && sampleQc?.alignmentMetrics?.[0]?.geneCoverageStats?.length) {
            this.geneCoverageStats = sampleQc.alignmentMetrics[0].geneCoverageStats;
            this._geneCoverageStats = this.geneCoverageStats[0];
            this.requestUpdate();
        }
    }

    onClickPill(e) {
        this._geneCoverageStats = this.geneCoverageStats.find(geneCoverageStats => geneCoverageStats.geneName === e.currentTarget.dataset.id);
        this._changeView(e.currentTarget.dataset.id);
    }

    _changeView(tabId) {
        $(".content-pills", this).removeClass("active");
        $(".content-tab", this).removeClass("active");
        for (const tab in this.activeTab) {
            this.activeTab[tab] = false;
        }
        $(`button.content-pills[data-id=${tabId}]`, this).addClass("active");
        $("#" + tabId, this).addClass("active");
        this.activeTab[tabId] = true;
        this.requestUpdate();
    }

    getDefaultConfig() {
        return {
        }
    }

    render() {
        // Check Project exists
        if (!this.opencgaSession.project) {
            return html`
                    <div>
                        <h3><i class="fas fa-lock"></i> No public projects available to browse. Please login to continue</h3>
                    </div>`;
        }

        // Check Clinical Analysis exist
        if (!this.clinicalAnalysis) {
            return html`
                    <div>
                        <h3><i class="fas fa-lock"></i> No Case found</h3>
                    </div>`;
        }

        if (!this.geneCoverageStats || Object.keys(this.geneCoverageStats).length) {
            return html`
                <div style="margin: 20px 10px">
                    <div class="alert alert-info"><i class="fas fa-3x fa-info-circle align-middle"></i> No QC data are available yet.</div>
                </div>
            `
        }

        return html`
            <div class="gene-coverage-stats">
                <div class="btn-group content-pills" role="toolbar" aria-label="toolbar">
                    <div class="btn-group" role="group">
                        ${this.geneCoverageStats
                            ? this.geneCoverageStats.map( geneCoverageStats => html`
                                <div class="btn-group">
                                    <button type="button" class="btn btn-success ripple content-pills ${classMap({active: this.activeTab[geneCoverageStats.geneName]})}"
                                            @click="${this.onClickPill}" data-id="${geneCoverageStats.geneName}" style="margin: 0px 1px">
                                        ${geneCoverageStats.geneName}
                                    </button>
                                </div>`)
                            : null}
                    </div>
                </div>
                <div class="content-tab-wrapper">
                    <div class="content-tab-wrapper">
                        ${Object.entries(this.geneCoverageStats).map(([geneId, geneCoverageStat]) => html`
                            <div id="${geneId}" class="content-tab ${classMap({active: this.activeTab[geneId]})}">
                                <gene-coverage-view .config=${this._config} .geneCoverageStats="${geneCoverageStat}" .opencgaSession="${this.opencgaSession}"></gene-coverage-view>
                            </div>
                        `)}
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("variant-interpreter-qc-gene-coverage-stats", VariantInterpreterQcGeneCoverageStats);
