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
import "./variant-interpreter-landing.js";
import "./variant-interpreter-qc.js";
import "./variant-interpreter-browser.js";
import "./variant-interpreter-browser-rd.js";
import "./variant-interpreter-browser-cancer.js";
import "./variant-interpreter-review.js";
import "./variant-interpreter-methods.js";
import "../../commons/opencga-active-filters.js";
import "../../download-button.js";
import "../../loading-spinner.js";
import "../../clinical/clinical-analysis-review.js";
import "../../clinical/interpretation/clinical-interpretation-update.js";

class VariantInterpreter extends LitElement {

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
            cellbaseClient: {
                type: Object
            },
            settings: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
        this.activeTool = "";
        this.clinicalAnalysisManager = null;

        this._config = this.getDefaultConfig();
        this.#updateInterpreterTools();
    }

    update(changedProperties) {
        if (changedProperties.has("settings")) {
            this.settingsObserver();
        }

        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
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
        this._config.tools = UtilsNew.mergeArray(this._config.tools, this.settings?.tools, false, true);
    }

    opencgaSessionObserver() {
        if (this.opencgaSession?.study?.fqn) {
            // With each property change we must update config and create the columns again. No extra checks are needed.
            // this._config = {...this.getDefaultConfig(), ...this.config};
            this.clinicalAnalysis = null;
            this.#changeActiveTool(this._config?.tools[0].id);
            this.requestUpdate();

            // To delete
            // this.clinicalAnalysisId = "NA12877";
            // this.clinicalAnalysisId = "CA-2";
            // this.clinicalAnalysisId = "C-TMV2OCT20_121978_S57_L005_TUMOR";
            // this.clinicalAnalysisId = "C-MA6250";
            // this.clinicalAnalysisIdObserver();
        }
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

    #updateInterpreterTools() {
        // Inject interpreter tools from extensions
        this._config.tools = ExtensionsManager.injectInterpretationTools(this._config.tools);
    }

    #changeActiveTool(toolId) {
        this.activeTool = toolId;
        this.requestUpdate();
    }

    onClickSection(e) {
        e.preventDefault();
        if (e.currentTarget?.dataset?.tool && !e.currentTarget.className.split(" ").includes("disabled")) {
            this.#changeActiveTool(e.currentTarget.dataset.tool);
        }
    }

    onClinicalAnalysisUpdate() {
        return this.opencgaSession.opencgaClient.clinical()
            .info(this.clinicalAnalysis.id, {study: this.opencgaSession.study.fqn})
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

    onChangePrimaryInterpretation = e => {
        const interpretationId = e.currentTarget.dataset.id;
        this.clinicalAnalysisManager.setInterpretationAsPrimary(interpretationId, () => {
            this.onClinicalAnalysisUpdate();
        });
    }

    onInterpreationEdit() {
        ModalUtils.show(`${this._prefix}InterpretationUpdateModal`);
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

    renderCustomAnalysisTab() {
        // No custom anaysis content available
        return html`
            <div class="col-md-6 offset-md-3 p-4">
                <div class="alert alert-warning" role="alert">
                    No custom analysis available at this time.
                </div>
            </div>
        `;
    }

    renderToolStep(item) {
        if (typeof item.visible === "undefined" || !!item.visible) {
            const isDisabled = !this.clinicalAnalysis && item.id !== "select" || item.disabled;
            const isActive = this.activeTool === item.id;
            return html`
                <li class="nav-item text-center">
                    <div class="nav-link">
                        <a
                            class="variant-interpreter-step ${isDisabled ? "disabled" : ""} ${isActive ? "active" : ""}"
                            href="javascript: void 0"
                            data-tool="${item.id}"
                            @click="${this.onClickSection}">
                            <i class="position-relative ${item.icon} fs-2 border border-secondary rounded-circle border-3 p-4"
                                style="z-index:1;background-color:white">
                            </i>
                        </a>
                    </div>
                    <p>${item.title}</p>
                </li>
            `;
        }
        // Tool step not visible
        return null;
    }

    renderTool(tool) {
        if (this.activeTool === tool.id) {
            switch (tool.id) {
                case "select":
                    return html`
                        <div id="${this._prefix}select" class="clinical-portal-content">
                            <variant-interpreter-landing
                                .opencgaSession="${this.opencgaSession}"
                                .clinicalAnalysis="${this.clinicalAnalysis}"
                                .config="${tool}"
                                @clinicalAnalysisUpdate="${this.onClinicalAnalysisUpdate}"
                                @selectClinicalAnalysis="${this.onClinicalAnalysis}">
                            </variant-interpreter-landing>
                        </div>
                    `;
                case "qc":
                    return html`
                        <div id="${this._prefix}qc" class="clinical-portal-content">
                            <variant-interpreter-qc
                                .opencgaSession="${this.opencgaSession}"
                                .cellbaseClient="${this.cellbaseClient}"
                                .clinicalAnalysis="${this.clinicalAnalysis}"
                                .settings="${tool}"
                                @clinicalAnalysisUpdate="${this.onClinicalAnalysisUpdate}">
                            </variant-interpreter-qc>
                        </div>
                    `;
                case "custom-analysis":
                    return html`
                        <div id="${this._prefix}customAnalysis" class="clinical-portal-content">
                            ${this.renderCustomAnalysisTab()}
                        </div>
                    `;
                case "methods":
                    return html`
                        <div id="${this._prefix}methods" class="clinical-portal-content">
                            <variant-interpreter-methods
                                .opencgaSession="${this.opencgaSession}"
                                .clinicalAnalysis="${this.clinicalAnalysis}"
                                .settings="${tool}">
                            </variant-interpreter-methods>
                        </div>
                    `;
                case "variant-browser":
                    return html`
                        <div id="${this._prefix}variant-browser" class="clinical-portal-content">
                            <variant-interpreter-browser
                                .opencgaSession="${this.opencgaSession}"
                                .clinicalAnalysis="${this.clinicalAnalysis}"
                                .cellbaseClient="${this.cellbaseClient}"
                                .settings="${tool}"
                                @clinicalAnalysisUpdate="${this.onClinicalAnalysisUpdate}">
                            </variant-interpreter-browser>
                        </div>
                    `;
                case "review":
                    return html`
                        <div id="${this._prefix}review" class="clinical-portal-content">
                            <variant-interpreter-review
                                .opencgaSession="${this.opencgaSession}"
                                .clinicalAnalysis="${this.clinicalAnalysis}"
                                .cellbaseClient="${this.cellbaseClient}"
                                .populationFrequencies="${this._config.populationFrequencies}"
                                .proteinSubstitutionScores="${this._config.proteinSubstitutionScores}"
                                .consequenceTypes="${this._config.consequenceTypes}"
                                .settings="${this._config?.tools?.find(t => t.id === "variant-browser")}"
                                @gene="${this.geneSelected}"
                                @samplechange="${this.onSampleChange}"
                                @clinicalAnalysisUpdate="${this.onClinicalAnalysisUpdate}">
                            </variant-interpreter-review>
                        </div>
                    `;
                case "report":
                    return html`
                        <div id="${this._prefix}report" >
                            <div class="col-md-10 offset-md-1">
                                <tool-header
                                    class="bg-white"
                                    title="Interpretation - ${this.clinicalAnalysis?.interpretation?.id}">
                                </tool-header>
                                <clinical-analysis-review
                                    @clinicalAnalysisUpdate="${e => this.onClinicalAnalysisUpdate(e)}"
                                    .clinicalAnalysis="${this.clinicalAnalysis}"
                                    .opencgaSession="${this.opencgaSession}">
                                </clinical-analysis-review>
                            </div>
                        </div>
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

    renderToolbarTitle() {
        return `
            ${this._config.title}
            <span class="inverse">
                Case ${this.clinicalAnalysis?.id}
                ${this.clinicalAnalysis?.locked ? "<span class=\"fa fa-lock pe-1\"></span>" : ""}
            </span>
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
                        ` : null}
                        <div class="text-secondary">
                            Primary Findings: <strong>${this.clinicalAnalysis.interpretation?.primaryFindings?.length ?? 0}</strong>
                        </div>
                    </div>
                ` : null}
                <div class="dropdown">
                    <button class="btn btn-light btn-lg dropdown-toggle" data-bs-toggle="dropdown" type="button">
                        <i class="fas fa-toolbox" aria-hidden="true"></i>
                        <span style="margin-left:4px;margin-right:4px;font-weight:bold;">Actions</span>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><h6 class="dropdown-header">Interpretation Actions</h6></li>
                        <li>
                            <a class="dropdown-item" style="cursor:pointer" @click="${() => this.onInterpreationEdit()}">
                                <i class="fas fa-edit pe-1"></i> Edit Interpretation
                            </a>
                        </li>
                        <li>
                            <a class="dropdown-item" style="cursor:pointer;" @click="${() => this.onInterpretationLock()}">
                                <i class="fas ${this.clinicalAnalysis?.interpretation?.locked ? "fa-unlock" : "fa-lock"} pe-1"></i>
                                ${this.clinicalAnalysis?.interpretation?.locked ? "Unlock" : "Lock"} Interpretation
                            </a>
                        </li>
                        ${this.clinicalAnalysis.secondaryInterpretations?.length > 0 ? html`
                            <li><h6 class="dropdown-header">Set Primary Interpretation</h6></li>
                            ${this.clinicalAnalysis.secondaryInterpretations.map(item => html`
                                <li>
                                    <a class="dropdown-item" style="cursor:pointer;" data-id="${item.id}" @click="${this.onChangePrimaryInterpretation}">
                                        <i class="fas ${item.locked ? "fa-lock" : "fa-unlock"} pe-1"></i>
                                        ${item.id}
                                    </a>
                                </li>
                            `)}
                        ` : null}
                        <li><hr class="dropdown-divider"></li>
                        <li><h6 class="dropdown-header">Case Actions</h6></li>
                        <li>
                            <a class="dropdown-item" style="cursor:pointer;" @click="${this.onClinicalAnalysisLock}">
                                <i class="fas ${this.clinicalAnalysis.locked ? "fa-unlock" : "fa-lock"} pe-1"></i>
                                ${this.clinicalAnalysis.locked ? "Unlock" : "Lock"} Case
                            </a>
                        </li>
                        <li>
                            <a class="dropdown-item" style="cursor:pointer" @click="${this.onClinicalAnalysisRefresh}">
                                <i class="fas fa-sync pe-1"></i> Refresh Case
                            </a>
                        </li>
                        <li>
                            <a class="dropdown-item" style="cursor:pointer;" @click="${this.onClinicalAnalysisDownload}">
                                <i class="fas fa-download pe-1"></i> Download Case
                            </a>
                        </li>
                        <li><hr class="dropdown-divider"></li>
                        <li>
                            <a class="dropdown-item" href="#clinicalAnalysisPortal/${this.opencgaSession.project.id}/${this.opencgaSession.study.id}">
                                <i class="fas fa-sign-out-alt pe-1"></i> Exit Interpreter
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        `;
    }

    renderInterpretationUpdateModal() {
        return ModalUtils.create(this, `${this._prefix}InterpretationUpdateModal`, {
            display: {
                modalTitle: `Interpretation Update: ${this.clinicalAnalysis?.interpretation?.id}`,
                modalDraggable: false,
                modalSize: "modal-lg"
            },
            render: () => {
                const displayConfig = {
                    buttonClearText: "Cancel",
                    buttonOkText: "Update",
                    buttonsLayout: "upper",
                    type: "tabs",
                };
                return html `
                    <clinical-interpretation-update
                        .clinicalInterpretation="${this.clinicalAnalysis?.interpretation}"
                        .clinicalAnalysis="${this.clinicalAnalysis}"
                        .opencgaSession="${this.opencgaSession}"
                        .displayConfig="${displayConfig}"
                        @clinicalInterpretationUpdate="${() => this.onClinicalAnalysisUpdate()}">
                    </clinical-interpretation-update>
                `;
            },
        });
    }

    render() {
        // Check if project exists
        if (!this.opencgaSession || !this.opencgaSession.study) {
            return guardPage();
        }

        return html`
            <div class="variant-interpreter-tool">
                ${this.clinicalAnalysis?.id ? html`
                    <tool-header
                        icon="${this._config.icon}"
                        .title="${this.renderToolbarTitle()}"
                        .rhs="${this.renderToolbarRightContent()}">
                    </tool-header>
                ` : html`
                    <tool-header
                        .title="${this._config.title}"
                        icon="${this._config.icon}">
                    </tool-header>
                `}

                <div class="container">
                    <div class="position-relative">
                        <div class="position-absolute   top-50 start-50 translate-middle" style="margin-top:4rem; width: 80%;">
                            <hr class="border border-secondary border-2 opacity-75">
                        </div>
                    </div>
                    <ul class="nav justify-content-around mx-auto p-2 flex-nowrap">
                        ${(this._config?.tools || []).map(item => this.renderToolStep(item))}
                    </ul>
                </div>

                <div id="${this._prefix}MainWindow" class="col-md-12 px-3">
                    ${(this._config?.tools || []).map(tool => this.renderTool(tool))}
                </div>
            </div>

            ${this.renderInterpretationUpdateModal()}

            <div class="v-space"></div>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Case Interpreter",
            icon: "fas fa-user-md",
            tools: [
                {
                    id: "select",
                    title: "Case Info",
                    description: "",
                    icon: "fa fa-folder-open"
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
                    title: "Sample Variant Browser",
                    description: "",
                    icon: "fa fa-search"
                },
                {
                    id: "review",
                    title: "Interpretation Review",
                    description: "",
                    icon: "fa fa-edit",
                    visible: false,
                },
                {
                    id: "report",
                    title: "Observations",
                    description: "",
                    icon: "fa fa-file-alt"
                },
            ]
        };
    }

}

customElements.define("variant-interpreter", VariantInterpreter);
