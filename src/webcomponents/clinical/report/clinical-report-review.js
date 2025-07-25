import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import ClinicalAnalysisManager from "../clinical-analysis-manager.js";
import FormUtils from "../../commons/forms/form-utils.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";
// import "./clinical-report-variants.js";
import "./clinical-report-variant-card.js";


export default class ClinicalReportReview extends LitElement {

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
                type: Object
            },
            opencgaSession: {
                type: Object
            },
            active: {
                type: Boolean,
            },
        };
    }

    #init() {
        this._clinicalAnalysisManager = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }

        super.update(changedProperties);
    }

    clinicalAnalysisObserver() {
        if (this.clinicalAnalysis) {
            this._clinicalAnalysisManager = new ClinicalAnalysisManager(this, this.clinicalAnalysis, this.opencgaSession);
        }
    }

    renderReportedVariants() {
        // get only variants with status "REPORTED"
        const reportedVariants = (this.clinicalAnalysis?.interpretation?.primaryFindings || []).filter(variant => {
            // return variant.status.id === "REPORTED";
            return true;
        });

        return html`
            <div class="gap-3" style="display:grid;grid-template-columns:repeat(3, minmax(0, 1fr));">
                ${reportedVariants.map(variant => html`
                    <clinical-report-variant-card
                        .opencgaSession="${this.opencgaSession}"
                        .variant="${variant}">
                    </clinical-report-variant-card>
                `)}
            </div>
        `;
    }

    render() {
        if (!this.opencgaSession || !this.clinicalAnalysis) {
            return nothing;
        }

        return html`
            <div class="mb-5">
                <h3 class="fw-bold mb-4">Reported Variants</h3>
                ${this.renderReportedVariants()}
            </div>
            <div class="">
                <h3 class="fw-bold mb-4">Case Review</h3>
                <data-form
                    .data="${this.clinicalAnalysis}"
                    .config="${this._config}"
                    @fieldChange="${event => this.onFieldChange(event)}"
                    @submit=${event => this.onSubmit(event)}>
                </data-form>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            type: "pills",
            display: {
                pillsLeftColumnClass: "col-md-1",
                pillsRightColumnClass: "col-md-11",
                buttonsVisible: false,
                buttonOkText: "Save",
                buttonClearText: "",
                defaultLayout: "vertical",
            },
            sections: [
                {
                    id: "discussion",
                    title: "Discussion",
                    icon: "fa-edit",
                    display: {},
                    elements: [
                        {
                            type: "input-text",
                            field: "report.discussion.text",
                            defaultValue: "",
                            display: {
                                rows: 10,
                                // helpMessage: discussion.author ? html`Last discussion added by <b>${discussion.author}</b> on <b>${UtilsNew.dateFormatter(discussion.date)}</b>.` : null,
                            },
                        },
                    ],
                },
                {
                    id: "recommendation",
                    title: "Recommendation",
                    icon: "fa-notes-medical",
                    display: {},
                    elements: [
                        {
                            field: "report.recommendation",
                            type: "input-text",
                            defaultValue: "",
                            display: {
                                rows: 10,
                            },
                        },
                    ],
                },
                {
                    id: "methodology",
                    title: "Methodology",
                    icon: "fa-tasks",
                    display: {},
                    elements: [
                        {
                            field: "report.methodology",
                            type: "input-text",
                            defaultValue: "",
                            display: {
                                rows: 10,
                            },
                        },
                    ],
                },
                {
                    id: "limitations",
                    title: "Limitations",
                    icon: "fa-exclamation-triangle",
                    display: {},
                    elements: [
                        {
                            field: "report.limitations",
                            type: "input-text",
                            defaultValue: "",
                            display: {
                                rows: 10,
                            },
                        },
                    ],
                },
                {
                    id: "signatures",
                    title: "Signatures",
                    icon: "fa-signature",
                    display: {},
                    elements: [],
                },
            ],
        };
    }

}

customElements.define("clinical-report-review", ClinicalReportReview);
