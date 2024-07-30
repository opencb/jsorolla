/*
 * Copyright 2015-2024 OpenCB
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
import "../forms/number-field-filter.js";


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
        this.state = {};
        this.defaultComparator = "<";
    }

    connectedCallback() {
        super.connectedCallback();

        this.cohortsPerStudy = this.cohorts ? this.cohorts[this.opencgaSession.study.id] : null;
        this.state = {};
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("cohorts")) {
            this.state = {};
            this.cohortsPerStudy = this._getCohorts();
        }

        if (changedProperties.has("cohortStatsAlt")) {
            this.cohortStatsAltObserver();
        }
        super.update(changedProperties);
    }

    cohortStatsAltObserver() {
        this.state = {};
        if (this.cohortStatsAlt) {
            const cohorts = this.cohortStatsAlt.split(";");
            cohorts.forEach(cohortStat => {
                const splitFiled = cohortStat.split(":");
                let studyId, cohortFreq;
                if (splitFiled.length === 2) {
                    // No FQN is given
                    studyId = splitFiled[0];
                    cohortFreq = splitFiled[1];
                } else {
                    // Study is actually the FQN
                    studyId = splitFiled[0] + ":" + splitFiled[1];
                    cohortFreq = splitFiled[2];
                }
                if (!this.state[studyId]) {
                    this.state[studyId] = [];
                }
                const [cohort, comparator, value] = cohortFreq.split(/(<=?|>=?|=)/);
                this.state[studyId].push({cohort, comparator, value});
            });
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
            e.target.className = "fa fa-plus ps-1";
        } else {
            e.target.className = "fa fa-minus ps-1";
        }
    }

    getStudyIdFromFqn(fqn) {
        // replaces characters not valid in an DOM Element ID
        return fqn.split(":")[1]?.replace(/@|:/g, "_");
    }

    filterChange(e, study, cohort) {
        e.stopPropagation();

        // e.detail.value is not defined iff you are changing the comparator and a value hasn't been set yet
        const index = this.state[study]?.findIndex(c => c.cohort === cohort);
        if (e?.detail?.value) {
            if (index >= 0) {
                this.state[study][index].comparator = e.detail.comparator;
                this.state[study][index].value = e.detail.numValue;
            } else {
                if (!this.state[study]) {
                    this.state[study] = [];
                }
                this.state[study].push({cohort: cohort, comparator: e.detail.comparator, value: e.detail.numValue});
            }
        } else {
            if (index >= 0) {
                this.state[study].splice(index, 1);
            }

            // If not cohort are left then we remove everything?
            if (this.state[study]?.length === 0) {
                delete this.state[study];
            }
        }

        // serialize this.state in the form of "PROJECT_ID:STUDY_ID:COHORT_ID<VALUE;.."
        const value = Object.entries(this.state)
            .map(([studyId, cohorts]) => {
                return cohorts.map(c => `${studyId}:${c.cohort}${c.comparator}${c.value}`).join(";");
            })
            .join(";");
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
            ${this.cohortsPerStudy.map(study => html`
                    <div class="mb-2">
                        <i class="fa fa-plus ps-1" id="${this._prefix}${this.getStudyIdFromFqn(study.fqn)}Icon" data-id="${this._prefix}${this.getStudyIdFromFqn(study.fqn)}"
                            data-cy="study-cohort-toggle" style="cursor: pointer;"
                            @click="${this.handleCollapseAction}">
                        </i>
                        <span class="text-break">Study <strong>${this.getStudyIdFromFqn(study.fqn)}</strong> cohorts</span>
                    </div>

                    <div class="row g-2" id="${this._prefix}${this.getStudyIdFromFqn(study.fqn)}" hidden>
                        ${study.cohorts.map(cohort => {
                            const stateCohort = this.state?.[study.fqn]?.find(c => c.cohort === cohort.id);
                            return html`
                                    <number-field-filter
                                        .value="${stateCohort?.value ?
                                            (stateCohort?.comparator ?? this.defaultComparator) + (stateCohort.value ?? "") :
                                            ""}"
                                        .config="${{comparator: true, layout: [3, 4, 5]}}"
                                        .label="${cohort.id}"
                                        type="text"
                                        data-study="${study.id}"
                                        data-cohort="${cohort.id}"
                                        data-action="comparator"
                                        @filterChange="${e => this.filterChange(e, study.fqn, cohort.id)}">
                                    </number-field-filter>
                                `;
                        })}
                    </div>
            `)}`;
    }

}

customElements.define("cohort-stats-filter", CohortStatsFilter);
