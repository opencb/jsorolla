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


export default class RgaGeneGrid extends LitElement {

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
        this._prefix = "rga-g-" + UtilsNew.randomString(6) + "_";
        this.gridId = this._prefix + "RgaGeneBrowserGrid";
        this.prevQuery = {};
        this._query = {};

        this._genes = ["GRIK5", "ACTN3", "COMT", "TTN", "ABCA12", "ALMS1", "ALOX12B", "ATP8A2", "BLM",
            "CCNO", "CEP290", "CNGB3", "CUL7", "DNAAF1", "DOCK6", "EIF2B5", "ERCC6", "FLG", "HADA",
            "INPP5K", "MANIB1", "MERTK", "MUTYH", "NDUFAF5", "NDUFS7", "OTOG", "PAH", "PDZD7", "PHYH",
            "PKHD1", "PMM2", "RARS2", "SACS", "SGCA", "SIGMAR1", "SPG7", "TTN", "TYR", "USH2A", "WFS1"];
        // this._genes = ["INPP5K"];

    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
    }

    firstUpdated(_changedProperties) {
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
            columns: [
                {
                    title: "Gene",
                    field: "value"
                }, {

                    title: "Compound Heterozygous: Total",
                    field: "ch"
                }, {

                    title: "Compound Heterozygous: Definitely",
                    field: "ch_2"
                }, {

                    title: "Compound Heterozygous: Probable",
                    field: "ch_1"
                }, {

                    title: "Compound Heterozygous: Possible",
                    field: "ch_0"
                }/* , {

                title: "Homozygous",
                field: "hom"
            }*/
            ]
        };

        this.renderTable();
    }

    renderTable() {
        if (!this.active) {
            return;
        }

        this._query = {...this.query, study: this.opencgaSession.study.fqn}; // we want to support a query obj param both with or without study.
        console.log("UtilsNew.objectCompare(this._query, this.prevQuery)", UtilsNew.objectCompare(this._query, this.prevQuery));
        if (UtilsNew.objectCompare(this._query, this.prevQuery)) {
            return;
        }

        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            // url: opencgaHostUrl,
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
                    // order: params.data.order,
                    limit: params.data.limit,
                    skip: params.data.offset || 0,
                    count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                    field: "geneName>>knockoutTypes>>numParents",
                    // geneName: this._genes.join(","),
                    ...this._query
                    // limit: 50
                };
                this.opencgaSession.opencgaClient.clinical().aggregationStatsRga(_filters)
                    .then(res => {
                        console.log("res", res);
                        params.success(res);
                    })
                    .catch(e => {
                        console.error(e);
                        params.error(e);
                    });

                /* this.opencgaSession.opencgaClient.clinical().queryRgaGene(_filters)
                    .then(res => {
                        console.log("res", res);
                        params.success(res);
                    })
                    .catch(e => {
                        console.error(e);
                        params.error(e);
                    });*/
            },
            responseHandler: response => {
                // const result = this.gridCommons.responseHandler(response, $(this.table).bootstrapTable("getOptions"));
                return {
                    total: response.getResult(0)?.count ?? 0,
                    rows: response.getResult(0)?.buckets ?? []

                };
            },
            onClickRow: (row, selectedElement, field) => {
                // console.log(row);
                this.gridCommons.onClickRow(row.id, row, selectedElement);
            },
            onCheck: (row, $element) => this.gridCommons.onCheck(row.id, row),
            onLoadSuccess: data => this.gridCommons.onLoadSuccess(data, 1),
            onLoadError: (e, restResponse) => this.gridCommons.onLoadError(e, restResponse)
        });

    }

    onColumnChange(e) {
        // console.log("onColumnChange", e);
        this.gridCommons.onColumnChange(e);
    }

    sampleFormatter(value, row) {
        if (UtilsNew.isNotUndefined(row.samples)) {
            return row.samples.length;
        } else {
            return 0;
        }
    }

    _initTableColumns() {
        return [
            [
                {
                    title: "Gene",
                    field: "value",
                    rowspan: 2,
                    halign: "center",
                    formatter: this.geneIdFormatter
                },
                {
                    title: "Compound Heterozygous",
                    field: "ch",
                    colspan: 4
                },
                {
                    title: "Homozygous"
                },
                {
                    title: "All"
                }
            ],
            [
                {
                    title: "Tot",
                    field: "ch",
                    formatter: (_, row) => {
                        const knockoutTypes = row.facetFields.find(facetField => facetField.name === "knockoutTypes");
                        return knockoutTypes.buckets.find(bucket => bucket.value === "COMP_HET")?.count ?? "-";
                        // return "n/a"
                    }
                },
                {
                    title: "Definitely",
                    field: "ch_2",
                    formatter: (_, row) => this.getConfidenceCount(row.facetFields, "2")
                },
                {
                    title: "Probable",
                    field: "ch_1",
                    formatter: (_, row) => this.getConfidenceCount(row.facetFields, "1")
                },
                {
                    title: "Possible",
                    field: "ch_0",
                    formatter: (_, row) => this.getConfidenceCount(row.facetFields, "0")
                },
                {
                    title: "Total", // row.facetFields.find(facetField => facetField.name === "HOM_ALT")?.count ?? "n/a"
                    field: "hom",
                    formatter: (_, row) => {
                        const knockoutTypes = row.facetFields.find(facetField => facetField.name === "knockoutTypes");
                        return knockoutTypes.buckets.find(bucket => bucket.value === "HOM_ALT")?.count ?? "n/a";
                    }
                },
                {
                    title: "Total",
                    field: "count"
                    // formatter: (val, row, index) => this.tableData[index].individuals?.length
                }
            ]
        ];
    }

    getConfidenceCount(facetFields, value) {
        // TODO note this code implies 4 nested loops
        const knockoutTypes = facetFields.find(facetField => facetField.name === "knockoutTypes");
        const CHFacet = knockoutTypes?.buckets?.find(bucket => bucket.value === "COMP_HET");
        const numParentFacet = CHFacet?.facetFields?.find(facetField => facetField.name === "numParents");
        const numParents = numParentFacet?.buckets?.find(bucket => bucket.value === value);
        return numParents?.count ?? "-";
    }

    async onDownload(e) {

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
            <opencb-grid-toolbar
                .config="${this.toolbarConfig}"
                 @columnChange="${this.onColumnChange}"
                 @download="${this.onDownload}">
            </opencb-grid-toolbar>

            <div id="${this._prefix}GridTableDiv">
                <table id="${this._prefix}RgaGeneBrowserGrid"></table>
            </div>
            

        `;
    }

}

customElements.define("rga-gene-grid", RgaGeneGrid);
