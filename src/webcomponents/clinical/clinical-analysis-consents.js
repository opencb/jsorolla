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
        // switch (e.detail.param) {
        //     case "consent.primaryFindings":
        //     case "consent.secondaryFindings":
        //     case "consent.carrierFindings":
        //     case "consent.researchFindings":
        //         let field = e.detail.param.split(".")[1];
        //         this.updateParams.consent = {...this.clinicalAnalysis.consent};
        //         if (this._clinicalAnalysis?.consent[field] !== e.detail.value && e.detail.value) {
        //             this.clinicalAnalysis.consent[field] = e.detail.value;
        //             this.updateParams.consent[field] = e.detail.value;
        //         } else {
        //             delete this.updateParams.consent[field];
        //         }
        //         if (UtilsNew.isEmpty(this.updateParams.consent)) {
        //             delete this.updateParams.consent;
        //         }
        //         break;
        // }
        // this.requestUpdate();
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
                defaultLayout: "horizontal",
                ...this.displayConfig,
            },
            sections: [
                {
                    elements: consents.map(consent => ({
                        name: consent.name,
                        description: consent.description || "",
                        field: consent.id,
                        type: "toggle-buttons",
                        allowedValues: ["YES", "NO", "UNKNOWN"],
                        display: {},
                    })),
                },
            ],
        };
    }

}

customElements.define("clinical-analysis-consents", ClinicalAnalysisConsents);
