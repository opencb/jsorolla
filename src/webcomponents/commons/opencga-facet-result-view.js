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
import UtilsNew from "../../core/utils-new.js";
import PolymerUtils from "../PolymerUtils.js";


// TODO refactor: this should preprocess data and call simple-chart

export default class OpencgaFacetResultView extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            title: {
                type: String
            },
            subtitle: {
                type: String
            },
            xAxisTitle: {
                type: String
            },
            yAxisTitle: {
                type: String
            },
            showButtons: {
                type: Boolean
            },
            facetResult: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    /*
     * Init the variables you need, keep in mind this is executed before the actual Polymer properties exist
     */
    _init() {
        // All id fields in the template must start with prefix, this allows components to be instantiated more than once
        this._prefix = "ofv" + UtilsNew.randomString(6);

        this.plotDiv = "#" + this._prefix + "Plot";

        // Initially we set the default config, this will be overridden if 'config' is passed
        this._config = this.getDefaultConfig();
    }


    updated(changedProperties) {
        if (changedProperties.has("facetResult")) {
            this.renderFacets();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.renderFacets();
        }
    }

    renderFacets() {

        this.renderHistogramChart();
    }

    // onHistogramChart() {
    //     // this.highlightActivePlot(e.target.parentElement);
    //     // let id = e.target.dataId;
    //     //TODO Refactor
    //     // debugger
    //     this.renderHistogramChart("#" + this._prefix + "Plot");
    //
    //     PolymerUtils.hide(this._prefix + "Table");
    // }

    onPieChart(e) {
        // this.highlightActivePlot(e.target.parentElement);
        // let id = e.target.dataId;
        this.renderPieChart("#" + this._prefix + "Plot");
        PolymerUtils.hide(this._prefix + "Table");
    }

    onTabularView(e) {
        // this.highlightActivePlot(e.target.parentElement);
        // let id = e.target.dataId;
        PolymerUtils.innerHTML(this._prefix + "Plot", "");
        PolymerUtils.show(this._prefix + "Table", "table");
    }


    highlightActivePlot(button) {
        // PolymerUtils.removeClass(".plots", "active");
        // PolymerUtils.addClass(button, "active");
    }

    renderHistogramChart(e) {
        PolymerUtils.hide(this._prefix + "Table");
        // PolymerUtils.removeStyleByClass("plots", "active");
        // PolymerUtils.removeClass(this._prefix + "HistogramChartButton", "active");
        PolymerUtils.removeClass(".plots", "active");
        // this.querySelector(this._prefix + "HistogramChartButton").classList.add("active");

        if (this.facetResult) {
            const params = this._getHistogramData();
            $(this.plotDiv).highcharts({
                credits: {
                    enabled: false
                },
                chart: {
                    type: "column",
                    ...this._config.chart
                },
                title: {
                    text: this.title || params.title || params.name,
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
                    categories: params.categories,
                    ...this._config.xAxis
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: this.yAxisTitle || ""
                    },
                    ...this._config.yAxis
                },
                tooltip: {
                    shared: true,
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0
                    }
                },
                series: params.series
            });
        }
    }

    renderPieChart(div, id) {
        let params;
        let renderDonut = false;
        if (UtilsNew.isNotUndefined(this.facetResult) && UtilsNew.isNotUndefined(this.facetResult.buckets[0].fields)) {
            params = this._getDonutData(id);
            renderDonut = true;
        } else {
            params = this._getPieData(id);
        }

        if (renderDonut) {
            $(this.plotDiv).highcharts({
                credits: {enabled: false},
                chart: {
                    type: "pie"
                },
                title: {
                    text: params.title || params.name
                },
                plotOptions: {
                    pie: {
                        shadow: false,
                        center: ["50%", "50%"]
                    }
                },
                series: params.series
            });
        } else {
            $(div).highcharts({
                credits: {enabled: false},
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: "pie"
                },
                title: {
                    text: params.title
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
                series: params.series
            });
        }
    }

    _getHistogramData() {

        let params;
        if (!this.facetResult?.start) {
            const field = this.facetResult;
            const obj = {
                title: field.name,
                name: field.name,
                categories: [],
                series: []
            };
            const series = {};
            const data = [];
            for (let i = 0; i < field.buckets.length; i++) {
                const bucket = field.buckets[i];
                obj.categories.push(bucket.value);
                if (UtilsNew.isNotEmptyArray(bucket.facetFields)) {
                    const nestedField = bucket.facetFields[0];
                    obj.nestedField = nestedField.name;
                    for (const nestedCountObj of nestedField.buckets) {
                        if (UtilsNew.isUndefined(series[nestedCountObj.value])) {
                            series[nestedCountObj.value] = [];
                        }
                        // It is important to push 'index' as we need to take care of the missing values
                        series[nestedCountObj.value].push({index: i, count: nestedCountObj.count});
                    }
                } else {
                    data.push(bucket.count);
                }
            }

            if (Object.keys(series).length > 0) {
                for (const key in series) {
                    if (Object.prototype.hasOwnProperty.call(series, key)) {
                        const data = [];
                        for (const countIndex of series[key]) {
                            data[countIndex.index] = countIndex.count;
                        }
                        for (let i = 0; i < data.length; i++) {
                            if (UtilsNew.isUndefined(data[i])) {
                                data[i] = 0; // Setting '0' for missing fields
                            }
                        }
                        obj.series.push({name: key, data: data});
                    }
                }
            } else {
                obj.series.push({name: field.name, data: data});
            }
            params = obj;
        } else {
            const range = this.facetResult;
            const obj = {
                name: range.name,
                title: this.fieldNamesMap[range.name] || range.name,
                categories: [],
                series: []
            };
            const data = [];
            let start = Number(range.start);
            for (const rangeCount of range.counts) {
                if (Math.round(start) !== start) {
                    start = Number(start.toFixed(1));
                }
                let end = Number(start + range.gap);
                if (Math.round(end) !== end) {
                    end = Number(end.toFixed(1));
                }
                obj.categories.push(start + "-" + end);
                data.push(rangeCount);
                start = end;
            }
            obj.series.push({name: range.name, data: data});
            params = obj;
        }
        return params;
    }

    _getPieData() {
        const field = this.facetResult;
        const pieData = {
            name: field.name,
            // title: this.fieldNamesMap[field.name],
            title: field.name,
            series: []
        };
        const data = [];
        for (const bucket of field.buckets) {
            data.push({name: bucket.value, y: bucket.count});
        }
        pieData.series.push({
            name: field.name,
            colorByPoint: true,
            data: data
        });

        return pieData;
    }

    _getDonutData() {
        const field = this.facetResult;
        const fields = field.name.split("-");
        const title = [];
        // if (fields.length > 1) {
        //     for (let name of fields) {
        //         title.push(this.fieldNamesMap[name]);
        //     }
        // } else {
        //     title.push(this.fieldNamesMap[field.name]);
        // }
        const donutData = {
            name: field.name,
            title: title.join(" - "),
            series: []
        };

        const colors = Highcharts.getOptions().colors;
        const categories = [];
        const data = [];
        for (let i = 0; i < field.buckets.length; i++) {
            const bucket = field.buckets[i];

            categories.push(bucket.value);
            const subField = bucket.fields;
            const subCategories = [];
            const subData = [];
            if (UtilsNew.isNotUndefinedOrNull(subField[0])) {
                for (const bucket of subField[0].buckets) {
                    subCategories.push(bucket.value);
                    subData.push(bucket.count);
                }
            }
            data.push({
                y: bucket.count,
                color: colors[i],
                drilldown: {
                    name: subField.name,
                    categories: subCategories,
                    data: subData,
                    color: colors[i]
                }
            });
        }
        const levelOneData = [];
        const levelTwoData = [];

        // Build the data arrays
        for (let i = 0; i < data.length; i++) {
            // add level one data
            levelOneData.push({
                name: categories[i],
                y: data[i].y,
                color: data[i].color
            });

            // add level two data
            const drillDataLen = data[i].drilldown.data.length;
            for (let j = 0; j < drillDataLen; j++) {
                const brightness = 0.2 - (j / drillDataLen) / 5;
                levelTwoData.push({
                    name: data[i].drilldown.categories[j],
                    y: data[i].drilldown.data[j],
                    color: Highcharts.Color(data[i].color).brighten(brightness).get()
                });
            }
        }

        const [levelOneField, levelTwoField] = field.name.split("-");
        donutData.series.push({
            name: levelOneField,
            data: levelOneData,
            size: "60%",
            dataLabels: {
                formatter: function () {
                    return this.y > 5 ? this.point.name : null;
                },
                color: "#ffffff",
                distance: -30
            }
        });
        donutData.series.push({
            name: levelTwoField,
            data: levelTwoData,
            size: "80%",
            innerSize: "60%",
            dataLabels: {
                formatter: function () {
                    // display only if larger than 1
                    return this.y > 1 ? "<b>" + this.point.name + ":</b> " + this.y : null;
                }
            }
        });
        return donutData;
    }

    subFieldExists(field) {
        return UtilsNew.isNotEmpty(field);
    }

    fieldExists(countObj) {
        return UtilsNew.isNotUndefined(countObj.field);
    }

    countSubFields(countObj) {
        return countObj.field.counts.length + 1;
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
            subtitle: {
                text: ""
            }
        };
    }


    render() {
        if (!this.facetResult) {
            return html`
                <div><span style="font-weight: bold;color: darkorange">No facet result found</span></div>
            `;
        }

        return html`
            <div style="padding: 5px 10px">
                ${this.showButtons ?
                    html`
                        <div class="btn-group" style="float: right">
                            <span id="${this._prefix}HistogramChartButton" class="btn btn-primary plots active" @click="${this.renderHistogramChart}">
                                <i class="fas fa-chart-bar icon-padding" title="Bar Chart" data-id="${this.facetResult.name}"></i>
                            </span>
                            <span id="${this._prefix}PieChartButton" class="btn btn-primary plots" @click="${this.onPieChart}">
                                <i class="fas fa-chart-pie icon-padding" title="Pie Chart" data-id="${this.facetResult.name}"></i>
                            </span>
                        </div>` :
                    null
                }

                <div id="${this._prefix}Plot"></div>

                <!--Table-->
                <div>
                    <table id="${this._prefix}Table" class="table table-bordered" style="display: none;">
                        <!-- Facet Field Table -->
                        ${this.facetResult.category ? html`
                            <thead class="table-header bg-primary">
                                <tr>
                                    <th>${this.facetResult.title}}</th>
                                    ${this.subFieldExists(this.facetResult.subField) ? html`
                                        <th>${this.facetResult.subField}</th>
                                    ` : null}
                                    <th>Number of Variants</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.facetResult.buckets && this.facetResult.buckets ? this.facetResult.buckets.map(count => html`
                                    ${this.fieldExists(count) ? html`
                                        <tr>
                                            <td rowspan="${this.countSubFields(count)}">${count.value}</td>
                                        </tr>
                                        ${count.field.counts && count.field.counts.length ? count.field.counts.map(subFieldCount => html`
                                            <tr>
                                                <td>${subFieldCount.value}</td>
                                                <td>${subFieldCount.count}</td>
                                            </tr>
                                        `) : null}
                                    ` : html`
                                        <tr>
                                            <td>${count.value}}</td>
                                            <td>${count.count}}</td>
                                        </tr>
                                    `}
                                `) : null}

                            </tbody>
                        ` : html`
                        <!-- Facet Range Table -->
                        <thead class="table-header bg-primary">
                            <tr>
                                <th>Range</th>
                                <th>Number of Variants</th>
                            </tr>
                            </thead>
                            <tbody>
                            ${this.facetResult.data && this.facetResult.data.length ? this.facetResult.data.map(data => html`
                                <tr>
                                    <td>${data.range}</td>
                                    <td>${data.count}</td>
                                </tr>
                            `) : null}
                        </tbody>
                       `}
                    </table>
                </div>
            </div>
        `;
    }

}

customElements.define("opencga-facet-result-view", OpencgaFacetResultView);

