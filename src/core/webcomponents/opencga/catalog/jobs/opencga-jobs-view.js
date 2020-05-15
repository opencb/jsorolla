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
import Utils from "./../../../../utils.js";


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
            showTitle: false
        };
    }

    render() {
        return html`
        <style>
            .section-title {
                border-bottom: 2px solid #eee;
            }
            .label-title {
                text-align: left;
                padding-left: 5px;
                padding-right: 10px;
            }
        </style>
        ${this.job ? html`
            <div>
                ${this._config.showTitle ? html`<h3 class="section-title">Summary</h3>` : null}
                <div class="col-md-12">
                    <form class="form-horizontal">
                        <div class="form-group">
                            <label class="col-md-3 label-title">Id</label>
                            <span class="col-md-9">${this.job.id} (${this.job.uuid})</span>
                        </div>
                        <div class="form-group">
                            <label class="col-md-3 label-title">User</label>
                            <span class="col-md-9">${this.job.userId}</span>
                        </div>
                        <div class="form-group">
                            <label class="col-md-3 label-title">Creation Date</label>
                            <span class="col-md-9">${moment(this.job.creationDate, "YYYYMMDDHHmmss").format("D MMM YYYY, h:mm:ss a")}</span>
                        </div>
                        <div class="form-group">
                            <label class="col-md-3 label-title">Tool</label>
                            <span class="col-md-9">${this.job.tool.id}</span>
                        </div>
                        <div class="form-group">
                            <label class="col-md-3 label-title">Input files</label>
                            <span class="col-md-9">${this.job.input.map(file => html`<p>${file.name}</p>`)}</span>
                        </div>
                        <div class="form-group">
                            <label class="col-md-3 label-title">Parameters</label>
                            <span class="col-md-9">${Object.entries(this.job.params).map(([param, value]) => html`<p><strong>${param}</strong>: ${value ? value : "-"}</p>`)}</span>
                        </div>
                        <div class="form-group">
                            <label class="col-md-3 label-title">Status</label>
                            <span class="col-md-9">${this.renderHTML(this.statusFormatter(this.job.internal.status.name))}</span>
                        </div>
                        ${this.job.execution?.start ? html`
                            <div class="form-group">
                                <label class="col-md-3 label-title">Execution Start</label>
                                <span class="col-md-9">
                                    ${moment(this.job.execution.start).format("D MMM YYYY, h:mm:ss a")} <br>
                                </span>
                            </div> 
                        ` : null}
                        ${this.job.execution?.end ? html`
                            <div class="form-group">
                                <label class="col-md-3 label-title">Execution End</label>
                                <span class="col-md-9">
                                    ${moment(this.job.execution.end).format("D MMM YYYY, h:mm:ss a")} <br>
                                </span>
                            </div> 
                        ` : null}                            
                        ${this.job.tags?.length ? html`
                            <div class="form-group">
                                <label class="col-md-3 label-title">Tags</label>
                                <span class="col-md-9">${this.job.tags}</span>
                            </div>
                        ` : null}
                        <div class="form-group">
                            <label class="col-md-3 label-title">Priority</label>
                            <span class="col-md-9">${this.job.priority}</span>
                        </div>
                        <div class="form-group">
                            <label class="col-md-3 label-title">Output Dir</label>
                            <span class="col-md-9">${this.job.outDir?.uri || "-"}</span>
                        </div>
                        
                        ${this.job.dependsOn && this.job.dependsOn.length ? html`
                            <div class="form-group">
                                <label class="col-md-3 label-title">Dependencies</label>
                                <span class="col-md-9">
                                    <ul>
                                        ${this.job.dependsOn.map(job => html`
                                            <li>${job.id} (${job.uuid}) (${this.renderHTML(this.statusFormatter(job.internal.status.name))})</li>
                                        `)}
                                    </ul>
                                </span>
                            </div>` : null}
                    </form>
                </div>
            </div>
        ` : null}
        `;
    }

}

customElements.define("opencga-jobs-view", OpencgaJobsView);

