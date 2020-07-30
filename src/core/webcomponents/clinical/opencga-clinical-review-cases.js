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
import {OpenCGAClient} from "../../clients/opencga/opencga-client.js";
import UtilsNew from "../../utilsNew.js";
import {NotificationQueue} from "../Notification.js";
import PolymerUtils from "../PolymerUtils.js";
import "./opencga-clinical-analysis-grid.js";
import "./opencga-clinical-analysis-view.js";


export default class OpencgaClinicalReviewCases extends LitElement {

    constructor() {
        super();

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
            query: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "ocrc-" + UtilsNew.randomString(6);
        this._config = this.getDefaultConfig();
        this._filters = [];
    }

    firstUpdated(_changedProperties) {
        this.case = "All";
        this.proband = "All";
        this.sample = "All";
        this.family = "All";
        this.disorder = "All";
        this.active = true;

        $("select.selectpicker").selectpicker("render");
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        if (changedProperties.has("opencgaSession") || changedProperties.has("query") || changedProperties.has("config")) {
            this.propertyObserver();
        }
    }

    opencgaSessionObserver() {
        console.log("opencgaSessionObserver");
        this.filters = this._config.filter.examples;

        if (this.opencgaSession.opencgaClient instanceof OpenCGAClient && UtilsNew.isNotUndefined(this.opencgaSession.token)) {
            this.opencgaSession.opencgaClient.users().filters(this.opencgaSession.user.id).then(restResponse => {
                const result = restResponse.getResults();
                if (result.length > 0) {
                    this._filters = [...this.filters, ...result.filter(f => f.resource === "CLINICAL_ANALYSIS")];
                } else {
                    this._filters = [...this.filters];
                }
                this.requestUpdate();
            });
        }
    }

    propertyObserver() {
        this._config = Object.assign({}, this.getDefaultConfig(), this.config);

        if (UtilsNew.isNotUndefinedOrNull(this.opencgaSession) && UtilsNew.isNotUndefinedOrNull(this.opencgaSession.study) &&
            UtilsNew.isNotEmptyArray(this.opencgaSession.study.groups)) {
            // let _studyUsers = [opencgaSession.user.id];
            for (const group of this.opencgaSession.study.groups) {
                if (group.id === "@members" || group.name === "@members") {
                    this._studyUsers = group.userIds;
                }
            }
        }

        if (UtilsNew.isNotUndefinedOrNull(this.query)) {
            this.setQueryFilters(this.query);
            this._query = Object.assign({}, this.query);
        }
        this.requestUpdate();
    }

    checkSid(config) {
        return UtilsNew.isNotEmpty(config.sessionId);
    }

    onClearQuery(e) {
        //FIXME monkey patch to reset button (text) fields. TODO complete refactor.
        this.case = "All";
        if (this.querySelector(`#${this._prefix}caseInput`)) {
            this.querySelector(`#${this._prefix}caseInput`).value = "";
        }
        this.sample = "All";
        if (this.querySelector(`#${this._prefix}sampleInput`)) {
            this.querySelector(`#${this._prefix}sampleInput`).value = "";
        }

        this.proband = "All";
        if (this.querySelector(`#${this._prefix}probandInput`)) {
            this.querySelector(`#${this._prefix}probandInput`).value = "";
        }
        this.family = "All";
        if (this.querySelector(`#${this._prefix}familyInput`)) {
            this.querySelector(`#${this._prefix}familyInput`).value = "";
        }

        this.disorder = "All";
        if (this.querySelector(`#${this._prefix}disorderInput`)) {
            this.querySelector(`#${this._prefix}disorderInput`).value = "";
        }
        $(".filter-button").css("color", "rgb(153, 153, 153)");

        $(`#${this._prefix}-type`).selectpicker("val", "");
        $(`#${this._prefix}-priority`).selectpicker("val", "");
        $(`#${this._prefix}-status`).selectpicker("val", "");
        $(`#${this._prefix}-assigned`).selectpicker("val", "");
        this.updateQuery();
    }

    onSelectClinicalAnalysis(e) {
        this.clinicalAnalysis = e.detail.row;
        this.requestUpdate();
    }

    onFilterChange(e) {
        console.log("onFilterChange", e);
        for (const filter of this._filters) {
            if (e.currentTarget.dataset.filterId === filter.id) {
                this._query = filter.query;
                this.setQueryFilters(this._query);
                break;
            }
        }
    }

