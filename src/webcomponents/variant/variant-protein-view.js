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
import UtilsNew from "../../core/utils-new.js";
import PolymerUtils from "../PolymerUtils.js";


//TODO Lollipop dependency

export default class VariantProteinView extends LitElement {

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
            config: {
                type: Object
            },
            opencgaClient: {
                type: Object
            },
            cellbaseClient: {
                type: Object
            },
            query: {
                type: Object
            },
            gene: {
                type: String
            },
            // xref ids accept protein ids, transcript ids. Eg: CCDS31418.1,Q9UL59,ENST00000278314
            ids: {
                type: String
            }
        };
    }

    _init() {
        this._prefix = "proteinView" + UtilsNew.randomString(6) + "_";

        this.proteins = [];
    }

    updated(changedProperties) {
        if (changedProperties.has("gene") || changedProperties.has("ids")) {
            this._fetchProteins();
        }
    }

    checkProteinsAvailable(proteins) {
        return proteins.length > 0;
    }

    _fetchProteins() {
        this.proteins = []; // Reset the previously shown proteins svg
        if (typeof this.cellbaseClient !== "undefined" && typeof this.opencgaClient !== "undefined") {
            const _this = this;
            const queryParams = {};
            if (typeof this.gene !== "undefined" && this.gene !== "") {
                queryParams.gene = this.gene;
                if (typeof this.ids !== "undefined" && this.ids !== "") {
                    queryParams.xrefs = this.ids;
                }
            } else if (typeof this.ids !== "undefined" && this.ids !== "") {
                queryParams.xrefs = this.ids;
            }

            this.cellbaseClient.getProteinClient(null, "search", queryParams)
                .then(function(response) {
                    const proteinObjects = response.response[0].result;

                    // This render the Bootstrap tabs with Nav pills
                    const _proteins = [];
                    for (let i = 0; i < proteinObjects.length; i++) {
                        _proteins.push({id: proteinObjects[i].accession[0], active: (i === 0)});
                    }
                    _this.proteins = _proteins;

                    // DO NOT EVEN DARE TO TOUCH THIS LINE! //fixme to LitElement
                    _this.$.proteinsDiv.render();

                    if (proteinObjects.length > 0 && typeof _this.opencgaSession.project !== "undefined" &&
                        typeof _this.opencgaSession.study !== "undefined" && typeof _this.opencgaSession.study.alias !== "undefined") {
                        const params = {
                            ct: "missense_variant,transcript_ablation,splice_acceptor_variant,splice_donor_variant,stop_gained,frameshift_variant,stop_lost,start_lost," +
                                "transcript_amplification,inframe_insertion,inframe_deletion",
                            study: _this.opencgaSession.study.fqn,
                            returnedStudies: _this.opencgaSession.study.fqn,
                            summary: true
                            // exclude: "studies.samplesData,studies.files"
                        };

                        if (typeof _this.gene !== "undefined" && _this.gene !== "") {
                            params.gene = _this.gene;
                        } else if (typeof _this.ids !== "undefined" && _this.ids !== "") {
                            params["annot-xref"] = _this.ids;
                        }
                        _this.opencgaClient.variants().query(params)
                            .then(function(variants) {
                                const lollipop = new Lollipop();
                                for (let i = 0; i < proteinObjects.length; i++) {
                                    const svgSettings = {
                                        // width: proteinObjects[i].sequence.length,
                                        width: 1280,
                                        height: 140,
                                        proteinPositioningInterval: 3,
                                        color: _this.config.color
                                    };
                                    const svg = lollipop.createSvg(proteinObjects[i], variants.response[0].result, svgSettings);
                                    const querySelector = PolymerUtils.getElementById(_this._prefix + proteinObjects[i].accession[0]);
                                    querySelector.appendChild(svg);
                                }
                            }).catch(function(e) {
                                console.log(e);
                            });
                    }
                })
                .catch(function(e) {
                    console.log(e);
                });
        }
    }

    render() {
        return html`
        <!--<h4>{{study.alias}} - {{protein.id}}</h4>-->

        <ul class="nav nav-pills">
            ${this.proteins && this.proteins.length ? this.proteins.map(protein => html`
                ${protein.active ? html`
                    <br>
                    <li role="presentation" class="active"><a href="#${this._prefix}${protein.id}" role="tab" data-bs-toggle="tab">${protein.id}</a></li>
                ` : html`
                    <br>
                    <li role="presentation"><a href="#${this._prefix}${protein.id}" role="tab" data-bs-toggle="tab">${protein.id}</a></li>
                `}
            `) : null }
        </ul>

        <div class="tab-content">
            ${this.checkProteinsAvailable(this.proteins) ? html`
                <div id="proteinsDiv">
                ${this.proteins.map( protein => html`
                    ${protein.active ? html`
                        <br>
                        <div role="tabpanel" class="tab-pane active" id="${this._prefix}${protein.id}"></div>
                        <br>
                        ` : html`
                        <br>
                        <div role="tabpanel" class="tab-pane" id="${this._prefix}{protein.id}"></div>
                        <br>
                        `}
                        <a href="#protein/${this.opencgaSession.project.alias}/${this.opencgaSession.study.alias}/${protein.id}">Please click here for more details</a>
                `)}
                </div>
            ` : html`
                <div style="padding-left: 10px">
                    <h4>No proteins present</h4>
                </div>
            `}
        </div>
        `;
    }

}

customElements.define("variant-protein-view", VariantProteinView);

