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
import GridCommons from "../../commons/grid-commons.js";
import VariantGridFormatter from "../../variant/variant-grid-formatter.js";


/**
 * @deprecated
 */
export default class RgaIndividualVariants extends LitElement {

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
            individual: {
                type: Object
            },
            individualId: {
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
        this.gridId = this._prefix + "KnockoutIndividualGrid";
        this.individual = null;
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
    }


    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
        }

        if (changedProperties.has("individual")) {
            this.prepareData();
            this.renderTableLocale();
        }

        if ((changedProperties.has("query") || changedProperties.has("individualId") || changedProperties.has("active")) && this.active) {
            this.renderTable();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    renderTable() {
        this._query = {
            ...this.query,
            individualId: this.individualId,
            includeIndividual: this.individualId,
        }; // we want to support a query obj param both with or without study.
        // Checks if the component is not visible or the query hasn't changed
        if (!this.active || UtilsNew.objectCompare(this._query, this.prevQuery)) {
            // console.warn("query suppressed")
            return;
        }
        this.prevQuery = {...this._query};

        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            // url: opencgaHostUrl,
            columns: this._initTableColumns(),
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
                    limit: params.data.limit,
                    skip: params.data.offset || 0,
                    count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                    include: "individuals.genes.transcripts.variants,individuals.genes.name",
                    ...this._query
                };
                this.opencgaSession.opencgaClient.clinical().queryRgaVariant(_filters)
                    .then(res => {
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
                this.gridCommons.onClickRow(row.id, row, selectedElement);
            },
            onCheck: (row, $element) => this.gridCommons.onCheck(row.id, row),
            onLoadSuccess: data => this.gridCommons.onLoadSuccess(data, 1),
            onLoadError: (e, restResponse) => this.gridCommons.onLoadError(e, restResponse)
        });

    }

    /**
     * @deprecated
     * useful in case rga-individual-grid uses /analysis/clinical/rga/individual/query
     */
    prepareData() {
        /**
         * iterates over all the genes, all the transcripts, all the variants and builds a `uniqueVariants` map.
         * It also collects all the Consequence Types
         */
        if (this.individual) {
            const uniqueVariants = {};
            for (const gene of this.individual.genes) {
                for (const transcript of gene.transcripts) {
                    for (const variant of transcript.variants) {
                        uniqueVariants[variant.id] = {
                            ...variant,
                            geneName: gene.name
                        };
                        // the following loop collects all the consequence types found for the variant
                        for (const ct of variant.sequenceOntologyTerms) {
                            if (uniqueVariants[variant.id].aggregatedSequenceOntologyTerms) {
                                uniqueVariants[variant.id].aggregatedSequenceOntologyTerms[ct.accession] = ct;
                            } else {
                                uniqueVariants[variant.id].aggregatedSequenceOntologyTerms = {[ct.accession]: ct};
                            }
                        }
                    }
                }
            }
            this.tableData = Object.values(uniqueVariants);
        }

    }

    /**
     * @deprecated
     * useful in case rga-individual-grid uses /analysis/clinical/rga/individual/query
     */
    renderTableLocale() {
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
            onPostBody: () => UtilsNew.initTooltip(this)
        });
    }

    _initTableColumns() {
        return [
            {
                title: "Id",
                field: "id",
                formatter: (value, row, index) => row.chromosome ? VariantGridFormatter.variantFormatter(value, row, index, this.opencgaSession.project.organism.assembly) : value
            },
            {
                title: "Gene",
                field: "geneName",
                formatter: (value, row) => this.geneFormatter(value, row)
            },
            {
                title: "Alternate allele frequency",
                field: "populationFrequencies",
                formatter: (value, row) => this.clinicalPopulationFrequenciesFormatter(value, row)
            },
            {
                title: "Type",
                field: "type"
            },
            {
                title: "Consequence type",
                field: "individuals",
                formatter: (value, row) => this.consequenceTypeFormatter(value, row)
            },
            {
                title: "Knockout Type",
                field: "individuals",
                formatter: (value, row) => this.uniqueFieldFormatter(value, row, "knockoutType")
            },
            {
                title: "GT",
                field: "genotype",
                formatter: (value, row) => this.uniqueFieldFormatter(value, row, "genotype")
            },
            {
                title: "Filter",
                field: "filter",
                formatter: (value, row) => this.filterFormatter(value, row)

            }
        ];
    }

    geneFormatter(value, row) {
        const uniqueValues = new Set();
        for (const individual of row.individuals) {
            for (const gene of individual.genes) {
                uniqueValues.add(gene.name);
            }
        }
        return uniqueValues.size ? Array.from(uniqueValues.keys()).join(", ") : "-";
    }

    uniqueFieldFormatter(value, row, field) {
        const uniqueValues = new Set();
        for (const individual of row.individuals) {
            for (const gene of individual.genes) {
                for (const transcript of gene.transcripts) {
                    for (const variant of transcript.variants) {
                        if (row.id === variant.id) {
                            if (variant[field]) {
                                uniqueValues.add(variant[field]);
                            }
                        }
                    }
                }
            }
        }
        return uniqueValues.size ? Array.from(uniqueValues.keys()).join(", ") : "-";
    }

    filterFormatter(value, row) {
        const uniqueValues = new Set();
        for (const individual of row.individuals) {
            for (const gene of individual.genes) {
                for (const transcript of gene.transcripts) {
                    for (const variant of transcript.variants) {
                        if (row.id === variant.id) {
                            if (variant.filter) {
                                variant.filter.split(";").forEach(filter => uniqueValues.add(filter));
                            }
                        }
                    }
                }
            }
        }
        return uniqueValues.size ? Array.from(uniqueValues.keys()).map(term => `<span class="badge">${term}</span>`).join("") : "-";
    }

    clinicalPopulationFrequenciesFormatter(value, row) {
        if (row) {
            const popFreqMap = new Map();
            if (row?.populationFrequencies?.length > 0) {
                for (const popFreq of row.populationFrequencies) {
                    popFreqMap.set(popFreq.study + ":" + popFreq.population, Number(popFreq.altAlleleFreq).toFixed(4));
                }
            }
            return VariantGridFormatter.createPopulationFrequenciesTable(this._config.populationFrequencies, popFreqMap, populationFrequencies.style);
        }
    }

    consequenceTypeFormatter(value, row) {
        const uniqueCT = {};
        for (const individual of row.individuals) {
            for (const gene of individual.genes) {
                for (const transcript of gene.transcripts) {
                    for (const variant of transcript.variants) {
                        if (row.id === variant.id && variant?.sequenceOntologyTerms?.length) {
                            for (const ct of variant.sequenceOntologyTerms) {
                                uniqueCT[ct.accession] = {
                                    ...ct
                                };
                            }
                        }
                    }
                }
            }
        }
        return Object.values(uniqueCT).length ? Object.values(uniqueCT).map(ct => `<span>${ct.name} (${ct.accession})</span>`).join(", ") : "-";
    }

    getDefaultConfig() {
        return {
            title: "Individual",
            pagination: true,
            pageSize: 10,
            pageList: [10, 25, 50],
            populationFrequencies: [
                "GNOMAD_EXOMES:ALL",
                "GNOMAD_GENOMES:ALL",
                "ESP6500:ALL",
                "GONL:ALL",
                "EXAC:ALL",
                "1kG_phase3:ALL",
                "MGP:ALL",
                "DISCOVER:ALL",
                "UK10K:ALL"
            ],
            consequenceType: {
                gencodeBasic: true,
                filterByBiotype: true,
                filterByConsequenceType: true,
                canonicalTranscript: false,
                highQualityTranscripts: false,
                proteinCodingTranscripts: false,
                worstConsequenceTypes: true,
                showNegativeConsequenceTypes: true
            }
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

customElements.define("rga-individual-variants", RgaIndividualVariants);