    onFilterInputText(e) {
        const filterId = e.currentTarget.dataset.id;
        const value = e.currentTarget.value;

        this.updateInputTextMenuItem(filterId, value);
    }

    onEnter(e) {
        if (e.which === 13) this.updateQuery();
    }

    launchModal() {
        $(PolymerUtils.getElementById(this._prefix + "SaveModal")).modal("show");
    }

    save() {
        const filterName = PolymerUtils.getValue(this._prefix + "filterName");
        const filterDescription = PolymerUtils.getValue(this._prefix + "filterDescription");

        const data = {
            id: filterName,
            description: filterDescription,
            resource: "CLINICAL_ANALYSIS",
            query: this._query,
            options: {}
        };
        this.opencgaSession.opencgaClient.users().filters(this.opencgaSession.user.id)
            .then(restResponse => {
                console.log("GET filters", restResponse);
                const savedFilters = restResponse.getResults() || [];

                console.log("savedFilters", savedFilters);
                // updating an existing filter

                //check if filterName else updateFilters
                if (savedFilters.find(savedFilter => savedFilter.id === filterName)) {
                    this.opencgaSession.opencgaClient.users().updateFilter(this.opencgaSession.user.id, filterName, data)
                        .then(response => {
                            for (const i in this._filters) {
                                if (this._filters[i].id === filterName) {
                                    this._filters[i] = response.response[0].result[0];
                                }
                            }
                            PolymerUtils.setValue(this._prefix + "filterName", "");
                            PolymerUtils.setValue(this._prefix + "filterDescription", "");
                        });
                } else {
                    // saving a new filter
                    this.opencgaSession.opencgaClient.users().updateFilters(this.opencgaSession.user.id, data, {action: "ADD"})
                        .then(response => {

                            this._filters = [...this._filters, data];
                            PolymerUtils.setValue(this._prefix + "filterName", "");
                            PolymerUtils.setValue(this._prefix + "filterDescription", "");
                            this.requestUpdate();
                        });
                }

            })
            .catch(restResponse => {
                if (restResponse.getEvents?.("ERROR")?.length) {
                    const msg = restResponse.getEvents("ERROR").map(error => error.message).join("<br>");
                    new NotificationQueue().push("Error saving the filter", msg, "error");
                } else {
                    new NotificationQueue().push("Error saving the filter", "", "error");
                }
                console.error(restResponse);
            })
            .finally(() => {

            });
    }

    updateInputTextMenuItem(filterId, value) {
        const buttonElem = PolymerUtils.getElementById(this._prefix + filterId + "Menu");
        //console.log(buttonElem);
        //console.log(filterId, value, this[filterId]);
        if (UtilsNew.isNotEmpty(value)) {
            this[filterId] = value;
            buttonElem.style.color = "#333";
        } else {
            this[filterId] = "All";
            buttonElem.style.color = "rgb(153, 153, 153)";
        }
        this.requestUpdate();
    }

    updateQuery() {
        const _query = {};

        const defaultValue = "All";

        if (this.case !== defaultValue && this.case !== "") {
            _query.id = this.case;
        }

        if (this.sample !== defaultValue && this.sample !== "") {
            _query.sample = this.sample;
        }

        if (this.proband !== defaultValue) {
            _query.proband = this.proband;
        }

        if (this.family !== defaultValue) {
            _query.family = this.family;
        }

        if (this.disorder !== defaultValue) {
            _query.disorder = this.disorder;
        }

        const type = $(`#${this._prefix}-type`).selectpicker("val");
        if ($(`#${this._prefix}-type`).length && UtilsNew.isNotEmpty(type)) {
            _query.type = type.join(",");
        }

        const status = $(`#${this._prefix}-status`).selectpicker("val");
        if ($(`#${this._prefix}-status`).length && UtilsNew.isNotEmpty(status)) {
            _query.status = status?.join(",");
        }

        const priority = $(`#${this._prefix}-priority`).selectpicker("val");
        if ($(`#${this._prefix}-priority`).length && UtilsNew.isNotEmpty(priority)) {
            _query.priority = priority.join(",");
        }

        const assigned = $(`#${this._prefix}-assigned`).selectpicker("val");
        if ($(`#${this._prefix}-assigned`).length && UtilsNew.isNotEmpty(assigned)) {
            _query.analystAssignee = assigned.join(",");
        }

        this._query = _query;
        this.requestUpdate();
    }

