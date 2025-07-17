import {LitElement, html, nothing} from "lit";
import LitUtils from "../../commons/utils/lit-utils.js";
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
        const dataFormElement = this.querySelector(`data-form[data-role="variants"]`);

        // 1. register events listeners when the user clicks on a table row
        if (changedProperties.has("variants") || changedProperties.has("active")) {
            if (this.active && this.variants?.length > 0) {
                dataFormElement.updateComplete.then(() => {
                    Array.from(dataFormElement.querySelectorAll(`table tbody tr[data-row-index]`)).forEach(row => {
                        Array.from(row.querySelectorAll("td")).forEach(td => {
                            td.addEventListener("click", event => {
                                // console.log("td clicked", event);
                                this.onSelectVariant(event, this.variants[parseInt(row.dataset.rowIndex)]);
                            });
                        });
                    });
                });
            }
        }

        // 2. change the selected variant in the row
        // note that this should be executed every update of the component
        if (this._selectedVariant && this.active) {
            dataFormElement.updateComplete.then(() => {
                Array.from(dataFormElement.querySelectorAll(`table tbody tr[data-row-index]`)).forEach(row => {
                    const variant = this.variants[parseInt(row.dataset.rowIndex)];
                    if (variant?.id === this._selectedVariant.id) {
                        row.classList.add("selected");
                    } else {
                        row.classList.remove("selected");
                    }
                });
            });
        }
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
            <div class="row">
                <div class="col-8">
                    <data-form
                        data-role="variants"
                        .data="${this.variants}"
                        .config="${this._config}">
                    </data-form>
                </div>
                <div class="col-4"></div>
            </div>

            ${this._gridCommons.renderModals()}
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                buttonsVisible: false,
                defaultLayout: "vertical",
            },
            sections: [
                {
                    id: "variants",
                    display: {
                        buttonsVisible: false,
                        defaultLayout: "vertical",
                    },
                    elements: [
                        {
                            type: "table",
                            display: {
                                className: "table-borderless table-hover table-grid",
                                bodyRowClassName: "cursor-pointer",
                                defaultValue: "-",
                                getData: variants => variants,
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
            ],
        };
    }

}

customElements.define("clinical-report-variants", ClinicalReportVariants);
