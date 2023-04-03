/*
 * Copyright 2015-Present OpenCB
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
import "../../commons/view/detail-tabs.js";
import "./variant-interpreter-custom-analysis-signature.js";
import "./variant-interpreter-qc-hrdetect.js";

class VariantInterpreterCustomAnalysisOverview extends LitElement {

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
            clinicalAnalysis: {
                type: Object
            },
            active: {
                type: Boolean,
            },
            settings: {
                type: Object
            }
        };
    }

    #init() {
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("clinicalAnalysis") || changedProperties.has("settings")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    render() {
        return html`
            <detail-tabs
                .data="${this.clinicalAnalysis}"
                .mode="${"pills_vertical"}"
                .config="${this._config}"
                .opencgaSession="${this.opencgaSession}">
            </detail-tabs>
        `;
    }

    getDefaultConfig() {
        const items = [];

        if (this.clinicalAnalysis) {
            const visibleTabs = new Set((this.settings?.tabs || []).map(tab => tab.id));

            if (visibleTabs.has("mutational-signature")) {
                items.push({
                    id: "mutational-signature",
                    name: "Mutational Signature",
                    render: (clinicalAnalysis, active, opencgaSession) => html`
                        <div class="col-md-10">
                            <h3>Mutational Signature</h3>
                            <variant-interpreter-custom-analysis-signature
                                .opencgaSession=${opencgaSession}
                                .clinicalAnalysis="${clinicalAnalysis}"
                                ?active="${active}">
                            </variant-interpreter-custom-analysis-signature>
                        </div>
                    `,
                });
            }
            if (visibleTabs.has("hrdetect")) {
                items.push({
                    id: "hrdetect",
                    name: "HRDetect",
                    render: (clinicalAnalysis, active, opencgaSession) => html`
                        <div class="col-md-10">
                            <h3>HRDetect</h3>
                            <variant-interpreter-qc-hrdetect
                                .opencgaSession=${opencgaSession}
                                .clinicalAnalysis="${clinicalAnalysis}"
                                ?active="${active}">
                            </variant-interpreter-qc-hrdetect>
                        </div>
                    `,
                });
            }
        }

        return {
            display: {
                align: "center"
            },
            items: items,
        };
    }

}

customElements.define("variant-interpreter-custom-analysis-overview", VariantInterpreterCustomAnalysisOverview);
