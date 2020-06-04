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
            clinicalAnalysis: {
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

        // this.base64 = "data:image/png;base64, " + Circos.base64;
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    firstUpdated(_changedProperties) {
    }

    updated(changedProperties) {
        if (changedProperties.has("query") || changedProperties.has("sampleId")) {
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

    showModal() {
        $("#" + this._prefix + "SaveModal").modal("show");
    }

    onClear(e) {
        debugger
    }

    onSave(e) {

        this.opencgaSession.opencgaClient.clinical().updateQualityControl(this.clinicalAnalysis.id, {
            study: this.opencgaSession.study.fqn,
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
                        title: "Sample",
                        collapsed: false,
                        fields: [
                            {
                                id: "file-quality",
                                title: "Quality Filter"
                            },
                        ]
                    },
                    {
                        title: "Genomic",
                        collapsed: true,
                        fields: [
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
                        name: "Example Missense PASS",
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
                        
                        <div class="col-md-12">
                            <div style="padding: 0px 10px;float: left">
                                <button id="${this._prefix}Save" type="button" class="btn btn-primary" @click="${this.showModal}">
                                    <i class="fa fa-cog" aria-hidden="true" data-view="Interactive" style="padding-right: 5px" @click="${this.showModal}"></i> Settings
                                </button>
                                <button id="${this._prefix}Save" type="button" class="btn btn-primary" @click="${this.showModal}">
                                    <i class="fa fa-save" aria-hidden="true" data-view="Interactive" style="padding-right: 5px" @click="${this.showModal}"></i> Save...
                                </button>
                            </div>
                        </div>
                
                        <variant-interpreter-qc-cancer-plots    .opencgaSession="${this.opencgaSession}"
                                                                .query="${this.executedQuery}"
                                                                .sampleId="${this.sampleId}"
                                                                .active="${this.active}">
                        </variant-interpreter-qc-cancer-plots>
                    </div>
                </div>
            </div>
            
            <!-- Modal -->
            <div class="modal fade" id="${this._prefix}SaveModal" data-backdrop="static" data-keyboard="false"
                 tabindex="-1" role="dialog" aria-hidden="true" style="padding-top: 0%; overflow-y: visible">
                <div class="modal-dialog" style="width: 640px">
                    <div class="modal-content">
                        <div class="modal-header" style="padding: 5px 15px">
                            <h3>Save QC Filter</h3>
                        </div>
                        <div class="modal-body">
                            <div class="form-horizontal collapse in">
                                <div class="form-group">
                                    <label class="control-label col-md-1 jso-label-title">Filter ID</label>
                                    <div class="col-md-6">
                                        <input type="text" id="${this._prefix}CommentInterpretation" class="${this._prefix}TextInput form-control"
                                               placeholder="Add a filter ID" data-field="comment">
                                    </div>
                                </div>
    
                                <div class="form-group">
                                    <label class="control-label col-md-1 jso-label-title">Description</label>
                                    <div class="col-md-6">
                                        <textarea id="${this._prefix}DescriptionInterpretation" class="${this._prefix}TextInput form-control"
                                              placeholder="Description of the filter" data-field="description"
                                              @input="${this.onInputChange}"></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-dismiss="modal" @click="${this.onClear}">Cancel</button>
                            <button type="button" class="btn btn-primary" data-dismiss="modal" @click="${this.onSave}">Save</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("variant-interpreter-qc-variant-cancer", VariantInterpreterQcVariantCancer);
