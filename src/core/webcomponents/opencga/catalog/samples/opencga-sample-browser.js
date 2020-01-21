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

//TODO check functionality

import {LitElement, html} from '/web_modules/lit-element.js';

import "./opencga-sample-filter.js";
import "./opencga-sample-grid.js";
import "../../opencga-active-filters.js";
import "../variableSets/opencga-annotation-comparator.js";
import "../../commons/opencga-facet-view.js";

export default class OpencgaSampleBrowser extends LitElement {

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
            },
            config: {
                type: Object
            },
            filters: {
                type: Object,
                notify: true //TODO recheck notify
            },
            //TODO remove
            search: {
                type: Object,
                notify: true
            },
            query: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "osb-" + Utils.randomString(6);
        this.samples = [];
        this._config = this.getDefaultConfig();
        this.filtersConfig = {
            complexFields: ["annotation"]
        };
        this.query = {};

    }

    firstUpdated(_changedProperties) {

    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.filterAvailableVariableSets();
        }
        if (changedProperties.has("config")) {
            this.filterAvailableVariableSets();
            this.configObserver();
        }
        if (changedProperties.has("opencgaClient")) {
            //this.renderAnalysisTable();
        }
        if (changedProperties.has("filters")) {
            this.onFilterUpdate();
        }
        if (changedProperties.has("query")) {
            this.queryObserver();
        }
    }

    //TODO recheck functionality
    connectedCallback() {
        super.connectedCallback();

        this.activeMenu = {
            table: true,
            comparator: false
        };
    }

    configObserver() {
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    //TODO recheck if sample-browser needs study param in query
    queryObserver() {
        // Query passed is executed and set to variant-filter, active-filters and variant-grid components
        let _query = {};
        if (UtilsNew.isEmpty(this.query) && UtilsNew.isNotUndefinedOrNull(this.opencgaSession) && UtilsNew.isNotUndefinedOrNull(this.opencgaSession.study)) {
            _query = {
                study: this.opencgaSession.study.fqn
            };
        }

        if (UtilsNew.isNotUndefinedOrNull(this.query)) {
            this.preparedQuery = {..._query, ...this.query};
            this.executedQuery ={..._query, ...this.query};
        }
        // onServerFilterChange() in opencga-active-filters drops a filterchange event when the Filter dropdown is used
        this.requestUpdate();
    }

    sampleObserver() {
        this.dispatchEvent(new CustomEvent("samplechange", {
            detail: {
                samples: this.samples
            },
            bubbles: true, composed: true
        }));
    }

    onSelectSample(e) {
        this.sample = e.detail.sample;
    }

    _changeView(e) {
        e.preventDefault(); // prevents the hash change to "#" and allows to manipulate the hash fragment as needed

        let activeMenu = {
            table: e.currentTarget.dataset.id === "table",
            comparator: e.currentTarget.dataset.id === "comparator"
        };
        this.activeMenu = activeMenu;

        $('.sample-browser-view-content').hide(); // hides all content divs
        if (typeof e.target !== "undefined" && typeof e.target.dataset.view !== "undefined") {
            PolymerUtils.show(this._prefix + e.target.dataset.view);
        }

        // Show the active button
        $('.sample-browser-view-buttons').removeClass("active");
        $(e.target).addClass("active");

        if (e.target.dataset.view === "Summary") {
            this.SummaryActive = true;
            this.requestUpdate();
        } else {
            this.SummaryActive = false;
        }

        this.requestUpdate();
    }

    filterAvailableVariableSets() {
        if (this._config.variableSetIds.length === 0 && UtilsNew.isNotUndefinedOrNull(this.opencgaSession.study)) {
            this.variableSets = this.opencgaSession.study.variableSets;
        } else {
            let variableSets = [];
            if (UtilsNew.isNotUndefinedOrNull(this.opencgaSession.study) && UtilsNew.isNotEmptyArray(this.opencgaSession.study.variableSets)) {
                for (let i = 0; i < this.opencgaSession.study.variableSets.length; i++) {
                    if (this._config.variableSetIds.indexOf(this.opencgaSession.study.variableSets[i].id) !== -1) {
                        variableSets.push(this.opencgaSession.study.variableSets[i]);
                    }
                }
            }
            this.variableSets = variableSets;
        }
    }

    executeFacet() {

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

    //TODO recheck what's/if there is a default param in sample-browser. study key comes from variant-browser.
    onActiveFilterChange(e) {
        console.log("onActiveFilterChange on sample browser", e.detail)
        //TODO FIXME!! study prop have to be wiped off! use studies instead
        this.preparedQuery = {study: this.opencgaSession.project.alias + ":" + this.opencgaSession.study.alias, ...e.detail};
        this.query = {study: this.opencgaSession.project.alias + ":" + this.opencgaSession.study.alias, ...e.detail};
        this.requestUpdate();
    }

    onActiveFilterClear() {
        this._config = Object.assign(this.getDefaultConfig(), this.config);
        this.query = {};
        // this.query = {studies: this.opencgaSession.project.alias + ":" + this.opencgaSession.study.alias};
        //this.search = {};
        this.preparedQuery = {};
        this.requestUpdate();
    }

    getDefaultConfig() {
        return {
            title: "Sample Browser",
            showTitle: true,
            showAggregationStats: true,
            showComparator: true,
            filter: {

            },
            grid: {
                pageSize: 10,
                pageList: [10, 25, 50],
                multiSelection: false,
            },
            gridComparator: {
                pageSize: 5,
                pageList: [5, 10],
                multiSelection: true,
            },
            sampleDetail: {
                showTitle: false
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
        ` : null }
        
        <div class="row" style="padding: 0px 10px">
            <div class="col-md-2">
                <opencga-sample-filter .opencgaSession="${this.opencgaSession}"
                                       .config="${this._config.filter}"
                                       .samples="${this.samples}"
                                       .opencgaClient="${this.opencgaSession.opencgaClient}"
                                       .query="${this.query}"
                                        @queryChange="${this.onQueryFilterChange}"
                                        @querySearch="${this.onQueryFilterSearch}">
                </opencga-sample-filter>
            </div>

            <div class="col-md-10">
                <opencga-active-filters .opencgaClient="${this.opencgaClient}"
                                        .query="${this.preparedQuery}"
                                        .refresh="${this.executedQuery}"
                                        .defaultStudy="${this.opencgaSession.study.alias}"
                                        .config="${this.filtersConfig}"
                                        .alias="${this.activeFilterAlias}"
                                        @activeFilterClear="${this.onActiveFilterClear}"
                                        @activeFilterChange="${this.onActiveFilterChange}">
                </opencga-active-filters>

                <!-- Sample View Buttons -->
                <div class="col-md-12" style="padding: 5px 0px 5px 0px">
                    <div class="btn-toolbar" role="toolbar" aria-label="..." style="padding: 10px 0px;margin-left: 0px">
                        <div class="btn-group" role="group" style="margin-left: 0px">
                            <button type="button" class="btn btn-success sample-browser-view-buttons active ripple" data-view="TableResult" @click="${this._changeView}"  data-id="table">
                                <i class="fa fa-table icon-padding" aria-hidden="true" data-view="TableResult" @click="${this._changeView}"></i> Table Result
                            </button>
                            <button type="button" class="btn btn-success sample-browser-view-buttons ripple" data-view="Summary" @click="${this._changeView}">
                                <i class="fas fa-chart-bar icon-padding" aria-hidden="true" data-view="Summary" @click="${this._changeView}"></i> Summary Stats
                            </button>
                            <button type="button" class="btn btn-success sample-browser-view-buttons ripple" data-view="SampleComparator" @click="${this._changeView}"  data-id="comparator">
                                <i class="fa fa-users icon-padding" aria-hidden="true" data-view="SampleComparator" @click="${this._changeView}"></i> Sample Comparator
                            </button>
                        </div>
                    </div>
                </div>


                <!-- Sample View Content -->
                <div>
                    <div id="${this._prefix}TableResult" class="sample-browser-view-content">
                        <opencga-sample-grid .opencgaSession="${this.opencgaSession}"
                                             .query="${this.executedQuery}"
                                             .search="${this.executedQuery}"
                                             .config="${this._config.grid}"
                                             .samples="${this.samples}"
                                             .active="${this.activeMenu.table}"
                                             style="font-size: 12px"
                                             @selectsample="${this.onSelectSample}">
                        </opencga-sample-grid>

                        <!--<div style="padding-top: 5px">-->
                            <!--<ul id="${this._prefix}ViewTabs" class="nav nav-tabs" role="tablist">-->
                                <!--<li role="presentation" class="active">-->
                                    <!--<a href="#${this._prefix}SampleViewer" role="tab" data-toggle="tab" class="detail-tab-title">-->
                                        <!--Sample Info-->
                                    <!--</a>-->
                                <!--</li>-->
                            <!--</ul>-->

                            <!--<div class="tab-content" style="height: 680px">-->
                                <!--<div role="tabpanel" class="tab-pane active" id="${this._prefix}SampleViewer">-->
                                    <!--<opencga-sample-view opencga-client="{{opencgaSession.opencgaClient}}"-->
                                                         <!--opencga-session="{{opencgaSession}}" sample-id="{{sample.id}}" config="{{_config.sampleDetail}}"-->
                                                         <!--style="font-size: 12px;">-->
                                        <!--&lt;!&ndash;opencga-client="{{opencgaSession.opencgaClient}}" &ndash;&gt;-->
                                        <!--&lt;!&ndash;opencga-session="{{opencgaSession}}" config="[[_config]]"&ndash;&gt;-->
                                    <!--</opencga-sample-view>-->
                                <!--</div>-->

                            <!--</div>-->
                        <!--</div>-->
                    </div>

                    <!--TODO refactor is missing here -->
                    <div id="${this._prefix}Summary" class="sample-browser-view-content" style="display: none">
                         <opencb-facet-query resource="samples"
                                            .opencgaSession="${this.opencgaSession}"
                                            .cellbaseClient="${this.cellbaseClient}"  
                                            .config="${this._config}"
                                            .query="${this.executedQuery}"
                                            .active="${this.SummaryActive}">
                        </opencb-facet-query>
                    </div>

                    <div id="${this._prefix}SampleComparator" class="sample-browser-view-content" style="display: none">
                        <opencga-sample-grid .opencgaSession="${this.opencgaSession}"
                                             .config="${this._config.gridComparator}"
                                             .samples="${this.samples}"
                                             .search="${this.search}" style="font-size: 12px"
                                             ?active="${this.activeMenu.comparator}">
                        </opencga-sample-grid>

                        <div style="padding-top: 5px">
                            <h3>Annotation comparator</h3>
                            <opencga-annotation-viewer .opencgaClient="${this.opencgaSession.opencgaClient}"
                                                       .opencgaSession="${this.opencgaSession}"
                                                       .config="${this._config}"
                                                       .entryIds="${this.samples}" entity="SAMPLE">
                            </opencga-annotation-viewer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }
}

customElements.define('opencga-sample-browser', OpencgaSampleBrowser);
