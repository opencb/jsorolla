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
        this.COMPONENT_ID = "variant-summary-population";
        this._study = null;
        this._config = this.getDefaultConfig();

        this._dataMAFTransformed = {};
        this._dataMAFSummary = {};

        this._chartMAF1000G = "chart-maf-1000G";
        this._chartMAFGnomad = "chart-maf-gnomad";

    }

    update(changedProperties) {
        if (changedProperties.has("variant") || changedProperties.has("opencgaSession")) {
            this.variantObserver();
        }

        super.update(changedProperties);
    }

    updated(changedProperties) {
        this.querySelector("data-form").updateComplete.then(() => {
            if (this.querySelector(`#${this._chartMAF1000G}`)) {
                if (this._dataMAFSummary["1000G"]?.total && this._dataMAFSummary["1000G"]?.total !== 0) {
                    this.#renderChartsMAF(`${this._chartMAF1000G}`, "1000G", this._dataMAFTransformed["1000G"], this._dataMAFSummary["1000G"]?.total);
                }
                else {
                    const target = this.querySelector(`div#${this._chartMAF1000G}`);
                    target.innerHTML = "<div>No population data available</div>";
                }

            }
            if (this.querySelector(`#${this._chartMAFGnomad}`)) {
                if (this._dataMAFSummary["GNOMAD_GENOMES"]?.total && this._dataMAFSummary["GNOMAD_GENOMES"]?.total !== 0) {
                    this.#renderChartsMAF(`${this._chartMAFGnomad}`, "gnomAD", this._dataMAFTransformed["GNOMAD_GENOMES"], this._dataMAFSummary["GNOMAD_GENOMES"]?.total);
                }
                else {
                        const target = this.querySelector(`div#${this._chartMAFGnomad}`);
                        target.innerHTML = "<div>No population data available</div>";
                }
            }
        })
    }


    variantObserver() {
        this._data = [];
        this._dataDot = [];
        //1. Max MAF Highlight + Classification
        //2. Population Frequency Heatmap / Color-Coded Table
        //3. Population-Specific Flags / Tags
        //4. Summary Statistics per Population Group
        this._variant = {...this.variant};
    }

    #renderChartsMAF(containerId, title, data, totalPopulations) {
        Highcharts.chart(containerId, {
            chart: {
                type: 'pie',
                backgroundColor: 'transparent',
                height: 150,       // reduce vertical space
                spacing: [0, 0, 0, 0], // top, right, bottom, left padding
                margin: [0, 0, 0, 0],
            },
            title: {
                text: `${title}`,
                align: 'center',
                verticalAlign: 'middle',
                style: { fontSize: '14px' },
                y: 30,
            },
            subtitle: {
                text: `<span style="font-size:12px;">Total populations: ${totalPopulations}</span>`,
                align: "center",
                verticalAlign: "middle",
                style: {fontSize: "12px"},
                y: 52,
            },
            plotOptions: {
                pie: {
                    innerSize: "60%",
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
                data: data
            }],
            credits: {
                enabled: false
            },
            tooltip: {
                useHTML: true,
                formatter: function () {
                    const { name, count, realPercent, subpopulations } = this.point;
                    const subpopsText = subpopulations?.length
                        ? `<span>${subpopulations.join(', ')}</span>`
                        : '<span>None</span>';

                    return `
                        <div class="">
                            <div class="text-black mb-2"><b>${name}:</b> ${count} [${realPercent.toFixed(1)}%]</div>
                            <div class="text-muted">${subpopsText}</div>
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
        debugger
        // const data = this._variant.studies.find(s => s.studyId === this.opencgaSession.study.fqn).
        return html`
            <div class="card p-3">
                <div class="card-header border-0">
                    <h5 class="mb-2 fs-5 fw-bold d-flex">Population Frequencies</h5>
                    <p class="text-secondary">Variant alt allele frequency distributions for population frequencies 1000G and gnomAD_GENOMES</p>

                </div>
                <div class="card-body">
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
                        className: "d-flex justify-content-between align-items-center",
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
                                    this._dataMAF = {};
                                    this._dataMAFSummary = VariantGridFormatter.categorizeFrequencies(populationFrequencies);
                                    this._dataMAFTransformed = VariantGridFormatter.applyLinearTransform(this._dataMAFSummary);
                                    return html`
                                        <div class="d-flex">
                                            <div>
                                                <div class="d-flex" id="${this._chartMAF1000G}" style="margin: auto;"></div>
                                            </div>
                                            <div>
                                                <div class="d-flex" id="${this._chartMAFGnomad}" style="margin: auto;"></div>
                                            </div>
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
