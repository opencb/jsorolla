/*
 * Copyright 2015-2024 OpenCB
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
import ExtensionsManager from "../extensions-manager.js";
import "./job-detail-log.js";
import "./job-view.js";
import "../commons/view/detail-tabs.js";

export default class JobDetail extends LitElement {

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

    #init() {
        this.COMPONENT_ID = "job-detail";
        this._job = null;
        this._config = this.getDefaultConfig();
        this.#updateDetailTabs();
    }

    update(changedProperties) {
        if (changedProperties.has("jobId")) {
            this.jobIdObserver();
        }

        if (changedProperties.has("job")) {
            this.jobObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
            this.#updateDetailTabs();
        }

        super.update(changedProperties);
    }

    jobIdObserver() {
        if (this.opencgaSession && this.jobId) {
            this.opencgaSession.opencgaClient.jobs()
                .info(this.jobId, {
                    study: this.opencgaSession.study.fqn,
                })
                .then(response => {
                    this._job = response.getResult(0);
                    this.requestUpdate();
                })
                .catch(response => {
                    console.error(response);
                });
        }
    }

    jobObserver() {
        this._job = {...this.job};
        this.requestUpdate();
    }

    #updateDetailTabs() {
        this._config.items = [
            ...this._config.items,
            ...ExtensionsManager.getDetailTabs(this.COMPONENT_ID),
        ];
    }

    render() {
        if (!this.opencgaSession) {
            return "";
        }

        return html`
            <detail-tabs
                .data="${this._job}"
                .config="${this._config}"
                .opencgaSession="${this.opencgaSession}">
            </detail-tabs>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Job",
            showTitle: true,
            display: {
                titleClass: "mt-4",
                contentClass: "p-3"
            },
            items: [
                {
                    id: "job-view",
                    name: "Overview",
                    active: true,
                    render: (job, _active, opencgaSession) => html`
                        <job-view
                            .opencgaSession="${opencgaSession}"
                            mode="simple"
                            .job="${job}">
                        </job-view>
                    `,
                },
                {
                    id: "job-log",
                    name: "Logs",
                    render: (job, active, opencgaSession) => html`
                        <job-detail-log
                            .opencgaSession="${opencgaSession}"
                            .active="${active}"
                            .job="${job}">
                        </job-detail-log>
                    `,
                },
            ],
        };
    }

}

customElements.define("job-detail", JobDetail);
