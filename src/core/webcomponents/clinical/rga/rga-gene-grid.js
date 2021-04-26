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
        //this._genes = ["INPP5K"];

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

                    title: "Recessive Individuals",
                    field: "ind_tot,ind_hom,ind_ch,ind_ch_def,ind_ch_prob,ind_ch_poss"
                }, {

                    title: "Recessive Variants",
                    field: "var_tot,var_hom,var_ch"
                }
            ]
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
            ajax: async params => {
                const _filters = {
                    study: this.opencgaSession.study.fqn,
                    // order: params.data.order,
                    limit: params.data.limit,
                    skip: params.data.offset || 0,
                    count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                    // geneName: this._genes.join(","),
                    ...this._query
                    // limit: 50
                };
                this.opencgaSession.opencgaClient.clinical().summaryRgaGene(_filters)
                    .then(res => {
                        console.log("res", res);
                        // this.restResponse = res;
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
                // console.log("variant facet", this.restResponse.getResult(1).buckets.find(gene => gene.value === row.value))
                this.gridCommons.onClickRow(row.id, row, selectedElement);
            },
            onCheck: (row, $element) => this.gridCommons.onCheck(row.id, row),
            onLoadSuccess: data => this.gridCommons.onLoadSuccess(data, 1),
            onLoadError: (e, restResponse) => this.gridCommons.onLoadError(e, restResponse)
        });

    }

    /**
     * @deprecated
     */
    responseHandler(response) {
        const r = [];
        if (response.getResults().length === 2) {
            for (const individualFacetGene of response.getResult(0).buckets) {
                // console.log("individualFacetGene", individualFacetGene)
                // const individual_HOM_ALT = individualFacetGene.facetFields.find(facet => facet.name === "knockoutTypes").buckets.find(bucket => bucket.value === "HOM_ALT");
                // const individual_COMP_HET = individualFacetGene.facetFields.find(facet => facet.name === "knockoutTypes").buckets.find(bucket => bucket.value === "COMP_HET");
                // const variant_HOM_ALT = variantFacetGene.facetFields.find(facet => facet.name === "knockoutTypes").buckets.find(bucket => bucket.value === "HOM_ALT");
                // const variant_COMP_HET = variantFacetGene.facetFields.find(facet => facet.name === "knockoutTypes").buckets.find(bucket => bucket.value === "COMP_HET");

                const individualKnockoutTypes = individualFacetGene.facetFields.find(facet => facet.name === "knockoutTypes");
                const variantFacetGene = response.getResult(0).buckets.find(gene => gene.name === individualFacetGene.name);
                const variantKnockoutTypes = variantFacetGene.facetFields.find(facet => facet.name === "knockoutTypes");

                const entry = {
                    name: individualFacetGene.value,
                    individualFacet: {
                        HOM_ALT: individualKnockoutTypes.buckets.find(bucket => bucket.value === "HOM_ALT"),
                        COMP_HET: individualKnockoutTypes.buckets.find(bucket => bucket.value === "COMP_HET"),
                        count: individualKnockoutTypes.count
                    },
                    variantFacet: {
                        HOM_ALT: variantKnockoutTypes.buckets.find(bucket => bucket.value === "HOM_ALT"),
                        COMP_HET: variantKnockoutTypes.buckets.find(bucket => bucket.value === "COMP_HET"),
                        count: variantKnockoutTypes.count
                    }
                };
                r.push(entry);

            }
            return {
                total: response.getResult(0)?.count ?? 0,
                rows: r
            };
        } else {
            // no results
            return [];
        }
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
                    field: "name",
                    rowspan: 2,
                    halign: "center"
                },
                {
                    title: "Recessive Individuals",
                    colspan: 5
                },
                {
                    title: "Recessive Variants",
                    colspan: 3
                }
            ],
            [
                {
                    title: "Total",
                    field: "individualStats.count",
                    formatter: value => value > 0 ? value : "-"
                },
                {
                    title: "Homozygous",
                    field: "individualStats.numHomAlt",
                    formatter: value => value > 0 ? value : "-"

                },
                /*{
                    title: "CH Tot",
                    field: "ind_ch",
                    formatter: (_, row) => {
                        /!* const knockoutTypes = row.facetFields.find(facetField => facetField.name === "knockoutTypes");
                        return knockoutTypes.buckets.find(bucket => bucket.value === "COMP_HET")?.count ?? "-";*!/
                        return row.individualFacet.COMP_HET?.count;
                    }
                },*/
                {
                    title: "CH - Definite",
                    field: "individualStats.bothParents.numCompHet",
                    formatter: value => value > 0 ? value : "-"
                },
                {
                    title: "CH - Probable",
                    field: "individualStats.singleParent.numCompHet",
                    formatter: value => value > 0 ? value : "-"
                },
                {
                    title: "CH - Possible",
                    field: "individualStats.noParents.numCompHet",
                    formatter: value => value > 0 ? value : "-"
                },
                // Recessive Variants
                {
                    title: "Total",
                    field: "variantStats.count",
                    formatter: value => value > 0 ? value : "-"
                },
                {
                    title: "Homozygous",
                    field: "variantStats.numHomAlt",
                    formatter: value => value > 0 ? value : "-"
                },
                {
                    title: "CH",
                    field: "variantStats.numCompHet",
                    formatter: value => value > 0 ? value : "-"
                }
            ]
        ];
    }

    getConfidenceCount(row, value) {
        return row.individualFacet.COMP_HET?.facetFields?.find(facet => facet.name === "numParents").buckets.find(bucket => bucket.value === value)?.count;
    }

    /**
     * @deprecated
     */
    _getConfidenceCount(facetFields, value) {
        // TODO note this code implies 4 nested loops
        const knockoutTypes = facetFields.find(facetField => facetField.name === "knockoutTypes");
        const CHFacet = knockoutTypes?.buckets?.find(bucket => bucket.value === "COMP_HET");
        const numParentFacet = CHFacet?.facetFields?.find(facetField => facetField.name === "numParents");
        const numParents = numParentFacet?.buckets?.find(bucket => bucket.value === value);
        return numParents?.count ?? "-";
    }

    async onDownload(e) {
        this.toolbarConfig = {...this.toolbarConfig, downloading: true};
        await this.requestUpdate();
        const params = {
            study: this.opencgaSession.study.fqn,
            limit: 100,
            count: false,
            field: "geneName>>knockoutTypes>>numParents>>individualId;geneName>>knockoutTypes>>numParents>>variants",
            ...this._query
        };
        this.opencgaSession.opencgaClient.clinical().aggregationStatsRga(params)
            .then(response => {
                const results = this.responseHandler(response);
                console.error(results)
                if (results) {
                    if (e.detail.option.toLowerCase() === "tab") {
                        const dataString = [
                            [
                                "Gene",
                                "Individuals:Total",
                                "Individuals:Total HOM",
                                "Individuals:Total CH",
                                "Individuals:CH Definite",
                                "Individuals:CH Probable",
                                "Individuals:CH Possible",
                                "Variants:Total",
                                "Variants:HOM",
                                "Variants:CH"
                            ].join("\t"),
                            ...results.rows.map(_ => [
                                _.name,
                                _.individualFacet.count,
                                _.individualFacet.HOM_ALT?.count ?? "",
                                _.individualFacet.COMP_HET?.count ?? "",
                                this.getConfidenceCount(_, "2"),
                                this.getConfidenceCount(_, "1"),
                                this.getConfidenceCount(_, "0"),
                                _.variantFacet.count,
                                _.variantFacet.HOM_ALT?.count,
                                _.variantFacet.COMP_HET?.count

                            ].join("\t"))];
                        UtilsNew.downloadData(dataString, "rga_aggregated_" + this.opencgaSession.study.id + ".txt", "text/plain");
                    } else {
                        UtilsNew.downloadData(JSON.stringify(results, null, "\t"), "rga_aggregated_" + this.opencgaSession.study.id + ".json", "application/json");
                    }
                } else {
                    console.error("Error in result format");
                }
            })
            .catch(response => {
                console.log(response);
                UtilsNew.notifyError(response);
            })
            .finally(() => {
                this.toolbarConfig = {...this.toolbarConfig, downloading: false};
                this.requestUpdate();
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
