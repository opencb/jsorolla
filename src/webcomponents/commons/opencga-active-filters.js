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
import WebUtils from "./utils/web-utils.js";
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
            toolId: {
                type: String,
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
            defaultFilter: {
                type: Object,
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

        if (changedProperties.has("filters") || changedProperties.has("defaultFilter")) {
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
    updated(changedProperties) {
        UtilsNew.initTooltip(this);

        // Josemi NOTE 2024-05-08 Check to force an update of the active filters
        // This is required to style the default filter as active when user enters in the tool for the first time
        // or when user changes the study
        if (changedProperties.has("defaultFilter")) {
            if (!!this.defaultFilter && !UtilsNew.isEmpty(this.defaultFilter)) {
                this.updateActiveFilter();
                this.requestUpdate();
            }
        }
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

        // Update active filter
        this.updateActiveFilter();

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

    updateActiveFilter() {
        // Set all filters not active
        // eslint-disable-next-line no-param-reassign
        this._filters.forEach(filter => filter.active = false);

        // Get list of keys in current query
        // We will remove the study and the locked fields from this list
        const keys = Object.keys(this.query)
            .filter(key => key !== "study" && this._config.lockedFields.every(field => field?.id !== key));

        // Check for non empty query. This will avoid selecting always the first filter in the list
        if (keys.length > 0) {
            // Now check if any filter matches the current query.
            // Skip categories, separators, and disabled filters
            const queryFilters = this._filters.filter(filter => !!filter.query && !filter.disabled);
            for (const filtersKey of queryFilters) {
                const match = keys.every(key => {
                    return typeof filtersKey.query[key] !== "undefined" && filtersKey.query[key] === this.query[key];
                });
                if (match) {
                    filtersKey.active = true;
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
        $("#" + this._prefix + "SaveModal").modal("show");
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

        // 1. Add passed application filters (default filter or example filters)
        if (this.filters?.length > 0 || !!this.defaultFilter) {
            // 1.1. Add filters section
            this._filters.push({name: "Application Filters", category: true});

            // 1.2. Add default filter
            if (this.defaultFilter) {
                const isDisabled = UtilsNew.isEmpty(this.defaultFilter);
                this._filters.push({
                    id: "Default Filter",
                    query: this.defaultFilter,
                    disabled: isDisabled,
                    description: isDisabled ? "Filter not configured." : "",
                    active: false,
                });
            }

            // 1.3. Add example filters
            if (this.filters?.length > 0) {
                this._filters.push(...this.filters);
            }
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

        // 3. Force an update
        this.requestUpdate();
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
        e.preventDefault();
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
                if (filter.id === e.currentTarget.dataset.filterId && !filter.disabled) {
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

    onCopyLink() {
        // 1. Generate the url to the tool with the current query
        const link = WebUtils.getIVALink(this.opencgaSession, this.toolId, this.query);
        // 2. Copy this link to the user clipboard
        UtilsNew.copyToClipboard(link);
        // 3. Notify user that the link has been copied to the clipboard
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
            message: "Link to current query copied to clipboard.",
        });
    }

    renderFilterItem(item) {
        if (item.separator) {
            return html`
                <li role="separator" class="divider"></li>
            `;
        } else if (item.category) {
            return html`
                <li class="dropdown-header">${item.name}</li>
            `;
        } else {
            // Generate list of filter entries
            const filterEntries = Object.entries(item.query || {})
                .map(entry => `<b>${entry[0]}</b> = ${entry[1]}`)
                .join("<br>");

            return html`
                <li class="${item.disabled ? "disabled" : ""}">
                    <a href="" data-filter-id="${item.id}" class="filtersLink" style="${item.active ? "color:green;" : ""}" @click="${this.onFilterChange}">
                        <span class="id-filter-button">${item.id}</span>
                        <span class="action-buttons">
                            <span
                                tooltip-title="${item.id}"
                                tooltip-text="${(item.description ? item.description + "<br>" : "") + filterEntries}"
                                data-filter-id="${item.id}">
                                <i class="fas fa-eye" data-action="view-filter"></i>
                            </span>
                            <!-- Add delete icon only to saved filters. Saved filters have a 'resource' field -->
                            ${item.resource ? html`
                                <i
                                    data-cy="delete"
                                    tooltip-title="Delete filter"
                                    class="fas fa-trash"
                                    data-action="delete-filter"
                                    data-filter-id="${item.id}"
                                    @click="${this.serverFilterDelete}">
                                </i>
                            ` : nothing}
                        </span>
                    </a>
                </li>
            `;
        }
    }

    renderHistoryItem(item) {
        // Skip study param
        const filterParams = Object.keys(item.query).filter(key => key !== "study" && !!item.query[key]);
        const filterTitle = UtilsNew.dateFormatter(item.date, "HH:mm:ss");
        const filterTooltip = filterParams.map(key => `<b>${key}</b> = ${item.query[key]}`).join("<br>");

        return html`
            <a class="filtersLink" style="cursor: pointer" @click="${e => this.onFilterChange(e, item.query)}">
                <div class="id-filter-button">${filterTitle} ${item.latest ? " (latest)" : ""}</div>
                <div class="help-block" style="font-size:12px;margin-bottom:5px;">
                    ${filterParams?.length > 0 ? html`
                        ${filterParams.slice(0, 2).map(key => html`
                            <div style="margin: 0 15px" title="${item.query[key]}">
                                <b>${key}</b>: ${UtilsNew.substring(item.query[key], 20)}
                            </div>
                        `)}
                    ` : html`
                        <div style="margin: 0 15px">Empty query.</div>
                    `}
                    <span class="action-buttons">
                        <span tooltip-title="${filterTitle}" tooltip-text="${filterTooltip || "Empty query."}">
                            <i class="fas fa-eye" data-action="view-filter"></i>
                        </span>
                    </span>
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

            <div class="panel panel-default">
                <div class="panel-body" style="padding: 8px 10px">
                    <!-- Render dropdown menu with all filters and history -->
                    <div style="display:flex;flex-wrap:wrap;column-gap:4px;row-gap:4px;align-items:center;">
                        <div class="dropdown saved-filter-dropdown" style="margin-right: 5px">
                            <button type="button" class="active-filter-label no-shadow" data-toggle="dropdown"
                                    aria-haspopup="true" aria-expanded="false" data-cy="filter-button">
                                <i class="fa fa-filter icon-padding" aria-hidden="true"></i> Filters <span class="caret"></span>
                            </button>
                            <ul class="dropdown-menu saved-filter-wrapper">
                                <!-- Render FILTERS options -->
                                <li>
                                    <a><i class="fas fa-filter icon-padding"></i> <label>Filters</label></a>
                                </li>
                                ${this._filters?.length > 0 ? html`
                                    ${this._filters.map(item => this.renderFilterItem(item))}
                                ` : html`
                                    <div class="help-block" style="margin: 0 30px">
                                        No filters found.
                                    </div>
                                `}
                                <li role="separator" class="divider"></li>

                                <!-- Render HISTORY filters -->
                                <li>
                                    <a><i class="fas fa-history icon-padding"></i> <label>History</label></a>
                                </li>
                                ${this.history?.length > 0 ? html`
                                    ${this.history.map(item => html`
                                        <li>
                                            ${this.renderHistoryItem(item)}
                                        </li>
                                    `)}
                                ` : html`
                                    <div class="help-block" style="margin: 0 30px">
                                        Empty history.
                                    </div>
                                `}
                                <li role="separator" class="divider"></li>
                                ${this.toolId ? html`
                                    <li>
                                        <a style="cursor:pointer;" @click="${this.onCopyLink}" data-action="copy-link">
                                            <i class="fas fa-copy icon-padding"></i> <b>Copy IVA Link</b>
                                        </a>
                                    </li>
                                `: nothing}
                                <li>
                                    <a style="cursor:pointer;" @click="${this.clear}" data-action="active-filter-clear">
                                        <i class="fa fa-eraser icon-padding"></i> <b>Clear</b>
                                    </a>
                                </li>
                                ${this.isLoggedIn() ? html`
                                    <li>
                                        <a style="cursor:pointer;" @click="${this.launchModal}" data-action="active-filter-save">
                                            <i class="fas fa-save icon-padding"></i> <b>Save current filter</b>
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
                                    <button type="button" class="btn btn-warning ${item.name}ActiveFilter active-filter-button" data-filter-name="${item.name}" data-filter-value=""
                                            @click="${this.onQueryFilterDelete}">
                                        ${item.text}
                                    </button>
                                ` : html`
                                    <button type="button" class="btn btn-warning ${item.name}ActiveFilter active-filter-button" data-filter-name="${item.name}" data-filter-value=""
                                            @click="${this.onQueryFilterDelete}" title="${item.message ?? ""}" disabled>
                                        ${item.text}
                                    </button>
                                `}
                            ` : html`
                                <!-- Multi-valued filters -->
                                <div class="btn-group" style="display:flex;">
                                    ${item.locked ? html`
                                        <button type="button" class="btn btn-warning ${item.name}ActiveFilter active-filter-button" data-filter-name="${item.name}" data-filter-value=""
                                                @click="${this.onQueryFilterDelete}" disabled>
                                            ${item.text} <span class="badge">${item.items.length}</span>
                                        </button>
                                        <button type="button" class="btn btn-warning btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            <span class="caret"></span>
                                            <span class="sr-only">Toggle Dropdown</span>
                                        </button>
                                        <ul class="dropdown-menu">
                                            ${item.items.length && item.items.map(filterItem => html`
                                                <li class="active-filter-button disabled" style="cursor: pointer">
                                                    <a>${filterItem}</a>
                                                </li>
                                            `)}
                                        </ul>
                                    ` : html`
                                        <button type="button" class="btn btn-warning ${item.name}ActiveFilter active-filter-button" data-filter-name="${item.name}" data-filter-value=""
                                                @click="${this.onQueryFilterDelete}">
                                            ${item.text} <span class="badge">${item.items.length}</span>
                                        </button>
                                        <button type="button" class="btn btn-warning btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            <span class="caret"></span>
                                            <span class="sr-only">Toggle Dropdown</span>
                                        </button>
                                        <ul class="dropdown-menu">
                                            ${item.items.length && item.items.map(filterItem => html`
                                                <li class="active-filter-button" style="cursor: pointer">
                                                    <a @click="${this.onQueryFilterDelete}" data-filter-name="${item.name}" data-filter-value="${filterItem}">
                                                        ${filterItem}
                                                    </a>
                                                </li>
                                            `)}
                                        </ul>
                                    `}
                                </div>
                            `)}
                        ` : html`
                            <label>No filters selected</label>
                        `}
                    </div>

                    <!-- aggregation stat section -->
                    ${this.facetActive && this.facetQuery && Object.keys(this.facetQuery).length ? html`
                        <div class="facet-wrapper">
                            <div class="dropdown saved-filter-dropdown" style="margin-right: 5px">
                                <button type="button" class="active-filter-label no-shadow" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" data-cy="filter-button">
                                    <i class="fas fa-project-diagram rotate-180"></i> Aggregation fields <span class="caret"></span>
                                </button>
                                <ul class="dropdown-menu saved-filter-wrapper">
                                    <li>
                                        <a href="javascript: void 0" @click="${this.clearFacet}" data-action="active-filter-clear">
                                            <i class="fa fa-eraser icon-padding" aria-hidden="true"></i> <strong>Clear</strong>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div class="button-list">
                                ${Object.entries(this.facetQuery).map(([name, facet]) => html`
                                    <button type="button" class="btn btn-danger ${name}ActiveFilter active-filter-button" data-filter-name="${name}" data-filter-value=""
                                            @click="${this.onQueryFacetDelete}">
                                        ${facet.formatted}
                                    </button>
                                `)}
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
                            <button type="button" class="btn btn-primary" data-dismiss="modal" @click="${this.save}" data-cy="modal-filter-save-button">
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
