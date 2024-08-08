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

import {LitElement, html} from "lit";
import UtilsNew from "../../core/utils-new.js";
import PolymerUtils from "../PolymerUtils.js";

export default class OpencgaPanelFilter extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            query: {
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
        this._prefix = "panelFilter" + UtilsNew.randomString(6) + "_";
        this.dateFilterConfig = {
            recentDays: 10
        };
        this._reset = true;
    }

    updated(changedProperties) {
        if(changedProperties.has("query")) {
            this.queryObserver();
        }
    }

    queryObserver() {
        if (this._reset) {
            this.setQueryFilters();
        } else {
            this._reset = true;
        }
    }

    setQueryFilters() {
        this._clearHtmlDom();
        // TODO implement set query filters one day
    }

    updateQueryFilters() {
        let _query = {};
        let id = PolymerUtils.getElementById(this._prefix + "IDPanel").value;
        let name = PolymerUtils.getElementById(this._prefix + "NamePanel").value;
        let author = PolymerUtils.getElementById(this._prefix + "authorPanel").value;
        let version = PolymerUtils.getElementById(this._prefix + "versionPanel").value;

        if (UtilsNew.isNotEmpty(id)) {
            _query.id = id;
        }

        if (UtilsNew.isNotEmpty(name)) {
            _query.name = name;
        }

        if (UtilsNew.isNotEmpty(author)) {
            _query.author = author;
        }

        if (UtilsNew.isNotEmpty(version)) {
            _query.version = version;
        }

        this._reset = false;
        this.query = _query;
        this._reset = true;
    }



    onSearchClick() {
        this.dispatchEvent(new CustomEvent("search", {
            detail: {query: this.query},
            bubbles: true,
            composed: true
        }));
    }

    onDateChanged(e) {
        let query = {};
        Object.assign(query, this.query);
        if (UtilsNew.isNotEmpty(e.detail.date)) {
            query["creationDate"] = e.detail.date;
        } else {
            delete query["creationDate"];
        }

        this._reset = false;
        this.query = query;
        this._reset = true;
    }

    _clearHtmlDom() {
        $("." + this._prefix + "FilterTextInput").val("");
        $("." + this._prefix + "FilterTextInput").prop("disabled", false);
        $("." + this._prefix + "SelectInput").prop('selectedIndex', 0);
    }

    render() {
        return html`
        <div style="width: 60%;margin: 0 auto">
            <button type="button" class="btn btn-primary" style="width: 100%" @click="${this.onSearchClick}">
                <i class="fa fa-search" aria-hidden="true" style="padding: 0px 5px 0px 5px"></i>
                Search
            </button>
        </div>
        <br>
        <div class="panel-group" id="${this._prefix}Accordion" role="tablist" aria-multiselectable="true">
            <!-- Panel -->
            <div class="card">
                <div class="card-body" role="tab" id="${this._prefix}PanelSelectionHeading">
                    <h4 class="card-title">
                        <a class="collapsed" role="button" data-toggle="collapse" data-parent="#${this._prefix}Accordion"
                           href="#${this._prefix}PanelSelection" aria-expanded="true"
                           aria-controls="${this._prefix}PanelSelection">
                            Panel
                            <div style="float: right" class="tooltip-div">
                                <a data-toggle="tooltip" title="Panel selection">
                                    <i class="fa fa-info-circle" aria-hidden="true"></i>
                                </a>
                            </div>
                        </a>
                    </h4>
                </div>

                <div id="${this._prefix}PanelCharacteristics" class="panel-collapse collapse in" role="tabpanel"
                     aria-labelledby="${this._prefix}PanelCharacteristicsHeading">
                    <div class="card-body">
                        <div class="form-group">
                            <div class="browser-subsection">ID
                            </div>
                            <div id="${this._prefix}-panelId" class="subsection-content form-group">
                                <input type="text" id="${this._prefix}IDPanel" class="form-control input-sm ${this._prefix}FilterTextInput"
                                       placeholder="ID ..." @input="${this.updateQueryFilters}">
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="browser-subsection">Name
                            </div>
                            <div id="${this._prefix}-panelName" class="subsection-content form-group">
                                <input type="text" id="${this._prefix}NamePanel" class="form-control input-sm ${this._prefix}FilterTextInput"
                                       placeholder="Name, Name2 ..." @keyup="${this.updateQueryFilters}">
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="browser-subsection">Version
                            </div>
                            <div id="${this._prefix}-panelVersion" class="subsection-content form-group">
                                <input type="text" id="${this._prefix}versionPanel" class="form-control input-sm ${this._prefix}FilterTextInput"
                                       placeholder="Version ..." @keyup="${this.updateQueryFilters}">
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="browser-subsection">Author
                            </div>
                            <div id="${this._prefix}-panelAuthor" class="subsection-content form-group">
                                <input type="text" id="${this._prefix}authorPanel" class="form-control input-sm ${this._prefix}FilterTextInput"
                                       placeholder="Author ..." @keyup="${this.updateQueryFilters}">
                            </div>
                        </div>
                    </div>
                </div>
                <!--<div id="${this._prefix}IndividualSelection" class="panel-collapse collapse in" role="tabpanel"-->
                     <!--aria-labelledby="${this._prefix}IndividualSelectionHeading">-->
                    <!--<div class="panel-body">-->
                        <!--<date-filter config="{{dateFilterConfig}}" on-datechanged="onDateChanged"></opencga-date-filter>-->
                    <!--</div>-->
                <!--</div>-->
            </div>
        </div>
        `;
    }
}

customElements.define("opencga-panel-filter", OpencgaPanelFilter);
