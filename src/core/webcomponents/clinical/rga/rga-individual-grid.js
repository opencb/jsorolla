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
import "./rga-individual-family.js";


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
        //this._genes = ["INPP5K"];

    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
        this.detailConfig = this.getDetailConfig();

    }

    firstUpdated(_changedProperties) {
        // this.table = $("#" + this.gridId);
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
                    field: "genes"
                },
                {
                    title: "Sample",
                    field: "sampleId",
                    rowspan: 2
                },
                {

                    title: "Compound Heterozygous: Total",
                    field: "ch"
                },
                {

                    title: "Compound Heterozygous: Definitely",
                    field: "ch_2"
                },
                {

                    title: "Compound Heterozygous: Probable",
                    field: "ch_1"
                },
                {

                    title: "Compound Heterozygous: Possible",
                    field: "ch_0"
                },
                {
                    title: "Phenotypes",
                    field: "phenotypes"
                },
                {
                    title: "Disorders",
                    field: "disorders"
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
                    // limit: params.data.limit,
                    skip: params.data.offset || 0,
                    count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                    include: "genes,sampleId,phenotypes,disorders,motherId,fatherId",
                    geneName: this._genes.join(","),
                    individualId: "112000791",
                    ...this._query,
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

                const individuals = {
                    total: 2,
                    rows: [
                        {
                            id: "ind1",
                            motherId: "115000155",
                            fatherId: "115000154",
                            motherSamples: ["LP3000021-DNA_A03"],
                            fatherSamples: ["LP3000021-DNA_B04"],
                            genes: [
                                {
                                    name: "gene1",
                                    transcripts: [
                                        {
                                            id: "tr1",
                                            variants: [
                                                {
                                                    id: "gene1_tr1_var1",
                                                    knockoutType: "HOM_ALT"
                                                },
                                                {
                                                    id: "gene1_tr1_var2",
                                                    knockoutType: "HOM_ALT"
                                                },
                                                {
                                                    id: "gene1_tr1_var3",
                                                    knockoutType: "HOM_ALT"
                                                }
                                            ]
                                        },
                                        {
                                            id: "tr2",
                                            variants: [
                                                {
                                                    id: "gene1_tr2_var1",
                                                    knockoutType: "HOM_ALT"
                                                },
                                                {
                                                    id: "gene1_tr2_var2",
                                                    knockoutType: "HOM_ALT"
                                                },
                                                {
                                                    id: "gene1_tr2_var3",
                                                    knockoutType: "HOM_ALT"
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    name: "gene2",
                                    transcripts: [
                                        {
                                            id: "tr1",
                                            variants: [
                                                {
                                                    id: "gene2_tr1_var",
                                                    knockoutType: "HOM_ALT"
                                                },
                                                {
                                                    id: "gene2_tr1_var2",
                                                    knockoutType: "HOM_ALT"
                                                },
                                                {
                                                    id: "gene2_tr1_var3",
                                                    knockoutType: "HOM_ALT"
                                                }
                                            ]
                                        },
                                        {
                                            id: "tr2",
                                            variants: [
                                                {
                                                    id: "gene2_tr2_var1",
                                                    knockoutType: "HOM_ALT"
                                                },
                                                {
                                                    id: "gene2_tr2_var2",
                                                    knockoutType: "COMP_HET"
                                                },
                                                {
                                                    id: "gene2_tr2_var3",
                                                    knockoutType: "HOM_ALT"
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            id: "ind2",
                            motherId: "002",
                            genes: [
                                {
                                    name: "gene3",
                                    transcripts: [
                                        {
                                            id: "tr1",
                                            variants: [
                                                {
                                                    id: "gene3_tr1_var1",
                                                    knockoutType: "HOM_ALT"
                                                },
                                                {
                                                    id: "gene3_tr1_var2",
                                                    knockoutType: "HOM_ALT"
                                                },
                                                {
                                                    id: "gene3_tr1_var3",
                                                    knockoutType: "HOM_ALT"
                                                }
                                            ]
                                        },
                                        {
                                            id: "tr2",
                                            variants: [
                                                {
                                                    id: "gene3_tr2_var1",
                                                    knockoutType: "HOM_ALT"
                                                },
                                                {
                                                    id: "gene3_tr2_var2",
                                                    knockoutType: "HOM_ALT"
                                                },
                                                {
                                                    id: "gene3_tr2_var3",
                                                    knockoutType: "HOM_ALT"
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    name: "gene2",
                                    transcripts: [
                                        {
                                            id: "tr1",
                                            variants: [
                                                {
                                                    id: "gene2_tr1_var1",
                                                    knockoutType: "HOM_ALT"
                                                },
                                                {
                                                    id: "gene2_tr1_var2",
                                                    knockoutType: "HOM_ALT"
                                                },
                                                {
                                                    id: "gene2_tr1_var3",
                                                    knockoutType: "HOM_ALT"
                                                }
                                            ]
                                        },
                                        {
                                            id: "tr2",
                                            variants: [
                                                {
                                                    id: "gene2_tr2_var1",
                                                    knockoutType: "HOM_ALT"
                                                },
                                                {
                                                    id: "gene2_tr2_var2",
                                                    knockoutType: "COMP_HET"
                                                },
                                                {
                                                    id: "gene2_tr2_var3",
                                                    knockoutType: "HOM_ALT"
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            id: "ind2",
                            fatherId: "002",
                            motherId: "002",
                            genes: [
                                {
                                    name: "gene4",
                                    transcripts: [
                                        {
                                            id: "tr1",
                                            variants: [
                                                {
                                                    id: "gene4_tr1_var1",
                                                    knockoutType: "HOM_ALT"
                                                },
                                                {
                                                    id: "gene4_tr1_var2",
                                                    knockoutType: "HOM_ALT"
                                                },
                                                {
                                                    id: "gene4_tr1_var3",
                                                    knockoutType: "HOM_ALT"
                                                }
                                            ]
                                        },
                                        {
                                            id: "tr2",
                                            variants: [
                                                {
                                                    id: "gene4_tr2_var1",
                                                    knockoutType: "HOM_ALT"
                                                },
                                                {
                                                    id: "gene4_tr2_var2",
                                                    knockoutType: "HOM_ALT"
                                                },
                                                {
                                                    id: "gene4_tr2_var3",
                                                    knockoutType: "HOM_ALT"
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    name: "gene2",
                                    transcripts: [
                                        {
                                            id: "tr1",
                                            variants: [
                                                {
                                                    id: "gene2_tr1_var1",
                                                    knockoutType: "HOM_ALT"
                                                },
                                                {
                                                    id: "gene2_tr1_var1",
                                                    knockoutType: "HOM_ALT"
                                                },
                                                {
                                                    id: "gene2_tr1_var1",
                                                    knockoutType: "HOM_ALT"
                                                }
                                            ]
                                        },
                                        {
                                            id: "tr2",
                                            variants: [
                                                {
                                                    id: "gene2_tr2_var1",
                                                    knockoutType: "HOM_ALT"
                                                },
                                                {
                                                    id: "gene2_tr2_var2",
                                                    knockoutType: "COMP_HET"
                                                },
                                                {
                                                    id: "gene2_tr2_var3",
                                                    knockoutType: "HOM_ALT"
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                };
                return this.mapResult(result.response);
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
        // return value.length ? (value.length > 20 ? `${value.length} genes` : value.map(gene => gene.name)) : "-";
        const genes = value.map(gene => `${gene.name}`).join(", ");
        if (value && value.length > 20) {
            return `<a tooltip-title="Phenotypes" tooltip-text='${genes}'> ${value.length} genes</a>`;
        } else {
            return genes;
        }
    }

    mapResult(results) {
        const rows = results.rows.map(ind => {
            const ch = this.getKnockoutCount(ind.genes, "COMP_HET");
            return {
                ...ind,
                homozygous: this.getKnockoutCount(ind.genes, "HOM_ALT"),
                ch: ch,
                ch_definite: ind.fatherId && ind.motherId ? ch : null,
                ch_probable: (ind.fatherId && !ind.motherId) || (!ind.fatherId && ind.motherId) ? ch : null,
                ch_possible: !ind.fatherId && !ind.motherId ? ch : null
            };

        });
        return {
            total: results.total,
            rows: rows
        };
    }

    _initTableColumns() {
        return [
            [
                {
                    title: "Individual Id",
                    field: "id",
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
                    field: ""
                },
                {
                    title: "Compound Heterozygous",
                    field: "",
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
                    formatter: disorders => disorders?.length ? disorders.map(CatalogGridFormatter.disorderFormatter) : "-"

                }
            ], [
                {
                    title: "Total",
                    field: "homozygous"
                    /* formatter: (_, row) => {
                        return this.getKnockoutCount(row.genes, "HOM_ALT");
                    }*/
                },
                {
                    title: "Total",
                    field: "ch"
                    /* formatter: (_, row) => {
                        return this.getKnockoutCount(row.genes, "COMP_HET");
                    }*/
                },
                {
                    title: "Definite",
                    field: "ch_definite"
                    /* formatter: (_, row) => {
                        console.error("ROW", row);
                        return row.fatherId && row.motherId ? this.getKnockoutCount(row.genes, "COMP_HET") : "-";
                    }*/
                },
                {
                    title: "Probable",
                    field: "ch_probable"
                    /* formatter: (_, row) => {
                        return (row.fatherId && !row.motherId) || (!row.fatherId && row.motherId) ? this.getKnockoutCount(row.genes, "COMP_HET") : "-";
                    }*/
                },
                {
                    title: "Possible",
                    field: "ch_possible"
                    /* formatter: (_, row) => {
                        return !row.fatherId && !row.motherId ? this.getKnockoutCount(row.genes, "COMP_HET") : "-";
                    }*/
                }
            ]
        ];
    }

    getKnockoutCount(genes, type) {
        let total = 0;


        gene:
            for (const gene of genes) {
                for (const transcript of gene.transcripts) {
                    for (const variant of transcript.variants) {
                        if (variant.knockoutType === type) {
                            total++;
                            continue gene;
                        }
                    }
                }
            }

        /* for (const gene of genes) {
            const variants = gene.transcripts[0].variants;
            for (const variant of variants) {
                if (variant.knockoutType === type) {
                    total++;
                }
            }
        }*/
        /* if (type === "COMP_HET") {
            return total > 0 ? total/2 : "-";
        }*/
        return total > 0 ? total : null;
    }

    async onDownload(e) {
        this.toolbarConfig = {...this.toolbarConfig, downloading: true};
        await this.requestUpdate();
        const params = {
            study: this.opencgaSession.study.fqn,
            count: false,
            include: "genes,sampleId,phenotypes,disorders,motherId,fatherId",
            ...this._query,
            limit: 100
        };
        this.opencgaSession.opencgaClient.clinical().queryRgaIndividual(params)
            .then(restResponse => {
                const results = restResponse.getResults();
                if (results) {
                    // Check if user clicked in Tab or JSON format
                    if (e.detail.option.toLowerCase() === "tab") {
                        const dataString = [
                            [
                                "IndividualId",
                                "Sample",
                                "Gene",
                                "Total HOM",
                                "Total CH",
                                "CH Definite",
                                "CH Probable",
                                "CH Possible",
                                "Phenotypes",
                                "Disorders"
                            ].join("\t"),
                            ...results.map(_ => [
                                _.id,
                                _.sampleId,
                                this.geneFormatter(_.genes),
                                _.homozygous,
                                _.ch,
                                _.ch_definite,
                                _.ch_probable,
                                _.ch_possible,
                                CatalogGridFormatter.phenotypesFormatter(_.phenotypes),
                                _.disorders.length ? _.disorders.map(CatalogGridFormatter.disorderFormatter) : "-"
                            ].join("\t"))];
                        UtilsNew.downloadData(dataString, "rga_individual_" + this.opencgaSession.study.id + ".txt", "text/plain");
                    } else {
                        UtilsNew.downloadData(JSON.stringify(results, null, "\t"), "rga_individual_" + this.opencgaSession.study.id + ".json", "application/json");
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
                            <rga-individual-variants .individual="${individual}" .opencgaSession="${opencgaSession}"></rga-individual-variants>
                        `;
                    }
                }, {
                    id: "family-view",
                    name: "Family",
                    render: (individual, active, opencgaSession) => {
                        return html`
                            <rga-individual-family .individual="${individual}" .active=${active} .opencgaSession="${opencgaSession}"></rga-individual-family>`;
                        // return html`<opencga-family-view .individualId="${individual.id}" .opencgaSession="${opencgaSession}"></opencga-family-view>`;
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
            ${this.individual ? html`
                <detail-tabs .data="${this.individual}" .config="${this.detailConfig}" .opencgaSession="${this.opencgaSession}"></detail-tabs>` : ""}
        `;
    }

}

customElements.define("rga-individual-grid", RgaIndividualGrid);
