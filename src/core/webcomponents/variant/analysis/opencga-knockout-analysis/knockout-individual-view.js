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

import {LitElement, html} from "/web_modules/lit-element.js";
import UtilsNew from "../../../../utilsNew.js";
import AnalysisRegistry from "../analysis-registry.js";
import GridCommons from "../../grid-commons.js";
import knockoutDataIndividuals from "../test/knockout.20201103172343.kFIvpr.individuals.js";
import "./knockout-individual-variants.js";
import "../../../family/opencga-family-view.js";

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
            job: {
                type: Object
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
        this.prepareData();
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);

        this.detailConfig = this.getDetailConfig();

        this.individual = null
    }

    firstUpdated(_changedProperties) {
        this.renderTable();
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.job = null;
        }

        /*if (changedProperties.has("job") && this.opencgaSession) {
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
        console.log(knockoutDataIndividuals);
        this.tableData = knockoutDataIndividuals;
    }

    renderTable() {
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            data: this.tableData,
            columns: this._initTableColumns(),
            sidePagination: "local",
            // Set table properties, these are read from config propertyparticularly tough
            uniqueId: "id",
            //pagination: this._config.pagination,
            //pageSize: this._config.pageSize,
            //pageList: this._config.pageList,
            paginationVAlign: "both",
            //formatShowingRows: this.gridCommons.formatShowingRows,
            gridContext: this,
            formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
            onClickRow: (row, selectedElement, field) => {
                this.individual = {id: row.sampleId, ...row}; //TODO temp fix for missing id
                this.gridCommons.onClickRow(row.id, row, selectedElement)
                this.requestUpdate();
            },
            onLoadSuccess: data => {
                // this is not triggered in case of static data
            },
            onLoadError: (e, restResponse) => this.gridCommons.onLoadError(e, restResponse),
            onPostBody: data => {
                // We call onLoadSuccess to select first row
                this.gridCommons.onLoadSuccess({rows: data, total: data.length});
                this.individual = {id: data[0].sampleId, ...data[0]}; //TODO temp fix for missing id
                this.requestUpdate();

            }

        });
    }

    _initTableColumns() {
        return [
            {
                title: "Individual Id",
                field: "sampleId"
            },
            {
                title: "Sample",
                field: "sampleId"
            },
            {
                title: "Homozygous",
                field: "stats.byType.HOM_ALT"
            },
            {
                title: "Compound Heterozygous",
                field: "stats.byType.COMP_HET"
            }
        ];
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
                },{
                    id: "family-view",
                    name: "Family",
                    render: (individual, active, opencgaSession) => {
                        return html`<opencga-family-view .individualId="${individual.id}" .opencgaSessoion="${opencgaSession}"></opencga-family-view>`;
                    }
                }
            ]
        };
    }

    render() {
        return html`
            <div class="row">
                <table id="${this.gridId}"></table>
            </div>
            <detail-tabs .data="${this.individual}" .config="${this.detailConfig}" .opencgaSession="${this.opencgaSession}"></detail-tabs>
        `;
    }

}

customElements.define("knockout-individual-view", KnockoutIndividualView);
