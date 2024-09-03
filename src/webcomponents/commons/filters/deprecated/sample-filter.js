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
import "../../variant/variant-family-genotype-filter.js";


/**
 * @deprecated
 */
export default class SampleFilter extends LitElement {

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
            // enabled: {
            //     type: Boolean
            // },
            clinicalAnalysis: {
                type: Object
            },
            query: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "sgf-" + UtilsNew.randomString(6) + "_";
        // this._query = {}; //this refer and it is used just for the 3 fields of sample-filter (sample, genotype, format)
        this.errorState = false;
        this.predefinedFilter = false;
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("query")) {
            this.queryObserver();
        }
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    firstUpdated(_changedProperties) {
        //this.renderClinicalQuerySummary();

        // TODO recheck if it is necessary (it is called by queryObserver already)
        //this.updateClinicalQueryTable();
    }

    queryObserver(){
        //this.updateClinicalQueryTable(); //TODO recheck if this needs to be executed on clinicalAnalysis update
        //this.requestUpdate();
    }

    showModal() {
        $("#" + this._prefix + "SampleGenotypeFilterModal").modal("show");
    }

    //TODO needs refactor
    onClinicalFilterChange(e) {
        // Process Sample filters
        let _genotypeFilters = [];
        let _sampleIds = [];
        let _dpFormatFilter = [];

        //TODO FIX empty _genotypeFilters (keeping the proband only) is a problem rendering sample-filter table
        if (e.detail.mode === "COMPOUND_HETEROZYGOUS" || e.detail.mode === "DE_NOVO" || e.detail.mode === "MENDELIAN_ERROR") {
            // const proband = e.detail.sampleFilters.filter( sample => sample.proband);
            // console.log("proband", proband)
            let proband = this.clinicalAnalysis.proband.samples[0].id
            _genotypeFilters.push(proband + ":" + e.detail.mode);
        } else {
            for (let sampleFilter of e.detail.sampleFilters) {
                let genotypes = (sampleFilter.genotypes && sampleFilter.genotypes.length > 0) ? sampleFilter.genotypes.join(",") : "none";
                if (genotypes !== "none") {
                    if (e.detail.missing && !sampleFilter.proband) {
                        genotypes += ",./0,./1,./.";
                    }
                    _genotypeFilters.push(sampleFilter.id + ":" + genotypes);
                }

                let dp = (UtilsNew.isNotEmpty(sampleFilter.dp)) ? Number(sampleFilter.dp) : -1;
                if (dp !== -1) {
                    _dpFormatFilter.push(sampleFilter.id + ":DP>=" + dp);
                }

                _sampleIds.push(sampleFilter.id)
            }
        }

        // Add sample filters to query
        let _query = {...this.query};
        if (_genotypeFilters !== undefined && _genotypeFilters.length > 0) {
            _query.sample = _genotypeFilters.join(";");
        } else {
            _query.sample = _sampleIds.join(",");
        }
        if (_dpFormatFilter !== undefined && _dpFormatFilter.length > 0) {
            _query.format = _dpFormatFilter.join(";");
        } else {
            if (UtilsNew.isNotUndefinedOrNull(_query.format)) {
                delete _query.format;
            }
        }

        this.query = {...this.query, ..._query};

        // since OK button now works as confirm button (it was used just to close the modal before) we fire the event `sampleFilterChange` automatically, just the first time.
        // if (!this.predefinedFilter) {
        //     this.predefinedFilter = this.query;
        //     this.sampleFilterChange(this.query);
        // }

        //this.updateClinicalQueryTable();
        //this.requestUpdate();
        //this.sampleFilterChange(_query);

        this.errorState = e.detail.errorState;
        this.requestUpdate();
    }

    confirm() {
        this.sampleFilterChange(this.query);
    }

    sampleFilterChange(_query) {
        console.log("sampleFilterChange", _query);
        const event = new CustomEvent("sampleFilterChange", {
            detail: {
                value: _query
            }
        });
        this.dispatchEvent(event);
    }

    /*updateClinicalQueryTable() {
        debugger
        if (this.clinicalAnalysis) {
            // Get Individuals (and samples) from Clinical Analysis
            this.individuals = [];
            if (this.clinicalAnalysis.family && this.clinicalAnalysis.family.members) {
                this.individuals = this.clinicalAnalysis.family.members;
            } else if (this.clinicalAnalysis.proband) {
                this.individuals = this.clinicalAnalysis.proband;
            }

            // First, render Genotype table
            this.sampleGenotypeMap = {};
            if (UtilsNew.isNotUndefinedOrNull(this.query.genotype)) {
                for (const genotype of this.query.genotype.split(";")) {
                    const sampleGt = genotype.split(":");
                    this.sampleGenotypeMap[sampleGt[0]] = sampleGt[1].split(",");
                }
            } else {
                if (UtilsNew.isNotUndefinedOrNull(this.query.sample)) {
                    for (const sample of this.query.sample.split(",")) {
                        this.sampleGenotypeMap[sample] = ["0/1", "1/1"];
                    }
                }
            }

            //TODO this cause a bug (the table in variant-filter-clinical is not updated correctly changing GT checkboxes), but commenting this line the table in sample-filter is not updated on its end (changing active-filters)
            this.requestUpdate();
        }
    }*/

    getDefaultConfig() {
        return {
            text: "Select sample genotype filter (e.g recessive, compound heterozygous, ...):",
            showSummary: false
        };
    }

    render() {
        // Check Project exists
        if (!this.clinicalAnalysis) {
            return html`
                <div class="guard-page">
                    <i class="fas fa-lock fa-5x"></i>
                    <h3>No Clinical Analysis selected.</h3>
                </div>
            `;
        }

        return html`
            <div>
                ${this._config.text
                    ? html`<div style="padding: 5px 0px">${this._config.text}</div>`
                    : null
                }
                <div class="text-center">
                    <button id="${this._prefix}SampleGenotypeFilterModalButton" type="button" class="btn btn-default multi-line" @click="${this.showModal}">
                        Sample Genotype Filter ...
                    </button>
                </div>
            </div>

            ${this._config.showSummary
                ? html`
                    <div style="padding: 10px 0px 5px 0px">
                        <div style="padding: 15px 0px;">
                            <span>Sample Genotype Summary</span>
                        </div>
                        <table class="table sample-genotype-table" style="margin-bottom: 10px">
                            <thead class="table-light">
                                <tr>
                                    <th scope="col">Sample ID</th>
                                    <th scope="col">GT</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.individuals ? this.individuals.map(individual => {
                                    if (UtilsNew.isNotEmptyArray(individual.samples)) {
                                        // console.log("sampleGenotypeMap", this.sampleGenotypeMap[individual.samples[0].id])
                                        // const genotype = this.sampleGenotypeMap[individual.samples[0].id] ? this.sampleGenotypeMap[individual.samples[0].id].join(", ") : "any";
                                        return html`
                                            <tr data-sample="${individual.samples[0].id}">
                                                <td>
                                                    <span style="color: ${this.clinicalAnalysis.proband && individual.id === this.clinicalAnalysis.proband.id ? "darkred" : "black"}">${individual.samples[0].id}</span>
                                                </td>
                                                <td>
                                                    ${this.sampleGenotypeMap[individual.samples[0].id] ? this.sampleGenotypeMap[individual.samples[0].id].map(gt => html`<span class="badge badge-info">${gt}</span>`) : "any"}
                                                </td>
                                            </tr>
                                        `;
                                    }
                                }) : null}
                            </tbody>
                        </table>
                    </div>`
                : null
            }

            <div class="modal fade" id="${this._prefix}SampleGenotypeFilterModal"
                 tabindex="-1" role="dialog" aria-hidden="true" style="padding-top: 0%; overflow-y: visible">
                <div class="modal-dialog" style="width: 1280px">
                    <div class="modal-content">
                        <div class="modal-header" style="padding: 5px 15px">
                            <h3>Sample Genotypes Filter</h3>
                        </div>
                        <div class="modal-body">
                            <variant-family-genotype-filter .opencgaSession="${this.opencgaSession}"
                                                             .clinicalAnalysis="${this.clinicalAnalysis}"
                                                             .query="${this.query}"
                                                             @sampleFiltersChange="${this.onClinicalFilterChange}">
                            </variant-family-genotype-filter>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary ripple" data-dismiss="modal" .disabled=${this.errorState} @click="${this.confirm}">OK</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("sample-filter", SampleFilter);
