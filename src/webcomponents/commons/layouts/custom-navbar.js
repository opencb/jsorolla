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
import UtilsNew from "../../../core/utils-new.js";
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
            opencgaSession: {
                type: Object
            },
            loggedIn: {
                type: Boolean
            },
            app: {
                type: Object
            },
            version: {
                type: String,
            },
            config: {
                type: Object
            }
        };
    }

    onSideBarToggle(e) {
        LitUtils.dispatchCustomEvent(this, "sideBarToggle", "", {event: e}, null);
    }

    onChangeTool(e) {
        LitUtils.dispatchCustomEvent(this, "changeTool", e);
    }

    onChangeApp(e, toggle) {
        LitUtils.dispatchCustomEvent(this, "changeApp", "", {event: e, toggle: toggle}, null);
    }

    onStudySelect(e, study) {
        e.preventDefault(); // prevents the hash change to "#" and allows to manipulate the hash fragment as needed
        LitUtils.dispatchCustomEvent(this, "studySelect", "", {event: e, study: study}, null);
    }

    createAboutLink(link, button) {
        const url = link.url ? `${link.url}` : `#${link.id}`;
        const iconHtml = link.icon ? html`<i class="${link.icon} icon-padding" aria-hidden="true"></i>` : null;
        if (link.url) {
            return html`
                <a data-cy="${link.id}" href="${url}" role="${button ? "button" : "link"}" target="${link.tab ? "_blank" : "_self"}">${iconHtml} ${link.name}</a>`;
        } else {
            return html`
                <a data-cy="${link.id}" href="${url}" role="${button ? "button" : "link"}">${iconHtml} ${link.name}</a>`;
        }
    }

    logout() {
        LitUtils.dispatchCustomEvent(this, "logout");
    }


    render() {
        return html `
            <style>
                .navbar-inverse {
                    background-color: var(--main-bg-color);
                }

                .navbar-inverse .navbar-nav > .open > a,
                .navbar-inverse .navbar-nav > .open > a:focus,
                .navbar-inverse .navbar-nav > .open > a:hover {
                    background-color: var(--main-bg-color-darker);
                    /*filter: brightness(0.8); this involves text as well..*/
                }

                .navbar-inverse .navbar-nav > .active > a,
                .navbar-inverse .navbar-nav > .active > a:focus,
                .navbar-inverse .navbar-nav > .active > a:hover {
                    background-color: var(--main-bg-color-darker);
                }

                .navbar-inverse .navbar-nav > li > a {
                    color: #d2d2d2;
                }

                .navbar-inverse .dropdown-menu > .active > a,
                .navbar-inverse .dropdown-menu > .active > a:focus,
                .navbar-inverse .dropdown-menu > .active > a:hover {
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

                .notification-nav > li > a .badge {
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

                .app-logo {
                    display: flex;
                    align-items: center;
                }

                .suite-logo {
                    display: flex;
                    align-items: center;
                }

                .suite-logo > img {
                    height: 18px;
                }

                #logoutButton{
                    margin-right: 0.6rem;
                    background-color: var(--zetta-color-secondary-orange);
                }

                #about-zetta{
                    display: flex;
                    align-items: center;
                }

                #aboutButton {
                    margin-right: 0.3rem;
                }

                #projects-button,
                #userButton,
                #aboutButton {
                    background-color: var(--footer-color-deflt-blue);
                }

                #logoutButton,
                #userButton,
                #aboutButton,
                #projects-button{
                    border-radius: 4px;
                    padding: 9px 15px;
                }

                .study-switcher {
                    display: flex !important;
                    align-items: center;
                }

                .study-switcher > .study-wrapper {
                    display: flex !important;
                    justify-content: space-between;
                    flex:1;
                };
                .study-switcher > .caret {
                    flex:0;
                };

                /*.study-switcher:hover {*/
                /*    background: #1a4f8f;*/
                /*}*/

                .study-switcher p{
                    padding: 0;
                    line-height: 1.1em;
                }

                .study-switcher p.project-name {
                    color: #afafaf;
                    margin-right: 1em;
                }

                .study-switcher p.study-id{
                    /*font-size: 1.2em;*/
                    /*font-weight: bold;*/
                }

                .study-switcher .caret {
                    /*align-self: flex-end;*/
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

            <!-- <loading-bar></loading-bar> -->

            <nav class="navbar navbar-inverse main-navbar">
                <div>
                    <!-- Left Sidebar Icon -->
                    ${this.config.apps?.filter(app => UtilsNew.isAppVisible(app, this.opencgaSession)).length > 1 ? html`
                        <ul class="nav navbar-nav">
                            <li>
                                <a href="#" @click="${this.onSideBarToggle}" id="waffle-icon-wrapper">
                                    <div id="waffle-icon"></div>
                                </a>
                            </li>
                        </ul>
                    ` : null}

                    <!-- Brand and toggle get grouped for better mobile display -->
                    <div class="navbar-header">
                        <a href="#home" class="navbar-brand suite-logo" @click="${this.onChangeTool}">
                            <!-- Fixed logo -->
                            ${this.config?.logo ? html`
                                <img src="${this.config?.logo}" alt="logo">
                            ` : null}
                            <!-- No application logo provided -->
                            ${!this.config?.logo && this.config?.name ? html`
                                <span style="color:var(--main-color-white);font-size:24px;margin-right:4px;">
                                    <strong>${this.config.name}</strong>
                                </span>
                            ` : null}
                        </a>
                        ${this.app?.id !== "suite" ? html `
                            <div class="navbar-brand app-logo">
                                <!-- Application logo provided -->
                                ${this.app?.logo ? html`
                                <img src="${this.app?.logo}" alt="App logo" style="color: white">
                            ` : null}
                                <!-- No application logo provided -->
                                ${!this.app?.logo && this.app?.name ? html`
                                <span style="color:white;font-size:24px;margin-right:4px;">
                                    <strong>${this.app.name}</strong>
                                </span>
                            ` : null}
                            </div>
                        ` : null}
                    </div>

                    <!-- Collect the nav links, form, and other content for toggling -->
                    <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                        <!-- Controls aligned to the LEFT -->
                        <ul class="nav navbar-nav">
                            <!-- This code parse the config menu arrays and creates a custom menu taking into account visibility -->
                            ${this.app?.menu?.filter?.(item => UtilsNew.isAppVisible(item, this.opencgaSession)).map(item => html`
                                ${item.submenu && item.submenu.some(sm => UtilsNew.isAppVisible(sm, this.opencgaSession)) ? html`
                                    <!-- If there is a submenu we create a dropdown menu item -->
                                    <li class="dropdown">
                                        <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button"
                                           aria-haspopup="true" aria-expanded="false">
                                            ${item.name} <span class="caret"></span>
                                        </a>
                                        <ul class="dropdown-menu">
                                            ${
                                                item.submenu
                                                    .filter(subItem => UtilsNew.isAppVisible(subItem, this.opencgaSession))
                                                    .map(subItem => subItem.category ? html`
                                                        <li>
                                                            <a class="nav-item-category"
                                                               style="background-color:white!important;cursor:auto!important;">
                                                                <strong>${subItem.name}</strong>
                                                            </a>
                                                        </li>
                                                    ` : subItem.separator ? html`
                                                        <li role="separator" class="divider"></li>
                                                    ` : html`
                                                        <li>
                                                            <a href="#${subItem.id}" @click="${this.onChangeTool}"
                                                               data-id="${subItem.id}">${subItem.name}</a>
                                                        </li>
                                                    `)
                                            }
                                        </ul>
                                    </li>
                                ` : html`
                                    <!-- If there is not submenu we just display a button -->
                                    <li>
                                        <a href="#${item.id}" role="button"
                                           @click="${this.onChangeTool}">${item.name}</a>
                                    </li>`
                                }
                            `)}
                        </ul>

                        <!-- Controls aligned to the RIGHT: settings and about-->
                        <ul class="nav navbar-nav navbar-right">
                            <!--Studies dropdown and Search menu-->
                            ${this.opencgaSession && this.opencgaSession.projects && this.opencgaSession.projects.length ? html`
                                <li class="dropdown">
                                    <a id="projects-button" href="#" class="dropdown-toggle study-switcher" data-toggle="dropdown"
                                       role="button" aria-haspopup="true" aria-expanded="false" data-cy="active-study">
                                        <!--                                        <div><i class="fa fa-database fa-lg" style="padding-right: 10px"></i></div>-->
                                        <div class="study-wrapper">
                                            <p class="project-name">${this.opencgaSession.project?.name}:</p>
                                            <p class="study-id">${this.opencgaSession.study.name}</p>
                                        </div>
                                        <div class="caret"></div>
                                    </a>
                                    <ul class="dropdown-menu">
                                        ${this.opencgaSession.projects.filter(project => project?.studies.length > 0).map(project => html`
                                            <li><a title="${project.fqn}"><b>${project.name}
                                                    [${project.fqn.split("@")[0]}]</b></a></li>
                                            ${project.studies && project.studies.length && project.studies.map(study => html`
                                                <li>
                                                    <a href="javascript: void 0"
                                                       data-cy-fqn="${study.fqn}"
                                                       data-study="${study.id}"
                                                       data-project="${project.id}"
                                                       data-project-name="${project.name}"
                                                       data-study-name="${study.name}"
                                                       title="${study.fqn}"
                                                       @click="${e => this.onStudySelect(e, study)}">${study.name}</a>
                                                </li>
                                            `)}
                                        `)}
                                    </ul>
                                </li>
                                <li class="separator"></li>
                            ` : null}

                            <!-- Jobs -->
                            ${UtilsNew.isAppVisible(this.app?.jobMonitor, this.opencgaSession) ? html`
                                <job-monitor .opencgaSession="${this.opencgaSession}"></job-monitor>
                            ` : null}

                            ${UtilsNew.isAppVisible(this.app?.fileExplorer, this.opencgaSession) ? html`
                                <li id="jobsButton">
                                    <a href="#file-manager" title="File Manager" role="button"
                                       @click="${this.onChangeTool}">
                                        <i class="fas fa-folder-open icon-padding"></i>
                                    </a>
                                </li>
                                <li class="separator"></li>
                            ` : null}

                            <!-- About dropdown menu-->
                            ${this.app?.about.dropdown ? html`
                                <li class="dropdown">
                                    <a id="aboutButton" href="#" class="dropdown-toggle" data-toggle="dropdown"
                                       role="button" aria-haspopup="true" aria-expanded="false">
                                        <i class="fas fa-question-circle" style="padding-right: 0.9rem"></i>About <span
                                            class="caret"></span>
                                    </a>
                                    <ul class="dropdown-menu">
                                        ${this.app.about.links && this.app.about.links.map(link => html`
                                            <li>${this.createAboutLink(link, false)}</li>
                                        `)}
                                        ${this.config?.aboutPage ? html `
                                            <li role="separator" class="divider"></li>
                                            <li>
                                                <a data-cy="about-zetta" href="#aboutzetta" role="button" id="about-zetta">
                                                    <img height="16px" src="${this.config.aboutPage.favicon}">
                                                    <div style="margin-left:10px">
                                                        ${this.config.aboutPage.linkTitle || html `About Zetta Genomics`}
                                                    </div>
                                                </a>
                                            </li>
                                        `: null}
                                    </ul>
                                </li>
                            ` : this.app?.about.links && this.app.about.links.map(link => html`
                                <li>${this.createAboutLink(link, true)}</li>
                            `)}

                            <!-- Login/Logout button -->
                            ${this.config.login.visible && !this.loggedIn ? html`
                                <li class="dropdown">
                                    <a href="#login" id="loginButton" role="button" @click="${this.onChangeTool}">
                                        <i href="#login" class="fas fa-sign-in-alt" aria-hidden="true"></i>Login
                                    </a>
                                </li>
                            ` : null}

                            <!--User-->
                            ${this.loggedIn ? html`
                                <li class="dropdown" data-cy="user-menu">
                                    <a id="userButton" href="#" class="dropdown-toggle" data-toggle="dropdown"
                                       role="button" aria-haspopup="true" aria-expanded="false">
                                        <i class="fas fa-user-circle" aria-hidden="true" style="padding-right: 0.9rem">
                                        </i>${this.opencgaSession.user?.name ?? this.opencgaSession.user?.email} <span
                                            class="caret"></span>
                                    </a>
                                    <ul class="dropdown-menu">
                                        ${this.app?.userMenu?.length ? this.app.userMenu.filter(item => UtilsNew.isAppVisible(item, this.opencgaSession)).map(item => html`
                                            <li>
                                                <a href="${item.url}" data-user-menu="${item.id}"><i
                                                        class="${item.icon} icon-padding" aria-hidden="true"></i>
                                                    ${item.name}</a>
                                            </li>
                                        `) : null}
                                        <li role="separator" class="divider"></li>
                                    </ul>
                                </li>
                                <li class="separator"></li>
                                <li>
                                    <a id="logoutButton" role="button" @click="${this.logout}" data-user-menu="logout">
                                        <i class="fa fa-sign-out-alt" aria-hidden="true"></i>
                                        <!--                                        Logout-->
                                    </a>
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
