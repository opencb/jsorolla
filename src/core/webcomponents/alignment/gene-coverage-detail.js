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
            transcriptCoverageStat: {
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
            this.transcriptCoverageStat = null;
        }

        if (changedProperties.has("transcriptCoverageStat") && this.transcriptCoverageStat) {
            this._config.title = `Transcript ${this.transcriptCoverageStat.id}`;
            this.requestUpdate();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.requestUpdate();
        }
    }

    getDefaultConfig() {
        return {
            title: "Transcript",
            showTitle: true,
            items: [
                {
                    id: "transcript-detail",
                    name: "Details",
                    active: true,
                    render: (transcriptCoverageStat, active, opencgaSession) => {
                        return html`<gene-coverage-view .transcript="${transcriptCoverageStat}"></gene-coverage-view>`;
                    }
                },
                {
                    id: "transcript-detail",
                    name: "Details",
                    active: true,
                    render: (transcriptCoverageStat, active, opencgaSession) => {
                        return html`<gene-coverage-view .transcript="${transcriptCoverageStat}"></gene-coverage-view>`;
                    }
                }
            ]
        };
    }

    render() {
        if (this.opencgaSession && this.transcriptCoverageStat) {
            return html`
                <detail-tabs .data="${this.transcriptCoverageStat}" .config="${this._config}" .opencgaSession="${this.opencgaSession}"></detail-tabs>`;
        } else {
            return html`<h3>No valid session or transcript found</h3>`;
        }
    }

}

customElements.define("gene-coverage-detail", GeneCoverageDetail);
