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

import {LitElement, html, nothing} from "lit";
import ClinicalAnalysisUtils from "../../clinical/clinical-analysis-utils.js";
import UtilsNew from "../../../core/utils-new.js";
import "../../sample/sample-variant-stats-view.js";

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
            clinicalAnalysis: {
                type: Object
            },
            clinicalAnalysisId: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

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

    clinicalAnalysisObserver() {
        // TODO use ClinicalAnalysisUtils
        if (this.clinicalAnalysis) {

            // TODO temp fix to support both Opencga 2.0.3 and Opencga 2.1.0-rc
            if (this.clinicalAnalysis.proband?.samples[0]?.qualityControl?.variantMetrics) {
                this._variantStatsPath = "variantMetrics";
            } else if (this.clinicalAnalysis.proband?.samples[0]?.qualityControl.variant) {
                this._variantStatsPath = "variant";
            } else {
                console.error("unexpected QC data model");
            }

            switch (this.clinicalAnalysis.type.toUpperCase()) {
                case "SINGLE":
                    this.statsSelect = [
                        {
                            id: this.clinicalAnalysis.proband.samples[0].id,
                            fields: this.clinicalAnalysis.proband?.samples[0]?.qualityControl?.[this._variantStatsPath]?.variantStats
                                .map(vStats => ({id: this.clinicalAnalysis.proband.samples[0].id + ":" + vStats.id, name: vStats.id}))
                        }
                    ];
                    this.statsSelect = [this.clinicalAnalysis.proband?.samples[0].id];

                    this.samplesVariantStats = [
                        {
                            sample: this.clinicalAnalysis.proband?.samples[0],
                            role: "proband"
                        }
                    ];
                    // hide the sample selector (or select the samples of the proband?)
                    break;
                case "FAMILY":
                    /* this.statsSelect = [
                        {
                            id: this.clinicalAnalysis.proband.samples[0].id,
                            fields: this.clinicalAnalysis.proband?.samples[0]?.qualityControl?.variantMetrics?.variantStats
                                .map( vStats => ({id: this.clinicalAnalysis.proband.samples[0].id + ":" + vStats.id, name: vStats.id}))
                        },
                        ...this.clinicalAnalysis?.family?.members
                            .filter(member => member.id !== this.clinicalAnalysis.proband.id && member.samples && member.samples.length > 0)
                            .map(member => (
                                {
                                    id: member.samples[0].id,
                                    fields: member.samples[0].qualityControl?.variantMetrics?.variantStats
                                        .map( vStats => ({id: member.samples[0].id + ":" + vStats.id, name: vStats.id}))
                                })
                            )
                    ];*/
                    this.statsSelect = [
                        this.clinicalAnalysis.proband?.samples[0].id,
                        ...this.clinicalAnalysis?.family?.members
                            .filter(member => member.id !== this.clinicalAnalysis.proband.id && member.samples && member.samples.length > 0)
                            .map(member => member.samples[0].id)
                    ];

                    this.samplesVariantStats = [
                        {
                            sample: this.clinicalAnalysis.proband?.samples[0],
                            role: "proband",
                            active: true
                        },
                        ...this.clinicalAnalysis?.family?.members
                            .filter(member => member.id !== this.clinicalAnalysis.proband.id && member.samples && member.samples.length > 0)
                            .map(member => {
                                return {
                                    sample: member.samples[0],
                                    role: this.clinicalAnalysis.family.roles[this.clinicalAnalysis.proband.id][member.id]?.toLowerCase()
                                };
                            })
                    ];
                    break;
                case "CANCER":
                    /* this.statsSelect = this.clinicalAnalysis.proband.samples[0].qualityControl?.variantMetrics?.variantStats.map( vStats => (
                        {
                            id: this.clinicalAnalysis.proband.samples[0].id + ":" + vStats.id,
                            name: vStats.id
                        }));*/
                    // let sample = this.clinicalAnalysis.proband?.samples.filter(sample => !sample.somatic);
                    this.statsSelect = this.clinicalAnalysis.proband?.samples.filter(sample => !sample.somatic).map(sample => sample.id);
                    this.samplesVariantStats = this.clinicalAnalysis?.proband?.samples
                        .filter(sample => !sample.somatic)
                        .map(sample => {
                            return {
                                sample: sample,
                                role: sample.somatic ? "tumor" : "normal"
                            };
                        });
                    break;
            }
            this.sampleId = this.statsSelect[0];
            this.sample = this.samplesVariantStats[0]?.sample;
        }
        /* let sampleQc = ClinicalAnalysisUtils.getProbandSampleQc(this.clinicalAnalysis);
        // in any case we must have at least 1 variant stat for the proband
        if (sampleQc?.metrics?.length > 0) {
            this.variantStats = sampleQc.variantMetrics.variantStats[0];

            this.selectedStat = this.clinicalAnalysis.proband.samples[0].id + ":" + this.variantStats.id;
            if (!this.variantStats) {
                console.error("Sample variant stats unavailable")
            }
        } else {
            this.variantStats = null;
        }*/
        this.requestUpdate();
    }

    clinicalAnalysisIdObserver() {
        if (this.opencgaSession && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis = response.responses[0].results[0];
                    this.clinicalAnalysisObserver();
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }


    onSampleChange(e) {
        /* this.selectedStat = e.detail.value;
        let [sampleId, statsId] = this.selectedStat.split(":");
        this.stats = null;
        const individuals = this.clinicalAnalysis.type.toUpperCase() === "FAMILY" ? this.clinicalAnalysis.family.members : [this.clinicalAnalysis.proband]
        for (let member of individuals) {
            if (member?.samples?.length > 0) {
                console.log(member.samples[0].qualityControl?.variantMetrics?.variantStats);
                const vStat = member.samples[0].qualityControl?.variantMetrics?.variantStats.find( vStat => vStat.id === statsId);
                if (member.samples[0].id === sampleId && vStat) {
                    this.variantStats = vStat;
                }
            }
        }
        if (!this.variantStats) {
            console.error("No stats found");
        }*/

        this.sampleId = e.detail.value;
        this.requestUpdate();
    }

    onSampleVariantStatsChange(e) {
        const sampleId = e.currentTarget.dataset.sampleId;
        this.sample = this.samplesVariantStats.find(e => e.sample.id === sampleId).sample;
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
                        <h3><i class="fas fa-lock"></i> No Case found</h3>
                    </div>`;
        }

        /* if (!this.variantStats) {
            return html`
                <div style="margin: 20px 10px">
                    <div class="alert alert-info"><i class="fas fa-3x fa-info-circle align-middle"></i> No QC data are available yet.</div>
                </div>
            `;
        }*/

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

            <!--
            <div style="margin: 20px 10px">
                <div style="margin: 20px 10px">
                    <div class="form-horizontal">
                        <div class="form-group">
                            <label class="col-md-2">Select Sample</label>
                            <div class="col-md-4">
                                <select-field-filter forceSelection .data="\${this.statsSelect}" .value=\${this.sampleId} @filterChange="\${this.onSampleChange}"></select-field-filter>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            -->

            ${this.samplesVariantStats?.length > 1 ?
                html`
                    <div class="btn-group" role="group" aria-label="..." style="padding-top: 15px; padding-left: 5px">
                        ${this.samplesVariantStats.map(s => html`
                            <button type="button" class="btn btn-light ${s.sample.id === this.sample.id ? "active" : ""}" data-sample-id="${s.sample.id}" @click="${this.onSampleVariantStatsChange}" style="padding: 10px 20px">
                                <span class="fw-bold">${s.sample.id} </span> <span class="text-body-secondary"> ${s.role}</span>
                            </button>
                        `)}
                    </div>` :
            nothing}


            <div style="margin: 20px 10px;padding-top: 10px">
<!--                <h4>Sample Variant Stats - \${this.variantStats?.stats.id}</h4>-->
                <div>
                    <sample-variant-stats-view
                        .opencgaSession="${this.opencgaSession}"
                        .sample="${this.sample}">
                    </sample-variant-stats-view>
                </div>
            </div>
        `;
    }

}

customElements.define("variant-interpreter-qc-variant-stats", VariantInterpreterQcVariantStats);
