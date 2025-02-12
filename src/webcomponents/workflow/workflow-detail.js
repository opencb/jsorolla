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
import ExtensionsManager from "../extensions-manager.js";
import "../commons/view/detail-tabs.js";
import "../commons/json-viewer.js";
import "./workflow-scripts-view.js";
import "./workflow-jobs.js";
import "./workflow-view.js";

export default class WorkflowDetail extends LitElement {

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
            workflowId: {
                type: String
            },
            workflow: {
                type: Object
            },
            config: {
                type: Object
            },
        };
    }

    #init() {
        this.COMPONENT_ID = "workflow-detail";
        this._workflow = null;
        this._config = this.getDefaultConfig();
        this.#updateDetailTabs();
    }

    update(changedProperties) {
        if (changedProperties.has("workflowId")) {
            this.workflowIdObserver();
        }

        if (changedProperties.has("workflow")) {
            this.workflowObserver();
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

    workflowIdObserver() {
        if (this.opencgaSession && this.workflowId) {
            this.opencgaSession.opencgaClient.workflows()
                .info(this.workflowId, {
                    study: this.opencgaSession.study.fqn,
                })
                .then(response => {
                    this._workflow = response.getResult(0);
                    this.requestUpdate();
                })
                .catch(response => {
                    console.error(response);
                });
        }
    }

    workflowObserver() {
        this._workflow = {...this.workflow};
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
            <div data-cy="ib-detail">
                <detail-tabs
                    .data="${this._workflow}"
                    .config="${this._config}"
                    .opencgaSession="${this.opencgaSession}">
                </detail-tabs>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            items: [
                {
                    id: "workflow-view",
                    name: "Overview",
                    active: true,
                    render: (workflow, active, opencgaSession) => html`
                        <workflow-view
                            .workflow="${workflow}"
                            .opencgaSession="${opencgaSession}">
                        </workflow-view>
                    `,
                },
                {
                    id: "workflow-scripts",
                    name: "Scripts",
                    render: workflow => html`
                        <workflow-scripts-view
                            .workflow="${workflow}">
                        </workflow-scripts-view>
                    `,
                },
                {
                    id: "workflow-jobs",
                    name: "Jobs",
                    render: (workflow, active, opencgaSession) => html`
                        <workflow-jobs
                            .workflow="${workflow}"
                            .opencgaSession="${opencgaSession}">
                        </workflow-jobs>
                    `,
                },
                {
                    id: "json-view",
                    name: "JSON Data",
                    render: (workflow, active) => html`
                        <json-viewer
                            .data="${workflow}"
                            .active="${active}">
                        </json-viewer>
                    `,
                }
            ],
        };
    }

}

customElements.define("workflow-detail", WorkflowDetail);
