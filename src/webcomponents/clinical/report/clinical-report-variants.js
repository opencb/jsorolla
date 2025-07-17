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
                                className: "table-borderless table-hover table-grid",
                                defaultValue: "-",
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
