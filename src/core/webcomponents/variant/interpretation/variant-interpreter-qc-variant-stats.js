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
import ClinicalAnalysisUtils from "../../clinical/clinical-analysis-utils.js";
import UtilsNew from "../../../utilsNew.js";
import "./sample-variant-stats-view.js";

class VariantInterpreterQcVariantStats extends LitElement {

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
        this.statsSelect = [];
        this.variantStats = null;
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }

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
                    // this.clinicalAnalysisObserver();
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    clinicalAnalysisObserver() {
        //TODO use ClinicalAnalysisUtils
        if (this.clinicalAnalysis) {
            switch (this.clinicalAnalysis.type.toUpperCase()) {
                case "SINGLE":
                    this.statsSelect = [
                        {
                            id: this.clinicalAnalysis.proband.samples[0].id,
                            fields: this.clinicalAnalysis.proband?.samples[0]?.qualityControl?.metrics[0]?.variantStats
                                .map( vStats => ({id: this.clinicalAnalysis.proband.samples[0].id + ":" + vStats.id.toUpperCase(), name: vStats.id}))
                        }
                    ];
                    break;
                case "FAMILY":
                    this.statsSelect = [
                        {
                            id: this.clinicalAnalysis.proband.samples[0].id,
                            fields: this.clinicalAnalysis.proband?.samples[0]?.qualityControl?.metrics[0]?.variantStats
                                .map( vStats => ({id: this.clinicalAnalysis.proband.samples[0].id + ":" + vStats.id.toUpperCase(), name: vStats.id}))
                        },
                        ...this.clinicalAnalysis?.family?.members
                            .filter(member => member.id !== this.clinicalAnalysis.proband.id)
                            .map(member => (
                                {
                                    id: member.samples[0].id,
                                    fields: member.samples[0].qualityControl?.metrics[0]?.variantStats
                                        .map( vStats => ({id: member.samples[0].id + ":" + vStats.id.toUpperCase(), name: vStats.id}))
                                })
                            )
                    ];
                    break;
                case "CANCER":
                    this.statsSelect = this.clinicalAnalysis.proband.samples[0].qualityControl?.metrics[0]?.variantStats.map( vStats => (
                        {
                            id: this.clinicalAnalysis.proband.samples[0].id + ":" + vStats.id.toUpperCase(),
                            name: vStats.id
                        }));
                    break;
            }
        }
        let sampleQc = ClinicalAnalysisUtils.getProbandSampleQc(this.clinicalAnalysis);
        // in any case we must have at least 1 variant stat for the proband
        if (sampleQc?.metrics?.length > 0) {
            this.variantStats = sampleQc.metrics[0].variantStats[0];

            this.selectedStat = this.clinicalAnalysis.proband.samples[0].id + ":" + this.variantStats.id.toUpperCase();
            if (!this.variantStats) {
                console.error("Sample variant stats unavailable")
            }
        } else {
            this.variantStats = null;
        }
        this.requestUpdate();
    }

    onSampleChange(e) {
        this.selectedStat = e.detail.value;
        let [sampleId, statsId] = this.selectedStat.split(":");
        this.stats = null;
        const individuals = this.clinicalAnalysis.type.toUpperCase() === "FAMILY" ? this.clinicalAnalysis.family.members : [this.clinicalAnalysis.proband]
        for (let member of individuals) {
            const vStat = member.samples[0].qualityControl?.metrics[0]?.variantStats.find( vStat => vStat.id === statsId);
            if (member.samples[0].id === sampleId && vStat) {
                this.variantStats = vStat;
            }
        }
        if (!this.variantStats) {
            console.error("No stats found");
        }
        this.requestUpdate();
    }

    getDefaultConfig() {
        return {

        };
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
                        <h3><i class="fas fa-lock"></i> No Case open</h3>
                    </div>`;
        }

        if (!this.variantStats) {
            return html`<div class="alert alert-info"><i class="fas fa-3x fa-info-circle align-middle"></i> No QC data are available yet.</div>`;
        }

        return html`
            <style>
                variant-interpreter-qc-variant-stats .select-field-filter {
                    display: inline-block;
                }
                
                variant-interpreter-qc-variant-stats .gene-selector {
                    padding: 0 0 15px 0;
                }
                
                variant-interpreter-qc-variant-stats .gene-selector label {
                    margin-right: 15px;
                }
            </style>
            
            <div style="margin: 20px 10px">
                <h4>Select Sample Variant Stats</h4>
                <div style="margin: 20px 10px">
                    <div class="form-horizontal">
                        <div class="form-group">
                            <label class="col-md-2">Select Sample Stat</label>
                            <div class="col-md-4">
                                <select-field-filter .data="${this.statsSelect}" .value=${this.selectedStat} @filterChange="${this.onSampleChange}"></select-field-filter>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-md-2">Stats Query Filters</label>
                            <div class="col-md-4">
                                <span>${this.variantStats?.query ? this.variantStats?.query.map( q => html`<span class="badge">${q}</span>`) : "none"}</span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-md-2">Description</label>
                            <div class="col-md-4">
                                <span>${this.variantStats?.description ? this.variantStats?.description : "N/A"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="margin: 20px 10px;padding-top: 10px">
                <h4>Sample Variant Stats - ${this.variantStats?.stats.id}</h4>
                <div style="margin: 20px 10px">
                    <sample-variant-stats-view .opencgaSession="${this.opencgaSession}" .sampleVariantStats="${this.variantStats?.stats}"> </sample-variant-stats-view>
                </div>
            </div>
        `;
    }

}

customElements.define("variant-interpreter-qc-variant-stats", VariantInterpreterQcVariantStats);
