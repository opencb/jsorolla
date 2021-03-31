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

import { LitElement, html } from "/web_modules/lit-element.js";
import UtilsNew from "../../utilsNew.js";
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

        this.gridId = this._prefix + "UsersAndGroupsBrowserGrid";
        this.searchUserId = "";
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

        if (changedProperties.has("study") || changedProperties.has("opencgaSession")) {
            this.studyObserver();
        }

        super.update(changedProperties);
    }

    studyObserver() {
        if (this.study) {
            this.owner = this.study.fqn.split("@")[0];

            this.groupsMap = new Map();
            this.opencgaSession.opencgaClient.studies().groups(this.study.fqn)
                .then(response => {
                    const groups = response.responses[0].results;
                    // Remove in OpenCGA 2.1
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
                    this.sortedUserIds = this.groupsMap.get("@members").map(user => user.id).sort();

                    this.renderUserGrid();
                    this.requestUpdate();
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    renderUserGrid() {
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            columns: this._getDefaultColumns(),
            data: this.users,
            sidePagination: "local",

            // Set table properties, these are read from config property
            uniqueId: "id",
            pagination: this._config.pagination,
            pageSize: this._config.pageSize,
            pageList: this._config.pageList,
            showExport: this._config.showExport,
            detailView: this._config.detailView,
            // detailFormatter: this.detailFormatter,
            formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",

            onClickRow: (row, selectedElement, field) => this.gridCommons.onClickRow(row.id, row, selectedElement),
            onPostBody: data => {
                // We call onLoadSuccess to select first row
                this.gridCommons.onLoadSuccess({ rows: data, total: data.length }, 1);
            }
        });
    }

    groupFormatter(value, row) {
        const checked = this.field.groupsMap?.get(this.field.groupId).findIndex(e => e.id === row.id) !== -1;
        return `<input type="checkbox" ${checked ? "checked" : ""} ${row.id === this.field.owner ? "disabled" : ""}>`;
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
                    formatter: (value, row) => {
                        return value === this.owner ? `<span style="font-weight: bold">${value} (owner)</span>` : value
                    },
                    rowspan: 2,
                    colspan: 1,
                    sortable: true
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
                    title: "Created on",
                    field: "account.creationDate",
                    formatter: (value, row) => {
                        return value ? UtilsNew.dateFormatter(value) : "NA"
                    },
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
                // {
                //     title: "Actions",
                //     formatter: (value, row) => `
                //         <div class="dropdown">
                //             <button class="btn btn-danger btn-small ripple" type="button" data-toggle="dropdown">
                //                 <span><i class="fas fa-times icon-padding" aria-hidden="true"></i> Remove</span>
                //             </button>
                //         </div>`,
                //     events: {
                //         "click a": this.onActionClick.bind(this)
                //     },
                //     rowspan: 2,
                //     colspan: 1,
                //     visible: !this._config.columns?.hidden?.includes("actions")
                // }
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

    // TODO: we can use this one as search without search button.. if pass 3 character this gonna look the user.
    onUserSearchFieldChange(e) {
        this.searchUserId = e.currentTarget.value;
    }

    onUserSearch(e, clear) {
        if (clear) {
            this.searchUserId = "";
        }

        if (this.searchUserId) {
            this.users = this.groupsMap.get("@members").filter(user => user.id.includes(this.searchUserId));
        } else {
            this.users = this.groupsMap.get("@members");
        }

        this.renderUserGrid();
        this.requestUpdate();
    }

    onUserAddFieldChange(e, isCancelled) {
        if (isCancelled) {
            this.addUserId = "";
        } else {
            this.addUserId = e.detail.value;
        }
        this.requestUpdate();
    }

    onUserAdd(e) {
        if (this.groupsMap.get("@members").includes(this.addUserId)) {
            console.log("User already exists in the study")
            return;
        }

        this.opencgaSession.opencgaClient.studies().updateUsers(this.study.fqn, "@members",{users: [this.addUserId]}, {action: "ADD"})
            .then(res => {
                this.addUserId = "";
                this.requestUpdate();

                this.dispatchEvent(new CustomEvent("studyUpdateRequest", {
                    detail: {
                        value: this.study.fqn
                    },
                    bubbles: true,
                    composed: true
                }));

                Swal.fire(
                    "Use Add",
                    "User added correctly.",
                    "success"
                );
            })
            .catch(e => {
                console.error(e);
                params.error(e);
            });
    }

    onUserRemoveFieldChange(e, isCancelled) {
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

    onUserRemove(e) {
        let userIds = [];
        for (let userId of this.removeUserSet.keys()) {
            userIds.push(userId);
        }

        this.opencgaSession.opencgaClient.studies().updateUsers(this.study.fqn, "@members",{users: userIds}, {action: "REMOVE"})
            .then(res => {
                this.removeUserSet = new Set();
                this.requestUpdate();

                this.dispatchEvent(new CustomEvent("studyUpdateRequest", {
                    detail: {
                        value: this.study.fqn
                    },
                    bubbles: true,
                    composed: true
                }));

                Swal.fire(
                    "Use Delete",
                    "User deleted correctly.",
                    "success"
                );
            })
            .catch(e => {
                console.error(e);
                params.error(e);
            });
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
            <div class="pull-left" style="margin: 10px 0px">
                <!-- SEARCH USER -->
                <div class="form-inline">
                    <div class="form-group">
                        <input type="text" .value="${this.searchUserId || ""}" class="form-control" list="${this._prefix}MemberUsers" placeholder="Search by user ID..." 
                               @change="${this.onUserSearchFieldChange}">
                    </div>
                    <button type="button" id="${this._prefix}ClearUserMenu" class="btn btn-default btn-xs ripple"
                            aria-haspopup="true" aria-expanded="false" title="Clear users from ${this.study?.name} study"
                            @click="${e => this.onUserSearch(e, true)}">
                        <i class="fas fa-times" aria-hidden="true"></i>
                    </button>
                    <button type="button" id="${this._prefix}SearchUserMenu" class="btn btn-default btn-xs ripple"
                            aria-haspopup="true" aria-expanded="false" title="Filter user from ${this.study?.name} study"
                            @click="${e => this.onUserSearch(e, false)}">
                        <i class="fas fa-search" aria-hidden="true"></i>
                    </button>
                    <datalist id="${this._prefix}MemberUsers">
                        ${this.sortedUserIds?.map(userId => html`
                            <option value="${userId}"></option>
                        `)}
                    </datalist>
                </div>
            </div>

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
                                    <text-field-filter
                                            .value="${this.addUserId}"
                                            placeholder="new user ID..."
                                            @filterChange="${e => this.onUserAddFieldChange(e)}">
                                    </text-field-filter>
                                </div>
                                <div class="pull-right" style="margin: 5px">
                                    <button type="button" class="btn btn-primary ${this.addUserId?.length > 0 ? "" : "disabled"}"
                                            @click="${e => this.onUserAddFieldChange(e, true)}" style="margin: 0px 5px">Cancel
                                    </button>
                                    <button type="button" class="btn btn-primary ${this.addUserId?.length > 0 ? "" : "disabled"}"
                                            @click="${this.onUserAdd}">Add
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
                                                        <input
                                                                type="checkbox"
                                                                value="${user.id}"
                                                                .checked="${this.removeUserSet?.has(user.id)}"
                                                                @click="${this.onUserRemoveFieldChange}">
                                                    </span>
                                                    <span>${user.id}</span>
                                                </div>
                                            `)}
                                </div>
                                <div class="pull-right" style="margin: 5px">
                                    <button type="button" class="btn btn-primary ${this.removeUserSet?.size > 0 ? "" : "disabled"}"
                                            @click="${e => this.onUserRemoveFieldChange(e, true)}" style="margin: 0px 5px">Cancel
                                    </button>
                                    <button type="button" class="btn btn-danger ${this.removeUserSet?.size > 0 ? "" : "disabled"}"
                                            @click="${this.onUserRemove}">Remove
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
                                    <button type="button" class="btn btn-danger ${this.removeUserSet?.size > 0 ? "" : "disabled"}"
                                            @click="${this.onSaveInterpretation}">Remove
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div id="${this._prefix}GridTableDiv" class="force-overflow">
                <table id="${this._prefix}UsersAndGroupsBrowserGrid"></table>
            </div>
        `;
    }
}

customElements.define("study-admin-users", StudyAdminUsers);
