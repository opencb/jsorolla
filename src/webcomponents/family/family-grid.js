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
import LitUtils from "../commons/utils/lit-utils.js";
import "../commons/grid-toolbar.js";
import "../clinical/clinical-analysis-view.js";
import "../individual/individual-view.js";
import "../variant/analysis/family-qc-analysis.js";
import "./family-create.js";
import "./family-update.js";
import "./family-view.js";

export default class FamilyGrid extends LitElement {

    constructor() {
        super();

        this.#init();
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

    #init() {
        this.COMPONENT_ID = "family-grid";
        this.RESOURCE = "FAMILY";
        this.active = true;
        this._prefix = UtilsNew.randomString(8);
        this.gridId = this._prefix + this.COMPONENT_ID;
        this._selectedFamilyId = null;
        this._selectedIndividualId = null;
        this._selectedClinicalAnalysisId = null;
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
        // With each property change we must updated config and create the columns again. No extra checks are needed.
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };
        this.gridCommons = new GridCommons(this.gridId, this, this._config);

        // Settings for the grid toolbar
        this.toolbarSetting = {
            ...this._config,
        };

        // Config for the grid toolbar
        this.toolbarConfig = {
            toolId: this.toolId,
            resource: "FAMILY",
            columns: this._getDefaultColumns(),
        };

