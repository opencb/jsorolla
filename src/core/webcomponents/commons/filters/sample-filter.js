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
import "./../../opencga/variant/opencga-variant-filter-clinical.js";

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
            }
        };
    }

    _init() {
        this._prefix = "saf-" + Utils.randomString(6) + "_";
    }

    updated(changedProperties) {
        if (changedProperties.has("property")) {
            this.propertyObserver();
        }
    }

    firstUpdated(_changedProperties) {
        this.renderClinicalQuerySummary();
    }

    filterChange(e) {
        console.log("filterChange", e.target);
        let event = new CustomEvent("filterChange", {
            detail: {
                sample: e.target.value

            }
        });
        this.dispatchEvent(event);
    }

    showModal() {
        $("#" + this._prefix + "SampleFilterModal").modal("show");
    }

    //TODO this method has been refactored, check functionality
    renderClinicalQuerySummary() {
        if (this.clinicalAnalysis) {
            // Get Individuals (and samples) from Clinical Analysis
            let individuals = [];
            if (this.clinicalAnalysis.family && this.clinicalAnalysis.family.members) {
                individuals = this.clinicalAnalysis.family.members;
            } else if (this.clinicalAnalysis.proband) {
                individuals = this.clinicalAnalysis.proband;
            }


            // First, render Genotype table
            let sampleGenotypeMap = {};
            if (UtilsNew.isNotUndefinedOrNull(this.query.genotype)) {
                for (let genotype of this.query.genotype.split(";")) {
                    let sampleGt = genotype.split(":");
                    sampleGenotypeMap[sampleGt[0]] = sampleGt[1].split(",");
                }
            } else {
                if (UtilsNew.isNotUndefinedOrNull(this.query.sample)) {
                    for (let sample of this.query.sample.split(",")) {
                        sampleGenotypeMap[sample] = ["0/1", "1/1"];
                    }
                }
            }

            // Render Genotype table
            let sampleTableTr = "";
            let table = individuals.map(individual => {
                if (UtilsNew.isNotEmptyArray(individual.samples)) {
                    let color = (UtilsNew.isNotUndefinedOrNull(this.clinicalAnalysis.proband)
                        && individual.id === this.clinicalAnalysis.proband.id)
                        ? "darkred"
                        : "black";
                    let genotype = (UtilsNew.isNotUndefinedOrNull(sampleGenotypeMap[individual.samples[0].id]))
                        ? sampleGenotypeMap[individual.samples[0].id]
                        : "any";

                    return html`
                            <tr data-sample="${individual.samples[0].id}">
                                <td>
                                    <span style="color: ${color}">${individual.samples[0].id}</span>
                                </td>
                                <td>
                                    ${genotype}
                                </td>
                            </tr>
                    `;
                }
            });
            return html`${table}`;
        } else {
            return html`
                <tr>
                    <td>No samples selected</td>
                    <td></td>
                </tr>`;
        }
    }

    render() {
        return this.enabled ? html`
            <div>
                <div style="padding: 10px 0px">Select Genotype Filter:</div>
                <div style="padding-left: 20px">
                    <button id="${this._prefix}SampleFilterModalButton" type="button" class="btn btn-default" style="width: 80%"
                            @click="${this.showModal}">
                        Sample Filters ...
                    </button>
                </div>
            </div>
            <div style="padding: 10px 0px 5px 0px">
                <div style="padding: 15px 0px;">
                    <span>Sample Genotype Summary</span>
                </div>
                <table class="table" style="margin-bottom: 10px">
                    <thead>
                    <tr>
                        <th scope="col">Sample ID</th>
                        <th scope="col">GT</th>
                    </tr>
                    </thead>
                    <tbody>
                        ${this.renderClinicalQuerySummary()}
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
                            <opencga-variant-filter-clinical .opencgaSession=${this.opencgaSession}
                                                             .clinicalAnalysis="${this.clinicalAnalysis}"
                                                             .query="${this.clinicalFilterQuery}"
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
        ` : ``;
    }
}

customElements.define("sample-filter", SampleFilter);
