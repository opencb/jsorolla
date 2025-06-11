import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import LitUtils from "../../commons/utils/lit-utils.js";
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
        this._updateParams = {};
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("variantId")) {
            this.variantIdObserver();
        }

        if (changedProperties.has("variant")) {
            this.variantObserver();
        }

        if (changedProperties.has("displayConfig") || changedProperties.has("selected")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
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
                    this._variant = response?.responses?.[0]?.results?.[0];
                    this.requestUpdate();
                })
                .catch(response => {
                    console.error(response);
                });
        }
    }

    variantObserver() {
        this._variant = this.variant; // UtilsNew.objectClone(this.variant);
    }

    onSelectChange() {
        LitUtils.dispatchCustomEvent(this, "selectChange", null, {
            selected: !this.selected,
            variant: this._variant,
        });
    }

    onStatusChange(event) {
        this._variant.status = event.currentTarget.value;
        LitUtils.dispatchCustomEvent(this, "variantChange", null, {
            variant: this._variant,
        });
    }

    onConfidenceChange(event) {
        this._variant.confidence = {
            value: event.currentTarget.value,
            author: this.opencgaSession?.user?.id,
            date: UtilsNew.getDatetime(),
        };
        LitUtils.dispatchCustomEvent(this, "variantChange", null, {
            variant: this._variant,
        });
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
            }
            this._updateParams = {};
            this.requestUpdate();
        }
        LitUtils.dispatchCustomEvent(this, "variantChange", null, {
            variant: this._variant,
        });
    }

    renderVariantSelect() {
        return html`
            <div class="alert ${this.selected ? "alert-primary" : "alert-light"} d-flex align-items-center justify-content-between gap-2 flex-grow-1">
                <label class="form-label mb-0 fw-bold">
                    ${this.selected ? html`
                        <span>This Variant is on the <b>Primary Findings</b> of the Interpretation.</span>    
                    ` : html`
                        <span>Select this Variant to add it to the <b>Primary Findings</b> of the Interpretation.</span>
                    `}
                </label>
                <button class="btn btn-sm ${this.selected ? "btn-primary" : "btn-light"} rounded-2" @click="${() => this.onSelectChange()}">
                    <i class="fa fa-check lh-1 ${this.selected ? "opacity-100" : "opacity-25 text-secondary"}"></i>
                </button>
            </div>
        `;
    }

    renderVariantStatus() {
        return html`
            <div class="alert alert-light d-flex align-items-center">
                <div class="d-flex align-items-center gap-2">
                    <label class="form-label mb-0 fw-bold">Status</label>
                    <select class="form-select form-select-sm" ?disabled="${!this.selected}" @change="${event => this.onStatusChange(event)}">
                        ${this.STATUS_VALUES.map(status => html`
                            <option value="${status}" ?selected="${this._variant?.status === status}">
                                ${status}
                            </option>
                        `)}
                    </select>
                </div>
                <div class="d-flex align-items-center gap-2 ms-3">
                    <label class="form-label mb-0 fw-bold">Confidence</label>
                    <select class="form-select form-select-sm" ?disabled="${!this.selected}" @change="${event => this.onConfidenceChange(event)}">
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

    render() {
        if (!this.opencgaSession || !this._variant) {
            return nothing;
        }

        return html`
            <div class="d-flex gap-2 mb-2">
                ${this.renderVariantSelect()}
                ${this.renderVariantStatus()}
            </div>
            <data-form
                .data="${this._variant}"
                .config="${this._config}"
                .updateParams="${this._updateParams}"
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
                    name: "Discussion",
                    icon: "fa-edit",
                    elements: [
                        {
                            id: "discussion",
                            title: "Discussion",
                            type: "input-text",
                            field: "discussion.text",
                            display: {
                                disabled: () => !this.selected,
                                placeholder: "Add your discussion here...",
                                rows: 10,
                            },
                        },
                    ],
                },
                {
                    id: "comments",
                    name: "Comments",
                    icon: "fa-comments",
                    elements: [
                        {
                            title: "Comments",
                            field: "comments",
                            type: "object-list",
                            display: {
                                disabled: () => !this.selected,
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
                    name: "Evidences",
                    icon: "fa-list",
                    render: (variant, active) => html`
                        <h3>Evidences</h3>
                        <variant-review-evidences-grid
                            .opencgaSession="${this.opencgaSession}"
                            .clinicalAnalysis="${this.clinicalAnalysis}"
                            .variant="${variant}"
                            .active="${active}">
                        </variant-review-evidences-grid>
                    `,
                },
            ],
        };
    }

}

customElements.define("variant-review", VariantReview);
