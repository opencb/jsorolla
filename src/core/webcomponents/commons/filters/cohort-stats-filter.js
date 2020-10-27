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


export default class CohortStatsFilter extends LitElement {

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
            cohorts: {
                type: Object
            },
            onlyCohortAll: {
                type: Boolean
            },
            cohortStatsAlt: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "cf-" + UtilsNew.randomString(6);
        this.defaultComparator = "<";

    }

    connectedCallback() {
        super.connectedCallback();
        this.cohortsPerStudy = this.cohorts ? this.cohorts[this.opencgaSession.study.id] : null;
        this.state = {};
    }

    updated(_changedProperties) {
        if (_changedProperties.has("cohortStatsAlt")) {
            this.state = {};
            if (this.cohortStatsAlt) {
                const cohorts = this.cohortStatsAlt.split(";");
                cohorts.forEach(cohortStat => {
                    const [project, study, cohortFreq] = cohortStat.split(":");
                    const [cohort, comparator, value] = cohortFreq.split(/(<=?|>=?|=)/);
                    this.state[project + ":" + study] = {cohort, comparator, value};
                });
            }
            this.requestUpdate();
        }

        if (_changedProperties.has("onlyCohortAll")) {
            this.cohortsPerStudy = this._getCohortAll();
            this.requestUpdate();
        }

        if (_changedProperties.has("opencgaSession")) {
            this.state = {};
            //this.cohortsPerStudy = this.cohorts ? this.cohorts[this.opencgaSession.project.id] : this._getCohortAll();
            this.cohortsPerStudy = this._getCohortAll();
            this.requestUpdate();
        }
    }

    _getCohortAll() {
        let cohortsPerStudy = {};
        if (this.opencgaSession && this.onlyCohortAll) {
            for (let study of this.opencgaSession.project.studies) {
                cohortsPerStudy[study.fqn] = [
                    {id: "ALL", name: "All"}
                ];
            }
        }
        return cohortsPerStudy;
    }

    handleCollapseAction(e) {
        const id = e.target.dataset.id;
        const elem = $("#" + id)[0];
        elem.hidden = !elem.hidden;
        if (elem.hidden) {
            e.target.className = "fa fa-plus";
        } else {
            e.target.className = "fa fa-minus";
        }
    }

    formatStudyId(fqn) {
        // replaces characters not valid in an DOM Element ID
        return fqn.replace(/@|:/g, "_")
    }

    filterChange(e, study, cohort) {
        // e.detail.value is not defined iff you are changing the comparator and a value hasn't been set yet
        if(e?.detail?.value) {
            e.stopPropagation();
            this.state[study] = {cohort: cohort, comparator: e.detail.comparator, value: e.detail.numValue};
        } else {
            delete this.state[study];
        }
        /*const {study, cohort, action} = e.target.dataset;
        console.log("study, cohort, action", study, cohort, action)
        if (action === "operator") {
            const operator = e.target.value;
            this.state[study] = {...this.state[study], cohort, operator};
        }
        if (action === "value") {
            const value = e.target.value;
            this.state[study] = {...this.state[study], cohort, operator: this.state[study]?.operator ?? "<", value};
        }
        */
        const value = Object.entries(this.state).filter(([, v]) => v.value).map(([study, v]) => `${study}:${v.cohort}${v.comparator}${v.value}`).join(";");
        const event = new CustomEvent("filterChange", {
            detail: {
                value: value
            }
        });
        this.dispatchEvent(event);
    }

    render() {
        return this.cohortsPerStudy ? Object.entries(this.cohortsPerStudy).map(([study, cohort]) => html`
            <div style="padding: 5px 0px">
                <div style="padding-bottom: 5px">
                    <i id="${this._prefix}${this.formatStudyId(study)}Icon" data-id="${this._prefix}${this.formatStudyId(study)}" class="fa fa-plus"
                       style="cursor: pointer;padding-right: 10px" @click="${this.handleCollapseAction}"></i>
                    <span class="break-word">Study <strong>${study.split("@")[1]}</strong> cohorts</span> 
                </div>
                <div class="form-horizontal" id="${this._prefix}${this.formatStudyId(study)}" hidden>
                    ${cohort.map(cohort => html`
                        <div class="form-group" style="margin: 5px 0px">
                            <number-field-filter
                                .value="${this.state?.[study]?.value ? (this.state?.[study]?.comparator ?? this.defaultComparator) + (this.state?.[study]?.value ?? "") : ""}"
                                .config="${{comparator: true, layout: [3,3,6]}}"
                                .label="${cohort.name}"
                                type="string"
                                data-study="${study}"
                                data-cohort="${cohort.id}"
                                data-action="comparator"
                                @filterChange="${e => this.filterChange(e, study, cohort.id)}">
                            </number-field-filter>
                            
                            
                            <!--<span class="col-md-4 control-label">${cohort.name}</span>
                            <div class="col-md-4" style="padding: 0px 10px">
                                <select id="${this._prefix}${study}${cohort.id}CohortOperator" name="${cohort.id}Operator"
                                        class="form-control input-sm ${this._prefix}FilterSelect" style="padding: 0px 5px"
                                        data-study="${study}"
                                        data-cohort="${cohort.id}"
                                        data-action="comparator"
                                        @change="${e => this.filterChange(e, study, cohort.id)}">
                                    ${["<", "<=", ">", ">="].map((op, i) => html`
                                        <option .selected="${this.state[study]?.operator === op || i === 0}">${op}</option>
                                    `)}
                                </select>
                            </div>
                            <div class="col-md-4" style="padding: 0px 10px">
                                <input type="text" class="form-control input-sm ${this._prefix}FilterTextInput"
                                data-study="${study}"
                                data-cohort="${cohort.id}"
                                data-action="value"
                                .value="${this.state[study]?.value ?? ""}"
                                @input="${this.filterChange}">
                            </div>
                            -->
                        </div>
                    `)}
                </div>
            </div>`)
            : html`
                <span>Project not found</span>
            `;
    }



}

customElements.define("cohort-stats-filter", CohortStatsFilter);
