import {html, LitElement, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import DataFormElements from "../../commons/forms/data-form-elements.js";
import "../../commons/forms/data-form.js";
import "../../commons/filters/catalog-search-autocomplete.js";
import "../../commons/filters/disease-panel-filter.js";
import "../filters/clinical-flag-filter.js";
import CatalogGridFormatter from "../../commons/catalog-grid-formatter.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";
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
            toolParams: {
                type: Object,
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

        this.DEFAULT_TOOLPARAMS = {
            // mode: "Single", // Single, Batch
            // selectionType: "Sample",
            // sample: null,
            // samples: [],
            // caseId: "",
            // panels: [],
            // flags: "",
            // type: "SINGLE",
            // disorders: [],
            // mappingFile: "",

            selectedClinicalAnalyses: []
        };

        // this.clinicalAnalyses = [];

        this._toolParams = UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS);
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("toolParams")) {
            this.toolParamsObserver();
        }
        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }
        if (changedProperties.has("opencgaSession")) {
            this.propertyObserver();
        }
        super.update(changedProperties);
    }

    propertyObserver() {
        // With each property change we must update config and create the columns again. No extra checks are needed.
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config
        };
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
    }

    updated(changedProperties) {
        if (changedProperties.size > 0 && this.active) {
            this.renderRemoteTable();
        }
        this.renderRemoteTable();
    }

    toolParamsObserver() {
        this._toolParams = {
            ...UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS),
            ...this.toolParams,
        };
    }

    dispatchChange() {
        LitUtils.dispatchCustomEvent(this, "paramsChange", null, {
            ...this._toolParams,
        });
    }

    notifySelectClinicalAnalyses() {
        LitUtils.dispatchCustomEvent(this, "clinicalAnalysesChange", {
            clinicalAnalyses: this._toolParams.selectedClinicalAnalyses,
        });
    }

    onFieldChange(event) {
        this._toolParams = {
            ...this._toolParams,
        };

        // this.requestUpdate();
        // this.dispatchChange();
    }

    onClear() {
        this._toolParams = UtilsNew.objectClone(this.DEFAULT_TOOLPARAMS);
        this.requestUpdate();
    }

    fetchData(query) {
        return this.opencgaSession.opencgaClient.clinical().search(query);
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
                classes: "table table-borderless table-hover table-grid",
                buttonsClass: "light",
                columns: this._columns,
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

                onCheck: row => {
                    debugger
                    this.gridCommons.onCheck(row.id, row)
                },
                onUncheck: row => this.gridCommons.onUncheck(row.id, row),
                onCheckAll: rows => this.gridCommons.onCheckAll(rows),
                onUncheckAll: rows => this.gridCommons.onUncheckAll(rows),

                // onCheck: (row) => {
                //     this.gridCommons.onCheck(row);
                //     // this._toolParams.selectedClinicalAnalyses = rows.map(r => r.id);
                //     // this.notifySelectClinicalAnalyses();
                // },
                // onUncheck: (row) => {
                //     this.gridCommons.onUncheck(row);
                //     // this._toolParams.selectedClinicalAnalyses = this._toolParams.selectedClinicalAnalyses.filter(id => id !== row.id);
                //     // this.notifySelectClinicalAnalyses();
                // },
                // onCheckAll: rows => {
                //     const newIds = rows
                //         .map(row => row.id)
                //         .filter(id => !this._toolParams.selectedClinicalAnalyses.includes(id));
                //     this._toolParams.selectedClinicalAnalyses.push(...newIds);
                //     this.notifySelectClinicalAnalyses();
                // },
                // onUncheckAll: rows => {
                //     const ids = rows.map(row => row.id);
                //     this._toolParams.selectedClinicalAnalyses = this._toolParams.selectedClinicalAnalyses.filter(id => !ids.includes(id));
                //     this.notifySelectClinicalAnalyses();
                // },

                onPageChange: (number, size) => this.gridCommons.onPageChange(number, size),
                onLoadSuccess: data => this.gridCommons.onLoadSuccess(data),
                onLoadError: (event, response) => this.gridCommons.onLoadError(event, response),
            });
        }
    }

    // removeRowTable(clinicalAnalysisId) {
    //     const data = this.table.bootstrapTable("getData");
    //     this.table.bootstrapTable("remove", {
    //         field: "id",
    //         values: [clinicalAnalysisId]
    //     });
    //     if (data?.length === 0) {
    //         this.table.bootstrapTable("prevPage");
    //         this.table.bootstrapTable("refresh");
    //     }
    // }

    _getDefaultColumns() {
        this._columns = [
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
                events: {
                    "click a": (event, value, row) => this.onActionClick(event, row),
                },
                visible: this.gridCommons.isColumnVisible("caseId")
            },
            {
                id: "probandId",
                title: "Proband (Sample) / Family",
                field: "proband",
                valign: "middle",
                formatter: (value, row) => this.probandFormatter(value, row),
                events: {
                    "click a": (event, value, row) => this.onActionClick(event, row),
                },
                visible: this.gridCommons.isColumnVisible("probandId")
            },
            {
                id: "disorderId",
                title: "Disorder",
                field: "disorder",
                valign: "middle",
                formatter: value => {
                    return CatalogGridFormatter.disorderFormatter([value]);
                },
                visible: this.gridCommons.isColumnVisible("disorderId")
            },
            {
                id: "panels",
                title: "Panels",
                field: "panels",
                valign: "middle",
                formatter: (value, row) => CatalogGridFormatter.panelFormatter(value),
                visible: this.gridCommons.isColumnVisible("panels")
            },

            {
                id: "interpretation",
                title: "Interpretation Stats",
                field: "interpretation",
                valign: "middle",
                formatter: (value, row) => this.interpretationFormatter(value, row),
                visible: this.gridCommons.isColumnVisible("interpretation")
            },
            {
                id: "status",
                title: "Status",
                field: "status",
                valign: "middle",
                formatter: (value, row) => this.statusFormatter(value, row),
                visible: this.gridCommons.isColumnVisible("status"),
            },
            {
                id: "priority",
                title: "Priority",
                field: "priority",
                valign: "middle",
                formatter: (value, row) => this.priorityFormatter(value, row),
                visible: this.gridCommons.isColumnVisible("priority"),
            },
            {
                id: "analysts",
                title: "Analysts",
                field: "analysts",
                valign: "middle",
                formatter: value => this.analystsFormatter(value),
                visible: this.gridCommons.isColumnVisible("analysts"),
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
                visible: this.gridCommons.isColumnVisible("dates"),
            },
            {
                id: "interpreter",
                title: "Interpreter",
                field: "interpreter",
                formatter: (_, row) => {
                    return `
                        <a class="btn btn-primary cursor-pointer" href="${WebUtils.getInterpreterLink(this.opencgaSession, {id: row.id})}">
                            <i class="fas fa-sign-in-alt me-1"></i>
                            <span>Enter</span>
                        </a>
                    `;
                },
                visible: this.gridCommons.isColumnVisible("interpreter")
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

        this._columns = this.gridCommons.addColumnsFromExtensions(this.COMPONENT_ID, this.opencgaSession, this._columns);
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
            readOnlyMode: false, // it hides priority and status selectors even if the user has permissions
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 25],

            showToolbar: true,
            showActions: true,

            showExport: true,
            showSettings: true,
            exportTabs: ["download", "link", "code"],
        };
    }








    // async onSelectSamples(resource, value) {
    //     let resourcePromise = null;
    //
    //     // If not value, reset samples
    //     if (!value) {
    //         this._toolParams = {
    //             ...this._toolParams,
    //             samples: [],
    //         };
    //         this.requestUpdate();
    //         return;
    //     }
    //
    //     switch (resource) {
    //         case "Sample":
    //             resourcePromise = await this.opencgaSession.opencgaClient.samples()
    //                 .search({
    //                     id: value,
    //                     study: this.opencgaSession.study.fqn,
    //                     include: "id,individualId,somatic,internal.status.id",
    //                     includeIndividual: true,
    //                 });
    //             // .then(response => {
    //             //     return response?.responses?.[0]?.results || [];
    //             // });
    //             break;
    //         case "Cohort":
    //             resourcePromise = await this.opencgaSession.opencgaClient.samples()
    //                 .search({
    //                     cohortIds: value,
    //                     study: this.opencgaSession.study.fqn,
    //                     include: "id,individualId,somatic,internal.status.id",
    //                     includeIndividual: true,
    //                 });
    //             // .then(response => {
    //             //     return response?.responses?.[0]?.results?.[0]?.samples || [];
    //             // });
    //             break;
    //     }
    //
    //
    //     const samples = resourcePromise.getResults() || [];
    //
    //     // Now we need to read samples.individualId and fetch clinical analysis case if any
    //     const individualIds = samples
    //         .map(sample => sample.individualId)
    //         .filter((value, index, self) => self.indexOf(value) === index); // unique values
    //
    //     if (individualIds.length > 0) {
    //         // 1. fetch clinical analysis for the individuals
    //         const clinicalResponse = await this.opencgaSession.opencgaClient.clinical()
    //             .search({
    //                 proband: individualIds.join(","),
    //                 study: this.opencgaSession.study.fqn,
    //                 include: "id,type,proband.id",
    //             });
    //         const clinicalCases = clinicalResponse?.responses?.[0]?.results || [];
    //
    //         // 2. fetch families for the individuals
    //         const familiesResponse = await this.opencgaSession.opencgaClient.families()
    //             .search({
    //                 members: individualIds.join(","),
    //                 study: this.opencgaSession.study.fqn,
    //                 include: "id,members.id",
    //             });
    //         const families = familiesResponse?.responses?.[0]?.results || [];
    //
    //         // 3. add clinical analysis and family info to each sample
    //         samples.forEach(sample => {
    //             const caseForSample = clinicalCases.find(ca => ca.proband?.id === sample.individualId);
    //             const familyForSample = families.find(family =>
    //                 family.members?.some(member => member.id === sample.individualId)
    //             );
    //             sample.familyId = familyForSample?.id || null;
    //             sample.clinicalAnalysisId = caseForSample?.id || null;
    //         });
    //     }
    //
    //     this._toolParams = {
    //         ...this._toolParams,
    //         samples: samples || [],
    //     };
    //
    //     this.requestUpdate();
    //     this.dispatchChange();
    // }

    // renderSelection(selectionType, allowedSelectionTypes) {
    //     return html`
    //         <div class="input-group flex-nowrap">
    //             <catalog-search-autocomplete
    //                 class="flex-grow-1"
    //                 .resource="${selectionType.toUpperCase()}"
    //                 .opencgaSession="${this.opencgaSession}"
    //                 .config="${{
    //                     multiple: false,
    //                 }}"
    //                 @filterChange="${event => this.onSelectSamples(selectionType, event.detail.value)}">
    //             </catalog-search-autocomplete>
    //             <button class="btn btn-outline-secondary dropdown-toggle mb-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
    //                 <span>${selectionType}</span>
    //             </button>
    //             <div class="dropdown-menu dropdown-menu-end">
    //                 ${allowedSelectionTypes.map(type => html`
    //                     <div class="dropdown-item ${selectionType === type ? "active" : "cursor-pointer"}">
    //                         ${type}
    //                     </div>
    //                 `)}
    //             </div>
    //         </div>
    //     `;
    // }

    // getClinicalAnalysis() {
    //     this.opencgaSession.opencgaClient.clinical()
    //         .search({
    //             // proband: individualIds.join(","),
    //             study: this.opencgaSession.study.fqn,
    //             include: "id,type,proband.id",
    //         })
    //         .then(response => {
    //             this.clinicalAnalyses = response?.responses?.[0]?.results || [];
    //         })
    //         .catch(() =>
    //             NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_ERROR, {
    //                 message: "Error fetching clinical analyses",
    //             }))
    //         .finally(() => {
    //             this._toolParams = {
    //                 ...this._toolParams,
    //             };
    //             this.requestUpdate();
    //         });
    // }
    //
    // render() {
    //     if (!this.opencgaSession) {
    //         return nothing;
    //     }
    //
    //     return html`
    //         <data-form
    //             .data="${this._toolParams}"
    //             .config="${this._config}"
    //             @fieldChange="${event => this.onFieldChange(event)}"
    //             @clear="${event => this.onClear(event)}">
    //         </data-form>
    //     `;
    // }
    //
    // getDefaultConfig() {
    //     return {
    //         title: "Analysis Selection",
    //         display: {
    //             titleClassName: "mb-4",
    //             ...this.displayConfig,
    //         },
    //         sections: [
    //             // {
    //             //     // title: "Select Analysis Mode",
    //             //     elements: [
    //             //         DataFormElements.tabsElement({
    //             //             field: "mode",
    //             //             tabs: [
    //             //                 {id: "Single", text: "Single"},
    //             //                 {id: "Batch", text: "Batch"},
    //             //             ],
    //             //         }),
    //             //     ],
    //             // },
    //             {
    //                 title: "Batch Analysis Configuration",
    //                 display: {
    //                 },
    //                 elements: [
    //                     {
    //                         title: "Select Samples",
    //                         field: "selectionType",
    //                         type: "custom",
    //                         display: {
    //                             render: (selectionType) => {
    //                                 return this.renderSelection(selectionType, ["Cohort"]);
    //                             },
    //                             helpMessage: "Select samples by Cohort.",
    //                         },
    //                     },
    //                     {
    //                         type: "table",
    //                         // field: "samples",
    //                         display: {
    //                             getData: () => this.clinicalAnalyses || [],
    //                             // visible: data => data?.samples?.length > 0,
    //                             columns: [
    //                                 {
    //                                     title: "Sample",
    //                                     field: "id",
    //                                     type: "custom",
    //                                     display: {
    //                                         bodyCellClassName: "align-middle",
    //                                         render: (sampleId, updateField, updateParams, data, row) => {
    //                                             return html`
    //                                                 <div class="fw-bold my-1">${sampleId}</div>
    //                                                 <div class="text-secondary small my-1">${row?.somatic ? "Somatic" : "Germline"}</div>
    //                                             `;
    //                                         },
    //                                     },
    //                                 },
    //                                 {
    //                                     title: "Individual",
    //                                     field: "individualId",
    //                                     type: "custom",
    //                                     display: {
    //                                         bodyCellClassName: "align-middle",
    //                                         render: (individualId, updateField, updateParams, data, row) => {
    //                                             const individual = row?.attributes?.OPENCGA_INDIVIDUAL;
    //                                             // const sexHtml = CatalogGridFormatter.sexFormatter(individual.sex, individual);
    //                                             return html`
    //                                                 <div class="fw-bold my-1">${individualId || "-"}</div>
    //                                             `;
    //                                         }
    //                                     },
    //                                 },
    //                                 {
    //                                     title: "Family",
    //                                     field: "familyId",
    //                                     type: "custom",
    //                                     display: {
    //                                         bodyCellClassName: "align-middle",
    //                                         render: (familyId) => {
    //                                             return html`
    //                                                 <span class="fw-bold">${familyId || "-"}</span>
    //                                             `;
    //                                         }
    //                                     },
    //                                 },
    //                                 {
    //                                     title: "Clinical Analysis",
    //                                     field: "clinicalAnalysisId",
    //                                     type: "custom",
    //                                     display: {
    //                                         headerCellClassName: "text-center",
    //                                         bodyCellClassName: "align-middle",
    //                                         render: (clinicalAnalysisId) => {
    //                                             return html`
    //                                                 <div class="w-full d-flex justify-content-center">
    //                                                     <i class="fas fs-5 ${!!clinicalAnalysisId ? "fa-check text-success" : "fa-times"}"></i>
    //                                                 </div>
    //                                             `;
    //                                         },
    //                                     },
    //                                 },
    //                                 {
    //                                     title: "Select",
    //                                     type: "custom",
    //                                     display: {
    //                                         headerCellClassName: "text-center",
    //                                         bodyCellClassName: "align-middle",
    //                                         render: (sample, onFieldChange) => {
    //                                             return html`
    //                                                 <div class="w-full d-flex justify-content-center">
    //                                                     <input type="checkbox" class="form-check-input" ?checked="${true}">
    //                                                 </div>
    //                                             `;
    //                                         },
    //                                     },
    //                                 },
    //                             ],
    //                         },
    //                     },
    //                 ],
    //             },
    //         ],
    //     };
    // }

}

customElements.define("clinical-tertiary-select", ClinicalTertiarySelect);
