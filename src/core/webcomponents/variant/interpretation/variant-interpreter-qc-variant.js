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
import "./variant-interpreter-qc-variant-family.js";
import "./variant-interpreter-qc-variant-cancer.js";
import "../../simple-chart.js";
import "../../commons/view/data-form.js";


class VariantInterpreterQcVariant extends LitElement {

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
            clinicalAnalysisId: {
                type: String
            },
            clinicalAnalysis: {
                type: Object
            },
            active: {
                type: Boolean
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "vcis-" + UtilsNew.randomString(6);
        this.save = {};
    }

    connectedCallback() {
        super.connectedCallback();
    }

    updated(changedProperties) {
        // if (changedProperties.has("opencgaSession")) {
        //     this.opencgaSessionObserver();
        // }
        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
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

    render() {
        // Check Project exists
        if (!this.opencgaSession || !this.opencgaSession.project) {
            return html`
                <div class="guard-page">
                    <i class="fas fa-lock fa-5x"></i>
                    <h3>No project available to browse. Please login to continue</h3>
                </div>
            `;
        }

        // Check Clinical Analysis exist
        if (!this.clinicalAnalysis) {
            return html`
                <div>
                    <h3><i class="fas fa-lock"></i> No Case selected</h3>
                </div>`;
        }

        // Variant stats are different for FAMILY and CANCER analysis, this does not happens with Alignment
        if (this.clinicalAnalysis.type.toUpperCase() === "FAMILY") {
            return html`
                <div class="container" style="margin-bottom: 20px">
                    <div style="float: left">
                        <h2>RD Variant Stats</h2>
                    </div>
                    <div style="margin-top: 20px; float: right">
                        <button class="btn btn-primary" @click="${this.onCloseClinicalAnalysis}">
                            <i class="fas fa-save" style="padding-right: 10px"></i>Save
                        </button>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-10 col-md-offset-1">
                        <variant-interpreter-qc-variant-family .opencgaSession="${this.opencgaSession}" .sampleId="${this.clinicalAnalysis.proband.samples[0].id}" ?active="${this.active}"></variant-interpreter-qc-variant-family>
                    </div>
                </div>
            `;
        }

        if (this.clinicalAnalysis.type.toUpperCase() === "CANCER") {
            return html`
                <div class="container" style="margin-bottom: 20px">
                    <div style="float: left">
                        <h2>Cancer Variant Stats</h2>
                    </div>
                    <div style="margin-top: 20px; float: right">
                        <button class="btn btn-primary" @click="${this.onCloseClinicalAnalysis}">
                            <i class="fas fa-save" style="padding-right: 10px"></i>Save
                        </button>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-10 col-md-offset-1">
                        <variant-interpreter-qc-variant-cancer .clinicalAnalysis="${this.clinicalAnalysis}" .opencgaSession="${this.opencgaSession}" .sampleId="${this.clinicalAnalysis.proband.samples[0].id}" ?active="${this.active}"></variant-interpreter-qc-variant-cancer>
                    </div>
                </div>
            `;
        }
    }
}

customElements.define("variant-interpreter-qc-variant", VariantInterpreterQcVariant);
