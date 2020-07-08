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
import "../opencga-variant-filter.js";
import "../../commons/opencga-active-filters.js";
import "../../loading-spinner.js";

export default class VariantInterpreterQcVariantFamily extends LitElement {

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
            query: {
                type: Object
            },
            sampleId: {
                type: String
            },
            config: {
                type: Object
            },
            active: {
                type: Boolean
            }
        }
    }

    _init(){
        this._prefix = "sf-" + UtilsNew.randomString(6);

        this.save = {};
        this.preparedQuery = {};
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    firstUpdated(_changedProperties) {

    }

    updated(changedProperties) {
        if (changedProperties.has("sampleId")) {
            this.sampleIdObserver();
        }
        if (changedProperties.has("query")) {
            this.queryObserver();
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
            const query = {
                study: this.opencgaSession.study.fqn,
                includeIndividual: true
            };
            this.opencgaSession.opencgaClient.samples().info(this.sampleId, query)
                .then(response => {
                    this.sample = response.responses[0].results[0];
                    this.requestUpdate();
                })
                .catch(reason => {
                    console.error(reason);
                });
        }
    }

    onVariantFilterChange(e) {
        this.preparedQuery = e.detail.query;
        this.requestUpdate();
    }

    onVariantFilterSearch(e) {
        console.log("onVariantFilterSearch", e)
        //this.preparedQuery = this._prepareQuery(e.detail.query); //TODO check if we need to process e.detail.query
        this.query = {...e.detail.query};

        let params = {
            study: this.opencgaSession.study.fqn,
            fields: "chromosome;genotype;type;biotype;consequenceType;clinicalSignificance;depth",
            sample: this.sample.id,
            ...this.query
        };
        this.opencgaSession.opencgaClient.variants().aggregationStats(params)
            .then(response => {
                this.aggregationStatsResults = response.responses[0].results;

                // Parse aggregationStatsResults and create a sampleVariantStats
                this.sampleVariantStats = {
                    id: this.sample.id
                };
                for (let aggregatedResult of this.aggregationStatsResults) {
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
                this.requestUpdate();
            });

        this.requestUpdate();
    }

    onActiveFilterChange(e) {
        this.query = {study: this.opencgaSession.study.fqn, ...e.detail};
        this.requestUpdate();
    }

    onActiveFilterClear() {
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
        let variantStats = {
            id: this.save.id,
            query: this.executedQuery,
            description: this.save.description,
            stats: this.sampleVariantStats
        };
        this.sample.qualityControl.metrics[0].variantStats.push(variantStats);
        this.opencgaSession.opencgaClient.samples().update(this.sample.id, {qualityControl: this.sample.qualityControl}, {study: this.opencgaSession.study.fqn})
            .then( restResult => {
                debugger
            })
            .catch( restResponse => {
                console.log(restResponse);
            })
            .finally( () => {
                this.requestUpdate();
            })
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
                    buttonClass: "btn btn-default "
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
            filter: {
                title: "Filter",
                searchButtonText: "Search",
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
                    {
                        title: "Study and Cohorts",
                        collapsed: false,
                        fields: [
                            {
                                id: "cohort",
                                title: "Cohort Alternate Stats",
                                onlyCohortAll: true,
                                tooltip: tooltips.cohort
                                //cohorts: this.cohorts
                            }
                        ]
                    },
                    {
                        title: "Genomic",
                        collapsed: true,
                        fields: [
                            {
                                id: "biotype",
                                title: "Gene Biotype",
                                biotypes: biotypes,
                                tooltip: tooltips.biotype
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
                                id: "type",
                                title: "Variant Type",
                                types: ["SNV", "INDEL", "CNV", "INSERTION", "DELETION"],
                                tooltip: tooltips.type
                            }
                        ]
                    },
                    {
                        title: "Consequence Type",
                        collapsed: true,
                        fields: [
                            {
                                id: "consequenceTypeSelect",
                                title: "Select SO terms",
                                tooltip: tooltips.consequenceTypeSelect
                            }
                        ]
                    }
                ],
                examples: [
                    {
                        name: "Example BRCA2",
                        active: false,
                        query: {
                            gene: "BRCA2",
                            ct: "missense_variant"
                        }
                    },
                    {
                        name: "Full Example",
                        query: {
                            "region": "1,2,3,4,5",
                            "xref": "BRCA1,TP53",
                            "biotype": "protein_coding",
                            "type": "SNV,INDEL",
                            "ct": "lof",
                            "populationFrequencyAlt": "1kG_phase3:ALL<0.1,GNOMAD_GENOMES:ALL<0.1",
                            "protein_substitution": "sift>5,polyphen>4",
                            "conservation": "phylop>1;phastCons>2;gerp<=3"
                        }
                    }
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
                    <div>
                        <opencga-active-filters filterBioformat="VARIANT"
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
                        
                        <div class="col-md-12">
                            <div style="padding: 5px 25px;float: right">
                                <data-form  .data=${this.save} .config="${this.getSaveConfig()}" 
                                            @fieldChange="${e => this.onSaveFieldChange(e)}" @submit="${this.onSave}">
                                </data-form>
                            </div>
                        </div>
                        
                        <div class="main-view">
                            <div class="row">
                                <div class="col-md-6">
                                    <h3>Genotype</h3>
                                    <opencga-facet-result-view .facetResult="${this.aggregationStatsResults?.[0]}"
                                            .config="${this.facetConfig}"
                                            ?active="${this.facetActive}">
                                    </opencga-facet-result-view>
                                </div>
                                <div class="col-md-6">
                                    <h3>Type</h3>
                                    <opencga-facet-result-view .facetResult="${this.aggregationStatsResults?.[1]}"
                                            .config="${this.facetConfig}"
                                            ?active="${this.facetActive}">
                                    </opencga-facet-result-view>
                                </div>
                                <div class="col-md-12">
                                    <h3>Biotype</h3>
                                    <opencga-facet-result-view .facetResult="${this.aggregationStatsResults?.[2]}"
                                            .config="${this.facetConfig}"
                                            ?active="${this.facetActive}">
                                    </opencga-facet-result-view>
                                </div>
                                <div class="col-md-12">
                                    <h3>Consequence Type</h3>
                                    <opencga-facet-result-view .facetResult="${this.aggregationStatsResults?.[3]}"
                                            .config="${this.facetConfig}"
                                            ?active="${this.facetActive}">
                                    </opencga-facet-result-view>
                                </div>
                                <div class="col-md-12">
                                    <h3>Clinical Significance</h3>
                                    <opencga-facet-result-view .facetResult="${this.aggregationStatsResults?.[4]}"
                                            .config="${this.facetConfig}"
                                            ?active="${this.facetActive}">
                                    </opencga-facet-result-view>
                                </div>
                                <div class="col-md-12">
                                    <h3>Depth</h3>
                                    <opencga-facet-result-view .facetResult="${this.aggregationStatsResults?.[5]}"
                                            .config="${this.facetConfig}"
                                            ?active="${this.facetActive}">
                                    </opencga-facet-result-view>
                                </div>
                            </div>                            
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("variant-interpreter-qc-variant-family", VariantInterpreterQcVariantFamily);
