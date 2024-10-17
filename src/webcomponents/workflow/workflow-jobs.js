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
import "../job/job-grid";
import "../commons/forms/data-form.js";
import "../commons/filters/catalog-search-autocomplete.js";
import "../loading-spinner.js";

export default class WorkflowJobs extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            workflow: {
                type: Object,
            },
            workflowId: {
                type: String,
            },
            opencgaSession: {
                type: Object,
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this.jobQuery = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("workflow")) {
            this.workflowObserver();
        }
        if (changedProperties.has("workflowId")) {
            this.workflowIdObserver();
        }
        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }
        super.update(changedProperties);
    }

    workflowObserver() {
        if (this.workflow) {
            this.workflowId = this.workflow.id;
        }
    }

    workflowIdObserver() {
        if (this.workflowId && this.opencgaSession) {
            this.jobQuery = {
                study: this.opencgaSession.study.fqn,
                tags: this.workflowId
            };
            // this.requestUpdate();
        }
    }

    render() {
        // if (!this.workflow?.id && this.search === false) {
        //     return html`
        //         <div class="alert alert-info">
        //             <i class="fas fa-3x fa-info-circle align-middle" style="padding-right: 10px"></i>
        //             Workflow ID not found.
        //         </div>
        //     `;
        // }

        return html`
            <div class="p-3">
                <h3>Jobs executed for workflow '${this.workflowId}'</h3>
                <job-grid
                    .toolId="workflow-jobs"
                    .opencgaSession="${this.opencgaSession}"
                    .config="${this._config}"
                    .query="${this.jobQuery}"
                    @settingsUpdate="${() => this.onSettingsUpdate()}">
                </job-grid>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            pageSize: 10,
            pageList: [5, 10, 25],
            multiSelection: false,
            showSelectCheckbox: false,

            showNew: false,
            showExport: false,
            exportTabs: ["download", "link", "code"]
        };
    }

}

customElements.define("workflow-jobs", WorkflowJobs);
