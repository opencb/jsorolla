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
import UtilsNew from "../../../core/utilsNew.js";


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
                type: Array
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
        this._prefix = UtilsNew.randomString(8);

        this.defaultComparator = "<";
    }

    connectedCallback() {
        super.connectedCallback();

        this.cohortsPerStudy = this.cohorts ? this.cohorts[this.opencgaSession.study.id] : null;
        this.state = {};
    }

    updated(_changedProperties) {
        if (_changedProperties.has("opencgaSession") || _changedProperties.has("cohorts")) {
            this.state = {};
            this.cohortsPerStudy = this._getCohorts();
            this.requestUpdate();
        }

        if (_changedProperties.has("cohortStatsAlt")) {
            this.state = {};
            if (this.cohortStatsAlt) {
                const cohorts = this.cohortStatsAlt.split(";");
                cohorts.forEach(cohortStat => {
                    const [studyId, cohortFreq] = cohortStat.split(":");
                    console.log(studyId, cohortFreq);
                    const [cohort, comparator, value] = cohortFreq.split(/(<=?|>=?|=)/);
                    this.state[studyId] = {cohort, comparator, value};
                });
            }
            this.requestUpdate();
        }
    }

    _getCohorts() {
        let studiesAndCohorts = [];
        if (this.opencgaSession?.project?.studies) { //  && this.onlyCohortAll
            for (const study of this.opencgaSession.project.studies) {
                if (study.cohorts?.length) {
                    if (this.onlyCohortAll) {
                        studiesAndCohorts.push({
                            ...study,
                            cohorts: [{id: "ALL"}]
                        });
                    } else {
                        studiesAndCohorts = this.cohorts;
                    }
                }
            }
        }
        return studiesAndCohorts;
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

    getStudyIdFromFqn(fqn) {
        // replaces characters not valid in an DOM Element ID
        return fqn.split(":")[1]?.replace(/@|:/g, "_");
    }

    filterChange(e, study, cohort) {
        // e.detail.value is not defined iff you are changing the comparator and a value hasn't been set yet
        if (e?.detail?.value) {
            e.stopPropagation();
            this.state[study] = {cohort: cohort, comparator: e.detail.comparator, value: e.detail.numValue};
        } else {
            delete this.state[study];
        }
        // serialize this.state in the forms of "STUDY_ID:COHORT_ID<VALUE;.."
        const value = Object.entries(this.state).filter(([, v]) => v.value).map(([studyId, v]) => `${studyId}:${v.cohort}${v.comparator}${v.value}`).join(";");
        const event = new CustomEvent("filterChange", {
            detail: {
                value: value
            }
        });
        this.dispatchEvent(event);
    }

    render() {
        if (!this.cohortsPerStudy?.length) {
            return html`<span>Cohort Variants Stats not available.</span>`;
        }

        return html`
            ${this.cohortsPerStudy
            .map(study => html`
                <div style="padding: 5px 0px">
                    <div style="padding-bottom: 5px">
                        <i id="${this._prefix}${this.getStudyIdFromFqn(study.fqn)}Icon" data-id="${this._prefix}${this.getStudyIdFromFqn(study.fqn)}"
                           data-cy="study-cohort-toggle" class="fa fa-plus" style="cursor: pointer;padding-right: 10px"
                           @click="${this.handleCollapseAction}"></i>
                        <span class="break-word">Study <strong>${this.getStudyIdFromFqn(study.fqn)}</strong> cohorts</span>
                    </div>

                    <div class="form-horizontal" id="${this._prefix}${this.getStudyIdFromFqn(study.fqn)}" hidden>
                        ${study.cohorts
                                .map(cohort => html`
                                    <div class="form-group" style="margin: 5px 0px">
                                        <number-field-filter
                                                .value="${this.state?.[study.id]?.value ?
                                                        (this.state?.[study.id]?.comparator ?? this.defaultComparator) + (this.state?.[study.id]?.value ?? "") :
                                                        ""}"
                                                .config="${{comparator: true, layout: [4, 3, 5]}}"
                                                .label="${cohort.id}"
                                                type="text"
                                                data-study="${study.id}"
                                                data-cohort="${cohort.id}"
                                                data-action="comparator"
                                                @filterChange="${e => this.filterChange(e, study.id, cohort.id)}">
                                        </number-field-filter>
                                    </div>
                                `)
                        }
                    </div>
                </div>
            `)}`;
    }

}

customElements.define("cohort-stats-filter", CohortStatsFilter);
