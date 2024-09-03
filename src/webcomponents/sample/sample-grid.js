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

import {html, LitElement, nothing} from "lit";
import UtilsNew from "../../core/utils-new.js";
import GridCommons from "../commons/grid-commons.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter.js";
import "../commons/opencb-grid-toolbar.js";
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import "./sample-update.js";
import ModalUtils from "../commons/modal/modal-utils.js";
import WebUtils from "../commons/utils/web-utils.js";


export default class SampleGrid extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            toolId: {
                type: String,
            },
            opencgaSession: {
                type: Object
            },
            query: {
                type: Object
            },
            samples: {
                type: Array
            },
            active: {
                type: Boolean
            },
            config: {
                type: Object
            },
        };
    }

    #init() {
        this.COMPONENT_ID = "sample-grid";
        this._prefix = UtilsNew.randomString(8);
        this.gridId = this._prefix + this.COMPONENT_ID;
        this.active = true;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession") ||
            changedProperties.has("toolId") ||
            changedProperties.has("query") ||
            changedProperties.has("config")) {
            this.propertyObserver();
        }
        super.update(changedProperties);
    }

    updated(changedProperties) {
        if (changedProperties.size > 0 && this.active) {
            this.renderTable();
        }
    }

    propertyObserver() {
        // With each property change we must be updated config and create the columns again. No extra checks are needed.
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };

        this.gridCommons = new GridCommons(this.gridId, this, this._config);

        // Config for the grid toolbar
        this.toolbarSetting = {
            ...this._config,
        };

        this.toolbarConfig = {
            toolId: this.toolId,
            resource: "SAMPLE",
            columns: this._getDefaultColumns(),
            create: {
                display: {
                    modalTitle: "Sample Create",
                    modalDraggable: true,
                    modalCyDataName: "modal-create",
                    // disabled: true,
                    // disabledTooltip: "...",
                },
                render: () => html `
                    <sample-create
                        .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                        .opencgaSession="${this.opencgaSession}">
                    </sample-create>
                `,
            },

            // Uncomment in case we need to change defaults
            // export: {
            //     display: {
            //         modalTitle: "Sample Export",
            //     },
            //     render: () => html`
            //         <opencga-export
            //             .config="${this._config}"
            //             .query=${this.query}
            //             .opencgaSession="${this.opencgaSession}"
            //             @export="${this.onExport}"
            //             @changeExportField="${this.onChangeExportField}">
            //         </opencga-export>`
            // },
            // settings: {
            //     display: {
            //         modalTitle: "Sample Settings",
            //     },
            //     render: () => html `
            //         <catalog-browser-grid-config
            //             .opencgaSession="${this.opencgaSession}"
            //             .gridColumns="${this._columns}"
            //             .config="${this._config}"
            //             @configChange="${this.onGridConfigChange}">
            //         </catalog-browser-grid-config>`
            // }
        };

        this.permissionID = WebUtils.getPermissionID(this.toolbarConfig.resource, "WRITE");
    }

    renderTable() {
        // If this.samples is provided as property we render the array directly
        if (this.samples?.length > 0) {
            this.renderLocalTable();
        } else {
            this.renderRemoteTable();
        }
    }

    renderRemoteTable() {
        if (this.opencgaSession?.opencgaClient && this.opencgaSession?.study?.fqn) {
            if (this.lastFilters && JSON.stringify(this.lastFilters) === JSON.stringify(this.query)) {
                // Abort destroying and creating again the grid. The filters have not changed
                return;
            }
            this._columns = this._getDefaultColumns();
            this.table = $("#" + this.gridId);
            this.table.bootstrapTable("destroy");
            this.table.bootstrapTable({
                columns: this._columns,
                method: "get",
                sidePagination: "server",
                iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
                icons: GridCommons.GRID_ICONS,
                uniqueId: "id",
                pagination: this._config.pagination,
                pageSize: this._config.pageSize,
                pageList: this._config.pageList,
                paginationVAlign: "both",
                formatShowingRows: this.gridCommons.formatShowingRows,
                detailView: !!this.detailFormatter,
                gridContext: this,
                formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
                ajax: params => {
                    this.filters = {
                        study: this.opencgaSession.study.fqn,
                        limit: params.data.limit,
                        skip: params.data.offset || 0,
                        count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                        // exclude: "qualityControl",
                        ...this.query
                    };

                    // Calculate the number of cases to fetch
                    const casesLimit = this.table?.bootstrapTable("getOptions")?.pageSize || this._config.pageSize || 10;

                    // Store the current filters
                    this.lastFilters = {...this.filters};
                    this.opencgaSession.opencgaClient.samples()
                        .search(this.filters)
                        .then(sampleResponse => {
                            // Fetch clinical analysis to display the Case ID
                            const individualIds = sampleResponse.getResults()
                                .map(sample => sample.individualId)
                                .filter(Boolean)
                                .join(",");

                            if (individualIds) {
                                this.opencgaSession.opencgaClient
                                    .clinical()
                                    .search(
                                        {
                                            individual: individualIds,
                                            study: this.opencgaSession.study.fqn,
                                            include: "id,proband.id,family.members",
                                            limit: casesLimit * 10
                                        })
                                    .then(caseResponse => {
                                        sampleResponse.getResults().forEach(sample => {
                                            for (const clinicalAnalysis of caseResponse.getResults()) {
                                                if (clinicalAnalysis?.proband?.id === sample.individualId || clinicalAnalysis?.family?.members?.find(member => member.id === sample.individualId)) {
                                                    if (sample?.attributes?.OPENCGA_CLINICAL_ANALYSIS) {
                                                        sample.attributes.OPENCGA_CLINICAL_ANALYSIS.push(clinicalAnalysis);
                                                    } else {
                                                        // eslint-disable-next-line no-param-reassign
                                                        sample.attributes = {
                                                            OPENCGA_CLINICAL_ANALYSIS: [clinicalAnalysis]
                                                        };
                                                    }
                                                }
                                            }
                                        });
                                        params.success(sampleResponse);
                                    })
                                    .catch(e => {
                                        console.error(e);
                                        params.error(e);
                                    });
                            } else {
                                params.success(sampleResponse);
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
                onClickRow: (row, selectedElement) => this.gridCommons.onClickRow(row.id, row, selectedElement),
                onDblClickRow: (row, element) => {
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
                onCheck: row => {
                    this.gridCommons.onCheck(row.id, row);
                },
                onCheckAll: rows => {
                    this.gridCommons.onCheckAll(rows);
                },
                onUncheck: row => {
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

    renderLocalTable() {
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            columns: this._getDefaultColumns(),
            data: this.samples,
            sidePagination: "local",
            iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
            icons: GridCommons.GRID_ICONS,
            uniqueId: "id",
            pagination: this._config.pagination,
            pageSize: this._config.pageSize,
            pageList: this._config.pageList,
            detailView: this._config.detailView,
            gridContext: this,
            formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
            onClickRow: (row, selectedElement) => this.gridCommons.onClickRow(row.id, row, selectedElement),
            onPostBody: data => {
                // We call onLoadSuccess to select first row
                this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 1);
            }
        });
    }

    onColumnChange(e) {
        this.gridCommons.onColumnChange(e);
    }

    async onActionClick(e, _, row) {
        const action = e.target.dataset.action?.toLowerCase() || e.detail.action;
        switch (action) {
            case "edit":
                this.sampleUpdateId = row.id;
                this.requestUpdate();
                await this.updateComplete;
                ModalUtils.show(`${this._prefix}UpdateModal`);
                break;
            case "copy-json":
                UtilsNew.copyToClipboard(JSON.stringify(row, null, "\t"));
                break;
            case "download-json":
                UtilsNew.downloadData([JSON.stringify(row, null, "\t")], row.id + ".json");
                break;
            case "qualityControl":
                alert("Not implemented yet");
                break;
        }
    }

    _getDefaultColumns() {
        this._columns = [
            {
                id: "id",
                title: "Sample ID",
                field: "id",
                formatter: (sampleId, sample) => {
                    let somaticHtml = "";
                    if (typeof sample.somatic !== "undefined") {
                        somaticHtml = sample.somatic ? "Somatic" : "Germline";
                    }
                    return `
                        <div>
                            <span style="font-weight: bold; margin: 5px 0">${sampleId}</span>
                            ${somaticHtml ? `<span class="help-block" style="margin: 5px 0">${somaticHtml}</span>` : ""}
                        </div>
                    `;
                },
                visible: this.gridCommons.isColumnVisible("id")
            },
            {
                id: "individualId",
                title: "Individual ID",
                field: "individualId",
                formatter: individualId => {
                    if (individualId) {
                        return `<div><span style="font-weight: bold">${individualId}</span></div>`;
                    } else {
                        return "-";
                    }
                },
                visible: this.gridCommons.isColumnVisible("individualId")
            },
            {
                id: "fileIds",
                title: "Files (Only BAM and VCF)",
                field: "fileIds",
                formatter: fileIds => CatalogGridFormatter.fileFormatter(fileIds, ["vcf", "vcf.gz", "bam"]),
                visible: this.gridCommons.isColumnVisible("fileIds")
            },
            {
                id: "caseId",
                title: "Case ID",
                field: "attributes.OPENCGA_CLINICAL_ANALYSIS",
                formatter: (value, row) => CatalogGridFormatter.caseFormatter(value, row, row.individualId, this.opencgaSession),
                visible: this.gridCommons.isColumnVisible("caseId")
            },
            {
                id: "collection.method",
                title: "Collection Method",
                field: "collection.method",
                visible: this.gridCommons.isColumnVisible("collection.method")
            },
            {
                id: "processing.preparationMethod",
                title: "Preparation Method",
                field: "processing.preparationMethod",
                visible: this.gridCommons.isColumnVisible("processing.preparationMethod")
            },
            {
                id: "creationDate",
                title: "Creation Date",
                field: "creationDate",
                formatter: CatalogGridFormatter.dateFormatter,
                visible: this.gridCommons.isColumnVisible("creationDate")
            },
        ];

        if (this._config.annotations?.length > 0) {
            this.gridCommons.addColumnsFromAnnotations(this._columns, CatalogGridFormatter.customAnnotationFormatter, this._config);
        }

        if (this.opencgaSession && this._config.showActions) {
            this._columns.push({
                id: "actions",
                title: "Actions",
                field: "actions",
                align: "center",
                formatter: (value, row) => `
                    <div class="inline-block dropdown">
                        <button class="btn btn-default btn-sm dropdown-toggle" type="button" data-toggle="dropdown">
                            <i class="fas fa-toolbox icon-padding" aria-hidden="true"></i>
                            <span>Actions</span>
                            <span class="caret" style="margin-left: 5px"></span>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-right">
                            <li>
                                <a data-action="copy-json" href="javascript: void 0" class="btn force-text-left">
                                    <i class="fas fa-copy icon-padding" aria-hidden="true"></i> Copy JSON
                                </a>
                            </li>
                            <li>
                                <a data-action="download-json" href="javascript: void 0" class="btn force-text-left">
                                    <i class="fas fa-download icon-padding" aria-hidden="true"></i> Download JSON
                                </a>
                            </li>
                            <li role="separator" class="divider"></li>
                            <li>
                                <a data-action="variantStats" class="btn force-text-left"
                                        href="#sampleVariantStatsBrowser/${this.opencgaSession.project.id}/${this.opencgaSession.study.id}/${row.id}">
                                    <i class="fas fa-user icon-padding" aria-hidden="true"></i> Variant Stats Browser
                                </a>
                            </li>
                            <li>
                                <a data-action="cancerVariantStats" class="btn force-text-left ${row.somatic ? "" : "disabled"}"
                                        href="#sampleCancerVariantStatsBrowser/${this.opencgaSession.project.id}/${this.opencgaSession.study.id}/${row.id}">
                                    <i class="fas fa-user icon-padding" aria-hidden="true"></i> Cancer Variant Plots
                                </a>
                            </li>
                            <li>
                                <a data-action="qualityControl" class="btn force-text-left ${row.qualityControl?.metrics && row.qualityControl.metrics.length === 0 ? "" : "disabled"}"
                                        title="${row.qualityControl?.metrics && row.qualityControl.metrics.length === 0 ? "Launch a job to calculate Quality Control stats" : "Quality Control stats already calculated"}">
                                    <i class="fas fa-rocket icon-padding" aria-hidden="true"></i> Calculate Quality Control
                                </a>
                            </li>
                            <li role="separator" class="divider"></li>
                            <li>
                                ${row.attributes?.OPENCGA_CLINICAL_ANALYSIS?.length ? row.attributes.OPENCGA_CLINICAL_ANALYSIS.map(clinicalAnalysis => `
                                    <a data-action="interpreter" class="btn force-text-left ${row.attributes.OPENCGA_CLINICAL_ANALYSIS ? "" : "disabled"}"
                                        href="#interpreter/${this.opencgaSession.project.id}/${this.opencgaSession.study.id}/${clinicalAnalysis.id}">
                                            <i class="fas fa-user-md icon-padding" aria-hidden="true"></i> Case Interpreter - ${clinicalAnalysis.id}
                                        </a>
                                    `).join("") : `<a data-action="interpreter" class="btn force-text-left disabled" href="#">
                                        <i class="fas fa-user-md icon-padding" aria-hidden="true"></i> No cases found
                                    </a>`}
                            </li>
                            <li role="separator" class="divider"></li>
                            <li>
                                <a data-action="edit" class="btn force-text-left ${OpencgaCatalogUtils.checkPermissions(this.opencgaSession.study, this.opencgaSession.user.id, this.permissionID) || "disabled" }">
                                    <i class="fas fa-edit icon-padding" aria-hidden="true"></i> Edit ...
                                </a>
                            </li>
                            <li>
                                <a data-action="delete" href="javascript: void 0" class="btn force-text-left disabled">
                                    <i class="fas fa-trash icon-padding" aria-hidden="true"></i> Delete
                                </a>
                            </li>
                        </ul>
                    </div>
                `,
                events: {
                    "click a": this.onActionClick.bind(this)
                },
                visible: this.gridCommons.isColumnVisible("actions")
            });
        }

        this._columns = this.gridCommons.addColumnsFromExtensions(this._columns, this.COMPONENT_ID);
        return this._columns;
    }

    async onDownload(e) {
        // Activate the GIF
        this.toolbarConfig = {...this.toolbarConfig, downloading: true};
        this.requestUpdate();
        await this.updateComplete;

        const filters = {
            ...this.filters,
            skip: 0,
            limit: 1000,
            count: false
        };
        this.opencgaSession.opencgaClient.samples()
            .search(filters)
            .then(response => {
                const results = response.getResults();
                if (results) {
                    // Check if user clicked in Tab or JSON format
                    if (e.detail.option.toUpperCase() === "TAB") {
                        const fields = ["id", "individualId", "fileIds", "collection.method", "processing.preparationMethod", "somatic", "creationDate"];
                        const data = UtilsNew.toTableString(results, fields);
                        UtilsNew.downloadData(data, "samples_" + this.opencgaSession.study.id + ".tsv", "text/plain");
                    } else {
                        UtilsNew.downloadData(JSON.stringify(results, null, "\t"), "samples_" +this.opencgaSession.study.id + ".json", "application/json");
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

    onCreateCohortShow() {
        const filters = {
            ...this.filters,
            include: "id",
            limit: 5000,
        };
        this.opencgaSession.opencgaClient.samples()
            .search(filters)
            .then(response => {
                const results = response.getResults();
                if (results) {
                    this.createCohortSampleIds = results.map(s => {
                        return {"id": s.id};
                    });
                    this.requestUpdate();
                    ModalUtils.show(`${this._prefix}CreateCohortModal`);
                } else {
                    console.error("Error in result format");
                }
            })
            .catch(response => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            });
    }

    onCreateCohortSave() {
        const cohortId = document.querySelector(`#${this._prefix}CohortId`).value;
        const cohortName = document.querySelector(`#${this._prefix}CohortName`).value;

        const params = {
            study: this.opencgaSession.study.fqn,
            includeResult: false
        };
        let error;
        this.opencgaSession.opencgaClient.cohorts()
            .create(
                {
                    id: cohortId,
                    name: cohortName ?? "",
                    samples: this.createCohortSampleIds,
                }, params)
            .then(() => {
                this.createCohortSampleIds = [];
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Cohort Create",
                    message: "Cohort created correctly"
                });
            })
            .catch(reason => {
                error = reason;
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
            });
    }

    getRightToolbar() {
        return [
            {
                render: () => html`
                    <button type="button" class="btn btn-default btn-sm" @click="${e => this.onCreateCohortShow(e)}">
                        <i class="fas fa-users icon-padding"></i> Create Cohort
                    </button>
                `,
            }
        ];
    }

    render() {
        return html`
            ${this._config.showToolbar ? html`
                <opencb-grid-toolbar
                    .query="${this.filters}"
                    .rightToolbar="${this.getRightToolbar()}"
                    .opencgaSession="${this.opencgaSession}"
                    .settings="${this.toolbarSetting}"
                    .config="${this.toolbarConfig}"
                    @columnChange="${this.onColumnChange}"
                    @download="${this.onDownload}"
                    @export="${this.onDownload}"
                    @actionClick="${e => this.onActionClick(e)}"
                    @sampleCreate="${this.renderTable}">
                </opencb-grid-toolbar>
            ` : nothing}

            <div id="${this._prefix}GridTableDiv" class="force-overflow" data-cy="sb-grid">
                <table id="${this.gridId}"></table>
            </div>

            ${ModalUtils.create(this, `${this._prefix}UpdateModal`, {
                display: {
                    modalTitle: `Sample Update: ${this.sampleUpdateId}`,
                    modalDraggable: true,
                    modalCyDataName: "modal-update",
                },
                render: active => {
                    return html `
                        <sample-update
                            .sampleId="${this.sampleUpdateId}"
                            .active="${active}"
                            .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                            .opencgaSession="${this.opencgaSession}">
                        </sample-update>
                    `;
                }
            })}

            ${ModalUtils.create(this, `${this._prefix}CreateCohortModal`, {
                display: {
                    modalTitle: "Create Cohort",
                    modalDraggable: true,
                    modalbtnsVisible: true
                },
                render: () => {
                    return html`
                        <div style="margin: 10px">Create a new cohort with <span style="font-weight: bold">${this.createCohortSampleIds?.length} samples</span>.
                            This can take few seconds depending on the number of samples.</div>
                        ${this.createCohortSampleIds?.length === 5000 ? html`
                            <div><span class="alert alert-warning">No more than 5,000 samples allowed</span></div>
                        ` : nothing}
                        <div style="margin: 10px">Select the new Cohort ID and Name:</div>
                        <div>
                            <form class="form-horizontal">
                                <div class="form-group">
                                    <label for="${this._prefix}CohortId" class="col-sm-2 control-label">Cohort ID</label>
                                    <div class="col-sm-6">
                                        <input type="text" class="form-control" id="${this._prefix}CohortId" placeholder="">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="${this._prefix}CohortName" class="col-sm-2 control-label">Cohort Name</label>
                                    <div class="col-sm-6">
                                        <input type="text" class="form-control" id="${this._prefix}CohortName" placeholder="">
                                    </div>
                                </div>
                            </form>
                        </div>
                    `;
                },
                onOk: e => this.onCreateCohortSave(e)
            })}
        `;
    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 25],
            multiSelection: false,
            showSelectCheckbox: false,
            // detailView: true,

            showToolbar: true,
            showActions: true,

            showCreate: true,
            showExport: true,
            showSettings: true,
            exportTabs: ["download", "link", "code"],

            // toolbar: {
            //     showSettings: true,
            //     showColumns: false,
            //     showDownload: false,
            //     showExport: true,
            //     exportTabs: ["download", "link", "code"]
            //     // columns list for the dropdown will be added in grid components based on settings.table.columns
            // },
        };
    }

}

customElements.define("sample-grid", SampleGrid);
