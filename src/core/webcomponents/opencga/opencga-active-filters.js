import {LitElement, html} from "/web_modules/lit-element.js";

export default class OpencgaActiveFilters extends LitElement {

    constructor() {
        super();
        this.init();
    }

    static get properties() {
        return {
            opencgaClient: {
                type: Object
            },
            //NOTE this is actually preparedQuery
            query: {
                type: Object
            },
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
            }
        }
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
            this.configObserver(this.config);
        }
        if (changedProperties.has("opencgaClient")) {
            this.checkFilters(this.config);
        }
    }

    init() {
        this._prefix = "oaf" + Utils.randomString(6);
        this._config = this.getDefaultConfig();
        this.filters = [];


        //todo recheck why function?
        this.opencgaClient = function () {
            return {"_config": {}};
        }
    }

    //TODO recheck connectedCallback
    connectedCallback() {
        super.connectedCallback();

        // Small trick to force the warning message display after DOM is renderer
        this.query = {...this.query};

        // We need to init _previousQuery with query in order to work before executing any search
        this._previousQuery = this.query;

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

    configObserver(config) {
        this._config = Object.assign({}, this.getDefaultConfig(), config);

        // Overwrite default alias with the one passed
        this._config.alias = Object.assign({}, this.getDefaultConfig().alias, config.alias);

        this.lockedFieldsMap = {};
        for (let lockedField of this._config.lockedFields) {
            this.lockedFieldsMap[lockedField.id] = lockedField;
        }
    }

    clear() {
        PolymerUtils.addStyleByClass("filtersLink", "color", "black");

        //TODO do not trigger event if there are no active filters
        // Trigger clear event
        this.dispatchEvent(new CustomEvent("activeFilterClear", {detail: {}, bubbles: true, composed: true}));
    }

    //todo refactor in CSS
    _onMouseOver(e) {
        PolymerUtils.addStyleByClass(e.target.dataset.filterName + "ActiveFilter", "text-decoration", "line-through");
    }

    _onMouseOut(e) {
        PolymerUtils.addStyleByClass(e.target.dataset.filterName + "ActiveFilter", "text-decoration", "none");
    }

    launchModal() {
        $(PolymerUtils.getElementById(this._prefix + "SaveModal")).modal("show");
    }

    showSelectFilters(config) {
        return (this.filters !== undefined && this.filters.length > 0) || !UtilsNew.isEmpty(config.sessionId);
    }

    checkSid(config) {
        return UtilsNew.isNotEmpty(config.sessionId);
    }

    checkFilters(config) {
        let _this = this;
        if (this.opencgaClient instanceof OpenCGAClient && UtilsNew.isNotUndefined(config.value.sessionId)) {
            this.opencgaClient.users().getFilters({}, {serverVersion: this.opencgaClient._config.serverVersion})
                .then(function (response) {
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

        let params = {};
        params.name = filterName;
        params.description = filterDescription;
        params.bioformat = this.filterBioformat;
        params.query = this.query;
        params.options = {};
        let _this = this;
        this.opencgaClient.users().getFilters({name: filterName}, {serverVersion: this.opencgaClient._config.serverVersion})
            .then(function (response) {
                if (response.response[0].result.length > 0) {
                    delete params.name;
                    _this.opencgaClient.users().updateFilter(filterName, params, {})
                        .then(function (response) {
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
                        _this.opencgaClient.users().create(params, {})
                            .then(function (response) {
                                _this.push("filters", params);
                                PolymerUtils.setValue("filterName", "");
                                PolymerUtils.setValue(_this._prefix + "filterDescription", "");
                            });
                    } else {
                        _this.opencgaClient.users().updateFilters(undefined, params, {})
                            .then(function (response) {
                                _this.push("filters", params);
                                PolymerUtils.setValue("filterName", "");
                                PolymerUtils.setValue(_this._prefix + "filterDescription", "");
                            });
                    }
                }
            });
    }

    onServerFilterChange(e) {
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
        console.log("onQueryFilterDelete", name,value)


        if (UtilsNew.isEmpty(value)) {
            delete _queryList[name];
            //TODO check the reason of this condition
            if (UtilsNew.isEqual(name, "genotype")) {
                if (this.modeInheritance === "xLinked" || this.modeInheritance === "yLinked") {
                    delete _queryList["region"];
                }
            }
        } else {
//                    let filterFields = _queryList[name].split(new RegExp("[,;]"));
            let filterFields;
            if ((value.indexOf(";") !== -1 && value.indexOf(",") !== -1)  || this._config.complexFields.indexOf(name) !== -1) {
                filterFields = _queryList[name].split(new RegExp(";"));
            } else {
                filterFields = _queryList[name].split(new RegExp("[,;]"));
            }

            let indexOfValue = filterFields.indexOf(value);
            filterFields.splice(indexOfValue, 1);

            if ((value.indexOf(";") !== -1 && value.indexOf(",") !== -1)
                || this._config.complexFields.indexOf(name) !== -1) {
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

    queryObserver() {
        let _queryList = [];
        let keys = Object.keys(this.query);
        for (let keyIdx in keys) {
            let key = keys[keyIdx];
            if (UtilsNew.isNotEmpty(this.query[key]) && !this._config.hiddenFields.includes(key)) {
                let queryString = Object.entries(this.query).sort().toString();
                let prevQueryString = Object.entries(this._previousQuery).sort().toString();
                if (queryString !== prevQueryString) {
                    // console.log(this.query);
                    // console.log(this._previousQuery);
                    // console.log(queryString);
                    // console.log(prevQueryString);
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

                // If we find a field with both ; and , or the field has been defined as complex, we will only
                // separate by ;
                let filterFields = [];
                if ((value.indexOf(";") !== -1 && value.indexOf(",") !== -1)
                    || this._config.complexFields.indexOf(key) !== -1) {
                    filterFields = value.split(new RegExp(";"));
                } else {
                    filterFields = value.split(new RegExp("[,;]"));
                }

                // We fist have need to remove defaultStudy from 'filterFields' and 'value'
                if (key === "studies") {
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
        }
    }

    render() {
        return html`
        <style include="jso-styles">
            .active-filter-button:hover {
                text-decoration: line-through;
            }
        </style>
        <div class="alert alert-warning" role="alert" id="${this._prefix}Warning" style="display: none;padding: 12px;margin-bottom: 10px">
            <span style="font-weight: bold;font-size: 1.20em">Warning!</span>&nbsp;&nbsp;Filters changed, please click on Search button to update the results.
        </div>

        <div class="panel panel-default" style="margin-bottom: 5px">
            <div class="panel-body">
                <button type="button" class="btn btn-primary" @click="${this.clear}">
                    <i class="fa fa-eraser" aria-hidden="true" style="padding-right: 5px"></i> Clear
                </button>

                <span style="padding: 0px 20px">
                    ${this.queryList ? html`
                        ${this.queryList.length === 0 ? html`
                            <label>No filters selected</label>
                        ` : html`
                        ${this.queryList.map(item => !this._isMultiValued(item) ? html` 
                            ${!item.locked ? html`
                                <!-- No multi-valued filters -->
                                <button type="button" class="btn btn-warning btn-sm ${item.name}ActiveFilter active-filter-button" data-filter-name="${item.name}" data-filter-value=""
                                        @click="${this.onQueryFilterDelete}">
                                ${item.text}
                                </button>
                            ` : html`
                                <button type="button" class="btn btn-warning btn-sm ${item.name}ActiveFilter active-filter-button" data-filter-name="${item.name}" data-filter-value=""
                                         @click="${this.onQueryFilterDelete}" title="${item.message}" disabled>
                                    ${item.text}
                                </button>
                            `}` : html`
                                <!-- Multi-valued filters -->
                                <div class="btn-group">
                                    <button type="button" class="btn btn-warning btn-sm ${item.name}ActiveFilter active-filter-button" data-filter-name="${item.name}" data-filter-value=""
                                            @click="${this.onQueryFilterDelete}" @mouseover="${this._onMouseOver}" @mouseout="${this._onMouseOut}" >
                                        ${item.text} <span class="badge">${item.items.length}</span>
                                    </button>
                                    <button type="button" class="btn btn-warning btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
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
                ` : null }
                </span>

                <!-- TODO we probably need a new property for this -->
                ${this.showSelectFilters(this.opencgaClient._config) ? html`
                    <div class="btn-group" style="float: right">
                        <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i class="fa fa-filter" aria-hidden="true" style="padding-right: 5px"></i> Filters <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-right">
                            <li><a style="font-weight: bold">Saved Filters</a></li>
                            ${this.filters.map(item => html`
                                <li> <!-- TODO recheck and simplify!!-->
                                    ${!item.active ? html`
                                        <a data-filter-name="${item.name}" style="cursor: pointer" @click="${this.onServerFilterChange}" class="filtersLink">&nbsp;&nbsp;${item.name}</a>` : html`
                                        <a data-filter-name="${item.name}" style="cursor: pointer;color: green" @click="${this.onServerFilterChange}" class="filtersLink">&nbsp;&nbsp;${item.name}</a>
                                    `}
                                </li>
                            `)}
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
                                <input class="form-control" type="text" id="filterName">
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

