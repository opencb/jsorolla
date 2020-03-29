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
import Utils from "../../utils.js";
import PolymerUtils from "../PolymerUtils.js";
import "./opencga-clinical-analysis-filter.js";
import "./opencga-clinical-analysis-grid.js";
import "../opencga-active-filters.js";


export default class OpencgaClinicalAnalysisBrowser_old extends LitElement {

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
            opencgaClient: {
                type: Object
            },
            search: {
                type: Object,
                notify: true // todo check notify
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
        this._prefix = "ocab-" + Utils.randomString(6) + "_";
        this.analyses = [];
        this._config = this.getDefaultConfig();
        this.activeMenu = {
            table: true
        };

        //it is defined in opencga-clinical-analysis-grid, it must be initialized here because clinical-analysis-view have it as prop
        this.analysis = {};
        this.query = {};
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaClient")) {
            //this.renderAnalysisTable();
        }
        if (changedProperties.has("config")) {
            this.configObserver();
        }
        if (changedProperties.has("query")) {
            this.queryObserver();
        }
    }

    firstUpdated(_changedProperties) {
    }

    configObserver() {
        this._config = Object.assign(this.getDefaultConfig(), this.config);
    }

    queryObserver() {
        if (this.query) {
            this.preparedQuery = {...this.query};
            this.executedQuery ={...this.query};
        }
        this.requestUpdate();
    }

    analysisObserver() {
        this.dispatchEvent(new CustomEvent("analysischange", {
            detail: {
                analyses: this.analyses
            },
            bubbles: true, composed: true
        }));
    }

    onClear() {
        this._config = Object.assign(this.getDefaultConfig(), this.config);
        this.query = {};
        // this.query = {studies: this.opencgaSession.project.alias + ":" + this.opencgaSession.study.alias};
        this.search = {};
    }

    onSelectClinicalAnalysis(e) {
        this.analysis = e.detail.analysis;
    }

    _changeBottomTab(e) {
        const _activeTabs = {
            info: e.currentTarget.dataset.id === "info"
            // familyGrid: e.currentTarget.dataset.id === "familyGrid"
        };

        this.detailActiveTabs = _activeTabs;
    }

    _changeView(e) {
        e.preventDefault(); // prevents the hash change to "#" and allows to manipulate the hash fragment as needed

        const activeMenu = {
            table: e.currentTarget.dataset.id === "table"
            // comparator: e.currentTarget.dataset.id === "comparator"
        };
        this.activeMenu = activeMenu;

        $(".clinical-analysis-browser-view-content").hide(); // hides all content divs
        if (typeof e.target !== "undefined" && typeof e.target.dataset.view !== "undefined") {
            PolymerUtils.show(this._prefix + e.target.dataset.view);
        }

        // Show the active button
        $(".analysis-browser-view-buttons").removeClass("active");
        $(e.target).addClass("active");

        if (e.target.dataset.view === "Summary") {
            this.SummaryActive = true;
            this.requestUpdate();
        } else {
            this.SummaryActive = false;
        }
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

    //TODO recheck if there is a default param
    onActiveFilterChange(e) {
        console.log("onActiveFilterChange on clinical analysis browser", e.detail)
        this.preparedQuery = {...e.detail};
        this.query = {...e.detail};
        this.requestUpdate();
    }

    onActiveFilterClear() {
        this.query = {};
        //this.search = {};
        this.preparedQuery = {};
        this.requestUpdate();
    }

    getDefaultConfig() {
        return {
            title: "Clinical Analysis Browser",
            showTitle: true,
            showAggregationStats: true,
            showComparator: true,
            filter: {},
            grid: {
                pageSize: 10,
                pageList: [10, 25, 50],
                detailView: false,
                multiSelection: false
            },
            gridComparator: {
                pageSize: 5,
                pageList: [5, 10],
                detailView: true,
                multiSelection: true
            },
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
            <div class="page-title">
                <h2>
                    <i class="fa fa-users" aria-hidden="true"></i> </i>&nbsp;${this._config.title}
                </h2>
            </div>` : null}
            

        <div class="row" style="padding: 0px 10px">
            <div class="col-md-2">
                <opencga-clinical-analysis-filter   .opencgaSession="${this.opencgaSession}"
                                                    .config="${this._config.filter}"
                                                    .analyses="${this.analyses}"
                                                    .search="${this.search}"
                                                    .query="${this.query}"
                                                    @queryChange="${this.onQueryFilterChange}"
                                                    @querySearch="${this.onQueryFilterSearch}">
                </opencga-clinical-analysis-filter>
            </div>

            <div class="col-md-10">
                <opencga-active-filters .opencgaSession="${this.opencgaSession}"
                                        .query="${this.preparedQuery}"
                                        .refresh="${this.executedQuery}"
                                        .defaultStudy="${this.opencgaSession.study.alias}"
                                        .config="${this.filtersConfig}"
                                        .alias="${this.activeFilterAlias}"
                                        @activeFilterClear="${this.onActiveFilterClear}"
                                        @activeFilterChange="${this.onActiveFilterChange}">
                </opencga-active-filters>


                <!-- Clinical Analysis View Buttons -->
                <div class="col-md-12" style="padding: 5px 0px 5px 0px">
                    <div class="btn-toolbar" role="toolbar" aria-label="..." style="padding: 10px 0px;margin-left: 0px">
                        <div class="btn-group" role="group" style="margin-left: 0px">
                            <button type="button" class="btn btn-success analysis-browser-view-buttons ripple active" data-view="TableResult" @click="${this._changeView}" data-id="table">
                                <i class="fa fa-table icon-padding" aria-hidden="true" data-view="TableResult" @click="${this._changeView}" data-id="table"></i> Table Result
                            </button>
                            <button type="button" class="btn btn-success analysis-browser-view-buttons ripple" data-view="Summary" @click="${this._changeView}">
                                <i class="fas fa-chart-bar icon-padding" aria-hidden="true" data-view="Summary" @click="${this._changeView}"></i> Summary Stats
                            </button>
                            <!--<button type="button" class="btn btn-success analysis-browser-view-buttons" data-view="FamilyComparator" on-click="_changeView" data-id="comparator">-->
                                <!--<i class="fa fa-users icon-padding" aria-hidden="true" data-view="FamilyComparator" on-click="_changeView" data-id="comparator"></i> Family Comparator-->
                            <!--</button>-->
                        </div>
                    </div>
                </div>

                <div>
                    <div id="${this._prefix}TableResult" class="clinical-analysis-browser-view-content">
                        <opencga-clinical-analysis-grid .opencgaSession="${this.opencgaSession}"
                                                        .config="${this._config.grid}"
                                                        .analyses="${this.analyses}"
                                                        .query="${this.executedQuery}"
                                                        .search="${this.executedQuery}"
                                                        style="font-size: 12px"
                                                        .active="${this.activeMenu.table}"
                                                        @selectanalysis="${this.onSelectClinicalAnalysis}">
                        </opencga-clinical-analysis-grid>

                        <div style="padding-top: 5px">
                            <ul id="${this._prefix}ViewTabs" class="nav nav-tabs" role="tablist">
                                <li role="presentation" class="active">
                                    <a href="#${this._prefix}SampleViewer" role="tab" data-toggle="tab" class="detail-tab-title">
                                        Clinical Analysis Info
                                    </a>
                                </li>
                            </ul>

                            <div class="tab-content" style="height: 680px">
                                <div role="tabpanel" class="tab-pane active" id="${this._prefix}SampleViewer">
                                    <clinical-analysis-view .opencgaSession="${this.opencgaSession}"
                                                            .opencgaClient="${this.opencgaSession.opencgaClient}"
                                                            .clinicalAnalysisId="${this.analysis.id}"
                                                            .config="${this._config.sampleDetail}"
                                                            style="font-size: 12px;">
                                    </clinical-analysis-view>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="${this._prefix}Summary" class="clinical-analysis-browser-view-content" style="display: none">
                        Work in progress
                        <!--<opencga-facet-view opencga-session="{{opencgaSession}}" entity="FAMILY"-->
                                            <!--variable-sets="[[variableSets]]"></opencga-facet-view>-->
                    </div>
                </div>
            </div>
        </div>
        `;
    }

}

customElements.define("opencga-clinical-analysis-browser", OpencgaClinicalAnalysisBrowser_old);

