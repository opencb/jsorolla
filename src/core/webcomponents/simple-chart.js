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

import {LitElement, html} from "/web_modules/lit-element.js";
import UtilsNew from "../utilsNew.js";

export default class SimpleChart extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            active: {
                type: Boolean
            },
            title: {
                type: String
            },
            data: {
                type: Object
            },
            type: {
                type: String
            }
        }
    }

    _init(){
        this._prefix = "plot-" + UtilsNew.randomString(6) + "_";
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    firstUpdated(_changedProperties) {
        if(this.type && this.data) {
            switch (this.type) {
                case "column":
                    this.barChart({title: this.title, data: this.data});
                    break;
                case "pie":
                    this.pieChart({title: this.title, data: this.data});
                    break;
                default:
                    throw new Error("Plot type not supported");
            }
        }
    }

    updated(changedProperties) {
        if(changedProperties.has("property")) {
            //this.propertyObserver();
        }
    }

    barChart(param) {
        Highcharts.chart(this._prefix + "chart", {
            chart: {
                type: "column"
            },
            title: {
                text: param.title
            },
            xAxis: {
                //categories: param.categories,
                label: {
                    enabled: true
                },
                crosshair: true
            },
            yAxis: {
                type: "logarithmic",
                title: {
                    text: ''
                }
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0
                }
            },
            credits: {
                enabled: false
            },
            series: Object.entries(this.data).map( ([name, data]) => ({name: name, data: [data]}))
            /*series: [{
                colorByPoint: true,
                name: "caca",
                data: param.data
            }]*/
        });
    }

    pieChart(param) {
        Highcharts.chart(this._prefix + "chart", {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: "pie"
            },
            title: {
                text: param.title
            },
            tooltip: {
                //pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },

            credits: {
                enabled: false
            },
            accessibility: {
                point: {
                    valueSuffix: "%"
                }
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: "pointer",
                    dataLabels: {
                        enabled: false
                    },
                    showInLegend: true
                }
            },
            series: [
                {
                    data: Object.entries(this.data).map( ([name, data]) => ({name: name, y: data}))
                }
            ]
    });
    }

    getDefaultConfig() {
        return {
        }
    }

    render() {
        return html`
        <div id="${this._prefix}chart"></div>
        `;
    }

}

customElements.define("simple-chart", SimpleChart);