        // register available modals for this grid
        this.gridCommons.registerModals({
            "create-family": {
                display: {
                    modalTitle: "Create Family",
                    modalSize: "modal-lg",
                    modalCyDataName: "family-create",
                    modalDraggable: true,
                },
                render: () => html`
                    <family-create
                        .displayConfig="${{
                            type: "tabs",
                            buttonsLayout: "upper",
                        }}"
                        .opencgaSession="${this.opencgaSession}"
                        @familyCreate="${() => {
                            this.gridCommons.clearActiveModal();
                            this.table.bootstrapTable("refresh");
                        }}">
                    </family-create>
                `,
            },
            "view-family": () => ({
                display: {
                    modalTitle: `Family ${this._selectedFamilyId}`,
                    modalSize: "modal-3xl",
                    modalCyDataName: "family-view",
                    modalDraggable: true,
                },
                render: () => html`
                    <family-view
                        .familyId="${this._selectedFamilyId}"
                        .active="${true}"
                        .opencgaSession="${this.opencgaSession}">
                    </family-view>
                `,
            }),
            "update-family": () => ({
                display: {
                    modalTitle: `Update Family ${this._selectedFamilyId}`,
                    modalSize: "modal-lg",
                    modalCyDataName: "family-update",
                    modalDraggable: true,
                },
                render: () => html`
                    <family-update
                        .familyId="${this._selectedFamilyId}"
                        .active="${true}"
                        .displayConfig="${{
                            type: "tabs",
                            buttonsLayout: "down",
                        }}"
                        .opencgaSession="${this.opencgaSession}"
                        @familyUpdate="${() => {
                            this.gridCommons.clearActiveModal();
                            this.table.bootstrapTable("refresh");
                        }}">
                    </family-update>
                `,
            }),
            "view-individual": () => ({
                display: {
                    modalTitle: `Individual ${this._selectedIndividualId}`,
                    modalSize: "modal-3xl",
                    modalCyDataName: "individual-view",
                    modalDraggable: true,
                },
                render: () => html`
                    <individual-view
                        .individualId="${this._selectedIndividualId}"
                        .active="${true}"
                        .opencgaSession="${this.opencgaSession}">
                    </individual-view>
                `,
            }),
            "view-clinical-analysis": () => ({
                display: {
                    modalTitle: `Clinical Analysis ${this._selectedClinicalAnalysisId}`,
                    modalSize: "modal-3xl",
                    modalCyDataName: "clinical-analysis-view",
                    modalDraggable: true,
                },
                render: () => html`
                    <clinical-analysis-view
                        .clinicalAnalysisId="${this._selectedClinicalAnalysisId}"
                        .active="${true}"
                        .opencgaSession="${this.opencgaSession}">
                    </clinical-analysis-view>
                `,
            }),
            "launch-family-qc-analysis": () => ({
                display: {
                    modalTitle: `Launch Family QC Analysis ${this._selectedFamilyId}`,
                    modalSize: "modal-lg",
                    modalCyDataName: "family-qc-analysis",
                    modalDraggable: true,
                },
                render: () => html`
                    <family-qc-analysis
                        .opencgaSession="${this.opencgaSession}"
                        .toolParams="${{
                            family: this._selectedFamilyId,
                        }}"
                        .config="${{
                            display: {
                                titleVisible: false,
                            },
                        }}">
                    </family-qc-analysis>
                `,
            }),
        });
    }

    fetchClinicalAnalysis(rows, casesLimit) {
        if (rows && rows.length > 0) {
            return this.opencgaSession.opencgaClient.clinical()
                .search({
                    family: rows.map(family => family.id).join(","),
                    study: this.opencgaSession.study.fqn,
                    include: "id,proband.id,family.members,family.id",
                    limit: casesLimit * 10
                })
                .then(response => {
                    return rows.forEach(family => {
                        (response?.responses?.[0]?.results || []).forEach(clinicalAnalysis => {
                            if (clinicalAnalysis?.family?.id === family.id) {
                                if (family?.attributes?.OPENCGA_CLINICAL_ANALYSIS) {
                                    family.attributes.OPENCGA_CLINICAL_ANALYSIS.push(clinicalAnalysis);
                                } else {
                                    // eslint-disable-next-line no-param-reassign
                                    family.attributes = {
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
        if (this.families?.length > 0) {
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
                silentSort: false,
                pagination: this._config.pagination,
                pageSize: this._config.pageSize,
                pageList: this._config.pageList,
                paginationVAlign: "bottom",
                formatShowingRows: (pageFrom, pageTo, totalRows) => {
                    return this.gridCommons.formatShowingRows(pageFrom, pageTo, totalRows);
                },
                loadingTemplate: () => GridCommons.loadingFormatter(),
                ajax: params => {
                    let familyResponse = null;
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
                    this.opencgaSession.opencgaClient.families()
                        .search(this.filters)
                        .then(response => {
                            familyResponse = response;
                            return this.fetchClinicalAnalysis(familyResponse.responses?.[0]?.results || [], casesLimit);
                        })
                        .then(() => {
                            // Prepare data for columns extensions
                            const rows = familyResponse.responses?.[0]?.results || [];
                            return this.gridCommons.prepareDataForExtensions(this.COMPONENT_ID, this.opencgaSession, this.filters, rows);
                        })
                        .then(() => params.success(familyResponse))
                        .catch(error => {
                            console.error(error);
                            params.error(error);
                        })
                        .finally(() => {
                            LitUtils.dispatchCustomEvent(this, "queryComplete", null, {
                                response: familyResponse,
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
            // data: this.families,
            sidePagination: "server",
            // Josemi Note 2024-01-18: we have added the ajax function for local families also to support executing async calls
            // when getting additional data from columns extensions.
            ajax: params => {
                const tableOptions = $(this.table).bootstrapTable("getOptions");
                const limit = params.data.limit || tableOptions.pageSize;
                const skip = params.data.offset || 0;
                const rows = this.families.slice(skip, skip + limit);

                // Get data for extensions
                this.gridCommons.prepareDataForExtensions(this.COMPONENT_ID, this.opencgaSession, null, rows)
                    .then(() => params.success(rows))
                    .catch(error => params.error(error));
            },
            // Josemi Note 2024-01-18: we use this method to tell bootstrap-table how many rows we have in our data
            responseHandler: response => {
                return {
                    total: this.families.length,
                    rows: response,
                };
            },
            iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
            icons: GridCommons.GRID_ICONS,
            // Set table properties, these are read from config property
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
                title: "Family",
                field: "id",
                formatter: familyId => {
                    return `<a class="link fw-bold" data-action="view">${familyId}</a>`;
                },
                events: {
                    "click a": (event, value, row) => this.onActionClick(event, row),
                },
                visible: this.gridCommons.isColumnVisible("id")
            },
            {
                id: "members",
                title: "Members",
                field: "members",
                formatter: (members, family) => this.membersFormatter(members, family),
                events: {
                    "click a": (event, value, row) => this.onActionClick(event, row),
                },
                visible: this.gridCommons.isColumnVisible("members"),
            },
            {
                id: "disorders",
                title: "Disorders",
                field: "disorders",
                formatter: disorders => CatalogGridFormatter.disorderFormatter(disorders),
                visible: this.gridCommons.isColumnVisible("disorders"),
            },
            {
                id: "phenotypes",
                title: "Phenotypes",
                field: "phenotypes",
                formatter: phenotypes => CatalogGridFormatter.phenotypesFormatter(phenotypes),
                visible: this.gridCommons.isColumnVisible("phenotypes")
            },
            {
                id: "caseId",
                title: "Clinical Interpretation",
                field: "attributes.OPENCGA_CLINICAL_ANALYSIS",
                formatter: (value, row) => CatalogGridFormatter.caseFormatter(value, row, row.id, this.opencgaSession),
                events: {
                    "click a": (event, value, row) => this.onActionClick(event, row),
                },
                visible: this.gridCommons.isColumnVisible("caseId")
            },
            {
                id: "creationDate",
                title: "Modification / Creation Date",
                field: "creationDate",
                formatter: (value, row) => CatalogGridFormatter.modifiedAndCreateDateFormatter(value, row),
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

    membersFormatter(members, family) {
        let memberRoles = {};
        Object.entries(family?.roles || {}).forEach(([_, individuals]) => {
            memberRoles = {
                ...individuals,
                ...memberRoles
            };
        });

        const memberItems = (members || []).map(member => {
            // Old version displayed the sex: ${member?.sex?.id ? `<span class="text-secondary">(${member.sex.id})</span>` : ""}
            return `
                <div style="white-space: nowrap">
                    <a class="fw-bold link" data-action="view-individual" data-individual="${member.id}">${member.id}</a>
                    ${memberRoles[member.id] ? `<span class="text-secondary">(${memberRoles[member.id]})</span>` : ""}
                </div>
            `;
        });

        // Note: we only display the first 5 members of the family
        return GridCommons.generateExpandCollapseContent(memberItems, 5);
    }

    actionsFormatter(value, row) {
        const hasWritePermission = this.gridCommons.hasPermission("WRITE");
        const hasJobExecutionPermission = this.gridCommons.hasPermission("EXECUTE", "JOB");
        const hasClinicalAnalysis = row?.attributes?.OPENCGA_CLINICAL_ANALYSIS?.length > 0;
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
                    <div class="dropdown-header">Analysis</div>
                    <a data-action="family-qc-analysis" class="dropdown-item ${hasJobExecutionPermission ? "cursor-pointer" : "disabled"}">
                        <i class="fas fa-rocket me-1"></i> Quality Control
                    </a>
                    <hr class="dropdown-divider">
                    <div class="dropdown-header">Clinical Interpreter</div>
                    ${hasClinicalAnalysis ? row.attributes.OPENCGA_CLINICAL_ANALYSIS.map(clinicalAnalysis => `
                        <a class="dropdown-item" href="#clinical/interpreter/${this.opencgaSession.project.id}/${this.opencgaSession.study.id}/${clinicalAnalysis.id}">
                            <i class="fas fa-user-md me-1"></i> ${clinicalAnalysis.id}
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
    }

    onActionClick(event, family) {
        const action = event.currentTarget?.dataset?.action?.toLowerCase();
        switch (action) {
            case "view":
                this._selectedFamilyId = family.id;
                this.gridCommons.changeActiveModal("view-family");
                break;
            case "view-individual":
                this._selectedIndividualId = event.currentTarget.dataset.individual;
                this.gridCommons.changeActiveModal("view-individual");
                break;
            case "view-case":
            case "view-clinical-analysis":
                this._selectedClinicalAnalysisId = event.currentTarget.dataset.clinicalAnalysis;
                this.gridCommons.changeActiveModal("view-clinical-analysis");
                break;
            case "edit":
                this._selectedFamilyId = family.id;
                this.gridCommons.changeActiveModal("update-family");
                break;
            case "copy-json":
                UtilsNew.copyToClipboard(JSON.stringify(family, null, "\t"));
                break;
            case "download-json":
                UtilsNew.downloadData([JSON.stringify(family, null, "\t")], family.id + ".json");
                break;
            case "quality-control":
                alert("Not implemented yet");
                break;
            case "family-qc-analysis":
                this._selectedFamilyId = family.id;
                this.gridCommons.changeActiveModal("launch-family-qc-analysis");
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
        this.opencgaSession.opencgaClient.families()
            .search(filters)
            .then(response => {
                const results = response.getResults();
                if (results) {
                    // Check if user clicked in Tab or JSON format
                    if (e.detail.option.toUpperCase() === "TAB") {
                        const fields = ["id", "members.id", "disorders.id", "phenotypes.id", "creationDate"];
                        const data = UtilsNew.toTableString(results, fields);
                        UtilsNew.downloadData(data, "families_" + this.opencgaSession.study.id + ".tsv", "text/plain");
                    } else {
                        UtilsNew.downloadData(JSON.stringify(results, null, "\t"), "families_" + this.opencgaSession.study.id + ".json", "application/json");
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
                title: "Create Family",
                disabled: !this.gridCommons.hasPermission("WRITE"),
                onClick: () => this.gridCommons.changeActiveModal("create-family"),
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
                <grid-toolbar
                    .query="${this.filters}"
                    .opencgaSession="${this.opencgaSession}"
                    .leftContent="${this.renderToolbarLeftContent()}"
                    .rightToolbar="${this.getRightToolbar()}"
                    .settings="${this.toolbarSetting}"
                    .config="${this.toolbarConfig}"
                    @download="${this.onDownload}"
                    @export="${this.onDownload}">
                </grid-toolbar>
            ` : nothing}

            <div id="${this._prefix}GridTableDiv" class="force-overflow">
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

customElements.define("family-grid", FamilyGrid);
