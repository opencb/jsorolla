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
        this._selectedCohorts = [];
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this._selectedCohorts = []; // reset selected cohorts list
        }

        super.update(changedProperties);
    }

    onFilterChange(e) {
        // LitUtils.dispatchCustomEvent(this, "filterChange", this._ct.join(","));
    }

    renderStudyCohorts(study) {
        return html`
            <div class="">
                <div> Study <b>${study.id}</b> cohorts:</div>
                <div class="d-grid dropdown">
                    <button class="btn btn-light dropdown-toggle d-flex justify-content-between align-items-center" data-bs-toggle="dropdown">
                        <span>Select cohorts</span>
                    </button>
                    <div class="dropdown-menu dropdown-menu-start">
                        ${study.cohorts.map(cohort => html`
                            <a class="dropdown-item cursor-pointer">
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
