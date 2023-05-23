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
import UtilsNew from "../../core/utils-new.js";
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
                type: Object,
            },
            jobId: {
                type: String,
            },
            search: {
                type: Boolean,
            },
            opencgaSession: {
                type: Object,
            },
            mode: {
                type: String,
            },
            displayConfig: {
                type: Object,
            },
        };
    }

    #init() {
        this.job = {};
        this.search = false;
        this.isLoading = false;

        this.displayConfigDefault = {
            collapsable: true,
            showTitle: false,
            labelWidth: 3,
            defaultLayout: "horizontal",
            defaultValue: "-",
        };
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("jobId")) {
            this.jobIdObserver();
        }
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {...this.displayConfigDefault, ...this.displayConfig};
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    jobIdObserver() {
        if (this.jobId && this.opencgaSession) {
            const params = {
                study: this.opencgaSession.study.fqn
            };
            let error;
            this.#setLoading(true);
            this.opencgaSession.opencgaClient.jobs()
                .info(this.jobId, params)
                .then(response => {
                    this.job = response.responses[0].results[0];
                })
                .catch(reason => {
                    this.job = {};
                    error = reason;
                    console.error(reason);
                })
                .finally(() => {
                    this._config = this.getDefaultConfig();
                    LitUtils.dispatchCustomEvent(this, "jobSearch", this.file, {}, error);
                    this.#setLoading(false);
                });
        } else {
            this.job = {};
        }
    }

    onFilterChange(e) {
        this.jobId = e.detail.value;
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        if (!this.job?.id && this.search === false) {
            return html`
                <div class="alert alert-info">
                    <i class="fas fa-3x fa-info-circle align-middle" style="padding-right: 10px"></i>
                    No Job ID found.
                </div>
            `;
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
            display: this.displayConfig || this.displayConfigDefault,
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
                            },
                        },
                    ],
                },
                {
                    title: "Summary",
                    display: {
                        visible: job => job?.id,
                    },
                    elements: [
                        {
                            name: "Job ID",
                            field: "id",
                        },
                        {
                            name: "User",
                            field: "userId",
                        },
                        {
                            name: "Tool ID",
                            field: "tool.id",
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
                            field: "priority",
                        },
                        {
                            name: "Tags",
                            field: "tags",
                            type: "list",
                            display: {
                                separator: "",
                                render: tag => {
                                    return html`<span class="badge badge-pill badge-primary">${tag}</span>`;
                                }
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
                            field: "description",
                        }
                    ],
                },
                {
                    title: "Execution",
                    display: {
                        visible: job => job?.id,
                    },
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
                                                <label>${param}</label>:
                                                ${value && typeof value === "object" ? html`
                                                    <ul>
                                                        ${Object.keys(value).map(key => html`
                                                            <li><b>${key}</b>: ${value[key] || "-"}</li>
                                                        `)}
                                                    </ul>
                                                ` : (value || "-")}
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
                                contentLayout: "bullets",
                            },
                        },
                        {
                            name: "Output Directory",
                            field: "outDir.path",
                        },
                        {
                            name: "Output Files",
                            type: "custom",
                            display: {
                                render: job => {
                                    // CAUTION: Temporary patch for managing outputFiles array of nulls.
                                    //  See details in: https://app.clickup.com/t/36631768/TASK-1704
                                    if (job.output.length > 0 && job.output.every(jobOut => jobOut === null)) {
                                        return html`
                                            <div class="alert alert-danger" role="alert">
                                                <i class="fas fa-1x fa-exclamation-circle align-middle">
                                                    The output files are not accessible at the moment. We are working on fixing this issue.
                                                </i>
                                            </div>
                                        `;
                                    }
                                    const outputFiles= [...job.output];

                                    // Check if stdout and stderr files have been created and can be dowloaded
                                    ["stdout", "stderr"].forEach(file => {
                                        if (job[file]?.id && job[file]?.type === "FILE") {
                                            outputFiles.push(job[file]);
                                        }
                                    });

                                    if (outputFiles.length === 0) {
                                        return "No output files yet";
                                    }

                                    return html`${outputFiles.map(file => {
                                        const url = [
                                            this.opencgaSession.server.host,
                                            "/webservices/rest/",
                                            this.opencgaSession.server.version,
                                            "/files/",
                                            file.id,
                                            "/download?study=",
                                            this.opencgaSession.study.fqn,
                                            "&sid=",
                                            this.opencgaSession.token,
                                        ];
                                        return html`
                                            <div>
                                                <span style="margin-right: 10px">${file.name} ${file.size > 0 ? `(${UtilsNew.getDiskUsage(file.size)})` : ""}</span>
                                                <a href="${url.join("")}" target="_blank">
                                                    <i class="fas fa-download icon-padding"></i>
                                                </a>
                                            </div>`;
                                    })}`;
                                },
                            },
                        },
                        {
                            name: "Command Line",
                            type: "complex",
                            display: {
                                template: "<div class='cmd'>${commandLine}</div>",
                            },
                        },
                    ],
                },
                /*
                {
                    title: "Results",
                    display: {
                        visible: job => job?.id,
                    },
                    elements: [
                        {
                            type: "custom",
                            display: {
                                defaultLayout: "vertical",
                                render: () => AnalysisRegistry.get(this.job.tool.id)?.result(this.job, this.opencgaSession)
                            },
                        },
                    ],
                },
                 */
                {
                    title: "Job Dependencies",
                    display: {
                        visible: job => job?.id,
                    },
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
                                border: true,
                            },
                        },
                    ],
                },
                {
                    title: "Job log",
                    display: {
                        visible: job => job?.id && this.mode === "full",
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

