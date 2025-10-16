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
                    // 2. donwload each file and parse the content
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
        LitUtils.dispatchCustomEvent(this, "pipelineSelect", pipeline);
    }

    onCreatePipeline() {
        LitUtils.dispatchCustomEvent(this, "pipelineCreate");
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
            title: "NGS Preprocessing Parameters",
            display: {
                buttonsVisible: false,
                className: "row",
                layout: [
                    {
                        id: "select",
                        className: "col-md-6",
                    },
                    {
                        id: "create",
                        className: "col-md-6",
                    },
                ],
                ...this.displayConfig,
            },
            sections: [
                {
                    id: "select",
                    title: "Select Pipeline",
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
                            type: "list",
                            field: "pipelines",
                            display: {
                                contentLayout: "vertical",
                                listClassName: "d-flex flex-column gap-2",
                                listItemClassName: "p-3 rounded-4 bg-white border border-gray-200 d-flex justify-content-between align-items-center gap-2",
                                listItemClick: (event, pipeline) => {
                                    event.stopPropagation();
                                    this.onSelectPipeline(pipeline);
                                },
                                format: pipeline => html`
                                    <div class="d-flex flex-column gap-1">
                                        <div class="d-flex align-items-center">
                                            <span class="fw-bold">${pipeline.content.name || pipeline.name}</span>
                                            ${pipeline.content.version ? html`<span class="badge bg-secondary ms-2">v${pipeline.content.version}</span>` : nothing}
                                        </div>
                                        ${pipeline.content.description ? html`
                                            <div class="text-muted">${pipeline.content.description}</div>
                                        ` : nothing}
                                    </div>
                                    <div class="d-flex align-items-center">
                                        <button class="btn btn-light" @click="${event => this.onSelectPipeline(event, pipeline)}">
                                            <i class="fas fa-check-circle"></i>
                                        </button>
                                    </div>
                                `,
                                defaultValue: () => html`
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
                                `,
                            },
                        },
                    ],
                },
                {
                    id: "create",
                    title: "Create Pipeline",
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
                                    <button class="btn btn-primary w-full d-flex align-items-center justify-content-center gap-1" @click="${() => this.onCreatePipeline()}">
                                        <i class="fas fa-plus-circle"></i>
                                        <span>Create New Pipeline</span>
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
