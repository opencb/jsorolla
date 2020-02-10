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

// TODO Refactor needed it needs updated() [never saw how does it looks in IVA]

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
            opencgaSession: {
                type: Object
            },
            cellbaseClient: {
                type: Object
            },
            cohorts: {
                type: Object
            },
            config: {
                type: Object
            },
            cohortStatsAlt: {
                type: String
            },
            // TODO temp fix (should it be defined from config in component itself?)
            _cohorts: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "cf-" + Utils.randomString(6) + "_";
    }

    connectedCallback() {
        super.connectedCallback();
        this.cohortsPerStudy = this.cohorts ? this.cohorts[this.opencgaSession.project.id] : null;
    }


    updated(_changedProperties) {
        if (_changedProperties.has("cohortStatsAlt")) {
            let cohortArray = [];
            // reset fields
            $(`.${this._prefix}FilterTextInput`, this).val("");
            $(`.${this._prefix}FilterSelect`, this).val("<");
            if (this.cohortStatsAlt && this.cohortStatsAlt.length) {
                cohortArray = this.cohortStatsAlt.split(new RegExp("[,;]"));
                for (let i = 0; i < cohortArray.length; i++) {
                    const [study, cohortFreq] = cohortArray[i].split(":");
                    const [cohort, freq] = cohortFreq.split(/[<=>]+/);
                    const operator = cohortFreq.split(/[-A-Za-z0-9._:]+/)[1];
                    this.querySelector("#" + this._prefix + study + cohort + "Cohort").value = freq;
                    this.querySelector("#" + this._prefix + study + cohort + "CohortOperator").value = operator;
                }
            }
        }
    }

    // TODO refactor!
    filterChange(e) {
        const cohortFreq = [];
        let cohortStatsAlt;
        console.log("this._cohorts", this._cohorts);
        console.log("this.cohorts", this.cohorts);
        if (UtilsNew.isNotEmpty(this._cohorts)) {
            for (let studyId in this._cohorts) {
                for (const cohort of this._cohorts[studyId]) {
                    const cohortInput = PolymerUtils.getElementById(this._prefix + studyId + cohort.id + "Cohort");
                    let operator = PolymerUtils.getElementById(this._prefix + studyId + cohort.id + "CohortOperator");
                    if (cohortInput !== null && UtilsNew.isNotEmpty(cohortInput.value)) {
                        operator = operator.value;
                        // FIXME to be removed!!
                        if (studyId === "BRIDGE") {
                            studyId = "bridge";
                        }
                        const pf = studyId + ":" + cohort.id + operator + cohortInput.value;
                        cohortFreq.push(pf);
                    }
                }
            }
        }
        if (cohortFreq.length > 0) {
            // _filters["cohortStatsMaf"] = cohortFreq.join(';');
            cohortStatsAlt = cohortFreq.join(";");
        }
        const event = new CustomEvent("filterChange", {
            detail: {
                value: cohortStatsAlt ? cohortStatsAlt : null

            }
        });
        this.dispatchEvent(event);
    }

    render() {
        return this.cohortsPerStudy ? html`
            ${Object.keys(this.cohortsPerStudy).map(study => html`
                <div style="padding: 5px 0px">
                    <div style="padding-bottom: 5px">
                        <span style="font-style: italic">${study}</span> study:
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
                                           name="${study}_${cohort.id}" id="${this._prefix}${study}${cohort.id}Cohort" @input="${this.filterChange}">
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

customElements.define("cohort-filter", CohortFilter);
