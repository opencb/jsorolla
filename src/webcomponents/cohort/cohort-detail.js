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
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.cohort = null;
        }
        if (changedProperties.has("cohortId")) {
            this.cohortIdObserver();
        }
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
        super.update(changedProperties);
    }

    cohortIdObserver() {
        if (this.opencgaSession && this.cohortId) {
            this.opencgaSession.opencgaClient.cohorts().info(this.cohortId, {study: this.opencgaSession.study.fqn})
                .then(restResponse => {
                    this.cohort = restResponse.getResult(0);
                })
                .catch(restResponse => {
                    console.error(restResponse);
                });
        } else {
            this.cohort = null;
        }
    }

    getDefaultConfig() {
        return {
            // details config in cohort-browser
        };
    }

    render() {
        if (!this.opencgaSession) {
            return "";
        }

        return html`
            <detail-tabs
                .data="${this.cohort}"
                .config="${this._config}"
                .opencgaSession="${this.opencgaSession}">
            </detail-tabs>`;
    }

}

customElements.define("cohort-detail", CohortDetail);
