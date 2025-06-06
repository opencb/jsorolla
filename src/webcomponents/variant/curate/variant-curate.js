import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import "../../commons/forms/data-form.js";
import "../annotation/cellbase-variant-annotation-summary.js";
import "../../clinical/interpretation/clinical-interpretation-variant-review.js";
import "./variant-curate-evidences-grid.js";

export default class VariantCurate extends LitElement {

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
        this._selected = false;
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

        if (changedProperties.has("displayConfig")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }

        super.update(changedProperties);
    }

    updated(changedProperties) {
        // if (changedProperties.has("selected")) {
        //     this.querySelector(`#${this._prefix}SelectCheckbox`).checked = this._selected;
        // }
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
        this._variant = UtilsNew.objectClone(this.variant);
    }

    onSelectChange() {
        this._selected = !this._selected;
        this.requestUpdate();
    }

    onStatusChange(event) {
        // TODO
    }

    onConfidenceChange(event) {
        // TODO
    }

    renderVariantSelect() {
        return html`
            <div class="alert ${this._selected ? "alert-primary" : "alert-light"} d-flex align-items-center justify-content-between gap-2 flex-grow-1">
                <label class="form-label mb-0 fw-bold">
                    ${this._selected ? html`
                        <span>This Variant is on the <b>Primary Findings</b> of the Interpretation.</span>    
                    ` : html`
                        <span>Select this Variant to add it to the <b>Primary Findings</b> of the Interpretation.</span>
                    `}
                </label>
                <button class="btn btn-sm ${this._selected ? "btn-primary" : "btn-light"} rounded-2" @click="${() => this.onSelectChange()}">
                    <i class="fa fa-check lh-1 ${this._selected ? "opacity-100" : "opacity-25 text-secondary"}"></i>
                </button>
            </div>
        `;
    }

    renderVariantStatus() {
        return html`
            <div class="alert alert-light d-flex align-items-center">
                <div class="d-flex align-items-center gap-2">
                    <label class="form-label mb-0 fw-bold">Status</label>
                    <select class="form-select form-select-sm" ?disabled="${!this._selected}">
                        ${this.STATUS_VALUES.map(status => html`
                            <option value="${status}" ?selected="${this._variant?.status === status}">
                                ${status}
                            </option>
                        `)}
                    </select>
                </div>
                <div class="d-flex align-items-center gap-2 ms-3">
                    <label class="form-label mb-0 fw-bold">Confidence</label>
                    <select class="form-select form-select-sm" ?disabled="${!this._selected}">
                        ${this.CONFIDENCE_VALUES.map(confidence => html`
                            <option value="${confidence}" ?selected="${this._variant?.confidence === confidence}">
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
                .config="${this._config}">
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
                    render: variant => html`
                        <clinical-interpretation-variant-review
                            .opencgaSession="${this.opencgaSession}"
                            .variant="${variant}"
                            .mode="${"form"}"
                            @variantChange="${e => {
                                // TODO
                            }}">
                        </clinical-interpretation-variant-review>
                    `,
                },
                {
                    id: "comments",
                    name: "Comments",
                    icon: "fa-comments",
                    render: variant => html``,
                },
                {
                    id: "evidences",
                    name: "Evidences",
                    icon: "fa-list",
                    render: (variant, active) => html`
                        <h3>Evidences</h3>
                        <variant-curate-evidences-grid
                            .opencgaSession="${this.opencgaSession}"
                            .clinicalAnalysis="${this.clinicalAnalysis}"
                            .variant="${variant}"
                            .active="${active}">
                        </variant-curate-evidences-grid>
                    `,
                },
            ],
        };
    }

}

customElements.define("variant-curate", VariantCurate);
