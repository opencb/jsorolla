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
import "../forms/select-field-filter.js";

// DEPRECATED : Use date-picker
export default class DateFilter extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            filterDate: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "odf-" + UtilsNew.randomString(6) + "_";
        this._config = this.getDefaultConfig();

        this.activeTab = "all";
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.years = UtilsNew.range(new Date().getFullYear() - 5, new Date().getFullYear() + 1); // years select
        this.months = moment.monthsShort().map((m, i) => ({id: `${i + 1}`.padStart(2, 0), name: m})); // months select (moment.months() for long names)

        this.initState();

        this.date = "";

    }

    updated(changedProperties) {
        if (changedProperties.has("filterDate")) {
            this.filterDateObserver();
        }
        if (changedProperties.has("config")) {
            this.configObserver();
        }
    }

    configObserver() {

    }

    filterDateObserver() {
        if (this.filterDate) {
            const recent = this.filterDate.match(/(>=)(\d{4})(\d{2})(\d{2})/);
            const [range, y1, m1, d1, y2, m2, d2] = this.filterDate.match(/(\d{4})?(\d{2})?(\d{2})?-?(\d{4})?(\d{2})?(\d{2})?/);
            if (recent) {
                this.activeTab = "recent";
                const [,, y, m, d] = recent;
                const now = moment();
                const filterDate = moment([y, m - 1, d]);
                this.selectedRecentDays = now.diff(filterDate, "days");
            }

            if (y2 || m2 || d2) {
                // range date
                this.activeTab = "range";
                this.selectedPeriod = {
                    start: {
                        year: y1,
                        month: m1,
                        day: d1
                    },
                    end: {
                        year: y2,
                        month: m2,
                        day: d2
                    }
                };

            } else if (y1 || m1 || d1) {
                // simple date
                this.activeTab = "date";
                this.selectedDate = {
                    year: y1,
                    month: m1,
                    day: d1
                };
            }
            this.requestUpdate();

        } else {
            this.initState();
            this.requestUpdate();
        }
    }

    initState() {
        this.activeTab = "all";
        this.selectedRecentDays = this._config.recentDays; // default value of Recent select
        this.selectedDate = {
            year: new Date().getFullYear()
        };
        this.selectedPeriod = {
            start: {
                year: new Date().getFullYear()
            },
            end: {
                year: new Date().getFullYear()
            }
        };
    }

    onFilterChange(e) {
        e.stopPropagation();
        // click of tab buttons
        if (e.target?.dataset?.tab) {
            this.activeTab = e.target.value;
        }

        this.date = null;

        if (this.activeTab === "all") {
            // this.date = null;
        }

        if (this.activeTab === "recent") {
            if (e.target?.dataset?.type === "recent") {
                this.selectedRecentDays = e.target.value;
            }
            this.date = ">=" + moment().subtract(this.selectedRecentDays, "days").format("YYYYMMDD");
        }

        if (this.activeTab === "date") {
            if (e.target?.dataset?.type === "date") {
                const field = e.target.dataset.field;
                this.selectedDate[field] = e.detail.value;
            }
            if (this.selectedDate.year) {
                this.date = `${this.selectedDate.year}${this.selectedDate.month ?? ""}${this.selectedDate.day ?? ""}`;
            }
        }

        if (this.activeTab === "range") {
            if (e.target?.dataset?.type === "range") {
                const {endpoint, field} = e.target.dataset;
                this.selectedPeriod[endpoint][field] = e.detail.value ?? "";
            }
            if (this.selectedPeriod.start.year) {
                this.date = `${this.selectedPeriod.start.year}${this.selectedPeriod.start.month ? `${this.selectedPeriod.start.month}${this.selectedPeriod.start.day ?? ""}` : ""}-` +
                    `${this.selectedPeriod.end.year}${this.selectedPeriod.end.month ? `${this.selectedPeriod.end.month}${this.selectedPeriod.end.day ?? ""}` : ""}`;
            }

        }
        this.requestUpdate();
        const event = new CustomEvent("filterChange", {
            detail: {
                value: this.date
            }
        });
        this.dispatchEvent(event);
    }

    daysInMonth(y, m) {
        if (y && m) {
            const d = moment([y, m - 1]).daysInMonth();
            return UtilsNew.range(1, d + 1).map(d => `${d}`.padStart(2, 0));
        } else {
            return [];
        }
    }

    getDefaultConfig() {
        return {
            minYear: 2000,
            recentDays: 10
        };
    }

    render() {
        return html`
        <div class="mb-3">
            <form id="${this._prefix}DateRadioButton">
                <fieldset class="d-grid my-1 mx-0">
                    <div class="btn-group" role="group">
                        <input class="${this._prefix}FilterRadio btn-check" id="${this._prefix}allRadio"
                            type="radio" data-tab="all" name="selectionButtons" value="all" .checked="${this.activeTab === "all"}" @change="${this.onFilterChange}">
                        <label class="btn btn-outline-primary" for="${this._prefix}allRadio">
                            <span class="${this._prefix}-text">All</span>
                        </label>

                        <input class="${this._prefix}FilterRadio btn-check"  id="${this._prefix}recentlyRadio"
                            type="radio" data-tab="recent" name="selectionButtons" value="recent" .checked="${this.activeTab === "recent"}" @change="${this.onFilterChange}">
                        <label class="btn btn-outline-primary" for="${this._prefix}recentlyRadio">
                            <span class="${this._prefix}-text">Recent</span>
                        </label>

                        <input class="${this._prefix}FilterRadio btn-check" id="${this._prefix}dateRadio"
                            type="radio" data-tab="date" name="selectionButtons" value="date" .checked="${this.activeTab === "date"}" @change="${this.onFilterChange}">
                        <label class="btn btn-outline-primary" for="${this._prefix}dateRadio">
                            <span class="${this._prefix}-text">Date</span>
                        </label>

                        <input class="${this._prefix}FilterRadio btn-check" id="${this._prefix}rangesRadio"
                            type="radio" data-tab="range" name="selectionButtons" value="range" .checked="${this.activeTab === "range"}" @change="${this.onFilterChange}">
                        <label class="btn btn-outline-primary" for="${this._prefix}rangesRadio">
                            <span class="${this._prefix}-text">Range</span>
                        </label>
                    </div>
                </fieldset>

                <div>
                    ${this.activeTab === "recent" ? html`
                        <div class="row g-1 justify-content-center align-items-center" data-cy="date-recent">
                            <div class="col-auto">
                                <label for="lastday1" class="col-form-label fw-bold">Last</label>
                            </div>
                            <div class="col-auto">
                                <input class="form-control" data-type="recent" id="lastday1"
                                    type="number" min="1" max="100" .value=${this.selectedRecentDays} @change="${e => this.onFilterChange(e)}">
                            </div>
                            <div class="col-auto">
                                <span for="lastday1" class="col-form-label fw-bold">day(s)</span>
                            </div>
                        </div>
                    ` : null}

                    ${this.activeTab === "date" ? html`
                        <div data-cy="date-single">
                            <form class="row">
                                <div class="col-md-4">
                                    <select-field-filter
                                        data-type="date"
                                        data-field="year"
                                        .data="${this.years}"
                                        .value=${this.selectedDate.year}
                                        @filterChange="${e => this.onFilterChange(e)}">
                                    </select-field-filter>
                                </div>
                                <div class="col-md-4">
                                    <select-field-filter
                                        data-type="date"
                                        data-field="month"
                                        .data="${this.months}"
                                        .value=${this.selectedDate.month}
                                        @filterChange="${e => this.onFilterChange(e)}">
                                    </select-field-filter>
                                </div>
                                <div class="col-md-4">
                                    <select-field-filter
                                        data-type="date" data-field="day"
                                        .data="${this.daysInMonth(this.selectedDate.year, this.selectedDate.month)}"
                                        .value=${this.selectedDate.day}
                                        @filterChange="${e => this.onFilterChange(e)}">
                                    </select-field-filter>
                                </div>
                            </form>
                        </div>
                    ` : null}

                    ${this.activeTab === "range" ? html`
                        <div data-cy="date-range">
                            <div class="range-box">
                                <form class="row">
                                    <label class="${this._prefix}-text fw-bold">Begin period</label>
                                    <div class="col-md-4">
                                        <select-field-filter
                                            data-type="range"
                                            data-endpoint="start"
                                            data-field="year"
                                            .data="${this.years}"
                                            .value=${this.selectedPeriod.start.year}
                                            @filterChange="${e => this.onFilterChange(e)}">
                                        </select-field-filter>
                                    </div>
                                    <div class="col-md-4">
                                        <select-field-filter
                                            data-type="range"
                                            data-endpoint="start" data-field="month"
                                            .data="${this.months}"
                                            .value=${this.selectedPeriod.start.month}
                                            @filterChange="${e => this.onFilterChange(e)}">
                                        </select-field-filter>
                                    </div>
                                    <div class="col-md-4">
                                        <select-field-filter
                                            data-type="range"
                                            data-endpoint="start"
                                            data-field="day"
                                            .data="${this.daysInMonth(this.selectedPeriod.start.year, this.selectedPeriod.start.month)}"
                                            .value=${this.selectedPeriod.start.day}
                                            @filterChange="${e => this.onFilterChange(e)}">
                                        </select-field-filter>
                                    </div>
                                </form>
                            </div>
                            <div class="range-box">
                                <form class="row">
                                    <label class="${this._prefix}-text fw-bold">End period</label>
                                    <div class="col-md-4">
                                        <select-field-filter
                                            data-type="range"
                                            data-endpoint="end"
                                            data-field="year"
                                            .data="${this.years}"
                                            .value=${this.selectedPeriod.end.year}
                                            @filterChange="${e => this.onFilterChange(e)}">
                                        </select-field-filter>
                                    </div>
                                    <div class="col-md-4">
                                        <select-field-filter
                                            data-type="range"
                                            data-endpoint="end"
                                            data-field="month"
                                            .data="${this.months}"
                                            .value=${this.selectedPeriod.end.month}
                                            @filterChange="${e => this.onFilterChange(e)}">
                                        </select-field-filter>
                                    </div>
                                    <div class="col-md-4">
                                        <select-field-filter
                                            data-type="range"
                                            data-endpoint="end"
                                            data-field="day"
                                            .data="${this.daysInMonth(this.selectedPeriod.end.year, this.selectedPeriod.end.month)}"
                                            .value=${this.selectedPeriod.end.day}
                                            @filterChange="${e => this.onFilterChange(e)}">
                                        </select-field-filter>
                                    </div>
                                </form>
                            </div>
                        </div>` : null}
                    </div>
            </form>
        </div>`;
    }

}

customElements.define("date-filter", DateFilter);
