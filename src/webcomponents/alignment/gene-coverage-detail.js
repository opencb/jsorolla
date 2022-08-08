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
import UtilsNew from "../../core/utilsNew.js";
import "./transcript-coverage-view.js";
import "./transcript-coverage-low.js";
import "../commons/view/detail-tabs.js";

export default class GeneCoverageDetail extends LitElement {

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
            transcriptCoverageStats: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "gcd-" + UtilsNew.randomString(6);
        this._config = this.getDefaultConfig();
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.transcriptCoverageStats = null;
        }

        if (changedProperties.has("transcriptCoverageStats") && this.transcriptCoverageStats) {
            this._config.title = `Transcript ${this.transcriptCoverageStats.id}`;
            this.requestUpdate();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    getDefaultConfig() {
        return {
            title: "Transcript",
            showTitle: true,
            items: [
                {
                    id: "overview",
                    name: "Overview",
                    active: true,
                    render: (transcriptCoverageStats, active, opencgaSession) => {
                        return html`<transcript-coverage-view .transcriptCoverageStats="${transcriptCoverageStats}"></transcript-coverage-view>`;
                    }
                },
                {
                    id: "low-coverage",
                    name: "Low Coverage Regions",
                    render: (transcriptCoverageStats, active, opencgaSession) => {
                        return html`<transcript-coverage-low .transcriptCoverageStats="${transcriptCoverageStats}"></transcript-coverage-low>`;
                    }
                }
            ]
        };
    }

    render() {

        if (!this.opencgaSession) {
            return html`<h3>No valid session</h3>`;
        }

        return html`
                <detail-tabs
                    .data="${this.transcriptCoverageStats}"
                    .config="${this._config}"
                    .opencgaSession="${this.opencgaSession}">
                </detail-tabs>`;
    }

}

customElements.define("gene-coverage-detail", GeneCoverageDetail);
