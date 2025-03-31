/**
 * Copyright 2015-2022 OpenCB
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
import "./disease-panel-summary.js";
import "./disease-panel-gene-view.js";
import "./disease-panel-region-view.js";

export default class DiseasePanelView extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            diseasePanel: {
                type: Object
            },
            diseasePanelId: {
                type: String
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
        this.COMPONENT_ID = "disease-panel-view";
        this._diseasePanel = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("diseasePanelId")) {
            this.diseasePanelIdObserver();
        }

        if (changedProperties.has("diseasePanel")) {
            this.diseasePanelObserver();
        }

        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    diseasePanelIdObserver() {
        if (this.opencgaSession && this.diseasePanelId) {
            this.opencgaSession.opencgaClient.panels()
                .info(this.diseasePanelId, {
                    study: this.opencgaSession.study.fqn,
                })
                .then(response => {
                    this._diseasePanel = response.getResult(0);
                    this.requestUpdate();
                })
                .catch(reason => {
                    console.error(reason);
                });
        }
    }

    diseasePanelObserver() {
        this._diseasePanel = {...this.diseasePanel};
    }

    render() {
        if (!this.opencgaSession || !this._diseasePanel) {
            return nothing;
        }

        return html`
            <data-form
                .data="${this._diseasePanel || {}}"
                .config="${this._config || {}}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Disease Panel",
            sections: [
                {
                    id: "disease-panel-summary",
                    name: "Overview",
                    active: true,
                    render: (diseasePanel, active) => html`
                        <disease-panel-summary
                            .diseasePanel="${diseasePanel}"
                            .active="${active}"
                            .opencgaSession="${this.opencgaSession}">
                        </disease-panel-summary>
                    `,
                },
                {
                    id: "disease-panel-genes",
                    name: "Genes",
                    render: (diseasePanel, active) => html`
                        <disease-panel-gene-view
                            .genePanels="${diseasePanel.genes}"
                            .active="${active}"
                            .opencgaSession="${this.opencgaSession}">
                        </disease-panel-gene-view>
                    `,
                },
                {
                    id: "disease-panel-regions",
                    name: "Regions",
                    render: (diseasePanel, active) => html`
                        <disease-panel-region-view
                            .regions="${diseasePanel.regions}"
                            .active="${active}"
                            .opencgaSession="${this.opencgaSession}">
                        </disease-panel-region-view>
                    `,
                },
                {
                    id: "json-view",
                    name: "JSON Data",
                    render: (diseasePanel, active) => html`
                        <json-viewer
                            .data="${diseasePanel}"
                            .active="${active}">
                        </json-viewer>
                    `,
                },
                ...ExtensionsManager.getDetailTabs(this.COMPONENT_ID),
            ]
        };
    }

}

customElements.define("disease-panel-view", DiseasePanelView);
