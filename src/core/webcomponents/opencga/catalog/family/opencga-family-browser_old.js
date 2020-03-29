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

import {LitElement, html} from "/web_modules/lit-element.js";
import Utils from "./../../../../utils.js";
import UtilsNew from "../../../../utilsNew.js";
import PolymerUtils from "../../../PolymerUtils.js";
import "./opencga-family-filter.js";
import "./opencga-family-grid.js";
import "../../../commons/opencga-active-filters.js";
import "../variableSets/opencga-annotation-comparator.js";
import "../../../commons/opencga-facet-view.js";


export default class OpencgaFamilyBrowser_old extends LitElement {

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
            filters: {
                type: Object,
                notify: true
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
        this._prefix = "osb-" + Utils.randomString(6);

        this.families = [];

        this._config = this.getDefaultConfig();

        // this.filtersConfig = {
        //     complexFields: ["annotation"]
        // };
    }

    updated(changedProperties) {
        if (changedProperties.has("config")) {
            this.configObserver();
        }
        if (changedProperties.has("filters")) {
            this.onFilterUpdate();
        }
        if (changedProperties.has("opencgaClient")) {
            //this.renderAnalysisTable(); it doesn't exists
        }
        if (changedProperties.has("families")) {
            this.familyObserver();
        }
        if (changedProperties.has("opencgaSession") || changedProperties.has("config")) {
            this.filterAvailableVariableSets(this.opencgaSession, this.config);
        }
        if (changedProperties.has("query")) {
            this.queryObserver();
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

    queryObserver() {
        if (UtilsNew.isNotUndefinedOrNull(this.query)) {
            this.preparedQuery = {...this.query};
            this.executedQuery = {...this.query};
        }
        this.requestUpdate();
    }

    familyObserver() {
        this.dispatchEvent(new CustomEvent("familychange", {
            detail: {
                families: this.families
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

    onSelectFamily(e) {
        this.family = e.detail.family;

        const memberList = [];
        for (let i = 0; i < this.family.members.length; i++) {
            memberList.push(this.family.members[i].id);
        }

        this.memberSearch = {
            id: memberList.join(",")
        };

        this.dispatchEvent(new CustomEvent("selectfamily", {
            detail: {
                family: this.family
            }
        }));
    }

    _changeBottomTab(e) {
        const _activeTabs = {
            info: e.currentTarget.dataset.id === "info",
            sampleGrid: e.currentTarget.dataset.id === "sampleGrid"
        };

        this.detailActiveTabs = _activeTabs;
    }

    _changeView(e) {
        e.preventDefault(); // prevents the hash change to "#" and allows to manipulate the hash fragment as needed

        const activeMenu = {
            table: e.currentTarget.dataset.id === "table",
            comparator: e.currentTarget.dataset.id === "comparator"
        };

        this.activeMenu = activeMenu;

        $(".family-browser-view-content").hide(); // hides all content divs
        if (typeof e.target !== "undefined" && typeof e.target.dataset.view !== "undefined") {
            PolymerUtils.show(this._prefix + e.target.dataset.view);
        }

        // Show the active button
        $(".family-browser-view-buttons").removeClass("active");
        $(e.target).addClass("active");

        if (e.target.dataset.view === "Summary") {
            this.SummaryActive = true;
            this.requestUpdate();
        } else {
            this.SummaryActive = false;
        }
        this.requestUpdate();
    }

    filterAvailableVariableSets(opencgaSession, config) {
        if (this._config.variableSetIds.length === 0 && UtilsNew.isNotUndefinedOrNull(opencgaSession.study)) {
            this.variableSets = opencgaSession.study.variableSets;
        } else {
            const variableSets = [];
            if (UtilsNew.isNotUndefinedOrNull(opencgaSession.study) && UtilsNew.isNotEmptyArray(opencgaSession.study.variableSets)) {
                for (let i = 0; i < opencgaSession.study.variableSets.length; i++) {
                    if (this._config.variableSetIds.indexOf(opencgaSession.study.variableSets[i].id) !== -1) {
                        variableSets.push(opencgaSession.study.variableSets[i]);
                    }
                }
            }
            this.variableSets = variableSets;
        }
    }

    executeFacet() {

    }

    onQueryFilterChange(e) {
        console.log("onQueryFilterChange on family browser", e.detail.query);
        this.preparedQuery = e.detail.query;
        this.requestUpdate();
    }

    onQueryFilterSearch(e) {
        this.preparedQuery = e.detail.query;
        this.executedQuery = e.detail.query;
        this.requestUpdate();
    }

    onActiveFilterChange(e) {
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
            title: "Family Browser",
            showTitle: true,
            showAggregationStats: true,
            showComparator: true,
            filter: {},
            grid: {
                pageSize: 10,
                pageList: [10, 25, 50],
                detailView: true,
                multiSelection: false
            },
            gridComparator: {
                pageSize: 5,
                pageList: [5, 10],
                detailView: true,
                multiSelection: true
            },
            familyDetail: {
                showTitle: false
            },
            variableSetIds: [],
            activeFilters: {
                complexFields: ["annotation"]
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
            </div>
        ` : null}
        <div class="row" style="padding: 0px 10px">
            <div class="col-md-2">
                <opencga-family-filter .opencgaSession="${this.opencgaSession}"
                                       .config="${this._config.filter}"
                                       .families="${this.families}"
                                       .opencgaClient="${this.opencgaSession.opencgaClient}"
                                       .search="${this.search}"
                                       .query="${this.query}"
                                        @queryChange="${this.onQueryFilterChange}"
                                        @querySearch="${this.onQueryFilterSearch}">
                </opencga-family-filter>
            </div>

            <div class="col-md-10">
                <opencga-active-filters .opencgaSession="${this.opencgaSession}"
                                        .query="${this.preparedQuery}"
                                        .refresh="${this.executedQuery}"
                                        .defaultStudy="${this.opencgaSession.study.alias}"
                                        .config="${this._config.activeFilters}"
                                        .alias="${this.activeFilterAlias}"
                                        @activeFilterClear="${this.onActiveFilterClear}"
                                        @activeFilterChange="${this.onActiveFilterChange}">
                </opencga-active-filters>

                <!-- Family View Buttons -->
                <div class="col-md-12" style="padding: 5px 0px 5px 0px">
                    <div class="btn-toolbar" role="toolbar" aria-label="..." style="padding: 10px 0px;margin-left: 0px">
                        <div class="btn-group" role="group" style="margin-left: 0px">
                            <button type="button" class="btn btn-success family-browser-view-buttons ripple active" data-view="TableResult" @click="${this._changeView}" data-id="table">
                                <i class="fa fa-table icon-padding" aria-hidden="true" data-view="TableResult" @click="${this._changeView}" data-id="table"></i> Table Result
                            </button>
                            <button type="button" class="btn btn-success family-browser-view-buttons ripple " data-view="Summary" @click="${this._changeView}" .disabled="${!this._config.showAggregationStats}">
                                <i class="fas fa-chart-bar icon-padding" aria-hidden="true" data-view="Summary" @click="${this._changeView}"></i> Summary Stats
                            </button>
                            <button type="button" class="btn btn-success family-browser-view-buttons ripple " data-view="FamilyComparator" @click="${this._changeView}" data-id="comparator" .disabled="${!this._config.showComparator}">
                                <i class="fa fa-users icon-padding" aria-hidden="true" data-view="FamilyComparator" @click="${this._changeView}" data-id="comparator"></i> Family Comparator
                            </button>
                        </div>
                    </div>
                </div>


                <!-- Family View Content -->
                <div>
                    <div id="${this._prefix}TableResult" class="family-browser-view-content">
                        <opencga-family-grid .opencgaClient="${this.opencgaSession.opencgaClient}"
                                             .opencgaSession="${this.opencgaSession}"
                                             .query="${this.executedQuery}"
                                             .config="${this._config.grid}"
                                             .eventNotifyName="${this.eventNotifyName}"
                                             .families="${this.families}"
                                             .search="${this.search}"
                                             .active="${this.activeMenu.table}"
                                             @selectfamily="${this.onSelectFamily}">
                        </opencga-family-grid>
                    </div>

                    <div id="${this._prefix}Summary" class="family-browser-view-content" style="display: none">
                        <opencb-facet-query resource="families"
                                            .opencgaSession="${this.opencgaSession}"
                                            .cellbaseClient="${this.cellbaseClient}"  
                                            .config="${this._config}"
                                            .query="${this.executedQuery}"
                                            .active="${this.SummaryActive}">
                        </opencb-facet-query>
                    </div>

                    <div id="${this._prefix}FamilyComparator" class="family-browser-view-content" style="display: none">
                        <opencga-family-grid .opencgaClient="${this.opencgaSession.opencgaClient}"
                                             .opencgaSession="${this.opencgaSession}"
                                             .config="${this._config.gridComparator}"
                                             .eventNotifyName="${this.eventNotifyName}"
                                             .families="${this.families}"
                                             .search="${this.search}" style="font-size: 12px"
                                             .active="${this.activeMenu.comparator}">
                        </opencga-family-grid>

                        <div style="padding-top: 5px">
                            <h3> Annotation comparator</h3>
                            <opencga-annotation-viewer .opencgaClient="${this.opencgaSession.opencgaClient}"
                                                        .opencgaSession="${this.opencgaSession}"
                                                        .config="${this._config.gridComparator}"
                                                        .entryIds="${this.families}"
                                                        entity="INDIVIDUAL">
                            </opencga-annotation-viewer>
                        </div>

                    </div>
                </div>

            </div>
        </div>
        `;
    }

}

customElements.define("opencga-family-browser", OpencgaFamilyBrowser_old);
