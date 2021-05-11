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


export default class RgaVariantAllelePairs extends LitElement {

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
        this.gridId = this._prefix + "KnockoutVAPGrid";

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
        console.log("prepareData", this.variant);
        /*const uniqueVariants = {};
        for (const individual of this.variant.individuals) {
            for (const gene of individual.genes) {
                for (const transcript of gene.transcripts) {
                    for (const variant of transcript.variants) {
                        uniqueVariants[variant.id] = {
                            ...variant,
                            geneName: gene.name
                        };
                        // the following loop collects all the consequence types found for the variant
                        if (variant?.sequenceOntologyTerms?.length) {
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
            }
        }*/
        this.tableData = this.variant?.allelePairs;

/*
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

        */
    }

    renderTable() {
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            //data: this.tableData,
            columns: this._initTableColumns(),
            sidePagination: "local",
            uniqueId: "id",
            pageSize: this._config.pageSize,
            pageList: this._config.pageList,
            pagination: this._config.pagination,
            paginationVAlign: "both",
            // formatShowingRows: this.gridCommons.formatShowingRows,
            gridContext: this,
            formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
            ajax: async params => {
                const allelePairs = this.variant?.allelePairs;
                try {
                    if (allelePairs?.length) {
                        const variantIds = allelePairs.map(variant => variant.id);
                        const _filters = {
                            study: this.opencgaSession.study.fqn,
                            limit: 10,
                            skip: params.data.offset || 0,
                            count: false, //TODO temp to avoid nullpointerexpection
                            //count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                            variants: variantIds.join(",")
                        };
                        const rgaVariantResponse = await this.opencgaSession.opencgaClient.clinical().summaryRgaVariant(_filters);
                        // merging RGA Summary Variant data and RGA Variant data
                        for (const v of rgaVariantResponse.getResults()) {
                            const i = allelePairs.findIndex(variant => variant.id === v.id);
                            allelePairs[i] = {...allelePairs[i], attributes: v};
                        }
                        params.success({
                            total: allelePairs.length,
                            rows: allelePairs
                        });

                    } else {
                        params.success({
                            total: allelePairs.length,
                            rows: allelePairs
                        });
                    }
                } catch (e) {
                    console.error(e);
                    params.error(e);
                }
            },
            onClickRow: (row, selectedElement, field) => {
                console.log(row);
            },
            onLoadSuccess: data => {
                // this is not triggered in case of static data
            },
            onLoadError: (e, restResponse) => this.gridCommons.onLoadError(e, restResponse),
            onPostBody: data => UtilsNew.initTooltip(this)
        });
    }

    _initTableColumns() {
        return [
            {
                title: "Allele",
                field: "id",
                formatter: (value, row, index) => row.chromosome ? VariantGridFormatter.variantFormatter(value, row, index, this.opencgaSession.project.organism.assembly) : value
            },
            {
                title: "Pair type",
                field: "knockoutType"
            },
            {
                title: "Type",
                field: "type"
            },
            {
                title: "Alternate allele frequency",
                field: "populationFrequencies.populationFrequencies",
                formatter: (value, row) => {
                    return this.clinicalPopulationFrequenciesFormatter(value, row);
                }
            },
            {
                title: "Consequence Type",
                field: "attributes.sequenceOntologyTerms",
                formatter: value => {
                    if (value) {
                        return Object.values(value).map(ct => `<span>${ct.name} (${ct.accession})</span>`).join(", ");
                    }
                }
            },
            {
                title: "Clinical Significance",
                field: "attributes.clinicalSignificances",
                formatter: value => value?.join(", ") ?? "-"
            }
            /* {
                // this value is not available
                title: "Num. Individuals",
                field: "numIndividuals"
            }*/
        ];
    }

    clinicalPopulationFrequenciesFormatter(value, row) {
        if (row.attributes) {
            const popFreqMap = new Map();
            // console.log("row.populationFrequencies", row.populationFrequencies);
            if (row?.attributes?.populationFrequencies?.length > 0) {
                for (const popFreq of row.attributes.populationFrequencies) {
                    popFreqMap.set(popFreq.study + ":" + popFreq.population, Number(popFreq.altAlleleFreq).toFixed(4));
                }
            }
            return VariantGridFormatter.createPopulationFrequenciesTable(this._config.populationFrequencies, popFreqMap, populationFrequencies.style);
        } else {
            return "-";
        }
    }

    /**
     * @deprecated
     */
    consequenceTypeFormatter(value, row) {
        if (row?.attributes?.individuals) {
            const uniqueCT = {};
            for (const individual of row.attributes.individuals) {
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
            return Object.values(uniqueCT).map(ct => `${ct.name} (${ct.accession})`).join(", ");
        }

    }

    getDefaultConfig() {
        return {
            title: "Allele Pairs",
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
            ]
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

customElements.define("rga-variant-allele-pairs", RgaVariantAllelePairs);
