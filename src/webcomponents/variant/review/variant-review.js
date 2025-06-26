import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import FormUtils from "../../commons/forms/form-utils.js";
import VariantGridFormatter from "../variant-grid-formatter.js";
import "../../commons/forms/data-form.js";
import "../annotation/cellbase-variant-annotation-summary.js";
import "./variant-review-evidences-grid.js";

export default class VariantReview extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object,
            },
            clinicalAnalysis: {
                type: Object,
            },
            variant: {
                type: Object,
            },
            variantId: {
                type: String,
            },
            selected: {
                type: Boolean,
            },
            reviewEvidences: {
                type: Boolean,
            },
            settings: {
                type: Object,
            },
            displayConfig: {
                type: Object,
            }
        };
    }

    #init() {
        this.STATUS_VALUES = [
            "NOT_REVIEWED",
            "REVIEW_REQUESTED",
            "REVIEWED",
            "DISCARDED",
            "REPORTED",
            "ARTIFACT",
        ];
        this.CONFIDENCE_VALUES = [
            "LOW",
            "MEDIUM",
            "HIGH",
        ];
        this._variant = null;
        this._selected = false;
        this._updatedParams = {};
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("variantId")) {
            this.variantIdObserver();
        }

        if (changedProperties.has("variant")) {
            this.variantObserver();
        }

        if (changedProperties.has("selected")) {
            this._selected = !!this.selected;
        }

        if (changedProperties.has("displayConfig") || changedProperties.has("selected") || changedProperties.has("reviewEvidences")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    updated() {
        // enable or disable the save button based on whether there are pending changes
        const hasPendingChanges = Object.keys(this._updatedParams).length > 0 || this._selected !== this.selected;
        const buttonElement = this.closest(".modal-dialog")?.querySelector(`button[data-role="modal-save"]`);
        if (buttonElement) {
            if (hasPendingChanges) {
                buttonElement.removeAttribute("disabled");
            } else {
                buttonElement.setAttribute("disabled", "true");
            }
        }
    }

    variantIdObserver() {
        if (this.opencgaSession && this.variantId) {
            this.opencgaSession.opencgaClient.clinical()
                .queryVariant({
                    study: this.opencgaSession.study.fqn,
                    id: this.variantId,
                    includeSampleId: "true",
                })
                .then(response => {
                    this._updatedParams = {};
                    this._variant = response?.responses?.[0]?.results?.[0];
                    this.requestUpdate();
                })
                .catch(response => {
                    console.error(response);
                });
        }
    }

    variantObserver() {
        this._updatedParams = {};
        this._variant = UtilsNew.objectClone(this.variant);
    }

    dispatchChange() {
        LitUtils.dispatchCustomEvent(this, "variantChange", null, {
            selected: this._selected,
            variant: {
                ...this._variant,
                comments: (this._variant?.comments || []).map(comment => ({
                    ...comment,
                    tags: UtilsNew.commaSeparatedArray(comment.tags || []),
                })),
            },
        });
    }

    onSelectChange() {
        this._selected = !this._selected;
        this._config = this.getDefaultConfig();
        this.dispatchChange();
        this.requestUpdate();
    }

    onStatusChange(event) {
        this._variant.status = event.currentTarget.value;
        this._updatedParams = FormUtils.getUpdatedFields(this.variant, this._updatedParams, "status", event.currentTarget.value);
        this.dispatchChange();
        this.requestUpdate();
    }

    onConfidenceChange(event) {
        this._variant.confidence = {
            value: event.currentTarget.value,
            author: this.opencgaSession?.user?.id,
            date: UtilsNew.getDatetime(),
        };
        this._updatedParams = FormUtils.getUpdatedFields(this.variant, this._updatedParams, "confidence.value", event.currentTarget.value);
        this.dispatchChange();
        this.requestUpdate();
    }

    onFieldChange(event) {
        // if the updated field is comments, we need to force an update of the variant
        if (event.detail.param.startsWith("comments")) {
            if (event.detail.action === "ADD") {
                const lastComment = this._variant.comments[this._variant.comments.length - 1];
                this._variant.comments[this._variant.comments.length - 1] = {
                    ...lastComment,
                    author: this.opencgaSession?.user?.id || "-",
                    date: UtilsNew.getDatetime(),
                };
                this._updatedParams.comments = this._variant.comments;
            }
            // force to refresh the updated params object
            // this is to make sure that the current comment is displayed in the form
            this._updatedParams = {...this._updatedParams};
        } else if (event.detail.param === "discussion.text") {
            this._updatedParams.discussion = {
                text: this._variant.discussion?.text || "",
            };
        }
        this.requestUpdate();
        this.dispatchChange();
    }

    onEvidenceReviewChange(event) {
        this._variant.evidences[event.detail.index].review = event.detail.review;
        this._updatedParams.evidences = this._variant.evidences; // register evidences as updated params
        this.requestUpdate();
        this.dispatchChange();
    }

    renderVariantInfo() {
        const consequenceTypes = [], negativeConsequenceTypes = [];
        const soVisited = new Set();
        // ctResults = {selectedConsequenceTypes, notSelectedConsequenceTypes, indexes}
        const ctRestuls = VariantGridFormatter._consequenceTypeDetailFormatterFilter(this._variant?.annotation?.consequenceTypes, this.settings);
        (ctRestuls.selectedConsequenceTypes || []).forEach(ct => {
            ct.sequenceOntologyTerms.forEach(so => {
                if (!soVisited.has(so?.name)) {
                    consequenceTypes.push(html`
                        <span style="color:${CONSEQUENCE_TYPES.style[CONSEQUENCE_TYPES.impact[so.name]] || "black"}">${so.name}</span>
                    `);
                    soVisited.add(so.name);
                }
            });
        });
        // filtered consequence types
        if (ctRestuls.notSelectedConsequenceTypes?.length > 0) {
            ctRestuls.notSelectedConsequenceTypes.forEach(ct => {
                ct.sequenceOntologyTerms.forEach(so => {
                    if (!soVisited.has(so?.name)) {
                        negativeConsequenceTypes.push(so);
                        soVisited.add(so.name);
                    }
                });
            });
            if (negativeConsequenceTypes.length > 0) {
                consequenceTypes.push(html`
                    <span class="text-secondary fst-italic">+${negativeConsequenceTypes.length} terms filtered</span>
                `);
            }
        }

        return html`
            <div class="alert alert-light flex-grow-1">
                <div class="">
                    <span class="fw-bold lh-1">${this._variant.id}</span>
                </div>
                <div class="d-flex align-items-center gap-2">
                    ${consequenceTypes}
                </div>
            </div>
        `;
    }

    renderVariantSelect() {
        return html`
            <div class="alert ${this._selected ? "alert-primary" : "alert-light"} d-flex align-items-center justify-content-between gap-2">
                <label class="form-label mb-0">
                    ${this._selected ? html`
                        <span>Remove from <b>Primary Findings</b>.</span>    
                    ` : html`
                        <span>Select as <b>Primary Finding</b>.</span>
                    `}
                </label>
                <button class="btn btn-sm ${this._selected ? "btn-primary" : "btn-light"} rounded-2" @click="${() => this.onSelectChange()}">
                    <i class="fa fa-check lh-1 ${this._selected ? "opacity-100" : "opacity-0"}"></i>
                </button>
            </div>
        `;
    }

    renderVariantStatus() {
        return html`
            <div class="alert alert-light d-flex align-items-center">
                <div class="d-flex align-items-center gap-2">
                    <label class="form-label mb-0 fw-bold">Status</label>
                    <select class="form-select form-select-sm" ?disabled="${!this._selected}" @change="${event => this.onStatusChange(event)}">
                        ${this.STATUS_VALUES.map(status => html`
                            <option value="${status}" ?selected="${this._variant?.status === status}">
                                ${status}
                            </option>
                        `)}
                    </select>
                </div>
                <div class="d-flex align-items-center gap-2 ms-3">
                    <label class="form-label mb-0 fw-bold">Confidence</label>
                    <select class="form-select form-select-sm" ?disabled="${!this._selected}" @change="${event => this.onConfidenceChange(event)}">
                        ${this.CONFIDENCE_VALUES.map(confidence => html`
                            <option value="${confidence}" ?selected="${this._variant?.confidence?.value === confidence}">
                                ${confidence}
                            </option>
                        `)}
                    </select>
                </div>
            </div>
        `;
    }

    renderPendingChangesToSave() {
        const hasPendingChanges = Object.keys(this._updatedParams).length > 0 || this._selected !== this.selected;
        return html`
            <div class="alert ${hasPendingChanges ? "alert-warning" : "alert-light"} d-flex align-items-center">
                <i class="fa fa-save fs-3"></i>
            </div>
        `;
    }

    render() {
        if (!this.opencgaSession || !this._variant) {
            return nothing;
        }
        const hasPendingChanges = Object.keys(this._updatedParams).length > 0 || this._selected !== this.selected;

        return html`
            ${hasPendingChanges ? html`
                <div class="alert alert-warning d-flex align-items-center mb-2">
                    <i class="fa fa-exclamation-triangle"></i>
                    <span class="ms-2">There are pending changes on this review. Click on <b>Save Review</b> to save them.</span>
                </div>
            ` : nothing}
            <div class="d-flex gap-2 mb-2 w-full">
                ${this.renderVariantInfo()}
                ${this.renderVariantSelect()}
                ${this.renderVariantStatus()}
            </div>
            <data-form
                .data="${this._variant}"
                .config="${this._config}"
                .updateParams="${this._updatedParams}"
                @fieldChange="${event => this.onFieldChange(event)}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                type: "pills",
                pillsLeftColumnClass: "col-md-1",
                pillsRightColumnClass: "col-md-11",
                buttonsVisible: false,
                defaultLayout: "vertical",
                ...this.displayConfig,
            },
            sections: [
                {
                    id: "annotationSummary",
                    name: "Summary",
                    icon: "fa-info-circle",
                    render: variant => html`
                        <cellbase-variant-annotation-summary
                            .variantAnnotation="${variant?.annotation}"
                            .consequenceTypes="${CONSEQUENCE_TYPES}"
                            .proteinSubstitutionScores="${PROTEIN_SUBSTITUTION_SCORE}"
                            .assembly="${this.opencgaSession.project.organism.assembly}">
                        </cellbase-variant-annotation-summary>
                    `,
                },
                {
                    id: "discussion",
                    title: "Discussion",
                    icon: "fa-edit",
                    elements: [
                        {
                            id: "discussion",
                            type: "input-text",
                            field: "discussion.text",
                            display: {
                                disabled: () => !this._selected,
                                placeholder: "Add your discussion here...",
                                rows: 10,
                            },
                        },
                    ],
                },
                {
                    id: "comments",
                    title: "Comments",
                    icon: "fa-comments",
                    elements: [
                        {
                            field: "comments",
                            type: "object-list",
                            display: {
                                disabled: () => !this._selected,
                                style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
                                showAddBatchListButton: false,
                                showEditItemListButton: false,
                                showDeleteItemListButton: false,
                                view: comment => {
                                    const tags = UtilsNew.commaSeparatedArray(comment.tags)
                                        .join(", ") || "-";

                                    return html`
                                        <div style="margin-bottom:1rem;">
                                            <div style="display:flex;margin-bottom:0.5rem;">
                                                <div style="padding-right:1rem;">
                                                    <i class="fas fa-comment-dots"></i>
                                                </div>
                                                <div style="font-weight:bold">
                                                    ${comment.author || "-"} - ${UtilsNew.dateFormatter(comment.date)}
                                                </div>
                                            </div>
                                            <div style="width:100%;">
                                                <div style="margin-bottom:0.5rem;">${comment.message || "-"}</div>
                                                <div class="text-muted">Tags: ${tags}</div>
                                            </div>
                                        </div>
                                    `;
                                },
                            },
                            elements: [
                                {
                                    title: "Message",
                                    field: "comments[].message",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add comment...",
                                        rows: 3
                                    }
                                },
                                {
                                    title: "Tags",
                                    field: "comments[].tags",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add tags..."
                                    }
                                },
                            ]
                        },
                    ],
                },
                {
                    id: "evidences",
                    title: "Evidences",
                    icon: "fa-list",
                    display: {
                        visible: () => !!this.reviewEvidences,
                    },
                    render: (variant, active) => html`
                        <variant-review-evidences-grid
                            .opencgaSession="${this.opencgaSession}"
                            .clinicalAnalysis="${this.clinicalAnalysis}"
                            .variant="${variant}"
                            .updatedEvidences="${this._updatedParams.evidences}"
                            .active="${active}"
                            .config="${{
                                review: this._selected,
                                geneSet: this.settings?.geneSet,
                                consequenceType: this.settings?.consequenceType,
                            }}"
                            @evidenceReviewChange="${event => this.onEvidenceReviewChange(event)}">
                        </variant-review-evidences-grid>
                    `,
                },
            ],
        };
    }

}

customElements.define("variant-review", VariantReview);
