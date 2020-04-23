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


class VariantCancerInterpreterSummary extends LitElement {

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
            query: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "vcis-" + UtilsNew.randomString(6);

        this.query = {};
        this.search = {};
    }

    connectedCallback() {
        super.connectedCallback();

        // this._config = {...this.getDefaultConfig(), ...this.config};
        this.requestUpdate();
    }

    firstUpdated(_changedProperties) {
        this.requestUpdate();
    }

    updated(changedProperties) {
        // if (changedProperties.has("opencgaSession")) {
        //     this.opencgaSessionObserver();
        // }
        // if (changedProperties.has("clinicalAnalysisId")) {
        //     this.clinicalAnalysisIdObserver();
        // }
        // if (changedProperties.has("clinicalAnalysis")) {
        //     this.clinicalAnalysisObserver();
        // }
        // if (changedProperties.has("query")) {
        //     this.queryObserver();
        // }
    }

    render() {
        debugger
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
                <div class="row" style="padding: 10px">
                    <div class="col-md-12">
                        <div class="col-md-6">
                            <h2>Circos</h2>
                            <img width="640" src="https://www.researchgate.net/profile/Angela_Baker6/publication/259720064/figure/fig1/AS:613877578465328@1523371228720/Circos-plot-summarizing-somatic-events-A-summary-of-all-identified-somatic-genomic.png">
                        </div>
                        <div class="col-md-6">
                            <h2>Signature</h2>
                            <img width="480" src="https://cancer.sanger.ac.uk/signatures_v2/Signature-3.png">
                            
                            <div style="padding-top: 20px">
                                <h2>Sample Stats</h2>
                                <img width="480" src="https://www.ensembl.org/img/vep_stats_2.png">
                            </div>
                        </div>
                    </div>
                </div>
            `;
    }

}

customElements.define("variant-cancer-interpreter-summary", VariantCancerInterpreterSummary);
