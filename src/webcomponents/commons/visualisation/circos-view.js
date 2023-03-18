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

import {LitElement, html} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import "../../loading-spinner.js";

export default class CircosView extends LitElement {

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
            queries: {
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
        this._prefix = UtilsNew.randomString(8);
        this._config = this.getDefaultConfig();
    }

    updated(changedProperties) {
        // if ((changedProperties.has("query") || changedProperties.has("active")) && this.active) {
        //     this.queryObserver();
        // }

        if (changedProperties.has("query")) {
            this.queryObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    queryObserver() {
        // Show loading gif and message
        document.getElementById(this._prefix + "CircosMessage").style["display"] = "inline";
        this.circosImage = null;
        this.requestUpdate();

        let query = {
            title: "no.delete.Circos",
            density: "MEDIUM",
            query: {
                sample: this.sampleId,
                // ...this.query,
                // filter: "PASS"
            },
            tracks: [
                {
                    id: "snv",
                    type: "SNV",
                    query: {
                        study: this.opencgaSession.study.fqn,
                        sample: this.sampleId,
                        type: "SNV",
                        // filter: "PASS",
                        ...this.queries?.["SNV"]
                    }
                },
                {
                    id: "indel",
                    type: "INDEL",
                    query: {
                        study: this.opencgaSession.study.fqn,
                        sample: this.sampleId,
                        type: "INDEL,INSERTION,DELETION",
                        // filter: "PASS",
                        ...this.queries?.["INDEL"]
                        // fileData: "AR2.10039966-01T_vs_AR2.10039966-01G.annot.pindel.vcf.gz:FILTER=PASS"
                    }
                },
                {
                    id: "cnv1",
                    type: "COPY-NUMBER",
                    query: {
                        study: this.opencgaSession.study.fqn,
                        sample: this.sampleId,
                        type: "INSERTION",
                    }
                },
                {
                    id: "rearr1",
                    type: "REARRANGEMENT",
                    query: {
                        study: this.opencgaSession.study.fqn,
                        sample: this.sampleId,
                        // type: "DELETION",
                        // file: "AR2.10039966-01T_vs_AR2.10039966-01G.annot.brass.vcf.gz"
                        // fileData: "AR2.10039966-01T_vs_AR2.10039966-01G.annot.brass.vcf.gz:BAS>=0"
                        ...this.queries?.["BREAKEND"],
                    }
                }
            ]
        };

        this.opencgaSession.opencgaClient.variants().runCircos(query, {study: this.opencgaSession.study.fqn})
            .then(restResult => {
                document.getElementById(this._prefix + "CircosMessage").style["display"] = "none";
                this.circosImage = "data:image/png;base64, " + restResult.getResult(0);
                this.dispatchEvent(new CustomEvent("changeCircosPlot", {
                    detail: {
                        circosPlot: this.circosImage
                    },
                    bubbles: true,
                    composed: true
                }));
            })
            .catch(restResponse => {
                console.error(restResponse);
            })
            .finally(() => {
                this.requestUpdate();
            });
    }

    getDefaultConfig() {
        return {
        }
    }

    render() {
        return html`
            <div>
                <span id="${this._prefix}CircosMessage" style="display: inline"></span>
                ${this.circosImage
                    ? html`
                        <img class="img-responsive" src="${this.circosImage}">`
                    : html`<loading-spinner description="Fetching image data, this can take few seconds..."></loading-spinner>`
                }
            </div>`
    }

}

customElements.define("circos-view", CircosView);
