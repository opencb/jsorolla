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

import {LitElement, html} from "lit";
import UtilsNew from "../../core/utilsNew.js";
import AnalysisRegistry from "../variant/analysis/analysis-registry.js";
import "../commons/forms/data-form.js";
import "./job-detail-log.js";

export default class JobView extends LitElement {

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
            jobId: {
                type: String
            },
            job: {
                type: Object
            },
            mode: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("jobId")) {
            this.jobIdObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }

        super.update(changedProperties);
    }

    jobIdObserver() {
        if (this.opencgaSession && this.jobId) {
            this.opencgaSession.opencgaClient.jobs().info(this.jobId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.job = response.getResult(0);
                    this.requestUpdate();
                })
                .catch(reason => {
                    console.error(reason);
                });
        }
    }

    render() {
        if (!this.opencgaSession || !this.job) {
            return null;
        }

        return html`
            <data-form
                .data="${this.job}"
                .config="${this._config}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Summary",
            icon: "",
            nullData: "",
            display: {
                collapsable: true,
                showTitle: false,
                labelWidth: 3,
                defaultLayout: "horizontal",
                defaultValue: "-"
            },
            sections: [
                {
                    title: "Summary",
                    elements: [
                        {
                            name: "Job ID",
                            field: "id"
                        },
                        {
                            name: "User",
                            field: "userId"
                        },
                        {
                            name: "Tool ID",
                            field: "tool.id"
                        },
                        {
                            name: "Status",
                            type: "custom",
                            display: {
                                render: job => UtilsNew.renderHTML(UtilsNew.jobStatusFormatter(job.internal.status, true))
                            }
                        },
                        {
                            name: "Priority",
                            field: "priority"
                        },
                        {
                            name: "Tags",
                            field: "tags",
                            type: "list",
                            display: {
                                render: field => UtilsNew.renderHTML(`<span class="badge badge-pill badge-primary">${field}</span>`)
                            },
                            defaultValue: "-"
                        },
                        {
                            name: "Submitted Date",
                            type: "custom",
                            display: {
                                render: job => html`${UtilsNew.dateFormatter(job.creationDate, "D MMM YYYY, h:mm:ss a")}`
                            }
                        },
                        {
                            name: "Description",
                            field: "description"
                        }
                    ]
                },
                {
                    title: "Execution",
                    elements: [
                        {
                            name: "Start-End Date",
                            type: "custom",
                            display: {
                                render: job => {
                                    if (job.execution) {
                                        const start = job.execution.start ? moment(job.execution.start).format("D MMM YYYY, h:mm:ss a") : "-";
                                        const end = job.execution.end ? html`- ${moment(job.execution.end).format("D MMM YYYY, h:mm:ss a")}` : "-";
                                        return html`${start} - ${end}`;
                                    } else {
                                        return "-";
                                    }
                                },
                            },
                        },
                        {
                            name: "Input Parameters",
                            type: "custom",
                            display: {
                                render: job => {
                                    if (job.params) {
                                        return Object.entries(job.params).map(([param, value]) => html`
                                            <div>
                                                <label>${param}</label>: ${value ? value : "-"}
                                            </div>
                                        `);
                                    } else {
                                        return "-";
                                    }
                                },
                            },
                        },
                        {
                            name: "Input Files",
                            field: "input",
                            type: "list",
                            defaultValue: "N/A",
                            display: {
                                template: "${name}",
                                contentLayout: "bullets"
                            }
                        },
                        // {
                        //     name: "Output Files",
                        //     field: "output",
                        //     type: "table",
                        //     defaultValue: "N/A",
                        //     display: {
                        //         columns: [
                        //             {
                        //                 name: "File Name", field: "name"
                        //             },
                        //             {
                        //                 name: "Size", field: "size"
                        //             },
                        //             {
                        //                 name: "Download", display: {
                        //                     render: file => {
                        //                         debugger
                        //                         return html`<download-button .name="${file.name}" .json="${file}"></download-button>`
                        //                     },
                        //                 }
                        //                 //format: ${UtilsNew.renderHTML(this.statusFormatter(status.name))}
                        //             }
                        //         ],
                        //         border: true
                        //         // contentLayout: "bullets",
                        //     }
                        // },
                        {
                            name: "Output Directory",
                            field: "outDir.path"
                        },
                        {
                            name: "Output Files",
                            field: "output",
                            type: "list",
                            defaultValue: "N/A",
                            display: {
                                template: "${name}",
                                contentLayout: "bullets"
                            }
                        },
                        {
                            name: "Command Line",
                            type: "complex",
                            display: {
                                template: "<div class='cmd'>${commandLine}</div>"
                            }
                        }

                    ]
                },
                {
                    title: "Results",
                    elements: [
                        {
                            type: "custom",
                            display: {
                                defaultLayout: "vertical",
                                render: () => AnalysisRegistry.get(this.job.tool.id)?.result(this.job, this.opencgaSession)
                            }
                        }
                    ]
                },
                {
                    title: "Job Dependencies",
                    elements: [
                        {
                            name: "Dependencies",
                            field: "dependsOn",
                            type: "table",
                            defaultValue: "No Job dependencies",
                            display: {
                                columns: [
                                    {
                                        name: "Job ID", field: "id"
                                    },
                                    {
                                        name: "Name", field: "uuid"
                                    },
                                    {
                                        name: "Status", field: "internal.status.name"
                                        // format: ${UtilsNew.renderHTML(this.statusFormatter(status.name))}
                                    }
                                ],
                                border: true
                            }
                        }

                    ]
                },
                {
                    title: "Job log",
                    display: {
                        visible: this.mode === "full",
                    },
                    elements: [
                        {
                            type: "custom",
                            display: {
                                defaultLayout: "vertical",
                                render: job => html`
                                    <job-detail-log
                                        .opencgaSession="${this.opencgaSession}"
                                        .active="${true}"
                                        .job="${job}">
                                    </job-detail-log>
                                `,
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("job-view", JobView);

