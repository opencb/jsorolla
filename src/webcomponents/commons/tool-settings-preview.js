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

import {html, LitElement} from "lit";
import "../disease-panel/disease-panel-browser.js";

import "../individual/individual-browser.js";
import "../cohort/cohort-browser.js";
import "../family/family-browser.js";
import "../sample/sample-browser.js";
import "../file/file-browser.js";
import "../job/job-browser.js";
import "../variant/variant-browser.js";
import "../disease-panel/disease-panel-browser.js";
import "../clinical/clinical-analysis-browser.js";
import "../clinical/clinical-analysis-portal.js";
import "../user/user-profile.js";
import "../commons/view/detail-tabs.js";

export default class ToolSettingsPreview extends LitElement {

    // --- CONSTRUCTOR ---
    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    // --- PROPERTIES ---
    static get properties() {
        return {
            opencgaSession: {
                type: Object,
            },
            settings: {
                type: Object,
            },
            tool: {
                type: String,
            },
            param: {
                type: String,
            }
        };
    }

    // --- PRIVATE METHODS ---
    #init() {
        this.param = null;
        this.map = {
            "INDIVIDUAL_BROWSER": {
                render: settings => {
                    return html`
                        <individual-browser
                            .opencgaSession="${this.opencgaSession}"
                            .settings="${settings}"
                            .config="${{showHeader: false}}">
                        </individual-browser>
                    `;
                }
            },
            "COHORT_BROWSER": {
                render: settings => {
                    return html`
                        <cohort-browser
                            .opencgaSession="${this.opencgaSession}"
                            .settings="${settings}"
                            .config="${{showHeader: false}}">
                        </cohort-browser>
                    `;
                }
            },
            "FAMILY_BROWSER": {
                render: settings => {
                    return html`
                        <family-browser
                            .opencgaSession="${this.opencgaSession}"
                            .settings="${settings}"
                            .config="${{showHeader: false}}">
                        </family-browser>
                    `;
                }
            },
            "SAMPLE_BROWSER": {
                render: settings => {
                    return html`
                        <sample-browser
                            .opencgaSession="${this.opencgaSession}"
                            .settings="${settings}"
                            .config="${{showHeader: false}}">
                        </sample-browser>
                    `;
                }
            },
            "FILE_BROWSER": {
                render: settings => {
                    return html`
                        <file-browser
                            .opencgaSession="${this.opencgaSession}"
                            .settings="${settings}"
                            .config="${{showHeader: false}}">
                        </file-browser>
                    `;
                }
            },
            "JOB_BROWSER": {
                render: settings => {
                    return html`
                        <job-browser
                            .opencgaSession="${this.opencgaSession}"
                            .settings="${settings}"
                            .config="${{showHeader: false}}">
                        </job-browser>
                    `;
                }
            },
            "VARIANT_BROWSER": {
                render: settings => {
                    return html`
                        <variant-browser
                            .opencgaSession="${this.opencgaSession}"
                            .cellbaseClient="${this.opencgaSession.cellbaseClient}"
                            .consequenceTypes="${CONSEQUENCE_TYPES}"
                            .populationFrequencies="${POPULATION_FREQUENCIES}"
                            .proteinSubstitutionScores="${PROTEIN_SUBSTITUTION_SCORE.style}"
                            .settings="${settings}"
                            .config="${{showHeader: false}}">
                        </variant-browser>
                    `;
                }
            },
            "DISEASE_PANEL_BROWSER": {
                render: settings => {
                    return html`
                        <disease-panel-browser
                            .opencgaSession="${this.opencgaSession}"
                            .cellbaseClient="${this.opencgaSession.cellbaseClient}"
                            .settings="${settings}"
                            .config="${{showHeader: false}}">
                        </disease-panel-browser>
                    `;
                }
            },
            "CLINICAL_ANALYSIS_BROWSER": {
                render: settings => {
                    return html`
                        <clinical-analysis-browser
                            .opencgaSession="${this.opencgaSession}"
                            .settings="${settings}"
                            .config="${{componentId: "clinicalAnalysisBrowserCatalog", showHeader: false}}">
                        </clinical-analysis-browser>
                    `;
                },
            },
            "CLINICAL_ANALYSIS_PORTAL_BROWSER": {
                render: settings => {
                    return html`
                        <clinical-analysis-portal
                            .opencgaSession="${this.opencgaSession}"
                            .settings="${settings}"
                            .config="${{componentId: "clinicalAnalysisBrowserPortal", showHeader: false}}">
                        </clinical-analysis-portal>
                    `;
                }
            },
            /*
            "RGA_BROWSER": {
                render: settings => {
                    return html `
                        <rga-browser
                            .opencgaSession="${this.opencgaSession}"
                            .settings="${settings}"
                            .config="${{showHeader: false}}">
                        </rga-browser>
                    `;
                }
                },
            */
            "USER_PROFILE_SETTINGS": {
                render: settings => {
                    return html`
                        <user-profile
                            .opencgaSession="${this.opencgaSession}"
                            .settings="${settings}">
                        </user-profile>
                    `;
                },
            },
            "VARIANT_INTERPRETER_SETTINGS": {
                render: (settings, param) => {
                    if (this.param === null) {
                        // debugger
                        return html`Retrieving data...`;
                    } else {
                        // debugger
                        return html`
                            <variant-interpreter
                                .opencgaSession="${this.opencgaSession}"
                                .cellbaseClient="${this.opencgaSession.cellbaseClient}"
                                .clinicalAnalysisId="${this.param}"
                                .settings="${settings}"
                                @selectClinicalAnalysis="${this.onSelectClinicalAnalysis}">
                            </variant-interpreter>
                        `;
                    }
                },
            },
        };
    }

    update(changedProperties) {
        if (changedProperties.has("tool")) {
            this.toolObserver();
        }
        super.update(changedProperties);
    }

    toolObserver() {
        if (this.tool === "VARIANT_INTERPRETER_SETTINGS") {
            this.#getClinicalAnalysisId();
        }
    }

    #getClinicalAnalysisId() {
        if (this.opencgaSession) {
            const params = {};
            this.opencgaSession.opencgaClient.clinical()
                .search({study: this.opencgaSession.study.fqn, limit: 1})
                .then(response => {
                    this.param = response.responses[0]?.results[0]?.id;
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    // --- RENDER ---
    render() {
        // debugger
        return html`
            <div id="#tool-settings-preview">
                ${this.map[this.tool].render(this.settings)}
            </div>
        `;
    }

    // --- DEFAULT CONFIG ---
    getDefaultConfig() {
    }

}

customElements.define("tool-settings-preview", ToolSettingsPreview);

