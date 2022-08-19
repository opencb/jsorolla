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
import UtilsNew from "../../../core/utilsNew.js";
import "../../commons/view/detail-tabs.js";
import "../../clinical/analysis/rd-tiering-analysis.js";
import "../../clinical/analysis/exomiser-analysis.js";
import "../../clinical/analysis/opencga-rd-tiering-analysis.js";
import "../../clinical/analysis/opencga-exomiser-analysis.js";


class VariantInterpreterMethods extends LitElement {

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
        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }
        // if (changedProperties.has("clinicalAnalysis")) {
        //     this.clinicalAnalysisObserver();
        // }
        super.update(changedProperties);
    }

    opencgaSessionObserver() {
        this._config = this.getDefaultConfig();
        this.requestUpdate();
    }

    clinicalAnalysisIdObserver() {
        if (this.opencgaSession?.opencgaClient && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis = response.responses[0].results[0];
                    // this.requestUpdate();
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
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

        return html`
            <detail-tabs
                .data="${this.clinicalAnalysis}"
                .config="${this._config}"
                .opencgaSession="${this.opencgaSession}">
            </detail-tabs>
        `;
    }

    getDefaultConfig() {
        const items = [];

        if (this.clinicalAnalysis) {
            const probandId = this.clinicalAnalysis.proband.id;

            if (this.clinicalAnalysis.type.toUpperCase() === "SINGLE") {
                items.push({
                    id: "exomiser",
                    name: "Exomiser",
                    render: (clinicalAnalysis, active, opencgaSession) => {
                        return html`
                            <div class="col-md-6 col-md-offset-3">
                                <tool-header title="Exomiser - ${probandId}" class="bg-white"></tool-header>
                                <exomiser-analysis
                                    .clinicalAnalysis="${clinicalAnalysis}"
                                    .opencgaSession="${opencgaSession}"
                                    .title="">
                                </exomiser-analysis>
                            </div>
                        `;
                    },
                });
            }

            if (this.clinicalAnalysis.type.toUpperCase() === "FAMILY") {
                items.push({
                    id: "rd-tiering",
                    name: "RD Tiering",
                    active: true,
                    render: (clinicalAnalysis, active, opencgaSession) => {
                        return html`
                            <div class="col-md-6 col-md-offset-3">
                                <tool-header title="RD Tiering - ${probandId}" class="bg-white"></tool-header>
                                <rd-tiering-analysis
                                    .clinicalAnalysis="${clinicalAnalysis}"
                                    .opencgaSession="${opencgaSession}"
                                    .title="${""}">
                                </rd-tiering-analysis>
                            </div>
                        `;
                    },
                });
                items.push({
                    id: "exomiser",
                    name: "Exomiser",
                    render: (clinicalAnalysis, active, opencgaSession) => {
                        return html`
                            <div class="col-md-6 col-md-offset-3">
                                <tool-header title="Exomiser - ${probandId}" class="bg-white"></tool-header>
                                <exomiser-analysis
                                    .clinicalAnalysis="${clinicalAnalysis}"
                                    .opencgaSession="${opencgaSession}"
                                    .title="">
                                </exomiser-analysis>
                            </div>
                        `;
                    },
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

customElements.define("variant-interpreter-methods", VariantInterpreterMethods);
