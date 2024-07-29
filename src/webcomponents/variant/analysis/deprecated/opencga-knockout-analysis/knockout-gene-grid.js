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
import {classMap} from "lit/directives/class-map.js";
import UtilsNew from "../../../../../core/utils-new.js";
import AnalysisRegistry from "../analysis-registry.js";
import GridCommons from "../../../../commons/grid-commons.js";
import knockoutDataGene from "../test/knockout.20201103172343.kFIvpr.gene.js";

export default class KnockoutGeneGrid extends LitElement {

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
        this.data = knockoutDataGene;
        this.gridId = this._prefix + "KnockoutGrid";
        // this.tableData = knockoutDataGene;
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
        this.toolbarConfig = {
            columns: this._initTableColumns()[0]
        };

    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.job = null;
        }

        if (changedProperties.has("jobId")) {
            this.renderTable();
        }

        /* if (changedProperties.has("job") && this.opencgaSession) {
            this.job = null;
            let query = {study: "demo@family:corpasome", job: "knockout.20201021003108.inXESR"};
            this.opencgaSession.opencgaClient.variants().queryKnockoutIndividual(query).then(restResponse => {
                console.log(restResponse.getResults())
                this.data = restResponse.getResults()

            })
        }*/

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.requestUpdate();
        }
    }

    prepareData() {
        // this.tableData = knockoutDataGene;
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
            // Set table properties, these are read from config property
            uniqueId: "id",
            pagination: true,
            // pageSize: this._config.pageSize,
            // pageList: this._config.pageList,
            paginationVAlign: "both",
            // formatShowingRows: this.gridCommons.formatShowingRows,
            gridContext: this,
            ajax: params => {
                this.opencgaSession.opencgaClient.variants().queryKnockoutGene({job: this.jobId, study: this.opencgaSession.study.fqn})
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
            onClickRow: (row, selectedElement, field) => this.gridCommons.onClickRow(row.id, row, selectedElement)
        });
    }

    _initTableColumns() {
        return [
            [
                {
                    title: "Gene",
                    field: "name",
                    rowspan: 2,
                    halign: "center",
                    formatter: this.geneIdFormatter
                },
                {
                    title: "Compound Heterozygous",
                    colspan: 4
                },
                {
                    title: "Homozygous"
                },
                {
                    title: "All"
                }
            ],
            [
                {
                    title: "Tot",
                    formatter: this.compTotalFormatter.bind(this)
                },
                {
                    title: "Def."
                },
                {
                    title: "Probable"
                },
                {
                    title: "Possible"
                },
                {
                    title: "Total"
                },
                {
                    title: "Total",
                    formatter: (val, row, index) => this.tableData[index].individuals?.length
                }
            ]
        ];
    }

    compTotalFormatter(val, row, index) {
        const ind = this.tableData[index].individuals;
        return "0";
    }

    geneIdFormatter(val, row) {
        return `${row.name} <br> <span class="text-muted">${row.chromosome}:${row.start}-${row.end} (${row.strand})</span>`;
    }

    onColumnChange(e) {
        this.gridCommons.onColumnChange(e);
    }

    onDownload(e) {
        console.log(e);
        const header = ["Gene", "HOM_ALT", "COMP_HET.total", "COMP_HET.def", "COMP_HET.prob", "COMP_HET.poss", "Individuals"];
        if (e.detail.option.toLowerCase() === "tab") {
            const dataString = [
                header.join("\t"),
                ...this.tableData.map(_ => [
                    _.name,
                    _.stats.byType.HOM_ALT,
                    _.stats.byType.COMP_HET,
                    _.stats.byType.COMP_HET.def,
                    _.stats.byType.COMP_HET.prob,
                    _.stats.byType.COMP_HET.poss,
                    _.individuals.length
                ].join("\t"))];
            UtilsNew.downloadData(dataString, this.opencgaSession.study.id + "_knockout_gene_view.txt", "text/plain");
        } else {
            UtilsNew.downloadData(JSON.stringify(this.tableData, null, "\t"), this.opencgaSession.study.id + "_knockout_gene_view.json", "application/json");
        }
    }

    getDefaultConfig() {
        return AnalysisRegistry.get("knockout").config;
    }

    render() {
        return html`
            <opencb-grid-toolbar
                .config="${this.toolbarConfig}"
                @columnChange="${this.onColumnChange}"
                @download="${this.onDownload}">
            </opencb-grid-toolbar>
            <div class="row">
                <table id="${this.gridId}"></table>
            </div>

        `;
    }

}

customElements.define("knockout-gene-grid", KnockoutGeneGrid);
