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
import Utils from "./../../../utils.js";

export default class CellbasePopulationFrequencyGrid extends LitElement {

    constructor() {
        super();

        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            populationFrequencies: {
                type: Array
            },
            active: {
                type: Boolean
            }
        }
    }

    _init() {
        this._prefix = "cpfg-" + Utils.randomString(6) + "_";
        this.populationFrequencies = [];
        this.gridId = this._prefix + "populationFreqTable"
    }

    updated(changedProperties) {
        if ((changedProperties.has("populationFrequencies") || changedProperties.has("active")) && this.active) {
            this.update2();
        }
    }

    //it was render();
    update2() {
        let popArray = [];
        let mafArray = [];
        if (typeof this.populationFrequencies !== "undefined") {
            for (let i = 0; i < this.populationFrequencies.length; i++) {
                popArray.push(this.populationFrequencies[i].study + "-" + this.populationFrequencies[i].population);
                mafArray.push(Math.min(Number(this.populationFrequencies[i].refAlleleFreq).toFixed(4), Number(this.populationFrequencies[i].altAlleleFreq).toFixed(4)));
            }
        }

        $("#" + this._prefix + "Container").highcharts({
            chart: {
                type: "bar"
            },
            title: {
                text: "Population Frequencies"
            },
            xAxis: {
                categories: popArray,
                title: {
                    text: null
                }
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
            //                        tooltip: {
            //                            valueSuffix: ' millions'
            //                        },
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
                x: -40,
                y: 80,
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

        // Population grid definition
        let _this = this;
        console.log("_this.populationFrequencies",_this.populationFrequencies)
        $("#" + this.gridId).bootstrapTable("destroy");
        $("#" + this.gridId).bootstrapTable({
            data: _this.populationFrequencies,
            pageSize: 5,
            showPaginationSwitch: true,
            search: true,
            showColumns: true,
            pagination: true,
            pageList: [5, 15, 30],
            showExport: true,
            columns: [
                [
                    {
                        title: "Study",
                        field: "study",
                        sortable: true
                    },
                    {
                        title: "Population",
                        field: "population"
                    },
                    {
                        title: "Ref/Alt",
                        formatter: _this.alleleFormatter
                    },
                    {
                        title: "RefAlleleFreq",
                        field: "refAlleleFreq",
                        sortable: true,
                        formatter: _this.numFormatter
                    },
                    {
                        title: "AltAlleleFreq",
                        field: "altAlleleFreq",
                        sortable: true,
                        formatter: _this.numFormatter
                    }
                ]
            ]
        });

    }

    alleleFormatter(value, row, index) {
        return row.refAllele + "/" + row.altAllele;
    }

    numFormatter(value, row, index) {
        if (this.field === "refAlleleFreq") {
            return Number(row.refAlleleFreq).toFixed(4);
        } else if (this.field === "altAlleleFreq") {
            return Number(row.altAlleleFreq).toFixed(4);
        }
    }

    render() {
        if (this.populationFrequencies === undefined) {
            return;
        }
        return html`
            <div style="padding: 10px;">
                <table id="${this.gridId}">
                </table>
                <div id="${this._prefix}Container"></div>
            </div>
        `;
    }

}

customElements.define("cellbase-population-frequency-grid", CellbasePopulationFrequencyGrid);
