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
import VariantUtils from "../variant-utils.js";

export default class VariantSummaryClinicalSignificance extends LitElement {

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
        };
    }

    #init() {
        this.COMPONENT_ID = "variant-summary-clinical-significance";
        this._variant = {};
        this._chartId = "chart-clinical-significance";
        this._chart = {};

        this._config = this.getDefaultConfig();
    }


    update(changedProperties) {
        if (changedProperties.has("variant")) {
            this.variantObserver();
        }

        super.update(changedProperties);
    }

    variantObserver() {
        if (this.variant) {
            this._variant = {...this.variant};
        }
    }

    #renderClinicalSignificanceSummary(data) {

        Highcharts.chart(`${this._chartId}`, {
            chart: {
                type: 'pie',
                backgroundColor: null,
                height: null,
            },
            title: null,
            plotOptions: {
                pie: {
                    // size: '60%', // Donut size
                    innerSize: '60%',
                    startAngle: -90,
                    endAngle: 90,
                    center: ['50%', '75%'],
                    dataLabels: {
                        enabled: true,
                        format: '{point.name}: {point.y}',
                        distance: 20,
                        style: {
                            color: '#000',
                            fontSize: '12px',
                            textOutline: 'none',
                        }
                    }
                }
            },
            tooltip: {
                pointFormat: '<b>{point.y}</b> clinical significance classification(s)'
            },
            series: [{
                name: 'Clinical significance classification',
                data: data
            }]
        });
    }

    render() {
        if (!this._variant) {
            return nothing;
        }

        return html`
            <div class="card p-3">
                <div class="card-header border-0">
                    <h5 class="mb-2 fs-5 fw-bold d-flex">Clinical Significance</h5>
                    <p class="text-secondary"></p>

                </div>
                <div class="card-body pt-0 pb-0">
                    <data-form
                        .data="${this._variant}"
                        .config="${this._config}">
                    </data-form>
                    <div class="d-flex flex-wrap justify-content-between gap-3 p-3" id="${this._chartId}" style="height: 200px; margin: auto;"></div>
                </div>
                <div class="card-footer text-muted">
                    <i class="far fa-clock me-2"></i>
                    Last updated
                </div>
            </div>

        `;
    }

    getDefaultConfig() {
        return {
            display: {
                buttonsVisible: false,
                className: "",
            },
            sections: [
                {
                    id: "variant-summary-clinical-significance-info",
                    display: {},
                    elements: [
                        {
                            id: "total-evidences",
                            title: "Total evidences",
                            type: "custom",
                            field: "evidences",
                            display: {
                                render: evidences => {
                                    return html`
                                        <div class="">${evidences.length}</div>
                                    `;
                                }
                            },
                        },
                        {
                            id: "variants-fully-explain-phenotype",
                            title: "Selected evidences fully explaining phenotypes",
                            type: "custom",
                            field: "evidences",
                            display: {
                                render: evidences => {
                                    return html`
                                        <div class="">${evidences.filter(e => e.fullyExplainPhenotypes).length}</div>
                                    `;
                                }
                            },
                        },
                        /*
                        // CAUTION 20250710 Vero : I believe this field is always empty. Viz idea:
                        // 1. Understand first:
                        // The source of the evidence (clinical, computational, experimental)
                        // The scoring system or scale (e.g., 0–1, or -5 to +5)
                        // Whether higher values mean more pathogenic or more benign
                        // Whether it's normalized, log-scaled, or tied to a classification system
                        // - If noScores < 5 or 10 - Avg/Min/Max/Std Dev, if >20 Bell curve
                        {
                            id: "variants-scores",
                            title: "Avg/Range scores",
                            type: "custom",
                            field: "evidences",
                            display: {
                                render: evidences => {
                                    debugger
                                    return html`
                                        <div class="">${VariantUtils.evidencesScoreStats(evidences)}</div>
                                    `;
                                }
                            },

                        },
                        */
                    ],
                },
                {
                    id: "variant-summary-clinical-significance-classification",
                    elements: [
                        {
                            id: "evidences-clinical-significance",
                            // title: "Clinical Significance",
                            type: "custom",
                            field: "evidences",
                            display: {
                                render: evidences => {
                                    this._chart = document.getElementById(`${this._chartId}`);
                                    this._chart.innerHTML = "";
                                    const counts = VariantUtils.countClinicalSignificance(evidences);
                                    if ((!counts || Object.keys(counts).length === 0) || Object.values(counts).every(val => !val || val === 0)) {
                                        this._chart.innerHTML = "No clinical significance data available to display."
                                    } else {
                                        const countsColor = VariantUtils.mapClinicalSignificanceToColor(counts);
                                        this.#renderClinicalSignificanceSummary(countsColor);
                                    }
                                }
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("variant-summary-clinical-significance", VariantSummaryClinicalSignificance);
