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

import {LitElement, html} from "/web_modules/lit-element.js";
import UtilsNew from "../../utilsNew.js";
import "./opencga-cohort-view.js";
import "./../samples/opencga-sample-grid.js";
import "./../commons/view/detail-tabs.js";

export default class OpencgaCohortDetail extends LitElement {

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

    _init() {
        this._prefix = "ocd-" + UtilsNew.randomString(6);
        this._config = this.getDefaultConfig();
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.cohort = null;
        }

        if (changedProperties.has("cohortId")) {
            this.cohortIdObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.requestUpdate();
        }
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
        }
    }

    getDefaultConfig() {
        return {
            title: "Cohort",
            showTitle: true,
            items: [
                {
                    id: "cohort-view",
                    name: "Summary",
                    active: true,
                    render: (cohort, active, opencgaSession) => {
                        return html`<opencga-cohort-view .opencgaSession="${opencgaSession}" .cohort="${cohort}"></opencga-cohort-view>`;
                    }
                },
                {
                    id: "sample-view",
                    name: "Samples",
                    render: (cohort, active, opencgaSession) => {
                        return html`
                            <opencga-sample-grid    .opencgaSession="${opencgaSession}"
                                                    .query="${{id: cohort.samples.map(sample => sample.id).join(",")}}"
                                                    .config="${1}"
                                                    .samples="${1}"
                                                    .active="${active}">
                            </opencga-sample-grid>
                        `;
                    }
                }
            ]
        };
    }

    render() {
        return this.opencgaSession && this.cohort
            ? html`
                <detail-tabs .data="${this.cohort}" .config="${this._config}" .opencgaSession="${this.opencgaSession}"></detail-tabs>`
            : null;
    }

}

customElements.define("opencga-cohort-detail", OpencgaCohortDetail);
