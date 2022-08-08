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
import "./individual-view.js";
import "./../commons/view/detail-tabs.js";

export default class IndividualDetail extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            individualId: {
                type: String
            },
            individual: {
                type: Object
            },
            config: {
                type: Object
            },
        };
    }

    _init() {
        this._config = this.getDefaultConfig();
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.individual = null;
        }

        if (changedProperties.has("individualId")) {
            this.individualIdObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    individualIdObserver() {
        if (this.opencgaSession && this.individualId) {
            this.opencgaSession.opencgaClient.individuals().info(this.individualId, {study: this.opencgaSession.study.fqn})
                .then(restResponse => {
                    this.individual = restResponse.getResult(0);
                })
                .catch(restResponse => {
                    console.error(restResponse);
                });
        } else {
            this.individual = null;
        }
    }

    getDefaultConfig() {
        return {
            // detail-tab configuration in individual-browser
        };
    }

    render() {

        if (!this.opencgaSession) {
            return "";
        }

        return html`
                <detail-tabs
                    .data="${this.individual}"
                    .config="${this._config}"
                    .opencgaSession="${this.opencgaSession}">
                </detail-tabs>
            `;
    }

}

customElements.define("individual-detail", IndividualDetail);
