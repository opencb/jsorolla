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
        this._templateFile = "RESOURCES:clinical:report:template.js";
        this._template = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }

        super.update(changedProperties);
    }

    clinicalAnalysisObserver() {
        this._template = null;
        if (this.opencgaSession && this.clinicalAnalysis) {
            this.opencgaSession.opencgaClient.files()
                .download(this._templateFile, {
                    study: this.opencgaSession.study.fqn,
                })
                .then(response => {
                    // const content = response.responses[0].results[0].content;
                    return this.loadTemplateFromFile(response, this._templateFile.endsWith(".js") ? "JAVASCRIPT" : "JSON");
                })
                .then(template => {
                    this._template = template;
                    this.requestUpdate();
                })
                .catch(error => {
                    console.error("Error loading template file:", error);
                });
        }
    }

    loadTemplateFromFile(fileContent, format = "JSON") {
        switch (format) {
            case "JSON":
                return Promise.resolve(JSON.parse(fileContent));
            case "JAVASCRIPT":
                const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
                const fn = new AsyncFunction(`${fileContent} return getTemplate();`);
                return Promise.resolve(fn())
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
    }

    render() {
        if (!this.opencgaSession || !this.clinicalAnalysis || !this._template) {
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
                            .config="${this._template}">
                        </data-form>
                    `,
                },
            ],
        };
    }

}

customElements.define("clinical-analysis-report", ClinicalAnalysisReport);
