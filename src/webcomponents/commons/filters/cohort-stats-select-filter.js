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

export default class CohortStatsSelectFilter extends LitElement {

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
            onlyCohortAll: {
                type: Boolean,
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
        this._selectedCohorts = new Map();
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this._selectedCohorts = new Map();
            // TODO: we would have to check if there is a study with a single cohort "ALL" and select it by default
            // this will also hide the dropdown to manually select cohorts
        }

        if (changedProperties.has("value")) {
            this.valueObserver();
        }

        super.update(changedProperties);
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            // Array.from(this._selectedCohorts.keys()).forEach(key => {
            //     const {operator, value} = this._selectedCohorts.get(key);
            //     
            // });
        }
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

    dispatchFilterChangeEvent() {
        const values = Array.from(this._selectedCohorts.keys()).map(key => {
            const {operator, value} = this._selectedCohorts.get(key);
            return `${key}${operator}${value}`;
        });
        LitUtils.dispatchCustomEvent(this, "filterChange", values.join(";"));
    }

    onSelectCohortInStudy(event, studyFqn, cohortId) {
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

    onChangeCohortOperator(event, studyFqn, cohortId) {
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

    onChangeCohortValue(event, studyFqn, cohortId) {
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
        const selectedCohorts = this.getSelectedCohortsInStudy(study);
        return html`
            <div class="">
                <div> Study <b>${study.id}</b> cohorts:</div>
                <div class="d-grid dropdown">
                    <button class="btn btn-light dropdown-toggle d-flex justify-content-between align-items-center" data-bs-toggle="dropdown">
                        <span>Selected ${selectedCohorts.size} cohort(s) of ${study.cohorts.length}</span>
                    </button>
                    <div class="dropdown-menu dropdown-menu-start">
                        <div class="d-flex flex-column gap-1 overflow-y-auto" style="max-height: 200px;">
                            ${study.cohorts.map(cohort => html`
                                <a class="dropdown-item cursor-pointer ${selectedCohorts.has(cohort.id) ? "active" : ""}" @click="${event => this.onSelectCohortInStudy(event, study.fqn, cohort.id)}">
                                    <span>${cohort.id}</span>
                                </a>
                            `)}
                        </div>
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
                                    <select class="form-select form-select-sm fs-6 w-full" @change="${event => this.onChangeCohortOperator(event, study.fqn, cohortId)}">
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
                                        @change="${event => this.onChangeCohortValue(event, study.fqn, cohortId)}"
                                    />
                                </div>
                                <div class="">
                                    <button class="btn btn-light d-flex align-items-center px-2" @click="${event => this.onSelectCohortInStudy(event, study.fqn, cohortId)}">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        `))}
                    </div>
                ` : nothing}
            </div>
        `;
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
        };
    }

}

customElements.define("cohort-stats-select-filter", CohortStatsSelectFilter);
