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
import "./variant-interpreter-qc-variant-stats.js";
import "./variant-interpreter-qc-inferred-sex.js";
import "./variant-interpreter-qc-relatedness.js";
import "./variant-interpreter-qc-mendelian-errors.js";
import "./variant-interpreter-qc-signature.js";
import "./variant-interpreter-qc-alignment-stats.js";
import "./variant-interpreter-qc-gene-coverage-stats.js";
import "./interpretation-grid.js";
import "./interpretation-history.js";


class VariantInterpreterQcOverview extends LitElement {

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
            title: "Quality Control Overview",
            sections: [
                {
                    fields: [
                        {
                            id: "Summary",
                            title: "Summary"
                        },
                        {
                            id: "interpretations",
                            title: "Interpretations"
                        },
                        {
                            id: "history",
                            title: "History"
                        },
                        {
                            id: "consent",
                            title: "Consent"
                        },
                        {
                            id: "review",
                            title: "Review"
                        }
                    ]
                }
            ]
        };
    }

    onSideNavClick(e) {
        e.preventDefault();
        // Remove button focus highlight
        e.currentTarget.blur();
        const tabId = e.currentTarget.dataset.id;
        $(".interpretation-manager-side-nav > button", this).removeClass("active");
        $(`.interpretation-manager-side-nav > button[data-id=${tabId}]`, this).addClass("active");
        $(".interpretation-manager-content-tab > div[role=tabpanel]", this).hide();
        $("#" + this._prefix + tabId, this).show();
        //for (const tab in this.activeTab) this.activeTab[tab] = false;
        //this.activeTab[tabId] = true;
        this.requestUpdate();
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
            <!--<tool-header title="${this._config.title}" class="bg-white" icon="${this._config.icon}"></tool-header>-->
            <div class="row variant-interpreter-overview" style="padding: 10px 15px">
                <div class="col-md-2 list-group interpretation-manager-side-nav side-tabs side-nav">
                    ${this._config.sections[0].fields.filter(field => !field.disabled).map((field, i) => {
                        return html`<button type="button" 
                                        class="list-group-item ${i === 0 ? "active" : ""}" 
                                        data-id="${field.id}" 
                                        @click="${this.onSideNavClick}">${field.title}
                                    </button>`;
                        })}
                </div>
                
                <div class="col-md-10">
                    <div class="content-tab-wrapper interpretation-manager-content-tab" style="margin: 0px 10px">
                        <div id="${this._prefix}Summary" role="tabpanel" class="tab-pane content-tab active">
                            <h3>Summary</h3>
                            <variant-interpreter-qc-summary .opencgaSession=${this.opencgaSession}
                                                            .clinicalAnalysis=${this.clinicalAnalysis}>
                            </variant-interpreter-qc-summary>
                        </div>
                         
                        <div id="${this._prefix}interpretations" role="tabpanel" class="tab-pane content-tab">
                            <h3>Interpretations</h3>
                            <div style="margin: 20px 10px">
                                <interpretation-grid    .opencgaSession=${this.opencgaSession} 
                                                        .clinicalAnalysis="${this.clinicalAnalysis}">
                                </interpretation-grid>
                            </div>
                        </div>
                        
                        <div id="${this._prefix}history" role="tabpanel" class="tab-pane content-tab">
                            <h3>History</h3>
                            <div style="margin: 20px 10px">
                                <interpretation-history   .opencgaSession=${this.opencgaSession} 
                                                        .clinicalAnalysis="${this.clinicalAnalysis}">
                                </interpretation-history>
                            </div>
                        </div>
                                                
                        <div id="${this._prefix}consent" role="tabpanel" class="tab-pane content-tab">
                            <h3>Consent</h3>
                            <div style="margin: 20px 10px">
                                Consent
                            </div>
                        </div>
                        
                        <div id="${this._prefix}review" role="tabpanel" class="tab-pane content-tab">
                            <h3>Review</h3>
                            <div style="margin: 20px 10px">
                                review
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("interpretation-manager", VariantInterpreterQcOverview);
