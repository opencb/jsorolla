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
import CatalogGridFormatter from "../../commons/catalog-grid-formatter.js";
import GridCommons from "../../commons/grid-commons.js";


export default class RgaVariantIndividualGrid extends LitElement {

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
            variant: {
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
        this.gridId = this._prefix + "VIGrid";

    }

    connectedCallback() {
        super.connectedCallback();
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
        }

        if (changedProperties.has("variant")) {
            this.prepareData();
            this.renderTable();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    prepareData() {
        if (this.variant?.individuals?.length) {
            this.tableDataLn = this.variant.individuals.length;
            this.individualIds = this.variant.individuals.map(individual => individual.id);
            this.hiddenIndividuals = this.variant.numIndividuals - this.variant.individuals.length;
            this.tableDataMap = {};
            for (const individual of this.variant.individuals) {
                this.tableDataMap[individual.id] = individual;
            }
        } else {
            this.tableDataLn = 0;
            this.individualIds = [];
            this.hiddenIndividuals = this.variant.numIndividuals;
            this.tableDataMap = {};
        }
        this.requestUpdate();
    }

    renderTable() {
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            // data: this.variant.individuals,
            columns: this._initTableColumns(),
            sidePagination: "server",
            uniqueId: "id",
            pagination: true,
            paginationVAlign: "both",
            // formatShowingRows: this.gridCommons.formatShowingRows,
            gridContext: this,
            formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
            ajax: async params => {
                try {
                    const pageNumber = this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1;
                    const pageSize = this.table.bootstrapTable("getOptions").pageSize;
                    const startIndividual = pageNumber * pageSize - pageSize;
                    const endIndividual = pageNumber * pageSize;
                    if (this.individualIds.length) {
                        const clinicalResponse = await this.getClinicalInfo(this.individualIds, startIndividual, endIndividual);
                        this.tableData = this.updateTableData(this.tableDataMap, clinicalResponse.getResults());
                    } else {
                        this.tableData = [];
                    }
                    params.success({
                        total: this.tableDataLn,
                        rows: this.tableData.slice(startIndividual, endIndividual)
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
            onPostBody: data => {
            }

        });
    }

    /**
     * Get clinical info only for the subset of individual defined by startVariant and endVariant indexes.
     */
    async getClinicalInfo(individualIds, startIndividual, endIndividual) {
        try {
            const slicedIndividuals = this.variant.individuals.slice(startIndividual, endIndividual);
            if (slicedIndividuals.length && individualIds.length) {
                return this.opencgaSession.opencgaClient.clinical().search(
                    {
                        individual: individualIds,
                        study: this.opencgaSession.study.fqn,
                        include: "id,proband.id"
                    });
            } else {
                console.error("params error");
                return []
            }
        } catch (e) {
            console.error(e);
            UtilsNew.notifyError(e);
        }

    }

    /**
     * Update tableDataMap (containing all the individuals) with the clinical info just fetched.
     */
    updateTableData(tableDataMap, clinicalData) {
        const _tableDataMap = tableDataMap;
        clinicalData.forEach(clinicalAnalysis => {
            if (_tableDataMap[clinicalAnalysis.proband.id]?.attributes?.OPENCGA_CLINICAL_ANALYSIS) {
                _tableDataMap[clinicalAnalysis.proband.id].attributes.OPENCGA_CLINICAL_ANALYSIS.push(clinicalAnalysis);
            } else {
                _tableDataMap[clinicalAnalysis.proband.id].attributes = {
                    OPENCGA_CLINICAL_ANALYSIS: [clinicalAnalysis]
                };
            }
        });
        return Object.values(_tableDataMap);
    }

    // TODO only the first transcript is taken into account
    _initTableColumns() {
        return [
            {
                title: "Individual Id",
                field: "id"
            },
            {
                title: "Sample",
                field: "sampleId"
            },
            {
                title: "knockoutType",
                field: "_",
                formatter: (_, row) => row.genes[0].transcripts[0].variants.find(variant => variant.id === this.variant.id)?.knockoutType
            },
            {
                title: "Type",
                field: "_",
                formatter: (_, row) => row.genes[0].transcripts[0].variants.find(variant => variant.id === this.variant.id)?.type
            },
            {
                title: "GT",
                field: "_",
                formatter: (_, row) => row.genes[0].transcripts[0].variants.find(variant => variant.id === this.variant.id)?.genotype
            },
            {
                title: "Filter",
                field: "_",
                formatter: (_, row) => {
                    const filters = row.genes[0].transcripts[0].variants.find(variant => variant.id === this.variant.id)?.filter;
                    if (filters) {
                        return filters.split(/[,;]/).map(filter => `<span class="badge">${filter}</span>`).join("");
                    }
                }
            },
            {
                title: "Qual",
                field: "_",
                formatter: (_, row) => row.genes[0].transcripts[0].variants.find(variant => variant.id === this.variant.id)?.qual
            },
            {
                title: "Case ID",
                field: "attributes.OPENCGA_CLINICAL_ANALYSIS",
                // rowspan: 2, //TODO misconfiguration here silently fails. Open a gh issue in their repo
                formatter: (value, row) => CatalogGridFormatter.caseFormatter(value, row, row.id, this.opencgaSession)
            }
        ];
    }

    getVariantInfo(row) {
        // TODO
    }

    getDefaultConfig() {
        return {
            title: "Individual"

        };
    }

    render() {
        return html`
            <h3 class="break-word">Individual presenting ${this.variant?.id}</h3>

            ${this.hiddenIndividuals > 0 ? html`
                <div class="alert alert-warning"><i class="fas fa-3x fa-exclamation-circle align-middle"></i>  ${this.hiddenIndividuals} individual${this.hiddenIndividuals > 1 ? "s are" : " is"} hidden due to your permission settings.</div>
            ` : null}
            <div class="row">
                <table id="${this.gridId}"></table>
            </div>
            `;
    }

}

customElements.define("rga-variant-individual-grid", RgaVariantIndividualGrid);
