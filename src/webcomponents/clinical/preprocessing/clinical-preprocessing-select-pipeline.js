import {html, LitElement, nothing} from "lit";
import LitUtils from "../../commons/utils/lit-utils.js";
import UtilsNew from "../../../core/utils-new.js";
import "../../commons/forms/data-form.js";

export default class ClinicalPreprocessingSelectPipeline extends LitElement {

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
                type: Object,
            },
            displayConfig: {
                type: Object
            },
        };
    }

    #init() {
        this._data = {};
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }

        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    opencgaSessionObserver() {
        if (this.opencgaSession) {
            this.opencgaSession.opencgaClient.files()
                .search({
                    study: this.opencgaSession.study.fqn,
                    directory: "RESOURCES/clinical/pipelines",
                    include: "id,name,path",
                })
                .then(response => {
                    const files = (response.responses?.[0]?.results || []).filter(file => {
                        return file.name.endsWith(".json");
                    });
                    // 2. download each file and parse the content
                    return Promise.all(files.map(file => {
                        return this.opencgaSession.opencgaClient.files()
                            .download(file.id, {
                                study: this.opencgaSession.study.fqn,
                            })
                            .then(fileContent => {
                                return JSON.parse(fileContent);
                            })
                            .then(content => {
                                return {
                                    id: file.id,
                                    name: file.name,
                                    path: file.path,
                                    content: content,
                                };
                            })
                            .catch(error => {
                                console.error(`Error loading pipeline from file ${file.name}:`, error);
                                return null; // Return null for failed templates
                            });
                    }));
                })
                .then(pipelines => {
                    this._data = {
                        pipelines: pipelines.filter(Boolean) // Filter out null values
                    };
                    this.requestUpdate();
                })
                .catch(error => {
                    console.error("Error loading pipelines:", error);
                });
        }
    }

    onSelectPipeline(event, pipeline) {
        event.stopPropagation();
        LitUtils.dispatchCustomEvent(this, "pipelineSelect", null, pipeline);
    }

    onGenomicsPipelineCreate() {
        LitUtils.dispatchCustomEvent(this, "genomicsPipelineCreate");
    }

    onAffyPipelineCreate() {
        LitUtils.dispatchCustomEvent(this, "affyPipelineCreate");
    }

    renderPipelineItem(pipeline) {
        return html`
            <div class="d-flex flex-column gap-1">
                <div class="d-flex align-items-center">
                    <span class="fw-bold fs-5 link cursor-pointer" @click="${event => this.onSelectPipeline(event, pipeline)}">
                        ${pipeline.content.name || pipeline.name}
                    </span>
                    ${pipeline.content.version ? html`<span class="badge bg-secondary ms-2">v${pipeline.content.version}</span>` : nothing}
                </div>
                ${!pipeline.content?.type || pipeline.content?.type === "genomics" ? html`
                    <div class="d-flex gap-3 align-items-center">
                        <span>Alignment Tool: <b>${pipeline.content?.steps?.alignment?.tool?.id || "-"}</b></span>
                        <span>Variant Calling Tools: <b>${(pipeline.content?.steps?.variantCalling?.tools || []).map(t => t.id || t.name).join(", ") || "-"}</b></span>
                    </div>
                ` : nothing}
                ${pipeline.content.description ? html`
                    <div class="text-muted">${pipeline.content.description}</div>
                ` : nothing}
            </div>
            <div class="d-flex align-items-center">
                <button class="btn btn-light d-flex py-2" @click="${event => this.onSelectPipeline(event, pipeline)}">
                    <i class="fas fa-arrow-right fs-4"></i>
                </button>
            </div>
        `;
    }

    renderEmtpyPipelineList() {
        return html`
            <div class="text-center d-flex flex-column align-items-center p-5 bg-white rounded-4 border border-gray-200">
                <div class="d-flex fs-1 text-secondary mb-2">
                    <i class="fas fa-info-circle"></i>
                </div>
                <div class="fw-bold fs-5 mb-1">No pipelines available</div>
                <div class="text-muted">
                    No predefined preprocessing pipelines were found in the <code>RESOURCES/clinical/pipelines</code> folder of the study.
                    You can create a new custom pipeline by clicking the button on the right.
                </div>
            </div>
        `;
    }

    render() {
        return html`
            <data-form
                .data="${this._data}"
                .config="${this._config}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            title: "NGS and Affymetrix Microarray Preprocessing Pipeline",
            display: {
                buttonsVisible: false,
                className: "d-flex align-items-stretch gap-3 flex-nowrap w-full",
                layout: [
                    {
                        id: "select",
                        className: "w-full",
                    },
                    {
                        id: "spacer",
                        className: "border-end border-gray-200 mx-5",
                    },
                    {
                        id: "create",
                        className: "w-full",
                    },
                ],
                ...this.displayConfig,
            },
            sections: [
                {
                    id: "select",
                    title: "Select Existing Pipeline",
                    elements: [
                        {
                            type: "custom",
                            display: {
                                visible: () => this._data?.pipelines?.length > 0,
                                render: () => html`
                                    <span>Select a preprocessing pipeline from the list of available pipelines. </span>
                                    <span>Note that pipelines are defined in JSON files stored in the <code>RESOURCES/clinical/pipelines</code> folder of the study.</span>
                                `,
                            },
                        },
                        {
                            title: "NGS Genomic Pipelines",
                            type: "list",
                            field: "pipelines",
                            display: {
                                defaultLayout: "vertical",
                                titleClassName: "fs-3 my-2",
                                listClassName: "d-flex flex-column gap-2",
                                listItemClassName: "p-3 rounded-4 bg-white border border-gray-200 d-flex justify-content-between align-items-center gap-2 shadow-sm",
                                listItemClick: (event, pipeline) => {
                                    event.stopPropagation();
                                    this.onSelectPipeline(pipeline);
                                },
                                filter: pipelines => {
                                    return pipelines.filter(pipeline => !pipeline.content?.type || pipeline.content?.type === "genomics");
                                },
                                format: pipeline => this.renderPipelineItem(pipeline),
                                defaultValue: () => this.renderEmtpyPipelineList(),
                            },
                        },
                        {
                            title: "Affymetrix Microarray Pipelines",
                            type: "list",
                            field: "pipelines",
                            display: {
                                defaultLayout: "vertical",
                                titleClassName: "fs-3 my-2",
                                listClassName: "d-flex flex-column gap-2",
                                listItemClassName: "p-3 rounded-4 bg-white border border-gray-200 d-flex justify-content-between align-items-center gap-2 shadow-sm",
                                listItemClick: (event, pipeline) => {
                                    event.stopPropagation();
                                    this.onSelectPipeline(pipeline);
                                },
                                filter: pipelines => {
                                    return pipelines.filter(pipeline => pipeline.content?.type === "affy");
                                },
                                format: pipeline => this.renderPipelineItem(pipeline),
                                defaultValue: () => this.renderEmtpyPipelineList(),
                            },
                        },
                    ],
                },
                {
                    id: "spacer",
                },
                {
                    id: "create",
                    title: "Create New Pipeline",
                    elements: [
                        {
                            type: "custom",
                            display: {
                                render: () => html`
                                    <span>If the predefined pipelines do not fit your needs, you can create a new custom pipeline.</span>
                                    <span>Click the button below to start defining your own preprocessing pipeline from scratch.</span>
                                `,
                            },
                        },
                        {
                            type: "custom",
                            display: {
                                render: () => html`
                                    <button class="btn btn-lg btn-primary w-full d-flex flex-column align-items-center justify-content-center gap-2 py-3" @click="${() => this.onGenomicsPipelineCreate()}">
                                        <i class="fas fa-dna fs-2"></i>
                                        <span>Create New <b>Genomics</b> Pipeline</span>
                                    </button>
                                `,
                            },
                        },
                        {
                            type: "custom",
                            display: {
                                render: () => html`
                                    <button class="btn btn-lg btn-secondary w-full d-flex flex-column align-items-center justify-content-center gap-2 py-3" @click="${() => this.onAffyPipelineCreate()}">
                                        <i class="fas fa-microscope fs-2"></i>
                                        <span>Create New <b>Affy</b> Pipeline</span>
                                    </button>
                                `,
                            },
                        }
                    ],
                },
            ],
        };
    }

}

customElements.define("clinical-preprocessing-select-pipeline", ClinicalPreprocessingSelectPipeline);
