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

export default class CustomVerticalNavBar extends LitElement {

    #divMenu;
    #divContent;

    constructor() {
        console.log("CONSTRUCTOR Menu Admin");
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            studyId: {
                type: String,
            },
            study: {
                type: Object,
            },
            opencgaSession: {
                type: Object,
            },
            activeMenuItem: {
                type: String,
            },
            // CAUTION: possibly a different name for this property
            config: {
                type: Object,
            }
        };
    }

    #init() {
        this.isLoading = false;
        this._activeMenuItem = "";
        this._config = this.getDefaultConfig();
        // Selectors
        this.#divMenu = "admin-vertical-navbar";
        this.#divContent = "admin-vertical-content";
    }

    update(changedProperties) {
        if (changedProperties.has("studyId") || changedProperties.has("opencgaSession")) {
            this.studyIdObserver();
        }
        if (changedProperties.has("activeMenuItem")) {
            this.activeMenuItemObserver();
        }
        if (changedProperties.has("config")) {
            this.configObserver();
        }

        super.update(changedProperties);
    }

    firstUpdated() {
        this.#initEvents();
        this.#initActiveMenu();
    }

    studyIdObserver() {
        for (const project of this.opencgaSession?.projects) {
            for (const study of project.studies) {
                if (study.id === this.studyId || study.fqn === this.studyId) {
                    this.study = study;
                    break;
                }
            }
        }
    }

    activeMenuItemObserver() {
        this._activeMenuItem = this.activeMenuItem || this._activeMenuItem;
    }

    configObserver() {
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config
        };
        this.requestUpdate();
    }

    // FIXME: poor design. Refactor: (a) delegate event or (b) @click
    #initEvents() {
        const navItems = document.querySelectorAll("#" + `${this.#divMenu}` + " .nav-item");
        const navContents = document.querySelectorAll("#" + `${this.#divContent}` + " div[role=tabpanel]");

        // 1. Create events for menu items
        [...navItems]
            .map(item => {
                // 1.1 Menu item: Event on-click
                item.addEventListener("click", event => {
                    event.preventDefault();
                    const itemId = event.currentTarget.dataset.id;
                    // Remove current active link
                    [...navItems].forEach(item => item.classList.remove("active-item"));
                    // Set clicked active link
                    event.currentTarget.classList.add("active-item");
                    // Display selected content
                    [...navContents].forEach(item => item.style.display = "none");
                    const currentContent = document.querySelector(`#${this.#divContent}  #${itemId}`);
                    currentContent.style.display = "block";
                });
            });
    }

    #initActiveMenu() {
        const activeElement = document.querySelector(`#${this.#divMenu} li[data-id=${this._activeMenuItem}]`);
        activeElement.click();
    }

    /*
    onChangeActiveMenuItem(e) {
        event.preventDefault();
        this._activeMenuItem = e.currentTarget.dataset.id;

        // 1. Set active menu item
        document
            .getElementById(`${this.#divMenu} > ul > li`)
            .classList
            .remove("active");
        document.getElementById(`${this.#divMenu} a[data-id=${this._activeMenuItem}]`).parentElement.classList.add("active");
        // Display the right content
        document.getElementBy(`${this.#divContent} > div[role=tabpanel]`).hide();
        document.getElementById(this._activeMenuItem).show();

        // Update
        this.requestUpdate();
    }
    */
    /*
    onSideNavClick(e) {
        e.preventDefault();
        const tabId = e.currentTarget.dataset.id;

        // Set Active button
        $(".admin-side-navbar > ul > li", this).removeClass("active");
        $(`.admin-side-navbar > ul > li > a[data-id=${tabId}]`, this)[0].parentElement.classList.add("active");

        // Display the right content
        $(".admin-content-tab > div[role=tabpanel]", this).hide();
        $("#" + this._prefix + tabId, this).show();

        this.requestUpdate();
    }
*/

    // TODO: REFACTOR STYLE
    #renderStyle() {
        return html`
            <style>
                .nav-item {
                    margin-bottom: 3px;
                    padding: 10px 15px;
                    color: white;
                    width: 100%;
                    border-radius: 3px;

                    transform: translate3d(0px, 0, 0);
                    transition: transform 0.3s ease 0s, opacity 0.3s ease 0s, all .15s ease-in;
                    line-height: 30px;
                }

                .active-item {
                    /*background: linear-gradient(60deg,#ffa726,#fb8c00);;*/
                    background-color: #E25D1D;
                    /*box-shadow: 0 4px 20px 0 rgba(0,0,0,.14), 0 7px 10px -5px rgba(226, 93, 29,.4);*/
                }

                .nav-item:hover:not(.active-item) {
                    /*background-color: #AAAABC;*/
                    background-color: #767687;
                    cursor: pointer;
                }

                .navbar.navbar-inverse.main-navbar {
                    position: fixed;
                    top: 0;
                    width: 100%;
                    z-index: 1000;
                }

                div.page-title {
                    position: fixed;
                    top: 50px;
                    width: 100%;
                    z-index: 10
                }

                .row.left {
                    margin-left: -30px;
                    margin-top: -10px
                }

                /*Remove rounded coners*/
                nav.sidebar.navbar {
                    border-radius: 0;
                    top: 125px;
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
                    .main {
                        width: calc(100% - 40px); /*keeps 100% minus nav size*/
                        margin-left: 40px;
                        float: right;
                    }

                    /*lets nav bar to be showed on mouseover*/
                    nav.sidebar:hover + .main {
                        margin-left: 200px;
                    }

                    /*Center Study Name*/
                    nav.sidebar.navbar.sidebar > .container .navbar-brand, .navbar > .container-fluid .navbar-brand {
                        margin-left: 0;
                    }

                    /*Center Study Name*/
                    nav.sidebar .navbar-brand, nav.sidebar .navbar-header {
                        text-align: center;
                        width: 100%;
                        margin-left: 0;
                    }

                    /*Center Icons*/
                    nav.sidebar a {
                        padding-right: 13px;
                    }

                    /*adds border top to first nav box */
                    nav.sidebar .navbar-nav.left > li:first-child {
                        border-top: 1px #e5e5e5 solid;
                    }

                    /* adds border to bottom nav boxes */
                    nav.sidebar .navbar-nav.left > li {
                        border-bottom: 0 #e5e5e5 solid;
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
                    nav.sidebar .navbar-collapse, nav.sidebar .container-fluid {
                        padding: 0;
                    }

                    /*colors dropdown box text */
                    .navbar-inverse .navbar-nav.left .open .dropdown-menu > li > a {
                        color: #777;
                    }

                    /*gives sidebar width/height*/
                    nav.sidebar {
                        position: fixed;
                        height: 100%;
                        width: 250px;
                        margin-left: -200px;
                        float: left;
                        /* z-index: 8000; */
                        margin-bottom: 0;
                        overflow-y: auto;
                        padding-bottom: 10%
                    }

                    /*give sidebar 100% width;*/
                    nav.sidebar li {
                        width: 100%;
                    }

                    /* Move nav to full on mouse over*/
                    nav.sidebar:hover {
                        margin-left: 0;
                    }

                    /*for hiden things when navbar hidden*/
                    .forAnimate {
                        opacity: 0;
                    }
                }

                /* .....NavBar: Fully showing nav bar..... */
                @media (min-width: 1330px) {

                    /*Allow main to be next to Nav*/
                    .main {
                        width: calc(100% - 200px); /*keeps 100% minus nav size*/
                        margin-left: 200px;
                    }

                    /*Show all nav*/
                    nav.sidebar {
                        margin-left: 0;
                        float: left;
                    }

                    /*Show hidden items on nav*/
                    nav.sidebar .forAnimate {
                        opacity: 1;
                    }
                }

                /*nav.sidebar .navbar-nav.left .open .dropdown-menu > li > a:hover,*/
                /*nav.sidebar .navbar-nav.left .open .dropdown-menu > li > a:focus {*/
                /*    color: #CCC;*/
                /*    background-color: transparent;*/
                /*}*/

                nav:hover .forAnimate {
                    opacity: 1;
                }

                section {
                    padding-left: 15px;
                }

                .footer {
                    position: fixed;
                    bottom: 0;
                    z-index: 10;
                }

            </style>`;
    }

    // QUESTION: Make it optional?
    #renderToggle() {
        return html`
            <div class="navbar-header">
                <button type="button" class="navbar-toggle" data-toggle="collapse"
                        data-target="#bs-sidebar-navbar-collapse-1">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
                <a class="navbar-brand">${this.study?.name}</a>
            </div>`;
    }

    #renderMenu() {
        return html`
            <div id="${this.#divMenu}" class="collapse navbar-collapse navbar-ex1-collapse admin-side-navbar">
                <ul class="nav navbar-nav left" id="admin-navbar">
                    ${this._config.items.length && this._config?.items.map(item => {
            if (item.category) {
                return html`
                    <li>
                        <!--
                        <a class="nav-item-category"
                           style="background-color:white!important;cursor:auto!important;">
                            <strong>item.name}</strong>
                        </a>
                        -->
                        <p class="navbar-text">${item.name}</p>
                    </li>
                `;
            } else if (item.separator) {
                return html`
                    <li role="separator" class="divider"></li>
                `;
            } else {
                return html`
                    <li class="nav-item" data-id="${item.id}">
                        <!-- QUESTION: ESLint error fix for formatting icon | name
                         <div class="item-icon"> <i class="item.icon}""></i></div>
                        <div class="item-label">item.name}</div>
                        -->
                        <a class="nav-link">${item.name}</a>
                    </li>
                `;
            }
        })}
                </ul>
            </div>
        `;
    }


    #renderContent() {
        return html`
            <div id="${this.#divContent}" class="content-tab-wrapper admin-content-tab" style="margin: 0 20px">
                ${(this._config.items.length && this._config?.items.map(item => item.render ? html `
                    <div id="${item.id}" role="tabpanel" class="tab-pane content-tab active">
                        <!-- TODO: HEADER in a div-->
                        <h2><i class="fas fa-user-friends icon-padding" style="padding-right: 10px"></i>${item.name}
                        </h2>
                        <!-- TODO: CONTENT in a div -->
                        ${item.render(this.opencgaSession, this.study)}
                    </div>` : ""))}
            </div>
        `;
    }

    render() {
        return html`
            <!-- STYLE -->
            ${this.#renderStyle()}
            <!-- DIV -->
            <div class="row left">
                <!-- NAVIGATION -->
                <div class="col-md-2">
                    <nav class="navbar navbar-inverse sidebar" role="navigation">
                        <!-- 1. Brand and toggle get grouped for better mobile display -->
                        ${this.#renderToggle()}
                        <!-- 2. MENU -->
                        ${this.#renderMenu()}
                    </nav>
                </div>
                <!-- 3. CONTENT -->
                <!-- CAUTION: Enable this option if config has key "display" instead of "render" -->
                <!-- <div class="this._config.display?.contentClass}" style="this._config.display?.contentStyle}">-->
                <div class="col-md-10" style="top:150px;">
                    ${this.#renderContent()}
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
    }


}
customElements.define("custom-vertical-navbar", CustomVerticalNavBar);


