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
import Utils from "./../../../../utils.js";
import UtilsNew from "./../../../../utilsNew.js";
import PolymerUtils from "../../../PolymerUtils.js";
import "../../../commons/opencb-grid-toolbar.js";
import "../../../../loading-spinner.js";


// todo check functionality and notify usage

export default class OpencgaJobsGrid extends LitElement {

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
            //TODO check what's the point
            files: {
                type: Array
            },
            filters: {
                type: Object
            },
            query: {
                type: Object
            },
            // TODO uhm..
            eventNotifyName: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "jbgrid" + Utils.randomString(6) + "_";
        this.eventNotifyName = "messageevent";
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};

    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("query")) {
            this.renderTable();
        }
        if (changedProperties.has("filters")) {
            this.onFilterUpdate();
        }
        if (changedProperties.has("config")) {
            this.configObserver();
        }

        if (changedProperties.has("filteredVariables")) {
            this.calculateFilters(); // TODO whats this?
        }
    }

    firstUpdated(_changedProperties) {
        this.table = this.querySelector("#" + this._prefix + "jobs-browser-grid");
        this._initTableColumns();
        this.dispatchEvent(new CustomEvent("clear", {detail: {}, bubbles: true, composed: true}));
        this.query = {};
    }

    configObserver() {
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    renderTable() {
        this.files = [];
        this.from = 1;
        this.to = 10;

        if (UtilsNew.isNotUndefined(this.opencgaSession.opencgaClient) &&
            UtilsNew.isNotUndefined(this.opencgaSession.study) &&
            UtilsNew.isNotUndefined(this.opencgaSession.study.fqn)) {
            // Make a copy of the files (if they exist), we will use this private copy until it is assigned to this.files
            if (UtilsNew.isNotUndefined(this.files)) {
                this._files = this.files;
            } else {
                this._files = [];
            }

            let count = true;

            const _this = this;
            $(this.table).bootstrapTable("destroy");
            $(this.table).bootstrapTable({
                // url: opencgaHostUrl,
                columns: _this._columns,
                method: "get",
                sidePagination: "server",
                uniqueId: "id",
                formatLoadingMessage: () =>"<div><loading-spinner></loading-spinner></div>",
                ajax: params => {
                    if (this.pageNumber > 1) {
                        count = false;
                    }
                    const filters = {
                        study: this.opencgaSession.study.fqn,
                        deleted: false,
                        count: count,
                        order: params.data.order,
                        limit: params.data.limit,
                        skip: params.data.offset || 0,
                        //include: "name,path,samples,status,format,bioformat,creationDate,modificationDate,uuid", TODO include only the column I show
                        exclude: "execution",
                        ...this.query
                    };
                    this.opencgaSession.opencgaClient.jobs().search(filters).then( res => params.success(res));
                },
                // Table properties
                pagination: this._config.pagination,
                pageSize: this._config.pageSize,
                pageList: this._config.pageList,
                showExport: this._config.showExport,
                detailView: this._config.detailView,
                detailFormatter: this._config.detailFormatter,
                //TODO recheck and refactor to ALL handlers!
                responseHandler: function(response) {
                    console.log("response", response);
                    let _numMatches = _this._numMatches || 0;
                    if (response.getResponse().numMatches >= 0) {
                        _numMatches = response.getResponse().numMatches;
                        _this._numMatches = _numMatches;
                    }
                    // If no variant is returned then we start in 0
                    if (response.getResponse(0).numMatches === 0) {
                        _this.from = _numMatches;
                    }
                    if (response.getResponse(0).numResults < this.pageSize) {
                        _this.to = _numMatches;
                    }
                    _this.numTotalResultsText = _numMatches.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

                    if (response.getParams().skip === 0 && _numMatches < response.getParams().limit) {
                        _this.from = 1;
                        _this.to = _numMatches;
                    }
                    _this.approximateCountResult = response.getResponse().attributes.approximateCount;
                    _this.requestUpdate(); // it is necessary to refresh numTotalResultsText in opencga-grid-toolbar

                    return {
                        total: _numMatches,
                        rows: response.getResults()
                    };
                },
                onClickRow: (row, element, field) => {
                    if (this._config.multiselection) {
                        $(element).toggleClass("success");
                        const index = element[0].getAttribute("data-index");
                        // Check and uncheck actions trigger events that are captured below
                        if ("selected" === element[0].className) {
                            this.table.bootstrapTable("uncheck", index);
                        } else {
                            this.table.bootstrapTable("check", index);
                        }
                    } else {
                        $(".success").removeClass("success");
                        $(element).addClass("success");
                    }

                    this.dispatchEvent(new CustomEvent("clickRow", {detail: {resource: "job", data: row}}));
                    //_this._onSelectFile(row);
                },
                onCheck: function(row, elem) {
                    // check file is not already selected
                    for (const i in _this._files) {
                        if (_this._files[i].id === row.id) {
                            return;
                        }
                    }

                    // we add files to selected files
                    _this._files.push(row);
                    _this.files = _this._files.slice();

                },
                onUncheck: function(row, elem) {
                    let fileToDeleteIdx = -1;
                    for (const i in _this.files) {
                        if (_this.files[i].id === row.id) {
                            fileToDeleteIdx = i;
                            break;
                        }
                    }

                    if (fileToDeleteIdx === -1) {
                        return;
                    }

                    // _this.splice("_files", fileToDeleteIdx, 1);
                    // _this.set("files", _this._files.slice());
                    _this._files.splice(fileToDeleteIdx, 1);
                    _this.files = _this._files.slice();
                },
                onCheckAll: function(rows) {
                    const newFiles = _this._files.slice();
                    // check file is not already selected
                    rows.forEach(file => {
                        const existsNewSelected = _this._files.some(fileSelected => {
                            return fileSelected.id === file.id;
                        });

                        if (!existsNewSelected) {
                            newFiles.push(file);
                        }
                    });

                    // we add files to selected files
                    _this._files = newFiles;
                    _this.files = newFiles.slice();

                },
                onUncheckAll: function(rows) {
                    // check file is not already selected
                    rows.forEach(file => {
                        _this._files = _this._files.filter(fileSelected => {
                            return fileSelected.id !== file.id;
                        });

                    });

                    // we add files to selected files
                    //                            _this.push("_files", row);
                    _this.files = _this._files.slice();

                },
                onLoadSuccess: function(data) {
                    // Check all already selected rows. Selected files are stored in this.files array
                    if (UtilsNew.isNotUndefinedOrNull(this.table)) {
                        if (!_this._config.multiselection) {
                            PolymerUtils.querySelector(this.table.selector).rows[1].setAttribute("class", "success");
                            _this._onSelectFile(data.rows[0]);
                        }

                        if (_this.files !== "undefined") {
                            for (const idx in _this.files) {
                                for (const j in data.rows) {
                                    if (_this.files[idx].id === data.rows[j].id) {
                                        this.table.bootstrapTable("check", j);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                },
                onPageChange: function(page, size) {
                    _this.from = (page - 1) * size + 1;
                    _this.to = page * size;
                }
            });


            /*  TODO recheck if needed
            this.opencgaSession.opencgaClient.studies().info(this.opencgaSession.study.id)
                .then(function(response) {
                    _this.variableSets = response.response[0].result[0].variableSets;
                })
                .catch(function() {
                    console.log("Could not obtain the variable sets of the study " + _this.opencgaSession.study.id);
                });
            */

        } else {
            // Delete table
            this.table.bootstrapTable("destroy");
            this.numTotalResults = 0;
        }
    }


    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 10,
            pageList: [10, 25, 50],
            showExport: false,
            detailView: true,
            detailFormatter: this.detailFormatter,

            showSelectCheckbox: false,
            multiSelection: false,
            nucleotideGenotype: true,
            alleleStringLengthMax: 15,

            header: {
                horizontalAlign: "center",
                verticalAlign: "bottom"
            }
        };
    }

    /**
     * If filters have been removed, clean the values from the forms.
     */
    onFilterUpdate() {
        // this.updateForms(this.filters); //TODO recheck, this shouldn't be necessary anymore (and it seems not)
    }

    _onSelectFile(row) {
        if (typeof row !== "undefined") {
            this.dispatchEvent(new CustomEvent("selectfile", {detail: {id: row.id, file: row}}));
        }
    }

    updateForms(filters) {
        // This is just to avoid entering here when it has just been initialized
        if (UtilsNew.isUndefined(this._prefix)) {
            return;
        }

        const fileName = PolymerUtils.getValue(this._prefix + "NameTextarea");
        if (!filters.hasOwnProperty("name") && UtilsNew.isNotUndefined(fileName) && fileName.length > 0) {
            PolymerUtils.getElementById(this._prefix + "NameTextarea").value = "";
        }

        const individual = PolymerUtils.getValue(this._prefix + "IndividualTextarea");
        if (!filters.hasOwnProperty("individual.id") && UtilsNew.isNotUndefined(individual) && individual.length > 0) {

            PolymerUtils.setValue(this._prefix + "IndividualTextarea", "");
        }

        if (this.filteredVariables.variables.length > 0) {
            if (!filters.hasOwnProperty("annotation")) {
                // Remove the filter variableSetId as it won't make more sense.
                this.filteredVariables.variables = [];

            } else if (filters.annotation.length < this.filteredVariables.variables.length) {
                const tmpVariables = [];
                filters.annotation.forEach(function(variable) {
                    tmpVariables.push(variable);
                });

                this.filteredVariables.variables = tmpVariables;
            }
        }
    }

    /**
     * Read from the values in the forms, and sets the filters.
     */
    calculateFilters() {
        const filters = {};
        let fileName = "";
        let individual = "";

        if (PolymerUtils.getElementById(this._prefix + "NameTextarea") !== null) {
            fileName = PolymerUtils.getElementById(this._prefix + "NameTextarea").value;
        }
        if (PolymerUtils.getElementById(this._prefix + "IndividualTextarea") !== null) {
            individual = PolymerUtils.getElementById(this._prefix + "IndividualTextarea").value;
        }

        if (UtilsNew.isNotUndefined(fileName) && fileName.length > 0) {
            filters["name"] = "~" + fileName;
        }

        if (UtilsNew.isNotUndefined(individual) && individual.length > 0) {
            filters["individual.id"] = "~" + individual;
        }

        if (UtilsNew.isNotUndefined(this.filteredVariables.variables) && this.filteredVariables.variables.length > 0) {
            //                    filters["variableSetId"] = this.filteredVariables.variableSet;
            const annotations = [];
            this.filteredVariables.variables.forEach(function(variable) {
                annotations.push(variable);
            });
            filters["annotation"] = annotations;
        }
        this.filters = filters;
    }

    // TODO adapct to jobs
    onSearch() {
        // Convert the filters to an objectParam that can be directly send to the file search
        const filterParams = {};

        const keys = Object.keys(this.filters);
        for (let i = 0; i < keys.length; i++) {
            // Some filters can come as an array of things.
            // annotation = [{name: name, value: Smith}, {name: age, value: >5}]
            if (Array.isArray(this.filters[keys[i]])) {
                const myArray = this.filters[keys[i]];

                let myArrayFilter = [];

                // The elements in the array can be either an object
                if (Object.getPrototypeOf(myArray[0]) === Object.prototype) {
                    const myArray = this.filters[keys[i]];
                    for (let j = 0; j < myArray.length; j++) {
                        // TODO: We have to check if the value already has an operand
                        myArrayFilter.push(myArray[j].name + "=" + myArray[j].value);
                    }
                } else {
                    // Or an array of strings or numbers
                    myArrayFilter = this.filters[keys[i]];
                }

                filterParams[keys[i]] = myArrayFilter.join(";");
            } else {
                filterParams[keys[i]] = this.filters[keys[i]];
            }
        }

        if (this.filters.hasOwnProperty("annotation")) {
            // Add the variable set whose annotations will be queried
            filterParams["variableSetId"] = this.filteredVariables.variableSet;
        }
        this.query = filterParams;
    }

    _initTableColumns() {
        const columns = [];
        /* if (this._config.multiselection) {
            columns.push({
                field: {source: "state", context: this},
                checkbox: true,
                formatter: this.stateFormatter
            });
        }*/

        this._columns = [
            // name,path,samples,status,format,bioformat,creationDate,modificationDate,uuid"
            {
                title: "ID",
                field: "id"
                // visible: false
            },
            {
                title: "Tool",
                field: "tool.id"
            },
            {
                title: "Priority",
                field: "priority"
            },
            {
                title: "Tags",
                field: "tags",
                formatter: v => v && v.length ? v.map( tag => `<span class="badge badge-secondary">${v}</span>`).join(" ") : "-"
            },
            {
                title: "Date",
                field: "creationDate",
                formatter: date => moment(date, "YYYYMMDDHHmmss").format("D MMM YYYY, h:mm:ss a")
            },
            {
                title: "Visited",
                field: "visited"
            },
            {
                title: "Depends on",
                field: "dependsOn",
                formatter: v => v.length ? v.map( dep => `<p>${dep.id} (${this.statusFormatter(dep.internal.status.name)})</p>`).join("") : "-"
            },
            {
                title: "Out directory",
                field: "outdir"
            },
            {
                title: "Status",
                field: "internal.status.name",
                formatter: this.statusFormatter
            },
        ];

        return this._columns;
    }

    detailFormatter() {
        return "details";
    }

    statusFormatter(status) {
        return {
            "PENDING": `<span class="text-primary"><i class="far fa-clock"></i> ${status}</span>`,
            "QUEUED": `<span class="text-primary"><span class=""> <i class="far fa-clock"></i> ${status}</span>`,
            "RUNNING": `<span class="text-primary"><i class="fas fa-sync-alt anim-rotate"></i> ${status}</span>`,
            "DONE": `<span class="text-success"><i class="fas fa-check-circle"></i> ${status}</span>`,
            "ERROR": `<span class="text-danger"><i class="fas fa-exclamation-circle"></i> ${status}</span>`,
            "UNKNOWN": `<span class="text-warning"><i class="fas fa-question-circle"></i> ${status}</span>`,
            "REGISTERING": `<span class="text-info"><i class="far fa-clock"></i> ${status}</span>`,
            "UNREGISTERED": `<span class="text-muted"><i class="far fa-clock"></i> ${status}</span>`,
            "ABORTED": `<span class="text-warning"><i class="fas fa-ban"></i> ${status}</span>`,
            "DELETED": `<span class="text-primary"><i class="fas fa-trash-alt"></i> ${status}</span>`
        }[status];
    }

    onDownload(e) {
        // let params = urlQueryParams.queryParams;
        const filters = {
            limit: 1000,
            //sid: this.opencgaSession.opencgaClient._config.sessionId,
            skip: 0,
            count: false,
            study: this.opencgaSession.study.fqn,
            ...this.query
        };
        this.opencgaSession.opencgaClient.jobs().search(filters)
            .then(response => {
                const result = response.getResults();
                let dataString = [];
                let mimeType = "";
                let extension = "";
                if (result) {
                    // Check if user clicked in Tab or JSON format
                    if (e.detail.option.toLowerCase() === "tab") {
                        dataString = [
                            ["Id", "Tool", "Priority", "Tags", "Creation date", "Status", "Visited"].join("\t"),
                            ...result.map( _ => [
                                _.id,
                                _.tool.id,
                                _.priority,
                                _.tags,
                                _.creationDate,
                                _["internal.status.name"],
                                _.visited
                            ].join("\t"))];
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
                    a.download = this.opencgaSession.study.alias + "[" + new Date().toISOString() + "]" + extension;
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

    render() {
        return html`
        <style include="jso-styles"></style>

        <opencb-grid-toolbar .from="${this.from}"
                            .to="${this.to}"
                            .numTotalResultsText="${this.numTotalResultsText}"
                            @download="${this.onDownload}">
        </opencb-grid-toolbar>

        <div>
            <table id="${this._prefix}jobs-browser-grid">
            </table>
        </div>
        `;
    }

}

customElements.define("opencga-jobs-grid", OpencgaJobsGrid);
