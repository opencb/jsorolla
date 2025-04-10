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


export default class OpencgaPanelSummary extends LitElement {

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
            panelSelected: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "PanelSummary" + UtilsNew.randomString(6) + "_";
    }

    updated(changedProperties) {
        if (changedProperties.has("panelSelected")) {
            this.panelSelectedObserver();
        }
    }

    connectedCallback() {
        super.connectedCallback();
        this.renderPanelTableDiseases();
        this.renderPanelTableGenes();
        this.renderPanelTableMutations();
    }
    panelSelectedObserver(e) {
        if (UtilsNew.isNotUndefinedOrNull(this.panelSelected)) {
            this.diseasesSelected = UtilsNew.isNotUndefined(this.panelSelected) ? this.panelSelected.phenotypes : [];
            this.genesSelected = this.panelSelected.genes;
            this.mutationsSelected = this.panelSelected.variants;
            this.renderPanelTableDiseases();
            this.renderPanelTableGenes();
            this.renderPanelTableMutations();
        }
    }
    dateFormatter(value) {
        return UtilsNew.isNotUndefinedOrNull(value) ? moment(value, "YYYYMMDDHHmmss").format("D MMM YYYY") : "-";
    }

    renderPanelTableDiseases() {
        // Check that HTTP protocol is present and complete the URL
        let opencgaHostUrl = this.opencgaClient.getConfig().host;
        if (!opencgaHostUrl.startsWith("http://") && !opencgaHostUrl.startsWith("https://")) {
            opencgaHostUrl = "http://" + opencgaHostUrl;
        }
        opencgaHostUrl += "/webservices/rest/v1/samples/search";

        const _this = this;
        $("#" + this._prefix + "PanelDiseasesGrid").bootstrapTable("destroy");
        $("#" + this._prefix + "PanelDiseasesGrid").bootstrapTable({
            theadClasses: "table-light",
            buttonsClass: "light",
            data: _this.diseasesSelected,
            columns: _this._createPhenotypes(),
            // method: 'get',
            // sidePagination: 'server',
            filterControl: true,
            queryParams: function(params) {
                const auxParams = {
                    studyId: _this.opencgaSession.study.id,
                    //                                lazy: "false",
                    sid: Cookies.get(_this.opencgaClient.getConfig().cookieSessionId),
                    order: params.order,
                    sort: params.sort,
                    limit: params.limit,
                    skip: params.offset,
                    includeIndividual: true,
                    name: params.search
                };

                return Object.assign({}, auxParams);
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
            onPageChange: function(page, size) {
                _this.from = (page - 1) * size + 1;
                _this.to = page * size;
            }
        });
    }

    renderPanelTableGenes() {
        // Check that HTTP protocol is present and complete the URL
        let opencgaHostUrl = this.opencgaClient.getConfig().host;
        if (!opencgaHostUrl.startsWith("http://") && !opencgaHostUrl.startsWith("https://")) {
            opencgaHostUrl = "http://" + opencgaHostUrl;
        }
        opencgaHostUrl += "/webservices/rest/v1/samples/search";

        const _this = this;
        $("#" + this._prefix + "PanelGenesGrid").bootstrapTable("destroy");
        $("#" + this._prefix + "PanelGenesGrid").bootstrapTable({
            theadClasses: "table-light",
            buttonsClass: "light",
            data: _this.genesSelected,
            columns: _this._createGenes(),
            // method: 'get',
            // sidePagination: 'server',
            filterControl: true,
            queryParams: function(params) {
                const auxParams = {
                    studyId: _this.opencgaSession.study.id,
                    //                                lazy: "false",
                    sid: Cookies.get(_this.opencgaClient.getConfig().cookieSessionId),
                    order: params.order,
                    sort: params.sort,
                    limit: params.limit,
                    skip: params.offset,
                    includeIndividual: true,
                    name: params.search
                };

                return Object.assign({}, auxParams);
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
            onPageChange: function(page, size) {
                _this.from = (page - 1) * size + 1;
                _this.to = page * size;
            }
        });
    }

    renderPanelTableMutations() {
        // Check that HTTP protocol is present and complete the URL
        let opencgaHostUrl = this.opencgaClient.getConfig().host;
        if (!opencgaHostUrl.startsWith("http://") && !opencgaHostUrl.startsWith("https://")) {
            opencgaHostUrl = "http://" + opencgaHostUrl;
        }
        opencgaHostUrl += "/webservices/rest/v1/samples/search";

        const _this = this;
        $("#" + this._prefix + "PanelMutationsGrid").bootstrapTable("destroy");
        $("#" + this._prefix + "PanelMutationsGrid").bootstrapTable({
            theadClasses: "table-light",
            buttonsClass: "light",
            columns: _this._createMutations(),
            data: _this.mutationsSelected,
            // method: 'get',
            // sidePagination: 'server',
            filterControl: true,
            queryParams: function(params) {
                const auxParams = {
                    studyId: _this.opencgaSession.study.id,
                    //                                lazy: "false",
                    sid: Cookies.get(_this.opencgaClient.getConfig().cookieSessionId),
                    order: params.order,
                    sort: params.sort,
                    limit: params.limit,
                    skip: params.offset,
                    includeIndividual: true,
                    name: params.search
                };

                return Object.assign({}, auxParams);
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
            onPageChange: function(page, size) {
                _this.from = (page - 1) * size + 1;
                _this.to = page * size;
            }
        });
    }

    variantFormatter(value, row, index) {
        return row.id;
    }

    variantPhenotypeFormatter(value, row, index) {
        return row.phenotype;
    }

    _createPhenotypes() {
        return [
            [
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
                    title: "Source",
                    field: "source",
                    // sortable: true,
                    colspan: 1,
                    rowspan: 1,
                    halign: "center"
                }

            ]
        ];
    }

    _createGenes() {
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
                }
            ]
        ];
    }

    _createMutations() {
        return [
            [
                {
                    title: "Variant",
                    // sortable: true,
                    colspan: 1,
                    rowspan: 1,
                    halign: "center",
                    searchable: true,
                    formatter: this.variantFormatter

                },
                {
                    title: "Disease",
                    // sortable: true,
                    colspan: 1,
                    rowspan: 1,
                    halign: "center",
                    searchable: true,
                    formatter: this.variantPhenotypeFormatter

                }
            ]
        ];
    }

    render() {
        return html`
        <div style="padding-top: 20px">
            <ul id="${this._prefix}ManualTabs" class="nav nav-tabs" role="tablist">
                <li role="presentation" class="active">
                    <a href="#${this._prefix}TAB_SUMMARY" role="tab" data-toggle="tab" class="prioritization-variant-tab-title">
                        Summary
                    </a>
                </li>
                <li role="presentation">
                    <a href="#${this._prefix}TAB_A" role="tab" data-toggle="tab" class="prioritization-variant-tab-title">
                        Diseases
                    </a>
                </li>
                <li role="presentation">
                    <a href="#${this._prefix}TAB_B" role="tab" data-toggle="tab" class="prioritization-variant-tab-title">
                        Genes
                    </a>
                </li>
                <li role="presentation">
                    <a href="#${this._prefix}TAB_C" role="tab" data-toggle="tab" class="prioritization-variant-tab-title">
                        Mutations
                    </a>
                </li>
            </ul>

            <div class="tab-content" >
                <div role="tabpanel" class="tab-pane active" id="${this._prefix}TAB_SUMMARY" style="margin-top: 2%;">
                    <div class="form-group has-feedback row">
                        <div class="col-md-5">
                            <label class="col-label">Name</label>
                            <span> ${this.panelSelected.name}</span>
                        </div>
                        <div class="col-md-5">
                            <label class="col-label">Description</label>
                            <span> ${this.panelSelected.description}</span>
                        </div>
                    </div>
                    <div class="form-group has-feedback row">
                        <div class="col-md-5">
                            <label class="col-label">Author</label>
                            <span> ${this.panelSelected.author}</span>
                        </div>
                        <div class="col-md-5">
                            <label class="col-label">Version</label>
                            <span> ${this.panelSelected.version}</span>
                        </div>
                    </div>
                    <div class="form-group has-feedback row">
                        <div class="col-md-5">
                            <label class="col-label">Creation Date</label>
                            <span> ${this.dateFormatter(this.panelSelected.creationDate)}</span>
                        </div>

                    </div>
                </div>

                <div role="tabpanel" class="tab-pane" id="${this._prefix}TAB_A">
                    <!-- Variant Browser Grid -->

                    <div id="${this._prefix}PanelDiseases" style="">
                        <table id="${this._prefix}PanelDiseasesGrid" data-pagination="true" data-page-list="[5]"
                               data-click-to-select="true" data-page-size="5">
                        </table>
                    </div>
                </div>
                <div id="${this._prefix}TAB_B" role="tabpanel" class="tab-pane">
                    <!-- Variant Browser Grid -->
                    <div id="${this._prefix}PanelGenes" style="">
                        <table id="${this._prefix}PanelGenesGrid" data-pagination="true" data-page-list="[5]"  data-page-size="5"
                               data-click-to-select="true" >
                        </table>
                    </div>
                </div>
                <div role="tabpanel" class="tab-pane" id="${this._prefix}TAB_C">
                    <!-- Variant Browser Grid -->
                    <div id="${this._prefix}PanelMutations" style="">
                        <table id="${this._prefix}PanelMutationsGrid" data-pagination="true" data-page-list="[5]"
                               data-click-to-select="true" >
                        </table>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

}

customElements.define("opencga-panel-summary", OpencgaPanelSummary);

