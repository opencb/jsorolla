import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import GridCommons from "../../commons/grid-commons.js";
import "../../variant/interpretation/variant-interpreter-view.js";

export default class ClinicalReportVariants extends LitElement {

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
            variants: {
                type: Array,
            },
            active: {
                type: Boolean,
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this._config = this.getDefaultConfig();
        this._selectedVariant = null;
        this._gridCommons = new GridCommons(null, this, null);

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
                        .settings="${this._config}"
                        .clinicalAnalysis="${this.clinicalAnalysis}"
                        .toolId="${"variant-interpreter-report"}"
                        .variant="${this._selectedVariant}">
                    </variant-interpreter-view>
                `,
            }),
        });
    }

    update(changedProperties) {
        if (changedProperties.has("variants")) {
            this._selectedVariant = null; // reset selected variant when variants change
            if (this.variants?.length > 0) {
                this._selectedVariant = this.variants[0]; // select the first variant by default
            }
        }

        super.update(changedProperties);
    }

    updated(changedProperties) {
        this.querySelector(`data-form`)?.updateComplete?.then(() => {
            // 1. register events listeners when the user clicks on a table row
            if (changedProperties.has("variants") || changedProperties.has("active")) {
                if (this.active && this.variants?.length > 0) {
                    Array.from(this.querySelectorAll(`data-form table tbody tr[data-row-index]`)).forEach(row => {
                        Array.from(row.querySelectorAll("td")).forEach(td => {
                            td.addEventListener("click", event => {
                                // console.log("td clicked", event);
                                this.onSelectVariant(event, this.variants[parseInt(row.dataset.rowIndex)]);
                            });
                        });
                    });
                }
            }

            // 2. change the selected variant in the row
            // note that this should be executed every update of the component
            if (this._selectedVariant && this.active) {
                Array.from(this.querySelectorAll(`data-form table tbody tr[data-row-index]`)).forEach(row => {
                    const variant = this.variants[parseInt(row.dataset.rowIndex)];
                    if (variant?.id === this._selectedVariant.id) {
                        row.classList.add("selected");
                    } else {
                        row.classList.remove("selected");
                    }
                });
            }
        });
    }

    onSelectVariant(event, variant) {
        event.preventDefault();
        this._selectedVariant = variant;
        this.requestUpdate();
    }

    onViewVariant(event, variantId) {
        event.preventDefault();
        event.stopPropagation();
        this._selectedVariant = this.variants.find(variant => variant.id === variantId);
        if (this._selectedVariant) {
            this._gridCommons.changeActiveModal("view-variant");
        }
    }

    render() {
        if (!this.opencgaSession || !this.clinicalAnalysis || !this.variants || !this.active) {
            return nothing;
        }

        return html`
            <data-form
                .data="${{
                    variants: this.variants,
                    selectedVariant: this._selectedVariant,
                }}"
                .config="${this._config}">
            </data-form>

            ${this._gridCommons.renderModals()}
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                className: "row",
                buttonsVisible: false,
                defaultLayout: "vertical",
                layout: [
                    {
                        id: "variants-table",
                        className: "col-8",
                    },
                    {
                        id: "variant-detail",
                        className: "col-4",
                    },
                ],
            },
            sections: [
                {
                    id: "variants-table",
                    display: {
                        buttonsVisible: false,
                        defaultLayout: "vertical",
                    },
                    elements: [
                        {
                            type: "table",
                            field: "variants",
                            display: {
                                className: "table-borderless table-hover table-grid",
                                bodyRowClassName: "cursor-pointer",
                                defaultValue: "-",
                                columns: [
                                    {
                                        title: "ID",
                                        field: "id",
                                        type: "custom",
                                        display: {
                                            render: id => html`
                                                <a class="link fw-bold" @click="${event => this.onViewVariant(event, id)}">
                                                    <span>${id}</span>
                                                </>
                                            `,
                                        },
                                    },
                                    {
                                        title: "Type",
                                        field: "type",
                                    },
                                    {
                                        title: "Variant Review",
                                        display: {
                                            headerClassName: "text-center",
                                            columns: [
                                                {
                                                    title: "Status",
                                                    field: "status",
                                                    display: {
                                                        headerClassName: "text-center",
                                                        bodyClassName: "text-center",
                                                    },
                                                },
                                                {
                                                    title: "Confidence",
                                                    field: "confidence.value",
                                                    display: {
                                                        headerClassName: "text-center",
                                                        bodyClassName: "text-center",
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                },
                {
                    id: "variant-detail",
                    display: {
                        buttonsVisible: false,
                        defaultLayout: "vertical",
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
                    ],
                },
            ],
        };
    }

}

customElements.define("clinical-report-variants", ClinicalReportVariants);
