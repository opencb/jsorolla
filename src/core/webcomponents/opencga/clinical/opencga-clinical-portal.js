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
import Utils from "./../../../utils.js";
import UtilsNew from "./../../../utilsNew.js";
import PolymerUtils from "../../PolymerUtils.js";
import "./opencga-clinical-review-cases.js";
import "./opencga-clinical-analysis-editor.js";


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
        this._prefix = "ocap-" + Utils.randomString(6) + "_";
        this.checkProjects = false;
        this._config = this.getDefaultConfig();
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
        this._config = Object.assign({}, this.getDefaultConfig(), this.config);

        if (UtilsNew.isNotUndefinedOrNull(this.opencgaSession) && UtilsNew.isNotUndefinedOrNull(this.opencgaSession.project)) {
            this.checkProjects = true;
        } else {
            this.checkProjects = false;
        }
        this.requestUpdate();
    }

    _changeView(e) {
        e.preventDefault(); // prevents the hash change to "#" and allows to manipulate the hash fragment as needed
        $(".clinical-portal-content").hide(); // hides all content divs
        if (typeof e.target !== "undefined" && typeof e.target.dataset.view !== "undefined") {
            // $("#" + this._prefix + e.target.dataset.view).show(); // get the href and use it find which div to show
            PolymerUtils.show(this._prefix + e.target.dataset.view);
        }

        // Show the active button
        $(".clinical-portal-button").removeClass("active");
        //$(".clinical-portal-button").removeClass("myactive");
        $(e.target).addClass("active");
        //$(e.target).addClass("myactive");
    }


    getDefaultConfig() {
        return {
            title: "Clinical Interpretation Portal",
            showTitle: true
            // grid: {
            //     pageSize: 10,
            //     pageList: [10, 25, 50],
            //     detailView: false,
            //     multiSelection: false
            // }
        };
    }

    render() {
        return html`
        <style include="jso-styles">
        </style>

        ${this.checkProjects ? html`
            <div class="row">
                <div id="${this._prefix}ClinicalPortal"  class="col-md-10 col-md-offset-1">
                    <nav class="navbar">
                        <div class="container-fluid" style="padding: 0px 5px">
                            <!-- Brand and toggle get grouped for better mobile display -->
                            <div class="navbar-header">
                                <!--<a href="#home" class="navbar-brand" style="padding-top: 10px" on-click="changeTool">-->
                                <!--<img src="{{config.logo}}" width="100px">-->
                                <!--</a>-->
                                
                                    <h1>${this._config.title}</h1>
                                
                            </div>
                        </div>

                        <ul class="nav navbar-nav navbar-right" style="padding: 0px 20px">
                            <li>
                                <button type="button" class="btn btn-success ripple clinical-portal-button active " style="font-size: 1.1em" data-view="ReviewCases" @click="${this._changeView}" active>
                                    <i class="fa fa-list clinical-portal-button" style="padding: 0px 5px" data-view="ReviewCases" @click="${this._changeView}"></i>Review Cases
                                </button>
                            </li>
                            <li>
                                <button type="button" class="btn btn-success ripple clinical-portal-button" style="font-size: 1.1em" data-view="CreateCase" @click="${this._changeView}">
                                    <i class="fa fa-file clinical-portal-button" style="padding: 0px 5px" data-view="CreateCase" @click="${this._changeView}"></i>Create Case
                                </button>
                            </li>
<!--                            <li>-->
<!--                                <button type="button" class="btn btn-link clinical-portal-button" style="font-size: 1.1em" data-view="DiseasePanel" on-click="_changeView">-->
<!--                                    <i class="fa fa-columns clinical-portal-button" style="padding: 0px 5px" data-view="DiseasePanel" on-click="_changeView"></i>Disease Panel (Experimental)-->
<!--                                </button>-->
<!--                            </li>-->
                            <!--<li>-->
                            <!--<button type="button" class="btn btn-link clinical-portal-button" style="font-size: 1.1em" style="font-size: 1.1em" data-view="ReviewCases" on-click="_changeView">-->
                            <!--<i class="fa fa-database" style="padding: 0px 5px" data-view="ReviewCases" on-click="_changeView"></i>CVA (pending)-->
                            <!--</button>-->
                            <!--</li>-->
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
                            <opencga-clinical-analysis-editor .opencgaSession="${this.opencgaSession}"
                                                              .config="${this._config.clinicalAnalysisBrowser}"
                                                              @clinicalanalysischange="${this.onClinicalAnalysisEditor}">
                            </opencga-clinical-analysis-editor>
                        </div>

                        <div id="${this._prefix}DiseasePanel" class="clinical-portal-content" style="display: none">
                            <opencga-panel-browser .opencgaSession="${this.opencgaSession}"
                                                   .opencgaClient="${this.opencgaSession.opencgaClient}"
                                                   .cellbaseClient="${this.cellbaseClient}"
                                                   .eventNotifyName="${this._config.notifyEventMessage}"
                                                   @notifymessage="${this.onNotifyMessage}">
                            </opencga-panel-browser>
                        </div>
                    </div>
                </div>
            </div>
        
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
