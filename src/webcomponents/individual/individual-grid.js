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
import UtilsNew from "../../core/utils-new.js";
import GridCommons from "../commons/grid-commons.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import ModalUtils from "../commons/modal/modal-utils.js";
import "../commons/opencb-grid-toolbar.js";
import WebUtils from "../commons/utils/web-utils.js";

export default class IndividualGrid extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            toolId: {
                type: String,
            },
            opencgaSession: {
                type: Object
            },
            query: {
                type: Object
            },
            individuals: {
                type: Array
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
        this.COMPONENT_ID = "individual-grid";
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
        // With each property change we must be updated config and create the columns again. No extra checks are needed.
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };
        this.gridCommons = new GridCommons(this.gridId, this, this._config);

        // settings for the grid toolbar
        this.toolbarSetting = {
            // buttons: ["columns", "download"],
            ...this._config,
        };

        // Config for the grid toolbar
        this.toolbarConfig = {
            toolId: this.toolId,
            resource: "INDIVIDUAL",
            columns: this._getDefaultColumns(),
            create: {
                display: {
                    modalTitle: "Individual Create",
                    modalDraggable: true,
                    modalCyDataName: "modal-create",
                    modalSize: "modal-lg"
                },
                render: () => html `
                    <individual-create
                        .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                        .opencgaSession="${this.opencgaSession}">
                    </individual-create>
                `
            },
            // Uncomment in case we need to change defaults
            // export: {
            //     display: {
            //         modalTitle: "Individual Export",
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
            //         modalTitle: "Individual Settings",
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
                    individual: rows.map(individual => individual.id).join(","),
                    study: this.opencgaSession.study.fqn,
                    include: "id,proband.id,family.members",
                    limit: casesLimit * 10,
                })
                .then(response => {
                    return rows.forEach(individual => {
                        (response?.responses?.[0]?.results || []).forEach(clinicalAnalysis => {
                            if (clinicalAnalysis?.proband?.id === individual.id || clinicalAnalysis?.family?.members?.find(member => member.id === individual.id)) {
                                if (individual?.attributes?.OPENCGA_CLINICAL_ANALYSIS) {
                                    individual.attributes.OPENCGA_CLINICAL_ANALYSIS.push(clinicalAnalysis);
                                } else {
                                    // eslint-disable-next-line no-param-reassign
                                    individual.attributes = {
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
        if (this.individuals?.length > 0) {
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
                detailView: this._config.detailView,
                detailFormatter: this.detailFormatter,
                gridContext: this,
                loadingTemplate: () => GridCommons.loadingFormatter(),
                ajax: params => {
                    let individualResponse = null;
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
                    this.opencgaSession.opencgaClient.individuals()
                        .search(this.filters)
                        .then(response => {
                            individualResponse = response;
                            return this.fetchClinicalAnalysis(individualResponse?.responses?.[0]?.results || [], casesLimit);
                        })
                        .then(() => {
                            // Prepare data for columns extensions
                            const rows = individualResponse.responses?.[0]?.results || [];
                            return this.gridCommons.prepareDataForExtensions(this.COMPONENT_ID, this.opencgaSession, this.filters, rows);
                        })
                        .then(() => params.success(individualResponse))
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
            // data: this.individuals,
            sidePagination: "server",
            // Josemi Note 2024-01-18: we have added the ajax function for local individuals also to support executing async calls
            // when getting additional data from columns extensions.
            ajax: params => {
                const tableOptions = $(this.table).bootstrapTable("getOptions");
                const limit = params.data.limit || tableOptions.pageSize;
                const skip = params.data.offset || 0;
                const rows = this.individuals.slice(skip, skip + limit);

                // Get data for extensions
                this.gridCommons.prepareDataForExtensions(this.COMPONENT_ID, this.opencgaSession, null, rows)
                    .then(() => params.success(rows))
                    .catch(error => params.error(error));
            },
            // Josemi Note 2024-01-18: we use this method to tell bootstrap-table how many rows we have in our data
            responseHandler: response => {
                return {
                    total: this.individuals.length,
                    rows: response,
                };
            },
            iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
            icons: GridCommons.GRID_ICONS,
            uniqueId: "id",
            pagination: this._config.pagination,
            pageSize: this._config.pageSize,
            pageList: this._config.pageList,
            showExport: this._config.showExport,
            detailView: this._config.detailView,
            detailFormatter: this.detailFormatter,
            gridContext: this,
            // formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
            loadingTemplate: () => GridCommons.loadingFormatter(),
            onClickRow: (row, selectedElement) => this.gridCommons.onClickRow(row.id, row, selectedElement),
            onPostBody: data => {
                // We call onLoadSuccess to select first row
                this.gridCommons.onLoadSuccess({rows: data, total: data.length}, 1);
            }
        });
    }

    onColumnChange(e) {
        this.gridCommons.onColumnChange(e);
    }

    detailFormatter(value, row) {
        let result = `
            <div class='row' style="padding: 5px 10px 20px 10px">
                <div class='col-md-12'>
                    <h5 style="font-weight: bold">Samples</h5>
        `;

        if (UtilsNew.isNotEmptyArray(row.samples)) {
            let tableCheckboxHeader = "";

            if (this.gridContext._config && this.gridContext._config.multiSelection) {
                tableCheckboxHeader = "<th>Select</th>";
            }

            result += `
                <div style="width: 90%;padding-left: 20px">
                    <table class="table table-hover table-no-bordered">
                        <thead class="table-light">
                            <tr class="table-header">
                                ${tableCheckboxHeader}
                                <th>Sample ID</th>
                                <th>Source</th>
                                <th>Collection Method</th>
                                <th>Preparation Method</th>
                                <th>Somatic</th>
                                <th>Creation Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            for (const sample of row.samples) {
                let tableCheckboxRow = "";
                // If parent row is checked and there is only one sample then it must be selected
                if (this.gridContext._config.multiSelection) {
                    let checkedStr = "";
                    for (const individual of this.gridContext.individuals) {
                        if (individual.id === row.id && row.samples.length === 1) {
                            // TODO check sample has been checked before, we need to store them
                            checkedStr = "checked";
                            break;
                        }
                    }

                    tableCheckboxRow = `
                        <td>
                            <input id='${this.gridContext.prefix}${sample.id}Checkbox' type='checkbox' ${checkedStr}>
                        </td>
                    `;
                }

                const source = sample.source?.name || sample.source?.id || "-";
                const collectionMethod = sample.collection?.method || "-";
                const preparationMethod = sample.processing?.preparationMethod || "-";
                const cellLine = sample.somatic ? "Somatic" : "Germline";
                const creationDate = moment(sample.creationDate, "YYYYMMDDHHmmss").format("D MMM YYYY");

                result += `
                    <tr class="detail-view-row">
                        ${tableCheckboxRow}
                        <td>${sample.id}</td>
                        <td>${source}</td>
                        <td>${collectionMethod}</td>
                        <td>${preparationMethod}</td>
                        <td>${cellLine}</td>
                        <td>${creationDate}</td>
                        <td>${sample?.status?.id || ""}</td>
                    </tr>
                `;
            }
            result += "</tbody></table></diV>";
        } else {
            result += "No samples found";
        }

        result += "</div></div>";
        return result;
    }

    async onActionClick(e, _, row) {
        const action = e.target.dataset.action?.toLowerCase() || e.detail.action;
        switch (action) {
            case "edit":
                this.individualUpdateId = row.id;
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
            case "quality-control":
                alert("Not implemented yet");
                break;
        }
    }

    _getDefaultColumns() {
        this._columns = [
            {
                id: "id",
                title: "Individual",
                field: "id",
                formatter: (individualId, individual) => {
                    // Get sex info
                    const sexHtml = CatalogGridFormatter.sexFormatter(individual.sex, individual);
                    return `
                        <div>
                            <span style="font-weight: bold; margin: 5px 0">${individualId}</span>
                            <span class="d-block text-secondary" style="margin: 5px 0">${sexHtml}</span>
                        </div>`;
                },
                halign: "center",
                visible: this.gridCommons.isColumnVisible("id")
            },
            {
                id: "samples",
                title: "Samples",
                field: "samples",
                formatter: samples => {
                    let html = "-";
                    if (samples?.length) {
                        html = "<div>";
                        for (const sample of samples) {
                            html += `
                                <div style="white-space: nowrap">
                                    <span style="font-weight: bold">${sample.id}</span>
                                    <span title="${sample.somatic ? "Somatic sample" : "Germline sample"}"> (${sample.somatic ? "S" : "G"})</span>
                                </div>
                            `;
                        }
                        html += `</div>`;
                    }
                    return html;
                },
                halign: "center",
                visible: this.gridCommons.isColumnVisible("samples")
            },
            {
                id: "father",
                title: "Father",
                field: "father.id",
                formatter: fatherId => fatherId || "-",
                halign: "center",
                visible: this.gridCommons.isColumnVisible("father")
            },
            {
                id: "mother",
                title: "Mother",
                field: "mother.id",
                formatter: motherId => motherId || "-",
                halign: "center",
                visible: this.gridCommons.isColumnVisible("mother")
            },
            {
                id: "disorders",
                title: "Disorders",
                field: "disorders",
                formatter: CatalogGridFormatter.disorderFormatter,
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
                id: "ethnicity",
                title: "Ethnicity",
                field: "ethnicity",
                formatter: (ethnicity, row) => ethnicity?.id || row.population?.name || "-",
                halign: "center",
                visible: this.gridCommons.isColumnVisible("ethnicity")
            },
            {
                id: "creationDate",
                title: "Creation Date",
                field: "creationDate",
                formatter: CatalogGridFormatter.dateFormatter,
                halign: "center",
                visible: this.gridCommons.isColumnVisible("creationDate")
            },
        ];

        // Example of custom annotation configuration:
        // this._config.annotations = [
        //     {
        //         title: "Cardiology Tests",
        //         position: 6,
        //         variableSetId: "cardiology_tests_checklist",
        //         variables: ["ecg_test", "echo_test"]
        //     },
        //     {
        //         title: "Risk Assessment",
        //         position: 7,
        //         variableSetId: "risk_assessment",
        //     }
        // ];
        if (this._config.annotations?.length > 0) {
            this.gridCommons.addColumnsFromAnnotations(this._columns, CatalogGridFormatter.customAnnotationFormatter, this._config);
        }

        if (this.opencgaSession && this._config.showActions) {
            this._columns.push({
                id: "actions",
                title: "Actions",
                field: "actions",
                align: "center",
                formatter: (value, row) => {
                    const hasWritePermission = OpencgaCatalogUtils.getStudyEffectivePermission(
                        this.opencgaSession.study,
                        this.opencgaSession.user.id,
                        this.permissionID,
                        this.opencgaSession?.organization?.configuration?.optimizations?.simplifyPermissions);
                    return `
                        <div class="d-inline-block dropdown">
                            <button class="btn btn-light btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                <i class="fas fa-toolbox me-1" aria-hidden="true"></i>
                                <span>Actions</span>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li>
                                    <a data-action="copy-json" class="dropdown-item" href="javascript: void 0">
                                         <i class="fas fa-copy me-1" aria-hidden="true"></i> Copy JSON
                                    </a>
                                </li>
                                <li>
                                    <a data-action="download-json" class="dropdown-item" href="javascript: void 0">
                                        <i class="fas fa-download me-1" aria-hidden="true"></i> Download JSON
                                    </a>
                                </li>
                                <li><hr class="dropdown-divider"></li>
                                <li>
                                    <a data-action="quality-control"
                                       class="dropdown-item ${row.qualityControl?.metrics && row.qualityControl.metrics.length === 0 ? "" : "disabled"}"
                                       title="${row.qualityControl?.metrics && row.qualityControl.metrics.length === 0 ? "Launch a job to calculate Quality Control stats" : "Quality Control stats already calculated"}">
                                           <i class="fas fa-rocket me-1" aria-hidden="true"></i> Calculate Quality Control
                                    </a>
                                </li>
                                <li><hr class="dropdown-divider"></li>
                                <li>
                                    ${row.attributes?.OPENCGA_CLINICAL_ANALYSIS?.length ? row.attributes.OPENCGA_CLINICAL_ANALYSIS.map(clinicalAnalysis => `
                                        <a data-action="interpreter"
                                           class="dropdown-item ${row.attributes.OPENCGA_CLINICAL_ANALYSIS ? "" : "disabled"}"
                                           href="#interpreter/${this.opencgaSession.project.id}/${this.opencgaSession.study.id}/${clinicalAnalysis.id}">
                                               <i class="fas fa-user-md me-1" aria-hidden="true"></i> Case Interpreter - ${clinicalAnalysis.id}
                                        </a>
                                    `).join("") : `
                                        <a data-action="interpreter" class="dropdown-item disabled" href="#">
                                            <i class="fas fa-user-md me-1" aria-hidden="true"></i> No cases found
                                        </a>
                                    `}
                                </li>
                                <li><hr class="dropdown-divider"></li>
                                <li>
                                    <a data-action="edit" class="dropdown-item ${hasWritePermission ? "" : "disabled"}" href="javascript: void 0">
                                        <i class="fas fa-edit me-1" aria-hidden="true"></i> Edit ...
                                    </a>
                                </li>
                                <li>
                                    <a data-action="delete" class="dropdown-item disabled" href="javascript: void 0">
                                        <i class="fas fa-trash me-1" aria-hidden="true"></i> Delete
                                    </a>
                                </li>
                            </ul>
                        </div>
                    `;
                },
                events: {
                    "click a": this.onActionClick.bind(this),
                },
                visible: this.gridCommons.isColumnVisible("actions"),
            });
        }

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
        this.opencgaSession.opencgaClient.individuals()
            .search(filters)
            .then(restResponse => {
                const results = restResponse.getResults();
                if (results) {
                    // Check if user clicked in Tab or JSON format
                    if (e.detail.option.toUpperCase() === "TAB") {
                        const fields = ["id", "samples.id", "father.id", "mother.id", "disorders.id", "phenotypes.id", "sex.id", "lifeStatus", "dateOfBirth", "creationDate"];
                        const data = UtilsNew.toTableString(results, fields, {
                            "sex.id": CatalogGridFormatter.sexFormatter,
                        });
                        UtilsNew.downloadData(data, "individuals_" + this.opencgaSession.study.id + ".tsv", "text/plain");
                    } else {
                        UtilsNew.downloadData(JSON.stringify(results, null, "\t"), "individuals_" + this.opencgaSession.study.id + ".json", "application/json");
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

    onCreateCohortShow() {
        const filters = {
            ...this.filters,
            include: "id,samples.id,samples.internal",
            limit: 5000,
        };
        this.opencgaSession.opencgaClient.individuals()
            .search(filters)
            .then(response => {
                const results = response.getResults();
                if (results) {
                    this.createCohortSampleIds = [];
                    for (const result of results) {
                        for (const sample of result.samples) {
                            this.createCohortSampleIds.push({"id": sample.id});
                        }
                    }
                    this.requestUpdate();
                    ModalUtils.show(`${this._prefix}CreateCohortModal`);
                } else {
                    console.error("Error in result format");
                }
            })
            .catch(response => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            });
    }

    onCreateCohortSave() {
        const cohortId = document.querySelector(`#${this._prefix}CohortId`).value;
        const cohortName = document.querySelector(`#${this._prefix}CohortName`).value;

        const params = {
            study: this.opencgaSession.study.fqn,
            includeResult: false
        };
        this.opencgaSession.opencgaClient.cohorts()
            .create({
                id: cohortId,
                name: cohortName ?? "",
                samples: this.createCohortSampleIds,
            }, params)
            .then(() => {
                this.createCohortSampleIds = [];
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Cohort Create",
                    message: "Cohort created correctly"
                });
            })
            .catch(reason => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
            });
    }

    getRightToolbar() {
        return [
            {
                render: () => html`
                    <button type="button" class="btn btn-light" @click="${e => this.onCreateCohortShow(e)}">
                        <i class="fas fa-users pe-1"></i> Create Cohort
                    </button>
                `,
            }
        ];
    }

    renderModalUpdate() {
        return ModalUtils.create(this, `${this._prefix}UpdateModal`, {
            display: {
                modalTitle: `Individual Update: ${this.individualUpdateId}`,
                modalDraggable: true,
                modalCyDataName: "modal-update",
                modalSize: "modal-lg"
            },
            render: active => html`
                <individual-update
                    .individualId="${this.individualUpdateId}"
                    .active="${active}"
                    .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                    .opencgaSession="${this.opencgaSession}">
                </individual-update>
            `,
        });
    }

    renderModalCohortCreate() {
        return ModalUtils.create(this, `${this._prefix}CreateCohortModal`, {
            display: {
                modalTitle: "Create Cohort",
                modalDraggable: true,
                modalbtnsVisible: true,
                modalSize: "modal-md"
            },
            render: () => {
                return html`
                    <div class="mb-2">
                        Create a new cohort with <span class="fw-bold">${this.createCohortSampleIds?.length} samples</span>.
                        This can take few seconds depending on the number of samples.
                    </div>
                    ${this.createCohortSampleIds?.length === 5000 ? html`
                        <div class="alert alert-warning mb-2">No more than 5,000 samples allowed.</div>
                    ` : nothing}
                    <form>
                        <div class="mb-2">
                            <label for="${this._prefix}CohortId" class="form-label">Cohort ID</label>
                            <input type="text" class="form-control" id="${this._prefix}CohortId" placeholder="">
                        </div>
                        <div class="mb-0">
                            <label for="${this._prefix}CohortName" class="form-label">Cohort Name</label>
                            <input type="text" class="form-control" id="${this._prefix}CohortName" placeholder="">
                        </div>
                    </form>
                `;
            },
            onOk: e => this.onCreateCohortSave(e)
        });
    }

    render() {
        return html`
            ${this._config.showToolbar ? html`
                <opencb-grid-toolbar
                    .query="${this.filters}"
                    .rightToolbar="${this.getRightToolbar()}"
                    .opencgaSession="${this.opencgaSession}"
                    .settings="${this.toolbarSetting}"
                    .config="${this.toolbarConfig}"
                    @columnChange="${this.onColumnChange}"
                    @download="${this.onDownload}"
                    @export="${this.onDownload}"
                    @actionClick="${e => this.onActionClick(e)}"
                    @individualCreate="${this.renderTable}">
                </opencb-grid-toolbar>
            ` : nothing}

            <div id="${this._prefix}GridTableDiv" class="force-overflow" data-cy="ib-grid">
                <table id="${this.gridId}"></table>
            </div>

            ${this.renderModalUpdate()}
            ${this.renderModalCohortCreate()}
        `;
    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 25],
            multiSelection: false,
            showSelectCheckbox: false,
            detailView: true,
            showToolbar: true,
            showActions: true,

            showCreate: true,
            showExport: true,
            showSettings: true,
            exportTabs: ["download", "link", "code"],
        };
    }

}

customElements.define("individual-grid", IndividualGrid);
