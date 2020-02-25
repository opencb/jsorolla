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
import Utils from "./../../../../utils.js";
import UtilsNew from "../../../../utilsNew.js";
import PolymerUtils from "../../../PolymerUtils.js";
import "./opencga-cohort-grid.js";
import "../../opencga-active-filters.js";
import "../variableSets/opencga-annotation-comparator.js";
import "../variableSets/opencga-annotation-viewer.js";
import "../../commons/opencga-facet-view.js";
import "./opencga-cohort-filter.js";


export default class OpencgaCohortBrowser extends LitElement {

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
            opencgaClient: {
                type: Object
                // observer: "renderAnalysisTable" TODO it doesn't exist
            },
            filters: {
                type: Object,
                notify: true
                // observer: "onFilterUpdate" TODO it doesn't exist
            },
            //TODO remove
            search: {
                type: Object,
                notify: true
            },
            config: {
                type: Object
            },
            query: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "ocb-" + Utils.randomString(6) + "_";

        this.cohorts = [];
        this.sampleSearch = {id: "nonexisting"};

        this._config = this.getDefaultConfig();

        this.filtersConfig = {
            complexFields: ["annotation"]
        };

        if (UtilsNew.isUndefinedOrNull(this._selectedCohortsComparator)) {
            this._selectedCohortsComparator = {
                set: new Set(),
                array: []
            };
        }

        //TODO active flag of Summary tab have to be included here
        this.activeMenu = {
            table: true,
            comparator: false
        };

