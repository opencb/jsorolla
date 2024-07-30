/*
 * Copyright 2015-2024 OpenCB
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
import UtilsNew from "../../core/utils-new.js";
import GridCommons from "../commons/grid-commons.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter.js";
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import ModalUtils from "../commons/modal/modal-utils.js";
import "../commons/opencb-grid-toolbar.js";
import WebUtils from "../commons/utils/web-utils.js";
import NotificationUtils from "../commons/utils/notification-utils";

export default class FamilyGrid extends LitElement {

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
            families: {
                type: Array
            },
            toolId: {
                type: String,
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
        this.COMPONENT_ID = "family-grid";
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
            this.renderTable();
        }
    }

    propertyObserver() {
        // Deep merge of external settings and default internal configuration
        const defaultConfig = this.getDefaultConfig();
        this._config = {
            ...defaultConfig,
            ...this.config,
            toolbar: {
                ...defaultConfig.toolbar,
                ...this.config.toolbar
            }
        };
        this.gridCommons = new GridCommons(this.gridId, this, this._config);

        // Config for the grid toolbar
        this.toolbarConfig = {
            toolId: this.toolId,
            resource: "FAMILY",
            grid: this._config,
            columns: this._getDefaultColumns(),
            create: {
                display: {
                    modalTitle: "Family Create",
                    modalDraggable: true,
                    modalCyDataName: "modal-create",
                    modalSize: "modal-lg"
                },
                render: () => html `
                    <family-create
                        .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                        .opencgaSession="${this.opencgaSession}">
                    </family-create>
                `
            },
            // Uncomment in case we need to change defaults
            // export: {
            //     display: {
            //         modalTitle: "Family Export",
            //     },
            //     render: () => html`
            //         <opencga-export
            //             .config="${this._config}"
            //             .query=${this.query}
            //             .opencgaSession="${this.opencgaSession}"
            //             @export="${this.onExport}"
            //             @changeExportField="${this.onChangeExportField}">
            //         </opencga-export>`
            // },
            // settings: {
            //     display: {
            //         modalTitle: "Family Settings",
            //     },
            //     render: () => html `
            //         <catalog-browser-grid-config
            //             .opencgaSession="${this.opencgaSession}"
            //             .gridColumns="${this._columns}"
            //             .config="${this._config}"
            //             @configChange="${this.onGridConfigChange}">
            //         </catalog-browser-grid-config>`
            // }
        };

        this.permissionID = WebUtils.getPermissionID(this.toolbarConfig.resource, "WRITE");
    }

    fetchClinicalAnalysis(rows, casesLimit) {
        if (rows && rows.length > 0) {
            return this.opencgaSession.opencgaClient.clinical()
                .search({
                    family: rows.map(family => family.id).join(","),
                    study: this.opencgaSession.study.fqn,
                    include: "id,proband.id,family.members,family.id",
                    limit: casesLimit * 10
                })
                .then(response => {
                    return rows.forEach(family => {
                        (response?.responses?.[0]?.results || []).forEach(clinicalAnalysis => {
                            if (clinicalAnalysis?.family?.id === family.id) {
                                if (family?.attributes?.OPENCGA_CLINICAL_ANALYSIS) {
                                    family.attributes.OPENCGA_CLINICAL_ANALYSIS.push(clinicalAnalysis);
                                } else {
                                    // eslint-disable-next-line no-param-reassign
                                    family.attributes = {
                                        OPENCGA_CLINICAL_ANALYSIS: [clinicalAnalysis]
                                    };
                                }
                            }
                        });
                    });
                });
        }
    }

    renderTable() {
        if (this.families?.length > 0) {
            this.renderLocalTable();
        } else {
            this.renderRemoteTable();
        }
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
                theadClasses: "table-light",
                buttonsClass: "light",
                columns: this._columns,
                method: "get",
                sidePagination: "server",
                iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
                icons: GridCommons.GRID_ICONS,
                uniqueId: "id",
                silentSort: false,
                pagination: this._config.pagination,
                pageSize: this._config.pageSize,
                pageList: this._config.pageList,
                paginationVAlign: "both",
                formatShowingRows: this.gridCommons.formatShowingRows,
                showExport: this._config.showExport,
                detailView: !!this.detailFormatter,
                detailFormatter: (value, row) => this.detailFormatter(value, row),
                loadingTemplate: () => GridCommons.loadingFormatter(),
                ajax: params => {
                    let familyResponse = null;
                    this.filters = {
                        study: this.opencgaSession.study.fqn,
                        limit: params.data.limit,
                        skip: params.data.offset || 0,
                        count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                        ...this.query
                    };

                    // Calculate the number of cases to fetch
                    const casesLimit = this.table?.bootstrapTable("getOptions")?.pageSize || this._config.pageSize || 10;

                    // Store the current filters
                    this.lastFilters = {...this.filters};
                    this.opencgaSession.opencgaClient.families()
                        .search(this.filters)
                        .then(response => {
                            familyResponse = response;
                            return this.fetchClinicalAnalysis(familyResponse.responses?.[0]?.results || [], casesLimit);
                        })
                        .then(() => {
                            // Prepare data for columns extensions
                            const rows = familyResponse.responses?.[0]?.results || [];
                            return this.gridCommons.prepareDataForExtensions(this.COMPONENT_ID, this.opencgaSession, this.filters, rows);
                        })
                        .then(() => params.success(familyResponse))
                        .catch(error => {
                            console.error(error);
                            params.error(error);
                        });
                },
                responseHandler: response => {
                    const result = this.gridCommons.responseHandler(response, $(this.table).bootstrapTable("getOptions"));
                    return result.response;
                },
                onClickRow: (row, selectedElement) => this.gridCommons.onClickRow(row.id, row, selectedElement),
                onDblClickRow: (row, element) => {
                    this.detailFormatter ?
                        this.table.bootstrapTable("toggleDetailView", element[0].dataset.index) : null;
                },
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
                onLoadError: (e, restResponse) => {
                    this.gridCommons.onLoadError(e, restResponse);
                },
            });
        }
    }

    renderLocalTable() {
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            theadClasses: "table-light",
            buttonsClass: "light",
            columns: this._getDefaultColumns(),
            // data: this.families,
            sidePagination: "server",
            // Josemi Note 2024-01-18: we have added the ajax function for local families also to support executing async calls
            // when getting additional data from columns extensions.
            ajax: params => {
                const tableOptions = $(this.table).bootstrapTable("getOptions");
                const limit = params.data.limit || tableOptions.pageSize;
                const skip = params.data.offset || 0;
                const rows = this.families.slice(skip, skip + limit);

                // Get data for extensions
                this.gridCommons.prepareDataForExtensions(this.COMPONENT_ID, this.opencgaSession, null, rows)
                    .then(() => params.success(rows))
                    .catch(error => params.error(error));
            },
            // Josemi Note 2024-01-18: we use this method to tell bootstrap-table how many rows we have in our data
            responseHandler: response => {
                return {
                    total: this.families.length,
                    rows: response,
                };
            },
            iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
            icons: GridCommons.GRID_ICONS,
            // Set table properties, these are read from config property
            uniqueId: "id",
            pagination: this._config.pagination,
            pageSize: this._config.pageSize,
            pageList: this._config.pageList,
            showExport: this._config.showExport,
            detailView: !!this.detailFormatter,
            detailFormatter: (value, row) => this.detailFormatter(value, row),
            loadingTemplate: () => GridCommons.loadingFormatter(),
            onClickRow: (row, selectedElement) => this.gridCommons.onClickRow(row.id, row, selectedElement),
            onPostBody: data => {
                // We call onLoadSuccess to select first row
                this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 1);
            },
        });
    }

    onColumnChange(e) {
        this.gridCommons.onColumnChange(e);
    }

    detailFormatter(value, row) {
        let result = `
            <div class='row' style="padding: 5px 10px 20px 10px">
                <div class='col-md-12'>
                    <h5 style="font-weight: bold">Members</h5>
        `;

        if (UtilsNew.isNotEmptyArray(row.members)) {
            result += `
                <div style="width: 90%;padding-left: 20px">
                    <table class="table table-hover table-no-bordered">
                        <thead class="table-light">
                            <tr class="table-header">
                                <th>ID</th>
                                <th>Sex</th>
                                <th>Father</th>
                                <th>Mother</th>
                                <th>Affectation Status</th>
                                <th>Life Status</th>
                                <th>Year of Birth</th>
                                <th>Creation Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            for (const member of row.members) {
                const father = (UtilsNew.isNotEmpty(member.father.id)) ? member.father.id : "-";
                const mother = (UtilsNew.isNotEmpty(member.mother.id)) ? member.mother.id : "-";
                const affectation = (UtilsNew.isNotEmpty(member.affectationStatus)) ? member.affectationStatus : "-";
                const lifeStatus = (UtilsNew.isNotEmpty(member.lifeStatus)) ? member.lifeStatus : "-";
                const dateOfBirth = UtilsNew.isNotEmpty(member.dateOfBirth) ? moment(member.dateOfBirth, "YYYYMMDD").format("YYYY") : "-";
                const creationDate = moment(member.creationDate, "YYYYMMDDHHmmss").format("D MMM YYYY");

                result += `
                    <tr class="detail-view-row">
                        <td>${member.id}</td>
                        <td>${member.sex?.id || member.sex || "Not specified"}</td>
                        <td>${father}</td>
                        <td>${mother}</td>
                        <td>${affectation}</td>
                        <td>${lifeStatus}</td>
                        <td>${dateOfBirth}</td>
                        <td>${creationDate}</td>
                        <td>${member?.status?.name || "-"}</td>
                    </tr>
                `;
            }
            result += "</tbody></table></diV>";
        } else {
            result += "No members found";
        }

        result += "</div></div>";
        return result;
    }

    async onActionClick(e, _, row) {
        const action = e.target.dataset.action?.toLowerCase();
        switch (action) {
            case "edit":
                this.familyUpdateId = row.id;
                this.requestUpdate();
                await this.updateComplete;
                ModalUtils.show(`${this._prefix}UpdateModal`);
                break;
            case "copy-json":
                UtilsNew.copyToClipboard(JSON.stringify(row, null, "\t"));
                break;
            case "download-json":
                UtilsNew.downloadData([JSON.stringify(row, null, "\t")], row.id + ".json");
                break;
            case "qualityControl":
                alert("Not implemented yet");
                break;
        }
    }

    _getDefaultColumns() {
        // 1. Default columns
        this._columns = [
            {
                id: "id",
                title: "Family",
                field: "id",
                formatter: familyId => `<div><span style="font-weight: bold">${familyId}</span></div>`,
                sortable: true,
                halign: "center",
                visible: this.gridCommons.isColumnVisible("id")
            },
            {
                id: "members",
                title: "Members",
                field: "members",
                formatter: members => {
                    let html = "-";
                    if (members?.length > 0) {
                        html = `<div style="white-space: nowrap">`;
                        for (let i = 0; i < members.length; i++) {
                            // Display first 5 members
                            if (i < 5) {
                                html += `
                                    <div style="margin: 2px 0">
                                        <span style="font-weight: bold">${members[i].id}</span><span> (${members[i].sex.id})</span>
                                    </div>
                                `;
                            } else {
                                html += `<a tooltip-title="Files" tooltip-text='${members.join("")}'>... view all members (${members.length})</a>`;
                                break;
                            }
                        }
                        html += "</div>";
                    }
                    return html;
                },
                halign: "center",
                visible: this.gridCommons.isColumnVisible("members")
            },
            {
                id: "disorders",
                title: "Disorders",
                field: "disorders",
                formatter: disorders => CatalogGridFormatter.disorderFormatter(disorders),
                halign: "center",
                visible: this.gridCommons.isColumnVisible("disorders")
            },
            {
                id: "phenotypes",
                title: "Phenotypes",
                field: "phenotypes",
                formatter: CatalogGridFormatter.phenotypesFormatter,
                halign: "center",
                visible: this.gridCommons.isColumnVisible("phenotypes")
            },
            {
                id: "caseId",
                title: "Case ID",
                field: "attributes.OPENCGA_CLINICAL_ANALYSIS",
                formatter: (value, row) => CatalogGridFormatter.caseFormatter(value, row, row.id, this.opencgaSession),
                halign: "center",
                visible: this.gridCommons.isColumnVisible("caseId")
            },
            {
                id: "creationDate",
                title: "Creation Date",
                field: "creationDate",
                formatter: CatalogGridFormatter.dateFormatter,
                sortable: true,
                halign: "center",
                visible: this.gridCommons.isColumnVisible("creationDate")
            },
        ];

        // 2. Annotations
        if (this._config.annotations?.length > 0) {
            this.gridCommons.addColumnsFromAnnotations(this._columns, CatalogGridFormatter.customAnnotationFormatter, this._config);
        }

        // 3. Actions
        if (this.opencgaSession && this._config.showActions) {
            this._columns.push({
                id: "actions",
                title: "Actions",
                field: "actions",
                align: "center",
                formatter: (value, row) => `
                    <div class="d-inline-block dropdown">
                        <button class="btn btn-light btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            <i class="fas fa-toolbox me-1" aria-hidden="true"></i>
                            <span>Actions</span>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li>
                                <a data-action="copy-json" href="javascript: void 0" class="dropdown-item">
                                    <i class="fas fa-copy" aria-hidden="true"></i> Copy JSON
                                </a>
                            </li>
                            <li>
                                <a data-action="download-json" href="javascript: void 0" class="dropdown-item">
                                    <i class="fas fa-download" aria-hidden="true"></i> Download JSON
                                </a>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                                <a data-action="qualityControl" class="dropdown-item ${row.qualityControl?.metrics && row.qualityControl.metrics.length === 0 ? "" : "disabled"}"
                                        title="${row.qualityControl?.metrics && row.qualityControl.metrics.length === 0 ? "Launch a job to calculate Quality Control stats" : "Quality Control stats already calculated"}">
                                    <i class="fas fa-rocket" aria-hidden="true"></i> Calculate Quality Control
                                </a>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                                ${row.attributes?.OPENCGA_CLINICAL_ANALYSIS?.length ? row.attributes.OPENCGA_CLINICAL_ANALYSIS.map(clinicalAnalysis => `
                                    <a data-action="interpreter" class="dropdown-item ${row.attributes.OPENCGA_CLINICAL_ANALYSIS ? "" : "disabled"}"
                                        href="#interpreter/${this.opencgaSession.project.id}/${this.opencgaSession.study.id}/${clinicalAnalysis.id}">
                                        <i class="fas fa-user-md" aria-hidden="true"></i> Case Interpreter - ${clinicalAnalysis.id}
                                    </a>
                                `).join("") : `
                                    <a data-action="interpreter" class="dropdown-item disabled" href="#">
                                        <i class="fas fa-user-md" aria-hidden="true"></i> No cases found
                                    </a>
                                `}
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                                <a data-action="edit" class="dropdown-item ${OpencgaCatalogUtils.checkPermissions(this.opencgaSession.study, this.opencgaSession.user.id, this.permissionID) || "disabled" }">
                                    <i class="fas fa-edit icon-padding" aria-hidden="true"></i> Edit ...
                                </a>
                            </li>
                            <li>
                                <a data-action="delete" href="javascript: void 0" class="dropdown-item disabled">
                                    <i class="fas fa-trash" aria-hidden="true"></i> Delete
                                </a>
                            </li>
                        </ul>
                    </div>
                `,
                events: {
                    "click a": this.onActionClick.bind(this)
                },
                visible: this.gridCommons.isColumnVisible("actions")
            });
        }

        // 4. Extensions
        this._columns = this.gridCommons.addColumnsFromExtensions(this._columns, this.COMPONENT_ID);

        return this._columns;
    }

    async onDownload(e) {
        this.toolbarConfig = {...this.toolbarConfig, downloading: true};
        this.requestUpdate();
        await this.updateComplete;

        const filters = {
            ...this.filters,
            skip: 0,
            limit: 1000,
            count: false
        };
        this.opencgaSession.opencgaClient.families()
            .search(filters)
            .then(response => {
                const results = response.getResults();
                if (results) {
                    // Check if user clicked in Tab or JSON format
                    if (e.detail.option.toUpperCase() === "TAB") {
                        const fields = ["id", "members.id", "disorders.id", "phenotypes.id", "creationDate"];
                        const data = UtilsNew.toTableString(results, fields);
                        UtilsNew.downloadData(data, "families_" + this.opencgaSession.study.id + ".tsv", "text/plain");
                    } else {
                        UtilsNew.downloadData(JSON.stringify(results, null, "\t"), "families_" + this.opencgaSession.study.id + ".json", "application/json");
                    }
                } else {
                    console.error("Error in result format");
                }
            })
            .catch(response => {
                // console.log(response);
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            })
            .finally(() => {
                this.toolbarConfig = {...this.toolbarConfig, downloading: false};
                this.requestUpdate();
            });
    }

    renderModalUpdate() {
        return ModalUtils.create(this, `${this._prefix}UpdateModal`, {
            display: {
                modalTitle: `Family Update: ${this.familyUpdateId}`,
                modalDraggable: true,
                modalCyDataName: "modal-update",
                modalSize: "modal-lg"
            },
            render: active => html`
                <family-update
                    .familyId="${this.familyUpdateId}"
                    .active="${active}"
                    .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                    .opencgaSession="${this.opencgaSession}">
                </family-update>
            `,
        });
    }

    render() {
        return html`
            ${this._config.showToolbar ? html`
                <opencb-grid-toolbar
                    .query="${this.filters}"
                    .opencgaSession="${this.opencgaSession}"
                    .settings="${this.toolbarSetting}"
                    .config="${this.toolbarConfig}"
                    @columnChange="${this.onColumnChange}"
                    @download="${this.onDownload}"
                    @export="${this.onDownload}"
                    @actionClick="${e => this.onActionClick(e)}"
                    @familyCreate="${this.renderTable}">
                </opencb-grid-toolbar>
            ` : nothing}

            <div id="${this._prefix}GridTableDiv" class="force-overflow">
                <table id="${this.gridId}"></table>
            </div>

            ${this.renderModalUpdate()}
        `;
    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 25],

            showToolbar: true,
            showActions: true,
            toolbar: {
                showCreate: true,
                showSettings: true,
                showExport: true,
                exportTabs: ["download", "link", "code"]
            },
            skipExtensions: false,

            // Annotations Example:
            // annotations: [
            //     {
            //         title: "Cardiology Tests",
            //         position: 3,
            //         variableSetId: "cardiology_tests_checklist",
            //         variables: ["ecg_test", "echo_test"]
            //     },
            //     {
            //         title: "Risk Assessment",
            //         position: 5,
            //         variableSetId: "risk_assessment",
            //         variables: ["vf_cardiac_arrest_events"]
            //     }
            // ]
        };
    }

}

customElements.define("family-grid", FamilyGrid);
