/**
 * Copyright 2015-2022 OpenCB
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
import UtilsNew from "../../core/utilsNew.js";
import GridCommons from "../commons/grid-commons.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import BioinfoUtils from "../../core/bioinfo/bioinfo-utils.js";
import "../commons/opencb-grid-toolbar.js";
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils";
import LitUtils from "../commons/utils/lit-utils.js";

export default class DiseasePanelGrid extends LitElement {

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
            diseasePanels: {
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
        this.gridId = this._prefix + "DiseasePanelBrowserGrid";
        this.active = true;
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig()};
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
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.toolbarConfig = {
            ...this.config?.toolbar,
            resource: "DISEASE_PANEL",
            buttons: ["columns", "download"],
            columns: this._getDefaultColumns()[0].filter(col => col.rowspan === 2 && col.colspan === 1 && col.visible !== false)
        };
        this.renderTable();
    }

    renderTable() {
        // If this.diseasePanel is provided as property we render the array directly
        if (this.diseasePanels && this.diseasePanels.length > 0) {
            this.renderLocalTable();
        } else {
            this.renderRemoteTable();
        }
        this.requestUpdate();
    }

    renderRemoteTable() {
        if (this.opencgaSession.opencgaClient && this.opencgaSession?.study?.fqn) {
            const filters = {...this.query};
            // TODO fix and replicate this in all browsers (the current filter is not "filters", it is actually built in the ajax() function in bootstrapTable)
            if (UtilsNew.isNotUndefinedOrNull(this.lastFilters) &&
                JSON.stringify(this.lastFilters) === JSON.stringify(filters)) {
                // Abort destroying and creating again the grid. The filters have not changed
                return;
            }

            this.table = $("#" + this.gridId);
            this.table.bootstrapTable("destroy");
            this.table.bootstrapTable({
                columns: this._getDefaultColumns(),
                method: "get",
                sidePagination: "server",
                iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
                icons: GridCommons.GRID_ICONS,

                // Table properties
                uniqueId: "id",
                pagination: this._config.pagination,
                pageSize: this._config.pageSize,
                pageList: this._config.pageList,
                paginationVAlign: "both",
                formatShowingRows: this.gridCommons.formatShowingRows,
                showExport: this._config.showExport,
                detailView: this._config.detailView,
                detailFormatter: this._config.detailFormatter,
                gridContext: this,
                formatLoadingMessage: () => String.raw`<div><loading-spinner></loading-spinner></div>`,
                ajax: async params => {
                    const _filters = {
                        study: this.opencgaSession.study.fqn,
                        limit: params.data.limit,
                        skip: params.data.offset || 0,
                        count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                        ...filters
                    };
                    // Store the current filters
                    this.lastFilters = {..._filters};
                    try {
                        const data = await this.fetchDiseasePanels(_filters);
                        params.success(data);
                    } catch (e) {
                        console.log(e);
                        params.error(e);
                    }

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
            });
        }
    }

    async fetchDiseasePanels(query) {
        try {
            return await this.opencgaSession.opencgaClient.panels().search(query);
        } catch (e) {
            console.error(e);
            await Promise.reject(e);
        }
    }

    renderLocalTable() {
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            columns: this._getDefaultColumns(),
            data: this.diseasePanels,
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
            formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
            onClickRow: (row, selectedElement, field) => this.gridCommons.onClickRow(row.id, row, selectedElement),
            onPageChange: (page, size) => {
                const result = this.gridCommons.onPageChange(page, size);
                this.from = result.from || this.from;
                this.to = result.to || this.to;
            },
            onPostBody: data => {
                // We call onLoadSuccess to select first row
                this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 1);
            }
        });
    }

    onColumnChange(e) {
        this.gridCommons.onColumnChange(e);
    }

    onActionClick(e, _, row) {
        const {action} = e.currentTarget.dataset;

        if (action === "download") {
            UtilsNew.downloadData([JSON.stringify(row, null, "\t")], row.id + ".json");
        }

        if (action === "copy") {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
                title: `Copy Disease Panel '${row.id}'`,
                message: `Are you sure you want to delete the disease panel <b>'${row.id}'</b>?`,
                display: {
                    okButtonText: "Yes, copy it",
                },
                ok: () => {
                    const copy = JSON.parse(JSON.stringify(row));
                    copy.id = row.id + "-Copy";
                    copy.name = "Copy of " + row.name;
                    // Delete managed fields
                    delete copy.uuid;
                    delete copy.creationDate; // FIXME remove this line
                    delete copy.modificationDate; // FIXME remove this line
                    delete copy.internal;
                    delete copy.release;
                    delete copy.version;
                    delete copy.status;
                    this.opencgaSession.opencgaClient.panels().create(copy, {
                        study: this.opencgaSession.study.fqn,
                    }).then(response => {
                        if (response.getResultEvents("ERROR").length) {
                            return NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                        }
                        // Display confirmation message and update the table
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                            message: `Case '${copy.id}' has been copied.`,
                        });
                        LitUtils.dispatchCustomEvent(this, "rowUpdate", row);
                        this.renderTable();
                    }).catch(response => {
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                    });
                },
            });
        }

        if (action === "edit") {
            console.error("Not implemented yet");
        }

        if (action === "delete") {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
                title: `Delete Disease Panel '${row.id}'`,
                message: `Are you sure you want to delete the disease panel <b>'${row.id}'</b>?`,
                display: {
                    okButtonText: "Yes, delete it",
                },
                ok: () => {
                    const diseasePanelId = row.id;
                    this.opencgaSession.opencgaClient.panels().delete(diseasePanelId, {
                        study: this.opencgaSession.study.fqn,
                    }).then(response => {
                        if (response.getResultEvents("ERROR").length) {
                            return NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                        }
                        // Display confirmation message and update the table
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                            message: `Case '${diseasePanelId}' has been deleted.`,
                        });
                        LitUtils.dispatchCustomEvent(this, "rowUpdate", row);
                        this.renderTable();
                    }).catch(response => {
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                    });
                },
            });
        }

    }

    _getDefaultColumns() {
        let _columns = [
            [
                {
                    id: "id",
                    title: "Panel ID",
                    field: "id",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => {
                        if (row?.source && row?.source?.project === "PanelApp") {
                            return String.raw`
                            <a href="${BioinfoUtils.getPanelAppLink(row?.source?.id)}" title="Panel ID: ${row?.id}" target="_blank">
                                ${row?.id ?? "-"} <i class="fas fa-external-link-alt" style="padding-left: 5px"></i>
                            </a>`;
                        }
                        return row?.id ?? "-";
                    },
                    halign: this._config.header.horizontalAlign
                },
                {
                    id: "name",
                    title: "Name",
                    field: "name",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => row?.name ?? "-",
                    halign: this._config.header.horizontalAlign
                },
                {
                    id: "disorders",
                    title: "Disorders",
                    field: "disorders",
                    rowspan: 2,
                    colspan: 1,
                    formatter: disorders => {
                        if (disorders?.length > 0) {
                            const disordersHtml = [];
                            for (const disorder of disorders) {
                                let result = disorder.id;
                                if (disorder.name) {
                                    result += " - " + disorder.name;
                                }
                                disordersHtml.push(`<div style="margin: 5px 0">${result}</div>`);
                            }
                            return disordersHtml.join("");
                        }
                    },
                    halign: this._config.header.horizontalAlign
                },
                {
                    id: "stats",
                    title: "Stats",
                    field: "stats",
                    rowspan: 1,
                    colspan: 3,
                    align: "center",
                },
                {
                    id: "source",
                    title: "Source",
                    field: "source",
                    rowspan: 2,
                    colspan: 1,
                    formatter: (value, row) => {
                        if (row?.source) {
                            const {id, author, project, version} = row.source;
                            let projectAndVersion = "";
                            if (project?.toUpperCase() === "PANELAPP") {
                                projectAndVersion = `
                            <a href="https://panelapp.genomicsengland.co.uk/api/v1/panels/${id}/?version=${version}" target="_blank">
                                ${project} ${version} <i class="fas fa-external-link-alt" style="padding-left: 5px"></i>
                            </a>`;
                            } else {
                                projectAndVersion = `${project || ""} ${version}`;
                            }
                            return `${author ? `${author} -` : ""} ${projectAndVersion}`;
                        }
                        return "-";
                    },
                    align: "center",
                },
            ],
            [
                {
                    id: "numberOfGenes",
                    title: "# genes",
                    field: "numberOfGenes",
                    rowspan: 1,
                    colspan: 1,
                    formatter: (value, row) => row?.stats?.numberOfGenes ?? "-",
                    halign: this._config.header.horizontalAlign,
                    align: "right",
                },
                {
                    id: "numberOfRegions",
                    title: "# regions",
                    field: "numberOfRegions",
                    rowspan: 1,
                    colspan: 1,
                    formatter: (value, row) => row?.stats?.numberOfRegions ?? "-",
                    halign: this._config.header.horizontalAlign,
                    align: "right",
                },
                {
                    id: "numberOfVariants",
                    title: "# variants",
                    field: "numberOfVariants",
                    rowspan: 1,
                    colspan: 1,
                    formatter: (value, row) => row?.stats?.numberOfVariants ?? "-",
                    halign: this._config.header.horizontalAlign,
                    align: "right",
                }
            ]
        ];

        if (this.opencgaSession && this._config.showActions) {
            _columns[0].push({
                id: "actions",
                title: "Actions",
                halign: this._config.header.horizontalAlign,
                rowspan: 2,
                colspan: 1,
                formatter: (value, row) => `
                    <div class="dropdown" style="display: flex; justify-content: center;">
                            <button class="btn btn-default btn-sm dropdown-toggle" type="button" data-toggle="dropdown">
                                <i class="fas fa-toolbox icon-padding" aria-hidden="true"></i>
                                <span>Actions</span>
                                <span class="caret" style="margin-left: 5px"></span>
                            </button>
                        <ul class="dropdown-menu dropdown-menu-right">
                            <li>
                                <a data-action="download" href="javascript: void 0" class="btn force-text-left">
                                    <i class="fas fa-download icon-padding" aria-hidden="true"></i> Download
                                </a>
                            </li>
                            <li role="separator" class="divider"></li>
                            <li>
                                <a data-action="copy" href="javascript: void 0" class="btn force-text-left ${OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user.id) || "disabled" }">
                                    <i class="fas fa-user icon-padding" aria-hidden="true"></i> Copy
                                </a>
                            </li>
                            <li role="separator" class="divider"></li>
                            <li>
                                <a data-action="edit" class="btn force-text-left ${OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user.id) || "disabled" }"
                                    href='#diseasePanelUpdate/${this.opencgaSession.project.id}/${this.opencgaSession.study.id}/${row.id}'>
                                    <i class="fas fa-edit icon-padding" aria-hidden="true"></i> Edit
                                </a>
                            </li>
                            <li>
                                <a data-action="delete" href="javascript: void 0" class="btn force-text-left ${OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user.id) || "disabled" }">
                                    <i class="fas fa-trash icon-padding" aria-hidden="true"></i> Delete
                                </a>
                            </li>
                        </ul>
                    </div>`,
                events: {
                    "click a": this.onActionClick.bind(this)
                },
                visible: !this._config.columns?.hidden?.includes("actions")
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
            count: false,
        };

        this.opencgaSession.opencgaClient.panels().search(params)
            .then(response => {
                const results = response.getResults();
                if (results) {
                    // Check if user clicked in Tab or JSON format
                    if (e.detail.option.toUpperCase() === "TAB") {
                        const fields = ["id", "name", "stats.numberOfGenes", "stats.numberOfRegions", "stats.numberOfVariants", "source.author", "source.project", "source.version"];
                        const data = UtilsNew.toTableString(results, fields);
                        UtilsNew.downloadData(data, UtilsNew.generateFileNameDownload("disease_panel", this.opencgaSession, ".tsv"), "text/plain");
                    } else {
                        UtilsNew.downloadData(JSON.stringify(results, null, "\t"), UtilsNew.generateFileNameDownload("disease_panel", this.opencgaSession, ".json"), "application/json");
                    }
                } else {
                    console.error("Error in result format");
                }
            })
            .catch(response => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            })
            .finally(() => {
                this.toolbarConfig = {...this.toolbarConfig, downloading: false};
                this.requestUpdate();
            });
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
            showActions: true
        };
    }

    render() {
        return html`
            ${this._config.showToolbar ?
                html`
                    <opencb-grid-toolbar
                        .config="${this.toolbarConfig}"
                        .query="${this.query}"
                        .opencgaSession="${this.opencgaSession}"
                        @columnChange="${this.onColumnChange}"
                        @download="${this.onDownload}"
                        @export="${this.onDownload}">
                    </opencb-grid-toolbar>` : nothing
            }

            <div id="${this._prefix}GridTableDiv" class="force-overflow">
                <table id="${this._prefix}DiseasePanelBrowserGrid"></table>
            </div>
        `;
    }

}

customElements.define("disease-panel-grid", DiseasePanelGrid);
