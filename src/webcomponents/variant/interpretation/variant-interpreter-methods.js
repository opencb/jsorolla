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
import "../../commons/view/detail-tabs.js";
import "../../clinical/analysis/rd-tiering-analysis.js";
import "../../clinical/analysis/exomiser-analysis.js";

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
            settings: {
                type: Object,
            },
        };
    }

    _init() {
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }

        if (changedProperties.has("opencgaSession") || changedProperties.has("clinicalAnalysis") || changedProperties.has("settings")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    clinicalAnalysisIdObserver() {
        if (this.opencgaSession?.opencgaClient && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical()
                .info(this.clinicalAnalysisId, {
                    study: this.opencgaSession.study.fqn,
                })
                .then(response => {
                    this.clinicalAnalysis = response.responses[0].results[0];
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    render() {
        if (!this.opencgaSession?.project) {
            return html`
                <div>
                    <h3><i class="fas fa-lock"></i> No public projects available to browse. Please login to continue</h3>
                </div>
            `;
        }

        // If no methods have been configured, we will display a warning message
        if (!this._config || this._config.items.length === 0) {
            return html`
                <div class="col-md-10 offset-md-1">
                    <div class="alert alert-warning" role="alert">
                        No automatic methods available at this time.
                    </div>
                </div>
            `;
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

        if (this.clinicalAnalysis && this.settings) {
            const probandId = this.clinicalAnalysis.proband?.id || "";
            const type = this.clinicalAnalysis.type?.toUpperCase() || "";
            const caseConfig = (this.settings.items || []).find(item => item.type === type);

            (caseConfig?.methods || []).forEach(method => {
                if (method.id === "exomiser") {
                    items.push({
                        id: "exomiser",
                        name: "Exomiser",
                        render: (clinicalAnalysis, active, opencgaSession) => {
                            return html`
                                <div class="col-md-6 offset-md-3">
                                    <tool-header title="Exomiser - ${probandId}" class="bg-white"></tool-header>
                                    <exomiser-analysis
                                        .toolParams="${{clinicalAnalysis: clinicalAnalysis.id}}"
                                        .opencgaSession="${opencgaSession}"
                                        .config="${{title: "", display: {buttonOkDisabled: this.clinicalAnalysis.locked}}}">
                                    </exomiser-analysis>
                                </div>
                            `;
                        },
                    });
                }

                if (method.id === "rd-tiering" || method.id === "rdtiering") {
                    items.push({
                        id: "rd-tiering",
                        name: "RD Tiering",
                        render: (clinicalAnalysis, active, opencgaSession) => {
                            const toolParams = {
                                clinicalAnalysis: clinicalAnalysis.id,
                                panels: clinicalAnalysis.panels?.map(panel => panel.id).join(","),
                            };
                            return html`
                                <div class="col-md-6 offset-md-3">
                                    <tool-header title="RD Tiering - ${probandId}" class="bg-white"></tool-header>
                                    <rd-tiering-analysis
                                        .toolParams="${toolParams}"
                                        .opencgaSession="${opencgaSession}"
                                        .title="${""}">
                                    </rd-tiering-analysis>
                                </div>
                            `;
                        },
                    });
                }
            });
        }

        return {
            display: {
                classes: "justify-content-center",
            },
            items: items,
        };
    }

}

customElements.define("variant-interpreter-methods", VariantInterpreterMethods);
