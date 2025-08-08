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

import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../core/utils-new.js";
import "../commons/forms/data-form.js";

class ClinicalAnalysisConsents extends LitElement {

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
            config: {
                type: Object
            }
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this.updateParams = {};
        this._config = this.getDefaultConfig();
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }

        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
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

    opencgaSessionObserver() {
        this._users = [];
        if (this.opencgaSession && this.opencgaSession.study) {
            for (let group of this.opencgaSession.study.groups) {
                if (group.id === "@members") {
                    this._users.push(...group.userIds.filter(user => user !== "*"));
                }
            }
        }
    }

    clinicalAnalysisObserver() {
        if (this.opencgaSession && this.clinicalAnalysis) {
            this._clinicalAnalysis = JSON.parse(JSON.stringify(this.clinicalAnalysis));
        }
    }

    clinicalAnalysisIdObserver() {
        if (this.opencgaSession && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis = response.responses[0].results[0];
                    this.clinicalAnalysisObserver();
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    onFieldChange(e) {
        switch (e.detail.param) {
            case "consent.primaryFindings":
            case "consent.secondaryFindings":
            case "consent.carrierFindings":
            case "consent.researchFindings":
                let field = e.detail.param.split(".")[1];
                this.updateParams.consent = {...this.clinicalAnalysis.consent};
                if (this._clinicalAnalysis?.consent[field] !== e.detail.value && e.detail.value) {
                    this.clinicalAnalysis.consent[field] = e.detail.value;
                    this.updateParams.consent[field] = e.detail.value;
                } else {
                    delete this.updateParams.consent[field];
                }
                if (UtilsNew.isEmpty(this.updateParams.consent)) {
                    delete this.updateParams.consent;
                }
                break;
        }
        this.requestUpdate();
    }

    onRun() {
        if (this.updateParams && UtilsNew.isNotEmpty(this.updateParams)) {
            this.opencgaSession.opencgaClient.clinical().update(this.clinicalAnalysis.id, this.updateParams, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this._clinicalAnalysis = JSON.parse(JSON.stringify(this.clinicalAnalysis));
                    this.updateParams = {};
                })
                .catch(response => {
                    console.error("An error occurred updating clinicalAnalysis: ", response);
                });
        }
    }

    render() {
        if (!this.opencgaSession || !this.clinicalAnalysis) {
            return nothing;
        }

        return html`
            <data-form 
                .data="${this.clinicalAnalysis}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @submit="${this.onRun}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            id: "clinical-analysis-consent",
            title: "Consent Editor",
            icon: "fas fa-user-md",
            type: "form",
            buttons: {
                show: true,
                clearText: "Clear",
                okText: "Save"
            },
            display: {
                width: "6",
                showTitle: false,
                infoIcon: "",
                labelAlign: "left",
                labelWidth: "3",
                defaultLayout: "horizontal",
            },
            sections: [
                {
                    id: "consent",
                    title: "Consent Management",
                    elements: [
                        {
                            name: "Primary Findings",
                            field: "consent.primaryFindings",
                            type: "toggle-buttons",
                            allowedValues: ["YES", "NO", "UNKNOWN"],
                            display: {
                                width: "9",
                            }
                        },
                        {
                            name: "Secondary Findings",
                            field: "consent.secondaryFindings",
                            type: "toggle-buttons",
                            allowedValues: ["YES", "NO", "UNKNOWN"],
                            display: {
                                width: "9",
                            }
                        },
                        {
                            name: "Carrier Findings",
                            field: "consent.carrierFindings",
                            type: "toggle-buttons",
                            allowedValues: ["YES", "NO", "UNKNOWN"],
                            display: {
                                width: "9",
                            }
                        },
                        {
                            name: "Research Findings",
                            field: "consent.researchFindings",
                            type: "toggle-buttons",
                            allowedValues: ["YES", "NO", "UNKNOWN"],
                            display: {
                                width: "9",
                            }
                        },
                    ]
                },
            ],
        };
    }

}

customElements.define("clinical-analysis-consents", ClinicalAnalysisConsents);
