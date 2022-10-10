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

import {LitElement, html} from "lit";
import UtilsNew from "../../../core/utilsNew.js";
import "./../../commons/view/detail-tabs.js";
import GridCommons from "../../commons/grid-commons.js";
import VariantGridFormatter from "../../variant/variant-grid-formatter.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";
import CatalogGridFormatter from "../../commons/catalog-grid-formatter";

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
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        /* if (changedProperties.has("opencgaSession")) {
        }*/

        if (changedProperties.has("variant")) {
            this.prepareData();
            this.renderTable();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    prepareData() {
        this.allelePairs = [];
        this.variantIds = [];
        this.variant.allelePairs.forEach((v, i) => {
            // filtering out the current selected variant in case it is CH
            if (!(v.knockoutType === "COMP_HET" && v.id === this.variant.id)) {
                if (v.knockoutType === "DELETION_OVERLAP") {
                    v.knockoutType = "COMP_HET";
                }
                this.allelePairs.push({
                    _id: i + "__" + v.id,
                    ...v
                });
                this.variantIds.push(v.id);
            }
        });

        /* const uniqueVariants = {};
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
            // data: this.tableData,
            columns: this._initTableColumns(),
            sidePagination: "server",
            iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
            icons: GridCommons.GRID_ICONS,
            uniqueId: "_id",
            pageSize: this._config.pageSize,
            pageList: this._config.pageList,
            pagination: this._config.pagination,
            paginationVAlign: "both",
            // formatShowingRows: this.gridCommons.formatShowingRows,
            gridContext: this,
            detailView: true,
            detailFormatter: (_, row) => `<h3>Individuals</h3><table class='variant-allele-pairs-individuals-table' data-index="${row._id}"></table>`,
            formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
            ajax: async params => {
                try {
                    const pageNumber = this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1;
                    const pageSize = this.table.bootstrapTable("getOptions").pageSize;
                    const startVariant = pageNumber * pageSize - pageSize;
                    const endVariant = pageNumber * pageSize;
                    if (this.allelePairs.length > 0) {
                        const variantResponse = await this.getVariantInfo(this.variantIds, startVariant, endVariant);
                        this.tableData = this.updateTableData(this.allelePairs, variantResponse.getResults());
                    } else {
                        this.tableData = [];
                    }
                    params.success({
                        total: this.allelePairs.length,
                        rows: this.tableData.slice(startVariant, endVariant)
                    });
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
            onPostBody: data => UtilsNew.initTooltip(this),
            onExpandRow: (index, row, $detail) => {
                this._initDetailTable(row);
                UtilsNew.initTooltip(this);
            }
        });
    }

    /*
     * Get variant info only for the subset of variant defined by startVariant and endVariant indexes.
     */
    async getVariantInfo(variantIds, startVariant, endVariant) {
        try {
            const slicedVariant = this.variantIds.slice(startVariant, endVariant);
            const _filters = {
                study: this.opencgaSession.study.fqn,
                count: false,
                variants: slicedVariant.join(",")
            };
            if (slicedVariant.length && variantIds.length) {
                return this.opencgaSession.opencgaClient.clinical().summaryRgaVariant(_filters);
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
     * Update variantData (containing all the variants from variant/summary in Variant View) with variant info just fetched (a list of paginated variants, still from variant/summary).
     * Double loop is necessary as variantData can contain more than 1 variant with the same id
     */
    updateTableData(variantData, variantAttributeData) {
        const _variantData = [...variantData];
        for (const variantAttrs of variantAttributeData) {
            for (const variant of variantData) {
                if (variant.id === variantAttrs.id) {
                    variant.attributes = variantAttrs;
                }
            }
        }
        return _variantData;
    }


    _initTableColumns() {
        return [
            {
                title: "Allele Pairs",
                field: "allele_pairs",
                formatter: (_, row, index) => `
                    ${VariantGridFormatter.variantFormatter(null, this.variant, null, this.opencgaSession.project.organism.assembly)}
                    ${row?.attributes && row.knockoutType !== "HOM_ALT" ?
                    `<hr>
                        ${VariantGridFormatter.variantFormatter(row.id, row, index, this.opencgaSession.project.organism.assembly)}
                    ` : ""}
                `
            },
            {
                title: "Pair type",
                field: "knockoutType"
            },
            {
                title: "dbSNP",
                field: "dbSNP",
                formatter: (_, row) => `
                    ${this.variant?.dbSnp ?? "-"}
                    ${row?.attributes && row.knockoutType !== "HOM_ALT" ?
                    `<hr>
                        ${row.attributes?.dbSnp ?? "-"}
                    ` : ""}
                `
            },
            {
                title: "Type",
                field: "types",
                formatter: (_, row) => `
                    ${this.variant.type}
                    ${row?.attributes && row.knockoutType !== "HOM_ALT" ?
                        `<hr>
                        ${row.type}
                    ` : ""}
                `
            },
            {
                title: "Alternate allele frequency",
                field: "populationFrequencies",
                formatter: (value, row) => `
                    ${this.clinicalPopulationFrequenciesFormatter(this.variant)}
                        ${row?.attributes && row.knockoutType !== "HOM_ALT" ?
                            `<hr>
                            ${this.clinicalPopulationFrequenciesFormatter(row)}
                        ` : ""}
                    `
            },
            {
                title: "Consequence Type",
                field: "sequenceOntologyTerms",
                formatter: (value, row) => `
                    ${this.consequenceTypeFormatter(this.variant.sequenceOntologyTerms)}
                        ${row?.attributes && row.knockoutType !== "HOM_ALT" ?
                            `<hr>
                            ${this.consequenceTypeFormatter(row.attributes.sequenceOntologyTerms)}
                        ` : ""}
                    `
            },
            {
                title: "Clinical Significance",
                field: "clinicalSignificances",
                formatter: (value, row) => {
                    const clinicalSignificances1 = this.variant.clinicalSignificances;
                    const clinicalSignificances2 = row?.attributes?.clinicalSignificances;
                    return `
                        ${clinicalSignificances1.length ? clinicalSignificances1.join(", ") : "-"}
                        ${row?.attributes && row.knockoutType !== "HOM_ALT" ?
                            `<hr>
                            ${clinicalSignificances1.length ? clinicalSignificances2.join(", ") : "-"}
                        ` : ""}
                    `;
                }
            },
            /* {
                // this value is not available
                title: "Num. Individuals",
                field: "numIndividuals"
            }*/
        ];
    }

    _initDetailTable(row) {
        $(`.variant-allele-pairs-individuals-table[data-index='${row._id}']`).bootstrapTable({
            pageSize: 5,
            formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
            columns: [
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
                        title: "Genotypes",
                        field: "",
                        halign: this._config.header.horizontalAlign,
                        colspan: 3
                    },
                    {
                        title: "Phenotypes",
                        field: "phenotypes",
                        formatter: CatalogGridFormatter.phenotypesFormatter,
                        rowspan: 2
                    },
                    {
                        title: "Disorders",
                        field: "disorders",
                        formatter: disorders => {
                            const result = disorders?.map(disorder => CatalogGridFormatter.disorderFormatter(disorder)).join("<br>");
                            return result ? result : "-";
                        },

                        rowspan: 2
                    },
                    {
                        title: "Case ID",
                        field: "attributes.OPENCGA_CLINICAL_ANALYSIS",
                        formatter: (value, row) => CatalogGridFormatter.caseFormatter(value, row, row.id, this.opencgaSession),
                        rowspan: 2
                    }
                ],
                [
                    {
                        title: "Proband",
                        field: "attributes.VARIANT",
                        halign: this._config.header.horizontalAlign,
                        class: "text-center",
                        formatter: (value, row) => {
                            return `<span> <b>${row.id}</b> ${row.sampleId ? `${(row.sampleId)}` : ""} <br>
                                ${value?.length ? value.map(sampleData => sampleData.GT[0]).join(" | ") : "-"}</span>`;
                        }
                    },
                    {
                        title: "Father",
                        field: "attributes.VARIANT",
                        halign: this._config.header.horizontalAlign,
                        class: "text-center",
                        formatter: (value, row) => {
                            return `<span> <b>${row.fatherId}</b> ${row.fatherSampleId ? `${(row.fatherSampleId)}` : ""} <br>
                                ${value?.length ? value.map(sampleData => sampleData.GT[1] ?? "N/A").join(" | ") : "-"}</span>`;
                        }
                    },
                    {
                        title: "Mother",
                        field: "attributes.VARIANT",
                        halign: this._config.header.horizontalAlign,
                        class: "text-center",
                        formatter: (value, row) => {
                            return `<span> <b>${row.motherId}</b> ${row.motherSampleId ? `${(row.motherSampleId)}` : ""} <br>
                                ${value?.length ? value.map(sampleData => sampleData.GT[2] ?? "N/A").join(" | ") : "-"}</span>`;
                        }
                    }
                ]
            ],
            ajax: async params => {
                // console.log("pair", this.variant.id, row.id)
                try {
                    // const rgaIndividualResponse = await this.opencgaSession.opencgaClient.clinical().queryRgaIndividual({
                    const rgaIndividualResponse = await this.opencgaSession.opencgaClient.clinical().summaryRgaIndividual({
                        study: this.opencgaSession.study.fqn,
                        variants: `${this.variant.id};${row.id}`,
                        knockoutType: row.knockoutType,
                        concurrent: true
                    });

                    // fetching Case Id of the individuals (paginated)
                    const individualIds = rgaIndividualResponse.getResults().map(individual => individual.id).filter(Boolean).join(",");

                    if (individualIds) {
                        const caseResponse = await this.opencgaSession.opencgaClient.clinical().search({
                            individual: individualIds,
                            study: this.opencgaSession.study.fqn,
                            include: "id,proband.id,family.members",
                            limit: 5,
                        });

                        // NOTE we don't convert individuals nor clinical data in map first.
                        const individuals = rgaIndividualResponse.getResults();
                        for (let i = 0; i < individuals.length; i++) {
                            const individual = individuals[i];
                            individual.attributes = {};
                            const missingFather = !individual.fatherSampleId;
                            const variantStore = await this.opencgaSession.opencgaClient.variants().query({
                                study: this.opencgaSession.study.fqn,
                                id: `${this.variant.id},${row.id}`,
                                includeSample: [individual.sampleId, individual.fatherSampleId, individual.motherSampleId].filter(Boolean),
                                includeGenotype: true,
                                exclude: "annotation",
                                concurrent: true
                            });

                            // adding sample variant data (GTs)
                            // first variant results should be = this.variant and second should be = row.id
                            const sampleData = variantStore.getResults().map((v, i) => {
                                if ((v.id === this.variant.id) || (v.id === row.id)) {
                                    const gtIndex = v.studies[0].sampleDataKeys.indexOf("GT"); // find the position of GT in sample array
                                    const gts = v.studies[0].samples.map(sampleData => sampleData.data[gtIndex]);
                                    return {
                                        GT: [gts[0], ...(missingFather ? [null, gts[1]] : [gts[1], gts[2]])],
                                    };
                                } else {
                                    console.error("Unexpected variant found");
                                }
                            });
                            individual.attributes = {
                                VARIANT: sampleData
                            };

                            // adding clinical Analysis to rgaIndividualResponse
                            for (const clinicalAnalysis of caseResponse.getResults()) {
                                if (clinicalAnalysis?.family?.members?.find(member => member.id === individual.id) || clinicalAnalysis.proband.id === individual.id) {
                                    if (individual?.attributes?.OPENCGA_CLINICAL_ANALYSIS) {
                                        individual.attributes.OPENCGA_CLINICAL_ANALYSIS.push(clinicalAnalysis);
                                    } else {
                                        individual.attributes = {
                                            ...individual.attributes,
                                            OPENCGA_CLINICAL_ANALYSIS: [clinicalAnalysis]
                                        };
                                    }
                                }
                            }
                        }
                        params.success(rgaIndividualResponse);
                    } else {
                        params.success(rgaIndividualResponse);
                    }

                } catch (e) {
                    console.error(e);
                    params.error(e);
                }
            },
            onClickRow: (row, selectedElement, field) => {
                console.log(row);
            },
            responseHandler: response => {
                const result = this.gridCommons.responseHandler(response, $(this.table).bootstrapTable("getOptions"));
                return result.response;
            },
            onLoadSuccess: data => {
                this.gridCommons.onLoadSuccess(data, 1);
            },
            onLoadError: (e, restResponse) => this.onLoadError(e, restResponse, row._id)
        });

    }

    uniqueFieldFormatter(row, field) {
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

    // ****
    // copy from gridCommons with rowId
    // ****
    // TODO remove side effects in context in gridCommons
    onLoadError(e, response, rowId) {

        // in some cases `response` is a string (in case the error state doesn't come from the server there is no restResponse instance, so we send a custom error msg)
        let msg = "Generic Error";
        if (response?.getEvents?.("ERROR")?.length) {
            msg = response.getEvents("ERROR").map(error => `${error.name}: ${error.message ?? ""}`).join("<br>");
        } else if (response instanceof Error) {
            msg = `<h2>${response.name}</h2><br>${response.message ?? ""}`;
        } else if (response instanceof Object) {
            msg = JSON.stringify(response);
        } else if (typeof response === "string") {
            msg = response;
        }
        $(`.variant-allele-pairs-individuals-table[data-index='${rowId}']`).bootstrapTable("updateFormatText", "formatNoMatches", msg);
    }

    // this is a copy from gridCommons with context removed
    responseHandler(response, bootstrapTableConfig) {
        let from, to, approximateCountResult;

        const numMatches = response.getResponse().numMatches;

        // If no variant is returned then we start in 0
        if (response.getResponse(0).numMatches === 0) {
            from = numMatches;
        }
        // If do not fetch as many variants as requested then to is numMatches
        if (response.getResponse(0).numResults < bootstrapTableConfig.pageSize) {
            to = numMatches;
        }
        const numTotalResultsText = numMatches.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        if (response.getParams().skip === 0 && numMatches < response.getParams().limit) {
            from = 1;
            to = numMatches;
        }

        if (response.getResponse()?.attributes?.approximateCount) {
            approximateCountResult = response.getResponse().attributes.approximateCount;
        }

        return {
            numMatches: numMatches,
            from: from,
            to: to,
            numTotalResultsText: numTotalResultsText,
            approximateCountResult: approximateCountResult,
            pageSize: bootstrapTableConfig.pageSize,
            response: {
                total: numMatches,
                rows: response.getResults()
            }
        };
    }
    // ****
    //  /copy from gridCommons with rowId
    // ****


    // FIXME this is a copy of VariantInterpreterGridFormatter.clinicalPopulationFrequenciesFormatter() but it checks for the presence of `row.attributes` attribute
    clinicalPopulationFrequenciesFormatter(row) {
        const populationFrequencies = row?.populationFrequencies ?? row?.attributes?.populationFrequencies;
        if (populationFrequencies) {
            const popFreqMap = new Map();
            // console.log("row.populationFrequencies", row.populationFrequencies);
            if (populationFrequencies?.length > 0) {
                for (const popFreq of populationFrequencies) {
                    popFreqMap.set(popFreq.study + ":" + popFreq.population, Number(popFreq.altAlleleFreq).toFixed(4));
                }
            }
            return VariantGridFormatter.createPopulationFrequenciesTable(this._config.populationFrequencies, popFreqMap, POPULATION_FREQUENCIES.style);
        } else {
            return "-";
        }
    }

    consequenceTypeFormatter(value) {
        if (value) {
            const CTs = value.filter(ct => ~this._config.consequenceTypes.indexOf(ct.name));
            const filteredCTs = value.filter(ct => !~this._config.consequenceTypes.indexOf(ct.name));
            if (CTs.length) {
                return `
                ${CTs.map(ct => `<span>${ct.name} (${ct.accession})</span>`).join(", ")}
                ${filteredCTs.length ? `
                    <br>
                    <a tooltip-title="Terms Filtered" tooltip-text="${filteredCTs.map(ct => `<span>${ct.name} (${ct.accession})</span>`).join(", ")}">
                        <span style="color: darkgray;font-style: italic">${filteredCTs.length} terms filtered</span>
                    </a>
                ` : ""}
            `;
            }
        }
    }

    getDefaultConfig() {
        return {
            title: "Allele Pairs",
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
            header: {
                horizontalAlign: "center",
                verticalAlign: "bottom"
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

customElements.define("rga-variant-allele-pairs", RgaVariantAllelePairs);
