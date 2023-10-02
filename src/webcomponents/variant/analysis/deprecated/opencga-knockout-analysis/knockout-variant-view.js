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
import knockoutData from "../test/knockout.20201029141213.SChLEA.js";
import "./knockout-individual-variants.js";
import "./knockout-variant-allele-pairs.js";
import "./knockout-variant-individual.js";
import "../../../../family/family-view.js";
import "../../../annotation/cellbase-population-frequency-grid.js";
import "../../../annotation/variant-annotation-clinical-view.js";


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
        // this.data = knockoutData;
        this.colToShow = 2;
        this.gridId = this._prefix + "KnockoutGrid";
        this.variantId = null;
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
            // this.renderTable();
            // this.requestUpdate();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.requestUpdate();
        }

        if (changedProperties.has("jobId")) {
            this.renderTable();
        }

        // TODO in this case update doesn't work
        // super.update(changedProperties);

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

    individualFormatter(value, row) {
        const typeToColor = {
            "HOM_ALT": "#5b5bff",
            "CH": "blue"
        };
        const samplesTableData = this.samples.map(sample => ({id: sample.sampleId}));
        for (const {sampleId, variant} of row.data) {
            if (variant.id === row.id) {
                const c = samplesTableData.find(sample => sample.id === sampleId);
                c.knockoutType = variant.knockoutType;
            }
        }
        return `
            <table>
                <tr>
                    ${samplesTableData.map(sample => `
                        <td style="width: 15px; background: ${typeToColor[sample.knockoutType] ?? "#fff"}; border-right: 1px solid white;">
                            <a style="border:1px solid #b7b7b7;display: block" tooltip-title="${sample.id}" tooltip-text="${sample.id}">&nbsp;</a>
                        </td>
                    `).join("")}
                </tr>
            </table>`;
    }

    renderTable() {
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            theadClasses: "table-light",
            buttonsClass: "light",
            // data: this.tableData,
            columns: this._initTableColumns(),
            sidePagination: "local",
            iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
            icons: GridCommons.GRID_ICONS,
            // Set table properties, these are read from config propertyparticularly tough
            uniqueId: "id",
            // pageSize: this._config.pageSize,
            // pageList: this._config.pageList,
            pagination: true,
            paginationVAlign: "both",
            // formatShowingRows: this.gridCommons.formatShowingRows,
            gridContext: this,
            ajax: params => {
                this.opencgaSession.opencgaClient.variants().queryKnockoutIndividual({job: this.jobId, study: this.opencgaSession.study.fqn})
                    .then(restResponse => {
                        this.data = restResponse.getResults();
                        this.prepareData();
                        params.success(this.tableData);
                    }).catch(e => {
                        console.error(e);
                        params.error(e);
                    });
            },
            // formatLoadingMessage: () => "<div><loading-spinner></loading-spinner></div>",
            loadingTemplate: () => this.gridCommons.loadingFormatter(),
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
        console.log(e);
        const header = ["Variant", "dbSNP"];
        if (e.detail.option.toLowerCase() === "tab") {
            const dataString = [
                header.join("\t"),
                ...this.tableData.map(_ => [
                    _.id,
                    _.dbSNP
                ].join("\t"))];
            UtilsNew.downloadData(dataString, "knockout_variant_view" + this.opencgaSession.study.id + ".tsv", "text/plain");
        } else {
            UtilsNew.downloadData(JSON.stringify(this.tableData, null, "\t"), "knockout_variant_view" + this.opencgaSession.study.id + ".json", "application/json");
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
                    name: "Individuals",
                    active: true,
                    render: (variant, active, opencgaSession) => {
                        return html`
                            <knockout-variant-individual .variant="${variant}"></knockout-variant-individual>
                        `;
                    }
                },
                {
                    id: "allele-view",
                    name: "Allele Pairs",
                    render: (variant, active, opencgaSession) => {
                        return html`
                            <knockout-variant-allele-pairs .variant="${variant}"></knockout-variant-allele-pairs>
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

        if (!this.opencgaSession) {
            return "";
        }

        return html`
            <div class="container-fluid">
                <!--<div class="row">
                    <div class="col-md-2 pull-right">
                        <div style="padding: 20px 0">
                            <select-field-filter
                                .liveSearch=\${true} multiple
                                .data="\${this.samples?.map(sample => sample.sampleId)}"
                                .value="\${this.activeSamples}" @filterChange="\${e => this.onColumnChange(e)}">
                            </select-field-filter>
                        </div>
                    </div>
                </div> -->

                <opencb-grid-toolbar
                    .config="${this.toolbarConfig}"
                    @columnChange="${this.onColumnChange}"
                    @download="${this.onDownload}">
                </opencb-grid-toolbar>

                <div class="row">
                    <table id="${this.gridId}"></table>
                </div>
                <detail-tabs
                    .data="${this.variant}"
                    .config="${this.detailConfig}"
                    .opencgaSession="${this.opencgaSession}"
                    .cellbaseClient="${this.cellbaseClient}">
                </detail-tabs>
            </div>
        `;
    }

}

customElements.define("knockout-variant-view", KnockoutVariantView);
