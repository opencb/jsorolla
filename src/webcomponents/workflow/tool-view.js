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
import ExtensionsManager from "../extensions-manager.js";
import "../commons/forms/data-form.js";
import "../commons/json-viewer.js";
import "./tool-summary.js";
import "./workflow-scripts-view.js";
import "./workflow-jobs.js";

export default class ToolView extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            toolId: {
                type: String
            },
            tool: {
                type: Object
            },
            opencgaSession: {
                type: Object
            },
            displayConfig: {
                type: Object,
            },
        };
    }

    #init() {
        this.COMPONENT_ID = "tool-view";
        this._tool = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("toolId")) {
            this.toolIdObserver();
        }
        if (changedProperties.has("tool")) {
            this.toolObserver();
        }
        if (changedProperties.has("displayConfig") || changedProperties.has("opencgaSession")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    toolIdObserver() {
        this._tool = null;
        if (this.opencgaSession && this.toolId) {
            this.opencgaSession.opencgaClient.userTools()
                .info(this.toolId, {
                    study: this.opencgaSession.study.fqn,
                })
                .then(response => {
                    this._tool = response.getResult(0);
                    this.requestUpdate();
                })
                .catch(response => {
                    console.error(response);
                });
        }
    }

    toolObserver() {
        this._tool = {...this.tool};
    }

    render() {
        if (!this.opencgaSession || !this._tool) {
            return nothing;
        }

        return html`
            <data-form
                .data="${this._tool}"
                .config="${this._config || {}}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                type: "pills",
                pillsLeftColumnClass: "col-md-2",
                pillsRightColumnClass: "col-md-10",
                buttonsVisible: false,
                ...this.displayConfig,
            },
            sections: [
                {
                    id: "tool-summary",
                    name: "Overview",
                    render: (tool, active) => html`
                        <tool-summary
                            .tool="${tool}"
                            .active="${active}"
                            .opencgaSession="${this.opencgaSession}">
                        </tool-summary>
                    `,
                },
                // {
                //     id: "workflow-scripts",
                //     name: "Scripts",
                //     render: (workflow, active) => html`
                //         <workflow-scripts-view
                //             .active="${active}"
                //             .workflow="${workflow}">
                //         </workflow-scripts-view>
                //     `,
                // },
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
                    render: (tool, active) => html`
                        <json-viewer
                            .data="${tool}"
                            .active="${active}">
                        </json-viewer>
                    `,
                },
                ...ExtensionsManager.getViews(this.COMPONENT_ID, this.opencgaSession),
            ],
        };
    }

}

customElements.define("tool-view", ToolView);
