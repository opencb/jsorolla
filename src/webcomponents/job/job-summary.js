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

import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../core/utils-new.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter.js";
import "../commons/forms/data-form.js";
import "../loading-spinner.js";

export default class JobSummary extends LitElement {

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
            opencgaSession: {
                type: Object,
            },
            displayConfig: {
                type: Object,
            },
        };
    }

    #init() {
        this._job = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("job")) {
            this.jobObserver();
        }

        if (changedProperties.has("jobId")) {
            this.jobIdObserver();
        }

        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    jobObserver() {
        // we have to perform a full clone the job object to avoid modifying the original one
        this._job = UtilsNew.objectClone(this.job);
        this.formatJobParams();
    }

    jobIdObserver() {
        this._job = null;
        if (this.jobId && this.opencgaSession) {
            this.opencgaSession.opencgaClient.jobs()
                .info(this.jobId, {
                    study: this.opencgaSession.study.fqn,
                })
                .then(response => {
                    this._job = response.responses[0].results[0];
                    this.formatJobParams();
                    this.requestUpdate();
                })
                .catch(reason => {
                    console.error(reason);
                });
        }
    }

    formatJobParams() {
        // transform datapoint Input Parameters 'params' object into an array
        if (this._job?.params && typeof this._job.params === "object") {
            this._job.params = Object.keys(this._job.params).map(paramKey => {
                const content = this._job.params[paramKey];
                return {
                    paramKey: paramKey,
                    paramValue: (content && typeof content === "object") ? JSON.stringify(content, null, 8) : content,
                };
            });
        }
    }

    jobOutputFilesFormatter(output, job, opencgaSession) {
        // CAUTION: Temporary patch for managing outputFiles array of nulls.
        //  See details in: https://app.clickup.com/t/36631768/TASK-1704
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

        return outputFiles.map(file => {
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
                    <span style="margin-right: 10px">
                        ${file.name} ${file.size > 0 ? `(${UtilsNew.getDiskUsage(file.size)})` : ""}
                    </span>
                    <a href="${url.join("")}" target="_blank">
                        <i class="fas fa-download"></i>
                    </a>
                </div>
            `;
        }).join("");
    }

    render() {
        if (!this.opencgaSession || !this._job) {
            return nothing;
        }

        return html`
            <data-form
                .data="${this._job}"
                .config="${this._config || {}}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                buttonsVisible: false,
                titleVisible: false,
                ...this.displayConfig,
            },
            sections: [
                {
                    title: "Summary",
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
                            type: "complex",
                            display: {
                                template: "${internal.status}",
                                format: {
                                    "internal.status": status => CatalogGridFormatter.jobStatusFormatter(status, true),
                                },
                            }
                        },
                        {
                            name: "Notification",
                            field: "execution.events",
                            type: "list",
                            display: {
                                defaultValue: "-",
                                contentLayout: "vertical",
                                template: "${type}: ${message}",
                                style: {
                                    type: {
                                        "font-weight": "bold",
                                        "color": (type, event) => {
                                            switch (type) {
                                                case "ERROR":
                                                    return "darkred";
                                                case "WARNING":
                                                    return "darkorange";
                                                case "INFO":
                                                    return "darkblue";
                                            }
                                        }
                                    },
                                }
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
                                contentLayout: "bullets",
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
                            field: "params",
                            type: "list",
                            display: {
                                defaultValue: "-",
                                contentLayout: "vertical",
                                template: "${paramKey}: ${paramValue}",
                                style: {
                                    paramKey: {
                                        "font-weight": "bold"
                                    }
                                }
                            }
                        },
                        {
                            name: "Input Files",
                            field: "input",
                            type: "list",
                            display: {
                                defaultValue: "-",
                                contentLayout: "bullets",
                                template: "${name}",
                            },
                        },
                        {
                            name: "Output Directory",
                            field: "outDir.path",
                        },
                        {
                            name: "Output Files",
                            type: "complex",
                            display: {
                                template: "${output}",
                                format: {
                                    "output": (output, data) => {
                                        return this.jobOutputFilesFormatter(output, data, this.opencgaSession);
                                    },
                                }
                            },
                        },
                        {
                            name: "Command Line",
                            field: "commandLine",
                            display: {
                                className: "cmd",
                                style: {
                                    "display": "block"
                                },
                            },
                        },
                    ],
                },
                {
                    title: "Job Dependencies",
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
                                        field: "internal.status.id"
                                    }
                                ],
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("job-summary", JobSummary);

