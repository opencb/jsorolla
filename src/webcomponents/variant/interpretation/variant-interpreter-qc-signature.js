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
import UtilsNew from "../../../core/utils-new.js";
import "../../sample/sample-qc-signature-view.js";

class VariantInterpreterQcSignature extends LitElement {

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
        if (changedProperties.has("clinicalAnalysis")) {
            this.prepareSignatures();
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
                    this.prepareSignatures();
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    prepareSignatures() {
        if (this.clinicalAnalysis) {
            this.somaticSample = this.clinicalAnalysis.proband.samples.find(s => s.somatic);
            // if (somaticSample) {
            //     this.signature = somaticSample.qualityControl?.variantMetrics?.signatures[0];
            // }
        }
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
                        <h4><i class="fas fa-lock"></i> No public projects available to browse. Please login to continue</h4>
                    </div>`;
        }

        // Check Clinical Analysis exist
        if (!this.clinicalAnalysis) {
            return html`
                    <div>
                        <h3><i class="fas fa-lock"></i> No Case found</h3>
                    </div>`;
        }
        // if (!this.signature) {
        //     return html`
        //             <div>
        //                 <h4 style="padding: 20px"><i class="fas fa-lock"></i>No signature found</h4>
        //             </div>`;
        // }
// debugger
        // <signature-view .signature="${this.signature}"></signature-view>
        return html`
            <div style="margin: 20px 10px">
                <sample-qc-signature-view .sample="${this.somaticSample}" .opencgaSession="${this.opencgaSession}"></sample-qc-signature-view>
            </div>
        `;
    }

}

customElements.define("variant-interpreter-qc-signature", VariantInterpreterQcSignature);
