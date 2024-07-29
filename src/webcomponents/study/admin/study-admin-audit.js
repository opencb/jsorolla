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
import UtilsNew from "../../../core/utils-new.js";
import GridCommons from "../../commons/grid-commons.js";
import OpencgaCatalogUtils from "../../../core/clients/opencga/opencga-catalog-utils.js";
import {guardPage} from "../../commons/html-utils.js";

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
        this.sortedUserIds = [];
        this.gridId = this._prefix + "AuditBrowserGrid";
        this.actionValues = ["SEARCH", "LINK", "INFO", "CREATE"];
        this.resourceTypeValues = ["AUDIT", "USER", "PROJECT", "STUDY", "FILE", "SAMPLE", "JOB", "INDIVIDUAL", "COHORT", "DISEASE_PANEL",
            "FAMILY", "CLINICAL_ANALYSIS", "INTERPRETATION", "VARIANT", "ALIGNMENT", "CLINICAL", "EXPRESSION", "FUNCTIONAL"];
        this.statusTypeValues = ["SUCCESS", "ERROR"];
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
    }

    update(changedProperties) {
        if (changedProperties.has("studyId")) {
            for (const project of this.opencgaSession.projects) {
                for (const study of project.studies) {
                    if (study.id === this.studyId || study.fqn === this.studyId) {
                        this.study = {...study};
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
                        return {id: u, name: u};
                    }));
                }
            }
            this.users = this.groupsMap.get("@members");
            this.sortedUserIds = [...this.groupsMap.get("@members").map(user => user.id).sort()];
            // With the requestUpdate, work to get users for the filter
            this.requestUpdate();
        } catch (err) {
            console.log("An error occurred fetching users: ", err);
        }
        this.renderRemoteTable();
    }

    propertyObserver() {
        this.renderRemoteTable();
    }

    renderRemoteTable() {
        if (this.opencgaSession?.opencgaClient && this.study) {
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
                // paginationVAlign: "both",
                formatShowingRows: this.gridCommons.formatShowingRows,
                showExport: this._config.showExport,
                detailView: this._config.detailView,
                detailFormatter: this.detailFormatter,
                gridContext: this,
                // formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
                loadingTemplate: () => GridCommons.loadingFormatter(),
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
                            params.success(res);
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
                        if (element[0].innerHTML.includes("fa-plus")) {
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
                formatter: value => value ? UtilsNew.dateFormatter(UtilsNew.getDatetime(value)) : "NA"
            },
            {
                title: "Status",
                field: "status.name",
            },
        ];
    }

    onFilterChange(key, value) {
        if (value && value !== "") {
            this.query = {...this.query, ...{[key]: value}};
        } else {
            delete this.query[key];
            this.query = {...this.query};
        }
    }

    getDefaultConfig() {
        return {
            filter: {
                sections: [
                    {
                        title: "",
                        filters: [
                            {id: "userId"},
                            {id: "resource"},
                            {id: "action"},
                            {id: "status"},
                        ]
                    }
                ],
            },
            pagination: true,
            pageSize: 10,
            pageList: [10, 25, 50],
            showExport: false,
            detailView: true,
            multiSelection: false,
            showSelectCheckbox: true,
            showToolbar: true,
            showActions: true,
        };
    }

    clear(e) {
        this.query = {};
    }

    render() {
        if (!OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user.id)) {
            return guardPage("No permission to view this page");
        }

        return html`
            <div class="d-flex my-2">
                <div class="row row-cols-lg-auto g-2 align-items-center">

                    ${~this._config.filter.sections[0].filters.findIndex(field => field.id === "userId") ? html`
                        <!-- User ID -->
                        <div class="col-12">
                            <select-field-filter
                                .data="${this.sortedUserIds || []}"
                                .config=${{
                                    ...this._config,
                                    multiple: true,
                                    placeholder: "User: All",
                                    liveSearch: false,
                                }}
                                .value="${this.query?.userId}"
                                @filterChange="${e => this.onFilterChange("userId", e.detail.value)}">
                            </select-field-filter>
                        </div>
                    `: nothing}

                    ${~this._config.filter.sections[0].filters.findIndex(field => field.id === "action") ? html`
                        <!-- TODO: Action build autocomplete-->
                        <div class="col-12">
                            <select-field-filter
                                .data="${this.actionValues}"
                                .config=${{
                                    ...this._config,
                                    multiple: true,
                                    placeholder: "Action: All",
                                    liveSearch: false,
                                }}
                                .value="${this.query?.action}"
                                @filterChange="${e => this.onFilterChange("action", e.detail.value)}">
                            </select-field-filter>
                        </div>
                    ` : nothing}

                    ${~this._config.filter.sections[0].filters.findIndex(field => field.id === "resource") ? html`
                        <!-- Resource -->
                        <div class="col-12">
                            <select-field-filter
                                .data="${this.resourceTypeValues}"
                                .value=${this.query?.resource}
                                .config=${{
                                    placeholder: "Resource: All",
                                    liveSearch: false,
                                }}
                                @filterChange="${e => this.onFilterChange("resource", e.detail.value)}">
                            </select-field-filter>
                        </div>
                    ` : nothing}

                    ${~this._config.filter.sections[0].filters.findIndex(field => field.id === "status") ? html`
                        <!-- Status -->
                        <div class="col-12">
                            <select-field-filter
                                .data="${this.statusTypeValues}"
                                .value=${this.query?.status}
                                .config=${{
                                    placeholder: "Status: All",
                                    liveSearch: false,
                                }}
                                @filterChange="${e => this.onFilterChange("status", e.detail.value)}">
                            </select-field-filter>
                        </div>
                    ` : nothing}

                    <div class="col-12">
                        <button type="button" id="${this._prefix}ClearAuditMenu" class="btn btn-light btn-xs"
                                aria-haspopup="true" aria-expanded="false" title="Clear filters"
                                @click="${e => this.clear(e)}">
                            <i class="fas fa-times" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div id="${this._prefix}GridTableDiv" class="force-overflow">
                <table id="${this._prefix}AuditBrowserGrid"></table>
            </div>

            <!-- Modal -->
            <div class="modal fade" id="${this._prefix}SaveModal" tabindex="-1" role="dialog"
                aria-labelledby="${this._prefix}SaveModalLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
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
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="${this.save}">Save</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("study-admin-audit", StudyAdminAudit);
