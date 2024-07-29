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
import UtilsNew from "../../../../../core/utils-new.js";
import CatalogGridFormatter from "../../../../commons/catalog-grid-formatter.js";
import AnalysisRegistry from "../analysis-registry.js";
import GridCommons from "../../../../commons/grid-commons.js";
import knockoutDataIndividuals from "../test/knockout.20201103172343.kFIvpr.individuals.js";
import "./knockout-individual-variants.js";
import "../../../../family/family-view.js";

export default class KnockoutIndividualView extends LitElement {

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
            jobId: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "oga-" + UtilsNew.randomString(6);
        this._config = this.getDefaultConfig();
        this.data = knockoutDataIndividuals;
        this.gridId = this._prefix + "KnockoutGrid";
        // this.prepareData();
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
        this.detailConfig = this.getDetailConfig();
        this.individual = null;
        this.toolbarConfig = {
            columns: this._initTableColumns()[0]
        };
    }

    firstUpdated(_changedProperties) {
        // this.renderTable();
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.job = null;
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.requestUpdate();
        }

        if (changedProperties.has("jobId")) {
            this.renderTable();
        }
    }

    prepareData() {
        this.tableData = knockoutDataIndividuals;
    }

    renderTable() {
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            // data: this.tableData,
            theadClasses: "table-light",
            buttonsClass: "light",
            columns: this._initTableColumns(),
            sidePagination: "local",
            iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
            icons: GridCommons.GRID_ICONS,
            // Set table properties, these are read from config propertyparticularly tough
            uniqueId: "id",
            pagination: true,
            // pageSize: this._config.pageSize,
            // pageList: this._config.pageList,
            paginationVAlign: "both",
            // formatShowingRows: this.gridCommons.formatShowingRows,
            gridContext: this,
            ajax: params => {
                this.opencgaSession.opencgaClient.variants().queryKnockoutIndividual({job: this.jobId, study: this.opencgaSession.study.fqn})
                    .then(restResponse => {
                        console.log("restResponse", restResponse);
                        this.tableData = restResponse.getResults();
                        params.success(this.tableData);
                    }).catch(e => {
                        console.error(e);
                        params.error(e);
                    });
            },
            // formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
            loadingTemplate: () => this.gridCommons.loadingFormatter(),
            onClickRow: (row, selectedElement, field) => {
                this.individual = {id: row.sampleId, ...row}; // TODO temp fix for missing id;
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
                    this.individual = {id: data[0].sampleId, ...data[0]}; // TODO temp fix for missing id;
                }
                this.requestUpdate();
            }

        });
    }

    onColumnChange(e) {
        this.gridCommons.onColumnChange(e);
    }

    _initTableColumns() {
        return [
            [
                {
                    title: "Individual Id",
                    field: "sampleId",
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
                    formatter: genes => genes.length ? genes.map(gene => gene.name) : "-"
                },
                {
                    title: "Homozygous",
                    field: "stats.byType.HOM_ALT"
                },
                {
                    title: "Compound Heterozygous",
                    field: "stats.byType.COMP_HET",
                    colspan: 4
                },
                {
                    title: "Disorders",
                    field: "disorders",
                    rowspan: 2,
                    formatter: disorders => disorders.length ? disorders.map(CatalogGridFormatter.disorderFormatter) : "-"

                },
                {
                    title: "Phenotypes",
                    field: "phenotypes",
                    rowspan: 2,
                    formatter: CatalogGridFormatter.phenotypesFormatter

                }
            ], [
                {
                    title: "Total",
                    field: "stats.byType.HOM_ALT"
                },
                {
                    title: "Total",
                    field: "stats.byType.COMP_HET"
                },
                {
                    title: "Definitely",
                    field: "stats.byType.COMP_HET.def"
                },
                {
                    title: "Probable",
                    field: "stats.byType.COMP_HET.prob"
                },
                {
                    title: "Possible",
                    field: "stats.byType.COMP_HET.poss"
                }
            ]
        ];
    }

    onDownload(e) {
        const header = ["Individual Id", "Sample", "Gene", "HOM_ALT", "COMP_HET.total", "COMP_HET.def", "COMP_HET.prob", "COMP_HET.poss", "Disorders", "Phenotypes"];
        if (e.detail.option.toLowerCase() === "tab") {
            const dataString = [
                header.join("\t"),
                ...this.tableData.map(_ => [
                    _.sampleId,
                    _.sampleId,
                    _.genes.length ? _.genes.map(gene => gene.name).join(",") : "-",
                    _.stats.byType.HOM_ALT,
                    _.stats.byType.COMP_HET,
                    _.stats.byType.COMP_HET.def,
                    _.stats.byType.COMP_HET.prob,
                    _.stats.byType.COMP_HET.poss,
                    _.disorders.length ? _.disorders.map(disorder => disorder.name).join(",") : "-",
                    _.phenotypes.length ? _.phenotypes.map(disorder => disorder.name).join(",") : "-"
                ].join("\t"))];
            UtilsNew.downloadData(dataString, "knockout_individual_view" + this.opencgaSession.study.id + ".tsv", "text/plain");
        } else {
            UtilsNew.downloadData(JSON.stringify(this.tableData, null, "\t"), this.opencgaSession.study.id + ".json", "application/json");
        }
    }

    getDefaultConfig() {
        return AnalysisRegistry.get("knockout").config;
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
                            <knockout-individual-variants .individual="${individual}"></knockout-individual-variants>
                        `;
                    }
                }, {
                    id: "family-view",
                    name: "Family",
                    render: (individual, active, opencgaSession) => {
                        return html`<family-view .individualId="${individual.id}" .opencgaSession="${opencgaSession}"></family-view>`;
                    }
                }
            ]
        };
    }

    render() {
        return html`
            <opencb-grid-toolbar .config="${this.toolbarConfig}"
                                @columnChange="${this.onColumnChange}"
                                @download="${this.onDownload}">
            </opencb-grid-toolbar>
            <div class="row">
                <table id="${this.gridId}"></table>
            </div>
            ${this.individual ? html`<detail-tabs .data="${this.individual}" .config="${this.detailConfig}" .opencgaSession="${this.opencgaSession}"></detail-tabs>`: ""}
        `;
    }

}

customElements.define("knockout-individual-view", KnockoutIndividualView);
