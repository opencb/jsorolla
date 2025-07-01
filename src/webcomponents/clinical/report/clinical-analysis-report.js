import {LitElement, html, nothing} from "lit";
import "../../commons/forms/data-form.js";
import "../../commons/view/detail-tabs.js";
import "../clinical-analysis-review.js";

export default class ClinicalAnalysisReport extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            clinicalAnalysis: {
                type: Object,
            },
            opencgaSession: {
                type: Object,
            },
            config: {
                type: Object,
            },
        };
    }

    #init() {
        this._templates = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }

        super.update(changedProperties);
    }

    clinicalAnalysisObserver() {
        this._templates = null;
        if (this.opencgaSession && this.clinicalAnalysis) {
            // 1. fetch all .js files inside the clinical report templates folder
            this.opencgaSession.opencgaClient.files()
                .search({
                    study: this.opencgaSession.study.fqn,
                    directory: "RESOURCES/clinical/report/templates",
                    include: "id,name",
                })
                .then(response => {
                    const files = (response.responses?.[0]?.results || []).filter(file => {
                        return file.name.endsWith(".js");
                    });
                    // 2. download each file and load the templates
                    return Promise.all(files.map(file => {
                        return this.opencgaSession.opencgaClient.files()
                            .download(file.id, {
                                study: this.opencgaSession.study.fqn,
                            })
                            .then(fileContent => {
                                return this.loadTemplateFromFile(file, fileContent);
                            });
                    }));
                })
                .then(templates => {
                    this._templates = templates;
                    this.requestUpdate();
                })
                .catch(error => {
                    console.error("Error loading templates:", error);
                });
        }
    }

    loadTemplateFromFile(file, content) {
        const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
        const fn = new AsyncFunction(content);
        return Promise.resolve(fn()).then(data => {
            return {
                name: data?.name || data?.title || file.name.replace(".js", ""),
                description: data?.description || "",
                version: data?.version || "",
                template: data?.template || {}
            };
        });
    }

    render() {
        if (!this.opencgaSession || !this.clinicalAnalysis || !this._templates) {
            return nothing;
        }

        return html`
            <detail-tabs
                .opencgaSession="${this.opencgaSession}"
                .data="${this.clinicalAnalysis}"
                .config="${this._config}">
            </detail-tabs>
        `;
    }

    getDefaultConfig() {
        return {
            showTitle: false,
            items: [
                {
                    id: "review",
                    name: "Review",
                    active: true,
                    render: (clinicalAnalysis, active, opencgaSession) => html`
                        <clinical-analysis-review
                            .clinicalAnalysis="${this.clinicalAnalysis}"
                            .opencgaSession="${this.opencgaSession}">
                        </clinical-analysis-review>
                    `,
                },
                {
                    id: "preview",
                    name: "Preview",
                    render: (clinicalAnalysis, active, opencgaSession) => html`
                        <data-form
                            .data="${clinicalAnalysis}"
                            .config="${this._templates[0]?.template}">
                        </data-form>
                    `,
                },
            ],
        };
    }

}

customElements.define("clinical-analysis-report", ClinicalAnalysisReport);
