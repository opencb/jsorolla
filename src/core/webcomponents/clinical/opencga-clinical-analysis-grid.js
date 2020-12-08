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

import {LitElement, html} from "/web_modules/lit-element.js";
import {classMap} from "/web_modules/lit-html/directives/class-map.js";
import OpencgaCatalogUtils from "../../clients/opencga/opencga-catalog-utils.js";
import UtilsNew from "../../utilsNew.js";
import GridCommons from "../commons/grid-commons.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter.js";
import "../commons/opencb-grid-toolbar.js";


export default class OpencgaClinicalAnalysisGrid extends LitElement {

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
            // analyses: {
            //     type: Array
            // },
            query: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        this.gridId = this._prefix + "ClinicalAnalysisGrid";

        // TODO remove this code as soon as new OpenCGA configuration is in place
        this.status = {
            FAMILY: [
                {
                    id: "READY_FOR_INTERPRETATION",
                    description: "The Clinical Analysis is ready for interpretations"
                },
                {
                    id: "READY_FOR_REPORT",
                    description: "The Interpretation is finished and it is to create the report"
                },
                {
                    id: "CLOSED",
                    description: "The Clinical Analysis is closed"
                },
                {
                    id: "REJECTED",
                    description: "The Clinical Analysis is rejected"
                }
            ],
            CANCER: [
                {
                    id: "READY_FOR_INTERPRETATION",
                    description: "The Clinical Analysis is ready for interpretations"
                },
                {
                    id: "READY_FOR_REPORT",
                    description: "The Interpretation is finished and it is to create the report"
                },
                {
                    id: "CLOSED",
                    description: "The Clinical Analysis is closed"
                },
                {
                    id: "REJECTED",
                    description: "The Clinical Analysis is rejected"
                }
            ],
            SINGLE: [
                {
                    id: "READY_FOR_INTERPRETATION",
                    description: "The Clinical Analysis is ready for interpretations"
                },
                {
                    id: "READY_FOR_REPORT",
                    description: "The Interpretation is finished and it is to create the report"
                },
                {
                    id: "CLOSED",
                    description: "The Clinical Analysis is closed"
                },
                {
                    id: "REJECTED",
                    description: "The Clinical Analysis is rejected"
                }
            ]
        };

