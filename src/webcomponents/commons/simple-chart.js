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
import UtilsNew from "../../core/utilsNew.js";


export default class SimpleChart extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            active: {
                type: Boolean,
            },
            type: {
                type: String,
            },
            title: {
                type: String,
            },
            subtitle: {
                type: String,
            },
            data: {
                type: Object,
            },
            xAxisTitle: {
                type: String,
            },
            yAxisTitle: {
                type: String,
            },
            showButtons: {
                type: Boolean,
            },
            colors: {
                type: Object,
            },
            config: {
                // This must be a valid Highcharts configuration object
                type: Object,
            },
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);

        // Initially we set the default config, this will be overridden if 'config' is passed
        this._config = this.getDefaultConfig();
        this.type = "column";
        this.colors = {};
    }

    updated(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }

        if (changedProperties.has("type") || changedProperties.has("data") || changedProperties.has("config")) {
            if (this.type && this.data) {
                switch (this.type) {
                    case "column":
                        this.renderColumnChart();
                        break;
                    case "bar":
                        this.renderBarChart();
                        break;
                    case "pie":
                        this.renderPieChart();
                        break;
                    default:
                        throw new Error("Chart type not supported");
                }
            }
        }
    }

    renderColumnChart() {
        Highcharts.chart(this._prefix + "chart", {
            chart: {
                type: "column",
                ...this._config.chart
            },
            title: {
                text: this.title,
                ...this._config.title
            },
            subtitle: {
                text: this.subtitle,
                ...this._config.subtitle
            },
            xAxis: {
                title: {
                    text: this.xAxisTitle || ""
                },
                label: {
                    enabled: true
                },
                crosshair: true,
                ...this._config.xAxis
            },
            yAxis: {
                title: {
                    text: this.yAxisTitle || ""
                },
                min: 0,
                ...this._config.yAxis
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0
                },
                ...this._config.plotOptions
            },
            series: Object.entries(this.data).map(([name, data]) => ({
                name: name,
                // TODO Proper fix after facet-result-view refactor.
                // Most of the variant stats are Maps with a single datapoint, in other cases we need an array (facets)
                data: Array.isArray(data) ? data : [data],
                color: this.colors[name] ? this.colors[name] : undefined,
            })),
            credits: {
                enabled: false
            },
        });
    }

    renderBarChart() {
        Highcharts.chart(this._prefix + "chart", {
            chart: {
                type: "bar",
                ...this._config.chart,
            },
            title: {
                text: this.title,
                ...this._config.title,
            },
            subtitle: {
                text: this.subtitle,
                ...this._config.subtitle,
            },
            xAxis: {
                title: {
                    text: this.xAxisTitle || "",
                },
                label: {
                    enabled: true,
                },
                crosshair: true,
                // categories: Object.keys(this.data).map(elem => elem),
                ...this._config.xAxis,
            },
            yAxis: {
                title: {
                    text: this.yAxisTitle || "",
                },
                min: 0,
                ...this._config.yAxis,
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0,
                },
                ...this._config.plotOptions,
            },
            series: Object.entries(this.data).map(([name, data]) => ({
                name: name,
                // TODO Proper fix after facet-result-view refactor.
                // Most of the variant stats are Maps with a single datapoint, in other cases we need an array (facets)
                data: Array.isArray(data) ? data : [data],
                color: this.colors[name] ? this.colors[name] : undefined,
            })),
            credits: {
                enabled: false,
            },
        });
    }

    renderPieChart() {
        Highcharts.chart(this._prefix + "chart", {
            chart: {
                type: "pie",
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
            },
            title: {
                text: this.title,
                ...this._config.title,
            },
            subtitle: {
                text: this.subtitle,
                ...this._config.subtitle,
            },
            accessibility: {
                point: {
                    valueSuffix: "%",
                },
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: "pointer",
                    dataLabels: {
                        enabled: false,
                    },
                    showInLegend: true,
                },
                ...this._config.plotOptions,
            },
            series: [
                {
                    data: Object.entries(this.data).map(([name, data]) => ({name: name, y: data})),
                }
            ],
            credits: {
                enabled: false,
            },
        });
    }

    render() {
        return html`
            <div id="${this._prefix}chart"></div>
        `;
    }

    getDefaultConfig() {
        return {
            chart: {
                backgroundColor: {
                    // linearGradient: [0, 0, 500, 500],
                    stops: [
                        [0, "rgb(255, 255, 255)"],
                        [1, "rgb(240, 240, 255)"]
                    ]
                },
                borderWidth: 0,
                // plotBackgroundColor: "rgba(255, 255, 255, .9)",
                plotShadow: true,
                plotBorderWidth: 1
            },
        };
    }

}

customElements.define("simple-chart", SimpleChart);
