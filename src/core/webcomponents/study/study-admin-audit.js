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

import {html, LitElement} from "/web_modules/lit-element.js";
import UtilsNew from "./../../utilsNew.js";
import GridCommons from "../commons/grid-commons.js";

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
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);

        this.gridId = this._prefix + "AuditBrowserGrid";
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = { ...this.getDefaultConfig(), ...this.config };
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
    }

    // Note: WE NEED this function because we are rendering using JQuery not lit-element API
    firstUpdated(changedProperties) {
        if (changedProperties.has("study")) {
            this.studyObserver();
        }
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

        super.update(changedProperties);
    }

    studyObserver() {
        this.renderRemoteTable();
    }

    renderRemoteTable() {
        if (this.opencgaSession.opencgaClient && this.study) {
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
                    const _filters = {
                        study: this.study.fqn,
                        limit: params.data.limit,
                        skip: params.data.offset || 0,
                        count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                        // ...filters
                    };
                    // Store the current filters
                    // this.lastFilters = {..._filters};
                    this.opencgaSession.opencgaClient.studies().searchAudit(this.study.fqn, _filters)
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

    getDefaultConfig() {
        return {
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
                <div class="btn-group" data-cy="form-case">
                    <button type="button" class="dropdown-toggle btn btn-default filter-button"
                            id="${this._prefix}caseMenu"
                            data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                        <span class="ocap-text-button">Case: <span>${this.query?.id ?? "All"}</span></span>&nbsp;<span class="caret"></span>
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="${this._prefix}caseMenu">
                        <li style="padding: 5px;">
                            <div style="display: inline-flex; width: 300px;">
                                <label class="filter-label">Case ID:</label>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <div id="${this._prefix}GridTableDiv" class="force-overflow" style="margin: 20px 0px">
                <table id="${this._prefix}AuditBrowserGrid"></table>
            </div>
        `;
    }
}

customElements.define("study-admin-audit", StudyAdminAudit);
