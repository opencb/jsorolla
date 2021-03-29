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
import "../commons/filters/text-field-filter.js";

export default class StudyAdminUsers extends LitElement {

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

        this.gridId = this._prefix + "SampleBrowserGrid";
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
                        this.study = study;
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
        this.owner = this.study.fqn.split("@")[0];

        this.groupsMap = new Map();
        this.opencgaSession.opencgaClient.studies().groups(this.study.fqn)
            .then(response => {
                for (const group of response.responses[0].results) {
                    this.groupsMap.set(group.id, group.userIds.map(u => {return {id: u, name: u, creationDate: "20210213000000"}}));
                }
                this.renderUserGrid();
                this.requestUpdate();
            })
            .catch(response => {
                console.error("An error occurred fetching clinicalAnalysis: ", response);
            });
    }

    renderUserGrid() {
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            columns: this._getDefaultColumns(),
            data: this.groupsMap.get("@members"),
            sidePagination: "local",

            // Set table properties, these are read from config property
            uniqueId: "id",
            pagination: this._config.pagination,
            pageSize: this._config.pageSize,
            pageList: this._config.pageList,
            showExport: this._config.showExport,
            detailView: this._config.detailView,
            detailFormatter: this.detailFormatter,
            formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",

            onClickRow: (row, selectedElement, field) => this.gridCommons.onClickRow(row.id, row, selectedElement),
            onPostBody: data => {
                // We call onLoadSuccess to select first row
                this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 1);
            }
        });
    }

    groupFormatter(value, row) {
        // const groupId = this.field.groupId;
        const checked = this.field.groupsMap?.get(this.field.groupId).findIndex(e => e.id === row.id) !== -1;
        return `<input type="checkbox" ${checked ? "checked": ""} ${row.id === this.field.owner ? "disabled" : ""}>`;
    }

    _getDefaultColumns() {
        let groupColumns = [];
        if (this.groupsMap) {
            // Remove @members and make sure @admins is the last group
            const groups = [...this.groupsMap.keys()].filter(g => g !== "@members" && g !== "@admins");
            groups.push("@admins");
            for (const group of groups) {
                groupColumns.push(
                    {
                        title: group,
                        field: {
                            groupId: group,
                            groupsMap: this.groupsMap,
                            owner: this.owner
                        },
                        rowspan: 1,
                        colspan: 1,
                        formatter: this.groupFormatter
                    }
                );
            }
        }

        const _columns = [
            [
                {
                    title: "User Name",
                    field: "name",
                    formatter:(value, row) => {
                        return value === this.owner ? `<span style="font-weight: bold">${value} (owner)</span>` : value
                    },
                    rowspan: 2,
                    colspan: 1,
                },
                {
                    title: "User ID",
                    field: "id",
                    rowspan: 2,
                    colspan: 1,
                },
                {
                    title: "Email",
                    field: "email",
                    rowspan: 2,
                    colspan: 1,
                },
                {
                    title: "Groups",
                    field: "",
                    rowspan: 1,
                    colspan: groupColumns.length,
                    align: "center"
                },
            ],
            [
                ...groupColumns
            ]
        ];

        return _columns;
    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 10,
            pageList: [10, 25, 50],
            showExport: false,
            detailView: false,
            detailFormatter: null, // function with the detail formatter
            multiSelection: false,
            showSelectCheckbox: true,
            showToolbar: true,
            showActions: true
        };
    }

    onAddUserFieldChange(e, isCancelled) {
        if (isCancelled) {
            this.addUserId = "";
        } else {
            this.addUserId = e.detail.value;
        }
        this.requestUpdate();
    }

    onRemoveUserFieldChange(e, isCancelled) {
        if (isCancelled) {
            this.removeUserSet = new Set();
        } else {
            if (!this.removeUserSet) {
                this.removeUserSet = new Set();
            }
            this.removeUserSet.add(e.currentTarget.value)
        }
        this.requestUpdate();
    }

    onAddGroupFieldChange(e, isCancelled) {
        if (isCancelled) {
            this.addGroupId = "";
        } else {
            this.addGroupId = e.detail.value;
        }
        this.requestUpdate();
    }

    render() {
        return html`
            <div class="pull-right" style="margin: 10px 0px">
                <div style="display:inline-block; margin: 0px 20px">
                    <!-- ADD USER -->
                    <div class="btn-group">
                        <button type="button" id="${this._prefix}AddUserMenu" class="btn btn-default btn-sm dropdown-toggle ripple" data-toggle="dropdown"
                                aria-haspopup="true" aria-expanded="false" title="Add new user to ${this.study?.name} study">
                            <i class="fas fa-user icon-padding" aria-hidden="true"></i> Add User
                        </button>
                        <ul class="dropdown-menu dropdown-menu-right" aria-labelledby="${this._prefix}AddUserMenu" style="width: 320px">
                            <li style="margin: 5px 10px">
                                <div style="margin: 10px 0px">
                                    <span style="font-weight: bold">User ID</span>
                                </div>
                                <div style="margin: 10px 0px">
                                    <text-field-filter .value="${this.addUserId}" placeholder="new user ID..."
                                                       @filterChange="${e => this.onAddUserFieldChange(e)}">
                                    </text-field-filter>
                                </div>
                                <div class="pull-right" style="margin: 5px">
                                    <button type="button" class="btn btn-primary ${this.addUserId?.length > 0 ? "" : "disabled"}"
                                            @click="${e => this.onAddUserFieldChange(e, true)}" style="margin: 0px 5px">Cancel
                                    </button>
                                    <button type="button" class="btn btn-primary ${this.addUserId?.length > 0 ? "" : "disabled"}"
                                            @click="${this.onSaveInterpretation}">Add
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <!-- REMOVE USER -->
                    <div class="btn-group">
                        <button type="button" id="${this._prefix}RemoveUserMenu" class="btn btn-default btn-sm dropdown-toggle ripple" data-toggle="dropdown"
                                aria-haspopup="true" aria-expanded="false" title="Remove user from ${this.study?.name} study">
                            <i class="fas fa-user-slash icon-padding" aria-hidden="true"></i> Remove User
                        </button>
                        <ul class="dropdown-menu dropdown-menu-right" aria-labelledby="${this._prefix}RemoveUserMenu" style="width: 320px">
                            <li style="margin: 5px 10px">
                                <div style="margin: 10px 0px">
                                    <span style="font-weight: bold">Select Users</span>
                                </div>
                                <div style="margin: 10px 5px">
                                    ${this.groupsMap?.get("@members")
                                            ?.filter(user => !this.study.fqn.startsWith(user.id + "@"))    // we cannot remove the owner
                                            ?.map(user => html`
                                                <div>
                                                    <span style="margin: 0px 5px">
                                                        <input type="checkbox" value="${user.id}" .checked="${this.removeUserSet?.has(user.id)}"
                                                               @click="${this.onRemoveUserFieldChange}">
                                                    </span>
                                                    <span>${user.id}</span>
                                                </div>
                                            `)}
                                </div>
                                <div class="pull-right" style="margin: 5px">
                                    <button type="button" class="btn btn-primary ${this.removeUserSet?.size > 0 ? "" : "disabled"}"
                                            @click="${e => this.onRemoveUserFieldChange(e, true)}" style="margin: 0px 5px">Cancel
                                    </button>
                                    <button type="button" class="btn btn-primary ${this.removeUserSet?.size > 0 ? "" : "disabled"}"
                                            @click="${this.onSaveInterpretation}">Remove
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div style="display:inline-block">
                    <!-- ADD GROUP -->
                    <div class="btn-group">
                        <button type="button" id="${this._prefix}AddGroupMenu" class="btn btn-default btn-sm dropdown-toggle ripple" data-toggle="dropdown"
                                aria-haspopup="true" aria-expanded="false" title="Add new group to ${this.study?.name} study">
                            <i class="fas fa-user-friends icon-padding" aria-hidden="true"></i> Add Group
                        </button>
                        <ul class="dropdown-menu dropdown-menu-right" aria-labelledby="${this._prefix}AddGroupMenu" style="width: 320px">
                            <li style="margin: 5px 10px">
                                <div style="margin: 10px 0px">
                                    <span style="font-weight: bold">New Group ID</span>
                                </div>
                                <div style="margin: 10px 0px">
                                    <text-field-filter .value="${this.addGroupId}" placeholder="new group ID..."
                                                       @filterChange="${e => this.onAddGroupFieldChange(e)}">
                                    </text-field-filter>
                                </div>
                                <div class="pull-right" style="margin: 5px">
                                    <button type="button" class="btn btn-primary ${this.addGroupId?.length > 0 ? "" : "disabled"}"
                                            @click="${e => this.onAddGroupFieldChange(e, true)}" style="margin: 0px 5px">Cancel
                                    </button>
                                    <button type="button" class="btn btn-primary ${this.addGroupId?.length > 0 ? "" : "disabled"}"
                                            @click="${this.onSaveInterpretation}">Add
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <!-- DELETE GROUP -->
                    <div class="btn-group">
                        <button type="button" id="${this._prefix}DeleteGroupMenu" class="btn btn-default btn-sm dropdown-toggle ripple" data-toggle="dropdown"
                                aria-haspopup="true" aria-expanded="false" title="Delete group from ${this.study?.name} study">
                            <i class="fas fa-user-slash" aria-hidden="true"></i><i class="fas fa-user-slash icon-padding" aria-hidden="true"></i> Delete Group
                        </button>
                        <ul class="dropdown-menu dropdown-menu-right" aria-labelledby="${this._prefix}DeleteGroupMenu" style="width: 320px">
                            <li style="margin: 5px 10px">
                                <div style="margin: 10px 0px">
                                    <span style="font-weight: bold">Delete Group</span>
                                </div>
                                <div style="margin: 10px 5px">
                                    <div>To be implemented</div>
                                </div>
                                <div class="pull-right" style="margin: 5px">
                                    <button type="button" class="btn btn-primary ${this.removeUserSet?.size > 0 ? "" : "disabled"}"
                                            @click="${e => this.onRemoveUserFieldChange(e, true)}" style="margin: 0px 5px">Cancel
                                    </button>
                                    <button type="button" class="btn btn-primary ${this.removeUserSet?.size > 0 ? "" : "disabled"}"
                                            @click="${this.onSaveInterpretation}">Remove
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div id="${this._prefix}GridTableDiv" class="force-overflow">
                <table id="${this._prefix}SampleBrowserGrid"></table>
            </div>
        `;
    }
}

customElements.define("study-admin-users", StudyAdminUsers);