        this.priorities = [
            {
                id: "URGENT",
                description: "Highest priority of all",
                rank: 1,
                defaultPriority: false
            },
            {
                id: "HIGH",
                description: "Second highest priority of all",
                rank: 2,
                defaultPriority: false
            },
            {
                id: "MEDIUM",
                description: "Intermediate priority",
                rank: 3,
                defaultPriority: false
            },
            {
                id: "LOW",
                description: "Low priority",
                rank: 4,
                defaultPriority: false
            },
            {
                id: "UNKNOWN",
                description: "Unknown priority. Treated as the lowest priority of all.",
                rank: 5,
                defaultPriority: true
            }
        ];
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
    }

    firstUpdated(_changedProperties) {
        this.table = $("#" + this.gridId);
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("query") || changedProperties.has("config")) {
            this.propertyObserver();
        }
    }

    propertyObserver() {
        // With each property change we must updated config and create the columns again. No extra checks are needed.
        this._config = Object.assign({}, this.getDefaultConfig(), this.config);

        // Config for the grid toolbar
        this.toolbarConfig = {
            ...this._config.toolbar,
            columns: this._getDefaultColumns().filter(col => col.field && col.visible)
        };

        this.renderTable();
        this.requestUpdate();
    }

    renderTable() {
        if (this.opencgaSession?.opencgaClient && this.opencgaSession.study?.fqn) {
            this.table = $("#" + this.gridId);
            this.table.bootstrapTable("destroy");
            this.table.bootstrapTable({
                columns: this._getDefaultColumns(),
                method: "get",
                sidePagination: "server",
                uniqueId: "id",

                // Table properties
                pagination: this._config.pagination,
                pageSize: this._config.pageSize,
                pageList: this._config.pageList,
                paginationVAlign: "both",
                formatShowingRows: this.gridCommons.formatShowingRows,
                showExport: this._config.showExport,
                detailView: this._config.detailView,
                // detailFormatter: _this._config.detailFormatter,

                // Make Polymer components available to table formatters
                gridContext: this,
                formatLoadingMessage: () =>"<div><loading-spinner></loading-spinner></div>",

                ajax: async params => {
                    const query = {
                        study: this.opencgaSession.study.fqn,
                        limit: params.data.limit,
                        skip: params.data.offset || 0,
                        count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                        exclude: "files",
                        ...this.query
                    };

                    try {
                        const data = await this.fetchData(query);
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
                        if (element[0].innerHTML.includes("icon-plus")) {
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
                onPostBody: function (data) {
                    // Add qtip2 tooltips to Interpretation genotypes
                    /*$("div.interpretation-tooltip").qtip({
                        content: {
                            title: "Clinical Interpreters",
                            text: function (event, api) {
                                return $(this).attr("data-tooltip-text");
                            }
                        },
                        position: {
                            target: "mouse",
                            adjust: {
                                x: 2, y: 2,
                                mouse: false
                            }
                        },
                        style: {
                            classes: "qtip-light qtip-rounded qtip-shadow",
                            width: "320px"
                        },
                        show: {
                            delay: 200
                        },
                        hide: {
                            fixed: true,
                            delay: 300
                        }
                    });*/
                }
            });
        } else {
            // Delete table
            $("#" + this.gridId).bootstrapTable("destroy");
            this.numTotalResults = 0;
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

    /**
     * DEPRECATED.
     * @param index
     * @param row
     * @returns {HTMLElement}
     */
    detailFormatter(index, row) {
        const clinicalAnalysisView = document.createElement("clinical-analysis-view");
        clinicalAnalysisView.opencgaSession = this.gridContext.opencgaSession;
        clinicalAnalysisView.opencgaClient = this.gridContext.opencgaSession.opencgaClient;
        clinicalAnalysisView.clinicalAnalysisId = row.id;
        clinicalAnalysisView.showTitle = false;

        const title = document.createElement("h3");
        title.innerText = "Summary";

        const div = document.createElement("div");
        div.style = "padding: 5px 20px 10px 20px";
        div.appendChild(title);
        div.appendChild(clinicalAnalysisView);

        return div;
    }

    caseFormatter(value, row) {
        if (row?.id) {
            return `<p style="margin: 5px 0">
                        <a title="Go to Case Interpreter" href="#interpreter/${this.opencgaSession.project.id}/${this.opencgaSession.study.id}/${row.id}" data-cy="case-id">${row.id}</a>
                    </p>
                    <p style="margin: 5px 0">
                        ${row.type}
                    </p>`;
        } else {
            return "-";
        }
    }

    interpretationFormatter(value, row) {
        let html = "";
        if (row.interpretation?.primaryFindings?.length > 0) {
            let reviewedVariants = row.interpretation.primaryFindings.filter(v => v.status === "REVIEWED");
            html = `<div>
                        <span style="margin: 5px 0">${row.interpretation.primaryFindings.length} variants</span>
                    </div>
                    <div>
                        <span class="help-block" style="margin: 5px 0">${reviewedVariants.length} reviewed</span>
                    </div>`;
        } else {
            html = "<span>0 variants</span>";
        }

        return `<a class="btn force-text-left" data-action="interpreter" title="Go to Case Interpreter" 
                        href="#interpreter/${this.opencgaSession.project.id}/${this.opencgaSession.study.id}/${row.id}">
                    ${html}   
                </a>`;
    }

    priorityFormatter(value) {
        // TODO remove this code as soon as new OpenCGA configuration is in place
        const _priorities = this.opencgaSession.study?.configuration?.clinical ? this.opencgaSession.study.configuration.clinical.priorities : this.priorities;
        const priorityMap = {
            URGENT: "label-danger",
            HIGH: "label-warning",
            MEDIUM: "label-primary",
            LOW: "label-info"
        };
        // TODO /remove this code as soon as new OpenCGA configuration is in place


        const priorityRankToColor = ["label-danger", "label-warning", "label-primary", "label-info", "label-success", "label-default"];

        if (UtilsNew.isEmpty(value)) {
            return "<span>-</span>";
        } else if (!this._config.readOnlyMode && OpencgaCatalogUtils.checkPermissions(this.opencgaSession.study, this.opencgaSession.user.id, "WRITE_CLINICAL_ANALYSIS")) {
            return ` <div class="dropdown">
                    <button class="btn btn-default btn-sm dropdown-toggle one-line" type="button" data-toggle="dropdown">
                        <span class="label ${priorityRankToColor[value.rank] ?? priorityMap[value]}">
                            ${value.id ?? value}
                        </span>
                        <span class="caret" style="margin-left: 5px"></span>
                    </button>
                    <ul class="dropdown-menu">
                        ${_priorities.map(priority => {
                            return `<li>
                                        <a href="javascript: void 0" class="btn force-text-left right-icon" data-action="priorityChange" data-priority="${priority.id}">
                                            <span class="label ${priorityRankToColor[priority.rank]}">
                                                ${priority.id}
                                            </span>
                                            <p class="text-muted"><small>${priority.description}</small></p>
                                            ${priority.id === value.id ? "<i class=\"fas fa-check\"></i>" : ""}
                                        </a>
                                    </li>`;
                        }).join("")}         
                    </ul>
                </div>`;
        } else {
            return `<span class='label ${priorityRankToColor[value.rank]}'>${value.id}</span>`;

        }
    }

    statusFormatter(value, row) {
        // TODO remove this code as soon as new OpenCGA configuration is in place
        const _status = this.opencgaSession.study?.configuration?.clinical?.status ? this.opencgaSession.study.configuration.clinical.status : this.status;
        value = {id: value.name, ...value};
        // TODO /remove this code as soon as new OpenCGA configuration is in place

        return !this._config.readOnlyMode && OpencgaCatalogUtils.checkPermissions(this.opencgaSession.study, this.opencgaSession.user.id, "WRITE_CLINICAL_ANALYSIS") ? `
                <div class="dropdown">
                    <button class="btn btn-default btn-sm dropdown-toggle one-line" type="button" data-toggle="dropdown">${value.id}
                        <span class="caret" style="margin-left: 5px"></span>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-right">
                        ${_status[row.type].map(({id, description}) => `
                            <li>
                                <a href="javascript: void 0" class="btn force-text-left right-icon" data-action="statusChange" data-status="${id}">
                                    ${id === value.id ? `<strong>${id}</strong>` : id}
                                    <p class="text-muted"><small>${description}</small></p>
                                    ${id === value.id ? "<i class=\"fas fa-check\"></i>" : ""}
                                </a>
                            </li>
                        `).join("")}
                        
                    </ul>
                </div>` :
            value.id;
    }

    onActionClick(e, _, row) {
        const {action} = e.currentTarget.dataset;
        if (action === "delete") {
            Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Yes, delete it!"
            }).then(result => {
                if (result.value) {
                    const clinicalAnalysisId = row.id;
                    this.opencgaSession.opencgaClient.clinical().delete(clinicalAnalysisId, {
                        study: this.opencgaSession.study.fqn,
                        force: row.interpretation?.primaryFindings?.length === 0 // Only empty Cases can be deleted for now
                    }).then(restResponse => {
                        if (restResponse.getResultEvents("ERROR").length) {
                            Swal.fire({
                                title: "Error",
                                icon: "error",
                                html: restResponse.getResultEvents("ERROR").map(event => event.message).join("<br>")
                            });
                        } else {
                            Swal.fire(
                                "Deleted!",
                                "Clinical Analysis has been deleted.",
                                "success"
                            );
                            this.renderTable();
                        }
                    }).catch(restResponse => {
                        Swal.fire(
                            "Server Error!",
                            "Clinical Analysis has not been correctly deleted.",
                            "error"
                        );
                    });
                }
            });
        }
        if (action === "download") {
            UtilsNew.downloadData([JSON.stringify(row, null, "\t")], row.id + ".json");
        }
        if (action === "statusChange") {
            const {status} = e.currentTarget.dataset;
            this.opencgaSession.opencgaClient.clinical().update(row.id, {status: {id: status}}, {study: this.opencgaSession.study.fqn})
                .then(restResponse => {
                    if (!restResponse.getResultEvents("ERROR").length) {
                        this.renderTable();
                    } else {
                        console.error(restResponse);
                    }
                })
                .catch(response => {
                    UtilsNew.notifyError(response);
                });
        }
        if (action === "priorityChange") {
            const {priority} = e.currentTarget.dataset;
            this.opencgaSession.opencgaClient.clinical().update(row.id, {priority}, {study: this.opencgaSession.study.fqn})
                .then(restResponse => {
                    if (!restResponse.getResultEvents("ERROR").length) {
                        this.renderTable();
                    } else {
                        console.error(restResponse);
                    }
                })
                .catch(response => {
                    UtilsNew.notifyError(response);
                });
        }
    }

    _getDefaultColumns() {
        const _columns = [
            {
                title: "Case",
                field: "id",
                formatter: this.caseFormatter.bind(this),
                halign: this._config.header.horizontalAlign,
                valign: "middle",
                visible: !this._config.columns.hidden.includes("id")
            },
            {
                title: "Proband and Samples",
                field: "proband",
                halign: this._config.header.horizontalAlign,
                valign: "middle",
                formatter: proband => `<div>
                                            <span data-cy="proband-id" style="font-weight: bold; margin: 5px 0">${proband.id}</span>
                                        </div>
                                        <div>
                                            <span class="help-block" style="margin: 5px 0">${proband.samples?.map(sample => sample.id)?.join("<br>") ?? "-"}</span>
                                        </div>`,
                visible: !this._config.columns.hidden.includes("probandId")
            },
            // {
            //     title: "Sample IDs",
            //     field: "proband.samples",
            //     formatter: samples => samples?.map( sample => sample.id)?.join("<br>") ?? "-",
            //     display: {
            //         labelWidth: 3,
            //     }
            // },
            {
                title: "Family (#members)",
                field: "family.id",
                halign: this._config.header.horizontalAlign,
                valign: "middle",
                formatter: (value, row) => {
                    if (row.family?.id && row.family?.members.length) {
                        return `
                            <div>
                                <span data-cy="family-id"style="margin: 5px 0">${row.family.id}</span>
                            </div>
                            <div>
                                <span class="help-block" style="margin: 5px 0">${row.family.members.length} members</span>
                            </div>`;
                    }
                },
                visible: !this._config.columns.hidden.includes("familyId")
            },
            {
                title: "Disorder",
                field: "disorder",
                halign: this._config.header.horizontalAlign,
                valign: "middle",
                formatter: CatalogGridFormatter.disorderFormatter,
                visible: !this._config.columns.hidden.includes("disorderId")
            },
            // {
            //     title: "Type",
            //     field: "type",
            //     valign: "middle",
            //     visible: !this._config.columns.hidden.includes("type")
            // },
            {
                title: "Interpretation",
                field: "interpretation",
                halign: this._config.header.horizontalAlign,
                valign: "middle",
                formatter: this.interpretationFormatter.bind(this),
                visible: !this._config.columns.hidden.includes("interpretation")
            },
            {
                title: "Status",
                field: "status",
                halign: this._config.header.horizontalAlign,
                valign: "middle",
                formatter: this.statusFormatter.bind(this),
                events: {
                    "click a": this.onActionClick.bind(this)
                },
                visible: !this._config.columns.hidden.includes("status") && !!this.opencgaSession.study?.configuration?.clinical?.status
            },
            {
                title: "Priority",
                field: "priority",
                align: "center",
                halign: this._config.header.horizontalAlign,
                valign: "middle",
                formatter: this.priorityFormatter.bind(this),
                events: {
                    "click a": this.onActionClick.bind(this)
                },
                visible: !this._config.columns.hidden.includes("priority") && !!this.opencgaSession.study?.configuration?.clinical?.priorities
            },
            {
                title: "Analyst",
                field: "analyst.id",
                align: "center",
                halign: this._config.header.horizontalAlign,
                valign: "middle",
                visible: !this._config.columns.hidden.includes("assignedTo")
            },
            {
                title: "Due / Creation Date",
                field: "Dates",
                halign: this._config.header.horizontalAlign,
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
                        <div><span style="${dueDateStyle}">${dueDateString}</span></div>
                        <div><span class="help-block">${UtilsNew.dateFormatter(clinicalAnalysis.creationDate)}</span></div>
                    `;
                },
                visible: !this._config.columns.hidden.includes("dueDate")
            },
            // {
            //     title: "Due Date",
            //     field: "dueDate",
            //     valign: "middle",
            //     formatter: CatalogGridFormatter.dateFormatter,
            //     visible: !this._config.columns.hidden.includes("dueDate")
            // },
            // {
            //     title: "Creation Date",
            //     field: "creationDate",
            //     valign: "middle",
            //     formatter: CatalogGridFormatter.dateFormatter,
            //     visible: !this._config.columns.hidden.includes("creationDate")
            // },
            {
                field: "state",
                checkbox: true,
                class: "cursor-pointer",
                eligible: false,
                visible: this._config.showSelectCheckbox
            }
        ];

        if (this.opencgaSession && this._config.showActions) {
            _columns.push({
                title: "Actions",
                halign: this._config.header.horizontalAlign,
                valign: "middle",
                formatter: (value, row) => `
                    <div class="dropdown">
                        <button class="btn btn-default btn-small ripple dropdown-toggle one-line" type="button" data-toggle="dropdown">Select
                            <span class="caret" style="margin-left: 5px"></span>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-right">
                            <li>
                                <a class="btn force-text-left" data-action="interpreter" href="#interpreter/${this.opencgaSession.project.id}/${this.opencgaSession.study.id}/${row.id}">
                                    <i class="fas fa-user-md icon-padding" aria-hidden="true"></i> Case Interpreter 
                                </a>
                            </li> 
                            <li>
                                <a href="javascript: void 0" class="btn disabled force-text-left" data-action="report">
                                    <i class="fas fa-id-card icon-padding" aria-hidden="true"></i> Create Report</a>
                                </li>
                            <li>
                                <a href="javascript: void 0" class="btn force-text-left" data-action="download">
                                    <i class="fas fa-download icon-padding" aria-hidden="true"></i> Download
                                </a>
                            </li>
                            ${OpencgaCatalogUtils.checkPermissions(this.opencgaSession.study, this.opencgaSession.user.id, "WRITE_CLINICAL_ANALYSIS") ?
                                `
                                    <li role="separator" class="divider"></li>
                                    <li>
                                        <a href="javascript: void 0" class="btn disabled force-text-left" data-action="edit">
                                            <i class="fas fa-edit icon-padding" aria-hidden="true"></i> Edit
                                        </a>
                                    </li>
                                    <li>
                                        <a href="javascript: void 0" class="btn force-text-left" data-action="delete">
                                            <i class="fas fa-trash icon-padding" aria-hidden="true"></i> Delete
                                        </a>
                                    </li>` :
                                null
                            }
                        </ul>
                    </div>`,
                events: {
                    "click a": this.onActionClick.bind(this)
                },
                visible: !this._config.columns?.hidden?.includes("actions")
            });
        }

        return _columns;
    }

    async onDownload(e) {

        // TODO evaluate refactor using webworker with Transferable Objects (it shares objects, not copy like classical WebWorker)

        try {
            this.toolbarConfig = {...this.toolbarConfig, downloading: true};
            await this.requestUpdate();
            const params = {
                ...this.query,
                exclude: "files",
                limit: 100,
                order: "asc",
                skip: 0,
                count: true,
                study: this.opencgaSession.study.fqn
            };

            const r = await this.fetchData(params);
            const result = r.getResults();
            let dataString;
            if (result) {
                // Check if user clicked in Tab or JSON format
                if (e.detail.option.toLowerCase() === "tab") {
                    dataString = [
                        ["Case ID", "Proband ID", "Family (#members)", "Disorder", "Type", "Interpretations", "Status", "Priority", "Assigned To", "Creation Date"].join("\t"),
                        ...result.map(_ => [
                            _.id,
                            _.proband.id,
                            _.family?.id && _.family?.members.length ? `${_.family.id} (${_.family.members.length})` : "",
                            _?.disorder?.id ?? "-",
                            _.type,
                            _.interpretations?.join(",") ?? "-",
                            _.status.name,
                            _.priority,
                            _.analyst.assignee,
                            _.creationDate
                        ].join("\t"))];
                    UtilsNew.downloadData([dataString.join("\n")], "cases_" + this.opencgaSession.study.id + ".txt", "text/plain");
                } else {
                    const json = JSON.stringify(result, null, "\t");
                    UtilsNew.downloadData(json, "cases_" + this.opencgaSession.study.id + ".json", "application/json");
                }
            } else {
                console.error("Error in result format");
            }
        } catch (e) {
            // in case it is a restResponse
            UtilsNew.notifyError(e);
        }
        this.toolbarConfig = {...this.toolbarConfig, downloading: false};
        this.requestUpdate();

    }

    // TODO check
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
            detailFormatter: this.detailFormatter, // function with the detail formatter
            showSelectCheckbox: false,
            showActions: true,
            showToolbar: true,
            header: {
                horizontalAlign: "center",
                verticalAlign: "bottom"
            },
            columns: {
                hidden: []
            }
        };
    }

    render() {
        return html`
            ${this._config.showToolbar ?
                html`
                    <opencb-grid-toolbar    .config="${this.toolbarConfig}"
                                            @columnChange="${this.onColumnChange}"
                                            @download="${this.onDownload}">
                    </opencb-grid-toolbar>` :
                null
            }
    
            <div id="${this._prefix}GridTableDiv" class="force-overflow">
                <table id="${this._prefix}ClinicalAnalysisGrid"></table>
            </div>
        `;
    }

}

customElements.define("opencga-clinical-analysis-grid", OpencgaClinicalAnalysisGrid);
