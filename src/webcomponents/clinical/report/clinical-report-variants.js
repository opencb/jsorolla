import {LitElement, html, nothing} from "lit";
import LitUtils from "../../commons/utils/lit-utils.js";

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
                                getData: variants => variants,
                                columns: [
                                    {
                                        title: "ID",
                                        field: "id",
                                    },
                                    {
                                        title: "Type",
                                        field: "type",
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
