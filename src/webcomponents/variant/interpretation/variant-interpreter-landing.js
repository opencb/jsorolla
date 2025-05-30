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
import UtilsNew from "../../../core/utils-new.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import {guardPage} from "../../commons/html-utils.js";
import "../../clinical/clinical-analysis-update.js";
import "../../clinical/interpretation/clinical-interpretation-manager.js";
import "../../clinical/clinical-analysis-consent-editor.js";
import "../../clinical/clinical-analysis-audit-browser.js";
import "../../clinical/clinical-analysis-summary.js";
import "../../project/project-cellbase-info.js";
import "../../commons/view/detail-tabs.js";
import "../../individual/individual-summary.js";
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
        if (changedProperties.has("config")) {
            this._config.items = UtilsNew.mergeArray(this._config.items, this.config.tabs, false, true);
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
            return guardPage();
        }

        // Check if clinicalAnalysis is not available yet
        if (!this.clinicalAnalysis) {
            return html`
                <div style="margin-top:48px">
                    <loading-spinner></loading-spinner>
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
        return {
            display: {
                align: "center",
                classes: "justify-content-center"
            },
            items: [
                {
                    id: "general",
                    name: "Case Manager",
                    active: true,
                    render: (clinicalAnalysis, active, opencgaSession) => {
                        const displayConfig = {
                            width: 8,
                            modalButtonClassName: "btn-light btn-sm",
                            titleVisible: false,
                        };
                        return html`
                            <div class="col-md-10 offset-md-1">
                                <tool-header title="Case Manager - ${clinicalAnalysis?.id ?? ""}"></tool-header>
                                <clinical-analysis-update
                                    .clinicalAnalysisId="${clinicalAnalysis?.id}"
                                    .opencgaSession="${opencgaSession}"
                                    .displayConfig="${displayConfig}"
                                    @clinicalAnalysisUpdate="${this.onClinicalAnalysisUpdate}">
                                </clinical-analysis-update>
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
                            <div class="col-md-10 offset-md-1">
                                <tool-header title="Interpretation Manager"></tool-header>
                                <clinical-interpretation-manager
                                    .clinicalAnalysis="${clinicalAnalysis}"
                                    .opencgaSession="${opencgaSession}"
                                    @clinicalAnalysisUpdate="${this.onClinicalAnalysisUpdate}">
                                </clinical-interpretation-manager>
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
                            <div class="col-md-10 offset-md-1">
                                <tool-header title="Clinical Data"></tool-header>
                                <individual-summary
                                    .individual="${clinicalAnalysis.proband}"
                                    .opencgaSession="${opencgaSession}">
                                </individual-summary>
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
                            <div class="col-md-10 offset-md-1">
                                <tool-header title="CellBase Info"></tool-header>
                                <project-cellbase-info
                                    .projects="${opencgaSession.project}"
                                    .opencgaSession="${opencgaSession}">
                                </project-cellbase-info>
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
                            <div class="col-md-10 offset-md-1">
                                <tool-header title="Consent - ${clinicalAnalysis?.proband.id || ""}"></tool-header>
                                <clinical-analysis-consent-editor
                                    .clinicalAnalysis="${clinicalAnalysis}"
                                    .opencgaSession="${opencgaSession}">
                                </clinical-analysis-consent-editor>
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
                            <div class="col-md-10 offset-md-1">
                                <tool-header title="Audit Log"></tool-header>
                                <clinical-analysis-audit-browser
                                    .clinicalAnalysis="${clinicalAnalysis}"
                                    .opencgaSession="${opencgaSession}"
                                    .active="${active}">
                                </clinical-analysis-audit-browser>
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
                            <div class="col-md-10 offset-md-1">
                                <tool-header title="Case Summary - ${clinicalAnalysis?.id || ""}"></tool-header>
                                <clinical-analysis-summary
                                    .clinicalAnalysis="${clinicalAnalysis}"
                                    .active="${active}"
                                    .opencgaSession="${opencgaSession}">
                                </clinical-analysis-summary>
                            </div>
                        `;
                    }
                },
            ],
        };
    }

}

customElements.define("variant-interpreter-landing", VariantInterpreterLanding);
