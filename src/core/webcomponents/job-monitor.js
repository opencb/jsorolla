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
import UtilsNew from "../utilsNew.js";

export class JobMonitor extends LitElement {

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
            }
        };
    }

    _init() {
        this.iconMap = {
            info: "fa fa-info-circle fa-2x",
            success: "fa fa-thumbs-up fa-2x",
            warning: "fa fa-exclamation-triangle fa-2x",
            danger: "fa ffa fa-exclamation-circle fa-2x",
            error: "fa ffa fa-exclamation-circle fa-2x"
        };
        this.jobs = [];
        this.filteredJobs = [];
    }

    updated(_changedProperties) {
        if (_changedProperties.has("opencgaSession")) {
            this.lastJobs();
        }
    }

    lastJobs() {
        const lastAccess = moment(this.opencgaSession.user.configs.IVA.lastAccess).format("YYYYMMDDHHmmss"); // NOTE: we use creationDate as we cannot query execution.end
        const lastDays = moment(new Date());
        const d = lastDays.subtract(10, "d").format("YYYYMMDD");
        this.opencgaSession.opencgaClient.jobs().search({study: this.opencgaSession.study.fqn, internalStatus: "DONE,ERROR,PENDING,QUEUED,RUNNING", limit: 10, sort: "creationDate", order: -1}).then( restResponse => {
            this.jobs = restResponse.getResults();
            this.jobs.sort((a, b) => a.internal.status.name < b.internal?.status.name ? 1 : -1);
            this.filteredJobs = this.jobs;
            /*this.running = this.jobs.filter( job => ["PENDING", "QUEUED", "RUNNING"].includes(job?.internal?.status.name))
            this.done = this.jobs.filter( job => ["DONE", "ERROR"].includes(job?.internal?.status.name) /!*job?.execution?.end >= lastDays.valueOf()*!/)
            this.total = this.running.length + this.done.length;*/
            this.requestUpdate();
        }).catch( restResponse => {
            console.error(restResponse)
        })

    }

    filterJobs(e) {
        e.stopPropagation();
        const types = e.currentTarget.dataset?.type?.split(",");
        this.filteredJobs = this.jobs.filter( job => types?.includes(job.internal.status.name) ?? 1)
        this.requestUpdate();
    }

    render() {
        return html`
            <ul class="nav navbar-nav navbar-right notification-nav">
                <li class="notification">
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                        <span class="badge badge-pill badge-primary ${!this.jobs.length > 0 ? "invisible" : ""}">${this.jobs.length}</span> <i class="fas fa-rocket"></i>
                    </a>
                    <ul class="dropdown-menu">
                        <!-- <li class="info">Jobs done since your last access ${moment(this.opencgaSession.user.configs.IVA.lastAccess).format("DD-MM-YYYY HH:mm:ss")}</li> -->
                        <li class="info">
                            <button @click="${this.filterJobs}" class="btn btn-small btn-default ripple">ALL</button>
                            <button @click="${this.filterJobs}" class="btn btn-small btn-default ripple" data-type="PENDING,QUEUED,RUNNING">Running</button>
                            <button @click="${this.filterJobs}" class="btn btn-small btn-default ripple" data-type="DONE,ERROR">Done</button>
                        </li>
                        ${this.filteredJobs.length ? this.filteredJobs.map(job => html`
                            <li>
                                <a href="#">
                                    <div class="media">
                                        <div class="media-left">
                                            <i class="fas fa-rocket"></i>
                                        </div>
                                        <div class="media-body">
                                            <small>${job.tool.id}</small> | 
                                            <small>${moment(job.creationDate, "YYYYMMDDHHmmss").format("D MMM YYYY, h:mm:ss a")}</small>
                                            <h4 class="media-heading">${job.id}</h4>
                                            <p>${UtilsNew.renderHTML(UtilsNew.jobStatusFormatter(job?.internal?.status?.name))}</p> 
                                        </div>
                                    </div>
                                 </a>
                            </li>
                        `) : html`
                            <li>
                                <a> No jobs </a>
                            </li>
                        `}
                    </ul>
                </li>
            </ul>            
            `;
    }

}

customElements.define("job-monitor", JobMonitor);
