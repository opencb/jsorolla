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
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
        this._config = this.getDefaultConfig();
        this.gridId = this._prefix + "KnockoutIndividualFamGrid";
        this.individual = null;

    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
        }

        if (changedProperties.has("individual")) {
            this.prepareData();
            this.renderTable();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    // TODO continue
    async prepareData() {
        if (this.individual) {
            // TODO all genes but first transcript taken into account
            const variants = this.individual.genes.flatMap(gene => gene.transcripts[0].variants);

            try {
                /* const familyIds = [this.individual.motherId, this.individual.fatherId].filter(Boolean);
                console.log("familyIds", familyIds)
                console.log(variants[0])
                const i_params = {
                    study: this.opencgaSession.study.fqn,
                    id: familyIds.join(","),
                    include: "id,samples"
                };
                let individualResponse = await this.opencgaSession.opencgaClient.individuals().search(i_params);
                console.log("individuals", individualResponse.getResults())
                if (individualResponse.getResults().length) {
                    const individuals = individualResponse.getResults();
                    const v_params = {
                        study: this.opencgaSession.study.fqn,
                        includeSample: individuals.map(individual => individual.samples[0].id).join(","),
                        // TODO include regions?
                        summary: true
                    };
                    let variantResponse = await this.opencgaSession.opencgaClient.variants().query(v_params);
                    console.log("variantResponse", variantResponse)
                    */

                this.tableData = variants;
            } catch (e) {
            }
        }

    }

    getVariantInfo(individualIds, variantId) {
        const _filters = {
            study: this.opencgaSession.study.fqn,
            includeIndividual: individualIds
        };
        this.opencgaSession.opencgaClient.clinical().queryRgaVariant(_filters)
            .then(restResponse => {
                console.log("restResponse", restResponse);

            })
            .catch(e => {
                console.error(e);
                // params.error(e);
            });
    }

    renderTable() {
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            data: this.tableData,
            columns: this._initTableColumns(),
            sidePagination: "local",
            uniqueId: "id",
            pagination: true,
            // pageSize: this._config.pageSize,
            // pageList: this._config.pageList,
            paginationVAlign: "both",
            // formatShowingRows: this.gridCommons.formatShowingRows,
            gridContext: this,
            formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
            onClickRow: (row, selectedElement, field) => {
            },
            onLoadSuccess: data => {
                // this is not triggered in case of static data
            },
            onLoadError: (e, restResponse) => this.gridCommons.onLoadError(e, restResponse),
            onPostBody: data => {
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
                    field: "genes",
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
                    title: "Proband",
                    field: "",
                    colspan: 2
                },
                {
                    title: "Mother",
                    field: "",
                    colspan: 2
                },
                {
                    title: "Father",
                    field: "",
                    colspan: 2
                }
            ],
            [
                {
                    title: "GT",
                    field: "gt"
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
                    field: "gt"
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
                    field: "gt"
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

    getDefaultConfig() {
        return {
            title: "Individual"

        };
    }

    render() {
        return html`   
            <div class="row">
                <table id="${this.gridId}"></table>
            </div>
            `;
    }

}

customElements.define("rga-individual-family", RgaIndividualFamily);
