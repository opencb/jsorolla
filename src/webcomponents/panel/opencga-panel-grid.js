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

import {LitElement, html} from "lit";
import UtilsNew from "../../core/utils-new.js";
import PolymerUtils from "../PolymerUtils.js";
import "./opencga-panel-summary.js";

// TODO bootstraptable urgent refactor
export default class OpencgaPanelGrid extends LitElement {

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
            opencgaClient: {
                type: Object
            },
            cellbaseClient: {
                type: Object
            },
            query: {
                type: Object,
                observer: "queryObserver"
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "oip" + UtilsNew.randomString(6) + "_";
        this.defaultConfig = this.getDefaultConfig();

        window.icons = {
            refresh: "fa-refresh",
            columns: "fa-th",
            paginationSwitchDown: "fa-caret-square-o-down",
            paginationSwitchUp: "fa-caret-square-o-up",
            detailOpen: "fa-plus",
            detailClose: "fa-minus"
        };
    }

    updated(changedProperties) {
        if (changedProperties.has("property")) {
            this.propertyObserver();
        }
    }


    connectedCallback() {
        super.connectedCallback();
        this.renderPanelTable();
        this.renderInstallationPanelTable();
        this._rendered = true;
    }


    renderPanelTable() {
        const _config = Object.assign(this.defaultConfig, this.config.grid);
        // Check that HTTP protocol is present and complete the URL
        this.from = 1;
        this.to = Math.max(UtilsNew.isNotUndefinedOrNull(this.query.limit) ? this.query.limit : 0, _config.pageSize);

        const urlQueryParams = this._getUrlQueryParams();
        const queryParams = urlQueryParams.queryParams;
        const _numTotal = -1;

        const _this = this;
        const _table = $("#" + this._prefix + "PanelsGrid");
        $(_table).bootstrapTable("destroy");
        $(_table).bootstrapTable({
            theadClasses: "table-light",
            buttonsClass: "light",
            url: urlQueryParams.host,
            columns: _this._createPanels(),
            method: "get",
            sidePagination: "server",

            // Set table properties, these are read from config property
            pagination: _config.pagination,
            pageSize: _config.pageSize,
            pageList: _config.pageList,
            queryParams: function(params) {
                if ((queryParams.limit === undefined || params.limit !== queryParams.limit) && UtilsNew.isNotUndefinedOrNull(params.limit)) {
                    queryParams.limit = params.limit;
                }
                queryParams.skip = params.offset;
                return queryParams;
            },
            responseHandler: function(response) {
                if (!_this.hasOwnProperty("numTotalResults")) {
                    _this.numTotalResults = 0;
                }
                if (_this.numTotalResults !== response.response[0].numTotalResults &&
                    response.queryOptions.skip === 0) {
                    _this.numTotalResults = response.response[0].numTotalResults;
                }

                _this.numTotalResultsText = _this.numTotalResults.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

                if (response.queryOptions.skip === 0 && _this.numTotalResults < response.queryOptions.limit) {
                    _this.from = 1;
                    _this.to = _this.numTotalResults;
                }

                return {
                    total: _this.numTotalResults,
                    rows: response.response[0].result
                };
            },
            onClickRow: function(row, element, field) {
                $(".success").removeClass("success");
                $(element).addClass("success");
                _this.selectPanel(row);
            },
            onLoadSuccess: function(data) {
                PolymerUtils.querySelector(_table.selector).rows[1].setAttribute("class", "success");
                //                        _this.selectPanel(data[0]);

            },
            onPageChange: function(page, size) {
                _this.from = (page - 1) * size + 1;
                _this.to = page * size;
            },
            onPostBody: function(data) {
                PolymerUtils.querySelector(_table.selector).rows[1].setAttribute("class", "success");
                // _this.panelSelected = data[0];
                _this.selectPanel(data[0]);
            }
        });
    }


