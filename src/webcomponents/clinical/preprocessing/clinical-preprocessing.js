import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import AnalysisUtils from "../../commons/analysis/analysis-utils.js";
import ModalUtils from "../../commons/modal/modal-utils.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";
import "./clinical-preprocessing-select-files.js";
import "./clinical-preprocessing-select-pipeline.js";
import "./clinical-preprocessing-save-pipeline.js";
import "./clinical-preprocessing-summary.js";
import "./clinical-preprocessing-analysis-genomics.js";
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
            samples: [],
            pipeline: null,
            preprocessing: {
                outputDir: "",
                indexDir: "",
                steps: {},
            },
            variantIndex: {
                file: "",
            },
        };
        this._activeStepIndex = 0;
        this._stepsParams = UtilsNew.objectClone(this.DEFAULT_STEPS_PARAMS);
        this._running = false;
        this._showPipelineInfoModal = false;
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
        const analysisConfig = this._stepsParams.select?.[analysisType];

        // 1. get the selected file objects
        const fileIds = new Set(analysisConfig?.fileIds?.split(",")?.filter(Boolean) || []);
        const files = analysisConfig?.files.filter(file => {
            return fileIds.has(file.fileId);
        });

        // 2. generate a list with the samples and their files
        const samplesMap = new Map();
        files.forEach(fileObject => {
            if (!samplesMap.has(fileObject.sampleId)) {
                samplesMap.set(fileObject.sampleId, {
                    id: fileObject.sampleId,
                    somatic: fileObject.sampleSomatic || false,
                    files: [],
                    role: "",
                });
            }
            // include the file in the sample files list
            samplesMap.get(fileObject.sampleId).files.push(fileObject.fileId);
        });

        // 3. update the preprocessing input samples
        this._stepsParams.samples = Array.from(samplesMap.values());
    }

    onPreprocessingParamsChange(event) {
        this._stepsParams.preprocessing = event.detail;
    }

    onVariantIndexParamsChange(event) {
        this._stepsParams.variantIndex = event.detail;
    }

    onPipelineClear() {
        this._stepsParams.pipeline = null;
        this._stepsParams.preprocessing.steps = {}; // reset steps
        this.requestUpdate();
    }

    onPipelineCreate() {
        // initialize pipeline information
        this._stepsParams.pipeline = {
            file: "",
            version: 0,
            type: "genomics",
        };
        this.requestUpdate();
    }

    onPipelineSelect(event) {
        this._stepsParams.pipeline = {
            file: event.detail.id,
            name: event.detail.content?.name || "",
            version: event.detail.content?.version,
            type: event.detail.content.type || "genomics",
            description: event.detail.content?.description || "",
        };
        // update pipeline steps
        this._stepsParams.preprocessing.steps = event.detail.content?.steps || {};
        this.requestUpdate();
    }

    onPipelineInfoModalShow() {
        this._showPipelineInfoModal = true;
        this.requestUpdate();

        // await to update complete to show the modal to enter the pipeline info
        this.updateComplete.then(() => {
            ModalUtils.show("PipelineInfoModal");
        });
    }

    onPipelineInfoModalHide() {
        ModalUtils.close("PipelineInfoModal");
        this._showPipelineInfoModal = false;
        this.requestUpdate();
    }

    onPipelineSave() {
        const pipelineContent = JSON.stringify({
            name: this._stepsParams.pipeline.name,
            description: this._stepsParams.pipeline.description,
            version: this._stepsParams.pipeline.version + 1,
            type: this._stepsParams.pipeline.type || "genomics",
            steps: this._stepsParams.preprocessing.steps,
        });
        return this.opencgaSession.opencgaClient.files()
            .updateContent(this._stepsParams.pipeline.file, pipelineContent, {
                study: this.opencgaSession.study.fqn,
            })
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    message: `Pipeline ${this._stepsParams.pipeline.name} saved.`,
                });
            })
            .catch(error => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
            });
    }

    onPipelineSaveNew(event) {
        const data = {
            type: "FILE",
            resource: true,
            path: `RESOURCES/clinical/pipelines/${event.detail.fileName}.json`,
            content: JSON.stringify({
                name: event.detail.name || "Untitled Pipeline",
                description: event.detail.description || "",
                version: 1,
                type: event.detail.type || "genomics",
                steps: this._stepsParams.preprocessing.steps,
            }),
        };
        this.opencgaSession.opencgaClient.files()
            .create(data, {
                study: this.opencgaSession.study.fqn,
            })
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    message: `Pipeline ${event.detail.name} saved.`,
                });
                this.onPipelineInfoModalHide();
            })
            .catch(error => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
            });
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
        const data = {
            outdir: this._stepsParams.preprocessing.outputDir,
            pipelineParams: {
                samples: this._stepsParams.samples,
                indexDir: this._stepsParams.preprocessing.indexDir,
                pipeline: {
                    steps: this._stepsParams.preprocessing.steps,
                },
            },
        };

        // 2. Submit ngs pipeline job
        const jobParams = {
            study: this.opencgaSession.study.fqn,
            ...AnalysisUtils.fillJobParams(this._stepsParams.preprocessing, "ngs-pipeline"),
        };

        await AnalysisUtils.submit(
            "NGS Pipeline Analysis",
            this.opencgaSession.opencgaClient.clinical()
                .runPipelineGenomics(data, jobParams),
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

    renderPipelineInfoModal() {
        return ModalUtils.create(this, "PipelineInfoModal", {
            display: {
                title: `Save As New Pipeline`,
                size: "modal-lg",
                buttonsVisible: false,
                draggable: false,
            },
            render: () => html`
                <clinical-preprocessing-save-pipeline
                    .opencgaSession="${this.opencgaSession}"
                    @pipelineSave="${event => this.onPipelineSaveNew(event)}">
                </clinical-preprocessing-save-pipeline>
            `,
        });
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
            ${this._showPipelineInfoModal ? this.renderPipelineInfoModal() : nothing}
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
                        ${this._stepsParams?.pipeline === null ? html`
                            <clinical-preprocessing-select-pipeline
                                .opencgaSession="${this.opencgaSession}"
                                @pipelineSelect="${event => this.onPipelineSelect(event)}"
                                @pipelineCreate="${event => this.onPipelineCreate(event)}">
                            </clinical-preprocessing-select-pipeline>
                        ` : nothing}
                        ${this._stepsParams?.pipeline !== null ? html`
                            <div class="position-relative">
                                ${this._stepsParams?.pipeline?.type === "genomics" ? html`
                                    <clinical-preprocessing-analysis-genomics
                                        .toolParams="${this._stepsParams?.preprocessing}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .displayConfig="${{
                                            buttonsVisible: false,
                                        }}"
                                        @paramsChange="${event => this.onPreprocessingParamsChange(event)}">
                                    </clinical-preprocessing-analysis-genomics>
                                ` : nothing}
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
                            @paramsChange="${event => {this.onVariantIndexParamsChange(event)}}">
                        </variant-index-operation>
                    `,
                },
                {
                    id: "run",
                    title: "Run",
                    icon: "fas fa-play-circle",
                    render: () => html`
                        <div class="position-relative">
                            <clinical-preprocessing-summary
                                .toolParams="${this._stepsParams}"
                                .opencgaSession="${this.opencgaSession}"
                                .displayConfig="${{
                                    buttonsVisible: false,
                                }}">
                            </clinical-preprocessing-summary>
                            <div class="position-absolute top-0 end-0 d-flex gap-2">
                                <button class="btn btn-light d-flex align-items-center gap-2" @click="${() => this.onPipelineInfoModalShow()}">
                                    <i class="fas fa-plus"></i>
                                    <span>Save As New Pipeline</span>
                                </button>
                                ${this._stepsParams?.pipeline?.file ? html`
                                    <button class="btn btn-primary d-flex align-items-center gap-2" @click="${() => this.onPipelineSave()}">
                                        <i class="fas fa-save"></i>
                                        <span>Update Pipeline</span>
                                    </button>
                                ` : nothing}
                            </div>
                        </div>
                    `,
                },
            ],
        };
    }

}

customElements.define("clinical-preprocessing", ClinicalPreprocessing);
