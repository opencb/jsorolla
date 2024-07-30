/*
 * Copyright 2015-2024 OpenCB
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
import UtilsNew from "../../../core/utils-new.js";
import GridCommons from "../../commons/grid-commons.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";

export default class RgaGeneView extends LitElement {

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
    }
    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
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
                    field: "name"
                }, {

                    title: "Recessive Individuals",
                    field: "individualStats.count,individualStats.numHomAlt,individualStats.bothParents.numCompHet,individualStats.singleParent.numCompHet,individualStats.missingParents.numCompHet"
                }, {

                    title: "Recessive Variants",
                    field: "variantStats.count,variantStats.numHomAlt,variantStats.numCompHet"
                }
            ],
            showExport: false,
        };
        this.requestUpdate();
        this.renderTable();
    }
    renderTable() {
        this._query = {...this.query, study: this.opencgaSession.study.fqn};
        // Checks if the component is not visible or the query hasn't changed (NOT the latter anymore)
        if (!this.active /* || UtilsNew.objectCompare(this._query, this.prevQuery)*/) {
            return;
        }
        this.prevQuery = {...this._query};

        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            theadClasses: "table-light",
            buttonsClass: "light",
            columns: this._columns,
            method: "get",
            sidePagination: "server",
            iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
            icons: GridCommons.GRID_ICONS,
            uniqueId: "id",
            // Table properties
            pageSize: this._config.pageSize,
            pageList: this._config.pageList,
            pagination: this._config.pagination,
            paginationVAlign: "both",
            formatShowingRows: this.gridCommons.formatShowingRows,
            showExport: this._config.showExport,
            detailView: !!this.detailFormatter,
            loadingTemplate: () => GridCommons.loadingFormatter(),
            ajax: async params => {
                const _filters = {
                    study: this.opencgaSession.study.fqn,
                    limit: params.data.limit,
                    skip: params.data.offset || 0,
                    count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                    ...this._query
                };
                this.opencgaSession.opencgaClient.clinical().summaryRgaGene(_filters)
                    .then(async rgaGeneResponse => {
                        // params.success(rgaGeneResponse);
                        // TODO move this in formatter (or in onLoadSuccess()) and make it async on table render
                        // disabled at the moment

                        /* this.geneIds = rgaGeneResponse.getResults().map(gene => gene.id);
                        const individualStatsResponse = await this.getIndividualInfo(this.geneIds);
                        console.log("individualStatsResponse", individualStatsResponse);
                        // merging RGA Variant data with Variant data
                        for (const gene of rgaGeneResponse.getResults()) {
                            console.log("gene", gene);
                            if (individualStatsResponse[gene.id]) {
                                gene.attributes = {
                                    INDIVIDUAL: individualStatsResponse[gene.id]
                                };
                            }
                        }*/
                        params.success(rgaGeneResponse);
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
            onClickRow: (row, selectedElement) => {
                console.log(row);
                // console.log("variant facet", this.restResponse.getResult(1).buckets.find(gene => gene.value === row.value))
                this.gridCommons.onClickRow(row.id, row, selectedElement);
            },
            onCheck: row => this.gridCommons.onCheck(row.id, row),
            onLoadSuccess: data => {
                this.gridCommons.onLoadSuccess(data, 1);
            },
            onLoadError: (e, restResponse) => this.gridCommons.onLoadError(e, restResponse)
        });
    }

    /*
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
                    formatter: value => value > 0 ? value : "-",
                    /* formatter: (value, row) => {
                        console.log("row", row);
                        if (value > 0) {
                            return value - row.attributes.INDIVIDUAL !== 0 ? value + " - " + row.attributes.INDIVIDUAL : value;
                        } else {
                            return "-";
                        }
                    }
                    */
                },
                {
                    title: "Homozygous",
                    field: "individualStats.numHomAlt",
                    formatter: value => value > 0 ? value : "-"

                },
                /* {
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
                    field: "individualStats.missingParents.numCompHet",
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

    async updateTotalIndividual(id) {
        console.log("id", id);
        this.table.bootstrapTable("updateCellByUniqueId", {id: id, field: "name", value: "loading"});
        const totalIndividualMap = await this.getIndividualInfo(id);
        this.table.bootstrapTable("updateCellByUniqueId", {
            id: id,
            field: "name",
            value: totalIndividualMap[id]
        });
    }

    getConfidenceCount(row, value) {
        return row.individualFacet.COMP_HET?.facetFields?.find(facet => facet.name === "numParents").buckets.find(bucket => bucket.value === value)?.count;
    }

    /**
     * Get Individual stats of a set of genes (the genes are not spliced as they comes from a paginated request already).
     * TODO NOTE this won't work as the `numMatches` > 10k is approximated
     * @param {Array} geneIds all genes
     * @returns {Object} Gene map
     */
    async getIndividualInfo(geneIds) {
        try {
            const geneMap = {};
            if (geneIds.length) {
                try {
                    for (const geneId of geneIds) {
                        console.log("geneId", geneId);
                        const _filters = {
                            study: this.opencgaSession.study.fqn,
                            count: true,
                            geneId: geneId,
                            include: "id",
                            exclude: "disorders,genes,phenotypes"
                        };
                        const res = await this.opencgaSession.opencgaClient.clinical().queryRgaIndividual(_filters);
                        geneMap[geneId] = res.getResponse().numMatches;
                    }
                    return geneMap;
                } catch (e) {
                    console.error(e);
                }
            } else {
                console.error("params error");
                return {};
            }
        } catch (e) {
            // console.error(e);
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, e);
            return Promise.reject(e);
        }

    }

    /*
     * @deprecated
     */
    /* _getConfidenceCount(facetFields, value) {
        // TODO note this code implies 4 nested loops
        const knockoutTypes = facetFields.find(facetField => facetField.name === "knockoutTypes");
        const CHFacet = knockoutTypes?.buckets?.find(bucket => bucket.value === "COMP_HET");
        const numParentFacet = CHFacet?.facetFields?.find(facetField => facetField.name === "numParents");
        const numParents = numParentFacet?.buckets?.find(bucket => bucket.value === value);
        return numParents?.count ?? "-";
    }*/

    async onDownload(e) {
        this.toolbarConfig = {...this.toolbarConfig, downloading: true};
        await this.requestUpdate();
        const params = {
            study: this.opencgaSession.study.fqn,
            limit: e.detail?.exportLimit ?? 1000,
            count: false,
            ...this._query
        };
        this.opencgaSession.opencgaClient.clinical().summaryRgaGene(params)
            .then(r => {
                const result = r.getResults();
                if (result.length) {
                    if (e.detail.option.toLowerCase() === "tab") {
                        const dataString = [
                            [
                                "Gene",
                                "Individuals_Total",
                                "Individuals_Total_HOM",
                                "Individuals_CH_Definite",
                                "Individuals_CH_Probable",
                                "Individuals_CH_Possible",
                                "Variants_Total",
                                "Variants_HOM",
                                "Variants_CH"
                            ].join("\t"),
                            ...result.map(_ => [
                                _.name,
                                _.individualStats.count,
                                _.individualStats.numHomAlt,
                                _.individualStats.bothParents.numCompHet,
                                _.individualStats.singleParent.numCompHet,
                                _.individualStats.missingParents.numCompHet,
                                _.variantStats.count,
                                _.variantStats.numHomAlt,
                                _.variantStats.numCompHet
                            ].join("\t"))];
                        UtilsNew.downloadData(dataString, "rga_gene_" + this.opencgaSession.study.id + ".tsv", "text/plain");
                    } else {
                        UtilsNew.downloadData(JSON.stringify(result, null, "\t"), "rga_gene_" + this.opencgaSession.study.id + ".json", "application/json");
                    }
                } else {
                    console.error("Error in result format");
                }
            })
            .catch(response => {
                // console.log(response);
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
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
            showExport: false
        };
    }

    render() {
        return html`
            <opencb-grid-toolbar
                .config="${this.toolbarConfig}"
                @columnChange="${this.onColumnChange}"
                @download="${this.onDownload}">
            </opencb-grid-toolbar>

            <div id="${this._prefix}GridTableDiv" data-cy="gene-view-grid">
                <table id="${this._prefix}RgaGeneBrowserGrid"></table>
            </div>
        `;
    }

}

customElements.define("rga-gene-view", RgaGeneView);
