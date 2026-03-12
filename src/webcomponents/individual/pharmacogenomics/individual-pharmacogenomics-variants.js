/**
 * Copyright 2015-2019 OpenCB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {LitElement, html, nothing} from "lit";
import "../../commons/forms/data-form.js";

export default class IndividualPharmacogenomicsVariants extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            pharmacogenomicsData: {
                type: Object,
            },
            active: {
                type: Boolean,
            },
            opencgaSession: {
                type: Object,
            },
        };
    }

    #init() {
        this._data = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("pharmacogenomicsData")) {
            this._processData();
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    _processData() {
        const results = this.pharmacogenomicsData?.alleleTyperResults || [];
        const variants = [];

        results.forEach(geneResult => {
            (geneResult.alleleCalls || []).forEach(call => {
                (call.annotation?.drugs || []).forEach(drug => {
                    (drug.variants || []).forEach(variant => {
                        variants.push({
                            gene: geneResult.gene,
                            allele: call.allele,
                            drugName: drug.name,
                            drugId: drug.id,
                            haplotypes: variant.haplotypes || [],
                            confidence: variant.confidence,
                            phenotypes: variant.phenotypes || [],
                            phenotypeTypes: variant.phenotypeTypes || [],
                            evidenceCount: (variant.evidences || []).length,
                            url: variant.url,
                        });
                    });
                });
            });
        });

        this._data = {items: variants};
    }

    #renderConfidenceBadge(confidence) {
        const colors = {"1A": "danger", "1B": "warning", "2A": "info", "3": "secondary", "4": "light"};
        const color = colors[confidence] || "light";
        const textClass = color === "light" ? "text-dark border" : "";
        return html`<span class="badge bg-${color} ${textClass}">Level ${confidence}</span>`;
    }

    render() {
        if (!this._data?.items?.length) {
            return html`
                <div class="alert alert-light border-0 d-flex flex-column align-items-center gap-1 p-4">
                    <i class="fas fa-info-circle fs-3"></i>
                    <div>No pharmacogenomics variant annotations available.</div>
                </div>
            `;
        }

        return html`
            <data-form
                .data="${this._data}"
                .config="${this._config}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                buttonsVisible: false,
            },
            sections: [
                {
                    display: {
                        className: "border border-1 border-gray-200 rounded-4 p-4 bg-white",
                    },
                    elements: [
                        {
                            type: "text",
                            text: "Variant Annotations",
                            display: {
                                className: "mb-2 fs-5 fw-bold",
                            },
                        },
                        {
                            field: "items",
                            type: "table",
                            display: {
                                className: "table-borderless table-grid mb-0",
                                headerCellClassName: "bg-white",
                                bodyRowClassName: "bg-gray-100",
                                bodyCellClassName: "align-middle",
                                columns: [
                                    {
                                        title: "Gene",
                                        field: "gene",
                                        display: {
                                            style: {
                                                "font-weight": "bold",
                                                "font-family": "monospace",
                                            },
                                        },
                                    },
                                    {
                                        title: "Allele",
                                        field: "allele",
                                        type: "custom",
                                        display: {
                                            render: allele => html`
                                                <span class="badge bg-primary">${allele}</span>
                                            `,
                                        },
                                    },
                                    {
                                        title: "Drug",
                                        field: "drugName",
                                        display: {
                                            style: {
                                                "font-weight": "bold",
                                            },
                                        },
                                    },
                                    {
                                        title: "Haplotypes",
                                        field: "haplotypes",
                                        type: "custom",
                                        display: {
                                            render: haplotypes => html`
                                                <span class="small">${(haplotypes || []).join(", ") || "-"}</span>
                                            `,
                                        },
                                    },
                                    {
                                        title: "Confidence",
                                        field: "confidence",
                                        type: "custom",
                                        display: {
                                            headerCellClassName: "text-center",
                                            bodyCellClassName: "text-center",
                                            render: confidence => confidence ? this.#renderConfidenceBadge(confidence) : html`<span class="text-muted">-</span>`,
                                        },
                                    },
                                    {
                                        title: "Phenotypes",
                                        field: "phenotypes",
                                        type: "custom",
                                        display: {
                                            render: phenotypes => html`
                                                <span class="small">${(phenotypes || []).join(", ") || "-"}</span>
                                            `,
                                        },
                                    },
                                    {
                                        title: "Type",
                                        field: "phenotypeTypes",
                                        type: "custom",
                                        display: {
                                            render: types => html`
                                                ${(types || []).map(t => html`
                                                    <span class="badge bg-light text-dark border me-1">${t}</span>
                                                `)}
                                            `,
                                        },
                                    },
                                    {
                                        title: "Evidences",
                                        field: "evidenceCount",
                                        type: "custom",
                                        display: {
                                            headerCellClassName: "text-center",
                                            bodyCellClassName: "text-center",
                                            render: count => html`
                                                <span class="badge bg-secondary">${count}</span>
                                            `,
                                        },
                                    },
                                    {
                                        title: "",
                                        field: "url",
                                        type: "custom",
                                        display: {
                                            bodyCellClassName: "text-center",
                                            render: url => url ? html`
                                                <a href="${url}" target="_blank" class="text-decoration-none" title="View in ClinPGx">
                                                    <i class="fas fa-external-link-alt"></i>
                                                </a>
                                            ` : nothing,
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

customElements.define("individual-pharmacogenomics-variants", IndividualPharmacogenomicsVariants);
