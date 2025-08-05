import {LitElement, html, nothing} from "lit";
import BioinfoUtils from "../../../core/bioinfo/bioinfo-utils.js";
import ClinicalVariantUtils from "../variant/clinical-variant-utils.js";
import VariantGridFormatter from "../../variant/variant-grid-formatter.js";

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
                    elements: [
                        {
                            type: "text",
                            text: "No evidences sected for this variant.",
                            display: {
                                visible: evidences.length === 0,
                            },
                        },
                    ],
                },
                ...evidences.map(evidence => ({
                    display: {
                        className: "border border-1 gorder-gray-200 rounded-3 p-3",
                        defaultLayout: "horizontal",
                    },
                    elements: [
                        {
                            title: "Gene",
                            type: "custom",
                            display: {
                                separationClassName: "mb-1",
                                render: () => html`
                                    <a class="d-inline-flex gap-1 align-items-center text-decoration-none" href="${BioinfoUtils.getGeneNameLink(evidence.genomicFeature.geneName)}" target="_blank">
                                        <span>${evidence.genomicFeature.geneName}</span>
                                        <i class="fas fa-external-link-alt fs-8"></i>
                                    </a>
                                    ${evidence?.genomicFeature?.id ? html`
                                        (<a class="d-inline-flex gap-1 align-items-center text-decoration-none" href="${BioinfoUtils.getGeneLink(evidence.genomicFeature.id)}" target="_blank">
                                            <span>${evidence.genomicFeature.id || ""}</span>
                                            <i class="fas fa-external-link-alt fs-8"></i>
                                        </a>)
                                    ` : nothing}
                                `,
                            },
                        },
                        {
                            title: "Transcript",
                            type: "custom",
                            display: {
                                separationClassName: "mb-1",
                                render: () => html`
                                    <a class="d-inline-flex gap-1 align-items-center text-decoration-none" href="${BioinfoUtils.getTranscriptLink(evidence.genomicFeature.transcriptId)}" target="_blank">
                                        <span>${evidence.genomicFeature.transcriptId}</span>
                                        <i class="fas fa-external-link-alt fs-8"></i>
                                    </a>
                                `,
                            },
                        },
                        {
                            title: "Consequence Type",
                            type: "custom",
                            display: {
                                separationClassName: "mb-1",
                                render: () => {
                                    const items = (evidence?.genomicFeature?.consequenceTypes || []).map(so => {
                                        const color = CONSEQUENCE_TYPES.style[CONSEQUENCE_TYPES.impact[so.name]] || "black";
                                        return html`
                                            <div class="d-flex align-items-center gap-2" style="color:${color};">
                                                <span>${so.name}</span>
                                                <a href="${BioinfoUtils.getSequenceOntologyLink(so.accession)}" target="_blank">
                                                    <i class="fas fa-external-link-alt fs-8"></i>
                                                </a>
                                            </div>
                                        `;
                                    });
                                    return items?.length > 0 ? items : "-";
                                },
                            },
                        },
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
                        {
                            title: "ACMG Classification",
                            type: "table",
                            display: {
                                defaultValue: "No ACMG classification",
                                // defaultLayout: "vertical",
                                className: "table-grid",
                                headerCellClassName: "bg-transparent",
                                getData: () => evidence?.review?.acmg || {},
                                separationClassName: "mb-1",
                                columns: [
                                    {
                                        title: "Classification",
                                        field: "classification",
                                        type: "text",
                                    },
                                    {
                                        title: "Strength",
                                        field: "strength",
                                        type: "text",
                                    },
                                    {
                                        title: "Author",
                                        field: "author",
                                        type: "text",
                                    },
                                    {
                                        title: "Comment",
                                        field: "comment",
                                        type: "text",
                                    },
                                ],
                            },
                        },
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
                            text: () => `${evidence?.review?.score ?? "-"}`,
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
                    title: "Discussion",
                    display: {
                        titleClassName: "fs-4 fw-bold",
                    },
                    elements: [
                        {
                            type: "text",
                            text: data => {
                                return data?.discussion?.text || "-";
                            },
                        },
                    ],
                },
                {
                    title: "Recommendation",
                    display: {
                        titleClassName: "fs-4 fw-bold",
                    },
                    elements: [
                        {
                            type: "text",
                            text: data => {
                                return data?.recommendation || "-";
                            },
                        },
                    ],
                },
                {
                    title: "References",
                    display: {
                        titleClassName: "fs-4 fw-bold",
                    },
                    elements: [
                        {
                            field: "references",
                            type: "object-list",
                            display: {
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
                    ],
                },
                {
                    title: "Images",
                    display: {
                        titleClassName: "fs-4 fw-bold",
                    },
                    elements: [
                        {
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
                                                <div class="col-6 mb-4">
                                                    <div class="d-flex align-items-center justify-content-center p-3 bg-white rounded-3 border" style="height:160px;">
                                                        <img src="${image}" style="max-width:100%;max-height:100%;" />
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
                {
                    title: "Comments",
                    display: {
                        titleClassName: "fs-4 fw-bold",
                    },
                    elements: [
                        {
                            field: "comments",
                            type: "custom",
                            display: {
                                render: (comments) => {
                                    if (!comments || comments.length === 0) {
                                        return "-";
                                    }

                                    return html`
                                        <div class="d-flex flex-column gap-2">
                                            ${comments.map(comment => html`
                                                <div class="p-3 border border-1 border-gray-200 rounded-3">
                                                    ${ClinicalVariantUtils.formatComment(comment)}
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
