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
            filters: {
                type: Object,
                notify: true //TODO recheck notify
            },
            search: {
                type: Object,
                notify: true //TODO recheck notify
            },
            config: {
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

    sampleObserver() {
        this.dispatchEvent(new CustomEvent("samplechange", {
            detail: {
                samples: this.samples
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

    onActiveFilterChange(e) {
        this.query = e.detail;
        this.search = e.detail;
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

        if (e.target.dataset.view === "AggregationStats") {
            this.executeFacet();
        }
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
        ` : null }
        
        <div class="row" style="padding: 0px 10px">
            <div class="col-md-2">
                <opencga-sample-filter .opencgaSession="${this.opencgaSession}"
                                       .config="${this._config.filter}"
                                       .samples="${this.samples}"
                                       .opencgaClient="${this.opencgaSession.opencgaClient}"
                                       .query="${this.query}"
                                       .search="${this.search}">
                </opencga-sample-filter>
            </div>

            <div class="col-md-10">
                <opencga-active-filters .opencgaClient="${this.opencgaClient}"
                                        .query="${this.query}"
                                        .defaultStudy="${this.opencgaSession.study.alias}"
                                        .config="${this.filtersConfig}"
                                        .alias="${this.activeFilterAlias}"
                                        .refresh="${this.search}"
                                        @activeFilterClear="${this.onClear}"
                                        @activeFilterChange="${this.onActiveFilterChange}">
                </opencga-active-filters>

                <!-- Sample View Buttons -->
                <div class="col-md-12" style="padding: 5px 0px 5px 0px">
                    <div class="btn-toolbar" role="toolbar" aria-label="..." style="padding: 10px 0px;margin-left: 0px">
                        <div class="btn-group" role="group" style="margin-left: 0px">
                            <button type="button" class="btn btn-success sample-browser-view-buttons active" data-view="TableResult" @click="${this._changeView}"  data-id="table">
                                <i class="fa fa-table icon-padding" aria-hidden="true" data-view="TableResult" @click="${this._changeView}"></i> Table Result
                            </button>
                            <button type="button" class="btn btn-success sample-browser-view-buttons" data-view="AggregationStats" @click="${this._changeView}">
                                <i class="fa fa-line-chart icon-padding" aria-hidden="true" data-view="AggregationStats" @click="${this._changeView}"></i> Aggregation Stats
                            </button>
                            <button type="button" class="btn btn-success sample-browser-view-buttons" data-view="SampleComparator" @click="${this._changeView}"  data-id="comparator">
                                <i class="fa fa-users icon-padding" aria-hidden="true" data-view="SampleComparator" @click="${this._changeView}"></i> Sample Comparator
                            </button>
                        </div>
                    </div>
                </div>


                <!-- Sample View Content -->
                <div>
                    <div id="${this._prefix}TableResult" class="sample-browser-view-content">
                        <opencga-sample-grid .opencgaSession="${this.opencgaSession}" .config="${this._config.grid}"
                                             .samples="${this.samples}" .search="${this.search}" style="font-size: 12px"
                                             @selectsample="${this.onSelectSample}" ?active="${this.activeMenu.table}">
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

                    <div id="${this._prefix}AggregationStats" class="sample-browser-view-content" style="display: none">
                        <opencga-facet-view .opencgaSession="${this.opencgaSession}" entity="SAMPLE"
                                            .variableSets="${this.variableSets}"></opencga-facet-view>
                    </div>

                    <div id="${this._prefix}SampleComparator" class="sample-browser-view-content" style="display: none">
                        <opencga-sample-grid .opencgaSession="${this.opencgaSession}" .config="${this._config.gridComparator}"
                                             .samples="${this.samples}" .search="${this.search}" style="font-size: 12px"
                                             ?active="${this.activeMenu.comparator}">
                        </opencga-sample-grid>

                        <div style="padding-top: 5px">
                            <h3>Annotation comparator</h3>
                            <opencga-annotation-viewer .opencgaClient="${this.opencgaSession.opencgaClient}"
                                                       .opencgaSession="${this.opencgaSession}" .config="${this._config}"
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
