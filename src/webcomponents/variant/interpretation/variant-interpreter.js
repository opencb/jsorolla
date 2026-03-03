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
import UtilsNew from "../../../core/utils-new.js";
import WebUtils from "../../commons/utils/web-utils.js";
import ClinicalAnalysisManager from "../../clinical/clinical-analysis-manager.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";
import ModalUtils from "../../commons/modal/modal-utils.js";
import ExtensionsManager from "../../extensions-manager.js";
import {guardPage} from "../../commons/html-utils.js";
import "../../commons/tool-header.js";
import "./variant-interpreter-qc.js";
import "./variant-interpreter-browser.js";
import "./variant-interpreter-browser-rd.js";
import "./variant-interpreter-browser-cancer.js";
import "./variant-interpreter-methods.js";
import "../../commons/opencga-active-filters.js";
import "../../download-button.js";
import "../../loading-spinner.js";
import "../../clinical/clinical-analysis-info.js"
import "../../clinical/clinical-analysis-view.js";
import "../../clinical/interpretation/clinical-interpretation-update.js";
import "../../clinical/report/clinical-report.js";

class VariantInterpreter extends LitElement {

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
            cellbaseClient: {
                type: Object
            },
            activeTool: {
                type: String,
            },
            settings: {
                type: Object
            }
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this.clinicalAnalysisManager = null;

