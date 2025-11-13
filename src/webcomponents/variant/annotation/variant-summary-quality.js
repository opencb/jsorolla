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
import VariantInterpreterGridFormatter from "../interpretation/variant-interpreter-grid-formatter.js";
import VariantGridFormatter from "../variant-grid-formatter.js";
import UtilsNew from "../../../core/utils-new.js";
import CatalogGridFormatter from "../../commons/catalog-grid-formatter.js";

export default class VariantSummaryQuality extends LitElement {

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
            clinicalAnalysis: {
                type: Object,
            },
            opencgaSession: {
                type: Object,
            },
        };
    }

    #init() {
        this._study = null;
        this._config = this.getDefaultConfig();
        this._chartId = "summary-sample-quality-chart";
        this._data = [];
        this._samplesQuality = {};
    }

    update(changedProperties) {
        if (changedProperties.has("variant") || changedProperties.has("opencgaSession")) {
            this.variantObserver();
        }

        super.update(changedProperties);
    }

    updated(changedProperties) {
        UtilsNew.initTooltip(this);
        this.querySelector("#summary-sample-quality data-form").updateComplete.then(() => {
            const chartContainer = this.querySelector(`#${this._chartId}`);
            if (chartContainer) {
                this.#renderChart();
            }
        });
    }

    variantObserver() {
        this._samplesQuality = {};
        const study = this.variant?.studies.find(s => s.studyId === this.opencgaSession?.study?.fqn);

        // Precompute all relevant indices once
        const { samples = [], sampleDataKeys = [], files = [] } = study;
        const keyIndices = ['GT', 'DP', 'GQ', 'AD', 'EXT_VAF'].reduce((acc, key) => {
            acc[key] = sampleDataKeys.indexOf(key);
            return acc;
        }, {});

        const formatField = (value, transform = v => v) =>
            (value === "." || value == null) ? "N/A" : transform(value);

        // Table with sample quality information
        this._samplesQuality.samples = samples.map(sample => {
            const { data, sampleId, fileIndex } = sample;
            const fileData = files?.[fileIndex]?.data ?? {};
            const individualInfo = this._getIndividual(sample);

            const probandSample = this.clinicalAnalysis?.proband?.samples?.find(s => s.id === sampleId);
            const sampleType = probandSample?.somatic ?? false;

            const gt = data?.[keyIndices.GT] ?? "-";
            const zig = VariantInterpreterGridFormatter.zygosityGenotypeRenderer(this.variant, sample, this.clinicalAnalysis);

            return {
                sample: { sampleId, sampleType: sampleType },
                individual: individualInfo,
                genotype: { gt, zig },
                DP: formatField(data?.[keyIndices.DP]),
                GQ: formatField(data?.[keyIndices.GQ]),
                AD: formatField(data?.[keyIndices.AD]),
                EXT_VAF: formatField(data?.[keyIndices.EXT_VAF], v => Number(v).toFixed(3)),
                QUAL: formatField(fileData?.QUAL),
                FILTER: formatField(fileData?.FILTER)
            };
        });

        // Piechart with proband AD proportion
        this._samplesQuality.alleleDepthsChart = samples.map(({ data, sampleId }) => {
            const adString = data?.[keyIndices.AD];
            let pieData;

            if (adString && adString !== ".") {
                const [ref, alt, other] = adString.split(",").map(Number);
                const total = ref + alt + (other || 0);
                const refPercent = total ? (ref / total) * 100 : 0;
                const altPercent = total ? (alt / total) * 100 : 0;

                pieData = [
                    { name: "Ref. Allele", y: refPercent },
                    { name: "Alt. Allele", y: altPercent },
                ];
                if (other) {
                    const otherPercent = total ? (other / total) * 100 : 0;
                    pieData.push({ name: "Second Alt. Allele", y: otherPercent });//
                }
            } else {
                pieData = [];
            }

            return { sampleId, chartData: pieData };
        });
    }

    _getIndividual(sampleEntry) {
        const individual = (this.clinicalAnalysis?.type === "FAMILY") ?
            this.clinicalAnalysis.family.members.find(m => m.samples[0].id === sampleEntry.sampleId) :
            this.clinicalAnalysis.proband;
        const id = individual.id;
        const sex = CatalogGridFormatter.sexFormatter(individual.sex, individual);
        return {id, sex};
    }

    #renderChart() {
        Highcharts.chart(`${this._chartId}`, {
            chart: {
                type: 'pie',
                backgroundColor: 'transparent',
                height: 150,       // reduce vertical space
                width: 300,
                spacing: [0, 0, 0, 0], // top, right, bottom, left padding
                margin: [0, 0, 0, 0],
            },
            title: {
                text: "AD Ratio",
                align: 'center',
                verticalAlign: 'middle',
                style: { fontSize: '14px' },
                y: 29,
            },
            subtitle: {
                text: `<span class="text-truncate" style="font-size:12px; max-width: 200px">Sample Id: ${this._samplesQuality.alleleDepthsChart[0].sampleId}</span>`,
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
                name: this._samplesQuality.alleleDepthsChart[0].sampleId,
                data: this._samplesQuality.alleleDepthsChart[0].chartData,
            }],
            tooltip: {
                useHTML: true,
                style: {
                    minWidth: '250px',
                    maxWidth: '250px',
                    whiteSpace: 'normal', // Allows wrapping
                },
            },
            legend: {
                enabled: false
            },
            credits: {
                enabled: false
            },
        });
    }

    render() {
        if (!this._samplesQuality) {
            return nothing;
        }

        // const data = this._variant.studies.find(s => s.studyId === this.opencgaSession.study.fqn).
        return html`
            <div class="rounded-4 p-4 bg-white">
                <div class=" d-flex justify-content-between mb-2">
                    <h5 class="mb-2 fs-5 fw-bold">Sample Quality</h5>
                    <a tooltip-title="Sample Quality" tooltip-text="${VariantGridFormatter.qualitySummaryTooltipContent()}">
                        <i class="fa fa-info-circle text-dark"></i>
                    </a>
                </div>
                <div class="" id="summary-sample-quality">
                    <data-form
                        .data="${this._samplesQuality}"
                        .config="${this._config}">
                    </data-form>
                </div>
                <!--<div class="card-footer text-muted">
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
                /*{// ToDo: Plot a pedigree chart for families},*/
                {
                    // title: "Section sample quality"
                    display: {
                        separationClassName: "",
                        className: "d-flex align-items-stretch",
                        layout: [
                            {
                                style: "flex: 1 1 auto",
                                elements: [
                                    {
                                        id: "sample-quality-summary",
                                    },
                                ],
                            },
                            {
                                style: "flex: 0 1 auto",
                                elements: [
                                    {
                                        id: "allele-balance-chart",
                                    }
                                ],
                            }
                        ],
                    },
                    elements: [
                        // 1. Sample Quality Summary
                        {
                            title: "SAMPLE QUALITY",
                            id: "sample-quality-summary",
                            type: "table",
                            field: "samples",
                            display: {
                                titleClassName: "summary-category mb-4",
                                titleStyle: "font-weight: normal !important",
                                defaultLayout: "vertical",
                                separationClassName: "mb-0",
                                className: "table mb-0",
                                style: "font-size: 12px;",
                                bodyCellClassName: "align-middle bg-transparent",
                                headerCellClassName: "bg-transparent",
                                rowId: true,
                                defaultValue: () => {
                                    return html`
                                        <div class="alert alert-light border-0 mb-0 d-flex align-items-center gap-1">
                                            <i class="fas fa-info-circle fs-4"></i>
                                            <div class="text-break">No proband or sample selected.</div>
                                        </div>
                                    `;
                                },
                                columns: [
                                    {
                                        title: "Sample",
                                        type: "custom",
                                        field: "sample",
                                        display: {
                                            defaultValue: "-",
                                            render: sample => {
                                                return html`
                                                    <div class="fw-bold text-truncate" style="max-width:350px">
                                                        ${sample.sampleId}
                                                    </div>
                                                    <div class="text-secondary">
                                                        ${sample.sampleType ? "SOMATIC" : ""}
                                                    </div>
                                                `;
                                            },
                                        },
                                    },
                                    {
                                        title: "Individual/Sex",
                                        field: "individual",
                                        type: "custom",
                                        display: {
                                            render: individual => {
                                                return html`
                                                    <div class="d-flex flex-column">
                                                        <div class="fw-bold me-2">${individual.id}</div>
                                                        <div class="text-secondary">${individual.sex}</div>
                                                    </div>
                                                `;
                                            },
                                        },
                                    },
                                    {
                                        title: "Genotype/Zygosity",
                                        type: "complex",
                                        display: {
                                            defaultValue: "-",
                                            template: "${genotype.gt} ${genotype.zig}",
                                            className: {
                                                "genotype.gt": "text-secondary me-2"
                                            },
                                        },
                                    },
                                    {
                                        title: "DP",
                                        field: "DP",
                                        display: {
                                            className: "text-secondary"
                                        }
                                    },
                                    {
                                        title: "GQ",
                                        field: "GQ",
                                        display: {
                                            className: "text-secondary"
                                        }
                                    },

                                    {
                                        title: "VAF",
                                        field: "EXT_VAF",
                                        display: {
                                            className: "text-secondary"
                                        }
                                    },
                                    {
                                        title: "AD",
                                        field: "AD",
                                        display: {
                                            className: "text-secondary"
                                        }
                                    },
                                    {
                                        title: "QUAL",
                                        field: "QUAL",
                                        display: {
                                            className: "text-secondary"
                                        }
                                    },
                                    {
                                        title: "FILTER",
                                        field: "FILTER",
                                        // Caution Vero 2025-07-03: default type plus className adds the className to
                                        // the td and to a child span div. In the badge case, the effect is not pleasant.
                                        type: "complex",
                                        display: {
                                            defaultValue: "N/A",
                                            template: "${FILTER}",
                                            className: {
                                                "FILTER": (filter) => filter === "PASS"
                                                    ? "badge bg-success-subtle text-success fs-7"
                                                    : "badge bg-secondary-subtle text-secondary fs-7",
                                            },
                                        },
                                    },
                                ]
                            },
                        },
                        // 2. Allele Distribution
                        {
                            title: "ALLELIC DEPTH RATIO",
                            id: "allele-balance-chart",
                            type: "custom",
                            field: "alleleDepthsChart",
                            display: {
                                titleClassName: "summary-category",
                                titleStyle: "font-weight: normal !important",
                                defaultLayout: "vertical",
                                separationClassName: "mb-0",
                                render: alleleDepthsChart => {
                                    return (alleleDepthsChart[0].chartData.length > 0) ? html`
                                            <div class="d-flex align-items-center">
                                                <div class="" id="${this._chartId}" style="flex: 0 0 auto"></div>
                                            </div>
                                    ` : `
                                        <div class="d-flex align-items-center pt-4 px-2">
                                            <label>No AD data available</label>
                                        </div>
                                    `;
                                }
                            }
                        }
                    ],
                },
            ],
        };
    }

}

customElements.define("variant-summary-quality", VariantSummaryQuality);
