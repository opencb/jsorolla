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
import UtilsNew from "../../../core/utils-new";

export default class CustomVerticalNavBar extends LitElement {

    // --- PRIVATE FIELDS ---
    #divMenu;
    #divContent;

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    // --- PROPERTIES ---
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
            },
            clicked: {
                type: String,
            }
        };
    }

    // --- PRIVATE METHODS ---
    #init() {
        this.isLoading = false;
        this._activeMenuItem = "";
        this._config = this.getDefaultConfig();
        this.clicked = "";
        // Selectors
        this.#divMenu = "admin-vertical-navbar";
        this.#divContent = "admin-vertical-content";
    }

    #initActiveMenu() {
        const activeElement = document.querySelector(`#${this.#divMenu} li[data-id=${this._activeMenuItem}]`);
        activeElement.click();
    }

    // --- LIT LIFECYCLE ---
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
        this.#initActiveMenu();
    }

    // --- OBSERVERS ---
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
        if (this.activeMenuItem) {
            this._activeMenuItem = this.activeMenuItem;
        }
    }

    configObserver() {
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config
        };
        this.requestUpdate();
    }

    // --- EVENTS ---
    _onItemNavClick(e) {
        e.preventDefault();
        // Set menu id clicked
        if (e.target !== e.currentTarget) {
            this.clicked = e.target.dataset?.id || e.target.parentElement.dataset.id;
        }

        // Set current active-item
        const navItems = document.querySelectorAll(`#${this.#divMenu} .nav-item`);
        [...navItems].forEach(item => item.classList.remove("active-item"));
        document.querySelector(`[data-id=${this.clicked}]`).classList.add("active-item");

        // Display selected content
        const navContents = document.querySelectorAll(`#${this.#divContent} > div[role=tabpanel]`);
        [...navContents].forEach(item => item.style.display = "none");
        const currentContent = document.querySelector(`#${this.#divContent}  #${this.clicked}`);
        currentContent.style.display = "block";

        this.requestUpdate();
    }

    // --- RENDER METHODS ---
    // TODO: REFACTOR STYLE
    #renderStyleCopy() {
        return html`
            <style>
                .nav-item {
                    margin-bottom: 3px;
                    padding: 10px 15px;
                    color: white;
                    width: 100%;
                    border-radius: 3px;
                    line-height: 30px;
                    /*transform: translate3d(0px, 0, 0);*/
                    /*transition: transform*/
                    /*    0.3s ease 0s,*/
                    /*    opacity 0.3s ease 0s,*/
                    /*    all .15s ease-in;*/
                }
                .active-item {
                    /*background: linear-gradient(60deg,#ffa726,#fb8c00);;*/
                    background-color: #E25D1D;
                    /*box-shadow: 0 4px 20px 0 rgba(0,0,0,.14), 0 7px 10px -5px rgba(226, 93, 29,.4);*/
                }
                .nav-item > .nav-link:hover{
                    background-color: inherit;
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
                        /*color: #777;*/
                        color: #d2d2d2;
                        white-space: normal;
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

    #renderStyleOriginal() {
        return html`
            <style>
                .nav-item {
                    margin-bottom: 3px;
                    padding: 10px 15px;
                    color: white;
                    width: 100%;
                    border-radius: 3px;
                    line-height: 30px;
                    /*transform: translate3d(0px, 0, 0);*/
                    /*transition: transform*/
                    /*    0.3s ease 0s,*/
                    /*    opacity 0.3s ease 0s,*/
                    /*    all .15s ease-in;*/
                }
                .active-item {
                    /*background: linear-gradient(60deg,#ffa726,#fb8c00);;*/
                    background-color: #E25D1D;
                    /*box-shadow: 0 4px 20px 0 rgba(0,0,0,.14), 0 7px 10px -5px rgba(226, 93, 29,.4);*/
                }
                .nav-item > .nav-link:hover{
                    background-color: inherit;
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
                        /*color: #777;*/
                        color: #d2d2d2;
                        white-space: normal;
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

    #renderStyle() {
        return html`
        <style>
            .custom-vertical-navbar {
                display: flex;
                align-items: stretch;
            }

            /*Remove rounded coners*/
            nav.sidebar.navbar {
                border-radius: 0;
                width: 100%;
                height: 100%;
                min-height: 85vh;
            }

            .custom-vertical-navbar ul.nav.navbar-nav.left {
                width: 100%;
            }

            .nav-item {
                margin-bottom: 3px;
                padding: 10px 15px;
                color: white;
                width: 100%;
                border-radius: 3px;
                line-height: 30px;

                /*transform: translate3d(0px, 0, 0);*/
                /*transition: transform*/
                /*    0.3s ease 0s,*/
                /*    opacity 0.3s ease 0s,*/
                /*    all .15s ease-in;*/
            }

            .active-item {
                /*background: linear-gradient(60deg,#ffa726,#fb8c00);;*/
                background-color: #E25D1D;
                /*box-shadow: 0 4px 20px 0 rgba(0,0,0,.14), 0 7px 10px -5px rgba(226, 93, 29,.4);*/
            }

            .nav-item > .nav-link:hover{
                background-color: inherit;
            }

            .nav-item:hover:not(.active-item) {
                background-color: #767687;
                cursor: pointer;
            }

            .navbar.navbar-inverse.main-navbar {
                /*position: fixed;*/
                top: 0;
                width: 100%;
                /*z-index: 1000;*/
            }

            /*div.page-title {*/
            /*    position: fixed;*/
            /*    top: 50px;*/
            /*    width: 100%;*/
            /*    z-index: 10*/
            /*}*/

            /*.row.left {*/
            /*    margin-left: -30px;*/
            /*    margin-top: -10px*/
            /*}*/



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
                    /*color: #777;*/
                    color: #d2d2d2;
                    white-space: normal;
                }

                /*gives sidebar width/height*/
                nav.sidebar {
                    /*position: fixed;*/
                    /*height: 100%;*/
                    /*width: 250px;*/
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
                    /*float: left;*/
                }

                /*Show hidden items on nav*/
                nav.sidebar .forAnimate {
                    opacity: 1;
                }
            }

            nav:hover .forAnimate {
                opacity: 1;
            }

            section {
                padding-left: 15px;
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

    /* QUESTION 1: in config submenu, should we consider category and separator?
       QUESTION 2: in config, item can exclusively be of type: [category | separator | navitem] Proposal:
         To replace [category | separator] keys with 'type'.
    */
    #renderMenu() {
        return html`
            <div class="collapse navbar-collapse navbar-ex1-collapse admin-side-navbar" id="${this.#divMenu}">
                <!-- To check the visibility of each menu and submenu item-->
                <ul class="nav navbar-nav left">
                ${
                    UtilsNew.getVisibleItems(this._config.menu, this.opencgaSession)
                        .map(item => item.submenu && UtilsNew.hasVisibleItems(item.submenu, this.opencgaSession) ? html `
                            <li class="dropdown open">
                                <!-- CAUTION: href attribute removed. To discuss: toggle open always-->
                                <a class="dropdown-toggle" data-toggle="dropdown open"
                                   role="button" aria-haspopup="true" aria-expanded="true">
                                    ${item.name} <!-- <span class="caret"></span> -->
                                </a>
                                <ul class="dropdown-menu" @click="${this._onItemNavClick}">
                                ${
                                    UtilsNew.getVisibleItems(item.submenu, this.opencgaSession)
                                        .map(subItem => {
                                            const type = ["category", "separator"].find(type => type in subItem);
                                            switch (type) {
                                                case "category":
                                                    return html `
                                                        <li>
                                                        <a class="nav-item-category"
                                                           style="cursor:auto!important;">
                                                            <strong>${subItem.name}</strong>
                                                        </a>
                                                        <!--<p class="navbar-text">$submenuItem.name}</p>-->
                                                    </li>
                                                    `;
                                                case "separator":
                                                    return html `
                                                        <li role="separator" class="divider"></li>
                                                    `;
                                                default:
                                                    return html `
                                                        <li class="nav-item" data-id="${subItem.id}">
                                                        <!-- TODO: fix for formatting icon | name -->
                                                            <a class="nav-link">${subItem.name}</a>
                                                        </li>
                                                    `;
                                            }
                                        })
                                }
                                </ul>
                            </li>
                        ` : html `
                            <li>TODO: NO SUBMENU</li>
                        `)}
                </ul>
            </div>
        `;
    }

    #renderContent() {
        return html`
            <div class="content-tab-wrapper admin-vertical-content" id="${this.#divContent}" style="margin: 0px 20px">
            ${UtilsNew.getVisibleItems(this._config.menu, this.opencgaSession)
            .map(menuItem => menuItem.submenu && UtilsNew.hasVisibleItems(menuItem.submenu, this.opencgaSession) ? html `
                ${UtilsNew.getVisibleItems(menuItem.submenu, this.opencgaSession).map(subItem => !subItem.render ? null : html `
                    <div id="${subItem.id}" role="tabpanel" class="tab-pane content-tab active">
                        <!-- TODO: HEADER in a div-->
                        <h2><i class="${subItem.icon} icon-padding" style="padding-right: 10px"></i>${subItem.name}</h2>
                        <!-- TODO: CONTENT in a div -->
                        ${subItem.render(this.opencgaSession, this.study)}
                    </div>
                `)}
            ` : html `
                <li>TODO: NO SUBMENU</li>
            `)
            }
            </div>
        `;
    }

    render() {
        return html`
            <!-- STYLE -->
            ${this.#renderStyle()}
            <!-- TOOL HEADER -->
            <!-- <tool-header title="$this._config.name}" icon="$this._config.icon}"></tool-header> -->
            <div class="custom-vertical-navbar row">
                <!-- NAVIGATION -->
                <div class="col-md-2">
                    <nav class="navbar navbar-inverse sidebar" role="navigation">
                        <!-- 1. Brand and toggle get grouped for better mobile display -->
                        ${this.#renderToggle()}
                        <!-- 1. MENU -->
                        ${this.#renderMenu()}
                    </nav>
                </div>
                <!-- 2. CONTENT -->
                <!-- CAUTION: Enable this option if config has key "display" instead of "render" -->
                <!-- <div class="this._config.display?.contentClass}" style="this._config.display?.contentStyle}">-->
                <div class="col-md-10" style="">
                    ${this.#renderContent()}
                </div>
            </div>
        `;
    }

    // --- DEFAULT CONFIG ---
    getDefaultConfig() {}


}

customElements.define("custom-vertical-navbar", CustomVerticalNavBar);


