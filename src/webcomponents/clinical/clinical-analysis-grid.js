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
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
    }

    updated(changedProperties) {
        if ((changedProperties.has("opencgaSession") || changedProperties.has("query") || changedProperties.has("config") ||
            changedProperties.has("active")) && this.active) {
            this.propertyObserver();
        }
    }

    propertyObserver() {
        // With each property change we must update config and create the columns again. No extra checks are needed.
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config
        };
        // Config for the grid toolbar
        this.toolbarConfig = {
            ...this._config.toolbar,
            newButtonLink: "#clinical-analysis-create/",
            showCreate: false,
            columns: this._getDefaultColumns(),
        };
        this.renderRemoteTable();
        this.requestUpdate();
    }

    renderRemoteTable() {
        if (this.opencgaSession?.opencgaClient && this.opencgaSession?.study?.fqn) {
            // const filters = {...this.query};
            if (this.lastFilters && JSON.stringify(this.lastFilters) === JSON.stringify(this.query)) {
                // Abort destroying and creating again the grid. The filters have not changed
                return;
            }

            this.table = $("#" + this.gridId);
            this.table.bootstrapTable("destroy");
            this.table.bootstrapTable({
                theadClasses: "table-light",
                buttonsClass: "light",
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

    async fetchData(query) {
        try {
            return await this.opencgaSession.opencgaClient.clinical().search(query);
        } catch (e) {
            console.error(e);
            await Promise.reject(e);
        }
    }

    onColumnChange(e) {
        this.gridCommons.onColumnChange(e);
    }

    caseFormatter(value, row) {
        if (row?.id) {
            const url = `#interpreter/${this.opencgaSession.project.id}/${this.opencgaSession.study.id}/${row.id}`;
            return `
                <div style="margin: 5px 0">
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
                </div>`;
        } else {
            if (row.interpretation?.primaryFindings?.length > 0) {
                const reviewedVariants = row.interpretation.primaryFindings.filter(v => v.status === "REVIEWED");
                html = `
                    <div>
                        <span style="margin: 5px 0">${row.interpretation.primaryFindings.length} variants</span>
                    </div>
                    <div>
                        <span class="help-block" style="margin: 5px 0">${reviewedVariants.length} reviewed</span>
                    </div>`;
            } else {
                html = "<span>0 variants</span>";
            }
        }

        return `
            <a class="text-decoration-none" data-action="interpreter" title="Go to Case Interpreter"
                    href="#interpreter/${this.opencgaSession.project.id}/${this.opencgaSession.study.id}/${row.id}">
                ${html}
            </a>`;
    }

    priorityFormatter(value, row) {
        // TODO remove this code as soon as new OpenCGA configuration is in place
        const _priorities = this.opencgaSession?.study?.internal?.configuration?.clinical?.priorities || [];

        // Priorities classes
        const priorityMap = {
            URGENT: "text-bg-danger",
            HIGH: "text-bg-warning",
            MEDIUM: "text-bg-primary",
            LOW: "text-bg-info"
        };
        const priorityRankToColor = [
            "text-bg-danger",
            "text-bg-warning",
            "text-bg-primary",
            "text-bg-info",
            "text-bg-success",
            "text-bg-light"
        ];

        const hasWriteAccess = OpencgaCatalogUtils.checkPermissions(this.opencgaSession.study, this.opencgaSession.user.id, "WRITE_CLINICAL_ANALYSIS");
        const isEditable = !this._config.readOnlyMode && hasWriteAccess && !row.locked; // priority is editable

        // Dropdown button styles and classes
        const btnClassName = "btn btn-light btn-block dropdown-toggle";
        const btnStyle = "display:inline-flex;align-items:center;";

        // Current priority
        const currentPriorityText = value?.id ?? value ?? "-";
        const currentPriorityLabel = priorityRankToColor[value?.rank ?? ""] ?? priorityMap[value ?? ""] ?? "";

        return `
            <div class="dropdown">
                <button class="${btnClassName}" type="button" data-bs-toggle="dropdown" style="${btnStyle}" ${!isEditable ? "disabled=\"disabled\"" : ""}>
                    <span class="badge ${currentPriorityLabel} me-auto top-0">
                        ${currentPriorityText}
                    </span>

                </button>
                ${isEditable ? `
                    <ul class="dropdown-menu">
                        ${_priorities.map(priority => `
                            <li>
                                <a class="d-flex dropdown-item" data-action="priorityChange" data-priority="${priority.id}">
                                    <div class="flex-grow-1">
                                        <span class="badge ${priorityRankToColor[priority?.rank ?? ""] ?? ""}">
                                            ${priority.id}
                                        </span>
                                        <p class="form-text">
                                            <small>${priority.description}</small>
                                        </p>
                                    </div>
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
                <button class="${btnClassName}" type="button" data-bs-toggle="dropdown" style="${btnStyle}" ${!isEditable ? "disabled=\"disabled\"" : ""}>
                    <span style="margin-right:auto;">${currentStatus}</span>

                </button>
                ${isEditable ? `
                    <ul class="dropdown-menu dropdown-menu-right">
                        ${_status[row.type].map(({id, description}) => `
                            <li>
                                <a class="dropdown-item right-icon" data-action="statusChange" data-status="${id}">
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

    onActionClick(e, _, row) {
        const {action} = e.currentTarget.dataset;
        if (action === "delete") {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
                title: `Delete case '${row.id}'`,
                message: `Are you sure you want to delete case <b>'${row.id}'</b>?`,
                display: {
                    okButtonText: "Yes, delete it",
                },
                ok: () => {
                    const clinicalAnalysisId = row.id;
                    this.opencgaSession.opencgaClient.clinical().delete(clinicalAnalysisId, {
                        study: this.opencgaSession.study.fqn,
                        force: row.interpretation?.primaryFindings?.length === 0 // Only empty Cases can be deleted for now
                    }).then(response => {
                        if (response.getResultEvents("ERROR").length) {
                            return NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                        }
                        // Display confirmation message and update the table
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                            message: `Case '${clinicalAnalysisId}' has been deleted.`,
                        });
                        LitUtils.dispatchCustomEvent(this, "rowUpdate", row);
                        this.removeRowTable(clinicalAnalysisId);
                    }).catch(response => {
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                    });
                },
            });
        }

        // Lock or unlock the case
        if (action === "lock") {
            const updateParams = {
                locked: !row.locked,
            };

            return this.opencgaSession.opencgaClient.clinical().update(row.id, updateParams, {
                study: this.opencgaSession.study.fqn,
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
        }

        if (action === "download") {
            this.fetchData({id: row.id, study: this.opencgaSession.study.fqn})
                .then(restResponse => this.download(restResponse))
                .catch(error => console.error(error));
        }

        if (action === "statusChange") {
            const {status} = e.currentTarget.dataset;
            this.opencgaSession.opencgaClient.clinical().update(row.id, {status: {id: status}}, {study: this.opencgaSession.study.fqn})
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
        }

        if (action === "priorityChange") {
            const {priority} = e.currentTarget.dataset;
            this.opencgaSession.opencgaClient.clinical().update(row.id, {priority}, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    if (!response.getResultEvents("ERROR").length) {
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                            message: `Priority of case '${row.id}' has been changed to '${priority}'.`,
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
        }
    }

    _getDefaultColumns() {
        let _columns = [
            {
                id: "caseId",
                title: "Case",
                field: "id",
                halign: this._config.header.horizontalAlign,
                valign: "middle",
                formatter: (value, row) => this.caseFormatter(value, row),
            },
            {
                id: "probandId",
                title: "Proband (Sample) and Family",
                field: "proband",
                halign: this._config.header.horizontalAlign,
                valign: "middle",
                formatter: (value, row) => this.probandFormatter(value, row),
            },
            {
                id: "disorderId",
                title: "Clinical Condition / Panel",
                field: "disorder",
                halign: this._config.header.horizontalAlign,
                valign: "middle",
                formatter: (value, row) => {
                    const panelHtml = row.panels?.length > 0 ? CatalogGridFormatter.panelFormatter(row.panels) : "-";
                    return `
                        <div>${CatalogGridFormatter.disorderFormatter(value, row)}</div>
                        <div style="margin: 5px 0">${panelHtml}</div>
                    `;
                },
            },
            {
                id: "interpretation",
                title: "Interpretation",
                field: "interpretation",
                halign: this._config.header.horizontalAlign,
                valign: "middle",
                formatter: (value, row) => this.interpretationFormatter(value, row),
            },
            {
                id: "status",
                title: "Status",
                field: "status",
                halign: this._config.header.horizontalAlign,
                valign: "middle",
                formatter: this.statusFormatter.bind(this),
                events: {
                    "click a": this.onActionClick.bind(this)
                },
                visible: !!this.opencgaSession.study?.internal?.configuration?.clinical?.status
            },
            {
                id: "priority",
                title: "Priority",
                field: "priority",
                align: "center",
                halign: this._config.header.horizontalAlign,
                valign: "middle",
                formatter: this.priorityFormatter.bind(this),
                events: {
                    "click a": this.onActionClick.bind(this)
                },
                visible: !!this.opencgaSession.study?.internal?.configuration?.clinical?.priorities
            },
            {
                id: "Analyst",
                title: "Analyst",
                field: "analyst.id",
                align: "center",
                halign: this._config.header.horizontalAlign,
                valign: "middle"
            },
            {
                id: "dates",
                title: "Due / Creation Date",
                field: "Dates",
                halign: this._config.header.horizontalAlign,
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
                }
                // visible: !this._config.columns.hidden.includes("dueDate")
            },
            {
                id: "state",
                field: "state",
                checkbox: true,
                class: "cursor-pointer",
                eligible: false,
                visible: this._config.showSelectCheckbox
            }
        ];

        if (this.opencgaSession && this._config.showActions) {
            _columns.push({
                id: "actions",
                title: "Actions",
                field: "actions",
                halign: this._config.header.horizontalAlign,
                valign: "middle",
                formatter: (value, row) => {
                    const session = this.opencgaSession;
                    const url = `#interpreter/${session.project.id}/${session.study.id}/${row.id}`;
                    const hasWriteAccess = OpencgaCatalogUtils.checkPermissions(session.study, session.user.id, "WRITE_CLINICAL_ANALYSIS");

                    const lockActionIcon = row.locked ? "fa-unlock" : "fa-lock";
                    const lockActionText = row.locked ? "Unlock" : "Lock";

                    const isOwnOrIsLocked = row.locked || this.opencgaSession?.user?.id !== row.analyst?.id ? "disabled" : "";

                    // Generate actions dropdown
                    return `
                        <div class="dropdown">
                            <button class="btn btn-light btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                <i class="fas fa-toolbox" aria-hidden="true"></i>
                                <span>Actions</span>
                                <span class="caret" style="margin-left: 5px"></span>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-right">
                                <!-- Open the case in the case interpreter -->
                                <li>
                                    <a class="dropdown-item" data-action="interpreter" href="${url}">
                                        <i class="fas fa-user-md" aria-hidden="true"></i> Case Interpreter
                                    </a>
                                </li>
                                <!-- Download the case -->
                                <li>
                                    <a href="javascript: void 0" class="dropdown-item" data-action="download">
                                        <i class="fas fa-download" aria-hidden="true"></i> Download
                                    </a>
                                </li>
                                <!-- Perfom write operations to the case -->
                                ${hasWriteAccess ? `
                                    <li><hr class="dropdown-divider"></li>
                                    <!-- Lock or unlock the case -->
                                    <li>
                                        <a class="dropdown-item" data-action="lock">
                                            <i class="fas ${lockActionIcon}" aria-hidden="true"></i> ${lockActionText}
                                        </a>
                                    </li>
                                    <!-- Delete the case -->
                                    <li>
                                        <a href="javascript: void 0" class="${isOwnOrIsLocked} dropdown-item" data-action="delete">
                                            <i class="fas fa-trash" aria-hidden="true"></i> Delete
                                        </a>
                                    </li>
                                ` : ""}
                            </ul>
                        </div>
                    `;
                },
                align: "center",
                events: {
                    "click a": this.onActionClick.bind(this)
                },
                visible: !this._config.columns?.hidden?.includes("actions")
            });
        }

        _columns = UtilsNew.mergeTable(_columns, this._config.columns || this._config.hiddenColumns, !!this._config.hiddenColumns);
        _columns = this.gridCommons.addColumnsFromExtensions(_columns, this.COMPONENT_ID);
        return _columns;
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
                        row.analyst?.id ?? "-",
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
                    .config="${this.toolbarConfig}"
                    @columnChange="${this.onColumnChange}"
                    @download="${this.onDownload}"
                    @export="${this.onDownload}">
                </opencb-grid-toolbar>` : nothing
            }

            <div id="${this._prefix}GridTableDiv" class="force-overflow">
                <table id="${this.gridId}"></table>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            readOnlyMode: false, // it hides priority and status selectors even if the user has permissions
            pagination: true,
            pageSize: 10,
            pageList: [10, 25, 50],
            showExport: false,
            showReviewCase: true,
            showInterpretation: true,
            showReport: true,
            detailView: false,
            // detailFormatter: this.detailFormatter, // function with the detail formatter
            showSelectCheckbox: false,
            showActions: true,
            showToolbar: true,
            header: {
                horizontalAlign: "center",
                verticalAlign: "bottom"
            },
            // It comes from external settings, and it is used in _getDefaultColumns()
            // columns: []
        };
    }

}

customElements.define("clinical-analysis-grid", ClinicalAnalysisGrid);
