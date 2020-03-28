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
import Utils from "../../utils.js";


class CohortVariantStats extends LitElement {

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
            stats: {
                type: Array
            },
            // study: {
            //     type: String
            // },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "cvs-" + Utils.randomString(6);
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("stats")) {
            this.renderVariantTable();
        }
    }

    renderVariantTable() {
        if (typeof this.stats !== "undefined") {
            const _table = $("#" + this._prefix + "CohortStatsGrid");
            const _this = this;
            _table.bootstrapTable("destroy");
            _table.bootstrapTable({
                columns: _this._createDefaultColumns(),
                data: _this.stats,
                pagination: _this._config.pagination,
                pageSize: _this._config.pageSize,
                pageList: _this._config.pageList,
                formatLoadingMessage: () =>"<loading-spinner></loading-spinner>",

                onLoadError: function(status, res) {
                    console(status);
                    console(res);
                    console.trace();
                }
            });
        }
    }

    // FIXME numSamples is coming son to data model, remove this formatter
    numSamplesFormatter(value, row, index) {
        let total = 0;
        for (let genotype of Object.keys(row.genotypeCount)) {
            total += row.genotypeCount[genotype];
        }
        return total;
    }

    filterFormatter(value, row, index) {
        let content = "";
        for (let filter of Object.keys(row.filterFreq)) {
            let fixedFreq = row.filterFreq[filter];
            if (fixedFreq !== 0 && fixedFreq !== 1) {
                fixedFreq = Number(fixedFreq).toFixed(4);
            }
            let s = `<span style="padding-right: 20px">${filter}</span><span>${fixedFreq} (${row.filterCount[filter]})</span><br>`;
            // PASS must be the first element
            if (filter === "PASS") {
                content = s + content;
            } else {
                content += s;
            }
        }
        return content;
    }

    statsFormatter(value, row, index) {
        let freq, count;
        switch (this.field) {
            case "maf":
                freq = row.maf;
                count = row.mafAllele;
                break;
            case "ref":
                freq = row.refAlleleFreq;
                count = row.refAlleleCount;
                break;
            case "alt":
                freq = row.altAlleleFreq;
                count = row.altAlleleCount;
                break;
            case "0/0":
                freq = row.genotypeFreq["0/0"];
                count = row.genotypeCount["0/0"];
                break;
            case "0/1":
                freq = row.genotypeFreq["0/1"];
                count = row.genotypeCount["0/1"];
                break;
            case "1/1":
                freq = row.genotypeFreq["1/1"];
                count = row.genotypeCount["1/1"];
                break;
        }
        let fixedFreq = (freq !== 0 && freq !== 1) ? Number(freq).toFixed(4) : freq;
        return `${fixedFreq} (${count})`;
    }

    othersFormatter(value, row, index) {
        let str = "";
        for (let genotype of Object.keys(row.genotypeFreq)) {
            if (genotype !== "0/0" && genotype !== "0/1" && genotype !== "1/1") {
                let freq = row.genotypeFreq[genotype];
                let count = row.genotypeCount[genotype];
                let fixedFreq = (freq !== 0 && freq !== 1) ? Number(freq).toFixed(4) : freq;
                str += `${fixedFreq} (${count})<br>`;
            }
        }
        return str !== "" ? str:  "NA";
    }

    _createDefaultColumns() {
        return [
            [
                {
                    title: "Cohort ID",
                    field: "cohortId",
                    rowspan: 2,
                    colspan: 1,
                    halign: "center"
                },
                {
                    title: "MAF",
                    field: "maf",
                    rowspan: 2,
                    colspan: 1,
                    formatter: this.statsFormatter,
                    halign: "center"
                },
                {
                    title: "Quality Avg",
                    field: "qualityAvg",
                    rowspan: 2,
                    colspan: 1,
                    align: "right",
                    halign: "center"
                },
                {
                    title: "Filter",
                    rowspan: 2,
                    colspan: 1,
                    formatter: this.filterFormatter,
                    halign: "center"
                },
                {
                    title: "Number of Samples",
                    // field: "numSamples",
                    rowspan: 2,
                    colspan: 1,
                    formatter: this.numSamplesFormatter,
                    align: "right",
                    halign: "center"
                },
                {
                    title: "Allele Frequency",
                    rowspan: 1,
                    colspan: 2,
                    halign: "center"
                },
                {
                    title: "Genotype Frequency",
                    rowspan: 1,
                    colspan: 4,
                    halign: "center"
                },
            ],
            [
                {
                    title: "Reference",
                    field: "ref",
                    rowspan: 1,
                    colspan: 1,
                    formatter: this.statsFormatter,
                    halign: "center"
                },
                {
                    title: "Alternate",
                    field: "alt",
                    rowspan: 1,
                    colspan: 1,
                    formatter: this.statsFormatter,
                    halign: "center"
                },
                {
                    title: "Ref/Ref",
                    field: "0/0",
                    rowspan: 1,
                    colspan: 1,
                    formatter: this.statsFormatter,
                    halign: "center"
                },
                {
                    title: "Ref/Alt",
                    field: "0/1",
                    rowspan: 1,
                    colspan: 1,
                    formatter: this.statsFormatter,
                    halign: "center"
                },
                {
                    title: "Alt/Alt",
                    field: "1/1",
                    rowspan: 1,
                    colspan: 1,
                    formatter: this.statsFormatter,
                    halign: "center"
                },
                {
                    title: "Others",
                    rowspan: 1,
                    colspan: 1,
                    formatter: this.othersFormatter,
                    halign: "center"
                }
            ]
        ];
    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 5,
            pageList: [5, 10, 25],

            // header: {
            //     horizontalAlign: "center",
            //     verticalAlign: "bottom"
            // }
        };
    }

    render() {
        return html`
                <div>
                    <table id="${this._prefix}CohortStatsGrid" data-buttons-toolbar="#toolbar"></table>
                </div>
        `;
    }
}

customElements.define("opencga-cohort-variant-stats", CohortVariantStats);
