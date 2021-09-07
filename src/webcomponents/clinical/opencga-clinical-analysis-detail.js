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
import UtilsNew from "../../core/utils.js";
import "./opencga-clinical-analysis-view.js";
import "./../commons/view/detail-tabs.js";

export default class OpencgaClinicalAnalysisDetail extends LitElement {

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
            clinicalAnalysisId: {
                type: String
            },
            clinicalAnalysis: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "sf-" + UtilsNew.randomString(6);
        this._config = this.getDefaultConfig();
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.clinicalAnalysis = null;
        }

        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.requestUpdate();
        }
    }

    clinicalAnalysisIdObserver() {
        if (this.opencgaSession) {
            if (this.clinicalAnalysisId) {
                this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                    .then(restResponse => {
                        this.clinicalAnalysis = restResponse.getResult(0);
                    })
                    .catch(restResponse => {
                        console.error(restResponse);
                    });
            } else {
                this.clinicalAnalysis = null;
            }
        }
    }

    getDefaultConfig() {
        return {
            title: "Clinical Analysis",
            showTitle: true,
            items: [
                {
                    id: "clinical-analysis-view",
                    name: "Overview",
                    active: true,
                    render: (clinicalAnalysis, active, opencgaSession) => {
                        return html`<opencga-clinical-analysis-view .opencgaSession="${opencgaSession}" .clinicalAnalysis="${clinicalAnalysis}"></opencga-clinical-analysis-view>`;
                    }
                }
            ]
        };
    }

    render() {
        return this.opencgaSession && this.clinicalAnalysis
            ? html`
                <detail-tabs .data="${this.clinicalAnalysis}" .config="${this._config}" .opencgaSession="${this.opencgaSession}"></detail-tabs>`
            : null;
    }
}

customElements.define("opencga-clinical-analysis-detail", OpencgaClinicalAnalysisDetail);
