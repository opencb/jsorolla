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

import {html, LitElement, nothing} from "lit";
import {keyed} from "lit/directives/keyed.js";
import "../../commons/empty-state.js";
import "../../commons/view/detail-tabs.js";
import "../../clinical/analysis/rd-tiering-analysis.js";
import "../../clinical/analysis/exomiser-analysis.js";
import "../../workflow/analysis/tool-executor.js";

class VariantInterpreterMethods extends LitElement {

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
            clinicalAnalysisId: {
                type: String
            },
            settings: {
                type: Object,
            },
        };
    }

    #init() {
        this._customTools = [];
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }

        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }

        if (changedProperties.has("opencgaSession") || changedProperties.has("clinicalAnalysis") || changedProperties.has("settings")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    opencgaSessionObserver() {
        this._customTools = [];
        if (this.opencgaSession) {
            this.opencgaSession.opencgaClient.userTool()
                .search({
                    study: this.opencgaSession.study.fqn,
                    scope: "CLINICAL_INTERPRETATION_ANALYSIS",
                })
                .then(response => {
                    this._customTools = response.responses[0].results;
                    this._config = this.getDefaultConfig();
                    this.requestUpdate();
                });
        }
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
        if (!this.opencgaSession) {
            return nothing;
        }

        // If no methods have been configured, we will display a warning message
        if (!this._config || this._config.items.length === 0) {
            return html`
                <div class="container">
                    <empty-state
                        .icon="${"fa-sync"}"
                        .title="${"No Interpretation Methods Available"}"
                        .description="${html`
                            <span>There are no interpretation methods available to be executed. </span>
                            <span>Please, contact your administrator to configure interpretation methods for this study.</span>
                        `}">
                    </empty-state>
                </div>
            `;
        }

        return keyed(this.opencgaSession.study.fqn + ":" + this._config.items.length, html`
            <detail-tabs
                .data="${this.clinicalAnalysis}"
                .config="${this._config}"
                .opencgaSession="${this.opencgaSession}">
            </detail-tabs>
        `);
    }

    getDefaultConfig() {
        const items = [];

        // add custom tools
        (this._customTools || []).forEach(tool => {
            items.push({
                id: tool.id,
                name: tool.name || tool.id,
                render: (clinicalAnalysis, active, opencgaSession) => {
                    return html`
                        <div class="container">
                            <tool-header title="Execute ${tool.name || tool.id}"></tool-header>
                            <tool-executor
                                .toolParams="${{
                                    id: tool.id,
                                    variables: {
                                        clinicalAnalysisId: clinicalAnalysis.id,
                                    },
                                }}"
                                .displayConfig="${{
                                    titleVisible: false,
                                }}"
                                .opencgaSession="${opencgaSession}">
                            </tool-executor>
                        </div>
                    `;
                },
            });
        });

        // add built-in methods
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
                                <div class="container">
                                    <tool-header title="Exomiser - ${probandId}"></tool-header>
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
                            return html`
                                <div class="container">
                                    <tool-header title="RD Tiering - ${probandId}"></tool-header>
                                    <rd-tiering-analysis
                                        .toolParams="${{
                                            clinicalAnalysis: clinicalAnalysis.id,
                                        }}"
                                        .opencgaSession="${opencgaSession}"
                                        .displayConfig="${{
                                            titleVisible: false,
                                        }}">
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
