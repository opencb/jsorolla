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
            projects: {
                type: Array,
            },
            studySummaries: {
                type: Array,
            }
        };
    }

    _init() {
        this._prefix = "sf-" + Utils.randomString(6) + "_";
        this._studies = [];
    }

    updated(changedProperties) {
        if (changedProperties.has("projects")) {
            this.projectsChanged();
        }
        if (changedProperties.has("studySummaries")) {
            this.summariesChanged();
        }
    }

    firstUpdated(_changedProperties) {
        this.loadHighcharts();
    }

    _isFirstRow(indexStudy) {
        if (UtilsNew.isNotUndefinedOrNull(indexStudy) && indexStudy === 0) {
            return "block";
        }

        return "none";
    }

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
    }

    projectsChanged() {
        if (UtilsNew.isNotUndefined(this.opencgaClient) && this.opencgaClient instanceof OpenCGAClient &&
            UtilsNew.isNotUndefined(this.projects) && this.projects.length > 0) {
            const _this = this;

            //TODO ??
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
        </style>
        <div id="containerChart"></div>
        <div>
            <!--<br>-->
            <table class="table">
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
        `;
    }

}

customElements.define("opencga-projects", OpencgaProjects);
