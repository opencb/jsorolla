/**
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

import {html, LitElement} from "lit";

export default class WorkflowScriptsView extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            workflowId: {
                type: String
            },
            workflow: {
                type: Object
            },
            opencgaSession: {
                type: Object
            },
        };
    }

    #init() {
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("workflow")) {
            this.workflows = [this.workflow];
        }

        if (changedProperties.has("workflowId")) {
            this.workflowIdObserver();
        }

        super.update(changedProperties);
    }

    workflowIdObserver() {
        if (this.workflowId && this.opencgaSession) {
            this.opencgaSession.opencgaClient.workflows()
                .info(this.workflowId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.workflow = response.responses[0].results[0];
                })
                .catch(reason => {
                    console.error(reason);
                });
        }
    }

    onDownload(e) {

    }

    render() {
        if (this.workflow?.scripts?.length === 0) {
            return html`
                <div class="alert alert-warning">
                    No Workflows scripts exist.
                </div>
            `;
        }

        return html`
            <div>
                <h3>${this.workflow.id}</h3>
                <span class="d-block text-secondary">${this.workflow.description}</span>
            </div>
            <div>
                ${this.workflow.scripts.map(script => html`
                    <div class="card mb-2">
                        <div class="card-header">
                            <h4>${script.filename}</h4>
                        </div>
                        <div class="card-body">
                            <pre>${script.content}</pre>
                        </div>
                    </div>
                `)}
            </div>
        `;
    }

    getDefaultConfig() {
        return {};
    }

}

customElements.define("workflow-scripts-view", WorkflowScriptsView);
