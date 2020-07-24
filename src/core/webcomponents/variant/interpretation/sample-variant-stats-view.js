/*
 * Copyright 2015-2016 OpenCB
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

import {LitElement, html} from "/web_modules/lit-element.js";
import UtilsNew from "../../../utilsNew.js";
import "../../simple-chart.js";
import "../../commons/view/data-form.js";
import ClinicalAnalysisUtils from "../../clinical/clinical-analysis-utils.js";

class SampleVariantStatsView extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            sampleId: {
                type: String
            },
            sample: {
                type: Object
            },
            sampleVariantStats: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "vcis-" + UtilsNew.randomString(6);
        this.variantStats = {};

        // Default config for Highcharts charts
        this.defaultHighchartConfig = {
            chart: {
                backgroundColor: {
                    // linearGradient: [0, 0, 500, 500],
                    stops: [
                        [0, "rgb(255, 255, 255)"],
                        [1, "rgb(240, 240, 255)"]
                    ]
                },
                borderWidth: 0,
                // plotBackgroundColor: "rgba(255, 255, 255, .9)",
                plotShadow: true,
                plotBorderWidth: 1
            },
            tooltip: {
                headerFormat: "<span style=\"font-size:10px\">{point.key}</span><table>",
                pointFormat: "<tr><td style=\"color:{series.color};padding:0\">{series.name}: </td>" +
                    "<td style=\"padding:0\"><b>{point.y:.1f} </b></td></tr>",
                footerFormat: "</table>",
                shared: true,
                useHTML: true
            }
        };
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        // if (changedProperties.has("opencgaSession")) {
        //     this.opencgaSessionObserver();
        // }

        if (changedProperties.has("sampleVariantStats")) {
            this.sampleVariantStatsObserver();
        }

        if (changedProperties.has("sampleId")) {
            this.sampleIdObserver();
        }

        if (changedProperties.has("sample")) {
            this.getVariantStatFromSample();
        }

        if (changedProperties.has("config")) {
            // this._config = {...this.getDefaultConfig(), ...this.config};
            this._config = this.getDefaultConfig();
            _.merge(this._config, this.config);
            // debugger
            this.requestUpdate();
        }
    }

    sampleVariantStatsObserver() {
        this.variantStats = {
            stats: {
                ...this.sampleVariantStats.stats,
                chromosomeCount: ClinicalAnalysisUtils.chromosomeFilterSorter(this.sampleVariantStats.stats.chromosomeCount)
            }
        }
        this.sampleSelector = false;
        this.requestUpdate();
    }

    sampleIdObserver() {
        if (this.opencgaSession && this.sampleId) {
            this.opencgaSession.opencgaClient.samples().info(this.sampleId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.sample = response.getResult(0);
                    this.getVariantStatFromSample();
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    getVariantStatFromSample() {
        this.statsSelect = this.sample.qualityControl.metrics[0].variantStats.map( stat => stat.id);
        if (this.sample?.qualityControl?.metrics?.length && this.sample.qualityControl.metrics[0].variantStats?.length) {
            // By default we render the stat 'ALL' from the first metric, if there is not stat 'ALL' then we take the first one
            let selectedStat = this.sample.qualityControl.metrics[0].variantStats.find(stat => stat.id === "ALL") ?? this.sample.qualityControl.metrics[0].variantStats[0];
            // debugger
            this.statsSelected = selectedStat.id;
            this.variantStats = selectedStat;
        } else {
            //TODO recheck
            // Check if sample variant stats has been indexed in annotationSets
            let annotationSet = this.sample?.annotationSets?.find(annotSet => annotSet.id.toLowerCase() === "opencga_sample_variant_stats");
            this.variantStats = annotationSet?.annotations;
        }

        if (this.variantStats.chromosomeCount) {
            this.variantStats.chromosomeCount = ClinicalAnalysisUtils.chromosomeFilterSorter(this.variantStats.chromosomeCount)
        }
        this.sampleSelector = true;
        this.requestUpdate();
    }

    statChange(e) {
        this.variantStats = this.sample.qualityControl.metrics[0].variantStats.find(stat => stat.id === e.detail.value)
        this.requestUpdate();
    }

    getDefaultConfig() {
        return {
            title: "Summary",
            icon: "",
            display: {
                collapsable: true,
                // showTitle: false,
                labelWidth: 3,
                defaultValue: "-",
                defaultLayout: "horizontal"
            },
            sections: [
                {
                    title: "Summary",
                    display: {
                        // titleHeader: "h1"
                    },
                    elements: [
                        {
                            name: "Sample ID",
                            field: "stats.id",
                            display: {
                                style: "font-weight: bold",
                            }
                        },
                        {
                            name: "Number of Variants",
                            field: "stats.variantCount",
                            type: "custom",
                            display: {
                                render: variantCount => {
                                    if (variantCount > 0) {
                                        return html`${variantCount} variants`;
                                    } else {
                                        return html`<span style="color: red">${variantCount} variants</span>`;
                                    }
                                }
                            }
                        },
                        {
                            name: "Ti/Tv Ratio",
                            field: "stats.tiTvRatio",
                            display: {
                                decimals: 4,
                                visible: tiTvRatio => tiTvRatio !== 0
                            }
                        },
                        {
                            name: "Quality Avg (Quality Standard Dev.)",
                            type: "complex",
                            display: {
                                template: "${qualityAvg} (${qualityStdDev})",
                                visible: variantStats => variantStats?.stats?.qualityAvg !== 0
                            }
                        },
                        {
                            name: "Heterozygosity Rate",
                            field: "stats.heterozygosityRate",
                            display: {
                                decimals: 4,
                                visible: heterozygosityRate => heterozygosityRate !== 0
                            }
                        },
                        {
                            name: "Stats Query Filters",
                            field: "query",
                            type: "custom",
                            display: {
                                render: query => query && !UtilsNew.isEmpty(query) ? Object.entries(query).map( (k, v) => html`<span class="badge">${k}: ${v}</span>`) : "none"
                            }
                        },
                        {
                            name: "Description",
                            field: "description"
                        },
                    ]
                }, {
                    title: "Variant Stats",
                    display: {
                        visible: variantStats => variantStats?.stats?.variantCount > 0
                    },
                    elements: [
                        [
                            {
                                name: "Chromosomes",
                                field: "stats.chromosomeCount",
                                type: "chart",
                                showLabel: false,
                                display: {
                                    highcharts: {
                                        chart: {
                                            type: "column",
                                            ...this.defaultHighchartConfig.chart
                                        },
                                        title: {
                                            text: "Chromosomes"
                                        },
                                        tooltip: {
                                            ...this.defaultHighchartConfig.tooltip
                                        }
                                    }
                                }
                            },
                            {
                                name: "Variant Type",
                                field: "stats.typeCount",
                                type: "chart",
                                showLabel: false,
                                display: {
                                    sort: true,
                                    highcharts: {
                                        chart: {
                                            type: "column",
                                            ...this.defaultHighchartConfig.chart
                                        },
                                        tooltip: {
                                            ...this.defaultHighchartConfig.tooltip
                                        }
                                    }
                                }
                            }
                        ], [
                            {
                                name: "Genotype and Filter",
                                type: "custom",
                                showLabel: false,
                                display: {
                                    render: variantStats => {
                                        return html`
                                            <div class="row">
                                                <div class="col-md-5 col-md-offset-1">
                                                    <simple-chart .active="${true}" type="pie" title="Genotypes" .data="${variantStats.stats.genotypeCount}"></simple-chart>
                                                </div>
                                                <div class="col-md-5 col-md-offset-1">
                                                    <simple-chart .active="${true}" type="pie" title="VCF Filter" .data="${variantStats.stats.filterCount}"></simple-chart>
                                                </div>  
                                            </div>
                                        `;
                                    }
                                }
                            },
                            {
                                name: "INDEL Size",
                                field: "stats.indelLengthCount",
                                type: "chart",
                                showLabel: false,
                                display: {
                                    visible: indelLengthCount => !indelLengthCount,
                                    highcharts: {
                                        chart: {
                                            type: "column",
                                            ...this.defaultHighchartConfig.chart
                                        },
                                        tooltip: {
                                            ...this.defaultHighchartConfig.tooltip
                                        }
                                    }
                                }
                            }
                        ]
                    ]
                }, {
                    //title: "plots2",
                    display: {
                        visible: variantStats => variantStats?.stats?.variantCount > 0
                    },
                    elements: [
                        {
                            name: "Consequence Type",
                            field: "stats.consequenceTypeCount",
                            type: "chart",
                            showLabel: false,
                            display: {
                                sort: true,
                                highcharts: {
                                    chart: {
                                        type: "column",
                                        ...this.defaultHighchartConfig.chart
                                    },
                                    tooltip: {
                                        ...this.defaultHighchartConfig.tooltip
                                    }
                                }
                            }
                        },
                        {
                            name: "Biotype",
                            field: "stats.biotypeCount",
                            type: "chart",
                            showLabel: false,
                            display: {
                                sort: true,
                                highcharts: {
                                    chart: {
                                        type: "column",
                                        ...this.defaultHighchartConfig.chart
                                    },
                                    tooltip: {
                                        ...this.defaultHighchartConfig.tooltip
                                    }
                                }
                            }
                        },
                        {
                            name: "ClinVar Clinical Significance",
                            field: "stats.clinicalSignificanceCount",
                            type: "chart",
                            showLabel: false,
                            display: {
                                sort: true,
                                highcharts: {
                                    chart: {
                                        type: "column",
                                        ...this.defaultHighchartConfig.chart
                                    },
                                    tooltip: {
                                        ...this.defaultHighchartConfig.tooltip
                                    }
                                }
                            }
                        }
                    ]
                }, {
                    title: "Variant Stats",
                    display: {
                        visible: variantStats => variantStats?.stats?.variantCount === 0
                    },
                    elements: [
                        {
                            name: "Warning",
                            type: "custom",
                            display: {
                                render: () => html`<span>No variants found</span>`
                            }
                        }
                    ]
                }
            ]
        };
    }

    render() {
        /*if (!this._sampleVariantStats || !this._sampleVariantStats.id) {
            return html`<div class="alert alert-info"><i class="fas fa-3x fa-info-circle align-middle" style="padding-right: 10px"></i> No Variant Stats found.</div>`;
        }*/
        return html`
            ${this.sampleSelector 
                ? html`
                    <div style="margin: 20px 10px">
                        <div class="form-horizontal">
                            <div class="form-group">
                                <label class="col-md-2">Select Variant Stat</label>
                                <div class="col-md-2">
                                    <select-field-filter forceSelection .data="${this.statsSelect}" .value=${this.statsSelected} @filterChange="${this.statChange}"></select-field-filter>
                                </div>
                            </div>
                            
                        </div>
                    </div>` 
                : null
            }
            
            <div>
                <data-form .data=${this.variantStats} .config="${this._config}"></data-form>
            </div>
        `;
    }

}

customElements.define("sample-variant-stats-view", SampleVariantStatsView);
