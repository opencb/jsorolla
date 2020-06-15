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

export class JobMonitorQ {

    constructor() {
    }


}

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

    }

    updated(_changedProperties) {
        super.updated(_changedProperties);
        if (_changedProperties.has("opencgaSession")) {
            this.lastJobsDone();
        }
    }

    lastJobsDone() {
        const lastAccess = moment(this.opencgaSession.user.configs.IVA.lastAccess).format("YYYYMMDDHHmmss"); // NOTE: we use creationDate as we cannot query execution.end
        const lastDays = moment(new Date());
        lastDays.format("YYYYMMDDHHmmss")
        lastDays.subtract(97, "d");
        this.opencgaSession.opencgaClient.jobs().search({study: this.opencgaSession.study.fqn, "internal.status.name": "DONE,ERROR,PENDING,QUEUED,RUNNING"}).then( restResponse => {
            this.jobs = restResponse.getResults();
            this.running = this.jobs.filter( job => ["PENDING", "QUEUED", "RUNNING"].includes(job?.internal?.status.name))
            this.done = this.jobs.filter( job => /*["DONE", "ERROR"].includes(job?.internal?.status.name) &&*/ job?.execution?.end >= lastDays.valueOf())
            this.total = this.running.length + this.done.length;
            console.log("JOBS", this.running, this.done)
            this.requestUpdate();
        }).catch( restResponse => {
            console.error(restResponse)
        })

    }

    render() {
        return html`
            <ul class="nav navbar-nav navbar-right notification-nav">
                <li class="notification">
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                        <span class="badge badge-pill badge-primary ${!this.total > 0 ? "invisible" : ""}">${this.total}</span><i class="fas fa-bell"></i>
                    </a>
                    <ul class="dropdown-menu">
                        ${this.total ? html`
                            <li class="info">Jobs done since your last access ${moment(this.opencgaSession.user.configs.IVA.lastAccess).format("DD-MM-YYYY HH:mm:ss")}</li>
                            ${this.done.length ? this.done.slice(0, 5).map(job => html`
                                <li>
                                    <a href="#">
                                        <div class="media">
                                            <div class="media-left">
                                                    <i class="fas fa-cogs media-object"></i>
                                            </div>
                                            <div class="media-body">
                                                <h4 class="media-heading">${job.id}</h4>
                                                <small>${job?.execution?.end ? moment(job.execution.end).format("D MMM YYYY, h:mm:ss a") : null}</small>
                                                <p>${UtilsNew.renderHTML(UtilsNew.jobStatusFormatter(job?.internal?.status?.name))}</p> 
                                            </div>
                                        </div>
                                     </a>
                                </li>
                            `) : null}
                            ${this.running.length ? html`
                                <li role="separator" class="divider"></li>
                                ${this.done.slice(0, 5).map(job => html`
                                    <li>
                                        <a href="#">
                                            <div class="media">
                                                <div class="media-left">
                                                        <i class="fas fa-cogs media-object"></i>
                                                </div>
                                                <div class="media-body">
                                                    <h4 class="media-heading">${job.id}</h4>
                                                    <small>${job?.execution?.end ? moment(job.execution.end).format("D MMM YYYY, h:mm:ss a") : null}</small>
                                                    <p>${UtilsNew.renderHTML(UtilsNew.jobStatusFormatter(job?.internal?.status?.name))}</p> 
                                                </div>
                                            </div>
                                         </a>
                                    </li>
                                `) }` : null}
                        ` : html`
                            <li>
                                <a> No notifications </a>
                            </li>
                        `}
                        
                    </ul>
                </li>
            </ul>            
            `;
    }

}

customElements.define("job-monitor", JobMonitor);
