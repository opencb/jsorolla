import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import ClinicalAnalysisManager from "../clinical-analysis-manager.js";
import FormUtils from "../../commons/forms/form-utils.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";
import GridCommons from "../../commons/grid-commons.js";
import WebUtils from "../../commons/utils/web-utils.js";
// import "./clinical-report-variants.js";
import "./clinical-report-variant-card.js";
import "./clinical-report-variant-info.js";

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
        this._prefix = UtilsNew.randomString(8);
        this._config = this.getDefaultConfig();

        this._clinicalAnalysisManager = null;
        this._selectedVariant = null;
        this._gridCommons = new GridCommons(null, this, null);

        // initialize available modals
        this._gridCommons.registerModals({
            // "view-variant": () => ({
            //     display: {
            //         scrollable: true,
            //         title: `Variant ${this._selectedVariant.id}`,
            //         size: "modal-3xl",
            //         buttonsVisible: false,
            //     },
            //     render: () => html`
            //         <variant-interpreter-view
            //             .opencgaSession="${this.opencgaSession}"
            //             .settings="${this._config}"
            //             .clinicalAnalysis="${this.clinicalAnalysis}"
            //             .toolId="${"variant-interpreter-report"}"
            //             .variant="${this._selectedVariant}">
            //         </variant-interpreter-view>
            //     `,
            // }),
            "review-variant": () => ({
                display: {
                    scrollable: true,
                    title: `${WebUtils.formatDisplayName(this.clinicalAnalysis.interpretation.id, this.clinicalAnalysis.interpretation.name)} - Review Variant`,
                    size: "modal-3xl",
                    buttonsVisible: true,
                    buttonCancelText: "Cancel",
                    buttonSaveText: "Save Review",
                },
                render: () => html`
                    <variant-review
                        .opencgaSession="${this.opencgaSession}"
                        .clinicalAnalysis="${this.clinicalAnalysis}"
                        .variant="${this._selectedVariant}"
                        .selected="${true}"
                        .primaryFinding="${true}"
                        .reviewEvidences="${true}"
                        .settings="${{}}"
                        @variantChange="${event => this.onVariantReviewChange(event)}">
                    </variant-review>
                `,
                onCancel: () => {
                    this.onVariantReviewCancel();
                },
                onSave: () => {
                    this.onVariantReviewSave();
                },
            }),
        });
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

    onVariantReviewInfo(event) {
        this._selectedVariant = event.detail.variant;
        this.requestUpdate();

        // when update is complete, show the offcanvas
        this.updateComplete.then(() => {
            const bsOffcanvas = new bootstrap.Offcanvas(`#${this._prefix}ReviewInfo`);
            bsOffcanvas.show();
        });
    }

    onVariantReviewEdit(event) {
        this._selectedVariant = UtilsNew.objectClone(event.detail.variant);
        this._gridCommons.changeActiveModal("review-variant");
    }

    onVariantReviewChange(event) {
        // TODO
    }

    onVariantReviewCancel() {
        this._selectedVariant = null;
        this._gridCommons.clearActiveModal();
    }

    onVariantReviewSave(event) {
        // TODO
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
                        .variant="${variant}"
                        @variantReviewInfo="${event => this.onVariantReviewInfo(event)}"
                        @variantReviewEdit="${event => this.onVariantReviewEdit(event)}">
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

            <div class="offcanvas offcanvas-end bg-white" id="${this._prefix}ReviewInfo" style="width:600px;">
                <div class="offcanvas-header p-4">
                    ${this._selectedVariant ? html`
                        <h4 class="offcanvas-title fw-bold">Variant ${this._selectedVariant?.id}</h4>
                    ` : nothing}
                    <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>
                <div class="offcanvas-body px-4">
                    ${this._selectedVariant ? html`
                        <clinical-report-variant-info
                            .opencgaSession="${this.opencgaSession}"
                            .variant="${this._selectedVariant}"
                            .active="${true}">
                        </clinical-report-variant-info>
                    ` : nothing}
                </div>
            </div>

            ${this._gridCommons.renderModals()}
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
