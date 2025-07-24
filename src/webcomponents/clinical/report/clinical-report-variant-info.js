import {LitElement, html, nothing} from "lit";
import ClinicalReportFormatter from "./clinical-report-formatter.js";

export default class ClinicalReportVariantInfo extends LitElement {

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
                type: Array,
            },
            active: {
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

    render() {
        if (!this.opencgaSession || !this.variant || !this.active) {
            return nothing;
        }

        return html`
            <data-form
                .data="${this.variant}"
                .config="${this._config}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                buttonsVisible: false,
                defaultLayout: "vertical",
                layout: [
                    {
                        id: "variant-header",
                        className: "mb-3",
                    },
                    {
                        id: "variant-content",
                        className: "overflow-auto",
                        style: "max-height: 90vh",
                    },
                ],
            },
            sections: [
                {
                    id: "variant-header",
                    display: {
                        buttonsVisible: false,
                    },
                    elements: [
                        {
                            type: "text",
                            text: data => {
                                return `Variant ${data.selectedVariant?.id || "-"}`;
                            },
                            display: {
                                textClassName: "fw-bold fs-4",
                            },
                        },
                    ],
                },
                {
                    id: "variant-content",
                    display: {
                        buttonsVisible: false,
                        defaultLayout: "vertical",
                    },
                    elements: [
                        {
                            type: "text",
                            title: "Discussion",
                            text: data => {
                                return data.selectedVariant?.discussion?.text || "-";
                            },
                        },
                        {
                            type: "text",
                            title: "Recommendation",
                            text: data => {
                                return data.selectedVariant?.recommendation || "-";
                            },
                        },
                        {
                            title: "References",
                            field: "selectedVariant.references",
                            type: "object-list",
                            display: {
                                showAddBatchListButton: false,
                                showEditItemListButton: false,
                                showDeleteItemListButton: false,
                                showAddItemListButton: false,
                                view: reference => {
                                    return ClinicalReportFormatter.formatReference(reference);
                                },
                            },
                            elements: [],
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("clinical-report-variant-info", ClinicalReportVariantInfo);
