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
import Utils from "./../../utils.js";
import UtilsNew from "./../../utilsNew.js";
import PolymerUtils from "../PolymerUtils.js";
import {OpenCGAClient} from "../../clients/opencga/opencga-client.js";

export default class OpencgaActiveFilters extends LitElement {

    constructor() {
        super();
        this.init();
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            //NOTE this is actually preparedQuery (in case of variant-browser)
            query: {
                type: Object
            },
            // this is included in config param in case of variant-browser (it can be different somewhere else)
            filters: {
                type: Array
            },
            filterBioformat: {
                type: String
            },
            alias: {
                type: Object
            },
            defaultStudy: {
                type: String
            },
            refresh: {
                type: Object
            },
            config: {
                type: Object
            },
            facetActive: {
                type: Boolean
            },
            facetQuery: {
                type: Object
            }
        };
    }

    createRenderRoot() {
        return this;
    }

    updated(changedProperties) {
        if (changedProperties.has("query")) {
            this.queryObserver();
        }
        if (changedProperties.has("refresh")) {
            this.searchClicked();
        }
        if (changedProperties.has("config")) {
            this.configObserver();
        }
        if (changedProperties.has("opencgaSession")) {
            this.checkFilters();
        }
        if (changedProperties.has("facetQuery")) {
            //TODO review queryObserver and unify the behaviour of the Warning alert
            this.facetQueryObserver();
        }
    }

    init() {
        this._prefix = "oaf" + Utils.randomString(6) + "_";
        this._config = this.getDefaultConfig();
        this.filters = [];


        //todo recheck why function?
        this.opencgaClient = function() {
            return {"_config": {}};
        };
        this.query = {};
        this.lockedFieldsMap = {};
        this.facetQuery = {};
        this._facetQuery = {};
    }

    connectedCallback() {
        super.connectedCallback();
        this.opencgaClient = this.opencgaSession.opencgaClient;
    }

    //TODO recheck connectedCallback
    firstUpdated() {
        //super.connectedCallback();

        // Small trick to force the warning message display after DOM is renderer
        this.query = {...this.query};

        // We need to init _previousQuery with query in order to work before executing any search
        this._previousQuery = this.query;

        //console.log("CONFIG", this.filters)
        // If there is any active filter we set the first one in the initialisation
        if (typeof this.filters !== "undefined" && UtilsNew.isEmpty(this.query)) {
            for (let filter of this.filters) {
                if (filter.active) {
                    let _queryList = Object.assign({}, filter.query);
                    this.dispatchEvent(new CustomEvent("activeFilterChange", {
                        detail: _queryList,
                        bubbles: true,
                        composed: true
                    }));
                    break;
                }
            }
        }
    }

    configObserver() {
        this._config = Object.assign({}, this.getDefaultConfig(), this.config);

        // Overwrite default alias with the one passed
        this._config.alias = Object.assign({}, this.getDefaultConfig().alias, this.config.alias);

        this.lockedFieldsMap = {};
        for (let lockedField of this._config.lockedFields) {
            this.lockedFieldsMap[lockedField.id] = lockedField;
        }
    }

    facetQueryObserver(){
        if (JSON.stringify(this._facetQuery) !== JSON.stringify(this.facetQuery)) {
            this.querySelector("#" + this._prefix + "Warning").style.display = "block";
            this._facetQuery = this.facetQuery;
        } else {
            this.querySelector("#" + this._prefix + "Warning").style.display = "none";
        }

    }

    clear() {
        PolymerUtils.addStyleByClass("filtersLink", "color", "black");

        //TODO do not trigger event if there are no active filters
        // Trigger clear event
        this.dispatchEvent(new CustomEvent("activeFilterClear", {detail: {}, bubbles: true, composed: true}));
    }

    clearFacet() {
        this.querySelector("#" + this._prefix + "Warning").style.display = "none";
        this.dispatchEvent(new CustomEvent("activeFacetClear", {detail: {}, bubbles: true, composed: true}));
    }

    launchModal() {
        $(PolymerUtils.getElementById(this._prefix + "SaveModal")).modal("show");
    }

    showSelectFilters() {
        return (this.filters !== undefined && this.filters.length > 0) || !UtilsNew.isEmpty(this.opencgaSession.token);
    }

    checkSid(config) {
        return UtilsNew.isNotEmpty(config);
    }

    checkFilters() {
        let _this = this;
        if (this.opencgaClient instanceof OpenCGAClient && UtilsNew.isNotUndefined(this.opencgaSession.token)) {
            //console.error("arguments changed inverted after new clients. recheck functionality. serverVersion is now ignored");
            this.opencgaClient.users().filters(this.opencgaSession.user.id)
                .then(function(response) {
                    let result = response.response[0].result;
                    if (result.length > 0) {
                        if (UtilsNew.isUndefined(_this.filters)) {
                            _this.filters = [];
                        }
                        for (let obj of result) {
                            _this.filters.push = obj;
                        }
                    }
                });
        }

    }

    save() {
        let filterName = PolymerUtils.getValue("filterName");
        let filterDescription = PolymerUtils.getValue(this._prefix + "filterDescription");

        let data = {};
        data.name = filterName;
        data.description = filterDescription;
        data.bioformat = this.filterBioformat;
        data.query = this.query;
        data.options = {};
        let _this = this;
        this.opencgaClient.users().filtersConfigs(this.opencgaSession.user.id, {name: filterName})
            .then(function(response) {
                if (response.response[0].result.length > 0) {
                    delete params.name;
                    // TODO recheck!!
                    _this.opencgaClient.users().updateFilter(this.opencgaSession.user.id, filterName, data)
                        .then(function(response) {
                            for (let i in _this.filters) {
                                if (_this.filters[i].name === filterName) {
                                    _this.filters[i] = response.response[0].result[0];
                                }
                            }
                            PolymerUtils.setValue("filterName", "");
                            PolymerUtils.setValue(_this._prefix + "filterDescription", "");
                        });
                } else {
                    if (_this.opencgaClient._config.serverSession !== undefined && _this.opencgaClient._config.serverSession === "1.3") {
                        _this.opencgaClient.users().create(data)
                            .then(function(response) {
                                _this.push("filters", data); // TODO recheck!!
                                PolymerUtils.setValue("filterName", "");
                                PolymerUtils.setValue(_this._prefix + "filterDescription", "");
                            });
                    } else {
                        _this.opencgaClient.users().updateFilters(this.opencgaSession.user.id, data)
                            .then(function(response) {
                                _this.push("filters", data); // TODO recheck!!
                                PolymerUtils.setValue("filterName", "");
                                PolymerUtils.setValue(_this._prefix + "filterDescription", "");
                            });
                    }
                }
            });
    }

    onServerFilterChange(e) {
        this.querySelector("#" + this._prefix + "Warning").style.display = "none";

        if (!UtilsNew.isUndefinedOrNull(this.filters)) {
            // We look for the filter name in the filters array
            for (let filter of this.filters) {
                if (filter.name === e.target.dataset.filterName) {
                    PolymerUtils.addStyleByClass("filtersLink", "color", "black");
                    e.target.style.color = "green";

                    let _queryList = Object.assign({}, filter.query);
                    this.dispatchEvent(new CustomEvent("activeFilterChange", {
                        detail: _queryList,
                        bubbles: true,
                        composed: true
                    }));
                    break;
                }
            }
        }
        this.requestUpdate();
    }

    onQueryFilterDelete(e) {
        let _queryList = Object.assign({}, this.query);
        // Reset selected filters to none
        PolymerUtils.addStyleByClass("filtersLink", "color", "black");

        let name = e.target.dataset.filterName;
        let value = e.target.dataset.filterValue;
        console.log("onQueryFilterDelete", name, value);

        if (UtilsNew.isEmpty(value)) {
            delete _queryList[name];
            //TODO check the reason of this condition
            //FIXME this.modeInheritance is never defined
            if (UtilsNew.isEqual(name, "genotype")) {
                if (this.modeInheritance === "xLinked" || this.modeInheritance === "yLinked") {
                    delete _queryList["region"];
                }
            }
        } else {
//                    let filterFields = _queryList[name].split(new RegExp("[,;]"));
            let filterFields;
            if ((value.indexOf(";") !== -1 && value.indexOf(",") !== -1) || this._config.complexFields.indexOf(name) !== -1) {
                filterFields = _queryList[name].split(new RegExp(";"));
            } else {
                filterFields = _queryList[name].split(new RegExp("[,;]"));
            }

            let indexOfValue = filterFields.indexOf(value);
            filterFields.splice(indexOfValue, 1);

            if ((value.indexOf(";") !== -1 && value.indexOf(",") !== -1) || this._config.complexFields.indexOf(name) !== -1) {
                _queryList[name] = filterFields.join(";");
            } else {
                if (_queryList[name].indexOf(",") !== -1) {
                    _queryList[name] = filterFields.join(",");
                } else {
                    _queryList[name] = filterFields.join(";");
                }
            }
        }

        // When you delete any query filter we are not longer using any known Filter
        if (UtilsNew.isNotUndefined(PolymerUtils.getElementById("filtersList"))) {
            //TODO Refactor
            $("#filtersList option[value='none']").prop("selected", true);
        }


        this.dispatchEvent(new CustomEvent("activeFilterChange", {
            detail: _queryList,
            bubbles: true,
            composed: true
        }));
    }

    onQueryFacetDelete(e) {
        this.querySelector("#" + this._prefix + "Warning").style.display = "none";

        console.log("onQueryFacetDelete",e.target.dataset.filterName);
        delete this.facetQuery[e.target.dataset.filterName];
        this.facetQuery = {...this.facetQuery};
        this.dispatchEvent(new CustomEvent("activeFacetChange", {
            detail: this.facetQuery,
            bubbles: true,
            composed: true
        }));
    }

    queryObserver() {
        let _queryList = [];
        let keys = Object.keys(this.query);
        for (let keyIdx in keys) {
            let key = keys[keyIdx];
            if (UtilsNew.isNotEmpty(this.query[key]) && !this._config.hiddenFields.includes(key)) {
                let queryString = Object.entries(this.query).sort().toString();
                let prevQueryString = Object.entries(this._previousQuery).sort().toString();
                if (queryString !== prevQueryString) {
                    /*console.log(this.query);
                    console.log(this._previousQuery);
                    console.log(queryString);
                    console.log(prevQueryString);*/
                    PolymerUtils.show(this._prefix + "Warning");
                } else {
                    PolymerUtils.hide(this._prefix + "Warning");
                }

                // We use the alias to rename the key
                let title = key;
                if (UtilsNew.isNotUndefinedOrNull(this._config.alias) && UtilsNew.isNotUndefinedOrNull(this._config.alias[key])) {
                    title = this._config.alias[key];
                }

                // We convert the Query entry object into an array of small objects (queryList)
                let value = this.query[key];
                if (typeof value === "boolean") {
                    value = value.toString();
                }

                let filterFields = [];


                // in case of annotation
                if (key === "annotation") {
                    const [variable, val] = value.split("=");
                    //filterFields = val.split(",").map( v => variable + "=" + v); // TODO this has an error on filter delete
                    filterFields = [val];
                } else {
                    // If we find a field with both ; and , or the field has been defined as complex, we will only
                    // separate by ;
                    if ((value.indexOf(";") !== -1 && value.indexOf(",") !== -1) || this._config.complexFields.indexOf(key) !== -1) {
                        filterFields = value.split(new RegExp(";"));
                    } else {
                        filterFields = value.split(new RegExp("[,;]"));
                    }
                }
                // We fist have need to remove defaultStudy from 'filterFields' and 'value'
                if (key === "study") {
                    let otherStudies = [];
                    for (let study of filterFields) {
                        if (!study.includes(this.defaultStudy)) {
                            otherStudies.push(study);
                        }
                    }

                    if (otherStudies.length === 0) {
                        // defaultStudy was the only one present so no need to render anything
                        continue;
                    } else {
                        // defaultStudy was just one of the studies selected, we need to set filterFields and value
                        filterFields = otherStudies;
                        if (value.indexOf(",") !== -1) {
                            value = filterFields.join(",");
                        } else {
                            value = filterFields.join(";");
                        }
                    }
                }

                let locked = UtilsNew.isNotUndefinedOrNull(this.lockedFieldsMap[key]);
                let lockedTooltip = UtilsNew.isNotUndefinedOrNull(this.lockedFieldsMap[key]) ? this.lockedFieldsMap[key].message : "";

                // Just in case one is a flag
                if (filterFields.length === 0) {
                    _queryList.push({name: key, text: title, locked: locked, message: lockedTooltip});
                } else {
                    if (filterFields.length === 1) {
                        if (value.indexOf(">") !== -1 || value.indexOf("<") !== -1 || value.indexOf("=") !== -1) {
                            _queryList.push({name: key, text: title + ": " + value, locked: locked, message: lockedTooltip});
                        } else {
                            _queryList.push({name: key, text: title + " = " + value, locked: locked, message: lockedTooltip});
                        }
//                                }
                    } else {
                        _queryList.push({name: key, text: title, items: filterFields, locked: locked, message: lockedTooltip});
                    }
                }
            }
        }
        this.queryList = _queryList;

        this.requestUpdate();
    }

    searchClicked() {
        PolymerUtils.hide(this._prefix + "Warning");
        this._previousQuery = this.query;
    }

    _isMultiValued(item) {
        return UtilsNew.isNotUndefined(item.items);
    }

    getDefaultConfig() {
        return {
            alias: {
                "region": "Region",
                "gene": "Gene",
                "genotype": "Sample Genotype",
                "sample": "Samples",
                "maf": "Cohort Stat MAF",
                "cohortStatsAlt": "Cohort ALT Stats",
                "xref": "XRef",
                "panel": "Disease Panel",
                "file": "Files",
                "qual": "QUAL",
                "filter": "FILTER",
                "annot-xref": "XRef",
                "biotype": "Biotype",
                "ct": "Consequence Type",
                "annot-ct": "Consequence Type",
                "alternate_frequency": "Population ALT Frequency",
                "annot-functional-score": "CADD",
                "protein_substitution": "Protein Substitution",
                "annot-go": "GO",
                "annot-hpo": "HPO"
            },
            complexFields: [],
            hiddenFields: ["study"],
            lockedFields: []
        };
    }

    render() {
        return html`
        <style include="jso-styles">
            .active-filter-button:hover {
                text-decoration: line-through;
            }

            .facet-wrapper{
                margin: 20px 0 0 0;
            }

            .double-arrow {
                transform: rotate(90deg);
                width: 60px;
                display: block;
                margin: 0 auto;
                height: 60px;
            }

            .double-arrow-wrapper {
                display: flex;
                margin: 5px 0;
            }

            .button-list{
                padding-left: 20px;
                display: inline-block;
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
            
            .rhs {
                float: right;
            }

            .rhs .dropdown {
                display: inline-block;
            }
            
            .filter-warning {
                padding: 10px;
                margin-bottom: 10px;
                display: none;                
            }
        </style>
        ${ this.facetActive ? html`
            <div class="alert alert-warning filter-warning" role="alert" id="${this._prefix}Warning" style="">
                <span style="font-weight: bold;font-size: 1.20em">Warning!</span>&nbsp;&nbsp;Filters or Facet has changed, please click on <button type="button" class="btn btn-primary ripple ripple-disabled">
                    <i class="fa arrow-circle-right" aria-hidden="true"></i> Run </button> to update the results.
            </div>` : html`
            <div class="alert alert-warning filter-warning" role="alert" id="${this._prefix}Warning" style="">
                <span style="font-weight: bold;font-size: 1.20em">Warning!</span>&nbsp;&nbsp;Filters changed, please click on <button type="button" class="btn btn-primary ripple ripple-disabled">
                    <i class="fa fa-search" aria-hidden="true"></i> Search </button> to update the results.
            </div>
        `}
        

        <div class="panel panel-default" style="margin-bottom: 5px">
            <div class="panel-body" style="padding: 10px">
                <p class="active-filter-label">Filters</p>
                
                <div class="button-list">
                    ${this.queryList ? html`
                        ${this.queryList.length === 0 ? html`
                            <label>No filters selected</label>
                        ` : html`
                        ${this.queryList.map(item => !this._isMultiValued(item) ? html` 
                            ${!item.locked ? html`
                                <!-- No multi-valued filters -->
                                <button type="button" class="btn btn-warning btn-sm ${item.name}ActiveFilter active-filter-button ripple no-transform" data-filter-name="${item.name}" data-filter-value=""
                                        @click="${this.onQueryFilterDelete}">
                                ${item.text}
                                </button>
                            ` : html`
                                <button type="button" class="btn btn-warning btn-sm ${item.name}ActiveFilter active-filter-button ripple no-transform" data-filter-name="${item.name}" data-filter-value=""
                                         @click="${this.onQueryFilterDelete}" title="${item.message}" disabled>
                                    ${item.text}
                                </button>
                            `}` : html`
                                <!-- Multi-valued filters -->
                                <div class="btn-group">
                                    <button type="button" class="btn btn-warning btn-sm ${item.name}ActiveFilter active-filter-button ripple no-transform" data-filter-name="${item.name}" data-filter-value=""
                                            @click="${this.onQueryFilterDelete}">
                                        ${item.text} <span class="badge">${item.items.length}</span>
                                    </button>
                                    <button type="button" class="btn btn-warning btn-sm dropdown-toggle ripple no-transform" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <span class="caret"></span>
                                        <span class="sr-only">Toggle Dropdown</span>
                                    </button>
                                    <ul class="dropdown-menu">
                                        ${item.items.length && item.items.map(filterItem => html`
                                            <li class="small active-filter-button" style="cursor: pointer">
                                                <a @click="${this.onQueryFilterDelete}" data-filter-name="${item.name}" data-filter-value="${filterItem}">
                                                    ${filterItem} 
                                                </a>
                                            </li>
                                        `)}
                                    </ul>
                                </div>
                            `
        )}
                    `}
                ` : null}
                </div>
                <div class="rhs">
                    <button type="button" class="btn btn-primary ripple" @click="${this.clear}">
                        <i class="fa fa-eraser" aria-hidden="true" style="padding-right: 5px"></i> Clear
                    </button>
                    
                    <!-- TODO we probably need a new property for this -->
                    ${this.showSelectFilters(this.opencgaClient._config) ? html`
                        <div class="dropdown">

                            <button type="button" class="btn btn-primary dropdown-toggle ripple" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i class="fa fa-filter" aria-hidden="true" style="padding-right: 5px"></i> Filters <span class="caret"></span>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-right">
                                <li><a style="font-weight: bold">Saved Filters</a></li>
                                <!--TODO check why filter is initialized (init()) but I still need to check for truthy-->
                                ${this.filters && this.filters.length ? this.filters.map(item => html`
                                    <li> <!-- TODO recheck and simplify!!-->
                                        ${!item.active ? html`
                                            <a data-filter-name="${item.name}" style="cursor: pointer" @click="${this.onServerFilterChange}" class="filtersLink">&nbsp;&nbsp;${item.name}</a>` : html`
                                            <a data-filter-name="${item.name}" style="cursor: pointer;color: green" @click="${this.onServerFilterChange}" class="filtersLink">&nbsp;&nbsp;${item.name}</a>
                                        `}
                                    </li>
                                `) : null}
                                ${this.checkSid(this.opencgaClient._config) ? html`
                                    <li role="separator" class="divider"></li>
                                    <li>
                                        <a style="cursor: pointer" @click="${this.launchModal}"><i class="fa fa-floppy-o" aria-hidden="true"></i> Save...</a>
                                    </li>
                                ` : html``}
                            </ul>
                        </div>
                    ` : null}
                </div>
                <!-- aggregation stat section -->
                ${this.facetActive && Object.keys(this.facetQuery).length ? html`
                    <div class="facet-wrapper">
                        <p class="active-filter-label">Aggregation fields</p>
                            <div class="button-list">
                                ${Object.entries(this.facetQuery).map( ([name, facet]) => html`
                                    <button type="button" class="btn btn-danger btn-sm ${name}ActiveFilter active-filter-button ripple no-transform" data-filter-name="${name}" data-filter-value=""
                                                 @click="${this.onQueryFacetDelete}">
                                        ${facet.formatted}
                                    </button>
                            `)}
                            </div>
                            <button type="button" class="btn btn-primary ripple pull-right" @click="${this.clearFacet}">
                                <i class="fa fa-eraser" aria-hidden="true" style="padding-right: 5px"></i> Clear
                            </button>
                        </div>
                ` : null }
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

customElements.define("opencga-active-filters", OpencgaActiveFilters);

