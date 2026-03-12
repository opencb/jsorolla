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
import "../commons/simple-chart.js";

export default class IndividualPharmacogenomicsSummary extends LitElement {

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
        this._drugSearch = "";
        this._selectedConfidenceLevels = new Set();
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

    #computeChartData() {
        const results = this._pharmacogenomicsData?.alleleTyperResults || [];
        const confidenceCounts = {};
        const phenotypeTypeCounts = {};
        const drugsPerGene = {};
        const geneStatus = {"With results": 0, "No results": 0};

        results.forEach(geneResult => {
            const geneDrugs = new Set();
            (geneResult.alleleCalls || []).forEach(call => {
                (call.annotation?.drugs || []).forEach(drug => {
                    if (drug.variants?.length > 0 || drug.genes?.length > 0) {
                        geneDrugs.add(drug.name);
                        (drug.variants || []).forEach(v => {
                            if (v.confidence) {
                                confidenceCounts[`Level ${v.confidence}`] = (confidenceCounts[`Level ${v.confidence}`] || 0) + 1;
                            }
                            (v.phenotypeTypes || []).forEach(pt => {
                                phenotypeTypeCounts[pt] = (phenotypeTypeCounts[pt] || 0) + 1;
                            });
                        });
                    }
                });
            });
            if (geneDrugs.size > 0) {
                geneStatus["With results"]++;
                drugsPerGene[geneResult.gene] = geneDrugs.size;
            } else {
                geneStatus["No results"]++;
            }
        });

