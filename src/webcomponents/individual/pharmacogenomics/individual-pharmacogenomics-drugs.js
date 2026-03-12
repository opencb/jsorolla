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

export default class IndividualPharmacogenomicsDrugs extends LitElement {

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
        const drugMap = new Map();

        results.forEach(geneResult => {
            (geneResult.alleleCalls || []).forEach(call => {
                (call.annotation?.drugs || []).forEach(drug => {
                    if (drug.variants?.length > 0 || drug.genes?.length > 0) {
                        const key = drug.name;
                        if (!drugMap.has(key)) {
                            drugMap.set(key, {
                                name: drug.name,
                                id: drug.id,
                                source: drug.source,
                                genericNames: drug.genericNames || [],
                                genes: new Set(),
                                alleles: new Set(),
                                variantCount: 0,
                                topConfidence: null,
                            });
                        }
                        const entry = drugMap.get(key);
                        entry.genes.add(geneResult.gene);
                        entry.alleles.add(call.allele);
                        (drug.variants || []).forEach(v => {
                            entry.variantCount++;
                            entry.topConfidence = this.#higherConfidence(entry.topConfidence, v.confidence);
                        });
                    }
                });
            });
        });

        const drugs = [...drugMap.values()]
            .map(d => ({
                ...d,
                genes: [...d.genes].sort(),
                alleles: [...d.alleles].sort(),
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

        this._data = {items: drugs};
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
                    <div>No pharmacogenomics drug results available.</div>
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
                            text: "Drugs",
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
                                        title: "Drug",
                                        field: "name",
                                        display: {
                                            style: {
                                                "font-weight": "bold",
                                            },
                                        },
                                    },
                                    {
                                        title: "ID",
                                        field: "id",
                                        display: {
                                            defaultValue: "-",
                                        },
                                    },
                                    {
                                        title: "Source",
                                        field: "source",
                                        display: {
                                            defaultValue: "-",
                                        },
                                    },
                                    {
                                        title: "Genes",
                                        field: "genes",
                                        type: "custom",
                                        display: {
                                            render: genes => html`
                                                ${(genes || []).map(gene => html`
                                                    <span class="badge bg-primary me-1" style="font-family:monospace">${gene}</span>
                                                `)}
                                            `,
                                        },
                                    },
                                    {
                                        title: "Alleles",
                                        field: "alleles",
                                        type: "custom",
                                        display: {
                                            render: alleles => html`
                                                ${(alleles || []).map(allele => html`
                                                    <span class="badge bg-light text-dark border me-1">${allele}</span>
                                                `)}
                                            `,
                                        },
                                    },
                                    {
                                        title: "Annotations",
                                        field: "variantCount",
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

customElements.define("individual-pharmacogenomics-drugs", IndividualPharmacogenomicsDrugs);
