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
import UtilsNew from "../../../core/utils-new.js";

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
        this.querySelector("#summary-sample-quality data-form").updateComplete.then(() => {
            this.#renderChart();
        });
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
                text: `<span style="font-size:12px;">Sample Id: ${this._data[0].sampleId}</span>`,
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
                name: this._data[0].sampleId,
                data: this._data[0].chartData,
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

    getSex(sampleEntry) {
        let sex;
        if (this.clinicalAnalysis?.type === "FAMILY") {
            // we need to find the sex of each member of the family
            const individual = this.clinicalAnalysis.family.members.find(m => m.samples[0].id === sampleEntry.sampleId);
            sex = UtilsNew.isEmpty(individual?.sex) ? "Not specified" : individual.sex?.id || individual.sex;
        } else {
            sex = (!!this.clinicalAnalysis?.proband?.sex && this.clinicalAnalysis?.proband?.sex.id !== "UNKNOWN")
                ? this.clinicalAnalysis.proband.sex.id
                : "";
        }
        return sex;
    }

    variantObserver() {
        this._samplesQuality = {};
        const study = this.variant.studies.find(study => study.studyId === this.opencgaSession.study.fqn)
        const {samples, sampleDataKeys, files} = study;

        // Precompute all relevant indices once
        const keyIndices = ['GT', 'DP', 'GQ', 'AD', 'EXT_VAF'].reduce((acc, key) => {
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
                sex: this.getSex(sample),
                GT: gt,
                Zig: VariantInterpreterGridFormatter.zygosityGenotypeRenderer(this.variant, sample, this.clinicalAnalaysis),
                DP: data[keyIndices.DP] ?? "-",
                GQ: data[keyIndices.GQ] ?? "-",
                AD: data[keyIndices.AD] ?? "-",
                EXT_VAF: data[keyIndices.EXT_VAF] ?? "-",
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

    render() {
        if (!this._samplesQuality) {
            return nothing;
        }
        // const data = this._variant.studies.find(s => s.studyId === this.opencgaSession.study.fqn).
        return html`
            <div class="card p-3">
                <div class="card-header border-0">
                    <h5 class="mb-2 fs-5 fw-bold d-flex">Sample Quality</h5>
                </div>
                <div class="card-body pt-0 pb-0" id="summary-sample-quality">
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
                        className: "d-flex align-items-center",
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
                                style: "flex: 1 1 auto",
                                classes: "d-flex justify-content-center",
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
                            id: "sample-quality-summary",
                            type: "table",
                            field: "samples",
                            display: {
                                separationClassName: "",
                                className: "table table-borderless table-hover table-grid",
                                style: "font-size: 11px",
                                rowId: true,
                                defaultValue: "No proband or sample selected.",
                                columns: [
                                    {
                                        title: "Individual/Sample",
                                        field: "sampleId",
                                        display: {
                                            defaultValue: "-",
                                            style: {
                                                "font-weight": "bold",
                                            }
                                        },
                                    },
                                    {
                                        title: "Sex",
                                        field: "sex",
                                        display: {
                                            defaultValue: "-",
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
                                                "Zig": "",
                                            },
                                        },
                                    },
                                    {
                                        title: "DP",
                                        field: "DP",
                                    },
                                    {
                                        title: "GQ",
                                        field: "GQ",
                                    },

                                    {
                                        title: "EXT_VAF",
                                        field: "EXT_VAF",
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
                        // 2. Allele Distribution
                        {
                            id: "allele-balance-chart",
                            type: "custom",
                            field: "alleleDepthsChart",
                            display: {
                                separationClassName: "",
                                render: alleleDepthsChart => {
                                    this._data = JSON.parse(JSON.stringify(alleleDepthsChart));
                                    return html`
                                        <div class="d-flex align-items-stretch">
                                            <div class="" id="${this._chartId}" style="flex: 0 0 auto"></div>
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
