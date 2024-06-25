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
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import UtilsNew from "../../core/utils-new.js";
import NotificationUtils from "../commons/utils/notification-utils.js";

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
        this.restCnt = 0;

        this._config = this.getDefaultConfig();
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.launchMonitor();
        }
        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
            this.launchMonitor();
        }
    }

    launchMonitor() {
        if (OpencgaCatalogUtils.checkPermissions(this.opencgaSession.study, this.opencgaSession.user.id, "VIEW_JOBS")) {
        // Make a first query
            clearInterval(this.interval);
            this._jobs = [];
            this.jobs = [];
            this.filteredJobs = [];
            this.fetchLastJobs();
            // and then every 'interval' ms
            this.interval = setInterval(() => {
                this.fetchLastJobs();
            }, this._config.interval);
        }
    }

    async applyUpdated() {
        // oldList and newList are always the same length
        const oldList = this._jobs;
        const newList = this.jobs;
        // `index` is the position of the first job of oldList in newList (newly added jobs are index < k)
        const index = newList.findIndex(job => job.id === oldList[0].id);
        const k = index > -1 ? index : newList.length; // -1 occurs iff the whole list is made of new jobs
        this.jobs = newList.map((job, i) => {
            if (i < k) {
                // handle the new jobs
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_INFO, {
                    message: `${job.id}, "The job has been added`,
                });
                return {...job, updated: true};
            } else {
                // handle the change of state
                // FIXME remove this in v2.3
                const statusId = job.internal.status.id || job.internal.status.name;
                const oldStatusId = oldList[i - k].internal.status.id || oldList[i - k].internal.status.name;
                if (statusId !== oldStatusId) {
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_INFO, {
                        message: `${job.id} The job has now status ${job?.internal?.status?.id || job?.internal?.status?.name}`,
                    });
                    return {...job, updated: true};
                } else {
                    // if the ids are the same I want to keep the `updated` status
                    // return {...job, updated: false};
                    return {...oldList[i - k]};
                }
            }
        });
        // accumulate all the updated (not visited) status
        this.updatedCnt = this.jobs.reduce((acc, job) => job.updated && !job._visited ? acc + 1 : acc, 0);
        this.requestUpdate();
        await this.updateComplete;
        this._jobs = this.jobs;
    }

    fetchLastJobs() {
        if (!this?.opencgaSession?.token || !$("#job-monitor").is(":visible")) {
            clearInterval(this.interval);
            return;
        }

        const query = {
            study: this.opencgaSession.study.fqn,
            internalStatus: "PENDING,QUEUED,RUNNING,DONE,ERROR,ABORTED",
            limit: this._config.limit || 10,
            sort: "creationDate",
            include: "id,internal.status,tool,creationDate",
            order: -1
        };
        this.opencgaSession.opencgaClient.jobs().search(query)
            .then(async restResponse => {
                // console.log("restResponse", restResponse);
                // first call
                if (!this._jobs.length) {
                    this._jobs = restResponse.getResults();
                }
                this.jobs = restResponse.getResults();
                await this.applyUpdated();
                this.filteredJobs = this.jobs.filter(job => this.filterTypes?.includes(job.internal.status.id || job.internal.status.name) ?? 1);
                this.requestUpdate();
            })
            .catch(restResponse => {
                console.error(restResponse);
            });
    }

    filterJobs(e) {
        e.stopPropagation();
        this.filterTypes = e.currentTarget.dataset?.type?.split(",");
        this.filteredJobs = this.jobs.filter(job => this.filterTypes?.includes(job.internal.status.id || job.internal.status.name) ?? 1);
        this.requestUpdate();
    }

    forceRefresh(e) {
        e.stopPropagation();
        this.fetchLastJobs();
    }

    toggleDropdown() {
        this.dropdown = !this.dropdown;
    }

    render() {
        return html`
            <ul id="job-monitor" class="nav navbar-nav notification-nav">
                <li class="notification">
                    <a href="#" class="dropdown-toggle dropdown-button-wrapper" title="Job Monitor" data-toggle="dropdown" role="button"
                       aria-haspopup="true" aria-expanded="false" @click="${this.toggleDropdown}">
                        <div class="dropdown-button-icon">
                            <i class="fas fa-rocket"></i>
                        </div>
                        <span class="badge badge-pill badge-primary ${this.updatedCnt > 0 ? "" : "invisible"}">${this.updatedCnt}</span>
                    </a>
                    <ul class="dropdown-menu">
                        <li class="info">
                            <button @click="${this.filterJobs}" class="btn btn-small btn-default ripple">ALL</button>
                            <button @click="${this.filterJobs}" class="btn btn-small btn-default ripple" data-type="PENDING,QUEUED,RUNNING">Running</button>
                            <button @click="${this.filterJobs}" class="btn btn-small btn-default ripple" data-type="UNREGISTERED,DONE,ERROR,ABORTED">Finished</button>
                            <button @click="${this.forceRefresh}" class="btn btn-small btn-default ripple pull-right" title="Force immediate refresh" id="#refresh-job">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                        </li>
                        ${this.filteredJobs.length ? this.filteredJobs.map(job => html`
                            <li>
                                <a href="#job" class="job-monitor-item">
                                    <div class="media">
                                        <div class="media-left rocket-${job?.internal?.status?.id ?? job?.internal?.status?.name ?? "default"}">
                                            <i class="fas fa-rocket"></i>
                                        </div>
                                        <div class="media-body">
                                            <h4 class="media-heading">${job.id}</h4>
                                            <small>${job.tool.id}</small> |
                                            <small>${moment(job.creationDate, "YYYYMMDDHHmmss").format("D MMM YYYY, h:mm:ss a")}</small>
                                            <p>${UtilsNew.renderHTML(UtilsNew.jobStatusFormatter(job?.internal?.status))}</p>
                                        </div>
                                    </div>
                                 </a>
                            </li>
                        `) : html`
                            <li>
                                <a>No jobs</a>
                            </li>
                        `}
                    </ul>
                </li>
            </ul>
        `;
    }

    getDefaultConfig() {
        return {
            limit: 10,
            interval: 30000
        };
    }

}

customElements.define("job-monitor", JobMonitor);
