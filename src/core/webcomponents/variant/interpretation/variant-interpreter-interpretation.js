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
import "../../clinical/analysis/opencga-rd-tiering-analysis.js";


class VariantInterpreterInterpretation extends LitElement {

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
        this._prefix = "vcis-" + UtilsNew.randomString(6);
        this.activeTab = {"RdTiering": true}; //default active tab
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
        // if (changedProperties.has("query")) {
        //     this.queryObserver();
        // }
    }

    // onAnalysisChange(e) {
    //     this.analysis = e.detail.value;
    //     this.requestUpdate();
    // }
    //
    // renderAnalysis(type) {
    //     switch(type) {
    //         case "rd-tiering":
    //             return html`<opencga-rd-tiering-analysis .opencgaSession="${this.opencgaSession}"></opencga-rd-tiering-analysis>`
    //         case "--":
    //             break;
    //         default:
    //     }
    // }

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
        if (!e.currentTarget.className.includes("disabled")) {
            navTabs.removeClass("active");
            contentTabs.removeClass("active");
            $("#" + this._prefix + tabId).addClass("active");
            for (const tab in this.activeTab) this.activeTab[tab] = false;
            this.activeTab[tabId] = true;
            this.requestUpdate();
        }
    }

    render() {
        // Check Project exists
        if (!this.opencgaSession.project) {
            return html`
                    <div>
                        <h3><i class="fas fa-lock"></i> No public projects available to browse. Please login to continue</h3>
                    </div>`;
        }

        // return this.clinicalAnalysis ? html`
        //     <div>
        //         <div class="row">
        //             <div class="col-md-4 col-md-offset-4 col-sm-12">
        //                 <h3>Select Analysis</h3>
        //                 <select-field-filter .data="${[{id: "rd-tiering", name: "RD tiering"}]}" @filterChange="${this.onAnalysisChange}"></select-field-filter>
        //             </div>
        //         </div>
        //         ${this.renderAnalysis(this.analysis)}
        //     </div>
        // ` : null;

        return this.clinicalAnalysis ? html`
            <div id="${this._prefix}QcTabs">
                <div class="container">
                    <ul class="nav nav-tabs nav-center tablist" role="tablist" aria-label="toolbar">
                        ${this.clinicalAnalysis.type.toUpperCase() === "FAMILY" 
                            ? html`
                                <li role="presentation" class="content-pills ${classMap({active: this.activeTab["RdTiering"]})}">
                                    <a href="javascript: void 0" role="tab" data-id="RdTiering" @click="${this._changeTab}" class="tab-title">RD Tiering</a>
                                </li>
                                <li role="presentation" class="content-pills ${classMap({active: this.activeTab["Zetta"]})}">
                                    <a href="javascript: void 0" role="tab" data-id="Zetta" @click="${this._changeTab}" class="tab-title">Zetta</a>
                                </li>` 
                            : null
                        }
                        ${this.clinicalAnalysis.type.toUpperCase() === "CAMCER"
                            ? html`
                                <li role="presentation" class="content-pills ${classMap({active: this.activeTab["Upd"]})}">
                                    <a href="javascript: void 0" role="tab" data-id="Upd" @click="${this._changeTab}" class="tab-title disabled">UPD (coming soon)</a>
                                </li>`
                            : null
                        }
                        <li role="presentation" class="content-pills pull-right ${classMap({active: this.activeTab["help"]})}">
                            <a href="javascript: void 0" role="tab" data-id="Help" @click="${this._changeTab}" class="tab-title">Help</a>
                        </li>
                    </ul>
                </div>
                
                <div class="content-tab-wrapper">
                    ${this.clinicalAnalysis.type.toUpperCase() === "FAMILY"
                        ? html`
                            <div id="${this._prefix}RdTiering" role="tabpanel" class="tab-pane content-tab active">
                                <opencga-rd-tiering-analysis .opencgaSession="${this.opencgaSession}"></opencga-rd-tiering-analysis>
                            </div>
                            <div id="${this._prefix}Zetta" role="tabpanel" class="tab-pane content-tab">
                                <opencga-rd-tiering-analysis .opencgaSession="${this.opencgaSession}"></opencga-rd-tiering-analysis>
                            </div>`
                        : ""
                    }
                </div>
            </div>
        ` : null;
    }

}

customElements.define("variant-interpreter-interpretation", VariantInterpreterInterpretation);
