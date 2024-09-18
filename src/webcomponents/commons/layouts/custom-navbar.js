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

import {html, LitElement, nothing} from "lit";
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
                <a class="dropdown-item" data-cy="${link.id}" href="${url}" role="${button ? "button" : "link"}" target="${link.tab ? "_blank" : "_self"}">${iconHtml} ${link.name}</a>`;
        } else {
            return html`
                <a class="dropdown-item" data-cy="${link.id}" href="${url}" role="${button ? "button" : "link"}">${iconHtml} ${link.name}</a>`;
        }
    }

    logout() {
        LitUtils.dispatchCustomEvent(this, "logout");
    }

    getVisibleUserMenuItems() {
        return (this.config?.userMenu || []).filter(item => UtilsNew.isAppVisible(item, this.opencgaSession));
    }

    renderStyle() {
        return html`
            <style>
                .navbar-zetta {
                    background-color: var(--main-bg-color);
                }

                /* div#bs-example-navbar-collapse-1 {
                    display: flex!important;
                    flex-wrap: wrap;
                    flex: 1;
                }
                div#bs-example-navbar-collapse-1 > ul {
                    display: flex!important;
                    flex-wrap: wrap;
                    flex: 1 1 auto;
                    padding: 0 10px;
                } */

                .navbar-zetta .navbar-nav .nav-link.active,
                .navbar-nav .nav-link.show {
                    color: #fff;
                }

                .navbar-zetta .navbar-nav > .show > a,
                .navbar-zetta .navbar-nav > .show > a:focus,
                .navbar-zetta .navbar-nav > .show > a:hover {
                    background-color: var(--main-bg-color-darker);
                    /*filter: brightness(0.8); this involves text as well..*/
                }

                .navbar-zetta .navbar-nav > .active > a,
                .navbar-zetta .navbar-nav > .active > a:focus,
                .navbar-zetta .navbar-nav > .active > a:hover {
                    background-color: var(--main-bg-color-darker);
                }

                .navbar-zetta .navbar-nav > li > a {
                    color: #d2d2d2;
                }

                .navbar-zetta .dropdown-menu > .active > a,
                .navbar-zetta .dropdown-menu > .active > a:focus,
                .navbar-zetta .dropdown-menu > .active > a:hover {
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

                .notification .dropdown-button-icon {
                    position: absolute;
                }

                .notification-nav > li > a .badge {
                    position: relative;
                    z-index: 10;
                    bottom: -8px;
                    background-color: #41a7ff;
                }

                .feature-view {
                    margin: auto;
                    text-align: justify;
                    width: 90%;
                }

                ul.nav.navbar-nav.navbar-right {
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                }

                .study-switcher div.project-name {
                    color: #afafaf;
                    margin-right: 2em;
                }

                .dropdown-button-wrapper,
                .dropdown-button-text {
                    display: flex;
                    align-items: center;
                }
                .dropdown-button-wrapper {
                    margin-right: 0.25em;
                    padding: 8px 12px !important;
                    border-radius: 4px;
                    background-color: var(--footer-color-deflt-blue);
                }


                #refresh-job {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex: 1;
                    max-width: 6px;
                    margin-left: 2em;
                }

                #logoutButton{
                    margin-right: 8px;
                    background-color: var(--zetta-color-secondary-orange);
                }

            </style>

        `;
    }

    render() {
        return html `
            ${this.renderStyle()}
            <nav class="navbar navbar-zetta navbar-expand-lg p-1">
                <div class="container-fluid p-1">

                    <!-- Left Sidebar Icon -->
                    ${this.config.apps?.filter(app => UtilsNew.isAppVisible(app, this.opencgaSession)).length > 1 ? html`
                        <a class="navbar-brand" href="#" data-bs-toggle="offcanvas" data-bs-target="#offcanvasIva">
                            <div id="waffle-icon"></div>
                        </a>
                    ` : nothing}
                    <!-- Brand and toggle get grouped for better mobile display -->
                    <a href="#home" class="navbar-brand d-flex justify-content-center" style="height: 2.0rem;" @click="${this.onChangeTool}">
                        <!-- Fixed logo -->
                        ${this.config?.logo ? html`
                            <img  class="d-inline-block" src="${this.config?.logo}" alt="logo">
                        ` : nothing}
                        <!-- No application logo provided -->
                        ${!this.config?.logo && this.config?.name ? html`
                            <span style="color:var(--main-color-white);font-size:24px;margin-right:4px;">
                                <strong>${this.config.name}</strong>
                            </span>
                        ` : nothing}
                    </a>
                    ${this.app?.id !== "suite" ? html `
                        <div class="navbar-brand d-flex justify-content-center align-items-center me-n1" style="height: 2.5rem;">
                            <!-- Application logo provided -->
                            ${this.app?.logo ? html`
                                <img class="d-inline-block" src="${this.app?.logo}" alt="App logo">
                            ` : nothing}
                            <!-- No application logo provided -->
                            ${!this.app?.logo && this.app?.name ? html`
                                <span style="color:var(--main-color-white);font-size:24px;margin-right:4px;">
                                    <strong>${this.app.name}</strong>
                                </span>
                            ` : nothing}
                        </div>
                    ` : nothing}

                    <!-- Collect the nav links, form, and other content for toggling -->
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="fas fa-bars "></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarSupportedContent">
                        <!-- Controls aligned to the LEFT -->
                        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                            <!-- This code parse the config menu arrays and creates a custom menu taking into account visibility -->
                            ${this.app?.menu?.filter?.(item => UtilsNew.isAppVisible(item, this.opencgaSession)).map(item => html`
                                ${item.submenu && item.submenu.some(sm => UtilsNew.isAppVisible(sm, this.opencgaSession)) ? html`
                                    <!-- If there is a submenu we create a dropdown menu item -->
                                    <li class="nav-item dropdown">
                                        <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown" role="button"
                                           aria-haspopup="true" aria-expanded="false">
                                            ${item.name}
                                        </a>
                                        <ul class="dropdown-menu">
                                            ${item.submenu.filter(subItem => UtilsNew.isAppVisible(subItem, this.opencgaSession)).map(subItem => subItem.category ? html`
                                                <li>
                                                    <a class="dropdown-item">
                                                        <strong>${subItem.name}</strong>
                                                    </a>
                                                </li>
                                            ` : subItem.separator ? html`
                                                <li><hr class="dropdown-divider"></li>
                                            ` : html`
                                                <li>
                                                    <a class="dropdown-item" href="#${subItem.id}" @click="${this.onChangeTool}"
                                                       data-id="${subItem.id}">${subItem.name}</a>
                                                </li>
                                            `)
                                            }
                                        </ul>
                                    </li>
                                ` : html`
                                    <!-- If there is no submenu we just display a button -->
                                    <!-- TODO: add active if this is current page -->
                                    <li class="nav-item">
                                        <a class="nav-link" href="#${item.id}" role="button" @click="${this.onChangeTool}">${item.name}</a>
                                    </li>`
                                }
                            `)}
                        </ul>

                        <!-- Controls aligned to the RIGHT: settings and about-->
                        <ul class="navbar-nav justify-content-end">
                            <!-- Studies dropdown -->
                            ${this.opencgaSession?.projects?.length ? html`
                                <li class="nav-item dropdown"  title="Projects and Studies">
                                    <a id="projects-button" href="#"
                                       class="nav-link dropdown-toggle study-switcher dropdown-button-wrapper"
                                       data-bs-toggle="dropdown"
                                       role="button"
                                       aria-haspopup="true" aria-expanded="false"
                                       data-cy="active-study">
                                        <!-- <div class="dropdown-button-icon"><i class="fa fa-database fa-lg"></i></div>-->
                                        <div class="dropdown-button-text" id="study-wrapper">
                                            <div class="project-name">${this.opencgaSession.project?.name}:</div>
                                            <div class="study-id">${this.opencgaSession.study.name}</div>
                                        </div>
                                    </a>
                                    <ul class="dropdown-menu">
                                        ${this.opencgaSession.projects.filter(project => project?.studies.length > 0).map(project => html`
                                            <li>
                                                <a class="dropdown-item" title="${project.fqn}">
                                                    <b>${project.name} [${project.fqn.split("@")[0]}]</b>
                                                </a>
                                            </li>
                                            ${project.studies && project.studies.length && project.studies.map(study => html`
                                                <li>
                                                    <a  class="dropdown-item"
                                                        href="javascript: void 0"
                                                        data-cy-fqn="${study.fqn}"
                                                        data-study="${study.id}"
                                                        data-project="${project.id}"
                                                        data-project-name="${project.name}"
                                                        data-study-name="${study.name}"
                                                        title="${study.fqn}"
                                                        @click="${e => this.onStudySelect(e, study)}">
                                                        ${study.name}
                                                    </a>
                                                </li>
                                            `)}
                                        `)}
                                    </ul>
                                </li>
                            ` : nothing}

                            <li class="border-2 border-end mx-1 my-1" style="--bs-border-color: rgba(255, 255, 255, 0.3);"></li>;

                            ${UtilsNew.isAppVisible(this.config?.fileExplorer, this.opencgaSession) || UtilsNew.isAppVisible(this.app?.fileExplorer, this.opencgaSession) ? html`
                                <li id="fileButton">
                                    <a href="#file-manager" class="dropdown-button-wrapper"
                                       title="Data File Manager" role="button" @click="${this.onChangeTool}">
                                        <div class="dropdown-button-icon"><i class="fas fa-folder-open"></i></div>
                                    </a>
                                </li>
                            ` : nothing}

                            ${UtilsNew.isAppVisible(this.config?.workflowAnalysisExecutor, this.opencgaSession) ? html`
                                <li id="fileButton">
                                    <a href="#workflow-analysis" class="dropdown-button-wrapper"
                                       title="Workflow Executor" role="button" @click="${this.onChangeTool}">
                                        <div class="dropdown-button-icon"><i class="fas fa-project-diagram"></i></div>
                                    </a>
                                </li>
                            ` : nothing}

                            ${UtilsNew.isAppVisible(this.config?.customToolAnalysisExecutor, this.opencgaSession) ? html`
                                <li id="fileButton">
                                    <a href="#tool-analysis" class="dropdown-button-wrapper"
                                       title="Tool Executor" role="button" @click="${this.onChangeTool}">
                                        <div class="dropdown-button-icon"><i class="fas fa-user-cog"></i></div>
                                    </a>
                                </li>
                            ` : nothing}

                            ${UtilsNew.isAppVisible(this.config?.customToolAnalysisExecutor, this.opencgaSession) ? html`
                                <li id="fileButton">
                                    <a href="#tool-analysis" class="dropdown-button-wrapper"
                                       title="Jupyter Notebook (Beta)" role="button" @click="${this.onChangeTool}">
                                        <div class="dropdown-button-icon"><i class="fas fa-book"></i></div>
                                    </a>
                                </li>
                            ` : nothing}

                            <li class="border-2 border-end mx-1 my-1" style="--bs-border-color: rgba(255, 255, 255, 0.3);"></li>;

                            <!-- Jobs -->
                            ${UtilsNew.isAppVisible(this.config?.jobMonitor, this.opencgaSession) || UtilsNew.isAppVisible(this.app?.jobMonitor, this.opencgaSession) ? html`
                                <job-monitor
                                    .opencgaSession="${this.opencgaSession}">
                                </job-monitor>
                            ` : nothing}

                            ${UtilsNew.isAppVisible(this.config?.restApi, this.opencgaSession) || UtilsNew.isAppVisible(this.app?.restApi, this.opencgaSession) ? html`
                                <li id="restButton">
                                    <a href="#rest-api" class="dropdown-button-wrapper"
                                       title="RESTful API tool" role="button" @click="${this.onChangeTool}">
                                        <div class="dropdown-button-icon"><i class="fas fa-code"></i></div>
                                    </a>
                                </li>
                            ` : nothing}

                            <li class="border-2 border-end mx-1 my-1" style="--bs-border-color: rgba(255, 255, 255, 0.3);"></li>;

                            <!-- About dropdown menu-->
                            ${this.config?.about.dropdown ? html`
                                <li class="nav-item dropdown">
                                    <a id="aboutButton" href="#" class="nav-link dropdown-toggle dropdown-button-wrapper gap-1"
                                       data-bs-toggle="dropdown"
                                       role="button" aria-haspopup="true" aria-expanded="false">
                                        <div class="dropdown-button-icon">
                                            <i class="fas fa-question-circle"></i>
                                        </div>
                                        <div class="dropdown-button-text">About</div>
                                    </a>
                                    <ul class="dropdown-menu dropdown-menu-end">
                                        ${this.config.about?.links && this.config.about?.links.map(link => html`
                                            <li>${this.createAboutLink(link, false)}</li>
                                        `)}
                                        ${this.config?.aboutPage ? html `
                                            <li><hr class="dropdown-divider"></li>
                                            <li>
                                                <a id="about-zetta" class="dropdown-item gap-1" href="#aboutzetta"
                                                   data-cy="about-zetta" role="button" >
                                                    <img height="16px" src="${this.config.aboutPage.favicon}">
                                                    <span>
                                                        ${this.config.aboutPage.linkTitle || html `About Zetta Genomics`}
                                                    </span>
                                                </a>
                                            </li>
                                        `: nothing}
                                    </ul>
                                </li>
                            ` : this.config.about?.links && this.config.about?.links.map(link => html`
                                <li>${this.createAboutLink(link, true)}</li>
                            `)}

                            <!-- User -->
                            ${this.loggedIn ? html`
                                <li class="nav-item dropdown" data-cy="user-menu">
                                    <a id="userButton" class="nav-link dropdown-toggle dropdown-button-wrapper gap-1"
                                       href="#" data-bs-toggle="dropdown"
                                       role="button" aria-haspopup="true" aria-expanded="false">
                                        <div class="dropdown-button-icon">
                                            <i class="fas fa-user-circle"></i>
                                        </div>
                                        <div class="dropdown-button-text" >
                                            ${this.opencgaSession.user?.name ?? this.opencgaSession.user?.id}
                                        </div>
                                    </a>
                                    <ul class="dropdown-menu dropdown-menu-end">
                                        ${this.getVisibleUserMenuItems().map(item => html`
                                            <li>
                                                <a class="dropdown-item" href="${item.url}" data-user-menu="${item.id}">
                                                    <i class="${item.icon} me-1" aria-hidden="true"></i>${item.name}
                                                </a>
                                            </li>
                                        `)}
                                        <li><hr class="dropdown-divider"></li>
                                        <li>
                                            <a  class="dropdown-item"
                                                data-user-menu="logout" role="button"
                                                style="color: var(--zetta-color-secondary-orange)"
                                                @click="${this.logout}">
                                                <i class="fa fa-sign-out-alt me-1" aria-hidden="true"></i>Log out
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                            ` : nothing}
                        </ul>
                    </div>
                </div>
            </nav>
        `;
    }

}

customElements.define("custom-navbar", CustomNavBar);
