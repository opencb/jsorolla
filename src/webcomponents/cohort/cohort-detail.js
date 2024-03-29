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
import "./cohort-view.js";
import "./../commons/view/detail-tabs.js";

export default class CohortDetail extends LitElement {

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
            config: {
                type: Object
            }
        };
    }

    #init() {
        this.COMPONENT_ID = "cohort-detail";
        this._cohort = null;
        this._config = this.getDefaultConfig();
        this.#updateDetailTabs();
    }

    update(changedProperties) {
        if (changedProperties.has("cohortId")) {
            this.cohortIdObserver();
        }

        if (changedProperties.has("cohort")) {
            this.cohortObserver();
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
            <detail-tabs
                .data="${this._cohort}"
                .config="${this._config}"
                .opencgaSession="${this.opencgaSession}">
            </detail-tabs>`;
    }

    getDefaultConfig() {
        return {
            items: [],
        };
    }

}

customElements.define("cohort-detail", CohortDetail);
