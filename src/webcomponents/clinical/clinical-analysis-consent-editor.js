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
import UtilsNew from "../../core/utils-new.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter.js";
import "../commons/forms/data-form.js";
import "../commons/forms/text-field-filter.js";


class ClinicalAnalysisConsentEditor extends LitElement {

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
        this.updateParams = {};
    }

    connectedCallback() {
        super.connectedCallback();

        this.updateParams = {};
        this._config = {...this.getDefaultConfig(), ...this.config};
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
            this._config = {...this.getDefaultConfig(), ...this.config};
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
            // this.requestUpdate();
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
            execute: (opencgaSession, clinicalAnalysis, params) => {
            },
            result: {
                render: job => {
                }
            }
        };
    }

    onRun(e) {
        if (this.updateParams && UtilsNew.isNotEmpty(this.updateParams)) {
            this.opencgaSession.opencgaClient.clinical().update(this.clinicalAnalysis.id, this.updateParams, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    console.log(response);
                    this._clinicalAnalysis = JSON.parse(JSON.stringify(this.clinicalAnalysis));
                    this.updateParams = {};
                    Swal.fire({
                        title: "Success",
                        icon: "success",
                        html: "Case info updated succesfully"
                    });
                })
                .catch(response => {
                    console.error("An error occurred updating clinicalAnalysis: ", response);
                });
        }
    }

    render() {
        if (!this.clinicalAnalysis) {
            return "";
        }

        return html`
            <data-form  .data="${this.clinicalAnalysis}"
                        .config="${this._config}"
                        @fieldChange="${e => this.onFieldChange(e)}"
                        @clear="${this.onClear}"
                        @submit="${this.onRun}">
            </data-form>
        `;
    }

}

customElements.define("clinical-analysis-consent-editor", ClinicalAnalysisConsentEditor);
