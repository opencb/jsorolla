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

import {LitElement, html} from "/web_modules/lit-element.js";
import UtilsNew from "../../utilsNew.js";
import GridCommons from "../variant/grid-commons.js";
import "../commons/opencb-grid-toolbar.js";


export default class OpencgaClinicalAnalysisGrid extends LitElement {

    constructor() {
        super();
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
            analyses: {
                type: Array
            },
            query: {
                type: Object
            },
            active: {
                type: Boolean
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "cag" + UtilsNew.randomString(6);

        this.active = true;
        this.gridId = this._prefix + "ClinicalAnalysisGrid";
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
    }

    firstUpdated(_changedProperties) {
        this.table = $("#" + this.gridId);
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("query") || changedProperties.has("config") || changedProperties.has("active")) {
            this.propertyObserver();
        }
    }

    propertyObserver() {
        // With each property change we must updated config and create the columns again. No extra checks are needed.
        this._config = Object.assign({}, this.getDefaultConfig(), this.config);
        // this._columns = this._getDefaultColumns();

        // Config for the grid toolbar
        this.toolbarConfig = {
            columns: this._getDefaultColumns().filter( col => col.field)
            // columns: [
            //     {
            //         field: "id", title: "Blabla", visible: true, eligible: true
            //     }
            // ]
        };

        this.renderTable();
        this.requestUpdate();
    }

