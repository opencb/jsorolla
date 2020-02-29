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
import Utils from "./../../../utils.js";
import UtilsNew from "./../../../utilsNew.js";
import PolymerUtils from "../../PolymerUtils.js";

//TODO refactor needed both in UI and code (UI done)
//FIXME ::critical:: changes from active-filter are not handled at the moment

export default class OpencgaDateFilter extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "odf-" + Utils.randomString(6) + "_";
        this._config = this.getDefaultConfig();

        this.activatedRanges = false;
        this.activatedDate = false;
        this.activatedRecent = false;
    }

    updated(changedProperties) {
        if (changedProperties.has("config")) {
            this.configObserver();
        }
    }

    configObserver() {
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    firstUpdated(_changedProperties) {

        const _years = [];
        const fullDate = new Date();
        const limitYear = fullDate.getFullYear();
        for (let year = this._config.minYear; year <= limitYear; year++) {
            _years.push(year);
        }
        // This change triggers the polymer dom-repeat
        this.years = _years;

        // Init arrays for Date selector
        const _yearsToSearch = [];
        for (let year = limitYear, i = 0; i < 5; year--, i++) {
            _yearsToSearch.push(year);
        }
        this.yearsToSearch = _yearsToSearch;

        this.monthToSearch = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const _days = [];
        for (let i = 1; i <= 31; i++) {
            _days.push(i);
        }
        this.daysToSearch = _days;

        if (UtilsNew.isNotEmpty(this._config.inputClass)) {
            $(`.${this._prefix}-codeDis`, this).addClass(this._config.inputClass);
            $(`.${this._prefix}-text`, this).addClass(this._config.class);
        }
    }

    async calculateFilters(e) {
        console.log("calculateFilters",e)
        const dateOption = $(`#${this._prefix}DateRadioButton input[type='radio']:checked`).val();
        console.log("dateOption",dateOption)
        //console.log("DATE OPT", $(`#${this._prefix}DateRadioButton input[type='radio']:checked`).val())
        //const dateOption = e.target.value;

        let date = "";
        switch (dateOption) {
            case "recently":
                this.activatedRanges = false;
                this.activatedDate = false;
                this.activatedRecent = true;
                await this.requestUpdate();
                // Last x days
                const da = new Date();
                da.setDate(da.getDate() - this.querySelector(`#${this._prefix}RecentSelect`).value);
                // If the month and day have one digit we add 0 before
                let m = da.getMonth() + 1;
                if (m < 10) {
                    m = "0" + m;
                }
                let d = da.getDate();
                if (d < 10) {
                    d = "0" + d;
                }

                date = `>=${da.getFullYear()}${m}${d}`;
                break;
            case "date":
                this.activatedRanges = false;
                this.activatedDate = true;
                this.activatedRecent = false;
                await this.requestUpdate();
                date = this._getDateFilter();
                break;
            case "range":
                this.activatedRanges = true;
                this.activatedDate = false;
                this.activatedRecent = false;
                await this.requestUpdate();
                date = this._getRangeFilter();
                break;
            case "all":
            default:
                this.activatedRanges = false;
                this.activatedDate = false;
                this.activatedRecent = false;
                await this.requestUpdate();
                break;
        }
        $(".bootstrap-select", this).selectpicker();
        this.dispatchEvent(new CustomEvent("filterChange", {detail: {value: date}}));
    }

    _getDateFilter() {
        const year = PolymerUtils.getElementById(this._prefix + "YearSelect").value;
        let month = PolymerUtils.getElementById(this._prefix + "MonthSelect").value;
        let day = PolymerUtils.getElementById(this._prefix + "DaySelect").value;
        if (month === "any") {
            month = "";
            day = "";
        } else {
            const monthIndex = this.monthToSearch.indexOf(month) + 1;
            month = monthIndex < 10 ? `0${monthIndex}` : monthIndex; // TODO use padStart

            if (day === "any") {
                day = "";
            } else if (day < 10) {
                day = `0${day}`;
            }
        }

        return `${year}${month}${day}`;
    }

    _getRangeFilter() {
        const from = this._getFromDate();
        const to = this._getToDate();

        if (to > from) {
            return `${from}-${to}`;
        }
        return "";
    }

    _getFromDate() {
        const year = PolymerUtils.getElementById(this._prefix + "YearSelectFrom").value;
        let month = PolymerUtils.getElementById(this._prefix + "MonthSelectFrom").value;
        let day = PolymerUtils.getElementById(this._prefix + "DaySelectFrom").value;
        if (month === "any") {
            month = "01";
        } else {
            const monthIndex = this.monthToSearch.indexOf(month) + 1;
            month = monthIndex < 10 ? `0${monthIndex}` : monthIndex;
        }
        if (day === "any") {
            day = "01";
        } else if (day < 10) {
            day = `0${day}`;
        }
        return `${year}${month}${day}`;
    }

    _getToDate() {
        const year = PolymerUtils.getElementById(this._prefix + "YearSelectTo").value;
        let month = PolymerUtils.getElementById(this._prefix + "MonthSelectTo").value;
        let day = PolymerUtils.getElementById(this._prefix + "DaySelectTo").value;
        if (month === "any") {
            month = "12";
        } else {
            const monthIndex = this.monthToSearch.indexOf(month) + 1;
            month = monthIndex < 10 ? `0${monthIndex}` : monthIndex;
        }
        if (day === "any") {
            day = ["01", "03", "05", "07", "08", "10", "12"].indexOf(month) !== -1 ? "31" : (month === "02" ? "28" : "30");
        } else if (day < 10) {
            day = `0${day}`;
        }
        return `${year}${month}${day}`;
        //     let monthIndex = this.monthToSearch.indexOf(month) + 1;
        //     if (monthIndex < 10) {
        //         monthIndex = "0" + monthIndex;
        //     }
        //     if (day === "any") {
        //         date = "~^" + year + monthIndex + "*";
        //     } else {
        //         if (day < 10) {
        //             day = "0" + day;
        //         }
        //         date = "~^" + year + monthIndex + day + "*";
        //     }
        // }
        // return date;
    }

    checkYears(e) {
        e.preventDefault(); // prevents the hash change to "#" and allows to manipulate the hash fragment as needed
        PolymerUtils.innerHTML(this._prefix + "_errorDiv_birthYear", "");
        PolymerUtils.innerHTML(this._prefix + "_errorDiv_testYear", "");
        let currentElement = PolymerUtils.getElementById(e.target.id);
        const identifier = e.target.id;
        let pairElement = "";
        let divSuffix = "";
        let message = "";
        if (identifier.search("birthYear") !== -1) { // Birth year element raises the event -> check Test year
            pairElement = PolymerUtils.getElementById(this._prefix + "testYear");
            divSuffix = "birthYear";
            message = "Year of Birth must be prior to year of Test";
        } else { // Year of test element raises the event -> swap elements and check the birth year
            currentElement = PolymerUtils.getElementById(this._prefix + "birthYear");
            pairElement = PolymerUtils.getElementById(e.target.id);
            divSuffix = "testYear";
            message = "Year of Test must be posterior to year of Birth";
        }

        if (PolymerUtils.querySelectorAll("option:selected", pairElement) !== "" &&
            (parseInt(PolymerUtils.querySelectorAll("option:selected", currentElement).textContent) > parseInt(PolymerUtils.querySelectorAll("option:selected", pairElement).textContent))) { // Year of birth cannot be lower than Year of test
            PolymerUtils.innerHTML(this._prefix + "_errorDiv_" + divSuffix, message);
        }
    }

    matchesRecentDaysConfig(day) {
        // Because the config might not have changed yet...
        this.configObserver();
        return day === this._config.recentDays;
    }

    /**
     * Use custom CSS class to easily reset all controls.
     */
    _clearHtmlDom() {
        // Input controls
        PolymerUtils.setPropertyByClassName(this._prefix + "FilterTextInput", "value", "");
        PolymerUtils.removeAttributebyclass(this._prefix + "FilterTextInput", "disabled");
        // Uncheck checkboxes
        PolymerUtils.setPropertyByClassName(this._prefix + "FilterCheckBox", "checked", false);
        // Set first option and make it active
        PolymerUtils.setAttributeByClassName(this._prefix + "FilterSelect", "selectedIndex", 0);
        PolymerUtils.removeAttributebyclass(this._prefix + "FilterSelect", "disabled");
        PolymerUtils.setPropertyByClassName(this._prefix + "FilterRadio", "checked", false);
        PolymerUtils.setAttributeByClassName(this._prefix + "FilterRadio", "disabled", true);

        $("." + this._prefix + "FilterRadio").filter("[value=\"or\"]").prop("checked", true);
    }

    getDefaultConfig() {
        return {
            minYear: 1920,
            recentDays: 7,
            inputClass: "input-sm",
            class: "small"
        };
    }

    render() {
        return html`
        <style include="jso-styles">
            .range-box:nth-child(2) {
                margin-top: 20px;
            }
        </style>

        <div class="form-group">
            <form id="${this._prefix}DateRadioButton">
            <fieldset>
                <div class="switch-toggle text-white alert alert-light">
                    <input type="radio" name="selectionButtons" id="allRadio" value="all" class="${this._prefix}FilterRadio" checked @change="${this.calculateFilters}">
                    <label for="allRadio" ><span class="${this._prefix}-text">All</span></label>
                
                    <input type="radio" name="selectionButtons" id="recentlyRadio" value="recently" class="${this._prefix}FilterRadio" @change="${this.calculateFilters}">
                    <label for="recentlyRadio" ><span class="${this._prefix}-text">Recent</span></label>
                
                    <input type="radio" name="selectionButtons" id="dateRadio" value="date" class="${this._prefix}FilterRadio" @change="${this.calculateFilters}">
                    <label for="dateRadio" ><span class="${this._prefix}-text">Date</span></label>
                
                    <input type="radio" name="selectionButtons" id="rangesRadio" value="range" class="${this._prefix}FilterRadio" @change="${this.calculateFilters}">
                    <label for="rangesRadio" ><span class="${this._prefix}-text">Range</span></label>
                    
                    
                    <a class="btn btn-primary ripple btn-small"></a>
                </div>
            </fieldset>            
            
                <div class="date-option-wrapper">
                    ${this.activatedRecent ? html`
                        <div>
                            <form class="form-inline text-center">
                                <div class="">
                                    <span class="${this._prefix}-text">Last</span>
                                    <select class="form-control bootstrap-select ${this._prefix}-codeDis"
                                            id="${this._prefix}RecentSelect" name="birthYear" required @change="${this.calculateFilters}" data-size="10">
                                        <option value="1" ?selected="${this.matchesRecentDaysConfig(1)}">1</option>
                                        <option value="2" ?selected="${this.matchesRecentDaysConfig(2)}">2</option>
                                        <option value="3" ?selected="${this.matchesRecentDaysConfig(3)}">3</option>
                                        <option value="4" ?selected="${this.matchesRecentDaysConfig(4)}">4</option>
                                        <option value="5" ?selected="${this.matchesRecentDaysConfig(5)}">5</option>
                                        <option value="6" ?selected="${this.matchesRecentDaysConfig(6)}">6</option>
                                        <option value="7" ?selected="${this.matchesRecentDaysConfig(7)}">7</option>
                                        <option value="8" ?selected="${this.matchesRecentDaysConfig(8)}">8</option>
                                        <option value="9" ?selected="${this.matchesRecentDaysConfig(9)}">9</option>
                                        <option value="10" ?selected="${this.matchesRecentDaysConfig(10)}">10</option>
                                        <option value="11" ?selected="${this.matchesRecentDaysConfig(11)}">11</option>
                                        <option value="12" ?selected="${this.matchesRecentDaysConfig(12)}">12</option>
                                        <option value="13" ?selected="${this.matchesRecentDaysConfig(13)}">13</option>
                                        <option value="14" ?selected="${this.matchesRecentDaysConfig(14)}">14</option>
                                        <option value="15" ?selected="${this.matchesRecentDaysConfig(15)}">15</option>
                                        <option value="16" ?selected="${this.matchesRecentDaysConfig(16)}">16</option>
                                        <option value="17" ?selected="${this.matchesRecentDaysConfig(17)}">17</option>
                                        <option value="18" ?selected="${this.matchesRecentDaysConfig(18)}">18</option>
                                        <option value="19" ?selected="${this.matchesRecentDaysConfig(19)}">19</option>
                                        <option value="20" ?selected="${this.matchesRecentDaysConfig(20)}">20</option>
                                        <option value="21" ?selected="${this.matchesRecentDaysConfig(21)}">21</option>
                                        <option value="22" ?selected="${this.matchesRecentDaysConfig(22)}">22</option>
                                        <option value="23" ?selected="${this.matchesRecentDaysConfig(23)}">23</option>
                                        <option value="24" ?selected="${this.matchesRecentDaysConfig(24)}">24</option>
                                        <option value="25" ?selected="${this.matchesRecentDaysConfig(25)}">25</option>
                                        <option value="26" ?selected="${this.matchesRecentDaysConfig(26)}">26</option>
                                        <option value="27" ?selected="${this.matchesRecentDaysConfig(27)}">27</option>
                                        <option value="28" ?selected="${this.matchesRecentDaysConfig(28)}">28</option>
                                        <option value="29" ?selected="${this.matchesRecentDaysConfig(29)}">29</option>
                                        <option value="30" ?selected="${this.matchesRecentDaysConfig(30)}">30</option>
                                    </select>
                                    <span class="${this._prefix}-text"> day(s)</span>
                                </div>
                            </form>
                        </div>
                    ` : null}
                    
                   
    
                    ${this.activatedDate ? html`
                        <div>
                            <form class="form-inline">
                                <div class="">
                                    <select class="bootstrap-select form-control ${this._prefix}-codeDis col-md-4"
                                            id="${this._prefix}YearSelect" name="birthYear" required @change="${this.calculateFilters}">
                                        ${this.yearsToSearch.length && this.yearsToSearch.map(item => html`
                                            <option value="${item}">${item}</option>
                                        `)}
                                    </select>
        
                                    <label>-</label>
                                    <select class="bootstrap-select form-control ${this._prefix}-codeDis col-md-4"
                                            id="${this._prefix}MonthSelect" name="birthYear" required @change="${this.calculateFilters}">
                                        <option value="any">Any</option>
                                        ${this.monthToSearch.length && this.monthToSearch.map(item => html`
                                            <option value="${item}">${item}</option>
                                        `)}
                                    </select>
        
                                    <label>-</label>
                                    <select class="bootstrap-select form-control ${this._prefix}-codeDis col-md-4"
                                            id="${this._prefix}DaySelect" name="birthYear" required @change="${this.calculateFilters}" data-size="10">
                                        <option value="any">Any</option>
                                        ${this.daysToSearch.length && this.daysToSearch.map(item => html`
                                            <option value="${item}">${item}</option>
                                        `)}
                                    </select>
                                </div>
                            </form>
                        </div>
                    ` : null}
    
                    
                    ${this.activatedRanges ? html`
                        <div>
                            <div class="range-box">
                                <label class="${this._prefix}-text">Begin periode</label>
                                <form class="form-inline">
                                    <div class="">
                                        <select class="bootstrap-select form-control ${this._prefix}-codeDis col-md-4"
                                                id="${this._prefix}YearSelectFrom" name="birthYear" required @change="${this.calculateFilters}">
                                             ${this.yearsToSearch.length && this.yearsToSearch.map(item => html`
                                                <option value="${item}">${item}</option>
                                            `)}
                                        </select>
            
                                        <label>-</label>
                                        <select class="bootstrap-select form-control ${this._prefix}-codeDis col-md-4"
                                                id="${this._prefix}MonthSelectFrom" name="birthYear" required @change="${this.calculateFilters}">
                                            <option value="any">Any</option>
                                             ${this.monthToSearch.length && this.monthToSearch.map(item => html`
                                                <option value="${item}">${item}</option>
                                            `)}
                                        </select>
            
                                        <label>-</label>
                                        <select class="bootstrap-select form-control ${this._prefix}-codeDis col-md-4"
                                                id="${this._prefix}DaySelectFrom" name="birthYear" required @change="${this.calculateFilters}" data-size="10">
                                            <option value="any">Any</option>
                                             ${this.daysToSearch.length && this.daysToSearch.map(item => html`
                                                <option value="${item}">${item}</option>
                                            `)}
                                        </select>
                                    </div>
                                </form>
                            </div>
                            <div class="range-box">
                                <label class="${this._prefix}-text">End periode</label>
                                <form class="form-inline">
                                    <div class="">
                                        <select class="bootstrap-select form-control ${this._prefix}-codeDis col-md-4"
                                                id="${this._prefix}YearSelectTo" name="birthYear" required @change="${this.calculateFilters}">
                                             ${this.yearsToSearch.length && this.yearsToSearch.map(item => html`
                                                <option value="${item}">${item}</option>
                                            `)}
                                        </select>
            
                                        <label>-</label>
                                        <select class="bootstrap-select form-control ${this._prefix}-codeDis col-md-4"
                                                id="${this._prefix}MonthSelectTo" name="birthYear" required @change="${this.calculateFilters}">
                                            <option value="any">Any</option>
                                             ${this.monthToSearch.length && this.monthToSearch.map(item => html`
                                                <option value="${item}">${item}</option>
                                            `)}
                                        </select>
            
                                        <label>-</label>
                                        <select class="bootstrap-select form-control ${this._prefix}-codeDis col-md-4"
                                                id="${this._prefix}DaySelectTo" name="birthYear" required @change="${this.calculateFilters}" data-size="10">
                                            <option value="any">Any</option>
                                             ${this.daysToSearch.length && this.daysToSearch.map(item => html`
                                                <option value="${item}">${item}</option>
                                            `)}
                                        </select>
                                    </div>
                                </form>
                            </div>
                        </div>` : null}
                    </div>
            </form>
        </div>`;
    }

}

customElements.define("opencga-date-filter", OpencgaDateFilter);
