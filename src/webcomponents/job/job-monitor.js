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
import CatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import UtilsNew from "../../core/utils-new.js";
import NotificationUtils from "../commons/utils/notification-utils.js";

export class JobMonitor extends LitElement {

    constructor() {
        super();
        this.#init();
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

    #init() {
        this.JOBS_TYPES = {
            ALL: {
                title: "All",
                jobsTypes: [],
            },
            RUNNING: {
                title: "Running",
                jobsTypes: ["PENDING", "QUEUED", "RUNNING"],
            },
            FINISHED: {
                title: "Finished",
                jobsTypes: ["DONE", "ERROR", "ABORTED"],
            },
        };
        this._interval = -1;
        this._jobs = [];
        this._addedJobs= new Set(); // Used for displaying the NEW label in each new job
        this._updatedJobsCount = 0; // To store the number of changes (new jobs, state changes)
        this._visibleJobsType = "ALL"; // Current visible jobs types (one of JOB_TYPES)
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this._jobs = [];
            this._updatedJobsCount = 0;
            this._addedJobs = new Set();
            this._visibleJobsType = "ALL";
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
            if (CatalogUtils.checkPermissions(this.opencgaSession.study, this.opencgaSession.user.id, "VIEW_JOBS")) {
                this.fetchLastJobs();
                this._interval = setInterval(() => this.fetchLastJobs(), this._config.interval);
            }
        }
    }

    fetchLastJobs() {
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
                const newJobsList = response?.responses?.[0]?.results || [];
                // 1. Process the list of new jobs returned by OpenCGA
                // Note: we check if the previous list of jobs is not empty, to prevent marking all jobs as new jobs
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
                            this._addedJobs.add(job.id);
                        }
                    });
                }
                // 2. Save the new jobs list
                this._jobs = newJobsList;
                this.requestUpdate();
            })
            .catch(response => {
                console.error(response);
            });
    }

    getJobUrl(jobId) {
        return `#job/${this.opencgaSession.project.id}/${this.opencgaSession.study.id}/${jobId}`;
    }

    onRefresh() {
        this.fetchLastJobs();
    }

    onJobTypeChange(event, newJobType) {
        event.stopPropagation();
        this._visibleJobsType = newJobType;
        this.requestUpdate();
    }

    renderJobsButtons() {
        return Object.keys(this.JOBS_TYPES).map(type => html`
            <button class="btn btn-sm ${type === this._visibleJobsType ? "btn-secondary" : "btn-outline-secondary"} flex-fill" @click="${e => this.onJobTypeChange(e, type)}">
                <strong>${this.JOBS_TYPES[type].title}</strong>
            </button>
        `);
    }

    renderVisibleJobsList() {
        // Get the list of visible jobs with the selected type
        const visibleJobs = this._jobs.filter(job => {
            return this._visibleJobsType === "ALL" || this.JOBS_TYPES[this._visibleJobsType].jobsTypes.includes(job?.internal?.status?.id);
        });
        if (visibleJobs.length > 0) {
            return visibleJobs.map(job => html`
                <li>
                    <a href="${this.getJobUrl(job.id)}" class="dropdown-item border-top">
                        <div class="d-flex align-items-center overflow-hidden">
                            <div class="flex-shrink-0 fs-2 rocket-${job?.internal?.status?.id ?? job?.internal?.status?.name ?? "default"}">
                                <i class="text-secondary fas fa-rocket"></i>
                            </div>
                            <div class="flex-grow-1 ms-3">
                                ${this._addedJobs.has(job.id) ? html`
                                    <span class="badge bg-primary rounded-pill">NEW</span>
                                ` : nothing}
                                <div class="mt-0 text-truncate" style="max-width:275px">
                                    ${job.id}
                                </div>
                                <small class="text-secondary">
                                    <span>${job?.tool?.id}</span>
                                    <div class="vr"></div>
                                    ${moment(job.creationDate, "YYYYMMDDHHmmss").format("D MMM YYYY, h:mm:ss a")}
                                </small>
                                <div>
                                    ${UtilsNew.renderHTML(UtilsNew.jobStatusFormatter(job?.internal?.status))}
                                </div>
                            </div>
                        </div>
                    </a>
                </li>
            `);
        } else {
            return html`
                <li>
                    <div class="pt-2 pb-1 text-center fw-bold border-top">
                        No jobs on this category.
                    </div>
                </li>
            `;
        }
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
                            ${this.renderJobsButtons()}
                            <button @click="${() => this.onRefresh()}" class="btn btn-sm btn-outline-secondary" title="Force immediate refresh">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                        </li>
                        ${this.renderVisibleJobsList()}
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
