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
import {classMap} from "/web_modules/lit-html/directives/class-map.js";
import UtilsNew from "../../../utilsNew.js";
import "./variant-interpreter-browser-rd.js";
import "./variant-interpreter-browser-cancer.js";


class VariantInterpreterBrowser extends LitElement {

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
        this.activeTab = {"VariantBrowser": true}; //default active tab
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

    _changeTab(e) {
        e.preventDefault();
        const tabId = e.currentTarget.dataset.id;
        const navTabs = $(`#${this._prefix}QcTabs > .nav-tabs > .content-pills`, this);
        const contentTabs = $(`#${this._prefix}QcTabs > .content-tab-wrapper > .tab-pane`, this);
        if (!e.currentTarget?.className?.split(" ")?.includes("disabled")) {
            navTabs.removeClass("active");
            contentTabs.removeClass("active");
            $("#" + this._prefix + tabId).addClass("active");
            for (const tab in this.activeTab) this.activeTab[tab] = false;
            this.activeTab[tabId] = true;
            this.requestUpdate();
        }
    }

    onClinicalAnalysisUpdate (e) {
        this.dispatchEvent(new CustomEvent("clinicalAnalysisUpdate", {
            detail: {
                clinicalAnalysis: e.detail.clinicalAnalysis
            },
            bubbles: true,
            composed: true
        }));
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
            <div id="${this._prefix}QcTabs">
                <div class="">
                    <ul class="nav nav-tabs nav-center tablist" role="tablist" aria-label="toolbar">
                        <li role="presentation" class="content-pills ${classMap({active: this.activeTab["VariantBrowser"]})}">
                            <a href="javascript: void 0" role="tab" data-id="VariantBrowser" @click="${this._changeTab}" class="tab-title">Variant Browser</a>
                        </li>
                    </ul>
                </div>
                
                <div class="content-tab-wrapper">
                    <div id="${this._prefix}VariantBrowser" role="tabpanel" class="tab-pane active col-md-12 content-tab" style="padding-top: 10px">
                        ${this.clinicalAnalysis.type.toUpperCase() === "SINGLE" || this.clinicalAnalysis.type.toUpperCase() === "FAMILY"
                            ? html`
                                <variant-interpreter-browser-rd .opencgaSession="${this.opencgaSession}"
                                                                .clinicalAnalysis="${this.clinicalAnalysis}"
                                                                .query="${this.query}"
                                                                .cellbaseClient="${this.cellbaseClient}"
                                                                @clinicalAnalysisUpdate="${this.onClinicalAnalysisUpdate}"
                                                                @gene="${this.geneSelected}"
                                                                @samplechange="${this.onSampleChange}">
                                </variant-interpreter-browser-rd>`
                            : null
                        }
                        ${this.clinicalAnalysis.type.toUpperCase() === "CANCER" 
                            ? html`
                                <variant-interpreter-browser-cancer .opencgaSession="${this.opencgaSession}"
                                                                    .clinicalAnalysis="${this.clinicalAnalysis}"
                                                                    .query="${this.query}"
                                                                    .cellbaseClient="${this.cellbaseClient}"
                                                                    @clinicalAnalysisUpdate="${this.onClinicalAnalysisUpdate}"
                                                                    @gene="${this.geneSelected}">
                                </variant-interpreter-browser-cancer>` : 
                            null
                        }
                    </div>
                </div>
            </div>
        ` : null;
    }

}

customElements.define("variant-interpreter-browser", VariantInterpreterBrowser);
