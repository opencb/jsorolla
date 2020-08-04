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
import {RestResponse} from "../../clients/rest-response.js";
import UtilsNew from "../../utilsNew.js";
import "../tool-header.js";
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
            opencgaSession: {
                type: Object
            },
            studySummaries: {
                type: Array
            }
        };
    }

    _init() {
        this._prefix = "sf-" + UtilsNew.randomString(6) + "_";
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


        this.charts = {
            variant: [],
            file: ["format"],
            sample: [],
            individual: [],
            cohort: []
        };
        this.tableRows = {
            variant: {},
            file: {format: [{id: "VCF", name: "VCF files" }, {id: "PLAIN", name: "PLAIN files"}, {id: "BAI", name: "BAI files"}, {id: "BAM", name: "BAM files"}], bioformat: [{id: "ALIGNMENT", name: "ALIGNMENT"}, {id: "VARIANT", name: "VARIANT"}, {id: "NONE", name: "NONE"}]},
            sample: {somatic: [{id: "false", name: "Somatic: false"}]},
            individual: {lifeStatus: [
                {id: "ALIVE", name: "ALIVE"},
                    {id: "ABORTED", name: "ABORTED"},
                    {id: "DECEASED", name: "DECEASED"},
                    {id: "UNBORN", name: "UNBORN"},
                    {id: "STILLBORN", name: "STILLBORN"},
                    {id: "MISCARRIAGE", name: "MISCARRIAGE"},
                    {id: "UNKNOWN", name: "UNKNOWN"}
                ],ethnicity: []},
            cohort: {}
        };
    }

    firstUpdated(_changedProperties) {

    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        if (changedProperties.has("studySummaries")) {
            this.summariesChanged();
        }
    }

    opencgaSessionObserver() {
        this.totalCount = {
            variants: 0,
            files: 0,
            samples: 0,
            jobs: 0,
            individuals: 0,
            cohorts: 0
        };
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
        this.facetQuery();
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

    async facetQuery() {
        // this.clearPlots();
        console.log("this.opencgaSession", this.opencgaSession);
        this.querySelector("#loading").style.display = "block";
        const sleep = s => new Promise(resolve => setTimeout(() => resolve(), s * 1000));
        this.errors = "";

        const _this = this;

        let done = 0;
        for (const project of this.opencgaSession.projects) {
            // let studyPromises = [];
            console.log("prj", project);
            this.data[project.id] = {
                name: project.name,
                ...project,
                stats: {}
            };
            for (let study of project.studies) {
                try {
                    const catalogStudyResponse = await this.opencgaSession.opencgaClient.studies().aggregationStats(study.fqn, {
                        individualFields: "lifeStatus"
                    })

                    //let f = await fetch("/lib/jsorolla/src/core/webcomponents/user/" + study.fqn + ".json")
                    //const catalogStudyResponse = new RestResponse(await f.json());

                    //console.error(study.fqn)
                    //console.log(JSON.stringify(catalogStudyResponse))
                    //console.log("catalogStudyResponse", catalogStudyResponse)
                    const r = catalogStudyResponse.getResult(0).results ? catalogStudyResponse.getResult(0).results[0] : catalogStudyResponse.getResult(0);

                    const stats = r[study.fqn];
                    this.filesCount.update(this.totalCount.files += stats.file.results[0].count);
                    this.samplesCount.update(this.totalCount.samples += stats.sample.results[0].count);
                    this.jobsCount.update(this.totalCount.jobs += stats.job.results[0].count);
                    this.individualsCount.update(this.totalCount.individuals += stats.individual.results[0].count);
                    // this.variantCount.update(this.totalCount.variants += r.variants);
                    this.cohortsCount.update(this.totalCount.cohorts += stats.cohort.results[0].count);

                    this.data[project.id].stats[study.fqn] = {
                        file: {
                            numTotalResults: stats.file.numTotalResults,
                            results: stats.file.results
                        },
                        sample: {
                            numTotalResults: stats.sample.numTotalResults,
                            results: stats.sample.results
                        },
                        individual: {
                            numTotalResults: stats.individual.numTotalResults,
                            results: stats.individual.results
                        },
                        cohort: {
                            numTotalResults: stats.cohort.numTotalResults,
                            results: stats.cohort.results
                        }
                    }
                }
                catch (e) {
                    console.error(e)
                    this.querySelector("#loading").style.display = "none";

                }
            }

            let response = await this.opencgaSession.opencgaClient.variants().aggregationStats({project: project.id, fields: "studies"})

            //let response = await fetch("/lib/jsorolla/src/core/webcomponents/user/" + project.id + ".json")
            //response = new RestResponse(await response.json());

            //console.error(project.id)
            //console.log(JSON.stringify(response))
            const r = response.getResult(0).results ? response.getResult(0).results[0] : response.getResult(0);
            this.variantsCount.update(this.totalCount.variants += r.count);

        }
        await this.requestUpdate();

        this.querySelector("#loading").style.display = "none";
    }


    renderTable(project, resource) {
        //console.log(project)
        //debugger
        return html`
            <table class="table table-hover table-no-bordered">
                <thead>
                    <tr>
                        <th></th>
                        ${Object.entries(project).map( ([fqn,_]) => html`<th>${fqn}</th>`)}
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(this.tableRows[resource]).map( ([key, types]) => html`
                        <!-- <tr>
                            <td><p>${key}</p>${types.map( type => html`<p>${type.id}</p>`)}</td>
                            <td>
                            ${types.map( type => html`
                                
                                ${Object.entries(project).map( ([fqn, data]) => html`
                                    
                                        ${data[resource]?.results.find( r => r.name === key).buckets.find( stat => stat.value === type.id)?.count}
                                   
                                `) }                           
                             </td>
                        `)}
                        </tr>-->
                        ${types.map( type => html`
                            <tr>
                                <td>${type.name}</td>
                                ${Object.entries(project).map( ([fqn, data]) => html`
                                    <td>
                                        ${data[resource]?.results.find( r => r.name === key).buckets.find( stat => stat.value === type.id)?.count}
                                    </td>
                                `) }                           
                            </tr>
                        `)}
                    `) }
                </tbody>
            </table>`;
    }

    onSideNavClick(e) {
        e.preventDefault();
        // Remove button focus highlight
        e.currentTarget.blur();
        const {menuItemId, projectId} = e.currentTarget.dataset;
        $(".projects-side-nav > button", this).removeClass("active");
        $(`.projects-side-nav > button[data-menu-item-id=${menuItemId}][data-project-id=${projectId}]`, this).addClass("active");
        $(".projects-content-tab." + projectId + " > div[role=tabpanel]", this).hide();
        $("#" + this._prefix + projectId + menuItemId, this).show();
        //for (const tab in this.activeTab) this.activeTab[tab] = false;
        //this.activeTab[tabId] = true;
        this.requestUpdate();
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
            xAxis: {},
            yAxis: {
                min: 0,
                plotLines: [{
                    color: "green",
                    // TODO temp solution. It shows the total count for the first project only (replace this point with a line (no splined))
                    value: facetData.find(point => point.name === "count").data[0],
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

    /*    renderTable(studySummaries) {
            this._studies = studySummaries;
        }*/

    getProjectConfig() {
        return {
            title: "Summary",
            icon: "",
            display: {
                collapsable: true,
                showTitle: false,
                labelWidth: 2,
                defaultValue: "-"
            },
            sections: [
                {
                    title: "",
                    collapsed: false,
                    elements: [
                        {
                            name: "Project id",
                            field: "id"
                        },
                        {
                            name: "UUID",
                            field: "uuid"
                        },
                        {
                            name: "Description",
                            field: "description"
                        },
                        {
                            name: "Orgamism",
                            field: "organism",
                            type: "custom",
                            display: {
                                render: organism => html`${organism.scientificName} - ${organism.assembly}`
                            }
                        },
                        {
                            name: "Creation Date",
                            field: "creationDate",
                            type: "custom", // this is not needed. feels right though
                            display: {
                                render: creationDate => html`${moment(creationDate, "YYYYMMDDHHmmss").format("D MMM YY")}`
                            }
                        },
                        {
                            name: "Status",
                            field: "user.internal.status",
                            type: "custom",
                            display: {
                                render: field => `${field?.name} (${UtilsNew.dateFormatter(field?.date)})`
                            }
                        },
                        {
                            name: "Studies",
                            field: "studies",
                            type: "custom",
                            display: {
                                render: studies => {
                                    return studies.map( study => study.name).join(", ")
                                }
                            }
                        }
                        /*{
                            name: "Project and studies",
                            field: "projects",
                            type: "table",
                            display: {
                                columns: [
                                    {
                                        name: "Id",
                                        field: "id"
                                    },
                                    {
                                        name: "Name",
                                        field: "name"
                                    },
                                    {
                                        name: "Studies",
                                        field: "studies",
                                        type: "custom",
                                        display: {
                                            render: studies => {
                                                return studies.map( study => study.name).join(", ")
                                            }
                                        }
                                    }
                                ]
                            }
                        }*/
                    ]
                }

            ]
        };
    }

    render() {
        return html`
        <style>
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
             <tool-header title="Projects summary" icon="fa fa-search"></tool-header>

            <div class="panel-container">
                <div class="panel panel-default shadow-sm">
                    <div class="panel-body">
                        <p class="counter" id="files-count"></p>
                        <p class="counter-title">Files</p>
                    </div>
                </div>

                <div class="panel panel-default shadow-sm">
                    <div class="panel-body">
                        <p class="counter" id="samples-count"></p>
                        <p class="counter-title">Samples</p>
                    </div>
                </div>

                <div class="panel panel-default shadow-sm">
                    <div class="panel-body">
                        <p class="counter" id="jobs-count"></p>
                        <p class="counter-title">Jobs</p>
                    </div>
                </div>

                <div class="panel panel-default shadow-sm">
                    <div class="panel-body">
                        <p class="counter" id="individuals-count"></p>
                        <p class="counter-title">Individuals</p>
                    </div>
                </div>

                <div class="panel panel-default shadow-sm">
                    <div class="panel-body">
                        <p class="counter" id="cohorts-count"></p>
                        <p class="counter-title">Cohorts</p>
                    </div>
                </div>

                <div class="panel panel-default shadow-sm">
                    <div class="panel-body">
                        <p class="counter" id="variants-count">-</p>
                        <p class="counter-title">Variants</p>
                    </div>
                </div>
            </div>
            
          
            <div class="v-space"></div>
            <div class="detail-tabs">
                <ul class="nav nav-tabs nav-center tablist" role="tablist">
                    ${this.data ? Object.entries(this.data).map(([projectId, project], i) => html`
                        <li role="presentation" class="${i === 0 ? "active" : ""}"><a href="#${projectId}" @click="${e => console.log(e)}" aria-controls="profile" role="tab" data-toggle="tab">${projectId}</a></li>
                    `) : null}
                </ul>
                <pre id="errors" class="alert alert-warning" role="alert" style="display: ${this.errors ? "block" : "none"}">${this.errors}</pre>      
                <div class="tab-content">
                
                    ${this.data ? Object.entries(this.data).map(([projectId, project], i) => html`
                        <div role="tabpanel" class="tab-pane ${i === 0 ? "active" : ""}" id="${projectId}">
                            
                            <div class="row">
                                <div class="col-md-10 col-md-offset-1">
                                    <h3>Project <span class="inverse">${projectId}</span></h3>                               
                                    <div class="col-md-2 list-group projects-side-nav side-tabs side-nav">
                                        <button type="button" class="list-group-item active" 
                                              data-project-id="${project.id}" data-menu-item-id="Summary" @click="${this.onSideNavClick}">Summary</button>
                                        <button type="button" class="list-group-item" 
                                              data-project-id="${project.id}" data-menu-item-id="Variants" @click="${this.onSideNavClick}">Variants</button>
                                        <button type="button" class="list-group-item" 
                                              data-project-id="${project.id}" data-menu-item-id="Files" @click="${this.onSideNavClick}">Files</button>
                                        <button type="button" class="list-group-item" 
                                              data-project-id="${project.id}" data-menu-item-id="Samples" @click="${this.onSideNavClick}">Samples</button>
                                        <button type="button" class="list-group-item" 
                                              data-project-id="${project.id}" data-menu-item-id="Individuals" @click="${this.onSideNavClick}">Individuals</button>
                                        <button type="button" class="list-group-item" 
                                              data-project-id="${project.id}" data-menu-item-id="Cohorts" @click="${this.onSideNavClick}">Cohorts</button>
                                    </div>
                                    <div class="col-md-10">
                                        <div class="content-tab-wrapper projects-content-tab ${project.id}">
                                            <div id="${this._prefix}${project.id}Summary" role="tabpanel" class="tab-pane content-tab active">
                                                <h3>Summary</h3>
                                                <data-form .data=${project} .config="${this.getProjectConfig()}"></data-form>
                                            </div>
                                            <div id="${this._prefix}${project.id}Variants" role="tabpanel" class="tab-pane content-tab">
                                                <h3>Variants</h3>
                                            </div>
                                            <div id="${this._prefix}${project.id}Files" role="tabpanel" class="tab-pane content-tab">
                                                <h3>Files</h3>
                                                <div class="row">${Object.entries(project.stats).map( ([fqn, data]) => html`
                                                    <div class="col-md-6">
                                                        <opencga-facet-result-view .facetResult="${data["file"]?.results.find( r => r.name === "format")}"></opencga-facet-result-view>
                                                    </div>
                                                `) }
                                                </div>
                                                ${this.renderTable(project.stats, "file")}
                                            </div>
                                            <div id="${this._prefix}${project.id}Samples" role="tabpanel" class="tab-pane content-tab">
                                                <h3>Samples</h3>
                                                ${this.renderTable(project.stats, "sample")}
                                            </div>
                                            <div id="${this._prefix}${project.id}Individuals" role="tabpanel" class="tab-pane content-tab">
                                                <h3>Individuals</h3>
                                                ${this.renderTable(project.stats, "individual")}
                                            </div>
                                            <div id="${this._prefix}${project.id}Cohorts" role="tabpanel" class="tab-pane content-tab">
                                                <h3>Cohorts</h3>
                                                ${this.renderTable(project.stats, "cohort")}
                                            </div>
                                        </div>
                                    </div>
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
                        ${this._studies && this._studies.length ? this._studies.map(summaries => html`
                            <tr>
                                <td rowspan="${summaries.rowspan}" colspan="5">
                                    ${summaries.name}
                                   
                                </td>
                            </tr>
                            ${summaries.studies && summaries.studies.length ? summaries.studies.map(item => html`
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
        </div>
        `;
    }
}

customElements.define("opencga-projects", OpencgaProjects);
