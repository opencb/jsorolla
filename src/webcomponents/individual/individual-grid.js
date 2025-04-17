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
import NotificationUtils from "../commons/utils/notification-utils.js";
import ModalUtils from "../commons/modal/modal-utils.js";
import LitUtils from "../commons/utils/lit-utils.js";
import "../commons/opencb-grid-toolbar.js";
import "../cohort/cohort-create-samples.js";
import "./individual-view.js";
import "./individual-create.js";
import "./individual-update.js";

export default class IndividualGrid extends LitElement {

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
            individuals: {
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

    #init() {
        this.RESOURCE = "INDIVIDUAL";
        this.COMPONENT_ID = "individual-grid";
        this.active = true;
        this._prefix = UtilsNew.randomString(8);
        this.gridId = this._prefix + this.COMPONENT_ID;
        this._selectedIndividual = null;
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

        // settings for the grid toolbar
        this.toolbarSetting = {
            // buttons: ["columns", "download"],
            ...this._config,
        };

        // Config for the grid toolbar
        this.toolbarConfig = {
            toolId: this.toolId,
            resource: this.RESOURCE,
            columns: this._getDefaultColumns(),
        };

        // register modals for individual grid
        this.gridCommons.registerModals({
            "view-individual": () => ({
                display: {
                    modalTitle: `Individual ${this._selectedIndividual?.id}`,
                    modalSize: "modal-xl",
                    modalCyDataName: "individual-view",
                    modalDraggable: true,
                },
                render: () => html`
                    <individual-view
                        .individualId="${this._selectedIndividual?.id}"
                        .active="${true}"
                        .opencgaSession="${this.opencgaSession}">
                    </individual-view>
                `,
            }),
            "create-individual": {
                display: {
                    modalTitle: "Create Individual",
                    modalSize: "modal-lg",
                    modalCyDataName: "individual-create",
                    modalDraggable: true,
                },
                render: () => html`
                    <individual-create
                        .displayConfig="${{
                            type: "tabs",
                            buttonsLayout: "upper",
                        }}"
                        .opencgaSession="${this.opencgaSession}"
                        @individualCreate="${() => {
                            this.gridCommons.clearActiveModal();
                            this.table.bootstrapTable("refresh");
                        }}">
                    </individual-create>
                `,
            },
            "update-individual": () => ({
                display: {
                    modalTitle: `Update Individual ${this._selectedIndividual?.id}`,
                    modalSize: "modal-lg",
                    modalCyDataName: "individual-update",
                    modalDraggable: true,
                },
                render: () => html`
                    <individual-update
                        .individualId="${this._selectedIndividual?.id}"
                        .active="${true}"
                        .displayConfig="${{
                            type: "tabs",
                            buttonsLayout: "upper",
                        }}"
                        .opencgaSession="${this.opencgaSession}"
                        @individualUpdate="${() => {
                            this.gridCommons.clearActiveModal();
                            this.table.bootstrapTable("refresh");
                        }}">
                    </individual-update>
                `,
            }),
            "create-cohort": {
                display: {
                    modalTitle: "Create Cohort",
                    modalSize: "modal-md",
                    modalbtnsVisible: false,
                    modalCyDataName: "cohort-create",
                    modalDraggable: true,
                },
                render: () => html`
                    <cohort-create-samples
                        .opencgaSession="${this.opencgaSession}"
                        .resource="${this.RESOURCE}"
                        .query="${this.filters}"
                        @cohortCreate="${() => {
                            this.gridCommons.clearActiveModal();
                        }}">
                    </cohort-create-samples>
                `,
            },
        });
    }

