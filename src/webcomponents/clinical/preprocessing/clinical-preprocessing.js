import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import AnalysisUtils from "../../commons/analysis/analysis-utils.js";
import "./clinical-preprocessing-select-files.js";
import "./clinical-preprocessing-select-pipeline.js";
import "./clinical-preprocessing-summary.js";
import "./clinical-preprocessing-analysis.js";
import "../../commons/tool-header.js";
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
            preprocessing: {
                pipeline: null,
                name: "",
                description: "",
                input: {
                    files: [],
                    sample: "",
                    type: "fastq",
                    somatic: false,
                    index: "/tmp/index",
                },
                steps: [],
            },
            variantIndex: {
                file: "",
            },
        };
        this._activeStepIndex = 0;
        this._stepsParams = UtilsNew.objectClone(this.DEFAULT_STEPS_PARAMS);
        this._running = false;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this._stepsParams = UtilsNew.objectClone(this.DEFAULT_STEPS_PARAMS);
        }
        super.update(changedProperties);
    }

    navigationButtonsVisible() {
        // next/previous buttons are not visible when the pipeline selection is visible
        if (this._activeStepIndex === 1 && this._stepsParams?.preprocessing?.pipeline === null) {
            return false;
        }
        // other case, buttons are visible
        return true;
    }

    onChangeActiveStep(event, newStepIndex) {
        event.preventDefault();
        if (!this._running) {
            this._activeStepIndex = newStepIndex;
            this.requestUpdate();
        }
    }

    onSelectFilesParamsChange(event) {
        this._stepsParams.select = event.detail;

        // we have to update the params for the next step (preprocessing) with the files selected
        const analysisType = this._stepsParams.select?.analysisType.toLowerCase();
        const fileIds = this._stepsParams.select?.[analysisType]?.fileIds?.split(",")?.filter(Boolean) || [];
        const fileObject = this._stepsParams.select?.[analysisType]?.files.find(f => f.id === fileIds[0]);
        this._stepsParams.preprocessing.input.files = fileIds;
        this._stepsParams.preprocessing.input.sample = fileObject?.sampleId || "";
        this._stepsParams.preprocessing.input.somatic = fileObject?.sampleSomatic || false;
    }

    onPreprocessingParamsChange(event) {
        // 1. update the input section
        Object.assign(this._stepsParams.preprocessing.input, event.detail.input);

        // 2. update the steps array with the steps selected
        this._stepsParams.preprocessing.steps = event.detail.steps || [];
    }

    onVariantIndexParamsChange(event) {
        this._stepsParams.variantIndex = event.detail;
    }

    onPipelineClear() {
        this._stepsParams.preprocessing = {
            input: this._stepsParams.preprocessing.input,
            pipeline: null,
            steps: [],
        };
        this.requestUpdate();
    }

    onPipelineCreate() {
        this._stepsParams.preprocessing = {
            input: this._stepsParams.preprocessing.input,
            pipeline: "",
            steps: [],
        };
        this.requestUpdate();
    }

    onPipelineSelect(event) {
        this._stepsParams.preprocessing = {
            input: this._stepsParams.preprocessing.input,
            pipeline: event.detail.path,
            name: event.detail.content?.name || "",
            description: event.detail.content?.description || "",
            version: event.detail.content?.version,
            steps: event.detail.content?.steps || [],
        };
        this.requestUpdate();
    }

    async onExecute() {
        // avoid clicking twice the run button
        if (this._running) {
            return;
        }

        // 0. set running state to true to disable buttons and navigate between steps
        this._running = true;
        this.requestUpdate();

        // 1. prepare data object for ngsPipeline job
        const bodyParam = {
            command: "run",
            input: this._stepsParams.preprocessing.input.files,
            pipelineParams: {
                name: "ngs-pipeline",
                ...this._stepsParams.preprocessing,
            },
            indexDir: this._stepsParams.preprocessing.input.index || "JOBS/test/test/20251008/fetch-reference-genome-20251008121516/"
        };
        bodyParam.pipelineParams.input.sample = this._stepsParams.select.single.files[0]?.sampleId;
        this._stepsParams

        // 2. Submit ngs pipeline job
        const jobParams = {
            study: this.opencgaSession.study.fqn,
            ...AnalysisUtils.fillJobParams(this._stepsParams.preprocessing, "ngs-pipeline"),
        };

        await AnalysisUtils.submit(
            "NGS Pipeline Analysis",
            this.opencgaSession.opencgaClient.clinical()
                .runNgsPipeline(bodyParam, jobParams),
            this,
        );

        // 5. Prepare data and Submit variant index job
        // const variantIndexJobData = {
        //     file: this._stepsParams?.variantIndex?.file || "",
        //     calculateStats: this._stepsParams?.variantIndex?.calculateStats || false,
        //     annotate: this._stepsParams?.variantIndex?.annotate || false,
        //     resume: this._stepsParams?.variantIndex?.resume || false,
        //     loadMultiFileData: this._stepsParams?.variantIndex?.loadMultiFileData || false,
        // };
        // const variantIndexJobParams = {
        //     study: this.opencgaSession.study.fqn,
        //     ...AnalysisUtils.fillJobParams(this._stepsParams.variantIndex, "variant-index"),
        //     jobDependsOn: ngsPipelineJobParams.jobId,
        // };
        //
        // // 6. Submit variant index job
        // await AnalysisUtils.submit(
        //     "Variant Index",
        //     this.opencgaSession.opencgaClient.variantOperations()
        //         .indexVariant(variantIndexJobData, variantIndexJobParams),
        //     this,
        // );

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
                    id: "preprocessing",
                    title: "Preprocessing Parameters",
                    icon: "fas fa-sliders-h",
                    render: () => html`
                        ${this._stepsParams?.preprocessing?.pipeline === null ? html`
                            <clinical-preprocessing-select-pipeline
                                .opencgaSession="${this.opencgaSession}"
                                @pipelineSelect="${event => this.onPipelineSelect(event)}"
                                @pipelineCreate="${event => this.onPipelineCreate(event)}">
                            </clinical-preprocessing-select-pipeline>
                        ` : nothing}
                        ${this._stepsParams?.preprocessing?.pipeline !== null ? html`
                            <div class="position-relative">
                                <clinical-preprocessing-analysis
                                    .toolParams="${this._stepsParams?.preprocessing}"
                                    .opencgaSession="${this.opencgaSession}"
                                    .displayConfig="${{
                                        buttonsVisible: false,
                                    }}"
                                    @paramsChange="${e => this.onPreprocessingParamsChange(e)}">
                                </clinical-preprocessing-analysis>
                                <div class="position-absolute top-0 end-0">
                                    <button class="btn btn-light d-flex align-items-center gap-2" @click="${() => this.onPipelineClear()}">
                                        <i class="fas fa-edit"></i> Change Pipeline
                                    </button>
                                </div>
                            </div>
                        ` : nothing}
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
