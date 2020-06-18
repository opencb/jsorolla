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
            },
            config: {
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
        this._jobs = [];
        this.jobs = [];
        this.filteredJobs = [];
        this.updatedCnt = 0;

        this._config = this.getDefaultConfig();
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.launchMonitor();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.launchMonitor();
        }
    }

    launchMonitor() {
        // Make a first query
        this.fetchLastJobs();

        // and then every 'interval' ms
        this.interval = setInterval(() => {
            this.fetchLastJobs();
        },this._config.interval || 30000);
    }

    async applyUpdated() {
        //oldList and newList are always the same length
        const oldList = this._jobs;
        const newList = this.jobs;
        this.updatedCnt = 0;
        // k is the counter of the new jobs
        const k = newList.findIndex(job => job.id === oldList[0].id) ?? 10;
        this.jobs = newList.map((job, i) => {
            if (i < k) {
                //handle the new jobs
                return {...job, updated: true};
            } else {
                //handle the change of state
                if (job.internal.status.name !== oldList[i - k].internal.status.name) {
                    return {...job, updated: true};
                } else {
                    return {...job, updated: false};
                }
            }
        });
        this.updatedCnt = k;
        await this.requestUpdate();
        this._jobs = this.jobs;
    }

    fetchLastJobs() {
        // const lastAccess = moment(this.opencgaSession.user.configs.IVA.lastAccess).format("YYYYMMDDHHmmss"); // NOTE: we use creationDate because we cannot query execution.end
        // const lastDays = moment(new Date());
        // const d = lastDays.subtract(10, "d").format("YYYYMMDD");
        const query = {
            study: this.opencgaSession.study.fqn,
            internalStatus: "PENDING,QUEUED,RUNNING,REGISTERING,UNREGISTERED,DONE,ERROR,ABORTED",
            limit: this._config.limit || 10,
            sort: "creationDate",
            order: -1
        };
        this.opencgaSession.opencgaClient.jobs().search(query)
            .then( restResponse => {
                // first call
                if (!this._jobs.length) {
                    this._jobs = restResponse.getResults();
                }
                this.jobs = restResponse.getResults();
                this.filteredJobs = this.jobs;
                // this.running = this.jobs.filter( job => ["PENDING", "QUEUED", "RUNNING"].includes(job?.internal?.status.name))
                // this.done = this.jobs.filter( job => ["DONE", "ERROR"].includes(job?.internal?.status.name) /!*job?.execution?.end >= lastDays.valueOf()*!/)
                // this.total = this.running.length + this.done.length;
                // this.requestUpdate();
            })
            .catch( restResponse => {
                console.error(restResponse)
            })
    }

    filterJobs(e) {
        e.stopPropagation();
        const types = e.currentTarget.dataset?.type?.split(",");
        this.filteredJobs = this.jobs.filter( job => types?.includes(job.internal.status.name) ?? 1)
        this.requestUpdate();
    }

    getDefaultConfig() {
        return {
            limit: 10,
            interval: 30000
        }
    }

    render() {
        return html`
            <ul class="nav navbar-nav navbar-right notification-nav">
                <li class="notification">
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false" @click="${this.applyUpdated}">
                        <span class="badge badge-pill badge-primary ${this.updatedCnt > 0 ? "" : "invisible"}">${this.updatedCnt}</span> <i class="fas fa-rocket"></i>
                    </a>
                    <ul class="dropdown-menu">
                        <!-- <li class="info">Jobs done since your last access ${moment(this.opencgaSession.user.configs.IVA.lastAccess).format("DD-MM-YYYY HH:mm:ss")}</li> -->
                        <li class="info">
                            <button @click="${this.filterJobs}" class="btn btn-small btn-default ripple">ALL</button>
                            <button @click="${this.filterJobs}" class="btn btn-small btn-default ripple" data-type="PENDING,QUEUED,RUNNING,REGISTERING">Running</button>
                            <button @click="${this.filterJobs}" class="btn btn-small btn-default ripple" data-type="UNREGISTERED,DONE,ERROR,ABORTED">Finished</button>
                        </li>
                        ${this.filteredJobs.length 
                            ? this.filteredJobs.map(job => html`
                                <li>
                                    <a href="javascript: void 0" class="${job.updated ? `updated status-${job?.internal?.status?.name}` : ""}">
                                        <div class="media">
                                            <div class="media-left">
                                                <i class="fas fa-rocket"></i>
                                            </div>
                                            <div class="media-body">
                                                ${job.updated ? html`<span class="badge">NEW</span>` : ""}
                                                <h4 class="media-heading">${job.id}</h4>
                                                <small>${job.tool.id}</small> |
                                                <small>${moment(job.creationDate, "YYYYMMDDHHmmss").format("D MMM YYYY, h:mm:ss a")}</small>
                                                <p>${UtilsNew.renderHTML(UtilsNew.jobStatusFormatter(job?.internal?.status?.name))}</p> 
                                            </div>
                                        </div>
                                     </a>
                                </li>`) 
                            : html`
                                <li>
                                    <a> No jobs </a>
                                </li>`
                        }
                    </ul>
                </li>
            </ul>
        `;
    }

}

customElements.define("job-monitor", JobMonitor);
