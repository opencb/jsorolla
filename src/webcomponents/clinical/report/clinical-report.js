import {LitElement, html, nothing} from "lit";
import "../../commons/tool-header.js";
import "../../commons/view/detail-tabs.js";
import "../clinical-analysis-summary.js";
import "./clinical-report-preview.js";
import "./clinical-report-review.js";

export default class ClinicalReport extends LitElement {

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
        this._clinicalAnalysis = null;
        this._editingTemplate = false;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("clinicalAnalysis") || changedProperties.has("opencgaSession")) {
            // after any change in the clinicalAnalysis or opencgaSession, reset the internal clinicalAnalysis object
            // and include the clinical configuration in the attributes section
            this._clinicalAnalysis = {
                ...this.clinicalAnalysis,
                attributes: {
                    ...this.clinicalAnalysis?.attributes,
                    OPENCGA_CLINICAL_CONFIGURATION: this.opencgaSession?.study?.internal?.configuration?.clinical || {},
                },
            };
        }

        super.update(changedProperties);
    }

    onTemplateEditionToggle(event) {
        this._editingTemplate = !!event.detail.value;
        this._config = this.getDefaultConfig();
        this.requestUpdate();
    }

    render() {
        if (!this.opencgaSession || !this.clinicalAnalysis) {
            return nothing;
        }

        return html`
            <detail-tabs
                .opencgaSession="${this.opencgaSession}"
                .data="${this._clinicalAnalysis}"
                .config="${this._config}">
            </detail-tabs>
        `;
    }

    getDefaultConfig() {
        return {
            showTitle: false,
            display: {
                classes: "justify-content-center mb-3",
            },
            items: [
                {
                    id: "overview",
                    name: "Overview",
                    active: true,
                    render: (clinicalAnalysis, active, opencgaSession) => html`
                        <div class="container">
                            <tool-header .title="${"Clinical Analysis Overview"}"></tool-header>
                            <clinical-analysis-summary
                                .active="${active}"
                                .clinicalAnalysis="${clinicalAnalysis}"
                                .opencgaSession="${opencgaSession}"
                                .displayConfig="${{
                                    titleVisible: false,
                                }}">
                            </clinical-analysis-summary>
                        </div>
                    `,
                },
                {
                    id: "review",
                    name: "Review Tool",
                    render: (clinicalAnalysis, active, opencgaSession) => html`
                        <div class="container">
                            <tool-header .title="${"Review Tool"}"></tool-header>
                            <clinical-report-review
                                .active="${active}"
                                .clinicalAnalysis="${clinicalAnalysis}"
                                .opencgaSession="${opencgaSession}">
                            </clinical-report-review>
                        </div>
                    `,
                },
                {
                    id: "preview",
                    name: "Preview",
                    render: (clinicalAnalysis, active, opencgaSession) => html`
                        <div class="${this._editingTemplate ? "" : "container"}">
                            <tool-header .title="${"Report Preview"}"></tool-header>
                            <clinical-report-preview
                                .active="${active}"
                                .clinicalAnalysis="${clinicalAnalysis}"
                                .opencgaSession="${opencgaSession}"
                                @templateEditionToggle="${event => {
                                    this.onTemplateEditionToggle(event);
                                }}">
                            </clinical-report-preview>
                        </div>
                    `,
                },
            ],
        };
    }

}

customElements.define("clinical-report", ClinicalReport);
