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
import "../commons/forms/data-form.js";

export default class IndividualPharmacogenomicsView extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            individual: {
                type: Object,
            },
            opencgaSession: {
                type: Object,
            },
            active: {
                type: Boolean,
            },
        };
    }

    #init() {
        this._pharmacogenomicsData = null;
        this._loading = false;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("individual") && this.active) {
            this.loadPharmacogenomicsData();
        }

        if (changedProperties.has("active") && this.active && this.individual) {
            // Load data when tab becomes active
            this.loadPharmacogenomicsData();
        }

        if (changedProperties.has("opencgaSession")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    loadPharmacogenomicsData() {
        const sampleId = this.individual?.samples?.[0]?.id;
        const individualPharmacogenomicsFolder = this.individual?.attributes?.OPENCGA_PHARMACOGENOMICS;

        if (sampleId && individualPharmacogenomicsFolder) {
            this._loading = true;
            this._pharmacogenomicsData = null;
            this.requestUpdate();

            const resultsFile = `${individualPharmacogenomicsFolder}/results/${sampleId}.json`.replaceAll("/", ":");
            this.opencgaSession.opencgaClient.files()
                .download(resultsFile, {
                    study: this.opencgaSession.study.fqn,
                })
                .then(response => {
                    return JSON.parse(response);
                })
                .then(data => {
                    this._pharmacogenomicsData = data;
                    this._config = this.getDefaultConfig();
                })
                .catch(error => {
                    console.error("Error loading pharmacogenomics data:", error);
                    this._pharmacogenomicsData = null;
                })
                .finally(() => {
                    this._loading = false;
                    this.requestUpdate();
                });
        }
    }

    render() {
        if (!this.opencgaSession || !this.individual) {
            return nothing;
        }

        if (this._loading) {
            return html`
                <div class="d-flex justify-content-center align-items-center p-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <span class="ms-3 text-muted">Loading pharmacogenomics data...</span>
                </div>
            `;
        }

        return html`
            <data-form
                .data="${this._pharmacogenomicsData}"
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
                    title: "Summary",
                    display: {
                        defaultLayout: "horizontal",
                        visible: () => this._pharmacogenomicsData !== null,
                    },
                    elements: [
                        {
                            title: "Sample ID",
                            field: "sampleId",
                        },
                        {
                            title: "Genes Analyzed",
                            field: "alleleTyperResults",
                            type: "custom",
                            display: {
                                render: results => html`
                                    <span class="badge bg-primary">${results?.length || 0}</span>
                                `,
                            },
                        },
                        {
                            title: "Total Drugs",
                            field: "alleleTyperResults",
                            type: "custom",
                            display: {
                                render: results => {
                                    const drugSet = new Set();
                                    (results || []).forEach(geneResult => {
                                        (geneResult.alleleCalls || []).forEach(call => {
                                            (call.annotation?.drugs || []).forEach(drug => {
                                                drugSet.add(drug.name);
                                            });
                                        });
                                    });
                                    return html`
                                        <span class="badge bg-primary">${drugSet.size}</span>
                                    `;
                                },
                            },
                        },
                    ],
                },
                {
                    title: "Allele Typer Results",
                    display: {
                        visible: () => this._pharmacogenomicsData !== null,
                    },
                    elements: [
                        {
                            field: "alleleTyperResults",
                            type: "table",
                            display: {
                                maxHeight: "600px",
                                columns: [
                                    {
                                        title: "Gene",
                                        field: "gene",
                                    },
                                    {
                                        title: "Allele Calls",
                                        field: "alleleCalls",
                                        type: "custom",
                                        display: {
                                            render: alleleCalls => {
                                                const calls = alleleCalls || [];
                                                if (calls.length === 0) {
                                                    return "-";
                                                }
                                                return html`
                                                    ${calls.map(call => html`
                                                        <span class="badge bg-primary me-1">${call.allele || "-"}</span>
                                                    `)}
                                                `;
                                            },
                                        },
                                    },
                                    {
                                        title: "Associated Drugs",
                                        field: "alleleCalls",
                                        type: "custom",
                                        display: {
                                            render: alleleCalls => {
                                                // Collect unique drugs across all allele calls for this gene
                                                const drugMap = new Map();
                                                for (const call of (alleleCalls || [])) {
                                                    for (const drug of (call.annotation?.drugs || [])) {
                                                        if (!drugMap.has(drug.name)) {
                                                            drugMap.set(drug.name, drug);
                                                        }
                                                    }
                                                }
                                                if (drugMap.size === 0) {
                                                    return html`<span class="text-muted">-</span>`;
                                                }
                                                return html`
                                                    <div class="d-flex flex-wrap gap-1">
                                                        ${Array.from(drugMap.values()).map(drug => html`
                                                            <span class="badge border text-dark bg-light" title="${drug.source || ""}: ${drug.id || ""}">
                                                                ${drug.name}
                                                            </span>
                                                        `)}
                                                    </div>
                                                `;
                                            },
                                        },
                                    },
                                    {
                                        title: "Drug Count",
                                        field: "alleleCalls",
                                        type: "custom",
                                        display: {
                                            render: alleleCalls => {
                                                const drugSet = new Set();
                                                for (const call of (alleleCalls || [])) {
                                                    for (const drug of (call.annotation?.drugs || [])) {
                                                        drugSet.add(drug.name);
                                                    }
                                                }
                                                return html`
                                                    <span class="badge bg-secondary">${drugSet.size}</span>
                                                `;
                                            },
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

customElements.define("individual-pharmacogenomics-view", IndividualPharmacogenomicsView);
