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
        this._interval = -1;
        this._updatedJobsCount = 0;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this._jobs = [];
            this._updatedJobsCount = 0;
        }
        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }
        super.update();
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("config")) {
            this.launchMonitor();
        }
    }

    launchMonitor() {
        clearInterval(this._interval);
        if (this.opencgaSession) {
            // Check if the user has VIEW_JOBS permission in the current study
            if (OpencgaCatalogUtils.checkPermissions(this.opencgaSession.study, this.opencgaSession.user.id, "VIEW_JOBS")) {
                this.fetchLastJobs();
                this._interval = setInterval(() => this.fetchLastJobs(), this._config.interval);
            }
        }
    }

    fetchLastJobs() {
        // if (!this?.opencgaSession?.token || !$("#job-monitor").is(":visible")) {
        //     clearInterval(this.interval);
        //     return;
        // }
        this.opencgaSession.opencgaClient.jobs()
            .search({
                study: this.opencgaSession.study.fqn,
                internalStatus: "PENDING,QUEUED,RUNNING,DONE,ERROR,ABORTED",
                limit: this._config.limit || 10,
                sort: "creationDate",
                include: "id,internal.status,tool,creationDate",
                order: -1,
            })
            .then(response => {
                // this._updatedJobsCount = 0;
                const newJobsList = response?.responses?.[0]?.results || [];
                // 1. Process the list of new jobs returned by OpenCGA
                if (this._jobs.length > 0) {
                    newJobsList.forEach(job => {
                        const oldJob = this._jobs.find(j => j.id === job.id);
                        if (oldJob) {
                            const statusId = job?.internal?.status?.id || "-";
                            const oldStatusId = oldJob?.internal?.status?.id || "-";
                            // If this job exists in the previous list, and now it has a different status, display a confirmation message
                            if (statusId !== oldStatusId) {
                                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_INFO, {
                                    message: `The job <b>${job?.id}</b> has now status ${statusId}.`,
                                });
                                this._updatedJobsCount = this._updatedJobsCount + 1;
                            }
                        } else {
                            // This is a new job, so we display an info notification to the user
                            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_INFO, {
                                message: `The job <b>${job?.id}</b> has been added.`,
                            });
                            this._updatedJobsCount = this._updatedJobsCount + 1;
                        }
                    });
                }
                // 2. Save the new jobs list
                this._jobs = newJobsList;
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

    openJob(jobId) {
        // -> e.stopPropagation();
        const job = this.jobs.find(job => job.id === jobId);
        job._visited = true;
        this.jobs = [...this.jobs];
        this.requestUpdate();

        this.dispatchEvent(new CustomEvent("route", {
            detail: {
                hash: "#job",
                resource: "job",
                query: {id: jobId}
            },
            bubbles: true, // this is necessary as the event is handled in iva-app
            composed: true
        }));
    }

    forceRefresh() {
        this.fetchLastJobs();
    }

    render() {
        return html`
            <ul id="job-monitor" class="navbar-nav">
                <li class="nav-item dropdown">
                    <a href="#" class="nav-link dropdown-toggle dropdown-button-wrapper" data-bs-toggle="dropdown" role="button">
                        <div class="dropdown-button-icon">
                            <i class="fas fa-rocket"></i>
                        </div>
                        ${this._updatedJobsCount > 0 ? html`
                            <span class="position-absolute top-0 start-100 mt-1 translate-middle badge bg-danger rounded-pill">
                                ${this._updatedJobsCount}
                            </span>
                        ` : nothing}
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end" style="width:350px;">
                        <li class="d-flex justify-content-around mx-1 mb-2 gap-2">
                            <button @click="${this.filterJobs}" class="btn btn-sm btn-outline-secondary flex-fill">
                                <strong>All</strong>
                            </button>
                            <button @click="${this.filterJobs}" class="btn btn-sm btn-outline-secondary flex-fill" data-type="PENDING,QUEUED,RUNNING">Running</button>
                            <button @click="${this.filterJobs}" class="btn btn-sm btn-outline-secondary flex-fill" data-type="UNREGISTERED,DONE,ERROR,ABORTED">Finished</button>
                            <button @click="${this.forceRefresh}" class="btn btn-sm btn-outline-secondary" title="Force immediate refresh" id="#refresh-job">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                        </li>
                        ${this.filteredJobs.length ? this.filteredJobs.map(job => html`
                            <li>
                                <a href="javascript: void 0" class="dropdown-item border-top ${job.updated && !job._visited ?
                                        `updated status-${job?.internal?.status?.id || job?.internal?.status?.name}` : ""}"
                                        @click=${() => this.openJob(job.id)}>
                                    <div class="d-flex align-items-center overflow-hidden" style="zoom:1">
                                        <div class="flex-shrink-0 fs-2 rocket-${job?.internal?.status?.id ?? job?.internal?.status?.name ?? "default"}">
                                            <i class="text-secondary fas fa-rocket"></i>
                                        </div>
                                        <div class="flex-grow-1 ms-3">
                                            ${job.updated && !job._visited ? html`<span class="badge bg-primary rounded-pill">NEW</span>` : ""}
                                            <div class="mt-0 text-truncate" style="max-width: 300px">${job.id}</div>
                                            <small class="text-secondary">${job?.tool?.id}
                                            <div class="vr"></div>
                                            ${moment(job.creationDate, "YYYYMMDDHHmmss").format("D MMM YYYY, h:mm:ss a")}</small>
                                            <div>${UtilsNew.renderHTML(UtilsNew.jobStatusFormatter(job?.internal?.status))}</div>
                                        </div>
                                    </div>
                                </a>
                            </li>
                        `) : html`
                            <li>
                                <div class="pt-2 pb-1 text-center fw-bold border-top">
                                    No jobs on this category.
                                </div>
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
            interval: 30000,
        };
    }

}

customElements.define("job-monitor", JobMonitor);
