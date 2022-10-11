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

import {LitElement, html} from "lit";
import UtilsNew from "../../core/utilsNew.js";
import GridCommons from "../commons/grid-commons.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter.js";
import CatalogWebUtils from "../commons/catalog-web-utils.js";
import LitUtils from "../commons/utils/lit-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import "../commons/opencb-grid-toolbar.js";


export default class IndividualGrid extends LitElement {

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
            individuals: {
                type: Array
            },
            config: {
                type: Object
            },
            active: {
                type: Boolean
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
        this.gridId = this._prefix + "IndividualBrowserGrid";
        this.catalogUiUtils = new CatalogWebUtils();
        this.active = true;
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
    }

    updated(changedProperties) {
        if ((changedProperties.has("opencgaSession") ||
            changedProperties.has("query") ||
            changedProperties.has("config") ||
            changedProperties.has("active")) &&
            this.active) {
            this.propertyObserver();
        }
    }

    propertyObserver() {
        // With each property change we must updated config and create the columns again. No extra checks are needed.
        this._config = {...this.getDefaultConfig(), ...this.config};
        // Config for the grid toolbar
        this.toolbarConfig = {
            ...this.config.toolbar,
            resource: "INDIVIDUAL",
            columns: this._getDefaultColumns()
        };
        this.renderTable();
    }

    renderTable() {
        // If this.individuals is provided as property we render the array directly
        if (this.individuals?.length > 0) {
            this.renderLocalTable();
        } else {
            this.renderRemoteTable();
        }
        this.requestUpdate();
    }

