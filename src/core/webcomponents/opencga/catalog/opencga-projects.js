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
import { CountUp } from '/node_modules/countup.js/dist/countUp.min.js';

export default class OpencgaProjects extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaClient: {
                type: Object
            },
            opencgaSession: {
                type: Object
            },
            projects: {
                type: Array
            },
            studySummaries: {
                type: Array
            }
        };
    }

    _init() {
        this._prefix = "sf-" + Utils.randomString(6) + "_";
        this._studies = [];
        this.requestDone = false;

        this.totalCount = {
            variants: 0,
            sample: 0
        };
        this.data = {};
    }

    updated(changedProperties) {
        if (changedProperties.has("projects")) {
            // this.projectsChanged();
        }
        if (changedProperties.has("studySummaries")) {
            this.summariesChanged();
        }
    }

    firstUpdated(_changedProperties) {
        const countUp = new CountUp("samples-count", 32309);
        countUp.start();
        this.variantCount = new CountUp("variants-count", 0);
        this.variantCount.start();
        const countUp3 = new CountUp("anto-count", 132);
        countUp3.start();
        // this.loadHighcharts();
        // firstUpdated() like every other props related methods is executed once for each prop
        if (!this.requestDone) {
            this.facetQuery();
            this.requestDone = true;
        }
    }

    start() {


    }
    _isFirstRow(indexStudy) {
        if (UtilsNew.isNotUndefinedOrNull(indexStudy) && indexStudy === 0) {
            return "block";
        }

        return "none";
    }
/*
    loadHighcharts() {

        const colors = Highcharts.getOptions().colors;

        //                    let categories = ['MSIE', 'Firefox', 'Chrome', 'Safari', 'Opera'];
        const categories = this.projects.map(element => {
            return element.name;
        });
        const data = [];
        const _this = this;
        const total = 0;
        const numberOfStudies = this.projects.reduce((total, element) => {
            return total + element.studies.length;
        }, 0);

        this.projects.forEach((element, index) => {
            const studies = element.studies.map(study => {
                return study.name;
            });
            const creationDate = element.studies.map(study => {
                return study.creationDate;
            });

            const projectPercent = studies.length * 100 / numberOfStudies;
            data.push({
                y: projectPercent,
                color: colors[index],
                drilldown: {
                    name: element.name,
                    categories: studies,
                    color: colors[0],
                    data: element.studies.map(study => {
                        return projectPercent / studies.length;
                    }),
                    creationDate: creationDate
                }
            });
        });
        const browserData = [];
        const versionsData = [];
        let i;
        let j;
        const dataLen = categories.length;
        let drillDataLen;
        let brightness;


        // Build the data arrays
        for (i = 0; i < dataLen; i += 1) {

            // add browser data
            browserData.push({
                name: categories[i],
                y: data[i].y,
                color: data[i].color
            });

            // add version data
            drillDataLen = data[i].drilldown.data.length;
            for (j = 0; j < drillDataLen; j += 1) {
                brightness = 0.2 - (j / drillDataLen) / 5;
                versionsData.push({
                    name: data[i].drilldown.categories[j],
                    y: data[i].drilldown.data[j],
                    color: Highcharts.Color(data[i].color).brighten(brightness).get(),
                    creationDate: data[i].drilldown.creationDate[j]
                });
            }
        }

        // Create the chart
        Highcharts.chart("containerChart", {
            chart: {
                type: "pie"
            },
            title: {
                text: "Iva Projects"
            },
            subtitle: {
                text: "<a href=\"https://github.com/opencb\">OpenCB</a>"
            },
            yAxis: {
                title: {
                    text: "Total percent market share"
                }
            },
            plotOptions: {
                pie: {
                    shadow: false,
                    center: ["50%", "50%"],
                    size: 100
                }
            },
            tooltip: {
                valueSuffix: "%",
                formatter: function() {
                    let s = "<b>" + this.key + "</b>";

                    s += "<br/>" + this.percentage.toFixed(2) + "%";
                    if (UtilsNew.isNotUndefinedOrNull(this.point.creationDate)) {
                        s += "<br/>" + moment(this.point.creationDate, "YYYYMMDDHHmmss").format("HH:mm:ss MMM/D/YY");
                    }
                    return s;
                },
                footerFormat: true

            },
            series: [{
                name: "Browsddders",
                data: browserData,
                size: "60%",
                dataLabels: {
                    formatter: function() {
                        return this.y > 5 ? this.point.name : null;
                    },
                    color: "#ffffff",
                    distance: -30
                }
            }, {
                name: "Versions",
                data: versionsData,
                size: "80%",
                innerSize: "60%",
                dataLabels: {
                    formatter: function() {
                        // display only if larger than 1
                        return this.y > 1 ? "<b>" + this.point.name + "</b> ": null;
                    }
                },
                id: "versions"
            }],
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 800
                    },
                    chartOptions: {
                        series: [{
                            id: "versions",
                            dataLabels: {
                                enabled: false
                            }
                        }]
                    }
                }]
            }
        });
    }*/
