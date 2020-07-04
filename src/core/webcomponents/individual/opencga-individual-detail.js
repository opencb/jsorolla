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

import {html, LitElement} from "/web_modules/lit-element.js";
import UtilsNew from "../../utilsNew.js";
import "./opencga-individual-view.js";
import "./../commons/view/detail-tabs.js";

export default class OpencgaIndividualDetail extends LitElement {

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
        this._prefix = "id-" + UtilsNew.randomString(6);
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
            this.requestUpdate();
        }
    }

    individualIdObserver() {
        if (this.opencgaSession) {
            if (this.individualId) {
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
    }

    getDefaultConfig() {
        return {
            title: "Individual",
            showTitle: true,
            items: [
                {
                    id: "individual-view",
                    name: "Overview",
                    active: true,
                    render: (individual, active, opencgaSession) => {
                        return html`<opencga-individual-view .individual="${individual}" .opencgaSession="${opencgaSession}"></opencga-individual-view>`;
                    }
                }
            ]
        };
    }

    render() {
        if (this.opencgaSession && this.individual) {
            return html`
                <detail-tabs .data="${this.individual}" .config="${this._config}" .opencgaSession="${this.opencgaSession}"></detail-tabs>`;
        } else {
            return html`<h3>No valid session or individual found</h3>`;
        }
    }
}

customElements.define("opencga-individual-detail", OpencgaIndividualDetail);
