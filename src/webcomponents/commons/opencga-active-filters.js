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

import {LitElement, html} from "lit";
import UtilsNew from "../../core/utilsNew.js";
import {NotificationQueue} from "../../core/NotificationQueue.js";
import PolymerUtils from "../PolymerUtils.js";
import {OpenCGAClient} from "../../core/clients/opencga/opencga-client.js";

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
            executedQuery: {
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
            config: {
                type: Object
            },
            facetActive: {
                type: Boolean
            },
            facetQuery: {
                type: Object
            },
            facetExecutedQuery: {
                type: Object
            }
        };
    }

    createRenderRoot() {
        return this;
    }

    init() {
        this._prefix = UtilsNew.randomString(8);
        this._config = this.getDefaultConfig();
        this.filters = [];
        this._filters = [];

        this.query = {};
        this.lockedFieldsMap = {};
        this.facetQuery = {};
        this._JsonFacetQuery = null;
    }

    connectedCallback() {
        super.connectedCallback();
        this.opencgaClient = this.opencgaSession.opencgaClient;
    }

    firstUpdated() {
        // Small trick to force the warning message display after DOM is renderer
        this.query = {...this.query};

        // We need to init _previousQuery with query in order to work before executing any search
        this._previousQuery = this.query;

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
        if (changedProperties.has("executedQuery")) {
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

    opencgaSessionObserver() {
        if (this.opencgaClient instanceof OpenCGAClient && UtilsNew.isNotUndefined(this.opencgaSession.token)) {
            this.refreshFilters();
        }
    }

    queryObserver() {
        const _queryList = [];
        const keys = Object.keys(this.query);
        for (const keyIdx in keys) {
            const key = keys[keyIdx];
            if (UtilsNew.isNotEmpty(this.query[key]) && (!this._config.hiddenFields || (this._config.hiddenFields && !this._config.hiddenFields.includes(key)))) {

                // TODO review. why is this in a loop?
                const queryString = JSON.stringify(UtilsNew.objectSort(this.query));
                const prevQueryString = JSON.stringify(UtilsNew.objectSort(this._previousQuery));
                if (queryString !== prevQueryString) {
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
        $("#" + this._prefix + "Warning").hide();
        this._previousQuery = this.query;
        // TODO in progress https://github.com/opencb/jsorolla/issues/150
        this._previousFacetQuery = this.facetQuery;
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

        // TODO in progress https://github.com/opencb/jsorolla/issues/150
        // console.log("facetQueryObserver")
        // console.log("this.facetQuery", JSON.stringify(this.facetQuery))
        // console.log("this._JsonSelectedFacet", this._JsonSelectedFacet)
        if (Object.keys(this.facetQuery).length) {
            if (!this._JsonSelectedFacet || !UtilsNew.objectCompare(this.facetQuery, JSON.parse(this._JsonSelectedFacet))) {
                this._JsonSelectedFacet = JSON.stringify(this.facetQuery); // this.selectedFacet is a complex object, {...this.selectedFacet} won't work
                this.querySelector("#" + this._prefix + "Warning").style.display = "block";
                // console.log("showing warn")

            } else {
                this.querySelector("#" + this._prefix + "Warning").style.display = "none";
                // console.log("hiding warn")
            }
        } else {
            // TODO handle warning alert here too
            this._JsonSelectedFacet = null;
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
        $("#" + this._prefix + "SaveModal").modal("show");
    }

    showSelectFilters() {
        return (this.filters !== undefined && this.filters.length > 0) || !UtilsNew.isEmpty(this.opencgaSession.token);
    }

    isLoggedIn() {
        return !!this?.opencgaSession?.token;
    }

    refreshFilters() {
        this.opencgaClient.users().filters(this.opencgaSession.user.id).then(restResponse => {
            const result = restResponse.getResults();

            // (this.filters || []) in case this.filters (prop) is undefined
            if (result.length > 0) {
                this._filters = [...(this.filters || []), ...result.filter(f => f.resource === this.resource)];
            } else {
                this._filters = [...(this.filters || [])];
            }
            this.requestUpdate().then(() => UtilsNew.initTooltip(this));
        });
    }

    // TODO recheck & refactor
    save() {
        const filterName = $("#" + (this._prefix + "filterName")).val();
        const filterDescription = $("#" + (this._prefix + "filterDescription")).val();

        const query = this.query;
        if (query.study) {
            // filters out the current active study
            const studies = query.study.split(",").filter(fqn => fqn !== this.opencgaSession.study.fqn);
            if (studies.length) {
                query.study = studies.join(",");
            } else {
                delete query.study;
            }
        }

        // Remove ignored params
        // When saving a filter we do no twant to save the exact sample or file ID, otherwise the filter cannot be reused
        if (this._config?.save?.ignoreParams) {
            for (const param of this._config.save.ignoreParams) {
                delete query[param];
            }
        }

        this.opencgaClient.users().filters(this.opencgaSession.user.id)
            .then(restResponse => {
                console.log("GET filters", restResponse);
                const savedFilters = restResponse.getResults() || [];

                console.log("savedFilters", savedFilters);

                if (savedFilters.find(savedFilter => savedFilter.id === filterName)) {
                    // updating an existing filter
                    const data = {
                        description: filterDescription,
                        resource: this.resource,
                        query: query,
                        options: {}
                    };

                    Swal.fire({
                        title: "Are you sure?",
                        text: "A Filter with the same name is already present. You are going to overwrite it.",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#d33",
                        cancelButtonColor: "#3085d6",
                        confirmButtonText: "Yes"
                    }).then(result => {
                        if (result.value) {
                            this.opencgaClient.users().updateFilter(this.opencgaSession.user.id, filterName, data)
                                .then(restResponse => {
                                    if (!restResponse?.getEvents?.("ERROR")?.length) {
                                        for (const i in this._filters) {
                                            if (this._filters[i].id === filterName) {
                                                this._filters[i] = restResponse.response[0].result[0];
                                            }
                                        }
                                        Swal.fire(
                                            "Filter Saved",
                                            "Filter has been saved.",
                                            "success"
                                        );
                                        this.requestUpdate().then(() => UtilsNew.initTooltip(this));
                                    } else {
                                        console.error(restResponse);
                                        Swal.fire(
                                            "Server Error!",
                                            "Filter has not been correctly saved.",
                                            "error"
                                        );
                                    }
                                    $("#" + this._prefix + "filterName").val("");
                                    $("#" + this._prefix + "filterDescription").val("");
                                }).catch(restResponse => {
                                    console.error(restResponse);
                                    Swal.fire(
                                        "Server Error!",
                                        "Filter has not been correctly saved.",
                                        "error"
                                    );
                                });
                        }
                    });

                } else {
                    // saving a new filter
                    const data = {
                        id: filterName,
                        description: filterDescription,
                        resource: this.resource,
                        query: query,
                        options: {}
                    };
                    this.opencgaClient.users().updateFilters(this.opencgaSession.user.id, data, {action: "ADD"})
                        .then(restResponse => {
                            if (!restResponse.getEvents?.("ERROR")?.length) {
                                this._filters = [...this._filters, data];
                                $("#" + this._prefix + "filterName").val("");
                                $("#" + this._prefix + "filterDescription").val("");
                                Swal.fire(
                                    "Filter Saved",
                                    "Filter has been saved.",
                                    "success"
                                );
                                this.requestUpdate().then(() => UtilsNew.initTooltip(this));
                            } else {
                                console.error(restResponse);
                                Swal.fire(
                                    "Server Error!",
                                    "Filter has not been correctly saved.",
                                    "error"
                                );
                            }
                            this.requestUpdate();
                        }).catch(restResponse => {
                            console.error(restResponse);
                            Swal.fire(
                                "Server Error!",
                                "Filter has not been correctly saved.",
                                "error"
                            );
                        });
                }

            })
            .catch(restResponse => {
                if (restResponse.getEvents?.("ERROR")?.length) {
                    const msg = restResponse.getEvents("ERROR").map(error => error.message).join("<br>");
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
        // suppress if I have clicked on an action buttons
        if (e.target.className !== "id-filter-button") {
            return;
        }

        this.querySelector("#" + this._prefix + "Warning").style.display = "none";
        if (!UtilsNew.isUndefinedOrNull(this._filters)) {
            // We look for the filter name in the filters array
            for (const filter of this._filters) {
                if (filter.id === e.currentTarget.dataset.filterId) {
                    filter.active = true;

                    // We need to merge the selected filter query with the "save.ignoreParams" of the current query,
                    // otherwise the sample or file are deleted.
                    const _query = {};
                    if (this._config?.save?.ignoreParams) {
                        for (const key of Object.keys(this.query)) {
                            if (this._config.save.ignoreParams.includes(key)) {
                                _query[key] = this.query[key];
                            }
                        }
                    }

                    const _queryList = {..._query, ...filter.query};
                    if (_queryList.study) {
                        // add the current active study
                        const studies = [...new Set([..._queryList.study.split(","), this.opencgaSession.study.fqn])];
                        _queryList.study = studies.join(",");
                    }
                    this.dispatchEvent(new CustomEvent("activeFilterChange", {
                        detail: _queryList,
                        bubbles: true,
                        composed: true
                    }));
                } else {
                    filter.active = false;
                }
            }
        }
        this.requestUpdate();
    }

    serverFilterDelete(e) {
        const {filterId} = e.currentTarget.dataset;
        Swal.fire({
            title: "Are you sure?",
            text: "The filter will be deleted. The operation cannot be reverted.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes"
        }).then(result => {
            if (result.value) {
                const data = {
                    id: filterId,
                    resource: this.resource,
                    options: {}
                };
                this.opencgaSession.opencgaClient.users().updateFilters(this.opencgaSession.user.id, data, {action: "REMOVE"})
                    .then(restResponse => {
                        console.log("restResponse", restResponse);
                        Swal.fire(
                            "Filter Deleted",
                            "Filter has been deleted.",
                            "success"
                        );
                        this.refreshFilters();
                    }).catch(restResponse => {
                        if (restResponse.getEvents?.("ERROR")?.length) {
                            const msg = restResponse.getEvents("ERROR").map(error => error.message).join("<br>");
                            new NotificationQueue().push("Error deleting filter", msg, "error");
                        } else {
                            new NotificationQueue().push("Error deleting filter", "", "error");
                        }
                        console.error(restResponse);
                    });
            }
        });
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
        console.log("hiding warn")

        this.querySelector("#" + this._prefix + "Warning").style.display = "none";

        console.log("onQueryFacetDelete", e.target.dataset.filterName);
        delete this.facetQuery[e.target.dataset.filterName];
        // NOTE we don't update this.facetQuery reference because facetQueryObserver() is being called already by this chain:
        // `activeFacetChange` event triggers onActiveFacetChange() => onRun() in opencga-browser => [...] => facetQueryObserver() in opencga-active-filters
        // this.facetQuery = {...this.facetQuery};

        this.dispatchEvent(new CustomEvent("activeFacetChange", {
            detail: this.facetQuery,
            bubbles: true,
            composed: true
        }));
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
                "sample": "Sample Genotype",
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
            lockedFields: [],
            save: {
                ignoreParams: ["study", "sample", "sampleData", "file", "fileData"]
            }
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
            <div class="alert alert-info">queryList ${JSON.stringify(this.queryList)}</div>
             <div class="alert alert-info">facetQuery ${JSON.stringify(this.facetQuery)}</div>-->
            <div class="panel panel-default">
                <div class="panel-body" style="padding: 8px 10px">
                    <div class="lhs">
                        <div class="dropdown saved-filter-dropdown" style="margin-right: 5px">
                            <button type="button" class="active-filter-label ripple no-shadow" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" data-cy="filter-button">
                                <i class="fa fa-filter icon-padding" aria-hidden="true"></i> Filters <span class="caret"></span>
                            </button>
                            <ul class="dropdown-menu saved-filter-wrapper">
                                <li>
                                    <a><i class="fas fa-cloud-upload-alt icon-padding"></i> <strong>Saved Filters</strong></a>
                                </li>
                                ${this._filters && this._filters.length ?
                                    this._filters.map(item => item.separator ?
                                        html`
                                            <li role="separator" class="divider"></li>` :
                                        html`
                                            <li>
                                                <a data-filter-id="${item.id}" class="filtersLink" style="cursor: pointer;color: ${!item.active ? "black" : "green"}"
                                                        @click="${this.onServerFilterChange}">
                                                    <span class="id-filter-button">${item.id}</span>
                                                    <span class="action-buttons">
                                                        <span tooltip-title="${item.id}"
                                                              tooltip-text="${(item.description ? item.description + "<br>" : "") + Object.entries(item.query).map(([k, v]) => `<b>${k}</b> = ${v}`).join("<br>")}"
                                                              data-filter-id="${item.id}">
                                                            <i class="fas fa-eye"></i>
                                                        </span>
                                                        <i data-cy="delete" tooltip-title="Delete filter" class="fas fa-trash" data-filter-id="${item.id}" @click="${this.serverFilterDelete}"></i>
                                                    </span>
                                                </a>
                                            </li>`
                                        ) :
                                    html`<li><a class="help-block">No filters found</a></li>`
                                }

                                <li role="separator" class="divider"></li>
                                <li>
                                    <a href="javascript: void 0" @click="${this.clear}" data-action="active-filter-clear">
                                        <i class="fa fa-eraser icon-padding" aria-hidden="true"></i> <strong>Clear</strong>
                                    </a>
                                </li>
                                ${this.isLoggedIn() ? html`
                                    <li>
                                        <a style="cursor: pointer" @click="${this.launchModal}" data-action="active-filter-save"><i class="fas fa-save icon-padding"></i> <strong>Save filter...</strong></a>
                                    </li>
                                ` : null}
                            </ul>
                        </div>

                        ${this.queryList ? html`
                            ${this.queryList.length === 0 ?
                                html`
                                    <label>No filters selected</label>` :
                                html`
                                    ${this.queryList.map(item => !this._isMultiValued(item) ?
                                        html`
                                            ${!item.locked ?
                                                html`
                                                    <!-- No multi-valued filters -->
                                                    <button type="button" class="btn btn-warning btn-sm ${item.name}ActiveFilter active-filter-button ripple no-transform" data-filter-name="${item.name}" data-filter-value=""
                                                            @click="${this.onQueryFilterDelete}">
                                                    ${item.text}
                                                    </button>` :
                                                html`
                                                    <button type="button" class="btn btn-warning btn-sm ${item.name}ActiveFilter active-filter-button ripple no-transform" data-filter-name="${item.name}" data-filter-value=""
                                                             @click="${this.onQueryFilterDelete}" title="${item.message ?? ""}" disabled>
                                                        ${item.text}
                                                    </button>`
                                                }` :
                                        html`
                                            <!-- Multi-valued filters -->
                                            <div class="btn-group">
                                                ${item.locked ?
                                                    html`
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
                                                        </ul>` :
                                                    html`
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
                            ` :
                        null}
                    </div>

                    <div class="rhs">
                        <!--<button type="button" class="btn btn-primary btn-sm ripple" @click="${this.clear}">
                            <i class="fa fa-eraser icon-padding" aria-hidden="true"></i> Clear
                        </button>
                        -->

                        <!-- TODO we probably need a new property for this -->
                        ${false && this.showSelectFilters(this.opencgaClient._config) ? html`
                            <div class="dropdown saved-filter-wrapper">

                                <button type="button" class="btn btn-primary btn-sm dropdown-toggle ripple" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <i class="fa fa-filter icon-padding" aria-hidden="true"></i> Filters <span class="caret"></span>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-right">
                                    <li><a style="font-weight: bold">Saved Filters</a></li>
                                    ${this._filters && this._filters.length ?
                                        this._filters.map(item => item.separator ? html`
                                            <li role="separator" class="divider"></li>
                                        ` : html`
                                            <li>
                                                <a data-filter-id="${item.id}" class="filtersLink" style="cursor: pointer;color: ${!item.active ? "black" : "green"}" title="${item.description ?? ""}" @click="${this.onServerFilterChange}">
                                                    <span class="id-filter-button">&nbsp;&nbsp;${item.id}</span>
                                                    <span class="delete-filter-button" title="Delete filter" data-filter-id="${item.id}" @click="${this.serverFilterDelete}"><i class="fas fa-times"></i></span>
                                                </a>
                                            </li>`) :
                                        null
                                    }
                                    ${this.isLoggedIn() ? html`
                                        <li role="separator" class="divider"></li>
                                        <li>
                                            <a style="cursor: pointer" @click="${this.launchModal}"><i class="fa fa-floppy-o" aria-hidden="true"></i> Save...</a>
                                        </li>
                                    ` : null}
                                </ul>
                            </div>
                        ` : null}
                    </div>
                    <!-- aggregation stat section -->
                    ${this.facetActive && this.facetQuery && Object.keys(this.facetQuery).length ? html`
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
                                        <i class="fa fa-eraser icon-padding" aria-hidden="true"></i> Clear
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
                                    <input class="form-control" type="text" id="${this._prefix}filterName" data-cy="modal-filter-name">
                                </div>
                            </div>
                            <div class="form-group row">
                                <label for="${this._prefix}filterDescription" class="col-xs-2 col-form-label">Description</label>
                                <div class="col-xs-10">
                                    <input class="form-control" type="text" id="${this._prefix}filterDescription" data-cy="modal-filter-description">
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-dismiss="modal" @click="${this.save}" data-cy="modal-filter-save-button">Save</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("opencga-active-filters", OpencgaActiveFilters);
