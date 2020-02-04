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
import "../../variant/opencga-variant-filter-clinical.js";

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
            enabled: {
                type: Boolean
            },
            clinicalAnalysis: {
                type: Object
            },
            query: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "saf-" + Utils.randomString(6) + "_";
        this._query = {}; //this refer and it is used just for the 3 fields of sample-filter (sample, genotype, format)
    }

    updated(changedProperties) {
        if (changedProperties.has("query")) {
            this.queryObserver();
        }
    }

    firstUpdated(_changedProperties) {
        //this.renderClinicalQuerySummary();
        this.updateClinicalQueryTable();
    }

    filterChange(e) {
        console.log("filterChange", e.target);
        const event = new CustomEvent("filterChange", {
            detail: {
                sample: e.target.value

            }
        });
        this.dispatchEvent(event);
    }

    queryObserver(){
        this.updateClinicalQueryTable();
        this.clinicalFilterQuery = $.extend(true, {}, this.query);  //updates the table opencga-variant-filter-clinical (in the modal)

        //console.warn("query changed", this.query)
        //console.error("renderClinicalQuerySummary is the problem for the not updating sample-filter table after active-filter change")
        //console.log("clinicalFilterQuery", this.clinicalFilterQuery)
        //this.requestUpdate();
    }

    showModal() {
        $("#" + this._prefix + "SampleFilterModal").modal("show");
    }

    //TODO needs refactor. it comes from variant-filter
    onClinicalFilterChange(e) {

        //console.warn("onClinicalFilterChange is commented")
        //return;

        // Process Sample filters
        let _genotypeFilters = [];
        let _sampleIds = [];
        let _dpFormatFilter = [];
        for (let sampleFilter of e.detail.sampleFilters) {
            // let color = (sampleFilter.affected) ? "red" : "black";
            let genotypes = (sampleFilter.genotypes.length > 0) ? sampleFilter.genotypes.join(",") : "none";

            console.log("genotypes",genotypes)
            let dp = (UtilsNew.isNotEmpty(sampleFilter.dp)) ? Number(sampleFilter.dp) : -1;

            //TODO this keeps adding missing gt, if you keep clicking
            if (genotypes !== "none") {
                if (e.detail.missing && !sampleFilter.proband) {
                    genotypes += ",./0,./1,./.";
                }
                _genotypeFilters.push(sampleFilter.id + ":" + genotypes);
            }
            if (dp !== -1) {
                _dpFormatFilter.push(sampleFilter.id + ":DP>=" + dp);
            }
            _sampleIds.push(sampleFilter.id)
        }

        // Process File filters
        // let _files = [];
        // let _qual = e.detail.qual;
        // let _filter = e.detail.filter;
        // for (let fileFilter of e.detail.fileFilters) {
        //     if (fileFilter.selected) {
        //         // _files.push(fileFilter.name);
        //         _files.push(fileFilter.id);
        //     }
        // }

        // Add sample filters to query
        let _query = {...this.query};
        if (_genotypeFilters !== undefined && _genotypeFilters.length > 0) {
            _query.genotype = _genotypeFilters.join(";");
            delete _query.sample;
        } else {
            // debugger
            _query.sample = _sampleIds.join(",");
            delete _query.genotype;
        }
        if (_dpFormatFilter !== undefined && _dpFormatFilter.length > 0) {
            _query.format = _dpFormatFilter.join(";");
        } else {
            if (UtilsNew.isNotUndefinedOrNull(_query.format)) {
                delete _query.format;
            }
        }

        // Add file filters to query
        // if (_files.length > 0) {
        //     _query.file = _files.join(";");
        //     if (UtilsNew.isNotEmpty(_qual)) {
        //         _query.qual = ">=" + _qual;
        //     }
        //     if (UtilsNew.isNotEmpty(_filter)) {
        //         _query.filter = _filter;
        //     }
        //     needUpdateQuery = true;
        // } else {
        //     // If no files are selected we remove all files-related filters
        //     delete _query.file;
        //     delete _query.qual;
        //     delete _query.filter;
        // }

        //Only update query if really needed, this avoids unneeded web refresh

        this.query = {...this.query, ..._query};
        //this.renderClinicalQuerySummary();
        this.updateClinicalQueryTable();
        //this.requestUpdate();
        this.sampleFilterChange(_query);
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

    // TODO this method has been refactored, the render block has been moved in template. Move the block in more convenient method.
    //renderClinicalQuerySummary() {
    updateClinicalQueryTable() {
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

            //TODO this cause a bug (variant-filter-clinical table is not updated correctly changing GT), but commenting this line the table in sample-filter is not updated on its end (changing active-filters)
            //this.requestUpdate();
        }
    }

    render() {
        return this.enabled ? html`
            <style>
                .sample-genotype-table .badge {
                    background-color: #b9b9b9;
                    margin: 0 4px 0 0;
                }
            </style>
            <div>
                <div style="padding: 10px 0px">Select Genotype Filter:</div>
                <div style="padding-left: 20px">
                    <button id="${this._prefix}SampleFilterModalButton" type="button" class="btn btn-default" @click="${this.showModal}">
                        Sample Filters...
                    </button>
                </div>
            </div>
            <div style="padding: 10px 0px 5px 0px">
                <div style="padding: 15px 0px;">
                    <span>Sample Genotype Summary</span>
                </div>
                <table class="table sample-genotype-table" style="margin-bottom: 10px">
                    <thead>
                    <tr>
                        <th scope="col">Sample ID</th>
                        <th scope="col">GT</th>
                    </tr>
                    </thead>
                    <tbody>
                        
                        
                        ${this.clinicalAnalysis ? html`
                            ${this.individuals ? this.individuals.map(individual => {
                                if (UtilsNew.isNotEmptyArray(individual.samples)) {
                                    const color = this.clinicalAnalysis.proband && individual.id === this.clinicalAnalysis.proband.id ? "darkred" : "black";
                                    
                                    console.log("sampleGenotypeMap", this.sampleGenotypeMap[individual.samples[0].id])
                                    //const genotype = this.sampleGenotypeMap[individual.samples[0].id] ? this.sampleGenotypeMap[individual.samples[0].id].join(", ") : "any";
                                    return html`
                                                <tr data-sample="${individual.samples[0].id}">
                                                    <td>
                                                        <span style="color: ${color}">${individual.samples[0].id}</span>
                                                    </td>
                                                    <td>
                                                        ${this.sampleGenotypeMap[individual.samples[0].id] ? this.sampleGenotypeMap[individual.samples[0].id].map(gt => html`<span class="badge">${gt}</span>`) : "any"}
                                                    </td>
                                                </tr>
                                        `;
                                }
                            }) : null}
                        ` : html`
                            <tr>
                                <td>No samples selected</td>
                                <td></td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
            
            <div class="modal fade" id="${this._prefix}SampleFilterModal" data-backdrop="static" data-keyboard="false"
                 tabindex="-1"
                 role="dialog" aria-hidden="true" style="padding-top: 0%; overflow-y: visible">
                <div class="modal-dialog" style="width: 1280px">
                    <div class="modal-content">
                        <div class="modal-header" style="padding: 5px 15px">
                            <h3>Sample and File Filters</h3>
                        </div>
                        <div class="modal-body">
                            <opencga-variant-filter-clinical .opencgaSession="${this.opencgaSession}"
                                                             .clinicalAnalysis="${this.clinicalAnalysis}"
                                                             .query="${this.query}"
                                                             @sampleFiltersChange="${this.onClinicalFilterChange}"
                                                             style="font-size: 12px">
                            </opencga-variant-filter-clinical>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-dismiss="modal">OK</button>
                        </div>
                    </div>
                </div>
            </div>
        ` : "";
    }

}

customElements.define("sample-filter", SampleFilter);
