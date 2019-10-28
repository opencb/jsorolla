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

export default class CohortFilter extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            cellbaseClient: {
                type: Object
            },
            cohorts: {
                type: Array
            },
            config: {
                type: Object
            }
        }
    }

    _init(){
        this._prefix = "cf-" + Utils.randomString(6) + "_";
        this.cohortsPerStudy = this.cohorts ? this.cohorts[this.opencgaSession.project.id] : null;

    }
    firstUpdated(_changedProperties) {
        let cohortArray = [];
        if (this.query && typeof this.query.cohortStatsAlt !== "undefined") {
            cohortArray = this.query.cohortStatsAlt.split(new RegExp("[,;]"));
            for (let i = 0; i < cohortArray.length; i++) {
                let [study, cohortFreq] = cohortArray[i].split(":");
                let [cohort, freq] = cohortFreq.split(/[<=>]+/);
                let operator = cohortFreq.split(/[-A-Za-z0-9._:]+/)[1];
                PolymerUtils.setValue(this._prefix + study + cohort + "Cohort", freq);
                PolymerUtils.setValue(this._prefix + study + cohort + "CohortOperator", operator);
            }
        }
    }

    //TODO refactor!
    filterChange(e) {
        let cohortFreq = [];
        let cohortStatsAlt;
        if (UtilsNew.isNotEmpty(this._cohorts)) {
            for (let studyId in this._cohorts) {
                for (let cohort of this._cohorts[studyId]) {
                    let cohortInput = PolymerUtils.getElementById(this._prefix + studyId + cohort.id + "Cohort");
                    let operator = PolymerUtils.getElementById(this._prefix + studyId + cohort.id + "CohortOperator");
                    if (cohortInput !== null && UtilsNew.isNotEmpty(cohortInput.value)) {
                        operator = operator.value;
                        // FIXME to be removed!!
                        if (studyId === "BRIDGE") {
                            studyId = "bridge";
                        }
                        let pf = studyId + ":" + cohort.id + operator + cohortInput.value;
                        cohortFreq.push(pf);
                    }
                }
            }
        }
        if (cohortFreq.length > 0) {
            // _filters["cohortStatsMaf"] = cohortFreq.join(';');
            cohortStatsAlt = cohortFreq.join(";");
        }
        let event = new CustomEvent('filterChange', {
            detail: {
                cohort: cohortStatsAlt ? cohortStatsAlt : null

            }
        });
        this.dispatchEvent(event);
    }

    render() {
        return this.cohortsPerStudy ? html`
            ${Object.keys(this.cohortsPerStudy).map(study => html`
                <div style="padding: 5px 0px">
                    <div style="padding-bottom: 5px">
                        <span style="font-style: italic">COHORT HTML${study}</span> study:
                    </div>
                    <div class="form-horizontal">
                        ${this.cohortsPerStudy[study] && this.cohortsPerStudy[study].map(cohort => html`
                            <div class="form-group" style="margin: 5px 0px">
                                <span class="col-md-4 control-label">${cohort.name}</span>
                                <div class="col-md-4" style="padding: 0px 10px">
                                    <select id="${this._prefix}${study}${cohort.id}CohortOperator" name="${cohort.id}Operator"
                                            class="form-control input-sm ${this._prefix}FilterSelect" style="padding: 0px 5px" @change="${this.filterChange}">
                                        <option value="<" selected>&lt;</option>
                                        <option value="<=">&le;</option>
                                        <option value=">">&gt;</option>
                                        <option value=">=">&ge;</option>
                                    </select>
                                </div>
                                <div class="col-md-4" style="padding: 0px 10px">
                                    <input type="text" value="" class="form-control input-sm ${this._prefix}FilterTextInput"
                                           name="${study}_${cohort.id}" id="${this._prefix}${study}${cohort.id}Cohort" @change="${this.filterChange}">
                                </div>
                            </div>
                        `)}
                    </div>
                </div>`)}
        ` : html`
            <span>Project not found</span>
        `;
    }
}

customElements.define('cohort-filter',CohortFilter);
