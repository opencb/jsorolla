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
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import UtilsNew from "../../core/utils-new.js";
import GridCommons from "../commons/grid-commons.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter.js";
import LitUtils from "../commons/utils/lit-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import ModalUtils from "../commons/modal/modal-utils.js";
import WebUtils from "../commons/utils/web-utils.js";
import "../commons/opencb-grid-toolbar.js";
import "./clinical-analysis-view.js";

export default class ClinicalAnalysisGrid extends LitElement {

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
            active: {
                type: Boolean
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this.COMPONENT_ID = "clinical-analysis-grid";
        this.RESOURCE = "CLINICAL_ANALYSIS";
        this._prefix = UtilsNew.randomString(8);
        this.gridId = this._prefix + this.COMPONENT_ID;
        this.active = true;
        this._selectedClinicalAnalysis = null;
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
            this.renderRemoteTable();
        }
    }

    propertyObserver() {
        // With each property change we must update config and create the columns again. No extra checks are needed.
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config
        };
        this.gridCommons = new GridCommons(this.gridId, this, this._config);

        // Settings for the grid toolbar
        this.toolbarSetting = {
            ...this._config,
        };

        // Config for the grid toolbar
        this.toolbarConfig = {
            toolId: this.toolId,
            resource: this.RESOURCE,
            columns: this._getDefaultColumns(),
            create: {
                display: {
                    modalTitle: "Create Clinical Analysis",
                    modalDraggable: true,
                    modalCyDataName: "modal-create",
                    modalSize: "modal-lg"
                },
                render: () => html `
                    <clinical-analysis-create
                        .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                        .opencgaSession="${this.opencgaSession}">
                    </clinical-analysis-create>
                `,
            }
        };

        this.gridCommons.registerModals({
            "view-clinical-analysis": () => ({
                display: {
                    modalTitle: `ClinicalAnalysis ${this._selectedClinicalAnalysis?.id}`,
                    modalDraggable: true,
                    modalCyDataName: "moda-clinical-analysis-view",
                    modalSize: "modal-xl"
                },
                render: () => html`
                    <clinical-analysis-view
                        .clinicalAnalysisId="${this._selectedClinicalAnalysis?.id}"
                        .active="${true}"
                        .opencgaSession="${this.opencgaSession}">
                    </clinical-analysis-view>
                `,
            }),
        });
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
                // Table properties
                pagination: this._config.pagination,
                pageSize: this._config.pageSize,
                pageList: this._config.pageList,
                paginationVAlign: "bottom",
                formatShowingRows: (pageFrom, pageTo, totalRows) => {
                    return this.gridCommons.formatShowingRows(pageFrom, pageTo, totalRows);
                },
                showExport: this._config.showExport,
                detailView: this._config.detailView,
                gridContext: this,
                // formatLoadingMessage: () =>"<div><loading-spinner></loading-spinner></div>",
                loadingTemplate: () => GridCommons.loadingFormatter(),
                ajax: params => {
                    let clinicalAnalysisResponse = null;
                    this.filters = {
                        study: this.opencgaSession.study.fqn,
                        limit: params.data.limit,
                        skip: params.data.offset || 0,
                        count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                        exclude: "files,interpretation.primaryFindings,secondaryInterpretations",
                        sort: "creationDate",
                        ...this.query
                    };

                    // Store the current filters
                    this.lastFilters = {...this.filters};
                    this.fetchData(this.filters)
                        .then(response => {
                            clinicalAnalysisResponse = response;
                            // Prepare data for columns extensions
                            const rows = clinicalAnalysisResponse.responses?.[0]?.results || [];
                            return this.gridCommons.prepareDataForExtensions(this.COMPONENT_ID, this.opencgaSession, this.filters, rows);
                        })
                        .then(() => {
                            params.success(clinicalAnalysisResponse);
                        })
                        .catch(error => {
                            console.error(error);
                            params.error(error);
                        })
                        .finally(() => {
                            LitUtils.dispatchCustomEvent(this, "queryComplete", null, {
                                response: clinicalAnalysisResponse,
                            });
                        });
                },
                responseHandler: response => {
                    const result = this.gridCommons.responseHandler(response, $(this.table).bootstrapTable("getOptions"));
                    return result.response;
                },
                onClickRow: (row, selectedElement) => this.gridCommons.onClickRow(row.id, row, selectedElement),
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
                onPostBody: () => {}
            });
        }
    }

    fetchData(query) {
        return this.opencgaSession.opencgaClient.clinical().search(query);
    }

    onColumnChange(e) {
        this.gridCommons.onColumnChange(e);
    }

    caseFormatter(value, row) {
        if (row?.id) {
            const url = WebUtils.getInterpreterLink(this.opencgaSession, row.id);
            return `
                <div class="mt-1 me-0">
                    <a class="text-decoration-none" title="Go to Case Interpreter" href="${url}" data-cy="case-id">
                        ${row.id}
                        ${row.locked ? "<i class=\"fas fa-lock\" aria-hidden=\"true\" style=\"padding-left:4px;\"></i>" : ""}
                    </a>
                </div>
                <div class="mt-1 me-0"  data-cy="case-type">
                    <span class="form-text">${row.type}</span>
                </div>
            `;
        }
        return "-";
    }

    probandFormatter(value, row) {
        if (row.proband) {
            const samplesHtml = row.proband?.samples?.map(sample => `<span data-cy="proband-sample-id">${sample.id}</span>`)?.join("");
            return `
                <div class="mt-1 me-0">
                    <span data-cy="proband-id" class="fw-bold mt-1 me-0">${row.proband?.id || "-"}</span>
                    <span data-cy="proband-id" class="text-body-secondary d-inline m-1">(${samplesHtml})</span>
                </div>
                ${row.family?.id ? `
                    <div>
                        <span data-cy="family-id" class="mt-1 me-0">${row.family.id}</span>
                        <span data-cy="proband-id" class="text-body-secondary d-inline m-1">(${row.family.members?.length || 0} members)</span>
                    </div>
                ` : ""}
            `;
        }
        return "-";
    }

    interpretationFormatter(value, row) {
        let html;
        if (value?.stats?.primaryFindings) {
            const tierStats = Object.keys(value.stats.primaryFindings.tierCount)
                .filter(key => key !== "none")
                .sort()
                .map(key => `${key}: ${value.stats.primaryFindings.tierCount[key]}`)
                .join(", ");
            html = `
                <div>
                    <span>${value.stats.primaryFindings.numVariants} variants</span>
                </div>
                <div>
                    <span class="text-body-secondary">${value.stats.primaryFindings.statusCount?.REVIEWED} reviewed</span>
                </div>
                <div>
                    <span class="text-body-secondary">
                        ${tierStats}
                    </span>
                </div>
                <div>
                    <span class="text-body-secondary">
                        ${Object.keys(value.stats.primaryFindings.geneCount).length} genes
                    </span>
                </div>
            `;
        } else {
            if (row.interpretation?.primaryFindings?.length > 0) {
                const reviewedVariants = row.interpretation.primaryFindings.filter(v => v.status === "REVIEWED");
                html = `
                    <div>
                        <span">${row.interpretation.primaryFindings.length} variants</span>
                    </div>
                    <div>
                        <span class="text-body-secondary" style="margin: 5px 0">${reviewedVariants.length} reviewed</span>
                    </div>
                `;
            } else {
                html = "<span>0 variants</span>";
            }
        }

        const url = WebUtils.getInterpreterLink(this.opencgaSession, row.id);
        return `
            <a class="text-decoration-none" data-action="interpreter" title="Go to Case Interpreter" href="${url}">
                ${html}
            </a>
        `;
    }

    priorityFormatter(value, row) {
        // TODO remove this code as soon as new OpenCGA configuration is in place
        const _priorities = this.opencgaSession?.study?.internal?.configuration?.clinical?.priorities || [];

        const hasWriteAccess = OpencgaCatalogUtils.getStudyEffectivePermission(
            this.opencgaSession.study,
            this.opencgaSession.user.id,
            "WRITE_CLINICAL_ANALYSIS",
            this.opencgaSession?.organization?.configuration?.optimizations?.simplifyPermissions);
        const isEditable = !this._config.readOnlyMode && hasWriteAccess && !row.locked; // priority is editable
        // Dropdown button styles and classes
        const btnClassName = "btn btn-light btn-block dropdown-toggle";
        const btnStyle = "display:inline-flex;align-items:center;";

        // Current priority
        const currentPriorityText = value?.id ?? value ?? "-";
        const currentPriorityColor = WebUtils.getClinicalAnalysisPriorityColour(value?.rank);

        return `
            <div class="dropdown">
                <button class="${btnClassName}" type="button" data-bs-toggle="dropdown" style="${btnStyle}" ${isEditable ? "" : "disabled"}>
                    <span class="badge ${currentPriorityColor} me-2 top-0">
                        ${currentPriorityText}
                    </span>
                </button>
                ${isEditable ? `
                    <ul class="dropdown-menu">
                        ${_priorities.map(priority => `
                            <li>
                                <a class="d-flex dropdown-item py-2" data-action="priorityChange" data-priority="${priority.id}" style="cursor:pointer;">
                                    <div class="flex-grow-1">
                                        <div>
                                            <span class="badge ${WebUtils.getClinicalAnalysisPriorityColour(priority?.rank)}">
                                                ${priority.id}
                                            </span>
                                        </div>
                                        <div class="small text-secondary">${priority.description}</div>
                                    </div>
                                    ${priority.id === value?.id ? `<i class="fas fa-check"></i>` : ""}
                                </a>
                            </li>
                        `).join("")}
                    </ul>
                ` : ""}
            </div>
        `;
    }

    statusFormatter(value, row) {
        const status = this.opencgaSession.study?.internal?.configuration?.clinical?.status || [];
        const hasWriteAccess = OpencgaCatalogUtils.getStudyEffectivePermission(
            this.opencgaSession.study,
            this.opencgaSession.user.id,
            "WRITE_CLINICAL_ANALYSIS",
            this.opencgaSession?.organization?.configuration?.optimizations?.simplifyPermissions);
        const isEditable = !this._config.readOnlyMode && hasWriteAccess && !row.locked; // status is editable

        const currentStatus = value.id || value.name || "-"; // Get current status

        // Dropdown button styles and classes
        // const btnClassName = "d-inline-flex align-items-center btn btn-light dropdown-toggle";
        const btnClassName = "d-flex justify-content-between align-items-center btn btn-light dropdown-toggle w-100";
        // const btnStyle = "display:inline-flex;align-items:center;";

        return `
            <div class="dropdown">
                <button class="${btnClassName}" type="button" data-bs-toggle="dropdown" ${isEditable ? "" : "disabled"}>
                    <span class='me-auto'">${currentStatus}</span>
                </button>
                ${isEditable ? `
                    <ul class="dropdown-menu">
                        ${status.map(({id, description}) => `
                            <li>
                                <a class="d-flex dropdown-item py-2" data-action="statusChange" data-status="${id}" style="cursor:pointer;">
                                    <div class="flex-grow-1">
                                        <div class="${id === currentStatus ? "fw-bold" : ""}">${id}</div>
                                        <div class="small text-secondary">${description}</div>
                                    </div>
                                    ${id === currentStatus ? `<i class="fas fa-check"></i>` : ""}
                                </a>
                            </li>
                        `).join("")}
                    </ul>
                `: ""}
            </div>
        `;
    }

    analystsFormatter(analysts) {
        let html = "-";
        if (!analysts?.length) {
            return html;
        }

        if (analysts?.length > 0) {
            html = "<div>";
            analysts.forEach(analyst => {
                if (analyst?.id) {
                    html += `
                        <div style="margin: 2px 0; white-space: nowrap">
                            <span data-cy="analyst-id">${analyst.id}</span>
                        </div>
                    `;
                }
            });
            html += "</div>";
        }
        return html;
    }

    removeRowTable(clinicalAnalysisId) {
        const data = this.table.bootstrapTable("getData");
        this.table.bootstrapTable("remove", {
            field: "id",
            values: [clinicalAnalysisId]
        });
        if (data?.length === 0) {
            this.table.bootstrapTable("prevPage");
            this.table.bootstrapTable("refresh");
        }
    }

    _getDefaultColumns() {
        this._columns = [
            {
                id: "caseId",
                title: "Case",
                field: "id",
                halign: "center",
                valign: "middle",
                formatter: (value, row) => this.caseFormatter(value, row),
                visible: this.gridCommons.isColumnVisible("caseId")
            },
            {
                id: "probandId",
                title: "Proband (Sample) and Family",
                field: "proband",
                halign: "center",
                valign: "middle",
                formatter: (value, row) => this.probandFormatter(value, row),
                visible: this.gridCommons.isColumnVisible("probandId")
            },
            {
                id: "disorderId",
                title: "Clinical Condition / Panel",
                field: "disorder",
                halign: "center",
                valign: "middle",
                formatter: (value, row) => {
                    const panelHtml = row.panels?.length > 0 ? CatalogGridFormatter.panelFormatter(row.panels) : "-";
                    return `
                        <div class="mb-1">${CatalogGridFormatter.disorderFormatter([value], row)}</div>
                        <div class="mb-1">${panelHtml}</div>
                    `;
                },
                visible: this.gridCommons.isColumnVisible("disorderId")
            },
            {
                id: "interpretation",
                title: "Interpretation",
                field: "interpretation",
                halign: "center",
                valign: "middle",
                formatter: (value, row) => this.interpretationFormatter(value, row),
                visible: this.gridCommons.isColumnVisible("interpretation")
            },
            {
                id: "status",
                title: "Status",
                field: "status",
                halign: "center",
                valign: "middle",
                formatter: this.statusFormatter.bind(this),
                events: {
                    "click a": this.onActionClick.bind(this)
                },
                visible: this.gridCommons.isColumnVisible("status")
            },
            {
                id: "priority",
                title: "Priority",
                field: "priority",
                align: "center",
                halign: "center",
                valign: "middle",
                formatter: this.priorityFormatter.bind(this),
                events: {
                    "click a": this.onActionClick.bind(this)
                },
                visible: this.gridCommons.isColumnVisible("priority")
            },
            {
                id: "analysts",
                title: "Analysts",
                field: "analysts",
                formatter: value => this.analystsFormatter(value),
                halign: "center",
                valign: "middle",
                visible: this.gridCommons.isColumnVisible("analysts")
            },

            {
                id: "dates",
                title: "Due / Creation Date",
                field: "Dates",
                halign: "center",
                valign: "middle",
                formatter: (field, clinicalAnalysis) => {
                    const dueDateString = UtilsNew.dateFormatter(clinicalAnalysis.dueDate);
                    const dueDate = new Date(dueDateString);
                    const currentDate = new Date();
                    let dueDateClass = null;
                    if (currentDate > dueDate) {
                        dueDateClass = "text-danger";
                    }
                    return `
                        <div class="${dueDateClass}">${dueDateString}</div>
                        <div class="text-body-secondary">${UtilsNew.dateFormatter(clinicalAnalysis.creationDate)}</div>
                    `;
                },
                visible: this.gridCommons.isColumnVisible("dates")
            },
            {
                id: "actions",
                align: "right",
                formatter: (value, row) => this.actionsFormatter(value, row),
                events: {
                    "click a": (event, value, row) => this.onActionClick(event, row),
                },
                visible: this._config.showActions && this.gridCommons.isColumnVisible("actions"),
            },
        ];

        this._columns = this.gridCommons.addColumnsFromExtensions(this.COMPONENT_ID, this.opencgaSession, this._columns);
        return this._columns;
    }

    actionsFormatter(value, row) {
        const session = this.opencgaSession;
        const url = `#interpreter/${session.project.id}/${session.study.id}/${row.id}`;
        const hasWritePermission = this.gridCommons.hasPermission("WRITE");
        const hasDeletePermission = this.gridCommons.hasPermission("DELETE") && !row.locked && row.analysts?.some(analyst => analyst.id === session.user.id);
        return `
            <div class="dropdown d-inline-block">
                <button class="btn" data-bs-toggle="dropdown" data-cy="actions-button">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
                <div class="dropdown-menu dropdown-menu-end">
                    <a data-action="interpreter" class="dropdown-item" href="${url}">
                        <i class="fas fa-user-md me-1"></i> Case Interpreter
                    </a>
                    <a data-action="download" class="dropdown-item cursor-pointer">
                        <i class="fas fa-download me-1"></i> Download JSON
                    </a>
                    <hr class="dropdown-divider">
                    <a data-action="lock" class="dropdown-item ${hasWritePermission ? "cursor-pointer" : "disabled"}">
                        <i class="fas ${row.locked ? "fa-unlock" : "fa-lock"} me-1"></i> ${row.locked ? "Unlock" : "Lock"}
                    </a>
                    <a data-action="edit" class="dropdown-item ${hasWritePermission ? "cursor-pointer" : "disabled"}">
                        <i class="fas fa-edit me-1"></i> Edit
                    </a>
                    <a data-action="delete" class="dropdown-item ${hasDeletePermission ? "cursor-pointer" : "disabled"}">
                        <i class="fas fa-trash me-1"></i> Delete
                    </a>
                </div>
            </div>
        `;
    }

    onActionClick(event, clinicalAnalysis) {
        const action = event.currentTarget?.dataset?.action?.toLowerCase();
        switch (action) {
            case "edit":
                this.clinicalAnalysisUpdateId = row.id;
                // TODO
                break;
            case "delete":
                this.onDelete(clinicalAnalysis);
                break;
            case "lock":
                this.onLockOrUnlock(clinicalAnalysis);
                break;
            case "download":
                this.fetchData({
                    id: clinicalAnalysis.id,
                    study: this.opencgaSession.study.fqn,
                })
                    .then(restResponse => this.download(restResponse))
                    .catch(error => console.error(error));
                break;
            case "statuschange":
                this.onChangeStatus(clinicalAnalysis, event.currentTarget.dataset.status);
                break;
            case "prioritychange":
                this.onChangePriority(clinicalAnalysis, event.currentTarget.dataset.priority);
                break;
        }
    }

    onDelete(clinicalAnalysis) {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: `Delete case '${clinicalAnalysis.id}'`,
            message: `Are you sure you want to delete case <b>'${clinicalAnalysis.id}'</b>?`,
            display: {
                okButtonText: "Yes, delete it",
            },
            ok: () => {
                this.opencgaSession.opencgaClient.clinical()
                    .delete(clinicalAnalysis.id, {
                        study: this.opencgaSession.study.fqn,
                        force: clinicalAnalysis.interpretation?.primaryFindings?.length === 0 // Only empty Cases can be deleted for now
                    })
                    .then(response => {
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                            message: `Case '${clinicalAnalysis.id}' has been deleted.`,
                        });
                        // LitUtils.dispatchCustomEvent(this, "rowUpdate", row);
                        this.table.bootstrapTable("refresh");
                    })
                    .catch(response => {
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                    });
            },
        });
    }

    onLockOrUnlock(clinicalAnalysis) {
        const updateParams = {
            locked: !clinicalAnalysis.locked,
        };
        this.opencgaSession.opencgaClient.clinical()
            .update(clinicalAnalysis.id, updateParams, {
                study: this.opencgaSession.study.fqn
            })
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    message: `Case '${clinicalAnalysis.id}' has been ${clinicalAnalysis.locked ? "unlocked" : "locked"}.`,
                });
                // LitUtils.dispatchCustomEvent(this, "rowUpdate", row);
                this.table.bootstrapTable("refresh");
            })
            .catch(response => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            });
    }

    onChangeStatus(clinicalAnalysis, status) {
        const data = {
            status: {
                id: status,
            },
        };
        this.opencgaSession.opencgaClient.clinical()
            .update(clinicalAnalysis.id, data, {
                study: this.opencgaSession.study.fqn,
            })
            .then(response => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    message: `Status of case '${clinicalAnalysis.id}' has been changed to '${status}'.`,
                });
                // LitUtils.dispatchCustomEvent(this, "rowUpdate", row);
                this.table.bootstrapTable("refresh");
            })
            .catch(response => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            });
    }

    onChangePriority(clinicalAnalysis, priority) {
        const data = {
            priority: priority,
        };
        this.opencgaSession.opencgaClient.clinical()
            .update(clinicalAnalysis.id, data, {
                study: this.opencgaSession.study.fqn,
            })
            .then(response => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    message: `Priority of case '${clinicalAnalysis.id}' has been changed to '${priority}'.`,
                });
                // LitUtils.dispatchCustomEvent(this, "rowUpdate", row);
                this.table.bootstrapTable("refresh");
            })
            .catch(response => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            });
    }

    async onDownload(e) {
        try {
            this.toolbarConfig = {...this.toolbarConfig, downloading: true};
            this.requestUpdate();
            await this.updateComplete;

            const filters = {
                ...this.filters,
                exclude: "files",
                skip: 0,
                limit: 1000,
                count: false
            };
            const restResponse = await this.fetchData(filters);
            this.download(restResponse, e?.detail?.option);
        } catch (e) {
            // in case it is a restResponse
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, e);
        }
        this.toolbarConfig = {...this.toolbarConfig, downloading: false};
        this.requestUpdate();
    }

    download(restResponse, format = "JSON") {
        const result = restResponse.getResults();
        if (result) {
            const study = this.opencgaSession.study.id;
            const filename = result.length > 1 ? `clinical-analysis-${study}` : `${result[0].id}-${study}`;
            // Check if user clicked in Tab or JSON format
            if (format?.toUpperCase() === "TAB") {
                const dataString = [
                    ["Case ID", "Proband ID", "Family (#members)", "Disorder", "Type", "Interpretation IDs", "Status", "Priority", "Assigned To", "Creation Date"].join("\t"),
                    ...result.map(row => [
                        row.id,
                        row.proband.id,
                        row.family?.id && row.family?.members?.length ? `${row.family.id} (${row.family.members.length})` : "-",
                        row.disorder?.id ?? "-",
                        row.type ?? "-",
                        row.interpretation?.id ? [`${row.interpretation.id} (primary)`, ...(row.secondaryInterpretations || []).map(s => s.id)].join(", ") : "-",
                        row.status?.id ?? "-",
                        row.priority?.id ?? "-",
                        (row.analysts || []).map(analyst => analyst.id).join(", ") ?? "-",
                        row.creationDate ? CatalogGridFormatter.dateFormatter(row.creationDate) : "-"
                    ].join("\t")),
                ];
                UtilsNew.downloadData([dataString.join("\n")], filename + ".tsv", "text/plain");
            } else {
                const json = JSON.stringify(result, null, "\t");
                UtilsNew.downloadData(json, filename + ".json", "application/json");
            }
        } else {
            console.error("Error in result format");
        }
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
                    .opencgaSession="${this.opencgaSession}"
                    .leftContent="${this.renderToolbarLeftContent()}"
                    .settings="${this.toolbarSetting}"
                    .config="${this.toolbarConfig}"
                    @columnChange="${this.onColumnChange}"
                    @download="${this.onDownload}"
                    @export="${this.onDownload}"
                    @actionClick="${e => this.onActionClick(e)}"
                    @clinicalAnalysisCreate="${this.renderRemoteTable}">
                </opencb-grid-toolbar>
            ` : nothing}

            <div id="${this._prefix}GridTableDiv" class="force-overflow">
                <table id="${this.gridId}"></table>
            </div>

            ${this.gridCommons.renderModals()}

            ${ModalUtils.create(this, `${this._prefix}UpdateModal`, {
                display: {
                    modalTitle: `Clinical Analysis Update: ${this.clinicalAnalysisUpdateId}`,
                    modalDraggable: true,
                    modalSize: "modal-lg"
                },
                render: active => {
                    return html `
                        <clinical-analysis-update
                            .clinicalAnalysisId="${this.clinicalAnalysisUpdateId}"
                            .active="${active}"
                            .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                            .opencgaSession="${this.opencgaSession}">
                        </clinical-analysis-update>
                    `;
                }
            })}
        `;
    }

    getDefaultConfig() {
        return {
            readOnlyMode: false, // it hides priority and status selectors even if the user has permissions
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 25],
            showSelectCheckbox: false,
            multiSelection: false,
            detailView: false,

            showToolbar: true,
            showActions: true,

            showCreate: true,
            showExport: true,
            showSettings: true,
            exportTabs: ["download", "link", "code"],
            highlights: [],

            showReviewCase: true,
            showInterpretation: true,
            showReport: true,
        };
    }

}

customElements.define("clinical-analysis-grid", ClinicalAnalysisGrid);