    renderRemoteTable() {
        if (this.opencgaSession.opencgaClient && this.opencgaSession?.study?.fqn) {
            const filters = {...this.query};
            if (UtilsNew.isNotUndefinedOrNull(this.lastFilters) &&
                JSON.stringify(this.lastFilters) === JSON.stringify(filters)) {
                // Abort destroying and creating again the grid. The filters have not changed
                return;
            }
            // Store the current filters
            this.lastFilters = {...filters};

            this.table = $("#" + this.gridId);
            this.table.bootstrapTable("destroy");
            this.table.bootstrapTable({
                columns: this._getDefaultColumns(),
                method: "get",
                sidePagination: "server",
                iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
                icons: GridCommons.GRID_ICONS,
                uniqueId: "id",
                silentSort: false,
                // Table properties
                pagination: this._config.pagination,
                pageSize: this._config.pageSize,
                pageList: this._config.pageList,
                paginationVAlign: "both",
                formatShowingRows: this.gridCommons.formatShowingRows,
                showExport: this._config.showExport,
                detailView: this._config.detailView,
                detailFormatter: this._config.detailFormatter,
                gridContext: this,
                formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
                ajax: params => {
                    const sort = this.table.bootstrapTable("getOptions").sortName ? {
                        sort: this.table.bootstrapTable("getOptions").sortName,
                        order: this.table.bootstrapTable("getOptions").sortOrder
                    } : {};
                    const _filters = {
                        study: this.opencgaSession.study.fqn,
                        limit: params.data.limit,
                        skip: params.data.offset || 0,
                        count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                        ...sort,
                        ...filters
                    };
                    // Store the current filters
                    this.lastFilters = {..._filters};
                    this.opencgaSession.opencgaClient.individuals().search(_filters)
                        .then(individualResponse => {
                            // Fetch Clinical Analysis ID per individual in 1 single query
                            const individualIds = individualResponse.getResults().map(individual => individual.id).filter(Boolean).join(",");
                            if (individualIds) {
                                this.opencgaSession.opencgaClient.clinical().search(
                                    {
                                        individual: individualIds,
                                        study: this.opencgaSession.study.fqn,
                                        include: "id,proband.id,family.members"
                                    })
                                    .then(caseResponse => {
                                        individualResponse.getResults().forEach(individual => {
                                            for (const clinicalAnalysis of caseResponse.getResults()) {
                                                if (clinicalAnalysis?.proband?.id === individual.id || clinicalAnalysis?.family?.members?.find(member => member.id === individual.id)) {
                                                    if (individual?.attributes?.OPENCGA_CLINICAL_ANALYSIS) {
                                                        individual.attributes.OPENCGA_CLINICAL_ANALYSIS.push(clinicalAnalysis);
                                                    } else {
                                                        individual.attributes = {
                                                            OPENCGA_CLINICAL_ANALYSIS: [clinicalAnalysis]
                                                        };
                                                    }
                                                }
                                            }
                                        });
                                        params.success(individualResponse);
                                    })
                                    .catch(e => {
                                        console.error(e);
                                        params.error(e);
                                    });
                            } else {
                                params.success(individualResponse);
                            }
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
                        if (element[0].innerHTML.includes("fa-plus")) {
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
                onPostBody: data => {
                    // Add tooltips
                }
            });
        }
    }

    renderLocalTable() {
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            columns: this._getDefaultColumns(),
            data: this.individuals,
            sidePagination: "local",
            iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
            icons: GridCommons.GRID_ICONS,
            // Set table properties, these are read from config property
            uniqueId: "id",
            pagination: this._config.pagination,
            pageSize: this._config.pageSize,
            pageList: this._config.pageList,
            showExport: this._config.showExport,
            detailView: this._config.detailView,
            detailFormatter: this.detailFormatter,
            gridContext: this,
            formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
            onClickRow: (row, selectedElement, field) => this.gridCommons.onClickRow(row.id, row, selectedElement),
            onPostBody: data => {
                // We call onLoadSuccess to select first row
                this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 1);
            }
        });
    }

    onColumnChange(e) {
        this.gridCommons.onColumnChange(e);
    }

    detailFormatter(value, row) {
        let result = `
            <div class='row' style="padding: 5px 10px 20px 10px">
                <div class='col-md-12'>
                    <h5 style="font-weight: bold">Samples</h5>
        `;

        if (UtilsNew.isNotEmptyArray(row.samples)) {
            let tableCheckboxHeader = "";

            if (this.gridContext._config && this.gridContext._config.multiSelection) {
                tableCheckboxHeader = "<th>Select</th>";
            }

            result += `
                <div style="width: 90%;padding-left: 20px">
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
                        <tbody>
            `;

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

                    tableCheckboxRow = `
                        <td>
                            <input id='${this.gridContext.prefix}${sample.id}Checkbox' type='checkbox' ${checkedStr}>
                        </td>
                    `;
                }

                const source = sample.source?.name || sample.source?.id || "-";
                const collectionMethod = sample.collection?.method || "-";
                const preparationMethod = sample.processing?.preparationMethod || "-";
                const cellLine = sample.somatic ? "Somatic" : "Germline";
                const creationDate = moment(sample.creationDate, "YYYYMMDDHHmmss").format("D MMM YYYY");

                result += `
                    <tr class="detail-view-row">
                        ${tableCheckboxRow}
                        <td>${sample.id}</td>
                        <td>${source}</td>
                        <td>${collectionMethod}</td>
                        <td>${preparationMethod}</td>
                        <td>${cellLine}</td>
                        <td>${creationDate}</td>
                        <td>${sample.status ? sample.status.name : ""}</td>
                    </tr>
                `;
            }
            result += "</tbody></table></diV>";
        } else {
            result += "No samples found";
        }

