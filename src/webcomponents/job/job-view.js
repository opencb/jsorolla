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
import LitUtils from "../commons/utils/lit-utils.js";
import "../commons/forms/data-form.js";
import "./job-detail-log.js";
import "../loading-spinner.js";

export default class JobView extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            job: {
                type: Object
            },
            jobId: {
                type: String
            },
            search: {
                type: Boolean
            },
            opencgaSession: {
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

    #init() {
        this.job = {};
        this.search = false;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("jobId")) {
            this.jobIdObserver();
        }
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
        super.update(changedProperties);
    }

    jobIdObserver() {
        if (this.jobId && this.opencgaSession) {
            let error;
            this.isLoading = true;
            this.opencgaSession.opencgaClient.jobs().info(this.jobId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.job = response.responses[0].results[0];
                })
                .catch(reason => {
                    this.job = {};
                    error = reason;
                    console.error(reason);
                })
                .finally(() => {
                    this._config = this._config = {...this.getDefaultConfig(), ...this.config};
                    this.isLoading = false;
                    LitUtils.dispatchCustomEvent(this, "jobSearch", this.family, {}, error);
                    this.requestUpdate();
                });
        } else {
            this.job = {};
        }
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        if (!this.job?.id && this.search === false) {
            return html`<div>No valid object found</div>`;
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
                    title: "Search",
                    display: {
                        visible: job => !job?.id && this.search === true,
                    },
                    elements: [
                        {
                            title: "Job ID",
                            // field: "jobId",
                            type: "custom",
                            display: {
                                render: () => html `
                                    <catalog-search-autocomplete
                                        .value="${this.job?.id}"
                                        .resource="${"JOB"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{multiple: false}}"
                                        @filterChange="${e => this.onFilterChange(e)}">
                                    </catalog-search-autocomplete>`,
                            }
                        }
                    ]
                },
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

