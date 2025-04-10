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

import {LitElement, html} from "lit";
import LitUtils from "../../../commons/utils/lit-utils";
import "../study-admin-sample.js";
import "../study-admin-individual.js";
import "../study-admin-family.js";
import "../study-admin-cohort.js";
import "../study-admin-configuration.js";
import "../../../variant/operation/variant-annotation-index-operation.js";
import "../../../variant/operation/clinical-analysis-configuration-operation.js";
import "../../../variant/operation/variant-index-operation.js";
import "../../../variant/operation/variant-stats-index-operation.js";
import "../../../variant/operation/variant-secondary-annotation-index-operation.js";
import "../../../variant/operation/variant-secondary-sample-index-operation.js";
import "../../../variant/operation/variant-secondary-sample-index-configure-operation.js";
import "../../../commons/layouts/custom-vertical-navbar.js";

export default class StudyVariantAdmin extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            studyId: {
                type: String
            },
            study: {
                type: Object
            },
            opencgaSession: {
                type: Object
            },
        };
    }

    #init() {
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("studyId")) {
            this.studyIdObserver();
        }
        super.update(changedProperties);
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    studyIdObserver() {
        if (this.studyId && this.opencgaSession) {
            let error;
            this.#setLoading(true);
            this.opencgaSession.opencgaClient.studies()
                .info(this.studyId)
                .then(response => {
                    this.study = response.responses[0].results[0];
                })
                .catch(reason => {
                    this.study = {};
                    error = reason;
                    console.error(reason);
                })
                .finally(() => {
                    this._config = this.getDefaultConfig();
                    LitUtils.dispatchCustomEvent(this, "studySearch", this.study, {}, error);
                    this.#setLoading(false);
                });
        } else {
            this.study = {};
        }
    }

    // getDefaultConfig() {
    //     return {
    //         title: "Study Admin",
    //         icon: "variant_browser.svg",
    //         active: false
    //     };
    // }

    // onSideNavClick(e) {
    //     e.preventDefault();
    //     const tabId = e.currentTarget.dataset.id;
    //
    //     // Set Active button
    //     $(".admin-side-navbar > ul > li", this).removeClass("active");
    //     $(`.admin-side-navbar > ul > li > a[data-id=${tabId}]`, this)[0].parentElement.classList.add("active");
    //
    //     // Display the right content
    //     $(".admin-content-tab > div[role=tabpanel]", this).hide();
    //     $("#" + this._prefix + tabId, this).show();
    //
    //     this.requestUpdate();
    // }

    // render() {
    //     return html`
    //         <style>
    //
    //             .navbar.navbar-inverse.main-navbar{
    //                 position:fixed;
    //                 top:0;
    //                 width:100%;
    //                 z-index: 1000;
    //             }
    //
    //             div.page-title {
    //                 position:fixed;
    //                 top:50px;
    //                 width:100%;
    //                 z-index:10
    //             }
    //
    //             .row.left {
    //                 margin-left: -30px;
    //                 margin-top: -10px
    //             }
    //
    //             /*Remove rounded coners*/
    //             nav.sidebar.navbar {
    //                 border-radius: 0px;
    //                 top:125px;
    //             }
    //
    //             nav.sidebar, .main {
    //                 -webkit-transition: margin 200ms ease-out;
    //                 -moz-transition: margin 200ms ease-out;
    //                 -o-transition: margin 200ms ease-out;
    //                 transition: margin 200ms ease-out;
    //             }
    //
    //             /* Add gap to nav and right windows.*/
    //             .main {
    //                 padding: 10px 10px 0 10px;
    //             }
    //
    //             /* .....NavBar: Icon only with coloring/layout.....*/
    //             /*small/medium side display*/
    //             @media (min-width: 768px) {
    //                 /*Allow main to be next to Nav*/
    //                 .main{
    //                     width: calc(100% - 40px); /*keeps 100% minus nav size*/
    //                     margin-left: 40px;
    //                     float: right;
    //                 }
    //
    //                 /*lets nav bar to be showed on mouseover*/
    //                 nav.sidebar:hover + .main{
    //                     margin-left: 200px;
    //                 }
    //
    //                 /*Center Study Name*/
    //                 nav.sidebar.navbar.sidebar>.container .navbar-brand, .navbar>.container-fluid .navbar-brand {
    //                     margin-left: 0px;
    //                 }
    //
    //                 /*Center Study Name*/
    //                 nav.sidebar .navbar-brand, nav.sidebar .navbar-header{
    //                     text-align: center;
    //                     width: 100%;
    //                     margin-left: 0px;
    //                 }
    //
    //                 /*Center Icons*/
    //                 nav.sidebar a{
    //                     padding-right: 13px;
    //                 }
    //
    //                 /*adds border top to first nav box */
    //                 nav.sidebar .navbar-nav.left > li:first-child{
    //                     border-top: 1px #e5e5e5 solid;
    //                 }
    //
    //                 /* adds border to bottom nav boxes */
    //                 nav.sidebar .navbar-nav.left > li{
    //                     border-bottom: 0px #e5e5e5 solid;
    //                 }
    //
    //                 /* Colors/style dropdown box*/
    //                 nav.sidebar .navbar-nav.left .open .dropdown-menu {
    //                     position: static;
    //                     float: none;
    //                     width: auto;
    //                     margin-top: 0;
    //                     background-color: transparent;
    //                     border: 0;
    //                     -webkit-box-shadow: none;
    //                     box-shadow: none;
    //                 }
    //
    //                 /*allows nav box to use 100% width*/
    //                 nav.sidebar .navbar-collapse, nav.sidebar .container-fluid{
    //                     padding: 0 0px 0 0px;
    //                 }
    //
    //                 /*colors dropdown box text */
    //                 .navbar-inverse .navbar-nav.left .open .dropdown-menu>li>a {
    //                     color: #777;
    //                 }
    //
    //                 /*gives sidebar width/height*/
    //                 nav.sidebar{
    //                     position: fixed;
    //                     height: 100%;
    //                     width: 250px;
    //                     margin-left: -200px;
    //                     float: left;
    //                     /* z-index: 8000; */
    //                     margin-bottom: 0px;
    //                     overflow-y:auto;
    //                     padding-bottom:10%
    //                 }
    //
    //                 /*give sidebar 100% width;*/
    //                 nav.sidebar li {
    //                     width: 100%;
    //                 }
    //
    //                 /* Move nav to full on mouse over*/
    //                 nav.sidebar:hover{
    //                     margin-left: 0px;
    //                 }
    //                 /*for hiden things when navbar hidden*/
    //                 .forAnimate{
    //                     opacity: 0;
    //                 }
    //             }
    //
    //             /* .....NavBar: Fully showing nav bar..... */
    //             @media (min-width: 1330px) {
    //
    //                 /*Allow main to be next to Nav*/
    //                 .main{
    //                     width: calc(100% - 200px); /*keeps 100% minus nav size*/
    //                     margin-left: 200px;
    //                 }
    //
    //                 /*Show all nav*/
    //                 nav.sidebar{
    //                     margin-left: 0px;
    //                     float: left;
    //                 }
    //                 /*Show hidden items on nav*/
    //                 nav.sidebar .forAnimate{
    //                     opacity: 1;
    //                 }
    //             }
    //
    //             nav.sidebar .navbar-nav.left .open .dropdown-menu>li>a:hover,
    //             nav.sidebar .navbar-nav.left .open .dropdown-menu>li>a:focus {
    //                 color: #CCC;
    //                 background-color: transparent;
    //             }
    //
    //             nav:hover .forAnimate{
    //                 opacity: 1;
    //             }
    //
    //             section{
    //                 padding-left: 15px;
    //             }
    //
    //             .footer {
    //                 position: fixed;
    //                 bottom: 0px;
    //                 z-index: 10;
    //             }
    //
    //         </style>
    //
    //         <div class="row left">
    //             <div class="col-md-2">
    //                 <!-- Navigation -->
    //                 <nav class="navbar navbar-inverse sidebar" role="navigation">
    //                     <!-- Brand and toggle get grouped for better mobile display -->
    //                     <div class="navbar-header">
    //                         <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#bs-sidebar-navbar-collapse-1">
    //                             <span class="sr-only">Toggle navigation</span>
    //                             <span class="icon-bar"></span>
    //                             <span class="icon-bar"></span>
    //                             <span class="icon-bar"></span>
    //                         </button>
    //                         <a class="navbar-brand">${this.study?.name}</a>
    //                     </div>
    //
    //                     <!-- Collect the nav links, form, and other content for toggling -->
    //                     <div class="collapse navbar-collapse navbar-ex1-collapse admin-side-navbar">
    //                         <ul class="nav navbar-nav left">
    //                             <li>
    //                                 <p class="navbar-text">Variant Configuration</p>
    //                             </li>
    //                             <li>
    //                                 <a data-id="Dashboard" style="margin: 0px 5px; cursor: pointer" @click="${this.onSideNavClick}">Dashboard
    //                                     <span class="pull-right" style="font-size: 16px"><i class="fas fa-tachometer-alt"></i></span>
    //                                 </a>
    //                             </li>
    //                             <li>
    //                                 <a data-id="Configuration" style="margin: 0px 5px; cursor: pointer" @click="${this.onSideNavClick}">Configuration
    //                                     <span class="pull-right" style="font-size: 16px"><i class="fas fa-cog"></i></span>
    //                                 </a>
    //                             </li>
    //                             <li>
    //                                 <p class="navbar-text">Variant Operations</p>
    //                             </li>
    //                             <li>
    //                                 <a data-id="variant-annotation-index" style="margin: 0px 5px; cursor: pointer" @click="${this.onSideNavClick}">Variant Annotation Index
    //                                     <span class="pull-right" style="font-size: 16px"><i class="fas fa-vial"></i></span>
    //                                 </a>
    //                             </li>
    //                             <li>
    //                                 <a data-id="Individual" style="margin: 0px 5px; cursor: pointer" @click="${this.onSideNavClick}">Individual
    //                                     <span class="pull-right" style="font-size: 16px"><i class="fas fa-user"></i></span>
    //                                 </a>
    //                             </li>
    //                             <li>
    //                                 <a data-id="Family" style="margin: 0px 5px; cursor: pointer" @click="${this.onSideNavClick}">Family
    //                                     <span class="pull-right" style="font-size: 16px"><i class="fas fa-users"></i></span>
    //                                 </a>
    //                             </li>
    //                             <li>
    //                                 <a data-id="Cohort" style="margin: 0px 5px; cursor: pointer" @click="${this.onSideNavClick}">Cohort
    //                                     <span class="pull-right" style="font-size: 16px"><i class="fas fa-bezier-curve"></i></span>
    //                                 </a>
    //                             </li>
    //                         </ul>
    //                     </div>
    //                 </nav>
    //             </div>
    //
    //             <div class="col-md-6" style="top:150px;">
    //                 <!-- Content Module  -->
    //                 <div class="content-tab-wrapper admin-content-tab" style="margin: 0px 20px">
    //                     <div id="${this._prefix}Dashboard" role="tabpanel" class="tab-pane content-tab">
    //                         <div class="guard-page">
    //                             <i class="fas fa-pencil-ruler fa-5x"></i>
    //                             <h3>Component under construction</h3>
    //                             <h3>(Coming Soon)</h3>
    //                         </div>;
    //                     </div>
    //
    //                     <div id="${this._prefix}Configuration" role="tabpanel" class="tab-pane content-tab">
    //                         <h2><i class="fas fa-cog icon-padding" style="padding-right: 10px"></i>Configuration (Coming Soon)</h2>
    //                         <study-admin-configuration .opencgaSession="${this.opencgaSession}" .study="${this.study}"></study-admin-configuration>
    //                     </div>
    //
    //                     <div id="${this._prefix}variant-annotation-index" role="tabpanel" class="tab-pane content-tab">
    //                         <h2><i class="fas fa-vial icon-padding" style="padding-right: 10px"></i>Variant Annotation</h2>
    //                         <variant-annotation-operation .opencgaSession="${this.opencgaSession}"></variant-annotation-operation>
    //                     </div>
    //
    //                     <div id="${this._prefix}Individual" role="tabpanel" class="tab-pane content-tab">
    //                         <h2><i class="fas fa-user icon-padding" style="padding-right: 10px"></i>Individual</h2>
    //                         <study-admin-individual .opencgaSession="${this.opencgaSession}" .study="${this.study}"></study-admin-individual>
    //                     </div>
    //
    //                     <div id="${this._prefix}Family" role="tabpanel" class="tab-pane content-tab">
    //                         <h2><i class="fas fa-users icon-padding" style="padding-right: 10px"></i>Family</h2>
    //                         <study-admin-family .opencgaSession="${this.opencgaSession}" .study="${this.study}"></study-admin-family>
    //                     </div>
    //
    //                     <div id="${this._prefix}Cohort" role="tabpanel" class="tab-pane content-tab">
    //                         <h2><i class="fas fa-bezier-curve icon-padding" style="padding-right: 10px"></i>Cohort</h2>
    //                         <study-admin-cohort .opencgaSession="${this.opencgaSession}" .study="${this.study}"></study-admin-cohort>
    //                     </div>
    //                 </div>
    //             </div>
    //         </div>`;
    // }

    render() {
        const activeMenuItem = "clinical-analysis-configuration-operation";
        return html`
            <tool-header class="page-title-no-margin"  title="${this._config.name}" icon="${this._config.icon}"></tool-header>
            <custom-vertical-navbar
                .study="${this.opencgaSession.study}"
                .opencgaSession="${this.opencgaSession}"
                .config="${this._config}"
                .activeMenuItem="${activeMenuItem}">
            </custom-vertical-navbar>
        `;
    }

    getDefaultConfig() {
        return {
            id: "",
            name: "Study Variant Admin",
            logo: "",
            icon: "",
            visibility: "", // public | private | none
            // title: "Study",
            // sections: [
            menu: [
                {
                    id: "variant-configuration",
                    name: "Variant Configuration",
                    description: "",
                    icon: "",
                    visibility: "private",
                    featured: "", // true | false
                    category: true, // true | false
                    // label: "Configure",
                    submenu: [
                        // {
                        //     id: "dashboard",
                        //     name: "Dashboard",
                        //     description: "",
                        //     icon: "fas fa-tachometer-alt",
                        //     visibility: "none",
                        //     // label: "Dashboard",
                        //     // QUESTION: Which one: (a) or (b)
                        //     // question: (a)
                        //     // display: {
                        //     //     contentClass: "",
                        //     //     contentStyle: ""
                        //     //     defaultLayout: "vertical",
                        //     //     render: () => html`
                        //     //         <under-construction>
                        //     //             .title="Study dashboard"
                        //     //         </under-construction>`,
                        //     // },
                        //     // question: (b)
                        //     render: () => html`
                        //         <under-construction>
                        //             .title="Study dashboard"
                        //         </under-construction>`,
                        // },
                        {
                            id: "clinical-analysis-configuration-operation",
                            name: "Clinical Analysis Configuration",
                            icon: "fas fa-key",
                            visibility: "private",
                            render: (opencgaSession, study) => {
                                return html `
                                    <clinical-analysis-configuration-operation
                                            .toolParams="${{study: this.opencgaSession.study.id}}"
                                            .opencgaSession="${opencgaSession}">
                                    </clinical-analysis-configuration-operation>
                                `;
                            }
                        },
                        {
                            id: "variant-secondary-sample-configure-index",
                            name: "Sample Index Configuration",
                            icon: "fas fa-key",
                            visibility: "private",
                            render: (opencgaSession, study) => {
                                return html `
                                    <variant-secondary-sample-index-configure-operation
                                        .toolParams="${{study: this.opencgaSession.study.id}}"
                                        .opencgaSession="${opencgaSession}">
                                    </variant-secondary-sample-index-configure-operation>
                              `;
                            }
                        },
                        {
                            id: "configuration",
                            // label: "Configuration",
                            name: "Configuration",
                            description: "",
                            icon: "fas fa-cog",
                            visibility: "none",
                            render: (opencgaSession, study) => html`
                                <study-admin-configuration
                                    .opencgaSession="${opencgaSession}"
                                    .study="${study}">
                                </study-admin-configuration>`,
                        },
                    ],
                },
                {
                    id: "variant-operations",
                    name: "Variant Operations",
                    description: "",
                    icon: "",
                    visibility: "private",
                    featured: "", // true | false
                    category: true, // true | false
                    submenu: [

                        {
                            id: "variant-index",
                            name: "Variant Index",
                            icon: "fas fa-key",
                            visibility: "private",
                            render: (opencgaSession, study) => html`
                                <variant-index-operation
                                    .toolParams="${{study: this.opencgaSession.study.fqn}}"
                                    .opencgaSession="${opencgaSession}">
                                </variant-index-operation>
                            `,
                        },
                        {
                            id: "variant-stats-index",
                            name: "Variant Stats Index",
                            icon: "fas fa-key",
                            visibility: "private",
                            render: (opencgaSession, study) => html`
                                <variant-stats-index-operation
                                    .toolParams="${{study: this.opencgaSession.study.fqn}}"
                                    .opencgaSession="${opencgaSession}">
                                </variant-stats-index-operation>
                            `,
                        },
                        {
                            id: "variant-annotation-index",
                            // label: "Variant Annotation Index",
                            name: "Variant Annotation Index",
                            icon: "fas fa-key",
                            visibility: "private",
                            render: (opencgaSession, study) => html`
                                <variant-annotation-index-operation
                                    .toolParams="${{project: this.opencgaSession.project.id}}"
                                    .opencgaSession="${opencgaSession}">
                                </variant-annotation-index-operation>
                            `,
                        },
                        {
                            id: "variant-secondary-annotation-index",
                            // label: "Variant Annotation Index",
                            name: "Variant Secondary Annotation Index",
                            icon: "fas fa-key",
                            visibility: "private",
                            render: (opencgaSession, study) => html`
                                <variant-secondary-annotation-index-operation
                                    .toolParams="${{project: this.opencgaSession.project.id}}"
                                    .opencgaSession="${opencgaSession}">
                                </variant-secondary-annotation-index-operation>
                            `,
                        },
                        {
                            id: "variant-secondary-sample-index",
                            // label: "Variant Annotation Index",
                            name: "Variant Secondary Sample Index",
                            icon: "fas fa-key",
                            visibility: "private",
                            type: "navitem",
                            // navitem: true,
                            render: (opencgaSession, study) => html`
                                <variant-secondary-sample-index-operation
                                    .toolParams="${{study: this.opencgaSession.study.id}}"
                                    .opencgaSession="${opencgaSession}">
                                </variant-secondary-sample-index-operation>
                            `,
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("study-variant-admin", StudyVariantAdmin);
