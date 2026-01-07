import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import "../../commons/tool-header.js";
import "./clinical-tertiary-select.js";
import "./clinical-tertiary-tools.js";
import "./clinical-tertiary-review.js";

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
        this.DEFAULT_STEPS_PARAMS = {
            select: {},
            tool: {},
        };
        this._activeStepIndex = 0;
        this._stepsParams = UtilsNew.objectClone(this.DEFAULT_STEPS_PARAMS);
        this._running = false;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this._activeStepIndex = 0; // reset to first step
            this._stepsParams = UtilsNew.objectClone(this.DEFAULT_STEPS_PARAMS);
        }
        super.update(changedProperties);
    }

    navigationButtonsVisible() {
        // return this._activeStepIndex > 0;
        return true;
    }

    onChangeActiveStep(event, newStepIndex) {
        event.preventDefault();
        if (!this._running) {
            this._activeStepIndex = newStepIndex;
            this.requestUpdate();
        }
    }

    onSelectParamsChange(event) {
        this._stepsParams.select = event.detail;
    }

    onToolsParamsChange(event) {
        this._stepsParams.tool = event.detail;
    }

    async onExecute() {
        // avoid clicking twice the run button
        if (this._running) {
            return;
        }

        // 0. set running state to true to disable buttons and navigate between steps
        this._running = true;
        this.requestUpdate();

        // TODO: Implement actual execution logic here
        // For now, just simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // run completed
        this._running = false;
        this.requestUpdate();
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
                            .toolParams="${this._stepsParams?.select}"
                            .opencgaSession="${this.opencgaSession}"
                            .displayConfig="${{
                                buttonsVisible: false,
                            }}"
                            @paramsChange="${event => this.onSelectParamsChange(event)}">
                        </clinical-tertiary-select>
                    `,
                },
                {
                    id: "tools",
                    title: "Tools",
                    icon: "fas fa-tools",
                    render: () => html`
                        <clinical-tertiary-tools
                            .toolParams="${this._stepsParams?.tool}"
                            .opencgaSession="${this.opencgaSession}"
                            .displayConfig="${{
                                buttonsVisible: false,
                            }}"
                            @paramsChange="${event => this.onToolsParamsChange(event)}">
                        </clinical-tertiary-tools>
                    `,
                },
                {
                    id: "review",
                    title: "Review",
                    icon: "fas fa-check-circle",
                    render: () => html`
                        <clinical-tertiary-review
                            .toolParams="${this._stepsParams}"
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