/*
    projectsChanged() {
        if (UtilsNew.isNotUndefined(this.opencgaClient) && this.opencgaClient instanceof OpenCGAClient &&
            UtilsNew.isNotUndefined(this.projects) && this.projects.length > 0) {
            const _this = this;

            if (true) {
                const projectPromises = [];
                this.projects.forEach(function(project) {
                    const studyPromises = [];
                    project.studies.forEach(function(study) {
                        const studyPromise = _this.opencgaClient.studies().summary(project.alias + ":" + study.alias)
                            .then(function(response) {
                                // We add the id to the summary
                                response.response[0].result[0].id = this.studyId;
                                response.response[0].result[0].acl = study.acl;
                                return response;
                            }.bind({studyId: study.id}));
                        studyPromises.push(studyPromise);
                    });
                    projectPromises.push(Promise.all(studyPromises)
                        .then(function(responses) {
                            const studies = [];
                            responses.forEach(function(response) {
                                const study = response.response[0].result[0];
                                study.creationDate = moment(study.creationDate, "YYYYMMDDHHmmss").format("D MMM YY");
                                studies.push(study);
                            });
                            return studies;
                        }));
                });

                const _studySummaries = [];
                Promise.all(projectPromises)
                    .then(function(responses) {
                        for (let i = 0; i < responses.length; i++) {
                            _studySummaries.push({
                                id: _this.projects[i].id,
                                alias: _this.projects[i].alias,
                                name: _this.projects[i].name,
                                rowspan: responses[i].length + 1,
                                studies: responses[i]
                            });
                        }
                        _this.loadHighcharts();
                        _this.renderTable(_studySummaries);
                        _this.requestUpdate();
                    });
            }
        }
    }*/

    async facetQuery() {
        // this.clearPlots();
        console.log("projects", this.projects);
        console.log("this.opencgaSession", this.opencgaSession);
        // console.log("study",this.opencgaSession.project.alias + ":" + this.opencgaSession.study.alias)

        this.querySelector("#loading").style.display = "block";

        const sleep = new Promise(resolve => setTimeout(()=> resolve(), 5000));

        this.projects.map(project => this.opencgaClient.variants().facet({
            // sid: this.opencgaClient._config.sessionId,
            study: this.opencgaSession.study.fqn,
            project: project.fqn,
            timeout: 60000,
            facet: "studies"
        }, {})
            .then( response => {
                //the first is opencga1.4, the second opencga 2
                let r = response.getResult(0).results ? response.getResult(0).results[0] : response.getResult(0);
                //console.log(r)
                this.totalCount.variants += r.count;
                this.variantCount.update(this.totalCount.variants);
                this.data[project.id] = {
                    name: project.name,
                    dataset: [
                        ...r.buckets.map( datapoint => ({name: datapoint.value, data: [datapoint.count], type: "column"})),
                        {name: "count", data: [r.count], type: "spline"}
                    ]
                };
                this.requestUpdate();
            })

        );/*
        Promise.all([...results]).then( responses => {
            // response.pop() //remove along with sleep

            console.log("response", responses);
            // console.log("res", JSON.stringify(response));
            const data = responses.map( (projectFacet, i) => ({
                project: this.projects[i].name,
                data: projectFacet.getResult(0)
            }));
            // format data for highchart
            const dataset = [];
            // TODO for (var [i, project] of Object.entries()) { // build project infos }
            for (const project of responses) {

                console.log("project", project.getResult(0));
                dataset.push(
                    ...project.getResult(0).buckets.map( datapoint => ({name: datapoint.value, data: [datapoint.count], type: "column"})),
                    {name: "count", data: [project.getResult(0).count], type: "spline"});
            }
            this.facetChart(dataset);
        }).catch( e => {
            this.errorState = "Error from server";
            console.error(e);
            this.requestUpdate();
        }).finally(() => {
            this.querySelector("#loading").style.display = "none";
        });
*/
    }

    facetChart(facetData) {
        console.log("facetResults", facetData);
        Highcharts.chart("facetChart", {
            chart: {
                type: "column"
            },
            legend: false,
            title: {
                text: "Projects overview"
            },
            subtitle: {
                text: ""
            },
            xAxis: {
            },
            yAxis: {
                min: 0,
                plotLines: [{
                    color: "green",
                    // TODO temp solution. It shows the total count for the first project only (replace this point with a line (no splined))
                    value: facetData.find( point => point.name === "count").data[0],
                    width: 1,
                    zIndex: 2
                }]
            },
            tooltip: {
                headerFormat: "<span style=\"font-size:10px\">{point.key}</span><table>",
                pointFormat: "<tr><td style=\"color:{series.color};padding:0\">{series.name}: </td>" +
                    "<td style=\"padding:0\"><b>{point.y} </b></td></tr>",
                footerFormat: "</table>",
                shared: true,
                useHTML: true
            },
            plotOptions: {
                column: {
                    borderWidth: 0
                }
            },
            series: facetData,
            showInLegend: false,
            dataLabels: {
                enabled: false
            }

        });
    }
    renderTable(studySummaries) {
        this._studies = studySummaries;
    }

    render() {
        return html`
        <style include="jso-styles">
            .center {
                margin: auto;
                text-align: justify;
            }
            #projects .panel-container {
                display: flex;
                justify-content: center;
            }
            #projects .panel-container .panel{
                flex-basis: 250px;
                margin: 1em;
                background: #f1f1f1;
            }
            #projects .panel-container .panel .counter {
                font-size: 4em;
                color: #204d74;
            }
            
            #projects .panel-container .panel .counter-title {
                margin: -20px 0 0 0;
                font-size: 15px;
                text-transform: uppercase;
                letter-spacing: 2px;
            }        
    
        </style>
        <!-- TODO check if logged in -->
        <div id="projects">
            <div class="panel">
                <h3 class="page-title">
                    <i class="fa fa-search" aria-hidden="true"></i> Projects summary
                </h3>
            </div>
            
            <div class="panel-container">
                <div class="panel panel-default shadow">
                    <div class="panel-body">
                        <p class="counter" id="samples-count">10.250</p>
                        <p class="counter-title">Samples</p>
                    </div>
                </div>
            
                <div class="panel panel-default shadow">
                    <div class="panel-body">
                        <p class="counter" id="variants-count">2.250</p>
                        <p class="counter-title">Variants</p>
                    </div>
                </div>
                
                <div class="panel panel-default shadow">
                    <div class="panel-body">
                        <p class="counter" id="anto-count">125</p>
                        <p class="counter-title">Hours Antonio spent improving IVA UI</p>
                    </div>
                </div>
            </div>
            
            
            <ul class="nav nav-tabs aggregation-tabs" role="tablist">
                <!--<li role="presentation" class="active"><a href="#facet_tab" aria-controls="home" role="tab" data-toggle="tab">Aggregation</a></li>
                <li role="presentation"><a href="#filters_tab" aria-controls="profile" role="tab" data-toggle="tab">Filters</a></li> -->
                
                ${this.data ? Object.entries(this.data).map( (project, i) => html`
                    <li role="presentation" class="${ i===0 ? "active" : "" }"><a href="#${project[0]}" aria-controls="profile" role="tab" data-toggle="tab">${project[0]}</a></li>
                `) : null}
            </ul>
                        
            <div class="tab-content">
                ${this.data ? Object.entries(this.data).map( (project, i) => html`
                    <div role="tabpanel" class="tab-pane ${ i===0 ? "active" : "" }" id="facet_tab">
                        ${project[0]} tab
                    </div>
                `) : null}
                <!--<div role="tabpanel" class="tab-pane active" id="facet_tab">
                    facet_tab
                </div>
                <div role="tabpanel" class="tab-pane" id="filters_tab">
                    filters_tab
                </div> -->
            </div>
            
            <div id="loading" style="">
                <loading-spinner></loading-spinner>
            </div>    
            <div id="facetChart"></div>    
            <div id="containerChart"></div>
            <div>
                <!--<br>-->
                <table class="table" style="display: none">
                    <thead class="thead-inverse">
                    <tr>
                        <th colspan="5">Project</th>
                        <th>Study</th>
                        <th>Date</th>
                        <th>Files</th>
                        <th>Samples</th>
                        <!--<th>Jobs</th>-->
                        <!--<th>Individuals</th>-->
                    </tr>
                    </thead>
                    <tbody>
                    ${this._studies && this._studies.length ? this._studies.map( summaries => html`
                        <tr>
                            <td rowspan="${summaries.rowspan}" colspan="5">
                                ${summaries.name}
                            </td>
                        </tr>
                        ${summaries.studies && summaries.studies.length ? summaries.studies.map( item => html`
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.creationDate}</td>
                                <td>${item.files}</td>
                                <td>${item.samples}</td>
                                <!--<td>{{item.jobs}}</td>-->
                                <!--<td>{{item.individuals}}</td>-->
                            </tr>
                        `) : null}
                    `) : null}
                    
                    </tbody>
                </table>
            </div>
        </div>
        `;
    }

}

customElements.define("opencga-projects", OpencgaProjects);
