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

import {html, LitElement} from "lit";
import UtilsNew from "../../core/utils-new.js";


class VariantCohortStatsGrid extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            stats: {
                type: Array
            },
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("stats")) {
            this.renderCohortStatsTable();
        }
    }

    renderCohortStatsTable() {
        if (this.stats) {
            // Sort Cohorts. Cohort 'ALL' must be the first one.
            this.stats = this.stats.sort((a, b) => a.cohortId.localeCompare(b.cohortId));
            const cohortAllIndex = this.stats.findIndex(c => c.cohortId === "ALL");
            const cohortAll = this.stats[cohortAllIndex];
            this.stats[cohortAllIndex] = this.stats[0];
            this.stats[0] = cohortAll;

            const table = $("#" + this._prefix + "CohortStatsGrid");
            // const _this = this;
            table.bootstrapTable("destroy");
            table.bootstrapTable({
                data: this.stats,
                columns: this._createDefaultColumns(),
                pagination: this._config.pagination,
                pageSize: this._config.pageSize,
                pageList: this._config.pageList,
                formatLoadingMessage: () =>"<loading-spinner></loading-spinner>",
                onLoadError: (status, res) => {
                    console.log(status);
                    console.log(res);
                }
            });
        }
    }

    numSamplesFormatter(value, row) {
        if (row.sampleCount > 0) {
            return row.sampleCount;
        } else {
            let total = 0;
            for (const genotype of Object.keys(row.genotypeCount)) {
                total += row.genotypeCount[genotype];
            }
            return total || "NA";
        }
    }

    filterFormatter(value, row) {
        let content = "";
        for (const filter of Object.keys(row.filterFreq)) {
            let freq = row.filterFreq[filter];
            if (freq !== 0 && freq !== 1) {
                freq = Number(freq).toPrecision(4);
            }
            const s = `
                <span style="padding-right: 20px">${filter}</span>
                <span>${freq} (${row.filterCount[filter]})</span><br>
            `;

            // PASS must be the first element
            if (filter === "PASS") {
                content = s + content;
            } else {
                content += s;
            }
        }
        return content;
    }

    idFormatter(value) {
        return `<span style="font-weight: bold">${value}</span>`;
    }

    statsFormatter(value, row) {
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
        const formattedFreq = (freq !== 0 && freq !== 1) ? Number(freq).toPrecision(5) : freq;
        if (formattedFreq >= 0) {
            return `${formattedFreq} (${count})`;
        } else {
            return "NA";
        }
    }

    othersFormatter(value, row) {
        let str = "";
        for (const genotype of Object.keys(row.genotypeFreq)) {
            if (genotype !== "0/0" && genotype !== "0/1" && genotype !== "1/1") {
                const freq = row.genotypeFreq[genotype];
                const count = row.genotypeCount[genotype];
                const fixedFreq = (freq !== 0 && freq !== 1) ? Number(freq).toPrecision(5) : freq;
                str += `<span style="margin: 0 5px">${genotype}:</span> ${fixedFreq} (${count})<br>`;
            }
        }
        // Check if missing alleles exist and add them to the string
        if (row.missingGenotypeCount > 0) {
            str += `<span style="margin: 0 5px">./.:</span> ${(row.missingGenotypeCount / row.sampleCount).toPrecision(4)}(${row.missingGenotypeCount})<br>`;
        }
        return str || "NA";
    }

    _createDefaultColumns() {
        return [
            [
                {
                    title: "Cohort ID",
                    field: "cohortId",
                    rowspan: 2,
                    colspan: 1,
                    formatter: this.idFormatter,
                    halign: "center"
                },
                {
                    title: "MAF (Allele)",
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
                    title: `Filter<br><span class="help-block" style="margin: 0">Frequency (Count)</span>`,
                    rowspan: 2,
                    colspan: 1,
                    formatter: this.filterFormatter,
                    halign: "center"
                },
                {
                    title: "Number of Samples",
                    // field: "sampleCount",
                    rowspan: 2,
                    colspan: 1,
                    formatter: this.numSamplesFormatter,
                    align: "right",
                    halign: "center"
                },
                {
                    title: `Allele Frequency<br><span class="help-block" style="margin: 0">Frequency (Count)</span>`,
                    rowspan: 1,
                    colspan: 2,
                    halign: "center"
                },
                {
                    title: `Genotype Frequency<br><span class="help-block" style="margin: 0">Frequency (Count)</span>`,
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

    render() {
        return html`
            <div>
                <table id="${this._prefix}CohortStatsGrid" data-buttons-toolbar="#toolbar"></table>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 25],
        };
    }

}

customElements.define("variant-cohort-stats-grid", VariantCohortStatsGrid);
