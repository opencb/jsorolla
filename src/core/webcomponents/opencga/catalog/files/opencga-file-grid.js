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

export default class OpencgaFileGrid extends LitElement {

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
            files: {
                type: Array
            },
            filters: {
                type: Object
            },
            //TODO replace with query
            search: {
                type: Object
            },
            eventNotifyName: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "VarFileGrid" + Utils.randomString(6) + "_";

        this._config = this.getDefaultConfig();
        this.eventNotifyName = "messageevent";
    }
    updated(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("search")) {
            this.renderTable();
        }
        if (changedProperties.has("filters")) {
            this.onFilterUpdate();
        }
        if (changedProperties.has("config")) {
            this.configObserver();
        }

        if (changedProperties.has("filteredVariables")) {
            this.calculateFilters();
        }
    }

    // todo recheck! it was connectedCallback() and ready()
    firstUpdated(_changedProperties) {
        this._initTableColumns();
        this.dispatchEvent(new CustomEvent("clear", {detail: {}, bubbles: true, composed: true}));
        this.table = PolymerUtils.getElementById(this._prefix + "FileBrowserGrid");
        this.search = {};
    }

    configObserver() {
        this._config = Object.assign(this.getDefaultConfig(), this.config);
    }

    renderTable() {
        this.files = [];

        // We avoid listing directories in the grid
        let filters = Object.assign({}, this.search);
        if (Object.keys(filters).length === 0) {
            filters["type"] = "FILE";
        }

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

            // Check that HTTP protocol is present and complete the URL
            let opencgaHostUrl = this.opencgaSession.opencgaClient.getConfig().host;
            if (!opencgaHostUrl.startsWith("http://") && !opencgaHostUrl.startsWith("https://")) {
                opencgaHostUrl = "http://" + opencgaHostUrl;
            }
            opencgaHostUrl += "/webservices/rest/v1/files/search";

            let skipCount = false;

            const _table = $("#" + this._prefix + "FileBrowserGrid");

            const _this = this;
            $("#" + this._prefix + "FileBrowserGrid").bootstrapTable("destroy");
            $("#" + this._prefix + "FileBrowserGrid").bootstrapTable({
                //url: opencgaHostUrl,
                columns: _this._columns,
                method: "get",
                sidePagination: "server",
                uniqueId: "id",
                formatLoadingMessage: () =>"<div><loading-spinner></loading-spinner></div>",
                ajax: (params) => {
                    if (this.pageNumber > 1) {
                        skipCount = true;
                    }
                    let filters = {
                        study: this.opencgaSession.study.fqn,
                        //sid: Cookies.get(this.opencgaSession.opencgaClient.getConfig().cookieSessionId),
                        type: "FILE",
                        order: params.data.order,
                        limit: params.data.limit,
                        skip: params.data.offset || 0,
                        skipCount: skipCount,
                        include: "name,path,samples,status,format,bioformat,creationDate,modificationDate,uuid",
                        ...this.search
                    };
                    this.opencgaSession.opencgaClient.files().search(filters).then( res => params.success(res));
                },
                // Table properties
                pagination: _this._config.pagination,
                pageSize: _this._config.pageSize,
                pageList: _this._config.pageList,
                showExport: _this._config.showExport,
                detailView: _this._config.detailView,
                detailFormatter: _this._config.detailFormatter,

                //it is not used anymore
                /*queryParams: function(params) {
                    if (this.pageNumber > 1) {
                        skipCount = true;
                    }
                    const auxParams = {
                        study: _this.opencgaSession.study.fqn,
                        sid: Cookies.get(_this.opencgaSession.opencgaClient.getConfig().cookieSessionId),
                        order: params.order,
                        sort: params.sort,
                        limit: params.limit,
                        skip: params.offset,
                        skipCount: skipCount,
                        include: "name,path,samples,status,format,bioformat,creationDate,modificationDate,uuid"
                    };

                    if (UtilsNew.isUndefined(filters)) {
                        filters = {};
                    }
                    return Object.assign(filters, auxParams);
                },*/
                responseHandler: function(response) {
                    if (!skipCount) {
                        if (!_this.hasOwnProperty("numTotalResults")) {
                            _this.numTotalResults = 0;
                        }
                        if (_this.numTotalResults !== response.response[0].numTotalResults &&
                            response.queryOptions.skip === 0) {
                            _this.numTotalResults = response.response[0].numTotalResults;
                        }
                    }

                    _this.numTotalResultsText = _this.numTotalResults.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

                    if (response.queryOptions.skip === 0 && _this.numTotalResults < response.queryOptions.limit) {
                        _this.from = 1;
                        _this.to = _this.numTotalResults;
                    }

                    _this.requestUpdate(); // it is necessary to refresh numTotalResultsText in opencga-grid-toolbar

                    return {
                        total: _this.numTotalResults,
                        rows: response.response[0].result
                    };
                },
                onClickRow: function(row, element, field) {
                    if (_this._config.multiselection) {
                        $(element).toggleClass("success");
                        const index = element[0].getAttribute("data-index");
                        // Check and uncheck actions trigger events that are captured below
                        if ("selected" === element[0].className) {
                            $(PolymerUtils.getElementById(_this._prefix + "FileBrowserGrid")).bootstrapTable("uncheck", index);
                        } else {
                            $(PolymerUtils.getElementById(_this._prefix + "FileBrowserGrid")).bootstrapTable("check", index);
                        }
                    } else {
                        $(".success").removeClass("success");
                        $(element).addClass("success");
                    }

                    _this._onSelectFile(row);
                },
                onCheck: function(row, elem) {
                    // check file is not already selected
                    for (const i in _this._files) {
                        if (_this._files[i].id === row.id) {
                            return;
                        }
                    }

                    // we add files to selected files
                    // _this.push("_files", row);
                    // _this.set("files", _this._files.slice());
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
                    if (UtilsNew.isNotUndefinedOrNull(_table)) {
                        if (!_this._config.multiselection) {
                            PolymerUtils.querySelector(_table.selector).rows[1].setAttribute("class", "success");
                            _this._onSelectFile(data.rows[0]);
                        }

                        if (_this.files !== "undefined") {
                            for (const idx in _this.files) {
                                for (const j in data.rows) {
                                    if (_this.files[idx].id === data.rows[j].id) {
                                        $(PolymerUtils.getElementById(_this._prefix + "FileBrowserGrid")).bootstrapTable("check", j);
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
                //                         onPostBody: function() {
                //                             if(PolymerUtils.getElementsByClassName(_this._prefix + 'Download')) {
                //                                 PolymerUtils.querySelectorAll("." + _this._prefix + "Download").forEach(elem => elem.addEventListener("click", _this.downloadQCFile.bind(_this), true));
                //
                // //                                PolymerUtils.getElementById(_this._prefix + 'Download').addEventListener('click', _this.downloadQCFile.bind(_this));
                //                             }
                //                         }
            });

            this.opencgaSession.opencgaClient.studies().info(this.opencgaSession.study.id)
                .then(function(response) {
                    _this.variableSets = response.response[0].result[0].variableSets;
                })
                .catch(function() {
                    console.log("Could not obtain the variable sets of the study " + _this.opencgaSession.study.id);
                });
        } else {
            // Delete table
            $(PolymerUtils.getElementById(this._prefix + "FileBrowserGrid")).bootstrapTable("destroy");
            this.numTotalResults = 0;
        }
    }

    /**
     * If filters have been removed, clean the values from the forms.
     */
    onFilterUpdate() {
        this.updateForms(this.filters);
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

        this.search = filterParams;
    }


    stateFormatter(value, row, index) {
        if (typeof this.field.context.files != "undefined") {
            for (const idx in this.field.context.files) {
                if (this.field.context.files[idx].name == row.name) {
                    break;
                }
            }
        }
    }

    individualFormatter(value, row) {
        if (UtilsNew.isNotUndefined(row.attributes) && UtilsNew.isNotUndefined(row.attributes.individual) &&
            UtilsNew.isNotUndefined(row.attributes.individual.id)) {
            return row.attributes.individual.id;
        } else {
            return "-";
        }
    }

    dateFormatter(value, row) {
        return moment(value, "YYYYMMDDHHmmss").format("D MMM YYYY");
    }

    diagnosisFormatter(value, row) {
        if (UtilsNew.isNotUndefined(row.attributes) && UtilsNew.isNotUndefined(row.attributes.individual) &&
            UtilsNew.isNotEmptyArray(row.attributes.individual.phenotypes)) {
            const diagnosisPhenotypes = row.attributes.individual.phenotypes.filter(disease => {
                return disease.source === "ICD10";
            }).map(icd10disease => {
                return icd10disease.name;
            });
            if (UtilsNew.isNotEmptyArray(diagnosisPhenotypes)) {
                return diagnosisPhenotypes.join(",");
            }
        }
        return "-";
    }

    hpoFormatter(value, row) {
        if (UtilsNew.isNotUndefined(row.attributes) && UtilsNew.isNotUndefined(row.attributes.individual) &&
            UtilsNew.isNotEmptyArray(row.attributes.individual.phenotypes)) {
            const hpoPhenotypes = row.attributes.individual.phenotypes.filter(disease => {
                return disease.source === "HPO";
            }).map(hpoDisease => {
                return hpoDisease.name;
            });
            if (UtilsNew.isNotEmptyArray(hpoPhenotypes)) {
                return hpoPhenotypes.join(",");
            }
        }
        return "-";
    }

    fatherFormatter(value, row) {
        if (UtilsNew.isNotUndefined(row.attributes) && UtilsNew.isNotUndefined(row.attributes.individual) &&
            UtilsNew.isNotUndefined(row.attributes.individual.father) &&
            UtilsNew.isNotUndefined(row.attributes.individual.father.id)) {
            return row.attributes.individual.father.id;
        } else {
            return "-";
        }
    }

    motherFormatter(value, row) {
        if (UtilsNew.isNotUndefined(row.attributes) && UtilsNew.isNotUndefined(row.attributes.individual) &&
            UtilsNew.isNotUndefined(row.attributes.individual.mother) &&
            UtilsNew.isNotUndefined(row.attributes.individual.mother.id)) {
            return row.attributes.individual.mother.id;
        } else {
            return "-";
        }
    }

    cellTypeFormatter(value, row) {
        return (row.somatic) ? "Somatic" : "Germline";
    }

    _initTableColumns() {
        const columns = [];
        if (this._config.multiselection) {
            columns.push({
                field: {source: "state", context: this},
                checkbox: true,
                formatter: this.stateFormatter
            });
        }

        this._columns = [
            columns.concat([
                // name,path,samples,status,format,bioformat,creationDate,modificationDate,uuid"
                {
                    title: "Uuid",
                    field: "uuid",
                    visible: false
                },
                {
                    title: "Name",
                    field: "name"
                },
                {
                    title: "Path",
                    field: "path"
                },
                {
                    title: "Format",
                    field: "format"
                },
                {
                    title: "Bioformat",
                    field: "bioformat"
                },
                {
                    title: "Creation date",
                    field: "creationDate",
                    formatter: this.dateFormatter
                },
                {
                    title: "Modification date",
                    field: "modificationDate",
                    formatter: this.dateFormatter
                },
                {
                    title: "Status",
                    field: "status.name"
                }
            ])
        ];

        return this._columns;
    }

    _getUrlQueryParams() {
        // Check the opencgaClient exists
        if (UtilsNew.isUndefinedOrNull(this.opencgaSession.opencgaClient)) {
            return {host: "", queryParams: {}};
        }

        let host = this.opencgaSession.opencgaClient.getConfig().host;
        // By default we assume https protocol instead of http
        if (!host.startsWith("https://") && !host.startsWith("http://")) {
            host = "https://" + this.opencgaSession.opencgaClient.getConfig().host;
        }

        console.log("this.opencgaSession", this.opencgaSession);
        if (typeof this.opencgaSession.project !== "undefined" && typeof this.opencgaSession.study.alias !== "undefined") {
            if (typeof this.query === "undefined") {
                this.query = {};
            }
            if (UtilsNew.isEmpty(this.query.studies) || this.query.studies.split(new RegExp("[,;]")).length === 1) {
                this.query.study = this.opencgaSession.study.fqn;
            }
            host += "/webservices/rest/v1/files/search";
        } else {
            return {host: host, queryParams: {}};
        }

        // Init queryParams with default and config values plus query object
        const queryParams = Object.assign(
            {
                sid: this.opencgaSession.opencgaClient._config.sessionId,
                include: "id,name,format",
                skipCount: false
            }, this.query);

        console.log("QUERYPARAM", queryParams);
        return {host: host, queryParams: queryParams};
    }

    onDownload(e) {
        // let urlQueryParams = this._getUrlQueryParams();
        // let params = urlQueryParams.queryParams;
        console.log(this.opencgaSession);
        const params = {
            ...this.query,
            limit: 1000,
            sid: this.opencgaSession.opencgaClient._config.sessionId,
            skip: 0,
            skipCount: true,
            study: this.opencgaSession.study.fqn,
            include: "name,path,format,bioformat,creationDate,modificationDate,status",
            type: "FILE"
        };
        this.opencgaSession.opencgaClient.files().search(params)
            .then(response => {
                const result = response.response[0].result;
                let dataString = [];
                let mimeType = "";
                let extension = "";
                if (result) {
                    // Check if user clicked in Tab or JSON format
                    if (e.detail.option.toLowerCase() === "tab") {
                        dataString = [
                            ["Name", "Path", "Format", "Bioformat", "Creation date", "Modification date", "Status"].join("\t"),
                            ...result.map( _ => [
                                _.id,
                                _.path,
                                _.format,
                                _.bioformat,
                                _.creationDate,
                                _.modificationDate,
                                _.status.name
                            ].join("\t"))];
                        //console.log(dataString);
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
                //this.downloadRefreshIcon.css("display", "none");
                //this.downloadIcon.css("display", "inline-block");
            });
    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 10,
            pageList: [10, 25, 50],
            showExport: false,
            detailView: false,
            detailFormatter: undefined, // function with the detail formatter
            multiselection: false
        };
    }


    render() {
        return html`
        <style include="jso-styles"></style>

        <opencb-grid-toolbar .from="${this.from}"
                            .to="${this.to}"
                            .numTotalResultsText="${this.numTotalResultsText}"
                            @download="${this.onDownload}">
        </opencb-grid-toolbar>

        <div id="${this._prefix}GridTableDiv">
            <table id="${this._prefix}FileBrowserGrid">
            </table>
        </div>
        `;
    }

}

customElements.define("opencga-file-grid", OpencgaFileGrid);
