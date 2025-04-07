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
import LitUtils from "../commons/utils/lit-utils.js";
import GridCommons from "../commons/grid-commons.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter.js";
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import WebUtils from "../commons/utils/web-utils.js";
import "../commons/opencb-grid-toolbar.js";
import "./sample-create.js";
import "./sample-update.js";
import "./sample-view.js";

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
        this.active = true;
        this._prefix = UtilsNew.randomString(8);
        this.gridId = this._prefix + this.COMPONENT_ID;
        this._selectedSample = null;
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
        };

        // initialize modals
        this.gridCommons.registerModals({
            "view-sample": () => ({
                display: {
                    modalTitle: `Sample ${this._selectedSample?.id}`,
                    modalSize: "modal-xl",
                },
                render: () => html`
                    <sample-view
                        .sampleId="${this._selectedSample.id}"
                        .opencgaSession="${this.opencgaSession}">
                    </sample-view>
                `,
            }),
            "create-sample": {
                display: {
                    modalTitle: "Create Sample",
                    modalSize: "modal-lg"
                },
                render: () => html`
                    <sample-create
                        .opencgaSession="${this.opencgaSession}"
                        .displayConfig="${{
                            type: "tabs",
                            buttonsLayout: "down",
                        }}"
                        @sampleCreate="${() => {
                            this.gridCommons.clearActiveModal();
                        }}">
                    </sample-create>
                `,
            },
            "update-sample": () => ({
                display: {
                    modalTitle: `Update Sample: ${this._selectedSample?.id}`,
                    modalSize: "modal-lg",
                },
                render: () => html`
                    <sample-update
                        .opencgaSession="${this.opencgaSession}"
                        .sampleId="${this._selectedSample.id}"
                        .active="${true}"
                        .displayConfig="${{
                            type: "tabs",
                            buttonsLayout: "upper",
                        }}"
                        @sampleUpdate="${() => {
                            this.gridCommons.clearActiveModal();
                        }}">
                    </sample-update>
                `,
            }),
            "create-cohort": {
                display: {
                    modalTitle: "Create Cohort",
                    modalSize: "modal-md",
                    modalbtnsVisible: true,
                    okButtonText: "Create Cohort",
                    cancelButtonText: "Cancel",
                },
                render: () => html`
                    <div class="mb-2">
                        Create a new cohort with <span class="fw-bold">${this.createCohortSampleIds?.length} samples</span>.
                        This can take few seconds depending on the number of samples.
                    </div>
                    ${this.createCohortSampleIds?.length === 5000 ? html`
                        <div class="alert alert-warning mb-2">No more than 5,000 samples allowed</div>
                    ` : nothing}
                    <form>
                        <div class="mb-2">
                            <label for="${this._prefix}CohortId" class="form-label">Cohort ID</label>
                            <input type="text" class="form-control" id="${this._prefix}CohortId" placeholder="">
                        </div>
                        <div class="mb-0">
                            <label for="${this._prefix}CohortName" class="form-label">Cohort Name</label>
                            <input type="text" class="form-control" id="${this._prefix}CohortName" placeholder="">
                        </div>
                    </form>
                `,
                onOk: event => this.onCreateCohortSave(event),
            }
        });

        this.permissionID = WebUtils.getPermissionID(this.toolbarConfig.resource, "WRITE");
    }

    fetchClinicalAnalysis(rows, individuals, casesLimit) {
        if (rows && rows.length > 0) {
            return this.opencgaSession.opencgaClient.clinical()
                .search({
                    individual: individuals,
                    study: this.opencgaSession.study.fqn,
                    include: "id,proband.id,family.members",
                    limit: casesLimit * 10,
                })
                .then(response => {
                    return rows.forEach(sample => {
                        (response?.responses?.[0]?.results || []).forEach(clinicalAnalysis => {
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
                        });
                    });
                });
        }
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
                theadClasses: "table-light",
                buttonsClass: "light",
                columns: this._columns,
                method: "get",
                sidePagination: "server",
                iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
                icons: GridCommons.GRID_ICONS,
                uniqueId: "id",
                pagination: this._config.pagination,
                pageSize: this._config.pageSize,
                pageList: this._config.pageList,
                paginationVAlign: "bottom",
                formatShowingRows: (pageFrom, pageTo, totalRows) => {
                    return this.gridCommons.formatShowingRows(pageFrom, pageTo, totalRows);
                },
                detailView: !!this.detailFormatter,
                gridContext: this,
                loadingTemplate: () => GridCommons.loadingFormatter(),
                ajax: params => {
                    let sampleResponse = null;
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
                        .then(response => {
                            sampleResponse = response;
                            // Fetch clinical analysis to display the Case ID
                            const samples = sampleResponse?.responses?.[0]?.results;
                            const individuals = (samples || [])
                                .map(sample => sample.individualId)
                                .filter(individualId => !!individualId)
                                .join(",");
                            if (individuals) {
                                return this.fetchClinicalAnalysis(samples || [], individuals, casesLimit);
                            }
                        })
                        .then(() => {
                            // Prepare data for columns extensions
                            const rows = sampleResponse.responses?.[0]?.results || [];
                            return this.gridCommons.prepareDataForExtensions(this.COMPONENT_ID, this.opencgaSession, this.filters, rows);
                        })
                        .then(() => params.success(sampleResponse))
                        .catch(error => {
                            console.error(error);
                            params.error(error);
                        })
                        .finally(() => {
                            LitUtils.dispatchCustomEvent(this, "queryComplete", null, {
                                response: sampleResponse,
                            });
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
                onLoadError: (e, restResponse) => {
                    this.gridCommons.onLoadError(e, restResponse);
                },
            });
        }
    }

    renderLocalTable() {
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            theadClasses: "table-light",
            buttonsClass: "light",
            columns: this._getDefaultColumns(),
            // data: this.samples,
            sidePagination: "server",
            // Josemi Note 2024-01-18: we have added the ajax function for local variants also to support executing async calls
            // when getting additional data from columns extensions.
            ajax: params => {
                const tableOptions = $(this.table).bootstrapTable("getOptions");
                const limit = params.data.limit || tableOptions.pageSize;
                const skip = params.data.offset || 0;
                const rows = this.samples.slice(skip, skip + limit);

                // Get data for extensions
                this.gridCommons.prepareDataForExtensions(this.COMPONENT_ID, this.opencgaSession, null, rows)
                    .then(() => params.success(rows))
                    .catch(error => params.error(error));
            },
            // Josemi Note 2024-01-18: we use this method to tell bootstrap-table how many rows we have in our data
            responseHandler: response => {
                return {
                    total: this.samples.length,
                    rows: response,
                };
            },
            iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
            icons: GridCommons.GRID_ICONS,
            uniqueId: "id",
            paginationVAlign: "bottom",
            formatShowingRows: (pageFrom, pageTo, totalRows) => {
                return this.gridCommons.formatShowingRows(pageFrom, pageTo, totalRows);
            },
            pagination: this._config.pagination,
            pageSize: this._config.pageSize,
            pageList: this._config.pageList,
            detailView: this._config.detailView,
            gridContext: this,
            loadingTemplate: () => GridCommons.loadingFormatter(),
            onClickRow: (row, selectedElement) => this.gridCommons.onClickRow(row.id, row, selectedElement),
            onPostBody: data => {
                // We call onLoadSuccess to select first row
                this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 1);
            },
        });
    }

    onColumnChange(e) {
        this.gridCommons.onColumnChange(e);
    }

    async onActionClick(event, sample) {
        const action = (event.target?.dataset?.action || "").toLowerCase();
        switch (action) {
            case "view":
                this._selectedSample = sample;
                this.gridCommons.changeActiveModal("view-sample");
                break;
            case "edit":
                this._selectedSample = sample;
                this.gridCommons.changeActiveModal("update-sample");
                break;
            case "copy-json":
                UtilsNew.copyToClipboard(JSON.stringify(sample, null, "\t"));
                break;
            case "download-json":
                UtilsNew.downloadData([JSON.stringify(sample, null, "\t")], sample.id + ".json");
                break;
            case "quality-control":
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
                            ${somaticHtml ? `<span class="d-block text-secondary" style="margin: 5px 0">${somaticHtml}</span>` : ""}
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
                width: "10",
                widthUnit: "%",
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
                formatter: (value, row) => {
                    const hasWritePermission = OpencgaCatalogUtils.getStudyEffectivePermission(
                        this.opencgaSession.study,
                        this.opencgaSession.user.id,
                        this.permissionID,
                        this.opencgaSession?.organization?.configuration?.optimizations?.simplifyPermissions);
                    return `
                        <div class="d-inline-block dropdown">
                            <button class="btn" data-bs-toggle="dropdown" data-cy="actions-button">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <div class="dropdown-menu dropdown-menu-end">
                                <a data-action="view" class="dropdown-item cursor-pointer">
                                    <i class="fas fa-eye me-1"></i> View
                                </a>
                                <a data-action="copy-json" class="dropdown-item cursor-pointer">
                                    <i class="fas fa-copy me-1"></i> Copy JSON
                                </a>
                                <a data-action="download-json" class="dropdown-item cursor-pointer">
                                    <i class="fas fa-download me-1"></i> Download JSON
                                </a>
                                <hr class="dropdown-divider">
                                <a class="dropdown-item" href="#sampleVariantStatsBrowser/${this.opencgaSession.project.id}/${this.opencgaSession.study.id}/${row.id}">
                                    <i class="fas fa-user me-1"></i> Variant Stats Browser
                                </a>
                                <a class="dropdown-item ${row.somatic ? "" : "disabled"}" href="#sampleCancerVariantStatsBrowser/${this.opencgaSession.project.id}/${this.opencgaSession.study.id}/${row.id}">
                                    <i class="fas fa-user me-1"></i> Cancer Variant Plots
                                </a>
                                <a
                                    data-action="quality-control"
                                    class="dropdown-item ${row.qualityControl?.metrics && row.qualityControl.metrics.length === 0 ? "" : "disabled"}"
                                    title="${row.qualityControl?.metrics && row.qualityControl.metrics.length === 0 ?"Launch a job to calculate Quality Control stats" : "Quality Control stats already calculated"}">
                                    <i class="fas fa-rocket me-1"></i> Calculate Quality Control
                                </a>
                                <hr class="dropdown-divider">
                                ${row.attributes?.OPENCGA_CLINICAL_ANALYSIS?.length ? row.attributes.OPENCGA_CLINICAL_ANALYSIS.map(clinicalAnalysis => `
                                    <a class="dropdown-item ${row.attributes.OPENCGA_CLINICAL_ANALYSIS ? "" : "disabled"}" href="#clinical/interpreter/${this.opencgaSession.project.id}/${this.opencgaSession.study.id}/${clinicalAnalysis.id}">
                                        <i class="fas fa-user-md me-1"></i> Case Interpreter - ${clinicalAnalysis.id}
                                    </a>
                                `).join("") : `
                                    <a class="dropdown-item disabled">
                                        <i class="fas fa-user-md me-1"></i> No cases found
                                    </a>
                                `}
                                <hr class="dropdown-divider">
                                <a data-action="edit" class="dropdown-item ${hasWritePermission ? "cursor-pointer" : "disabled"}">
                                    <i class="fas fa-edit me-1"></i> Edit ...
                                </a>
                                <a data-action="delete" class="dropdown-item disabled">
                                    <i class="fas fa-trash me-1"></i> Delete
                                </a>
                            </div>
                        </div>
                    `;
                },
                events: {
                    "click a": (event, value, row) => this.onActionClick(event, row),
                },
                visible: this.gridCommons.isColumnVisible("actions")
            });
        }

        this._columns = this.gridCommons.addColumnsFromExtensions(this.COMPONENT_ID, this.opencgaSession, this._columns);
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
        this.opencgaSession.opencgaClient.samples()
            .search({
                ...this.filters,
                include: "id",
                limit: 5000,
            })
            .then(response => {
                const results = response?.responses?.[0]?.results || [];
                if (results?.length > 0) {
                    this.createCohortSampleIds = results.map(sample => {
                        return {id: sample.id};
                    });
                    this.gridCommons.changeActiveModal("create-cohort");
                }
            })
            .catch(response => {
                console.error(response);
            });
    }

    onCreateCohortSave() {
        const cohortId = document.querySelector(`#${this._prefix}CohortId`).value;
        const cohortName = document.querySelector(`#${this._prefix}CohortName`).value;
        const data = {
            id: cohortId,
            name: cohortName ?? "",
            samples: this.createCohortSampleIds,
        };
        this.opencgaSession.opencgaClient.cohorts()
            .create(data, {
                study: this.opencgaSession.study.fqn,
            })
            .then(() => {
                this.createCohortSampleIds = [];
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    message: "Cohort created correctly",
                });
            })
            .catch(reason => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
            })
            .finally(() => {
                this.gridCommons.clearActiveModal();
            });
    }

    getRightToolbar() {
        const hasWritePermission = OpencgaCatalogUtils.getStudyEffectivePermission(
            this.opencgaSession.study,
            this.opencgaSession.user.id,
            this.permissionID,
            this.opencgaSession?.organization?.configuration?.optimizations?.simplifyPermissions,
        );
        return [
            {
                icon: "fa-plus",
                title: "Create Sample",
                disabled: !hasWritePermission,
                onClick: () => this.gridCommons.changeActiveModal("create-sample"),
            },
            {
                icon: "fa-users",
                title: "Create Cohort",
                onClick: () => this.onCreateCohortShow(),
            },
        ];
    }

    renderToolbarLeftContent() {
        return html`
            <span id="${this.gridId + "PaginationInfo"}"></span>
        `;
    }

    render() {
        return html`
            ${this._config.showToolbar ? html`
                <opencb-grid-toolbar
                    .query="${this.filters}"
                    .leftContent="${this.renderToolbarLeftContent()}"
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

            ${this.gridCommons.renderModals()}
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
