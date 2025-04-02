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
import "../commons/forms/data-form.js";
import "../commons/json-viewer.js";
import "../sample/sample-grid.js";
import "./cohort-summary.js";

export default class CohortView extends LitElement {

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
            cohortId: {
                type: String
            },
            cohort: {
                type: Object
            },
            displayConfig: {
                type: Object,
            },
        };
    }

    #init() {
        this.COMPONENT_ID = "cohort-view";
        this._cohort = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("cohortId")) {
            this.cohortIdObserver();
        }

        if (changedProperties.has("cohort")) {
            this.cohortObserver();
        }

        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    cohortIdObserver() {
        if (this.opencgaSession && this.cohortId) {
            this.opencgaSession.opencgaClient.cohorts()
                .info(this.cohortId, {
                    study: this.opencgaSession.study.fqn,
                })
                .then(response => {
                    this._cohort = response.getResult(0);
                    this.requestUpdate();
                })
                .catch(response => {
                    console.error(response);
                });
        }
    }

    cohortObserver() {
        this._cohort = {...this.cohort};
    }

    render() {
        if (!this.opencgaSession || !this._cohort) {
            return "";
        }

        return html`
            <data-form
                .data="${this._cohort}"
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
                    id: "cohort-summary",
                    name: "Overview",
                    render: (cohort, active) => html`
                        <cohort-summary
                            .opencgaSession="${this.opencgaSession}"
                            .active="${active}"
                            .cohort="${cohort}">
                        </cohort-summary>
                    `,
                },
                {
                    id: "sample-view",
                    name: "Samples",
                    render: (cohort, active) => html`
                        <sample-grid
                            .opencgaSession="${this.opencgaSession}"
                            .query="${{
                                cohortIds: cohort.id,
                            }}"
                            .config="${{
                                showToolbar: false,
                                showSelectCheckbox: false,
                            }}"
                            .active="${active}">
                        </sample-grid>
                    `,
                },
                {
                    id: "json-view",
                    name: "JSON Data",
                    render: (cohort, active) => html`
                        <json-viewer
                            .data="${cohort}"
                            .active="${active}">
                        </json-viewer>
                    `,
                },
                ...ExtensionsManager.getViews(this.COMPONENT_ID),
            ],
        };
    }

}

customElements.define("cohort-view", CohortView);
