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
import CatalogUIUtils from "../../../commons/CatalogUIUtils.js";
import "../../../commons/opencb-grid-toolbar.js";


export default class OpencgaIndividualGrid extends LitElement {

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
            individuals: {
                type: Array
            },
            query: {
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
        this._prefix = "VarIndividualGrid" + Utils.randomString(6);
        this.catalogUiUtils = new CatalogUIUtils();
        this.active = false;
    }

    firstUpdated(_changedProperties) {
        // this.renderTable(this.active);
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession") ||
            changedProperties.has("search") ||
            changedProperties.has("config") ||
            changedProperties.has("active")) {
            this.propertyObserver();
        }
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

        this.individuals = [];

        const filters = Object.assign({}, this.query);

        // Initialise the counters
        this.from = 1;
        this.to = this._config.pageSize;

        if (this.opencgaClient && this.opencgaSession.study && this.opencgaSession.study.fqn) {

            filters.study = this.opencgaSession.study.fqn;
            if (UtilsNew.isNotUndefinedOrNull(this.lastFilters) &&
                JSON.stringify(this.lastFilters) === JSON.stringify(filters)) {
                // Abort destroying and creating again the grid. The filters have not changed
                return;
            }
            // Store the current filters
            this.lastFilters = {...filters};

            // Make a copy of the individuals (if they exist), we will use this private copy until it is assigned to this.individuals
            if (UtilsNew.isNotUndefined(this.individuals)) {
                this._individuals = this.individuals;
            } else {
                this._individuals = [];
            }

            // Check that HTTP protocol is present and complete the URL
            /* let opencgaHostUrl = this.opencgaClient.getConfig().host;
            if (!opencgaHostUrl.startsWith("http://") && !opencgaHostUrl.startsWith("https://")) {
                opencgaHostUrl = "http://" + opencgaHostUrl;
            }
            opencgaHostUrl += "/webservices/rest/v1/individuals/search";
            */

            let count = false;

            const _table = $("#" + this._prefix + "IndividualBrowserGrid");

            const _this = this;
            $("#" + this._prefix + "IndividualBrowserGrid").bootstrapTable("destroy");
            $("#" + this._prefix + "IndividualBrowserGrid").bootstrapTable({
                // url: opencgaHostUrl,
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

                // Make Polymer components avalaible to table formatters
                gridContext: _this,
                /* queryParams: function(params) {
                    if (this.pageNumber > 1) {
                        skipCount = true;
                    }

                    let auxParams = {
                        sid: Cookies.get(_this.opencgaClient.getConfig().cookieSessionId),
                        order: params.order,
                        sort: params.sort,
                        limit: params.limit,
                        skip: params.offset,
                        skipCount: skipCount
                        // include: "id,creationDate,status,uuid,sex,version,release,father,mother,population,"
                        //     + "dateOfBirth,modificationDate,lifeStatus,affectationStatus,phenotypes,samples,"
                        //     + "parentalConsanguinity,multiples"
                    };

                    if (UtilsNew.isUndefined(filters)) {
                        filters = {};
                    }
                    return Object.assign({}, filters, auxParams);
                },*/
                formatLoadingMessage: () =>"<div><loading-spinner></loading-spinner></div>",
                ajax: params => {
                    const _filters = {
                        // study: this.opencgaSession.study.fqn,
                        order: params.data.order,
                        limit: params.data.limit,
                        skip: params.data.offset || 0,
                        count: !_table.bootstrapTable("getOptions").pageNumber || _table.bootstrapTable("getOptions").pageNumber === 1,
                        ...filters
                    };
                    this.opencgaSession.opencgaClient.individuals().search(_filters)
                        .then( res => params.success(res))
                        .catch( e => console.error(e));
                },
                responseHandler: function(response) {

                    console.log("response", response);
                    let _numMatches = _this._numMatches || 0;
                    if (response.getResponse().numMatches >= 0) {
                        _numMatches = response.getResponse().numMatches;
                        _this._numMatches = _numMatches;
                    }
                    // If no variant is returned then we start in 0
                    if (response.getResponse(0).numMatches === 0) {
                        _this.from = _numMatches;
                    }
                    // If do not fetch as many variants as requested then to is numMatches
                    if (response.getResponse(0).numResults < this.pageSize) {
                        _this.to = _numMatches;
                    }
                    _this.numTotalResultsText = _numMatches.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    if (response.getParams().skip === 0 && _numMatches < response.getParams().limit) {
                        _this.from = 1;
                        _this.to = _numMatches;
                    }
                    _this.approximateCountResult = response.getResponse().attributes.approximateCount;
                    _this.requestUpdate(); // it is necessary to refresh numTotalResultsText in opencga-grid-toolbar
                    return {
                        total: _numMatches,
                        rows: response.getResults()
                    };
                },
                onClickRow: function(row, element, field) {
                    if (_this._config.multiSelection) {
                        // Check and uncheck when clicking in the checkbox TD cell
                        if (field === "state") {
                            const index = element[0].dataset.index;
                            if (element[0].className.includes("selected")) {
                                $(PolymerUtils.getElementById(_this._prefix + "IndividualBrowserGrid")).bootstrapTable("uncheck", index);
                            } else {
                                $(PolymerUtils.getElementById(_this._prefix + "IndividualBrowserGrid")).bootstrapTable("check", index);

                                $(".success").removeClass("success");
                                $(element).addClass("success");
                            }
                        } else {
                            // If user has clicked in the row
                            const index = element[0].dataset.index;
                            if (element[0].className.includes("selected")) {
                                $(PolymerUtils.getElementById(_this._prefix + "IndividualBrowserGrid")).bootstrapTable("uncheck", index);
                                $(element).removeClass("success");
                            } else {
                                $(PolymerUtils.getElementById(_this._prefix + "IndividualBrowserGrid")).bootstrapTable("check", index);
                            }
                        }
                    } else {
                        // If not checkboxes exist
                        $(".success").removeClass("success");
                        $(element).addClass("success");
                    }

                    _this._onSelectIndividual(row);
                },
                onDblClickRow: function(row, element, field) {
                    // We detail view is active we expand the row automatically.
                    // FIXME: Note that we use a CSS class way of knowing if the row is expand or collapse, this is not ideal but works.
                    if (_this._config.detailView) {
                        if (element[0].innerHTML.includes("icon-plus")) {
                            $(PolymerUtils.getElementById(_this._prefix + "IndividualBrowserGrid")).bootstrapTable("expandRow", element[0].dataset.index);
                        } else {
                            $(PolymerUtils.getElementById(_this._prefix + "IndividualBrowserGrid")).bootstrapTable("collapseRow", element[0].dataset.index);
                        }
                    }
                },
                onCheck: function(row, element) {
                    // check individual is not already selected
                    for (const i in _this._individuals) {
                        if (_this._individuals[i].id === row.id) {
                            return;
                        }
                    }

                    // we add individuals to selected individuals
                    // _this.push("_individuals", row);
                    // _this.set("individuals", _this._individuals.slice());
                    _this._individuals.push(row);
                    _this.individuals = _this._individuals.slice();

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
                },
                onUncheck: function(row, elem) {
                    let individualToDeleteIdx = -1;
                    for (const i in _this.individuals) {
                        if (_this.individuals[i].id === row.id) {
                            individualToDeleteIdx = i;
                            break;
                        }
                    }

                    if (individualToDeleteIdx === -1) {
                        return;
                    }

                    // _this.splice("_individuals", individualToDeleteIdx, 1);
                    // _this.set("individuals", _this._individuals.slice());
                    _this._individuals.splice(individualToDeleteIdx, 1);
                    _this.individuals = _this._individuals.slice();

                    // We detail view is active we expand the row automatically
                    if (_this._config.detailView) {
                        $(PolymerUtils.getElementById(_this._prefix + "IndividualBrowserGrid")).bootstrapTable("collapseRow", elem[0].dataset.index);
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
                },
                onCheckAll: function(rows) {
                    const newIndividuals = _this._individuals.slice();
                    // check individual is not already selected
                    rows.forEach(individual => {
                        const existsNewSelected = _this._individuals.some(individualSelected => {
                            return individualSelected.id === individual.id;
                        });

                        if (!existsNewSelected) {
                            newIndividuals.push(individual);
                        }
                    });

                    // we add individuals to selected individuals
                    _this._individuals = newIndividuals;
                    // _this.set("individuals", newIndividuals.slice());
                    _this.individuals = newIndividuals.slice();

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
                    // check individual is not already selected
                    rows.forEach(individual => {
                        _this._individuals = _this._individuals.filter(individualSelected => {
                            return individualSelected.id !== individual.id;
                        });
                    });

                    // we add individuals to selected individuals
                    _this.individuals = _this._individuals.slice();

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
                    // Check all already selected rows. Selected individuals are stored in this.individuals array
                    if (UtilsNew.isNotUndefinedOrNull(_table)) {
                        if (!_this._config.multiSelection) {
                            PolymerUtils.querySelector(_table.selector).rows[1].setAttribute("class", "success");
                            _this._onSelectIndividual(data.rows[0], "onLoad");
                        }

                        if (_this.individuals !== "undefined") {
                            for (const idx in _this.individuals) {
                                for (const j in data.rows) {
                                    if (_this.individuals[idx].id === data.rows[j].id) {
                                        $(PolymerUtils.getElementById(_this._prefix + "IndividualBrowserGrid")).bootstrapTable("check", j);
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
                },
                onPostBody: function(data) {
                    // Add tooltips
                    _this.catalogUiUtils.addTooltip("div.phenotypesTooltip", "Phenotypes");
                }
            });
        } else {
            // Delete table
            $(PolymerUtils.getElementById(this._prefix + "IndividualBrowserGrid")).bootstrapTable("destroy");
            this.numTotalResults = 0;
        }
    }

    _onSelectIndividual(row, event) {
        console.log("row, event", row, event);
        if (UtilsNew.isNotUndefinedOrNull(row)) {
            if (UtilsNew.isUndefinedOrNull(event) || event !== "onLoad") {
                this.dispatchEvent(new CustomEvent("selectindividual", {
                    detail: {
                        id: row.id,
                        individual: row
                    }
                }));
            }
        }
    }

    onColumnChange(e) {
        const table = $("#" + this._prefix + "IndividualBrowserGrid");
        if (e.detail.selected) {
            table.bootstrapTable("showColumn", e.detail.id);
        } else {
            table.bootstrapTable("hideColumn", e.detail.id);
        }
    }

    detailFormatter(value, row) {
        let result = `<div class='row' style="padding: 5px 10px 20px 10px">
                                <div class='col-md-12'>
                                    <h5 style="font-weight: bold">Samples</h5>
                `;

        if (UtilsNew.isNotEmptyArray(row.samples)) {
            let tableCheckboxHeader = "";

            if (this.gridContext._config.multiSelection) {
                tableCheckboxHeader = "<th>Select</th>";
            }

            result += `<div style="width: 90%;padding-left: 20px">
                                <table class="table table-hover table-no-bordered">
                                    <thead>
                                        <tr class="table-header">
                                            ${tableCheckboxHeader}
                                            <th>Sample ID</th>
                                            <th>Source</th>
                                            <th>Collection Method</th>
                                            <th>Preparation Method</th>
                                            <th>Somatic</th>
                                            <th>Creation Date</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>`;

            for (const sample of row.samples) {
                let tableCheckboxRow = "";
                // If parent row is checked and there is only one samlpe then it must be selected
                if (this.gridContext._config.multiSelection) {
                    let checkedStr = "";
                    for (const individual of this.gridContext.individuals) {
                        if (individual.id === row.id && row.samples.length === 1) {
                            // TODO check sampkle has been checked before, we need to store them
                            checkedStr = "checked";
                            break;
                        }
                    }

                    tableCheckboxRow = `<td><input id='${this.gridContext.prefix}${sample.id}Checkbox' type='checkbox' ${checkedStr}></td>`;
                }

                const source = (UtilsNew.isNotEmpty(sample.source)) ? sample.source : "-";
                const collectionMethod = (sample.collection !== undefined) ? sample.collection.method : "-";
                const preparationMethod = (sample.processing !== undefined) ? sample.processing.preparationMethod : "-";
                const cellLine = (sample.somatic) ? "Somatic" : "Germline";
                const creationDate = moment(sample.creationDate, "YYYYMMDDHHmmss").format("D MMM YYYY");

                result += `<tr class="detail-view-row">
                                        ${tableCheckboxRow}
                                        <td>${sample.id}</td>
                                        <td>${source}</td>
                                        <td>${collectionMethod}</td>
                                        <td>${preparationMethod}</td>
                                        <td>${cellLine}</td>
                                        <td>${creationDate}</td>
                                        <td>${sample.status ? sample.status.name : ""}</td>
                                   </tr>`;
            }
            result += "</tbody></table></diV>";
        } else {
            result += "No samples found";
        }

        result += "</div></div>";
        return result;
    }

    // stateFormatter(value, row, index) {
    // if (this.gridContext !== undefined && typeof this.gridContext.individuals !== "undefined") {
    //     for (let idx in this.gridContext.individuals) {
    //         if (this.gridContext.individuals[idx].name === row.name) {
    //             break;
    //         }
    //     }
    // }
    // }

    sexFormatter(value, row) {
        let sexHtml = `<span>${row.sex}</span>`;
        if (UtilsNew.isNotEmpty(row.karyotypicSex)) {
            sexHtml += ` (${row.karyotypicSex})`;
        }
        return sexHtml;
    }

    fatherFormatter(value, row) {
        if (UtilsNew.isNotUndefinedOrNull(row.father) && UtilsNew.isNotEmpty(row.father.id)) {
            return row.father.id;
        } else {
            return "-";
        }
    }

    motherFormatter(value, row) {
        if (UtilsNew.isNotUndefinedOrNull(row.mother) && UtilsNew.isNotEmpty(row.mother.id)) {
            return row.mother.id;
        } else {
            return "-";
        }
    }

    disordersFormatter(value, row) {
        if (UtilsNew.isNotEmpty(value)) {
            let disordersHtml = "<div>";
            for (const disorder of value) {
                disordersHtml += `<span>${disorder.id}</span>`;
            }
            disordersHtml += "</div>";
            return disordersHtml;
        } else {
            return "-";
        }
    }

    phenotypesFormatter(value, row) {
        if (UtilsNew.isNotEmptyArray(value)) {
            let phenotypeTooltipText = "";
            for (const phenotype of value) {
                phenotypeTooltipText += "<div style=\"padding: 5px\">";
                if (UtilsNew.isNotUndefinedOrNull(phenotype.source) && phenotype.source.toUpperCase() === "HPO") {
                    phenotypeTooltipText += `<span><a target="_blank" href="https://hpo.jax.org/app/browse/term/${phenotype.id}">${phenotype.id} </a>(${phenotype.status})</span>`;
                } else {
                    phenotypeTooltipText += `<span>${phenotype.id} (${phenotype.status})</span>`;
                }
                phenotypeTooltipText += "</div>";
            }

            const html = `<div class="phenotypesTooltip" data-tooltip-text='${phenotypeTooltipText}' align="center">
                                    <a style="cursor: pointer">
                                        ${value.length} terms found
                                    </a>
                                </div>
                    `;
            return html;
        } else {
            return "-";
        }
    }

    samplesFormatter(value, row) {
        if (UtilsNew.isNotEmptyArray(row.samples)) {
            let samples = "<div>";
            for (const sample of row.samples) {
                samples += `<div>${sample.id}</div>`;
            }
            samples += "</div>";
            return samples;
        } else {
            return "-";
        }
    }

    customAnnotationFormatter(value, row) {
        // debugger
    }

    dateFormatter(value, row) {
        if (UtilsNew.isNotUndefinedOrNull(value)) {
            return moment(value, "YYYYMMDDHHmmss").format("D MMM YYYY");
        }
        return "-";
    }

    _initTableColumns() {
        // Check column visibility
        const customAnnotationVisible = (UtilsNew.isNotUndefinedOrNull(this._config.customAnnotations) &&
            UtilsNew.isNotEmptyArray(this._config.customAnnotations.fields));

        const columns = [];
        if (this._config.multiSelection) {
            columns.push({
                field: "state",
                checkbox: true,
                // formatter: this.stateFormatter,
                class: "cursor-pointer",
                eligible: false
            });
        }

        this._columns = [
            columns.concat(
                [
                    {
                        title: "Individual",
                        field: "id",
                        sortable: true,
                        halign: this._config.header.horizontalAlign
                    },
                    {
                        title: "Samples",
                        field: "samples",
                        formatter: this.samplesFormatter,
                        halign: this._config.header.horizontalAlign
                    },
                    {
                        title: "Sex",
                        field: "sex",
                        sortable: true,
                        formatter: this.sexFormatter,
                        halign: this._config.header.horizontalAlign
                    },
                    {
                        title: "Father",
                        field: "father.id",
                        formatter: this.fatherFormatter,
                        halign: this._config.header.horizontalAlign
                    },
                    {
                        title: "Mother",
                        field: "mother.id",
                        formatter: this.motherFormatter,
                        halign: this._config.header.horizontalAlign
                    },
                    {
                        title: "Disorders",
                        field: "disorders",
                        formatter: this.disordersFormatter.bind(this),
                        halign: this._config.header.horizontalAlign
                    },
                    {
                        title: "Phenotypes",
                        field: "phenotypes",
                        formatter: this.phenotypesFormatter.bind(this),
                        halign: this._config.header.horizontalAlign
                    },
                    // {
                    //     title: 'Affectation Status',
                    //     field: 'affectationStatus',
                    //     halign: this._config.header.horizontalAlign
                    // },
                    {
                        title: "Life Status",
                        field: "lifeStatus",
                        halign: this._config.header.horizontalAlign
                    },
                    {
                        title: "Custom Annotations",
                        field: "customAnnotation",
                        formatter: this.customAnnotationFormatter,
                        visible: customAnnotationVisible,
                        halign: this._config.header.horizontalAlign
                    },
                    {
                        title: "Date of Birth",
                        field: "dateOfBirth",
                        sortable: true,
                        formatter: this.dateFormatter,
                        halign: this._config.header.horizontalAlign
                    },
                    {
                        title: "Creation Date",
                        field: "creationDate",
                        sortable: true,
                        formatter: this.dateFormatter,
                        halign: this._config.header.horizontalAlign
                    },
                    {
                        title: "Status",
                        field: "status.name",
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
        // console.log(this.opencgaSession);
        const params = {
            ...this.query,
            study: this.opencgaSession.study.fqn,
            sid: this.opencgaSession.opencgaClient._config.sessionId,
            limit: 1000,
            skip: 0,
            includeIndividual: true,
            count: false

        };

        this.opencgaSession.opencgaClient.individuals().search(params)
            .then(response => {
                const result = response.response[0].result;
                console.log(result);
                let dataString = [];
                let mimeType = "";
                let extension = "";
                if (result) {
                    // Check if user clicked in Tab or JSON format
                    if (e.detail.option.toLowerCase() === "tab") {
                        dataString = [
                            ["Individual", "Samples", "Sex", "Father", "Mother", "Disorders", "Phenotypes", "Life Status", "Date of Birth", "Creation Date", "Status"].join("\t"),
                            ...result.map( _ => [
                                _.id,
                                _.samples ? _.samples.map( _ => _.id).join(",") : "",
                                _.sex,
                                _.father.id,
                                _.mother.id,
                                _.disorders ? _.disorders.map( _ => _.id).join(",") : "",
                                _.phenotypes ? _.phenotypes.map( _ => _.id).join(",") : "",
                                _.lifeStatus,
                                _.dateOfBirth,
                                _.creationDate,
                                _.status.name
                            ].join("\t"))];
                        // console.log(dataString);
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
                // this.downloadRefreshIcon.css("display", "none");
                // this.downloadIcon.css("display", "inline-block");
            });
    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 10,
            pageList: [10, 25, 50],
            showExport: false,
            detailView: true,
            detailFormatter: this.detailFormatter, // function with the detail formatter
            multiSelection: false,
            header: {
                horizontalAlign: "center",
                verticalAlign: "bottom"
            },
            disorderSources: ["ICD", "ICD10", "GelDisorder"],
            customAnnotations: {
                title: "Custom Annotation",
                fields: []
            }
        };
    }


    render() {
        return html`
        <style include="jso-styles">
            .detail-view :hover {
                background-color: white;
            }

            .detail-view-row :hover {
                background-color: #f5f5f5;
            }

            .cursor-pointer {
                cursor: pointer;
            }

            .phenotypes-link-dropdown:hover .dropdown-menu {
                display: block;
            }
        </style>

        <opencb-grid-toolbar .from="${this.from}"
                             .to="${this.to}"
                             .numTotalResultsText="${this.numTotalResultsText}"
                             .config="${this.toolbarConfig}"
                             @download="${this.onDownload}"
                             @columnchange="${this.onColumnChange}">
        </opencb-grid-toolbar>

        <div id="${this._prefix}GridTableDiv">
            <table id="${this._prefix}IndividualBrowserGrid">
            </table>
        </div>
        `;
    }

}

customElements.define("opencga-individual-grid", OpencgaIndividualGrid);
