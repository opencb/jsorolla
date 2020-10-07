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
import UtilsNew from "../../utilsNew.js";
import "../variant/opencga-variant-filter.js";
import "../commons/opencga-active-filters.js";
import "../loading-spinner.js";

export default class SampleVariantStatsBrowser extends LitElement {

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
            sampleId: {
                type: String
            },
            sample: {
                type: Object
            },
            query: {
                type: Object
            },
            config: {
                type: Object
            },
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        this.save = {};
        this.preparedQuery = {};
        this.loading = false;
        this.sampleVariantStats = null;
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("sampleId")) {
            this.sampleIdObserver();
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

    sampleIdObserver() {
        if (this.opencgaSession && this.sampleId) {
            this.opencgaSession.opencgaClient.samples().info(this.sampleId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.sample = response.getResult(0);
                    this.getVariantStatFromSample();
                })
                .catch(response => {
                    console.error("An error occurred fetching sample: ", response);
                });
        }
    }

    onVariantFilterChange(e) {
        this.preparedQuery = e.detail.query;
        this.requestUpdate();
    }

    async onVariantFilterSearch(e) {
        // TODO fix activeFilterClear and activeFilterChange!
        this.loading = true;
        await this.requestUpdate();
        //this.preparedQuery = this._prepareQuery(e.detail.query); //TODO check if we need to process e.detail.query
        this.query = {...e.detail.query};

        let params = {
            study: this.opencgaSession.study.fqn,
            fields: "chromosome;genotype;type;biotype;consequenceType;clinicalSignificance;depth;filter",
            sample: this.sample.id,
            ...this.query
        };
        this.opencgaSession.opencgaClient.variants().aggregationStats(params)
            .then(response => {
                this.aggregationStatsResults = response.responses[0].results;

                // Remove contigs and sort chromosomes
                let chromosomes = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "X", "Y", "MT"];
                let sortedBuckets = [];
                for (let chromosome of chromosomes) {
                    for (let bucket of this.aggregationStatsResults[0].buckets) {
                        if (bucket.value === chromosome) {
                            sortedBuckets.push(bucket);
                            break;
                        }
                    }
                }
                this.aggregationStatsResults[0].buckets = sortedBuckets;

                // FIXME OpenCGA will return directly the sampleVariantStats soon
                // Parse aggregationStatsResults and create a sampleVariantStats
                let _sampleVariantStats = {
                    id: this.sample.id
                };
                for (let aggregatedResult of this.aggregationStatsResults) {
                    let values = {};
                    for (let bucket of aggregatedResult.buckets) {
                        values[bucket.value] = bucket.count;
                    }
                    switch (aggregatedResult.name) {
                        case "chromosome":
                            _sampleVariantStats.variantCount = aggregatedResult.count;
                            _sampleVariantStats.chromosomeCount = values;
                            break;
                        case "genotype":
                            _sampleVariantStats.genotypeCount = values;
                            let het = _sampleVariantStats.genotypeCount["0/1"];
                            het += _sampleVariantStats.genotypeCount["0/2"] || 0;
                            het += _sampleVariantStats.genotypeCount["1/2"] || 0;
                            _sampleVariantStats.heterozygosityRate = het / aggregatedResult.count;
                            break;
                        case "filter":
                            _sampleVariantStats.filterCount = values;
                            break;
                        case "type":
                            _sampleVariantStats.typeCount = values;
                            break;
                        case "biotype":
                            _sampleVariantStats.biotypeCount = values;
                            break;
                        case "consequenceType":
                            _sampleVariantStats.consequenceTypeCount = values;
                            break;
                        case "clinicalSignificance":
                            _sampleVariantStats.clinicalSignificanceCount = values;
                            break;
                    }
                }
                this.sampleVariantStats = {
                    stats: _sampleVariantStats
                };
                this.requestUpdate();
            })
            .catch(restResponse => {
                console.log(restResponse);
            })
            .finally(() => {
                this.loading = false;
                this.requestUpdate();
            });
    }

    onActiveFilterChange(e) {
        this.query = {study: this.opencgaSession.study.fqn, ...e.detail};
        this.requestUpdate();
    }

    onActiveFilterClear(e) {
        this.query = {study: this.opencgaSession.study.fqn};
        this.requestUpdate();
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

    onSave(e) {
        // Search bamFile for the sample
        let variantStats = {
            id: this.save.id,
            query: this.executedQuery || {},
            description: this.save.description || "",
            stats: this.sampleVariantStats.stats
        };

        // Check if a metric object for that bamFileId exists
        let bamFileId = this.sample.fileIds.find(fileId => fileId.endsWith(".bam"));
        let metric = this.sample?.qualityControl?.metrics
            .find(metric => {
                if (bamFileId) {
                    return metric.bamFileId === bamFileId;
                } else {
                    return metric.bamFileId === "";
                }
            });
        // Save the variant stats
        if (metric) {
            // Push the stats and signature in the existing metric object
            metric.variantStats.push(variantStats);
        } else {
            // create a new metric
            metric = {
                bamFileId: bamFileId ? bamFileId : "",
                variantStats: [variantStats],
            };
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
            .then(restResponse => {
                console.log(restResponse);
            })
            .catch(restResponse => {
                console.error(restResponse);
            })
            .finally(() => {
                this.requestUpdate();
            });
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
                    buttonClass: "btn btn-default ripple"
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
        };
    }

    getDefaultConfig() {
        return {
            title: "Sample Variant Stats",
            icon: "fas fa-search",
            showTitle: true,
            titleClass: "",
            titleIcon: "fas fa-user",
            filter: {
                title: "Filter",
                searchButton: true,
                searchButtonText: "Run",
                activeFilters: {
                    alias: {
                        ct: "Consequence Types"
                    },
                    complexFields: ["genotype"],
                    hiddenFields: []
                },
                sections: [     // sections and subsections, structure and order is respected
                    {
                        title: "Filters",
                        collapsed: false,
                        fields: [
                            {
                                id: "file-quality",
                                title: "File Quality Filters",
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
                                id: "biotype",
                                title: "Gene Biotype",
                                biotypes: biotypes,
                                tooltip: tooltips.biotype
                            },
                            {
                                id: "diseasePanels",
                                title: "Disease Panels",
                                tooltip: tooltips.diseasePanels
                            },
                            {
                                id: "type",
                                title: "Variant Type",
                                types: ["SNV", "INDEL", "CNV", "INSERTION", "DELETION"],
                                tooltip: tooltips.type
                            },
                            {
                                id: "consequenceTypeSelect",
                                title: "Consequence Type",
                                tooltip: tooltips.consequenceTypeSelect
                            }
                        ]
                    }
                ],
                examples: [
                    {
                        id: "Example missense",
                        active: false,
                        query: {
                            ct: "missense_variant"
                        }
                    },
                    {
                        id: "INDEL LoF",
                        query: {
                            type: "INDEL",
                            ct: "lof",
                        }
                    }
                ],
                result: {
                    grid: {}
                },
                detail: {}
            }
        };
    }

    render() {
        if (!this.opencgaSession) {
            return;
        }

        return html`
            ${this.sample && this._config.showTitle
                ? html`<tool-header title="${this._config.title} - ${this.sample.id}" icon="${this._config.titleIcon}" class="${this._config.titleClass}"></tool-header>`
                : null
            }
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
                    <div>
                        <div class="btn-toolbar" role="toolbar" aria-label="toolbar" style="margin-bottom: 20px">
                            <div class="pull-right" role="group">
                                <data-form  .data=${this.save} 
                                            .config="${this.getSaveConfig()}" 
                                            @fieldChange="${e => this.onSaveFieldChange(e)}" 
                                            @submit="${this.onSave}">
                                </data-form>
                            </div>
                        </div>
                    </div>
                    <div>
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
                      
                        <div class="main-view">
                            ${this.loading
                                ? html`
                                    <div id="loading">
                                        <loading-spinner></loading-spinner>
                                    </div>`
                                : this.sampleVariantStats
                                    ? html`
                                        <div style="padding: 0px 15px">
                                            <sample-variant-stats-view .sampleVariantStats="${this.sampleVariantStats}"></sample-variant-stats-view>
                                        </div>`
                                    : html`
                                        <div class="alert alert-info" role="alert" style="margin: 0px 15px">
                                            <i class="fas fa-3x fa-info-circle align-middle"></i> Please select some filters on the left.
                                        </div>`
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("sample-variant-stats-browser", SampleVariantStatsBrowser);