    fetchClinicalAnalysis(rows, casesLimit) {
        if (rows && rows.length > 0) {
            return this.opencgaSession.opencgaClient.clinical()
                .search({
                    individual: rows.map(individual => individual.id).join(","),
                    study: this.opencgaSession.study.fqn,
                    include: "id,proband.id,family.members",
                    limit: casesLimit * 10,
                })
                .then(response => {
                    return rows.forEach(individual => {
                        (response?.responses?.[0]?.results || []).forEach(clinicalAnalysis => {
                            if (clinicalAnalysis?.proband?.id === individual.id || clinicalAnalysis?.family?.members?.find(member => member.id === individual.id)) {
                                if (individual?.attributes?.OPENCGA_CLINICAL_ANALYSIS) {
                                    individual.attributes.OPENCGA_CLINICAL_ANALYSIS.push(clinicalAnalysis);
                                } else {
                                    // eslint-disable-next-line no-param-reassign
                                    individual.attributes = {
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
        if (this.individuals?.length > 0) {
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
                classes: "table table-borderless table-hover table-grid",
                buttonsClass: "light",
                columns: this._columns,
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
                loadingTemplate: () => GridCommons.loadingFormatter(),
                ajax: params => {
                    let individualResponse = null;
                    this.filters = {
                        study: this.opencgaSession.study.fqn,
                        limit: params.data.limit,
                        skip: params.data.offset || 0,
                        count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                        ...this.query
                    };

                    // Calculate the number of cases to fetch
                    const casesLimit = this.table?.bootstrapTable("getOptions")?.pageSize || this._config.pageSize || 10;

                    // Store the current filters
                    this.lastFilters = {...this.filters};
                    this.opencgaSession.opencgaClient.individuals()
                        .search(this.filters)
                        .then(response => {
                            individualResponse = response;
                            return this.fetchClinicalAnalysis(individualResponse?.responses?.[0]?.results || [], casesLimit);
                        })
                        .then(() => {
                            // Prepare data for columns extensions
                            const rows = individualResponse.responses?.[0]?.results || [];
                            return this.gridCommons.prepareDataForExtensions(this.COMPONENT_ID, this.opencgaSession, this.filters, rows);
                        })
                        .then(() => params.success(individualResponse))
                        .catch(error => {
                            console.error(error);
                            params.error(error);
                        })
                        .finally(() => {
                            LitUtils.dispatchCustomEvent(this, "queryComplete", null, {
                                response: individualResponse,
                            });
                        });
                },
                responseHandler: response => {
                    const result = this.gridCommons.responseHandler(response, $(this.table).bootstrapTable("getOptions"));
                    return result.response;
                },
                onLoadSuccess: data => this.gridCommons.onLoadSuccess(data),
                onLoadError: (event, response) => this.gridCommons.onLoadError(event, response),
            });
        }
    }

    renderLocalTable() {
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            classes: "table table-borderless table-hover table-grid",
            buttonsClass: "light",
            columns: this._getDefaultColumns(),
            sidePagination: "server",
            // Josemi Note 2024-01-18: we have added the ajax function for local individuals also to support executing async calls
            // when getting additional data from columns extensions.
            ajax: params => {
                const tableOptions = $(this.table).bootstrapTable("getOptions");
                const limit = params.data.limit || tableOptions.pageSize;
                const skip = params.data.offset || 0;
                const rows = this.individuals.slice(skip, skip + limit);

                // Get data for extensions
                this.gridCommons.prepareDataForExtensions(this.COMPONENT_ID, this.opencgaSession, null, rows)
                    .then(() => params.success(rows))
                    .catch(error => params.error(error));
            },
            // Josemi Note 2024-01-18: we use this method to tell bootstrap-table how many rows we have in our data
            responseHandler: response => {
                return {
                    total: this.individuals.length,
                    rows: response,
                };
            },
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
            loadingTemplate: () => GridCommons.loadingFormatter(),
            onPostBody: data => this.gridCommons.onLoadSuccess({rows: data, total: data.length}),
        });
    }

    _getDefaultColumns() {
        this._columns = [
            {
                id: "id",
                title: "Individual",
                field: "id",
                formatter: (individualId, individual) => {
                    const sexHtml = CatalogGridFormatter.sexFormatter(individual.sex, individual);
                    return `
                        <a class="d-block link fw-bold" data-action="view">${individualId}</a>
                        <div class="text-secondary">${sexHtml}</div>
                    `;
                },
                events: {
                    "click a": (event, value, row) => this.onActionClick(event, row),
                },
                visible: this.gridCommons.isColumnVisible("id")
            },
            {
                id: "samples",
                title: "Samples",
                field: "samples",
                formatter: samples => {
                    const content = (samples || []).map(sample => {
                        return `
                            <div style="white-space: nowrap">
                                <span class="fw-bold">${sample.id}</span>
                                <span title="${sample.somatic ? "Somatic sample" : "Germline sample"}"> (${sample.somatic ? "S" : "G"})</span>
                            </div>
                        `;
                    });
                    return content.length > 0 ? content.join("") : "-";
                },
                visible: this.gridCommons.isColumnVisible("samples")
            },
            {
                id: "father",
                title: "Father",
                field: "father.id",
                formatter: fatherId => fatherId || "-",
                visible: this.gridCommons.isColumnVisible("father")
            },
            {
                id: "mother",
                title: "Mother",
                field: "mother.id",
                formatter: motherId => motherId || "-",
                visible: this.gridCommons.isColumnVisible("mother")
            },
            {
                id: "disorders",
                title: "Disorders",
                field: "disorders",
                formatter: CatalogGridFormatter.disorderFormatter,
                visible: this.gridCommons.isColumnVisible("disorders")
            },
            {
                id: "phenotypes",
                title: "Phenotypes",
                field: "phenotypes",
                formatter: CatalogGridFormatter.phenotypesFormatter,
                visible: this.gridCommons.isColumnVisible("phenotypes")
            },
            {
                id: "caseId",
                title: "Case ID",
                field: "attributes.OPENCGA_CLINICAL_ANALYSIS",
                formatter: (value, row) => CatalogGridFormatter.caseFormatter(value, row, row.id, this.opencgaSession),
                visible: this.gridCommons.isColumnVisible("caseId")
            },
            {
                id: "ethnicity",
                title: "Ethnicity",
                field: "ethnicity",
                formatter: (ethnicity, row) => ethnicity?.id || row.population?.name || "-",
                visible: this.gridCommons.isColumnVisible("ethnicity")
            },
            {
                id: "creationDate",
                title: "Creation Date",
                field: "creationDate",
                formatter: CatalogGridFormatter.dateFormatter,
                visible: this.gridCommons.isColumnVisible("creationDate")
            },
            {
                id: "actions",
                align: "right",
                formatter: (value, row) => this.actionsFormatter(value, row),
                events: {
                    "click a": (event, value, row) => this.onActionClick(event, row),
                },
                visible: this._config.showActions,
                excludeFromExport: true,
                excludeFromSettings: true,
            },
        ];

        if (this._config.annotations?.length > 0) {
            this.gridCommons.addColumnsFromAnnotations(this._columns, CatalogGridFormatter.customAnnotationFormatter, this._config);
        }

        this._columns = this.gridCommons.addColumnsFromExtensions(this.COMPONENT_ID, this.opencgaSession, this._columns);
        return this._columns;
    }

    actionsFormatter(value, row) {
        const hasWritePermission = this.gridCommons.hasPermission("WRITE");
        // const hasQualityControl = row?.qualityControl?.metrics?.length > 0;
        const hasClinicalAnalysis = row?.attributes?.OPENCGA_CLINICAL_ANALYSIS?.length > 0;
        return `
            <div class="d-inline-block dropdown">
                <button class="btn" type="button" data-bs-toggle="dropdown" data-cy="actions-button">
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
                    ${hasClinicalAnalysis ? row.attributes.OPENCGA_CLINICAL_ANALYSIS.map(clinicalAnalysis => `
                        <a class="dropdown-item" href="#clinical/interpreter/${this.opencgaSession.project.id}/${this.opencgaSession.study.id}/${clinicalAnalysis.id}">
                            <i class="fas fa-user-md me-1"></i> Case Interpreter - ${clinicalAnalysis.id}
                        </a>
                    `).join("") : `
                        <a class="dropdown-item disabled">
                            <i class="fas fa-user-md me-1"></i> No cases found
                        </a>
                    `}
                    <hr class="dropdown-divider">
                    <a data-action="edit" class="dropdown-item ${hasWritePermission ? "cursor-pointer" : "disabled"}">
                        <i class="fas fa-edit me-1"></i> Edit
                    </a>
                    <a data-action="delete" class="dropdown-item disabled">
                        <i class="fas fa-trash me-1"></i> Delete
                    </a>
                </div>
            </div>
        `;
    };

    onActionClick(event, individual) {
        const action = event.target.dataset.action?.toLowerCase() || event.detail.action;
        switch (action) {
            case "view":
                this._selectedIndividual = individual;
                this.gridCommons.changeActiveModal("view-individual");
                break;
            case "edit":
                this._selectedIndividual = individual;
                this.gridCommons.changeActiveModal("update-individual");
                break;
            case "copy-json":
                UtilsNew.copyToClipboard(JSON.stringify(individual, null, "\t"));
                break;
            case "download-json":
                UtilsNew.downloadData([JSON.stringify(individual, null, "\t")], individual.id + ".json");
                break;
        }
    }

    async onDownload(e) {
        this.toolbarConfig = {...this.toolbarConfig, downloading: true};
        this.requestUpdate();
        await this.updateComplete;

        const filters = {
            ...this.filters,
            skip: 0,
            limit: 1000,
            count: false
        };
        this.opencgaSession.opencgaClient.individuals()
            .search(filters)
            .then(restResponse => {
                const results = restResponse.getResults();
                if (results) {
                    // Check if user clicked in Tab or JSON format
                    if (e.detail.option.toUpperCase() === "TAB") {
                        const fields = ["id", "samples.id", "father.id", "mother.id", "disorders.id", "phenotypes.id", "sex.id", "lifeStatus", "dateOfBirth", "creationDate"];
                        const data = UtilsNew.toTableString(results, fields, {
                            "sex.id": CatalogGridFormatter.sexFormatter,
                        });
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

    getRightToolbar() {
        return [
            {
                icon: "fa-plus",
                title: "Create Individual",
                disabled: !this.gridCommons.hasPermission("WRITE"),
                onClick: () => this.gridCommons.changeActiveModal("create-individual"),
            },
            {
                icon: "fa-users",
                title: "Create Cohort",
                onClick: () => this.gridCommons.changeActiveModal("create-cohort"),
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
                    @download="${this.onDownload}"
                    @export="${this.onDownload}">
                </opencb-grid-toolbar>
            ` : nothing}

            <div id="${this._prefix}GridTableDiv" class="force-overflow" data-cy="ib-grid">
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

            showToolbar: true,
            showActions: true,

            showExport: true,
            showSettings: true,
            exportTabs: ["download", "link", "code"],
        };
    }

}

customElements.define("individual-grid", IndividualGrid);
