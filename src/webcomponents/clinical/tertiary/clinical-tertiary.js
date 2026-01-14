import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import "../../commons/tool-header.js";
import "./clinical-tertiary-select.js";
import "./clinical-tertiary-tools.js";
import "./clinical-tertiary-review.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";

export default class ClinicalTertiary extends LitElement {

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
        };
    }

    #init() {
        this._activeStepIndex = 0;
        this._selectedClinicalAnalyses = [];
        this._selectedTool = {};
        this._running = false;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this._activeStepIndex = 0; // reset to first step
            this._selectedClinicalAnalyses = [];
            this._selectedTool = {};
        }
        super.update(changedProperties);
    }

    navigationButtonsVisible() {
        return true;
    }

    async executeJobs() {
        // 1. no clinical analysis to execute
        if (this._selectedClinicalAnalyses?.length === 0) {
            return NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_ERROR, {
                message: "No Clinical Analysis selected to execute the Clinical Tertiary analysis.",
            });
        }

        // 2. no tool selected
        if (!this._selectedTool?.id) {
            return NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_ERROR, {
                message: "No tool selected to execute the Clinical Tertiary analysis.",
            });
        }

        // 3. fetch the information of the selected tool
        const toolResponse = await this.opencgaSession.opencgaClient.userTool()
            .info(this._selectedTool.id, {
                study: this.opencgaSession.study.fqn,
                include: "id,type",
            });
        const tool = toolResponse.responses[0].results[0];

        // 4. execute a job for each clinical analysis selected
        const allPromises = this._selectedClinicalAnalyses.map(clinicalAnalysis => {
            const toolParams = {
                id: this._selectedTool.id,
                params: {
                    ...this._selectedTool.executionParams,
                    clinicalAnalysisId: clinicalAnalysis.id,
                },
            };
            switch (tool.type.toUpperCase()) {
                case "CUSTOM_TOOL":
                    toolParams.commandLine = this._selectedTool?.params?.commandLine;
                    return this.opencgaSession.opencgaClient.userTool()
                        .runCustomDocker(toolParams, {
                            study: this.opencgaSession.study.fqn,
                        });
                case "WORKFLOW":
                    return this.opencgaSession.opencgaClient.userTool()
                        .runWorkflow(toolParams, {
                            study: this.opencgaSession.study.fqn,
                        });
                case "VARIANT_WALKER":
                    return this.opencgaSession.opencgaClient.userTool()
                        .runWalker(toolParams, {
                            study: this.opencgaSession.study.fqn,
                        });
                default:
                    console.error("Tool type not supported: ", this._selectedTool.tool.type);
                    return;
            }
        });
        await Promise.all(allPromises);

        // 4. all jobs executed successfully
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
            message: "Clinical Tertiary analysis jobs successfully submitted.",
        });
    }

    onChangeActiveStep(event, newStepIndex) {
        event.preventDefault();
        if (!this._running) {
            this._activeStepIndex = newStepIndex;
            this.requestUpdate();
        }
    }

    onClinicalAnalysesChange(event) {
        // Note: we have to keep the list of selected clinical analyses with only the id field, as the select components
        // needs them to restore the list of selected items when navigating back and forth between steps.
        this._selectedClinicalAnalyses = (event.detail.rows || []).map(clinicalAnalysis => {
            return {
                id: clinicalAnalysis.id,
            };
        });
        // check if we have to update the tool params with the new clinical analysis ids
        if (this._selectedTool?.params?.variables) {
            this._selectedTool.params.variables.clinicalAnalysisId = this._selectedClinicalAnalyses.map(ca => ca.id).join(",");
        }
    }

    onToolIdChange(event) {
        this._selectedTool = {
            id: event.detail.value,
            params: {
                variables: {
                    clinicalAnalysisId: this._selectedClinicalAnalyses.map(ca => ca.id).join(","),
                },
            },
        };
        this.requestUpdate();
    }

    onToolsParamsChange(event) {
        this._selectedTool.params = event.detail.params;
        this._selectedTool.executionParams = event.detail.executionParams;
    }

    onExecute() {
        // avoid clicking twice the run button
        if (this._running) {
            return;
        }

        // set running state to true to disable buttons and navigate between steps
        this._running = true;
        this.requestUpdate();

        // dispatch a job for each sample/clinical analysis selected
        this.executeJobs().finally(() => {
            this._running = false;
            this.requestUpdate();
        });
    }

    renderToolbarCenterContent() {
        const steps = [];
        (this._config?.steps || []).forEach((item, index) => {
            // add separator between this tool only if it is not the first one
            if (index > 0) {
                steps.push(html`
                    <div class="bg-gray-200 flex-shrink-0" style="height:2px;width:48px;margin-top:19px;"></div>
                `);
            }
            const active = index === this._activeStepIndex;
            const completed = index < this._activeStepIndex;
            steps.push(html`
                <div class="w-full text-decoration-none" style="max-width:100px;" @click="${event => this.onChangeActiveStep(event, index)}">
                    <div class="d-flex flex-column align-items-center gap-1 ${active || completed ? "text-primary": "text-secondary"} cursor-pointer w-full">
                        <div class="d-flex align-items-center justify-content-center ${active || completed ? "bg-primary-subtle" : "bg-gray-100"} rounded-circle" style="width:40px;height:40px;">
                            <i class="${completed ? "fa fa-check-circle" : item.icon} fs-5"></i>
                        </div>
                        <div class="text-center small ${active ? "fw-bold" : ""}">${item.title}</div>
                    </div>
                </div>
            `);
        });

        return html`
            <div class="d-flex align-items-center justify-content-center">
                <div class="d-flex flex-nowrap gap-0 align-items-start justify-content-center flex-shrink-0 w-full">
                    ${steps}
                </div>
            </div>
        `;
    }

    renderToolbarRightContent() {
        return html`
            <div class="d-flex align-items-center justify-content-end gap-4" style="width:320px;max-width:320px;"></div>
        `;
    }

    render() {
        if (!this.opencgaSession) {
            return nothing;
        }

        return html`
            <tool-header
                .title="${this._config.title}"
                .rightContent="${this.renderToolbarRightContent()}"
                .centerContent="${this.renderToolbarCenterContent()}">
            </tool-header>
            <div class="container py-4">
                ${this._config.steps[this._activeStepIndex]?.render()}
                ${this.navigationButtonsVisible() ? html`
                    <div class="mt-4 d-flex align-items-center justify-content-end gap-2">
                        ${this._activeStepIndex > 0 ? html`
                            <button class="btn btn-light ${this._running ? "disabled": ""}" @click="${e => this.onChangeActiveStep(e, this._activeStepIndex - 1)}">
                                <i class="fas fa-arrow-left me-1"></i> Previous
                            </button>
                        ` : nothing}
                        ${this._activeStepIndex < this._config.steps.length - 1 ? html`
                            <button class="btn btn-primary" @click="${e => this.onChangeActiveStep(e, this._activeStepIndex + 1)}">
                                Next <i class="fas fa-arrow-right ms-1"></i>
                            </button>
                        ` : nothing}
                        ${this._activeStepIndex === this._config.steps.length - 1 ? html`
                            <button class="btn btn-success ${this._running ? "disabled": ""}" @click="${e => this.onExecute(e)}">
                                <i class="fas fa-play-circle me-1"></i> Run Analysis
                            </button>
                        ` : nothing}
                    </div>
                ` : nothing}
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Clinical Tertiary",
            steps: [
                {
                    id: "select",
                    title: "Select",
                    icon: "fas fa-clipboard-list",
                    render: () => html`
                        <clinical-tertiary-select
                            .selectedClinicalAnalyses="${this._selectedClinicalAnalyses}"
                            .opencgaSession="${this.opencgaSession}"
                            @checkrow="${event => this.onClinicalAnalysesChange(event)}">
                        </clinical-tertiary-select>
                    `,
                },
                {
                    id: "tools",
                    title: "Tools",
                    icon: "fas fa-tools",
                    render: () => html`
                        <clinical-tertiary-tools
                            .toolId="${this._selectedTool?.id}"
                            .toolParams="${this._selectedTool?.params}"
                            .opencgaSession="${this.opencgaSession}"
                            .displayConfig="${{
                                buttonsVisible: false,
                            }}"
                            @toolIdChange="${event => this.onToolIdChange(event)}"
                            @toolParamsChange="${event => this.onToolsParamsChange(event)}">
                        </clinical-tertiary-tools>
                    `,
                },
                {
                    id: "review",
                    title: "Review",
                    icon: "fas fa-check-circle",
                    render: () => html`
                        <clinical-tertiary-review
                            .toolParams="${{}}"
                            .opencgaSession="${this.opencgaSession}"
                            .displayConfig="${{
                                buttonsVisible: false,
                            }}">
                        </clinical-tertiary-review>
                    `,
                },
            ],
        };
    }

}

customElements.define("clinical-tertiary", ClinicalTertiary);

