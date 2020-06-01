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
import UtilsNew from "../../utilsNew.js";
import "../commons/view/data-form.js";


export default class OpencgaJobsView extends LitElement {

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

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("jobId")) {
            this.jobIdObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.requestUpdate();
        }
    }

    jobIdObserver() {
        if (this.opencgaSession && this.jobId) {
            this.opencgaSession.opencgaClient.jobs().info(this.jobId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.job = response.getResult(0);
                    this.requestUpdate();
                })
                .catch(function(reason) {
                    console.error(reason);
                });
        }
    }

    statusFormatter(status) {
        switch (status) {
            case "PENDING":
            case "QUEUED":
            case "REGISTERING":
            case "UNREGISTERED":
                return html`<span class="text-primary"><i class="far fa-clock"></i> ${status}</span>`
            case "RUNNING":
                return html`<span class="text-primary"><i class="fas fa-sync-alt anim-rotate"></i> ${status}</span>`
            case "DONE":
                return html`<span class="text-success"><i class="fas fa-check-circle"></i> ${status}</span>`
            case "ERROR":
                return html`<span class="text-danger"><i class="fas fa-exclamation-circle"></i> ${status}</span>`;
            case "UNKNOWN":
                return html`<span class="text-danger"><i class="fas fa-exclamation-circle"></i> ${status}</span>`;
            case "ABORTED":
                return html`<span class="text-warning"><i class="fas fa-ban"></i> ${status}</span>`;
            case "DELETED":
                return html`<span class="text-primary"><i class="fas fa-trash-alt"></i> ${status}</span>`;
        }
        return "-";
    }

    getDefaultConfig() {
        return {
            title: "Summary",
            icon: "",
            display: {
                collapsable: true,
                showTitle: false,
                labelWidth: 2,
                defaultLayout: "horizontal",
                defaultValue: "-"
            },
            sections: [
                {
                    title: "Details",
                    display: {
                        collapsed: false,
                    },
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
                            name: "Tool",
                            field: "tool.id"
                        },
                        {
                            name: "Status",
                            // field: "internal",
                            type: "custom",
                            display: {
                                // render: job => UtilsNew.renderHTML(this.statusFormatter(job.internal.status.name))
                                render: job => html`${this.statusFormatter(job.internal.status.name)}`
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
                            defaultValue: "-"
                        },
                        {
                            name: "Submitted Date",
                            // field: "creationDate",
                            type: "custom",
                            display: {
                                render: job => html`${UtilsNew.dateFormatter(job.creationDate, "D MMM YYYY, h:mm:ss a")}`
                            }
                        },
                        {
                            name: "Output Directory",
                            field: "outDir.uri"
                        },
                        {
                            name: "Description",
                            field: "description"
                        },
                    ]
                },
                {
                    title: "Execution",
                    display: {

                    },
                    elements: [
                        {
                            name: "Start-End",
                            // field: "execution",
                            type: "custom",
                            display: {
                                render: job => html`${moment(job.execution.start).format("D MMM YYYY, h:mm:ss a")} - ${job.execution.end ? html`${moment(job.execution.end).format("D MMM YYYY, h:mm:ss a")}` : html`-` }`
                            }
                        },
                        {
                            name: "Parameters",
                            // field: "params",
                            type: "custom",
                            display: {
                                render: job => Object.entries(job.params).map(([param, value]) => html`<div><label>${param}</label>: ${value ? value : "-"}</div>`)
                            }
                        },
                        {
                            name: "Input Files",
                            field: "input",
                            type: "list",
                            defaultValue: "N/A",
                            display: {
                                template: "${name}",
                                contentLayout: "bullets",
                            }
                        },
                        {
                            name: "Output Files",
                            field: "output",
                            type: "list",
                            defaultValue: "N/A",
                            display: {
                                template: "${name}",
                                contentLayout: "bullets",
                            }
                        },
                        {
                            name: "Command Line",
                            field: "commandLine"
                        },
                    ]
                },
                {
                    title: "Dependencies",
                    display: {

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
                                        name: "ID", field: "id"
                                    },
                                    {
                                        name: "Name", field: "uuid"
                                    },
                                    {
                                        name: "Status", field: "internal.status.name"
                                        //format: ${UtilsNew.renderHTML(this.statusFormatter(status.name))}
                                    }
                                ],
                                border: true
                            }
                        },
                        // {
                        //     name: "Dependencies",
                        //     field: "dependsOn",
                        //     type: "json"
                        // }
                    ]
                }
            ]
        };
    }

    render() {
        return html`
            <data-form .data=${this.job} .config="${this._config}"></data-form>
        `;
    }
}

customElements.define("opencga-jobs-view", OpencgaJobsView);

