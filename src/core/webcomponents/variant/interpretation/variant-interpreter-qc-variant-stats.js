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
        if (this.clinicalAnalysis) {
            switch (this.clinicalAnalysis.type.toUpperCase()) {
                case "FAMILY":
                    this.statsSelect = [
                        {id: this.clinicalAnalysis.proband.samples[0].id, fields: this.clinicalAnalysis.proband.samples[0].annotationSets.map( set => ({id: this.clinicalAnalysis.proband.samples[0].id + ":" + set.id.toUpperCase(), name: set.name}))},
                        ...this.clinicalAnalysis.family.members
                            .filter(member => member.id !== this.clinicalAnalysis.proband.id)
                            .map(member => ({
                                id: member.samples[0].id,
                                fields: member.samples[0].annotationSets.map( set => ({id: member.samples[0].id + ":" + set.id.toUpperCase(), name: set.name}))
                            }))
                    ];
                    break;
                case "CANCER":
                    this.statsSelect = this.clinicalAnalysis.proband.samples[0].annotationSets.map( set => ({id: this.clinicalAnalysis.proband.samples[0].id + ":" + set.id.toUpperCase(), name: set.name}));
                    break;

            }
        }

        this.stats = this.clinicalAnalysis.proband.samples[0].annotationSets.find( annotationSet => annotationSet.id.toUpperCase() === "OPENCGA_SAMPLE_VARIANT_STATS");
        if (!this.stats) {
            console.error("Sample variant stats unavailable")
        }
        this.requestUpdate();
    }

    onSampleChange(e) {
        let [sampleId, stats] = e.detail.value.split(":");
        console.log(sampleId, stats)
        this.stats = null;
        for (let member of this.clinicalAnalysis.family.members) {
            for (let sample of member.samples) {
                if (sample.id === sampleId) {
                    for (let annotationSet of sample.annotationSets) {
                        if (annotationSet.id.toUpperCase() === stats) {
                            this.stats = annotationSet;
                        }
                    }
                }
            }
        }
        if (!this.stats) {
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

        return html`
            <style>
                variant-interpreter-qc-variant-stats .select-field-filter {
                    display: inline-block;
                }
            </style>
            <div class="container">
                <div class="row">
                    <div class="col-md-12">
                        <form class="form-inline">
                            <div class="form-group">
                                <label>Select Sample</label>
                                <select-field-filter .data="${this.statsSelect}" @filterChange="${this.onSampleChange}"></select-field-filter>
                            </div>
                        </form>
                    </div>
                    </div>
                    <div class="row">
                    <h3>Sample Variant Stats</h3>
                    <sample-variant-stats-view .opencgaSession="${this.opencgaSession}" .sampleVariantStats="${this.stats?.annotations}"> </sample-variant-stats-view>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("variant-interpreter-qc-variant-stats", VariantInterpreterQcVariantStats);
