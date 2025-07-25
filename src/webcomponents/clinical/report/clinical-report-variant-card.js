import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import VariantUtils from "../../variant/variant-utils.js";
import VariantGridFormatter from "../../variant/variant-grid-formatter.js";

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
            variant: {
                type: Object,
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

    onViewVariant(event, variantId) {
        event.stopPropagation();
    }

    render() {
        if (!this.opencgaSession || !this.variant) {
            return nothing;
        }

        return html`
            <div class="card shadow-sm">
                <div class="card-body">
                    <data-form
                        .data="${this.variant}"
                        .config="${this._config}">
                    </data-form>
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                className: "row",
                buttonsVisible: false,
                defaultLayout: "horizontal",
                ...this.displayConfig,
            },
            sections: [
                {
                    id: "variant",
                    display: {
                        separationClass: "mb-0",
                    },
                    elements: [
                        {
                            field: "id",
                            type: "custom",
                            display: {
                                separationClass: "mb-1",
                                render: id => html`
                                    <a class="link fw-bold" @click="${event => this.onViewVariant(event, id)}">
                                        <span class="fs-5">${id}</span>
                                    </>
                                `,
                            },
                        },
                        {
                            title: "Type",
                            field: "type",
                            type: "custom",
                            display: {
                                separationClass: "mb-1",
                                render: type => {
                                    return UtilsNew.renderHTML(VariantGridFormatter.typeFormatter(type));
                                },
                            },
                        },
                        {
                            title: "Genes",
                            type: "custom",
                            display: {
                                separationClass: "mb-1",
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
                                separationClass: "mb-0",
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
