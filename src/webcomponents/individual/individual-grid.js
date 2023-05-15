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
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils";
import ModalUtils from "../commons/modal/modal-ultils";
import LitUtils from "../commons/utils/lit-utils.js";
import "../commons/opencb-grid-toolbar.js";

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
        this._prefix = UtilsNew.randomString(8);
        this.gridId = this._prefix + "IndividualBrowserGrid";
        this.active = true;
        this._config = {...this.getDefaultConfig()};
    }

    // connectedCallback() {
    //     super.connectedCallback();

    //     this._config = {...this.getDefaultConfig(), ...this.config};
    //     this.gridCommons = new GridCommons(this.gridId, this, this._config);
    // }

    firstUpdated() {
        this.table = this.querySelector("#" + this.gridId);
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config
        };
    }

    updated(changedProperties) {
        if ((changedProperties.has("opencgaSession") || changedProperties.has("query") || changedProperties.has("config") ||
            changedProperties.has("active")) && this.active) {
            this.propertyObserver();
        }
    }

    propertyObserver() {
        // With each property change we must be updated config and create the columns again. No extra checks are needed.
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);

        // settings for the grid toolbar
        this.toolbarSetting = {
            ...this._config.toolbar,
            buttons: ["columns", "download"],
        };

        // Config for the grid toolbar
        this.toolbarConfig = {
            toolId: "individualBrowserCatalog",
            resource: "INDIVIDUAL",
            columns: this._getDefaultColumns(),
            create: {
                display: {
                    modalTitle: "Individual Create",
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
            //         modalTitle: "Sample Export",
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
            //         modalTitle: "Sample Settings",
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
        this.renderTable();
    }

    renderTable() {
        // If this.individuals is provided as property we render the array directly
        if (this.individuals && this.individuals?.length > 0) {
            this.renderLocalTable();
        } else {
            this.renderRemoteTable();
        }
        this.requestUpdate();
    }

    renderRemoteTable() {
        if (this.opencgaSession?.opencgaClient && this.opencgaSession?.study?.fqn) {
            // const filters = {...this.query};
            if (this.lastFilters && JSON.stringify(this.lastFilters) === JSON.stringify(this.query)) {
                // Abort destroying and creating again the grid. The filters have not changed
                return;
            }

            this._columns = this._getDefaultColumns();
            this.table = $("#" + this.gridId);
            this.table.bootstrapTable("destroy");
            this.table.bootstrapTable({
                columns: this._columns,
                method: "get",
                sidePagination: "server",
                iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
                icons: GridCommons.GRID_ICONS,
                uniqueId: "id",
                silentSort: false,
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
                    const sort = this.table.bootstrapTable("getOptions").sortName ? {
                        sort: this.table.bootstrapTable("getOptions").sortName,
                        order: this.table.bootstrapTable("getOptions").sortOrder
                    } : {};
                    this.filters = {
                        study: this.opencgaSession.study.fqn,
                        limit: params.data.limit,
                        skip: params.data.offset || 0,
                        count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                        ...sort,
                        ...this.query
                    };

                    // Store the current filters
                    this.lastFilters = {...this.filters};
                    this.opencgaSession.opencgaClient.individuals()
                        .search(this.filters)
                        .then(individualResponse => {
                            // Fetch Clinical Analysis ID per individual in 1 single query
                            const individualIds = individualResponse.getResults().map(individual => individual.id).filter(Boolean).join(",");
                            if (individualIds) {
                                this.opencgaSession.opencgaClient.clinical().search(
                                    {
                                        individual: individualIds,
                                        study: this.opencgaSession.study.fqn,
                                        include: "id,proband.id,family.members"
                                    })
                                    .then(caseResponse => {
                                        individualResponse.getResults().forEach(individual => {
                                            for (const clinicalAnalysis of caseResponse.getResults()) {
                                                if (clinicalAnalysis?.proband?.id === individual.id || clinicalAnalysis?.family?.members?.find(member => member.id === individual.id)) {
                                                    if (individual?.attributes?.OPENCGA_CLINICAL_ANALYSIS) {
                                                        individual.attributes.OPENCGA_CLINICAL_ANALYSIS.push(clinicalAnalysis);
                                                    } else {
                                                        individual.attributes = {
                                                            OPENCGA_CLINICAL_ANALYSIS: [clinicalAnalysis]
                                                        };
                                                    }
                                                }
                                            }
                                        });
                                        params.success(individualResponse);
                                    })
                                    .catch(e => {
                                        console.error(e);
                                        params.error(e);
                                    });
                            } else {
                                params.success(individualResponse);
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
                        if (element[0].innerHTML.includes("fa-plus")) {
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
                    // Add tooltips
                }
            });
        }
    }

    renderLocalTable() {
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            columns: this._getDefaultColumns(),
            data: this.individuals,
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
            detailFormatter: this.detailFormatter,
            gridContext: this,
            formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
            onClickRow: (row, selectedElement, field) => this.gridCommons.onClickRow(row.id, row, selectedElement),
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
                        <thead>
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
                // If parent row is checked and there is only one samlpe then it must be selected
                if (this.gridContext._config.multiSelection) {
                    let checkedStr = "";
                    for (const individual of this.gridContext.individuals) {
                        if (individual.id === row.id && row.samples.length === 1) {
                            // TODO check sampkle has been checked before, we need to store them
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
                        <td>${sample.status ? sample.status.name : ""}</td>
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

    sexFormatter(value, row) {
        let sexHtml = `${UtilsNew.isEmpty(row?.sex) ? "Not specified" : row.sex?.id || row.sex}`;
        if (row?.karyotypicSex) {
            sexHtml += ` (${row.karyotypicSex?.id || row.karyotypicSex})`;
        }
        return sexHtml;
    }

    ethnicityFormatter(value, row) {
        return row.ethnicity?.id || row.population?.name || "-";
    }

    fatherFormatter(value, row) {
        if (row.father?.id) {
            return row.father.id;
        } else {
            return "-";
        }
    }

    motherFormatter(value, row) {
        if (row.mother?.id) {
            return row.mother.id;
        } else {
            return "-";
        }
    }

    samplesFormatter(value, row) {
        if (value?.length) {
            return `
                <ul class="pad-left-15" style="padding-top:10px" >
                    ${value.map(sample => `<li>${sample.id}</li>`).join("")}
                </ul>
            `;
        } else {
            return "-";
        }
    }

    async onActionClick(e, _, row) {
        const action = e.target.dataset.action?.toLowerCase() || e.detail.action;
        switch (action) {
            case "create":
                this._operation = {
                    type: "create",
                    modalId: `${this._prefix}CreateModal`,
                    config: {
                        display: {
                            modalTitle: "Individual Create",
                        },
                        render: () => {
                            return html `
                                <individual-create
                                    .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                                    .opencgaSession="${this.opencgaSession}">
                                </individual-create>
                            `;
                        }
                    },
                };
                this.requestUpdate();
                break;
            case "edit":
                this._operation = {
                    type: "update",
                    modalId: `${this._prefix}EditModal`,
                    config: {
                        display: {
                            modalTitle: `Individual Update: ${row.id}`,
                        },
                        render: active => {
                            return html `
                                <individual-update
                                    .individualId="${row.id}"
                                    .active="${active}"
                                    .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                                    .opencgaSession="${this.opencgaSession}">
                                </individual-update>
                            `;
                        }
                    },
                };
                this.requestUpdate();
                await this.updateComplete;
                ModalUtils.show(this._operation.modalId);
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
        this._columns = [
            {
                id: "id",
                title: "Individual",
                field: "id",
                sortable: true,
                halign: this._config.header.horizontalAlign,
                visible: this.gridCommons.isColumnVisible("id")
            },
            {
                id: "samples",
                title: "Samples",
                field: "samples",
                formatter: this.samplesFormatter,
                halign: this._config.header.horizontalAlign,
                visible: this.gridCommons.isColumnVisible("samples")
            },
            {
                id: "father",
                title: "Father",
                field: "father.id",
                formatter: this.fatherFormatter,
                halign: this._config.header.horizontalAlign,
                visible: this.gridCommons.isColumnVisible("father")
            },
            {
                id: "mother",
                title: "Mother",
                field: "mother.id",
                formatter: this.motherFormatter,
                halign: this._config.header.horizontalAlign,
                visible: this.gridCommons.isColumnVisible("mother")
            },
            {
                id: "disorders",
                title: "Disorders",
                field: "disorders",
                formatter: disorders => {
                    const result = disorders?.map(disorder => CatalogGridFormatter.disorderFormatter(disorder)).join("<br>");
                    return result ? result : "-";
                },
                halign: this._config.header.horizontalAlign,
                visible: this.gridCommons.isColumnVisible("disorders")
            },
            {
                id: "phenotypes",
                title: "Phenotypes",
                field: "phenotypes",
                formatter: CatalogGridFormatter.phenotypesFormatter,
                halign: this._config.header.horizontalAlign,
                visible: this.gridCommons.isColumnVisible("phenotypes")
            },
            {
                id: "caseId",
                title: "Case ID",
                field: "attributes.OPENCGA_CLINICAL_ANALYSIS",
                formatter: (value, row) => CatalogGridFormatter.caseFormatter(value, row, row.id, this.opencgaSession),
                halign: this._config.header.horizontalAlign,
                visible: this.gridCommons.isColumnVisible("attributes.OPENCGA_CLINICAL_ANALYSIS")
            },
            {
                id: "sex",
                title: "Sex (Karyotypic Sex)",
                field: "sex",
                formatter: this.sexFormatter,
                halign: this._config.header.horizontalAlign,
                visible: this.gridCommons.isColumnVisible("sex")
            },
            {
                id: "ethnicity",
                title: "Ethnicity",
                field: "ethnicity",
                formatter: this.ethnicityFormatter,
                halign: this._config.header.horizontalAlign,
                visible: this.gridCommons.isColumnVisible("ethnicity")
            },
            {
                id: "dateOfBirth",
                title: "Date of Birth",
                field: "dateOfBirth",
                sortable: true,
                formatter: CatalogGridFormatter.dateFormatter,
                halign: this._config.header.horizontalAlign,
                visible: this.gridCommons.isColumnVisible("dateOfBirth")
            },
            {
                id: "creationDate",
                title: "Creation Date",
                field: "creationDate",
                sortable: true,
                formatter: CatalogGridFormatter.dateFormatter,
                halign: this._config.header.horizontalAlign,
                visible: this.gridCommons.isColumnVisible("creationDate")
            },
            {
                id: "state",
                field: "state",
                checkbox: true,
                class: "cursor-pointer",
                eligible: false,
                visible: this._config.showSelectCheckbox,
            }
        ];

        if (this.opencgaSession && this._config.showActions) {
            this._columns.push({
                id: "actions",
                title: "Actions",
                field: "actions",
                formatter: (value, row) => `
                    <div class="dropdown">
                        <button class="btn btn-default btn-sm dropdown-toggle" type="button" data-toggle="dropdown">
                            <i class="fas fa-toolbox icon-padding" aria-hidden="true"></i>
                            <span>Actions</span>
                            <span class="caret" style="margin-left: 5px"></span>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-right">
                            <li>
                                <a data-action="copy-json" href="javascript: void 0" class="btn force-text-left">
                                    <i class="fas fa-copy icon-padding" aria-hidden="true"></i> Copy JSON
                                </a>
                            </li>
                            <li>
                                <a data-action="download-json" href="javascript: void 0" class="btn force-text-left">
                                    <i class="fas fa-download icon-padding" aria-hidden="true"></i> Download JSON
                                </a>
                            </li>
                            <li role="separator" class="divider"></li>
                            <li>
                                <a data-action="qualityControl" class="btn force-text-left ${row.qualityControl?.metrics && row.qualityControl.metrics.length === 0 ? "" : "disabled"}"
                                        title="${row.qualityControl?.metrics && row.qualityControl.metrics.length === 0 ? "Launch a job to calculate Quality Control stats" : "Quality Control stats already calculated"}">
                                    <i class="fas fa-rocket icon-padding" aria-hidden="true"></i> Calculate Quality Control
                                </a>
                            </li>
                            <li role="separator" class="divider"></li>
                            <li>
                                ${row.attributes?.OPENCGA_CLINICAL_ANALYSIS?.length ? row.attributes.OPENCGA_CLINICAL_ANALYSIS.map(clinicalAnalysis => `
                                        <a data-action="interpreter" class="btn force-text-left ${row.attributes.OPENCGA_CLINICAL_ANALYSIS ? "" : "disabled"}"
                                           href="#interpreter/${this.opencgaSession.project.id}/${this.opencgaSession.study.id}/${clinicalAnalysis.id}">
                                            <i class="fas fa-user-md icon-padding" aria-hidden="true"></i> Case Interpreter - ${clinicalAnalysis.id}
                                        </a>
                                    `).join("") : `<a data-action="interpreter" class="btn force-text-left disabled" href="#">
                                        <i class="fas fa-user-md icon-padding" aria-hidden="true"></i> No cases found
                                    </a>`
                }
                            </li>
                            <li role="separator" class="divider"></li>
                            <li>
                            <!--
                                <a data-action="edit" class="btn force-text-left ${OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user.id) || "disabled" }"
                                    href='#individualUpdate/${this.opencgaSession.project.id}/${this.opencgaSession.study.id}/${row.id}'>
                                    <i class="fas fa-edit icon-padding" aria-hidden="true"></i> Edit ...
                                </a>
                                -->
                                <a data-action="edit" class="btn force-text-left ${OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user.id) || "disabled" }">
                                    <i class="fas fa-edit icon-padding" aria-hidden="true"></i> Edit ...
                                </a>
                            </li>
                            <li>
                                <a data-action="delete" href="javascript: void 0" class="btn force-text-left disabled">
                                    <i class="fas fa-trash icon-padding" aria-hidden="true"></i> Delete
                                </a>
                            </li>
                        </ul>
                    </div>`,
                // valign: "middle",
                events: {
                    "click a": this.onActionClick.bind(this)
                },
                visible: !this._config.columns?.hidden?.includes("actions")
            });
        }

        // _columns = UtilsNew.mergeTable(_columns, this._config.columns || this._config.hiddenColumns, !!this._config.hiddenColumns);
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
                            "sex.id": this.sexFormatter,
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

    render() {
        return html`
            ${this._config.showToolbar ? html`
                <opencb-grid-toolbar
                    .query="${this.query}"
                    .opencgaSession="${this.opencgaSession}"
                    .settings="${this.toolbarSetting}"
                    .config="${this.toolbarConfig}"
                    @columnChange="${this.onColumnChange}"
                    @download="${this.onDownload}"
                    @export="${this.onDownload}"
                    @actionClick="${e => this.onActionClick(e)}">
                </opencb-grid-toolbar>` : nothing
            }

            <div id="${this._prefix}GridTableDiv">
                <table id="${this.gridId}"></table>
            </div>
        `;
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
            header: {
                horizontalAlign: "center",
                verticalAlign: "bottom"
            },
            customAnnotations: {
                title: "Custom Annotation",
                fields: []
            }
        };
    }

}

customElements.define("individual-grid", IndividualGrid);
