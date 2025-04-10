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
import {classMap} from "lit/directives/class-map.js";
import ClinicalAnalysisManager from "../clinical-analysis-manager.js";
import UtilsNew from "../../../core/utils-new.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import "./clinical-interpretation-summary.js";
import "./clinical-interpretation-create.js";
import "./clinical-interpretation-update.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";

export default class ClinicalInterpretationManager extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            clinicalAnalysis: {
                type: Object
            },
            clinicalAnalysisId: {
                type: String
            },
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this._config = this.getDefaultConfig();
        this.clinicalAnalysisManager = null;
    }

    update(changedProperties) {
        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }
        if (changedProperties.has("opencgaSession") || changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
            this.clinicalAnalysisManager = new ClinicalAnalysisManager(this, this.clinicalAnalysis, this.opencgaSession);
        }
        super.update(changedProperties);
    }

    clinicalAnalysisIdObserver() {
        if (this.opencgaSession && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical()
                .info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis = response.responses[0].results[0];
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    renderInterpretation(interpretation, primary) {
        const locked = interpretation?.locked;
        const interpretationTitle = interpretation.locked ?
            html`<i class="fas fa-lock"></i> Interpretation #${interpretation.id.split(".")[1]} - ${interpretation.id}`:
            html`Interpretation #${interpretation.id.split(".")[1]} - ${interpretation.id}`;

        const editInterpretationTitle = `Edit Interpretation #${interpretation.id.split(".")[1]}: ${interpretation.id}`;

        return html`
            <div class="d-flex pb-1">
                <div class="me-auto">
                    <h5 class="fw-bold">
                        ${interpretationTitle}
                    </h5>
                </div>
                <div class="${classMap({primary: primary})}">
                    <div class="d-flex gap-2">
                        <clinical-interpretation-update
                            .clinicalInterpretation="${interpretation}"
                            .clinicalAnalysis="${this.clinicalAnalysis}"
                            .opencgaSession="${this.opencgaSession}"
                            .mode="${"modal"}"
                            .displayConfig="${
                                {
                                    modalSize: "modal-lg",
                                    buttonClearText: "Cancel",
                                    buttonOkText: "Update",
                                    modalButtonClassName: "btn-light",
                                    modalDisabled: this.clinicalAnalysis.locked || interpretation.locked,
                                    modalTitle: editInterpretationTitle,
                                    modalButtonName: "Edit Interpretation",
                                    modalButtonIcon: "fas fa-solid fa-file-medical",
                                    modalButtonsVisible: false,
                                    type: "tabs",
                                    buttonsLayout: "upper",
                                }
                            }"
                            @clinicalInterpretationUpdate="${this.onClinicalInterpretationUpdate}">
                        </clinical-interpretation-update>

                        <div class="dropdown">
                            <button class="btn btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown" ?disabled="${this.clinicalAnalysis.locked}">
                                <i class="fas fa-toolbox pe-1"></i>
                                Actions
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                ${this.renderItemAction(interpretation, "download", "fa-download", "Download JSON")}
                                <li><hr class="dropdown-divider"></li>
                                ${!primary ? html`
                                    ${this.renderItemAction(interpretation, "setAsPrimary", "fa-map-marker", "Set as primary")}
                                ` : nothing}
                                ${this.renderItemAction(interpretation, locked ? "unlock" : "lock", locked ? "fa-unlock" : "fa-lock", locked ? "Unlock" : "Lock")}
                                <li><hr class="dropdown-divider"></li>
                                ${this.renderItemAction(interpretation, "clear", "fa-eraser", "Clear")}
                                ${this.renderItemAction(interpretation, "delete", "fa-trash", "Delete", primary)}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <clinical-interpretation-summary
                .interpretation="${interpretation}"
                .primary="${primary}">
            </clinical-interpretation-summary>
        `;
    }

    renderItemAction(interpretation, action, icon, name, defaultDisabled = false) {
        const disabled = defaultDisabled || (interpretation?.locked && ((action !== "unlock") && (action !== "setAsPrimary")));
        return html`
            <li>
                <a
                    class="${`dropdown-item ${disabled ? "disabled" : ""}`}"
                    ?disabled="${disabled}"
                    data-action="${action}"
                    data-interpretation-id="${interpretation.id}"
                    data-islocked="${interpretation.locked}"
                    style="cursor:pointer;"
                    @click="${this.onActionClick}">
                    <i class="fas ${icon} me-1" aria-hidden="true"></i> ${name}
                </a>
            </li>
        `;
    }

    onActionClick(e) {
        e.preventDefault();
        const {action, interpretationId, islocked} = e.currentTarget.dataset;
        const interpretationCallback = () => {
            this.onClinicalInterpretationUpdate();
        };

        // Only some actions are allowed when the interpretation is locked: unclock, set as primary, and download
        if (islocked === "true" && ((action !== "unlock") && (action !== "setAsPrimary") && (action !== "download"))) {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_WARNING, {
                message: `${interpretationId} is locked!`,
            });
        } else {
            switch (action) {
                case "setAsPrimary":
                    this.clinicalAnalysisManager.setInterpretationAsPrimary(interpretationId, interpretationCallback);
                    break;
                case "clear":
                    this.clinicalAnalysisManager.clearInterpretation(interpretationId, interpretationCallback);
                    break;
                case "delete":
                    this.clinicalAnalysisManager.deleteInterpretation(interpretationId, interpretationCallback);
                    break;
                case "lock":
                    this.clinicalAnalysisManager.lockInterpretation(interpretationId, interpretationCallback);
                    break;
                case "unlock":
                    this.clinicalAnalysisManager.unLockInterpretation(interpretationId, interpretationCallback);
                    break;
                case "download":
                    this.clinicalAnalysisManager.downloadInterpretation(interpretationId);
                    break;
            }
        }
    }

    onClinicalInterpretationUpdate() {
        LitUtils.dispatchCustomEvent(this, "clinicalAnalysisUpdate", null, {
            clinicalAnalysis: this.clinicalAnalysis,
        });
    }

    render() {
        if (!this.clinicalAnalysis?.interpretation) {
            return html`
                <div class="alert alert-info"><i class="fas fa-3x fa-info-circle align-middle"></i>
                    No primary interpretation available.
                </div>
            `;
        }

        return html`
            <div class="interpreter-content-tab">
                <div class="row">
                    <div class="col-md-8 mb-3">
                        <h3 style="pb-2">Interpretations</h3>
                        <div class="float-end">
                            <clinical-interpretation-create
                                .clinicalAnalysis="${this.clinicalAnalysis}"
                                .opencgaSession="${this.opencgaSession}"
                                .mode="${"modal"}"
                                .displayConfig="${{
                                    modalSize: "modal-lg",
                                    modalButtonClassName: "btn-primary",
                                    modalButtonName: "Create Interpretation",
                                    modalTitle: "Create Interpretation",
                                    modalButtonIcon: "fas fa-solid fa-file-medical",
                                    buttonClearText: "Cancel",
                                    modalDisabled: this.clinicalAnalysis.locked,
                                    modalButtonsVisible: false,
                                    type: "tabs", buttonsLayout: "upper"
                                }}">
                            </clinical-interpretation-create>
                        </div>
                    </div>

                    <div class="col-md-8 mb-3">
                        <h4>Primary Interpretation</h4>
                        ${this.renderInterpretation(this.clinicalAnalysis.interpretation, true)}
                    </div>

                    <div class="col-md-8 mb-3">
                        <h4>Secondary Interpretations</h4>
                        ${this.clinicalAnalysis?.secondaryInterpretations?.length > 0 ? html`
                            ${this.clinicalAnalysis.secondaryInterpretations.map(interpretation => html`
                                <div style="margin-bottom:16px">
                                    ${this.renderInterpretation(interpretation, false)}
                                </div>
                            `)}
                        ` : html`
                            <label>No secondary interpretations found</label>
                        `}
                    </div>
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {};
    }

}

customElements.define("clinical-interpretation-manager", ClinicalInterpretationManager);
