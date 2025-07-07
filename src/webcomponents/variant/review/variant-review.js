import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import FormUtils from "../../commons/forms/form-utils.js";
import VariantUtils from "../variant-utils.js";
import VariantGridFormatter from "../variant-grid-formatter.js";
import "../../commons/image-loader.js";
import "../../commons/forms/data-form.js";
import "../../commons/filters/pubmed-search.js";
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

    onImagesChange(event) {
        this._variant.images = event.detail.value || [];
        this._updatedParams.images = this._variant.images; // register images as updated params
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
            <div class="alert alert-light flex-grow-1 d-flex justify-content-center flex-column">
                <div class="lh-1">
                    <span class="fw-bold">${this._variant.id}</span>
                </div>
                ${consequenceTypes.length > 0 ? html`
                    <div class="mt-1 d-flex align-items-center flex-wrap column-gap-2" style="max-width:900px;">
                        ${consequenceTypes}
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
                    <option value="PRIMARY_FINDING" ?selected="${this._selected && this._primaryFinding}">PIMARY_FINDING</option>
                    <option value="SECONDARY_FINDING" ?selected="${this._selected && !this._primaryFinding}">SECONDARY_FINDING</option>
                </select>
            </div>
        `;
    }

    renderVariantStatus() {
        return html`
            <div class="alert alert-light d-flex align-items-center">
                <div class="d-flex align-items-center gap-2">
                    <label class="form-label mb-0 fw-bold">Status</label>
                    <select class="form-select form-select-sm" ?disabled="${!this._selected}" @change="${event => this.onStatusChange(event)}">
                        ${VariantUtils.VARIANT_STATUS_VALUES.map(status => html`
                            <option value="${status}" ?selected="${this._variant?.status === status}">
                                ${status}
                            </option>
                        `)}
                    </select>
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
                                    return html`
                                        <div class="mb-2">
                                            <div class="fw-bold">${reference.name || "-"}</div>
                                            <!--
                                            <div class="text-secondary">${reference.authors?.join(", ") || "-"}</div>
                                            -->
                                            <div class="text-muted d-flex align-items-center flex-row flex-wrap gap-1 fs-7">
                                                ${reference.journal ? html`
                                                    <span>${reference.journal}.</span>
                                                ` : nothing}
                                                ${reference.date ? html`
                                                    <span>${UtilsNew.dateFormatter(reference.date)}.</span>
                                                ` : nothing}
                                                ${reference.url ? html`
                                                    <span class="text-nowrap d-flex align-items-center gap-1 ms-2">
                                                        <i class="fa fa-link fs-8"></i>
                                                        <span>${reference.url || "-"}</span>
                                                    </span>
                                                ` : nothing}
                                            </div>
                                        </div>
                                    `;
                                },
                                search: {
                                    title: "Search references in PubMed",
                                    render: (currentData, onSearch) => {
                                        return html`
                                            <pubmed-search
                                                @filterChange="${event => {
                                                    onSearch({
                                                        id: event.detail.value.id,
                                                        name: event.detail.value.title, // TODO: rename to title
                                                        summary: event.detail.value.summary || "",
                                                        // authors: event.detail.value.authors || [],
                                                        date: event.detail.value.date || "",
                                                        url: `https://pubmed.ncbi.nlm.nih.gov/${event.detail.value.id}`,
                                                        journal: event.detail.value.journal || "",
                                                    });
                                                }}">
                                            </pubmed-search>
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
                                    field: "references[].name",
                                    type: "input-text",
                                    display: {
                                        disabled: true,
                                    },
                                },
                                {
                                    title: "Summary",
                                    field: "references[].summary",
                                    type: "input-text",
                                    display: {
                                        disabled: true,
                                        rows: 5,
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
            ],
        };
    }

}

customElements.define("variant-review", VariantReview);
