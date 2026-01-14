import {html, LitElement, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import "../../commons/forms/data-form.js";
import "../../commons/filters/catalog-search-autocomplete.js";
import "../../commons/filters/disease-panel-filter.js";
import "../filters/clinical-flag-filter.js";
import CatalogGridFormatter from "../../commons/catalog-grid-formatter.js";
import GridCommons from "../../commons/grid-commons";
import WebUtils from "../../commons/utils/web-utils";

export default class ClinicalTertiarySelect extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            selectedClinicalAnalyses: {
                type: Array,
            },
            opencgaSession: {
                type: Object,
            },
            displayConfig: {
                type: Object,
            },
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this.gridId = this._prefix + "ClinicalTertiarySelectGrid";
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        // if (changedProperties.has("toolParams")) {
        //     this.toolParamsObserver();
        // }
        // if (changedProperties.has("displayConfig")) {
        //     this._config = this.getDefaultConfig();
        // }
        if (changedProperties.has("opencgaSession")) {
            this.propertyObserver();
        }
        super.update(changedProperties);
    }

    propertyObserver() {
        this._config = this.getDefaultConfig();
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
    }

    updated(changedProperties) {
        if (changedProperties.size > 0) {
            this.renderRemoteTable();
        }
    }

    fetchData(query) {
        return this.opencgaSession.opencgaClient.clinical().search(query);
    }

    renderRemoteTable() {
        if (this.opencgaSession?.opencgaClient && this.opencgaSession?.study?.fqn) {
            // if (this.lastFilters && JSON.stringify(this.lastFilters) === JSON.stringify(this.query)) {
            //     // Abort destroying and creating again the grid. The filters have not changed
            //     return;
            // }
            this.table = $("#" + this.gridId);
            this.table.bootstrapTable("destroy");
            this.table.bootstrapTable({
                classes: "table table-borderless table-hover table-grid",
                buttonsClass: "light",
                columns: this.getDefaultColumns(),
                sidePagination: "server",
                iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
                icons: GridCommons.GRID_ICONS,
                uniqueId: "id",
                pagination: this._config.pagination,
                pageSize: this._config.pageSize,
                pageList: this._config.pageList,
                paginationVAlign: "bottom",
                formatShowingRows: (pageFrom, pageTo, totalRows) => {
                    return this.gridCommons.formatShowingRows(pageFrom, pageTo, totalRows);
                },
                loadingTemplate: () => GridCommons.loadingFormatter(),
                ajax: params => {
                    let clinicalAnalysisResponse = null;
                    this.filters = {
                        study: this.opencgaSession.study.fqn,
                        limit: params.data.limit,
                        skip: params.data.offset || 0,
                        count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                        exclude: "files,interpretation.primaryFindings,secondaryInterpretations",
                        sort: "creationDate",
                        ...this.query
                    };

                    // Store the current filters
                    this.lastFilters = {...this.filters};
                    this.fetchData(this.filters)
                        .then(response => {
                            clinicalAnalysisResponse = response;
                            // Prepare data for columns extensions
                            const rows = clinicalAnalysisResponse.responses?.[0]?.results || [];
                            return this.gridCommons.prepareDataForExtensions(this.COMPONENT_ID, this.opencgaSession, this.filters, rows);
                        })
                        .then(() => {
                            params.success(clinicalAnalysisResponse);
                        })
                        .catch(error => {
                            console.error(error);
                            params.error(error);
                        })
                        .finally(() => {
                            LitUtils.dispatchCustomEvent(this, "queryComplete", null, {
                                response: clinicalAnalysisResponse,
                            });
                        });
                },
                responseHandler: response => {
                    const result = this.gridCommons.responseHandler(response, $(this.table).bootstrapTable("getOptions"));
                    return result.response;
                },

                onCheck: row => this.gridCommons.onCheck(row.id, row),
                onUncheck: row => this.gridCommons.onUncheck(row.id, row),
                onCheckAll: rows => this.gridCommons.onCheckAll(rows),
                onUncheckAll: rows => this.gridCommons.onUncheckAll(rows),

                onPageChange: (number, size) => this.gridCommons.onPageChange(number, size),
                onLoadSuccess: data => this.gridCommons.onLoadSuccess(data),
                onLoadError: (event, response) => this.gridCommons.onLoadError(event, response),
            });
        }
    }

    getDefaultColumns() {
        return [
            {
                field: "state",
                checkbox: true,
                valign: "middle",
                align: "center",
            },
            {
                id: "caseId",
                title: "Case",
                field: "id",
                valign: "middle",
                formatter: (value, row) => this.caseFormatter(value, row),
            },
            {
                id: "probandId",
                title: "Proband (Sample) / Family",
                field: "proband",
                valign: "middle",
                formatter: (value, row) => this.probandFormatter(value, row),
            },
            {
                id: "disorderId",
                title: "Disorder",
                field: "disorder",
                valign: "middle",
                formatter: value => {
                    return CatalogGridFormatter.disorderFormatter([value]);
                },
            },
            {
                id: "panels",
                title: "Panels",
                field: "panels",
                valign: "middle",
                formatter: (value, row) => CatalogGridFormatter.panelFormatter(value),
            },

            {
                id: "interpretation",
                title: "Interpretation Stats",
                field: "interpretation",
                valign: "middle",
                formatter: (value, row) => this.interpretationFormatter(value, row),
            },
            {
                id: "status",
                title: "Status",
                field: "status",
                valign: "middle",
                formatter: (value, row) => this.statusFormatter(value, row),
            },
            {
                id: "priority",
                title: "Priority",
                field: "priority",
                valign: "middle",
                formatter: (value, row) => this.priorityFormatter(value, row),
            },
            {
                id: "analysts",
                title: "Analysts",
                field: "analysts",
                valign: "middle",
                formatter: value => this.analystsFormatter(value),
            },

            {
                id: "dates",
                title: "Due / Creation Date",
                field: "Dates",
                valign: "middle",
                formatter: (field, clinicalAnalysis) => {
                    const dueDateString = UtilsNew.dateFormatter(clinicalAnalysis.dueDate);
                    const dueDate = new Date(dueDateString);
                    const currentDate = new Date();
                    let dueDateClass = null;
                    if (currentDate > dueDate) {
                        dueDateClass = "text-danger";
                    }
                    return `
                        <div class="${dueDateClass}">${dueDateString}</div>
                        <div class="text-body-secondary">${UtilsNew.dateFormatter(clinicalAnalysis.creationDate)}</div>
                    `;
                },
            },
            // {
            //     id: "actions",
            //     align: "right",
            //     formatter: (value, row) => this.actionsFormatter(value, row),
            //     events: {
            //         "click a": (event, value, row) => this.onActionClick(event, row),
            //     },
            //     excludeFromSettings: true,
            //     visible: this._config.showActions,
            // },
        ];
        return this._columns;
    }

    caseFormatter(value, row) {
        return `
            <div class="d-flex align-items-center gap-2">
                <a class="link fw-bold" data-action="view">${row.id}</a>
                ${row.locked ? `<i class="fas fa-lock fs-7"></i>` : ""}
            </div>
            <div class="text-secondary" data-cy="case-type">${row.type}</div>
        `;
    }

    probandFormatter(value, row) {
        if (row.proband) {
            const samplesHtml = row.proband?.samples?.map(sample => `<span>${sample.id}</span>`)?.join(", ");
            return `
                <div class="my-1">
                    <a class="link fw-bold" data-action="view-individual" data-individual="${row.proband.id}">${row.proband?.id}</a>
                    <span class="text-secondary ms-1">(${samplesHtml})</span>
                </div>
                ${row.family?.id ? `
                    <div class="my-1">
                        <a class="link fw-bold" data-action="view-family" data-family="${row.family.id}">${row.family.id}</a>
                        <span class="text-secondary ms-1">(${row.family.members?.length || 0} members)</span>
                    </div>
                ` : ""}
            `;
        }
        return "-";
    }

    interpretationFormatter(value, row) {
        let html;
        if (value?.stats?.primaryFindings) {
            const tierStats = Object.keys(value.stats.primaryFindings.tierCount)
                .filter(key => key !== "none")
                .sort()
                .map(key => `${key}: ${value.stats.primaryFindings.tierCount[key]}`)
                .join(", ");
            html = `
                <div>
                    <span>${value.stats.primaryFindings.numVariants} variants</span>
                </div>
                <div>
                    <span class="text-body-secondary">${value.stats.primaryFindings.statusCount?.REPORTED} reported</span>
                </div>
                <div>
                    <span class="text-body-secondary">
                        ${tierStats}
                    </span>
                </div>
                <div>
                    <span class="text-body-secondary">
                        ${Object.keys(value.stats.primaryFindings.geneCount).length} genes
                    </span>
                </div>
            `;
        } else {
            if (row.interpretation?.primaryFindings?.length > 0) {
                const reviewedVariants = row.interpretation.primaryFindings.filter(v => v.status === "REVIEWED");
                html = `
                    <div>
                        <span">${row.interpretation.primaryFindings.length} variants</span>
                    </div>
                    <div>
                        <span class="text-body-secondary" style="margin: 5px 0">${reviewedVariants.length} reviewed</span>
                    </div>
                `;
            } else {
                html = "<span>0 variants</span>";
            }
        }

        const url = WebUtils.getInterpreterLink(this.opencgaSession, {id: row.id});
        return `
            <a class="text-decoration-none" data-action="interpreter" title="Go to Case Interpreter" href="${url}">
                ${html}
            </a>
        `;
    }

    priorityFormatter(value, row) {
        const priority = (this.opencgaSession?.study?.internal?.configuration?.clinical?.priorities || []).find(priority => {
            return priority.id === value?.id;
        });
        if (priority) {
            return `
                <a class="badge ${WebUtils.getClinicalAnalysisPriorityColour(priority.rank)} text-decoration-none" tooltip-title="Priority" tooltip-text="${priority.description}">
                    ${priority.id}
                </a>
            `;
        }
        return "-";
    }

    statusFormatter(value, row) {
        const status = (this.opencgaSession.study?.internal?.configuration?.clinical?.status || []).find(status => {
            return status.id === value?.id;
        });
        if (status) {
            return `
                <a class="text-decoration-none text-body fw-bold" tooltip-title="Status" tooltip-text="${status.description}">
                    ${status.id}
                </a>
            `;
        }
        return "-";
    }

    analystsFormatter(analysts) {
        const items = (analysts || []).map(analyst => {
            if (analyst?.id) {
                return `
                    <div style="white-space: nowrap">
                        <span data-cy="analyst-id">${analyst.id}</span>
                    </div>
                `;
            }
            return "";
        });
        return items.join("") || "-"
    }

    renderToolbarLeftContent() {
        return html`
            <span id="${this.gridId + "PaginationInfo"}"></span>
        `;
    }

    getRightToolbar() {
        // const hasWritePermission = this.gridCommons.hasPermission("WRITE");
        // return [
        //     {
        //         icon: "fa-plus",
        //         title: "Create Clinical Analysis",
        //         disabled: !hasWritePermission,
        //         onClick: () => this.gridCommons.changeActiveModal("create-clinical-analysis"),
        //     },
        // ];
        return [];
    }

    render() {
        return html`
            ${this._config.showToolbar ? html`
                <grid-toolbar
                    .opencgaSession="${this.opencgaSession}"
                    .leftContent="${this.renderToolbarLeftContent()}"
                    .rightToolbar="${this.getRightToolbar()}"
                    .settings="${this.toolbarSetting}"
                    .config="${this.toolbarConfig}"
                    @download="${this.onDownload}"
                    @export="${this.onDownload}">
                </grid-toolbar>
            ` : nothing}

            <div id="${this._prefix}GridTableDiv" class="force-overflow">
                <table id="${this.gridId}"></table>
            </div>

        `;
    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 25],
        };
    }
}

customElements.define("clinical-tertiary-select", ClinicalTertiarySelect);
