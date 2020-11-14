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
import OpencgaCatalogUtils from "../../clients/opencga/opencga-catalog-utils.js";
import UtilsNew from "../../utilsNew.js";
import PolymerUtils from "../PolymerUtils.js";
import "../commons/tool-header.js";
import "./opencga-clinical-review-cases.js";
import "./opencga-clinical-analysis-writer.js";
import "./../opencga/catalog/panel/opencga-panel-browser.js";


export default class OpencgaClinicalPortal extends LitElement {

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
            cellbaseClient: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "ocap-" + UtilsNew.randomString(6);

        this.checkProjects = false;
        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.propertyObserver();
        }
    }

    firstUpdated(_changedProperties) {
        this.search = {};

        this.case = "";
        this.proband = "All";
        this.family = "All";

        this.active = true;
    }


    propertyObserver() {
        this._config = {...this.getDefaultConfig(), ...this.config};

        // TODO decomment to activate the new button
        /*if (OpencgaCatalogUtils.checkPermissions(this.opencgaSession.study, this.opencgaSession.user.id, "WRITE_CLINICAL_ANALYSIS")) {
            this._config.grid.toolbar.buttons = [...new Set([...this._config.grid.toolbar.buttons, "new"])]
        }*/

        if (UtilsNew.isNotUndefinedOrNull(this.opencgaSession) && UtilsNew.isNotUndefinedOrNull(this.opencgaSession.project)) {
            this.checkProjects = true;
        } else {
            this.checkProjects = false;
        }
        this.requestUpdate();
    }

    _changeView(e) {
        e.preventDefault(); // prevents the hash change to "#" and allows to manipulate the hash fragment as needed
        $(".clinical-portal-button").removeClass("active");
        $(".clinical-portal-content").hide(); // hides all content divs
        if (e?.target?.dataset?.view) {
            $("#" + this._prefix + e.target.dataset.view).show();
        }
        // Show the active button
        //$(".clinical-portal-button").removeClass("myactive");
        $(e.target).addClass("active");
    }

    getDefaultConfig() {
        return {
            title: "Case Portal",
            showTitle: true,
            icon: "fas fa-window-restore",
            showCreate: true,
            showActions: true,
            reviewCases: {
                grid: {
                    toolbar: {
                        buttons: ["columns", "download"]
                    }
                }
            }
        };
    }

    render() {
        return html`
        ${this.checkProjects ? html`
            <tool-header title="${this._config.title}" icon="${this._config.icon}"></tool-header>

            <div class="row">
                <div id="${this._prefix}ClinicalPortal" class="col-md-10 col-md-offset-1">
                    
                    <nav class="navbar">
                        <ul class="nav navbar-nav navbar-right" style="padding: 0px 20px">
                            ${this._config.showCreate ? html`
                                <li>
                                    <button type="button" class="btn btn-success ripple clinical-portal-button active " data-view="ReviewCases" @click="${this._changeView}" active>
                                        <i class="fa fa-list clinical-portal-button" style="padding: 0px 5px" data-view="ReviewCases" @click="${this._changeView}"></i>Review Cases
                                    </button>
                                </li>
    
                                <li>
                                    <button type="button" class="btn btn-success ripple clinical-portal-button" data-view="CreateCase" @click="${this._changeView}">
                                        <i class="fa fa-file clinical-portal-button" style="padding: 0px 5px" data-view="CreateCase" @click="${this._changeView}"></i>Create Case
                                    </button>
                                </li>
                            ` : null}
                        </ul>
                    </nav>
                </div>


                <div id="${this._prefix}MainWindow" class="col-md-10 col-md-offset-1">

                    <div style="padding: 0px 10px">
                        <div id="${this._prefix}ReviewCases" class="clinical-portal-content">
                            <opencga-clinical-review-cases .opencgaSession="${this.opencgaSession}"
                                                           .config="${this._config.reviewCases}">
                            </opencga-clinical-review-cases>
                        </div>

                        <div id="${this._prefix}CreateCase" class="clinical-portal-content" style="display: none">
                            <opencga-clinical-analysis-writer .opencgaSession="${this.opencgaSession}"
                                                              @clinicalanalysischange="${this.onClinicalAnalysisEditor}">
                            </opencga-clinical-analysis-writer>
                        </div>
                    </div>
                </div>
            </div>
            <div class="v-space"></div>
        ` : html`
            <div class="guard-page">
                <i class="fas fa-lock fa-5x"></i>
                <h3>No public projects available to browse. Please login to continue</h3>
            </div>
        `}        
        `;
    }
}

customElements.define("opencga-clinical-portal", OpencgaClinicalPortal);
