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
import "../../clinical/analysis/hrdetect-view.js";

class SteinerVariantInterpreterAnalysisHrDetect extends LitElement {

    constructor() {
        super();
        this.#init();
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
                type: Boolean,
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this._config = this.getDefaultConfig();
        this.hrdetect = [];
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("clinicalAnalysis") || changedProperties.has("active")) {
            this.prepareSignatures();
        }

        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }
    }

    clinicalAnalysisIdObserver() {
        if (this.opencgaSession && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical()
                .info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis = response.responses[0].results[0];
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    prepareSignatures() {
        this.signatures = [];
        const somaticSample = (this.clinicalAnalysis?.proband?.samples || []).find(s => s.somatic);
        if (this.opencgaSession && somaticSample && this.active) {
            // We need to import the hrdetect data from the sample.qualityControl field
            this.opencgaSession.opencgaClient.samples()
                .search({
                    id: somaticSample.id,
                    include: "id,qualityControl.variant",
                    study: this.opencgaSession.study.fqn,
                })
                .then(response => {
                    const sample = response?.responses?.[0]?.results?.[0];
                    if (sample) {
                        this.hrdetect = sample.qualityControl?.variant?.hrDetects || [];
                    }
                    this.requestUpdate();
                });
        }
    }

    render() {
        if (!this.opencgaSession?.project) {
            return html`
                <div>
                    <h4><i class="fas fa-lock"></i> No public projects available to browse. Please login to continue</h4>
                </div>
            `;
        }

        if (!this.clinicalAnalysis) {
            return html`
                <div>
                    <h3><i class="fas fa-lock"></i> No Case found</h3>
                </div>
            `;
        }

        return html`
            <div style="margin: 20px 10px">
                <hrdetect-view
                    .hrdetect="${this.hrdetect}"
                    .opencgaSession="${this.opencgaSession}">
                </hrdetect-view>
            </div>
        `;
    }

    getDefaultConfig() {
        return {};
    }

}

customElements.define("steiner-variant-interpreter-analysis-hrdetect", SteinerVariantInterpreterAnalysisHrDetect);
