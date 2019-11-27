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
import "./opencga-cohort-filter.js";
import "./opencga-cohort-grid.js";
import "../../opencga-active-filters.js";
import "../variableSets/opencga-annotation-comparator.js";
import "../variableSets/opencga-annotation-viewer.js";
import "../../commons/opencga-facet-view.js";


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
            search: {
                type: Object,
                notify: true
            },
            config: {
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
    }

    connectedCallback() {
        super.connectedCallback();

        this.activeMenu = {
            table: true,
            comparator: false
        };

        this.detailActiveTabs = {
            info: true,
            sampleGrid: false
        };
    }

    configObserver() {
        this._config = Object.assign(this.getDefaultConfig(), this.config);
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

        if (e.target.dataset.view === "AggregationStats") {
            this.executeFacet();
        }
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

    onClear() {
        this.config = Object.assign(this.getDefaultConfig(), this.config);
        this.query = {};
        // this.query = {studies: this.opencgaSession.project.alias + ":" + this.opencgaSession.study.alias};
        this.search = {};
    }

    onActiveFilterChange(e) {
        this.query = e.detail;
        this.search = e.detail;
    }

    _changeBottomTab(e) {
        const _activeTabs = {
            info: e.currentTarget.dataset.id === "info",
            sampleGrid: e.currentTarget.dataset.id === "sampleGrid"
        };

        // this.set("detailActiveTabs", _activeTabs);
        this.detailActiveTabs = _activeTabs;
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
            variableSetIds: []
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
                                       .search="${this.search}">
                </opencga-cohort-filter>
            </div>

            <div class="col-md-10">
                <opencga-active-filters .opencgaClient="${this.opencgaClient}"
                                        .query="${this.query}"
                                        .filters="${this._config.filters}"
                                        .defaultStudy="${this.opencgaSession.study.alias}"
                                        .config="${this.filtersConfig}"
                                        .alias="${this.activeFilterAlias}"
                                        .refresh="${this.search}"
                                        @activeFilterClear="${this.onClear}"
                                        @activeFilterChange="${this.onActiveFilterChange}">
                </opencga-active-filters>

                <!-- Cohort View Buttons -->
                <div style="padding: 5px 0px 5px 0px">
                    <div class="btn-toolbar" role="toolbar" aria-label="..." style="padding: 10px 0px;margin-left: 0px">
                        <div class="btn-group" role="group" style="margin-left: 0px">
                            <button type="button" class="btn btn-success cohort-browser-view-buttons active" data-view="TableResult" @click="${this._changeView}" data-id="table">
                                <i class="fa fa-table icon-padding" aria-hidden="true" data-view="TableResult" @click="${this._changeView}" data-id="table"></i> Table Result
                            </button>
                            <button type="button" class="btn btn-success cohort-browser-view-buttons" data-view="AggregationStats" @click="${this._changeView}">
                                <i class="fa fa-line-chart icon-padding" aria-hidden="true" data-view="AggregationStats" @click="${this._changeView}"></i> Aggregation Stats
                            </button>
                            <button type="button" class="btn btn-success cohort-browser-view-buttons" data-view="CohortComparator" @click="${this._changeView}" data-id="comparator">
                                <i class="fa fa-users icon-padding" aria-hidden="true" data-view="CohortComparator" @click="${this._changeView}" data-id="comparator"></i> Cohort Comparator
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Cohort View Content -->
                <div>
                    <div id="${this._prefix}TableResult" class="cohort-browser-view-content">
                        <opencga-cohort-grid .opencgaClient="${this.opencgaSession.opencgaClient}"
                                             .opencgaSession="${this.opencgaSession}"
                                             .config="${this._config.grid}"
                                             .eventNotifyName="${this.eventNotifyName}"
                                             .search="${this.search}"
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

                    <div id="${this._prefix}AggregationStats" class="cohort-browser-view-content" style="display: none;" >
                        <opencga-facet-view .opencgaSession="${this.opencgaSession}"
                                            .variableSets="[[variableSets]]"
                                            entity="COHORT">
                        </opencga-facet-view>
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