        result += "</div></div>";
        return result;
    }

    sexFormatter(value, row) {
        let sexHtml = `<span>${UtilsNew.isEmpty(row?.sex) ? "Not specified" : row.sex?.id || row.sex}</span>`;
        if (row.karyotypicSex) {
            sexHtml += ` (${row.karyotypicSex?.id || row.karyotypicSex})`;
        }
        return sexHtml;
    }

    ethnicityFormatter(value, row) {
        return row.ethnicity?.id || row.population?.name || "-";
    }

    fatherFormatter(value, row) {
        if (row.father?.id) {
            return row.father.id;
        } else {
            return "-";
        }
    }

    motherFormatter(value, row) {
        if (row.mother?.id) {
            return row.mother.id;
        } else {
            return "-";
        }
    }

    samplesFormatter(value, row) {
        if (value?.length) {
            return `
                <ul class="pad-left-15" style="padding-top:10px" >
                    ${value.map(sample => `<li>${sample.id}</li>`).join("")}
                </ul>
            `;
        } else {
            return "-";
        }
    }

    _getDefaultColumns() {
        let _columns = [
            {
                id: "id",
                title: "Individual",
                field: "id",
                sortable: true,
                halign: this._config.header.horizontalAlign
            },
            {
                id: "samples",
                title: "Samples",
                field: "samples",
                formatter: this.samplesFormatter,
                halign: this._config.header.horizontalAlign
            },
            {
                id: "father",
                title: "Father",
                field: "father.id",
                formatter: this.fatherFormatter,
                halign: this._config.header.horizontalAlign
            },
            {
                id: "mother",
                title: "Mother",
                field: "mother.id",
                formatter: this.motherFormatter,
                halign: this._config.header.horizontalAlign
            },
            {
                id: "disorders",
                title: "Disorders",
                field: "disorders",
                formatter: disorders => {
                    const result = disorders?.map(disorder => CatalogGridFormatter.disorderFormatter(disorder)).join("<br>");
                    return result ? result : "-";
                },
                halign: this._config.header.horizontalAlign
            },
            {
                id: "phenotypes",
                title: "Phenotypes",
                field: "phenotypes",
                formatter: CatalogGridFormatter.phenotypesFormatter,
                halign: this._config.header.horizontalAlign
            },
            {
                id: "caseId",
                title: "Case ID",
                field: "attributes.OPENCGA_CLINICAL_ANALYSIS",
                formatter: (value, row) => CatalogGridFormatter.caseFormatter(value, row, row.id, this.opencgaSession),
                halign: this._config.header.horizontalAlign
            },
            {
                id: "sex",
                title: "Sex (Karyotypic Sex)",
                field: "sex",
                formatter: this.sexFormatter,
                halign: this._config.header.horizontalAlign
            },
            {
                id: "ethnicity",
                title: "Ethnicity",
                field: "ethnicity",
                formatter: this.ethnicityFormatter,
                halign: this._config.header.horizontalAlign
            },
            {
                id: "dateOfBirth",
                title: "Date of Birth",
                field: "dateOfBirth",
                sortable: true,
                formatter: CatalogGridFormatter.dateFormatter,
                halign: this._config.header.horizontalAlign
            },
            {
                id: "creationDate",
                title: "Creation Date",
                field: "creationDate",
                sortable: true,
                formatter: CatalogGridFormatter.dateFormatter,
                halign: this._config.header.horizontalAlign
            }
        ];

        if (this._config.showSelectCheckbox) {
            _columns.push({
                id: "state",
                field: "state",
                checkbox: true,
                // formatter: this.stateFormatter,
                class: "cursor-pointer",
                eligible: false
            });
        }

        _columns = UtilsNew.mergeTable(_columns, this._config.columns || this._config.hiddenColumns, !!this._config.hiddenColumns);

        return _columns;
    }

    async onDownload(e) {
        this.toolbarConfig = {...this.toolbarConfig, downloading: true};
        this.requestUpdate();
        await this.updateComplete;
        const params = {
            study: this.opencgaSession.study.fqn,
            ...this.query,
            limit: e.detail?.exportLimit ?? 1000,
            skip: 0,
            count: false
        };

        this.opencgaSession.opencgaClient.individuals().search(params)
            .then(restResponse => {
                const results = restResponse.getResults();
                if (results) {
                    // Check if user clicked in Tab or JSON format
                    if (e.detail.option.toUpperCase() === "TAB") {
                        const fields = ["id", "samples.id", "father.id", "mother.id", "disorders.id", "phenotypes.id", "sex", "lifeStatus", "dateOfBirth", "creationDate"];
                        const data = UtilsNew.toTableString(results, fields);
                        UtilsNew.downloadData(data, "individuals_" + this.opencgaSession.study.id + ".tsv", "text/plain");
                    } else {
                        UtilsNew.downloadData(JSON.stringify(results, null, "\t"), "individuals_" + this.opencgaSession.study.id + ".json", "application/json");
                    }
                } else {
                    console.error("Error in result format");
                }
            })
            .catch(response => {
                // console.log(response);
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            })
            .finally(() => {
                this.toolbarConfig = {...this.toolbarConfig, downloading: false};
                this.requestUpdate();
            });
    }

    render() {
        return html`
            ${this._config.showToolbar ? html`
                <opencb-grid-toolbar
                    .config="${this.toolbarConfig}"
                    .query="${this.query}"
                    .opencgaSession="${this.opencgaSession}"
                    @columnChange="${this.onColumnChange}"
                    @download="${this.onDownload}"
                    @export="${this.onDownload}">
                </opencb-grid-toolbar>
            ` : ""}
            <div id="${this._prefix}GridTableDiv">
                <table id="${this._prefix}IndividualBrowserGrid"></table>
            </div>
        `;
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
            }
        };
    }

}

customElements.define("individual-grid", IndividualGrid);
