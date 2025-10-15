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
                            text: "Select a preprocessing pipeline from the list of available pipelines.",
                            type: "text",
                        },
                        {
                            type: "list",
                            field: "pipelines",
                            display: {
                                contentLayout: "vertical",
                                listClassName: "d-flex flex-column gap-2",
                                listItemClassName: "p-4 rounded-4 bg-white border border-gray-200",
                                format: pipeline => html`
                                    <div class="">
                                        <span class="fw-bold">${pipeline.content.name || pipeline.name}</span>
                                        ${pipeline.content.version ? html`<span class="badge bg-secondary ms-2">v${pipeline.content.version}</span>` : nothing}
                                    </div>
                                    ${pipeline.content.description ? html`
                                        <div class="text-muted">${pipeline.content.description}</div>
                                    ` : nothing}
                                `,
                            },
                        },
                    ],
                },
                {
                    id: "create",
                    title: "Create Pipeline",
                    elements: [],
                },
            ],
        };
    }

}

customElements.define("clinical-preprocessing-select-pipeline", ClinicalPreprocessingSelectPipeline);
