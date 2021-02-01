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
import UtilsNew from "../../../utilsNew.js";
import CatalogGridFormatter from "../../commons/catalog-grid-formatter.js";
import GridCommons from "../../commons/grid-commons.js";
import "../../family/opencga-family-view.js";
import "../../variant/annotation/cellbase-population-frequency-grid.js";
import "../../variant/annotation/variant-annotation-clinical-view.js";
import "./rga-variant-individual-grid.js";
import "./rga-variant-allele-pairs.js";

export default class RgaVariantGrid extends LitElement {

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
        this._prefix = "rag-v-" + UtilsNew.randomString(6);
        this.active = false;
        this.gridId = this._prefix + "RgaVariantGrid";
        this.rendered = false;
        this.variantId = null;

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
            columns: this._initTableColumns()[0]
        };
    }

    firstUpdated(_changedProperties) {
    }

    updated(changedProperties) {
        console.log("this.active", this.active)
        if ((changedProperties.has("opencgaSession") || changedProperties.has("query") || changedProperties.has("config") || changedProperties.has("active")) && this.active) {
            console.log("renderTable")
            this.renderTable();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.requestUpdate();
        }

        // TODO in this case update doesn't work
        //super.update(changedProperties);

    }

    prepareData() {
        console.log("preparedData", this.data)
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

    }

    _initTableColumns() {
        return [
            {title: "Variant", field: "id"},
            {title: "dbSNP", field: "dbSNP"},
            {title: "Alt allele freq.", field: ""},
            {title: "Variant type", field: ""},
            {title: "Consequence type", field: "consequenceType"},
            {title: "ClinVar", field: ""},
            {
                title: "Individuals",
                field: "individuals",
                formatter: this.individualFormatter.bind(this)

            }
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
            })*/];
    }

    onColumnChange(e) {
        const ids = e.detail.value ?? "";
        this.table.bootstrapTable("hideAllColumns");
        this.table.bootstrapTable("showColumn", ["id", "dbSNP", "consequenceType", "individuals"]);
        if (ids) {
            ids.split(",").forEach(id => this.table.bootstrapTable("showColumn", id));
        }

    }

    // TODO FIXME at the moment it takes into account the first variant of the first transcript of the first gene
    individualFormatter(value, row) {

        //return value.map(individual => individual.genes[0].transcripts[0].variants[0].knockoutType)
        const typeToColor = {
            "HOM_ALT": "#5b5bff",
            "CH": "blue"
        };
        /*const samplesTableData = this.samples.map(sample => ({id: sample.sampleId}));
        for (const {sampleId, variant} of row.data) {
            if (variant.id === row.id) {
                const c = samplesTableData.find(sample => sample.id === sampleId);
                c.knockoutType = variant.knockoutType;
            }
        }*/
        return `
            <table>
                <tr>
                    ${value.map(sample => `
                        <td style="width: 15px; background: ${typeToColor[sample.genes[0].transcripts[0].variants[0].knockoutType] ?? "#fff"}; border-right: 1px solid white;">
                            <a style="border:1px solid #b7b7b7;display: block" tooltip-title="${sample.id}" tooltip-text="${sample.id}">&nbsp;</a>
                        </td>
                    `).join("")}
                </tr>
            </table>`;
    }

    renderTable() {


        this._query = {...this.query, study: this.opencgaSession.study.fqn}; // we want to support a query obj param both with or without study.
        console.log("UtilsNew.objectCompare(this._query, this.prevQuery)", UtilsNew.objectCompare(this._query, this.prevQuery))
        if (!this.active || UtilsNew.objectCompare(this._query, this.prevQuery)) {
            return;
        }

        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            // data: this.tableData,
            columns: this._initTableColumns(),
            method: "get",
            sidePagination: "server",
            uniqueId: "id",
            // pageSize: this._config.pageSize,
            // pageList: this._config.pageList,
            pagination: true,
            paginationVAlign: "both",
            // formatShowingRows: this.gridCommons.formatShowingRows,
            gridContext: this,
            formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
            ajax: params => {
                const _filters = {
                    study: this.opencgaSession.study.fqn,
                    //order: params.data.order,
                    // limit: params.data.limit,
                    //skip: params.data.offset || 0,
                    //count: !this.table.bootstrapTable("getOptions").pageNumber || this.table.bootstrapTable("getOptions").pageNumber === 1,
                    ...this._query,
                    geneName: "BRCA2",
                    limit: 2
                };
                this.opencgaSession.opencgaClient.clinical().queryRgaVariant(_filters)
                    .then(res => {
                        console.log("res", res)
                        //this.data = res.getResults();
                        //this.prepareData();
                        params.success(res)
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
                this.variant = row;
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
                    this.variant = data[0];
                }
                this.requestUpdate();
            }

        });
    }

    onDownload(e) {

    }

    getDefaultConfig() {
    }

    getDetailConfig() {
        return {
            title: "Individual",
            showTitle: true,
            items: [
                {
                    id: "individual-view",
                    name: "Individuals",
                    active: true,
                    render: (variant, active, opencgaSession) => {
                        return html`
                            <rga-variant-individual-grid .variant="${variant}"></rga-variant-individual-grid>
                        `;
                    }
                },
                {
                    id: "allele-view",
                    name: "Allele Pairs",
                    render: (variant, active, opencgaSession) => {
                        return html`
                            <rga-variant-allele-pairs .variant="${variant}"></rga-variant-allele-pairs>
                        `;
                    }
                },
                {
                    id: "clinvar-view",
                    name: "Clinical",
                    render: (variant, active, opencgaSession, cellbaseClient) => {
                        return html`
                            <variant-annotation-clinical-view   .variantId="${variant?.id}"
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
                        return html`<cellbase-population-frequency-grid .variantId="${variant?.id}"
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
        return html`
            <div class="container-fluid">
                <opencb-grid-toolbar .config="${this.toolbarConfig}"
                                 @columnChange="${this.onColumnChange}"
                                 @download="${this.onDownload}">
                </opencb-grid-toolbar>
            
                <div class="row">
                    <table id="${this.gridId}"></table>
                </div>
                <detail-tabs .data="${this.variant}" .config="${this.detailConfig}" .opencgaSession="${this.opencgaSession}" .cellbaseClient="${this.cellbaseClient}"></detail-tabs>
            </div>
        `;
    }

}

customElements.define("rga-variant-grid", RgaVariantGrid);
