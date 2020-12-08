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
import UtilsNew from "../../utilsNew.js";
import {NotificationQueue} from "../Notification.js";
import PolymerUtils from "../PolymerUtils.js";
import "./opencga-clinical-analysis-grid.js";
import "./opencga-clinical-analysis-view.js";
import "../commons/filters/clinical-analysis-id-autocomplete.js";
import "../commons/filters/sample-id-autocomplete.js";
import "../commons/filters/family-id-autocomplete.js";
import "../commons/filters/disorder-id-autocomplete.js";
import "../commons/filters/proband-id-autocomplete.js";
import "../commons/filters/clinical-priority-filter.js";
import "../commons/filters/clinical-status-filter.js";


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
        this._filters = [];
        this.resource = "CLINICAL_ANALYSIS";
        this.query = {};
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
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
        this.filters = this._config.filter.examples;
        if (this.opencgaSession) {
            this.refreshFilters();
            this.users = this.opencgaSession.study.groups.find(group => group.id === "@members" || group.name === "@members").userIds;
        }
    }

    propertyObserver() {
        this._config = {...this.getDefaultConfig(), ...this.config};
        if (UtilsNew.isNotUndefinedOrNull(this.query)) {
            this._query = {...this.query};
        }
        this.requestUpdate();
    }

    isLoggedIn() {
        return !!this?.opencgaSession?.token;
    }

    clear(e) {
        this.query = {};
    }

    onSelectClinicalAnalysis(e) {
        this.clinicalAnalysis = e.detail.row;
        this.requestUpdate();
    }

    onServerFilterChange(e) {
        console.log("onFilterChange", e);
        for (const filter of this._filters) {
            if (e.currentTarget.dataset.filterId === filter.id) {
                this._query = filter.query;
                this.setQueryFilters(this._query);
                break;
            }
        }
    }

    serverFilterDelete(e) {
        const {filterId} = e.currentTarget.dataset;
        Swal.fire({
            title: "Are you sure?",
            text: "The filter will be deleted. The operation cannot be reverted.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes"
        }).then(result => {
            if (result.value) {
                const data = {
                    id: filterId,
                    resource: this.resource,
                    options: {}
                };
                this.opencgaSession.opencgaClient.users().updateFilters(this.opencgaSession.user.id, data, {action: "REMOVE"})
                    .then(restResponse => {
                        console.log("restResponse", restResponse);
                        Swal.fire(
                            "Filter Deleted",
                            "Filter has been deleted.",
                            "success"
                        );
                        this.refreshFilters();
                    }).catch(restResponse => {
                        if (restResponse.getEvents?.("ERROR")?.length) {
                            const msg = restResponse.getEvents("ERROR").map(error => error.message).join("<br>");
                            new NotificationQueue().push("Error deleting filter", msg, "error");
                        } else {
                            new NotificationQueue().push("Error deleting filter", "", "error");
                        }
                        console.error(restResponse);
                    });
            }
        });
    }

    onFilterInputText(e) {
        const filterId = e.currentTarget.dataset.id;
        const value = e.currentTarget.value;

        this.updateInputTextMenuItem(filterId, value);
    }

    launchModal() {
        $(PolymerUtils.getElementById(this._prefix + "SaveModal")).modal("show");
    }

    refreshFilters() {
        this.opencgaSession.opencgaClient.users().filters(this.opencgaSession.user.id).then(restResponse => {
            const result = restResponse.getResults();
            // (this.filters || []) in case this.filters (prop) is undefined
            if (result.length > 0) {
                this._filters = [...(this.filters || []), ...result.filter(f => f.resource === this.resource)];
            } else {
                this._filters = [...(this.filters || [])];
            }
            this.requestUpdate();
        });
    }

    save() {
        const filterName = PolymerUtils.getValue(this._prefix + "filterName");
        const filterDescription = PolymerUtils.getValue(this._prefix + "filterDescription");

        const query = this.query;
        if (query.study) {
            // filters out the current active study
            const studies = query.study.split(",").filter(fqn => fqn !== this.opencgaSession.study.fqn);
            if (studies.length) {
                query.study = studies.join(",");
            } else {
                delete query.study;
            }
        }
        // console.log("QUERY SAVED:", query)

        this.opencgaSession.opencgaClient.users().filters(this.opencgaSession.user.id)
            .then(restResponse => {
                console.log("GET filters", restResponse);
                const savedFilters = restResponse.getResults() || [];

                console.log("savedFilters", savedFilters);

                if (savedFilters.find(savedFilter => savedFilter.id === filterName)) {
                    // updating an existing filter
                    const data = {
                        description: filterDescription,
                        query: query,
                        options: {}
                    };

                    Swal.fire({
                        title: "Are you sure?",
                        text: "A Filter with the same name is already present. You are going to overwrite it.",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#d33",
                        cancelButtonColor: "#3085d6",
                        confirmButtonText: "Yes"
                    }).then(result => {
                        if (result.value) {
                            this.opencgaSession.opencgaClient.users().updateFilter(this.opencgaSession.user.id, filterName, data)
                                .then(restResponse => {
                                    if (!restResponse?.getEvents?.("ERROR")?.length) {
                                        for (const i in this._filters) {
                                            if (this._filters[i].id === filterName) {
                                                this._filters[i] = restResponse.response[0].result[0];
                                            }
                                        }

                                    } else {
                                        console.error(restResponse);
                                        Swal.fire(
                                            "Server Error!",
                                            "Filter has not been correctly saved.",
                                            "error"
                                        );
                                    }
                                    PolymerUtils.setValue(this._prefix + "filterName", "");
                                    PolymerUtils.setValue(this._prefix + "filterDescription", "");
                                }).catch(restResponse => {
                                    console.error(restResponse);
                                    Swal.fire(
                                        "Server Error!",
                                        "Filter has not been correctly saved.",
                                        "error"
                                    );
                                });
                        }
                    });

                } else {
                    // saving a new filter
                    const data = {
                        id: filterName,
                        description: filterDescription,
                        resource: this.resource,
                        query: query,
                        options: {}
                    };
                    this.opencgaSession.opencgaClient.users().updateFilters(this.opencgaSession.user.id, data, {action: "ADD"})
                        .then(restResponse => {
                            if (!restResponse.getEvents?.("ERROR")?.length) {
                                this._filters = [...this._filters, data];
                                PolymerUtils.setValue(this._prefix + "filterName", "");
                                PolymerUtils.setValue(this._prefix + "filterDescription", "");
                                Swal.fire(
                                    "Filter Saved",
                                    "Filter has been saved.",
                                    "success"
                                );
                            } else {
                                console.error(restResponse);
                                Swal.fire(
                                    "Server Error!",
                                    "Filter has not been correctly saved.",
                                    "error"
                                );
                            }
                            this.requestUpdate();
                        }).catch(restResponse => {
                            console.error(restResponse);
                            Swal.fire(
                                "Server Error!",
                                "Filter has not been correctly saved.",
                                "error"
                            );
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

    onFilterChange(key, value) {
        if (value && value !== "") {
            this.query = {...this.query, ...{[key]: value}};
        } else {
            delete this.query[key];
            this.query = {...this.query};
        }
    }

    // TODO better adapt config to the a dynamic view
    getDefaultConfig() {
        return {
            title: "Review Portal",
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
                showActions: true,
                toolbar: {
                    buttons: ["columns", "download", "new"],
                    newButtonLink: "#clinical-analysis-writer/"
                }
            }
        };
    }

    render() {
        return this.opencgaSession ? html`
        <style>
        
            .filter-button {
                color: rgb(153,153,153);
            }
            
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
            
            .clinical-right-buttons {
                float: right;
                padding: 7px;
            }
        </style>

        <div class="row">
            <div class="col-md-10 col-md-offset-1">
                <div style="">
                    <form @submit="${() => console.log("submit")}">
                        <div class="panel panel-default" style="margin-bottom: 10px">
                            <!--<div class="panel-heading">Case Filters</div>-->
                            <div class="panel-body" style="padding: 10px">
                                <div class="lhs">
                                    
                                    <div class="dropdown saved-filter-dropdown" style="margin-right: 5px">
                                        <button type="button" class="active-filter-label ripple no-shadow" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" data-cy="filter-button">
                                            <i class="fa fa-filter icon-padding" aria-hidden="true"></i> Filters <span class="caret"></span>
                                        </button>
                                        <ul class="dropdown-menu saved-filter-wrapper">
                                            <li>
                                                <a><i class="fas fa-cloud-upload-alt icon-padding"></i> <strong>Saved Filters</strong></a>
                                            </li>
                                            ${this._filters && this._filters.length ?
                                                this._filters.map(item => item.separator ?
                                                    html`
                                                        <li role="separator" class="divider"></li>` :
                                                    html`
                                                        <li>
                                                            <a data-filter-id="${item.id}" class="filtersLink" style="cursor: pointer;color: ${!item.active ? "black" : "green"}" 
                                                                    @click="${this.onServerFilterChange}">
                                                                <span class="id-filter-button"> ${item.id}</span>
                                                                <span class="delete-filter-button" title="Delete filter" data-filter-id="${item.id}" 
                                                                        @click="${this.serverFilterDelete}"><i class="fas fa-times"></i>
                                                                </span>
                                                            </a>
                                                        </li>`
                                                    ) :
                                                html`<li><a class="help-block">No filters found</a></li>`
                                            }
                                            
                                            <li role="separator" class="divider"></li>
                                            <li>
                                                <a href="javascript: void 0" @click="${this.clear}" data-action="active-filter-clear">
                                                    <i class="fa fa-eraser icon-padding" aria-hidden="true"></i> <strong>Clear</strong>
                                                </a>    
                                            </li>
                                            ${this.isLoggedIn() ? html`
                                                <li>
                                                    <a style="cursor: pointer" @click="${this.launchModal}" data-action="active-filter-save"><i class="fas fa-save icon-padding"></i> <strong>Save filter...</strong></a>
                                                </li>
                                            ` : null}
                                        </ul>
                                    </div>
        
                                    ${~this._config.filter.sections[0].fields.findIndex(field => field.id === "case") ? html`
                                        <!-- Case ID -->
                                        <div class="btn-group" data-cy="form-case">
                                            <button type="button" class="dropdown-toggle btn btn-default filter-button"
                                                    id="${this._prefix}caseMenu"
                                                    data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                                <span class="ocap-text-button">Case: <span>${this.query.id ?? "All"}</span></span>&nbsp;<span class="caret"></span>
                                            </button>
                                            <ul class="dropdown-menu" aria-labelledby="${this._prefix}caseMenu">
                                                <li style="padding: 5px;">
                                                    <div style="display: inline-flex; width: 300px;">
                                                        <label class="filter-label">Case ID:</label>
                                                        <clinical-analysis-id-autocomplete .opencgaSession="${this.opencgaSession}" @filterChange="${e => this.onFilterChange("id", e.detail.value)}"></clinical-analysis-id-autocomplete>
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                    ` : null}
                                    
                                    ${~this._config.filter.sections[0].fields.findIndex(field => field.id === "sample") ? html`
                                    <!-- Sample -->
                                    <div class="btn-group" data-cy="form-sample">
                                        <button type="button" class="dropdown-toggle btn btn-default filter-button"
                                                id="${this._prefix}sampleMenu"
                                                data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                            <span class="ocap-text-button">Sample: <span>${this.query.sample ?? "All"}</span></span>&nbsp;<span class="caret"></span>
                                        </button>
                                        <ul class="dropdown-menu" aria-labelledby="${this._prefix}caseMenu">
                                            <li style="padding: 5px;">
                                                <div style="display: inline-flex; width: 300px;">
                                                    <label class="filter-label">Sample ID:</label>
                                                    <sample-id-autocomplete .opencgaSession="${this.opencgaSession}" @filterChange="${e => this.onFilterChange("sample", e.detail.value)}"></sample-id-autocomplete>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                    ` : null}
                                    
                                    ${~this._config.filter.sections[0].fields.findIndex(field => field.id === "proband") ? html`
                                    <!-- Proband -->
                                    <div class="btn-group" data-cy="form-proband">
                                        <button type="button" class="btn btn-default dropdown-toggle filter-button"
                                                id="${this._prefix}probandMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                            <span class="ocap-text-button">Proband: <span>${this.query.proband ?? "All"}</span></span>&nbsp; <span class="caret"></span>
                                        </button>
                                        <ul class="dropdown-menu" aria-labelledby="${this._prefix}probandMenu">
                                            <li style="padding: 5px;">
                                                <div style="display: inline-flex;width: 300px">
                                                    <label class="filter-label">Proband ID:</label>
                                                    <proband-id-autocomplete .opencgaSession="${this.opencgaSession}" @filterChange="${e => this.onFilterChange("proband", e.detail.value)}"></proband-id-autocomplete>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                    ` : null}
                                    
                                    ${~this._config.filter.sections[0].fields.findIndex(field => field.id === "family") ? html`                                    
                                    <!-- Family -->
                                    <div class="btn-group" data-cy="form-family">
                                        <button type="button" class="dropdown-toggle btn btn-default filter-button"
                                                id="${this._prefix}familyMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                            <span class="ocap-text-button">Family: <span>${this.query.family ?? "All"}</span></span>&nbsp; <span class="caret"></span>
                                        </button>
                                        <ul class="dropdown-menu" aria-labelledby="${this._prefix}FamilyMenu">
                                            <li style="padding: 5px;">
                                                <div style="display: inline-flex; width: 300px;">
                                                    <label class="filter-label">Family ID:</label>
                                                    <family-id-autocomplete .opencgaSession="${this.opencgaSession}" @filterChange="${e => this.onFilterChange("family", e.detail.value)}"></family-id-autocomplete>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                    ` : null}
                                    
                                    ${~this._config.filter.sections[0].fields.findIndex(field => field.id === "disorder") ? html`
                                    <!-- Disorder -->
                                    <div class="btn-group">
                                        <button type="button" class="dropdown-toggle btn btn-default filter-button"
                                                id="${this._prefix}disorderMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                            <span class="ocap-text-button">Disorder: <span>${this.query.disorder ?? "All"}</span></span>&nbsp; <span class="caret"></span>
                                        </button>
                                        <ul class="dropdown-menu" aria-labelledby="${this._prefix}DisorderMenu">
                                            <li style="padding: 5px;">
                                                <div style="display: inline-flex; width: 300px;">
                                                    <label class="filter-label">Disorder ID:</label>
                                                    <disorder-id-autocomplete .opencgaSession="${this.opencgaSession}" @filterChange="${e => this.onFilterChange("disorder", e.detail.value)}"></disorder-id-autocomplete>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                    ` : null}
                                    
                                    ${~this._config.filter.sections[0].fields.findIndex(field => field.id === "type") ? html`
                                    <!-- Type -->
                                    <div class="btn-group">
                                        <select-field-filter placeholder="Type" multiple .data="${["SINGLE", "FAMILY", "CANCER"]}" @filterChange="${e => this.onFilterChange("type", e.detail.value)}"></select-field-filter>
                                    </div>
                                    ` : null}
                                    
                                    ${~this._config.filter.sections[0].fields.findIndex(field => field.id === "status") ? html`
                                    <!-- Status -->
                                    <div class="btn-group">
                                        <clinical-status-filter placeholder="${"Status: All"}" .statuses="${this.opencgaSession?.study?.configuration?.clinical?.status ?? []}" @filterChange="${e => this.onFilterChange("status", e.detail.value)}"></clinical-status-filter>
                                    ` : null}
                                    
                                    ${~this._config.filter.sections[0].fields.findIndex(field => field.id === "priority") ? html`
                                    <!-- Priority -->
                                    <div class="btn-group" data-cy="form-priority">
                                        <clinical-priority-filter placeholder="${"Priority: All"}" .priorities="${Object.values(this.opencgaSession?.study?.configuration?.clinical?.priorities ?? {}) ?? []}" @filterChange="${e => this.onFilterChange("priority", e.detail.value)}"></clinical-priority-filter>
                                    </div>
                                    ` : null}
                                    
                                    ${~this._config.filter.sections[0].fields.findIndex(field => field.id === "assignee") ? html`
                                    <!-- Assignees -->
                                    <div class="btn-group">
                                        <select-field-filter placeholder="Assignee: All" multiple .data="${this.users}" @filterChange="${e => this.onFilterChange("analystAssignee", e.detail.value)}"></select-field-filter>
                                    </div>
                                    ` : null}
                                    
                                    <!-- Buttons 
                                    <button type="button" class="btn btn-primary btn-sm ripple" @click="${this.updateQuery}">
                                            <i class="fa fa-search icon-padding" aria-hidden="true"></i> Filter
                                    </button>-->
                                </div>
                                
                                
                                ${false ? html`
                                    <div class="rhs" style="padding: 7px">
                                        <button type="button" class="btn btn-primary btn-sm ripple" @click="${this.clear}">
                                            <i class="fa fa-times icon-padding" aria-hidden="true"></i> Clear
                                        </button>
                                        <div class="dropdown saved-filter-wrapper">
                                            <button type="button" class="btn btn-primary btn-sm dropdown-toggle ripple" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                <i class="fa fa-filter icon-padding" aria-hidden="true"></i> Filters <span class="caret"></span>
                                            </button>
                                            <ul class="dropdown-menu">
                                                <li><a style="font-weight: bold">Saved Filters</a></li>
                                                ${this._filters && this._filters.length ?
                                                    this._filters.map(item => item.separator ? html`
                                                        <li role="separator" class="divider"></li>
                                                    ` : html`
                                                        <li>
                                                            <a data-filter-id="${item.id}" style="cursor: pointer;color: ${!item.active ? "black" : "green"}" title="${item.description ?? ""}" @click="${this.onServerFilterChange}" class="filtersLink">
                                                                <span class="id-filter-button">&nbsp;&nbsp;${item.id}</span>
                                                                <span class="delete-filter-button" title="Delete filter" data-filter-id="${item.id}" @click="${this.serverFilterDelete}"><i class="fas fa-times"></i></span>
                                                            </a>
                                                        </li>`) :
                                                    null }
    
                                                ${this.opencgaSession?.token ? html`
                                                    <li role="separator" class="divider"></li>
                                                    <li>
                                                        <a style="cursor: pointer" @click="${this.launchModal}"><i class="fa fa-floppy-o icon-padding" aria-hidden="true"></i> Save...</a>
                                                    </li>
                                                ` : null}
                                            </ul>
                                        </div>
                                    </div>
                                ` : null}
                                
                            </div>
                        </div>
                    </form>

                    <div style="margin-top: 25px">
                        <opencga-clinical-analysis-grid .opencgaSession="${this.opencgaSession}"
                                                        .query="${this._query}"
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
        ` : null;
    }

}

customElements.define("opencga-clinical-review-cases", OpencgaClinicalReviewCases);
