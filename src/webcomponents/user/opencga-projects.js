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
import {classMap} from "lit/directives/class-map.js";
import UtilsNew from "../../core/utils-new.js";
import "../commons/tool-header.js";
import {CountUp} from "countup.js";
import "../commons/simple-chart.js";
import LitUtils from "../commons/utils/lit-utils.js";
import {RestResponse} from "../../core/clients/rest-response.js";
import NotificationUtils from "../commons/utils/notification-utils.js";

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
        this.requestDone = false;

        this.totalCount = {
            variants: 0,
            files: 0,
            samples: 0,
            family: 0,
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
                },
                status: {
                    name: "status",
                    values: [
                        {id: "READY", name: "Ready"}
                    ]
                },
                creationYear: {
                    name: "creationYear",
                    // TODO we dont want to list all years
                    //  values: []

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
                /* ethnicity: []*/},
            cohort: {}
        };

        this.chartData = {};
    }

    firstUpdated() {

    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
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
        this.familyCount = new CountUp("family-count", 0);
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

            // init structure
            this.data[project.id] = {
                name: project.name,
                ...project,
                stats: {}
            };
            this.chartData[project.id] = {};
        }
        const projectIds = this.opencgaSession.projects.map(project => project.id).join(",");

        try {
            // NOTE queries for all the projects in once
            const catalogProjectResponse = await this.opencgaSession.opencgaClient.projects().aggregationStats(projectIds, {
                individualFields: "lifeStatus,sex",
                sampleFields: "creationMonth,status"
            });
            /* const f = await fetch("/lib/jsorolla/src/core/webcomponents/user/projects.json");
            const catalogProjectResponse = new RestResponse(await f.json()); */

            if (catalogProjectResponse.getResults().length) {

                // iterates over projects
                Object.entries(catalogProjectResponse.getResult(0)).forEach(([projectId, studiesObj]) => {
                    this.chartData[projectId] = {};

                    // iterates over studies
                    Object.entries(studiesObj).forEach(([studyId, stats]) => {
                        // updates CountUp counters
                        this.filesCount.update(this.totalCount.files += stats.file.results[0]?.count ?? 0);
                        this.samplesCount.update(this.totalCount.samples += stats.sample.results[0]?.count ?? 0);
                        this.familyCount.update(this.totalCount.family += stats.family.results[0]?.count ?? 0);
                        this.jobsCount.update(this.totalCount.jobs += stats.job.results[0]?.count ?? 0);
                        this.individualsCount.update(this.totalCount.individuals += stats.individual.results[0]?.count ?? 0);
                        this.cohortsCount.update(this.totalCount.cohorts += stats.cohort.results[0]?.count ?? 0);

                        // prepare main data (it will be used for both charts and tables)
                        this.data[projectId].stats[studyId] = {
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
                    });

                    // once main data is ready, build chartData based on this.charts (which contains the list of charts we want to show per entity)
                    for (const entity in this.charts) {
                        if (Object.prototype.hasOwnProperty.call(this.charts, entity)) {
                            const charts = this.charts[entity];
                            this.chartData[projectId][entity] = [];
                            charts.forEach(field => {

                                // Object.values(this.data[projectId].stats) contains the map of the entities for each study. I pick the first study as they are (expected) to be the same for all studies.
                                // console.log(Object.values(this.data[projectId].stats))
                                const categories = Object.values(this.data[projectId].stats)[0][entity].results.find(result => result.name === field).buckets.map(_ => _.value);

                                // building chart data
                                // I need the structure project->entity->field to plot-> aggregated data for all the studies
                                const data = {};
                                Object.entries(this.data[projectId].stats).forEach(([studyFqn, entitiesMap]) => {
                                    data[studyFqn] = entitiesMap[entity].results.find(result => result.name === field).buckets.map(_ => _.count);
                                });
                                this.chartData[projectId][entity].push({
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
                });

                // pivot data on field names
                // TODO avoid extra step and build data straight this way?
                this.data = this.prepareData(this.data);
            } else if (catalogProjectResponse.getEvents("ERROR").length) {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, catalogProjectResponse);
            }
        } catch (e) {
            // console.error(e);
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, e);
        }
        this.requestUpdate();
        // await this.updateComplete; // this causes intermittent refresh issues
        this.querySelector("#loading").style.display = "none";
    }

    prepareData(data) {
        const r = {};
        // console.log("data", data)
        Object.entries(data).map(([projectId, projectObj]) => {
            r[projectId] = {
                ...projectObj,
                entities: {}
            };
            // console.log(projectObj)
            Object.entries(projectObj.stats).map(([studyId, entitiesObj]) => {
                Object.entries(entitiesObj).map(([entityId, fieldsObj]) => {
                    // console.log(entityId, fieldsObj)
                    if (!r[projectId]["entities"][entityId]) {
                        r[projectId]["entities"][entityId] = {};
                    }
                    // field is: creationYear
                    fieldsObj.results.map(field => {
                        if (!r[projectId]["entities"][entityId][field.name]) {
                            r[projectId]["entities"][entityId][field.name] = {};
                        }
                        field.buckets.map(fieldData => {
                            if (!r[projectId]["entities"][entityId][field.name][fieldData.value]) {
                                r[projectId]["entities"][entityId][field.name][fieldData.value] = {};
                            }
                            r[projectId]["entities"][entityId][field.name][fieldData.value][studyId] = fieldData;
                        });

                    });
                });
            });
        });
        // console.log("r", r)
        return r;
    }

    renderTable(projectData, resource) {
        return html`
            <div class="v-space"></div>
            <table class="table table-no-bordered opencga-project-table">
                <thead class="table-light">
                    <tr>
                        <th rowspan="2">Field</th>
                        <th rowspan="2">Value</th>
                        <th colspan="${projectData.studies.length}">Studies</th>
                    </tr>
                    <tr>
                        ${projectData.studies.map(study => html`<th>${study.id}</th>`)}
                    </tr>
                </thead>
                ${Object.entries(projectData.entities[resource]).map(([entityId, fieldsObj]) => {
                    return !UtilsNew.isEmpty(fieldsObj) ? html`
                        <tbody>
                            <tr>
                                <td rowspan="${Object.keys(fieldsObj).length + 1}">
                                    ${entityId}
                                </td>
                            </tr>
                            ${Object.entries(fieldsObj).map(([fieldName, studiesObj]) => {
                                return html`
                                    <tr>
                                        <td>${fieldName}</td>
                                        ${projectData.studies.map(study => html`
                                            <td>${studiesObj[study.id]?.count}</td>
                                        `)}
                                    </tr>
                                `;
                            })}
                        </tbody>
                    ` : "";
                })}
            </table>
        `;
    }


    // TODO move structure transposition from template to facetQuery()
    // OLD render table
    /* renderTabOld(project, resource) {
        // console.log(project)
        return html`
            <div class="v-space"></div>
            <table class="table table-no-bordered opencga-project-table">
                <thead>
                    <tr>
                        <th></th>
                        <th></th>
                        ${Object.entries(project).map(([fqn]) => html`<th>${fqn}</th>`)}
                    </tr>
                </thead>

                    ${Object.entries(this.tableRows[resource]).map(([field, fieldConfig]) => html`
                        <tbody>

                            <!--
                                this works either with an explicit list of fields to show in the table (this.tableRows)
                                or ALL the values of "field" returned in response
                            -->
                            ${fieldConfig?.values?.length ? html`
                                <tr>
                                    <td rowspan="${fieldConfig.values.length + 1}">
                                        ${fieldConfig.name}
                                    </td>
                                </tr>
                                ${fieldConfig?.values?.map(type => html`
                                <tr>
                                    <td>${type.name}</td>
                                    ${Object.entries(project).map(([, data]) => html`
                                        <td>
                                            ${data[resource]?.results.find(r => r.name === field).buckets.find(stat => stat.value === type.id)?.count}
                                        </td>
                                    `) }
                                </tr>
                                `)}
                            ` : html`
                                <tr>
                                    <td rowspan="${ // the max number of values `field` (e.g. creationYear: [JANUARY,FEBRAURY,...]) can assume in a project
                                        Math.max(...Object.entries(project).map(([, data]) => {
                                            const projectData = data[resource].results.find(r => r.name === field);
                                            console.log("projectData.buckets.length", projectData.buckets.length);
                                            return projectData.buckets.length;
                                        })) + 1}">
                                        ${fieldConfig.name} ${Math.max(...Object.entries(project).map(([, data]) => {
                                            const projectData = data[resource].results.find(r => r.name === field);
                                            return projectData.buckets.length;
                                        }))}
                                    </td>

                                    ${Object.entries(project).map(([, data]) => {
                                        const projectData = data[resource].results.find(r => r.name === field);
                                        // TODO in progress
                                        return html`
                                                                            ${projectData.buckets.map(stat => {
                                            return html`<tr><td>${stat.value}</td><td>${stat.count}</td></tr>`;
                                        })}
                                        `
                                    })}
                                </tr>
                            `}
                        </tbody>
                    `) }
            </table>`;
    }*/

    onChangeProjectTab(e) {
        e.stopPropagation();
        const {projectId} = e.currentTarget.dataset;
        console.log(projectId);
        // reset this.activeTab and enable just the active project with the first side nav item.
        this.activeTab = {
            [projectId]: {[this.sideNavItems[0]]: true}
        };
        this.requestUpdate();
    }

    onSideNavChange(e) {
        e.preventDefault();
        // Remove button focus highlight
        e.currentTarget.blur();
        const {menuItemId, projectId} = e.currentTarget.dataset;
        /* $(".projects-side-nav > button", this).removeClass("active");
        $(`.projects-side-nav > button[data-menu-item-id=${menuItemId}][data-project-id=${projectId}]`, this).addClass("active");
        $(".projects-content-tab." + projectId + " > div[role=tabpanel]", this).hide();
        $("#" + this._prefix + projectId + menuItemId, this).show(); */

        // TODO continue using activeTab as global state for active project and active menu item
        for (const tab in this.activeTab) {
            if (Object.prototype.hasOwnProperty.call(this.activeTab, tab)) {
                this.activeTab[tab] = false;
            }
        }
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
                        <p class="counter" id="family-count"></p>
                        <p class="counter-title">Family</p>
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
                            <a href="javascript: void 0" @click="${this.onChangeProjectTab}" data-project-id="${projectId}" aria-controls="profile" role="tab" data-bs-toggle="tab">${project.name}</a>
                        </li>
                    `) : null}
                </ul>
                <pre id="errors" class="alert alert-warning" role="alert" style="display: ${this.errors ? "block" : "none"}">
                    ${this.errors}
                </pre>
                <div class="content-tab-wrapper">

                    ${this.data ? Object.entries(this.data).map(([projectId, project], i) => html`
                        <div role="tabpanel"
                            id="${projectId}-tab"
                            class="content-tab project-tab tab-pane ${classMap({active: this.activeTab[projectId] || (UtilsNew.isEmpty(this.activeTab) && i === 0)})}">
                            <div class="row">
                                <div class="col-md-10 offset-md-1">
                                    <h3 class="project-name">Project <span class="inverse">${projectId}</span></h3>
                                    <div class="col-md-2 list-group projects-side-nav side-tabs side-nav">
                                        ${this.sideNavItems.map((item, sideNavIndx) => html`
                                            <button
                                                type="button"
                                                class="list-group-item ${classMap({active: this.activeTab[projectId]?.[item] || (UtilsNew.isEmpty(this.activeTab) && sideNavIndx === 0)})}"
                                                data-project-id="${project.id}"
                                                data-menu-item-id="${item}"
                                                @click="${this.onSideNavChange}">
                                                ${item}
                                            </button>
                                        `)}
                                    </div>
                                    <div class="col-md-10">
                                        <div class="content-tab-wrapper projects-content-tab ${project.id}">
                                            ${~this.sideNavItems.indexOf("Summary") ? html`
                                                <div id="${this._prefix}${project.id}Summary"
                                                    role="tabpanel"
                                                    class="tab-pane content-tab ${classMap({active: this.activeTab[projectId]?.["Summary"] || UtilsNew.isEmpty(this.activeTab)})}"
                                                    data-project-id="${project.id}"
                                                    data-menu-item-id="${project.id}">
                                                    <h3>Summary</h3>
                                                    <data-form .data=${project} .config="${this.getProjectConfig()}"></data-form>
                                                </div>` :
                                            ""}

                                            ${~this.sideNavItems.indexOf("Variants") ? html`
                                                <div id="${this._prefix}${project.id}Variants" role="tabpanel" class="tab-pane content-tab ${classMap({active: this.activeTab[projectId]?.["Variants"]})}">
                                                    <h3>Variants</h3>
                                                </div>` :
                                            ""}

                                            ${~this.sideNavItems.indexOf("Files") ? html`
                                                <div id="${this._prefix}${project.id}Files" role="tabpanel" class="tab-pane content-tab ${classMap({active: this.activeTab[projectId]?.["Files"]})}">
                                                    <h3>Files</h3>
                                                    <div class="row">
                                                        ${this.chartData[project.id]?.["file"]?.map?.(chart => html`
                                                        <div class="col-md-6">
                                                            <simple-chart .active="${true}" type="column" title="${chart.name}" .config=${chart.config} .data="${chart.data}"></simple-chart>
                                                        </div>
                                                        `)}
                                                    </div>
                                                    ${this.renderTable(project, "file")}
                                                </div>` :
                                            ""}

                                            ${~this.sideNavItems.indexOf("Samples") ? html`
                                                <div id="${this._prefix}${project.id}Samples" role="tabpanel" class="tab-pane content-tab ${classMap({active: this.activeTab[projectId]?.["Samples"]})}">
                                                    <h3>Samples</h3>
                                                    ${this.renderTable(project, "sample")}
                                                </div>
                                            ` :
                                            ""}

                                            ${~this.sideNavItems.indexOf("Individuals") ? html`
                                                <div id="${this._prefix}${project.id}Individuals" role="tabpanel" class="tab-pane content-tab ${classMap({active: this.activeTab[projectId]?.["Individuals"]})}">
                                                    <h3>Individuals</h3>
                                                    ${this.renderTable(project, "individual")}
                                                </div>
                                            ` :
                                            ""}

                                            ${~this.sideNavItems.indexOf("Cohorts") ? html`
                                                <div id="${this._prefix}${project.id}Cohorts" role="tabpanel" class="tab-pane content-tab ${classMap({active: this.activeTab[projectId]?.["Cohorts"]})}">
                                                    <h3>Cohorts</h3>
                                                    ${this.renderTable(project, "cohort")}
                                                </div>
                                            ` :
                                            ""}
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