        this.detailActiveTabs = {
            info: true,
            sampleGrid: false
        };
    }

    updated(changedProperties) {
        if (changedProperties.has("config")) {
            this.configObserver();
        }
        if (changedProperties.has("opencgaSession") || changedProperties.has("config")) {
            this.filterAvailableVariableSets();
        }
        if (changedProperties.has("cohorts")) {
            this.cohortObserver();
        }
        if (changedProperties.has("query")) {
            this.queryObserver();
        }
    }

    configObserver() {
        this._config = Object.assign(this.getDefaultConfig(), this.config);
    }

    queryObserver() {
        if (this.query) {
            this.preparedQuery = {...this.query};
            this.executedQuery ={...this.query};
        }
        // onServerFilterChange() in opencga-active-filters drops a filterchange event when the Filter dropdown is used
        this.requestUpdate();
    }

    _changeView(e) {
        e.preventDefault(); // prevents the hash change to "#" and allows to manipulate the hash fragment as needed

        const activeMenu = {
            table: e.currentTarget.dataset.id === "table",
            comparator: e.currentTarget.dataset.id === "comparator"
        };
        // this.set("activeMenu", activeMenu);
        this.activeMenu = activeMenu;

        $(".cohort-browser-view-content").hide(); // hides all content divs
        if (typeof e.target !== "undefined" && typeof e.target.dataset.view !== "undefined") {
            PolymerUtils.show(this._prefix + e.target.dataset.view);
        }

        // Show the active button
        $(".cohort-browser-view-buttons").removeClass("active");
        $(e.target).addClass("active");

        if (e.target.dataset.view === "Summary") {
            this.SummaryActive = true;
            this.requestUpdate();
        } else {
            this.SummaryActive = false;
        }

        this.requestUpdate();
    }

    onSelectCohort(e) {
        const sampleList = [];
        for (let i = 0; i < e.detail.cohort.samples.length; i++) {
            sampleList.push(e.detail.cohort.samples[i].id);
        }

        this.sampleSearch = {
            id: sampleList.join(",")
        };
    }

    onSelectCohortComparator(e) {
        /*if (UtilsNew.isUndefinedOrNull(this._selectedCohortsComparator)) {
            this._selectedCohortsComparator = {
                set: new Set(),
                array: []
            };
        }*/
        if (e.detail.checked) {
            this._selectedCohortsComparator.set.add(e.detail.cohort);
        } else {
            this._selectedCohortsComparator.set.delete(e.detail.cohort);
        }
        // this.set("_selectedCohortsComparator.array", Array.from(this._selectedCohortsComparator.set));
        this._selectedCohortsComparator.array = Array.from(this._selectedCohortsComparator.set);

    }

    filterAvailableVariableSets() {
        if (this._config.variableSetIds.length === 0) {
            this.variableSets = this.opencgaSession.study.variableSets;
        } else {
            const variableSets = [];
            for (let i = 0; i < this.opencgaSession.study.variableSets.length; i++) {
                if (this._config.variableSetIds.indexOf(this.opencgaSession.study.variableSets[i].id) !== -1) {
                    variableSets.push(this.opencgaSession.study.variableSets[i]);
                }
            }
            this.variableSets = variableSets;
        }
    }

    executeFacet() {

    }

    cohortObserver() {
        this.dispatchEvent(new CustomEvent("cohortchange", {
            detail: {
                cohorts: this.cohorts
            },
            bubbles: true, composed: true
        }));
    }

    _changeBottomTab(e) {
        const _activeTabs = {
            info: e.currentTarget.dataset.id === "info",
            sampleGrid: e.currentTarget.dataset.id === "sampleGrid"
        };

        // this.set("detailActiveTabs", _activeTabs);
        this.detailActiveTabs = _activeTabs;
    }

    onQueryFilterChange(e) {
        console.log("onQueryFilterChange on sample browser", e.detail.query);
        this.preparedQuery = e.detail.query;
        this.requestUpdate();
    }

    onQueryFilterSearch(e) {
        this.preparedQuery = e.detail.query;
        this.executedQuery = e.detail.query;
        this.requestUpdate();
    }

    onActiveFilterChange(e) {
        console.log("onActiveFilterChange on cohort browser", e.detail)
        this.preparedQuery = {...e.detail};
        this.query = {...e.detail};
        this.requestUpdate();
    }

    onActiveFilterClear() {
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.query = {};
        //this.search = {};
        this.preparedQuery = {};
        this.requestUpdate();
    }

    getDefaultConfig() {
        return {
            title: "Cohort Browser",
            showTitle: true,
            showAggregationStats: true,
            showComparator: true,
            filter: {

            },
            grid: {

            },
            gridComparator: {
                multiSelection: true,
                pageSize: 5,
                pageList: [5, 10]
            },
            variableSetIds: [],
            summary: {
                fields: ["name"]
            }
        };
    }

    render() {
        return html`
        <style include="jso-styles">
            .icon-padding {
                padding-left: 4px;
                padding-right: 5px;
            }

            .detail-tab-title {
                font-size: 115%;
                font-weight: bold;
            }
        </style>

        ${this._config.showTitle ? html`
            <div class="panel" style="margin-bottom: 15px">
                <h3 style="margin: 10px 10px 10px 15px">
                    <i class="fa fa-users" aria-hidden="true"></i> &nbsp;${this._config.title}
                </h3>
            </div>
        ` : null}
        
        <div class="row" style="padding: 0px 10px">
            <div class="col-md-2">
                <opencga-cohort-filter .opencgaSession="${this.opencgaSession}"
                                       .config="${this._config}"
                                       .cohorts="${this.cohorts}"
                                       .opencgaClient="${this.opencgaSession.opencgaClient}"
                                       .query="${this.query}"
                                       .search="${this.search}"
                                        @queryChange="${this.onQueryFilterChange}"
                                        @querySearch="${this.onQueryFilterSearch}">
                </opencga-cohort-filter>
            </div>

            <div class="col-md-10">
                <opencga-active-filters .opencgaClient="${this.opencgaSession.opencgaClient}"
                                        .query="${this.preparedQuery}"
                                        .refresh="${this.executedQuery}"
                                        .filters="${this._config.filters}"
                                        .defaultStudy="${this.opencgaSession.study.alias}"
                                        .config="${this.filtersConfig}"
                                        .alias="${this.activeFilterAlias}"
                                        @activeFilterClear="${this.onActiveFilterClear}"
                                        @activeFilterChange="${this.onActiveFilterChange}">
                </opencga-active-filters>

                <!-- Cohort View Buttons -->
                <div style="padding: 5px 0px 5px 0px">
                    <div class="btn-toolbar" role="toolbar" aria-label="..." style="padding: 10px 0px;margin-left: 0px">
                        <div class="btn-group" role="group" style="margin-left: 0px">
                            <button type="button" class="btn btn-success cohort-browser-view-buttons ripple active" data-view="TableResult" @click="${this._changeView}" data-id="table">
                                <i class="fa fa-table icon-padding" aria-hidden="true" data-view="TableResult" @click="${this._changeView}" data-id="table"></i> Table Result
                            </button>
                            <button type="button" class="btn btn-success cohort-browser-view-buttons ripple" data-view="Summary" @click="${this._changeView}">
                                <i class="fas fa-chart-bar icon-padding" aria-hidden="true" data-view="Summary" @click="${this._changeView}"></i> Summary Stats
                            </button>
                            <button type="button" class="btn btn-success cohort-browser-view-buttons ripple" data-view="CohortComparator" @click="${this._changeView}" data-id="comparator">
                                <i class="fa fa-users icon-padding" aria-hidden="true" data-view="CohortComparator" @click="${this._changeView}" data-id="comparator"></i> Cohort Comparator
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Cohort View Content -->
                <div>
                    <div id="${this._prefix}TableResult" class="cohort-browser-view-content">
                        <opencga-cohort-grid .opencgaSession="${this.opencgaSession}"
                                             .opencgaClient="${this.opencgaSession.opencgaClient}"
                                             .query="${this.executedQuery}"
                                             .search="${this.executedQuery}"
                                             .config="${this._config.grid}"
                                             .eventNotifyName="${this.eventNotifyName}"
                                             .active="${this.activeMenu.table}"
                                             style="font-size: 12px"
                                             @selectcohort="${this.onSelectCohort}">
                        </opencga-cohort-grid>

                        <div style="padding-top: 5px">
                            <ul id="${this._prefix}ViewTabs" class="nav nav-tabs" role="tablist">

                                <li role="presentation" class="active">
                                    <a href="#${this._prefix}CohortViewer" role="tab" data-toggle="tab" class="detail-tab-title"
                                       data-id="info" @click="${this._changeBottomTab}">
                                        Cohort info
                                    </a>
                                </li>

                                <li role="presentation">
                                    <a href="#${this._prefix}SampleViewer" role="tab" data-toggle="tab" class="detail-tab-title"
                                       data-id="sampleGrid" @click="${this._changeBottomTab}">
                                        Sample grid
                                    </a>
                                </li>
                            </ul>

                            <div class="tab-content" style="height: 680px">
                                <div role="tabpanel" class="tab-pane active" id="${this._prefix}CohortViewer">
                                    Work in progress
                                </div>
                                <div role="tabpanel" class="tab-pane" id="${this._prefix}SampleViewer">
                                    <opencga-sample-grid .opencgaClient="${this.opencgaSession.opencgaClient}"
                                                         .opencgaSession="${this.opencgaSession}"
                                                         .search="${this.sampleSearch}"
                                                         .active="${this.detailActiveTabs.sampleGrid}"
                                                         style="font-size: 12px" >
                                    </opencga-sample-grid>
                                </div>

                            </div>
                        </div>
                    </div>

                    <div id="${this._prefix}Summary" class="cohort-browser-view-content" style="display: none;" >
                        <opencb-facet-query resource="cohorts"
                                            .opencgaSession="${this.opencgaSession}"
                                            .cellbaseClient="${this.cellbaseClient}"  
                                            .config="${this._config}"
                                            .query="${this.executedQuery}"
                                            .active="${this.SummaryActive}">
                        </opencb-facet-query>
                    </div>

                    <div id="${this._prefix}CohortComparator" class="cohort-browser-view-content" style="display: none">

                        <opencga-cohort-grid .opencgaClient="${this.opencgaSession.opencgaClient}"
                                             .opencgaSession="${this.opencgaSession}"
                                             .config="${this._config.gridComparator}"
                                             .eventNotifyName="${this.eventNotifyName}"
                                             .search="${this.search}"
                                             .active="${this.activeMenu.comparator}"
                                             style="font-size: 12px"
                                             @selectcohort="${this.onSelectCohortComparator}">
                        </opencga-cohort-grid>

                        <div style="padding-top: 5px">
                            <h3> Annotation comparator</h3>
                            <opencga-annotation-viewer .opencgaClient="${this.opencgaSession.opencgaClient}"
                                                       .opencgaSession="${this.opencgaSession}"
                                                       .config="${this._config}"
                                                       .entryIds="${this._selectedCohortsComparator.array}"
                                                       entity="COHORT">
                            </opencga-annotation-viewer>
                        </div>

                    </div>
                </div>
            </div>
        </div>
        `;
    }

}

customElements.define("opencga-cohort-browser", OpencgaCohortBrowser);

