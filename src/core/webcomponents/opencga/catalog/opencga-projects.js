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
import Utils from "./../../../utils.js";
import UtilsNew from "../../../utilsNew.js";
import {CountUp} from "/node_modules/countup.js/dist/countUp.min.js";


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
            files: 0,
            samples: 0,
            jobs: 0,
            individuals: 0,
            cohorts: 0
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
        this.filesCount = new CountUp("files-count", 0);
        this.filesCount.start();
        this.samplesCount = new CountUp("samples-count", 0);
        this.samplesCount.start();
        this.jobsCount = new CountUp("jobs-count", 0);
        this.jobsCount.start();
        this.individualsCount = new CountUp("individuals-count", 0);
        this.individualsCount.start();
        this.cohortsCount = new CountUp("cohorts-count", 0);
        this.cohortsCount.start();
        this.variantsCount = new CountUp("variants-count", 0);
        this.variantsCount.start();

        // this.loadHighcharts();
        // firstUpdated() like every other props related methods is executed once for each prop
        if (!this.requestDone) {
            this.facetQuery();
            this.requestDone = true;
        }
    }

    _isFirstRow(indexStudy) {
        if (UtilsNew.isNotUndefinedOrNull(indexStudy) && indexStudy === 0) {
            return "block";
        }

        return "none";
    }

    _changeBottomTab(e) {
        const tabId = e.currentTarget.dataset.id;
        console.log(tabId);
        $(".nav-tabs", this).removeClass("active");
        $(".tab-content div[role=tabpanel]", this).hide();
        for (const tab in this.activeTab) this.activeTab[tab] = false;
        $("#" + tabId + "-tab", this).show();
        this.activeTab[tabId] = true;
        this.requestUpdate();
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
        this.querySelector("#loading").style.display = "block";
        const sleep = s => new Promise(resolve => setTimeout(() => resolve(), s*1000));
        this.errors = "";

        const _this = this;

        let done = 0;
        this.projects.forEach( project => {
            // let studyPromises = [];
            console.log("prj", project);
            this.data[project.id] = {
                name: project.name,
                ...project,
                dataset: [
                    // ...r.buckets.map( datapoint => ({name: datapoint.value, data: [datapoint.count], type: "column"})),
                    // {name: "count", data: [r.count], type: "spline"}
                    {name: "count", data: [10], type: "spline"}
                ],
                studies: []
            };
            const catalogStats = _this.opencgaClient.studies().aggregationStats([project.studies.map( study => study.fqn)].join(","), {}).then( response => {
                // handle opencga 1.4 and 2
                const r = response.getResult(0).results ? response.getResult(0).results[0] : response.getResult(0);

                console.log("R", r);

                const entries = Object.entries(r);
                console.log("entries", entries);

                if (entries.length) {
                    entries.forEach( ([fqn, study]) => {
                        this.filesCount.update(this.totalCount.files += study.file.numTotalResults);
                        this.samplesCount.update(this.totalCount.samples += study.sample.numTotalResults);
                        this.jobsCount.update(this.totalCount.jobs += study.job.numTotalResults);
                        this.individualsCount.update(this.totalCount.individuals += study.individual.numTotalResults);
                        // this.variantCount.update(this.totalCount.variants += r.variants);
                        this.cohortsCount.update(this.totalCount.cohorts += study.cohort.numTotalResults);
                        console.log("STUDY",study)
                        this.data[project.id].studies.push({
                            name: fqn,
                            stats: {
                                file: {
                                    numTotalResults: study.file.numTotalResults,
                                    results: study.file.results
                                },
                                sample: {
                                    numTotalResults: study.sample.numTotalResults,
                                    results: study.sample.results
                                },
                                individual: {
                                    numTotalResults: study.individual.numTotalResults,
                                    results: study.individual.results
                                },
                                cohort: {
                                    numTotalResults: study.cohort.numTotalResults,
                                    results: study.cohort.results
                                }
                            },
                        });
                    });
                }
            }).catch( restResponse => {
                if (restResponse.getEvents("ERROR").length) {
                    this.errors += restResponse.getEvents("ERROR").map(error => error.message).join("\n") + "\n";
                } else {
                    this.errors += `Unknown error requiring stats for ${project.name}\n`;
                }
            }).finally( () => {
                done++;
                if (done === this.projects.length) {
                    this.querySelector("#loading").style.display = "none";
                }
                this.requestUpdate();
            });
            /* _this.opencgaClient.variants().aggregationStats({fields: "studies"}).then(response => {
                    const r = response.getResult(0).results ? response.getResult(0).results[0] : response.getResult(0);
                    console.log("variants", r);
                    _this.variantsCount.update(this.totalCount.variants += r.count);
            });*/

        });

        // TODO remove this??
        /* this.projects.map(project => this.opencgaClient.variants().facet({
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
                this.variantCount.update(this.totalCount.variants += r.count);
                this.data[project.id] = {
                    name: project.name,
                    dataset: [
                        ...r.buckets.map( datapoint => ({name: datapoint.value, data: [datapoint.count], type: "column"})),
                        {name: "count", data: [r.count], type: "spline"}
                    ]
                };

                //this.facetChart("#" + project.name + "chart", this.data[project.id].dataset)
                this.facetChart(project.alias + "-chart1", this.data[project.id].dataset);
                this.facetChart(project.alias + "-chart2", this.data[project.id].dataset);
                this.facetChart(project.alias + "-chart3", this.data[project.id].dataset);
                this.requestUpdate();
            })

        );*/

        /*
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

    facetChart(selector, facetData) {
        console.log("facetResults", facetData);
        Highcharts.chart(selector, {
            chart: {
                type: "column"
            },
            legend: false,
            title: {
                text: "Total variant"
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
            
            #projects .study-title {
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
                        <p class="counter" id="files-count"></p>
                        <p class="counter-title">Files</p>
                    </div>
                </div>
            
                <div class="panel panel-default shadow">
                    <div class="panel-body">
                        <p class="counter" id="samples-count"></p>
                        <p class="counter-title">Samples</p>
                    </div>
                </div>
                
                <div class="panel panel-default shadow">
                    <div class="panel-body">
                        <p class="counter" id="jobs-count"></p>
                        <p class="counter-title">Jobs</p>
                    </div>
                </div>
                
                <div class="panel panel-default shadow">
                    <div class="panel-body">
                        <p class="counter" id="individuals-count"></p>
                        <p class="counter-title">Individuals</p>
                    </div>
                </div>
                
                <div class="panel panel-default shadow">
                    <div class="panel-body">
                        <p class="counter" id="cohorts-count"></p>
                        <p class="counter-title">Cohorts</p>
                    </div>
                </div>
                
                <div class="panel panel-default shadow">
                    <div class="panel-body">
                        <p class="counter" id="variants-count">-</p>
                        <p class="counter-title">Variants</p>
                    </div>
                </div>
            </div>
           
            <div class="v-space"></div>
            <ul class="nav nav-tabs" role="tablist">
                ${this.data ? Object.entries(this.data).map( (project, i) => html`
                    <li role="presentation" class="${ i === 0 ? "active" : "" }"><a href="#${project[0]}" @click="${e => console.log(e)}" aria-controls="profile" role="tab" data-toggle="tab">${project[1].name}</a></li>
                `) : null}
            </ul>
            <pre id="errors" class="alert alert-warning" role="alert" style="display: ${this.errors ? "block" : "none"}">${this.errors}</pre>      
            <div class="tab-content">
                ${this.data ? Object.entries(this.data).map( ([id, project], i) => html`
                    <div role="tabpanel" class="tab-pane ${ i===0 ? "active" : "" }" id="${id}">
                        <div><h4>${project.name} (${project.uuid})</h4></div>
                        ${project.description ? html`<div><label>Description:</label> ${project.description}</div>` : ""}
                        <div class="container-fluid">
                            <div class="row">
                                ${project.studies ? project.studies.map( study => {
                                    return html`
                                        <div class="panel panel-default col-md-12 study-panel">
                                            <div class="panel-body">
                                                <p class="study-title">Study: ${study.name}</p>
                                                <p class="study-description">${study.description}</p>
                                            </div>
                                             ${Object.entries(study.stats).map( ([resource, stat]) => html`
                                                ${stat.results.map( facetResult => html`
                                                    <div class="col-md-4">
                                                        <opencga-facet-result-view .facetResult="${facetResult}">
                                                        </opencga-facet-result-view>
                                                    </div>`)}
                                             `)}
                                        </div>
                                        `;
                                    } ) : "-"}
                            </div>
                        </div>
                    </div>
                `) : null}
            </div>
            
            <div id="loading" style="display: none">
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
