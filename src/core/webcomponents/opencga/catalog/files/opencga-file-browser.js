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
import "./opencga-file-filter.js";
import "./opencga-file-grid.js";
import "../../opencga-active-filters.js";
import "../variableSets/opencga-annotation-comparator.js";
import "../../commons/opencga-facet-view.js";

//TODO check functionality (notify usage)
export default class OpencgaFileBrowser extends LitElement {

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
            filters: {
                type: Object,
                notify: true
            },
            search: {
                type: Object,
                notify: true
            },
            config: {
                type: Object
            }
        }
    }

    _init() {
        this._prefix = "ofb-" + Utils.randomString(6) + "_";

        this.files = [];

        this._config = this.getDefaultConfig();

        this.filtersConfig = {
            complexFields: ["annotation"]
        };
    }


    updated(changedProperties) {
        if(changedProperties.has("filters")) {
            this.onFilterUpdate();
        }
        if(changedProperties.has("config")) {
            this.configObserver();
        }
        if(changedProperties.has("opencgaSession") || changedProperties.has("config")) {
            this.filterAvailableVariableSets(this.opencgaSession, this.config);
        }
    }

    configObserver() {
        this._config = Object.assign(this.getDefaultConfig(), this.config);
    }

    onClear() {
        this._config = Object.assign(this.getDefaultConfig(), this.config);
        this.query = {};
        this.search = {};
    }

    onActiveFilterChange(e) {
        this.query = e.detail;
        this.search = e.detail;
    }

    onSelectFile(e) {
        this.file = e.detail.file;

        let sampleList = [];
        for (let i = 0; i < e.detail.file.samples.length; i++) {
            sampleList.push(e.detail.file.samples[i].id);
        }

        this.sampleSearch = {
            id: sampleList.join(",")
        }
    }

    _changeView(e) {
        e.preventDefault(); // prevents the hash change to "#" and allows to manipulate the hash fragment as needed

        $('.file-browser-view-content').hide(); // hides all content divs
        if (typeof e.target !== "undefined" && typeof e.target.dataset.view !== "undefined") {
            PolymerUtils.show(this._prefix + e.target.dataset.view);
        }

        // Show the active button
        $('.file-browser-view-buttons').removeClass("active");
        $(e.target).addClass("active");

        // if (e.target.dataset.view === "AggregationStats") {
        //     this.executeFacet();
        // }
    }

    filterAvailableVariableSets(opencgaSession, config) {
        this._config = Object.assign(this.getDefaultConfig(), this.config);

        if (this._config.disableVariableSets) {
            this.variableSets = [];
            return;
        }

        if (this._config.variableSetIds.length === 0) {
            this.variableSets = opencgaSession.study.variableSets;
        } else {
            let variableSets = [];
            for (let i = 0; i < opencgaSession.study.variableSets.length; i++) {
                if (this._config.variableSetIds.indexOf(opencgaSession.study.variableSets[i].id) !== -1) {
                    variableSets.push(opencgaSession.study.variableSets[i]);
                }
            }
            this.variableSets = variableSets;
        }
    }

    isNotEmpty(myArray) {
        return UtilsNew.isNotEmptyArray(myArray);
    }

    getDefaultConfig() {
        return {
            title: "File Browser",
            showTitle: true,
            showAggregationStats: true,
            showComparator: true,
            disableVariableSets: false,
            filter: {

            },
            grid: {
            },
            gridComparator: {
                multiselection: true,
                pageSize: 5,
                pageList: [5, 10],
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
                <opencga-file-filter .opencgaSession="${this.opencgaSession}"
                                     .config="${this._config.filter}"
                                     .files="${this.files}"
                                     .query="${this.query}"
                                     .search="${this.search}"
                                     .variableSets="${this.variableSets}">
                </opencga-file-filter>
            </div>

            <div class="col-md-10">
                <opencga-active-filters .opencgaClient="${this.opencgaSession.opencgaClient}"
                                        .query="${this.query}"
                                        .defaultStudy="${this.opencgaSession.study.alias}"
                                        .config="${this.filtersConfig}"
                                        .alias="${this.activeFilterAlias}"
                                        .refresh="${this.search}"
                                        @activeFilterClear="${this.onClear}"
                                        @activeFilterChange="${this.onActiveFilterChange}">
                </opencga-active-filters>

                <!-- File View Buttons -->
                <div class="col-md-12" style="padding: 5px 0px 5px 0px">
                    <div class="btn-toolbar" role="toolbar" aria-label="..." style="padding: 10px 0px;margin-left: 0px">
                        <div class="btn-group" role="group" style="margin-left: 0px">
                            <button type="button" class="btn btn-success file-browser-view-buttons active" data-view="TableResult" @click="${this._changeView}">
                                <i class="fa fa-table icon-padding" aria-hidden="true" data-view="TableResult" @click="${this._changeView}"></i> Table Result
                            </button>
                            <button type="button" class="btn btn-success file-browser-view-buttons" data-view="AggregationStats" @click="${this._changeView}">
                                <i class="fa fa-line-chart icon-padding" aria-hidden="true" data-view="AggregationStats" @click="${this._changeView}"></i> Aggregation Stats
                            </button>
                            ${this.isNotEmpty(this.variableSets) ? html`
                                <button type="button" class="btn btn-success file-browser-view-buttons" data-view="FileComparator" @click="${this._changeView}">
                                    <i class="fa fa-users icon-padding" aria-hidden="true" data-view="FileComparator" @click="${this._changeView}"></i> File Comparator
                                </button>
                            ` : null}
                            
                        </div>
                    </div>
                </div>


                <!--File View Content-->
                <div>
                    <div id="${this._prefix}TableResult" class="file-browser-view-content">
                        <opencga-file-grid .opencgaSession="${this.opencgaSession}"
                                           .config="${this._config.grid}"
                                           .eventNotifyName="${this.eventNotifyName}"
                                           .files="${this.files}"
                                           .search="${this.search}"
                                           @selectfile="${this.onSelectFile}"
                                           style="font-size: 12px">
                        </opencga-file-grid>

                        <div style="padding-top: 5px">
                            <ul id="${this._prefix}ViewTabs" class="nav nav-tabs" role="tablist">

                                <li role="presentation" class="active">
                                    <a href="#${this._prefix}FileViewer" role="tab" data-toggle="tab" class="detail-tab-title">
                                        File info
                                    </a>
                                </li>

                                <li role="presentation">
                                    <a href="#${this._prefix}SampleViewer" role="tab" data-toggle="tab" class="detail-tab-title">
                                        Sample grid
                                    </a>
                                </li>
                            </ul>

                            <div class="tab-content" style="height: 680px">
                                <div role="tabpanel" class="tab-pane active" id="${this._prefix}FileViewer">
                                    Work in progress
                                </div>
                                <div role="tabpanel" class="tab-pane" id="${this._prefix}SampleViewer">
                                    <opencga-sample-grid .opencgaClient="${this.opencgaSession.opencgaClient}"
                                                         .opencgaSession="${this.opencgaSession}"
                                                         .search="${this.sampleSearch}"
                                                         style="font-size: 12px">
                                    </opencga-sample-grid>
                                </div>

                            </div>
                        </div>

                    </div>

                    <div id="${this._prefix}AggregationStats" class="file-browser-view-content" style="display: none">
                        <opencga-facet-view .opencgaClient="${this.opencgaSession.opencgaClient}"
                                            .opencgaSession="${this.opencgaSession}" entity="FILE"
                                            .variableSets="${this.variableSets}"></opencga-facet-view>
                    </div>

                    <div id="${this._prefix}FileComparator" class="file-browser-view-content" style="display: none">

                        <opencga-file-grid .opencgaSession="${this.opencgaSession}"
                                            .config="${this._config.gridComparator}"
                                            .eventNotifyName="${this.eventNotifyName}"
                                            .files="${this.files}"
                                            .search="${this.search}"
                                            style="font-size: 12px">
                        </opencga-file-grid>

                        <div style="padding-top: 5px">
                            <h3> Annotation comparator</h3>
                            <opencga-annotation-viewer .opencgaClient="${this.opencgaSession.opencgaClient}"
                                                       .opencgaSession="${this.opencgaSession}"
                                                       .config="${this._config}"
                                                       .entryIds="${this.files}"
                                                       entity="FILE">
                            </opencga-annotation-viewer>
                        </div>

                    </div>
                </div>

            </div>
        </div>
        `;
    }
}

customElements.define("opencga-file-browser", OpencgaFileBrowser);
