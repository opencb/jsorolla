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

import {LitElement, html} from "lit";
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
        this._selectedCohortsByStudy = new Map();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this._selectedCohortsByStudy = new Map(); // reset selected cohorts list
            // TODO: we would have to check if there is a study with a single cohort "ALL" and select it by default
            // this will also hide the dropdown to manually select cohorts
        }

        super.update(changedProperties);
    }

    getSelectedCohortsInStudy(studyId) {
        if (this._selectedCohortsByStudy.has(studyId)) {
            return this._selectedCohortsByStudy.get(studyId);
        }
        // this study does not have any cohort selected yet
        return new Set();
    }

    onSelectCohortInStudy(event, studyId, cohortId) {
        event.preventDefault();
        event.stopPropagation();
        // ensure there is a Set for this studyId
        if (!this._selectedCohortsByStudy.has(studyId)) {
            this._selectedCohortsByStudy.set(studyId, new Set());
        }
        // toggle cohortId in the selected cohorts set for this study
        const selectedCohorts = this._selectedCohortsByStudy.get(studyId);
        if (selectedCohorts.has(cohortId)) {
            selectedCohorts.delete(cohortId);
        } else {
            selectedCohorts.add(cohortId);
        }
        // force updating the view
        this.requestUpdate();
    }

    onFilterChange(e) {
        // LitUtils.dispatchCustomEvent(this, "filterChange", this._ct.join(","));
    }

    renderStudyCohorts(study) {
        const selectedCohorts = this.getSelectedCohortsInStudy(study.id);
        return html`
            <div class="">
                <div> Study <b>${study.id}</b> cohorts:</div>
                <div class="d-grid dropdown">
                    <button class="btn btn-light dropdown-toggle d-flex justify-content-between align-items-center" data-bs-toggle="dropdown">
                        <span>Selected ${selectedCohorts.size} cohort(s) of ${study.cohorts.length}</span>
                    </button>
                    <div class="dropdown-menu dropdown-menu-start">
                        ${study.cohorts.map(cohort => html`
                            <a class="dropdown-item cursor-pointer ${selectedCohorts.has(cohort.id) ? "active" : ""}" @click="${event => this.onSelectCohortInStudy(event, study.id, cohort.id)}">
                                <span>${cohort.id}</span>
                            </a>
                        `)}
                    </div>
                </div>
            </div>
        `;
    }

    render() {
        return (this.studies || []).map(study => this.renderStudyCohorts(study));
    }

    getDefaultConfig() {
        return {};
    }

}

customElements.define("cohort-stats-select-filter", CohortStatsSelectFilter);
