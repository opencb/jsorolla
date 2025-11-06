import {LitElement, html, nothing} from "lit";
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
        this._config = this.getDefaultConfig();
    }

    render() {
        if (!this.opencgaSession || !this.clinicalAnalysis) {
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
                            <clinical-analysis-summary
                                .active="${active}"
                                .clinicalAnalysis="${clinicalAnalysis}"
                                .opencgaSession="${opencgaSession}">
                            </clinical-analysis-summary>
                        </div>
                    `,
                },
                {
                    id: "review",
                    name: "Review Tool",
                    render: (clinicalAnalysis, active, opencgaSession) => html`
                        <div class="container">
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
                        <clinical-report-preview
                            .active="${active}"
                            .clinicalAnalysis="${clinicalAnalysis}"
                            .opencgaSession="${opencgaSession}">
                        </clinical-report-preview>
                    `,
                },
            ],
        };
    }

}

customElements.define("clinical-report", ClinicalReport);
