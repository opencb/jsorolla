/*
 * Copyright 2015-2016 OpenCB
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
import UtilsNew from "../../../utilsNew.js";
import "../../alignment/gene-coverage-browser.js";

class VariantInterpreterQcGeneCoverage extends LitElement {

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
            clinicalAnalysisId: {
                type: String
            },
            clinicalAnalysis: {
                type: Object
            },
            cellbaseClient: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "vcis-" + UtilsNew.randomString(6);

        this._config = this.getDefaultConfig();
        this.file = "SonsAlignedBamFile.bam";
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        // if (changedProperties.has("opencgaSession")) {
        //     this.opencgaSessionObserver();
        // }
        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
    }

    clinicalAnalysisIdObserver() {
        if (this.opencgaSession && this.clinicalAnalysisId) {
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis = response.responses[0].results[0];
                    this.requestUpdate();
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    getDefaultConfig() {
        return {
        }
    }

    render() {
        // Check Project exists
        if (!this.opencgaSession.project) {
            return html`
                <div class="guard-page">
                    <i class="fas fa-lock fa-5x"></i>
                    <h3>No public projects available to browse. Please login to continue</h3>
                </div>
            `;
        }

        return html`
            <div class="container" style="margin-bottom: 20px">
                <div style="float: left">
                    <h2>Gene Coverage Stats</h2>
                </div>
                <div style="margin-top: 20px; float: right">
                    <button class="btn btn-primary" @click="${this.onCloseClinicalAnalysis}">
                        <i class="fas fa-save" style="padding-right: 10px"></i>Save
                    </button>
                </div>
            </div>
            <div class="container">
                <gene-coverage-browser  .opencgaSession="${this.opencgaSession}"
                                        .cellbaseClient="${this.cellbaseClient}"
                                        .clinicalAnalysis="${this.clinicalAnalysis}"
                                        .geneIds="${this.geneIds}"
                                        .panelIds="${this.diseasePanelIds}"
                                        .file="${this.file}">
                </gene-coverage-browser>
            </div>
        `;
    }

}

customElements.define("variant-interpreter-qc-gene-coverage", VariantInterpreterQcGeneCoverage);
