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
import VariantGridFormatter from "../variant-grid-formatter.js";

export default class VariantSummaryPopulation extends LitElement {

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
        this._config = this.getDefaultConfig();

        this._dataAll = {};
        this._dataCohorts = {};
        this._dataCohortsTransformed = {};
    }

    update(changedProperties) {
        if (changedProperties.has("variant") || changedProperties.has("opencgaSession")) {
            this.variantObserver();
        }

        super.update(changedProperties);
    }

    updated(changedProperties) {
        this.querySelector("#summary-population data-form").updateComplete.then(() => {
            Object.keys(this._dataCohortsTransformed).forEach(study => {
                (this._dataCohorts[study]?.total && this._dataCohorts[study]?.total !== 0) ?
                    this.#renderCharts(study) :
                    this.querySelector(`div#stats-${study}`).innerHTML = "<div>No population data available</div>";
            });
        });
    }


    variantObserver() {
        //1. Max MAF Highlight + Classification
        //2. Population Frequency Heatmap / Color-Coded Table
        //3. Population-Specific Flags / Tags
        //4. Summary Statistics per Population Group
        this._variant = {...this.variant};
    }

    #renderCharts(study) {
        const chartId = `chart-${study}`;
        const statsId = `stats-${study}`;

        const titleMap = {
            "GNOMAD_GENOMES": "gnomAD",
        };
        const title = titleMap[study] || study;

        // 1. Display the chart
        Highcharts.chart(`${chartId}`, {
            chart: {
                type: 'pie',
                backgroundColor: 'transparent',
                height: 150,       // reduce vertical space
                width: 300,
                spacing: [0, 0, 0, 0], // top, right, bottom, left padding
                margin: [0, 0, 0, 0],
            },
            title: {
                text: title,
                align: 'center',
                verticalAlign: 'middle',
                style: { fontSize: '14px' },
                y: 29,
            },
            subtitle: {
                text: `<span style="font-size:12px;">Total sub-populations: ${this._dataCohorts[study].total}</span>`,
                align: "center",
                verticalAlign: "middle",
                style: {fontSize: "12px"},
                y: 51,
            },
            plotOptions: {
                pie: {
                    innerSize: "70%",
                    startAngle: -90,
                    endAngle: 90,
                    center: ["50%", "70%"],
                    dataLabels: {
                        enabled: true,
                        distance: 15,
                        style: {
                            color: '#666', // light grey
                            fontWeight: "normal",
                            textOutline: "none",
                            fontSize: "10px",
                        },
                        formatter: function () {
                            return this.point.name;
                        }
                    },
                    showInLegend: true
                },
            },
            series: [{
                name: title,
                data: this._dataCohortsTransformed[study],
            }],
            credits: {
                enabled: false
            },
            tooltip: {
                useHTML: true,
                style: {
                    minWidth: '250px',
                    maxWidth: '250px',
                    whiteSpace: 'normal', // Allows wrapping
                },
                formatter: function () {
                    const { name, count, realPercent, cohorts } = this.point;
                    const cohortsLabels = cohorts?.length
                        ? `<span>${cohorts.join(', ')}</span>`
                        : '<span>None</span>';

                    return `
                        <div class="d-flex flex-column flex-wrap">
                            <div class="text-black mb-2"><b>${name}:</b> ${count} [${realPercent.toFixed(1)}%]</div>
                            <div class="text-muted">${cohortsLabels}</div>
                        </div>
                    `;
                }
            },
            legend: {
                enabled: false
            },
        });
    }

    _computeMaxMAF(frequencies) {
        const values = Object.values(frequencies);
        return Math.max(...values);
    }

    getMAFBadge(maxMaf) {
        const color = VariantGridFormatter._getPopulationFrequencyColor(freq, POPULATION_FREQUENCIES.style);
    }

    render() {
        if (!this._variant) {
            return nothing;
        }
        return html`
            <div class="card p-3">
                <div class="card-header border-0">
                    <h5 class="mb-2 fs-5 fw-bold d-flex">Population Frequencies</h5>
                    <p class="text-secondary">Variant alt allele frequency distributions for population frequencies 1000G and gnomAD_GENOMES</p>
                </div>
                <div class="card-body" id="summary-population">
                    <data-form
                        .data="${this.variant}"
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
            },
            sections: [
                {
                    display: {
                        className: "",
                        layout: {
                            id: "",
                            className: "",
                            elements: [
                                {
                                    id: "",
                                    className: ""
                                },
                                {
                                    id: "",
                                    className: ""
                                }
                            ]
                        },
                    },
                    elements: [
                        {
                            id: "population-dot",
                            type: "custom",
                            field: "annotation.populationFrequencies",
                            // title: "Sample Quality Summary",
                            display: {
                                className: "",
                                headerCellClassName: "",
                                rowId: true,
                                defaultValue: "",
                                render: populationFrequencies => {
                                    if (!populationFrequencies || populationFrequencies.length === 0)  {
                                        return html`
                                            <div class="d-flex align-items-center text-gray-600">
                                                No population data associated to this variant
                                            </div>
                                        `;
                                    }
                                    const { dataCohorts, dataAll, dataMaxMin} = VariantGridFormatter.categorizeFrequencies(populationFrequencies);
                                    this._dataCohorts = dataCohorts;
                                    this._dataAll = dataAll;
                                    this._dataCohortsTransformed = VariantGridFormatter.applyLinearTransform(dataCohorts);

                                    return html`
                                        <div class="d-flex align-items-stretch">
                                            ${Object.keys(this._dataCohortsTransformed)
                                                .filter(study => study !== "GNOMAD_EXOMES") // Exclude it here
                                                .map(study => {
                                                    const chartId = `chart-${study}`;
                                                    const statsId = `stats-${study}`;
                                                    const all = this._dataAll[study];
                                                    const prettyCategory = VariantGridFormatter.prettifyFrequencyLabel(all.category);
                                                    const maxMore = dataMaxMin[study].maxMAF.populations.length > 1 || false;
                                                    const minMore = dataMaxMin[study].minMAF.populations.length > 1 || false;
                                                    return html`
                                                        <div class="d-flex align-items-stretch" style="flex: 1 0 auto;">
                                                            <!--Stats box-->
                                                            <div class="ps-3" id="${statsId}" style="border-left: 1px solid #d9dada; flex: 0 1 auto">
                                                                <div class="d-flex align-items-center text-dark">
                                                                    <div class="me-2" style="width: 10px;height: 10px;background: ${all.color};border-radius: 2px;"></div>
                                                                    <div class="me-2 fw-bold">Population ALL:</div>
                                                                    <div class="me-2">${prettyCategory}</div>
                                                                    <div class="me-2">(${all.freq.toFixed(4)})</div>
                                                                </div>
                                                                <div class="pt-2 text-secondary" style="word-break: break-word; white-space: normal;">
                                                                    Max MAF <b>${dataMaxMin[study].maxMAF.value}%</b> in
                                                                    ${maxMore ?
                                                                        `${dataMaxMin[study].maxMAF.populations.length} populations` :
                                                                        `population ${dataMaxMin[study].maxMAF.populations.join(", ")}` }
                                                                </div>
                                                                <div class="pt-2 text-secondary" style="word-break: break-word; white-space: normal;">
                                                                    Min MAF <b>${dataMaxMin[study].minMAF.value}%</b> in
                                                                    ${minMore ?
                                                                        `${dataMaxMin[study].minMAF.populations.length} populations` :
                                                                        `population ${dataMaxMin[study].minMAF.populations.join(", ")}` }
                                                                </div>
                                                            </div>
                                                            <!--Donut chart-->
                                                            <div class="" id="${chartId}" style="flex: 0 0 auto"></div>
                                                        </div>
                                                    `;
                                                })}
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

customElements.define("variant-summary-population", VariantSummaryPopulation);
