import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import VariantUtils from "../../variant/variant-utils.js";
import VariantGridFormatter from "../../variant/variant-grid-formatter.js";
import LitUtils from "../../commons/utils/lit-utils.js";

export default class ClinicalReportVariantCard extends LitElement {

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
                type: Object
            },
            interpretationId: {
                type: String,
            },
            variant: {
                type: Object,
            },
            selected: {
                type: Boolean,
            },
            displayConfig: {
                type: Object
            }
        };
    }

    #init() {
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    onVariantInfo(event) {
        event.stopPropagation();
        LitUtils.dispatchCustomEvent(this, "variantInfo", null, {
            variant: this.variant,
            interpretationId: this.interpretationId,
        });
    }

    onVariantReviewInfo(event) {
        event.stopPropagation();
        LitUtils.dispatchCustomEvent(this, "variantReviewInfo", null, {
            variant: this.variant,
            interpretationId: this.interpretationId,
        });
    }

    onVariantReviewUpdate(event) {
        event.stopPropagation();
        LitUtils.dispatchCustomEvent(this, "variantReviewUpdate", null, {
            variant: this.variant,
            interpretationId: this.interpretationId,
        });
    }

    render() {
        if (!this.opencgaSession || !this.variant) {
            return nothing;
        }

        return html`
            <div class="p-4 rounded-4 shadow-sm border cursor-pointer ${this.selected ? "bg-gray-100 border-primary" : "bg-white border-gray-200"}" @click="${event => this.onVariantReviewInfo(event)}">
                <data-form
                    .data="${this.variant}"
                    .config="${this._config}">
                </data-form>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                buttonsVisible: false,
                defaultLayout: "horizontal",
                ...this.displayConfig,
            },
            sections: [
                {
                    id: "variant",
                    display: {
                        separationClassName: "mb-0",
                        titleWidth: 4,
                    },
                    elements: [
                        {
                            type: "custom",
                            display: {
                                separationClassName: "mb-2",
                                render: data => html`
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div class="d-flex align-items-center">
                                            <a class="link fw-bold" @click="${event => this.onVariantInfo(event)}">
                                                <span class="fs-5">${data.id}</span>
                                            </a>
                                        </div>
                                        <div class="d-flex align-items-center gap-2">
                                            <button class="btn btn-sm btn-light" @click="${event => this.onVariantReviewUpdate(event)}">
                                                <i class="fa fa-edit pe-1"></i>
                                                <span>Update Review</span>
                                            </button>
                                        </div>
                                    </div>
                                `,
                            },
                        },
                        {
                            title: "Type",
                            field: "type",
                            type: "custom",
                            display: {
                                separationClassName: "mb-1",
                                render: type => {
                                    return UtilsNew.renderHTML(VariantGridFormatter.typeFormatter(type));
                                },
                            },
                        },
                        {
                            title: "Genes",
                            type: "custom",
                            display: {
                                separationClassName: "mb-1",
                                render: data => {
                                    const genes = VariantUtils.getGenes(data);
                                    return (genes.slice(0, 5).join(", ") || "-") + (genes.length > 5 ? `... and ${genes.length - 5} more` : "");
                                },
                            },
                        },
                        {
                            title: "Consequence Type",
                            field: "annotation.displayConsequenceType",
                            type: "custom",
                            display: {
                                separationClassName: "mb-0",
                                render: displayConsequenceType => html`
                                    <span style="color:${CONSEQUENCE_TYPES.style[CONSEQUENCE_TYPES.impact[displayConsequenceType]] || "black"}">
                                        ${displayConsequenceType || "-"}
                                    </span>
                                `,
                            },
                        },
                    ],
                }
            ],
        };
    }

}

customElements.define("clinical-report-variant-card", ClinicalReportVariantCard);
