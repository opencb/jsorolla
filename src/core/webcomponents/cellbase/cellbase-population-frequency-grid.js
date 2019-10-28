/**
 * Copyright 2015-2019 OpenCB
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

import {LitElement, html} from '/web_modules/lit-element.js';

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
            data: {
                type: Array
            },
            prefix: {
                type: String
            }
        }
    }

    _init(){
        this._prefix = "cpfg-" + Utils.randomString(6) + "_";
        this.data = [];
    }

    //it was render();
    update() {
        let popArray = [];
        let mafArray = [];
        if (typeof this.data !== "undefined") {
            for (let i = 0; i < this.data.length; i++) {
                popArray.push(this.data[i].study + "-" + this.data[i].population);
                mafArray.push(Math.min(Number(this.data[i].refAlleleFreq).toFixed(3), Number(this.data[i].altAlleleFreq).toFixed(3)));
            }
        }

        $('#' + this.prefix + 'Container').highcharts({
            chart: {
                type: 'bar'
            },
            title: {
                text: 'Population Frequencies'
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
                    text: 'Minor Allele Frequency (MAF)',
                    align: 'high'
                },
                labels: {
                    overflow: 'justify'
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
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'top',
                x: -40,
                y: 80,
                floating: true,
                borderWidth: 1,
                backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
                shadow: true
            },
            credits: {
                enabled: false
            },
            series: [{
                name: 'Minor Allele Frequency (MAF)',
                data: mafArray
            }]
        });

        // Population grid definition
        $('#' + this.prefix + 'populationFreqTable').bootstrapTable('destroy');
        $('#' + this.prefix + 'populationFreqTable').bootstrapTable({
            data: this.data,
            pageSize: 5,
            columns: [
                [
                    {
                        title: 'Study',
                        field: 'study',
                        sortable: true
                    },
                    {
                        title: 'Population',
                        field: 'population'
                    },
                    {
                        title: 'Ref/Alt',
                        formatter: this.alleleFormatter
                    },
                    {
                        title: 'RefAlleleFreq',
                        field: 'refAlleleFreq',
                        sortable: true,
                        formatter: this.numFormatter
                    },
                    {
                        title: 'AltAlleleFreq',
                        field: 'altAlleleFreq',
                        sortable: true,
                        formatter: this.numFormatter
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
            return Number(row.refAlleleFreq).toFixed(3);
        } else if (this.field === "altAlleleFreq") {
            return Number(row.altAlleleFreq).toFixed(3);
        }
    }

    render() {
        return html`
        <style include="jso-styles"></style>

        <div style="padding: 10px; ">
            <table id="${this.prefix}populationFreqTable" data-search="true" data-show-columns="true" data-pagination="true" data-page-list="[5, 15, 30]"
                   data-show-pagination-switch="true" data-show-export="true" data-icons-prefix="fa" data-icons="icons">
                <thead style="background-color: #eee"></thead>
            </table>
            <div id="${this.prefix}Container"></div>
        </div>
        `;
    }
}

customElements.define('cellbase-population-frequency-grid',CellbasePopulationFrequencyGrid);
