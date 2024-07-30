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
import "./../../commons/view/detail-tabs.js";
import CatalogGridFormatter from "../../commons/catalog-grid-formatter.js";
import GridCommons from "../../commons/grid-commons.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";

export default class RgaVariantIndividual extends LitElement {

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
        /* if (changedProperties.has("opencgaSession")) {
        }*/

        if (changedProperties.has("variant") || changedProperties.has("query")) {
            // this.prepareData();
            this.renderTable();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    /*
     *  generates tableDataMap, a map of all individuals (not paginated).
     *  The map will be used merging Individuals and Clinical data.
     *  @deprecated
     */
    /* prepareData() {
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
    }*/

    async renderTable() {
        this.hiddenIndividuals = 0;
        await this.requestUpdate();
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            theadClasses: "table-light",
            buttonsClass: "light",
            // data: this.variant.individuals,
            columns: this._initTableColumns(),
            sidePagination: "server",
            iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
            icons: GridCommons.GRID_ICONS,
            uniqueId: "id",
            pagination: true,
            paginationVAlign: "both",
            formatShowingRows: (pageFrom, pageTo, totalRows) => this.formatShowingRows(pageFrom, pageTo, totalRows),
            loadingTemplate: () => GridCommons.loadingFormatter(),
            ajax: async params => {
                try {
                    const _filters = {
                        study: this.opencgaSession.study.fqn,
                        limit: params.data.limit,
                        skip: params.data.offset || 0,
                        count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                        // include: "genes,sampleId,phenotypes,disorders,motherId,motherSampleId,fatherId,fatherSampleId",
                        variants: this.variant.id,
                        ...this.query
                    };

                    this.opencgaSession.opencgaClient.clinical().queryRgaIndividual(_filters)
                        .then(rgaIndividualResponse => {
                            this.isApproximateCount = rgaIndividualResponse.getResultEvents("WARNING")?.find(event => event?.message?.includes("numMatches value is approximated"));

                            const individualIds = rgaIndividualResponse.getResults().map(individual => individual.id).filter(Boolean).join(",");
                            this.opencgaSession.opencgaClient.clinical().search(
                                {
                                    individual: individualIds,
                                    study: this.opencgaSession.study.fqn,
                                    include: "id,proband.id,family.members"
                                })
                                .then(caseResponse => {
                                    // NOTE we don't convert individuals nor clinical data in map first.
                                    rgaIndividualResponse.getResults().forEach(individual => {
                                        for (const clinicalAnalysis of caseResponse.getResults()) {
                                            if (clinicalAnalysis.family.members.find(member => member.id === individual.id)) {
                                                if (individual?.attributes?.OPENCGA_CLINICAL_ANALYSIS) {
                                                    individual.attributes.OPENCGA_CLINICAL_ANALYSIS.push(clinicalAnalysis);
                                                } else {
                                                    individual.attributes = {
                                                        OPENCGA_CLINICAL_ANALYSIS: [clinicalAnalysis]
                                                    };
                                                }
                                            }
                                        }
                                    });
                                    params.success(rgaIndividualResponse);
                                })
                                .catch(e => {
                                    console.error(e);
                                    params.error(e);
                                });
                        })
                        .catch(e => {
                            console.error(e);
                            params.error(e);
                        });

                } catch (e) {
                    console.error(e);
                }
            },
            responseHandler: response => {
                const result = this.gridCommons.responseHandler(response, $(this.table).bootstrapTable("getOptions"));
                this.hiddenIndividuals = this.variant.individualStats.count - result.response.total;
                this.requestUpdate();
                return result.response;
            },
            onClickRow: row => {
                console.log(row);
            },
            onLoadSuccess: () => {
                // this is not triggered in case of static data
            },
            onLoadError: (e, restResponse) => this.gridCommons.onLoadError(e, restResponse),
            onPostBody: data => {
                this.gridCommons.onLoadSuccess({rows: data, total: data.length});
            }

        });
    }

    // TODO move this into utils class
    formatShowingRows(pageFrom, pageTo, totalRows) {
        const pagedFromFormatted = Number(pageFrom).toLocaleString();
        const pagedToFormatted = Number(pageTo).toLocaleString();
        let res = `Showing <b>${pagedFromFormatted}</b> to <b>${pagedToFormatted}</b> of <b>${Number(totalRows).toLocaleString()}</b> records `;
        let tooltip = "";
        if (this.isApproximateCount) {
            tooltip += "The total count is approximate. ";
            const round = Math.pow(10, totalRows.toString().length - 2);
            res = `Showing <b>${pagedFromFormatted}</b> to <b>${pagedToFormatted}</b> of <b>~${Number((Math.round(totalRows/round))*round).toLocaleString()}</b> records `;
        }
        if (this.hiddenIndividuals) {
            tooltip += (this.isApproximateCount ? "<br>" : "") + `${this.hiddenIndividuals} individual${this.hiddenIndividuals > 1 ? "s are" : " is"} hidden due to your permission settings.`;
        }
        if (tooltip) {
            res += ` <a tooltip-title="Warning" tooltip-text='${tooltip}'> <i class="fas fa-exclamation-circle text-muted"></i></a>`;
        }
        return res;
    }

    /*
     * @deprecated
     */
    /* renderTableLocale() {
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
    }*/

    /*
     * Get clinical info only for the subset of individual defined by startIndividual and endIndividual indexes.
     * NOTE we search for proband and other members as well
     */
    async getClinicalInfo(individualIds, startIndividual, endIndividual) {
        try {
            const slicedIndividuals = this.variant.individuals.slice(startIndividual, endIndividual);
            if (slicedIndividuals.length && individualIds.length) {
                return this.opencgaSession.opencgaClient.clinical().search(
                    {
                        individual: individualIds,
                        study: this.opencgaSession.study.fqn,
                        include: "id,proband.id,family.members"
                    });
            } else {
                console.error("params error");
                return [];
            }
        } catch (e) {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, e);
            return Promise.reject(e);
        }

    }

    /*
     * Update tableDataMap (containing all the individuals) with the clinical info just fetched.
     * @deprecated

    updateTableData(tableDataMap, clinicalData) {
        const _tableDataMap = tableDataMap;
        for (const individualId in _tableDataMap) {
            const individual = _tableDataMap[individualId];
            for (const clinicalAnalysis of clinicalData) {
                if (clinicalAnalysis.family.members.find(member => member.id === individualId)) {
                    if (individual?.attributes?.OPENCGA_CLINICAL_ANALYSIS) {
                        individual.attributes.OPENCGA_CLINICAL_ANALYSIS.push(clinicalAnalysis);
                    } else {
                        individual.attributes = {
                            OPENCGA_CLINICAL_ANALYSIS: [clinicalAnalysis]
                        };
                    }
                }
            }
        }
        return Object.values(_tableDataMap);
    }*/

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
                formatter: (_, row) => this.uniqueFieldFormatter(_, row, "knockoutType")
            },
            {
                title: "Type",
                field: "_",
                formatter: (_, row) => this.uniqueFieldFormatter(_, row, "type")
            },
            {
                title: "GT",
                field: "_",
                formatter: (_, row) => this.uniqueFieldFormatter(_, row, "genotype")
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
                title: "Phenotypes",
                field: "phenotypes",
                formatter: CatalogGridFormatter.phenotypesFormatter
            },
            {
                title: "Disorders",
                field: "disorders",
                formatter: disorders => disorders?.length ? disorders.map(CatalogGridFormatter.disorderFormatter) : "-"

            },
            {
                title: "Case ID",
                field: "attributes.OPENCGA_CLINICAL_ANALYSIS",
                // rowspan: 2, //TODO misconfiguration here silently fails. Open a gh issue in their repo
                formatter: (value, row) => CatalogGridFormatter.caseFormatter(value, row, row.id, this.opencgaSession)
            }
        ];
    }

    uniqueFieldFormatter(value, row, field) {
        const uniqueValues = new Set();
        for (const gene of row.genes) {
            for (const transcript of gene.transcripts) {
                for (const variant of transcript.variants) {
                    if (this.variant.id === variant.id) {
                        if (variant[field]) {
                            uniqueValues.add(variant[field]);
                        }
                    }
                }
            }
        }
        return uniqueValues.size ? Array.from(uniqueValues.keys()).join(", ") : "-";
    }

    getDefaultConfig() {
        return {
            title: "Individual"

        };
    }

    render() {
        return html`
            <h3 class="text-break">Individual presenting ${this.variant.id}</h3>
            ${this.hiddenIndividuals > 0 ? html`
                <div class="alert alert-warning"><i class="fas fa-3x fa-exclamation-circle align-middle"></i>
                    ${this.hiddenIndividuals} individual${this.hiddenIndividuals > 1 ? "s are" : " is"} hidden due to your permission settings.
                </div>
            ` : null}
            <div class="row">
                <table id="${this.gridId}"></table>
            </div>
        `;
    }

}

customElements.define("rga-variant-individual", RgaVariantIndividual);
