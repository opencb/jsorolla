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
import UtilsNew from "../../../core/utils-new";

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
        this._dateSummary = {};
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

    opencgaSessionObserver() {
        // 1. Extract conservation sources
        const sources = ['gnomAD'];

        const entries = (this.opencgaSession.project.cellbase.sources || [])
            .filter(s => sources.includes(s.name))
            .map(s => ({
                name: s.name,
                version: s.version || null,
                date: s.date
            }));

        // 2. Group by date
        this._sourceDateGroups = entries.reduce((acc, { name, version, date }) => {
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
                text: `${this._dataCohorts[study].total}`,
                align: 'center',
                verticalAlign: 'middle',
                style: { fontSize: '24px' },
                y: 32,
            },
            subtitle: {
                text: `<span style="font-size:12px;">Sub-Populations</span>`,
                align: "center",
                verticalAlign: "middle",
                style: {fontSize: "12px"},
                y: 48,
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
                        ? `<span>${cohorts.join(', ')}</span>` // newline for each cohort
                        : '<span>None</span>';

                    return `
                        <div class="d-flex flex-column flex-wrap">
                            <div class="text-secondary mb-2">
                                <b>${name.toUpperCase()}:</b> in <b>${count}</b> sub-populations
                                <i>(${realPercent.toFixed(1)}% of the total sub-populations)</i>
                            </div>
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
                <div class="card-header border-0 d-flex justify-content-between mb-2">
                    <h5 class="mb-2 fs-5 fw-bold">Population Frequencies</h5>
                    <a tooltip-title="Population Frequencies" tooltip-text="${VariantGridFormatter.populationTooltipSummaryContent()}">
                        <i class="fa fa-info-circle text-info"></i>
                    </a>
                </div>
                <div class="card-body pt-0 pb-0" id="summary-population">
                    <data-form
                        .data="${this.variant}"
                        .config="${this._config}">
                    </data-form>
                </div>
                <div class="card-divider"></div>
                <div class="text-muted fw-light fs-7">
                    <i class="far fa-clock me-2 text-gray-700"></i> ${this._dateSummary.join(' · ')}
                </div>
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
                        separationClassName: "",
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
                                separationClassName: "",
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
                                                        <div class="d-flex flex-column" style="flex: 1 1 auto;">
                                                            <div class="fw-bold fs-7 text-secondary">Population ${study}</div>
                                                            <div class="d-flex align-items-center" style="flex: 1 1 auto;">
                                                            <!--Stats box-->
                                                            <div class="ps-3" id="${statsId}" style="border-left: 1px solid #d9dada; flex: 0 1 auto">
                                                                <div class="d-flex align-items-center text-dark">
                                                                    <div class="me-2" style="width: 10px;height: 10px;background: ${all.color};border-radius: 2px;"></div>
                                                                    <div class="me-2 fw-bold">Population ALL:</div>
                                                                    <div class="me-2 text-secondary">${prettyCategory}</div>
                                                                    <div class="text-secondary me-2">(Alt. AF: ${all.freq.toFixed(4)})</div>
                                                                </div>
                                                                <div class="pt-2 text-secondary" style="word-break: break-word; white-space: normal;">
                                                                    Max MAF <b>${(dataMaxMin[study].maxMAF.value/100).toFixed(4)}</b> in
                                                                    ${maxMore ?
                                                                            `${dataMaxMin[study].maxMAF.populations.length} populations` :
                                                                            `population ${dataMaxMin[study].maxMAF.populations.join(", ")}` }
                                                                </div>
                                                                <div class="pt-2 text-secondary" style="word-break: break-word; white-space: normal;">
                                                                    Min MAF <b>${(dataMaxMin[study].minMAF.value/100).toFixed(4)}</b> in
                                                                    ${minMore ?
                                                                            `${dataMaxMin[study].minMAF.populations.length} populations` :
                                                                            `population ${dataMaxMin[study].minMAF.populations.join(", ")}` }
                                                                </div>
                                                            </div>
                                                            <!--Donut chart-->
                                                            <div class="d-flex justify-content-center align-items-center" id="${chartId}" style="flex: 1 0 auto"></div>
                                                        </div>
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
