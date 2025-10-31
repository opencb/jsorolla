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

import {html, LitElement, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import VariantGridFormatter from "../variant-grid-formatter.js";

export default class VariantSummaryConservation extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            variant: {
                type: Object,
            },
            opencgaSession: {
                type: Object,
            },
        };
    }

    #init() {
        this._variant = {};
        this._sourceDateGroups = {};
        this._dateSummary = {};
        this._chartConsId = "chart-conservation";
    }

    update(changedProperties) {
        if (changedProperties.has("variant")) {
            this.variantObserver();
        }

        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }

        super.update(changedProperties);
    }

    updated(changedProperties) {
        UtilsNew.initTooltip(this);
    }

    variantObserver() {
        if (this.variant) {
            this._variant = {};
            const dataCons =  (this.variant.annotation?.conservation || []).map(s => {
                const {color, description} = this._colorDescriptionMap(s.source, s.score);
                return {
                    source: this._getDisplaySource(s.source),
                    score: Number(s.score).toFixed(3),
                    color: color,
                    description: description,
                }
            });
            // Group scores by phylop, gerp, phastcons
            const groupedCons = this._getGroupedCons(dataCons);
            this._variant = {
                dataCons: groupedCons,
                ...this.variant
            };

            this._config = this.getDefaultConfig();
        }
    }

    opencgaSessionObserver() {
        // 1. Extract conservation sources
        const conservationSources = ['GERP++', 'PhastCons', 'PhyloP'];
        const conservationEntries = (this.opencgaSession.project.cellbase.sources || [])
            .filter(s => conservationSources.includes(s.name))
            .map(s => ({
                name: s.name,
                version: s.version || null,
                date: s.date
            }));

        // 2. Group by date
        this._sourceDateGroups = conservationEntries.reduce((acc, { name, version, date }) => {
            acc[date] = acc[date] || [];
            acc[date].push(version ? `${name} (${version})` : name);
            return acc;
        }, {});

        // 3. Date summary
        this._dateSummary = Object.entries(this._sourceDateGroups).map(([date, entries]) => {
            return `${this._formatDate(date)} (${entries.join(', ')} )`;
        });

        this._config = this.getDefaultConfig();
    }

    _formatDate(rawDate) {
        const y = rawDate.slice(0, 4);
        const m = rawDate.slice(4, 6);
        const d = rawDate.slice(6, 8);
        return `${y}-${m}-${d}`;
    }

    _getGroupedCons (dataCons){
        const grouped = {};
        dataCons.forEach(({ source, score, color, description }) => {
            if (!grouped[source]) grouped[source] = [];
            grouped[source].push({ score, color, description });
        });
        return grouped;
    }

    _getDisplaySource(source) {
        const mapping = {
            gerp: "GERP++",
            phastCons: "PhastCons",
            phylop: "PhyloP"
        };
        return mapping[source] || source;
    }

    // Map score to base color and description
    _colorDescriptionMap(source, score) {
        const val = parseFloat(score);
        const src = source.toLowerCase();
        if (src === "gerp") {
            if (val > 4.4) return { color: "#d9534f", description: "High" };       // red
            if (val > 3.0) return { color: "#f0ad4e", description: "Moderate" };   // orange
            return { color: "#13A574FF", description: "Low" };                     // green
        }
        if (src === "phastcons") {
            if (val > 0.9) return { color: "#d9534f", description: "High" };
            if (val > 0.5) return { color: "#f0ad4e", description: "Moderate" };
            return { color: "#13A574FF", description: "Low" };
        }
        if (src === "phylop") {
            if (val > 1.5) return { color: "#d9534f", description: "High" };
            if (val > 0.5) return { color: "#f0ad4e", description: "Moderate" };
            return { color: "#13A574FF", description: "Low" };
        }
        return { color: "#aaa", description: "Source not recognised" };
    }

    render() {
        if (!this.opencgaSession || !this._variant) {
            return nothing;
        }

        return html`
            <div class="rounded-4 p-4 bg-white ms-2">
                <div class="d-flex align-items-center justify-content-between mb-2">
                    <h5 class="mb-2 fs-5 fw-bold">Conservation</h5>
                    <a tooltip-title="Conservation Scores" tooltip-text="${VariantGridFormatter.conservationTooltipSummaryContent()}">
                        <i class="fa fa-info-circle text-dark"></i>
                    </a>
                </div>
                <div id="summary-conservation">
                    <data-form
                        .data="${this._variant}"
                        .config="${this._config}">
                    </data-form>
                </div>
                <!--
                <div class="card-divider"></div>
                <div class="text-muted fw-light fs-7">
                    <i class="far fa-clock me-2 text-gray-700"></i> $this._dateSummary.join(' · ')}
                </div>
                -->
            </div>

        `;
    }

    getDefaultConfig() {
        return {
            display: {
                buttonsVisible: false,
                // className: "d-flex",
            },
            sections: [
                {
                    id: "ct-conservation",
                    display: {
                        separationClassName: "mb-0",
                    },
                    elements: [
                        {
                            id: "conservation",
                            type: "custom",
                            display: {
                                visible: variant => variant.type === "SNV",
                                render: variant => {
                                    return html`
                                        <div class="d-flex justify-content-between">
                                            ${Object.entries(variant.dataCons).map(([method, scores]) => {
                                                const { score, color, description } = scores[0]; // First score per method
                                                return html`
                                                    <div class="d-flex flex-column me-2">
                                                        <div class="summary-category" style="min-width: 100px;">
                                                            ${method}
                                                        </div>
                                                        <h5 class="d-flex">
                                                            <div class="" style="color: ${color}">
                                                                ${score}
                                                            </div>
                                                        </h5>
                                                    </div>
                                                `;
                                            })}
                                        </div>
                                    `;
                                },
                            },
                        },
                        /*
                        // CAUTION 20250724 Vero: to discuss if for MNV or INDEL should be displayed as a heatmap
                        {
                            id: "conservation",
                            type: "custom",
                            display: {
                                visible: variant => variant.type === "MNV" || variant.type === "INDEL",
                                render: variant => {
                                    // Render scores heatmap for MNV or INDEL
                                    return html`
                                        <div class="" id="${this._chartConsId}" style="flex: 0 0 auto"></div>
                                    `;
                                },
                            },
                        },
                         */
                        {
                            id: "conservation-empty-state",
                            type: "custom",
                            display: {
                                // EMPTY STATE: No conservation or different from SNV
                                visible: variant => {
                                    return variant.type !== "SNV" ||
                                        (!variant.annotation?.conservation || variant.annotation?.conservation?.length === 0);
                                },
                                render: variant => {
                                    const conservation = variant.annotation?.conservation;
                                    return (!conservation || conservation.length === 0) ?
                                         html`
                                            <div class="alert alert-light border-0 mb-0 d-flex align-items-center gap-1">
                                                <i class="fas fa-info-circle fs-4 me-2"></i>
                                                <div class="text-break">No conservation data associated to this variant.</div>
                                            </div>
                                        ` :
                                        html`
                                            <div class="alert alert-light border-0 mb-0 d-flex align-items-center gap-1">
                                                <i class="fas fa-info-circle fs-4 me-2"></i>
                                                <div class="text-break">Conservation summary is only available for SNV variant type.</div>
                                            </div>
                                        `;
                                }
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("variant-summary-conservation", VariantSummaryConservation);
