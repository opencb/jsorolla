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

import {LitElement, html} from '/web_modules/lit-element.js';
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
            }
        }
    }

    _init(){
        this._prefix = "saf-" + Utils.randomString(6) + "_";
    }

    updated(changedProperties) {
        if(changedProperties.has("property")) {
            this.propertyObserver();
        }
    }

    onSampleFilterClick(e) {
        //TODO fire a unique event
        console.log("onSampleFilterClick change", e.target)
        let event = new CustomEvent('sampleFilterClick', {
            detail: {
                sample: e.target.value

            }
        });
        this.dispatchEvent(event);
    }
    showModal(){
        $("#" + this._prefix + "SampleFilterModal").modal("show");
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
                    <tbody id="${this._prefix}SampleFiltersSummaryTBody">
                    <tr>
                        <td>No samples selected</td>
                        <td></td>
                    </tr>
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

customElements.define('sample-filter', SampleFilter);