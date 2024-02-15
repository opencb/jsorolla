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
            titleVisible: false,
            titleWidth: 2,
            defaultValue: "-",
            defaultLayout: "horizontal",
            buttonsVisible: false,
            pdf: true,
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
            this.displayConfig = {
                ...this.displayConfigDefault,
                ...this.displayConfig
            };
            this._config = this.getDefaultConfig();
        }
        // if (changedProperties.has("opencgaSession")) {
        //     this._config = this.getDefaultConfig();
        // }
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

    // FORMATTERS
    tagsFormatter(tag) {
        return `<span class="badge badge-pill badge-primary">${tag}</span>`;
    }

    jobStatusFormatter(status, appendDescription = false) {
        const description = appendDescription && status.description ? `<br>${status.description}` : "";
        // FIXME remove this backward-compatibility check in next v2.3
        const statusId = status.id || status.name;
        switch (statusId) {
            case "PENDING":
            case "QUEUED":
                return `<span class="text-primary"><i class="far fa-clock"></i> ${statusId}${description}</span>`;
            case "RUNNING":
                return `<span class="text-primary"><i class="fas fa-sync-alt anim-rotate"></i> ${statusId}${description}</span>`;
            case "DONE":
                return `<span class="text-success"><i class="fas fa-check-circle"></i> ${statusId}${description}</span>`;
            case "ERROR":
                return `<span class="text-danger"><i class="fas fa-exclamation-circle"></i> ${statusId}${description}</span>`;
            case "UNKNOWN":
                return `<span class="text-danger"><i class="fas fa-exclamation-circle"></i> ${statusId}${description}</span>`;
            case "ABORTED":
                return `<span class="text-warning"><i class="fas fa-ban"></i> ${statusId}${description}</span>`;
            case "DELETED":
                return `<span class="text-primary"><i class="fas fa-trash-alt"></i> ${statusId}${description}</span>`;
        }
        return "-";
    }


    jobOutputFilesFormatter(output, job, opencgaSession) {
        // CAUTION: Temporary patch for managing outputFiles array of nulls.
        //  See details in: https://app.clickup.com/t/36631768/TASK-1704
        debugger
        if (output.length > 0 && output.every(jobOut => jobOut === null)) {
            return `
                <div class="alert alert-danger" role="alert">
                    <i class="fas fa-1x fa-exclamation-circle align-middle">
                        The output files are not accessible at the moment. We are working on fixing this issue.
                    </i>
                </div>
            `;
        }
        const outputFiles= [...output];

        // Check if stdout and stderr files have been created and can be dowloaded
        ["stdout", "stderr"].forEach(file => {
            if (job[file]?.id && job[file]?.type === "FILE") {
                outputFiles.push(job[file]);
            }
        });

        if (outputFiles.length === 0) {
            return "No output files yet";
        }

        return `${outputFiles
            .map(file => {
                const url = [
                    opencgaSession.server.host,
                    "/webservices/rest/",
                    opencgaSession.server.version,
                    "/files/",
                    file.id,
                    "/download?study=",
                    opencgaSession.study.fqn,
                    "&sid=",
                    opencgaSession.token,
                ];
                return `
                    <div>
                        <span style="margin-right: 10px">${file.name} ${file.size > 0 ? `(${UtilsNew.getDiskUsage(file.size)})` : ""}</span>
                        <a href="${url.join("")}" target="_blank">
                            <i class="fas fa-download icon-padding"></i>
                        </a>
                    </div>`;
            })
            .join("")}`;
    }

    jobParamFormatter(param) {
        return `
            <label>${param.key}<label>:
            ${param.value && typeof param.value === "object" ? `
                <ul>
                    ${Object.keys(param.value).map(key2 => `
                        <li><b>${key2}</b>: ${param.value[key2] || "-"}</li>
                    `).join("")}
                </ul>
            ` : (param.value || "-")}
        `;
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
                            title: `Job ID ${job.id}`,
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
                            // type: "complex",
                            field: "internal.status",
                            display: {
                                // template: "${internal.status}",
                                format: status => UtilsNew.jobStatusFormatter(status, true),
                            }
                        },
                        {
                            name: "Priority",
                            field: "priority",
                        },
                        // {
                        //     name: "Tags",
                        //     field: "tags",
                        //     type: "list",
                        //     display: {
                        //         separator: "",
                        //         format: tag => {
                        //             return `<span class="badge badge-pill badge-primary">${tag}</span>`;
                        //         }
                        //     },
                        //     defaultValue: "-"
                        // },
                        {
                            name: "Tags",
                            field: "tags",
                            type: "list",
                            // Fixme: export to pdf  not working.
                            display: {
                                separator: "",
                                contentLayout: "bullets",
                                // format: tag => this.tagsFormatter(tag),
                                transform: tags => tags.map(tag => ({tag})),
                                template: "${tag}",
                                // CAUTION New: bootstrap class(es) to each element of the list. To approve.
                                classes: {
                                    "tag": "badge badge-pill badge-primary",
                                },
                                // style: {
                                //     "color": "red",
                                // },

                            },
                        },
                        {
                            name: "Submitted Date",
                            field: "creationDate",
                            display: {
                                format: creationDate => UtilsNew.dateFormatter(creationDate, "D MMM YYYY, h:mm:ss a"),
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
                            name: "Start Time",
                            field: "execution.start",
                            display: {
                                format: date => UtilsNew.dateFormatter(date, "D MMM YYYY, h:mm:ss a"),
                            },
                        },
                        {
                            name: "End Time",
                            field: "execution.end",
                            display: {
                                format: date => UtilsNew.dateFormatter(date, "D MMM YYYY, h:mm:ss a"),
                            },
                        },
                        {
                            name: "Input Parameters",
                            type: "custom",
                            display: {
                                render: job => {
                                    if (job.params) {
                                        return Object.entries(job.params)
                                            .map(([param, value]) => `
                                                <div>
                                                    <label>${param}</label>:
                                                    ${value && typeof value === "object" ? `
                                                        <ul>
                                                            ${Object.keys(value).map(key => `
                                                                <li><b>${key}</b>: ${value[key] || "-"}</li>
                                                            `).join("")}
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
                            name: "Input Parameters 2",
                            field: "params",
                            type: "list",
                            display: {
                                contentLayout: "bullets",
                                transform: values => Object
                                    .entries(values)
                                    // .map(([key, value]) => ({key, value})),
                                    .map(([key, content]) => {
                                        const value = (content && typeof content === "object") ?
                                            JSON.stringify(content, null, 8) :
                                            content;
                                        return {key, value};
                                    }),
                                format: param => `${param.key}: ${param.value}`,
                                // format: param => this.jobParamFormatter(param),
                                // template: "${key}: ${value}",
                                // style: {
                                //     key: {
                                //         "font-weight": "bold"
                                //     }
                                // }
                            }
                        },
                        {
                            name: "Input Files",
                            field: "input",
                            type: "list",
                            defaultValue: "N/A",
                            display: {
                                contentLayout: "bullets",
                                template: "${name}",
                            },
                        },
                        {
                            name: "Output Directory",
                            field: "outDir.path",
                        },
                        // {
                        //     name: "Output Files",
                        //     type: "complex",
                        //     display: {
                        //         // FIXME: export pdf not working
                        //         template: "${output}",
                        //         format: {
                        //             "output": (output, data) => this.jobOutputFilesFormatter(output, data, this.opencgaSession),
                        //         }
                        //     },
                        // },
                        {
                            name: "Command Line",
                            field: "commandLine",
                            // type: "text",
                            // text: data => data.commandLine,
                            display: {
                                className: "cmd",
                                // style: "display: block",
                                style: {
                                    "display": "block"
                                },
                                // textClassName: "cmd",
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
                                render: () => {}
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
                            display: {
                                defaultValue: "No Job dependencies",
                                columns: [
                                    {
                                        title: "Job ID",
                                        field: "id"
                                    },
                                    {
                                        title: "Name",
                                        field: "uuid"
                                    },
                                    {
                                        title: "Status",
                                        field: "internal.status.name"
                                    }
                                ],
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

