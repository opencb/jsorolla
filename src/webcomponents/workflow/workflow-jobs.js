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

import {html, LitElement, nothing} from "lit";
import "../job/job-grid";

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
                type: Object,
            },
        };
    }

    #init() {
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }
        super.update(changedProperties);
    }

    render() {
        if (!this.opencgaSession || (!this.workflowId && !this.workflow?.id)) {
            return nothing;
        }

        return html`
            <h3>Jobs executed for workflow '${this.workflowId || this.workflow?.id}'</h3>
            <job-grid
                .toolId="${"workflow-jobs"}"
                .opencgaSession="${this.opencgaSession}"
                .config="${this._config}"
                .query="${{
                    study: this.opencgaSession.study.fqn,
                    tags: this.workflowId || this.workflow?.id,
                }}">
            </job-grid>
        `;
    }

    getDefaultConfig() {
        return {
            pageSize: 10,
            pageList: [5, 10, 25],
            showSelectCheckbox: false,
            showToolbar: false,
        };
    }

}

customElements.define("workflow-jobs", WorkflowJobs);
