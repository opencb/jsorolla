import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import ClinicalAnalysisManager from "../clinical-analysis-manager.js";
import GridCommons from "../../commons/grid-commons.js";
import WebUtils from "../../commons/utils/web-utils.js";
import "../../variant/review/variant-review.js";
import "./clinical-report-variant-card.js";
import "./clinical-report-variant-info.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";

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
        this._selectedVariantPrimary = null;
        this._selectedVariantChecked = null;
        this._gridCommons = new GridCommons(null, this, null);
        this._updatedParams = {};
        this._report = null;

        // initialize available modals
        this._gridCommons.registerModals({
            "view-variant": () => ({
                display: {
                    scrollable: true,
                    title: `Variant ${this._selectedVariant.id}`,
                    size: "modal-3xl",
                    buttonsVisible: false,
                },
                render: () => html`
                    <variant-interpreter-view
                        .opencgaSession="${this.opencgaSession}"
                        .clinicalAnalysis="${this.clinicalAnalysis}"
                        .toolId="${"variant-interpreter-report"}"
                        .settings="${{}}"
                        .variant="${this._selectedVariant}">
                    </variant-interpreter-view>
                `,
            }),
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
            this._report = UtilsNew.objectClone(this.clinicalAnalysis.report || {}); // make sure we have a report object to work with
            this._updatedParams = {};
            this._config = this.getDefaultConfig();
        }
    }

    onVariantInfo(event) {
        this._selectedVariant = event.detail.variant;
        this._gridCommons.changeActiveModal("view-variant");
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

    onVariantReviewUpdate(event) {
        this._selectedVariant = UtilsNew.objectClone(event.detail.variant);
        this._selectedVariantPrimary = true; // by default we only display primary findings in the review tool
        this._selectedVariantChecked = true; // by default the variant is checked as it is a primary finding
        this._gridCommons.changeActiveModal("review-variant");
    }

    onVariantReviewChange(event) {
        this._selectedVariant = event.detail.variant;
        this._selectedVariantPrimary = event.detail.primary;
        this._selectedVariantChecked = event.detail.selected;
    }

    onVariantReviewCancel() {
        this._selectedVariant = null;
        this._gridCommons.clearActiveModal();
    }

    onVariantReviewSave() {
        // 1. get the action to perform based on the selected variant state
        const action = this._selectedVariantChecked ? "UPDATE" : "REMOVE";

        // 2. call the updateVariants method to update the variant in the interpretation
        this._clinicalAnalysisManager.updateVariants(this._selectedVariant, this._selectedVariantPrimary, action)
            .then(() => {
                LitUtils.dispatchCustomEvent(this, "clinicalAnalysisUpdate", null, {
                    clinicalAnalysis: this.clinicalAnalysis,
                });
            });

        // 3. clear selected variant to review
        this._selectedVariant = null;
        this.gridCommons.clearActiveModal();
    }

    onFieldChange(event) {
        // if the updated field is signatures, we need to force an update
        if (event.detail.param.startsWith("signatures")) {
            // when added the signature, we automatically populate the current date
            if (event.detail.action === "ADD") {
                const lastSignature = this._report.signatures[this._report.signatures.length - 1];
                this._report.signatures[this._report.signatures.length - 1] = {
                    ...lastSignature,
                    date: UtilsNew.getDatetime(),
                };
            }
            this._updatedParams.signatures = this._report.signatures || [];
            this._updatedParams = {...this._updatedParams};
        }
        this.requestUpdate();
    }

    onSignatureImageChange(event, onFieldChange) {
        const files = event.target.files || event.dataTransfer.files || [];
        if (files.length === 1) {
            UtilsNew.fileToDataURL(files[0]).then(dataUrl => {
                onFieldChange(dataUrl);
            });
        }
    }

    onSubmit() {
        const data = {
            report: this._report,
        };

        // check if user has updated the discussion text
        if (data.report.discussion?.text && data.report.discussion.text !== this.clinicalAnalysis.report?.discussion?.text) {
            data.report.discussion.date = UtilsNew.getDatetime();
            data.report.discussion.author = this.opencgaSession?.user?.id || "-";
        }

        this.opencgaSession.opencgaClient.clinical()
            .update(this.clinicalAnalysis.id, data, {
                includeResult: true,
                study: this.opencgaSession.study.fqn,
            })
            .then(response => {
                // dispatch the clinicalAnalysisUpdate event with the updated clinical analysis
                LitUtils.dispatchCustomEvent(this, "clinicalAnalysisUpdate", null, {
                    clinicalAnalysis: response.responses[0].results[0],
                });
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    message: "Clinical report updated successfully.",
                });
            })
            .catch(response => {
                console.error(response);
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            });
    }

    renderReportedVariants() {
        // get only variants with status "REPORTED"
        const reportedVariants = (this.clinicalAnalysis?.interpretation?.primaryFindings || []).filter(variant => {
            return variant.status === "REPORTED";
        });

        if (reportedVariants.length === 0) {
            return html`
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle pe-1"></i>
                    <span>No variants have been reported in the primary interpretation of this clinical analysis. </span>
                    <span>Please, go to the <b>Variant Browser</b> step to report variants.</span>
                </div>
            `;
        }

        return html`
            <div class="gap-3" style="display:grid;grid-template-columns:repeat(3, minmax(0, 1fr));">
                ${reportedVariants.map(variant => html`
                    <clinical-report-variant-card
                        .opencgaSession="${this.opencgaSession}"
                        .variant="${variant}"
                        .selected="${this._selectedVariant?.id === variant.id}"
                        @variantInfo="${event => this.onVariantInfo(event)}"
                        @variantReviewInfo="${event => this.onVariantReviewInfo(event)}"
                        @variantReviewUpdate="${event => this.onVariantReviewUpdate(event)}">
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
                <h2 class="fw-bold mb-4">Reported Variants</h2>
                ${this.renderReportedVariants()}
            </div>

            <div class="">
                <h2 class="fw-bold mb-4">Case Review</h2>
                <data-form
                    .data="${this._report}"
                    .config="${this._config}"
                    .updateParams="${this._updatedParams}"
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
                pillsOrientation: "horizontal",
                pillsLeftColumnClass: "col-md-1",
                pillsRightColumnClass: "col-md-11",
                buttonsVisible: true,
                buttonOkText: "Save Review",
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
                            field: "discussion.text",
                            defaultValue: "",
                            display: {
                                rows: 20,
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
                            field: "recommendation",
                            type: "input-text",
                            defaultValue: "",
                            display: {
                                rows: 20,
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
                            field: "methodology",
                            type: "input-text",
                            defaultValue: "",
                            display: {
                                rows: 20,
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
                            field: "limitations",
                            type: "input-text",
                            defaultValue: "",
                            display: {
                                rows: 20,
                            },
                        },
                    ],
                },
                {
                    id: "signatures",
                    title: "Signatures",
                    icon: "fa-signature",
                    display: {},
                    elements: [
                        {
                            field: "signatures",
                            type: "object-list",
                            display: {
                                showAddBatchListButton: false,
                                showEditItemListButton: false,
                                showDeleteItemListButton: true,
                                view: signature => {
                                    return html`
                                        <div class="d-flex align-items-center gap-2">
                                            <div class="flex-shrink-0" style="width:120px;">

                                            </div>
                                            <div class="flex-grow-1">
                                                <div class=""><b>Signed by:</b> ${signature.signedBy || "-"}</div>
                                                <div class=""><b>Role:</b> ${signature.role || "-"}</div>
                                            </div>
                                        </div>
                                    `;
                                },
                            },
                            elements: [
                                {
                                    field: "signatures[].signedBy",
                                    title: "Select Analyst",
                                    type: "select",
                                    allowedValues: (this.clinicalAnalysis?.analysts || []).map(analyst => ({
                                        id: analyst.id,
                                    })),
                                },
                                {
                                    field: "signatures[].role",
                                    title: "Role",
                                    type: "input-text",
                                },
                                {
                                    field: "signatures[].signature",
                                    title: "Upload the signature",
                                    type: "custom",
                                    display: {
                                        render: (signature, onFieldChange) => {
                                            return html`
                                                <input
                                                    type="file"
                                                    class="form-control"
                                                    accept="image/*"
                                                    @change="${event => this.onSignatureImageChange(event, onFieldChange)}"
                                                />
                                            `;
                                        },
                                        help: {
                                            text: "Accepted formats: png, jpg, jpeg. Maximum size: 1MB.",
                                        },
                                    },
                                },
                            ],
                        }
                    ],
                },
            ],
        };
    }

}

customElements.define("clinical-report-review", ClinicalReportReview);
