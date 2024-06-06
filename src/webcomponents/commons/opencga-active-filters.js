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

import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../core/utils-new.js";
import LitUtils from "./utils/lit-utils.js";
import NotificationUtils from "./utils/notification-utils.js";

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
            executedFacetQuery: {
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

        this.history = [];
    }

    firstUpdated() {
        // Small trick to force the warning message display after DOM is renderer
        this.query = {...this.query};

        // We need to init _previousQuery with query in order to work before executing any search
        this._previousQuery = this.query;
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }

        // this is before queryObserver because in searchClicked() updates this._jsonPrevQuery which is being used in queryObserver()
        if (changedProperties.has("executedQuery") || changedProperties.has("executedFacetQuery")) {
            this.searchClicked();
        }

        if (changedProperties.has("query")) {
            this.queryObserver();
        }

        if (changedProperties.has("config")) {
            this.configObserver();
        }

        if (changedProperties.has("facetQuery")) {
            // TODO review queryObserver and unify the behaviour of the Warning alert
            this.facetQueryObserver();
        }

        if (changedProperties.has("filters")) {
            this.refreshFilters();

            // Nacho (6/2/2021): probably observers should not dispatch new events
            // If there is any active filter we set the first one in the initialisation
            // if (this.filters) {
            //     const activeFilter = this.filters.find(f => f.active);
            //     if (activeFilter) {
            //         this.dispatchEvent(new CustomEvent("activeFilterChange", {
            //             detail: activeFilter.query,
            //         }));
            //     }
            // }
        }
        super.update(changedProperties);
    }

    // Josemi 20220916 NOTE: this updated is required to update the tooltips for the history items
    updated() {
        UtilsNew.initTooltip(this);
    }

    opencgaSessionObserver() {
        if (this.opencgaSession.token && this.opencgaSession?.study?.fqn) {
            this.refreshFilters();

            // Empty history when changing study
            this.history = [];
        }
    }

    queryObserver() {
        const _queryList = [];
        const keys = Object.keys(this.query);

        if (!this._prevQuery || !UtilsNew.objectCompare(this.query, this._prevQuery)) {
            this._prevQuery = {...this.query};
            $("#" + this._prefix + "Warning").fadeIn();
            // console.log("query has changed")
        } else {
            // query not changed OR changed via onQueryFacetDelete() so this._jsonPrevFacetQuery was already updated
            // console.log("query has not changed or changed in active-filters")
            $("#" + this._prefix + "Warning").hide();
        }

        for (const keyIdx in keys) {
            if (Object.prototype.hasOwnProperty.call(keys, keyIdx)) {
                const key = keys[keyIdx];
                if (UtilsNew.isNotEmpty(this.query[key]) && (!this._config.hiddenFields || (this._config.hiddenFields && !this._config.hiddenFields.includes(key)))) {

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
                        // Check if the field has been defined as complex
                        const complexField = this._config.complexFields.find(item => item.id === key);
                        if (complexField) {
                            filterFields = complexField?.separator ? value.split(complexField.separator) : UtilsNew.splitByRegex(value, complexField.separatorRegex);
                        } else if (value.indexOf(";") !== -1 && value.indexOf(",") !== -1) {
                            // If we find a field with both ; and , we will separate by ;
                            filterFields = value.split(";");
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

        }
        this.queryList = _queryList;

        this.requestUpdate();
    }

    facetQueryObserver() {
        // this just handle the visibility of the warning message and store a serialised this.facetQuery into this._jsonPrevFacetQuery.
        // we use the same logic as queryObserver() for show/hide the warning message, but here we store a json string in _jsonPrevFacetQuery.
        if (this.facetQuery && Object.keys(this.facetQuery).length) {
            // check if this.facetQuery has changed
            if (!this._jsonPrevFacetQuery || !UtilsNew.objectCompare(this.facetQuery, JSON.parse(this._jsonPrevFacetQuery))) {
                this._jsonPrevFacetQuery = JSON.stringify(this.facetQuery); // this.facetQuery is a complex object, {...this.facetQuery} won't work
                $("#" + this._prefix + "Warning").fadeIn();

            } else {
                // query not changed OR changed via onQueryFacetDelete() so this._jsonPrevFacetQuery was already updated
                $("#" + this._prefix + "Warning").hide();
            }
        } else {
            // TODO handle warning alert here too
            this._jsonPrevFacetQuery = null;
        }
    }

    searchClicked() {
        $("#" + this._prefix + "Warning").hide();
        this._prevQuery = {...this.query};
        this._jsonPrevFacetQuery = JSON.stringify(this.executedFacetQuery);

        // FIXME To be deleted after testing
        // Check if the current active filter must still be active after changing the query
        // const activeFilter = this._filters?.find(filter => filter.active);
        // if (activeFilter) {
        //     for (const key of Object.keys(this.query)) {
        //         // Only consider non-locked fields
        //         if (key !== "study" && this._config.lockedFields.findIndex(f => f.id === key) === -1) {
        //             // Check if the filter value is the same
        //             if (activeFilter.query[key] !== this.query?.[key]) {
        //                 activeFilter.active = false;
        //                 break;
        //             }
        //         }
        //     }
        // } else {
        //     // If not active filter is set we check if any matches the current query.
        //     // Skip categories and separators.
        //     const queryFilters = this._filters.filter(f => !!f.query);
        //     for (const filtersKey of queryFilters) {
        //         let match = true;
        //         for (const key of Object.keys(this.query)) {
        //             // Check if all existing keys (but study) have the same values as the filter
        //             if (key !== "study") {
        //                 if (filtersKey?.query?.[key]) {
        //                     match = match && filtersKey.query[key] === this.query[key];
        //                 } else {
        //                     match = false;
        //                     break;
        //                 }
        //             }
        //         }
        //         if (match) {
        //             filtersKey.active = true;
        //             break;
        //         }
        //     }
        // }

        // Set all filters not active
        // eslint-disable-next-line no-param-reassign
        this._filters.forEach(f => f.active = false);

        // Now check if any filter matches the current query. Skip categories and separators.
        const queryFilters = this._filters.filter(f => !!f.query);
        for (const filtersKey of queryFilters) {
            let match = true;
            for (const key of Object.keys(this.query)) {
                // Check if all existing keys (but study) have the same values as the filter
                if (key !== "study" && this._config.lockedFields.findIndex(f => f.id === key) === -1) {
                    if (filtersKey?.query?.[key]) {
                        match = match && filtersKey.query[key] === this.query[key];
                    } else {
                        match = false;
                        break;
                    }
                }
            }
            if (match) {
                filtersKey.active = true;
                break;
            }
        }


        // Update History
        // 1. remove all identical filters
        const _history = this.history.filter(hist => JSON.stringify(hist.query) !== JSON.stringify(this.query));

        // 2. Remove previous latest
        if (_history?.length > 0) {
            _history[0].latest = false;
        }

        // 3. Prepare new latest filter and add at the beginning
        _history.unshift({
            date: UtilsNew.getDatetime(),
            query: {...this.query},
            latest: true
        });

        // 4. Limit up to 10 history items
        this.history = _history.slice(0, 10);

        // 5. Refresh
        this.requestUpdate();
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

    clear() {
        this._filters = this._filters.map(f => ({...f, active: false}));
        // this.requestUpdate();
        // Trigger clear event
        this.dispatchEvent(new CustomEvent("activeFilterClear", {detail: {} /* bubbles: true, composed: true*/}));
    }

    clearFacet() {
        $("#" + this._prefix + "Warning").hide();
        this.dispatchEvent(new CustomEvent("activeFacetClear", {detail: {} /* bubbles: true, composed: true*/}));
    }

    launchModal() {
        // $("#" + this._prefix + "SaveModal").modal("show");
        const saveModal = new bootstrap.Modal(`#${this._prefix}SaveModal`);
        saveModal.show();
    }

    showSelectFilters() {
        return (this.filters !== undefined && this.filters.length > 0) || !UtilsNew.isEmpty(this.opencgaSession.token);
    }

    isLoggedIn() {
        return !!this?.opencgaSession?.token;
    }

    async fetchServerFilters() {
        try {
            const response = await this.opencgaSession.opencgaClient.users().filters(this.opencgaSession.user.id);
            this.opencgaSession.user.filters = response.getResults();
            this.refreshFilters();
        } catch (e) {
            console.error(e);
        }
    }

    refreshFilters() {
        // 0. Reset internal filters array every time
        this._filters = [];

        // 1. Add passed application filters
        if (this.filters?.length > 0) {
            this._filters = [
                {name: "Application Filters", category: true},
                ...this.filters
            ];
        }

        // 2. Add and merge user filters
        const userFilters = this.opencgaSession.user.filters.filter(f => f.resource === this.resource);
        if (userFilters?.length > 0) {
            this._filters = [
                ...this._filters,
                {name: "User Saved Filters", category: true},
                ...userFilters
            ];
        }

        // 3. Refresh and add tooltips
        this.requestUpdate();
        this.updateComplete.then(() => UtilsNew.initTooltip(this));
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

        this.opencgaSession.opencgaClient.users().filters(this.opencgaSession.user.id)
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

                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
                        title: "Are you sure?",
                        message: "A Filter with the same name is already present. You are going to overwrite it.",
                        ok: () => {
                            this.opencgaSession.opencgaClient.users().updateFilter(this.opencgaSession.user.id, filterName, data)
                                .then(response => {
                                    if (response?.getEvents?.("ERROR")?.length) {
                                        return NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                                    }

                                    /* for (const i in this._filters) {
                                        if (this._filters[i].id === filterName) {
                                            this._filters[i] = response.response[0].result[0];
                                        }
                                    } */

                                    // Display success message
                                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                                        message: "Filter has been saved",
                                    });
                                    this.fetchServerFilters();
                                    $("#" + this._prefix + "filterName").val("");
                                    $("#" + this._prefix + "filterDescription").val("");
                                })
                                .catch(response => {
                                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                                });
                        },
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
                    this.opencgaSession.opencgaClient.users().updateFilters(this.opencgaSession.user.id, data, {action: "ADD"})
                        .then(response => {
                            if (response.getEvents?.("ERROR")?.length) {
                                return NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                            }

                            this._filters = [...this._filters, data];
                            $("#" + this._prefix + "filterName").val("");
                            $("#" + this._prefix + "filterDescription").val("");

                            // Display success message
                            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                                message: "Filter has been saved",
                            });
                            this.fetchServerFilters();
                        })
                        .catch(response => {
                            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                        });
                }
            })
            .catch(response => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            });
    }

    onFilterChange(e, query) {
        // suppress if I have clicked on an action buttons
        if (e.target?.dataset?.action === "delete-filter") {
            return;
        }

        $("#" + this._prefix + "Warning").hide();

        // This happens when clicking in the history
        if (query) {
            LitUtils.dispatchCustomEvent(this, "activeFilterChange", null, query);
            return;
        }

        // A filter has been selected
        if (this._filters) {
            // We look for the filter name in the filters array
            for (const filter of this._filters) {
                if (filter.id === e.currentTarget.dataset.filterId) {
                    filter.active = true;

                    // Prepare new query object
                    let newQuery = {};

                    // 1. We need to add first all the 'lockedFields' to the selected saved query
                    if (this._config?.lockedFields) {
                        this._config.lockedFields
                            .filter(lockedField => this.query[lockedField.id])
                            .forEach(lockedField => newQuery[lockedField.id] = this.query[lockedField.id]);
                    }

                    // 2. Now add the saved query filters
                    newQuery = {...newQuery, ...filter.query};

                    // 3. Make sure current active study is added if 'study' parameter exists
                    if (newQuery.study) {
                        const studies = [...new Set([...newQuery.study.split(","), this.opencgaSession.study.fqn])];
                        newQuery.study = studies.join(",");
                    }

                    LitUtils.dispatchCustomEvent(this, "activeFilterChange", null, newQuery);
                } else {
                    filter.active = false;
                }
            }
        }
        this.requestUpdate();
    }

    serverFilterDelete(e) {
        const {filterId} = e.currentTarget.dataset;
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Are you sure?",
            message: "The filter will be deleted. The operation cannot be reverted.",
            ok: () => {
                const data = {
                    id: filterId,
                    resource: this.resource,
                    options: {}
                };
                this.opencgaSession.opencgaClient.users().updateFilters(this.opencgaSession.user.id, data, {action: "REMOVE"})
                    .then(() => {
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                            message: "Filter has been deleted",
                        });
                        this.fetchServerFilters();
                    })
                    .catch(response => {
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                    });
            },
        });
    }

    onQueryFilterDelete(e) {
        const _queryList = Object.assign({}, this.query);

        const {filterName: name, filterValue: value} = e.currentTarget.dataset;
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
                filterFields = _queryList[name].split(new RegExp("[,;]"));
                const indexOfValue = filterFields.indexOf(value);
                filterFields.splice(indexOfValue, 1);
                if (_queryList[name].indexOf(",") !== -1) {
                    _queryList[name] = filterFields.join(",");
                } else {
                    _queryList[name] = filterFields.join(";");
                }

            } else {
                // Check if the field has been defined as complex
                const complexField = this._config.complexFields.find(item => item.id === name);
                if (complexField) {
                    // filterFields = _queryList[name].split(complexField.separator);
                    filterFields = complexField?.separator ? _queryList[name].split(complexField.separator) : UtilsNew.splitByRegex(_queryList[name], complexField.separatorRegex);
                } else if (value.indexOf(";") !== -1 && value.indexOf(",") !== -1) {
                    // If we find a field with both ; and , we will separate by ;
                    filterFields = _queryList[name].split(";");
                } else {
                    filterFields = _queryList[name].split(new RegExp("[,;]"));
                }

                const indexOfValue = filterFields.indexOf(value);
                filterFields.splice(indexOfValue, 1);

                if (complexField) {
                    _queryList[name] = complexField?.separator ? filterFields.join(complexField.separator) : filterFields.join(); // join() By default add comma
                } else if (value.indexOf(";") !== -1 && value.indexOf(",") !== -1) {
                    _queryList[name] = filterFields.join(";");
                } else if (_queryList[name].indexOf(",") !== -1) {
                    _queryList[name] = filterFields.join(",");
                } else {
                    _queryList[name] = filterFields.join(";");
                }
            }
        }

        this._jsonPrevQuery = JSON.stringify(_queryList);

        this.dispatchEvent(new CustomEvent("activeFilterChange", {
            detail: _queryList,
            /* bubbles: true,
            composed: true*/
        }));
    }

    onQueryFacetDelete(e) {
        $("#" + this._prefix + "Warning").hide();
        delete this.facetQuery[e.target.dataset.filterName];
        // NOTE we don't update this.facetQuery reference because facetQueryObserver() is being called already by this chain:
        // `activeFacetChange` event triggers onActiveFacetChange() => onRun() in opencga-browser => [...] => facetQueryObserver() in opencga-active-filters
        // this.facetQuery = {...this.facetQuery};

        this._jsonPrevFacetQuery = JSON.stringify(this.facetQuery);

        this.dispatchEvent(new CustomEvent("activeFacetChange", {
            detail: this.facetQuery,
            /* bubbles: true,
            composed: true*/
        }));
    }

    renderFilterItem(item) {
        if (item.separator) {
            return html`<li><hr class="dropdown-divider"></li>`;
        } else {
            if (item.category) {
                return html`<li>
                        <small class="dropdown-header form-text m-0 py-0">
                        ${item.name}
                        </small>
                    </li>`;
            } else {
                return html`
                    <!-- Render the filter option -->
                    <li>
                        <a data-filter-id="${item.id}" class="ms-2 d-flex dropdown-item ${item.active ? "text-success" : ""}"
                            style="cursor:pointer;"
                            @click="${this.onFilterChange}">
                            <span class="flex-grow-1">${item.id}</span>
                            <span class="text-secondary cy-action-buttons ms-3">
                            <span tooltip-title="${item.id}"
                                tooltip-text="${(item.description ? item.description + "<br>" : "") + Object.entries(item.query).map(([k, v]) => `<b>${k}</b> = ${v}`).join("<br>")}"
                                data-filter-id="${item.id}">
                                <i class="fas fa-eye" data-action="view-filter"></i>
                            </span>
                            <!-- Add delete icon only to saved filters. Saved filters have a 'resource' field -->
                            ${item.resource ? html`
                                <i data-cy="delete" tooltip-title="Delete filter" class="fas fa-trash"
                                    data-action="delete-filter" data-filter-id="${item.id}" @click="${this.serverFilterDelete}">
                                </i>
                            ` : null}
                        </span>
                        </a>
                    </li>
                `;
            }
        }
    }

    renderHistoryItem(item) {
        // Skip study param
        const filterParams = Object.keys(item.query).filter(key => key !== "study" && !!item.query[key]);
        const filterTitle = UtilsNew.dateFormatter(item.date, "HH:mm:ss");
        const filterTooltip = filterParams.map(key => `<b>${key}</b> = ${item.query[key]}`).join("<br>");

        return html`
            <a class="dropdown-item" @click="${e => this.onFilterChange(e, item.query)}">
            <div class="d-flex align-items-center">
                <div class="flex-grow-1">
                    <div class="ms-2 mt-0 text-truncate">
                        ${filterTitle} ${item.latest ? " (latest)" : ""}
                    </div>
                    <div class="ms-2 form-text">
                    ${filterParams?.length > 0 ? html`
                        ${filterParams.slice(0, 2).map(key => html`
                            <div class="mx-2" title="${item.query[key]}">
                                <b>${key}</b>: ${UtilsNew.substring(item.query[key], 20)}
                            </div>
                        `)}
                    ` : html`
                        Empty query.
                    `}
                    </div>
                </div>
                <div class="flex-shrink-0 text-secondary mb-auto">
                    <span  class="action-buttons" tooltip-title="${filterTitle}" tooltip-text="${filterTooltip || "Empty query."}">
                        <i class="fas fa-eye" data-action="view-filter"></i>
                    </span>
                </div>
            </div>
            </a>
        `;
    }
    render() {
        return html`
            ${this.facetActive ? html`
                <div class="alert alert-warning filter-warning" role="alert" id="${this._prefix}Warning" style="">
                    <span><strong>Warning!</strong></span>&nbsp;&nbsp;Filters or Facets have changed, please click on <strong> ${this._config.searchButtonText} </strong> to update the results.
                </div>
            ` : html`
                <div class="alert alert-warning filter-warning" role="alert" id="${this._prefix}Warning" style="">
                    <span><strong>Warning!</strong></span>&nbsp;&nbsp;Filters have changed, please click on <strong> ${this._config.searchButtonText} </strong> to update the results.
                </div>
            `}

            <div class="card mb-3">
                <!-- padding: 8px 10px -->
                <div class="card-body py-2 px-2">
                    <!-- Render dropdown menu with all filters and history -->
                    <!-- display:flex;flex-wrap:wrap;column-gap:4px;row-gap:4px;align-items:center; -->
                    <div class="d-flex flex-column gap-1">
                        <div class="d-flex flex-wrap gap-1 align-items-center">
                            <div class="dropdown me-1">
                                <button type="button" class="active-filter-label btn btn-light dropdown-toggle" data-bs-toggle="dropdown"
                                        role="button" aria-expanded="false" data-cy="filter-button">
                                    <i class="fa fa-filter" aria-hidden="true"></i> Filters
                                </button>
                                <ul class="dropdown-menu">
                                    <!-- Render FILTERS options -->
                                    <li>
                                        <h6 class="dropdown-header fw-bold text-dark">
                                            <i class="fas fa-filter"></i>
                                            Filters
                                        </h6>
                                    </li>
                                    ${this._filters?.length > 0 ? html`
                                        ${this._filters.map(item => this.renderFilterItem(item))}
                                    ` : html`
                                        <!-- style="margin: 0 30px" -->
                                        <div class="form-text my-0 mx-3">
                                            No filters found.
                                        </div>
                                    `}
                                    <li><hr class="dropdown-divider"></li>
                                    <!-- Render HISTORY filters -->
                                    <li>
                                        <h6 class="dropdown-header fw-bold text-dark">
                                        <i class="fas fa-history"></i>
                                            History
                                        </h6>
                                    </li>
                                    ${this.history?.length > 0 ? html`
                                        ${this.history.map(item => html`
                                            <li>
                                                ${this.renderHistoryItem(item)}
                                            </li>
                                        `)}
                                    ` : html`
                                        <div class="form-text my-0 mx-3">
                                            Empty history.
                                        </div>
                                    `}
                                    <li><hr class="dropdown-divider"></li>

                                    <!-- Add CLEAR and SAVE buttons -->
                                    <li>
                                        <a class="dropdown-item" href="javascript: void 0" @click="${this.clear}" data-action="active-filter-clear">
                                            <i class="fa fa-eraser " aria-hidden="true"></i>
                                            <label>Clear</label>
                                        </a>
                                    </li>
                                    ${this.isLoggedIn() ? html`
                                        <li>
                                            <a class="dropdown-item" style="cursor: pointer" @click="${this.launchModal}" data-action="active-filter-save">
                                                <i class="fas fa-save"></i>
                                                <label>Save current filter</label>
                                            </a>
                                        </li>
                                    ` : null}
                                </ul>
                            </div>

                            <!-- Render active query filters -->
                            ${this.queryList?.length > 0 ? html`
                                ${this.queryList.map(item => !item.items ? html`
                                    <!-- Single-valued filters -->
                                    ${!item.locked ? html`
                                        <!-- No multi-valued filters -->
                                        <button type="button" class="btn btn-warning ${item.name}ActiveFilter text-decoration-line-through-hover" data-filter-name="${item.name}" data-filter-value=""
                                                @click="${this.onQueryFilterDelete}">
                                            ${item.text}
                                        </button>
                                    ` : html`
                                        <button type="button" class="btn btn-warning ${item.name}ActiveFilter text-decoration-line-through-hover" data-filter-name="${item.name}" data-filter-value=""
                                                @click="${this.onQueryFilterDelete}" title="${item.message ?? ""}" disabled>
                                            ${item.text}
                                        </button>
                                    `}
                                ` : html`
                                    <!-- Multi-valued filters -->
                                    <div class="btn-group">
                                        ${item.locked ? html`
                                            <button type="button" class="btn btn-warning ${item.name}ActiveFilter text-decoration-line-through-hover" data-filter-name="${item.name}" data-filter-value=""
                                                    @click="${this.onQueryFilterDelete}" disabled>
                                                ${item.text} <span class="badge text-bg-light rounded-pill">${item.items.length}</span>
                                            </button>
                                            <button type="button" class="btn btn-warning dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                <span class="visually-hidden">Toggle Dropdown</span>
                                            </button>
                                            <ul class="dropdown-menu">
                                                ${item.items.length && item.items.map(filterItem => html`
                                                    <li class="disabled" style="cursor: pointer">
                                                        <a class="dropdown-item">${filterItem}</a>
                                                    </li>
                                                `)}
                                            </ul>
                                        ` : html`
                                            <button type="button" class="btn btn-warning ${item.name}ActiveFilter text-decoration-line-through-hover" data-filter-name="${item.name}" data-filter-value=""
                                                    @click="${this.onQueryFilterDelete}">
                                                ${item.text} <span class="badge text-bg-light rounded-circle">${item.items.length}</span>
                                            </button>
                                            <button type="button" class="btn btn-warning dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" data-bs-reference="parent">
                                                <span class="visually-hidden">Toggle Dropdown</span>
                                            </button>
                                            <ul class="dropdown-menu">
                                                ${item.items.length && item.items.map(filterItem => html`
                                                    <li class="text-decoration-line-through-hover" style="cursor: pointer">
                                                        <a class="dropdown-item" @click="${this.onQueryFilterDelete}" data-filter-name="${item.name}" data-filter-value="${filterItem}">
                                                            ${filterItem}
                                                        </a>
                                                    </li>
                                                `)}
                                            </ul>
                                        `}
                                    </div>
                                `)}
                            ` : html`
                                <label class="fw-bold">No filters selected</label>
                            `}
                        </div>

                        <!-- aggregation stat section -->
                        ${this.facetActive && this.facetQuery && Object.keys(this.facetQuery).length ? html`
                            <div class="facet-wrapper d-flex flex-wrap gap-1 align-items-center">
                                <div class="dropdown me-1" style="margin-right: 5px">
                                    <button class="active-filter-label btn btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" data-cy="filter-button">
                                        <i class="fas fa-project-diagram"></i> Aggregation fields
                                    </button>
                                    <ul class="dropdown-menu saved-filter-wrapper">
                                        <li>
                                            <a class="dropdown-item fw-bold text-decoration-none" href="javascript: void 0" @click="${this.clearFacet}" data-action="active-filter-clear">
                                                <i class="fa fa-eraser" aria-hidden="true"></i> Clear
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                                ${Object.entries(this.facetQuery).map(([name, facet]) => html`
                                    <button type="button" class="btn btn-secondary ${name}ActiveFilter text-decoration-line-through-hover" data-filter-name="${name}" data-filter-value=""
                                            @click="${this.onQueryFacetDelete}">
                                        ${facet.formatted}
                                    </button>
                                `)}
                            </div>
                        ` : nothing}
                    </div>
                </div>
            </div>

            <!-- Modal -->
            <div class="modal fade" id="${this._prefix}SaveModal" tabindex="-1" role="dialog"
                 aria-labelledby="${this._prefix}SaveModalLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h4 class="modal-title" id="${this._prefix}SaveModalLabel">Filter</h4>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3 row">
                                <label for="${this._prefix}filterName" class="col-sm-2 col-form-label fw-bold">Name</label>
                                <div class="col-sm-10">
                                    <input class="form-control" type="text" id="${this._prefix}filterName" data-cy="modal-filter-name">
                                </div>
                            </div>
                            <div class="mb-3 row">
                                <label for="${this._prefix}filterDescription" class="col-sm-2 col-form-label fw-bold">Description</label>
                                <div class="col-sm-10">
                                    <input class="form-control" type="text" id="${this._prefix}filterDescription" data-cy="modal-filter-description">
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="${this.save}" data-cy="modal-filter-save-button">
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            searchButtonText: "SEARCH",
            alias: {
                "region": "Region",
                "gene": "Gene",
                "genotype": "Sample Genotype",
                "sample": "Sample",
                "maf": "Cohort Stat MAF",
                "cohortStatsAlt": "Cohort Stats",
                "xref": "XRef",
                "panel": "Disease Panel",
                "file": "Files",
                "qual": "QUAL",
                "filter": "FILTER",
                "biotype": "Biotype",
                "ct": "Consequence Type",
                "annot-functional-score": "CADD",
                "populationFrequencyAlt": "Population Frequency",
                "proteinSubstitution": "Protein Substitution",
                "annot-go": "GO",
                "annot-hpo": "HPO"
            },
            complexFields: [],
            hiddenFields: [],
            lockedFields: [],
            save: {
                ignoreParams: ["study", "sample", "file", "fileData"]
            }
        };
    }

}

customElements.define("opencga-active-filters", OpencgaActiveFilters);
