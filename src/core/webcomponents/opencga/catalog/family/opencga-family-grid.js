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
import "../../../commons/opencb-grid-toolbar.js";
import "./opencga-family-filter.js";
import "../../commons/CatalogUIUtils.js";

export default class OpencgaFamilyGrid extends LitElement {

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
            families: {
                type: Array
            },
            //TODO remove
            search: {
                type: Object
            },
            active: {
                type: Boolean
            },
            config: {
                type: Object
            },
            query: {
                type: Object
            },
        };
    }

    _init() {
        this._prefix = "VarFamilyGrid" + Utils.randomString(6);
        this.catalogUiUtils = new CatalogUIUtils();
        this.active = false;
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession") ||
            changedProperties.has("query") ||
            changedProperties.has("config") ||
            changedProperties.has("active")) {
            this.propertyObserver();
        }
    }

    /* connectedCallback() {
        super.connectedCallback();

        this.renderTable(this.active);
    }*/

    firstUpdated(_changedProperties) {
        //this.renderTable(this.active);
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

        this.families = [];

        let filters = {...this.query};

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

            // Make a copy of the families (if they exist), we will use this private copy until it is assigned to this.families
            if (UtilsNew.isNotUndefined(this.families)) {
                this._families = this.families;
            } else {
                this._families = [];
            }

            // Check that HTTP protocol is present and complete the URL
/*            let opencgaHostUrl = this.opencgaClient.getConfig().host;
            if (!opencgaHostUrl.startsWith("http://") && !opencgaHostUrl.startsWith("https://")) {
                opencgaHostUrl = "http://" + opencgaHostUrl;
            }
            opencgaHostUrl += "/webservices/rest/v1/families/search";*/

            let skipCount = false;

            const _table = $("#" + this._prefix + "FamilyBrowserGrid");

            const _this = this;
            $("#" + this._prefix + "FamilyBrowserGrid").bootstrapTable("destroy");
            $("#" + this._prefix + "FamilyBrowserGrid").bootstrapTable({
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

                // Make Polymer components avalaible to table formatters
                gridContext: _this,
/*                queryParams: function(params) {
                    if (this.pageNumber > 1) {
                        skipCount = true;
                    }

                    const auxParams = {
                        sid: Cookies.get(_this.opencgaClient.getConfig().cookieSessionId),
                        order: params.order,
                        sort: params.sort,
                        limit: params.limit,
                        skip: params.offset,
                        // includeFamily: true,
                        skipCount: skipCount
                        // include: "id,creationDate,status,uuid,version,release,modificationDate,phenotypes,members,expectedSize"
                    };

                    if (UtilsNew.isUndefined(filters)) {
                        filters = {};
                    }
                    return Object.assign({}, filters, auxParams);
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
                        ...filters
                    };
                    this.opencgaSession.opencgaClient.families().search(_filters)
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
                    if (_this._config.multiSelection) {
                        // Check and uncheck when clicking in the checkbox TD cell
                        if (field === "state") {
                            const index = element[0].dataset.index;
                            if (element[0].className.includes("selected")) {
                                $(PolymerUtils.getElementById(_this._prefix + "FamilyBrowserGrid")).bootstrapTable("uncheck", index);
                            } else {
                                $(PolymerUtils.getElementById(_this._prefix + "FamilyBrowserGrid")).bootstrapTable("check", index);

                                $(".success").removeClass("success");
                                $(element).addClass("success");
                            }
                        } else {
                            // If user has clicked in the row
                            const index = element[0].dataset.index;
                            if (element[0].className.includes("selected")) {
                                $(PolymerUtils.getElementById(_this._prefix + "FamilyBrowserGrid")).bootstrapTable("uncheck", index);
                                $(element).removeClass("success");
                            } else {
                                $(PolymerUtils.getElementById(_this._prefix + "FamilyBrowserGrid")).bootstrapTable("check", index);
                            }
                        }
                    } else {
                        // If not checkboxes exist
                        $(".success").removeClass("success");
                        $(element).addClass("success");
                    }

                    _this._onSelectFamily(row);
                },
                onDblClickRow: function(row, element, field) {
                    // We detail view is active we expand the row automatically.
                    // FIXME: Note that we use a CSS class way of knowing if the row is expand or collapse, this is not ideal but works.
                    if (_this._config.detailView) {
                        if (element[0].innerHTML.includes("icon-plus")) {
                            $(PolymerUtils.getElementById(_this._prefix + "FamilyBrowserGrid")).bootstrapTable("expandRow", element[0].dataset.index);
                        } else {
                            $(PolymerUtils.getElementById(_this._prefix + "FamilyBrowserGrid")).bootstrapTable("collapseRow", element[0].dataset.index);
                        }
                    }
                },
                onCheck: function(row, element) {
                    // check family is not already selected
                    for (const i in _this._families) {
                        if (_this._families[i].id === row.id) {
                            return;
                        }
                    }

                    // we add families to selected families
                    _this._families.push(row);
                    _this.families = _this._families.slice();

                    // We only activate the row when checking
                    if (_this._config.detailView) {
                        $(".success").removeClass("success");
                    }
                    $(element[0].parentElement.parentElement).addClass("success");

                    // If exist on single nested sample we must check it
                    if (row.members.length === 1) {
                        const checkbox = PolymerUtils.getElementById(_this._prefix + row.members[0].id + "Checkbox");
                        if (UtilsNew.isNotUndefinedOrNull(checkbox)) {
                            checkbox.checked = true;
                        }
                    }
                },
                onUncheck: function(row, elem) {
                    let familyToDeleteIdx = -1;
                    for (const i in _this.families) {
                        if (_this.families[i].id === row.id) {
                            familyToDeleteIdx = i;
                            break;
                        }
                    }

                    if (familyToDeleteIdx === -1) {
                        return;
                    }

                    _this._families = _this._families.splice(familyToDeleteIdx, 1);
                    _this.families = this._families.slice();

                    // We detail view is active we expand the row automatically
                    if (_this._config.detailView) {
                        $(PolymerUtils.getElementById(_this._prefix + "FamilyBrowserGrid")).bootstrapTable("collapseRow", elem[0].dataset.index);
                    }

                    // We must uncheck nested checked samples
                    if (row.members.length > 0) {
                        for (const sample of row.members) {
                            const checkbox = PolymerUtils.getElementById(_this._prefix + sample.id + "Checkbox");
                            if (UtilsNew.isNotUndefinedOrNull(checkbox)) {
                                checkbox.checked = false;
                            }
                        }
                    }
                },
                onCheckAll: function(rows) {
                    const newFamilies = _this._families.slice();
                    // check family is not already selected
                    rows.forEach(family => {
                        const existsNewSelected = _this._families.some(familySelected => {
                            return familySelected.id === family.id;
                        });

                        if (!existsNewSelected) {
                            newFamilies.push(family);
                        }
                    });

                    // we add families to selected families
                    _this._families = newFamilies;
                    _this.families = newFamilies.slice();

                    // We must uncheck nested checked samples
                    for (const row of rows) {
                        if (row.members.length === 1) {
                            const checkbox = PolymerUtils.getElementById(_this._prefix + row.members[0].id + "Checkbox");
                            if (UtilsNew.isNotUndefinedOrNull(checkbox)) {
                                checkbox.checked = true;
                            }
                        }
                    }
                },
                onUncheckAll: function(rows) {
                    // check family is not already selected
                    rows.forEach(family => {
                        _this._families = _this._families.filter(familySelected => {
                            return familySelected.id !== family.id;
                        });
                    });

                    // we add families to selected families
                    //                            _this.push("_families", row);
                    _this.families = _this._families.slice();

                    // We must uncheck nested checked samples
                    for (const row of rows) {
                        for (const sample of row.members) {
                            const checkbox = PolymerUtils.getElementById(_this._prefix + sample.id + "Checkbox");
                            if (UtilsNew.isNotUndefinedOrNull(checkbox)) {
                                checkbox.checked = false;
                            }
                        }
                    }
                },
                onLoadSuccess: function(data) {
                    // Check all already selected rows. Selected families are stored in this.families array
                    if (UtilsNew.isNotUndefinedOrNull(_table)) {
                        if (_this._config.detailView) {
                            PolymerUtils.querySelector(_table.selector).rows[1].setAttribute("class", "success");
                            _this._onSelectFamily(data.rows[0]);
                        }

                        if (_this.families !== "undefined") {
                            for (const idx in _this.families) {
                                for (const j in data.rows) {
                                    if (_this.families[idx].id === data.rows[j].id) {
                                        $(PolymerUtils.getElementById(_this._prefix + "FamilyBrowserGrid")).bootstrapTable("check", j);
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
                    _this.catalogUiUtils.addTooltip("div.membersTooltip", "Members");
                }
            });
        } else {
            // Delete table
            $(PolymerUtils.getElementById(this._prefix + "FamilyBrowserGrid")).bootstrapTable("destroy");
            this.numTotalResults = 0;
        }
    }

    _onSelectFamily(row) {
        if (typeof row !== "undefined") {
            this.dispatchEvent(new CustomEvent("selectfamily", {
                detail: {
                    id: row.id,
                    family: row
                }
            }));
        }
    }

    onColumnChange(e) {
        const table = $("#" + this._prefix + "FamilyBrowserGrid");
        if (e.detail.selected) {
            table.bootstrapTable("showColumn", e.detail.id);
        } else {
            table.bootstrapTable("hideColumn", e.detail.id);
        }
    }


    detailFormatter(value, row) {
        let result = `<div class='row' style="padding: 5px 10px 20px 10px">
                                <div class='col-md-12'>
                                    <h5 style="font-weight: bold">Members</h5>
                `;

        if (UtilsNew.isNotEmptyArray(row.members)) {
            let tableCheckboxHeader = "";

            if (this.gridContext._config.multiSelection) {
                tableCheckboxHeader = "<th>Select</th>";
            }

            result += `<div style="width: 90%;padding-left: 20px">
                                <table class="table table-hover table-no-bordered">
                                    <thead>
                                        <tr class="table-header">
                                            ${tableCheckboxHeader}
                                            <th>ID</th>
                                            <th>Sex</th>
                                            <th>Father</th>
                                            <th>Mother</th>
                                            <th>Affectation Status</th>
                                            <th>Life Status</th>
                                            <th>Year of Birth</th>
                                            <th>Creation Date</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>`;

            for (const member of row.members) {
                let tableCheckboxRow = "";
                // If parent row is checked and there is only one samlpe then it must be selected
                if (this.gridContext._config.multiSelection) {
                    let checkedStr = "";
                    for (const family of this.gridContext.families) {
                        if (family.id === row.id && row.members.length === 1) {
                            // TODO check member has been checked before, we need to store them
                            checkedStr = "checked";
                            break;
                        }
                    }

                    tableCheckboxRow = `<td><input id='${this.gridContext.prefix}${member.id}Checkbox' type='checkbox' ${checkedStr}></td>`;
                }

                const father = (UtilsNew.isNotEmpty(member.father.id)) ? member.father.id : "-";
                const mother = (UtilsNew.isNotEmpty(member.mother.id)) ? member.mother.id : "-";
                const affectation = (UtilsNew.isNotEmpty(member.affectationStatus)) ? member.affectationStatus : "-";
                const lifeStatus = (UtilsNew.isNotEmpty(member.lifeStatus)) ? member.lifeStatus : "-";
                const dateOfBirth = UtilsNew.isNotEmpty(member.dateOfBirth) ? moment(member.dateOfBirth, "YYYYMMDD").format("YYYY") : "-";
                const creationDate = moment(member.creationDate, "YYYYMMDDHHmmss").format("D MMM YYYY");

                result += `<tr class="detail-view-row">
                                        ${tableCheckboxRow}
                                        <td>${member.id}</td>
                                        <td>${member.sex}</td>
                                        <td>${father}</td>
                                        <td>${mother}</td>
                                        <td>${affectation}</td>
                                        <td>${lifeStatus}</td>
                                        <td>${dateOfBirth}</td>
                                        <td>${creationDate}</td>
                                        <td>${member.status.name}</td>
                                   </tr>`;
            }
            result += "</tbody></table></diV>";
        } else {
            result += "No members found";
        }

        result += "</div></div>";
        return result;
    }

    membersFormatter(value, row) {
        if (UtilsNew.isNotEmptyArray(value)) {
            let members = "";
            for (const member of value) {
                members += `<div style="padding: 5px">
                                        <span>
                                            ${member.id} (${member.sex})
                                        </span>
                                    </div>`;
            }

            const html = `<div class="membersTooltip" data-tooltip-text='${members}' align="center">
                                    <a style="cursor: pointer">
                                        ${value.length} members found
                                    </a>
                                </div>
                    `;
            return html;
        } else {
            return "No members found";
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
                    phenotypeTooltipText += `<span><a target="_blank" href="https://hpo.jax.org/app/browse/term/${phenotype.id}">${phenotype.id} </a>(${phenotype.status})</span>
                                `;
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

    customAnnotationFormatter(value, row) {
        // debugger
    }

    dateFormatter(value, row) {
        if (UtilsNew.isUndefinedOrNull(value)) {
            return "-";
        }
        return moment(value, "YYYYMMDDHHmmss").format("D MMM YYYY");
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
                        title: "Family",
                        field: "id",
                        sortable: true,
                        halign: this._config.header.horizontalAlign
                    },
                    {
                        title: "Members",
                        field: "members",
                        formatter: this.membersFormatter.bind(this),
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
                    {
                        title: "Custom Annotations",
                        field: "customAnnotation",
                        formatter: this.customAnnotationFormatter,
                        visible: customAnnotationVisible,
                        halign: this._config.header.horizontalAlign
                    },
                    {
                        title: "Creation Date",
                        field: "creationDate",
                        formatter: this.dateFormatter,
                        sortable: true,
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
        //console.log(this.opencgaSession);
        const params = {
            ...this.query,
            study: this.opencgaSession.study.fqn,
            sid: this.opencgaSession.opencgaClient._config.sessionId,
            limit: 1000,
            skip: 0,
            includeIndividual: true,
            skipCount: true,
        };
        this.opencgaSession.opencgaClient.families().search(params)
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
                            ["Family", "Members", "Disorders", "Phenotypes", "Creation Date", "Status"].join("\t"),
                            ...result.map( _ => [
                                _.id,
                                _.members ? _.members.map( _ => `${_.id} (${_.sex})`).join(",") : "",
                                _.disorders ? _.disorders.map( _ => _.id).join(",") : "",
                                _.phenotypes ? _.phenotypes.map( _ => _.id).join(",") : "",
                                _.creationDate,
                                _.status.name
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

            .members-link-dropdown:hover .dropdown-menu {
                display: block;
            }

            .phenotypes-link-dropdown:hover .dropdown-menu {
                display: block;
            }
        </style>

        <opencb-grid-toolbar .from="${this.from}"
                             .to="${this.to}"
                             .numTotalResultsText="${this.numTotalResultsText}"
                             .config="${this.toolbarConfig}"
                             @columnchange="${this.onColumnChange}"
                             @download="${this.onDownload}">
        </opencb-grid-toolbar>

        <div id="${this._prefix}GridTableDiv" style="margin-top: 10px">
            <table id="${this._prefix}FamilyBrowserGrid">
                <thead style="background-color: #eee"></thead>
            </table>
        </div>
        `;
    }

}

customElements.define("opencga-family-grid", OpencgaFamilyGrid);

