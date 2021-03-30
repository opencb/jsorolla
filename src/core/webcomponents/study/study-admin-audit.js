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

import { html, LitElement } from "/web_modules/lit-element.js";
import UtilsNew from "./../../utilsNew.js";
import GridCommons from "../commons/grid-commons.js";
import PolymerUtils from "../PolymerUtils.js";

export default class StudyAdminAudit extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
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
            studyId: {
                type: String
            },
            study: {
                type: Object
            },
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
        this._filters = [];
        this.query = {};
        this.sortedUserIds = []
        this.gridId = this._prefix + "AuditBrowserGrid";
        this._statusType = ["SUCCESS", "ERROR"]
        this._resourceType = ["AUDIT", "USER", "PROJECT", "STUDY", "FILE", "SAMPLE", "JOB", "INDIVIDUAL,COHORT", "DISEASE_PANEL", "FAMILY", "CLINICAL_ANALYSIS", "INTERPRETATION", "VARIANT", "ALIGNMENT", "CLINICAL", "EXPRESSION", "FUNCTIONAL"]
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = { ...this.getDefaultConfig(), ...this.config };
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
    }

    // Note: WE NEED this function because we are rendering using JQuery not lit-element API
    firstUpdated(changedProperties) { 
        // it not neccesary
        // if (changedProperties.has("study")) {
        //     this.studyObserver();
        // }
    }

    update(changedProperties) {
        if (changedProperties.has("studyId")) {
            for (const project of this.opencgaSession.projects) {
                for (const study of project.studies) {
                    if (study.id === this.studyId || study.fqn === this.studyId) {
                        this.study = { ...study };
                        break;
                    }
                }
            }
        }
        if (changedProperties.has("study")) {
            this.studyObserver();
        }

        if (changedProperties.has("query")) {
            this.propertyObserver();
        }
        super.update(changedProperties);
    }

    async studyObserver() {
        this.groupsMap = new Map();
        try {
            const resp = await this.opencgaSession.opencgaClient.studies().groups(this.study.fqn);
            const groups = resp.responses[0].results;
            if (groups[0].users) {
                for (const group of groups) {
                    this.groupsMap.set(group.id, group.users);
                }
            } else {
                for (const group of response.responses[0].results) {
                    this.groupsMap.set(group.id, group.userIds.map(u => {
                        return { id: u, name: u }
                    }));
                }
            }
            this.users = this.groupsMap.get("@members");
            this.sortedUserIds = [...this.groupsMap.get("@members").map(user => user.id).sort()];   
            // With the requestUpdate, work to get users for the filter
            this.requestUpdate()
        } catch (err) {
            console.log("An error occurred fetching users: ", err)
        }
        this.renderRemoteTable();
    }

    propertyObserver() {
        this.renderRemoteTable();
    }

    renderRemoteTable() {
        if (this.opencgaSession?.opencgaClient && this.study) {
            // const filters = {...this.query};
            // // TODO fix and replicate this in all browsers (the current filter is not "filters", it is actually built in the ajax() function in bootstrapTable)
            // if (UtilsNew.isNotUndefinedOrNull(this.lastFilters) &&
            //     JSON.stringify(this.lastFilters) === JSON.stringify(filters)) {
            //     // Abort destroying and creating again the grid. The filters have not changed
            //     return;
            // }

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
                detailFormatter: this._config.detailFormatter,
                gridContext: this,
                formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
                ajax: params => {
                    const query = {
                        study: this.study.fqn,
                        limit: params.data.limit,
                        skip: params.data.offset || 0,
                        count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                        ...this.query
                    };
                    // Store the current filters
                    // this.lastFilters = {..._filters};
                    this.opencgaSession.opencgaClient.studies().searchAudit(this.study.fqn, query)
                        .then(res => {
                            params.success(res)
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
                onLoadSuccess: data => {
                    this.gridCommons.onLoadSuccess(data, 1);
                },
                onLoadError: (e, restResponse) => this.gridCommons.onLoadError(e, restResponse),
                onPostBody: data => {
                    // Add tooltips?
                }
            });
        }
    }

    detailFormatter(index, row) {
        return `<div style="margin: 20px">
                    <h4>Action Params</h4>
                    <pre>${JSON.stringify(row.params, null, 2)}</pre>
                </div>`;
    }

    _getDefaultColumns() {
        return [
            {
                title: "Audit Record ID",
                field: "id",
            },
            {
                title: "User ID",
                field: "userId",
            },
            {
                title: "Study ID",
                field: "studyId",
            },
            {
                title: "Action",
                field: "action"
            },
            {
                title: "Resource Type",
                field: "resource"
            },
            {
                title: "Resource ID",
                field: "resourceId",
            },
            {
                title: "Date",
                field: "date",
                formatter: (value) => value ? UtilsNew.dateFormatter(UtilsNew.getDatetime(value)) : "NA"
            },
            {
                title: "Status",
                field: "status.name",
            },
        ];
    }

    onFilterChange(key, value) {
        if (value && value !== "") {
            this.query = { ...this.query, ...{ [key]: value } };
        } else {
            delete this.query[key];
            this.query = { ...this.query };
        }
    }

    getDefaultConfig() {
        return {
            filter: {
                sections: [
                    {
                        title: "",
                        fields: [
                            { id: "user" },
                            { id: "action" },
                            { id: "status" },
                            { id: "resource" }
                        ]
                    }
                ],
            },
            pagination: true,
            pageSize: 10,
            pageList: [10, 25, 50],
            showExport: false,
            detailView: true,
            detailFormatter: this.detailFormatter, // function with the detail formatter
            multiSelection: false,
            showSelectCheckbox: true,
            showToolbar: true,
            showActions: true,
        };
    }

    clear(e) {
        this.query = {}
    }

    onServerFilterChange(e) {
        // suppress if I actually have clicked on an action buttons
        if (e.target.className !== "id-filter-button") {
            return;
        }

        for (const filter of this._filters) {
            if (e.currentTarget.dataset.filterId === filter.id) {
                this.query = filter.query;
                this.requestUpdate();
                break;
            }
        }
    }

    serverFilterDelete(e) {
        const { filterId } = e.currentTarget.dataset;
        Swal.fire({
            title: "Are you sure?",
            text: "The filter will be deleted. The operation cannot be reverted.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes"
        }).then(result => {
            if (result.value) {
                const data = {
                    id: filterId,
                    resource: this.resource,
                    options: {}
                };
                this.opencgaSession.opencgaClient.users().updateFilters(this.opencgaSession.user.id, data, { action: "REMOVE" })
                    .then(restResponse => {
                        console.log("restResponse", restResponse);
                        Swal.fire(
                            "Filter Deleted",
                            "Filter has been deleted.",
                            "success"
                        );
                        this.refreshFilters();
                    }).catch(restResponse => {
                        if (restResponse.getEvents?.("ERROR")?.length) {
                            const msg = restResponse.getEvents("ERROR").map(error => error.message).join("<br>");
                            new NotificationQueue().push("Error deleting filter", msg, "error");
                        } else {
                            new NotificationQueue().push("Error deleting filter", "", "error");
                        }
                        console.error(restResponse);
                    });
            }
        });
    }

    launchModal() {
        $(PolymerUtils.getElementById(this._prefix + "SaveModal")).modal("show");
    }

    save() {
        console.log("Save Button")
    }

    // TODO: we can use this one as search without search button.. if pass 3 character this gonna look the user.
    onPermissionFieldChange(e) {
        this.studyPermission = e.detail.value;
        if (!this.studyPermission) {
            this.studyPermissions = this.permissions;
            this.renderPermissionGrid();
        }
    }

    onPermissionSearch(e) {
        if (this.studyPermission) {
            this.studyPermissions = this.permissions.filter(perm => perm.id.startsWith(this.studyPermission.toUpperCase()));
        } else {
            this.studyPermissions = this.permissions
        }
        this.renderPermissionGrid();
    }

    render() {
        return html`
            <div class="pull-left" style="margin: 10px 0px">
                <div class="lhs">
                    ${~this._config.filter.sections[0].fields.findIndex(field => field.id === "user") ? html` 
                        <!-- User ID -->
                        <div class="btn-group">
                            <select-field-filter 
                                placeholder="${"User: All"}" 
                                .opencgaSession="${this.opencgaSession}" 
                                .config=${this._config}
                                .data="${this.sortedUserIds}"
                                .value="${this.query?.user}" 
                                @filterChange="${e => this.onFilterChange("user", e.detail.value)}">
                            </select-field-filter>
                        </div>
                    `: null}
                    ${~this._config.filter.sections[0].fields.findIndex(field => field.id === "action") ? html`
                        <!-- TODO: Action build autocomplete-->
                        <div class="btn-group">
                            <select-field-filter 
                                placeholder="${"Action: All"}" 
                                .opencgaSession="${this.opencgaSession}" 
                                .config=${this._config}
                                .value="${this.query?.action}" 
                                @filterChange="${e => this.onFilterChange("action", e.detail.value)}">
                            </select-field-filter>
                        </div>
                        ` : null}
                        ${~this._config.filter.sections[0].fields.findIndex(field => field.id === "resource") ? html`
                        <!-- Resource -->
                        <div class="btn-group">
                            <select-field-filter 
                                placeholder="${"Resource: All"}" 
                                multiple
                                .data="${this._resourceType}"
                                .value=${this.query?.resource} 
                                @filterChange="${e => this.onFilterChange("resource", e.detail.value)}">
                            </select-field-filter>
                        </div>
                        ` : null}
                        ${~this._config.filter.sections[0].fields.findIndex(field => field.id === "status") ? html`
                        <!-- Status -->
                        <div class="btn-group">
                            <select-field-filter 
                                placeholder="${"Status: All"}" 
                                multiple
                                .data="${this._statusType}"
                                .value=${this.query?.status} 
                                @filterChange="${e => this.onFilterChange("status", e.detail.value)}">
                            </select-field-filter>
                        </div>
                        ` : null}
                </div>
                ${false ? html`
                    <div class="rhs" style="padding: 7px">
                        <button type="button" class="btn btn-primary btn-sm ripple" @click="${this.clear}">
                            <i class="fa fa-times icon-padding" aria-hidden="true"></i> Clear
                        </button>
                        <div class="dropdown saved-filter-wrapper">
                            <button type="button" class="btn btn-primary btn-sm dropdown-toggle ripple" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i class="fa fa-filter icon-padding" aria-hidden="true"></i> Filters <span class="caret"></span>
                            </button>
                            <ul class="dropdown-menu">
                                <li><a style="font-weight: bold">Saved Filters</a></li>
                                ${this._filters && this._filters.length ?
                    this._filters.map(item => item.separator ? html`
                                        <li role="separator" class="divider"></li>
                                    ` : html`
                                        <li>
                                            <a data-filter-id="${item.id}" style="cursor: pointer;color: ${!item.active ? "black" : "green"}" title="${item.description ?? ""}" @click="${this.onServerFilterChange}" class="filtersLink">
                                                <span class="id-filter-button">&nbsp;&nbsp;${item.id}</span>
                                                <span class="delete-filter-button" title="Delete filter" data-filter-id="${item.id}" @click="${this.serverFilterDelete}"><i class="fas fa-times"></i></span>
                                            </a>
                                        </li>`) :
                    null}

                                ${this.opencgaSession?.token ? html`
                                    <li role="separator" class="divider"></li>
                                    <li>
                                        <a style="cursor: pointer" @click="${this.launchModal}"><i class="fa fa-floppy-o icon-padding" aria-hidden="true"></i> Save...</a>
                                    </li>
                                ` : null}
                            </ul>
                        </div>
                    </div>
                ` : null}
            </div>

            <div id="${this._prefix}GridTableDiv" class="force-overflow" style="margin: 20px 0px">
                <table id="${this._prefix}AuditBrowserGrid"></table>
            </div>

            <!-- Modal -->
        <div class="modal fade" id="${this._prefix}SaveModal" tabindex="-1" role="dialog"
            aria-labelledby="${this._prefix}SaveModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <h4 class="modal-title" id="${this._prefix}SaveModalLabel">Filter</h4>
                    </div>
                    <div class="modal-body">
                        <div class="form-group row">
                            <label for="filterName" class="col-xs-2 col-form-label">Name</label>
                            <div class="col-xs-10">
                                <input class="form-control" type="text" id="${this._prefix}filterName">
                            </div>
                        </div>
                        <div class="form-group row">
                            <label for="${this._prefix}filterDescription" class="col-xs-2 col-form-label">Description</label>
                            <div class="col-xs-10">
                                <input class="form-control" type="text" id="${this._prefix}filterDescription">
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-dismiss="modal" @click="${this.save}">Save</button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }
}

customElements.define("study-admin-audit", StudyAdminAudit);
