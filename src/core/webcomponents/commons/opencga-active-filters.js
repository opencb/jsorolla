/*
 * Copyright 2015-2016 OpenCB
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
            // NOTE this is actually preparedQuery (in case of variant-browser)
            query: {
                type: Object
            },
            // this is included in config param in case of variant-browser (it can be different somewhere else)
            filters: {
                type: Array
            },
            resource: {
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

    init() {
        this._prefix = "oaf" + UtilsNew.randomString(6) + "_";
        this._config = this.getDefaultConfig();
        this.filters = [];
        this._filters = [];

        this.query = {};
        this.lockedFieldsMap = {};
        this.facetQuery = {};
        this._facetQuery = {};
    }

    connectedCallback() {
        super.connectedCallback();
        this.opencgaClient = this.opencgaSession.opencgaClient;
    }

    firstUpdated() {
        // super.connectedCallback();

        // Small trick to force the warning message display after DOM is renderer
        this.query = {...this.query};

        // We need to init _previousQuery with query in order to work before executing any search
        this._previousQuery = this.query;

        // console.log("CONFIG", this.filters)
        // If there is any active filter we set the first one in the initialisation
        if (typeof this.filters !== "undefined" && UtilsNew.isEmpty(this.query)) {
            for (const filter of this.filters) {
                if (filter.active) {
                    const _queryList = Object.assign({}, filter.query);
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

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }

        if (changedProperties.has("query")) {
            this.queryObserver();
        }
        if (changedProperties.has("refresh")) {
            this.searchClicked();
        }
        if (changedProperties.has("config")) {
            this.configObserver();
        }

        if (changedProperties.has("facetQuery")) {
            // TODO review queryObserver and unify the behaviour of the Warning alert
            this.facetQueryObserver();
        }
    }

    configObserver() {
        this._config = Object.assign({}, this.getDefaultConfig(), this.config);

        // Overwrite default alias with the one passed
        this._config.alias = Object.assign({}, this.getDefaultConfig().alias, this.config.alias);

        this.lockedFieldsMap = {};
        for (const lockedField of this._config.lockedFields) {
            this.lockedFieldsMap[lockedField.id] = lockedField;
        }
    }

    facetQueryObserver() {
        if (JSON.stringify(this._facetQuery) !== JSON.stringify(this.facetQuery)) {
            this.querySelector("#" + this._prefix + "Warning").style.display = "block";
            this._facetQuery = this.facetQuery;
        } else {
            this.querySelector("#" + this._prefix + "Warning").style.display = "none";
        }

    }

    clear() {
        PolymerUtils.addStyleByClass("filtersLink", "color", "black");

        // TODO do not trigger event if there are no active filters
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

    opencgaSessionObserver() {
        if (this.opencgaClient instanceof OpenCGAClient && UtilsNew.isNotUndefined(this.opencgaSession.token)) {
            // console.error("arguments changed inverted after new clients. recheck functionality. serverVersion is now ignored");
            this.opencgaClient.users().filters(this.opencgaSession.user.id).then( restResponse => {
                const result = restResponse.getResults();
                if (result.length > 0) {
                    this._filters = [...this.filters, ...result.filter( f => f.resource === this.resource)];
                } else {
                    this._filters = [...this.filters];
                }
                this.requestUpdate();
            });
        }
    }
    // TODO recheck & refactor
    save() {
        const filterName = PolymerUtils.getValue(this._prefix + "filterName");
        const filterDescription = PolymerUtils.getValue(this._prefix + "filterDescription");

        const data = {
            id: filterName,
            description: filterDescription,
            resource: this.resource,
            query: this.query,
            options: {}
        };
        this.opencgaClient.users().filters(this.opencgaSession.user.id)
            .then(restResponse => {
                console.log("GET filters", restResponse);
                const savedFilters = restResponse.getResults() || [];

                console.log("savedFilters", savedFilters);
                // updating an existing filter

                //check if filterName else updateFilters
                if (savedFilters.find(savedFilter => savedFilter.id === filterName)) {
                    this.opencgaClient.users().updateFilter(this.opencgaSession.user.id, filterName, data)
                        .then(response => {
                            for (const i in this._filters) {
                                if (this._filters[i].id === filterName) {
                                    this._filters[i] = response.response[0].result[0];
                                }
                            }
                            PolymerUtils.setValue(this._prefix + "filterName", "");
                            PolymerUtils.setValue(this._prefix + "filterDescription", "");
                        });
                } else {
                    // saving a new filter
                    this.opencgaClient.users().updateFilters(this.opencgaSession.user.id, data, {action: "ADD"})
                        .then(response => {

                            this._filters = [...this._filters, data];
                            PolymerUtils.setValue(this._prefix + "filterName", "");
                            PolymerUtils.setValue(this._prefix + "filterDescription", "");
                            this.requestUpdate();
                        });
                }

            })
            .catch(restResponse => {
                if (restResponse.getEvents?.("ERROR")?.length) {
                    const msg = restResponse.getEvents("ERROR").map(error => error.message).join("<br>")
                    new NotificationQueue().push("Error saving the filter", msg, "error");
                } else {
                    new NotificationQueue().push("Error saving the filter", "", "error");
                }
                console.error(restResponse);
            })
            .finally(() => {

            });
    }

    onServerFilterChange(e) {
        this.querySelector("#" + this._prefix + "Warning").style.display = "none";

        if (!UtilsNew.isUndefinedOrNull(this._filters)) {
            // We look for the filter name in the filters array
            for (const filter of this._filters) {
                if (filter.id === e.target.dataset.filterId) {
                    PolymerUtils.addStyleByClass("filtersLink", "color", "black");
                    e.target.style.color = "green";
                    const _queryList = Object.assign({}, filter.query);
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
        const _queryList = Object.assign({}, this.query);
        // Reset selected filters to none
        PolymerUtils.addStyleByClass("filtersLink", "color", "black");

        const {filterName: name, filterValue: value} = e.target.dataset;
        console.log("onQueryFilterDelete", name, value);

        if (UtilsNew.isEmpty(value)) {
            delete _queryList[name];
            // TODO check the reason of this condition
            // FIXME this.modeInheritance is never defined
            if (UtilsNew.isEqual(name, "genotype")) {
                if (this.modeInheritance === "xLinked" || this.modeInheritance === "yLinked") {
                    delete _queryList["region"];
                }
            }
        } else {
            //                    let filterFields = _queryList[name].split(new RegExp("[,;]"));
            let filterFields;

            /**
             * TODO refactor
             * QUICKFIX: `sample` has semicolons and commas both, it needs a custom logic
             */
            if (name === "sample") {
                filterFields = _queryList[name].split(new RegExp(";"));
                const indexOfValue = filterFields.indexOf(value);
                filterFields.splice(indexOfValue, 1);
                _queryList[name] = filterFields.join(";");

            } else {
                if ((value.indexOf(";") !== -1 && value.indexOf(",") !== -1) || this._config.complexFields.indexOf(name) !== -1) {
                    filterFields = _queryList[name].split(new RegExp(";"));
                } else {
                    filterFields = _queryList[name].split(new RegExp("[,;]"));
                }

                const indexOfValue = filterFields.indexOf(value);
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
        }

        // When you delete any query filter we are not longer using any known Filter
        if (UtilsNew.isNotUndefined(PolymerUtils.getElementById("filtersList"))) {
            // TODO Refactor
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

        console.log("onQueryFacetDelete", e.target.dataset.filterName);
        delete this.facetQuery[e.target.dataset.filterName];
        this.facetQuery = {...this.facetQuery};
        this.dispatchEvent(new CustomEvent("activeFacetChange", {
            detail: this.facetQuery,
            bubbles: true,
            composed: true
        }));
    }

    queryObserver() {
        const _queryList = [];
        const keys = Object.keys(this.query);
        for (const keyIdx in keys) {
            const key = keys[keyIdx];
            if (UtilsNew.isNotEmpty(this.query[key]) && (!this._config.hiddenFields || (this._config.hiddenFields && !this._config.hiddenFields.includes(key)))) {
                const queryString = Object.entries(this.query).sort().toString();
                const prevQueryString = Object.entries(this._previousQuery).sort().toString();
                if (queryString !== prevQueryString) {
                    /* console.log(this.query);
                    console.log(this._previousQuery);
                    console.log(queryString);
                    console.log(prevQueryString);*/
                    this.querySelector("#" + this._prefix + "Warning").style.display = "block";
                } else {
                    this.querySelector("#" + this._prefix + "Warning").style.display = "none";
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
                    filterFields = value.split(";");
                } else if (key === "study") {
                    // We fist have need to remove defaultStudy from 'filterFields' and 'value'
                    filterFields = value.split(/[,;]/).filter(fqn => fqn !== this.defaultStudy);
                    // defaultStudy was the only one present so no need to render anything
                    if (!filterFields.length) {
                        continue;
                    }
                    value = filterFields.join(/[,;]/);
                } else {
                    // If we find a field with both ; and , or the field has been defined as complex, we will only
                    // separate by ;
                    if ((value.indexOf(";") !== -1 && value.indexOf(",") !== -1) || this._config.complexFields.indexOf(key) !== -1) {
                        filterFields = value.split(new RegExp(";"));
                    } else {
                        filterFields = value.split(new RegExp("[,;]"));
                    }
                }


                const locked = UtilsNew.isNotUndefinedOrNull(this.lockedFieldsMap[key]);
                const lockedTooltip = UtilsNew.isNotUndefinedOrNull(this.lockedFieldsMap[key]) ? this.lockedFieldsMap[key].message : "";

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
            searchButtonText: "SEARCH",
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
            hiddenFields: [],
            lockedFields: []
        };
    }

    render() {
        return html`
            ${this.facetActive ? html`
                <div class="alert alert-warning filter-warning" role="alert" id="${this._prefix}Warning" style="">
                    <span><strong>Warning!</strong></span>&nbsp;&nbsp;Filters or Facets have changed, please click on <strong> ${this._config.searchButtonText} </strong> to update the results.
                </div>` : html`
                <div class="alert alert-warning filter-warning" role="alert" id="${this._prefix}Warning" style="">
                    <span><strong>Warning!</strong></span>&nbsp;&nbsp;Filters have changed, please click on <strong> ${this._config.searchButtonText} </strong> to update the results.
                </div>
            `}
        
            <!--<div class="alert alert-info">query ${JSON.stringify(this.query)}</div> 
            <div class="alert alert-info">queryList ${JSON.stringify(this.queryList)}</div>--> 
            <div class="panel panel-default">
                <div class="panel-body" style="padding: 8px 10px">
                    <div class="lhs">
                        <p class="active-filter-label">Filters</p>
                    
                        ${this.queryList ? html`
                            ${this.queryList.length === 0
                                ? html`
                                    <label>No filters selected</label>`
                                : html`
                                    ${this.queryList.map(item => !this._isMultiValued(item)
                                        ? html` 
                                            ${!item.locked
                                                ? html`
                                                    <!-- No multi-valued filters -->
                                                    <button type="button" class="btn btn-warning btn-sm ${item.name}ActiveFilter active-filter-button ripple no-transform" data-filter-name="${item.name}" data-filter-value=""
                                                            @click="${this.onQueryFilterDelete}">
                                                    ${item.text}
                                                    </button>`
                                                : html`
                                                    <button type="button" class="btn btn-warning btn-sm ${item.name}ActiveFilter active-filter-button ripple no-transform" data-filter-name="${item.name}" data-filter-value=""
                                                             @click="${this.onQueryFilterDelete}" title="${item.message ?? ""}" disabled>
                                                        ${item.text}
                                                    </button>`
                                            }`
                                        : html`
                                            <!-- Multi-valued filters -->
                                            <div class="btn-group">
                                                ${item.locked
                                                    ? html`
                                                        <button type="button" class="btn btn-warning btn-sm ${item.name}ActiveFilter active-filter-button ripple no-transform" data-filter-name="${item.name}" data-filter-value=""
                                                                @click="${this.onQueryFilterDelete}" disabled> ${item.text} <span class="badge">${item.items.length}</span>
                                                        </button>
                                                        <button type="button" class="btn btn-warning btn-sm dropdown-toggle ripple no-transform" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                            <span class="caret"></span>
                                                            <span class="sr-only">Toggle Dropdown</span>
                                                        </button>
                                                        <ul class="dropdown-menu">
                                                            ${item.items.length && item.items.map(filterItem => html`
                                                                <li class="small active-filter-button disabled" style="cursor: pointer">
                                                                    <a>${filterItem}</a>
                                                                </li>
                                                            `)}
                                                        </ul>`
                                                    : html`
                                                        <button type="button" class="btn btn-warning btn-sm ${item.name}ActiveFilter active-filter-button ripple no-transform" data-filter-name="${item.name}" data-filter-value=""
                                                                @click="${this.onQueryFilterDelete}"> ${item.text} <span class="badge">${item.items.length}</span>
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
                                                        </ul>`
                                                    }
                                            </div>`
                                        )}
                                `}
                            `
                        : null}
                    </div> 
                        
                    <div class="rhs">
                        <button type="button" class="btn btn-primary btn-sm ripple" @click="${this.clear}">
                            <i class="fa fa-eraser icon-padding" aria-hidden="true"></i> Clear
                        </button>
                        
                        <!-- TODO we probably need a new property for this -->
                        ${this.showSelectFilters(this.opencgaClient._config) ? html`
                            <div class="dropdown">
    
                                <button type="button" class="btn btn-primary btn-sm dropdown-toggle ripple" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <i class="fa fa-filter icon-padding" aria-hidden="true"></i> Filters <span class="caret"></span>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-right">
                                    <li><a style="font-weight: bold">Saved Filters</a></li>
                                    ${this._filters && this._filters.length ? this._filters.map(item => html`
                                        <li> <!-- TODO recheck and simplify!!-->
                                            ${!item.active
                                                ? html`<a data-filter-id="${item.id}" style="cursor: pointer" @click="${this.onServerFilterChange}" class="filtersLink">&nbsp;&nbsp;${item.id}</a>`
                                                : html`<a data-filter-id="${item.id}" style="cursor: pointer;color: green" @click="${this.onServerFilterChange}" class="filtersLink">&nbsp;&nbsp;${item.id}</a>
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
                                    ${Object.entries(this.facetQuery).map(([name, facet]) => html`
                                        <button type="button" class="btn btn-danger btn-sm ${name}ActiveFilter active-filter-button ripple no-transform" data-filter-name="${name}" data-filter-value=""
                                                     @click="${this.onQueryFacetDelete}">
                                            ${facet.formatted}
                                        </button>
                                `)}
                                </div>
                                <div class="rhs">
                                    <button type="button" class="btn btn-primary btn-sm ripple" @click="${this.clearFacet}">
                                        <i class="fa fa-eraser" aria-hidden="true" style="padding-right: 5px"></i> Clear
                                    </button>
                                </div>
                            </div>
                    ` : null}
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
