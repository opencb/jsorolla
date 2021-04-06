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
import "./../../commons/view/detail-tabs.js";
import VariantInterpreterGridFormatter from "../../variant/interpretation/variant-interpreter-grid-formatter.js";
import VariantGridFormatter from "../../variant/variant-grid-formatter.js";


export default class RgaIndividualFamily extends LitElement {

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
            individual: {
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
        this._prefix = UtilsNew.randomString(8);
        this._config = this.getDefaultConfig();
        this.gridId = this._prefix + "KnockoutIndividualFamGrid";
        this.tableDataMap = {};
        this.individual = null;
        this.wip = true;
    }

    async updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
        }

        if ((changedProperties.has("individual") || changedProperties.has("active")) && this.active) {
            await this.prepareData();
            this.renderTable();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    // TODO clean
    async prepareData() {
        if (this.individual) {
            try {
                // motherId: "115000155", fatherId: "115000154"
                // motherSampleId:LP3000021-DNA_B04
                // fatherSampleId:LP3000018-DNA_A03

                this.sampleIds = ["LP3000108-DNA_B02", "LP3000021-DNA_B04", "LP3000018-DNA_A03"];

                /*/!**
                 * this.tableDataMap is the full list of unique variants per individual
                 *!/
                for (const gene of this.individual.genes) {
                    for (const transcript of gene.transcripts) {
                        for (const variant of transcript.variants) {
                            this.tableDataMap[variant.id] = {
                                ...variant,
                                geneName: gene.name
                            };
                        }
                    }
                }*/


                console.log("this.table.bootstrapTable(\"getOptions\").pageNumber", this.table.bootstrapTable("getOptions").pageNumber);

                // const sampleIds = ["LP3000108-DNA_B02", "LP3000021-DNA_B04", "LP3000018-DNA_A03"];
                // const variantResponse = await this.getVariantInfo(sampleIds, 0, 5);
                // console.error("uniqueVariants", this.tableDataMap);
                // console.error("variantResponse", variantResponse.getResults());
                // const variantData = variantResponse.getResults();
                //
                // console.log("Object.values(uniqueVariants)", Object.values(this.tableDataMap));
                // this.tableData = this.updateTableData(this.tableDataMap, variantData);

            } catch (e) {

            }
        }

    }

    /**
     * Queries variant WS only for the subset defined by startVariant and endVariant.
     */
    async getVariantInfo(sampleIds, startVariant, endVariant) {
        // formatter: VariantInterpreterGridFormatter.sampleGenotypeFormatter,

        try {
            const slicedVariant = this.variantIds.slice(startVariant, endVariant);
            if (slicedVariant.length && sampleIds.length) {
                const params = {
                    study: this.opencgaSession.study.fqn,
                    id: slicedVariant.join(","),
                    includeSample: sampleIds.join(",")
                };
                return await this.opencgaSession.opencgaClient.variants().query(params);
            } else {
                console.error("params error");
            }

        } catch (e) {
            UtilsNew.notifyError(e);
        }

    }

    /**
     * update tableData with new variant data (it happens on pagination)
     */
    updateTableData(tableDataMap, variantData) {
        const _tableDataMap = tableDataMap;
        variantData.forEach(variant => {
            _tableDataMap[variant.id].variantData = variant;
        });
        return Object.values(_tableDataMap);
    }

    renderTable() {
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            columns: this._initTableColumns(),
            sidePagination: "server",
            uniqueId: "id",
            pagination: true,
            // pageSize: this._config.pageSize,
            // pageList: this._config.pageList,
            paginationVAlign: "both",
            // formatShowingRows: this.gridCommons.formatShowingRows,
            gridContext: this,
            formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
            ajax: async params => {
                /**
                 * this.tableDataMap is the full list of unique variants per individual
                 */
                if (UtilsNew.isEmpty(this.tableDataMap)) {
                    for (const gene of this.individual.genes) {
                        for (const transcript of gene.transcripts) {
                            for (const variant of transcript.variants) {
                                this.tableDataMap[variant.id] = {
                                    ...variant,
                                    geneName: gene.name
                                };
                            }
                        }
                    }
                    this.variantIds = Object.keys(this.tableDataMap);
                    this.tableDataLn = this.variantIds.length;
                }

                try {
                    const pageNumber = this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1;
                    const pageSize = this.table.bootstrapTable("getOptions").pageSize;
                    const startVariant = pageNumber * pageSize - pageSize;
                    const endVariant = pageNumber * pageSize;
                    const variantResponse = await this.getVariantInfo(this.sampleIds, startVariant, endVariant);
                    this.tableData = this.updateTableData(this.tableDataMap, variantResponse.getResults());
                    params.success({
                        total: this.tableDataLn,
                        rows: this.tableData.slice(startVariant, endVariant)
                    });
                } catch (e) {
                    console.error(e);
                    params.error(e);
                }
            },
            onClickRow: (row, selectedElement, field) => {
            },
            onLoadSuccess: data => {
                // this is not triggered in case of static data
            },
            onLoadError: (e, restResponse) => this.gridCommons.onLoadError(e, restResponse),
            onPostBody: () => UtilsNew.initTooltip(this),
            onPageChange: (number, size) => {
                console.error("page change", number, size);
            }
        });
    }

    geneFormatter(value, row) {
        return value.length ? (value.length > 20 ? `${value.length} genes` : value.map(gene => gene.name)) : "-";
    }

    _initTableColumns() {
        return [
            [
                {
                    title: "id",
                    field: "id",
                    rowspan: 2,
                    formatter: (value, row, index) => row.chromosome ? VariantGridFormatter.variantFormatter(value, row, index, this.opencgaSession.project.organism.assembly) : value
                },
                {
                    title: "Gene",
                    field: "geneName",
                    rowspan: 2
                    // formatter: this.geneFormatter
                },
                {
                    title: "Knockout Type",
                    field: "knockoutType",
                    rowspan: 2
                    /* formatter: row => {
                        this.table.bootstrapTable("updateRow", {index: 1, row: {id: "123"}});
                    }*/
                },
                {
                    title: "Proband<br>" + this.sampleIds[0],
                    field: "",
                    colspan: 2
                },
                {
                    title: "Mother<br>" + this.sampleIds[1],
                    field: "id",
                    colspan: 2
                },
                {
                    title: "Father<br>" + this.sampleIds[2],
                    field: "",
                    colspan: 2
                }
            ],
            [
                {
                    title: "GT",
                    field: "variantData",
                    formatter: value => this.gtFormatter(value, 0)
                },
                {
                    title: "Filter",
                    field: "filter",
                    formatter: filters => {
                        if (filters) {
                            return filters.split(/[,;]/).map(filter => `<span class="badge">${filter}</span>`).join("");
                        }
                    }
                },
                {
                    title: "GT",
                    field: "variantData",
                    formatter: value => this.gtFormatter(value, 1)
                },
                {
                    title: "Filter",
                    field: "filter",
                    formatter: filters => {
                        if (filters) {
                            return filters.split(/[,;]/).map(filter => `<span class="badge">${filter}</span>`).join("");
                        }
                    }
                },
                {
                    title: "GT",
                    field: "variantData",
                    formatter: value => this.gtFormatter(value, 2)
                },
                {
                    title: "Filter",
                    field: "filter",
                    formatter: filters => {
                        if (filters) {
                            return filters.split(/[,;]/).map(filter => `<span class="badge">${filter}</span>`).join("");
                        }
                    }
                }
            ]
        ];
    }

    gtFormatter(value, sampleIndex) {
        if (value?.studies?.[0]?.sampleDataKeys.length) {
            const gtIndex = value.studies[0].sampleDataKeys.indexOf("GT");
            // console.log("gtIndex", gtIndex)
            if (~gtIndex) {
                // console.log("gtIndex", gtIndex)
                // console.log("sampleGT", value.studies[0].samples[sampleIndex])
                return value.studies[0].samples?.[sampleIndex].data[gtIndex];
            }
        }
    }

    getDefaultConfig() {
        return {
            title: "Individual"

        };
    }

    render() {
        if (this.wip) {
            return html`<div class="alert alert-warning"><i class="fas fa-3x fa-info-circle align-middle"></i> WIP </div>`;
        }
        return html`
            
            <div class="row">
                <table id="${this.gridId}"></table>
            </div>
        `;
    }

}

customElements.define("rga-individual-family", RgaIndividualFamily);
