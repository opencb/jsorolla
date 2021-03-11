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
import UtilsNew from "../../../utilsNew.js";
import GridCommons from "../../commons/grid-commons.js";
import CatalogGridFormatter from "../../commons/catalog-grid-formatter.js";
import "./rga-individual-variants.js";

export default class RgaIndividualGrid extends LitElement {

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
        this._prefix = "rga-g" + UtilsNew.randomString(6) + "_";
        this.active = false;
        this.gridId = this._prefix + "RgaIndividualBrowserGrid";
        this.rendered = false;
        this.prevQuery = {};
        this._query = {};

        this._genes = ["GRIK5", "ACTN3", "COMT", "TTN", "ABCA12", "ALMS1", "ALOX12B", "ATP8A2", "BLM",
            "CCNO", "CEP290", "CNGB3", "CUL7", "DNAAF1", "DOCK6", "EIF2B5", "ERCC6", "FLG", "HADA",
            "INPP5K", "MANIB1", "MERTK", "MUTYH", "NDUFAF5", "NDUFS7", "OTOG", "PAH", "PDZD7", "PHYH",
            "PKHD1", "PMM2", "RARS2", "SACS", "SGCA", "SIGMAR1", "SPG7", "TTN", "TYR", "USH2A", "WFS1"];
        this._genes = ["GRIK5", "ACTN3", "COMT"];

    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
        this.detailConfig = this.getDetailConfig();

    }

    firstUpdated(_changedProperties) {
        //this.table = $("#" + this.gridId);
    }

    updated(changedProperties) {
        if ((changedProperties.has("opencgaSession") || changedProperties.has("query") || changedProperties.has("config") || changedProperties.has("active")) && this.active) {
            this.propertyObserver();
        }
    }

    propertyObserver() {
        // With each property change we must updated config and create the columns again. No extra checks are needed.
        this._config = Object.assign(this.getDefaultConfig(), this.config);
        this._columns = this._initTableColumns();
        // Config for the grid toolbar
        this.toolbarConfig = {
            columns: this._columns[0]
        };

        this.renderTable();
    }

    renderTable() {

        this._query = {...this.query, study: this.opencgaSession.study.fqn}; // we want to support a query obj param both with or without study.
        // Checks if the component is not visible or the query hasn't changed
        if (!this.active || UtilsNew.objectCompare(this._query, this.prevQuery)) {
            return;
        }

        this.prevQuery = {...this._query};
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            columns: this._columns,
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
            formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
            ajax: params => {
                const _filters = {
                    study: this.opencgaSession.study.fqn,
                    //order: params.data.order,
                    // limit: params.data.limit,
                    skip: params.data.offset || 0,
                    count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                    ...this._query,
                    geneName: this._genes.join(","),
                    limit: 50
                };
                this.opencgaSession.opencgaClient.clinical().queryRgaIndividual(_filters)
                    .then(res => {
                        console.log("res", res);
                        params.success(res);
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
            onClickRow: (row, selectedElement, field) => {
                console.log(row);
                this.individual = row;
                this.gridCommons.onClickRow(row.id, row, selectedElement);
                this.requestUpdate();
            },
            onLoadSuccess: data => {
                // this is not triggered in case of static data
            },
            onLoadError: (e, restResponse) => this.gridCommons.onLoadError(e, restResponse),
            onPostBody: data => {
                this.gridCommons.onLoadSuccess({rows: data, total: data.length});
                if (data[0]) {
                    // it selects the first row (we don't use `selectrow` event in this case)
                    this.individual = data[0];
                }
                this.requestUpdate();
            }
        });
    }

    onColumnChange(e) {
        this.gridCommons.onColumnChange(e);
    }

    sampleFormatter(value, row) {
        if (UtilsNew.isNotUndefined(row.samples)) {
            return row.samples.length;
        } else {
            return 0;
        }
    }

    geneFormatter(value, row) {
        return value.length ? (value.length > 20 ? `${value.length} genes` : value.map(gene => gene.name)) : "-";
    }

    _initTableColumns() {
        return [
            [
                {
                    title: "Individual Id",
                    field: "sampleId",
                    rowspan: 2
                },
                {
                    title: "Sample",
                    field: "sampleId",
                    rowspan: 2
                },
                {
                    title: "Gene",
                    field: "genes",
                    rowspan: 2,
                    formatter: this.geneFormatter
                },
                {
                    title: "Homozygous",
                    field: "stats.byType.HOM_ALT"
                },
                {
                    title: "Compound Heterozygous",
                    field: "stats.byType.COMP_HET",
                    colspan: 4
                },
                {
                    title: "Phenotypes",
                    field: "phenotypes",
                    rowspan: 2,
                    formatter: CatalogGridFormatter.phenotypesFormatter

                },
                {
                    title: "Disorders",
                    field: "disorders",
                    rowspan: 2,
                    formatter: disorders => disorders.length ? disorders.map(CatalogGridFormatter.disorderFormatter) : "-"

                }
            ], [
                {
                    title: "Total",
                    field: "stats.byType.HOM_ALT"
                },
                {
                    title: "Total",
                    field: "stats.byType.COMP_HET"
                },
                {
                    title: "Definitely",
                    field: "stats.byType.COMP_HET.def"
                },
                {
                    title: "Probable",
                    field: "stats.byType.COMP_HET.prob"
                },
                {
                    title: "Possible",
                    field: "stats.byType.COMP_HET.poss"
                }
            ]
        ];
    }

    async onDownload(e) {

    }

    getDetailConfig() {
        return {
            title: "Individual",
            showTitle: true,
            items: [
                {
                    id: "individual-view",
                    name: "Variants",
                    active: true,
                    render: (individual, active, opencgaSession) => {
                        return html`
                            <h3>Variants in ${individual?.id}</h3>
                            <rga-individual-variants .individual="${individual}"></rga-individual-variants>
                        `;
                    }
                }, {
                    id: "family-view",
                    name: "Family",
                    render: (individual, active, opencgaSession) => {
                        return html`<opencga-family-view .individualId="${individual.id}" .opencgaSession="${opencgaSession}"></opencga-family-view>`;
                    }
                }
            ]
        };
    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 10,
            pageList: [10, 25, 50],
            showExport: false,
            detailView: false,
            detailFormatter: undefined, // function with the detail formatter
            multiSelection: false,
            header: {
                horizontalAlign: "center",
                verticalAlign: "bottom"
            }
        };
    }

    render() {
        return html`
            <opencb-grid-toolbar .config="${this.toolbarConfig}"
                                 @columnChange="${this.onColumnChange}"
                                 @download="${this.onDownload}">
            </opencb-grid-toolbar>

            <div id="${this._prefix}GridTableDiv">
                <table id="${this._prefix}RgaIndividualBrowserGrid"></table>
            </div>
            ${this.individual ? html`<detail-tabs .data="${this.individual}" .config="${this.detailConfig}" .opencgaSession="${this.opencgaSession}"></detail-tabs>`: ""}
        `;
    }

}

customElements.define("rga-individual-grid", RgaIndividualGrid);
