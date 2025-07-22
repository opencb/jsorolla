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

export default class VariantSummaryClinicalSignificanceVariantTraits extends LitElement {

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
        this.COMPONENT_ID = "variant-summary-clinical-significance-trait-association";
        this._variant = {};
        this._chartId = "chart-clinical-significance-trait-association";
        this._chart = {};
        this._data = [];

        this._clinicalSignificanceGroups = [
            "benign",
            "likely benign",
            "uncertain significance",
            "likely pathogenic",
            "pathogenic",
        ];

        this._starsGermline = [
            { status: "practice guideline", stars: 4 },
            { status: "reviewed by expert panel", stars: 3 },
            { status: "criteria provided, multiple submitters, no conflicts", stars: 2 },
            { status: "criteria provided, conflicting classifications", stars: 1 },
            { status: "criteria provided, single submitter", stars: 1 },
            { status: "CRITERIA_PROVIDED_SINGLE_SUBMITTER", stars: 1 },
            { status: "no assertion criteria provided", stars: 0 },
            { status: "no classification provided", stars: 0 },
            { status: "no classification for the individual variant", stars: 0 }
        ];

        this._config = this.getDefaultConfig();
    }


    update(changedProperties) {
        if (changedProperties.has("variant")) {
            this.variantObserver();
        }

        super.update(changedProperties);
    }

    updated() {
        this.querySelector("data-form").updateComplete.then(() => {
            this.#plotClinvarTraitAssociations(this._data);
        });
    }

    variantObserver() {
        this._data = [];
        if (this.variant) {
            this._variant = {...this.variant};
        }
    }

    // Helper: convert hex + alpha to rgba
    #hexToRGBA(hex, alpha) {
        const bigint = parseInt(hex.replace("#", ""), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    #plotClinvarTraitAssociations(traitAssociations) {
        const statusToStars = Object.fromEntries(this._starsGermline.map(entry => [entry.status, entry.stars]));

        const clinicalSignificanceGroups = CLINICAL_SIGNIFICANCE.map(g => g.id);
        const starLevels = [0, 1, 2, 3, 4];


        // Prepare counts: cs → stars → count
        const countsByCSAndStar = {};
        clinicalSignificanceGroups.forEach(cs => {
            countsByCSAndStar[cs] = {};
            starLevels.forEach(star => {
                countsByCSAndStar[cs][star] = 0;
            });
        });

        for (const trait of traitAssociations) {
            const cs = trait.variantClassification?.clinicalSignificance; // Clinical significance
            const review = trait.additionalProperties?.find(p => p.name === "ReviewStatus_in_source_file"); // Stars
            const status = review?.value || "no classification provided";
            const stars = statusToStars[status]; // Get the number of stars

            if (stars !== undefined && countsByCSAndStar[cs]) {
                countsByCSAndStar[cs][stars]++;
            }
        }

        const series = starLevels.map(star => ({
            name: "★".repeat(star) + "☆".repeat(4 - star),
            data: [],
            stack: "stars",
            showInLegend: true,
            color: "#FFFFFF" // neutral legend color
        }));

        clinicalSignificanceGroups.forEach((cs, i) => {
            starLevels.forEach((star, starIndex) => {
                const count = countsByCSAndStar[cs][star];
                const baseColor = CLINICAL_SIGNIFICANCE.find(g => g.id === cs)?.color || "#cccccc";
                const alpha = 0.2 + 0.2 * star;
                const rgba = this.#hexToRGBA(baseColor, alpha);
                series[starIndex].data.push({ y: count, color: rgba });
            });
        });



        Highcharts.chart(`${this._chartId}`, {
            chart: {
                type: 'column',
                height: 225,
                width: 500,
            },
            title: {
                text: null,
            },
            xAxis: {
                categories: CLINICAL_SIGNIFICANCE.map(g => g.name),
                labels: {
                    style: { fontWeight: 'bold' },
                    formatter: function () {
                        const group = CLINICAL_SIGNIFICANCE[this.pos];
                        return `<span style="color:${group.color}">${group.acronym}</span>`;
                    },
                    useHTML: true
                },
                title: { text: 'Clinical Significance' }
            },
            yAxis: {
                min: 0,
                allowDecimals: false,
                title: { text: 'Number of Traits' }
            },
            legend: {
                reversed: false,
                align: 'center',          // horizontal alignment (left|center|right)
                verticalAlign: 'top',     // top of the chart
                layout: 'horizontal',     // ensure it's horizontal (default)
                useHTML: true,
                labelFormatter: function () {
                    return `<span style="color:darkgoldenrod">${this.name}</span>`;
                }
            },
            tooltip: {
                shared: true,
                formatter: function () {
                    const header = `<b>${this.x}</b><br/>`;
                    const lines = this.points.map(p =>
                        `<span style="color:${p.color}">●</span>  ${p.series.name}:  <b>${p.y}</b>`
                    );
                    return header + lines.join("<br/>");
                }
            },
            plotOptions: {
                column: { stacking: 'normal' }
            },
            series: series,
            credits: {
                enabled: false
            },
        });
    }

    render() {
        if (!this._variant) {
            return nothing;
        }

        return html`
            <div class="card p-3">
                <div class="card-header border-0">
                    <h5 class="mb-2 fs-5 fw-bold d-flex">Traits by Clinical Significance, Stacked by Clinvar Stars</h5>
                    <p class="text-secondary">ClinVar variant traits by clinical significance and germline review stars</p>

                </div>
                <div class="card-body pt-0 pb-0">
                    <data-form
                        .data="${this._variant}"
                        .config="${this._config}">
                    </data-form>
                </div>
                <!--
                <div class="card-footer text-muted">
                    <i class="far fa-clock me-2"></i>
                    Last updated
                </div>
                -->
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
                    id: "variant-traits",
                    elements: [
                        {
                            id: "variant-traits-association",
                            type: "custom",
                            field: "annotation.traitAssociation",
                            display: {
                                render: traitAssociation => {
                                    // Check if trait association exists. Filter evidences from ClinVar source only
                                    this._data = traitAssociation.filter(e => e.source?.name?.toLowerCase() === 'clinvar');
                                    if (this._data?.length === 0) {
                                        return html`<div>No clinvar traits association data available to display</div>`;
                                    }
                                    return html `
                                        <div class="d-flex justify-content-start" id="${this._chartId}"></div>
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

customElements.define("variant-summary-clinical-significance-variant-traits", VariantSummaryClinicalSignificanceVariantTraits);
