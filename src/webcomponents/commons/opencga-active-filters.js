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
    }

    connectedCallback() {
        super.connectedCallback();
    }

    firstUpdated() {
        // Small trick to force the warning message display after DOM is renderer
        this.query = {...this.query};

        // We need to init _previousQuery with query in order to work before executing any search
        this._previousQuery = this.query;
    }

    updated(changedProperties) {
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
    }

    opencgaSessionObserver() {
        if (this.opencgaSession.token && this.opencgaSession?.study?.fqn) {
            this.refreshFilters();
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
                            filterFields = value.split(complexField.separator);
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
        // console.log("searchClicked")
        $("#" + this._prefix + "Warning").hide();
        this._prevQuery = {...this.query};
        this._jsonPrevFacetQuery = JSON.stringify(this.executedFacetQuery);
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
        // Merge passed filters with user saved filters
        if (this.opencgaSession?.user?.filters?.length > 0) {
            // Add passed filters
            this._filters = this.filters || [];

            // Add a separator
            if (this._filters.length > 0 && !this._filters[this._filters.length - 1].separator) {
                this._filters.push({separator: true});
            }

            // Add user's saved filters
            this._filters = [
                ...this._filters,
                ...this.opencgaSession.user.filters.filter(f => f.resource === this.resource)
            ];
        } else {
            this._filters = [...(this.filters || [])];
        }
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
                                }).catch(response => {
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
                    this.opencgaSession.opencgaClient.users().updateFilters(this.opencgaSession.user.id, data, {
                        action: "ADD"
                    })
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
                        }).catch(response => {
                            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                        });
                }

            })
            .catch(response => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            });
    }

    onServerFilterChange(e) {
        // suppress if I have clicked on an action buttons
        if (e.target?.dataset?.action === "delete-filter") {
            return;
        }

        $("#" + this._prefix + "Warning").hide();
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
                this.opencgaSession.opencgaClient.users().updateFilters(this.opencgaSession.user.id, data, {
                    action: "REMOVE"
                })
                    .then(() => {
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                            message: "Filter has been deleted",
                        });
                        this.fetchServerFilters();
                    }).catch(response => {
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                    });
            },
        });
    }

    onQueryFilterDelete(e) {
        const _queryList = Object.assign({}, this.query);

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
                // Check if the field has been defined as complex
                const complexField = this._config.complexFields.find(item => item.id === name);
                if (complexField) {
                    filterFields = _queryList[name].split(complexField.separator);
                } else if (value.indexOf(";") !== -1 && value.indexOf(",") !== -1) {
                    // If we find a field with both ; and , we will separate by ;
                    filterFields = _queryList[name].split(";");
                } else {
                    filterFields = _queryList[name].split(new RegExp("[,;]"));
                }

                const indexOfValue = filterFields.indexOf(value);
                filterFields.splice(indexOfValue, 1);

                if (complexField) {
                    _queryList[name] = filterFields.join(complexField.separator);
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

    _isMultiValued(item) {
        return UtilsNew.isNotUndefined(item.items);
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

            <!--<div class="alert alert-info">query \${JSON.stringify(this.query)}</div>
            <div class="alert alert-info">queryList \${JSON.stringify(this.queryList)}</div>
             <div class="alert alert-info">facetQuery \${JSON.stringify(this.facetQuery)}</div>-->
            <div class="panel panel-default">
                <div class="panel-body" style="padding: 8px 10px">
                    <div class="lhs">
                        <!-- Render dropdown menu -->
                        <div class="dropdown saved-filter-dropdown" style="margin-right: 5px">
                            <button type="button" class="active-filter-label ripple no-shadow" data-toggle="dropdown"
                                        aria-haspopup="true" aria-expanded="false" data-cy="filter-button">
                                <i class="fa fa-filter icon-padding" aria-hidden="true"></i> Filters <span class="caret"></span>
                            </button>
                            <ul class="dropdown-menu saved-filter-wrapper">
                                ${this._filters && this._filters.length > 0 ? html`
                                    <li>
                                        <a><i class="fas fa-cloud-upload-alt icon-padding"></i> <strong>Filters</strong></a>
                                    </li>

                                    ${this._filters.map(item => item.separator ?
                                        html`
                                            <li role="separator" class="divider"></li>` :
                                        html`
                                            <!-- Add header before the first Saved filter-->
                                            ${this.opencgaSession.user.filters
                                                .filter(f => f.resource === this.resource)?.[0]?.id === item.id ? html`
                                                    <li class="dropdown-header">Saved Filters</li>
                                                ` : null
                                            }
                                            <li>
                                                <a data-filter-id="${item.id}" class="filtersLink" style="cursor: pointer;color: ${!item.active ? "black" : "green"}"
                                                        @click="${this.onServerFilterChange}">
                                                    <span class="id-filter-button">${item.id}</span>
                                                    <span class="action-buttons">
                                                        <span tooltip-title="${item.id}"
                                                              tooltip-text="${(item.description ? item.description + "<br>" : "") + Object.entries(item.query).map(([k, v]) => `<b>${k}</b> = ${v}`).join("<br>")}"
                                                              data-filter-id="${item.id}">
                                                            <i class="fas fa-eye" data-action="view-filter"></i>
                                                        </span>

                                                        <!-- Add delete icon only to saved filters -->
                                                        ${this.opencgaSession.user.filters
                                                            .filter(f => f.resource === this.resource)
                                                            .findIndex(f => f.id === item.id) !== -1 ? html`
                                                                <i data-cy="delete" data-action="delete-filter" tooltip-title="Delete filter" class="fas fa-trash" data-filter-id="${item.id}"
                                                                   @click="${this.serverFilterDelete}">
                                                                </i>` : null
                                                        }
                                                    </span>
                                                </a>
                                            </li>`
                                        )
                                    }
                                    <li role="separator" class="divider"></li>` : ""
                                }

                                <li>
                                    <a href="javascript: void 0" @click="${this.clear}" data-action="active-filter-clear">
                                        <i class="fa fa-eraser icon-padding" aria-hidden="true"></i> <strong>Clear</strong>
                                    </a>
                                </li>
                                ${this.isLoggedIn() ? html`
                                    <li>
                                        <a style="cursor: pointer" @click="${this.launchModal}" data-action="active-filter-save">
                                            <i class="fas fa-save icon-padding"></i> <strong>Save current filter</strong>
                                        </a>
                                    </li>` : null
                                }
                            </ul>
                        </div>

                        <!-- Render active filters -->
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
                        <!--<button type="button" class="btn btn-primary btn-sm ripple" @click="\${this.clear}">
                            <i class="fa fa-eraser icon-padding" aria-hidden="true"></i> Clear
                        </button>
                        -->

                        <!-- TODO we probably need a new property for this -->
                        ${false && this.showSelectFilters(this.opencgaSession.opencgaClient._config) ? html`
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
                                                <a data-filter-id="${item.id}"
                                                   class="filtersLink"
                                                   style="cursor: pointer;color: ${!item.active ? "black" : "green"}"
                                                   title="${item.description ?? ""}"
                                                   @click="${this.onServerFilterChange}">
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
                            <div class="dropdown saved-filter-dropdown" style="margin-right: 5px">
                                <button type="button" class="active-filter-label ripple no-shadow" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" data-cy="filter-button">
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
                                    <button type="button" class="btn btn-danger btn-sm ${name}ActiveFilter active-filter-button ripple no-transform" data-filter-name="${name}" data-filter-value=""
                                                 @click="${this.onQueryFacetDelete}">
                                        ${facet.formatted}
                                    </button>
                                `)}
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
                            <h
                                class="modal-title" id="${this._prefix}SaveModalLabel">Filter</h4>
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

    getDefaultConfig() {
        return {
            searchButtonText: "SEARCH",
            alias: {
                "region": "Region",
                "gene": "Gene",
                "genotype": "Sample Genotype",
                "sample": "Sample ID",
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
                "proteinSubstitution": "Protein Substitution",
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

}

customElements.define("opencga-active-filters", OpencgaActiveFilters);
