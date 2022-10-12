/*
 * Copyright 2015-2016 OpenCB
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
import CatalogGridFormatter from "../../commons/catalog-grid-formatter.js";
import GridCommons from "../../commons/grid-commons.js";
import "../../family/family-view.js";
import "../../variant/annotation/cellbase-population-frequency-grid.js";
import "../../variant/annotation/variant-annotation-clinical-view.js";
import "./rga-variant-individual.js";
import "./rga-variant-allele-pairs.js";
import VariantGridFormatter from "../../variant/variant-grid-formatter.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";


export default class RgaVariantView extends LitElement {

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
            cellbaseClient: {
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
        this._prefix = "rag-v-" + UtilsNew.randomString(6);
        this.active = false;
        this.gridId = this._prefix + "RgaVariantGrid";
        this.rendered = false;
        this.variantId = null;

        this.queryGuard = false;
        this.colToShow = 2;

        this.prevQuery = {};
        this._query = {};
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
        this.detailConfig = this.getDetailConfig();
        this.individual = null;
        this.toolbarConfig = {
            columns: [
                {
                    title: "Variant",
                    field: "id"
                },
                {
                    title: "Gene",
                    field: "genes"
                },
                {
                    title: "dbSNP",
                    field: "dbSnp"
                },
                {
                    title: "Alternate allele frequency",
                    field: "populationFrequencies"
                },
                {
                    title: "Variant type",
                    field: "type"
                },
                {
                    title: "Allele count",
                    field: "allelePairs"
                },
                {
                    title: "Consequence type",
                    field: "sequenceOntologyTerms"
                },
                {
                    title: "Clinical Significance",
                    field: "clinicalSignificances"
                },
                {
                    title: "Total",
                    field: "individualStats.count"
                },
                {
                    title: "Homozygous",
                    field: "individualStats.numHomAlt"
                },
                /* {
                    title: "Deletion Overlap",
                    field: "individualStats.numDelOverlap"
                },*/
                {
                    title: "CH - Definite",
                    field: "individualStats.bothParents.numCompHet"
                },
                {
                    title: "CH - Probable",
                    field: "individualStats.singleParent.numCompHet"
                }/* ,
                {
                    title: "CH - Possible",
                    field: "individualStats.missingParents.numCompHet"
                }*/
            ],
            showColumns: true,
            showExport: false,
            showDownload: true
        };
    }

    updated(changedProperties) {
        if ((changedProperties.has("opencgaSession") || changedProperties.has("query") || changedProperties.has("config") || changedProperties.has("active")) && this.active) {
            this.propertyObserver();
        }

        // TODO in this case update doesn't work
        // super.update(changedProperties);
    }

    propertyObserver() {
        // With each property change we must updated config and create the columns again. No extra checks are needed.
        this._config = Object.assign(this.getDefaultConfig(), this.config);
        // prevent the render of the table in case neither geneName or individual are in query
        if (this.queryGuard && !this.query?.geneName && !this.query?.individualId) {
            return;
        }
        this.renderTable();
    }

    /*
     * @deprecated
     */
    /* prepareData() {
        // console.log("preparedData", this.data);
        let i = 0;
        this._data = {};
        this.samples = [];
        for (let a = 0; a < this.data.length; a++) {
            const sample = this.data[a];
            for (let b = 0; b < sample.genes.length; b++) {
                const gene = sample.genes[b];
                for (let c = 0; c < gene.transcripts.length; c++) {
                    const transcript = gene.transcripts[c];
                    for (let d = 0; d < transcript.variants.length; d++) {
                        const variant = transcript.variants[d];
                        // console.log(variant.id)
                        this.samples.push(sample);
                        if (this._data[variant.id]) {
                            this._data[variant.id].push({sampleId: sample.sampleId, variant: variant});
                        } else {
                            this._data[variant.id] = [{sampleId: sample.sampleId, variant: variant}];
                        }
                        i++;
                    }
                }
            }
        }
        this.samples = [...new Set(this.samples)];
        this.activeSamples = this.samples.slice(0, this.colToShow).map(sample => sample.sampleId);
        this.tableData = Object.entries(this._data).map(([variant, samples]) => ({
            id: variant,
            data: samples
        }));
        // this.renderTable();

    }*/

    _initTableColumns() {
        this._columns = [
            [
                {
                    title: `Variant
                                <a id="variantInfoIcon" tooltip-title="Sorting" tooltip-text="Variants will be sorted automatically in case the results are less than the Page Size, which could be set up to 100.">
                                    <i class="fa fa-info-circle" aria-hidden="true"></i>
                                </a>
                    `,
                    // title: "Variant",
                    field: "id",
                    rowspan: 2,
                    class: "custom-sort",
                    formatter: (value, row, index) => VariantGridFormatter.variantFormatter(value, row, index, this.opencgaSession.project.organism.assembly)
                },
                {
                    title: "Gene",
                    field: "genes",
                    rowspan: 2,
                    formatter: value => value?.length ? value.join(", ") : "-"
                },
                {
                    title: "dbSNP",
                    field: "dbSnp",
                    rowspan: 2
                },
                {
                    title: "Alternate allele frequency",
                    field: "populationFrequencies",
                    rowspan: 2,
                    formatter: (value, row) => this.clinicalPopulationFrequenciesFormatter(value, row)
                },
                {
                    title: "Variant type",
                    field: "type",
                    rowspan: 2
                },
                {
                    title: "Allele count",
                    field: "allelePairs",
                    rowspan: 2,
                    formatter: value => value ? value.length : "-"
                },
                {
                    title: "Consequence type",
                    field: "sequenceOntologyTerms",
                    rowspan: 2,
                    formatter: value => {
                        if (value) {
                            return this.consequenceTypeFormatter(value);
                        }
                    }
                },
                {
                    title: "Clinical Significance",
                    field: "clinicalSignificances",
                    rowspan: 2,
                    formatter: value => value.length ? value.join(", ") : "-"
                },
                {
                    title: "Recessive Individuals",
                    field: "",
                    colspan: 4,
                    halign: this._config.header.horizontalAlign
                }
            ], [

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
                /* {
                    title: "Deletion Overlap",
                    field: "individualStats.numDelOverlap",
                    formatter: value => value > 0 ? value : "-"

                },*/
                {
                    title: "CH - Definite",
                    field: "individualStats",
                    formatter: individualStats => individualStats.bothParents.numCompHet + individualStats.bothParents.numDelOverlap ?? "-" // FIXME DELETION_OVERLAP replaced
                },
                {
                    title: "CH - Probable",
                    field: "individualStats",
                    formatter: individualStats => individualStats.singleParent.numCompHet + individualStats.singleParent.numDelOverlap ?? "-" // FIXME DELETION_OVERLAP replaced

                },
                /* {
                    title: "CH - Possible",
                    field: "individualStats.missingParents.numCompHet",
                    formatter: value => value > 0 ? value : "-"
                }*/

                // {
                //     title: "Individuals",
                //     field: "numIndividuals",
                //     formatter: (_, row) => {
                //         let hiddenIndividuals = 0;
                //         if (row.individuals.length !== row.numIndividuals) {
                //             hiddenIndividuals = row.numIndividuals - row.individuals.length;
                //         }
                //         return `${row.numIndividuals}
                //             ${hiddenIndividuals > 0 ? `<a tooltip-title="Individuals" tooltip-position-at="left bottom" tooltip-position-my="right top"
                //                                               tooltip-text="${hiddenIndividuals} individual${hiddenIndividuals > 1 ? "s are" : " is"} hidden due to your permission settings."><i
                //                 class="text-warning fas fa-exclamation-circle align-middle"></i></a>` : ""}`;
                //     }
                //     // individual matrix
                //     // field: "individuals",
                //     // formatter: this.individualFormatter.bind(this)
                //
                // }
            /* ...this.samples.map(sample => {
                return {
                    title: `Sample ${sample.sampleId}`,
                    field: sample.sampleId,
                    visible: !!~this.activeSamples.indexOf(sample.sampleId),
                    formatter: (v, row) => {
                        return row.data.find(a => a.sampleId === sample.sampleId)?.variant?.knockoutType;
                        // return JSON.stringify(v)
                    }
                };
            })*/]
        ];

        return this._columns;

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
        /* if (this.hiddenIndividuals) {
            tooltip += (this.isApproximateCount ? "<br>" : "") + `${this.hiddenIndividuals} individual${this.hiddenIndividuals > 1 ? "s are" : " is"} hidden due to your permission settings.`;
        }*/
        if (tooltip) {
            res += ` <a tooltip-title="Warning" tooltip-text='${tooltip}'> <i class="fas fa-exclamation-circle text-muted"></i></a>`;
        }
        return res;
    }

    /*
     * @deprecated
     */
    /* geneFormatter(value, row) {
        const genes = new Set();
        row.individuals.forEach(individual => individual.genes.forEach(gene => genes.add(gene.name)));
        return Array.from(genes.keys()).join(", ");
    }*/

    /*
     * @deprecated
     */
    /* alleleCountFormatter(value, row) {
        const uniqueVariants = {};
        for (const individual of row.individuals) {
            for (const gene of individual.genes) {
                for (const transcript of gene.transcripts) {
                    for (const variant of transcript.variants) {
                        uniqueVariants[variant.id] = variant.id;
                    }
                }
            }
        }
        return Object.keys(uniqueVariants).length;
    }*/

    clinicalPopulationFrequenciesFormatter(value, row) {
        if (row) {
            const popFreqMap = new Map();
            if (row?.populationFrequencies?.length > 0) {
                for (const popFreq of row.populationFrequencies) {
                    popFreqMap.set(popFreq.study + ":" + popFreq.population, Number(popFreq.altAlleleFreq).toFixed(4));
                }
            }
            return VariantGridFormatter.createPopulationFrequenciesTable(this._config.populationFrequencies, popFreqMap, POPULATION_FREQUENCIES.style);
        } else {
            return "-";
        }
    }

    /*
     * @deprecated
     */
    /* dbSNPFormatter(value, row) {
        const dbSNPs = new Set();
        for (const individual of row.individuals) {
            for (const gene of individual.genes) {
                for (const transcript of gene.transcripts) {
                    for (const variant of transcript.variants) {
                        if (variant.dbSNP) {
                            dbSNPs.add(variant.dbSNP);
                        }
                    }
                }
            }
        }
        return Object.keys(dbSNPs).map(dbSNP => `<span>${dbSNP})</span>`).join(", ");
    }*/

    // TODO consequenceType object in VB and in RGA Variant query are different. in RGA Variant query you only get sequenceOntologyTerms (accession-name pair). Same in rga-variant-allele-pairs.
    consequenceTypeFormatter(value, row) {
        if (value) {
            const CTs = value.filter(ct => ~this._config.consequenceTypes.indexOf(ct.name));
            // const filteredCTs = value.filter(ct => !~this._config.consequenceTypes.indexOf(ct.name)); // FIXME temporarily disabling filtering CTs
            const filteredCTs = [];
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

    onColumnChange(e) {
        this.gridCommons.onColumnChange(e);
        /* const ids = e.detail.value ?? "";
        this.table.bootstrapTable("hideAllColumns");
        this.table.bootstrapTable("showColumn", ["id", "dbSNP", "consequenceType", "individuals"]);
        if (ids) {
            ids.split(",").forEach(id => this.table.bootstrapTable("showColumn", id));
        }*/
    }

    /*
     * not used at the moment
     */
    individualFormatter(value, row) {
        if (!this.query?.individualId) {
            return "-";
        }
        // return value.map(individual => individual.genes[0].transcripts[0].variants[0].knockoutType)
        const typeToColor = {
            "HOM_ALT": "#5b5bff",
            "COMP_HET": "blue",
            "DELETION_OVERLAP": "#FFB05B"
        };
        /* const samplesTableData = this.samples.map(sample => ({id: sample.sampleId}));
        for (const {sampleId, variant} of row.data) {
            if (variant.id === row.id) {
                const c = samplesTableData.find(sample => sample.id === sampleId);
                c.knockoutType = variant.knockoutType;
            }
        }*/
        const filteredIndividualIDs = this.query.individualId.split(/[,;]/);
        // TODO FIXME at the moment it takes into account the first variant of the first transcript of the first gene
        return filteredIndividualIDs.map(individualId => {
            for (const individual of value) {
                if (individual.id === individualId) {
                    const gene = individual.genes[0];
                    const transcript = gene.transcripts[0];
                    for (const variant of transcript.variants) {
                        if (variant.id === row.id) {
                            return `<a class="rga-individual-box" style="background: ${typeToColor[variant.knockoutType] ?? "#fff"}" tooltip-title="${individual.id}" tooltip-text="${variant.knockoutType}">&nbsp;</a>`;
                        }
                    }
                }
            }
            return `<a class="rga-individual-box" style="background: '#fff' tooltip-title="${individualId}" tooltip-text="no knockout">&nbsp;</a>`;

        }).join("");
    }

    renderTable() {
        this._query = {...this.query, study: this.opencgaSession.study.fqn}; // we want to support a query obj param both with or without study.
        // Checks if the component is not visible or the query hasn't changed (NOT the latter anymore)
        if (!this.active /* || UtilsNew.objectCompare(this._query, this.prevQuery)*/) {
            return;
        }
        // this.prevQuery = {...this._query};

        // reset sort params
        // this.sortOrder = null;
        // this.sortName = null;

        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            // data: this.tableData,
            columns: this._initTableColumns(),
            method: "get",
            sidePagination: "server",
            iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
            icons: GridCommons.GRID_ICONS,
            uniqueId: "id",
            pageSize: this._config.pageSize,
            pageList: this._config.pageList,
            pagination: this._config.pagination,
            paginationVAlign: "both",
            // stickyHeader: true,
            // stickyHeaderOffsetLeft: parseInt($("body").css("padding-left"), 50),
            // stickyHeaderOffsetRight: parseInt($("body").css("padding-right"), 50),
            formatShowingRows: (pageFrom, pageTo, totalRows) => this.formatShowingRows(pageFrom, pageTo, totalRows),
            gridContext: this,
            formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
            ajax: async params => {
                // FIXME DELETION_OVERLAP replaced
                try {
                    if (this._query?.knockoutType?.split(",").includes("COMP_HET")) {
                        this._query.knockoutType = [...new Set([...this._query.knockoutType.split(","), "DELETION_OVERLAP"])].join(",");
                    }

                    const _filters = {
                        study: this.opencgaSession.study.fqn,
                        // sort: this.sortName, // this.table.bootstrapTable("getOptions").sortName,
                        // order: this.sortOrder, // this.table.bootstrapTable("getOptions").sortOrder,
                        limit: params.data.limit,
                        skip: params.data.offset || 0,
                        count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                        ...this._query
                    };

                    const rgaVariantResponse = await this.opencgaSession.opencgaClient.clinical().summaryRgaVariant(_filters);
                    const numMatches = rgaVariantResponse.getNumMatches();

                    if (numMatches < this.table.bootstrapTable("getOptions").pageSize) {
                        rgaVariantResponse.responses[0].results = [...rgaVariantResponse.getResults()].sort((a, b) => this.sortVariantPosition(a, b));
                    }

                    params.success(rgaVariantResponse);


                    // 1. check the query. empty query shouldn't be counting
                    // 2. if N < 100
                    // 3.   fetch results with limit=N
                    // 4. else
                    // 5.   normal flow
                    // 6. if N < 100 AND the query change only on limit or skip (paginating) keep request local

                    // this is used to count but also we use this response to avoid more request if N > 100
                    // this iff query is not empty
                    /* const rgaVariantResponseCount = await this.opencgaSession.opencgaClient.clinical().summaryRgaVariant({..._filters, count: true});
                    this.isApproximateCount = rgaVariantResponseCount.getResultEvents("WARNING")?.find(event => event?.message?.includes("numMatches value is approximated"));

                    console.log("getNumMatches", rgaVariantResponseCount.getNumMatches());
                    const N = rgaVariantResponseCount.getNumMatches();

                    console.log("this.prevQuery", this.prevQuery)
                    console.log("_filters", _filters)
                    if (N < this.localSortThreshold) {

                        // removing limit and skip from currentQuery
                        const {limit: currLimit, skip: currSkip, count: currCount, ...currentQuery} = _filters;
                        // removing limit and skip from prevQuery
                        const {limit: prevLimit, skip: prevSkip, count: prevCount, ...prevQuery} = this.prevQuery;

                        console.log(currentQuery, prevQuery)
                        console.log("compare", UtilsNew.objectCompare(currentQuery, prevQuery))
                        console.log("currSkip, currLimit", currSkip, currLimit)

                        if (UtilsNew.objectCompare(currentQuery, prevQuery) && (currLimit !== prevLimit || currSkip !== prevSkip)) {
                            console.log("same query, changing limit or skip")
                            // we are just changing the limit or the skip
                            console.log("this.localRgaVariantResponse", this.localRgaVariantResponse);
                            // changing client side
                            this.prevQuery = {..._filters};
                            const r = this.localRgaVariantResponse.getResults().slice(currSkip, currSkip + currLimit);
                            console.log("results", r)
                            console.log("r.length", r.length)
                            const restResponse = {
                                ...this.localRgaVariantResponse,
                                response: [],
                                responses: [
                                    {
                                        ...this.localRgaVariantResponse.getResponse(),
                                        numResults: r.length,
                                        results: r,
                                        result: r
                                    },
                                ]
                            };
                            console.log("restResponse", restResponse)
                            params.success(restResponse);
                        } else {
                            // normal query with limit=N
                            const rgaVariantResponse = await this.opencgaSession.opencgaClient.clinical().summaryRgaVariant({..._filters, ...{limit: N}});
                            this.localRgaVariantResponse = rgaVariantResponse;
                            this.prevQuery = {..._filters};
                            params.success(rgaVariantResponse);
                        }


                    } else {
                        const rgaVariantResponse = await this.opencgaSession.opencgaClient.clinical().summaryRgaVariant(_filters);
                        console.log("init rgaVariantResponse", rgaVariantResponse)
                        params.success(rgaVariantResponse);
                    } */


                } catch (e) {
                    console.error(e);
                    params.error(e);
                }

            },
            responseHandler: response => {
                const result = this.gridCommons.responseHandler(response, $(this.table).bootstrapTable("getOptions"));
                this.response = result.response;
                return result.response;
            },
            onClickRow: (row, selectedElement, field) => {
                console.log(row);
                this.variant = row;
                this.gridCommons.onClickRow(row.id, row, selectedElement);
                this.requestUpdate();
            },
            onLoadSuccess: data => {
                // this is not triggered in case of static data
            },
            onLoadError: (e, restResponse) => this.gridCommons.onLoadError(e, restResponse),
            onPostBody: data => {
                // Custom sort
                const header = $("th.custom-sort");
                if (this?.response?.total < this.table.bootstrapTable("getOptions").pageSize) {
                    header.addClass("enabled asc");
                    $("a", header).attr("tooltip-text", "Results are sorted by Variant Id");
                } else {
                    header.removeClass("enabled asc");
                    $("a", header).attr("tooltip-text", "Variants will be sorted automatically in case the results are less than the Page Size, which could be set up to 100.");
                }

                /*
                if (this?.response?.total < 1000) {
                    header.addClass("enabled");
                } else {
                    header.removeClass("enabled");
                }
                header.off("click").on("click", e => {
                    this.customSort(e);
                });
                */
                this.gridCommons.onLoadSuccess({rows: data, total: data.length});
                // it selects the first row (we don't use `selectrow` event in this case)
                this.variant = data[0] ?? null;
                this.requestUpdate();
            },
            events: {
                // "click .custom-sort": (e) => console.log("click", e)
            }

        });
    }

    sortVariantPosition(a, b) {
        const diff = CHROMOSOMES.indexOf(a.chromosome) - CHROMOSOMES.indexOf(b.chromosome);
        if (diff !== 0) {
            return diff;
        } else {
            return a.start - b.start;
        }
    }

    /* customSort(e) {
        const header = $("th.custom-sort");
        if (this.response.total < 1000) {
            if (~this.sortOrder) {
                header.removeClass("asc").addClass("desc");
            } else {
                header.removeClass("desc").addClass("asc");
            }
            // this.sortOrder *= -1;
            // this.sortName = "id";
            this.table.bootstrapTable("refresh");
        } else {
            console.warn("Total results: ", this.response.total, "sorting is not possible");
        }
    }*/

    async onDownload(e) {
        this.toolbarConfig = {...this.toolbarConfig, downloading: true};
        this.requestUpdate();
        await this.updateComplete;
        const params = {
            study: this.opencgaSession.study.fqn,
            count: false,
            ...this._query,
            limit: e.detail?.exportLimit ?? 100,
        };
        this.opencgaSession.opencgaClient.clinical().summaryRgaVariant(params)
            .then(restResponse => {
                const results = restResponse.getResults();
                if (results) {
                    // Check if user clicked in Tab or JSON format
                    if (e.detail.option.toLowerCase() === "tab") {
                        const dataString = [
                            [
                                "Variant",
                                "Gene",
                                "dbSNP",
                                "Type",
                                "Allele count",
                                "Consequence type",
                                "Clinical Significance",
                                "Individuals_Total",
                                "Individuals_HOM",
                                // "Individuals_DELETION_OVERLAP",
                                "Individuals_CH_Definite",
                                "Individuals_CH_Probable",
                                // "Individuals_CH_Possible"
                            ].join("\t"),
                            ...results.map(_ => [
                                _.id,
                                _.genes ? _.genes.join(",") : "",
                                _.dbSnp,
                                _.type,
                                _.allelePairs ? _.allelePairs.length : "",
                                _.sequenceOntologyTerms?.length ? _.sequenceOntologyTerms.map(ct => `${ct.name} (${ct.accession})`) : "",
                                _.clinicalSignificances?.length ? _.clinicalSignificances.join(",") : "-",
                                _.individualStats?.count,
                                _.individualStats?.numHomAlt,
                                // _.individualStats?.numDelOverlap,
                                _.individualStats?.bothParents?.numCompHet + _.individualStats?.numDelOverlap,
                                _.individualStats?.singleParent?.numCompHet,
                                // _.individualStats?.missingParents?.numCompHet
                            ].join("\t"))];
                        UtilsNew.downloadData(dataString, "rga_variants_" + this.opencgaSession.study.id + ".tsv", "text/plain");
                    } else {
                        UtilsNew.downloadData(JSON.stringify(results, null, "\t"), "rga_variants_" + this.opencgaSession.study.id + ".json", "application/json");
                    }
                } else {
                    console.error("Error in result format");
                }
            })
            .catch(response => {
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
            pageList: [10, 25, 50, 100],
            showExport: false,
            detailView: false,
            detailFormatter: undefined, // function with the detail formatter
            multiSelection: false,
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

    getDetailConfig() {
        return {
            title: "Variant",
            showTitle: true,
            items: [
                {
                    id: "individual-view",
                    name: "Individuals",
                    active: true,
                    render: (variant, active, opencgaSession) => {
                        return html`
                            <rga-variant-individual
                                .query=${this.query}
                                .variant="${variant}"
                                .opencgaSession="${opencgaSession}">
                            </rga-variant-individual>
                        `;
                    }
                },
                {
                    id: "allele-view",
                    name: "Allele Pairs",
                    // active: true,
                    render: (variant, active, opencgaSession) => {
                        return html`
                            <rga-variant-allele-pairs
                                .variant="${variant}"
                                .config=${this._config}
                                .opencgaSession="${opencgaSession}">
                            </rga-variant-allele-pairs>
                        `;
                    }
                },
                {
                    id: "clinvar-view",
                    name: "Clinical",
                    render: (variant, active, opencgaSession, cellbaseClient) => {
                        return html`
                            <variant-annotation-clinical-view
                                .variantId="${variant?.id}"
                                .opencgaSession="${opencgaSession}"
                                .cellbaseClient="${cellbaseClient}">
                            </variant-annotation-clinical-view>
                        `;
                    }
                },
                {
                    id: "popfreq-view",
                    name: "Population Frequencies",
                    render: (variant, active, opencgaSession, cellbaseClient) => {
                        return html`
                            <cellbase-population-frequency-grid
                                .variantId="${variant?.id}"
                                .assembly="${opencgaSession?.project?.organism?.assembly}"
                                .cellbaseClient="${cellbaseClient}"
                                .active="${active}">
                            </cellbase-population-frequency-grid>`;
                    }
                }
            ]
        };
    }

    render() {
        if (this.queryGuard && !this.query?.geneName && !this.query?.individualId) {
            return html`<div class="alert alert-info"><i class="fas fa-3x fa-info-circle align-middle"></i> Please select a set of Genes or Individuals</div>`;
        }

        return html`
            <div class="container-fluid">
                <opencb-grid-toolbar
                    .config="${this.toolbarConfig}"
                    @columnChange="${this.onColumnChange}"
                    @download="${this.onDownload}">
                </opencb-grid-toolbar>

                <div id="${this._prefix}GridTableDiv" class="row" data-cy="variant-view-grid">
                    <table id="${this.gridId}"></table>
                </div>
                ${this.variant ? html`
                    <detail-tabs
                        .data="${this.variant}"
                        .config="${this.detailConfig}"
                        .opencgaSession="${this.opencgaSession}"
                        .cellbaseClient="${this.cellbaseClient}">
                    </detail-tabs>
                ` : null}
            </div>
        `;
    }

}

customElements.define("rga-variant-view", RgaVariantView);
