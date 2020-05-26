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
import "./variant-interpreter-qc-summary.js";
import "./variant-interpreter-qc-variant.js";
import "./variant-interpreter-qc-alignment.js";
import "../../alignment/gene-coverage-view.js";


class VariantInterpreterQc extends LitElement {

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
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "vcis-" + UtilsNew.randomString(6);
    }

    connectedCallback() {
        super.connectedCallback();
    }

    updated(changedProperties) {
        // if (changedProperties.has("opencgaSession")) {
        //     this.opencgaSessionObserver();
        // }
        if (changedProperties.has("clinicalAnalysisId")) {
            this.clinicalAnalysisIdObserver();
        }
        // if (changedProperties.has("clinicalAnalysis")) {
        //     this.clinicalAnalysisObserver();
        // }
    }

    clinicalAnalysisIdObserver() {
        if (this.opencgaSession) {
            let _this = this;
            this.opencgaSession.opencgaClient.clinical().info(this.clinicalAnalysisId, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    _this.clinicalAnalysis = response.responses[0].results[0];
                    _this.requestUpdate();
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
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

        // if (!this.clinicalAnalysis) {
        //     return html`
        //             <div>
        //                 <h3><i class="fas fa-lock"></i> No Case open</h3>
        //             </div>`;
        // }

        return this.clinicalAnalysis ? html`
            <div>
                <ul id="${this._prefix}QcTabs" class="nav nav-tabs nav-center" role="tablist">
                    <li role="presentation" class="active">
                        <a href="#${this._prefix}Summary" role="tab" data-toggle="tab" data-id="${this._prefix}Summary"
                            class="browser-variant-tab-title">Summary
                        </a>
                    </li>
                    <li role="presentation">
                        <a href="#${this._prefix}Variants" role="tab" data-toggle="tab" data-id="${this._prefix}Variants"
                            class="browser-variant-tab-title">Variant
                        </a>
                    </li>
                    <li role="presentation" class="">
                        <a href="#${this._prefix}Alignment" role="tab" data-toggle="tab" data-id="${this._prefix}Alignment"
                            class="browser-variant-tab-title">Alignment
                        </a>
                    </li>
                    <li role="presentation" class="">
                        <a href="#${this._prefix}Coverage" role="tab" data-toggle="tab" data-id="${this._prefix}Coverage"
                            class="browser-variant-tab-title">Coverage
                        </a>
                    </li>
                    ${this.clinicalAnalysis.type.toUpperCase() === "FAMILY"
                        ? html`
                            <li role="presentation" class="disabled">
                                <a href="#${this._prefix}Upd" role="tab" data-toggle="tab" data-id="${this._prefix}Upd"
                                    class="browser-variant-tab-title">UPD (coming soon)
                                </a>
                            </li>`
                        : ""
                    }
                    <li role="presentation" class="">
                        <a href="#${this._prefix}GenomeBrowser" role="tab" data-toggle="tab" data-id="${this._prefix}GenomeBrowser"
                                class="browser-variant-tab-title">Genome Browser
                        </a>
                    </li>
                </ul>
            </div>
               
            <div class="tab-content">
                <div id="${this._prefix}Summary" role="tabpanel" class="tab-pane active col-md-10 col-md-offset-1">
                    <variant-interpreter-qc-summary .opencgaSession="${this.opencgaSession}" 
                                                    .clinicalAnalysis="${this.clinicalAnalysis}">
                    </variant-interpreter-qc-summary>
                </div>
                <div id="${this._prefix}Variants" role="tabpanel" class="tab-pane">
                    <variant-interpreter-qc-variant .opencgaSession="${this.opencgaSession}" 
                                                    .clinicalAnalysis="${this.clinicalAnalysis}">
                    </variant-interpreter-qc-variant>
                </div>
                <div id="${this._prefix}Alignment" role="tabpanel" class="tab-pane col-md-10 col-md-offset-1">
                    <variant-interpreter-qc-alignment   .opencgaSession="${this.opencgaSession}" 
                                                        .clinicalAnalysis="${this.clinicalAnalysis}">
                    </variant-interpreter-qc-alignment>
                </div>
                <div id="${this._prefix}Coverage" role="tabpanel" class="tab-pane col-md-10 col-md-offset-1">
                    <gene-coverage-view .opencgaSession="${this.opencgaSession}"
                                        .cellbaseClient="${this.cellbaseClient}"
                                        .clinicalAnalysis="${this.clinicalAnalysis}"
                                        .geneIds="${this.geneIds}"
                                        .panelIds="${this.diseasePanelIds}">
                     </gene-coverage-view>
                </div>
                ${this.clinicalAnalysis.type.toUpperCase() === "FAMILY"
                    ? html`
                        <div id="${this._prefix}Upd" role="tabpanel" class="tab-pane">
                            <h3>Not implemented yet.</h3>
                        </div>`
                    : ""
                }
                <div id="${this._prefix}GenomeBrowser" role="tabpanel" class="tab-pane">
                    <opencga-variant-interpreter-genome-browser .opencgaSession="${this.opencgaSession}"
                                                                .cellbaseClient="${this.cellbaseClient}"
                                                                .clinicalAnalysis="${this.clinicalAnalysis}"
                                                                .config="${this._config}">
                    </opencga-variant-interpreter-genome-browser>
                </div>
            </div>
        ` : null;
    }

}

customElements.define("variant-interpreter-qc", VariantInterpreterQc);
