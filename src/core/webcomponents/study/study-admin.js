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

import { html, LitElement } from "/web_modules/lit-element.js";
import UtilsNew from "./../../utilsNew.js";

export default class StudyAdmin extends LitElement {

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
            config: {
                type: Object
            },
            studyId: {
                type: String
            },
            study: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = { ...this.getDefaultConfig(), ...this.config };
    }

    update(changedProperties) {
        if (changedProperties.has("studyId")) {
            for (const project of this.opencgaSession.projects) {
                for (const study of project.studies) {
                    if (study.id === this.studyId || study.fqn === this.studyId) {
                        this.study = study;
                        break;
                    }
                }
            }
        }
        super.update(changedProperties);
    }


    getDefaultConfig() {
        return {
            title: "Study Admin",
            icon: "variant_browser.svg",
            active: false
        };
    }


    render() {
        return html`
        <style>
            /*Remove rounded coners*/
            nav.sidebar.navbar {
                border-radius: 0px;
            }

            nav.sidebar, .main {
                -webkit-transition: margin 200ms ease-out;
                -moz-transition: margin 200ms ease-out;
                -o-transition: margin 200ms ease-out;
                transition: margin 200ms ease-out;
            }

            /* Add gap to nav and right windows.*/
            .main {
                padding: 10px 10px 0 10px;
            }

            /* .....NavBar: Icon only with coloring/layout.....*/
            /*small/medium side display*/
            @media (min-width: 768px) {
                /*Allow main to be next to Nav*/
                .main{
                    width: calc(100% - 40px); /*keeps 100% minus nav size*/
                    margin-left: 40px;
                    float: right;
                }

                /*lets nav bar to be showed on mouseover*/
                nav.sidebar:hover + .main{
                    margin-left: 200px;
                }

                /*Center Study Name*/
                nav.sidebar.navbar.sidebar>.container .navbar-brand, .navbar>.container-fluid .navbar-brand {
                    margin-left: 0px;
                }

                /*Center Study Name*/
                nav.sidebar .navbar-brand, nav.sidebar .navbar-header{
                    text-align: center;
                    width: 100%;
                    margin-left: 0px;
                }

                /*Center Icons*/
                nav.sidebar a{
                    padding-right: 13px;
                }

                /*adds border top to first nav box */
                nav.sidebar .navbar-nav.left > li:first-child{
                    border-top: 1px #e5e5e5 solid;
                }

                /* adds border to bottom nav boxes */
                nav.sidebar .navbar-nav.left > li{
                    border-bottom: 0px #e5e5e5 solid;
                }

                /* Colors/style dropdown box*/
                nav.sidebar .navbar-nav.left .open .dropdown-menu {
                    position: static;
                    float: none;
                    width: auto;
                    margin-top: 0;
                    background-color: transparent;
                    border: 0;
                    -webkit-box-shadow: none;
                    box-shadow: none;
                }

                /*allows nav box to use 100% width*/
                nav.sidebar .navbar-collapse, nav.sidebar .container-fluid{
                    padding: 0 0px 0 0px;
                }

                /*colors dropdown box text */
                .navbar-inverse .navbar-nav.left .open .dropdown-menu>li>a {
                    color: #777;
                }

                /*gives sidebar width/height*/
                nav.sidebar{
                    position:fixed;
                    height:100%;
                    width: 200px;
                    margin-left: -160px;
                    float: left;
                    /* z-index: 8000; */
                    margin-bottom: 0px;
                }

                /*give sidebar 100% width;*/
                nav.sidebar li {
                    width: 100%;
                }

                /* Move nav to full on mouse over*/
                nav.sidebar:hover{
                    margin-left: 0px;
                }
                /*for hiden things when navbar hidden*/
                .forAnimate{
                    opacity: 0;
                }
            }

            /* .....NavBar: Fully showing nav bar..... */
            @media (min-width: 1330px) {

                /*Allow main to be next to Nav*/
                .main{
                    width: calc(100% - 200px); /*keeps 100% minus nav size*/
                    margin-left: 200px;
                }

                /*Show all nav*/
                nav.sidebar{
                    margin-left: 0px;
                    float: left;
                }
                /*Show hidden items on nav*/
                nav.sidebar .forAnimate{
                    opacity: 1;
                }
            }

            nav.sidebar .navbar-nav.left .open .dropdown-menu>li>a:hover, 
            nav.sidebar .navbar-nav.left .open .dropdown-menu>li>a:focus {
                color: #CCC;
                background-color: transparent;
            }

            nav:hover .forAnimate{
                opacity: 1;
            }

            section{
                padding-left: 15px;
            } 
            
        </style>
        
        <!-- Navigation -->
        <nav class="navbar navbar-inverse sidebar" role="navigation">
            <!-- Brand and toggle get grouped for better mobile display -->
            <div class="navbar-header">
                <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#bs-sidebar-navbar-collapse-1">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
                <a class="navbar-brand">${this.study.name}</a>
            </div>

            <!-- Collect the nav links, forms, and other content for toggling -->
            <div class="collapse navbar-collapse navbar-ex1-collapse">
                <ul class="nav navbar-nav left">
                        <li class="active"><a>Dashboard<span style="font-size:16px;" class="pull-right hidden-xs showopacity"></span></a></li>
                        <li>
                            <a  class="collapse" data-toggle="collapse" data-target="#submenu-1">User & Group<span class="caret"></span><span style="font-size:16px;" class="pull-right hidden-xs showopacity fas fa-user-friends"></span></a>
                            <ul id="submenu-1" class="collapse">
                                <li><a href="#">Action</a></li>
                                <li><a href="#">Another action</a></li>
                                <li><a href="#">Something else here</a></li>
                                <li class="divider"></li>
                                <li><a href="#">Separated link</a></li>
                                <li class="divider"></li>
                                <li><a href="#">One more separated link</a></li>
                            </ul>
                        </li>
                        <li><a href="#">Samples<span style="font-size:16px;" class="pull-right hidden-xs showopacity fas fa-vial"></span></a></li>
                        <li class="dropdown">
                            <a href="#" class="dropdown-toggle" data-toggle="dropdown">Individual<span class="caret"></span><span style="font-size:16px;" class="pull-right hidden-xs showopacity fas fa-user"></span></a>
                                <ul class="dropdown-menu forAnimate" role="menu">
                                    <li><a href="#">Action</a></li>
                                    <li><a href="#">Another action</a></li>
                                    <li><a href="#">Something else here</a></li>
                                    <li class="divider"></li>
                                    <li><a href="#">Separated link</a></li>
                                    <li class="divider"></li>
                                    <li><a href="#">One more separated link</a></li>
                                </ul>
                        </li>
                    <li><a href="#">Family<span style="font-size:16px;" class="pull-right hidden-xs showopacity fas fa-users"></span></a></li>
                    <li ><a href="#">Cohorts<span style="font-size:16px;" class="pull-right hidden-xs showopacity fas fa-bezier-curve"></span></a></li>
                    <li class="dropdown">
                        <a href="#" class="dropdown-toggle" data-toggle="dropdown">Settings <span class="caret"></span><span style="font-size:16px;" class="pull-right hidden-xs showopacity glyphicon glyphicon-cog"></span></a>
                        <ul class="dropdown-menu forAnimate" role="menu">
                            <li><a href="#">Action</a></li>
                            <li><a href="#">Another action</a></li>
                            <li><a href="#">Something else here</a></li>
                            <li class="divider"></li>
                            <li><a href="#">Separated link</a></li>
                            <li class="divider"></li>
                            <li><a href="#">One more separated link</a></li>
                        </ul>
                    </li>
                </ul>
            </div>
        </nav>

        <!-- Content Module  -->
        <div class="main">
            <div class="panel">
                <h3>Admin</h3>
            </div>

            <div class="panel">
                <h3>Groups</h3>
            </div>

            <div class="panel">
                <h3>Users</h3>
            </div>

            <div class="panel">
                <h3>Admin</h3>
            </div>

            <div class="panel">
                <h3>Admin</h3>
            </div>
                
                <!-- <div>{this.study.fqn}</div>
                <div>Groups: {this.study.groups.map(g => g.id).join(", ")}</div>
                <div>{this.study.creationDate}</div>
                <div>{this.study.description}</div> -->
            
        </div>`;
    }
}

customElements.define("study-admin", StudyAdmin);
