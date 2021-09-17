/**
 * Copyright 2015-2021 OpenCB
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
import UtilsNew from "../../../core/utilsNew.js";
import LitUtils from "../utils/lit-utils.js";
import "../../job/job-monitor.js";


export default class CustomNavBar extends LitElement {

    constructor() {
        super();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            app: {
                type: Object
            },
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    toggleSideNav(e) {
        e.preventDefault();
        // const sidenav = this.querySelector("#side-nav");
        // TODO: convert to pure js
        $("#side-nav").toggleClass("active");
        $("#overlay").toggleClass("active");
    }

    isVisible(item) {
        switch (item?.visibility) {
            case "public":
                return true;
            case "private":
                return !!this?.opencgaSession?.token;
            case "none":
            default:
                return false;
        }
    }

    isLoggedIn() {
        // LitUtils.dispatchEventCustom(this, "isLoggedIn");
        return !!this?.opencgaSession?.token;
    }

    onChangeTool(e) {
        LitUtils.dispatchEventCustom(this, "changeTool", e);
    }

    onJobSelected(e) {
        LitUtils.dispatchEventCustom(this, "jobSelected", e);
    }

    onChangeApp(e, toggle) {
        LitUtils.dispatchEventCustom(this, "changeApp", "", null, {event: e, toggle: toggle});
    }

    onStudySelect(e, study) {
        e.preventDefault(); // prevents the hash change to "#" and allows to manipulate the hash fragment as needed
        LitUtils.dispatchEventCustom(this, "studySelect", "", null, {event: e, study: study});
    }

    createAboutLink(link, button) {
        const url = link.url ? `${link.url}` : `#${link.id}`;
        const iconHtml = link.icon ? html`<i class="${link.icon} icon-padding" aria-hidden="true"></i>` : null;
        if (link.url) {
            return html`
                <a class="dropdown-item" href="${url}" role="${button ? "button" : "link"}" target="_blank">${iconHtml} ${link.name}</a>`;
        } else {
            return html`
                <a class="dropdown-item" href="${url}" role="${button ? "button" : "link"}">${iconHtml} ${link.name}</a>`;
        }
    }

    logout() {
        LitUtils.dispatchEventCustom(this, "logout");
    }


    render() {
        return html `
        <style>
                .navbar-inverse {
                    background-color: var(--main-bg-color);
                }
                .navbar-inverse .navbar-nav >.open > a, .navbar-inverse .navbar-nav >.open>a:focus, .navbar-inverse .navbar-nav>.open>a:hover {
                    background-color: var(--main-bg-color-darker);
                    /*filter: brightness(0.8); this involves text as well..*/
                }
                .navbar-inverse .navbar-nav>.active>a, .navbar-inverse .navbar-nav>.active>a:focus, .navbar-inverse .navbar-nav>.active>a:hover {
                    background-color: var(--main-bg-color-darker);
                }
                .navbar-inverse .navbar-nav .nav-item .nav-link{
                    color: #d2d2d2;
                }

                .navbar-inverse .navbar-nav .dropdown-menu .dropdown-item {
                    color: #333;
                }

                .navbar-inverse .navbar-nav .nav-item .nav-link:hover {
                    color: #fff;
                }

                .navbar-inverse .dropdown-menu>.active>a, .navbar-inverse .dropdown-menu>.active>a:focus, .navbar-inverse .dropdown-menu>.active>a:hover {
                    background-color: var(--main-bg-color);
                }

                .navbar-nav li.notification > a > i {
                    font-size: 20px;
                    position: absolute;
                    left: 10px;
                    top: 13px;
                }

                .navbar-nav li.user-menu > a {
                    padding-left: 40px;
                }

                .navbar-nav li.user-menu > a > i {
                    font-size: 25px;
                    position: absolute;
                    left: 10px;
                    top: 13px;
                }

                .notification-nav {
                    margin-right: 0;
                }

                .notification-nav .nav-item .nav-link .badge,
                .notification-nav .dropdown-item .badge  {
                    position: relative;
                    z-index: 10;
                    bottom: -7px;
                    left: 11px;
                    background-color: #41a7ff;
                }

                .center {
                    margin: auto;
                    text-align: justify;
                    width: 60%;
                    font-size: 18px;
                    color: #797979;
                }

                .feature-view {
                    margin: auto;
                    text-align: justify;
                    width: 90%;
                }

                #login {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                /* The side navigation menu */
                #side-nav {
                    position: fixed;
                    z-index: 1002;
                    top: 0;
                    left: -250px;
                    background-color: #fff;
                    overflow-x: hidden;
                    padding-top: 20px;
                    width: 320px;
                    visibility: hidden;
                    /*transform: translate(-250px);*/
                    height: 100vh;
                    transform-origin: top left;
                    animation-duration: .3s;
                    animation-timing-function: ease;
                    animation-name: slideOutFrames
                }

                #side-nav.active {
                    left: 0px;
                    visibility: visible;
                    animation-name: slideInFrames
                }

                #side-nav .iva-logo {
                    font-size: 5px;
                    text-align: center;
                    margin-top: 30px;
                }

                #side-nav .nav a {
                    padding: 6px 1px 6px 1px;
                    text-decoration: none;
                    color: #818181;
                    display: block;
                    transition: 0.3s;
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: .2em;
                }

                #side-nav .nav a:hover {
                    color: #204d74;
                }

                #side-nav .closebtn {
                    position: absolute;
                    top: 0;
                    right: 25px;
                    font-size: 36px;
                    margin-left: 50px;
                    padding:0;
                    z-index: 99;
                }

                #side-nav a.closebtn:hover {
                    background: transparent;
                    text-decoration: none;
                    color: black;
                }

                #side-nav a > img,
                #side-nav a > i {
                    width:48px
                }

                #side-nav .nav a.sidebar-nav-login {
                    padding: 20px 0;
                }

                /*#progress-bar {
                    width: 100%;
                    position: fixed;
                    height: 3px;
                    background: #41a7ff;
                    z-index: 10;
                    transition: width 2s ease-in-out, opacity 0.5s ease;
                }*/
            </style>

            <!-- Left Sidebar: we only display this if more than 1 visible app exist -->
            ${this.config?.apps?.filter(app => this.isVisible(app)).length > 0 ? html`
                <div id="overlay" @click="${this.toggleSideNav}"></div>
                <div id="side-nav" class="sidenav shadow-lg">
                    <a href="javascript:void(0)" class="closebtn" @click="${this.toggleSideNav}">&times;</a>
                    <nav class="navbar" id="sidebar-wrapper" role="navigation">
                        <a href="#home" @click="${e => this.onChangeApp(e, true)}">
                            <div class="iva-logo">
                                <img src="${this.config.logoAlt}" />
                                <span class="subtitle">OpenCB Suite</span>
                            </div>
                        </a>
                        <ul class="nav sidebar-nav">
                            ${!this.isLoggedIn() ? html`
                                <li>
                                    <a href="#login" class="text-center sidebar-nav-login" role="button" @click="${e => this.onChangeApp(e, true)}">
                                        <i href="#login" class="fa fa-3x fa-sign-in-alt fa-lg icon-padding" aria-hidden="true"></i>Login
                                    </a>
                                </li>
                            ` : null}

                            ${this.config?.apps?.filter(item => this.isVisible(item)).map(item => html`
                                <li>
                                    <a href="#home" role="button" data-id="${item.id}" @click="${e => this.onChangeApp(e, true)}">
                                        <img src="${item.icon}" alt="${item.name}"/>  ${item.name}
                                    </a>
                                </li>
                            `)}
                        </ul>
                    </nav>
                </div>
            ` : null
            }

            <nav class="navbar navbar-expand-md navbar-inverse main-navbar">
                <div class="container-fluid">
                    <!-- Left Sidebar Icon: we only show the icon if more than 1 visible app exist -->
                    ${this.config.apps?.filter(app => this.isVisible(app)).length > 1 ? html`
                        <ul class="nav navbar-nav">
                            <li>
                                <a href="#" @click="${this.toggleSideNav}" id="waffle-icon-wrapper">
                                    <div id="waffle-icon"></div>
                                </a>
                            </li>
                        </ul>
                    ` : null}

                    <!-- Brand and toggle get grouped for better mobile display -->
                    <div class="navbar-brand">
                        ${this.app?.logo ? html`
                            <a href="#home" class="navbar-brand company-logo" @click="${this.onChangeTool}">
                                <img src="${this.app?.logo}" alt="logo">
                            </a>
                        ` : null}
                    </div>

                    <!-- Collect the nav links, form, and other content for toggling -->
                    <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                        <!-- Controls aligned to the LEFT -->
                        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                            <!-- This code parse the config menu arrays and creates a custom menu taking into account visibility -->
                            ${this.app?.menu?.filter?.(item => this.isVisible(item)).map(item => html`
                                <!-- If there is not submenu we just display a button -->
                                ${item.submenu && item.submenu.filter(sm => this.isVisible(sm)).length > 0 ? html`
                                    <!-- If there is a submenu we create a dropdown menu item -->
                                    <li class="nav-item dropdown">
                                        <a class="nav-link dropdown-toggle" id="navbarDropdown" href="#" data-bs-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                                            ${item.name} <span class="caret"></span>
                                        </a>
                                        <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                                            ${item.submenu.map(subitem => subitem.category ? html`
                                                <li>
                                                    <a class="nav-item-category dropdown-item" href="${subitem.id ? "#" + subitem.id : "javascript: void 0"}">${subitem.name}</a>
                                                </li>
                                            ` : subitem.separator ? html`
                                                <li role="separator" class="dropdown-divider"></li>
                                            ` : html`
                                                <li>
                                                    <a class="dropdown-item" href="#${subitem.id}" @click="${this.onChangeTool}" data-id="${subitem.id}">${subitem.name}</a>
                                                </li>
                                            `)}
                                        </ul>
                                    </li>
                                ` : html`
                                    <li>
                                        <a class="dropdown-item" href="#${item.id}" role="button" @click="${this.onChangeTool}">${item.name}</a>
                                    </li>`
                                }`
                            )}
                        </ul>

                        <!-- Controls aligned to the RIGHT: settings and about-->
                        <ul class="navbar-nav">
                            <!--Studies dropdown and Search menu-->
                            ${this.opencgaSession && this.opencgaSession.projects && this.opencgaSession.projects.length ? html`
                                <li class="nav-item dropdown">
                                    <a href="#" class="nav-link dropdown-toggle study-switcher" data-bs-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false" data-cy="active-study">
                                        <div><i class="fa fa-database fa-lg" style="padding-right: 10px"></i></div>
                                        <div style="margin-right: 5px">
                                            <p class="project-name">${this.opencgaSession.project?.name}</p>
                                            <p class="study-id">${this.opencgaSession.study.name}</p>
                                        </div>
                                        <span class="caret"></span>
                                    </a>
                                    <ul class="dropdown-menu">
                                        ${this.opencgaSession.projects.filter(project => project?.studies.length > 0).map(project => html`
                                            <li><a class="dropdown-item" title="${project.fqn}"><b>${project.name} [${project.fqn.split("@")[0]}]</b></a></li>
                                            ${project.studies && project.studies.length && project.studies.map(study => html`
                                                <li>
                                                    <a class="dropdown-item" href="#" title="${study.fqn}" @click="${e => this.onStudySelect(e, study)}">${study.name}</a>
                                                </li>
                                            `)}
                                        `)}
                                    </ul>
                                </li>
                                <li class="separator"></li>
                            ` : null}

                            <!-- Jobs -->
                            ${this.isVisible(this.app?.jobMonitor) ? html`
                            <li class="nav-item">
                                <job-monitor
                                    .opencgaSession="${this.opencgaSession}"
                                    @jobSelected="${this.onJobSelected}">
                                </job-monitor>
                            </li>

                            ` : null}

                            ${this.isVisible(this.app?.fileExplorer) ? html`
                                <li class="nav-item">
                                    <a class="nav-link" href="#file-manager" title="File Manager" role="button" @click="${this.onChangeTool}">
                                        <i class="fas fa-folder-open icon-padding"></i>
                                    </a>
                                </li>
                                <li class="separator"></li>
                            ` : null}

                            <!-- About dropdown menu-->
                            ${this.app?.about.dropdown ? html`
                                <li class="nav-item dropdown">
                                    <a href="#" class="nav-link dropdown-toggle" data-bs-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                                        <i class="fa fa-question-circle fa-lg" style="padding-right: 10px"></i>About <span class="caret"></span>
                                    </a>
                                    <ul class="dropdown-menu">
                                        ${this.app.about.links && this.app.about.links.map(link => html`
                                            <li>${this.createAboutLink(link, false)}</li>
                                        `)}
                                    </ul>
                                </li>
                            ` : this.app?.about.links && this.app.about.links.map(link => html`
                                <li>${this.createAboutLink(link, true)}</li>
                            `) }

                            <!-- Login/Logout button -->
                            ${this.config.login.visible && !this.isLoggedIn() ? html`
                                <li class="nav-item">
                                    <a class="nav-link" id="loginButton" href="#login" role="button" @click="${this.onChangeTool}">
                                        <i href="#login" class="fa fa-sign-in-alt fa-lg icon-padding" aria-hidden="true"></i>Login
                                    </a>
                                </li>
                            ` : null}

                            <!--User-->
                            ${this.isLoggedIn() ? html`
                                <li class="nav-item dropdown" data-cy="user-menu">
                                    <a href="#" class="nav-link dropdown-toggle" data-bs-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                                        <i class="fa fa-user-circle fa-lg icon-padding" aria-hidden="true">
                                        </i>${this.opencgaSession.user?.name ?? this.opencgaSession.user?.email} <span class="caret"></span>
                                    </a>
                                    <ul class="dropdown-menu dropdown-menu-end">
                                        ${this.app?.userMenu?.length ? this.app.userMenu.filter(item => this.isVisible(item)).map(item => html`
                                            <li>
                                                <a class="dropdown-item" href="${item.url}" data-user-menu="${item.id}">
                                                    <i class="${item.icon} icon-padding" aria-hidden="true"></i> ${item.name}
                                                </a>
                                            </li>
                                        `) : null}
                                        <li role="separator" class="dropdown-divider"></li>
                                        <li>
                                            <a class="dropdown-item" id="logoutButton" role="button" @click="${this.logout}" data-user-menu="logout">
                                                <i class="fa fa-sign-out-alt icon-padding" aria-hidden="true"></i> Logout
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                            ` : null}
                        </ul>
                    </div>
                </div>
            </nav>

            <!-- End of navigation bar -->`;
    }

}

customElements.define("custom-navbar", CustomNavBar);
