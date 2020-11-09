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
import CatalogGridFormatter from "../../../commons/catalog-grid-formatter.js";
import AnalysisRegistry from "../analysis-registry.js";
import GridCommons from "../../grid-commons.js";
import knockoutData from "../test/knockout.20201029141213.SChLEA.js";
import "./knockout-individual-variants.js";
import "../../../family/opencga-family-view.js";


export default class KnockoutVariantView extends LitElement {

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
        this.data = knockoutData;
        this.LIMIT = 50; //temp limit for both rows and cols
        this.colToShow = 2;
        this.gridId = this._prefix + "KnockoutGrid";
        this.prepareData();
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);
        this.catalogGridFormatter = new CatalogGridFormatter(this.opencgaSession);
        this.detailConfig = this.getDetailConfig();
        this.individual = null;
        this.toolbarConfig = {
            columns: this._initTableColumns()[0]
        };
    }

    firstUpdated(_changedProperties) {
        this.renderTable();
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.renderTable();
            this.requestUpdate();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.requestUpdate();
        }
    }

    prepareData() {
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
                        //console.log(variant.id)
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
        this.tableData = Object.entries(this._data).splice(0, this.LIMIT).map(([variant, samples]) => ({
            variantId: variant,
            data: samples
        }));
        this.renderTable();

    }

    _initTableColumns() {
        return [
            {title: "Variant", field: "variantId"},
            {title: "dbSNP", field: "dbSNP"},
            {title: "Alt allele freq.", field: ""},
            {title: "Variant type", field: ""},
            {title: "Consequence Type", field: "consequenceType"},
            {title: "ClinVar", field: ""},
            ...this.samples.map(sample => {
                return {
                    title: `Sample ${sample.sampleId}`,
                    field: sample.sampleId,
                    visible: !!~this.activeSamples.indexOf(sample.sampleId),
                    formatter: (v, row) => {
                        return row.data.find(a => a.sampleId === sample.sampleId)?.variant?.knockoutType;
                        //return JSON.stringify(v)
                    }
                };
            })];
    }

    onColumnChange(e) {
        const ids = e.detail.value ?? "";
        this.table.bootstrapTable("hideAllColumns");
        this.table.bootstrapTable("showColumn", ["variantId", "dbSNP", "consequenceType"]);
        if (ids) {
            ids.split(",").forEach(id => this.table.bootstrapTable("showColumn", id));
        }

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
                //this.individual = {id: row.sampleId, ...row}; //TODO temp fix for missing id
                this.gridCommons.onClickRow(row.id, row, selectedElement);
                this.requestUpdate();
            },
            onLoadSuccess: data => {
                // this is not triggered in case of static data
            },
            onLoadError: (e, restResponse) => this.gridCommons.onLoadError(e, restResponse),
            onPostBody: data => {
                // We call onLoadSuccess to select first row
                this.gridCommons.onLoadSuccess({rows: data, total: data.length});
                //this.individual = {id: data[0].sampleId, ...data[0]}; //TODO temp fix for missing id
                this.requestUpdate();

            }

        });
    }

    onDownload(e) {
        console.log(e)
        const header = ["Variant", "dbSNP"];
        if (e.detail.option.toLowerCase() === "tab") {
            const dataString = [
                header.join("\t"),
                ...this.tableData.map(_ => [
                    _.variantId,
                    _.dbSNP
                ].join("\t"))];
            UtilsNew.downloadData(dataString, "knockout_variant_view" + this.opencgaSession.study.id + ".txt", "text/plain");
        } else {
            UtilsNew.downloadData(JSON.stringify(this.tableData, null, "\t"), "knockout_variant_view" + this.opencgaSession.study.id + ".json", "application/json");
        }
    }

    getDefaultConfig() {
        return AnalysisRegistry.get("knockout").config;
    }

    /*getDetailConfig() {
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
                        return html`<opencga-family-view .individualId="${individual.id}" .opencgaSession="${opencgaSession}"></opencga-family-view>`;
                    }
                }, {
                    render: (individual, active, opencgaSession) => {
                        return html`<cellbase-population-frequency-grid .populationFrequencies="${1 || this.variant.annotation.populationFrequencies}"
                                                                        .active="${active}">
                                    </cellbase-population-frequency-grid>`
                    }
                }
            ]
        };
    }*/

    render() {
        return html`

            <div class="container-fluid">
                <div class="row">
                    <div class="col-md-2 pull-right">
                        <div style="padding: 20px 0">
                            <select-field-filter .liveSearch=${true} multiple .data="${this.samples?.map(sample => sample.sampleId)}" .value="${this.activeSamples}" @filterChange="${e => this.onColumnChange(e)}"></select-field-filter>
                        </div>
                    </div>
                </div>
                
                <opencb-grid-toolbar .config="${this.toolbarConfig}"
                                 @columnChange="${this.onColumnChange}"
                                 @download="${this.onDownload}">
                </opencb-grid-toolbar>
            
                <div class="row">
                    <table id="${this.gridId}"></table>
                </div>
                <!--<detail-tabs .data="${this.individual}" .config="${this.detailConfig}" .opencgaSession="${this.opencgaSession}"></detail-tabs> -->

            </div>
        `;
    }

}

customElements.define("knockout-variant-view", KnockoutVariantView);
