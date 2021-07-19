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
import {classMap} from "/web_modules/lit-html/directives/class-map.js";
import {RestResponse} from "../../clients/rest-response.js";
import UtilsNew from "../../utilsNew.js";
import "../commons/tool-header.js";
import {CountUp} from "/node_modules/countup.js/dist/countUp.min.js";
import "../commons/simple-chart.js";

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

        this.activeTab = {};

        this.sideNavItems = ["Summary", "Variants", "Files", "Samples", "Individuals", "Cohorts"];

        this.charts = {
            variant: [],
            file: ["format", "bioformat"],
            sample: [],
            individual: [],
            cohort: []
        };

        this.tableRows = {
            variant: {},
            file: {
                format: {
                    name: "Format",
                    values: [
                        {id: "VCF", name: "VCF files"},
                        {id: "PLAIN", name: "PLAIN files"},
                        {id: "BAI", name: "BAI files"},
                        {id: "BAM", name: "BAM files"}
                    ]
                },
                bioformat: {
                    name: "Bioformat",
                    values: [
                        {id: "ALIGNMENT", name: "ALIGNMENT"},
                        {id: "VARIANT", name: "VARIANT"},
                        {id: "NONE", name: "NONE"}
                    ]
                }
            },
            sample: {
                somatic: {
                    name: "Somatic",
                    values: [
                        {id: "false", name: "Somatic: false"}
                    ]
                }
            },
            individual: {
                lifeStatus: {
                    name: "Life Status",
                    values: [
                        {id: "ALIVE", name: "ALIVE"},
                        {id: "ABORTED", name: "ABORTED"},
                        {id: "DECEASED", name: "DECEASED"},
                        {id: "UNBORN", name: "UNBORN"},
                        {id: "STILLBORN", name: "STILLBORN"},
                        {id: "MISCARRIAGE", name: "MISCARRIAGE"},
                        {id: "UNKNOWN", name: "UNKNOWN"}
                    ]
                },
                /*ethnicity: []*/},
            cohort: {}
        };

        this.chartData = {};
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
            files: 0,
            family: 0,
            samples: 0,
            jobs: 0,
            individuals: 0,
            cohorts: 0,
            variants: 0
        };
        this.filesCount = new CountUp("files-count", 0);
        this.filesCount.start();
        this.familyCount = new CountUp("files-count", 0);
        this.familyCount.start();
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

    async facetQuery() {
        // this.clearPlots();
        console.log("this.opencgaSession", this.opencgaSession);
        this.querySelector("#loading").style.display = "block";
        const sleep = s => new Promise(resolve => setTimeout(() => resolve(), s * 1000));
        this.errors = "";

        const done = 0;
        for (const project of this.opencgaSession.projects) {
            // let studyPromises = [];

            console.log("prj", project);
            this.data[project.id] = {
                name: project.name,
                ...project,
                stats: {}
            };
            // TODO continue on this. remove catalog requests by study and use one by project
            /*const catalogProjectResponse = await this.opencgaSession.opencgaClient.projects().aggregationStats(project.id, {
                individualFields: "lifeStatus,sex"
            });
            console.log(catalogProjectResponse.getResult(0))*/

            this.chartData[project.id] = {};
            for (const study of project.studies) {
                try {
                     const catalogStudyResponse = await this.opencgaSession.opencgaClient.studies().aggregationStats(study.fqn, {
                        individualFields: "lifeStatus,sex"
                    });

                    //const f = await fetch("/lib/jsorolla/src/core/webcomponents/user/" + study.fqn + ".json");

                    //const catalogStudyResponse = new RestResponse(await f.json());

                    const r = catalogStudyResponse.getResult(0).results ? catalogStudyResponse.getResult(0).results[0] : catalogStudyResponse.getResult(0);

                    const stats = r[study.fqn];
                    this.filesCount.update(this.totalCount.files += stats.file.results[0]?.count);
                    this.familyCount.update(this.totalCount.files += stats.family.results[0]?.count);
                    this.samplesCount.update(this.totalCount.samples += stats.sample.results[0]?.count);
                    this.jobsCount.update(this.totalCount.jobs += stats.job.results[0]?.count);
                    this.individualsCount.update(this.totalCount.individuals += stats.individual.results[0]?.count);
                    this.cohortsCount.update(this.totalCount.cohorts += stats.cohort.results[0]?.count);

                    // this.variantCount.update(this.totalCount.variants += r.variants);

                    this.data[project.id].stats[study.fqn] = {
                        file: {
                            results: stats.file.results
                        },
                        sample: {
                            results: stats.sample.results
                        },
                        individual: {
                            results: stats.individual.results
                        },
                        cohort: {
                            results: stats.cohort.results
                        }
                    };


                } catch (e) {
                    console.error(e);
                    this.querySelector("#loading").style.display = "none";

                }
            }


            // const response = await this.opencgaSession.opencgaClient.variants().aggregationStats({project: project.id, fields: "studies"});


            // let response = await fetch("/lib/jsorolla/src/core/webcomponents/user/variants_" + project.id + ".json")
            // response = new RestResponse(await response.json());

            // console.error(project.id)
            // console.log(JSON.stringify(response))
            // const r = response.getResult(0).results ? response.getResult(0).results[0] : response.getResult(0);
            // this.variantsCount.update(this.totalCount.variants += r.count);

            this.chartData[project.id] = {};
            /* for (let entity in this.charts) {
                let charts = this.charts[entity];
                charts.forEach( field => {

                    console.error("stats", Object.values(this.data[project.id].stats).map( study => study))
                    let studiesData = Object.entries(this.data[project.id].stats).map( study => study)
                    console.error(this.data[project.id].stats)

                })
            }*/
            for (const entity in this.charts) {
                const charts = this.charts[entity];
                this.chartData[project.id][entity] = [];
                charts.forEach(field => {

                    // Object.values(STATS) contains the map of the entities for each study. I pick the first element as they are expected to be the same
                    const categories = Object.values(this.data[project.id].stats)[0][entity].results.find(result => result.name === field).buckets.map(_ => _.value);

                    // building chart data
                    // I need the structure project->entity->field to plot-> aggregated data for all the studies
                    const data = {};
                    Object.entries(this.data[project.id].stats).forEach(([studyFqn, entitiesMap]) => {
                        data[studyFqn] = entitiesMap[entity].results.find(result => result.name === field).buckets.map(_ => _.count);
                    });
                    this.chartData[project.id][entity].push({
                        name: field,
                        data: data,
                        config: {
                            xAxis: {
                                categories: categories
                            }
                        }
                    });
                    // console.log(this.chartData)
                });
            }


        }


        console.log("this.data", this.data);
        console.log("this.chartData", this.chartData);
        await this.requestUpdate();

        this.querySelector("#loading").style.display = "none";
    }


    renderTable(project, resource) {
        // console.log(project)
        // debugger
        return html`
            <div class="v-space"></div>
            <table class="table table-no-bordered opencga-project-table">
                <thead>
                    <tr>
                        <th></th>
                        <th></th>
                        ${Object.entries(project).map(([fqn, _]) => html`<th>${fqn}</th>`)}
                    </tr>
                </thead>
                
                    ${Object.entries(this.tableRows[resource]).map(([field, fieldConfig]) => html`
                        <tbody>
                            <tr>
                                <td rowspan="${fieldConfig.values.length + 1}">
                                    ${fieldConfig.name}
                                </td>
                            </tr>
                            ${fieldConfig?.values?.map(type => html`
                                <tr>
                                    <td>${type.name}</td>
                                    ${Object.entries(project).map(([fqn, data]) => html`
                                        <td>
                                            ${data[resource]?.results.find(r => r.name === field).buckets.find(stat => stat.value === type.id)?.count}
                                        </td>
                                    `) }                           
                                </tr>
                            `)}
                        </tbody>
                    `) }
            </table>`;
    }

    onChangeProjectTab(e) {
        e.stopPropagation();
        const {projectId} = e.currentTarget.dataset;
        console.log(projectId);
        // reset this.activeTab and enable just the active project with the first side nav item.
        this.activeTab = {
            [projectId]: {[this.sideNavItems[0]]: true}
        }
        this.requestUpdate();
    }

    onSideNavChange(e) {
        e.preventDefault();
        // Remove button focus highlight
        e.currentTarget.blur();
        const {menuItemId, projectId} = e.currentTarget.dataset;
        /*$(".projects-side-nav > button", this).removeClass("active");
        $(`.projects-side-nav > button[data-menu-item-id=${menuItemId}][data-project-id=${projectId}]`, this).addClass("active");
        $(".projects-content-tab." + projectId + " > div[role=tabpanel]", this).hide();
        $("#" + this._prefix + projectId + menuItemId, this).show();*/

        // TODO continue using activeTab as global state for active project and active menu item
        for (const tab in this.activeTab) this.activeTab[tab] = false;
        this.activeTab[projectId] = {[menuItemId]: true};
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
                /*plotLines: [{
                    color: "green",
                    // TODO temp solution. It shows the total count for the first project only (replace this point with a line (no splined))
                    value: facetData.find(point => point.name === "count").data[0],
                    width: 1,
                    zIndex: 2
                }]*/
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
                                    return studies.map(study => html`<li>${study.name}</li>`);
                                }
                            }
                        }
                        /* {
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
                        <li role="presentation" class="${classMap({active: this.activeTab[projectId] || (UtilsNew.isEmpty(this.activeTab) && i === 0)})}">
                            <a href="javascript: void 0" @click="${this.onChangeProjectTab}" data-project-id="${projectId}" aria-controls="profile" role="tab" data-toggle="tab">${project.name}</a>
                        </li>
                    `) : null}
                </ul>
                <pre id="errors" class="alert alert-warning" role="alert" style="display: ${this.errors ? "block" : "none"}">${this.errors}</pre>      
                <div class="content-tab-wrapper">
                
                    ${this.data ? Object.entries(this.data).map(([projectId, project], i) => html`
                        <div role="tabpanel" class="content-tab project-tab tab-pane ${classMap({active: this.activeTab[projectId] || (UtilsNew.isEmpty(this.activeTab) && i === 0)})}" id="${projectId}-tab">
                            <div class="row">
                                <div class="col-md-10 col-md-offset-1">
                                    <h3 class="project-name">Project <span class="inverse">${projectId}</span></h3>                               
                                    <div class="col-md-2 list-group projects-side-nav side-tabs side-nav">
                                        ${this.sideNavItems.map((item, sideNavIndx) => html`
                                            <button type="button" class="list-group-item ${classMap({active: this.activeTab[projectId]?.[item] || (UtilsNew.isEmpty(this.activeTab) && sideNavIndx === 0)})}"
                                                    data-project-id="${project.id}" data-menu-item-id="${item}" @click="${this.onSideNavChange}">${item}</button>
                                        `)}
                                    </div>
                                    <div class="col-md-10">
                                        <div class="content-tab-wrapper projects-content-tab ${project.id}">
                                            ${~this.sideNavItems.indexOf("Summary") ? html`
                                                <div id="${this._prefix}${project.id}Summary" role="tabpanel" class="tab-pane content-tab ${classMap({active: this.activeTab[projectId]?.["Summary"] || UtilsNew.isEmpty(this.activeTab)})}" data-project-id="${project.id}" data-menu-item-id="${project.id}">
                                                    <h3>Summary</h3>
                                                    <data-form .data=${project} .config="${this.getProjectConfig()}"></data-form>
                                                </div>`
                                                : ""
                                            }
                                            
                                            ${~this.sideNavItems.indexOf("Variants") ? html`
                                                <div id="${this._prefix}${project.id}Variants" role="tabpanel" class="tab-pane content-tab ${classMap({active: this.activeTab[projectId]?.["Variants"]})}">
                                                    <h3>Variants</h3>
                                                </div>`
                                            : ""}

                                            ${~this.sideNavItems.indexOf("Files") ? html`
                                                <div id="${this._prefix}${project.id}Files" role="tabpanel" class="tab-pane content-tab ${classMap({active: this.activeTab[projectId]?.["Files"]})}">
                                                    <h3>Files</h3>
                                                    <div class="row">
                                                        ${this.chartData[project.id]?.["file"]?.map?.(chart => html`
                                                        <div class="col-md-6"><simple-chart .active="${true}" type="column" title="${chart.name}" .config=${chart.config} .data="${chart.data}"></simple-chart></div>
                                                        `)}
                                                    </div>
                                                    ${this.renderTable(project.stats, "file")}
                                                </div>`
                                            : ""}

                                            ${~this.sideNavItems.indexOf("Samples") ? html`
                                                <div id="${this._prefix}${project.id}Samples" role="tabpanel" class="tab-pane content-tab ${classMap({active: this.activeTab[projectId]?.["Samples"]})}">
                                                    <h3>Samples</h3>
                                                    ${this.renderTable(project.stats, "sample")}
                                                </div>
                                            ` : ""}

                                            ${~this.sideNavItems.indexOf("Individuals") ? html`
                                                <div id="${this._prefix}${project.id}Individuals" role="tabpanel" class="tab-pane content-tab ${classMap({active: this.activeTab[projectId]?.["Individuals"]})}">
                                                    <h3>Individuals</h3>
                                                    ${this.renderTable(project.stats, "individual")}
                                                </div>
                                            ` : ""}

                                            ${~this.sideNavItems.indexOf("Cohorts") ? html`
                                                <div id="${this._prefix}${project.id}Cohorts" role="tabpanel" class="tab-pane content-tab ${classMap({active: this.activeTab[projectId]?.["Cohorts"]})}">
                                                    <h3>Cohorts</h3>
                                                    ${this.renderTable(project.stats, "cohort")}
                                                </div>
                                            ` : ""}
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
            </div>
        </div>
        `;
    }

}

customElements.define("opencga-projects", OpencgaProjects);
