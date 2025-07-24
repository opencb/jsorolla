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

    render() {
        if (!this.opencgaSession || !this.variant) {
            return nothing;
        }

        return html`
            <div class="card shadow-sm">
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
                className: "row",
                buttonsVisible: false,
                defaultLayout: "vertical",
                ...this.displayConfig,
            },
            sections: [
                {
                    id: "variant",
                    elements: [
                        {
                            title: "ID",
                            field: "id",
                            type: "custom",
                            display: {
                                bodyClassName: "align-middle",
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
                            type: "custom",
                            display: {
                                bodyClassName: "align-middle",
                                render: type => {
                                    return UtilsNew.renderHTML(VariantGridFormatter.typeFormatter(type));
                                },
                            },
                        },
                    ],
                }
            ],
        };
    }

}

customElements.define("clinical-report-variant-card", ClinicalReportVariantCard);
