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
        this.running = [];

    }

    updated(_changedProperties) {
        super.updated(_changedProperties);
        if (_changedProperties.has("opencgaSession")) {
            this.top();
        }
    }

    top() {
        this.opencgaSession.opencgaClient.jobs().top({study: this.opencgaSession.study.fqn, limit: 20}).then( restResponse => {
            console.log(restResponse.getResult(0))
            this.running = restResponse.getResult(0).jobs//.filter( job => job?.internal?.status?.name === "RUNNING");
            console.log("this.running", this.running)
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
                       ${this.running.length? html`<span class="badge badge-pill badge-primary">${this.running.length}</span>` : null}<i class="fas fa-bell"></i>
                    </a>
                    <ul class="dropdown-menu">
                        ${this.running.length ? this.running.slice(0, 5).map(job => html`
                            <li>
                                <a href="#">
                                    <div class="media">
                                        <div class="media-left">
                                                <i class="fas fa-cogs media-object"></i>
                                        </div>
                                        <div class="media-body">
                                            <h4 class="media-heading">${job.id}</h4>
                                            <p>${job?.internal?.status?.name}</p> 
                                        </div>
                                    </div>
                                 </a>
                            </li>
                        `) : html`
                            <li>
                                <a href="#projects"> No notifications </a>
                            </li>
                        `}
                        
                    </ul>
                </li>
            </ul>            
            `;
    }

}

customElements.define("job-monitor", JobMonitor);
