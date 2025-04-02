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
import "./workflow-scripts-view.js";
import "./workflow-jobs.js";
import "./workflow-summary.js";

export default class WorkflowView extends LitElement {

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
            displayConfig: {
                type: Object,
            },
        };
    }

    #init() {
        this.COMPONENT_ID = "workflow-view";
        this._workflow = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("workflowId")) {
            this.workflowIdObserver();
        }

        if (changedProperties.has("workflow")) {
            this.workflowObserver();
        }

        if (changedProperties.has("config")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    workflowIdObserver() {
        this._workflow = null;
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
    }

    render() {
        if (!this.opencgaSession || !this._workflow) {
            return nothing;
        }

        return html`
            <data-form
                .data="${this._workflow}"
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
                    id: "workflow-summary",
                    name: "Overview",
                    render: (workflow, active) => html`
                        <workflow-summary
                            .workflow="${workflow}"
                            .active="${active}"
                            .opencgaSession="${this.opencgaSession}">
                        </workflow-summary>
                    `,
                },
                {
                    id: "workflow-scripts",
                    name: "Scripts",
                    render: (workflow, active) => html`
                        <workflow-scripts-view
                            .active="${active}"
                            .workflow="${workflow}">
                        </workflow-scripts-view>
                    `,
                },
                {
                    id: "workflow-jobs",
                    name: "Jobs",
                    render: (workflow, active) => html`
                        <workflow-jobs
                            .workflow="${workflow}"
                            .active="${active}"
                            .opencgaSession="${this.opencgaSession}">
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
                },
                ...ExtensionsManager.getDetailTabs(this.COMPONENT_ID),
            ],
        };
    }

}

customElements.define("workflow-view", WorkflowView);
