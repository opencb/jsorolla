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
import "../../../loading-spinner.js";
import Circos from "./circos.js";

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
            query: {
                type: Object
            },
            config: {
                type: Object
            },
            sampleId: {
                type: String
            }
        }
    }

    _init(){
        this._prefix = "sf-" + UtilsNew.randomString(6) + "_";
        this.preparedQuery = {};

        this.base64 = "data:image/png;base64, " + Circos.base64;

    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    firstUpdated(_changedProperties) {

    }

    updated(changedProperties) {
        if (changedProperties.has("query") || changedProperties.has("sampleId")) {
            this.propertyObserver();
        }
    }

    queryObserver() {
        if (this.query) {
            this.preparedQuery = {study: this.opencgaSession.study.fqn, ...this.query};
            this.executedQuery = {study: this.opencgaSession.study.fqn, ...this.query};
        }
        this.requestUpdate();
    }

    propertyObserver() {
        console.log("this.query",this.query)
        this.opencgaSession.opencgaClient.variants().queryMutationalSignature({
            study: this.opencgaSession.study.fqn,
            fitting: true,
            sample: "ISDBM322015",
            ...this.query
        }).then( restResult => {
            this.signaturePlot(restResult.getResult(0).signature);
        }).catch( restResult => {
            console.error("error", restResult)
        })
    }

    signaturePlot(result) {
        const palette = {
            "C>A": "#31bef0",
            "C>G": "#000000",
            "C>T": "#e62725",
            "T>A": "#cbcacb",
            "T>C": "#a1cf63",
            "T>G": "#edc8c5"
        };
        const counts = result.counts;
        //console.log("counts",counts)

        const categories = counts.map(point => point?.context)
        const data = counts.map(point => point?.total)

        const substitutionClass = string => {
            const [,pair,letter] = string.match(/[ACTG]\[(([ACTG])>[ACTG])\][ACTG]+/);
            return {pair, letter};
        }

        const dataset = {
            "C>A": [],
            "C>G": [],
            "C>T": [],
            "T>A": [],
            "T>C": [],
            "T>G": []
        };
        for(let p of counts) {
            if (p) {
                const {pair} = substitutionClass(p.context);
                dataset[pair].push(p.total);
            }
        }
        const addRects = function(chart) {
            $(".rect", this).remove();
            $(".rect-label", this).remove();
            let lastStart = 0;
            for (const k in dataset) {
                console.log("chart.categories",chart.xAxis)
                console.log("k", dataset[k].length)
                const xAxis = chart.xAxis[0];
                chart.renderer.rect(xAxis.toPixels(lastStart), 30, xAxis.toPixels(dataset[k].length) - xAxis.toPixels(1), 10, 0)
                    .attr({
                        fill: palette[k],
                        zIndex: 2
                    }).addClass("rect")
                    .add();

                // for some reason toPixels(lastStart + dataset[k].length / 2) it isn't centered
                chart.renderer.label(k, xAxis.toPixels(lastStart - 4 + dataset[k].length / 2), 0, "")
                    .css({
                        color: "#000",
                        fontSize: "13px"
                    })
                    .attr({
                        padding: 8,
                        r: 5,
                        zIndex: 3
                    }).addClass("rect-label")
                    .add();

                lastStart += dataset[k].length;
            }

        };
        $("#signature-plot").highcharts({
            title: "title",
            chart: {
                type: "column",
                events: {
                    redraw: function() {
                        addRects(this);
                    },
                    load: function() {
                        addRects(this);
                    }
                },
                marginTop: 70
            },
            credits: {
                enabled: false
            },
            legend: {
                enabled: false
            },
            tooltip: {
                formatter: function() {
                    const {pair, letter} = substitutionClass(this.x)
                    return this.x.replace(pair, `<span style="color:${palette[pair]}">${letter}</span>`).replace("\[", "").replace("\]", "") + `<strong>:${this.y}</strong>`;
                }
            },
            xAxis: {
                categories: categories,
                labels: {
                    rotation: -90,
                    formatter: function () {
                        const {pair, letter} = substitutionClass(this.value)
                        return this.value.replace(pair, `<span style="color:${palette[pair]}">${letter}</span>`).replace("\[", "").replace("\]", "");
                    }
                }
            },
            colors: Object.keys(dataset).flatMap(key => Array(dataset[key].length).fill(palette[key])),
            series: [{
                colorByPoint: "true",
                data: data
            }]
        });
    }

    onVariantFilterChange(e) {
        this.preparedQuery = e.detail.query;
        this.requestUpdate();
    }

    onVariantFilterSearch(e) {
        console.log("onVariantFilterSearch", e)
        //this.preparedQuery = this._prepareQuery(e.detail.query); //TODO check if we need to process e.detail.query
        this.query = {...e.detail.query};
        this.requestUpdate();
    }

    onActiveFilterChange(e) {

        this.query = {study: this.opencgaSession.study.fqn, ...e.detail};
        this.requestUpdate();
    }

    onActiveFilterClear() {
        console.log("onActiveFilterClear");
        this.query = {study: this.opencgaSession.study.fqn};
        this.requestUpdate();
    }

    getDefaultConfig() {
        return {
            title: "",
            icon: "fas fa-search",
            filter: {
                title: "Filter",
                searchButtonText: "Run",
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
                    title: "Selected Variant",
                    views: [
                        {
                            id: "annotationSummary",
                            title: "Summary",
                            active: true
                        },
                        {
                            id: "annotationConsType",
                            title: "Consequence Type"
                        },
                        {
                            id: "annotationPropFreq",
                            title: "Population Frequencies"
                        },
                        {
                            id: "annotationClinical",
                            title: "Clinical"
                        },
                        {
                            id: "cohortStats",
                            title: "Cohort Stats"
                            //cohorts: this.cohorts
                        },
                        {
                            id: "samples",
                            title: "Samples"
                        },
                        {
                            id: "beacon",
                            // component: "variant-beacon-network",
                            title: "Beacon"
                            // Uncomment and edit Beacon hosts to change default hosts
                            // hosts: [
                            //     "brca-exchange", "cell_lines", "cosmic", "wtsi", "wgs", "ncbi", "ebi", "ega", "broad", "gigascience", "ucsc",
                            //     "lovd", "hgmd", "icgc", "sahgp"
                            // ]
                        },
                        {
                            id: "network",
                            // component: "reactome-variant-network",
                            title: "Reactome Pathways"
                        }
                        // {
                        //     id: "template",
                        //     component: "opencga-variant-detail-template",
                        //     title: "Template"
                        // }
                    ]
                }
            }
        }
    }

    render() {
        return html`
            <div class="row">
                <div class="col-md-2 left-menu">
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

                <div class="col-md-10">
                
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
                        
                        <div class="main-view">
                            executedQuery : ${JSON.stringify(this.executedQuery)}
                            <div class="row" style="padding: 10px">
                                <div class="col-md-12">
                                    <div class="col-md-6">
                                        <h2>Circos</h2>
                                        <img class="img-responsive" src="${this.base64}">
                                        <!--<img width="640" src="https://www.researchgate.net/profile/Angela_Baker6/publication/259720064/figure/fig1/AS:613877578465328@1523371228720/Circos-plot-summarizing-somatic-events-A-summary-of-all-identified-somatic-genomic.png">-->
                                    </div>
                                    <div class="col-md-6">
                                        <h2>Signature</h2>
                                        <div id="signature-plot" style="height: 300px">
                                            <loading-spinner></loading-spinner>
                                        </div>
                                        <!--<img width="480" src="https://cancer.sanger.ac.uk/signatures_v2/Signature-3.png">-->
                                        <div style="padding-top: 20px">
                                            <h2>Sample Stats</h2>
                                            <img width="480" src="https://www.ensembl.org/img/vep_stats_2.png">
                                        </div>
                                    </div>
                                </div>
                            </div>                            
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("variant-interpreter-qc-variant-cancer", VariantInterpreterQcVariantCancer);
