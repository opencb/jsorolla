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
import UtilsNew from "../../core/utilsNew.js";
import "./opencga-job-detail-log.js";
import "./opencga-job-view.js";
import "../commons/view/detail-tabs.js";

export default class JobDetail extends LitElement {

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
        this._prefix = "sf-" + UtilsNew.randomString(6);
        this._config = this.getDefaultConfig();
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.job = null;
        }

        if (changedProperties.has("jobId")) {
            this.jobIdObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.requestUpdate();
        }
    }

    jobIdObserver() {
        if (this.opencgaSession) {
            if (this.jobId) {
                this.opencgaSession.opencgaClient.jobs().info(this.jobId, {study: this.opencgaSession.study.fqn})
                    .then(response => {
                        this.job = response.getResult(0);
                    })
                    .catch(function (reason) {
                        console.error(reason);
                    });
            } else {
                this.job = null;
            }

        }
    }

    getDefaultConfig() {
        return {
            title: "Job",
            showTitle: true,
            items: [
                {
                    id: "job-view",
                    name: "Overview",
                    active: true,
                    render: (job, active, opencgaSession) => {
                        return html`<opencga-job-view .opencgaSession=${opencgaSession} mode="simple" .job="${job}"></opencga-job-view>`;
                    }
                },
                {
                    id: "job-log",
                    name: "Logs",
                    render: (job, active, opencgaSession) => {
                        return html`
                            <opencga-job-detail-log
                                .opencgaSession=${opencgaSession}
                                .active="${active}"
                                .job="${job}">
                            </opencga-job-detail-log>
                        `;
                    }
                }
            ]
        };
    }

    render() {
        return this.opencgaSession && this.job ?
            html`
                <detail-tabs
                    .data="${this.job}"
                    .config="${this._config}"
                    .opencgaSession="${this.opencgaSession}">
                </detail-tabs>` :
            null;
    }

}

customElements.define("job-detail", JobDetail);
