import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import "./clinical-preprocessing-select-files.js";
import "./clinical-preprocessing-summary.js";
import "../../commons/tool-header.js";
import "../../alignment/analysis/sarek-analysis.js";
import "../../variant/operation/variant-index-operation.js";

export default class ClinicalPreprocessing extends LitElement {

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
            select: {
                analysisType: "SINGLE",
                single: {},
                family: {},
                cancer: {}
            },
            sarek: {
                files: "",
            },
            variantIndex: {
                file: "",
            }
        };
        this._activeStepIndex = 0;
        this._stepsParams = UtilsNew.objectClone(this.DEFAULT_STEPS_PARAMS);
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this._stepsParams = UtilsNew.objectClone(this.DEFAULT_STEPS_PARAMS);
        }

        super.update(changedProperties);
    }

    onChangeActiveStep(event, newStepIndex) {
        event.preventDefault();
        this._activeStepIndex = newStepIndex;
        this.requestUpdate();
    }

    onSelectFilesParamsChange(event) {
        this._stepsParams.select = event.detail;

        // we have to update the params for the next step (sarek) with the files selected
        const analysisType = this._stepsParams.select?.analysisType.toLowerCase();
        this._stepsParams.sarek.files = this._stepsParams.select?.[analysisType]?.fileIds || "";
    }

    onSarekParamsChange(event) {
        this._stepsParams.sarek = event.detail;
        // TODO: check if we have to update variant index params
    }

    onVariantIndexParamsChange(event) {
        this._stepsParams.variantIndex = event.detail;
    }

    onExecuteAnalysis(event) {
        // TODO
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

    render() {
        if (!this.opencgaSession) {
            return nothing;
        }

        return html`
            <tool-header
                .title="${this._config.title}"
                .rightContent="${nothing}"
                .centerContent="${this.renderToolbarCenterContent()}">
            </tool-header>
            <div class="container py-4">
                ${this._config.steps[this._activeStepIndex]?.render()}
                <div class="mt-4 d-flex align-items-center justify-content-end gap-2">
                    ${this._activeStepIndex > 0 ? html`
                        <button class="btn btn-light" @click="${e => this.onChangeActiveStep(e, this._activeStepIndex - 1)}">
                            <i class="fas fa-arrow-left me-1"></i> Previous
                        </button>
                    ` : nothing}
                    ${this._activeStepIndex < this._config.steps.length - 1 ? html`
                        <button class="btn btn-primary" @click="${e => this.onChangeActiveStep(e, this._activeStepIndex + 1)}">
                            Next <i class="fas fa-arrow-right ms-1"></i>
                        </button>
                    ` : nothing}
                    ${this._activeStepIndex === this._config.steps.length - 1 ? html`
                        <button class="btn btn-success" @click="${e => this.onExecuteAnalysis(e)}">
                            <i class="fas fa-play-circle me-1"></i> Run Analysis
                        </button>
                    ` : nothing}
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Clinical Preprocessing",
            steps: [
                {
                    id: "select",
                    title: "Select Files",
                    icon: "fas fa-file-medical",
                    render: () => html`
                        <clinical-preprocessing-select-files
                            .toolParams="${this._stepsParams?.select}"
                            .opencgaSession="${this.opencgaSession}"
                            .displayConfig="${{
                                buttonsVisible: false,
                            }}"
                            @paramsChange="${event => this.onSelectFilesParamsChange(event)}">
                        </clinical-preprocessing-select-files>
                    `,
                },
                {
                    id: "sarek",
                    title: "Sarek Parameters",
                    icon: "fas fa-sliders-h",
                    render: () => html`
                        <sarek-analysis
                            .toolParams="${this._stepsParams?.sarek}"
                            .opencgaSession="${this.opencgaSession}"
                            .config="${{
                                display: {
                                    buttonsVisible: false,
                                },
                            }}"
                            @paramsChange="${e => this.onSarekParamsChange(e)}">
                        </sarek-analysis>
                    `,
                },
                {
                    id: "index",
                    title: "Variant Index Parameters",
                    icon: "fas fa-database",
                    render: () => html`
                        <variant-index-operation
                            .toolParams="${{
                                study: this.opencgaSession.study.fqn,
                                ...this._stepsParams?.variantIndex,
                            }}"
                            .opencgaSession="${this.opencgaSession}"
                            .displayConfig="${{
                                buttonsVisible: false,
                            }}"
                            @paramsChange="${e => {this.onVariantIndexParamsChange(e)}}">
                        </variant-index-operation>
                    `,
                },
                {
                    id: "run",
                    title: "Run",
                    icon: "fas fa-play-circle",
                    render: () => html`
                        <clinical-preprocessing-summary
                            .toolParams="${this._stepsParams}"
                            .opencgaSession="${this.opencgaSession}"
                            .displayConfig="${{
                                buttonsVisible: false,
                            }}">
                        </clinical-preprocessing-summary>
                    `,
                },
            ],
        };
    }

}

customElements.define("clinical-preprocessing", ClinicalPreprocessing);