    renderInstallationPanelTable() {
        const _config = Object.assign(this.defaultConfig, this.config.grid);
        // Check that HTTP protocol is present and complete the URL
        this.from = 1;
        this.to = Math.max(UtilsNew.isNotUndefinedOrNull(this.query.limit) ? this.query.limit : 0, _config.pageSize);

        const urlQueryParams = this._getUrlQueryParams();
        const queryParams = urlQueryParams.queryParams;
        const _numTotal = -1;

        const _this = this;
        const _table = $("#" + this._prefix + "InstallationPanelsGrid");
        $(_table).bootstrapTable("destroy");
        $(_table).bootstrapTable({
            theadClasses: "table-light",
            buttonsClass: "light",
            url: urlQueryParams.host,
            columns: _this._createPanels(),
            method: "get",
            sidePagination: "server",

            // Set table properties, these are read from config property
            pagination: _config.pagination,
            pageSize: _config.pageSize,
            pageList: _config.pageList,

            queryParams: function(params) {
                if ((queryParams.limit === undefined || params.limit !== queryParams.limit) && UtilsNew.isNotUndefinedOrNull(params.limit)) {
                    queryParams.limit = params.limit;
                }

                queryParams.skip = params.offset;
                queryParams.global = true;
                return queryParams;
            },
            responseHandler: function(response) {
                if (!_this.hasOwnProperty("numTotalResults")) {
                    _this.numTotalResults = 0;
                }
                if (_this.numTotalResults !== response.response[0].numTotalResults &&
                    response.queryOptions.skip === 0) {
                    _this.numTotalResults = response.response[0].numTotalResults;
                }

                _this.numTotalResultsText = _this.numTotalResults.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

                if (response.queryOptions.skip === 0 && _this.numTotalResults < response.queryOptions.limit) {
                    _this.from = 1;
                    _this.to = _this.numTotalResults;
                }

                return {
                    total: _this.numTotalResults,
                    rows: response.response[0].result
                };
            },
            onClickRow: function(row, element, field) {
                $(".success").removeClass("success");
                $(element).addClass("success");
                _this.selectInstallationPanel(row);
            },
            onLoadSuccess: function(data) {
                PolymerUtils.querySelector(_table.selector).rows[1].setAttribute("class", "success");
                //                        _this.selectPanel(data[0]);

            },
            onPageChange: function(page, size) {
                _this.from = (page - 1) * size + 1;
                _this.to = page * size;
            },
            onPostBody: function(data) {
                PolymerUtils.querySelector(_table.selector).rows[1].setAttribute("class", "success");
                // _this.panelSelected = data[0];
                _this.selectInstallationPanel(data[0]);
            }
        });
    }

    _getUrlQueryParams() {
        // Check the opencgaClient exists
        if (UtilsNew.isUndefinedOrNull(this.opencgaClient)) {
            return {host: "", queryParams: {}};
        }

        let host = this.opencgaClient.getConfig().host;
        // By default we assume https protocol instead of http
        if (!host.startsWith("https://") && !host.startsWith("http://")) {
            host = "https://" + this.opencgaClient.getConfig().host;
        }

        if (typeof this.opencgaSession.project !== "undefined" && typeof this.opencgaSession.study.alias !== "undefined") {
            if (typeof this.query === "undefined") {
                this.query = {};
            }
            if (UtilsNew.isEmpty(this.query.studies) || this.query.studies.split(new RegExp("[,;]")).length === 1) {
                this.query.study = this.opencgaSession.study.fqn;
            }
            host += "/webservices/rest/v1/panels/search";
        } else {
            return {host: host, queryParams: {}};
        }

        // Init queryParams with default and config values plus query object
        const queryParams = Object.assign(
            {
                sid: this.opencgaClient._config.sessionId,
                include: "id,name,author,version,description,genes,variants,phenotypes,source,creationDate",
                skipCount: false
            }, this.query);

        return {host: host, queryParams: queryParams};
    }


    queryObserver() {
        if (this._rendered) {
            this.renderPanelTable();
            this.renderInstallationPanelTable();

        }
    }
    // onSearch(e) {
    //     let query = {};
    //     if (UtilsNew.isNotEmpty(this.namePanel)) {
    //         query.name = this.namePanel;
    //     }
    //     if (UtilsNew.isNotEmpty(this.authorPanel)) {
    //         query.author = this.authorPanel;
    //     }
    //     if (UtilsNew.isNotEmpty(this.versionPanel)) {
    //         query.version = this.versionPanel;
    //     }
    //
    //     this.query = Object.assign({}, query);
    //     this.renderPanelTable();
    //     this.renderInstallationPanelTable();
    // }

