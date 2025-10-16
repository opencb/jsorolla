import {html, LitElement, nothing} from "lit";
import UtilsNew from "../../core/utils-new.js";
import LitUtils from "./utils/lit-utils.js";
import ModalUtils from "./modal/modal-utils.js";
import NotificationUtils from "./utils/notification-utils.js";
import WebUtils from "./utils/web-utils.js";

export default class FiltersToolbar extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            preparedQuery: {
                type: Object,
            },
            executedQuery: {
                type: Object,
            },
            resource: {
                type: String,
            },
            toolId: {
                type: String,
            },
            filters: {
                type: Array,
            },
            defaultFilter: {
                type: Object,
            },
            searchActive: {
                type: Boolean,
            },
            renderFilter: {
                type: Object,
            },
            config: {
                type: Object,
            },
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this._config = this.getDefaultConfig();

        this.searchActive = true;
        this.preparedQuery = {};
        this.executedQuery = {};

        this.queryList = [];
        this.quickFilters = [];
        this.totalFiltersCount = 0; // to check if we have to hide the advanced filters button

        this.applicationFilters = [];
        this.userFilters = [];
        this.historyFilters = [];
        this.lockedFieldsMap = {};
    }

    update(changedProperties) {
        if (changedProperties.has("config")) {
            this.configObserver();
        }

        if (changedProperties.has("opencgaSession") || changedProperties.has("resource")) {
            this.opencgaSessionObserver();
        }

        if (changedProperties.has("preparedQuery") || changedProperties.has("executedQuery")) {
            this.queryObserver();
        }

        if (changedProperties.has("executedQuery")) {
            this.updateHistory();
        }

        super.update(changedProperties);
    }

    updated() {
        UtilsNew.initTooltip(this);
    }

    opencgaSessionObserver() {
        this.userFilters = [];
        if (this.opencgaSession && this.resource) {
            this.updateUserFilters();
        }
    }

    queryObserver() {
        this.queryList = [];

        Object.keys(this.preparedQuery).forEach(key => {
            if (!!this.preparedQuery[key] && (!this._config.activeFilters.hiddenFields || !this._config.activeFilters.hiddenFields.includes(key))) {
                // We use the alias to rename the key
                let title = key;

                if (this._config?.activeFilters?.alias && this._config.activeFilters.alias[key]) {
                    title = this._config.activeFilters.alias[key];
                }

                // We convert the Query entry object into an array of small objects (queryList)
                let value = this.preparedQuery[key];
                if (typeof value === "boolean") {
                    value = value.toString();
                }

                let filterFields = [];

                // in case of annotation
                if (key === "annotation") {
                    filterFields = value.split(";");
                } else if (key === "study") {
                    // We fist have need to remove defaultStudy from 'filterFields' and 'value'
                    filterFields = value.split(/[,;]/).filter(fqn => fqn !== this.opencgaSession?.study?.fqn);
                    // defaultStudy was the only one present so no need to render anything
                    if (!filterFields.length) {
                        return;
                    }
                    value = filterFields.join(/[,;]/);
                } else {
                    // Check if the field has been defined as complex
                    const complexField = (this._config?.activeFilters?.complexFields || [])
                        .find(item => item.id === key);

                    if (complexField) {
                        filterFields = complexField?.separator ? value.split(complexField.separator) : UtilsNew.splitByRegex(value, complexField.separatorRegex);
                    } else if (value.indexOf(";") !== -1 && value.indexOf(",") !== -1) {
                        // If we find a field with both ; and , we will separate by ;
                        filterFields = value.split(";");
                    } else {
                        filterFields = value.split(new RegExp("[,;]"));
                    }
                }

                // Check if the field is locked
                const locked = !!this.lockedFieldsMap[key];
                const lockedTooltip = locked ? this.lockedFieldsMap[key].message : "";

                // separator used in the text in case that we only have one filter field
                const separator = (value.indexOf(">") !== -1 || value.indexOf("<") !== -1 || value.indexOf("=") !== -1) ? ": " : " = ";

                this.queryList.push({
                    name: key,
                    text: filterFields.length === 1 ? title + separator + value : title,
                    items: filterFields,
                    locked: locked,
                    message: lockedTooltip,
                });
            }
        });
    }

    configObserver() {
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };

        // count the total number of filters
        this.totalFiltersCount = (this._config?.sections || [])
            .reduce((acc, section) => acc + (section?.filters || []).length, 0);

        // prepare list of quick and advanced filters
        this.quickFilters = (this._config?.sections || [])
            .map(section => (section?.filters || [])
            .filter(filter => !!filter.quick))
            .flat();

        // update the application filters
        this.applicationFilters = [];

        if (this._config.defaultFilter) {
            const isDisabled = UtilsNew.isEmpty(this._config.defaultFilter);
            this.applicationFilters.push({
                id: "Default Filter",
                query: UtilsNew.objectClone(this._config.defaultFilter),
                disabled: isDisabled,
                description: isDisabled ? "Filter not configured." : "",
                active: false,
            });
        }

        if (this._config.filters?.length > 0) {
            this.applicationFilters.push(...this._config.filters);
        }

        // generate the list of locked fields
        this.lockedFieldsMap = {};
        (this._config.activeFilters?.lockedFields || []).forEach(lockedField => {
            this.lockedFieldsMap[lockedField.id] = lockedField;
        });
    }

    notifyQuery(query) {
        LitUtils.dispatchCustomEvent(this, "queryChange", null, {query});
    }

    notifySearch(query) {
        LitUtils.dispatchCustomEvent(this, "querySearch", null, {query});
    }

    updateHistory() {
        // 1. remove all identical filters
        const history = this.historyFilters.filter(historyItem => {
            return JSON.stringify(historyItem.query) !== JSON.stringify(this.executedQuery);
        });

        // 2. remove previous latest
        if (history?.length > 0) {
            history[0].latest = false;
        }

        // 3. prepare new latest filter and add at the beginning
        history.unshift({
            id: UtilsNew.dateFormatter(UtilsNew.getDatetime(), "HH:mm:ss"),
            // date: UtilsNew.getDatetime(),
            query: UtilsNew.objectClone(this.executedQuery),
            latest: true,
        });

        // 4. limit up to 10 history items
        this.historyFilters = history.slice(0, 10);
    }

    updateUserFilters() {
        this.opencgaSession.opencgaClient.users()
            .filters(this.opencgaSession.user.id)
            .then(response => {
                this.userFilters = (response.responses?.[0]?.results || []).filter(filter => {
                    return filter.resource === this.resource;
                });
                this.requestUpdate();
            })
            .catch(response => {
                console.error(response);
            });
    }

    saveFilter() {
        const filterName = this.querySelector(`#${this._prefix}SaveFilterName`).value;
        const filterDescription = this.querySelector(`#${this._prefix}SaveFilterDescription`).value;
        const query = UtilsNew.objectClone(this.preparedQuery || {}); // generate a clone of the current query

        // 1. filter out the current active study
        if (query.study) {
            const studies = query.study.split(",").filter(fqn => fqn !== this.opencgaSession.study.fqn);
            if (studies.length > 0) {
                query.study = studies.join(",");
            } else {
                delete query.study;
            }
        }

        // 2. remove ignored params
        // When saving a filter we do no twant to save the exact sample or file ID, otherwise the filter cannot be reused
        if (this._config?.save?.ignoreParams?.length > 0) {
            this._config.save.ignoreParams.forEach(param => {
                delete query[param];
            });
        }

        // 3. fetch saved filters of the user
        this.opencgaSession.opencgaClient.users()
            .filters(this.opencgaSession.user.id)
            .then(response => {
                const savedFilters = response.responses?.[0]?.results || [];

                // 3.1. check if the filter name already exists
                if (savedFilters.find(savedFilter => savedFilter.id === filterName)) {
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
                        display: {
                            okButtonText: "Yes, overwrite filter",
                            cancelButtonText: "Cancel",
                        },
                        title: "Overwrite Filter",
                        message: `A Filter with the name <b>${filterName}</b> is already present. Do you want to overwrite it?`,
                        ok: () => {
                            this.opencgaSession.opencgaClient.users()
                                .updateFilter(this.opencgaSession.user.id, filterName, {
                                    description: filterDescription,
                                    resource: this.resource,
                                    query: query,
                                    options: {},
                                })
                                .then(() => {
                                    // if (response?.getEvents?.("ERROR")?.length) {
                                    //     return NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                                    // }
                                    // Display success message
                                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                                        message: "Filter has been saved",
                                    });

                                    // clear the name and description fields
                                    this.querySelector(`#${this._prefix}SaveFilterName`).value = "";
                                    this.querySelector(`#${this._prefix}SaveFilterDescription`).value = "";

                                    // update user filters
                                    this.updateUserFilters();
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
                    this.opencgaSession.opencgaClient.users()
                        .updateFilters(this.opencgaSession.user.id, data, {action: "ADD"})
                        .then(() => {
                            // if (response.getEvents?.("ERROR")?.length) {
                            //     return NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                            // }

                            // Display success message
                            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                                message: "Filter has been saved",
                            });

                            // clear the name and description fields
                            this.querySelector(`#${this._prefix}SaveFilterName`).value = "";
                            this.querySelector(`#${this._prefix}SaveFilterDescription`).value = "";

                            // update user filters
                            this.updateUserFilters();
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

    onFilterChange(key, value) {
        // Some filters may return more than one parameter, in this case key and value are objects with all the keys and filters
        //  - key: an object mapping filter name with the one returned
        //  - value: and object with the filter
        // Example: REST accepts filter and qual while filter returns FILTER and QUALITY
        //  - key: {filter: "FILTER", qual: "QUALITY"}
        //  - value: {FILTER: "pass", QUALITY: "25"}
        const query = UtilsNew.objectClone(this.preparedQuery);

        if (typeof key === "object" && typeof value === "object") {
            Object.values(key).forEach(k => {
                if (value[k] && value[k] !== "") {
                    query[k] = value[k];
                } else {
                    delete query[k];
                }
            });
        } else {
            if (!!value) {
                query[key] = value;
            } else {
                delete query[key];
            }
        }

        this.notifyQuery(query);
    }

    onFilterDelete(key, value) {
        const query = UtilsNew.objectClone(this.preparedQuery);

        // in case that we want to remove the whole filter, or the filter has a single value
        if (!value || query[key] === value) {
            delete query[key];
        } else {
            let filterFields = [];
            const complexField = (this._config?.complexFields || []).find(item => item.id === key);

            if (complexField) {
                filterFields = complexField?.separator ? query[key].split(complexField.separator) : UtilsNew.splitByRegex(query[key], complexField.separatorRegex);
            } else if (value.indexOf(";") !== -1 && value.indexOf(",") !== -1) {
                filterFields = query[key].split(";"); // If we find a field with both ; and , we will separate by ;
            } else {
                filterFields = query[key].split(new RegExp("[,;]"));
            }

            // remove value from filterFields
            filterFields = filterFields.filter(field => field !== value);

            // restore the query field
            if (complexField) {
                query[key] = complexField?.separator ? filterFields.join(complexField.separator) : filterFields.join(",");
            } else if (value.indexOf(";") !== -1 && value.indexOf(",") !== -1) {
                query[key] = filterFields.join(";");
            } else if (query[key].indexOf(",") !== -1) {
                query[key] = filterFields.join(",");
            } else {
                query[key] = filterFields.join(";");
            }
        }

        this.notifySearch(query);
    }

    onApplyQuery(query) {
        this.notifySearch(query);
    }

    onSearch() {
        this.notifySearch(this.preparedQuery);
    }

    onClear() {
        LitUtils.dispatchCustomEvent(this, "queryClear", null, {});
    }

    onSave() {
        ModalUtils.show(`${this._prefix}SaveFilter`);
    }

    onCopyLink() {
        // 1. Generate the url to the tool with the current query
        const link = WebUtils.getIVALink(this.opencgaSession, null, this.toolId, this.preparedQuery);

        // 2. Copy this link to the user clipboard
        UtilsNew.copyToClipboard(link);

        // 3. Notify user that the link has been copied to the clipboard
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
            message: "Link to current query copied to clipboard.",
        });
    }

    isFilterVisible(subsection) {
        let visible = true;
        if (typeof subsection?.visible !== "undefined" && subsection?.visible !== null) {
            if (typeof subsection.visible === "boolean") {
                visible = subsection.visible;
            } else {
                if (typeof subsection.visible === "function") {
                    visible = subsection.visible(this); // injecting context
                } else {
                    console.error(`Field 'visible' not boolean or function: ${typeof subsection.visible}`);
                }
            }
        }
        return visible;
    }

    isFilterDisabled(subsection) {
        let disabled = false;
        if (typeof subsection?.disabled !== "undefined" && subsection?.disabled !== null) {
            if (typeof subsection?.disabled === "boolean") {
                disabled = subsection.disabled;
            } else if (typeof subsection?.disabled === "function") {
                disabled = subsection.disabled();
            } else {
                console.error(`Field 'disabled' not a function or boolean: ${typeof subsection.disabled}`);
            }
        }
        return disabled;
    }

    renderFilterContent(subsection) {
        let content = nothing;
        const disabled = this.isFilterDisabled(subsection);

        // this allows to pass the onFilterChange function to the render function and keep the context to the component
        const onFilterChange = (key, value) => {
            return this.onFilterChange(key, value);
        };

        // We allow to pass a render function
        if (subsection.render) {
            content = subsection.render(onFilterChange, this.preparedQuery, this.opencgaSession, disabled);
        } else if (typeof this.renderFilter === "function") {
            content = this.renderFilter(subsection, onFilterChange, this.preparedQuery, this.opencgaSession, disabled);
        }

        return content;
    }

    renderQuickFilters() {
        return this.quickFilters.map((filter) => {
            return html`
                <div class="dropdown d-flex align-items-stretch">
                    <button class="btn btn-light d-flex align-items-center gap-2 dropdown-toggle" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                        <span>${filter.title}</span>
                    </button>
                    <div class="dropdown-menu dropdown-menu-start shadow p-2" style="width:280px;">
                        ${filter.description ? html`
                            <div class="mb-2">${filter.description}</div>
                        ` : nothing}
                        ${this.renderFilterContent(filter)}
                    </div>
                </div>
            `;
        });
    }

    renderAdvancedFilters() {
        return this._config.sections.map((section, index) => {
            const filters = (section.filters || []).filter(filter => this.isFilterVisible(filter));
            const expanded = this._config.sections.length === 1 || !section.collapsed;

            if (filters.length === 0) {
                return nothing;
            } else {
                return html`
                    <div class="accordion-item bg-white">
                        <div class="accordion-header">
                            <button
                                class="accordion-button fw-bold ${!expanded ? "collapsed" : ""}"
                                data-bs-toggle="collapse"
                                data-bs-target="#${this.prefix}AdvancedFilters${index}"
                                aria-expanded="${expanded ? "true" : "false"}">
                                <span class="fs-5">${section.title || "General"}</span>
                            </button>
                        </div>
                        <div id="${this.prefix}AdvancedFilters${index}" class="accordion-collapse collapse ${expanded ? "show" : ""}" data-bs-parent="#${this._prefix}AdvancedFilters">
                            <div class="accordion-body d-flex flex-column gap-3">
                                ${filters.map(subsection => this.renderAdvancedFilterSubsection(subsection))}
                            </div>
                        </div>
                    </div>
                `;
            }
        });
    }

    renderAdvancedFilterSubsection(subsection) {
        return html`
            <div class="">
                ${subsection.title ? html`
                    <div class="mb-2 fs-5 fw-bold d-flex justify-content-between align-items-center" id="${this._prefix}${subsection.id}" data-cy="${subsection.id}">
                        <div>${subsection.title}</div>
                        ${subsection.tooltip ? html`
                            <a tooltip-title="Info" tooltip-text="${subsection.tooltip}" tooltip-position-my="top right">
                                <i class="fa fa-info-circle text-primary" aria-hidden="true"></i>
                            </a>
                        ` : nothing}
                    </div>
                `: nothing}
                <div id="${this._prefix}${subsection.id}" class="subsection-content" data-cy="${subsection.id}">
                    ${subsection.description ? html`
                        <div class="mb-2">${subsection.description}</div>
                    ` : nothing}
                    ${this.renderFilterContent(subsection)}
                </div>
            </div>
        `;
    }

    renderFilterItems(items, highlightActiveFilter = true) {
        return items.map(item => {
            const isActive = highlightActiveFilter && UtilsNew.objectCompare(this.preparedQuery, item.query);
            const filterParams = Object.keys(item.query)
                .filter(key => key !== "study" && !!item.query[key]);
            const filterTooltip = filterParams
                .map(key => `<b>${key}</b> = ${item.query[key]}`)
                .join("<br>");

            return html`
                <a class="dropdown-item cursor-pointer ${isActive ? "active" : ""}" @click="${() => this.onApplyQuery(item.query)}">
                    <div class="d-flex align-items-center">
                        <div class="flex-grow-1">
                            <div class="text-truncate">
                                ${item.id} ${item.latest ? html` <b>(latest)</b>` : nothing}
                            </div>
                            <div class="small opacity-50">
                            ${filterParams?.length > 0 ? html`
                                ${filterParams.slice(0, 2).map(key => html`
                                    <div class="" title="${item.query[key]}">
                                        <b>${key}</b>: ${UtilsNew.substring(item.query[key], Math.max(0, 35 - key.length))}
                                    </div>
                                `)}
                            ` : html`Empty query.`}
                            </div>
                        </div>
                        <div class="flex-shrink-0 mb-auto">
                            <span tooltip-title="${item.id}" tooltip-text="${filterTooltip || "Empty query."}" tooltip-position-my="top right">
                                <i class="fas fa-eye opacity-75" data-action="view-filter"></i>
                            </span>
                        </div>
                    </div>
                </a>
            `;
        });
    }

    renderSaveModal() {
        return ModalUtils.create(this, this._prefix + "SaveFilter", {
            display: {
                modalTitle: "Save Current Filter",
                modalbtnsVisible: true,
                okButtonText: "Save Filter",
            },
            render: () => html`
                <div class="mb-3">
                    <label for="${this._prefix}SaveFilterName" class="col-sm-2 col-form-label fw-bold">Name</label>
                    <input class="form-control" type="text" id="${this._prefix}SaveFilterName" data-cy="modal-filter-name">
                </div>
                <div class="mb-3">
                    <label for="${this._prefix}SaveFilterDescription" class="col-sm-2 col-form-label fw-bold">Description</label>
                    <input class="form-control" type="text" id="${this._prefix}SaveFilterDescription" data-cy="modal-filter-description">
                </div>
            `,
            onOk: () => {
                this.saveFilter();
            },
        });
    }

    renderActiveFilters() {
        return this.queryList.map(item => {
            const itemClass = item.locked ? "disabled" : "hover:text-decoration-line-through cursor-pointer";
            if (item.items.length === 1) {
                return html`
                    <button class="btn btn-warning ${itemClass}" @click="${() => this.onFilterDelete(item.name)}">
                        <span>${item.text}</span>
                    </button>
                `;
            } else {
                return html`
                    <div class="btn-group">
                        <button class="btn btn-warning ${itemClass}" @click="${() => this.onFilterDelete(item.name)}">
                            <span>${item.text}</span>
                            <span class="fw-bold ps-1">(${item.items.length})</span>
                        </button>
                        <button class="btn btn-warning dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" data-bs-reference="parent">
                            <span class="visually-hidden">Toggle Dropdown</span>
                        </button>
                        <div class="dropdown-menu shadow">
                            ${item.items.map(filterItem => html`
                                <a class="dropdown-item ${itemClass}" @click="${() => this.onFilterDelete(item.name, filterItem)}">
                                    <span>${filterItem}</span>
                                </a>
                            `)}
                        </div>
                    </div>
                `;
            }
        });
    }

    render() {
        // used to disable clear or save buttons
        const emptyPreparedQuery = Object.keys(this.preparedQuery).length === 0;
        const hasPendingChanges = UtilsNew.objectCompare(this.preparedQuery, this.executedQuery);
        const showAdvancedFiltersButton = this.totalFiltersCount !== this.quickFilters.length;

        return html`
            <div class="border p-1 rounded-3 mb-3">
                <div class="d-flex align-items-stretch gap-2 mb-2">
                    ${this.renderQuickFilters()}
                    ${showAdvancedFiltersButton ? html`
                        <button class="btn btn-light d-flex align-items-center gap-1" data-bs-toggle="offcanvas" data-bs-target="#${this._prefix}AdvancedFilters">
                            <i class="fas fa-filter"></i>
                            <span>Advanced Filters</span>
                        </button>
                    ` : nothing}
                    ${this._config.searchButton ? html`
                        <div class="w-px bg-gray-200"></div>
                        <button class="btn ${hasPendingChanges ? "btn-primary" : "btn-danger"} d-flex align-items-center gap-2 ${!this.searchActive ? "disabled" : ""}" @click="${this.onSearch}">
                            ${this._config.searchButtonIcon ? html`
                                <i class="${this._config.searchButtonIcon}"></i>
                            ` : nothing}
                            <span class="fw-bold">${this._config.searchButtonText || "Search"}</span>
                        </button>
                    ` : nothing}
                    <div class="ms-auto d-flex align-items-stretch gap-2">
                        <!-- Clear current query -->
                         <button class="btn btn-light d-flex align-items-center gap-2 ${emptyPreparedQuery ? "disabled" : ""}" @click="${this.onClear}">
                            <i class="fas fa-times"></i>
                            <span class="fw-bold">Clear</span>
                        </button>
                        <div class="w-px bg-gray-200"></div>
                        <!-- Saved filters -->
                        <div class="dropdown d-flex">
                            <button class="btn btn-light d-flex align-items-center gap-2" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                                <i class="fas fa-bookmark"></i>
                                <span class="fw-bold">Filters</span>
                            </button>
                            <div class="dropdown-menu dropdown-menu-end shadow" style="width:240px;">
                                ${this.applicationFilters.length > 0 ? html`
                                    <div class="dropdown-header user-select-none">
                                        <span class="fw-bold">Application Filters</span>
                                    </div>
                                    ${this.renderFilterItems(this.applicationFilters, true)}
                                ` : nothing}
                                ${this.userFilters.length > 0 ? html`
                                    <div class="dropdown-header user-select-none">
                                        <span class="fw-bold">User Filters</span>
                                    </div>
                                    ${this.renderFilterItems(this.userFilters, true)}
                                ` : nothing}
                                ${this.applicationFilters.length > 0 || this.userFilters.length > 0 ? html`
                                    <hr class="dropdown-divider">
                                ` : nothing}
                                <a class="dropdown-item d-flex align-items-center gap-2 ${emptyPreparedQuery ? "disabled": "cursor-pointer"}" @click="${this.onSave}">
                                    <i class="fas fa-save"></i>
                                    <span class="fw-bold">Save Current Filter</span>
                                </a>
                            </div>
                        </div>
                        <!-- History filters -->
                         <div class="dropdown d-flex">
                            <button class="btn btn-light d-flex align-items-center gap-2" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                                <i class="fas fa-history"></i>
                                <span class="fw-bold">History</span>
                            </button>
                            <div class="dropdown-menu dropdown-menu-end shadow" style="width:240px;">
                                ${this.renderFilterItems(this.historyFilters, false)}
                            </div>
                        </div>
                        <!-- Copy IVA Link -->
                        ${!!this.toolId ? html`
                            <button class="btn btn-light d-flex align-items-center gap-2" @click="${this.onCopyLink}">
                                <i class="fas fa-copy"></i>
                                <span class="fw-bold">Copy</span>
                            </button>
                        ` : nothing}
                    </div>
                </div>
                <div class="offcanvas offcanvas-end bg-white" id="${this._prefix}AdvancedFilters" style="width:500px;">
                    <div class="offcanvas-header p-4">
                        <h4 class="offcanvas-title fw-bold">Advanced Filters</h4>
                        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                    </div>
                    <div class="offcanvas-body px-4">
                        <div class="accordion" id="${this._prefix}AdvancedFilters">
                            ${this.renderAdvancedFilters()}
                        </div>
                    </div>
                    <div class="offcanvas-footer p-4 d-grid">
                        <button
                            class="btn ${hasPendingChanges ? "btn-primary" : "btn-danger"} d-flex align-items-center justify-content-center gap-2 ${!this.searchActive ? "disabled" : ""}"
                            data-bs-dismiss="offcanvas"
                            @click="${this.onSearch}">
                            <i class="fas fa-search"></i>
                            <span class="fw-bold">Search</span>
                        </button>
                    </div>
                </div>
                <!-- Active filters -->
                <div class="d-flex gap-2">
                    ${this.queryList.length > 0 ? this.renderActiveFilters() : html`<span class="fw-bold p-2">No filters selected</span>`}
                </div>
            </div>
            <!-- Modal to save current filters -->
            ${this.renderSaveModal()}
        `;
    }

    getDefaultConfig() {
        return {
            activeFilters: {
                alias: {},
                complexFields: [],
                hiddenFields: [],
                lockedFields: [],
            },
            save: {
                ignoreParams: [],
            },
            sections: [],
            examples: [],
            defaultFilter: {},
            searchButton: true,
            searchButtonText: "Search",
            searchButtonIcon: "fas fa-search",
        };
    }

}

customElements.define("filters-toolbar", FiltersToolbar);