    setQueryFilters(query) {
        console.log("setQueryFilters", query);
        if (UtilsNew.isNotUndefinedOrNull(query.id)) {
            PolymerUtils.setValue(this._prefix + "caseInput", query.id);
            this.updateInputTextMenuItem("case", query.id);
        }

        if (UtilsNew.isNotUndefinedOrNull(query.sample)) {
            PolymerUtils.setValue(this._prefix + "sampleInput", query.sample);
            this.updateInputTextMenuItem("sample", query.sample);
        }

        if (UtilsNew.isNotUndefinedOrNull(query.proband)) {
            PolymerUtils.setValue(this._prefix + "probandInput", query.proband);
            this.updateInputTextMenuItem("proband", query.proband);
        }

        if (UtilsNew.isNotUndefinedOrNull(query.family)) {
            PolymerUtils.setValue(this._prefix + "familyInput", query.family);
            this.updateInputTextMenuItem("family", query.family);
        }

        if (UtilsNew.isNotUndefinedOrNull(query.disorder)) {
            PolymerUtils.setValue(this._prefix + "disorderInput", query.disorder);
            this.updateInputTextMenuItem("disorder", query.disorder);
        }

        if (UtilsNew.isNotUndefinedOrNull(query.type)) {
            $("#" + this._prefix + "-type").selectpicker("val", query.type.split(","));
        }

        if (UtilsNew.isNotUndefinedOrNull(query.status)) {
            $("#" + this._prefix + "-status").selectpicker("val", query.status.split(","));
        }

        if (UtilsNew.isNotUndefinedOrNull(query.priority)) {
            $("#" + this._prefix + "-priority").selectpicker("val", query.priority.split(","));
        }

        if (UtilsNew.isNotUndefinedOrNull(query.assigned)) {
            $("#" + this._prefix + "-assigned").selectpicker("val", query.analystAssignee.split(","));
        }
    }

    _updateValidateFormFields() {
        $("#" + this._prefix + "-assigned").validator("update");
    }

    //TODO better adapt config to the a dynamic view
    getDefaultConfig() {
        return {
            title: "Review Cases",
            showTitle: true,
            filter: {
                sections: [
                    {
                        title: "",
                        fields: [
                            {
                                id: "case"
                            },
                            {
                                id: "sample"
                            },
                            {
                                id: "proband"
                            },
                            {
                                id: "family"
                            },
                            {
                                id: "disorder"
                            },
                            {
                                id: "type"
                            },
                            {
                                id: "status"
                            },
                            {
                                id: "priority"
                            },
                            {
                                id: "assignee"
                            }
                        ]
                    }
                ],
                examples: [
                    {
                        id: "Intellectual disability",
                        active: false,
                        query: {
                            disorder: "Intellectual disability"
                        }
                    }
                ]
            },
            grid: {
                pageSize: 10,
                pageList: [10, 25, 50],
                detailView: false,
                multiSelection: false,
                showActions: true
            },
        };
    }

