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
import LitUtils from "../commons/utils/lit-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
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
                type: Object,
            },
            clinicalAnalysis: {
                type: Object,
            },
            displayConfig: {
                type: Object,
            },
            active: {
                type: Boolean,
            },
        };
    }

    #init() {
        this._consents = {};
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }

        if (changedProperties.has("opencgaSession") || changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    clinicalAnalysisObserver() {
        this._consents = {}; // Reset consents
        if (this.clinicalAnalysis) {
            // we have to conver the array of consents to an object, where the key is the consent id
            // and the value is the consent value (YES, NO, UNKNOWN)
            this._consents = Object.fromEntries((this.clinicalAnalysis.consent?.consents || []).map(consent => {
                return [consent.id, consent.value || "UNKNOWN"];
            }));
        }
    }

    onFieldChange() {
        this._consents = {...this._consents};
        this.requestUpdate();
    }

    onSubmit() {
        // we have to convert the consents object back to an array
        const data = {
            consent: {
                consents: this.opencgaSession.study.internal.configuration.clinical.consents.map(consent => {
                    return {
                        id: consent.id,
                        value: this._consents[consent.id] || "UNKNOWN", // Default to "UNKNOWN" if not set
                    };
                }),
            },
        };

        this.opencgaSession.opencgaClient.clinical()
            .update(this.clinicalAnalysis.id, data, {
                study: this.opencgaSession.study.fqn,
            })
            .then(response => {
                // dispatch the clinicalAnalysisUpdate event with the updated clinical analysis
                LitUtils.dispatchCustomEvent(this, "clinicalAnalysisUpdate", null, {
                    clinicalAnalysis: response.responses[0].results[0],
                });
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    message: "Case consents updated successfully.",
                });
            })
            .catch(response => {
                console.error(response);
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            });
    }

    render() {
        if (!this.opencgaSession || !this.clinicalAnalysis) {
            return nothing;
        }

        return html`
            <data-form 
                .data="${this._consents}"
                .config="${this._config}"
                @fieldChange="${event => this.onFieldChange(event)}"
                @submit="${event => this.onSubmit(event)}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        const consents = this.opencgaSession?.study?.internal?.configuration?.clinical?.consents || [];
        return {
            display: {
                buttonsVisible: true,
                buttonOkText: "Save Consents",
                buttonClearText: "",
                defaultLayout: "horizontal",
                ...this.displayConfig,
            },
            sections: consents.map(consent => ({
                display: {
                    className: "d-flex align-items-center justify-content-between gap-4 p-3 rounded-2 bg-white border border-gray-200",
                    layout: [
                        {
                            className: "flex-grow-1 d-flex flex-column gap-0",
                            elements: [
                                {id: "title"},
                                {id: "description"},
                            ],
                        },
                        {
                            className: "flex-shrink-0",
                            id: "buttons",
                        },
                    ],
                },
                elements: [
                    {
                        id: "title",
                        text: consent.name,
                        type: "text",
                        display: {
                            textClassName: "fw-bold",
                            separationClassName: "mb-0",
                        },
                    },
                    {
                        id: "description",
                        text: consent.description || "",
                        type: "text",
                        display: {
                            textClassName: "text-secondary",
                            separationClassName: "mb-0",
                            visible: !!consent.description,
                        },
                    },
                    {
                        id: "buttons",
                        field: consent.id,
                        type: "toggle-buttons",
                        allowedValues: ["YES", "NO", "UNKNOWN"],
                        display: {
                            separationClassName: "mb-0",
                        },
                    },
                ],
            })),
        };
    }

}

customElements.define("clinical-analysis-consents", ClinicalAnalysisConsents);
