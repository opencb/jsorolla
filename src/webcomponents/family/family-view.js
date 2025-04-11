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
import "./family-summary.js";
import "./opencga-family-relatedness-view.js";

export default class FamilyView extends LitElement {

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
            familyId: {
                type: String
            },
            family: {
                type: Object
            },
            displayConfig: {
                type: Object,
            },
        };
    }

    #init() {
        this.COMPONENT_ID = "family-view";
        this._family = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("familyId")) {
            this.familyIdObserver();
        }

        if (changedProperties.has("family")) {
            this.familyObserver();
        }

        if (changedProperties.has("displayConfig") || changedProperties.has("opencgaSession")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    familyIdObserver() {
        if (this.opencgaSession && this.familyId) {
            this.opencgaSession.opencgaClient.families()
                .info(this.familyId, {
                    study: this.opencgaSession.study.fqn,
                })
                .then(restResponse => {
                    this._family = restResponse.getResult(0);
                    this.requestUpdate();
                })
                .catch(restResponse => {
                    console.error(restResponse);
                });
        }
    }

    familyObserver() {
        this._family = {...this.family};
    }

    render() {
        if (!this.opencgaSession || !this._family) {
            return nothing;
        }

        return html`
            <data-form
                .data="${this._family || {}}"
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
                    id: "family-summary",
                    name: "Overview",
                    render: (family, active) => html`
                        <family-summary
                            .opencgaSession="${this.opencgaSession}"
                            .active="${active}"
                            .family="${family}"
                            .settings="${OPENCGA_FAMILY_VIEW_SETTINGS}">
                        </family-summary>
                    `,
                },
                {
                    id: "family-relatedness",
                    name: "Relatedness",
                    render: (family, active) => html`
                        <opencga-family-relatedness-view
                            .family="${family}"
                            .active="${active}"
                            .opencgaSession="${this.opencgaSession}">
                        </opencga-family-relatedness-view>
                    `,
                },
                {
                    id: "json-view",
                    name: "JSON Data",
                    render: (family, active) => html`
                        <json-viewer
                            .data="${family}"
                            .active="${active}">
                        </json-viewer>
                    `,
                },
                ...ExtensionsManager.getViews(this.COMPONENT_ID, this.opencgaSession),
            ],
        };
    }

}

customElements.define("family-view", FamilyView);
