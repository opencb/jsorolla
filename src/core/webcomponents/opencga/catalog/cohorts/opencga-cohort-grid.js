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
import Utils from "./../../../../utils.js";
import UtilsNew from "./../../../../utilsNew.js";
import PolymerUtils from "../../../PolymerUtils.js";


export default class OpencgaCohortGrid extends LitElement {

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
            search: {
                type: Object
            },
            active: {
                type: Boolean
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "VarCohortGrid" + Utils.randomString(6) + "_";
        this.active = false;
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession") ||
            changedProperties.has("search") ||
            changedProperties.has("config") ||
            changedProperties.has("active")) {
            this.propertyObserver();
        }
    }

    connectedCallback() {
        super.connectedCallback();

        // //////this.renderTable(this.active);
    }

    propertyObserver() {
        // With each property change we must updated config and create the columns again. No extra checks are needed.
        this._config = Object.assign(this.getDefaultConfig(), this.config);
        this._columns = this._initTableColumns();

        // Config for the grid toolbar
        this.toolbarConfig = {
            columns: this._columns[0]
        };

        this.renderTable(this.active);
    }

    renderTable(active) {
        if (!active) {
            return;
        }

        this.opencgaClient = this.opencgaSession.opencgaClient;

        // this.set('cohorts', []);
        this.cohorts = [];
        let filters = {...this.query};

        this.from = 1;
        this.to = 10;

        if (this.opencgaClient && this.opencgaSession.study && this.opencgaSession.study.fqn) {

            filters.study = this.opencgaSession.study.fqn;
            if (UtilsNew.isNotUndefinedOrNull(this.lastFilters) &&
                JSON.stringify(this.lastFilters) === JSON.stringify(filters)) {
                // Abort destroying and creating again the grid. The filters have not changed
                return;
            }
            // Store the current filters
            this.lastFilters = {...filters};

            // Make a copy of the cohorts (if they exist), we will use this private copy until it is assigned to this.cohorts
            if (UtilsNew.isNotUndefined(this.cohorts)) {
                this._cohorts = this.cohorts;
            } else {
                this._cohorts = [];
            }

            // Check that HTTP protocol is present and complete the URL
/*            let opencgaHostUrl = this.opencgaClient.getConfig().host;
            if (!opencgaHostUrl.startsWith("http://") && !opencgaHostUrl.startsWith("https://")) {
                opencgaHostUrl = "http://" + opencgaHostUrl;
            }
            opencgaHostUrl += "/webservices/rest/v1/cohorts/search";*/

            let skipCount = false;

            const _table = $("#" + this._prefix + "CohortBrowserGrid");

            const _this = this;
            $("#" + this._prefix + "CohortBrowserGrid").bootstrapTable("destroy");
            $("#" + this._prefix + "CohortBrowserGrid").bootstrapTable({
                //url: opencgaHostUrl,
                columns: _this._columns,
                method: "get",
                sidePagination: "server",
                uniqueId: "id",

                // Table properties
                pagination: _this._config.pagination,
                pageSize: _this._config.pageSize,
                pageList: _this._config.pageList,
                showExport: _this._config.showExport,
                detailView: _this._config.detailView,
                detailFormatter: _this._config.detailFormatter,
/*
                queryParams: function(params) {
                    if (this.pageNumber > 1) {
                        skipCount = true;
                    }

                    const auxParams = {
                        sid: Cookies.get(_this.opencgaClient.getConfig().cookieSessionId),
                        order: params.order,
                        sort: params.sort,
                        limit: params.limit,
                        skip: params.offset,
                        skipCount: skipCount,
                        include: "id,creationDate,status,type,samples"
                    };

                    if (UtilsNew.isUndefined(filters)) {
                        filters = {};
                    }
                    return Object.assign(filters, auxParams);
                },*/
                formatLoadingMessage: () =>"<div><loading-spinner></loading-spinner></div>",
                ajax: (params) => {
                    if (this.pageNumber > 1) {
                        skipCount = true;
                    }
                    let _filters = {
                        //study: this.opencgaSession.study.fqn,
                        order: params.data.order,
                        limit: params.data.limit,
                        skip: params.data.offset || 0,
                        skipCount: skipCount,
                        include: "id,creationDate,status,type,samples",
                        ...filters
                    };
                    this.opencgaSession.opencgaClient.cohorts().search(_filters)
                        .then( res => params.success(res))
                        .catch( e => console.error(e)) ;
                },
                responseHandler: function(response) {
                    if (!skipCount) {
                        if (!_this.hasOwnProperty("numTotalResults")) {
                            _this.numTotalResults = 0;
                        }
                        if (_this.numTotalResults !== response.getResponse().numTotalResults &&
                            response.queryOptions.skip === 0) {
                            _this.numTotalResults = response.getResponse().numTotalResults;
                        }
                    }

                    _this.numTotalResultsText = _this.numTotalResults.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

                    if (response.getParams().skip === 0 && _this.numTotalResults < response.getParams().limit) {
                        _this.from = 1;
                        _this.to = _this.numTotalResults;
                    }

                    _this.requestUpdate(); // it is necessary to refresh numTotalResultsText in opencga-grid-toolbar

                    return {
                        total: _this.numTotalResults,
                        rows: response.getResults()
                    };
                },
                onClickRow: function(row, element, field) {
                    let checked = true;
                    if (_this._config.multiSelection) {
                        // Check and uncheck when clicking in the checkbox TD cell
                        if (field === "state") {
                            const index = element[0].dataset.index;
                            if (element[0].className.includes("selected")) {
                                $(PolymerUtils.getElementById(_this._prefix + "CohortBrowserGrid")).bootstrapTable("uncheck", index);
                                checked = false;
                            } else {
                                $(PolymerUtils.getElementById(_this._prefix + "CohortBrowserGrid")).bootstrapTable("check", index);

                                $(".success").removeClass("success");
                                $(element).addClass("success");
                            }
                        } else {
                            // If user has clicked in the row
                            const index = element[0].dataset.index;
                            if (element[0].className.includes("selected")) {
                                $(PolymerUtils.getElementById(_this._prefix + "CohortBrowserGrid")).bootstrapTable("uncheck", index);
                                $(element).removeClass("success");
                                checked = false;
                            } else {
                                $(PolymerUtils.getElementById(_this._prefix + "CohortBrowserGrid")).bootstrapTable("check", index);
                            }
                        }
                    } else {
                        // If not checkboxes exist
                        $(".success").removeClass("success");
                        $(element).addClass("success");
                    }
                    _this._onSelectCohort(row, checked);
                },
                onDblClickRow: function(row, element, field) {
                    // We detail view is active we expand the row automatically.
                    // FIXME: Note that we use a CSS class way of knowing if the row is expand or collapse, this is not ideal but works.
                    if (_this._config.detailView) {
                        if (element[0].innerHTML.includes("icon-plus")) {
                            $(PolymerUtils.getElementById(_this._prefix + "CohortBrowserGrid")).bootstrapTable("expandRow", element[0].dataset.index);
                        } else {
                            $(PolymerUtils.getElementById(_this._prefix + "CohortBrowserGrid")).bootstrapTable("collapseRow", element[0].dataset.index);
                        }
                    }
                },
                onCheck: function(row, element) {
                    // check cohort is not already selected
                    for (const i in _this._cohorts) {
                        if (_this._cohorts[i].id === row.id) {
                            return;
                        }
                    }

                    // we add cohorts to selected cohorts
                    // _this.push("_cohorts", row);
                    // _this.set('cohorts', _this._cohorts.slice());
                    _this._cohorts.push(row);
                    _this.cohorts = _this._cohorts.slice();

                    // We detail view is active we expand the row automatically
                    if (_this._config.detailView) {
                        $(PolymerUtils.getElementById(_this._prefix + "CohortBrowserGrid")).bootstrapTable("expandRow", element[0].dataset.index);
                    }

                    // We only activate the row when checking
                    if (_this._config.detailView) {
                        $(".success").removeClass("success");
                    }
                    $(element[0].parentElement.parentElement).addClass("success");

                    // If exist on single nested sample we must check it
                    if (row.samples.length === 1) {
                        const checkbox = PolymerUtils.getElementById(_this._prefix + row.samples[0].id + "Checkbox");
                        if (UtilsNew.isNotUndefinedOrNull(checkbox)) {
                            checkbox.checked = true;
                        }
                    }

                    _this._onSelectCohort(row, true);
                },
                onUncheck: function(row, elem) {
                    let cohortToDeleteIdx = -1;
                    for (const i in _this.cohorts) {
                        if (_this.cohorts[i].id === row.id) {
                            cohortToDeleteIdx = i;
                            break;
                        }
                    }

                    if (cohortToDeleteIdx === -1) {
                        return;
                    }

                    // _this.splice('_cohorts', cohortToDeleteIdx, 1);
                    // _this.set('cohorts', _this._cohorts.slice());
                    _this._cohorts.splice(cohortToDeleteIdx, 1);
                    _this.cohorts = _this._cohorts.slice();

                    // We detail view is active we expand the row automatically
                    if (_this._config.detailView) {
                        $(PolymerUtils.getElementById(_this._prefix + "CohortBrowserGrid")).bootstrapTable("collapseRow", elem[0].dataset.index);
                    }

                    // We must uncheck nested checked samples
                    if (row.samples.length > 0) {
                        for (const sample of row.samples) {
                            const checkbox = PolymerUtils.getElementById(_this._prefix + sample.id + "Checkbox");
                            if (UtilsNew.isNotUndefinedOrNull(checkbox)) {
                                checkbox.checked = false;
                            }
                        }
                    }

                    _this._onSelectCohort(row, false);
                },
                onCheckAll: function(rows) {
                    const newCohorts = _this._cohorts.slice();
                    // check cohort is not already selected
                    rows.forEach(cohort => {
                        const existsNewSelected = _this._cohorts.some(cohortSelected => {
                            return cohortSelected.id === cohort.id;
                        });

                        if (!existsNewSelected) {
                            newCohorts.push(cohort);
                        }
                    });

                    // we add cohorts to selected cohorts
                    _this._cohorts = newCohorts;
                    // _this.set('cohorts', newCohorts.slice());
                    _this.cohorts = newCohorts.slice();

                    // We must uncheck nested checked samples
                    for (const row of rows) {
                        if (row.samples.length === 1) {
                            const checkbox = PolymerUtils.getElementById(_this._prefix + row.samples[0].id + "Checkbox");
                            if (UtilsNew.isNotUndefinedOrNull(checkbox)) {
                                checkbox.checked = true;
                            }
                        }
                    }
                },
                onUncheckAll: function(rows) {
                    // check cohort is not already selected
                    rows.forEach(cohort => {
                        _this._cohorts = _this._cohorts.filter(cohortSelected => {
                            return cohortSelected.id !== cohort.id;
                        });
                    });

                    // we add cohorts to selected cohorts
                    //                            _this.push("_cohorts", row);
                    _this.cohorts = _this._cohorts.slice();

                    // We must uncheck nested checked samples
                    for (const row of rows) {
                        for (const sample of row.samples) {
                            const checkbox = PolymerUtils.getElementById(_this._prefix + sample.id + "Checkbox");
                            if (UtilsNew.isNotUndefinedOrNull(checkbox)) {
                                checkbox.checked = false;
                            }
                        }
                    }
                },
                onLoadSuccess: function(data) {
                    // Check all already selected rows. Selected cohorts are stored in this.cohorts array
                    if (UtilsNew.isNotUndefinedOrNull(_table)) {
                        if (!_this._config.multiSelection) {
                            PolymerUtils.querySelector(_table.selector).rows[1].setAttribute("class", "success");
                            _this._onSelectCohort(data.rows[0]);
                        }

                        if (_this.cohorts !== "undefined") {
                            for (const idx in _this.cohorts) {
                                for (const j in data.rows) {
                                    if (_this.cohorts[idx].id === data.rows[j].id) {
                                        $(PolymerUtils.getElementById(_this._prefix + "CohortBrowserGrid")).bootstrapTable("check", j);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                },
                onPageChange: function(page, size) {
                    _this.from = (page - 1) * size + 1;
                    _this.to = page * size;
                }
            });
        } else {
            // Delete table
            $(PolymerUtils.getElementById(this._prefix + "CohortBrowserGrid")).bootstrapTable("destroy");
            this.numTotalResults = 0;
        }
    }

    _onSelectCohort(row, checked) {
        if (typeof row !== "undefined") {
            this.dispatchEvent(new CustomEvent("selectcohort", {
                detail: {
                    id: row.id,
                    cohort: row,
                    checked: checked
                }
            }));
        }
    }


    onColumnChange(e) {
        const table = $("#" + this._prefix + "CohortBrowserGrid");
        if (e.detail.selected) {
            table.bootstrapTable("showColumn", e.detail.id);
        } else {
            table.bootstrapTable("hideColumn", e.detail.id);
        }
    }

    sampleFormatter(value, row) {
        if (UtilsNew.isNotUndefined(row.samples)) {
            return row.samples.length;
        } else {
            return 0;
        }
    }

    dateFormatter(value, row) {
        const pattern = /^(\d\d\d\d)(\d\d)(\d\d)/;
        const matches = pattern.exec(value);
        if (matches) {
            const [year, month, day] = [matches[1], matches[2] - 1, matches[3]];
            return year + "-" + month + "-" + day;
        } else {
            return "Invalid date: '" + value + "'";
        }
    }

    _initTableColumns() {
        const customAnnotationVisible = (UtilsNew.isNotUndefinedOrNull(this._config.customAnnotations) &&
            UtilsNew.isNotEmptyArray(this._config.customAnnotations.fields));

        const columns = [];
        if (this._config.multiSelection) {
            columns.push({
                field: "state",
                checkbox: true,
                class: "cursor-pointer",
                eligible: false
            });
        }

        this._columns = [
            columns.concat([
                {
                    title: "Cohort",
                    field: "id",
                    sortable: true,
                    halign: this._config.header.horizontalAlign
                },
                {
                    title: "#Samples",
                    field: "samples",
                    formatter: this.sampleFormatter,
                    halign: this._config.header.horizontalAlign
                },
                {
                    title: "Date",
                    field: "creationDate",
                    formatter: this.dateFormatter,
                    sortable: true,
                    halign: this._config.header.horizontalAlign
                },
                {
                    title: "Status",
                    field: "status.name",
                    halign: this._config.header.horizontalAlign
                },
                {
                    title: "Type",
                    field: "type",
                    halign: this._config.header.horizontalAlign
                }
            ])
        ];

        return this._columns;
    }

    _getUrlQueryParams() {
        // TODO
    }

    onDownload(e) {
        // let urlQueryParams = this._getUrlQueryParams();
        // let params = urlQueryParams.queryParams;
        //console.log(this.opencgaSession);
        const params = {
            ...this.query,
            study: this.opencgaSession.study.fqn,
            sid: this.opencgaSession.opencgaClient._config.sessionId,
            limit: 1000,
            includeIndividual: true,
            skipCount: true,
            include: "id,creationDate,status,type,samples"
        };
        this.opencgaSession.opencgaClient.cohorts().search(params)
            .then( response => {
                const result = response.response[0].result;
                console.log(result)
                let dataString = [];
                let mimeType = "";
                let extension = "";
                if (result) {
                    // Check if user clicked in Tab or JSON format
                    if (e.detail.option.toLowerCase() === "tab") {
                        dataString = [
                            ["Cohort", "#Samples", "Date", "Status", "Type"].join("\t"),
                            ...result.map( _ => [
                                _.id,
                                _.samples ? _.samples.map( _ => `${_.id}`).join(",") : "",
                                _.creationDate,
                                _.status.name,
                                _.type
                            ].join("\t"))];
                        //console.log(dataString);
                        mimeType = "text/plain";
                        extension = ".txt";
                    } else {
                        for (const res of result) {
                            dataString.push(JSON.stringify(res, null, "\t"));
                        }
                        mimeType = "application/json";
                        extension = ".json";
                    }

                    // Build file and anchor link
                    const data = new Blob([dataString.join("\n")], {type: mimeType});
                    const file = window.URL.createObjectURL(data);
                    const a = document.createElement("a");
                    a.href = file;
                    a.download = this.opencgaSession.study.alias + extension;
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(function() {
                        document.body.removeChild(a);
                    }, 0);
                } else {
                    console.error("Error in result format");
                }
            })
            .then(function() {
                //this.downloadRefreshIcon.css("display", "none");
                //this.downloadIcon.css("display", "inline-block");
            });
    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 10,
            pageList: [10, 25, 50],
            showExport: false,
            detailView: false,
            detailFormatter: undefined, // function with the detail formatter
            multiSelection: false,
            header: {
                horizontalAlign: "center",
                verticalAlign: "bottom"
            },
            customAnnotations: {
                title: "Custom Annotation",
                fields: []
            }
        };
    }

    render() {
        return html`
        <style include="jso-styles"></style>

        <opencb-grid-toolbar .from="${this.from}"
                             .to="${this.to}"
                             numTotalResultsText="${this.numTotalResultsText}"
                             @download="${this.onDownload}">
        </opencb-grid-toolbar>

        <div id="${this._prefix}GridTableDiv">
            <table id="${this._prefix}CohortBrowserGrid">
            </table>
        </div>
        `;
    }

}

customElements.define("opencga-cohort-grid", OpencgaCohortGrid);
