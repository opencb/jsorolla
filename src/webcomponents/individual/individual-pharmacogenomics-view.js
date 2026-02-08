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
import data from "../clinical/pharmacogenomics/pharmacogenomics_results.jsonl";
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
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("individual") && this.active) {
            this._loadPharmacogenomicsData();
        }

        if (changedProperties.has("active") && this.active && this.individual) {
            // Load data when tab becomes active
            this._loadPharmacogenomicsData();
        }

        if (changedProperties.has("opencgaSession")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    _loadPharmacogenomicsData() {
        this._pharmacogenomicsData = null;

        // Get the sample ID from the first sample in the individual
        const sampleId = this.individual?.samples?.[0]?.id;
        console.log("Individual:", this.individual?.id);
        console.log("Looking for sample ID:", sampleId);
        console.log("Individual samples:", this.individual?.samples);

        if (!sampleId) {
            console.warn("No sample ID found for individual:", this.individual?.id);
            this.requestUpdate();
            return;
        }

        try {
            // Parse JSONL data - one JSON object per line
            const allResults = data
                .trim()
                .split("\n")
                .map((line, index) => {
                    try {
                        return JSON.parse(line);
                    } catch (e) {
                        console.error(`Error parsing line ${index + 1}:`, e);
                        return null;
                    }
                })
                .filter(result => result !== null);

            console.log("Total results parsed:", allResults.length);
            console.log("Available sample IDs:", allResults.map(r => r.sampleId));

            // Find the matching sample by sampleId
            this._pharmacogenomicsData = allResults.find(result => result.sampleId === sampleId);

            if (this._pharmacogenomicsData) {
                console.log("Found pharmacogenomics data for sample:", sampleId);
            } else {
                console.warn(`No pharmacogenomics data found for sample: ${sampleId}`);
                console.warn("Available samples:", allResults.map(r => r.sampleId).join(", "));
            }
        } catch (error) {
            console.error("Error loading pharmacogenomics data:", error);
        }

        this.requestUpdate();
    }

    render() {
        if (!this.opencgaSession || !this.individual) {
            return nothing;
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
                    elements: [
                        {
                            name: "Sample ID",
                            field: "sampleId",
                            type: "custom",
                            display: {
                                render: data => {
                                    if (!data) {
                                        return html`
                                            <div class="alert alert-warning">
                                                <i class="fas fa-exclamation-triangle me-2"></i>
                                                No pharmacogenomics data found for this individual.
                                            </div>
                                        `;
                                    }
                                    return html`<strong>${data.sampleId}</strong>`;
                                },
                            },
                        },
                        {
                            name: "Analysis Date",
                            field: "analysisDate",
                            type: "custom",
                            display: {
                                render: data => data?.analysisDate ? html`${data.analysisDate}` : html`<span class="text-muted">Not available</span>`,
                            },
                        },
                    ],
                },
                {
                    title: "Star Alleles",
                    elements: [
                        {
                            name: "Pharmacogenes",
                            field: "starAlleles",
                            type: "table",
                            display: {
                                maxHeight: "600px",
                                columns: [
                                    {
                                        title: "Gene",
                                        field: "gene",
                                    },
                                    {
                                        title: "Star Alleles",
                                        field: "alleles",
                                        format: (alleles, row) => {
                                            if (!Array.isArray(alleles) || alleles.length === 0) {
                                                return "-";
                                            }
                                            // Extract allele names from the alleles array
                                            const alleleNames = alleles
                                                .map(a => a.allele ? a.allele : null)
                                                .filter(a => a !== null && a !== undefined)
                                                .join(", ");
                                            debugger
                                            return alleleNames || "-";
                                        },
                                    },
                                    {
                                        title: "Genotype",
                                        field: "alleles",
                                        format: (alleles, row) => {
                                            if (!Array.isArray(alleles) || alleles.length === 0) {
                                                return "-";
                                            }
                                            // Show the genotype as allele1/allele2
                                            const alleleNames = alleles
                                                .map(a => {
                                                    if (a && typeof a === "object" && a.allele) {
                                                        return a.allele;
                                                    }
                                                    return null;
                                                })
                                                .filter(a => a !== null && a !== undefined);
                                            return alleleNames.length > 0 ? alleleNames.join("/") : "-";
                                        },
                                    },
                                    {
                                        title: "Variants",
                                        field: "variants",
                                        formatter: (variants, row) => {
                                            return Array.isArray(variants) ? variants.length : 0;
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
