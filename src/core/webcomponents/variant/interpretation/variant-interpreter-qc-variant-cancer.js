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

import {LitElement, html} from "/web_modules/lit-element.js";
import UtilsNew from "../../../utilsNew.js";
import "./variant-interpreter-qc-cancer-plots.js";
import "../opencga-variant-filter.js";
import "../../commons/opencga-active-filters.js";
import "../../commons/view/signature-view.js";
import "../../loading-spinner.js";

export default class VariantInterpreterQcVariantCancer extends LitElement {

    constructor() {
        super();

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
            clinicalAnalysisId: {
                type: String
            },
            clinicalAnalysis: {
                type: Object
            },
            query: {
                type: Object
            },
            active: {
                type: Boolean
            },
            config: {
                type: Object
            }
        }
    }

    _init(){
        this._prefix = "sf-" + UtilsNew.randomString(6);

        this.save = {};
        this.settings = {
            density: "MEDIUM",
            format: "SVG"
        };
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("clinicalAnalysis")) {
            // Select the somatic sample
            this.sample = this.clinicalAnalysis.proband.samples.find(sample => sample.somatic);
        }

        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }

        if (changedProperties.has("query")) {
            this.queryObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    queryObserver() {
        if (this.query) {
            this.preparedQuery = {study: this.opencgaSession.study.fqn, ...this.query};
            this.executedQuery = {study: this.opencgaSession.study.fqn, ...this.query};
        }
        this.requestUpdate();
    }

    clinicalAnalysisIdObserver() {
        if (this.opencgaSession && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis = response.responses[0].results[0];
                    // Select the somatic sample
                    this.sample = this.clinicalAnalysis.proband.samples.find(sample => sample.somatic);
                    this.requestUpdate();
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    onVariantFilterChange(e) {
        this.preparedQuery = e.detail.query;
        this.requestUpdate();
    }

    onVariantFilterSearch(e) {
        this.preparedQuery = e.detail.query;
        this.executedQuery = e.detail.query;
        this.requestUpdate();
    }

    onActiveFilterChange(e) {
        this.query = {study: this.opencgaSession.study.fqn, ...e.detail};
        // this.requestUpdate();
    }

    onActiveFilterClear() {
        this.query = {study: this.opencgaSession.study.fqn};
        // this.requestUpdate();
    }

    onFilterIdChange(e) {
        this.filterId = e.currentTarget.value;
    }

    onFilterDescriptionChange(e) {
        this.filterDescription = e.currentTarget.value;
    }

    onSettingsFieldChange(e) {
        switch (e.detail.param) {
            case "density":
                this.settings.id = e.detail.value;
                break;
            case "format":
                this.settings.format = e.detail.value;
                break;
        }
    }

    onSaveFieldChange(e) {
        switch (e.detail.param) {
            case "id":
                this.save.id = e.detail.value;
                break;
            case "description":
                this.save.description = e.detail.value;
                break;
        }
    }

    onClear(e) {
    }

    onSettingsOk(e) {
    }

    /**
     * Prepare sampleVariantStats data for the onSave function.
     * @param e
     */
    onChangeAggregationStatsResults(e) {
        // Parse aggregationStatsResults and create a sampleVariantStats
        let aggregationStatsResults = e.detail.aggregationStatsResults;
        if (aggregationStatsResults) {
            this.sampleVariantStats = {
                id: this.sample.id
            };
            for (let aggregatedResult of aggregationStatsResults) {
                let values = {};
                for (let bucket of aggregatedResult.buckets) {
                    values[bucket.value] = bucket.count;
                }
                switch (aggregatedResult.name) {
                    case "chromosome":
                        this.sampleVariantStats.variantCount = aggregatedResult.count;
                        this.sampleVariantStats.chromosomeCount = values;
                        break;
                    case "genotype":
                        this.sampleVariantStats.genotypeCount = values;
                        break;
                    case "type":
                        this.sampleVariantStats.typeCount = values;
                        break;
                    case "biotype":
                        this.sampleVariantStats.biotypeCount = values;
                        break;
                    case "consequenceType":
                        this.sampleVariantStats.consequenceTypeCount = values;
                        break;
                }
            }
        }
    }

    /**
     * Save signature for onSave function.
     * @param e
     */
    onChangeSignature(e) {
        this.signature = e.detail.signature;
    }

    onSave(e) {
        // Search bamFile for the sample
        let bamFile = this.clinicalAnalysis.files.find(file => file.format === "BAM" && file.samples.some(sample => sample.id === this.sample.id));
        let variantStats = {
            id: this.save.id,
            query: this.executedQuery || {},
            description: this.save.description || "",
            stats: this.sampleVariantStats
        };

        // Check if a metric object for that bamFileId exists
        let metric = this.sample?.qualityControl?.metrics.find(metric => metric.bamFileId === bamFile.id);
        if (metric) {
            // Push the stats and signature in the existing metric object
            metric.variantStats.push(variantStats);
            metric.signatures.push(this.signature);
        } else {
            // create a new metric
            metric = {
                bamFileId: bamFile.id,
                variantStats: [variantStats],
                signatures: [this.signature]
            }
            // Check if this is the first metric object
            if (this.sample?.qualityControl?.metrics) {
                this.sample.qualityControl.metrics.push(metric);
            } else {
                this.sample["qualityControl"] = {
                    metrics: [metric]
                };
            }
        }

        this.opencgaSession.opencgaClient.samples().update(this.sample.id, {qualityControl: this.sample.qualityControl}, {study: this.opencgaSession.study.fqn})
            .then( restResponse => {
                console.log(restResponse);
            })
            .catch( restResponse => {
                console.error(restResponse);
            })
            .finally( () => {
                this.requestUpdate();
            })
    }

    getSettingsConfig() {
        return {
            title: "Settings",
            icon: "fas fa-cog",
            type: "form",
            buttons: {
                show: true,
                cancelText: "Cancel",
                okText: "OK",
            },
            display: {
                style: "margin: 0px 25px 0px 0px",
                mode: {
                    type: "modal",
                    title: "Display Settings",
                    buttonClass: "btn btn-default"
                },
                labelWidth: 4,
                labelAlign: "right",
                defaultValue: "",
                defaultLayout: "horizontal",
            },
            sections: [
                {
                    title: "Circos",
                    elements: [
                        {
                            name: "Rain Plot Density",
                            field: "density",
                            type: "select",
                            allowedValues: ["LOW", "MEDIUM", "HIGH"],
                            defaultValue: "LOW",
                            display: {
                            }
                        },
                        {
                            name: "Image format",
                            field: "format",
                            type: "select",
                            allowedValues: ["PNG", "SVG"],
                            defaultValue: ["PNG"],
                            display: {
                            }
                        },
                    ]
                }
            ]
        }
    }

    getSaveConfig() {
        return {
            title: "Save",
            icon: "fas fa-save",
            type: "form",
            buttons: {
                show: true,
                cancelText: "Cancel",
                okText: "Save",
            },
            display: {
                style: "margin: 0px 25px 0px 0px",
                mode: {
                    type: "modal",
                    title: "Save Variant Stats",
                    buttonClass: "btn btn-default"
                },
                labelWidth: 3,
                labelAlign: "right",
                defaultValue: "",
                defaultLayout: "horizontal",
            },
            sections: [
                {
                    elements: [
                        {
                            name: "Filter ID",
                            field: "id",
                            type: "input-text",
                            display: {
                                placeholder: "Add a filter ID",
                            }
                        },
                        {
                            name: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                placeholder: "Add a filter description",
                                rows: 2
                            }
                        }
                    ]
                }
            ]
        }
    }

    getDefaultConfig() {
        return {
            title: "",
            icon: "fas fa-search",
            searchButtonText: "Search",
            filter: {
                title: "Filter",
                activeFilters: {
                    alias: {
                        // Example:
                        // "region": "Region",
                        // "gene": "Gene",
                        "ct": "Consequence Types"
                    },
                    complexFields: ["genotype"],
                    hiddenFields: []
                },
                sections: [     // sections and subsections, structure and order is respected
                    // {
                    //     title: "Sample",
                    //     collapsed: false,
                    //     fields: [
                    //         {
                    //             id: "file-quality",
                    //             title: "Quality Filter",
                    //             tooltip: "VCF file based FILTER and QUAL filters",
                    //             showDepth: application.appConfig === "opencb"
                    //         }
                    //     ]
                    // },
                    {
                        title: "Filters",
                        collapsed: false,
                        fields: [
                            {
                                id: "file-quality",
                                title: "Quality Filter",
                                tooltip: "VCF file based FILTER and QUAL filters",
                                showDepth: application.appConfig === "opencb"
                            },
                            {
                                id: "region",
                                title: "Genomic Location",
                                tooltip: tooltips.region
                            },
                            {
                                id: "feature",
                                title: "Feature IDs (gene, SNPs, ...)",
                                tooltip: tooltips.feature
                            },
                            {
                                id: "diseasePanels",
                                title: "Disease Panels",
                                tooltip: tooltips.diseasePanels
                            },
                            {
                                id: "biotype",
                                title: "Gene Biotype",
                                biotypes: biotypes,
                                tooltip: tooltips.biotype
                            },
                            {
                                id: "type",
                                title: "Variant Type",
                                biotypes: types,
                                tooltip: tooltips.type
                            },
                            {
                                id: "consequenceTypeSelect",
                                title: "Select SO terms",
                                tooltip: tooltips.consequenceTypeSelect
                            }
                        ]
                    },
                    // {
                    //     title: "Consequence Type",
                    //     collapsed: true,
                    //     fields: [
                    //         {
                    //             id: "consequenceTypeSelect",
                    //             title: "Select SO terms",
                    //             tooltip: tooltips.consequenceTypeSelect
                    //         }
                    //     ]
                    // }
                ],
                examples: [
                    {
                        id: "Example Missense PASS",
                        active: false,
                        query: {
                            filter: "PASS",
                            ct: "lof,missense_variant"
                        }
                    },
                ],
                result: {
                    grid: {}
                },
                detail: {
                }
            }
        }
    }

    render() {
        return html`
            <div class="row">
                <div class="col-md-3 left-menu">
                    <opencga-variant-filter .opencgaSession=${this.opencgaSession}
                                            .query="${this.query}"
                                            .cellbaseClient="${this.cellbaseClient}"
                                            .populationFrequencies="${this.populationFrequencies}"
                                            .consequenceTypes="${this.consequenceTypes}"
                                            .cohorts="${this.cohorts}"
                                            .searchButton="${true}"
                                            .config="${this._config.filter}"
                                            @queryChange="${this.onVariantFilterChange}"
                                            @querySearch="${this.onVariantFilterSearch}">
                    </opencga-variant-filter>
                </div>

                <div class="col-md-9">
                    <div class="row">
                        <div class="col-md-12">
                            <opencga-active-filters resource="VARIANT"
                                                    .opencgaSession="${this.opencgaSession}"
                                                    .defaultStudy="${this.opencgaSession.study.fqn}"
                                                    .query="${this.preparedQuery}"
                                                    .refresh="${this.executedQuery}"
                                                    .alias="${this.activeFilterAlias}"
                                                    .filters="${this._config.filter.examples}"
                                                    .config="${this._config.filter.activeFilters}"
                                                    @activeFilterChange="${this.onActiveFilterChange}"
                                                    @activeFilterClear="${this.onActiveFilterClear}">
                            </opencga-active-filters>
                        </div>
                       
                        <div class="col-md-12">
                            <div style="padding: 5px 25px;float: right">
                                <data-form  .data=${this.settings} .config="${this.getSettingsConfig()}" 
                                            @fieldChange="${e => this.onSettingsFieldChange(e)}" @submit="${this.onSettingsOk}">
                                </data-form>
                                <data-form  .data=${this.save} .config="${this.getSaveConfig()}" 
                                            @fieldChange="${e => this.onSaveFieldChange(e)}" @submit="${this.onSave}">
                                </data-form>
                            </div>
                        </div>
                       
                        <div class="col-md-12" style="padding: 0px 15px"> 
                            <variant-interpreter-qc-cancer-plots    .opencgaSession="${this.opencgaSession}"
                                                                    .query="${this.executedQuery}"
                                                                    .sampleId="${this.sample?.id}"
                                                                    .active="${this.active}"
                                                                    @changeSignature="${this.onChangeSignature}"
                                                                    @changeAggregationStatsResults="${this.onChangeAggregationStatsResults}">
                            </variant-interpreter-qc-cancer-plots>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("variant-interpreter-qc-variant-cancer", VariantInterpreterQcVariantCancer);
