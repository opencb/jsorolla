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

import {LitElement, html, nothing} from "lit";
import {keyed} from "lit/directives/keyed.js";
import LitUtils from "../utils/lit-utils.js";

export default class CohortStatsFilter extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            studies: {
                type: Array,
            },
            value: {
                type: String,
            },
            opencgaSession: {
                type: Object,
            },
            config: {
                type: Object,
            },
        };
    }

    #init() {
        this._expandedStudies = new Set();
        this._selectedCohorts = new Map();
        this._searchedCohorts = new Map();
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this._expandedStudies = new Set();
            this._searchedCohorts = new Map();
            // TODO: we would have to check if there is a study with a single cohort "ALL" and select it by default
            // this will also hide the dropdown to manually select cohorts
        }

        if (changedProperties.has("value")) {
            this.valueObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }

        super.update(changedProperties);
    }

    valueObserver() {
        this._selectedCohorts = new Map();

        if (this.value) {
            this.value.split(";").forEach(cohortStat => {
                // Note: we assume that the cohortStat string has the following structure 'org@project:study:cohortId[operator]Value'
                const items = cohortStat.trim().split(":");
                const studyFqn = [items[0], items[1]].join(":");
                const [cohortId, operator, value] = items[2].split(/(<=?|>=?|=)/);
                if (studyFqn && cohortId && operator) {
                    this._selectedCohorts.set(studyFqn + ":" + cohortId, {
                        operator: operator,
                        value: value || "",
                    });
                }
            });
        }
    }

    getSelectedCohortsInStudy(study) {
        const selectedCohorts = new Set();
        (study.cohorts || []).forEach(cohort => {
            if (this._selectedCohorts.has(study.fqn + ":" + cohort.id)) {
                selectedCohorts.add(cohort.id);
            }
        });
        return selectedCohorts;
    }

    getVisibleCohorts(study) {
        if (this._searchedCohorts.has(study.fqn)) {
            const value = this._searchedCohorts.get(study.fqn).toLowerCase();
            return (study.cohorts || []).filter(cohort => {
                return cohort.id.toLowerCase().includes(value);
            });
        }
        return study.cohorts || [];
    }

    getFavouriteCohorts(study) {
        if (this._config.favourites?.length > 0) {
            return (study.cohorts || [])
                .filter(cohort => {
                    return this._config.favourites.some(tagName => {
                        return (cohort?.tags || []).includes(tagName);
                    });
                })
                .map(cohort => cohort.id);
        }
        return [];
    }

    dispatchFilterChangeEvent() {
        const values = Array.from(this._selectedCohorts.keys()).map(key => {
            const {operator, value} = this._selectedCohorts.get(key);
            return `${key}${operator}${value}`;
        });
        LitUtils.dispatchCustomEvent(this, "filterChange", values.join(";"));
    }

    onStudyToggle(event, studyFqn) {
        event.preventDefault();
        if (this._expandedStudies.has(studyFqn)) {
            this._expandedStudies.delete(studyFqn);
        } else {
            this._expandedStudies.add(studyFqn);
        }
        this.requestUpdate();
    }

    onCohortSelect(event, studyFqn, cohortId) {
        event.preventDefault();
        event.stopPropagation();

        // check if this cohort is already selected
        const key = studyFqn + ":" + cohortId;
        if (this._selectedCohorts.has(key)) {
            this._selectedCohorts.delete(key);
        } else {
            this._selectedCohorts.set(key, {
                operator: this._config.defaultOperatorOnSelect,
                value: this._config.defaultValueOnSelect,
            });
        }

        // update the value property
        this.dispatchFilterChangeEvent();
    }
    
    onCohortSearch(event, studyFqn) {
        this._searchedCohorts.set(studyFqn, event.target.value || "");
        this.requestUpdate();
    }

    onCohortSearchClear(event, studyFqn) {
        event.preventDefault();
        event.stopPropagation();
        this._searchedCohorts.delete(studyFqn);
        event.currentTarget.closest(".input-group").querySelector(`[data-role="cohort:search"]`).value = "";
        this.requestUpdate();
    }

    onCohortOperatorChange(event, studyFqn, cohortId) {
        event.preventDefault();
        const operator = event.target.value || "";
        if (this._selectedCohorts.has(studyFqn + ":" + cohortId)) {
            if (operator && operator !== this._selectedCohorts.get(studyFqn + ":" + cohortId).operator) {
                this._selectedCohorts.set(studyFqn + ":" + cohortId, {
                    operator: operator,
                    value: this._selectedCohorts.get(studyFqn + ":" + cohortId).value,
                });
                this.dispatchFilterChangeEvent();
            }
        }
    }

    onCohortValueChange(event, studyFqn, cohortId) {
        event.preventDefault();
        const value = event.target.value || "";
        if (this._selectedCohorts.has(studyFqn + ":" + cohortId)) {
            if (value !== this._selectedCohorts.get(studyFqn + ":" + cohortId).value) {
                this._selectedCohorts.set(studyFqn + ":" + cohortId, {
                    operator: this._selectedCohorts.get(studyFqn + ":" + cohortId).operator,
                    value: value,
                });
                this.dispatchFilterChangeEvent();
            }
        }
    }

    renderStudyCohorts(study) {
        const isExpanded = this._expandedStudies.has(study.fqn);
        const selectedCohorts = this.getSelectedCohortsInStudy(study);
        const visibleCohorts = this.getVisibleCohorts(study);
        const favouriteCohorts = this.getFavouriteCohorts(study);

        return keyed("cohort:" + study.fqn, html`
            <div class="p-2 border border-gray-200 rounded-3">
                <div class="cursor-pointer d-flex align-items-center gap-2 user-select-none" @click="${event => this.onStudyToggle(event, study.fqn)}">
                    <div class="flex-shrink-0 d-flex align-items-center justify-content-center" style="width:12px;height:13px;">
                        <i class="fas fa-chevron-${isExpanded ? "down" : "right"}"></i>
                    </div>
                    <div class="fs-6 d-flex align-items-center">
                        <span>Study <b>${study.id}</b> (${(study.cohorts).length})</span>
                    </div>
                </div>
                <div class="${isExpanded ? "d-block mt-1" : "d-none"}">
                    ${favouriteCohorts.length > 0 ? html`
                        <div class="mb-2">
                            <div class="fw-bold">Favourite cohorts</div>
                            <div class="d-flex flex-wrap gap-1">
                                ${favouriteCohorts.map(cohortId => html`
                                    <div class="py-1 px-2 border border-gray-200 rounded cursor-pointer d-flex align-items-center gap-2" @click="${event => this.onCohortSelect(event, study.fqn, cohortId)}">
                                        <div class="fw-bold lh-1">${cohortId}</div>
                                        <div class="d-inline-flex border border-gray-200 fs-8 p-1 rounded ${selectedCohorts.has(cohortId) ? "bg-primary" : "bg-gray-100"}">
                                            <i class="fas fa-check ${selectedCohorts.has(cohortId) ? "text-white" : "opacity-0"}"></i>
                                        </div>
                                    </div>
                                `)}
                            </div>
                        </div>
                    ` : nothing}
                    <div class="d-grid dropdown">
                        <button class="btn btn-light dropdown-toggle d-flex justify-content-between align-items-center" data-bs-toggle="dropdown">
                            <span>Selected ${selectedCohorts.size} cohort(s) of ${study.cohorts.length}</span>
                        </button>
                        <div class="dropdown-menu dropdown-menu-start">
                            <div class="mb-2">
                                <div class="input-group">
                                    <input
                                        data-role="cohort:search"
                                        type="text"
                                        class="form-control w-full border-end-0"
                                        placeholder="Search cohort..."
                                        @input="${event => this.onCohortSearch(event, study.fqn)}"
                                    />
                                    <button class="input-group-text bg-white cursor-pointer" @click="${event => this.onCohortSearchClear(event, study.fqn)}" title="Clear">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="d-flex flex-column gap-1 overflow-y-auto" style="max-height: 200px;">
                                ${visibleCohorts.map(cohort => html`
                                    <a class="dropdown-item cursor-pointer ${selectedCohorts.has(cohort.id) ? "active" : ""}" @click="${event => this.onCohortSelect(event, study.fqn, cohort.id)}">
                                        <div>${cohort.id}</div>
                                        <div class="small text-truncate opacity-50" title="${cohort.description || ""}">${cohort.description || ""}</div>
                                        <div class="d-flex align-items-center gap-2">
                                            <div class="small opacity-50"><b>${cohort?.numSamples ?? 0}</b> samples</div>
                                            <div class="small opacity-50">Status: <b>${cohort?.internal?.status?.name || cohort?.internal?.status?.id || "NONE"}</b></div>
                                        </div>
                                    </a>
                                `)}
                            </div>
                            ${(visibleCohorts.length === 0 && this._searchedCohorts.has(study.fqn)) ? html`
                                <div class="text-center text-muted p-4 text-wrap">
                                    <span class="small">No cohorts found matching <b>${this._searchedCohorts.get(study.fqn)}</b>.</span>
                                </div>
                            ` : nothing}
                        </div>
                    </div>
                    ${Array.from(selectedCohorts).length > 0 ? html`
                        <div class="d-flex flex-column gap-2 mt-2">
                            ${Array.from(selectedCohorts).map(cohortId => keyed(study.id + ":" + cohortId, html`
                                <div class="d-flex align-items-center justify-content-between gap-2 p-2 border border-gray-200 rounded">
                                    <div class="flex-shrink-0 pe-1 text-truncate" style="width:72px;" title="${cohortId}">
                                        <span class="fw-bold">${cohortId}</span>
                                    </div>
                                    <div class="flex-shrink-0">
                                        <select class="form-select form-select-sm fs-6 w-full" @change="${event => this.onCohortOperatorChange(event, study.fqn, cohortId)}">
                                            ${this._config.operators.map(operator => html`
                                                <option value="${operator.value}" selected="${this._selectedCohorts.get(study.fqn + ":" + cohortId)?.operator === operator.value ? "selected" : nothing}">
                                                    ${operator.value}
                                                </option>
                                            `)}
                                        </select>
                                    </div>
                                    <div class="w-full">
                                        <input
                                            type="number"
                                            class="form-control form-control-sm fs-6 w-full"
                                            value="${this._selectedCohorts.get(study.fqn + ":" + cohortId)?.value || "0"}"
                                            @change="${event => this.onCohortValueChange(event, study.fqn, cohortId)}"
                                        />
                                    </div>
                                    <div class="">
                                        <button class="btn btn-light d-flex align-items-center px-2" @click="${event => this.onCohortSelect(event, study.fqn, cohortId)}">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                </div>
                            `))}
                        </div>
                    ` : nothing}
                </div>
            </div>
        `);
    }

    render() {
        return html`
            <div class="d-flex flex-column gap-3">
                ${(this.studies || []).map(study => this.renderStudyCohorts(study))}
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            operators: [
                { value: "<" },
                { value: "<=" },
                { value: "=" },
                { value: ">" },
                { value: ">=" },
            ],
            defaultOperatorOnSelect: ">",
            defaultValueOnSelect: "0",
            favourites: [],
        };
    }

}

customElements.define("cohort-stats-filter", CohortStatsFilter);
