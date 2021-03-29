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

export default class StudyAdminPermissions extends LitElement {

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

        this.permissionString = ["VIEW_FILES", "VIEW_FILE_ANNOTATIONS", "WRITE_INDIVIDUALS", "VIEW_COHORTS", "VIEW_FAMILY_ANNOTATIONS",
            "WRITE_FAMILIES", "VIEW_FILE_HEADER", "VIEW_FILE_CONTENT", "VIEW_INDIVIDUALS", "VIEW_AGGREGATED_VARIANTS",
            "VIEW_COHORT_ANNOTATIONS", "WRITE_SAMPLES", "WRITE_CLINICAL_ANALYSIS", "DELETE_JOBS", "EXECUTE_JOBS", "DOWNLOAD_FILES",
            "VIEW_INDIVIDUAL_ANNOTATIONS", "VIEW_PANELS", "VIEW_FAMILIES", "VIEW_JOBS", "WRITE_SAMPLE_ANNOTATIONS", "WRITE_JOBS",
            "VIEW_SAMPLE_VARIANTS", "WRITE_FAMILY_ANNOTATIONS", "VIEW_SAMPLES", "WRITE_INDIVIDUAL_ANNOTATIONS", "VIEW_SAMPLE_ANNOTATIONS",
            "VIEW_CLINICAL_ANALYSIS"];
        this.permissions = [];
        for (const permission of this.permissionString) {
            this.permissions.push(
                {
                    id: permission
                }
            );
        }
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
        this.renderUserGrid();
        // this.requestUpdate();
    }

    renderUserGrid() {
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            columns: this._getDefaultColumns(),
            data: this.permissions,
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
        if (this.field.groupId === "@admins") {
            return `<input type="checkbox" checked disabled>`;
        } else {
            const checked = this.field.acl?.[this.field.groupId]?.includes(row.id);
            return `<input type="checkbox" ${checked ? "checked": ""}>`;
        }
    }

    _getDefaultColumns() {
        let groupColumns = [];
        if (this.study.acl) {
            // Make sure @members and @admins are the last groups
            const groups = [...Object.keys(this.study.acl)].filter(g => g !== "@members" && g !== "@admins");
            groups.push("@members");
            groups.push("@admins");
            for (const group of groups) {
                groupColumns.push(
                    {
                        title: group,
                        field: {
                            groupId: group,
                            acl: this.study.acl
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
                    title: "Study Permission",
                    field: "id",
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
            pageSize: 25,
            pageList: [25, 50],
            showExport: false,
            detailView: false,
            detailFormatter: null, // function with the detail formatter
            multiSelection: false,
            showSelectCheckbox: true,
            showToolbar: true,
            showActions: true
        };
    }

    render() {
        return html`
            <div id="${this._prefix}GridTableDiv" class="force-overflow"style="margin: 20px 0px">
                <table id="${this._prefix}SampleBrowserGrid"></table>
            </div>
        `;
    }
}

customElements.define("study-admin-permissions", StudyAdminPermissions);
