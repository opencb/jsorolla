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
import UtilsNew from "../../../utilsNew.js";
import {LitElement, html} from "/web_modules/lit-element.js";
import Utils from "./../../../utils.js";
import PolymerUtils from "../../PolymerUtils.js";

//TODO fixbug querying opencga-client PhastCons - 1kG_phase3_EAS

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
            opencgaSession: {
                type: Object
            },
            cellbaseClient: {
                type: Object
            },
            facetResult: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    /**
     * Init the variables you need, keep in mind this is executed before the actual Polymer properties exist
     */
    _init() {
        // All id fields in the template must start with prefix, this allows components to be instantiated more than once
        this._prefix = "ofv" + Utils.randomString(6);

        this.plotDiv = "#" + this._prefix + "Plot";

        // Initially we set the default config, this will be overridden if 'config' is passed
        this._config = this.getDefaultConfig();
    }


    updated(changedProperties) {
        console.log("this.facetResult", this.facetResult);
        if (changedProperties.has("facetResult") || changedProperties.has("config")) {
            this.renderFacets();
        }
    }

    /*connectedCallback() {
        super.connectedCallback();

        this.renderFacets();
    }*/

    renderFacets(e, conf) {
        this._config = Object.assign(this.getDefaultConfig(), this.config);

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
        //this.querySelector(this._prefix + "HistogramChartButton").classList.add("active");


        let params = this._getHistogramData();

        $(this.plotDiv).highcharts({
            credits: {enabled: false},
            chart: {
                type: "column"
            },
            title: {
                text: params.title || params.name
            },
            xAxis: {
                categories: params.categories
            },
            yAxis: {
                min: 0,
                title: {
                    text: "Total number of Variants"
                }
            },
            tooltip: {
                headerFormat: "<span style=\"font-size:10px\">{point.key}</span><table>",
                pointFormat: "<tr><td style=\"color:{series.color};padding:0\">{series.name}: </td>" +
                    "<td style=\"padding:0\"><b>{point.y:.1f} </b></td></tr>",
                footerFormat: "</table>",
                shared: true,
                useHTML: true
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
                tooltip: {
                    pointFormat: "{series.name}: <b>{point.percentage:.1f}%</b>"
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
        if (this.facetResult.start === undefined) {
            let field = this.facetResult;
            // let fields = field.name.split("-");
            // let title = [];
            // if (fields.length > 1) {
            //     for (let name of fields) {
            //         title.push(this.fieldNamesMap[name]);
            //     }
            // } else {
            //     title.push(this.fieldNamesMap[field.name]);
            // }
            let obj = {
                title: field.name,
                name: field.name,
                categories: [],
                series: []
            };
            let series = {};
            let data = [];
            for (let i = 0; i < field.buckets.length; i++) {
                let bucket = field.buckets[i];
                obj.categories.push(bucket.value);
                if (UtilsNew.isNotEmptyArray(bucket.fields)) {
                    let nestedField = bucket.fields[0];
                    obj.nestedField = nestedField.name;
                    for (let nestedCountObj of nestedField.buckets) {
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
                for (let key in series) {
                    let data = [];
                    for (let countIndex of series[key]) {
                        data[countIndex.index] = countIndex.count;
                    }
                    for (let i = 0; i < data.length; i++) {
                        if (UtilsNew.isUndefined(data[i])) {
                            data[i] = 0; // Setting '0' for missing fields
                        }
                    }
                    obj.series.push({name: key, data: data});
                }
            } else {
                obj.series.push({name: field.name, data: data});
            }
            params = obj;
        } else if (this.facetResult.start !== undefined) {
            let range = this.facetResult;
            let obj = {
                name: range.name,
                title: this.fieldNamesMap[range.name] || range.name,
                categories: [],
                series: []
            };
            let data = [];
            let start = Number(range.start);
            for (let rangeCount of range.counts) {
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
        let field = this.facetResult;
        let pieData = {
            name: field.name,
            // title: this.fieldNamesMap[field.name],
            title: field.name,
            series: []
        };
        let data = [];
        for (let bucket of field.buckets) {
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
        let field = this.facetResult;
        let fields = field.name.split("-");
        let title = [];
        // if (fields.length > 1) {
        //     for (let name of fields) {
        //         title.push(this.fieldNamesMap[name]);
        //     }
        // } else {
        //     title.push(this.fieldNamesMap[field.name]);
        // }
        let donutData = {
            name: field.name,
            title: title.join(" - "),
            series: []
        };

        let colors = Highcharts.getOptions().colors;
        let categories = [];
        let data = [];
        for (let i = 0; i < field.buckets.length; i++) {
            let bucket = field.buckets[i];

            categories.push(bucket.value);
            let subField = bucket.fields;
            let subCategories = [];
            let subData = [];
            if (UtilsNew.isNotUndefinedOrNull(subField[0])) {
                for (let bucket of subField[0].buckets) {
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
        let levelOneData = [];
        let levelTwoData = [];

        // Build the data arrays
        for (let i = 0; i < data.length; i++) {
            // add level one data
            levelOneData.push({
                name: categories[i],
                y: data[i].y,
                color: data[i].color
            });

            // add level two data
            let drillDataLen = data[i].drilldown.data.length;
            for (let j = 0; j < drillDataLen; j++) {
                let brightness = 0.2 - (j / drillDataLen) / 5;
                levelTwoData.push({
                    name: data[i].drilldown.categories[j],
                    y: data[i].drilldown.data[j],
                    color: Highcharts.Color(data[i].color).brighten(brightness).get()
                });
            }
        }

        let [levelOneField, levelTwoField] = field.name.split("-");
        donutData.series.push({
            name: levelOneField,
            data: levelOneData,
            size: "60%",
            dataLabels: {
                formatter: function() {
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
                formatter: function() {
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
            property: "example property"
        };
    }


    render() {
        return html`
        <style include="jso-styles"></style>
        <div style="padding: 5px 10px">
            <!--<h3>{{facetResult.name}}</h3>-->
            <div class="btn-group" style="float: right">
                <span id="${this._prefix}HistogramChartButton" class="btn btn-primary plots active" @click="${this.renderHistogramChart}">
                    <i class="fas fa-chart-bar" style="padding-right: 5px" title="Bar Chart" data-id="${this.facetResult.name}"></i>
                </span>
                <span id="${this._prefix}PieChartButton" class="btn btn-primary plots" @click="${this.onPieChart}">
                    <i class="fas fa-chart-pie" style="padding-right: 5px" title="Pie Chart" data-id="${this.facetResult.name}"></i>
                </span>
                <!--<span id="${this._prefix}TableButton" class="btn btn-primary plots" @click="${this.onTabularView}">-->
                    <!--<i class="fa fa-table" style="padding-right: 5px" title="Tabular View" data-id="${this.facetResult.name}"></i>-->
                <!--</span>-->
            </div>
            <div id="${this._prefix}Plot"></div>

            <!--Table-->
            <br>
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
        `;
    }
}

customElements.define("opencga-facet-result-view", OpencgaFacetResultView);

