import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import FormUtils from "../../commons/forms/form-utils.js";
import VariantUtils from "../../variant/variant-utils.js";
import ClinicalVariantUtils from "./clinical-variant-utils.js";
import "../../commons/image-loader.js";
import "../../commons/forms/data-form.js";
import "../../commons/forms/tags-input.js";
import "../../commons/filters/pubmed-search.js";
import "../../variant/annotation/cellbase-variant-annotation-summary.js";
import "./clinical-variant-evidences-grid.js";

export default class ClinicalVariantReview extends LitElement {

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
            primaryFinding: {
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
        this._variant = null;
        this._selected = false;
        this._primaryFinding = true;
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

        if (changedProperties.has("primaryFinding")) {
            this._primaryFinding = !!this.primaryFinding;
            this._selected = true;
        }

        if (changedProperties.has("displayConfig") || changedProperties.has("selected") || changedProperties.has("reviewEvidences")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    updated() {
        // enable or disable the save button based on whether there are pending changes
        const buttonElement = this.closest(".modal-dialog")?.querySelector(`button[data-role="modal-save"]`);
        if (buttonElement) {
            if (this.hasUnsavedChanges()) {
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
            primaryFinding: this._primaryFinding,
            variant: {
                ...this._variant,
                comments: (this._variant?.comments || []).map(comment => ({
                    ...comment,
                    tags: UtilsNew.commaSeparatedArray(comment.tags || []),
                })),
            },
        });
    }

    hasUnsavedChanges() {
        // 1. we have made changes in the updated params
        if (Object.keys(this._updatedParams).length > 0) {
            return true;
        }
        // 2. the selected state has changed
        if (this._selected !== this.selected) {
            return true;
        }
        // 3. the primary finding state has changed
        if (this._primaryFinding !== this.primaryFinding) {
            return true;
        }
        // other case, no changes
        return false;
    }

    onSelectChange(event) {
        // note: if the value is empty, it means that the variant is not selected, but we need to mark the _primaryFinding as true
        // to make hasUnsavedChanges return the correct value
        this._primaryFinding = event.currentTarget.value !== "SECONDARY_FINDING";
        this._selected = !!event.currentTarget.value; // if the value is empty, it means that the variant is not selected
        this._config = this.getDefaultConfig();
        this.dispatchChange();
        this.requestUpdate();
    }

    onStatusChange(status) {
        this._variant.status = status;
        this._updatedParams = FormUtils.getUpdatedFields(this.variant, this._updatedParams, "status", status);
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

    onImagesChange(event) {
        this._variant.images = event.detail.value || [];
        this._updatedParams = {
            ...this._updatedParams,
            images: this._variant.images,
        };
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
        } else if (event.detail.param.startsWith("references")) {
            // this is needed to update the references list
            this._updatedParams.references = this._variant.references;
            this._updatedParams = {...this._updatedParams};
        } else if (event.detail.param === "discussion.text") {
            if (this._variant.discussion?.text) {
                this._variant.discussion.author = this.opencgaSession?.user?.id || "-";
                this._variant.discussion.date = UtilsNew.getDatetime();
            } else {
                delete this._variant.discussion.author;
                delete this._variant.discussion.date;
            }
            this._updatedParams.discussion = {
                text: this._variant.discussion?.text || "",
            };
        } else if (event.detail.param === "recommendation") {
            this._updatedParams.recommendation = this._variant.recommendation || "";
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
        const displayConsequenceType = this.variant?.annotation?.displayConsequenceType;
        const genes = VariantUtils.getGenes(this.variant);

        return html`
            <div class="alert alert-light flex-grow-1 d-flex justify-content-center flex-column">
                <div class="d-flex gap-3">
                    <span class="fw-bold">${this._variant.id}</span>
                    ${genes.length > 0 ? html`
                        <span class="text-secondary">
                            ${genes.slice(0, 5).join(", ")}
                            ${genes.length > 5 ? `... and ${genes.length - 5} more` : nothing}
                        </span>
                    ` : nothing}
                </div>
                ${displayConsequenceType ? html`
                    <div class="mt-1 d-flex align-items-center flex-wrap column-gap-2" style="max-width:900px;">
                        <span style="color:${CONSEQUENCE_TYPES.style[CONSEQUENCE_TYPES.impact[displayConsequenceType]] || "black"}">${displayConsequenceType}</span>
                    </div>
                ` : nothing}
            </div>
        `;
    }

    renderVariantSelect() {
        return html`
            <div class="alert ${this._selected ? "alert-primary" : "alert-light"} d-flex align-items-center justify-content-between gap-2">
                <label class="form-label mb-0 fw-bold" style="white-space:nowrap;">Select as: </label>
                <select class="form-select form-select-sm" @change="${event => this.onSelectChange(event)}">
                    <option value="">Not selected</option>
                    <option value="PRIMARY_FINDING" ?selected="${this._selected && this._primaryFinding}">PRIMARY_FINDING</option>
                    <option value="SECONDARY_FINDING" ?selected="${this._selected && !this._primaryFinding}">SECONDARY_FINDING</option>
                </select>
            </div>
        `;
    }

    renderVariantStatusItem(status) {
        return html`
            <div class="d-flex align-items-center gap-2">
                <div class="d-block ${VariantUtils.getStatusColor(status)} rounded-circle border border-white" style="width:1rem;height:1rem;"></div>
                <div class="lh-1 py-1">${status}</div>
            </div>
        `;
    }

    renderVariantStatus() {
        return html`
            <div class="alert alert-light d-flex align-items-center">
                <div class="d-flex align-items-center gap-2">
                    <label class="form-label mb-0 fw-bold">Status</label>
                    <div class="dropdown">
                        <button class="btn btn-light bg-white dropdown-toggle d-flex align-items-center gap-1" data-bs-toggle="dropdown">
                            ${this.renderVariantStatusItem(this._variant?.status || "NOT_REVIEWED")}
                        </button>
                        <div class="dropdown-menu dropdown-menu-end">
                            ${VariantUtils.VARIANT_STATUS_VALUES.map(status => html`
                                <div class="dropdown-item ${this._variant?.status === status ? "active" : "cursor-pointer"}" @click="${() => this.onStatusChange(status)}">
                                    ${this.renderVariantStatusItem(status)}
                                </div>
                            `)}
                        </div>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-2 ms-3">
                    <label class="form-label mb-0 fw-bold">Confidence</label>
                    <select class="form-select form-select-sm" ?disabled="${!this._selected}" @change="${event => this.onConfidenceChange(event)}">
                        ${VariantUtils.VARIANT_CONFIDENCE_VALUES.map(confidence => html`
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

        return html`
            ${this.hasUnsavedChanges() ? html`
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
                    id: "evidences",
                    title: "Evidences",
                    icon: "fa-list",
                    display: {
                        visible: () => !!this.reviewEvidences,
                    },
                    render: (variant, active) => html`
                        <clinical-variant-evidences-grid
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
                        </clinical-variant-evidences-grid>
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
                    id: "recommendation",
                    title: "Recommendation",
                    icon: "fa-notes-medical",
                    elements: [
                        {
                            id: "recommendation",
                            type: "input-text",
                            field: "recommendation",
                            display: {
                                disabled: () => !this._selected,
                                placeholder: "Add your recommendation here...",
                                rows: 10,
                            },
                        },
                    ],
                },
                {
                    id: "references",
                    title: "References",
                    icon: "fa-bookmark",
                    elements: [
                        {
                            field: "references",
                            type: "object-list",
                            display: {
                                disabled: () => !this._selected,
                                showAddBatchListButton: false,
                                showEditItemListButton: false,
                                showDeleteItemListButton: true,
                                view: reference => {
                                    return ClinicalVariantUtils.formatReference(reference);
                                },
                                search: {
                                    title: "Search references in PubMed",
                                    render: (currentData, onSearch) => {
                                        return html`
                                            <div class="mb-2">
                                                <pubmed-search
                                                    @filterChange="${event => {
                                                        onSearch({
                                                            id: event.detail.value.id,
                                                            title: event.detail.value.title,
                                                            summary: event.detail.value.summary || "",
                                                            authors: event.detail.value.authors || [],
                                                            date: event.detail.value.date || "",
                                                            url: `https://pubmed.ncbi.nlm.nih.gov/${event.detail.value.id}`,
                                                            journal: event.detail.value.journal || "",
                                                        });
                                                    }}">
                                                </pubmed-search>
                                            </div>
                                        `;
                                    },
                                },
                            },
                            elements: [
                                {
                                    title: "ID",
                                    field: "references[].id",
                                    type: "input-text",
                                    display: {
                                        disabled: true,
                                    },
                                },
                                {
                                    title: "Title",
                                    field: "references[].title",
                                    type: "input-text",
                                    display: {
                                        disabled: true,
                                    },
                                },
                                {
                                    title: "Authors",
                                    field: "references[].authors",
                                    type: "custom",
                                    display: {
                                        disabled: true,
                                        render: authors => html`
                                            <input type="text" class="form-control" .value="${authors?.join(", ") || ""}" disabled />
                                        `,
                                    },
                                },
                                {
                                    title: "Date",
                                    field: "references[].date",
                                    type: "input-date",
                                    display: {
                                        disabled: true,
                                    },
                                },
                                {
                                    title: "URL",
                                    field: "references[].url",
                                    type: "input-text",
                                    display: {
                                        disabled: true,
                                        placeholder: "https://pubmed.ncbi.nlm.nih.gov/12345678",
                                    },
                                },
                                {
                                    title: "Journal",
                                    field: "references[].journal",
                                    type: "input-text",
                                    display: {
                                        disabled: true,
                                        placeholder: "Nature, Science, etc.",
                                    },
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "images",
                    title: "Images",
                    icon: "fa-image",
                    render: (variant, active) => html`
                        <image-loader
                            .images="${variant?.images || []}"
                            .active="${active}"
                            @imagesChange="${event => this.onImagesChange(event)}"
                        </image-loader>
                    `,
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
                                    return html`
                                        <div class="w-full mb-3">
                                            ${ClinicalVariantUtils.formatComment(comment)}
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
                                    type: "custom",
                                    display: {
                                        render: (tags, onFilterChange) => html`
                                            <tags-input
                                                .value="${tags || []}"
                                                @filterChange="${event => onFilterChange(event.detail.value)}">
                                            </tags-input>
                                        `,
                                    },
                                },
                            ]
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("clinical-variant-review", ClinicalVariantReview);