    selectPanel(panel) {
        this.panelSelected = panel;
        this.dispatchEvent(new CustomEvent("panelselected", {
            detail: this.panelSelected,
            bubbles: true,
            composed: true
        }));
    }

    selectInstallationPanel(panel) {
        this.installationPanelSelected = panel;
    }

    importInstallationPanel() {
        if (UtilsNew.isNotUndefinedOrNull(this.installationPanelSelected)) {
            this.dispatchEvent(new CustomEvent("importpanel", {
                detail: this.installationPanelSelected,
                bubbles: true,
                composed: true
            }));
        }

    }

    phenotypesFormatter(value, row, index) {
        return UtilsNew.isNotEmptyArray(row.phenotypes) ? row.phenotypes.length : 0;
    }

    genesFormatter(value, row, index) {
        return UtilsNew.isNotEmptyArray(row.genes) ? row.genes.length : 0;
    }

    mutationsFormatter(value, row, index) {
        return UtilsNew.isNotEmptyArray(row.variants) ? row.variants.length : 0;
    }

    _createPanels() {
        return [
            [
                {
                    title: "ID",
                    field: "id",
                    // sortable: true,
                    colspan: 1,
                    rowspan: 1,
                    halign: "center",
                    searchable: true
                },
                {
                    title: "Name",
                    field: "name",
                    // sortable: true,
                    colspan: 1,
                    rowspan: 1,
                    halign: "center",
                    searchable: true
                },
                {
                    title: "Number of Phenotypes",
                    // sortable: true,
                    colspan: 1,
                    rowspan: 1,
                    halign: "center",
                    formatter: this.phenotypesFormatter
                },
                {
                    title: "Number of Genes",
                    // sortable: true,
                    colspan: 1,
                    rowspan: 1,
                    halign: "center",
                    formatter: this.genesFormatter
                },
                {
                    title: "Number of Mutations",
                    // sortable: true,
                    colspan: 1,
                    rowspan: 1,
                    halign: "center",
                    formatter: this.mutationsFormatter
                }
            ]
        ];
    }


    _createDefaultColumns() {
        return [
            [
                {
                    title: "Panel",
                    field: "name",
                    // sortable: true,
                    colspan: 1,
                    rowspan: 1,
                    halign: "center",
                    searchable: true
                }
            ]
        ];
    }

    getDefaultConfig() {
        return {pagination: true, pageSize: 5, pageList: [5]};
    }

    render() {
        return html`
        <div id="${this._prefix}PanelsDiv">
            <h2>Panels</h2>
            <table id="${this._prefix}PanelsGrid" data-pagination="true" data-page-list="[5, 10, 25, 50]" data-show-refresh="true">
            </table>
        </div>
        <opencga-panel-summary .opencgaSession="${this.opencgaSession}"
                                .opencgaClient="${this.opencgaClient}"
                                .panelSelected="${this.panelSelected}">
        </opencga-panel-summary>
        <div id="${this._prefix}InstallationPanelsDiv">
            <h2>Installation Panels</h2>
            <button id="${this._prefix}ImportInstallationPanel" type="button" @click="${this.importInstallationPanel}" class="btn btn-danger variant-prioritization-view-buttons" style="margin: 1% 1%; float: right;">
                <i class="fa fa-copy icon-padding" aria-hidden="true" ></i> Import
            </button>
            <table id="${this._prefix}InstallationPanelsGrid" data-pagination="true" data-page-list="[5]">
            </table>
        </div>
        <opencga-panel-summary .opencgaSession="${this.opencgaSession}"
                                .opencgaClient="${this.opencgaClient}"
                                .panelSelected="${this.installationPanelSelected}">
        </opencga-panel-summary>
        `;
    }

}

customElements.define("opencga-panel-grid", OpencgaPanelGrid);
