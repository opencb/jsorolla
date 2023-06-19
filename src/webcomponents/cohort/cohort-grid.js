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
import UtilsNew from "../../core/utils-new.js";
import GridCommons from "../commons/grid-commons.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter.js";
import PolymerUtils from "../PolymerUtils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";


export default class CohortGrid extends LitElement {

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
            active: {
                type: Boolean
            },
            config: {
                type: Object
            },
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
        this.gridId = this._prefix + "CohortBrowserGrid";
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
        // super.update(changedProperties);
    }

    propertyObserver() {
        // With each property change we must update config and create the columns again. No extra checks are needed.
        this._config = {...this.getDefaultConfig(), ...this.config};
        // Config for the grid toolbar
        this.toolbarConfig = {
            ...this.config.toolbar,
            resource: "COHORT",
            columns: this._getDefaultColumns()
        };

        this.renderTable(this.active);
    }

    renderTable(active) {
        if (!active) {
            return;
        }

        this.cohorts = [];
        if (this.opencgaSession?.opencgaClient && this.opencgaSession?.study?.fqn) {
            const filters = {...this.query};

            // Make a copy of the cohorts (if they exist), we will use this private copy until it is assigned to this.cohorts
            if (UtilsNew.isNotUndefined(this.cohorts)) {
                this._cohorts = this.cohorts;
            } else {
                this._cohorts = [];
            }

            this.table = $("#" + this.gridId);
            this.table.bootstrapTable("destroy");
            this.table.bootstrapTable({
                theadClasses: "table-light",
                buttonsClass: "btn btn-light",
                columns: this._getDefaultColumns(),
                method: "get",
                sidePagination: "server",
                iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
                icons: GridCommons.GRID_ICONS,
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
                        include: "id,creationDate,status,type,numSamples",
                        ...filters
                    };
                    this.opencgaSession.opencgaClient.cohorts()
                        .search(_filters)
                        .then(res => params.success(res))
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
                            $(PolymerUtils.getElementById(this._prefix + "CohortBrowserGrid")).bootstrapTable("expandRow", element[0].dataset.index);
                        } else {
                            $(PolymerUtils.getElementById(this._prefix + "CohortBrowserGrid")).bootstrapTable("collapseRow", element[0].dataset.index);
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
                onLoadError: (e, restResponse) => this.gridCommons.onLoadError(e, restResponse)
            });
        }
        this.requestUpdate();
    }

    onColumnChange(e) {
        this.gridCommons.onColumnChange(e);
    }

    _getDefaultColumns() {
        const customAnnotationVisible = (UtilsNew.isNotUndefinedOrNull(this._config.customAnnotations) &&
            UtilsNew.isNotEmptyArray(this._config.customAnnotations.fields));

        let _columns = [
            {
                id: "id",
                title: "Cohort",
                field: "id",
                halign: this._config.header.horizontalAlign
            },
            {
                id: "numSamples",
                title: "#Samples",
                field: "numSamples",
                // formatter: (value, row) => row.numSamples ?? 0,
                halign: this._config.header.horizontalAlign
            },
            {
                id: "creationDate",
                title: "Date",
                field: "creationDate",
                formatter: CatalogGridFormatter.dateFormatter,
                halign: this._config.header.horizontalAlign
            },
            {
                id: "type",
                title: "Type",
                field: "type",
                halign: this._config.header.horizontalAlign
            }
        ];

        if (this._config.multiSelection) {
            _columns.unshift({
                field: "state",
                checkbox: true,
                class: "cursor-pointer",
                eligible: false
            });
        }

        _columns = UtilsNew.mergeTable(_columns, this._config.columns || this._config.hiddenColumns, !!this._config.hiddenColumns);

        return _columns;
    }

    async onDownload(e) {
        this.toolbarConfig = {
            ...this.toolbarConfig,
            downloading: true
        };
        this.requestUpdate();
        await this.updateComplete;
        const params = {
            ...this.query,
            study: this.opencgaSession.study.fqn,
            limit: e.detail?.exportLimit ?? 1000,
            includeIndividual: true,
            skipCount: true,
            include: "id,creationDate,status,type,samples"
        };
        this.opencgaSession.opencgaClient.cohorts()
            .search(params)
            .then(response => {
                const results = response.getResults();
                if (results) {
                    // Check if user clicked in Tab or JSON format
                    if (e.detail.option.toUpperCase() === "TAB") {
                        const dataString = [
                            ["Cohort", "#Samples", "Date", "Status", "Type"].join("\t"),
                            ...results.map(_ => [
                                _.id,
                                _.samples ? _.samples.map(_ => `${_.id}`).join(",") : "",
                                _.creationDate ? CatalogGridFormatter.dateFormatter(_.creationDate) : "-",
                                _.status.name,
                                _.type
                            ].join("\t"))];
                        UtilsNew.downloadData(dataString, "cohort_" + this.opencgaSession.study.id + ".tsv", "text/plain");
                    } else {
                        UtilsNew.downloadData(JSON.stringify(results, null, "\t"), "cohort_" + this.opencgaSession.study.id + ".json", "application/json");
                    }
                } else {
                    console.error("Error in result format");
                }
            })
            .catch(response => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            })
            .finally(() => {
                this.toolbarConfig = {
                    ...this.toolbarConfig,
                    downloading: false
                };
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
                <table id="${this._prefix}CohortBrowserGrid"></table>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 10,
            pageList: [10, 25, 50],
            showExport: false,
            detailView: false,
            detailFormatter: null, // function with the detail formatter
            multiSelection: false,
            showToolbar: true,
            header: {
                horizontalAlign: "center",
                verticalAlign: "bottom"
            },
            customAnnotations: {
                title: "Custom Annotation",
                fields: []
            },
            // It comes from external settings, and it is used in _getDefaultColumns()
            // columns: []
        };
    }

}

customElements.define("cohort-grid", CohortGrid);
