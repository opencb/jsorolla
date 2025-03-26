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
import "../clinical/clinical-analysis-grid.js";
import "./individual-summary.js";
import "./qc/individual-qc-inferred-sex.js";
import "./qc/individual-qc-mendelian-errors.js";

export default class IndividualView extends LitElement {

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
                type: Object,
            },
            individualId: {
                type: String,
            },
            individual: {
                type: Object,
            },
            displayConfig: {
                type: Object,
            },
        };
    }

    #init() {
        this.COMPONENT_ID = "individual-view";
        this._individual = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("individualId")) {
            this.individualIdObserver();
        }

        if (changedProperties.has("individual")) {
            this.individualObserver();
        }

        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    individualIdObserver() {
        if (this.opencgaSession && this.individualId) {
            this.opencgaSession.opencgaClient.individuals()
                .info(this.individualId, {
                    study: this.opencgaSession.study.fqn,
                })
                .then(response => {
                    this._individual = response.getResult(0);
                    this.requestUpdate();
                })
                .catch(response => {
                    console.error(response);
                });
        }
    }

    individualObserver() {
        this._individual = {...this.individual};
    }

    render() {
        if (!this.opencgaSession || !this._individual) {
            return nothing;
        }

        return html`
            <data-form
                .data="${this._individual}"
                .config="${this._config}">
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
                    id: "individual-summary",
                    name: "Overview",
                    render: (individual, active) => html`
                        <individual-summary
                            .individual="${individual}"
                            .active="${active}"
                            .opencgaSession="${this.opencgaSession}">
                        </individual-summary>
                    `,
                },
                {
                    id: "clinical-analysis-grid",
                    name: "Clinical Analysis",
                    render: (individual, active) => html`
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            <span>Clinical Analysis in which the individual <b>${individual.id}</b> is the proband.</span>
                        </div>
                        <clinical-analysis-grid
                            .active="${active}"
                            .query="${{
                                proband: individual.id,
                            }}"
                            .config=${{
                                readOnlyMode: true,
                                showExport: false,
                                showActions: false,
                                showSettings: false,
                                showCreate: false,
                            }}
                            .opencgaSession="${this.opencgaSession}">
                        </clinical-analysis-grid>
                    `,
                },
                {
                    id: "individual-inferred-sex",
                    name: "Inferred Sex",
                    render: (individual, active) => html`
                        <individual-qc-inferred-sex
                            .individual="${individual}"
                            .active="${active}"
                            .opencgaSession="${this.opencgaSession}">
                        </individual-qc-inferred-sex>
                    `,
                },
                {
                    id: "individual-mendelian-error",
                    name: "Mendelian Error",
                    render: (individual, active) => html`
                        <individual-qc-mendelian-errors
                            .individual="${individual}"
                            .active="${active}"
                            .opencgaSession="${this.opencgaSession}">
                        </individual-qc-mendelian-errors>
                    `,
                },
                {
                    id: "json-view",
                    name: "JSON Data",
                    render: (individual, active) => html`
                        <json-viewer
                            .data="${individual}"
                            .active="${active}">
                        </json-viewer>
                    `,
                },
            ],
            ...ExtensionsManager.getDetailTabs(this.COMPONENT_ID),
        };
    }

}

customElements.define("individual-view", IndividualView);
