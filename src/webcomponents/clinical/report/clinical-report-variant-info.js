import {LitElement, html, nothing} from "lit";
import ClinicalVariantUtils from "../variant/clinical-variant-utils.js";

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
        if (changedProperties.has("displayConfig") || changedProperties.has("variant")) {
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
        // get the evidences from the variant, filtering only those that are selected
        const evidences = (this.variant?.evidences || []).filter(evidence => {
            return evidence?.review?.select;
        });

        return {
            display: {
                separationClassName: "mb-4",
                buttonsVisible: false,
                defaultLayout: "vertical",
                ...this.displayConfig,
            },
            sections: [
                {
                    title: "Evidences",
                    display: {
                        titleClassName: "fs-4 fw-bold",
                        separationClassName: "mb-0",
                    },
                    elements: [],
                },
                ...evidences.map(evidence => ({
                    display: {
                        className: "border border-1 gorder-gray-200 rounded-2 p-3",
                        defaultLayout: "horizontal",
                    },
                    elements: [
                        {
                            title: "Clinical Significance",
                            type: "text",
                            text: () => evidence?.review?.clinicalSignificance || "-",
                            display: {
                                separationClassName: "mb-1",
                            },
                        },
                        {
                            title: "Tier",
                            type: "text",
                            text: () => evidence?.review?.tier || "-",
                            display: {
                                separationClassName: "mb-1",
                            },
                        },
                        // {
                        //     title: "ACMG Classification",
                        // },
                        {
                            title: "Discussion",
                            type: "text",
                            text: () => evidence?.review?.discussion?.text || "-",
                            display: {
                                separationClassName: "mb-1",
                            },
                        },
                        {
                            title: "Score",
                            type: "text",
                            text: () => evidence?.review?.score ?? "-",
                            display: {
                                separationClassName: "mb-1",
                            },
                        },
                        {
                            title: "Tags",
                            type: "custom",
                            display: {
                                separationClassName: "mb-0",
                                render: () => {
                                    if (!evidence?.review?.tags || evidence.review.tags.length === 0) {
                                        return "-";
                                    }
                                    return html`
                                        <div class="d-flex flex-wrap gap-1">
                                            ${evidence.review.tags.map(tag => html`
                                                <span class="badge bg-secondary">${tag}</span>
                                            `)}
                                        </div>
                                    `;
                                },
                            },
                        },
                    ],
                })),
                {
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
                            display: {
                                titleClassName: "fs-4",
                            },
                        },
                        {
                            type: "text",
                            title: "Recommendation",
                            text: data => {
                                return data?.recommendation || "-";
                            },
                            display: {
                                titleClassName: "fs-4",
                            },
                        },
                        {
                            title: "References",
                            field: "references",
                            type: "object-list",
                            display: {
                                titleClassName: "fs-4",
                                showAddBatchListButton: false,
                                showEditItemListButton: false,
                                showDeleteItemListButton: false,
                                showAddItemListButton: false,
                                view: reference => {
                                    return ClinicalVariantUtils.formatReference(reference);
                                },
                            },
                            elements: [],
                        },
                        {
                            title: "Images",
                            field: "images",
                            type: "custom",
                            display: {
                                titleClassName: "fs-4",
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
                                titleClassName: "fs-4",
                                render: (comments) => {
                                    if (!comments || comments.length === 0) {
                                        return "-";
                                    }

                                    return html`
                                        <div class="d-flex flex-column gap-2">
                                            ${comments.map(comment => html`
                                                <div class="card border border-1 border-gray-200 bg-white">
                                                    <div class="card-body">
                                                        ${ClinicalVariantUtils.formatComment(comment)}
                                                    </div>
                                                </div>
                                            `)}
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
