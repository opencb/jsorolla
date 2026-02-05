import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";
import "../../commons/tool-header.js";
import "./clinical-pharmacogenomics-registry.js";
import "./clinical-pharmacogenomics-allele-typer.js";
import "./clinical-pharmacogenomics-annotation.js";
import "./clinical-pharmacogenomics-view.js";

export default class ClinicalPharmacogenomics extends LitElement {

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
            registry: {
                genotypingFileContent: "",
                samplesheetFileContent: "",
            },
            alleleTyper: {
                translationFile: "",
            },
            annotation: {
                annotationSources: [],
                customAnnotations: [],
            },
            view: {
                results: [],
            },
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
        return true;
    }

    onChangeActiveStep(event, newStepIndex) {
        event.preventDefault();
        if (!this._running) {
            this._activeStepIndex = newStepIndex;
            this.requestUpdate();
        }
    }

    onRegistryParamsChange(event) {
        this._stepsParams.registry = event.detail;
        this.requestUpdate();
    }

    onAlleleTyperParamsChange(event) {
        this._stepsParams.alleleTyper = event.detail;
        this.requestUpdate();
    }

    onAnnotationParamsChange(event) {
        this._stepsParams.annotation = event.detail;
        this.requestUpdate();
    }

    async onExecute() {
        // avoid clicking twice the run button
        if (this._running) {
            return;
        }

        // validate required parameters
        if (!this._stepsParams.registry?.genotypingFileContent || this._stepsParams.registry.genotypingFileContent.length === 0) {
            return NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_ERROR, {
                message: "Genotyping output file is required for Pharmacogenomics analysis.",
            });
        }

        // set running state to true to disable buttons and navigate between steps
        this._running = true;
        this.requestUpdate();

        try {
            // TODO: Implement the actual pharmacogenomics analysis execution
            // This will involve:
            // 1. Allele typing analysis
            // 2. Pharmacogenomics annotation
            // 3. Generate results

            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                message: "Pharmacogenomics analysis completed successfully.",
            });

            // Move to view step to show results
            this._activeStepIndex = 3;
        } catch (error) {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_ERROR, {
                message: `Pharmacogenomics analysis failed: ${error.message}`,
            });
        } finally {
            this._running = false;
            this.requestUpdate();
        }
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
                        ${this._activeStepIndex === this._config.steps.length - 2 ? html`
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
            title: "Pharmacogenomics",
            steps: [
                {
                    id: "registry",
                    title: "Registry",
                    icon: "fas fa-clipboard-list",
                    render: () => html`
                        <clinical-pharmacogenomics-registry
                            .toolParams="${this._stepsParams.registry}"
                            .opencgaSession="${this.opencgaSession}"
                            @paramsChange="${event => this.onRegistryParamsChange(event)}">
                        </clinical-pharmacogenomics-registry>
                    `,
                },
                {
                    id: "allele-typer",
                    title: "Allele Typer",
                    icon: "fas fa-dna",
                    render: () => html`
                        <clinical-pharmacogenomics-allele-typer
                            .toolParams="${this._stepsParams.alleleTyper}"
                            .registryParams="${this._stepsParams.registry}"
                            .opencgaSession="${this.opencgaSession}"
                            @paramsChange="${event => this.onAlleleTyperParamsChange(event)}">
                        </clinical-pharmacogenomics-allele-typer>
                    `,
                },
                {
                    id: "annotation",
                    title: "Annotation",
                    icon: "fas fa-tags",
                    render: () => html`
                        <clinical-pharmacogenomics-annotation
                            .toolParams="${this._stepsParams.annotation}"
                            .alleleTyperParams="${this._stepsParams.alleleTyper}"
                            .opencgaSession="${this.opencgaSession}"
                            @paramsChange="${event => this.onAnnotationParamsChange(event)}">
                        </clinical-pharmacogenomics-annotation>
                    `,
                },
                {
                    id: "view",
                    title: "View",
                    icon: "fas fa-eye",
                    render: () => html`
                        <clinical-pharmacogenomics-view
                            .toolParams="${this._stepsParams}"
                            .opencgaSession="${this.opencgaSession}">
                        </clinical-pharmacogenomics-view>
                    `,
                },
            ],
        };
    }

}

customElements.define("clinical-pharmacogenomics", ClinicalPharmacogenomics);
