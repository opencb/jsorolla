import {LitElement, html, nothing} from "lit";
import "../../commons/forms/data-form.js";
import "../../commons/view/detail-tabs.js";
import "../clinical-analysis-review.js";
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
            items: [
                {
                    id: "review",
                    name: "Review",
                    active: true,
                    render: (clinicalAnalysis, active, opencgaSession) => html`
                        <clinical-report-review
                            .active="${active}"
                            .clinicalAnalysis="${clinicalAnalysis}"
                            .opencgaSession="${opencgaSession}">
                        </clinical-report-review>
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
