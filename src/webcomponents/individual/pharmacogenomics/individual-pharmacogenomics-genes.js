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

export default class IndividualPharmacogenomicsGenes extends LitElement {

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
        const genes = results
            .map(geneResult => {
                const drugMap = new Map();
                let topConfidence = null;
                const alleles = [];

                (geneResult.alleleCalls || []).forEach(call => {
                    alleles.push(call.allele);
                    (call.annotation?.drugs || []).forEach(drug => {
                        if (drug.variants?.length > 0 || drug.genes?.length > 0) {
                            if (!drugMap.has(drug.name)) {
                                drugMap.set(drug.name, {
                                    name: drug.name,
                                    id: drug.id,
                                    variantCount: 0,
                                    topConfidence: null,
                                });
                            }
                            const entry = drugMap.get(drug.name);
                            (drug.variants || []).forEach(v => {
                                entry.variantCount++;
                                entry.topConfidence = this.#higherConfidence(entry.topConfidence, v.confidence);
                                topConfidence = this.#higherConfidence(topConfidence, v.confidence);
                            });
                        }
                    });
                });

                return {
                    gene: geneResult.gene,
                    diplotype: geneResult.diplotype,
                    alleles,
                    drugs: [...drugMap.values()].sort((a, b) => a.name.localeCompare(b.name)),
                    drugCount: drugMap.size,
                    topConfidence,
                };
            })
            .filter(g => g.drugCount > 0)
            .sort((a, b) => a.gene.localeCompare(b.gene));

        this._data = {items: genes};
    }

    #confidenceOrder = {"1A": 5, "1B": 4, "2A": 3, "3": 2, "4": 1};

    #higherConfidence(a, b) {
        if (!a) return b;
        if (!b) return a;
        return (this.#confidenceOrder[a] || 0) >= (this.#confidenceOrder[b] || 0) ? a : b;
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
                    <div>No pharmacogenomics gene results available.</div>
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
                            text: "Genes",
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
                                        title: "Diplotype",
                                        field: "diplotype",
                                        display: {
                                            defaultValue: "-",
                                        },
                                    },
                                    {
                                        title: "Alleles",
                                        field: "alleles",
                                        type: "custom",
                                        display: {
                                            render: alleles => html`
                                                ${(alleles || []).map(allele => html`
                                                    <span class="badge bg-primary me-1">${allele}</span>
                                                `)}
                                            `,
                                        },
                                    },
                                    {
                                        title: "Drugs",
                                        field: "drugs",
                                        type: "custom",
                                        display: {
                                            render: drugs => html`
                                                <div class="d-flex flex-column gap-1">
                                                    ${(drugs || []).slice(0, 5).map(drug => html`
                                                        <div class="d-flex align-items-center gap-1">
                                                            <span class="small">${drug.name}</span>
                                                            ${drug.topConfidence ? this.#renderConfidenceBadge(drug.topConfidence) : nothing}
                                                            <span class="text-muted small">(${drug.variantCount})</span>
                                                        </div>
                                                    `)}
                                                    ${drugs?.length > 5 ? html`
                                                        <span class="text-muted small">...and ${drugs.length - 5} more</span>
                                                    ` : nothing}
                                                </div>
                                            `,
                                        },
                                    },
                                    {
                                        title: "Top Confidence",
                                        field: "topConfidence",
                                        type: "custom",
                                        display: {
                                            headerCellClassName: "text-center",
                                            bodyCellClassName: "text-center",
                                            render: confidence => confidence ? this.#renderConfidenceBadge(confidence) : html`<span class="text-muted">-</span>`,
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

customElements.define("individual-pharmacogenomics-genes", IndividualPharmacogenomicsGenes);
