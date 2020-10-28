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
import GridCommons from "../grid-commons.js";
import UtilsNew from "./../../../utilsNew.js";
import "../../commons/analysis/opencga-analysis-tool.js";
import AnalysisRegistry from "./analysis-registry.js";
import knockoutData from "./test/knockout.20201021003108.inXESR.js";
import "../../commons/filters/select-field-filter.js";

export default class OpencgaKnockoutAnalysisResult extends LitElement {

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
            config: {
                type: Object
            },
            job: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "oga-" + UtilsNew.randomString(6);

        this._config = this.getDefaultConfig();

        this.data = knockoutData;

        this.LIMIT = 50; //temp limit for both rows and cols

        this.gridId = this._prefix + "KnockoutGrid";
        this.preprocess()
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);

    }

    firstUpdated(_changedProperties) {
        this.renderTable()
    }

    preprocess() {
        let i = 0;
        this._data = {};
        this.samples = []
        for (let a = 0; a < this.data.length; a++) {
            const sample = this.data[a];
            for (let b = 0; b < sample.genes.length; b++) {
                const gene = sample.genes[b];
                for (let c = 0; c < gene.transcripts.length; c++) {
                    const transcript = gene.transcripts[c];
                    for (let d = 0; d < transcript.variants.length; d++) {
                        const variant = transcript.variants[d];
                        //console.log(variant.id)
                        this.samples.push(sample)
                        if (this._data[variant.id]) {
                            this._data[variant.id].push({sampleId: sample.sampleId, variant: variant});
                        } else {
                            this._data[variant.id] = [{sampleId: sample.sampleId, variant: variant}];
                        }
                        i++
                    }
                }
            }
        }
        this.samples = [...new Set(this.samples)];
        this.tableData = Object.entries(this._data).splice(0,this.LIMIT).map( ([variant, samples]) => ({
            variantId: variant,
            data: samples
        }))
        this.renderTable()

    }

    renderTable() {
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            data: this.tableData,
            columns: this._initTableColumns(),
            sidePagination: "local",
            // Set table properties, these are read from config property
            uniqueId: "variantId",
            //pagination: this._config.pagination,
            //pageSize: this._config.pageSize,
            //pageList: this._config.pageList,
            paginationVAlign: "both",
            //formatShowingRows: this.gridCommons.formatShowingRows,
            gridContext: this,
            formatLoadingMessage: () =>"<div><loading-spinner></loading-spinner></div>",
            onClickRow: (row, selectedElement, field) => this.gridCommons.onClickRow(row.id, row, selectedElement)
        });
    }

    _initTableColumns() {
        return [
            {title: "", field: "variantId"},
            ...this.samples.slice(0,this.LIMIT).map(sample => {
                return {
                    title: `Sample ${sample.sampleId}`,
                    field: "data",
                    formatter: r => {
                        return r.find( a => a.sampleId === sample.sampleId)?.variant?.knockoutType
                    }
                }
            })];
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

    onColumnChange(e) {
        e.detail.id = e.detail.value;
        this.gridCommons.onColumnChange(e);
    }

    getDefaultConfig() {
        return AnalysisRegistry.get("knockout").config;
    }

    render() {
        return html`
            <div class="container-fluid">
                <div class="row">
                    <div class="col-md-2 pull-right">
                        <div style="padding: 20px 0">
                            <select-field-filter .liveSearch=${true} multiple .data="${this.samples?.map(sample => sample.sampleId)}" @filterChange="${e => this.onColumnChange(e)}"></select-field-filter>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <table id="${this.gridId}"></table>
                </div>
            </div>
            
        `;
    }

}

customElements.define("opencga-knockout-analysis-result", OpencgaKnockoutAnalysisResult);
