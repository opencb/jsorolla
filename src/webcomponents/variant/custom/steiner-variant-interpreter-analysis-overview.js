/*
 * Copyright 2015-2024 OpenCB
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
import "./steiner-variant-interpreter-analysis-signature.js";
import "./steiner-variant-interpreter-analysis-hrdetect.js";

class SteinerVariantInterpreterAnalysisOverview extends LitElement {

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
        };
    }

    #init() {
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("clinicalAnalysis")) {
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
            items.push({
                id: "mutational-signature",
                name: "Mutational Signature",
                render: (clinicalAnalysis, active, opencgaSession) => html`
                    <div class="col-md-10">
                        <h3>Mutational Signature</h3>
                        <steiner-variant-interpreter-analysis-signature
                            .opencgaSession=${opencgaSession}
                            .clinicalAnalysis="${clinicalAnalysis}"
                            ?active="${active}">
                        </steiner-variant-interpreter-analysis-signature>
                    </div>
                `,
            });
            items.push({
                id: "hrdetect",
                name: "HRDetect",
                render: (clinicalAnalysis, active, opencgaSession) => html`
                    <div class="col-md-10">
                        <h3>HRDetect</h3>
                        <steiner-variant-interpreter-analysis-hrdetect
                            .opencgaSession=${opencgaSession}
                            .clinicalAnalysis="${clinicalAnalysis}"
                            ?active="${active}">
                        </steiner-variant-interpreter-analysis-hrdetect>
                    </div>
                `,
            });
        }

        return {
            display: {
                align: "center"
            },
            items: items,
        };
    }

}

customElements.define("steiner-variant-interpreter-analysis-overview", SteinerVariantInterpreterAnalysisOverview);
