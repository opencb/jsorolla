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
import Circos from "./test/circos.js";
import "../opencga-variant-filter.js";
import "../../commons/opencga-active-filters.js";
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
            // this.renderCircos();
            this.propertyObserver();
        }
    }

    async propertyObserver() {
        this.signature = null;
        await this.requestUpdate();
        this.opencgaSession.opencgaClient.variants().queryMutationalSignature({
            study: this.opencgaSession.study.fqn,
            fitting: false,
            sample: this.sampleId,
            ...this.query
        }).then( restResult => {
            this.signature = restResult.getResult(0).signature;
        }).catch( restResponse => {
            this.signature = {
                errorState: "Error from Server " + restResponse.getEvents("ERROR").map(error => error.message).join(" \n ")
            };
        }).finally( () => {
            this.requestUpdate();
        })
    }

    renderCircos() {
        this.opencgaSession.opencgaClient.variants().circos({
            study: this.opencgaSession.study.fqn,
            sample: this.sampleId,
            density: "LOW",
            ...this.query
        }).then( restResult => {
            debugger
            this.signature = restResult.getResult(0).signature;
        }).catch( restResponse => {
            this.signature = {
                errorState: "Error from Server " + restResponse.getEvents("ERROR").map(error => error.message).join(" \n ")
            };
        }).finally( () => {
            this.requestUpdate();
        })
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
                                <img class="img-responsive" src="${this.base64}">
                                        <!--<img width="640" src="https://www.researchgate.net/profile/Angela_Baker6/publication/259720064/figure/fig1/AS:613877578465328@1523371228720/Circos-plot-summarizing-somatic-events-A-summary-of-all-identified-somatic-genomic.png">-->
                            </div>
                            <div class="col-md-5">
                                <div style="margin-bottom: 20px">
                                    <h2>Signature</h2>
                                    <signature-view .signature="${this.signature}" .active="${this.active}"></signature-view>
                                            <!--<img width="480" src="https://cancer.sanger.ac.uk/signatures_v2/Signature-3.png">-->
                                </div>
                                <div style="padding-top: 20px">
                                    <h2>Sample Stats</h2>
                                    <img width="480" src="https://www.ensembl.org/img/vep_stats_2.png">
                                </div>
                            </div>
                        </div>
                    </div>                            
                </div>
            </div>
        `;
    }
}

customElements.define("variant-interpreter-qc-cancer-plots", VariantInterpreterQcCancerPlots);
