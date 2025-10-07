import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import AnalysisUtils from "../../commons/analysis/analysis-utils.js";
import "./clinical-preprocessing-select-files.js";
import "./clinical-preprocessing-summary.js";
import "../../commons/tool-header.js";
import "../../clinical/analysis/clinical-preprocessing-analysis.js";
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
                input: {
                    files: "",
                },
            },
            variantIndex: {
                file: "",
            }
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

    onChangeActiveStep(event, newStepIndex) {
        event.preventDefault();
        if (!this._running) {
            this._activeStepIndex = newStepIndex;
            this.requestUpdate();
        }
    }

    onSelectFilesParamsChange(event) {
        this._stepsParams.select = event.detail;

        // we have to update the params for the next step (sarek) with the files selected
        const analysisType = this._stepsParams.select?.analysisType.toLowerCase();
        this._stepsParams.preprocessing.input.files = this._stepsParams.select?.[analysisType]?.fileIds || "";
    }

    onPreprocessingParamsChange(event) {
        this._stepsParams.preprocessing = event.detail;
        // TODO: check if we have to update variant index params
    }

    onVariantIndexParamsChange(event) {
        this._stepsParams.variantIndex = event.detail;
    }

    async onExecute() {
        // avoid clicking twice the run button
        if (this._running) {
            return;
        }

        // 0. set running state to true to disable buttons and navigate between steps
        this._running = true;
        this.requestUpdate();

        // 1. Prepare special params. 'otherToolParams' will be included in the 'params' object and MUST NOT include these params
        const {files, jobId, jobDependsOn, jobTags, jobDescription, ...otherSarekParams} = this._stepsParams.sarek;
        const filesArray = files?.split(",") || [];

        // 1. Check if sarek workflow is installed
        // TODO: check if sarek is installed

        // 2. Create and upload a samplesheet
        if (filesArray?.length > 0) {
            const samplesheet = [
                "patient,status,sample,lane,fastq_1,fastq_2",
            ];
            // NOTE: we assume that all files belong to the same sample and individual
            const analysisType = this._stepsParams.select?.analysisType.toLowerCase();
            const fileObject = this._stepsParams.select?.[analysisType]?.files.find(fileObject => {
                return filesArray.includes(fileObject.fileId);
            });
            // Assuming single-end reads for simplicity; modify as needed for paired-end
            const fastq1 = filesArray[0] || "N/A";
            const fastq2 = filesArray.length > 1 ? filesArray[1] : "N/A";
            samplesheet.push(`${fileObject.individualId},0,${fileObject.sampleId},lane_1,file://${fastq1},file://${fastq2}`);

            // Upload samplesheet to OpenCGA
            const uploadResponse = await this.opencgaSession.opencgaClient.files()
                .create({
                    path: `data/sarek/samplesheets_${UtilsNew.getDatetime()}.csv`,
                    content: samplesheet.join("\n"),
                    type: "FILE",
                    format: "PLAIN",
                    description: `Samplesheet for Sarek analysis - ${UtilsNew.getDatetime()}`,
                }, {study: this.opencgaSession.study.fqn});

            // Add samplesheet path to otherSarekParams
            const samplesheetFile = uploadResponse.responses[0].results[0];
            otherSarekParams.input = "file://" + samplesheetFile.path;
            otherSarekParams.outdir = "$OUTPUT";
        } else {
            AnalysisUtils.notify("", "Please select at least one FASTQ file", NotificationUtils.NOTIFY_ERROR, this);
            this._running = false;
            this.requestUpdate();
            return;
        }

        // 3. Create toolParams and params objects
        const sarekJobData = {
            id: "nf-core.sarek", // this.ANALYSIS_TOOL, // This must be the same as the workflow id
            params: {
                "-r": "3.5.1",
                "-profile": "docker",
            },
        }
        // Nextflow workflow parameters must start with '--'
        Object.keys(otherSarekParams).forEach(key => {
            sarekJobData.params["--" + key] = otherSarekParams[key];
        });

        // 4. Submit sarek job
        const sarekJobParams = {
            study: this.opencgaSession.study.fqn,
            ...AnalysisUtils.fillJobParams(this._stepsParams.sarek, "nf-core.sarek"),
        };
        await AnalysisUtils.submit(
            "Sarek Analysis",
            this.opencgaSession.opencgaClient.workflows()
                .run(sarekJobData, sarekJobParams),
            this,
        );

        // 5. Prepare data and Submit variant index job
        const variantIndexJobData = {
            file: this._stepsParams?.variantIndex?.file || "",
            calculateStats: this._stepsParams?.variantIndex?.calculateStats || false,
            annotate: this._stepsParams?.variantIndex?.annotate || false,
            resume: this._stepsParams?.variantIndex?.resume || false,
            loadMultiFileData: this._stepsParams?.variantIndex?.loadMultiFileData || false,
        };
        const variantIndexJobParams = {
            study: this.opencgaSession.study.fqn,
            ...AnalysisUtils.fillJobParams(this._stepsParams.variantIndex, "variant-index"),
            jobDependsOn: sarekJobParams.jobId,
        };

        // 6. Submit variant index job
        await AnalysisUtils.submit(
            "Variant Index",
            this.opencgaSession.opencgaClient.variantOperations()
                .indexVariant(variantIndexJobData, variantIndexJobParams),
            this,
        );

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
                        <clinical-preprocessing-analysis
                            .toolParams="${this._stepsParams?.preprocessing}"
                            .opencgaSession="${this.opencgaSession}"
                            .displayConfig="${{
                                buttonsVisible: true,
                            }}"
                            @paramsChange="${e => this.onSarekParamsChange(e)}">
                        </clinical-preprocessing-analysis>
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
