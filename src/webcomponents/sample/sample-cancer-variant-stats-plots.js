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

import {LitElement, html} from "lit";
import UtilsNew from "../../core/utilsNew.js";
import LitUtils from "../commons/utils/lit-utils.js";
// import Circos from "./test/circos.js";
// import "../variant/variant-browser-filter.js";
import "../commons/opencga-active-filters.js";
import "../commons/visualisation/circos-view.js";
import "../commons/view/signature-view.js";
import "../loading-spinner.js";
import NotificationUtils from "../commons/utils/notification-utils.js";

export default class SampleCancerVariantStatsPlots extends LitElement {

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
            active: {
                type: Boolean
            },
            query: {
                type: Object
            },
            queries: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        this.preparedQuery = {};
        // this.base64 = "data:image/png;base64, " + Circos.base64;
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
        this.requestUpdate();
        await this.updateComplete;

        this.signatureQuery();
        this.statsQuery();
        this.deletionsStats();
    }

    signatureQuery() {
        // console.log(this.queries);
        // debugger
        this.opencgaSession.opencgaClient.variants().queryMutationalSignature({
            study: this.opencgaSession.study.fqn,
            fitting: false,
            sample: this.sampleId,
            ...this.query,
            ...this.queries?.["SNV"]
        }).then(restResult => {
            this.signature = restResult.responses[0].results[0];
            this.dispatchEvent(new CustomEvent("changeSignature", {
                detail: {
                    signature: this.signature
                },
                bubbles: true,
                composed: true
            }));
        }).catch(response => {
            this.signature = {
                errorState: "Error from Server " + response.getEvents("ERROR").map(error => error.message).join(" \n ")
            };
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
        }).finally(() => {
            this.requestUpdate();
        });
    }

    deletionsStats() {
        const params = {
            study: this.opencgaSession.study.fqn,
            field: "EXT_INS_DEL_TYPE",
            sample: this.sampleId,
            // fileData: "AR2.10039966-01T_vs_AR2.10039966-01G.annot.pindel.vcf.gz:FILTER=PASS;QUAL>=250;REP<=9"
            ...this.query,
            ...this.queries?.["INDEL"]
        };
        this.opencgaSession.opencgaClient.variants().aggregationStatsSample(params)
            .then(response => {
                this.deletionAggregationStatsResults = response.responses[0].results;

                // Remove "other"
                // const otherIndex = this.deletionAggregationStatsResults[0].buckets.findIndex(item => item.value === "other");
                // this.deletionAggregationStatsResults[0].count -= this.deletionAggregationStatsResults[0].buckets[otherIndex].count;
                // this.deletionAggregationStatsResults[0].buckets.splice(otherIndex, 1);

                this.deletionTypeStats = {};
                for (const bucket of this.deletionAggregationStatsResults[0].buckets) {
                    this.deletionTypeStats[bucket.value] = bucket.count;
                }

                this.dispatchEvent(new CustomEvent("changeDeletionAggregationStatsResults", {
                    detail: {
                        deletionAggregationStatsResults: this.deletionAggregationStatsResults
                    },
                    bubbles: true,
                    composed: true
                }));
            })
            .catch(response => {
                this.stats = {
                    errorState: "Error from Server " + response.getEvents("ERROR").map(error => error.message).join(" \n ")
                };
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            })
            .finally(() => {
                this.requestUpdate();
            });
    }

    statsQuery() {
        const params = {
            study: this.opencgaSession.study.fqn,
            field: "EXT_REARR",
            sample: this.sampleId,
            fileData: "AR2.10039966-01T_vs_AR2.10039966-01G.annot.brass.vcf.gz:BAS>=0",
            ...this.query
        };
        this.opencgaSession.opencgaClient.variants().aggregationStatsSample(params)
            .then(response => {
                this.aggregationStatsResults = response.responses[0].results;

                // Remove "other"
                // const otherIndex = this.aggregationStatsResults[0].buckets.findIndex(item => item.value === "other");
                // this.aggregationStatsResults[0].count -= this.aggregationStatsResults[0].buckets[otherIndex].count;
                // this.aggregationStatsResults[0].buckets.splice(otherIndex, 1);

                this.aggregationStatsResults[0].count /= 2;
                this.typeStats = {};
                for (const bucket of this.aggregationStatsResults[0].buckets) {
                    this.typeStats[bucket.value] = bucket.count / 2;
                }

                this.dispatchEvent(new CustomEvent("changeAggregationStatsResults", {
                    detail: {
                        aggregationStatsResults: this.aggregationStatsResults
                    },
                    bubbles: true,
                    composed: true
                }));
            })
            .catch(restResponse => {
                this.stats = {
                    errorState: "Error from Server " + restResponse.getEvents("ERROR").map(error => error.message).join(" \n ")
                };
            })
            .finally(() => {
                this.requestUpdate();
            });
    }

    getDefaultConfig() {
        return {
        };
    }

    render() {
        return html`
            <div class="row">
                <div class="col-md-12">
                    <div class="row" style="padding: 10px">
                        <div class="col-md-12">
                            <div class="col-md-7">
                                <h2>Circos</h2>
                                <circos-view
                                    .opencgaSession="${this.opencgaSession}"
                                    .sampleId="${this.sampleId}"
                                    .query="${this.query}"
                                    .queries="${this.queries}"
                                    .active="${this.active}"
                                    @changeCircosPlot="${this.onChangeCircosPlot}">
                                </circos-view>
            <!--<img width="640" src="https://www.researchgate.net/profile/Angela_Baker6/publication/259720064/figure/fig1/AS:613877578465328@1523371228720/Circos-plot-summarizing-somatic-events-A-summary-of-all-identified-somatic-genomic.png">-->
                            </div>
                            <div class="col-md-5">
                                <div style="margin-bottom: 20px">
                                    <h2>Mutational Catalogue</h2>
                                    <signature-view .signature="${this.signature}" .active="${this.active}"></signature-view>
                                            <!--<img width="480" src="https://cancer.sanger.ac.uk/signatures_v2/Signature-3.png">-->
                                </div>
                                <div style="padding-top: 20px">
                                    <h2>Deletions</h2>
                                    <div class="">
                                        <h3>${this.deletionAggregationStatsResults?.[0].count} deletions and insertions</h3>
                                        <simple-chart
                                            .title="Type"
                                            .xAxisTitle="types"
                                            .type="${"bar"}"
                                            .data="${this.deletionTypeStats}"
                                            .config="${this.facetConfig}"
                                            ?active="${true}">
                                        </simple-chart>
                                    </div>
                                </div>
                                <div style="padding-top: 20px">
                                    <h2>Rearrangements Stats</h2>
                                    <!--<img width="480" src="https://www.ensembl.org/img/vep_stats_2.png">-->
                                    <div class="">
                                        <h3>${this.aggregationStatsResults?.[0].count} rearrangements</h3>
                                        <simple-chart
                                            .title="Type"
                                            .xAxisTitle="types"
                                            .type="${"bar"}"
                                            .data="${this.typeStats}"
                                            .config="${this.facetConfig}"
                                            ?active="${true}">
                                        </simple-chart>
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

customElements.define("sample-cancer-variant-stats-plots", SampleCancerVariantStatsPlots);