    render() {
        return html`
        <style>
            .ocap-text-button {
                display: inline-block;
                overflow: hidden;
                width: 90px;
                text-align: left;
                float: left !important;
            }

            .filter-label {
                margin: auto 10px;
                white-space: nowrap
            }

            .browser-variant-tab-title {
                font-size: 115%;
                font-weight: bold;
            }
            .horizontal-flex{
                display: flex;
            }
            .horizontal-flex > div {
                padding:5px;
                flex:1;
                box-sizing: border-box;
            }
            .horizontal-flex > div label {
                display:block
            }
            .active-filter-label{
                display: inline-block;
                font-size: 15px;
                text-transform: uppercase;
                letter-spacing: 2px;
                height: 34px;
                line-height: 34px;
                margin: 0;
            }
            
            .clinical-right-buttons {
                float: right;
                padding: 7px;
            }
        </style>

        <div class="row">
            <div class="col-md-12">
                <div style="">
                    <form @submit="${() => console.log("submit")}">
                        <div class="panel panel-default" style="margin-bottom: 10px">
                            <!--<div class="panel-heading">Case Filters</div>-->
                            <div class="panel-body" style="padding: 10px">
                                <div class="lhs">
                                    <div class="btn-group">
                                        <p class="active-filter-label">Filters</p>
                                    </div>
        
                                    ${~this._config.filter.sections[0].fields.findIndex(field => field.id === "case") ? html`
                                        <!-- Case ID -->
                                        <div class="btn-group">
                                            <button type="button" class="dropdown-toggle btn btn-default filter-button" style="width:125px; color: rgb(153, 153, 153);"
                                                    id="${this._prefix}caseMenu"
                                                    data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                                <span class="ocap-text-button">Case: <span>${this.case}</span></span>&nbsp;<span class="caret"></span>
                                            </button>
                                            <ul class="dropdown-menu" aria-labelledby="${this._prefix}caseMenu">
                                                <li style="padding: 5px;">
                                                    <div style="display: inline-flex; width: 300px;">
                                                        <label class="filter-label">Case ID:</label>
                                                        <input type="text" id="${this._prefix}caseInput" class="${this._prefix}-input form-control" data-id="case" placeholder="All" @input="${this.onFilterInputText}" @keypress="${this.onEnter}">
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                    ` : null}
                                    
                                    ${~this._config.filter.sections[0].fields.findIndex(field => field.id === "sample") ? html`
                                    <!-- Sample -->
                                    <div class="btn-group">
                                        <button type="button" class="dropdown-toggle btn btn-default filter-button" style="width:125px; color: rgb(153, 153, 153);"
                                                id="${this._prefix}sampleMenu"
                                                data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                            <span class="ocap-text-button">Sample: <span>${this.sample}</span></span>&nbsp;<span class="caret"></span>
                                        </button>
                                        <ul class="dropdown-menu" aria-labelledby="${this._prefix}caseMenu">
                                            <li style="padding: 5px;">
                                                <div style="display: inline-flex; width: 300px;">
                                                    <label class="filter-label">Sample ID:</label>
                                                    <input type="text" id="${this._prefix}sampleInput" class="${this._prefix}-input form-control" data-id="sample" placeholder="All" @input="${this.onFilterInputText}" @keypress="${this.onEnter}">
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                    ` : null}
                                    
                                    ${~this._config.filter.sections[0].fields.findIndex(field => field.id === "proband") ? html`
                                    <!-- Proband -->
                                    <div class="btn-group">
                                        <button type="button" class="btn btn-default dropdown-toggle filter-button" style="width:125px; color: rgb(153, 153, 153);"
                                                id="${this._prefix}probandMenu" title="${this.proband}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                            <span class="ocap-text-button">Proband: <span>${this.proband}</span></span>&nbsp; <span class="caret"></span>
                                        </button>
                                        <ul class="dropdown-menu" aria-labelledby="${this._prefix}probandMenu">
                                            <li style="padding: 5px;">
                                                <div style="display: inline-flex;width: 300px">
                                                    <label class="filter-label">Proband ID:</label>
                                                    <input type="text" id="${this._prefix}probandInput" class="${this._prefix}-input form-control" data-id="proband" placeholder="All" @keyup="${this.onFilterInputText}" @keypress="${this.onEnter}">
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                    ` : null}
                                    
                                    ${~this._config.filter.sections[0].fields.findIndex(field => field.id === "family") ? html`                                    
                                    <!-- Family -->
                                    <div class="btn-group">
                                        <button type="button" class="dropdown-toggle btn btn-default filter-button" style="width:125px; color: rgb(153, 153, 153);"
                                                id="${this._prefix}familyMenu" title="${this.family}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                            <span class="ocap-text-button">Family: <span>${this.family}</span></span>&nbsp; <span class="caret"></span>
                                        </button>
                                        <ul class="dropdown-menu" aria-labelledby="${this._prefix}FamilyMenu">
                                            <li style="padding: 5px;">
                                                <div style="display: inline-flex; width: 300px;">
                                                    <label class="filter-label">Family ID:</label>
                                                    <input type="text" id="${this._prefix}familyInput" class="${this._prefix}-input form-control" data-id="family" placeholder="All" @input="${this.onFilterInputText}" @keypress="${this.onEnter}">
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                    ` : null}
                                    
                                    ${~this._config.filter.sections[0].fields.findIndex(field => field.id === "disorder") ? html`
                                    <!-- Disorder -->
                                    <div class="btn-group">
                                        <button type="button" class="dropdown-toggle btn btn-default filter-button" style="width:125px; color: rgb(153, 153, 153);"
                                                id="${this._prefix}disorderMenu" title="${this.disorder}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                            <span class="ocap-text-button">Disorder: <span>${this.disorder}</span></span>&nbsp; <span class="caret"></span>
                                        </button>
                                        <ul class="dropdown-menu" aria-labelledby="${this._prefix}DisorderMenu">
                                            <li style="padding: 5px;">
                                                <div style="display: inline-flex; width: 300px;">
                                                    <label class="filter-label">Disorder ID:</label>
                                                    <input type="text" id="${this._prefix}disorderInput" class="${this._prefix}-input form-control" data-id="disorder" placeholder="All" @input="${this.onFilterInputText}" @keypress="${this.onEnter}">
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                    ` : null}
                                    
                                    ${~this._config.filter.sections[0].fields.findIndex(field => field.id === "type") ? html`
                                    <!-- Type -->
                                    <div class="btn-group">
                                        <select class="selectpicker" data-width="105px" id="${this._prefix}-type" multiple
                                                title="Type: All" @change="${this.updateQuery}" style="width:115px; color: rgb(153, 153, 153);">
                                            <option value="SINGLE">Single</option>
                                            <option value="FAMILY">Family</option>
                                            <option value="CANCER">Cancer</option>
<!--                                            <option value="COHORT">Cohort</option>-->
<!--                                            <option value="AUTOCOMPARATIVE">Autocomparative</option>-->
                                        </select>
                                    </div>
                                    ` : null}
                                    
                                    ${~this._config.filter.sections[0].fields.findIndex(field => field.id === "status") ? html`
                                    <!-- Status -->
                                    <div class="btn-group">
                                        <select class="selectpicker" data-width="105px" id="${this._prefix}-status" multiple
                                                title="Status: All" @change="${this.updateQuery}">
                                            <option value="INCOMPLETE">Incomplete</option>
                                            <option value="READY_FOR_VALIDATION">Ready for Validation</option>
                                            <option value="READY_FOR_INTERPRETATION">Ready for Interpretation</option>
                                            <option value="INTERPRETATION_IN_PROGRESS">Interpretation in Progress</option>
                                            <option value="READY_FOR_INTEPRETATION_REVIEW">Ready for Interpretation Review</option>
                                            <option value="INTERPRETATION_REVIEW_IN_PROGRESS">Interpretation Review in Progress</option>
                                            <option value="READY_FOR_REPORT">Ready for Report</option>
                                            <option value="REPORT_IN_PROGRESS">Report in Progress</option>
                                            <option value="DONE">Done</option>
                                            <option value="REVIEW_IN_PROGRESS">Final Review in Progress</option>
                                            <option value="REJECTED">Rejected</option>
                                            <option value="CLOSED">Closed</option>
                                        </select>
                                    </div>
                                    ` : null}
                                    
                                    ${~this._config.filter.sections[0].fields.findIndex(field => field.id === "priority") ? html`
                                    <!-- Priority -->
                                    <div class="btn-group">
                                        <select class="selectpicker" data-width="105px" id="${this._prefix}-priority" multiple
                                                title="Priority: All" @change="${this.updateQuery}">
                                            <option style="color: red; font-weight: bold;" value="URGENT">Urgent</option>
                                            <option style="color: orange; font-weight: bold;" value="HIGH">High</option>
                                            <option style="color: blue; font-weight: bold;" value="MEDIUM">Medium</option>
                                            <option style="color: green; font-weight: bold;" value="LOW">Low</option>
                                        </select>
                                    </div>
                                    ` : null}
                                    
                                    ${~this._config.filter.sections[0].fields.findIndex(field => field.id === "assignee") ? html`
                                    <!-- Assignees -->
                                    <div class="btn-group">
                                        <select class="selectpicker" data-width="105px" id="${this._prefix}-assigned" multiple
                                                title="Assignee: All" @change="${this.updateQuery}">
                                                ${this._studyUsers && this._studyUsers.length ? this._studyUsers.map(item => html`
                                                    <option value="${item}">${item}</option>
                                                `) : null}
                                                
                                        </select>
                                    </div>
                                    ` : null}
                                    
                                    <!-- Buttons -->
                                    <button type="button" class="btn btn-primary btn-sm ripple" @click="${this.updateQuery}">
                                            <i class="fa fa-search icon-padding" aria-hidden="true"></i> Filter
                                    </button>
                                </div>
                                
                                
                                <div class="rhs" style="padding: 7px">
                                    <button type="button" class="btn btn-primary btn-sm ripple" @click="${this.onClearQuery}">
                                        <i class="fa fa-times icon-padding" aria-hidden="true"></i> Clear
                                    </button>
                                    <div class="dropdown">
                                        <button type="button" class="btn btn-primary btn-sm dropdown-toggle ripple" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            <i class="fa fa-filter icon-padding" aria-hidden="true"></i> Filters <span class="caret"></span>
                                        </button>
                                        <ul class="dropdown-menu">
                                            <li><a style="font-weight: bold">Saved Filters</a></li>
                                                ${this._filters && this._filters.length ? this._filters.map(item => html`
                                                    <li>
                                                        <a data-filter-id="${item.id}" style="cursor: pointer; ${item.active ? "color: green" : ""}" @click="${this.onFilterChange}" class="filtersLink">&nbsp;&nbsp;${item.id}</a>
                                                    </li>
                                                `) : null}
                                            ${this.opencgaSession?.token ? html`
                                                <li role="separator" class="divider"></li>
                                                <li>
                                                    <a style="cursor: pointer" @click="${this.launchModal}"><i class="fa fa-floppy-o icon-padding" aria-hidden="true"></i> Save...</a>
                                                </li>
                                            ` : null}
                                        </ul>
                                    </div>
                                </div>
                                
                                
                            </div>
                        </div>
                    
                    </form>

                    <div>
                        <opencga-clinical-analysis-grid .opencgaSession="${this.opencgaSession}"
                                                        .query="${this._query}"
                                                        .active="${this.active}"
                                                        .config="${this._config.grid}"
                                                        @selectrow="${this.onSelectClinicalAnalysis}">
                        </opencga-clinical-analysis-grid>

                        <!-- Bottom tabs with specific variant information -->
                        ${this.clinicalAnalysis ? html`
                            <div>
                                <h3>Case Study: ${this.clinicalAnalysis.id}</h3>
                                <div>
                                    <ul id="${this._prefix}ViewTabs" class="nav nav-tabs" role="tablist">
                                        <li role="presentation" class="active">
                                            <a href="#${this._prefix}Info" role="tab" data-toggle="tab" class="browser-variant-tab-title" style="font-weight: bold">Summary</a>
                                        </li>
                                        <li role="presentation">
                                            <a href="#${this._prefix}Proband" role="tab" data-toggle="tab" class="browser-variant-tab-title" style="font-weight: bold">Proband Info</a>
                                        </li>
                                    </ul>
    
                                    <div class="tab-content" style="padding: 20px">
                                        <div id="${this._prefix}Info" role="tabpanel" class="tab-pane active">
                                            <div>
                                                <opencga-clinical-analysis-view .opencgaSession="${this.opencgaSession}"
                                                                                .clinicalAnalysisId=${this.clinicalAnalysis.id}
                                                                                .config="${this.config}">
                                                </opencga-clinical-analysis-view>
                                            </div>
                                        </div>
                                        <div id="${this._prefix}Proband" role="tabpanel" class="tab-pane">
                                            <div>
                                                <opencga-individual-view .opencgaSession="${this.opencgaSession}" .individual="${this.clinicalAnalysis.proband}"></opencga-individual-view>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ` : null}
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Modal -->
        <div class="modal fade" id="${this._prefix}SaveModal" tabindex="-1" role="dialog"
             aria-labelledby="${this._prefix}SaveModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <h4 class="modal-title" id="${this._prefix}SaveModalLabel">Filter</h4>
                    </div>
                    <div class="modal-body">
                        <div class="form-group row">
                            <label for="filterName" class="col-xs-2 col-form-label">Name</label>
                            <div class="col-xs-10">
                                <input class="form-control" type="text" id="${this._prefix}filterName">
                            </div>
                        </div>
                        <div class="form-group row">
                            <label for="${this._prefix}filterDescription" class="col-xs-2 col-form-label">Description</label>
                            <div class="col-xs-10">
                                <input class="form-control" type="text" id="${this._prefix}filterDescription">
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-dismiss="modal" @click="${this.save}">Save</button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }



}

customElements.define("opencga-clinical-review-cases", OpencgaClinicalReviewCases);
