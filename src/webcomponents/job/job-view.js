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
import ExtensionsManager from "../extensions-manager.js";
import "../commons/forms/data-form.js";
import "../commons/json-viewer.js";
import "./job-summary.js";
import "./job-result.js";
import "./job-detail-log.js";

export default class JobView extends LitElement {

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
            displayConfig: {
                type: Object,
            },
        };
    }

    #init() {
        this.COMPONENT_ID = "job-view";
        this._job = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("jobId")) {
            this.jobIdObserver();
        }

        if (changedProperties.has("job")) {
            this.jobObserver();
        }

        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
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
    }

    render() {
        if (!this.opencgaSession || !this._job) {
            return nothing;
        }

        return html`
            <data-form
                .data="${this._job || {}}"
                .config="${this._config || {}}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                type: "tabs",
                buttonsVisible: false,
                ...this.displayConfig,
            },
            sections: [
                {
                    id: "job-summary",
                    name: "Overview",
                    render: (job, active) => html`
                        <job-summary
                            .opencgaSession="${this.opencgaSession}"
                            .active="${active}"
                            .job="${job}">
                        </job-summary>
                    `,
                },
                {
                    id: "job-result",
                    name: "Execution Result",
                    render: (job, active) => html`
                        <job-result
                            .job="${job}"
                            .active="${active}"
                            .opencgaSession="${this.opencgaSession}">
                        </job-result>
                    `,
                },
                {
                    id: "job-log",
                    name: "Logs",
                    render: (job, active) => html`
                        <job-detail-log
                            .opencgaSession="${this.opencgaSession}"
                            .active="${active}"
                            .job="${job}">
                        </job-detail-log>
                    `,
                },
                {
                    id: "json-view",
                    name: "JSON Data",
                    render: (job, active) => html`
                        <json-viewer
                            .data="${job}"
                            .active="${active}">
                        </json-viewer>
                    `,
                },
                ...ExtensionsManager.getViews(this.COMPONENT_ID),
            ],
        };
    }

}

customElements.define("job-view", JobView);
