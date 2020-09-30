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
import UtilsNew from "../../utilsNew.js";
import GridCommons from "../variant/grid-commons.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter.js";
import CatalogUtils from "../commons/catalog-utils.js";
import "./opencga-family-filter.js";
import "../commons/opencb-grid-toolbar.js";


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
            query: {
                type: Object
            },
            families: {
                type: Array
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
        this._prefix = "VarFamilyGrid" + UtilsNew.randomString(6);

        this.catalogUiUtils = new CatalogUtils();
        this.active = true;
        this.gridId = this._prefix + "FamilyBrowserGrid";
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession") ||
            changedProperties.has("query") ||
            changedProperties.has("config") ||
            changedProperties.has("active")) {
            this.propertyObserver();
        }
    }

    firstUpdated(_changedProperties) {
        this.table = $("#" + this.gridId);
    }

    propertyObserver() {
        // With each property change we must updated config and create the columns again. No extra checks are needed.
        this._config = {...this.getDefaultConfig(), ...this.config};

        this.catalogGridFormatter = new CatalogGridFormatter(this.opencgaSession);

        // Config for the grid toolbar
        this.toolbarConfig = {
            columns: this._getDefaultColumns()
        };
        this.renderTable();
    }

    renderTable() {
        // If this.individuals is provided as property we render the array directly
        if (this.families && this.families.length > 0) {
            this.renderLocalTable();
        } else {
            this.renderRemoteTable();
        }
    }

    renderRemoteTable() {
        if (this.opencgaSession.opencgaClient && this.opencgaSession.study && this.opencgaSession.study.fqn) {
            this.table = $("#" + this.gridId);
            this.table.bootstrapTable("destroy");
            this.table.bootstrapTable({
                columns: this._getDefaultColumns(),
                method: "get",
                sidePagination: "server",
                uniqueId: "id",

                // Table properties
                pagination: this._config.pagination,
                pageSize: this._config.pageSize,
                pageList: this._config.pageList,
                paginationVAlign: "both",
                formatShowingRows: this.gridCommons.formatShowingRows,
                showExport: this._config.showExport,
                detailView: this._config.detailView,
                detailFormatter: this._config.detailFormatter,

                // Make Polymer components available to table formatters
                gridContext: this,
                formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",

                ajax: params => {
                    const _filters = {
                        study: this.opencgaSession.study.fqn,
                        limit: params.data.limit,
                        skip: params.data.offset || 0,
                        count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                        ...this.query
                    };
                    this.opencgaSession.opencgaClient.families().search(_filters)
                        .then(familyResponse => {
                            // Fetch Clinical Analysis ID per Family in 1 single query
                            let familyIds = familyResponse.responses[0].results.map(family => family.id).join(",");
                            this.opencgaSession.opencgaClient.clinical().search(
                                {
                                    family: familyIds,
                                    study: this.opencgaSession.study.fqn,
                                    exclude: "proband.samples,family.members,interpretation,files"
                                })
                                .then(caseResponse => {
                                    // We store the Case ID in the individual attribute
                                    // Note clinical search results are not sorted
                                    // FIXME at the moment we only search by proband
                                    let map = {};
                                    for (let clinicalAnalysis of caseResponse.responses[0].results) {
                                        if (!map[clinicalAnalysis.family.id]) {
                                            map[clinicalAnalysis.family.id] = [];
                                        }
                                        map[clinicalAnalysis.family.id].push(clinicalAnalysis);
                                    }
                                    for (let family of familyResponse.responses[0].results) {
                                        family.attributes.OPENCGA_CLINICAL_ANALYSIS = map[family.id];
                                    }
                                    params.success(familyResponse);
                                })
                                .catch(e => {
                                    console.error(e);
                                    params.error(e);
                                });
                        })
                        .catch(e => {
                            console.error(e);
                            params.error(e);
                        });
                },
                responseHandler: response => {
                    const result = this.gridCommons.responseHandler(response, $(this.table).bootstrapTable("getOptions"));
                    return result.response;
                },
                onClickRow: (row, selectedElement, field) => this.gridCommons.onClickRow(row.id, row, selectedElement),
                onDblClickRow: (row, element, field) => {
                    // We detail view is active we expand the row automatically.
                    // FIXME: Note that we use a CSS class way of knowing if the row is expand or collapse, this is not ideal but works.
                    if (this._config.detailView) {
                        if (element[0].innerHTML.includes("icon-plus")) {
                            this.table.bootstrapTable("expandRow", element[0].dataset.index);
                        } else {
                            this.table.bootstrapTable("collapseRow", element[0].dataset.index);
                        }
                    }
                },
                onCheck: (row, $element) => {
                    this.gridCommons.onCheck(row.id, row);
                },
                onCheckAll: rows => {
                    this.gridCommons.onCheckAll(rows);
                },
                onUncheck: (row, $element) => {
                    this.gridCommons.onUncheck(row.id, row);
                },
                onUncheckAll: rows => {
                    this.gridCommons.onUncheckAll(rows);
                },
                onLoadSuccess: data => {
                    this.gridCommons.onLoadSuccess(data, 1);
                },
                onLoadError: (e, restResponse) => this.gridCommons.onLoadError(e, restResponse),
                onPostBody: (data) => {
                    // Add tooltips
                    this.catalogUiUtils.addTooltip("div.phenotypesTooltip", "Phenotypes");
                    this.catalogUiUtils.addTooltip("div.membersTooltip", "Members");
                }
            });
        }
    }

    renderLocalTable() {
        this.from = 1;
        this.to = Math.min(this.individuals.length, this._config.pageSize);
        this.numTotalResultsText = this.individuals.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            columns: this._getDefaultColumns(),
            data: this.families,
            sidePagination: "local",

            // Set table properties, these are read from config property
            uniqueId: "id",
            pagination: this._config.pagination,
            pageSize: this._config.pageSize,
            pageList: this._config.pageList,
            showExport: this._config.showExport,
            detailView: this._config.detailView,
            detailFormatter: this.detailFormatter,
            formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",

            onClickRow: (row, selectedElement, field) => this.gridCommons.onClickRow(row.id, row, selectedElement),
            onPageChange: (page, size) => {
                const result = this.gridCommons.onPageChange(page, size);
                this.from = result.from || this.from;
                this.to = result.to || this.to;
            },
            onPostBody: (data) => {
                // We call onLoadSuccess to select first row
                this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 1);
            }
        });
    }

    onColumnChange(e) {
        this.gridCommons.onColumnChange(e);
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
                                        <td>${member?.status?.name || "-"}</td>
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
            const members = value.map(member => `<p>${member.id} (${member.sex})</p>`).join("");
            return `<a tooltip-title="Members" tooltip-text="${members}"> ${value.length} members found </a>`;
        } else {
            return "No members found";
        }
    }

    customAnnotationFormatter(value, row) {
        // debugger
    }

    _getDefaultColumns() {
        // Check column visibility
        const customAnnotationVisible = (UtilsNew.isNotUndefinedOrNull(this._config.customAnnotations) &&
            UtilsNew.isNotEmptyArray(this._config.customAnnotations.fields));

        let _columns = [
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
                formatter: disorders => disorders.map(disorder => this.catalogGridFormatter.disorderFormatter(disorder)).join("<br>"),
                halign: this._config.header.horizontalAlign
            },
            {
                title: "Phenotypes",
                field: "phenotypes",
                formatter: this.catalogGridFormatter.phenotypesFormatter,
                halign: this._config.header.horizontalAlign
            },
            {
                title: "Case ID",
                field: "attributes.OPENCGA_CLINICAL_ANALYSIS",
                formatter: (value, row) => this.catalogGridFormatter.caseFormatter(value, row, row.id, this.opencgaSession),
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
                formatter: this.catalogGridFormatter.dateFormatter,
                sortable: true,
                halign: this._config.header.horizontalAlign,
                visible: application.appConfig === "opencb"
            },
        ];

        if (this._config.showSelectCheckbox) {
            _columns.push({
                field: "state",
                checkbox: true,
                // formatter: this.stateFormatter,
                class: "cursor-pointer",
                eligible: false
            });
        }

        return _columns;
    }

    onDownload(e) {
        const params = {
            ...this.query,
            study: this.opencgaSession.study.fqn,
            limit: 1000,
            skip: 0,
            count: false
        };
        this.opencgaSession.opencgaClient.families().search(params)
            .then(response => {
                const results = response.responses[0].results;
                if (results) {
                    // Check if user clicked in Tab or JSON format
                    if (e.detail.option.toUpperCase() === "TAB") {
                        let fields = ["id", "members.id", "disorders.id", "phenotypes.id", "creationDate"];
                        let data = UtilsNew.toTableString(results, fields);
                        UtilsNew.downloadData(data, "families_" + this.opencgaSession.study.id + ".txt", "text/plain");
                    } else {
                        let json = results.map(res => JSON.stringify(res, null, "\t"));
                        UtilsNew.downloadData(json, this.opencgaSession.study.id + ".json", "application/json");
                    }
                } else {
                    console.error("Error in result format");
                }
            })
            .catch(e => {
                console.error(e);
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
            showSelectCheckbox: true,
            showToolbar: true,
            header: {
                horizontalAlign: "center",
                verticalAlign: "bottom"
            },
            disorderSources: ["ICD", "ICD10", "GelDisorder"],
            customAnnotations: {
                title: "Custom Annotation",
                fields: []
            },
            style: "font-size: 14px"
        };
    }

    render() {
        return html`
            ${this._config.showToolbar
                ? html`
                    <opencb-grid-toolbar    .config="${this.toolbarConfig}"
                                            @download="${this.onDownload}"
                                            @columnChange="${this.onColumnChange}">
                    </opencb-grid-toolbar>`
                : null
            }
            <div id="${this._prefix}GridTableDiv">
                <table id="${this._prefix}FamilyBrowserGrid"></table>
            </div>
        `;
    }

}

customElements.define("opencga-family-grid", OpencgaFamilyGrid);
