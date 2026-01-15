import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import ClinicalAnalysisManager from "../clinical-analysis-manager.js";
import GridCommons from "../../commons/grid-commons.js";
import WebUtils from "../../commons/utils/web-utils.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";
import "../variant/clinical-variant-review.js";
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
        this._selectedVariantInterpretationId = null;
        this._selectedVariantPrimary = null;
        this._selectedVariantChecked = null;
        this._gridCommons = new GridCommons(null, this, null);
        this._report = null;
        this._signature = {}; // used to save new signature data
        this._analists = []; // used to store the analysts of the clinical analysis

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
                    <clinical-variant-review
                        .opencgaSession="${this.opencgaSession}"
                        .clinicalAnalysis="${this.clinicalAnalysis}"
                        .variant="${this._selectedVariant}"
                        .selected="${true}"
                        .primaryFinding="${true}"
                        .reviewEvidences="${true}"
                        .settings="${{}}"
                        @variantChange="${event => this.onVariantReviewChange(event)}">
                    </clinical-variant-review>
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
            this._signature = {};
            this._analists = this.getAnalysts(); // get the list of analysts from the clinical analysis
            this._config = this.getDefaultConfig();
        }
    }

    filterVariants(variants) {
        return variants.filter(variant => {
            return variant.status === "REPORTED" || variant.status === "CANDIDATE";
        });
    }

    getAnalysts() {
        return (this.clinicalAnalysis?.analysts || []).map(analyst => ({
            id: analyst.id,
            disabled: (this._report?.signatures || []).some(signature => signature.signedBy === analyst.id),
        }));
    }

    getInterpretations() {
        // 1. prepare all the interpretations
        const interpretations = [];

        // 2. include the primary interpretation if exists
        if (this.clinicalAnalysis?.interpretation) {
            interpretations.push({
                id: this.clinicalAnalysis.interpretation.id,
                name: this.clinicalAnalysis.interpretation.name,
                primary: true,
                primaryFindings: this.filterVariants(this.clinicalAnalysis.interpretation.primaryFindings || []),
                secondaryFindings: this.filterVariants(this.clinicalAnalysis.interpretation.secondaryFindings || []),
            });
        }

        // 3. include secondary interpretations if exist
        if (this.clinicalAnalysis?.secondaryInterpretations) {
            this.clinicalAnalysis.secondaryInterpretations.forEach(interpretation => {
                interpretations.push({
                    id: interpretation.id,
                    name: interpretation.name,
                    primary: false,
                    primaryFindings: this.filterVariants(interpretation.primaryFindings || []),
                    secondaryFindings: [], // currently we do not support secondary findings in secondary interpretations
                });
            });
        }

        // 4. filter only those interpretations with reported variants
        return interpretations.filter(interpretation => {
            return interpretation.primaryFindings.length > 0 || interpretation.secondaryFindings.length > 0;
        });
    }

    onVariantInfo(event) {
        this._selectedVariant = event.detail.variant;
        this._selectedVariantInterpretationId = event.detail.interpretationId;
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
        this._selectedVariantInterpretationId = event.detail.interpretationId;
        this._gridCommons.changeActiveModal("review-variant");
    }

    onVariantReviewChange(event) {
        this._selectedVariant = event.detail.variant;
        this._selectedVariantPrimary = event.detail.primary;
        this._selectedVariantChecked = event.detail.selected;
    }

    onVariantReviewCancel() {
        this._selectedVariant = null;
        this._selectedVariantInterpretationId = null;
        this._gridCommons.clearActiveModal();
    }

    onVariantReviewSave() {
        // 1. get the action to perform based on the selected variant state
        const action = this._selectedVariantChecked ? "UPDATE" : "REMOVE";

        // 2. display a loading notification
        const loadingId = NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_LOADING, {
            message: "Saving review of the variant. Please wait...",
        });

        // 3. call the updateVariants method to update the variant in the interpretation
        this._clinicalAnalysisManager.updateVariants(this._selectedVariantInterpretationId, this._selectedVariant, this._selectedVariantPrimary, action)
            .then(() => {
                LitUtils.dispatchCustomEvent(this, "clinicalAnalysisUpdate", null, {
                    clinicalAnalysis: this.clinicalAnalysis,
                });
            })
            .catch(response => {
                console.error(response);
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            })
            .finally(() => {
                NotificationUtils.clear(this, loadingId);
            });

        // 3. clear selected variant to review
        this._selectedVariant = null;
        this._selectedVariantInterpretationId = null;
        this._gridCommons.clearActiveModal();
    }

    onFieldChange(event) {
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

    onSignatureAdd() {
        if (!this._report.signatures) {
            this._report.signatures = [];
        }

        // insert the new signature into the report object
        this._report.signatures.push({
            ...this._signature, // copy the signature data
            date: UtilsNew.getDatetime(),
        });

        // reset the signature object to allow adding a new signature and request an update
        this._signature = {};
        this._analists = this.getAnalysts(); // refresh the analysts list to disable those who have already signed
        this.requestUpdate();

        // force to clear the input file
        this.updateComplete.then(() => {
            this.querySelector(`input[type="file"]`).value = "";
        });
    }

    onSignatureRemove(signature) {
        this._report.signatures = this._report.signatures.filter(s => s !== signature);
        this._analists = this.getAnalysts(); // refresh the analysts list to disable those who have already signed
        this.requestUpdate();
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

        // check if user has updated the conclusion text
        if (data.report.conclusion?.text && data.report.conclusion.text !== this.clinicalAnalysis.report?.conclusion?.text) {
            data.report.conclusion.date = UtilsNew.getDatetime();
            data.report.conclusion.author = this.opencgaSession?.user?.id || "-";
        }

        // display a loading notification
        const loadingId = NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_LOADING, {
            message: "Saving Clinical Review. Please wait...",
        });

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
                    message: "Clinical Review updated successfully.",
                });
            })
            .catch(response => {
                console.error(response);
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            })
            .finally(() => {
                NotificationUtils.clear(this, loadingId);
            });
    }

    renderReportedVariants() {
        //  get all the interpretations with reported variants
        const interpretations = this.getInterpretations();

        if (interpretations.length === 0) {
            return html`
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle pe-1"></i>
                    <span>No variants have been reported in any interpretations of this clinical analysis. </span>
                    <span>Please, go to the <b>Variant Browser</b> step to report variants.</span>
                </div>
            `;
        }

        return html`
            <div class="d-flex flex-column gap-5">
                ${interpretations.map(interpretation => html`
                    <div class="">
                        <div class="mb-3 d-flex align-items-center gap-3">
                            <h4 class="mb-0">
                                Interpretation ${WebUtils.formatDisplayName(interpretation.id, interpretation.name, "")}
                            </h4>
                            ${interpretation.primary ? html`
                                <div class="badge bg-primary text-white">PRIMARY</div>
                            ` : nothing}
                        </div>
                        <div class="gap-3" style="display:grid;grid-template-columns:repeat(3, minmax(0, 1fr));">
                            ${[...interpretation.primaryFindings, ...interpretation.secondaryFindings].map(variant => html`
                                <clinical-report-variant-card
                                    .opencgaSession="${this.opencgaSession}"
                                    .interpretationId="${interpretation.id}"
                                    .variant="${variant}"
                                    .selected="${this._selectedVariant?.id === variant.id && this._selectedVariantInterpretationId === interpretation.id}"
                                    .secondaryFinding="${interpretation.secondaryFindings.includes(variant)}"
                                    @variantInfo="${event => this.onVariantInfo(event)}"
                                    @variantReviewInfo="${event => this.onVariantReviewInfo(event)}"
                                    @variantReviewUpdate="${event => this.onVariantReviewUpdate(event)}">
                                </clinical-report-variant-card>
                            `)}
                        </div>
                    </div>
                `)}
            </div>
        `;
    }

    renderSignature(signature) {
        return html`
            <div class="d-flex align-items-center gap-5 bg-white border border-1 border-gray-200 p-3 rounded-3 position-relative">
                <div class="flex-shrink-0" style="width:120px;">
                    <img src="${signature.signature}" style="max-width:100%;max-height:100%;" />
                </div>
                <div class="flex-grow-1">
                    <div class=""><b>Signed by:</b> ${signature.signedBy || "-"}</div>
                    <div class=""><b>Role:</b> ${signature.role || "-"}</div>
                </div>
                <button class="btn btn-light d-flex position-absolute top-0 end-0 m-3" @click="${() => this.onSignatureRemove(signature)}">
                    <i class="fas fa-trash-alt"></i>
                </button>
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
                <h2 class="fw-bold mb-4">Report Review</h2>
                <data-form
                    .data="${{
                        report: this._report,
                        signature: this._signature,
                    }}"
                    .config="${this._config}"
                    @fieldChange="${event => this.onFieldChange(event)}"
                    @submit=${event => this.onSubmit(event)}>
                </data-form>
            </div>

            <div class="offcanvas offcanvas-end bg-white" id="${this._prefix}ReviewInfo" style="width:800px;">
                <div class="offcanvas-header p-4">
                    ${this._selectedVariant ? html`
                        <h3 class="offcanvas-title fw-bold">
                            Variant ${this._selectedVariant?.id}
                        </h3>
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
                buttonOkDisabled: this.clinicalAnalysis?.locked ?? true,
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
                                rows: 20,
                                disabled: this.clinicalAnalysis?.locked ?? true,
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
                                rows: 20,
                                disabled: this.clinicalAnalysis?.locked ?? true,
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
                                rows: 20,
                                disabled: this.clinicalAnalysis?.locked ?? true,
                            },
                        },
                    ],
                },
                {
                    id: "experimentalProcedure",
                    title: "Experimental Procedure",
                    icon: "fa-vial",
                    display: {},
                    elements: [
                        {
                            field: "report.experimentalProcedure",
                            type: "input-text",
                            defaultValue: "",
                            display: {
                                rows: 20,
                                disabled: this.clinicalAnalysis?.locked ?? true,
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
                                rows: 20,
                                disabled: this.clinicalAnalysis?.locked ?? true,
                            },
                        },
                    ],
                },
                {
                    id: "conclusion",
                    title: "Conclusion",
                    icon: "fa-check-double",
                    display: {},
                    elements: [
                        {
                            field: "report.conclusion.text",
                            type: "input-text",
                            defaultValue: "",
                            display: {
                                rows: 20,
                                disabled: this.clinicalAnalysis?.locked ?? true,
                            },
                        },
                    ],
                },
                {
                    id: "signatures",
                    title: "Signatures",
                    icon: "fa-signature",
                    display: {
                        className: "row",
                        layout: [
                            {
                                className: "col-6",
                                elements: [
                                    { id: "signature-add-title" },
                                    { id: "signature-signed-by" },
                                    { id: "signature-role" },
                                    { id: "signature-image" },
                                    { id: "signature-add-button" },
                                ],
                            },
                            {
                                className: "col-6",
                                id: "signature-list",
                            },
                        ],
                    },
                    elements: [
                        {
                            id: "signature-add-title",
                            text: "Add New Signature",
                            type: "text",
                            display: {
                                textClassName: "fw-bold fs-5",
                            },
                        },
                        {
                            id: "signature-signed-by",
                            field: "signature.signedBy",
                            title: "Select Analyst",
                            type: "select",
                            allowedValues: () => this._analists,
                            display: {
                                disabled: this.clinicalAnalysis?.locked ?? true,
                            },
                        },
                        {
                            id: "signature-role",
                            field: "signature.role",
                            title: "Role",
                            type: "input-text",
                            display: {
                                placeholder: "e.g. Geneticist, Pathologist...",
                                disabled: this.clinicalAnalysis?.locked ?? true,
                            },
                        },
                        {
                            id: "signature-image",
                            field: "signature.signature",
                            title: "Upload the signature",
                            type: "custom",
                            display: {
                                render: (signature, onFieldChange) => {
                                    return html`
                                        <input
                                            type="file"
                                            class="form-control"
                                            accept="image/*"
                                            ?disabled="${this.clinicalAnalysis?.locked ?? true}"
                                            @change="${event => this.onSignatureImageChange(event, onFieldChange)}"
                                        />
                                    `;
                                },
                                help: {
                                    text: "Accepted formats: png, jpg, jpeg. Maximum size: 1MB.",
                                },
                            },
                        },
                        {
                            id: "signature-add-button",
                            type: "custom",
                            display: {
                                render: () => {
                                    const saveDisabled = (this.clinicalAnalysis?.locked ?? true) || !this._signature.signedBy || !this._signature.signature;
                                    return html`
                                        <div class="d-flex justify-content-end">
                                            <button class="btn btn-light d-flex gap-2 justify-content-center align-items-center" ?disabled="${saveDisabled}" @click="${() => this.onSignatureAdd()}">
                                                <i class="fas fa-plus"></i> <span>Add Signature</span>
                                            </button>
                                        </div>
                                    `;
                                },
                            },
                        },
                        {
                            id: "signature-list",
                            field: "report.signatures",
                            title: "Added Signatures",
                            type: "custom",
                            display: {
                                titleClassName: "fw-bold fs-5",
                                render: signatures => {
                                    if (!signatures || signatures?.length === 0) {
                                        return html`
                                            <div class="d-flex flex-column align-items-center justify-content-center p-5 border border-1 border-gray-200 rounded-3">
                                                <i class="fas fa-signature fs-1 mb-1"></i>
                                                <div class="text-center fs-5 text-secondary">No signatures have been added yet.</div>
                                            </div>
                                        `;
                                    }

                                    return html`
                                        <div class="d-flex flex-column gap-3">
                                            ${signatures.map(signature => this.renderSignature(signature))}
                                        </div>
                                    `;
                                },
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("clinical-report-review", ClinicalReportReview);
