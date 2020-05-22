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
import "../commons/view/data-view.js";


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
            opencgaClient: {
                type: Object
            },
            jobId: {
                type: String
            },
            job: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        // this.prefix = "osv" + UtilsNew.randomString(6);
        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }


    firstUpdated(_changedProperties) {
    }

    updated(changedProperties) {
        if (changedProperties.has("jobId")) {
            this.jobIdObserver();
        }
        if (changedProperties.has("job")) {
            this.jobObserver();
        }
        if (changedProperties.has("config")) {
            this.configObserver();
        }
    }

    configObserver() {
    }

    jobIdObserver() {
        const params = {
            study: this.opencgaSession.project.alias + ":" + this.opencgaSession.study.alias,
            includeIndividual: true
        };
        this.opencgaSession.opencgaClient.jobs().info(this.jobId, params)
            .then(response => {
                this.job = response.getResult(0);
                this.job.id = this.job.id ?? this.job.name;
                this.requestUpdate();
            })
            .catch(function(reason) {
                console.error(reason);
            });


    }

    jobObserver() {
        console.log("jobObserver");
    }

    statusFormatter(status) {
        switch (status) {
            case "PENDING":
            case "QUEUED":
            case "REGISTERING":
            case "UNREGISTERED":
                return `<span class="text-primary"><i class="far fa-clock"></i> ${status}</span>`
            case "RUNNING":
                return `<span class="text-primary"><i class="fas fa-sync-alt anim-rotate"></i> ${status}</span>`
            case "DONE":
                return `<span class="text-success"><i class="fas fa-check-circle"></i> ${status}</span>`
            case "ERROR":
                return `<span class="text-danger"><i class="fas fa-exclamation-circle"></i> ${status}</span>`;
            case "UNKNOWN":
                return `<span class="text-danger"><i class="fas fa-exclamation-circle"></i> ${status}</span>`;
            case "ABORTED":
                return `<span class="text-warning"><i class="fas fa-ban"></i> ${status}</span>`;
            case "DELETED":
                return `<span class="text-primary"><i class="fas fa-trash-alt"></i> ${status}</span>`;
        }
        return "-";
    }

    renderHTML(html) {
        return document.createRange().createContextualFragment(`${html}`);
    }


    getDefaultConfig() {
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
                    title: "General",
                    collapsed: false,
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
                            name: "Creation Date",
                            field: "creationDate",
                            type: "custom",
                            display: {
                                render: field => html`${UtilsNew.dateFormatter(field)}`
                            }
                        },
                        {
                            name: "Tool",
                            field: "tool.id"
                        },
                        {
                            name: "Input files",
                            field: "input",
                            type: "list",
                            display: {
                                template: "${name}",
                                contentLayout: "bullets",
                                defaultValue: "N/A"
                            }
                        },
                        {
                            name: "Parameters",
                            field: "params",
                            type: "custom",
                            display: {
                                render: field => Object.entries(field).map(([param, value]) => html`<p><strong>${param}</strong>: ${value ? value : "-"}</p>`)
                            }
                        },
                        {
                            name: "Status",
                            field: "internal",
                            type: "custom",
                            display: {
                                render: field => this.renderHTML(this.statusFormatter(field.status.name))
                            }
                        },
                        {
                            name: "Execution",
                            field: "execution",
                            type: "custom",
                            display: {
                                render: field => html`<strong>START</strong>: ${moment(field.start).format("D MMM YYYY, h:mm:ss a")} ${field.end ?  `<strong>END</strong>:${moment(field.end).format("D MMM YYYY, h:mm:ss a")}` : "" }`
                            }
                        },
                        {
                            name: "Priority",
                            field: "priority"
                        },
                        {
                            name: "Output dir",
                            field: "outDir.uri"
                        },
                        {
                            name: "Dependencies",
                            field: "dependsOn",
                            type: "table",
                            display: {
                                columns: [
                                    {
                                        name: "ID", field: "id"
                                    },
                                    {
                                        name: "Name", field: "uuid"
                                    },
                                    {
                                        name: "Status", field: "status"
                                        //format: ${this.renderHTML(this.statusFormatter(status.name))}
                                    }
                                ],
                                border: true
                            }
                        },
                        {
                            name: "Dependencies",
                            field: "dependsOn",
                            type: "json"
                        }
                    ]
                }
            ]
        };
    }

    render() {
        return html`
            <data-view .data=${this.job} .config="${this.getDefaultConfig()}"></data-view>
        `;
    }

}

customElements.define("opencga-jobs-view", OpencgaJobsView);

