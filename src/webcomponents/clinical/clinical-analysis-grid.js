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
import "../commons/opencb-grid-toolbar.js";
import LitUtils from "../commons/utils/lit-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import ModalUtils from "../commons/modal/modal-utils.js";

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
            newButtonLink: "#clinical-analysis-create/",
            // columns: this._getDefaultColumns().filter(col => col.field && (!col.visible || col.visible === true))
        };

        // Config for the grid toolbar
        this.toolbarConfig = {
            toolId: this.toolId,
            resource: "CLINICAL_ANALYSIS",
            columns: this._getDefaultColumns(),
            create: {
                display: {
                    modalTitle: "Clinical Analysis Create",
                    modalDraggable: true,
                    modalCyDataName: "modal-create",
                },
                render: () => html `
                    <clinical-analysis-create
                        .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                        .opencgaSession="${this.opencgaSession}">
                    </clinical-analysis-create>
                `,
            }
        };
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
                // Table properties
                pagination: this._config.pagination,
                pageSize: this._config.pageSize,
                pageList: this._config.pageList,
                paginationVAlign: "both",
                formatShowingRows: this.gridCommons.formatShowingRows,
                showExport: this._config.showExport,
                detailView: this._config.detailView,
                gridContext: this,
                formatLoadingMessage: () =>"<div><loading-spinner></loading-spinner></div>",
                ajax: params => {
                    let response = null;
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
                        .then(res => {
                            response = res;
                            params.success(res);
                        })
                        .catch(error => {
                            response = error;
                            params.error(error);
                        })
                        .finally(() => {
                            LitUtils.dispatchCustomEvent(this, "queryComplete", response);
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
            const url = `#interpreter/${this.opencgaSession.project.id}/${this.opencgaSession.study.id}/${row.id}`;
            return `
                <div style="margin: 5px 0">
                    <a title="Go to Case Interpreter" href="${url}" data-cy="case-id">
                        ${row.id}
                        ${row.locked ? "<i class=\"fas fa-lock\" aria-hidden=\"true\" style=\"padding-left:4px;\"></i>" : ""}
                    </a>
                </div>
                <div style="margin: 5px 0" data-cy="case-type">
                    <span class="help-block">${row.type}</span>
                </div>
            `;
        }
        return "-";
    }

    probandFormatter(value, row) {
        if (row.proband) {
            const samplesHtml = row.proband?.samples?.map(sample => `<span data-cy="proband-sample-id">${sample.id}</span>`)?.join("");
            return `
                <div style="margin: 5px 0">
                    <span data-cy="proband-id" style="font-weight: bold; margin: 5px 0">${row.proband?.id || "-"}</span>
                    <span data-cy="proband-id" class="help-block" style="display: inline;margin: 5px">(${samplesHtml})</span>
                </div>
                ${row.family?.id ? `
                    <div>
                        <span data-cy="family-id" style="margin: 5px 0">${row.family.id}</span>
                        <span data-cy="proband-id" class="help-block" style="display: inline;margin: 5px">(${row.family.members?.length || 0} members)</span>
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
                    <span style="margin: 5px 0">${value.stats.primaryFindings.numVariants} variants</span>
                </div>
                <div>
                    <span class="help-block" style="margin: 5px 0">${value.stats.primaryFindings.statusCount?.REVIEWED} reviewed</span>
                </div>
                <div>
                    <span class="help-block" style="margin: 5px 0">
                        ${tierStats}
                    </span>
                </div>
                <div>
                    <span class="help-block" style="margin: 5px 0">
                        ${Object.keys(value.stats.primaryFindings.geneCount).length} genes
                    </span>
                </div>
            `;
        } else {
            if (row.interpretation?.primaryFindings?.length > 0) {
                const reviewedVariants = row.interpretation.primaryFindings.filter(v => v.status === "REVIEWED");
                html = `
                    <div>
                        <span style="margin: 5px 0">${row.interpretation.primaryFindings.length} variants</span>
                    </div>
                    <div>
                        <span class="help-block" style="margin: 5px 0">${reviewedVariants.length} reviewed</span>
                    </div>
                `;
            } else {
                html = "<span>0 variants</span>";
            }
        }

        const interpretationUrl = `#interpreter/${this.opencgaSession.project.id}/${this.opencgaSession.study.id}/${row.id}`;
        return `
            <a class="btn force-text-left" data-action="interpreter" title="Go to Case Interpreter" href="${interpretationUrl}">
                ${html}
            </a>
        `;
    }

    priorityFormatter(value, row) {
        // TODO remove this code as soon as new OpenCGA configuration is in place
        const _priorities = this.opencgaSession?.study?.internal?.configuration?.clinical?.priorities || [];

        // Priorities classes
        const priorityMap = {
            URGENT: "label-danger",
            HIGH: "label-warning",
            MEDIUM: "label-primary",
            LOW: "label-info"
        };
        const priorityRankToColor = [
            "label-danger",
            "label-warning",
            "label-primary",
            "label-info",
            "label-success",
            "label-default"
        ];

        const hasWriteAccess = OpencgaCatalogUtils.checkPermissions(this.opencgaSession.study, this.opencgaSession.user.id, "WRITE_CLINICAL_ANALYSIS");
        const isEditable = !this._config.readOnlyMode && hasWriteAccess && !row.locked; // priority is editable

        // Dropdown button styles and classes
        const btnClassName = "btn btn-default btn-sm btn-block dropdown-toggle";
        const btnStyle = "display:inline-flex;align-items:center;";

        // Current priority
        const currentPriorityText = value?.id ?? value ?? "-";
        const currentPriorityLabel = priorityRankToColor[value?.rank ?? ""] ?? priorityMap[value ?? ""] ?? "";

        return `
            <div class="dropdown">
                <button class="${btnClassName}" type="button" data-toggle="dropdown" style="${btnStyle}" ${!isEditable ? "disabled=\"disabled\"" : ""}>
                    <span class="label ${currentPriorityLabel}" style="margin-right:auto;top:0;">
                        ${currentPriorityText}
                    </span>
                    <span class="caret"></span>
                </button>
                ${isEditable ? `
                    <ul class="dropdown-menu">
                        ${_priorities.map(priority => `
                            <li>
                                <a class="btn force-text-left right-icon" data-action="priorityChange" data-priority="${priority.id}">
                                    <span class="label ${priorityRankToColor[priority?.rank ?? ""] ?? ""}">
                                        ${priority.id}
                                    </span>
                                    <p class="text-muted">
                                        <small>${priority.description}</small>
                                    </p>
                                    ${priority.id === value?.id ? "<i class=\"fas fa-check\"></i>" : ""}
                                </a>
                            </li>
                        `).join("")}
                    </ul>
                ` : ""}
            </div>
        `;
    }

    statusFormatter(value, row) {
        // TODO remove this code as soon as new OpenCGA configuration is in place
        const _status = this.opencgaSession.study?.internal?.configuration?.clinical?.status || [];

        const hasWriteAccess = OpencgaCatalogUtils.checkPermissions(this.opencgaSession.study, this.opencgaSession.user.id, "WRITE_CLINICAL_ANALYSIS");
        const isEditable = !this._config.readOnlyMode && hasWriteAccess && !row.locked; // status is editable

        const currentStatus = value.id || value.name || "-"; // Get current status

        // Dropdown button styles and classes
        const btnClassName = "btn btn-default btn-sm btn-block dropdown-toggle";
        const btnStyle = "display:inline-flex;align-items:center;";

        return `
            <div class="dropdown">
                <button class="${btnClassName}" type="button" data-toggle="dropdown" style="${btnStyle}" ${!isEditable ? "disabled=\"disabled\"" : ""}>
                    <span style="margin-right:auto;">${currentStatus}</span>
                    <span class="caret"></span>
                </button>
                ${isEditable ? `
                    <ul class="dropdown-menu dropdown-menu-right">
                        ${_status[row.type].map(({id, description}) => `
                            <li>
                                <a class="btn force-text-left right-icon" data-action="statusChange" data-status="${id}">
                                    ${id === currentStatus ? `<strong>${id}</strong>` : id}
                                    <p class="text-muted"><small>${description}</small></p>
                                    ${id === currentStatus ? "<i class=\"fas fa-check\"></i>" : ""}
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

    async onActionClick(e, _, row) {
        const action = e.target.dataset.action?.toLowerCase() || e.detail.action;
        switch (action) {
            case "edit":
                this.clinicalAnalysisUpdateId = row.id;
                this.requestUpdate();
                await this.updateComplete;
                ModalUtils.show(`${this._prefix}UpdateModal`);
                break;
            case "delete":
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
                    title: `Delete case '${row.id}'`,
                    message: `Are you sure you want to delete case <b>'${row.id}'</b>?`,
                    display: {
                        okButtonText: "Yes, delete it",
                    },
                    ok: () => {
                        const clinicalAnalysisId = row.id;
                        this.opencgaSession.opencgaClient.clinical()
                            .delete(clinicalAnalysisId, {
                                study: this.opencgaSession.study.fqn,
                                force: row.interpretation?.primaryFindings?.length === 0 // Only empty Cases can be deleted for now
                            })
                            .then(response => {
                                if (response.getResultEvents("ERROR").length) {
                                    return NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                                }
                                // Display confirmation message and update the table
                                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                                    message: `Case '${clinicalAnalysisId}' has been deleted.`,
                                });
                                LitUtils.dispatchCustomEvent(this, "rowUpdate", row);
                                this.removeRowTable(clinicalAnalysisId);
                            })
                            .catch(response => {
                                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                            });
                    },
                });
                break;
            case "lock": // Lock or unlock de case
                const updateParams = {
                    locked: !row.locked,
                };
                return this.opencgaSession.opencgaClient.clinical()
                    .update(row.id, updateParams, {
                        study: this.opencgaSession.study.fqn
                    })
                    .then(() => {
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                            message: `Case '${row.id}' has been ${row.locked ? "unlocked" : "locked"}.`,
                        });
                        LitUtils.dispatchCustomEvent(this, "rowUpdate", row);
                        this.renderRemoteTable();
                    })
                    .catch(response => {
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                    });
            case "download":
                this.fetchData({id: row.id, study: this.opencgaSession.study.fqn})
                    .then(restResponse => this.download(restResponse))
                    .catch(error => console.error(error));
                break;
            case "statuschange":
                const {status} = e.currentTarget.dataset;
                this.opencgaSession.opencgaClient.clinical()
                    .update(row.id, {status: {id: status}}, {study: this.opencgaSession.study.fqn})
                    .then(response => {
                        if (!response.getResultEvents("ERROR").length) {
                            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                                message: `Status of case '${row.id}' has been changed to '${status}'.`,
                            });
                            LitUtils.dispatchCustomEvent(this, "rowUpdate", row);
                            this.renderRemoteTable();
                        } else {
                            // console.error(response);
                            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                        }
                    })
                    .catch(response => {
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                    });
                break;
            case "prioritychange":
                const {priority} = e.currentTarget.dataset;
                this.opencgaSession.opencgaClient.clinical()
                    .update(row.id, {priority}, {study: this.opencgaSession.study.fqn})
                    .then(response => {
                        if (!response.getResultEvents("ERROR").length) {
                            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                                message: `Priority of case '${row.id}' has been changed to '${priority}'.`,
                            });
                            LitUtils.dispatchCustomEvent(this, "rowUpdate", row);
                            this.renderRemoteTable();
                        } else {
                            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                        }
                    })
                    .catch(response => {
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                    });
                break;
            default:
                break;
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
                        <div>${CatalogGridFormatter.disorderFormatter([value], row)}</div>
                        <div style="margin: 5px 0">${panelHtml}</div>
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
                    let dueDateStyle = null;
                    if (currentDate > dueDate) {
                        dueDateStyle = "color: darkred";
                    }
                    return `
                        <div style="${dueDateStyle}">${dueDateString}</div>
                        <div class="help-block">${UtilsNew.dateFormatter(clinicalAnalysis.creationDate)}</div>
                    `;
                },
                visible: this.gridCommons.isColumnVisible("dates")
            },
        ];

        if (this.opencgaSession && this._config.showActions) {
            this._columns.push({
                id: "actions",
                title: "Actions",
                field: "actions",
                valign: "middle",
                align: "center",
                formatter: (value, row) => {
                    const session = this.opencgaSession;
                    const url = `#interpreter/${session.project.id}/${session.study.id}/${row.id}`;
                    const hasWriteAccess = OpencgaCatalogUtils.checkPermissions(session.study, session.user.id, "WRITE_CLINICAL_ANALYSIS");
                    const hasAdminAccess = hasWriteAccess || "disabled";
                    const lockActionIcon = row.locked ? "fa-unlock" : "fa-lock";
                    const lockActionText = row.locked ? "Unlock" : "Lock";
                    const isOwnOrIsLocked = row.locked || !row.analysts?.some(analyst => analyst.id === this.opencgaSession?.user?.id) ? "disabled" : "";

                    return `
                        <div class="inline-block dropdown">
                            <button class="btn btn-default btn-sm dropdown-toggle" type="button" data-toggle="dropdown">
                                <i class="fas fa-toolbox icon-padding" aria-hidden="true"></i>
                                <span>Actions</span>
                                <span class="caret" style="margin-left: 5px"></span>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-right">
                                <!-- Open the case in the case interpreter -->
                                <li>
                                    <a class="btn force-text-left" data-action="interpreter" href="${url}">
                                        <i class="fas fa-user-md icon-padding" aria-hidden="true"></i> Case Interpreter
                                    </a>
                                </li>
                                <!-- Download the case -->
                                <li>
                                    <a href="javascript: void 0" class="btn force-text-left" data-action="download">
                                        <i class="fas fa-download icon-padding" aria-hidden="true"></i> Download
                                    </a>
                                </li>
                                <!-- Perfom write operations to the case -->
                                ${hasWriteAccess ? `
                                    <li role="separator" class="divider"></li>
                                    <!-- Lock or unlock the case -->
                                    <li>
                                        <a class="btn force-text-left" data-action="lock">
                                            <i class="fas ${lockActionIcon} icon-padding" aria-hidden="true"></i> ${lockActionText}
                                        </a>
                                    </li>
                                    <!-- Edit the case -->
                                    <li>
                                        <a data-action="edit" class="btn force-text-left ${hasAdminAccess}">
                                            <i class="fas fa-edit icon-padding" aria-hidden="true"></i> Edit ...
                                        </a>
                                    </li>
                                    <!-- Delete the case -->
                                    <li>
                                        <a href="javascript: void 0" class="${isOwnOrIsLocked} btn force-text-left" data-action="delete">
                                            <i class="fas fa-trash icon-padding" aria-hidden="true"></i> Delete
                                        </a>
                                    </li>
                                ` : ""}
                            </ul>
                        </div>
                    `;
                },
                events: {
                    "click a": this.onActionClick.bind(this)
                },
                visible: this.gridCommons.isColumnVisible("actions"),
            });
        }

        this._columns = this.gridCommons.addColumnsFromExtensions(this._columns, this.COMPONENT_ID);
        return this._columns;
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

    render() {
        return html`
            ${this._config.showToolbar ? html`
                <opencb-grid-toolbar
                    .opencgaSession="${this.opencgaSession}"
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

            ${ModalUtils.create(this, `${this._prefix}UpdateModal`, {
                display: {
                    modalTitle: `Clinical Analysis Update: ${this.clinicalAnalysisUpdateId}`,
                    modalDraggable: true,
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