        this._activeModal = null;
        this._config = this.getDefaultConfig();
        this.#updateInterpreterTools();
    }

    update(changedProperties) {
        if (changedProperties.has("settings")) {
            this.settingsObserver();
        }

        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }

        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }

        super.update(changedProperties);
    }

    settingsObserver() {
        // 1. Restore configuration from default config
        this._config = this.getDefaultConfig();

        // 2. Merge with interpreter tools from extensions
        this.#updateInterpreterTools();

        // 3. Use settings to decide which tools are visible
        // IMPORTANT: we have to rename the 'select' tool to 'info' in the settings, as the 'select' does not exist anymore
        // this should be performed by a migration script, but in the meantime we have to do it here to avoid breaking changes
        if (this.settings?.tools) {
            this.settings.tools.forEach(tool => {
                if (tool.id === "select") {
                    tool.id = "info";
                }
            });
        }
        this._config.tools = UtilsNew.mergeArray(this._config.tools, this.settings?.tools, false, true);
    }

    clinicalAnalysisIdObserver() {
        if (this.opencgaSession?.opencgaClient && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical()
                .info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis = response.responses[0].results[0];
                })
                .catch(response => {
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                });
        } else {
            this.clinicalAnalysis = null;
        }
    }

    clinicalAnalysisObserver() {
        if (this.clinicalAnalysis) {
            this.clinicalAnalysisManager = new ClinicalAnalysisManager(this, this.clinicalAnalysis, this.opencgaSession);
        }
    }

    getActiveToolId() {
        return this.activeTool || this._config?.tools?.[0]?.id || "";
    }

    #updateInterpreterTools() {
        this._config.tools = ExtensionsManager.injectInterpretationTools(this._config.tools);
    }

    onClinicalAnalysisUpdate() {
        return this.opencgaSession.opencgaClient.clinical()
            .info(this.clinicalAnalysis.id, {
                study: this.opencgaSession.study.fqn,
            })
            .then(response => {
                this.clinicalAnalysis = response.responses[0].results[0];
            });
    }

    onClinicalAnalysis(e) {
        this.clinicalAnalysis = e.detail.clinicalAnalysis;
        this.requestUpdate();
    }

    onClinicalAnalysisDownload = () => {
        UtilsNew.downloadJSON(this.clinicalAnalysis,
            `variant_interpreter_CASE_${this.opencgaSession?.study?.id}_${this.clinicalAnalysis?.id}_${this.clinicalAnalysis?.interpretation?.id ?? ""}_${UtilsNew.dateFormatter(new Date(), "YYYYMMDDhhmm")}` + ".json");
    }

    onClinicalAnalysisRefresh = () => {
        this.onClinicalAnalysisUpdate()
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_INFO, {
                    message: "Clinical analysis refreshed",
                });
            });
    }

    onClinicalAnalysisLock = () => {
        const id = this.clinicalAnalysis.id;
        const updateParams = {
            locked: !this.clinicalAnalysis.locked,
        };

        return this.opencgaSession.opencgaClient.clinical()
            .update(id, updateParams, {study: this.opencgaSession.study.fqn})
            .then(() => this.onClinicalAnalysisUpdate())
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    message: `Case '${id}' has been ${updateParams.locked ? "locked" : "unlocked"}.`,
                });
            })
            .catch(response => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            });
    };

    onClinicalAnalysisView() {
        this._activeModal = "view-clinical-analysis";
        this.requestUpdate();
        this.updateComplete.then(() => {
            ModalUtils.show(`${this._prefix}ClinicalAnalysisViewModal`);
        });
    }

    onChangePrimaryInterpretation = e => {
        const interpretationId = e.currentTarget.dataset.id;
        this.clinicalAnalysisManager.setInterpretationAsPrimary(interpretationId, () => {
            this.onClinicalAnalysisUpdate();
        });
    }

    onInterpreationEdit() {
        this._activeModal = "update-interpretation";
        this.requestUpdate();
        this.updateComplete.then(() => {
            ModalUtils.show(`${this._prefix}InterpretationUpdateModal`);
        });
    }

    onInterpretationLock() {
        const updateParams = {
            locked: !this.clinicalAnalysis.interpretation.locked,
        };
        this.opencgaSession.opencgaClient.clinical()
            .updateInterpretation(this.clinicalAnalysis.id, this.clinicalAnalysis.interpretation.id, updateParams, {
                study: this.opencgaSession.study.fqn,
            })
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    message: `Interpretation '${this.clinicalAnalysis.interpretation.id}' has been ${updateParams.locked ? "locked" : "unlocked"}.`,
                });
                this.onClinicalAnalysisUpdate();
            })
            .catch(error => {
                console.error(error);
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
            });
    }

    renderTool(tool) {
        if (this.getActiveToolId() === tool.id) {
            switch (tool.id) {
                case "select":
                case "info":
                    return html`
                        <clinical-analysis-info
                            .opencgaSession="${this.opencgaSession}"
                            .clinicalAnalysis="${this.clinicalAnalysis}"
                            .config="${tool}"
                            @clinicalAnalysisUpdate="${this.onClinicalAnalysisUpdate}"
                            @selectClinicalAnalysis="${this.onClinicalAnalysis}">
                        </clinical-analysis-info>
                    `;
                case "qc":
                    return html`
                        <variant-interpreter-qc
                            .opencgaSession="${this.opencgaSession}"
                            .cellbaseClient="${this.cellbaseClient}"
                            .clinicalAnalysis="${this.clinicalAnalysis}"
                            .settings="${tool}"
                            @clinicalAnalysisUpdate="${this.onClinicalAnalysisUpdate}">
                        </variant-interpreter-qc>
                    `;
                case "custom-analysis":
                    return html`
                        <div class="col-md-6 offset-md-3 p-4">
                            <div class="alert alert-warning" role="alert">
                                No custom analysis available at this time.
                            </div>
                        </div>
                    `;
                case "methods":
                    return html`
                        <variant-interpreter-methods
                            .opencgaSession="${this.opencgaSession}"
                            .clinicalAnalysis="${this.clinicalAnalysis}"
                            .settings="${tool}">
                        </variant-interpreter-methods>
                    `;
                case "variant-browser":
                    return html`
                        <variant-interpreter-browser
                            .opencgaSession="${this.opencgaSession}"
                            .clinicalAnalysis="${this.clinicalAnalysis}"
                            .settings="${tool}"
                            @clinicalAnalysisUpdate="${this.onClinicalAnalysisUpdate}">
                        </variant-interpreter-browser>
                    `;
                case "report":
                    return html`
                        <clinical-report
                            .opencgaSession="${this.opencgaSession}"
                            .clinicalAnalysis="${this.clinicalAnalysis}"
                            @clinicalAnalysisUpdate="${e => this.onClinicalAnalysisUpdate(e)}">
                        </clinical-report>
                    `;
                default:
                    // Check if a render function has been provided
                    if (typeof tool.render === "function") {
                        return tool.render({
                            opencgaSession: this.opencgaSession,
                            clinicalAnalysis: this.clinicalAnalysis,
                            config: tool,
                            onClinicalAnalysisUpdate: () => this.onClinicalAnalysisUpdate(),
                        });
                    }
            }
        }
        // This tool is not visible
        return null;
    }

    renderToolbarCenterContent() {
        const activeTool = this.getActiveToolId();
        const tools = [];
        (this._config?.tools || [])
            .filter(item => typeof item.visible === "undefined" || !!item.visible)
            .forEach((item, index) => {
                // add separator between this tool only if it is not the first one
                if (index > 0) {
                    tools.push(html`
                        <div class="bg-gray-200 flex-shrink-0" style="height:2px;width:32px;margin-top:19px;"></div>
                    `);
                }
                const active = activeTool === item.id;
                const url = WebUtils.getInterpreterLink(this.opencgaSession, {
                    id: this.clinicalAnalysis?.id || this.clinicalAnalysisId,
                    tool: item.id,
                });
                tools.push(html`
                    <a href="${url}" class="d-block w-full text-decoration-none" style="max-width:120px;">
                        <div class="d-flex flex-column align-items-center gap-1 ${active ? "text-primary": "text-secondary"} cursor-pointer w-full">
                            <div class="d-flex align-items-center justify-content-center ${active ? "bg-primary-subtle" : "bg-gray-100"} rounded-circle" style="width:40px;height:40px;">
                                <i class="${item.icon} fs-5"></i>
                            </div>
                            <div class="text-center small ${active ? "fw-bold" : ""}">${item.title}</div>
                        </div>
                    </a>
                `);
            });

        return html`
            <div class="d-flex align-items-center justify-content-center">
                <div class="d-flex flex-nowrap gap-0 align-items-start justify-content-center flex-shrink-0 w-full">
                    ${tools}
                </div>
            </div>
        `;
    }

    renderToolbarRightContent() {
        return html`
            <div class="d-flex align-items-center">
                ${this.clinicalAnalysis?.interpretation ? html`
                    <div class="d-flex flex-column align-items-center" style="margin-right:3rem;">
                        <div style="font-size:1.5rem" title="${this.clinicalAnalysis.interpretation.description}">
                            ${this.clinicalAnalysis.interpretation.locked ? html`<span class="fa fa-lock pe-1"></span>` : ""}
                            <strong>${WebUtils.getDisplayName(this.clinicalAnalysis.interpretation)}</strong>
                        </div>
                        ${this.clinicalAnalysis.interpretation?.method?.name ? html`
                            <div style="font-size:0.875em;">
                                <strong>${this.clinicalAnalysis.interpretation.method.name}</strong>
                            </div>
                        ` : nothing}
                        <div class="text-secondary">
                            Primary Findings: <strong>${this.clinicalAnalysis.interpretation?.primaryFindings?.length ?? 0}</strong>
                        </div>
                    </div>
                ` : nothing}
                <div class="dropdown">
                    <button class="btn btn-light btn-lg dropdown-toggle" data-bs-toggle="dropdown" type="button">
                        <i class="fas fa-toolbox" aria-hidden="true"></i>
                        <span style="margin-left:4px;margin-right:4px;font-weight:bold;">Actions</span>
                    </button>
                    <div class="dropdown-menu dropdown-menu-end">
                        <h6 class="dropdown-header">Interpretation Actions</h6>
                        <a class="dropdown-item cursor-pointer" @click="${() => this.onInterpreationEdit()}">
                            <i class="fas fa-edit pe-1"></i> Edit Interpretation
                        </a>
                        <a class="dropdown-item cursor-pointer" @click="${() => this.onInterpretationLock()}">
                            <i class="fas ${this.clinicalAnalysis?.interpretation?.locked ? "fa-unlock" : "fa-lock"} pe-1"></i>
                            ${this.clinicalAnalysis?.interpretation?.locked ? "Unlock" : "Lock"} Interpretation
                        </a>
                        ${this.clinicalAnalysis?.secondaryInterpretations?.length > 0 ? html`
                            <h6 class="dropdown-header">Set Primary Interpretation</h6>
                            ${this.clinicalAnalysis.secondaryInterpretations.map(item => html`
                                <a class="dropdown-item cursor-pointer" data-id="${item.id}" @click="${this.onChangePrimaryInterpretation}">
                                    <i class="fas ${item.locked ? "fa-lock" : "fa-unlock"} pe-1"></i>
                                    ${item.id}
                                </a>
                            `)}
                        ` : nothing}
                        <hr class="dropdown-divider">
                        <h6 class="dropdown-header">Case Actions</h6>
                        <a class="dropdown-item cursor-pointer" @click="${() => this.onClinicalAnalysisView()}">
                            <i class="fas fa-info-circle pe-1"></i>
                            <span>View Case</span>
                        </a>
                        <a class="dropdown-item cursor-pointer" @click="${this.onClinicalAnalysisLock}">
                            <i class="fas ${this.clinicalAnalysis?.locked ? "fa-unlock" : "fa-lock"} pe-1"></i>
                            ${this.clinicalAnalysis?.locked ? "Unlock" : "Lock"} Case
                        </a>
                        <a class="dropdown-item cursor-pointer" @click="${this.onClinicalAnalysisRefresh}">
                            <i class="fas fa-sync pe-1"></i> Refresh Case
                        </a>
                        <a class="dropdown-item cursor-pointer" @click="${this.onClinicalAnalysisDownload}">
                            <i class="fas fa-download pe-1"></i> Download Case
                        </a>
                        <hr class="dropdown-divider">
                        <a class="dropdown-item cursor-pointer" href="${WebUtils.getLink(this.opencgaSession, "clinical", "clinical-analysis-portal")}">
                            <i class="fas fa-sign-out-alt pe-1"></i> Exit Interpreter
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    renderInterpretationUpdateModal() {
        return ModalUtils.create(this, `${this._prefix}InterpretationUpdateModal`, {
            display: {
                modalTitle: `Update Interpretation ${this.clinicalAnalysis?.interpretation?.id}`,
                modalDraggable: false,
                modalSize: "modal-lg"
            },
            render: () => html`
                <clinical-interpretation-update
                    .clinicalInterpretation="${this.clinicalAnalysis?.interpretation}"
                    .clinicalAnalysis="${this.clinicalAnalysis}"
                    .opencgaSession="${this.opencgaSession}"
                    .displayConfig="${{
                        buttonClearText: "Cancel",
                        buttonOkText: "Update Interpretation",
                        buttonsLayout: "bottom",
                        type: "tabs",
                    }}"
                    @clinicalInterpretationUpdate="${() => this.onClinicalAnalysisUpdate()}">
                </clinical-interpretation-update>
            `,
        });
    }

    renderClinicalAnalysisViewModal() {
        return ModalUtils.create(this, `${this._prefix}ClinicalAnalysisViewModal`, {
            display: {
                modalTitle: `Clinical Analysis ${this.clinicalAnalysis?.id}`,
                modalDraggable: false,
                modalSize: "modal-3xl"
            },
            render: () => html`
                <clinical-analysis-view
                    .clinicalAnalysis="${this.clinicalAnalysis}"
                    .opencgaSession="${this.opencgaSession}"
                    .displayConfig="${{
                    }}">
                </clinical-analysis-view>
            `,
        });
    }

    render() {
        // Check if project exists
        if (!this.opencgaSession || !this.opencgaSession.study) {
            return guardPage();
        }

        return html`
            <div class="variant-interpreter-tool">
                <tool-header
                    .title="${this._config?.title}"
                    .centerContent="${this.renderToolbarCenterContent()}"
                    .rightContent="${this.renderToolbarRightContent()}">
                </tool-header>
                <div class="py-4">
                    ${(this._config?.tools || []).map(tool => this.renderTool(tool))}
                </div>
            </div>

            ${this._activeModal === "update-interpretation" ? this.renderInterpretationUpdateModal() : nothing}
            ${this._activeModal === "view-clinical-analysis" ? this.renderClinicalAnalysisViewModal() : nothing}
        `;
    }

    getDefaultConfig() {
        return {
            title: "Case Interpreter",
            tools: [
                {
                    // Note: 'select' tool is renamed to 'info' in the settings
                    // we have included a tiny 
                    id: "info",
                    title: "Case Info",
                    description: "",
                    icon: "fas fa-info"
                },
                {
                    id: "qc",
                    title: "Quality Control",
                    description: "",
                    icon: "fa fa-chart-bar"
                },
                {
                    id: "custom-analysis",
                    title: "Custom Analysis",
                    description: "",
                    icon: "fa fa-sync",
                },
                {
                    id: "methods",
                    title: "Interpretation Methods",
                    description: "",
                    icon: "fa fa-sync"
                },
                {
                    id: "variant-browser",
                    title: "Variant Browser",
                    description: "",
                    icon: "fas fa-dna"
                },
                {
                    id: "report",
                    title: "Observations",
                    description: "",
                    icon: "far fa-file-alt"
                },
            ]
        };
    }

}

customElements.define("variant-interpreter", VariantInterpreter);
