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
                ...this.displayConfig,
            },
            sections: [
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
                                return data?.discussion?.text || "-";
                            },
                        },
                        {
                            type: "text",
                            title: "Recommendation",
                            text: data => {
                                return data?.recommendation || "-";
                            },
                        },
                        {
                            title: "References",
                            field: "references",
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
                        {
                            title: "Images",
                            field: "images",
                            type: "custom",
                            display: {
                                render: (images) => {
                                    if (!images || images.length === 0) {
                                        return "-";
                                    }

                                    return html`
                                        <div class="row">
                                            ${images.map(image => html`
                                                <div class="col-6">
                                                    <div class="d-flex align-items-center justify-content-center p-3 bg-white rounded-2 border" style="height:160px;">
                                                        <img src="${image}" style="max-width:100%;max-height:100%;" />
                                                    </div>
                                                </div>
                                            `)}
                                        </div>
                                    `;
                                },
                            },
                        },
                        {
                            title: "Comments",
                            field: "comments",
                            type: "custom",
                            display: {
                                render: (comments) => {
                                    if (!comments || comments.length === 0) {
                                        return "-";
                                    }

                                    return html`
                                        <div class="d-flex flex-column gap-2">
                                            ${comments.map(comment => ClinicalReportFormatter.formatComment(comment))}
                                        </div>
                                    `;
                                },
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("clinical-report-variant-info", ClinicalReportVariantInfo);