    renderTable(active) {
        // if (!active) {
        //     return;
        // }

        // Initialise the counters
        this.from = 1;
        this.to = this._config.pageSize;

        if (this.opencgaSession.opencgaClient && this.opencgaSession.study && this.opencgaSession.study.fqn) {
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
                // detailFormatter: _this._config.detailFormatter,

                // Make Polymer components available to table formatters
                gridContext: this,
                formatLoadingMessage: () =>"<div><loading-spinner></loading-spinner></div>",

                ajax: params => {
                    const filters = {
                        study: this.opencgaSession.study.fqn,
                        limit: params.data.limit,
                        skip: params.data.offset || 0,
                        count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                        exclude: "files",
                        ...this.query
                    };
                    this.opencgaSession.opencgaClient.clinical().search(filters)
                        .then( res => params.success(res))
                        .catch( e => {
                            console.error(e);
                            params.error(e);
                        });
                },
                responseHandler: response => {
                    const result = this.gridCommons.responseHandler(response, $(this.table).bootstrapTable("getOptions"));
                    this.from = result.from || this.from;
                    this.to = result.to || this.to;
                    this.numTotalResultsText = result.numTotalResultsText || this.numTotalResultsText;
                    this.approximateCountResult = result.approximateCountResult;
                    this.requestUpdate();
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
                onPageChange: (page, size) => {
                    const result = this.gridCommons.onPageChange(page, size);
                    this.from = result.from || this.from;
                    this.to = result.to || this.to;
                },

                onPostBody: function(data) {
                    // Add qtip2 tooltips to Interpretation genotypes
                    $("div.interpretation-tooltip").qtip({
                        content: {
                            title: "Clinical Interpreters",
                            text: function(event, api) {
                                return $(this).attr("data-tooltip-text");
                            }
                        },
                        position: {
                            target: "mouse",
                            adjust: {
                                x: 2, y: 2,
                                mouse: false
                            }
                        },
                        style: {
                            classes: "qtip-light qtip-rounded qtip-shadow qtip-cutom-class",
                            width: "320px"
                        },
                        show: {
                            delay: 200
                        },
                        hide: {
                            fixed: true,
                            delay: 300
                        }
                    });
                }
            });
        } else {
            // Delete table
            $("#" + this.gridId).bootstrapTable("destroy");
            this.numTotalResults = 0;
        }
    }

    onColumnChange(e) {
        this.gridCommons.onColumnChange(e);
    }

    /**
     * DEPRECATED.
     * @param index
     * @param row
     * @returns {HTMLElement}
     */
    detailFormatter(index, row) {
        const clinicalAnalysisView = document.createElement("clinical-analysis-view");
        clinicalAnalysisView.opencgaSession = this.gridContext.opencgaSession;
        clinicalAnalysisView.opencgaClient = this.gridContext.opencgaSession.opencgaClient;
        clinicalAnalysisView.clinicalAnalysisId = row.id;
        clinicalAnalysisView.showTitle = false;

        const title = document.createElement("h3");
        title.innerText = "Summary";

        const div = document.createElement("div");
        div.style = "padding: 5px 20px 10px 20px";
        div.appendChild(title);
        div.appendChild(clinicalAnalysisView);

        return div;
    }

    analysisIdFormatter(value, row) {
        const html = `<span style="font-size: 1.1em">
                                ${value}
                            </span>
                `;
        // <a style="cursor: pointer" class="btn btn-link" href="#reviewCase">
        //         ${value} <i class="fa fa-search" aria-hidden="true" style="padding-left: 5px"></i>
        //         </a>
        return html;
    }

    probandFormatter(value, row) {
        if (UtilsNew.isNotUndefinedOrNull(row)) {
            return row.proband.name;
        }
    }

    familyFormatter(value, row) {
        if (row.family?.members.length) {
            return value + ` (${row.family?.members.length})`;
        } else {
            return "-";
        }
    }

    interpretationFormatter(value, row) {
        return `<a class="btn force-text-left" data-action="interpreter" title="Go to Variant Interpreter" href="#interpreter/${this.opencgaSession.project.id}/${this.opencgaSession.study.id}/${row.id}">
                    ${row.interpretation?.primaryFindings?.length
                        ? `<span>${row.interpretation.primaryFindings.length} variants</span>`
                        : `<span>0 variants</span>`
                    }   
                    <i class="fas fa-lg fa-user-md" aria-hidden="true" style="padding: 0px 5px"></i> 
                </a>`;
    }

    disorderFormatter(value, row) {
        if (value && value.id) {
            let idHtml = value.id.startsWith("OMIM:")
                ? `<a href="https://omim.org/entry/${value.id.split(":")[1]}" target="_blank">${value.id}
                        <i class="fas fa-external-link-alt" aria-hidden="true" style="padding-left: 5px"></i>
                   </a>`
                : `${value.id}`;
            if (value.name) {
                return `${value.name} <span style="white-space: nowrap">(${idHtml})</span>`;
            } else {
                return `${idHtml}`;
            }
        } else {
            return "-";
        }
    }

    priorityFormatter(value) {
        if (UtilsNew.isEmpty(value)) {
            return "<span>-</span>";
        } else {
            const styles = ["color: white", "border-radius: 5px", "padding: 3px", "width: 65px", "display: block",
                "margin: auto"];
            switch (value) {
                case "URGENT":
                    styles.push("background: #ef6363", "border: 1px solid red");
                    return "<span style='color: #ef6363; font-weight: bold'>Urgent</span>";
                case "HIGH":
                    styles.push("background: #ffb42b", "border: 1px solid orange");
                    return "<span style='color: #ffb42b; font-weight: bold'>High</span>";
                case "MEDIUM":
                    styles.push("background: #237afb", "border: 1px solid blue");
                    return "<span style='color: #237afb; font-weight: bold'>Medium</span>";
                case "LOW":
                    styles.push("background: #1bb31b", "border: 1px solid green");
                    return "<span style='color: #1bb31b; font-weight: bold'>Low</span>";
                default:
                    return "<span>-</span>";
            }
        }
    }

    dateFormatter(value, row) {
        if (UtilsNew.isUndefinedOrNull(value)) {
            return "-";
        }
        return moment(value, "YYYYMMDDHHmmss").format("D MMM YYYY");
    }

    // reviewCaseFormatter(value, row) {
    //     // return `<button data-id=${row.id} style="cursor: pointer; color: #5a4444; border-radius: 5px; padding: 4px;
    //     //         background: #eae7d8; border: 1px solid #8a6d3b;" class='reviewCaseButton'>
    //     //         <i class="fa fa-search" aria-hidden="true"></i> Review Case</button>`;
    //     return `<a style="cursor: pointer" class="btn btn-link" href="#reviewCase">
    //                 <i class="fa fa-search" aria-hidden="true"></i> Review
    //             </a>`;
    // }

    // interpretationFormatter(value, row) {
    //     return `<div>
    //                 <a href="#interpreter/${this.opencgaSession.project.id}/${this.opencgaSession.study.id}/${row.id}">
    //                     <i class="fas fa-user-md" aria-hidden="true"></i> Go To Interpreter
    //                 </a>
    //             </div>
    //     `;
    // }

    // reportFormatter(value, row) {
    //     // return `<a style="cursor: pointer" href="#createReport" title="No report tool available yet" disabled>
    //     //             <i class="fa fa-id-card" aria-hidden="true"></i> Create
    //     //         </a>`;
    //
    //     return `<button type="button" class="btn btn-sm btn-link" title="No report tool available yet" disabled>
    //                         <i class="fa fa-id-card" aria-hidden="true"></i> Create
    //                     </button>`;
    // }

    // reviewCaseButtonClicked(e) {
    //     // The clinical anlysisi id is in: e.target.dataset.id
    // }

    onActionClick(e, _, row) {
        console.log(e, _, row);
        const {action} = e.target.dataset;
        if (action === "delete") {
            Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Yes, delete it!"
            }).then(result => {
                if (result.value) {
                    const clinicalAnalysisId = row.id;
                    this.opencgaSession.opencgaClient.clinical().delete(clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                        .then(restResponse => {
                            if (restResponse.getResultEvents("ERROR").length) {
                                Swal.fire({
                                    title: "Error",
                                    icon: "error",
                                    html: restResponse.getResultEvents("ERROR").map(event => event.message).join("<br>")
                                })
                            } else {
                                Swal.fire(
                                    "Deleted!",
                                    "Clinical Analysis has been deleted.",
                                    "success"
                                )
                                this.renderTable();
                            }
                        })
                        .catch(restResponse => {
                            Swal.fire(
                                "Server Error!",
                                "Clinical Analysis has not been correctly deleted.",
                                "error"
                            )
                        })
                }
            })
        }
        if (action === "download") {
            UtilsNew.downloadData([JSON.stringify(row, null, "\t")], row.id + ".json")
        }
    }

    _getDefaultColumns() {
        let _columns = [
            {
                title: "Analysis ID",
                field: "id",
                formatter: this.analysisIdFormatter,
                valign: "middle",
                visible: !this._config.columns.hidden.includes("id")
            },
            {
                title: "Proband ID",
                field: "proband.id",
                valign: "middle",
                visible: !this._config.columns.hidden.includes("probandId")
            },
            {
                title: "Sample IDs",
                field: "proband.samples",
                formatter: samples => samples?.map( sample => sample.id)?.join("<br>") ?? "-",
                display: {
                    labelWidth: 3,
                }
            },
            {
                title: "Family (#members)",
                field: "family.id",
                valign: "middle",
                formatter: this.familyFormatter,
                visible: !this._config.columns.hidden.includes("familyId")
            },
            {
                title: "Disorder",
                field: "disorder",
                valign: "middle",
                formatter: this.disorderFormatter,
                visible: !this._config.columns.hidden.includes("disorderId")
            },
            {
                title: "Type",
                field: "type",
                valign: "middle",
                visible: !this._config.columns.hidden.includes("type")
            },
            {
                title: "Interpretation",
                field: "interpretation",
                valign: "middle",
                formatter: this.interpretationFormatter.bind(this),
                visible: !this._config.columns.hidden.includes("interpretation")
            },
            {
                title: "Status",
                field: "status.name",
                valign: "middle",
                halign: this._config.header.horizontalAlign,
                visible: !this._config.columns.hidden.includes("status")
            },
            {
                title: "Priority",
                field: "priority",
                align: "center",
                valign: "middle",
                formatter: this.priorityFormatter,
                visible: !this._config.columns.hidden.includes("priority")
            },
            {
                title: "Assigned To",
                field: "analyst.assignee",
                align: "center",
                valign: "middle",
                visible: !this._config.columns.hidden.includes("assignedTo")
            },
            {
                title: "Creation Date",
                field: "creationDate",
                valign: "middle",
                formatter: this.dateFormatter,
                visible: !this._config.columns.hidden.includes("creationDate")
            },
            {
                title: "Due Date",
                field: "dueDate",
                valign: "middle",
                formatter: this.dateFormatter,
                visible: !this._config.columns.hidden.includes("dueDate")
            },
            // {
            //     title: 'Review',
            //     eligible: false,
            //     align: 'center',
            //     visible: this._config.showReviewCase,
            //     formatter: this.reviewCaseFormatter.bind(this)
            // },
            // {
            //     title: "Interpreter",
            //     eligible: false,
            //     align: "center",
            //     valign: "middle",
            //     formatter: this.interpretationFormatter.bind(this),
            //     visible: this._config.showInterpretation
            // },
            // {
            //     title: "Report",
            //     eligible: false,
            //     align: "center",
            //     valign: "middle",
            //     formatter: this.reportFormatter.bind(this),
            //     visible: this._config.showReport
            // }
        ];

        if (this._config.showSelectCheckbox) {
            _columns.push({
                field: "state",
                checkbox: true,
                class: "cursor-pointer",
                eligible: false
            });
        }

        if (this.opencgaSession && this._config.showActions) {
            _columns.push( {
                title: "Actions",
                // field: "id",
                // <button class='btn btn-small btn-primary ripple' data-action="edit"><i class="fas fa-edit"></i> Edit</button>
                formatter: (value, row) => `
                    <div class="dropdown">
                        <button class="btn btn-default btn-small ripple dropdown-toggle one-line" type="button" data-toggle="dropdown">Select action
                            <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-right">
                            <li>
                                <a class="btn force-text-left" data-action="interpreter" href="#interpreter/${this.opencgaSession.project.id}/${this.opencgaSession.study.id}/${row.id}">
                                    <i class="fas fa-user-md icon-padding" aria-hidden="true"></i> Variant Interpreter 
                                </a>
                            </li> 
                            <li>
                                <a href="javascript: void 0" class="btn disabled force-text-left" data-action="report">
                                    <i class="fas fa-id-card icon-padding" aria-hidden="true"></i> Create Report</a>
                                </li>
                            <li>
                                <a href="javascript: void 0" class="btn force-text-left" data-action="download">
                                    <i class="fas fa-download icon-padding" aria-hidden="true"></i> Download
                                </a>
                            </li>
                            <li role="separator" class="divider"></li>
                            <li>
                                <a href="javascript: void 0" class="btn disabled force-text-left" data-action="edit">
                                    <i class="fas fa-edit icon-padding" aria-hidden="true"></i> Edit
                                </a>
                            </li>
                            <li>
                                <a href="javascript: void 0" class="btn force-text-left" data-action="delete">
                                    <i class="fas fa-trash icon-padding" aria-hidden="true"></i> Delete
                                </a>
                            </li>
                        </ul>
                    </div>`,
                valign: "middle",
                events: {
                    "click a": this.onActionClick.bind(this)
                },
                visible: !this._config.columns?.hidden?.includes("actions")
            });
        }

        return _columns;
    }

    onDownload(e) {
        // let urlQueryParams = this._getUrlQueryParams();
        // let params = urlQueryParams.queryParams;
        const params = {
            ...this.query,
            exclude: "files",
            limit: 100,
            order: "asc",
            skip: 0,
            count: true,
            study: this.opencgaSession.study.fqn
        };
        this.opencgaSession.opencgaClient.clinical().search(params)
            .then(response => {
                console.log("response", response);
                const result = response.response[0].result;
                let dataString = [];
                let mimeType = "";
                let extension = "";

                // TODO evaluate webworker with Transferable Objects (it shares objects, not copy like classical WebWorker)
                if (result) {
                    console.log("result", result);
                    // Check if user clicked in Tab or JSON format
                    if (e.detail.option.toLowerCase() === "tab") {
                        dataString = [
                            ["Analysis ID", "Proband ID", "Family (#members)", "Disorder", "Type", "Interpretations", "Status", "Priority", "Assigned To", "Creation Date"].join("\t"),
                            ...result.map( _ => [
                                _.id,
                                _.proband.id,
                                _.family?.id && _.family?.members.length ? `${_.family.id} (${_.family.members.length})` : "",
                                _?.disorder?.id ?? "-",
                                _.type,
                                _.interpretations?.join(",") ?? "-",
                                _.status.name,
                                _.priority,
                                _.analyst.assignee,
                                _.creationDate
                            ].join("\t"))];
                        // console.log(dataString);
                        mimeType = "text/plain";
                        extension = ".txt";
                    } else {
                        for (const res of result) {
                            dataString.push(JSON.stringify(res, null, "\t"));
                        }
                        mimeType = "application/json";
                        extension = ".json";
                    }

                    // Build file and anchor link
                    const data = new Blob([dataString.join("\n")], {type: mimeType});
                    const file = window.URL.createObjectURL(data);
                    const a = document.createElement("a");
                    a.href = file;
                    a.download = this.opencgaSession.study.alias + extension;
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(function() {
                        document.body.removeChild(a);
                    }, 0);
                } else {
                    console.error("Error in result format");
                }
            })
            .then(function() {
                // this.downloadRefreshIcon.css("display", "none");
                // this.downloadIcon.css("display", "inline-block");
            });
    }

    onShare() {
        // TODO
    }

    // TODO check
    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 5,
            pageList: [10, 25, 50],
            showExport: false,
            showReviewCase: true,
            showInterpretation: true,
            showReport: true,
            detailView: false,
            detailFormatter: this.detailFormatter, // function with the detail formatter
            showSelectCheckbox: false,
            showActions: true,
            showToolbar: true,
            header: {
                horizontalAlign: "center",
                verticalAlign: "bottom"
            },
            columns: {
                hidden: []
            }
        };
    }

    render() {
        return html`
            <style>
                .detail-view :hover {
                    background-color: white;
                }
    
                .detail-view-row :hover {
                    background-color: #f5f5f5;
                }
    
                .cursor-pointer {
                    cursor: pointer;
                }
    
                .phenotypes-link-dropdown:hover .dropdown-menu {
                    display: block;
                }
    
                .variant-link-dropdown:hover .dropdown-menu {
                    display: block;
                }
    
                .qtip-cutom-class .qtip-content{
                    font-size: 12px;
                }
                
                .delete-button {
                    width: 77px;
                }
            </style>
    
            ${this._config.showToolbar 
        ? html`
                    <opencb-grid-toolbar .from="${this.from}"
                                        .to="${this.to}"
                                        .numTotalResultsText="${this.numTotalResultsText}"
                                        .config="${this.toolbarConfig}"
                                        @columnChange="${this.onColumnChange}"
                                        @download="${this.onDownload}"
                                        @sharelink="${this.onShare}">
                    </opencb-grid-toolbar>` 
        : null
}
    
            <div id="${this._prefix}GridTableDiv" class="force-overflow">
                <table id="${this._prefix}ClinicalAnalysisGrid"></table>
            </div>
        `;
    }

}

customElements.define("opencga-clinical-analysis-grid", OpencgaClinicalAnalysisGrid);
