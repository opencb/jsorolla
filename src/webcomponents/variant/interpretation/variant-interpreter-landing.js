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
import WebUtils from "../../commons/utils/web-utils";
import LitUtils from "../../commons/utils/lit-utils.js";
import "../../clinical/clinical-analysis-update.js";
import "../../clinical/interpretation/clinical-interpretation-manager.js";
import "../../clinical/clinical-analysis-consent-editor.js";
import "../../clinical/clinical-analysis-audit-browser.js";
import "../../clinical/clinical-analysis-view.js";
import "../../project/project-cellbase-info.js";
import "../../commons/view/detail-tabs.js";
import "../../individual/individual-view.js";
import "../../loading-spinner.js";

class VariantInterpreterLanding extends LitElement {

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
            clinicalAnalysis: {
                type: Object
            },
            opencgaSession: {
                type: Object
            },
            // clinicalAnalysisId: {
            //     type: String
            // },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        // if (changedProperties.has("opencgaSession")) {
        //     this.writeMode = OpencgaCatalogUtils.checkPermissions(this.opencgaSession.study, this.opencgaSession.user.id, "WRITE_CLINICAL_ANALYSIS");
        // }

        if (changedProperties.has("config")) {
            this._config.items = WebUtils.mergeArray(this._config.items, this.config.tabs, false, true);
        }

        // this._config = this.getDefaultConfig();
        super.update(changedProperties);
    }

    onClinicalAnalysisUpdate(e) {
        LitUtils.dispatchCustomEvent(
            this,
            "clinicalAnalysisUpdate",
            null,
            {clinicalAnalysis: e.detail.clinicalAnalysis},
            null);
    }

    render() {
        // Check if project exists
        if (!this.opencgaSession?.project) {
            return html`
                <div class="guard-page">
                    <i class="fas fa-lock fa-5x"></i>
                    <h3>No public projects available to browse. Please login to continue.</h3>
                </div>
            `;
        }

        // Check if clinicalAnalysis is not available yet
        if (!this.clinicalAnalysis) {
            return html`
                <div style="margin-top:48px">
                    <loading-spinner></loading-spinner>
                </div>
            `;
        }

        // Check if we have permissions to edit a clinical analysis
        /* if (!OpencgaCatalogUtils.checkPermissions(this.opencgaSession.study, this.opencgaSession.user.id, "WRITE_CLINICAL_ANALYSIS")) {
            return html`
                <div class="guard-page">
                    <i class="fas fa-lock fa-5x"></i>
                    <h3>You do not have permissions to edit this case.</h3>
                </div>
            `;
        } */

        return html`
            <detail-tabs
                .data="${this.clinicalAnalysis}"
                .config="${this._config}"
                .opencgaSession="${this.opencgaSession}">
            </detail-tabs>
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                align: "center",
            },
            items: [
                {
                    id: "general",
                    name: "Case Manager",
                    active: true,
                    render: (clinicalAnalysis, active, opencgaSession) => {
                        const displayConfig = {
                            width: 8,
                            modalButtonClassName: "btn-default btn-sm",
                            buttonsLayout: "upper",
                            type: "tabs",
                        };

                        return html`
                            <div class="col-md-10 col-md-offset-1">
                                <tool-header title="Case Manager - ${clinicalAnalysis?.id ?? ""}" class="bg-white"></tool-header>
                                <div style="padding: 0 20px">
                                    <clinical-analysis-update
                                        .clinicalAnalysisId="${clinicalAnalysis?.id}"
                                        .opencgaSession="${opencgaSession}"
                                        .displayConfig="${displayConfig}"
                                        @clinicalAnalysisUpdate="${this.onClinicalAnalysisUpdate}">
                                    </clinical-analysis-update>
                                </div>
                            </div>
                        `;
                    }
                },
                {
                    id: "interpretations",
                    name: "Interpretation Manager",
                    active: false,
                    render: (clinicalAnalysis, active, opencgaSession) => {
                        return html`
                            <div class="col-md-10 col-md-offset-1">
                                <tool-header title="Interpretation Manager" class="bg-white"></tool-header>
                                <div style="padding: 0 20px">
                                    <clinical-interpretation-manager
                                        .clinicalAnalysis="${clinicalAnalysis}"
                                        .opencgaSession="${opencgaSession}"
                                        @clinicalAnalysisUpdate="${this.onClinicalAnalysisUpdate}">
                                    </clinical-interpretation-manager>
                                </div>
                            </div>
                        `;
                    }
                },
                {
                    id: "clinical",
                    name: "Clinical Data",
                    active: false,
                    render: (clinicalAnalysis, active, opencgaSession) => {
                        return html`
                            <div class="col-md-10 col-md-offset-1">
                                <tool-header title="Clinical Data" class="bg-white"></tool-header>
                                <div style="padding: 0 20px">
                                    <individual-view
                                        .individual="${clinicalAnalysis.proband}"
                                        .opencgaSession="${opencgaSession}">
                                    </individual-view>
                                </div>
                            </div>
                        `;
                    }
                },
                {
                    id: "cellbase",
                    name: "CellBase Variant Annotation",
                    active: false,
                    render: (clinicalAnalysis, active, opencgaSession) => {
                        return html`
                            <div class="col-md-10 col-md-offset-1">
                                <tool-header title="CellBase Info" class="bg-white"></tool-header>
                                <div style="padding: 0 20px">
                                    <project-cellbase-info
                                        .projects="${opencgaSession.project}"
                                        .opencgaSession="${opencgaSession}">
                                    </project-cellbase-info>
                                </div>
                            </div>
                        `;
                    }
                },
                {
                    id: "consent",
                    name: "Consent",
                    active: false,
                    render: (clinicalAnalysis, active, opencgaSession) => {
                        return html`
                            <div class="col-md-10 col-md-offset-1">
                                <tool-header title="Consent - ${clinicalAnalysis?.proband.id || ""}" class="bg-white"></tool-header>
                                <div style="padding: 0 20px">
                                    <clinical-analysis-consent-editor
                                        .clinicalAnalysis="${clinicalAnalysis}"
                                        .opencgaSession="${opencgaSession}">
                                    </clinical-analysis-consent-editor>
                                </div>
                            </div>
                        `;
                    }
                },
                {
                    id: "audit",
                    name: "Audit",
                    active: false,
                    render: (clinicalAnalysis, active, opencgaSession) => {
                        return html`
                            <div class="col-md-10 col-md-offset-1">
                                <tool-header title="Audit Log" class="bg-white"></tool-header>
                                <div style="padding: 0 20px">
                                    <clinical-analysis-audit-browser
                                        .clinicalAnalysis="${clinicalAnalysis}"
                                        .opencgaSession="${opencgaSession}"
                                        .active="${active}">
                                    </clinical-analysis-audit-browser>
                                </div>
                            </div>
                        `;
                    }
                },
                {
                    id: "overview",
                    name: "Overview",
                    active: false,
                    render: (clinicalAnalysis, active, opencgaSession) => {
                        return html`
                            <div class="col-md-10 col-md-offset-1">
                                <tool-header title="Case Summary - ${clinicalAnalysis?.id || ""}" class="bg-white"></tool-header>
                                <div style="padding: 0 20px">
                                    <clinical-analysis-view
                                        .settings="${this._config.items?.find(el => el.id === "overview")?.settings}"
                                        .clinicalAnalysis="${clinicalAnalysis}"
                                        .opencgaSession="${opencgaSession}">
                                    </clinical-analysis-view>
                                </div>
                            </div>
                        `;
                    }
                },
            ],
        };
    }

}

customElements.define("variant-interpreter-landing", VariantInterpreterLanding);
