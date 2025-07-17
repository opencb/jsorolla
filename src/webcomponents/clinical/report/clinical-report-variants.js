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

    onViewVariant(variantId) {
        this._selectedVariant = this.variants.find(variant => variant.id === variantId);
        if (this._selectedVariant) {
            this._gridCommons.changeActiveModal("view-variant");
        }
    }

    render() {
        if (!this.opencgaSession || !this.clinicalAnalysis || !this.variants) {
            return nothing;
        }

        return html`
            <data-form
                .data="${this.variants}"
                .config="${this._config}">
            </data-form>

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
                                defaultValue: "-",
                                getData: variants => variants,
                                columns: [
                                    {
                                        title: "ID",
                                        field: "id",
                                        type: "custom",
                                        display: {
                                            render: id => html`
                                                <a class="link fw-bold" @click="${() => this.onViewVariant(id)}">
                                                    ${id}
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