        return {confidenceCounts, phenotypeTypeCounts, drugsPerGene, geneStatus};
    }

    #hasAnnotation(drug) {
        return drug.variants?.length > 0 || drug.genes?.length > 0;
    }

    #matchesDrugFilter(drug) {
        if (this._drugSearch) {
            const search = this._drugSearch.toLowerCase();
            const nameMatch = drug.name?.toLowerCase().includes(search);
            const idMatch = drug.id?.toLowerCase().includes(search);
            if (!nameMatch && !idMatch) return false;
        }
        if (this._selectedConfidenceLevels.size > 0) {
            const hasMatchingLevel = (drug.variants || []).some(v =>
                this._selectedConfidenceLevels.has(v.confidence)
            );
            if (!hasMatchingLevel) return false;
        }
        return true;
    }

    onDrugSearchInput(e) {
        this._drugSearch = e.target.value;
        this._config = this.getDefaultConfig();
        this.requestUpdate();
    }

    onConfidenceToggle(level) {
        if (this._selectedConfidenceLevels.has(level)) {
            this._selectedConfidenceLevels.delete(level);
        } else {
            this._selectedConfidenceLevels.add(level);
        }
        this._selectedConfidenceLevels = new Set(this._selectedConfidenceLevels);
        this._config = this.getDefaultConfig();
        this.requestUpdate();
    }

    onClearFilters() {
        this._drugSearch = "";
        this._selectedConfidenceLevels = new Set();
        this._config = this.getDefaultConfig();
        this.requestUpdate();
    }

    renderFilters() {
        const levels = ["1A", "1B", "2A", "3", "4"];
        const hasFilters = this._drugSearch || this._selectedConfidenceLevels.size > 0;
        return html`
            <div class="d-flex align-items-center gap-3 mb-3 flex-wrap">
                <div class="input-group" style="max-width:300px">
                    <span class="input-group-text"><i class="fas fa-search"></i></span>
                    <input type="text"
                        class="form-control"
                        placeholder="Search by drug name or ID..."
                        .value="${this._drugSearch}"
                        @input="${e => this.onDrugSearchInput(e)}">
                </div>
                <div class="d-flex align-items-center gap-1">
                    <span class="small text-muted me-1">Level:</span>
                    ${levels.map(level => {
                        const active = this._selectedConfidenceLevels.has(level);
                        return html`
                            <button
                                type="button"
                                class="btn btn-sm ${active ? "btn-primary" : "btn-outline-secondary"}"
                                @click="${() => this.onConfidenceToggle(level)}">
                                ${level}
                            </button>
                        `;
                    })}
                </div>
                ${hasFilters ? html`
                    <button type="button" class="btn btn-sm btn-link text-decoration-none"
                        @click="${() => this.onClearFilters()}">
                        <i class="fas fa-times me-1"></i>Clear filters
                    </button>
                ` : nothing}
            </div>
        `;
    }

    #confidenceBadge(confidence) {
        const colors = {
            "1A": "danger",
            "1B": "warning",
            "2A": "info",
            "3": "secondary",
            "4": "light",
        };
        const color = colors[confidence] || "light";
        const textClass = color === "light" ? "text-dark border" : "";
        return html`<span class="badge bg-${color} ${textClass}">Level ${confidence}</span>`;
    }

    renderDrugDetail(drug) {
        const variants = drug.variants || [];
        return html`
            <div class="p-3 bg-white">
                <!-- Drug Summary -->
                <div class="row mb-3">
                    <div class="col-auto">
                        <span class="small text-muted">ID:</span>
                        <span class="small fw-bold">${drug.id || "-"}</span>
                    </div>
                    <div class="col-auto">
                        <span class="small text-muted">Source:</span>
                        <span class="small fw-bold">${drug.source || "-"}</span>
                    </div>
                    ${drug.genericNames?.length ? html`
                        <div class="col-auto">
                            <span class="small text-muted">Generic names:</span>
                            <span class="small fw-bold">${drug.genericNames.join(", ")}</span>
                        </div>
                    ` : nothing}
                </div>

                <!-- Variants -->
                ${variants.length > 0 ? html`
                    ${variants.map(variant => {
                        const evidences = variant.evidences || [];
                        return html`
                            <div class="card mb-2">
                                <div class="card-header py-2 d-flex align-items-center gap-2 flex-wrap">
                                    ${this.#confidenceBadge(variant.confidence)}
                                    <span class="fw-bold small">${(variant.haplotypes || []).join(", ") || "-"}</span>
                                    ${(variant.phenotypes || []).length ? html`
                                        <span class="text-muted small">
                                            ${variant.phenotypes.join(", ")}
                                        </span>
                                    ` : nothing}
                                    ${(variant.phenotypeTypes || []).length ? html`
                                        ${variant.phenotypeTypes.map(pt => html`
                                            <span class="badge bg-light text-dark border small">${pt}</span>
                                        `)}
                                    ` : nothing}
                                    ${variant.url ? html`
                                        <a href="${variant.url}" target="_blank" class="ms-auto small text-decoration-none">
                                            <i class="fas fa-external-link-alt me-1"></i>ClinPGx
                                        </a>
                                    ` : nothing}
                                </div>
                                ${evidences.length > 0 ? html`
                                    <div class="card-body p-0">
                                        <div class="list-group list-group-flush">
                                            ${evidences.map(evidence => html`
                                                <div class="list-group-item py-2">
                                                    <div class="d-flex align-items-center gap-2 mb-1">
                                                        <span class="badge bg-light text-dark border">${evidence.type || "-"}</span>
                                                        ${evidence.pubmed ? html`
                                                            <a href="https://pubmed.ncbi.nlm.nih.gov/${evidence.pubmed}"
                                                                target="_blank" class="small text-decoration-none">
                                                                PMID:${evidence.pubmed}
                                                            </a>
                                                        ` : nothing}
                                                    </div>
                                                    ${evidence.summary ? html`
                                                        <p class="small mb-1">${evidence.summary}</p>
                                                    ` : nothing}
                                                    ${(evidence.variantAssociations || []).map(va => html`
                                                        ${va.discussion ? html`
                                                            <details class="small mt-1">
                                                                <summary class="text-muted" style="cursor:pointer">
                                                                    ${va.phenotypeType ? html`<span class="badge bg-light text-dark border me-1">${va.phenotypeType}</span>` : nothing}
                                                                    Discussion
                                                                    ${va.pubmed && va.pubmed !== evidence.pubmed ? html`
                                                                        <a href="https://pubmed.ncbi.nlm.nih.gov/${va.pubmed}"
                                                                            target="_blank" class="text-decoration-none ms-1"
                                                                            @click="${e => e.stopPropagation()}">
                                                                            PMID:${va.pubmed}
                                                                        </a>
                                                                    ` : nothing}
                                                                </summary>
                                                                <div class="text-muted mt-1 ps-2 border-start">${va.discussion}</div>
                                                            </details>
                                                        ` : nothing}
                                                    `)}
                                                </div>
                                            `)}
                                        </div>
                                    </div>
                                ` : nothing}
                            </div>
                        `;
                    })}
                ` : html`<span class="text-muted small">No variant annotations</span>`}
            </div>
        `;
    }

    renderAccordion() {
        const results = [...(this._pharmacogenomicsData?.alleleTyperResults || [])].sort((a, b) => a.gene.localeCompare(b.gene));
        if (!results.length) {
            return html`<span class="text-muted">No pharmacogenomics results available</span>`;
        }

        // Pre-compute filtered data per gene
        const filteredResults = results.map((geneResult, index) => {
            const alleleCalls = geneResult.alleleCalls || [];
            const filteredAlleles = alleleCalls.map(call => {
                const drugs = (call.annotation?.drugs || [])
                    .filter(d => this.#hasAnnotation(d) && this.#matchesDrugFilter(d));
                return {call, drugs};
            }).filter(a => a.drugs.length > 0);

            const totalDrugs = new Set();
            for (const {drugs} of filteredAlleles) {
                for (const drug of drugs) {
                    totalDrugs.add(drug.name);
                }
            }
            return {geneResult, index, filteredAlleles, totalDrugs};
        });

        return html`
            ${this.renderFilters()}
            <div class="accordion" id="pgx-accordion">
                ${filteredResults.map(({geneResult, index, filteredAlleles, totalDrugs}) => {
                    const hasResults = filteredAlleles.length > 0;
                    return html`
                        <div class="accordion-item ${hasResults ? "" : "opacity-50"}" style="${hasResults ? "" : "pointer-events:none"}">
                            <h2 class="accordion-header">
                                <button
                                    class="accordion-button collapsed"
                                    type="button"
                                    data-bs-toggle="${hasResults ? "collapse" : ""}"
                                    data-bs-target="${hasResults ? `#pgx-gene-${index}` : ""}"
                                    <div class="d-flex align-items-center gap-3 w-100 me-3">
                                        <strong style="min-width:80px">${geneResult.gene}</strong>
                                        <span class="text-muted text-truncate" style="max-width:400px"
                                            title="${geneResult.diplotype || ""}">
                                            ${geneResult.diplotype || "-"}
                                        </span>
                                        <div class="ms-auto d-flex gap-2 flex-shrink-0">
                                            ${hasResults ? html`
                                                <span class="badge bg-primary">
                                                    ${filteredAlleles.length} allele${filteredAlleles.length !== 1 ? "s" : ""}
                                                </span>
                                                <span class="badge bg-secondary">
                                                    ${totalDrugs.size} drug${totalDrugs.size !== 1 ? "s" : ""}
                                                </span>
                                            ` : html`
                                                <span class="badge bg-light text-muted border">No results</span>
                                            `}
                                        </div>
                                    </div>
                                </button>
                            </h2>
                            ${hasResults ? html`
                            <div id="pgx-gene-${index}" class="accordion-collapse collapse"
                                data-bs-parent="#pgx-accordion">
                                <div class="accordion-body">
                                    <div class="mb-3">
                                        <label class="fw-bold small text-muted">Diplotype</label>
                                        <div>${geneResult.diplotype || "-"}</div>
                                    </div>
                                    ${filteredAlleles.map(({call, drugs}, callIdx) => {
                                        const drugAccordionId = `pgx-drugs-${index}-${callIdx}`;
                                        return html`
                                            <div class="mb-3 pb-3 border-bottom">
                                                <div class="d-flex align-items-center mb-2">
                                                    <span class="badge bg-primary me-2">${call.allele || "-"}</span>
                                                    <span class="text-muted small">${drugs.length} drug${drugs.length !== 1 ? "s" : ""}</span>
                                                </div>
                                                <div class="accordion accordion-flush" id="${drugAccordionId}">
                                                    ${drugs
                                                        .sort((a, b) => a.name.localeCompare(b.name))
                                                        .map((drug, drugIdx) => {
                                                            const drugCollapseId = `${drugAccordionId}-${drugIdx}`;
                                                            const variantCount = (drug.variants || []).length;
                                                            return html`
                                                                <div class="accordion-item">
                                                                    <h2 class="accordion-header">
                                                                        <button class="accordion-button collapsed py-2 px-3"
                                                                            type="button"
                                                                            data-bs-toggle="collapse"
                                                                            data-bs-target="#${drugCollapseId}"
                                                                            style="font-size:0.875rem;background-color:#f8f9fa">
                                                                            <div class="d-flex align-items-center gap-2 w-100 me-2">
                                                                                <strong>${drug.name}</strong>
                                                                                <span class="text-muted">${drug.id || ""}</span>
                                                                                <span class="ms-auto badge bg-secondary">${variantCount} variant${variantCount !== 1 ? "s" : ""}</span>
                                                                            </div>
                                                                        </button>
                                                                    </h2>
                                                                    <div id="${drugCollapseId}" class="accordion-collapse collapse">
                                                                        ${this.renderDrugDetail(drug)}
                                                                    </div>
                                                                </div>
                                                            `;
                                                        })}
                                                </div>
                                            </div>
                                        `;
                                    })}
                                </div>
                            </div>
                            ` : nothing}
                        </div>
                    `;
                })}
                </div>
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
                        visible: () => this._pharmacogenomicsData !== null,
                    },
                    elements: [
                        {
                            type: "custom",
                            display: {
                                render: () => {
                                    const results = this._pharmacogenomicsData?.alleleTyperResults || [];
                                    const drugSet = new Set();
                                    let variantAnnotations = 0;
                                    (results).forEach(geneResult => {
                                        (geneResult.alleleCalls || []).forEach(call => {
                                            (call.annotation?.drugs || []).forEach(drug => {
                                                if (this.#hasAnnotation(drug)) {
                                                    drugSet.add(drug.name);
                                                    variantAnnotations += (drug.variants || []).length;
                                                }
                                            });
                                        });
                                    });
                                    return html`
                                        <div class="d-flex gap-4 mb-3 flex-wrap">
                                            <div class="d-flex align-items-center gap-2">
                                                <span class="text-muted small">Sample ID:</span>
                                                <span class="fw-bold">${this._pharmacogenomicsData?.sampleId || "-"}</span>
                                            </div>
                                            <div class="d-flex align-items-center gap-2">
                                                <span class="text-muted small">Genes:</span>
                                                <span class="badge bg-primary">${results.length}</span>
                                            </div>
                                            <div class="d-flex align-items-center gap-2">
                                                <span class="text-muted small">Drugs:</span>
                                                <span class="badge bg-primary">${drugSet.size}</span>
                                            </div>
                                            <div class="d-flex align-items-center gap-2">
                                                <span class="text-muted small">Variant Annotations:</span>
                                                <span class="badge bg-primary">${variantAnnotations}</span>
                                            </div>
                                        </div>
                                    `;
                                },
                            },
                        },
                        {
                            type: "custom",
                            display: {
                                render: () => {
                                    const charts = this.#computeChartData();
                                    return html`
                                        <div class="row">
                                            <div class="col-md-6 col-lg-3">
                                                <simple-chart
                                                    .active="${true}"
                                                    type="pie"
                                                    title="Genes Overview"
                                                    .data="${charts.geneStatus}"
                                                    .config="${{chart: {height: 260}}}">
                                                </simple-chart>
                                            </div>
                                            <div class="col-md-6 col-lg-3">
                                                <simple-chart
                                                    .active="${true}"
                                                    type="pie"
                                                    title="Confidence Levels"
                                                    .data="${charts.confidenceCounts}"
                                                    .config="${{chart: {height: 260}}}">
                                                </simple-chart>
                                            </div>
                                            <div class="col-md-6 col-lg-3">
                                                <simple-chart
                                                    .active="${true}"
                                                    type="pie"
                                                    title="Phenotype Types"
                                                    .data="${charts.phenotypeTypeCounts}"
                                                    .config="${{chart: {height: 260}}}">
                                                </simple-chart>
                                            </div>
                                            <div class="col-md-6 col-lg-3">
                                                <simple-chart
                                                    .active="${true}"
                                                    type="column"
                                                    title="Drugs per Gene"
                                                    .data="${charts.drugsPerGene}"
                                                    .config="${{
                                                        chart: {height: 260},
                                                        xAxis: {
                                                            categories: Object.keys(charts.drugsPerGene),
                                                            labels: {rotation: -45, style: {fontSize: "10px"}},
                                                        },
                                                    }}">
                                                </simple-chart>
                                            </div>
                                        </div>
                                    `;
                                },
                            },
                        },
                    ],
                },
                {
                    title: "Gene Results",
                    display: {
                        visible: () => this._pharmacogenomicsData !== null,
                    },
                    elements: [
                        {
                            type: "custom",
                            display: {
                                render: () => this.renderAccordion(),
                            }
                            ,
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("individual-pharmacogenomics-summary", IndividualPharmacogenomicsSummary);
