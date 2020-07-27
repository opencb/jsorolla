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
//import Circos from "./test/circos.js";
import "../opencga-variant-filter.js";
import "../../commons/opencga-active-filters.js";
import "../../commons/visualisation/circos-view.js";
import "../../commons/view/signature-view.js";
import "../../loading-spinner.js";

export default class VariantInterpreterQcCancerPlots extends LitElement {

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

        this.preparedQuery = {};
        //this.base64 = "data:image/png;base64, " + Circos.base64;
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("query") || changedProperties.has("sampleId")) {
            this.propertyObserver();
        }
    }

    async propertyObserver() {
        this.signature = null;
        await this.requestUpdate();

        this.signatureQuery();
        this.statsQuery();
    }

    signatureQuery() {

        this.opencgaSession.opencgaClient.variants().queryMutationalSignature({
            study: this.opencgaSession.study.fqn,
            fitting: false,
            sample: this.sampleId,
            ...this.query
        }).then( restResult => {
            this.signature = restResult.getResult(0).signature;
            this.dispatchEvent(new CustomEvent("changeSignature", {
                detail: {
                    signature: this.signature,
                },
                bubbles: true,
                composed: true
            }));
        }).catch( restResponse => {
            this.signature = {
                errorState: "Error from Server " + restResponse.getEvents("ERROR").map(error => error.message).join(" \n ")
            };
        }).finally( () => {
            this.requestUpdate();
        });
    }

    statsQuery() {
        let params = {
            study: this.opencgaSession.study.fqn,
            fields: "chromosome;genotype;type;biotype;consequenceType;clinicalSignificance;depth",
            sample: this.sampleId,
            ...this.query
        };
        this.opencgaSession.opencgaClient.variants().aggregationStats(params)
            .then(response => {
                this.aggregationStatsResults = response.responses[0].results;
                this.dispatchEvent(new CustomEvent("changeAggregationStatsResults", {
                    detail: {
                        aggregationStatsResults: this.aggregationStatsResults,
                    },
                    bubbles: true,
                    composed: true
                }));
            })
            .catch( restResponse => {
                this.stats = {
                    errorState: "Error from Server " + restResponse.getEvents("ERROR").map(error => error.message).join(" \n ")
                };
            })
            .finally( () => {
                this.requestUpdate();
            });
    }

    getDefaultConfig() {
        return {
        }
    }

    render() {
        return html`
            <div class="row">
                <div class="col-md-12">
                    <div class="row" style="padding: 10px">
                        <div class="col-md-12">
                            <div class="col-md-7">
                                <h2>Circos</h2>
                                <circos-view .opencgaSession="${this.opencgaSession}" .sampleId="${this.sampleId}" .query="${this.query}" .active="${this.active}"></circos-view>
                                        <!--<img width="640" src="https://www.researchgate.net/profile/Angela_Baker6/publication/259720064/figure/fig1/AS:613877578465328@1523371228720/Circos-plot-summarizing-somatic-events-A-summary-of-all-identified-somatic-genomic.png">-->
                            </div>
                            <div class="col-md-5">
                                <div style="margin-bottom: 20px">
                                    <h2>Genomic Context (Signature)</h2>
                                    <signature-view .signature="${this.signature}" .active="${this.active}"></signature-view>
                                            <!--<img width="480" src="https://cancer.sanger.ac.uk/signatures_v2/Signature-3.png">-->
                                </div>
                                <div style="padding-top: 20px">
                                    <h2>Sample Stats</h2>
                                    <!--<img width="480" src="https://www.ensembl.org/img/vep_stats_2.png">-->
                                    <div class="">
                                        <h3>Type</h3>
                                        <opencga-facet-result-view  .title="Type" .xAxisTitle="types" .showButtons=${false} 
                                                                    .facetResult="${this.aggregationStatsResults?.[1]}"
                                                                    .config="${this.facetConfig}"
                                                                    ?active="${true}">
                                        </opencga-facet-result-view>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-md-12">
                            <h2>Other Sample Stats</h2>
                            <div class="">
                                <h3>Biotype</h3>
                                <opencga-facet-result-view title="Biotype" xAxisTitle="biotypes" type="pie" .facetResult="${this.aggregationStatsResults?.[2]}"
                                                            .config="${{title: "Biotype", xAxisTitle: "biotypes"}}"
                                                            ?active="${true}">
                                </opencga-facet-result-view>
                            </div>
                            <div class="">
                                <h3>Consequence Type</h3>
                                <opencga-facet-result-view .facetResult="${this.aggregationStatsResults?.[3]}"
                                        .config="${this.facetConfig}"
                                        ?active="${this.facetActive}">
                                </opencga-facet-result-view>
                            </div>
                            <div class="">
                                <h3>Clinical Signficance</h3>
                                <opencga-facet-result-view .facetResult="${this.aggregationStatsResults?.[4]}"
                                        .config="${this.facetConfig}"
                                        ?active="${this.facetActive}">
                                </opencga-facet-result-view>
                            </div>
                            <div class="">
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
        `;
    }
}

customElements.define("variant-interpreter-qc-cancer-plots", VariantInterpreterQcCancerPlots);
