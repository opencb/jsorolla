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
import "./variant-interpreter-qc-variant.js";
import "./variant-interpreter-qc-alignment.js";


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
            query: {
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

    firstUpdated(_changedProperties) {
    }

    updated(changedProperties) {
        // if (changedProperties.has("opencgaSession")) {
        //     this.opencgaSessionObserver();
        // }
        // if (changedProperties.has("clinicalAnalysisId")) {
        //     this.clinicalAnalysisIdObserver();
        // }
        // if (changedProperties.has("clinicalAnalysis")) {
        //     this.clinicalAnalysisObserver();
        // }
        // if (changedProperties.has("query")) {
        //     this.queryObserver();
        // }
    }

    render() {
        // Check Project exists
        if (!this.opencgaSession.project) {
            return html`
                    <div>
                        <h3><i class="fas fa-lock"></i> No public projects available to browse. Please login to continue</h3>
                    </div>`;
        }

        // if (!this.clinicalAnalysis) {
        //     return html`
        //             <div>
        //                 <h3><i class="fas fa-lock"></i> No Case open</h3>
        //             </div>`;
        // }

        return html`
                <div>
                    <ul id="${this._prefix}QcTabs" class="nav nav-tabs" role="tablist">
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
                        ${this.clinicalAnalysis.type.toUpperCase() === "FAMILY" 
                            ? html`
                                <li role="presentation" class="disabled">
                                    <a href="#${this._prefix}Upd" role="tab" data-toggle="tab" data-id="${this._prefix}Upd"
                                        class="browser-variant-tab-title">UPD (coming soon)
                                    </a>
                                </li>` 
                            : ""
                        }
                    </ul>
                </div>
                
                <div class="tab-content">
                    <div id="${this._prefix}Summary" role="tabpanel" class="tab-pane active">
                        Summary (coming soon)
                    </div>
                    <div id="${this._prefix}Variants" role="tabpanel" class="tab-pane active">
                        <variant-interpreter-qc-variant .opencgaSession="${this.opencgaSession}" 
                                                        .clinicalAnalysis="${this.clinicalAnalysis}">
                        </variant-interpreter-qc-variant>
                    </div>
                    <div id="${this._prefix}Alignment" role="tabpanel" class="tab-pane">
                        <variant-interpreter-qc-alignment   .opencgaSession="${this.opencgaSession}" 
                                                            .clinicalAnalysis="${this.clinicalAnalysis}">
                        </variant-interpreter-qc-alignment>
                    </div>
                    ${this.clinicalAnalysis.type.toUpperCase() === "FAMILY"
                        ? html`
                            <div id="${this._prefix}Upd" role="tabpanel" class="tab-pane">
                                <h3>Not implemented yet.</h3>
                            </div>`
                        : ""
                    }
                </div>
            `;
    }

}

customElements.define("variant-interpreter-qc", VariantInterpreterQc);
