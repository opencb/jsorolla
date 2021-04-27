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
        this.queryGuard = false;
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
        this.detailConfig = this.getDetailConfig();

    }

    updated(changedProperties) {
        if ((changedProperties.has("opencgaSession") || changedProperties.has("query") || changedProperties.has("config") || changedProperties.has("active")) && this.active) {
            this.propertyObserver();
        }
    }

    propertyObserver() {
        // With each property change we must updated config and create the columns again. No extra checks are needed.
        this._config = Object.assign(this.getDefaultConfig(), this.config);

        // prevent the render of the table in case neither geneName or individual are in query
        if (this.queryGuard && !this.query?.geneName && !this.query?.individualId) {
            return;
        }

        this._columns = this._initTableColumns();
        // Config for the grid toolbar
        this.toolbarConfig = {
            columns: [
                {
                    title: "Individual Id",
                    field: "id"
                },
                {
                    title: "Sample",
                    field: "sampleId",
                },
                {
                    title: "Gene",
                    field: "genes"
                },
                {

                    title: "Compound Heterozygous",
                    field: "ch_def,ch_prob,ch_poss"
                },
                {
                    title: "Phenotypes",
                    field: "phenotypes"
                },
                {
                    title: "Disorders",
                    field: "disorders"
                },
                {
                    title: "Case ID",
                    field: "attributes.OPENCGA_CLINICAL_ANALYSIS"
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
            pageSize: this._config.pageSize,
            pageList: this._config.pageList,
            pagination: this._config.pagination,
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
                    include: "genes,sampleId,phenotypes,disorders,motherId,motherSampleId,fatherId,fatherSampleId",
                    ...this._query
                };

                this.opencgaSession.opencgaClient.clinical().summaryRgaIndividual(_filters)
                    .then(rgaIndividualResponse => {
                        // fetching Case Id of the individuals (paginated)
                        const individualIds = rgaIndividualResponse.getResults().map(individual => individual.id).filter(Boolean).join(",");
                        if (individualIds) {
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

                                    // We store the Case ID in the individual attribute
                                    /* // Note clinical search results are not sorted
                                    // FIXME at the moment we only search by proband
                                    const map = {};
                                    for (const clinicalAnalysis of caseResponse.getResults()) {
                                        if (!map[clinicalAnalysis.proband.id]) {
                                            map[clinicalAnalysis.proband.id] = [];
                                        }
                                        map[clinicalAnalysis.proband.id].push(clinicalAnalysis);
                                    }
                                    for (const individual of rgaIndividualResponse.getResults()) {
                                        if (map[individual.id]) {
                                            individual.attributes = {
                                                OPENCGA_CLINICAL_ANALYSIS: map[individual.id]
                                            };
                                        }
                                    }*/
                                    params.success(rgaIndividualResponse);
                                })
                                .catch(e => {
                                    console.error(e);
                                    params.error(e);
                                });
                        } else {
                            params.success(rgaIndividualResponse);
                        }


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
                // it selects the first row (we don't use `selectrow` event in this case)
                this.individual = data[0] ?? null;
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
        if (value) {
            const genes = value.join(", ");
            if (value.length > 20) {
                return `<a tooltip-title="Genes" tooltip-text='${genes}'> ${value.length} genes</a>`;
            } else {
                return genes;
            }
        }
    }

    /**
     * @deprecated
     */
    mapResult(results) {
        const rows = results.rows.map(ind => {
            const totalConfidence = this.getKnockoutGeneCount(ind.genes, "COMP_HET");
            const ch = {
                total: totalConfidence
            };
            // set definite, probable, possible according to the parents data
            if (ind.fatherId && ind.motherId) {
                ch.definite = totalConfidence;
            } else if ((ind.fatherId && !ind.motherId) || (!ind.fatherId && ind.motherId)) {
                ch.probable = totalConfidence;
            } else if (!ind.fatherId && !ind.motherId) {
                ch.possible = totalConfidence;
            }
            return {
                ...ind,
                homozygous: this.getKnockoutGeneCount(ind.genes, "HOM_ALT"),
                ch
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
                    field: "ch",
                    colspan: 3
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

                },
                {
                    title: "Case ID",
                    field: "attributes.OPENCGA_CLINICAL_ANALYSIS",
                    rowspan: 2,
                    formatter: (value, row) => CatalogGridFormatter.caseFormatter(value, row, row.id, this.opencgaSession)
                }
            ], [
                {
                    title: "Total",
                    field: "variantStats.numHomAlt",
                    formatter: value => {
                        return value > 0 ? value : "-";
                    }
                },
                /*
                {
                    title: "Total",
                    field: "ch"
                    /!* formatter: (_, row) => {
                        return this.getKnockoutCount(row.genes, "COMP_HET");
                    }*!/
                },*/
                {
                    title: "Definite",
                    field: "ch_def",
                    formatter: (value, row) => this.getChConfidenceFormatter(row, 2)
                },
                {
                    title: "Probable",
                    field: "ch_prob",
                    formatter: (value, row) => this.getChConfidenceFormatter(row, 1)
                },
                {
                    title: "Possible",
                    field: "ch_poss",
                    formatter: (value, row) => this.getChConfidenceFormatter(row, 0)
                }
            ]
        ];
    }

    /**
     * Returns variantStats.numCompHet iff numParents matches the number of parent Ids defined
     */
    getChConfidenceFormatter(row, numParents) {
        return (Number(!!row.fatherId) + Number(!!row.motherId)) === numParents && row.variantStats.numCompHet > 0 ? row.variantStats.numCompHet : "-";
    }

    /**
     * Counts the knocked-out genes by Knockout type
     * @param {Array} genes Gene Array
     * @param {String} knockoutType Knockout type (HOM|COMP_HET)
     * @returns {number|null} Either the number of genes or null
     */
    getKnockoutGeneCount(genes, knockoutType) {
        let total = 0;
        gene:
        for (const gene of genes) {
            for (const transcript of gene.transcripts) {
                for (const variant of transcript.variants) {
                    if (variant.knockoutType === knockoutType) {
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
            include: "genes,sampleId,phenotypes,disorders,motherId,motherSampleId,fatherId,fatherSampleId",
            ...this._query,
            limit: 100
        };
        this.opencgaSession.opencgaClient.clinical().summaryRgaIndividual(params)
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
                                _.variantStats.numHomAlt,
                                this.getChConfidenceFormatter(_, 2),
                                this.getChConfidenceFormatter(_, 1),
                                this.getChConfidenceFormatter(_, 0),
                                _?.phenotypes.length ? _.phenotypes.map(phenotype => phenotype.id).join(",") : "-",
                                _?.disorders.length ? _.disorders.map(disorder => disorder.id).join(",") : "-"
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
                            <rga-individual-variants .individualId="${individual?.id}" .active=${active} .opencgaSession="${opencgaSession}"></rga-individual-variants>
                        `;
                    }
                }, {
                    id: "family-view",
                    name: "Family",
                    render: (individual, active, opencgaSession) => {
                        return html`
                            <h3>Putative recessive Variants in family</h3>
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
        };
    }

    render() {
        if (this.queryGuard && !this.query?.geneName && !this.query?.individualId) {
            return html`<div class="alert alert-info"><i class="fas fa-3x fa-info-circle align-middle"></i> Please select a set of Genes or Individuals</div>`;
        }
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
