import {LitElement, html, nothing} from "lit";
import "../../commons/forms/data-form.js";
import "../../commons/view/detail-tabs.js";

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
                const dataUri = "data:text/javascript;charset=utf-8," + encodeURIComponent(fileContent);
                return import(dataUri)
                    .then(module => {
                        return module.getTemplate();
                    });
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
                    id: "report",
                    name: "Report",
                    active: true,
                    render: (clinicalAnalysis, active, opencgaSession) => html`
                        <data-form
                            .data="${clinicalAnalysis}"
                            .config="${this._template}">
                        </data-form>
                    `,
                },
                {
                    id: "preview",
                    name: "Preview",
                    render: (clinicalAnalysis, active, opencgaSession) => html`
                        <div class="report-preview">
                            <h3>Report Preview</h3>
                            <p>This is a preview of the clinical analysis report.</p>
                            <!-- Add more preview content here -->
                        </div>
                    `,
                },
            ],
        };
    }

}

customElements.define("clinical-analysis-report", ClinicalAnalysisReport);
