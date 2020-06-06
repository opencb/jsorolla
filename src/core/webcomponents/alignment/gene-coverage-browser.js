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
import "../commons/opencga-browser.js";
import "./gene-coverage-detail.js";
import "./gene-coverage-grid.js";


export default class GeneCoverageBrowser extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
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
            cellbaseClient: {
                type: Object
            },
            query: {
                type: Object
            },
            geneIds: {
                type: Object
            },
            panelIds: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "gcb" + UtilsNew.randomString(6);
        this.checkProjects = false;
        this.results = [];

        this.query = {};
        this.preparedQuery = {};
        this.errorState = false;

        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    onClickRow(e) {
        this.transcriptCoverageStat = e.detail.row;
        this._config.filter.detail.title = `Transcript ${this.transcriptCoverageStat.transcriptId}`;
        this.requestUpdate();
    }

    getDefaultConfig() {
        return {
            title: "Gene Coverage Browser",
            icon: "fas fa-chart-bar",
            description: "",
            filter: {
                detail: {
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
                        }
                    ]
                }
            }
        };
    }

    render() {
        return this._config
            ? html`
                <h3>Gene Coverage</h3>
                <gene-coverage-grid .opencgaSession="${this.opencgaSession}"
                                    .config="${this._config?.filter?.grid}"
                                    .query="${this.executedQuery}"
                                    @selectrow="${this.onClickRow}">
                </gene-coverage-grid>
                <gene-coverage-detail .transcriptCoverageStat="${this.transcriptCoverageStat}" .config="${this._config.filter.detail}" .opencgaSession="${this.opencgaSession}"></gene-coverage-detail>`
            : null;
    }

}

customElements.define("gene-coverage-browser", GeneCoverageBrowser);
