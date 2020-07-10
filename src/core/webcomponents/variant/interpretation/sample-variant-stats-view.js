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
        //this.types = ["SNV", "INDEL", "CNV", "INSERTION", "DELETION", "MNV"];
        this._config = this.getDefaultConfig();
        this._sampleVariantStats = {};
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        // if (changedProperties.has("opencgaSession")) {
        //     this.opencgaSessionObserver();
        // }
        if (changedProperties.has("sampleId")) {
            this.sampleIdObserver();
        }
        if (changedProperties.has("sampleVariantStats")) {
            this.sampleVariantStatsObserver();
        }
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    sampleIdObserver() {
        // if (this.sampleId) {
        //     this.opencgaSession.opencgaClient.variants().infoSampleStats(this.sampleId, {study: this.opencgaSession.study.fqn})
        //         .then(response => {
        //             this.sampleVariantStats = response.getResult(0);
        //             this.requestUpdate();
        //         }).catch(response => {
        //         console.error(response);
        //         this.sampleVariantStats = null;
        //     }).finally(() => this.requestUpdate());
        // }
        if (this.opencgaSession && this.sampleId) {
            this.opencgaSession.opencgaClient.samples().info(this.sampleId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.sample = response.responses[0].results[0];
                    if (this.sample && this.sample?.qualityControl?.metrics && this.sample.qualityControl.metrics.length > 0) {
                        let _variantStats = this.sample.qualityControl.metrics[0].variantStats.find(stat => stat.id === "ALL");
                        //_variantStats.stats.chromosomeCount.filter( ch => Boolean(parseInt(ch)) || ["X", "Y", "MT"].includes(ch))
                        this.sampleVariantStats = _variantStats.stats;
                    }
                    this.requestUpdate();
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    sampleVariantStatsObserver() {
        this._sampleVariantStats = {
            ...this.sampleVariantStats,
            chromosomeCount: ClinicalAnalysisUtils.chromosomeFilterSorter(this.sampleVariantStats.chromosomeCount)
        }
        this.requestUpdate();
    }

    getDefaultConfig() {
        return {
            title: "Summary",
            icon: "",
            display: {
                collapsable: true,
                showTitle: false,
                labelWidth: 3,
                defaultValue: "-",
                defaultLayout: "horizontal"
            },
            sections: [
                {
                    //title: "General", //it is not required
                    collapsed: false,
                    elements: [
                        {
                            name: "Sample ID",
                            field: "id"
                        },
                        {
                            name: "Number of Variants",
                            field: "variantCount"
                        },
                        {
                            name: "Ti/Tv Ratio",
                            field: "tiTvRatio"
                        },
                        {
                            name: "Quality Avg (Quality Standard dev.)",
                            type: "complex",
                            display: {
                                template: "${qualityAvg} (${qualityStdDev})"
                            }
                        },
                        {
                            name: "Heterozygosity Rate",
                            field: "heterozygosityRate"
                        }
                    ]
                }, {
                    //title: "plots",
                    elements: [
                        [
                            {
                                name: "Disorders",
                                field: "chromosomeCount",
                                type: "plot",
                                showLabel: false,
                                display: {
                                    chart: "column"
                                }
                            },
                            {
                                name: "Types",
                                field: "typeCount",
                                type: "plot",
                                showLabel: false,
                                display: {
                                    chart: "column"
                                }
                            }
                        ], [
                            {
                                name: "Genotype and Filter",
                                type: "custom",
                                showLabel: false,
                                display: {
                                    width: 12,
                                    render: data => {
                                        return html`
                                        <div class="">
                                            <div class="row">
                                                <div class="col-md-6">
                                                    <simple-chart .active="${true}" type="pie" title="Genotypes" .data="${data.genotypeCount}"></simple-chart>
                                                </div>
                                                <div class="col-md-6">
                                                    <simple-chart .active="${true}" type="pie" title="Filters" .data="${data.filterCount}"></simple-chart>
                                                </div>  
                                            </div>
                                        </div>
                                    `;
                                    }
                                }
                            },

                            {
                                name: "INDEL Length",
                                field: "indelLengthCount",
                                type: "plot",
                                showLabel: false,
                                display: {
                                    chart: "column"
                                }
                            }
                        ]
                    ]
                }, {
                    //title: "plots2",
                    elements: [
                        {
                            name: "Consequence type",
                            field: "consequenceTypeCount",
                            type: "plot",
                            showLabel: false,
                            display: {
                                chart: "column"
                            }
                        },
                        {
                            name: "Biotype",
                            field: "biotypeCount",
                            type: "plot",
                            showLabel: false,
                            display: {
                                chart: "column"
                            }
                        }
                    ]
                }
            ]
        };
    }

    render() {
        return html`
            <style>
                .plot-wrapper {
                    margin: 25px 0
                }
            </style>
            <data-form .data=${this._sampleVariantStats} .config="${this.getDefaultConfig()}"></data-form>
        `;
    }

}

customElements.define("sample-variant-stats-view", SampleVariantStatsView);
