/*
 * Copyright 2015-2024 OpenCB
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
import GridCommons from "../../commons/grid-commons.js";
import UtilsNew from "../../../core/utils-new.js";

export default class CellbasePopulationFrequencyGrid extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            cellbaseClient: {
                type: Object
            },
            variantId: {
                type: String
            },
            populationFrequencies: {
                type: Array
            },
            assembly: {
                type: String
            },
            active: {
                type: Boolean
            }
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);

        this.populationFrequencies = [];
        this.gridId = this._prefix + "populationFreqTable";
    }

    connectedCallback() {
        super.connectedCallback();

        this.gridCommons = new GridCommons(this.gridId, this, {});
    }


    updated(changedProperties) {
        if ((changedProperties.has("populationFrequencies") || changedProperties.has("active")) && this.active) {
            this.renderPlot();
            this.renderTable();
        }

        if ((changedProperties.has("variantId") || changedProperties.has("active")) && this.active) {
            this.variantIdObserver();
        }
    }

    variantIdObserver() {
        if (this.cellbaseClient && this.variantId) {
            this.cellbaseClient.get("genomic", "variant", this.variantId, "annotation", {assembly: this.assembly}, {})
                .then(restResponse => {
                    this.populationFrequencies = restResponse.getResult(0).populationFrequencies;
                    this.requestUpdate();
                });
        }
    }

    alleleFormatter(value, row, index) {
        const refAllele = row.refAllele ? row.refAllele : "-";
        const altAllele = row.altAllele ? row.altAllele : "-";
        return refAllele + "/" + altAllele;
    }

    freqFormatter(value, count) {
        if (typeof value === "undefined") {
            return "NA";
        }
        return (value !== 0 && value !== 1) ? `<span style="margin:0 5px">${Number(value).toPrecision(4)}</span> / <span style="margin:0 5px">${count}</span> (${(value * 100).toPrecision(4)} %)` : value;
    }

    renderPlot() {
        const popArray = [];
        const mafArray = [];
        if (this.populationFrequencies) {
            for (let i = 0; i < this.populationFrequencies.length; i++) {
                popArray.push(this.populationFrequencies[i].study + "-" + this.populationFrequencies[i].population);
                mafArray.push(Math.min(Number(this.populationFrequencies[i].refAlleleFreq).toPrecision(4), Number(this.populationFrequencies[i].altAlleleFreq).toPrecision(4)));
            }
        }

        $("#" + this._prefix + "Container").highcharts({
            chart: {
                type: "bar",
                height: 100 + popArray.length * 20,
            },
            title: {
                text: "Population Frequencies"
            },
            xAxis: {
                categories: popArray,
                title: {
                    text: null
                },
                labels: {
                    style: {
                        fontSize: "10px",
                    },
                },
            },
            yAxis: {
                min: 0,
                title: {
                    text: "Minor Allele Frequency (MAF)",
                    align: "high"
                },
                labels: {
                    overflow: "justify"
                },
                max: 0.5
            },
            plotOptions: {
                bar: {
                    dataLabels: {
                        enabled: true
                    }
                }
            },
            legend: {
                layout: "vertical",
                align: "right",
                verticalAlign: "top",
                x: -10,
                y: 35,
                floating: true,
                borderWidth: 1,
                backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || "#FFFFFF"),
                shadow: true
            },
            credits: {
                enabled: false
            },
            series: [{
                name: "Minor Allele Frequency (MAF)",
                data: mafArray
            }]
        });
    }

    renderTable() {
        this.table = $("#" + this.gridId);
        this.table.bootstrapTable("destroy");
        this.table.bootstrapTable({
            theadClasses: "table-light",
            buttonsClass: "light",
            data: this.populationFrequencies,
            iconsPrefix: GridCommons.GRID_ICONS_PREFIX,
            icons: GridCommons.GRID_ICONS,
            pageSize: 5,
            showPaginationSwitch: true,
            search: true,
            showColumns: false,
            pagination: true,
            pageList: [5, 10, 25],
            showExport: true,
            formatShowingRows: this.gridCommons.formatShowingRows,
            columns: [
                [
                    {
                        title: "Study",
                        field: "study",
                        rowspan: 2,
                        colspan: 1,
                        sortable: true
                    },
                    {
                        title: "Population",
                        field: "population",
                        rowspan: 2,
                        colspan: 1
                    },
                    {
                        title: "Ref/Alt",
                        formatter: this.alleleFormatter,
                        rowspan: 2,
                        colspan: 1
                    },
                    {
                        title: "Number of Samples",
                        rowspan: 2,
                        colspan: 1,
                        formatter: (value, row) => {
                            if (row.refHomGenotypeCount || row.hetGenotypeCount || row.altHomGenotypeCount) {
                                return row.refHomGenotypeCount + row.hetGenotypeCount + row.altHomGenotypeCount;
                            } else {
                                return (row?.refAlleleCount + row?.altAlleleCount) / 2;
                            }
                        },
                        halign: "center",
                        align: "right"
                    },
                    {
                        title: "Allele Info",
                        rowspan: 1,
                        colspan: 2,
                        formatter: this.alleleFormatter,
                        halign: "center"
                    },
                    {
                        title: "Genotype Info",
                        rowspan: 1,
                        colspan: 3,
                        formatter: this.alleleFormatter,
                        halign: "center"
                    }
                ],
                [
                    {
                        title: `Reference Allele<br><span style="font-style: italic">Freq / Count (%)</span>`,
                        rowspan: 1,
                        colspan: 1,
                        sortable: true,
                        formatter: (value, row) => this.freqFormatter(row.refAlleleFreq, row.refAlleleCount),
                        halign: "center",
                        align: "right"
                    },
                    {
                        title: `Alternate Allele<br><span style="font-style: italic">Freq / Count (%)</span>`,
                        rowspan: 1,
                        colspan: 1,
                        sortable: true,
                        formatter: (value, row) => this.freqFormatter(row.altAlleleFreq, row.altAlleleCount),
                        halign: "center",
                        align: "right"
                    },
                    {
                        title: `Ref/Ref Genotype<br><span style="font-style: italic">Freq / Count (%)</span>`,
                        rowspan: 1,
                        colspan: 1,
                        sortable: true,
                        formatter: (value, row) => this.freqFormatter(row.refHomGenotypeFreq, row.refHomGenotypeCount),
                        halign: "center",
                        align: "right"
                    },
                    {
                        title: `Ref/Alt Genotype<br><span style="font-style: italic">Freq / Count (%)</span>`,
                        rowspan: 1,
                        colspan: 1,
                        sortable: true,
                        formatter: (value, row) => this.freqFormatter(row.hetGenotypeFreq, row.hetGenotypeCount),
                        halign: "center",
                        align: "right"
                    },
                    {
                        title: `Alt/Alt Genotype<br><span style="font-style: italic">Freq / Count (%)</span>`,
                        rowspan: 1,
                        colspan: 1,
                        sortable: true,
                        formatter: (value, row) => this.freqFormatter(row.altHomGenotypeFreq, row.altHomGenotypeCount),
                        halign: "center",
                        align: "right"
                    }
                ]
            ]
        });
    }

    render() {
        if (!this.populationFrequencies) {
            return html`
                <div class="alert alert-info">
                    <i class="fas fa-3x fa-info-circle align-middle"></i> No population frequencies found.
                </div>
            `;
        }

        return html`
            <div style="padding: 20px" data-cy="cellbase-population-frequency-table">
                <table id="${this.gridId}"></table>
                <div id="${this._prefix}Container"></div>
            </div>
        `;
    }

}

customElements.define("cellbase-population-frequency-grid", CellbasePopulationFrequencyGrid);
