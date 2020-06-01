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
import "./opencga-jobs-detail-log.js";
import "./opencga-jobs-view.js";

export default class OpencgaJobsDetail extends LitElement {

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
                type: Object
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
        this._prefix = "sf-" + UtilsNew.randomString(6);

        this.activeTab = {};
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

    _changeBottomTab(e) {
        const tabId = e.currentTarget.dataset.id;
        console.log(tabId);
        $(".nav-tabs", this).removeClass("active");
        $(".tab-content div[role=tabpanel]", this).hide();
        for (const tab in this.activeTab) this.activeTab[tab] = false;
        $("#" + tabId + "-tab", this).show();
        this.activeTab[tabId] = true;
        this.requestUpdate();
    }

    getDefaultConfig() {
        return {
            title: "Job",
            showTitle: true,
        };
    }

    render() {
        return this.job ? html`
            ${this._config.showTitle ? html`
                    <div class="panel" style="margin-bottom: 10px">
                        <h2 >&nbsp;${this._config.title}: ${this.job.id}</h2>
                    </div>
                ` : null}
            <div>
                <ul class="nav nav-tabs" role="tablist">
                    ${this.config.detail.length && this.config.detail.map(item => html`
                        <li role="presentation" class="${item.active ? "active" : ""}">
                                <a href="#${this._prefix}${item.id}" role="tab" data-toggle="tab"
                                   data-id="${item.id}"
                                   class=""
                                   @click="${this._changeBottomTab}" style="font-weight: bold">${item.title}</a>
                        </li>
                    `)}
                </ul>
                
                <div class="tab-content" style="padding: 20px">
                    <div id="job-detail-tab" class="tab-pane active" role="tabpanel">
                        <opencga-jobs-view .opencgaSession=${this.opencgaSession}
                                           .job="${this.job}">
                        </opencga-jobs-view>
                    </div>
                    <div id="log-tab" class="tab-pane" role="tabpanel">
                        <opencga-jobs-detail-log .opencgaSession=${this.opencgaSession}
                                                  .active="${this.activeTab["log"]}"
                                                  .job="${this.job}">
                        </opencga-jobs-detail-log>
                    </div>
                </div>
                
            </div>
        ` : null;
    }

}

customElements.define("opencga-jobs-detail", OpencgaJobsDetail);
