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
            opencgaSession: {
                type: Object,
            },
        };
    }

    #init() {
        this.COMPONENT_ID = "variant-summary-quality";
        this._study = null;
        this._config = this.getDefaultConfig();
        this._samplesQuality = {};

        this._defaultHighchartConfig = {
            accessibility: {
                point: {
                    valueSuffix: '%'
                }
            },
            plotOptions: {
                pie: {
                    //size: "200px",
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                    }
                },
            },
            series: [{
                name: 'Reads',
                color: '#ff0000',
                colorByPoint: true,
                data: [
                    {
                        name: 'Reference Allele',
                        y: 1
                    },
                    {
                        name: 'Alternate Allele',
                        y: 1
                    }
                ]
            }],
            tooltip: {
                pointFormat: '<b>{point.percentage:.1f}%</b> ({point.y} reads)'
                // headerFormat: `
                //     <span style="font-size:10px">{point.key}</span>
                //     <table>
                // `,
                // pointFormat: `
                //     <tr>
                //         <td style="color:{series.color};padding:0">{series.name}: </td>
                //         <td style="padding:0"><b>{point.y:.1f} </b></td>
                //     </tr>
                // `,
                // footerFormat: `</table>`,
                // shared: true,
                // useHTML: true
            }
        };

    }

    update(changedProperties) {
        if (changedProperties.has("variant") || changedProperties.has("opencgaSession")) {
            this.variantObserver();
        }

        super.update(changedProperties);
    }

    variantObserver() {
        const study = this.variant.studies.find(study => study.studyId === this.opencgaSession.study.fqn)
        const { samples, sampleDataKeys, files} = study;

        // Precompute all relevant indices once
        const keyIndices = ['GT', 'DP', 'VAF', 'BQ', 'AD'].reduce((acc, key) => {
            acc[key] = sampleDataKeys.indexOf(key);
            return acc;
        }, {});

        this._samplesQuality.samples = samples.map(sample => {
            const data = sample.data;
            const fileData = files?.[sample.fileIndex]?.data ?? {};

            const gt = data[keyIndices.GT] ?? "-";
            //const gt = VariantInterpreterGridFormatter.alleleGenotypeRenderer(this.variant, sample, "call");

            return {
                    sampleId: sample.sampleId,
                    GT: gt,
                    Zig: this.getZygosity(gt),
                    DP: data[keyIndices.DP] ?? "-",
                    VAF: data[keyIndices.VAF] ?? "-",
                    BQ: data[keyIndices.BQ] ?? "-",
                    AD: data[keyIndices.AD] ?? "-",
                    QUAL: fileData.QUAL ?? "-",
                    FILTER: fileData.FILTER ?? "-"
            }
        });

        this._samplesQuality.alleleDepthsChart = samples.map(sample => {
            const data = sample.data;
            const adString = data[keyIndices.AD] ?? ".";
            let pieData;

            if (adString && adString !== ".") {
                const [ref, alt] = adString
                    .split(',')
                    .map(Number);
                const total = ref + alt;
                const refPercent = total > 0 ? (ref / total) * 100 : 0;
                const altPercent = total > 0 ? (alt / total) * 100 : 0;
                pieData = [
                    {name: 'Ref Allele', y: refPercent},
                    {name: 'Alt Allele', y: altPercent}
                ];
            } else {
                pieData = [
                    { name: 'Ref Allele', y: 0 },
                    { name: 'Alt Allele', y: 0 }
                ];
            }

            return {
                sampleId: sample.sampleId,
                chartData: pieData
            };
        })
    }

    getZygosity(gt) {
        if (!gt || gt.includes('.')) return 'UNKNOWN'; // Missing data

        const alleles = gt.replace('|', '/').split('/');

        if (alleles.length !== 2) return 'UNKNOWN';

        const [a1, a2] = alleles;

        if (a1 === '0' && a2 === '0') return 'WT';
        if (a1 === a2) return 'HOM';
        return 'HET';
    }

    render() {
        if (!this._samplesQuality) {
            return nothing;
        }
        // const data = this._variant.studies.find(s => s.studyId === this.opencgaSession.study.fqn).
        return html`
            <div class="card p-3">
                <div class="card-header border-0">
                    <h5 class="mb-2 fs-5 fw-bold d-flex">Sample Quality</h5>
                    <p class="text-secondary">Description of sample quality</p>

                </div>
                <div class="card-body pt-0 pb-0">
                    <data-form
                        .data="${this._samplesQuality}"
                        .config="${this._config}">
                    </data-form>
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
            },
            sections: [
                /*
                {
                    // ToDo: Plot a pedigree chart for families
                },
                 */
                {
                    // title: "Section sample quality"
                    display: {
                        className: "d-flex justify-content-between align-items-start",
                        layout: {
                            id: "",
                            className: "",
                            elements: [
                                {
                                    id: "sample-quality-summary",
                                    className: ""
                                },
                                {
                                    id: "allele-balance-chart",
                                    className: ""
                                }
                            ]
                        },
                    },
                    elements: [
                        // Sample Quality Summary
                        {
                            id: "sample-quality-summary",
                            type: "table",
                            field: "samples",
                            // title: "Sample Quality Summary",
                            display: {
                                className: "table table-borderless table-hover table-grid",
                                headerCellClassName: "th-inner",
                                rowId: true,
                                defaultValue: "No proband or sample selected.",
                                columns: [
                                    {
                                        title: "Individual/Sample",
                                        field: "sampleId",
                                        display: {
                                            defaultValue: "-",
                                            style: {
                                                "font-weight": "bold"
                                            }
                                        },
                                    },
                                    {
                                        title: "GENOTYPE",
                                        field: "GT",
                                        display: {
                                            defaultValue: "-",
                                        },
                                    },
                                    {
                                        title: "ZYGOSITY",
                                        field: "Zig",
                                        // Caution Vero 2025-07-03: default type plus className adds the className to
                                        // the td and to a child span div. In the badge case, the effect is not pleasant.
                                        type: "complex",
                                        display: {
                                            defaultValue: "-",
                                            template: "${Zig}",
                                            className: {
                                                "Zig": "badge bg-secondary-subtle text-secondary fs-6",
                                            },
                                        },
                                    },
                                    {
                                        title: "DP",
                                        field: "DP",
                                        display: {
                                            classes: "text-gray-800 fw-light",
                                        },
                                    },
                                    {
                                        title: "VAF",
                                        field: "VAF",
                                    },
                                    {
                                        title: "BQ",
                                        field: "BQ",
                                    },
                                    {
                                        title: "AD",
                                        field: "AD",
                                    },
                                    {
                                        title: "QUAL",
                                        field: "QUAL",
                                    },
                                    {
                                        title: "FILTER",
                                        field: "FILTER",
                                        // Caution Vero 2025-07-03: default type plus className adds the className to
                                        // the td and to a child span div. In the badge case, the effect is not pleasant.
                                        type: "complex",
                                        display: {
                                            defaultValue: "-",
                                            template: "${FILTER}",
                                            className: {
                                                "FILTER": (filter) => filter === "PASS"
                                                    ? "badge bg-success-subtle text-success fs-6"
                                                    : "badge bg-secondary-subtle text-secondary fs-6",
                                            },
                                        },
                                    },
                                ]
                            },
                        },
                        // Allele Distribution
                        {
                            id: "allele-balance-chart",
                            title: "Allele Balance Chart",
                            type: "chart",
                            field: "alleleDepthsChart",
                            showLabel: false,
                            display: {
                                highcharts: {
                                    chart: {
                                        type: "pie",
                                        height: 300,
                                    },
                                    title: {
                                        text: 'Variant Allele Balance',
                                    },
                                    tooltip: {
                                        pointFormat: '<b>{point.percentage:.1f}%</b> ({point.y} reads)'
                                    }
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
