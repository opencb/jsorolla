/*
 * Copyright 2015-2016 OpenCB
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

import {LitElement, html} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import GridCommons from "../../commons/grid-commons.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";
import OpencgaCatalogUtils from "../../../core/clients/opencga/opencga-catalog-utils";

export default class PermissionBrowserGrid2 extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            // FIXME study is not needed, we should use opencgaSession.study
            study: {
                type: Object
            },
            active: {
                type: Boolean
            },
            opencgaSession: {
                type: Object
            }
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this.gridId = this._prefix + "PermissionBrowserGrid";
        this.permissionString = [
            // WORKFLOWS
            "VIEW_WORKFLOWS", "WRITE_WORKFLOWS", "DELETE_WORKFLOWS",
            // FILES
            "VIEW_FILES", "VIEW_FILE_HEADER", "VIEW_FILE_CONTENT", "WRITE_FILES", "DELETE_FILES", "DOWNLOAD_FILES", "UPLOAD_FILES",
            "VIEW_FILE_ANNOTATIONS", "WRITE_FILE_ANNOTATIONS", "DELETE_FILE_ANNOTATIONS",
            // JOBS
            "EXECUTE_JOBS", "VIEW_JOBS", "WRITE_JOBS", "DELETE_JOBS",
            // SAMPLES
            "VIEW_SAMPLES", "WRITE_SAMPLES", "DELETE_SAMPLES",
            "VIEW_SAMPLE_ANNOTATIONS", "WRITE_SAMPLE_ANNOTATIONS", "DELETE_SAMPLE_ANNOTATIONS",
            "VIEW_AGGREGATED_VARIANTS", "VIEW_SAMPLE_VARIANTS",
            // INDIVIDUALS
            "VIEW_INDIVIDUALS", "WRITE_INDIVIDUALS", " DELETE_INDIVIDUALS",
            "VIEW_INDIVIDUAL_ANNOTATIONS", "WRITE_INDIVIDUAL_ANNOTATIONS", "DELETE_INDIVIDUAL_ANNOTATIONS",
            // FAMILIES
            "VIEW_FAMILIES", "WRITE_FAMILIES", "DELETE_FAMILIES",
            "VIEW_FAMILY_ANNOTATIONS", "WRITE_FAMILY_ANNOTATIONS", "DELETE_FAMILY_ANNOTATIONS",
            // COHORTS
            "VIEW_COHORTS", "WRITE_COHORTS", "DELETE_COHORTS",
            "VIEW_COHORT_ANNOTATIONS", "WRITE_COHORT_ANNOTATIONS", "DELETE_COHORT_ANNOTATIONS",
            // DISEASE PANELS
            "VIEW_PANELS", "WRITE_PANELS", "DELETE_PANELS",
            // CLINICAL ANALYSIS
            "VIEW_CLINICAL_ANALYSIS", "WRITE_CLINICAL_ANALYSIS", "DELETE_CLINICAL_ANALYSIS",
            // OTHERS
            "CONFIDENTIAL_VARIABLE_SET_ACCESS"
        ];
        this.permissions = this.permissionString.map(perm => {
            return {
                id: perm
            };
        });
        this.studyPermissions = this.permissions;
        this.searchPermission = "";
    }

    connectedCallback() {
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
        super.connectedCallback();
    }

    firstUpdated(changedProperties) {
        if (changedProperties.has("study")) {
            this.studyObserver();
        }
    }

    update(changedProperties) {
        if (changedProperties.has("study")) {
            this.studyObserver();
        }
        super.update(changedProperties);
    }

    studyObserver() {
        this.renderPermissionGrid();
    }

    renderPermissionGrid() {
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            theadClasses: "table-light",
            buttonsClass: "light",
            columns: this._getDefaultColumns(),
            data: this.studyPermissions,
            sidePagination: "local",
            iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
            icons: GridCommons.GRID_ICONS,
            // Set table properties, these are read from config property
            uniqueId: "id",
            pagination: this._config.pagination,
            pageSize: this._config.pageSize,
            pageList: this._config.pageList,
            showExport: this._config.showExport,
            detailView: this._config.detailView,
            loadingTemplate: () => GridCommons.loadingFormatter(),
        });
    }

    groupFormatter(value, row) {
        switch (this.field.groupId) {
            case "@admins":
                return `<input type="checkbox" checked disabled>`;
            case "@members":
                // Note 20240829 Vero: permissions for members are working and not visualized. I disable them for now.
                return `<input type="checkbox" disabled>`;
            default:
                const groupFound = this.field.acl.find(element => element.member === this.field.groupId) || false;
                const checked = groupFound ? groupFound.permissions?.includes(row.id) : false;
                return `<input type="checkbox" ${checked ? "checked" : ""}>`;
        }
    }

    userFormatter(permission, userId, groups = []) {
        if (OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, userId)) {
            return `<input type="checkbox" checked disabled>`;
        } else {
            const userFound = this.study.acl.find(element => element.member === userId) || false;
            const checked = userFound ? userFound.permissions?.includes(permission.id) : false;
            return `<input type="checkbox" ${checked ? "checked" : ""}>`;
        }
    }

    async onCheck(e, value, row, group) {
        const isChecked = e.currentTarget.checked;
        const messageAlert = isChecked ?
            `Added permission:${row.id} to the group:${group} correctly`:
            `Removed permission:${row.id} to the group:${group} correctly `;
        // row.id == Permission ID
        const paramsAction = {
            action: isChecked ? "ADD" : "REMOVE"
        };
        const params = {
            permissions: row.id,
            study: this.study.fqn
        };
        try {
            // updateACL has bad documentation
            const response = await this.opencgaSession.opencgaClient.studies()
                .updateAcl(group, paramsAction, params);
            // update ACL in the study object
            const acl = this.opencgaSession.study.acl
                .find(acl => acl.member === response.responses[0].results[0].acl[0].member)
            if (acl) {
                acl.permissions = response.responses[0].results[0].acl[0].permissions;
            } else {
                // if the use does not contain this user (for example because we have just added it to the study)
                // we add it to the study.acl using the same acl response that OpenCGA returns
                this.opencgaSession.study.acl.push(response.responses[0].results[0].acl[0]);
            }
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                message: messageAlert,
            });
            this.renderPermissionGrid();
            // this.requestUpdate();
        } catch (error) {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
        }
    }

    _getDefaultColumns() {
        const groupColumns = [];
        if (this.opencgaSession.study.groups) {
            // Make sure @members and @admins are the last groups
            const groups = this.opencgaSession.study.groups.filter(g => g.id !== "@members" && g.id !== "@admins").map(g => g.id);
            // groups.push("@members");
            groups.push("@admins");
            for (const group of groups) {
                groupColumns.push(
                    {
                        title: group === "@members" ? "Default" : group,
                        field: {
                            groupId: group,
                            acl: this.study.acl
                        },
                        rowspan: 1,
                        colspan: 1,
                        formatter: this.groupFormatter,
                        events: {
                            "click input": (e, value, row) => this.onCheck(e, value, row, group)
                        }
                    }
                );
            }
        }

        const userColums = [];
        const userIds = this.study.groups.find(g => g.id === "@members").userIds;
        for (const user of userIds) {
            // Get groups for the user
            const groups = this.opencgaSession?.study?.groups
                .filter(group => group.id !== "@members")
                .filter(group => group.userIds.includes(user));

            userColums.push(
                {
                    title: `${user} ${groups.length > 0 ?
                        `<div class="text-secondary fst-italic">(${groups.map(group => group.id).join(",")})</div>` : ""}`,
                    rowspan: 1,
                    colspan: 1,
                    formatter: (e, permission) => this.userFormatter(permission, user, groups),
                    cellStyle: (value, row)  => {
                        let isInherited;

                        // Check if the permission is inherited from a group
                        if (groups.findIndex(group => group.id === "@admins") !== -1) {
                            isInherited = true;
                        } else {
                            isInherited = groups.some(group => {
                                const acl = this.opencgaSession.study.acl
                                    .find(acl => acl.member === group.id);
                                return acl?.permissions.includes(row.id);
                            });
                        }

                        // 2. If the permission is inherited, we apply a background color
                        if (isInherited) {
                            return {css: {"background-color": "rgba(230, 247, 230, 0.5)"}}
                        }
                        return "";
                    },
                    events: {
                        "click input": (e, value, row) => this.onCheck(e, value, row, user, this)
                    }
                }
            );
        }

        const _columns = [
            [
                {
                    title: "Study Permission",
                    field: "id",
                    rowspan: 2,
                    colspan: 1,
                    sortable: false
                },
                {
                    title: "Default",
                    field: {
                        groupId: "@members",
                        acl: this.study.acl
                    },
                    rowspan: 2,
                    colspan: 1,
                    formatter: this.groupFormatter
                },
                {
                    title: `Users <div class="text-secondary fst-italic">(@groups)</div>`,
                    // field: "",
                    rowspan: 1,
                    colspan: userColums.length,
                    align: "center",
                },
                {
                    title: "Groups",
                    // field: "",
                    rowspan: 1,
                    colspan: groupColumns.length,
                    align: "center"
                },
            ],
            [
                ...userColums,
                ...groupColumns
            ]
        ];

        return _columns;
    }

    onPermissionFieldChange(e) {
        this.searchPermission = e.currentTarget.value;
    }

    onPermissionSearch(e, clear) {
        if (clear) {
            this.searchPermission = "";
        }

        if (this.searchPermission) {
            this.studyPermissions = this.permissions.filter(perm => perm.id.includes(this.searchPermission.toUpperCase()));
        } else {
            this.studyPermissions = this.permissions;
        }
        this.renderPermissionGrid();
        // this.requestUpdate();
    }

    render() {
        return html`
            <!-- SEARCH Permission -->
            <div class="d-flex my-2">
                <div class="row row-cols-lg-auto g-3 align-items-center">
                    <div class="col-12">
                        <input class="form-control" type="text" .value="${this.searchPermission || ""}"
                               list="${this._prefix}Permissions" placeholder="Search by Permission ..."
                               @change="${this.onPermissionFieldChange}">
                    </div>
                    <div class="col-12">
                        <button type="button" id="${this._prefix}ClearPermissionMenu" class="btn btn-light btn-xs"
                                aria-haspopup="true" aria-expanded="false" title="Clear permission from ${this.study?.name} study"
                                @click="${e => this.onPermissionSearch(e, true)}">
                            <i class="fas fa-times" aria-hidden="true"></i>
                        </button>
                        <button type="button" id="${this._prefix}SearchPermissionMenu" class="btn btn-light btn-xs"
                                aria-haspopup="true" aria-expanded="false" title="Filter permission from ${this.study?.name} study"
                                @click="${e => this.onPermissionSearch(e, false)}">
                            <i class="fas fa-search" aria-hidden="true"></i>
                        </button>
                    </div>
                    <datalist id="${this._prefix}Permissions">
                        ${this.permissionString?.map(perm => html`
                            <option value="${perm}"></option>
                        `)}
                    </datalist>
                </div>
            </div>

            <!-- GRID Permission -->
            <div id="${this._prefix}GridTableDiv" class="force-overflow">
                <table id="${this._prefix}PermissionBrowserGrid"></table>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            pagination: false,
            pageSize: 25,
            pageList: [25, 50],
            showExport: false,
            detailView: false,
            multiSelection: false,
            showSelectCheckbox: false,
            showToolbar: true,
            showActions: true,
        };
    }

}

customElements.define("permission-browser-grid-2", PermissionBrowserGrid2);
