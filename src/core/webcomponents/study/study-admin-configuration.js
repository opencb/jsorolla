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

export default class StudyAdminConfiguration extends LitElement {

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
        this.activeTab = {}
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = { ...this.getDefaultConfig(), ...this.config };
    }

    // Note: WE NEED this function because we are rendering using JQuery not lit-element API
    firstUpdated(changedProperties) {
        if (changedProperties.has("study")) {
            // this.studyObserver();
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
            // this.studyObserver();
        }

        super.update(changedProperties);
    }

    studyObserver() {
        // this.renderPermissionGrid();
    }

    renderRemoteTable() {
        if (this.opencgaSession.opencgaClient && this.opencgaSession.study) {
            const filters = { ...this.query };
            // TODO fix and replicate this in all browsers (the current filter is not "filters", it is actually built in the ajax() function in bootstrapTable)
            if (UtilsNew.isNotUndefinedOrNull(this.lastFilters) &&
                JSON.stringify(this.lastFilters) === JSON.stringify(filters)) {
                // Abort destroying and creating again the grid. The filters have not changed
                return;
            }

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
                        study: this.opencgaSession.study.fqn,
                        limit: params.data.limit,
                        skip: params.data.offset || 0,
                        count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                        ...filters
                    };
                    // Store the current filters
                    this.lastFilters = { ..._filters };
                    this.opencgaSession.opencgaClient.studies().searchAudit(_filters)
                        .then(sampleResponse => {
                            // Fetch clinical analysis to display the Case ID
                            const individualIds = sampleResponse.getResults().map(sample => sample.individualId).filter(Boolean).join(",");
                            if (individualIds) {
                                this.opencgaSession.opencgaClient.clinical().search(
                                    {
                                        member: individualIds,
                                        study: this.opencgaSession.study.fqn,
                                        exclude: "proband.samples,family,interpretation,files"
                                    })
                                    .then(caseResponse => {
                                        // We store the Case ID in the individual attribute
                                        // Note clinical search results are not sorted
                                        // FIXME at the moment we only search by proband
                                        const map = {};
                                        for (const clinicalAnalysis of caseResponse.responses[0].results) {
                                            if (!map[clinicalAnalysis.proband.id]) {
                                                map[clinicalAnalysis.proband.id] = [];
                                            }
                                            map[clinicalAnalysis.proband.id].push(clinicalAnalysis);
                                        }
                                        for (const sample of sampleResponse.responses[0].results) {
                                            sample.attributes.OPENCGA_CLINICAL_ANALYSIS = map[sample.individualId];
                                        }
                                        params.success(sampleResponse);
                                    })
                                    .catch(e => {
                                        console.error(e);
                                        params.error(e);
                                    });
                            } else {
                                params.success(sampleResponse);
                            }
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
                onPostBody: data => {
                    // Add tooltips?
                }
            });
        }
    }

    renderPermissionGrid() {
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            columns: this._getDefaultColumns(),
            data: this.studyPermissions,
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
                field: "action",
                formatter: (value, row) => `${row.action}-${row.resource}`
            },
            {
                title: "Resource ID",
                field: "resourceId",
            },
            {
                title: "Study Permission",
                field: "id",
            },
            {
                title: "Date",
                field: "date",
                formatter: (value) => `${UtilsNew.dateFormatter(value)}`
            },
            {
                title: "Status",
                field: "status.name",
            },
        ];
    }

    getDefaultConfig() {
        return {
            display: {
                mode: "pills"
            },
            items: [
                {
                    id: "clinical",
                    name: "Clinical",
                    active: true,
                    render: () => {
                        return html`
                            <h1>Clinical Component</h1>
                        `
                    }
                },
                {
                    id: "variants",
                    name: "Variants",
                    active: false,
                    render: () => {
                        return html`
                            <h1>Variant Component</h1>
                        `
                    }
                }
            ]
    };
}


// //Todo: Refactor Tabs Pill as a component similar to details Tabs 
// onClickPill(e) {
//     this._changeView(e.currentTarget.dataset.id);
// }

// _changeView(tabId) {
//     $(".content-pills", this).removeClass("active");
//     $(".content-tab", this).removeClass("active");
//     for (const tab in this.activeTab) this.activeTab[tab] = false;
//     $(`button.content-pills[data-id=${tabId}]`, this).addClass("active");
//     $("#" + tabId, this).addClass("active");
//     this.activeTab[tabId] = true;
//     this.requestUpdate();
// }
// ////////////////////////////////////////////////


render() {
    return html`
            <detail-tabs
                .config="${this._config}"
                .opencgaSession="${this.opencgaSession}">
            </detail-tabs>
        `;
}
}

customElements.define("study-admin-configuration", StudyAdminConfiguration);
